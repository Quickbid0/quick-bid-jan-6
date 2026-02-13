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

const users = [
  { email: 'superadmin@test.in', password: 'Test@12345', role: 'admin', app_role: 'super_admin', full_name: 'Super Admin' },
  { email: 'admin@test.in', password: 'Test@12345', role: 'admin', app_role: 'admin', full_name: 'Admin User' },
  { email: 'admin@quickbid.com', password: 'Admin@123', role: 'admin', app_role: 'admin', full_name: 'Test Admin' },
  { email: 'buyer@quickbid.com', password: 'Buyer@123', role: 'user', app_role: 'buyer', full_name: 'Test Buyer' },
  { email: 'seller@quickbid.com', password: 'Seller@123', role: 'user', app_role: 'seller', full_name: 'Test Seller' },
  { email: 'buyer1@test.in', password: 'Test@12345', role: 'user', app_role: 'buyer', full_name: 'Buyer One' },
  { email: 'buyer2@test.in', password: 'Test@12345', role: 'user', app_role: 'buyer', full_name: 'Buyer Two' },
  { email: 'buyer3@test.in', password: 'Test@12345', role: 'user', app_role: 'buyer', full_name: 'Buyer Three' },
  { email: 'seller1@test.in', password: 'Test@12345', role: 'user', app_role: 'seller', full_name: 'Seller One' },
  { email: 'seller2@test.in', password: 'Test@12345', role: 'user', app_role: 'seller', full_name: 'Seller Two' },
  { email: 'company@test.in', password: 'Test@12345', role: 'user', app_role: 'company_admin', full_name: 'Company Admin' },
];

async function ensureUser(u) {
  try {
    // Try to find user by email
    const { data: listRes, error: listErr } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw listErr;
    const existing = listRes?.users?.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());
    if (existing) {
      // Update password for existing user
      const { error: updateErr } = await supabase.auth.admin.updateUser(existing.id, {
        password: u.password,
      });
      if (updateErr) throw updateErr;
      console.log(`Updated password for ${u.email} (${existing.id})`);
      return existing;
    }

    // Create user if not exists
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { app_role: u.app_role || u.role, full_name: u.full_name },
    });
    if (error) throw error;
    console.log(`Created user: ${u.email} (${data.user.id})`);
    return data.user;
  } catch (e) {
    console.error(`Failed ensureUser for ${u.email}:`, e.message || e);
    throw e;
  }
}

async function upsertProfile(userId, u) {
  const payload = {
    id: userId,
    email: u.email,
    name: u.full_name,
    role: u.role, // must satisfy profiles.role check constraint
    kyc_status: 'pending', // satisfy kyc_status check ('pending','approved','rejected')
  };
  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
  console.log(`Upserted profile for ${u.email}`);
}

(async () => {
  let ok = 0, fail = 0;
  for (const u of users) {
    try {
      const user = await ensureUser(u);
      await upsertProfile(user.id, u);
      ok++;
    } catch (e) {
      fail++;
      console.error(`Seed failed for ${u.email}:`, e?.message || e);
    }
  }
  console.log(`Seeding complete. OK=${ok} FAIL=${fail}`);
  if (fail > 0) process.exitCode = 1;
})();
