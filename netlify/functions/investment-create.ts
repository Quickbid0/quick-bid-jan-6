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
      investor_id: string;
      plan_type: string;
      amount: number;
      tenure_months?: number | null;
      roi_percentage?: number | null;
      revenue_share_percentage?: number | null;
      investor_name?: string;
      investor_email?: string;
    };

    if (!payload.investor_id || !payload.plan_type || !payload.amount) {
      return json(400, { error: 'investor_id, plan_type, amount required' });
    }
    if (payload.amount <= 0) return json(400, { error: 'amount must be > 0' });

    const { data, error } = await admin
      .from('investments')
      .insert({
        investor_id: payload.investor_id,
        plan_type: payload.plan_type,
        amount: payload.amount,
        tenure_months: payload.tenure_months ?? null,
        roi_percentage: payload.roi_percentage ?? null,
        revenue_share_percentage: payload.revenue_share_percentage ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('investment-create insert error', error);
      return json(500, { error: 'Failed to create investment' });
    }

    const investmentId = data.id as string;

    const { error: ledgerErr } = await admin.from('investor_ledger_entries').insert({
      investment_id: investmentId,
      entry_type: 'contribution',
      amount: payload.amount,
      balance_after: payload.amount,
    });

    if (ledgerErr) {
      console.error('investor_ledger_entries insert error', ledgerErr);
      return json(500, { error: 'Failed to create investor ledger entry' });
    }

    // Fire-and-forget application email (optional)
    if (process.env.INVESTOR_EMAILS_ENABLED === 'true' && payload.investor_email) {
      try {
        const baseUrl = process.env.URL || '';
        await fetch(`${baseUrl}/.netlify/functions/investment-application-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.investor_name || undefined,
            email: payload.investor_email,
            amount: payload.amount,
            plan_type: payload.plan_type,
            investment_id: investmentId,
          }),
        });
      } catch (emailErr) {
        console.error('investment-create email error', emailErr);
      }
    }

    return json(201, { id: investmentId, status: 'pending' });
  } catch (e: any) {
    console.error('investment-create error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
