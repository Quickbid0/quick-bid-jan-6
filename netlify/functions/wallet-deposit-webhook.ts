import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

interface DepositPayload {
  userId: string;
  amountCents: number;
  paymentRef: string;
  metadata?: Record<string, any>;
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
    if (!event.body) return json(400, { error: 'Missing body' });

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) return json(500, { error: 'Supabase credentials missing' });

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
    const payload = JSON.parse(event.body) as DepositPayload;

    if (!payload.userId || !payload.amountCents || !payload.paymentRef) {
      return json(400, { error: 'userId, amountCents, paymentRef required' });
    }

    const amount = Math.trunc(payload.amountCents);
    if (amount <= 0) return json(400, { error: 'amountCents must be positive' });

    // Get or create wallet account
    const { data: existingWallet, error: walletErr } = await admin
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', payload.userId)
      .maybeSingle();

    if (walletErr) {
      console.error('wallet_accounts select error', walletErr);
      return json(500, { error: 'Wallet lookup failed' });
    }

    let walletId = existingWallet?.id as string | undefined;
    let currentBalance = existingWallet?.current_balance_cents as number | undefined;

    if (!walletId) {
      const { data: inserted, error: insertErr } = await admin
        .from('wallet_accounts')
        .insert({ user_id: payload.userId })
        .select()
        .single();

      if (insertErr) {
        console.error('wallet_accounts insert error', insertErr);
        return json(500, { error: 'Failed to create wallet' });
      }

      walletId = inserted.id as string;
      currentBalance = inserted.current_balance_cents as number;
    }

    currentBalance = currentBalance ?? 0;
    const newBalance = currentBalance + amount;

    // Ledger entry
    const { error: ledgerErr } = await admin.from('wallet_ledger').insert({
      wallet_id: walletId,
      entry_type: 'DEPOSIT',
      amount_cents: amount,
      balance_after_cents: newBalance,
      ref_type: 'payment_intent',
      ref_id: payload.paymentRef,
      metadata: payload.metadata || {},
    });

    if (ledgerErr) {
      console.error('wallet_ledger insert error', ledgerErr);
      return json(500, { error: 'Failed to write ledger entry' });
    }

    const { error: updateErr } = await admin
      .from('wallet_accounts')
      .update({ current_balance_cents: newBalance })
      .eq('id', walletId);

    if (updateErr) {
      console.error('wallet_accounts update error', updateErr);
      return json(500, { error: 'Failed to update wallet balance' });
    }

    return json(200, { ok: true, walletId, newBalanceCents: newBalance });
  } catch (e: any) {
    console.error('wallet-deposit-webhook error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
