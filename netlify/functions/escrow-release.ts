import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { createBalancedTransaction } from './_utils/ledger';

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

interface EscrowReleasePayload {
  escrowId: string;
  netToSellerCents: number;
  feeToPlatformCents: number;
  platformAccountUserId?: string; // optional platform wallet owner
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
    if (!event.body) return json(400, { error: 'Missing body' });

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) return json(500, { error: 'Supabase credentials missing' });

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
    const payload = JSON.parse(event.body) as EscrowReleasePayload;

    if (!payload.escrowId) return json(400, { error: 'escrowId required' });

    const netToSeller = Math.trunc(payload.netToSellerCents || 0);
    const feeToPlatform = Math.trunc(payload.feeToPlatformCents || 0);

    if (netToSeller <= 0) return json(400, { error: 'netToSellerCents must be positive' });

    const { data: escrow, error: escrowErr } = await admin
      .from('escrow_accounts')
      .select('*')
      .eq('id', payload.escrowId)
      .maybeSingle();

    if (escrowErr) {
      console.error('escrow_accounts select error', escrowErr);
      return json(500, { error: 'Escrow lookup failed' });
    }
    if (!escrow) return json(404, { error: 'Escrow not found' });

    // Idempotency: if already released, return success
    if (escrow.status === 'RELEASED') {
      return json(200, { ok: true, idempotent: true });
    }
    if (escrow.status !== 'FUNDED') {
      return json(400, { error: 'Escrow is not in FUNDED state' });
    }

    const sellerId = escrow.seller_id as string;
    const buyerId = escrow.buyer_id as string;
    const escrowAmount = Number(escrow.amount_cents) || 0;

    if (netToSeller + feeToPlatform > escrowAmount) {
      return json(400, { error: 'Release amounts exceed escrow balance' });
    }

    // Ensure seller wallet (legacy wallet layer)
    const { data: sellerWallet, error: swErr } = await admin
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', sellerId)
      .maybeSingle();

    let sellerWalletId = sellerWallet?.id as string | undefined;
    let sellerBalance = sellerWallet?.current_balance_cents as number | undefined;

    if (swErr) {
      console.error('wallet_accounts select error (seller)', swErr);
      return json(500, { error: 'Seller wallet lookup failed' });
    }

    if (!sellerWalletId) {
      const { data: created, error: createErr } = await admin
        .from('wallet_accounts')
        .insert({ user_id: sellerId })
        .select()
        .single();
      if (createErr) {
        console.error('wallet_accounts insert error (seller)', createErr);
        return json(500, { error: 'Failed to create seller wallet' });
      }
      sellerWalletId = created.id as string;
      sellerBalance = created.current_balance_cents as number;
    }

    sellerBalance = sellerBalance ?? 0;
    const newSellerBalance = sellerBalance + netToSeller;

    // Double-entry ledger: move funds from buyer escrow account to seller and platform
    await createBalancedTransaction({
      client: admin as any,
      transactionType: 'ESCROW_RELEASE',
      refType: 'escrow_release',
      refId: payload.escrowId,
      metadata: {
        escrowId: payload.escrowId,
        sellerId,
        buyerId,
        netToSellerCents: netToSeller,
        feeToPlatformCents: feeToPlatform,
      },
      lines: [
        {
          // Escrow held for buyer decreases
          userId: buyerId,
          type: 'escrow',
          deltaCents: -(netToSeller + feeToPlatform),
        },
        {
          // Seller receives net payout
          userId: sellerId,
          type: 'user_wallet',
          deltaCents: netToSeller,
        },
        ...(feeToPlatform > 0 && payload.platformAccountUserId
          ? [
              {
                userId: payload.platformAccountUserId,
                type: 'platform',
                deltaCents: feeToPlatform,
              } as const,
            ]
          : []),
      ],
    });

    // Legacy wallet ledger + balance update for backward compatibility with existing UI
    const { error: sellerLedgerErr } = await admin.from('wallet_ledger').insert({
      wallet_id: sellerWalletId,
      entry_type: 'PAYOUT',
      amount_cents: netToSeller,
      balance_after_cents: newSellerBalance,
      ref_type: 'escrow',
      ref_id: payload.escrowId,
    });

    if (sellerLedgerErr) {
      console.error('wallet_ledger insert error (seller)', sellerLedgerErr);
      return json(500, { error: 'Failed to write seller ledger entry' });
    }

    const { error: sellerWalletUpdateErr } = await admin
      .from('wallet_accounts')
      .update({ current_balance_cents: newSellerBalance })
      .eq('id', sellerWalletId);

    if (sellerWalletUpdateErr) {
      console.error('wallet_accounts update error (seller)', sellerWalletUpdateErr);
      return json(500, { error: 'Failed to update seller wallet balance' });
    }

    // Optional platform fee wallet (legacy wallet layer)
    if (feeToPlatform > 0 && payload.platformAccountUserId) {
      const { data: platformWallet, error: pwErr } = await admin
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', payload.platformAccountUserId)
        .maybeSingle();

      let platformWalletId = platformWallet?.id as string | undefined;
      let platformBalance = platformWallet?.current_balance_cents as number | undefined;

      if (pwErr) {
        console.error('wallet_accounts select error (platform)', pwErr);
      } else {
        if (!platformWalletId) {
          const { data: created, error: createErr } = await admin
            .from('wallet_accounts')
            .insert({ user_id: payload.platformAccountUserId })
            .select()
            .single();
          if (!createErr && created) {
            platformWalletId = created.id as string;
            platformBalance = created.current_balance_cents as number;
          }
        }
        if (platformWalletId) {
          platformBalance = platformBalance ?? 0;
          const newPlatformBalance = platformBalance + feeToPlatform;
          await admin.from('wallet_ledger').insert({
            wallet_id: platformWalletId,
            entry_type: 'FEE',
            amount_cents: feeToPlatform,
            balance_after_cents: newPlatformBalance,
            ref_type: 'escrow',
            ref_id: payload.escrowId,
          });
          await admin
            .from('wallet_accounts')
            .update({ current_balance_cents: newPlatformBalance })
            .eq('id', platformWalletId);
        }
      }
    }

    const { error: escrowUpdateErr } = await admin
      .from('escrow_accounts')
      .update({ status: 'RELEASED' })
      .eq('id', payload.escrowId);

    if (escrowUpdateErr) {
      console.error('escrow_accounts update error', escrowUpdateErr);
      return json(500, { error: 'Failed to update escrow status' });
    }

    return json(200, { ok: true });
  } catch (e: any) {
    console.error('escrow-release error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
