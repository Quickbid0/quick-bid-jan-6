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
    if (!userId) return json(400, { error: 'userId query param required' });

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) return json(500, { error: 'Supabase credentials missing' });

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    const { data: wallet, error } = await admin
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('wallet_accounts select error', error);
      return json(500, { error: 'Wallet lookup failed' });
    }

    if (!wallet) return json(200, { balanceCents: 0 });

    return json(200, {
      walletId: wallet.id,
      balanceCents: wallet.current_balance_cents,
      currency: wallet.currency,
    });
  } catch (e: any) {
    console.error('wallet-balance error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
