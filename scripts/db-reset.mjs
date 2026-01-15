import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function resetAuctions() {
  const { error } = await admin.from('auctions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
  console.log('Auctions table cleared');
}

(async () => {
  try {
    await resetAuctions();
    console.log('Database reset complete');
  } catch (e) {
    console.error('db:reset failed:', e?.message || e);
    process.exitCode = 1;
  }
})();
