import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { createBalancedTransaction } from './_utils/ledger';

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const MAX_BATCH = 20;

export const handler: Handler = async (event) => {
  try {
    // Allow GET (for scheduled functions) and POST (for manual triggering)
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
      return json(405, { error: 'Method Not Allowed' });
    }

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) {
      return json(500, { error: 'Supabase credentials missing' });
    }

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
    const platformAccountUserId = process.env.PLATFORM_ACCOUNT_USER_ID as string | undefined;

    // 1) Load a batch of pending payouts
    const { data: payouts, error: payoutsErr } = await admin
      .from('payouts')
      .select('id, seller_id, product_id, sale_price, commission_amount, net_payout, payout_reference, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(MAX_BATCH);

    if (payoutsErr) {
      console.error('settlement-worker: payouts select error', payoutsErr);
      return json(500, { error: 'Failed to load pending payouts' });
    }

    if (!payouts || payouts.length === 0) {
      return json(200, { ok: true, processed: 0 });
    }

    let processed = 0;
    const failures: any[] = [];

    for (const payout of payouts as any[]) {
      try {
        if (!payout.payout_reference) {
          continue;
        }

        // 2) Load auction and winner
        const { data: auction, error: auctionErr } = await admin
          .from('auctions')
          .select('id, winner_id')
          .eq('id', payout.payout_reference)
          .maybeSingle();

        if (auctionErr) {
          console.error('settlement-worker: auction select error', auctionErr, payout.id);
          failures.push({ payoutId: payout.id, reason: 'auction_select_error' });
          continue;
        }
        if (!auction || !auction.winner_id) {
          // Auction not finalized or no winner; skip for now
          continue;
        }

        const winnerId = auction.winner_id as string;

        // 3) Find escrow account for this auction + winner
        const { data: escrow, error: escrowErr } = await admin
          .from('escrow_accounts')
          .select('*')
          .eq('auction_id', auction.id)
          .eq('buyer_id', winnerId)
          .maybeSingle();

        if (escrowErr) {
          console.error('settlement-worker: escrow select error', escrowErr, payout.id);
          failures.push({ payoutId: payout.id, reason: 'escrow_select_error' });
          continue;
        }

        if (!escrow || escrow.status !== 'FUNDED') {
          // Escrow not yet funded or already released/refunded; skip
          continue;
        }

        const sellerId = payout.seller_id as string;
        const escrowId = escrow.id as string;

        const netPayoutAmount = Number(payout.net_payout || 0);
        const commissionAmount = Number(payout.commission_amount || 0);

        if (netPayoutAmount <= 0) {
          // Nothing to release; mark payout failed or skip
          console.warn('settlement-worker: non-positive net payout, skipping', payout.id);
          continue;
        }

        const netToSellerCents = Math.round(netPayoutAmount * 100);
        const feeToPlatformCents = commissionAmount > 0 ? Math.round(commissionAmount * 100) : 0;

        // 4) Ensure seller wallet exists (legacy layer) and get current balance
        const { data: sellerWallet, error: swErr } = await admin
          .from('wallet_accounts')
          .select('*')
          .eq('user_id', sellerId)
          .maybeSingle();

        if (swErr) {
          console.error('settlement-worker: seller wallet select error', swErr, payout.id);
          failures.push({ payoutId: payout.id, reason: 'seller_wallet_select_error' });
          continue;
        }

        let sellerWalletId = sellerWallet?.id as string | undefined;
        let sellerBalance = sellerWallet?.current_balance_cents as number | undefined;

        if (!sellerWalletId) {
          const { data: created, error: createErr } = await admin
            .from('wallet_accounts')
            .insert({ user_id: sellerId })
            .select()
            .single();
          if (createErr || !created) {
            console.error('settlement-worker: seller wallet create error', createErr, payout.id);
            failures.push({ payoutId: payout.id, reason: 'seller_wallet_create_error' });
            continue;
          }
          sellerWalletId = created.id as string;
          sellerBalance = created.current_balance_cents as number;
        }

        sellerBalance = sellerBalance ?? 0;
        const newSellerBalance = sellerBalance + netToSellerCents;

        // 5) Double-entry ledger: move funds from buyer escrow account to seller and platform
        await createBalancedTransaction({
          client: admin as any,
          transactionType: 'ESCROW_SETTLEMENT',
          refType: 'payout',
          refId: payout.id as string,
          metadata: {
            payoutId: payout.id,
            auctionId: auction.id,
            escrowId,
            sellerId,
            winnerId,
            netToSellerCents,
            feeToPlatformCents,
          },
          lines: [
            {
              // Escrow held for winner decreases
              userId: winnerId,
              type: 'escrow',
              deltaCents: -(netToSellerCents + feeToPlatformCents),
            },
            {
              // Seller receives net payout
              userId: sellerId,
              type: 'user_wallet',
              deltaCents: netToSellerCents,
            },
            ...(feeToPlatformCents > 0 && platformAccountUserId
              ? [
                  {
                    userId: platformAccountUserId,
                    type: 'platform',
                    deltaCents: feeToPlatformCents,
                  } as const,
                ]
              : []),
          ],
        });

        // 6) Legacy seller wallet ledger + balance update for compatibility
        const { error: sellerLedgerErr } = await admin.from('wallet_ledger').insert({
          wallet_id: sellerWalletId,
          entry_type: 'PAYOUT',
          amount_cents: netToSellerCents,
          balance_after_cents: newSellerBalance,
          ref_type: 'payout',
          ref_id: payout.id,
        });

        if (sellerLedgerErr) {
          console.error('settlement-worker: seller ledger insert error', sellerLedgerErr, payout.id);
        }

        const { error: sellerWalletUpdateErr } = await admin
          .from('wallet_accounts')
          .update({ current_balance_cents: newSellerBalance })
          .eq('id', sellerWalletId);

        if (sellerWalletUpdateErr) {
          console.error('settlement-worker: seller wallet update error', sellerWalletUpdateErr, payout.id);
        }

        // 7) Mark escrow as released and payout as completed
        const { error: escrowUpdateErr } = await admin
          .from('escrow_accounts')
          .update({ status: 'RELEASED' })
          .eq('id', escrowId);

        if (escrowUpdateErr) {
          console.error('settlement-worker: escrow update error', escrowUpdateErr, payout.id);
        }

        const { error: payoutUpdateErr } = await admin
          .from('payouts')
          .update({ status: 'completed', paid_at: new Date().toISOString() })
          .eq('id', payout.id);

        if (payoutUpdateErr) {
          console.error('settlement-worker: payout update error', payoutUpdateErr, payout.id);
        }

        // 8) Update seller_metrics (total_auctions, total_sales)
        const { data: metrics, error: metricsErr } = await admin
          .from('seller_metrics')
          .select('total_auctions, total_sales')
          .eq('seller_id', sellerId)
          .maybeSingle();

        if (metricsErr) {
          console.error('settlement-worker: seller_metrics select error', metricsErr, sellerId);
        } else {
          const prevAuctions = Number(metrics?.total_auctions || 0);
          const prevSales = Number(metrics?.total_sales || 0);
          const { error: metricsUpsertErr } = await admin
            .from('seller_metrics')
            .upsert({
              seller_id: sellerId,
              total_auctions: prevAuctions + 1,
              total_sales: prevSales + netPayoutAmount,
            });
          if (metricsUpsertErr) {
            console.error('settlement-worker: seller_metrics upsert error', metricsUpsertErr, sellerId);
          }
        }

        processed += 1;
      } catch (e) {
        console.error('settlement-worker: unexpected error for payout', payout.id, e);
        failures.push({ payoutId: payout.id, reason: 'unexpected', error: (e as any)?.message });
      }
    }

    return json(200, { ok: true, processed, failures });
  } catch (e: any) {
    console.error('settlement-worker fatal error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
