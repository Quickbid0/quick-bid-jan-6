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

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) return json(500, { error: 'Supabase credentials missing' });

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    const id = event.queryStringParameters?.id;
    const tenureMonthsParam = event.queryStringParameters?.tenure_months;
    const tenureMonths = tenureMonthsParam ? parseInt(tenureMonthsParam, 10) : undefined;

    if (!id) return json(400, { error: 'id is required' });

    const nowIso = new Date().toISOString();

    const { data: current, error: fetchErr } = await admin
      .from('investments')
      .select('id, tenure_months')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) {
      console.error('investments select error', fetchErr);
      return json(500, { error: 'Failed to look up investment' });
    }
    if (!current) return json(404, { error: 'Investment not found' });

    const effectiveTenure = tenureMonths ?? (current.tenure_months as number | null) ?? 0;

    const lockInUntil = effectiveTenure > 0
      ? new Date(Date.now() + effectiveTenure * 30 * 24 * 60 * 60 * 1000).toISOString()
      : nowIso;

    const { error: updateErr } = await admin
      .from('investments')
      .update({
        status: 'active',
        lock_in_until: lockInUntil,
        updated_at: nowIso,
      })
      .eq('id', id);

    if (updateErr) {
      console.error('investments update error', updateErr);
      return json(500, { error: 'Failed to approve investment' });
    }

    return json(200, { ok: true, id });
  } catch (e: any) {
    console.error('investment-approve error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
