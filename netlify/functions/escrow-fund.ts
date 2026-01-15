import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { createBalancedTransaction } from './_utils/ledger';

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

interface EscrowFundPayload {
  auctionId: string;
  buyerId: string;
  sellerId: string;
  amountCents: number;
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
    if (!event.body) return json(400, { error: 'Missing body' });

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) return json(500, { error: 'Supabase credentials missing' });

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
    const payload = JSON.parse(event.body) as EscrowFundPayload;

    if (!payload.auctionId || !payload.buyerId || !payload.sellerId || !payload.amountCents) {
      return json(400, { error: 'auctionId, buyerId, sellerId, amountCents required' });
    }

    const amount = Math.trunc(payload.amountCents);
    if (amount <= 0) return json(400, { error: 'amountCents must be positive' });

    // Ensure buyer wallet exists and has enough balance (legacy wallet for UI compatibility)
    const { data: wallet, error: walletErr } = await admin
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', payload.buyerId)
      .maybeSingle();

    if (walletErr) {
      console.error('wallet_accounts select error', walletErr);
      return json(500, { error: 'Wallet lookup failed' });
    }
    if (!wallet) return json(400, { error: 'Buyer wallet not found' });

    const walletId = wallet.id as string;
    const currentBalance = (wallet.current_balance_cents as number) ?? 0;
    if (currentBalance < amount) {
      return json(400, { error: 'Insufficient wallet balance to fund escrow' });
    }

    const newBalance = currentBalance - amount;

    // Idempotency: if an escrow for this auction+buyer already exists and is FUNDED, return it
    const { data: existingEscrow, error: existingErr } = await admin
      .from('escrow_accounts')
      .select('*')
      .eq('auction_id', payload.auctionId)
      .eq('buyer_id', payload.buyerId)
      .maybeSingle();

    if (existingErr) {
      console.error('escrow_accounts select existing error', existingErr);
      return json(500, { error: 'Escrow lookup failed' });
    }

    if (existingEscrow && existingEscrow.status === 'FUNDED') {
      return json(200, {
        ok: true,
        escrowId: existingEscrow.id,
        newBalanceCents: newBalance,
        idempotent: true,
      });
    }

    // Create or reuse escrow row
    let escrowId: string;
    if (!existingEscrow) {
      const { data: escrow, error: escrowErr } = await admin
        .from('escrow_accounts')
        .insert({
          auction_id: payload.auctionId,
          buyer_id: payload.buyerId,
          seller_id: payload.sellerId,
          wallet_id: walletId,
          amount_cents: amount,
          status: 'PENDING_FUNDING',
        })
        .select()
        .single();

      if (escrowErr) {
        console.error('escrow_accounts insert error', escrowErr);
        return json(500, { error: 'Failed to create escrow account' });
      }

      escrowId = escrow.id as string;
    } else {
      escrowId = existingEscrow.id as string;
    }

    // Double-entry ledger: move funds from buyer user_wallet account into escrow account
    await createBalancedTransaction({
      client: admin as any,
      transactionType: 'ESCROW_FUND',
      refType: 'escrow',
      refId: escrowId,
      metadata: {
        auctionId: payload.auctionId,
        buyerId: payload.buyerId,
        sellerId: payload.sellerId,
        amountCents: amount,
      },
      lines: [
        {
          userId: payload.buyerId,
          type: 'user_wallet',
          deltaCents: -amount,
        },
        {
          userId: payload.buyerId,
          type: 'escrow',
          deltaCents: amount,
        },
      ],
    });

    // Legacy wallet ledger + balance update for backward compatibility with existing UI
    // Ledger entry to move funds into escrow (as HOLD)
    const { error: ledgerErr } = await admin.from('wallet_ledger').insert({
      wallet_id: walletId,
      entry_type: 'HOLD',
      amount_cents: -amount,
      balance_after_cents: newBalance,
      ref_type: 'escrow',
      ref_id: escrowId,
    });

    if (ledgerErr) {
      console.error('wallet_ledger insert error', ledgerErr);
      return json(500, { error: 'Failed to write ledger entry' });
    }

    const { error: walletUpdateErr } = await admin
      .from('wallet_accounts')
      .update({ current_balance_cents: newBalance })
      .eq('id', walletId);

    if (walletUpdateErr) {
      console.error('wallet_accounts update error', walletUpdateErr);
      return json(500, { error: 'Failed to update wallet balance' });
    }

    const { error: escrowUpdateErr } = await admin
      .from('escrow_accounts')
      .update({ status: 'FUNDED' })
      .eq('id', escrowId);

    if (escrowUpdateErr) {
      console.error('escrow_accounts update error', escrowUpdateErr);
      return json(500, { error: 'Failed to update escrow status' });
    }

    return json(200, { ok: true, escrowId, newBalanceCents: newBalance });
  } catch (e: any) {
    console.error('escrow-fund error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
