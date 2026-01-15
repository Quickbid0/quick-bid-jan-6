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

    const userId = event.queryStringParameters?.userId;
    const limit = Number(event.queryStringParameters?.limit || '50');
    const offset = Number(event.queryStringParameters?.offset || '0');

    if (!userId) return json(400, { error: 'userId query param required' });

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) return json(500, { error: 'Supabase credentials missing' });

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    const { data: wallet, error: walletErr } = await admin
      .from('wallet_accounts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (walletErr) {
      console.error('wallet_accounts select error', walletErr);
      return json(500, { error: 'Wallet lookup failed' });
    }

    if (!wallet) return json(200, { entries: [], total: 0 });

    const walletId = wallet.id as string;

    const { data: entries, error: ledgerErr, count } = await admin
      .from('wallet_ledger')
      .select('*', { count: 'exact' })
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ledgerErr) {
      console.error('wallet_ledger select error', ledgerErr);
      return json(500, { error: 'Ledger lookup failed' });
    }

    return json(200, { entries, total: count ?? 0 });
  } catch (e: any) {
    console.error('wallet-ledger error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
