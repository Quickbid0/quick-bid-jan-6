import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

interface EscrowRefundPayload {
  escrowId: string;
  refundAmountCents: number;
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
    if (!event.body) return json(400, { error: 'Missing body' });

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) return json(500, { error: 'Supabase credentials missing' });

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
    const payload = JSON.parse(event.body) as EscrowRefundPayload;

    if (!payload.escrowId || !payload.refundAmountCents) {
      return json(400, { error: 'escrowId and refundAmountCents required' });
    }

    const refundAmount = Math.trunc(payload.refundAmountCents);
    if (refundAmount <= 0) return json(400, { error: 'refundAmountCents must be positive' });

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
    if (escrow.status !== 'FUNDED' && escrow.status !== 'PENDING_FUNDING') {
      return json(400, { error: 'Escrow is not refundable in current state' });
    }

    const buyerId = escrow.buyer_id as string;

    const { data: buyerWallet, error: bwErr } = await admin
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', buyerId)
      .maybeSingle();

    if (bwErr) {
      console.error('wallet_accounts select error (buyer)', bwErr);
      return json(500, { error: 'Buyer wallet lookup failed' });
    }
    if (!buyerWallet) return json(400, { error: 'Buyer wallet not found' });

    const buyerWalletId = buyerWallet.id as string;
    const currentBalance = (buyerWallet.current_balance_cents as number) ?? 0;
    const newBalance = currentBalance + refundAmount;

    const { error: ledgerErr } = await admin.from('wallet_ledger').insert({
      wallet_id: buyerWalletId,
      entry_type: 'REFUND',
      amount_cents: refundAmount,
      balance_after_cents: newBalance,
      ref_type: 'escrow',
      ref_id: payload.escrowId,
    });

    if (ledgerErr) {
      console.error('wallet_ledger insert error', ledgerErr);
      return json(500, { error: 'Failed to write ledger entry' });
    }

    const { error: walletUpdateErr } = await admin
      .from('wallet_accounts')
      .update({ current_balance_cents: newBalance })
      .eq('id', buyerWalletId);

    if (walletUpdateErr) {
      console.error('wallet_accounts update error', walletUpdateErr);
      return json(500, { error: 'Failed to update buyer wallet balance' });
    }

    const { error: escrowUpdateErr } = await admin
      .from('escrow_accounts')
      .update({ status: 'REFUNDED' })
      .eq('id', payload.escrowId);

    if (escrowUpdateErr) {
      console.error('escrow_accounts update error', escrowUpdateErr);
      return json(500, { error: 'Failed to update escrow status' });
    }

    return json(200, { ok: true });
  } catch (e: any) {
    console.error('escrow-refund error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
