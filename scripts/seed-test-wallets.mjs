import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const targetEmails = [
  'admin@test.in',
  'seller1@test.in',
  'buyer1@test.in',
  'buyer2@test.in',
  'buyer3@test.in',
];

async function findUserByEmail(email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  const user = data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error(`User not found for ${email}`);
  return user.id;
}

async function ensureWalletBalance(userId, minBalance = 10000) {
  const { data: existing } = await supabase.from('wallets').select('id,balance').eq('user_id', userId).maybeSingle();
  if (existing?.id) {
    const balance = Number(existing.balance || 0);
    const target = balance >= minBalance ? balance : minBalance;
    const { error } = await supabase.from('wallets').update({ balance: target, currency: 'INR', locked_amount: 0 }).eq('id', existing.id);
    if (error && !String(error.message).toLowerCase().includes('updated_at')) throw error;
    return;
  }
  const { error } = await supabase.from('wallets').insert({ user_id: userId, balance: minBalance, currency: 'INR', locked_amount: 0 });
  if (error && !String(error.message).toLowerCase().includes('updated_at')) throw error;
}

(async () => {
  let ok = 0, fail = 0;
  for (const email of targetEmails) {
    try {
      const userId = await findUserByEmail(email);
      await ensureWalletBalance(userId, 10000);
      console.log(`Wallet ensured for ${email}`);
      ok++;
    } catch (e) {
      console.error(`Wallet seed failed for ${email}:`, e?.message || e);
      fail++;
    }
  }
  console.log(`Wallet seeding complete. OK=${ok} FAIL=${fail}`);
  if (fail > 0) process.exitCode = 1;
})();
