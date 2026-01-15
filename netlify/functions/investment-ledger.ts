import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') return json(405, { error: 'Method Not Allowed' });

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) return json(500, { error: 'Supabase credentials missing' });

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
    const investmentId = event.queryStringParameters?.investment_id;
    if (!investmentId) return json(400, { error: 'investment_id is required' });

    const { data, error } = await admin
      .from('investor_ledger_entries')
      .select('*')
      .eq('investment_id', investmentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('investor_ledger_entries select error', error);
      return json(500, { error: 'Failed to fetch ledger' });
    }

    return json(200, { entries: data });
  } catch (e: any) {
    console.error('investment-ledger error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
