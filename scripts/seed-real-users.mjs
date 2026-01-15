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

const PASSWORD = process.env.REAL_USER_PASSWORD || 'QuickMela@2025';

const users = [
  // Super admin & admins
  { email: 'superadmin@quickbid.com', role: 'super_admin', full_name: 'QuickBid Super Admin', phone: '+91-9000000001' },
  { email: 'ops.admin@quickbid.com', role: 'admin', full_name: 'Operations Admin', phone: '+91-9000000002' },
  { email: 'kyc.admin@quickbid.com', role: 'admin', full_name: 'KYC Admin', phone: '+91-9000000003' },

  // Sellers
  { email: 'seller.alpha@quickbid.com', role: 'seller', full_name: 'Alpha Motors', phone: '+91-9000001001' },
  { email: 'seller.beta@quickbid.com', role: 'seller', full_name: 'Beta Auto Traders', phone: '+91-9000001002' },
  { email: 'seller.gamma@quickbid.com', role: 'seller', full_name: 'Gamma Wheels', phone: '+91-9000001003' },

  // Buyers
  { email: 'buyer.one@quickbid.com', role: 'buyer', full_name: 'Rahul Sharma', phone: '+91-9000002001' },
  { email: 'buyer.two@quickbid.com', role: 'buyer', full_name: 'Priya Verma', phone: '+91-9000002002' },
  { email: 'buyer.three@quickbid.com', role: 'buyer', full_name: 'Amit Kumar', phone: '+91-9000002003' },
  { email: 'buyer.four@quickbid.com', role: 'buyer', full_name: 'Neha Singh', phone: '+91-9000002004' },
  { email: 'buyer.five@quickbid.com', role: 'buyer', full_name: 'Vikram Rao', phone: '+91-9000002005' },

  // Company account
  { email: 'partner.company@quickbid.com', role: 'company', full_name: 'NBFC Partner', phone: '+91-9000003001' },
];

function mapProfileRole(appRole) {
  // profiles.role allowed values are likely ['admin','user'] (company_admin goes in app metadata)
  if (appRole === 'admin' || appRole === 'super_admin') return 'admin';
  // seller, buyer, company -> 'user'
  return 'user';
}

async function ensureProfile(userId, appRole, full_name, phone, email) {
  const profileRole = mapProfileRole(appRole);
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        role: profileRole,
        email,
        name: full_name,
        full_name,
        phone,
        kyc_status: 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  if (error) throw error;
}

async function createOrGet(email) {
  // Check if exists
  const { data: listRes, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listErr) throw listErr;
  const existing = listRes?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) return { id: existing.id, existed: true };

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { onboard_source: 'seed-real' },
  });
  if (error) throw error;
  return { id: data.user.id, existed: false };
}

(async () => {
  try {
    const results = [];
    for (const u of users) {
      try {
        const { id, existed } = await createOrGet(u.email);
        await ensureProfile(id, u.role, u.full_name, u.phone, u.email);
        results.push({ email: u.email, role: u.role, password: PASSWORD, status: existed ? 'exists' : 'created' });
      } catch (e) {
        results.push({ email: u.email, role: u.role, error: e?.message || e });
      }
    }

    // Output summary
    const created = results.filter((r) => r.status === 'created').length;
    const existed = results.filter((r) => r.status === 'exists').length;
    const failed = results.filter((r) => r.error).length;
    console.table(results);
    console.log(`Seeding complete. CREATED=${created} EXISTS=${existed} FAIL=${failed}`);
    console.log(`Default password (override via REAL_USER_PASSWORD): ${PASSWORD}`);
  } catch (e) {
    console.error('Seeding real users failed:', e?.message || e);
    process.exit(1);
  }
})();
