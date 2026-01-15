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
      full_name: string;
      email: string;
      phone?: string;
      pan?: string;
      bank_account_number?: string;
      bank_ifsc?: string;
    };

    if (!payload.full_name || !payload.email) {
      return json(400, { error: 'full_name and email are required' });
    }

    const bankAccount = payload.bank_account_number || payload.bank_ifsc
      ? { account_number: payload.bank_account_number || null, ifsc: payload.bank_ifsc || null }
      : null;

    const { data, error } = await admin
      .from('investors')
      .insert({
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone || null,
        pan: payload.pan || null,
        bank_account: bankAccount,
      })
      .select()
      .single();

    if (error) {
      console.error('investor-create insert error', error);
      return json(500, { error: 'Failed to create investor' });
    }

    return json(201, { id: data.id });
  } catch (e: any) {
    console.error('investor-create error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
