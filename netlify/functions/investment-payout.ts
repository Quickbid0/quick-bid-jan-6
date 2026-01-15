import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
    if (!event.body) return json(400, { error: 'Missing body' });

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) return json(500, { error: 'Supabase credentials missing' });

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
    const payload = JSON.parse(event.body) as {
      investment_id: string;
      amount: number;
      metadata?: any;
    };

    if (!payload.investment_id || !payload.amount) {
      return json(400, { error: 'investment_id and amount are required' });
    }
    if (payload.amount <= 0) return json(400, { error: 'amount must be > 0' });

    // Look up last balance
    const { data: lastEntries, error: lastErr } = await admin
      .from('investor_ledger_entries')
      .select('balance_after')
      .eq('investment_id', payload.investment_id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (lastErr) {
      console.error('ledger last balance error', lastErr);
      return json(500, { error: 'Failed to read ledger' });
    }

    const prevBalance = lastEntries && lastEntries.length > 0
      ? (lastEntries[0].balance_after as number)
      : 0;

    const newBalance = prevBalance - payload.amount;

    // Look up investment and investor for notification purposes
    const { data: invRow, error: invRowErr } = await admin
      .from('investments')
      .select('id, investor_id')
      .eq('id', payload.investment_id)
      .maybeSingle();

    if (invRowErr) {
      console.error('investment-payout investments select error', invRowErr);
      return json(500, { error: 'Failed to look up investment' });
    }
    if (!invRow) return json(404, { error: 'Investment not found' });

    const { data: investorRow, error: investorErr } = await admin
      .from('investors')
      .select('full_name, email, bank_account')
      .eq('id', invRow.investor_id as string)
      .maybeSingle();

    if (investorErr) {
      console.error('investment-payout investors select error', investorErr);
      return json(500, { error: 'Failed to look up investor' });
    }

    const { error: insertErr } = await admin.from('investor_ledger_entries').insert({
      investment_id: payload.investment_id,
      entry_type: 'payout',
      amount: -payload.amount,
      balance_after: newBalance,
      metadata: payload.metadata || {},
    });

    if (insertErr) {
      console.error('investor_ledger_entries payout insert error', insertErr);
      return json(500, { error: 'Failed to record payout' });
    }

    // Auto-send payout email if enabled and we have an investor email
    if (process.env.INVESTOR_EMAILS_ENABLED === 'true' && investorRow?.email) {
      try {
        const baseUrl = process.env.URL || '';
        const bankAccount = (investorRow.bank_account as any) || {};
        const acctNumber: string | undefined = bankAccount.account_number || bankAccount.acc_no;
        const acctLast4 = acctNumber ? acctNumber.slice(-4) : undefined;

        await fetch(`${baseUrl}/.netlify/functions/investment-payout-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: investorRow.full_name as string | undefined,
            email: investorRow.email as string,
            amount: payload.amount,
            acct_last4: acctLast4,
            txn_ref: payload.metadata?.txn_ref || payload.metadata?.note,
          }),
        });
      } catch (emailErr) {
        console.error('investment-payout email error', emailErr);
      }
    }

    // NOTE: Actual bank transfer / UPI payout should be executed via your payout provider
    // and referenced in metadata (txn ref, UTR, etc.). This function only records ledger state
    // and triggers notifications.

    return json(200, { ok: true, balance_after: newBalance });
  } catch (e: any) {
    console.error('investment-payout error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
