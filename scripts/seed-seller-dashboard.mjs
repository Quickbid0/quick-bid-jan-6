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

async function getUserByEmail(email) {
  const { data: listRes, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listErr) throw listErr;
  const user = listRes?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error(`User not found for email ${email}`);
  return user;
}

async function ensureWallet(userId, balance = 50000) {
  // Try select
  const { data } = await supabase.from('wallets').select('id').eq('user_id', userId).maybeSingle();
  if (data?.id) {
    const { error: upErr } = await supabase
      .from('wallets')
      .update({ balance, locked_amount: 0, currency: 'INR' })
      .eq('id', data.id);
    if (upErr && !String(upErr.message).toLowerCase().includes('updated_at')) throw upErr;
    return data.id;
  }
  const { data: inserted, error } = await supabase
    .from('wallets')
    .insert({ user_id: userId, balance, currency: 'INR', locked_amount: 0 })
    .select('id')
    .single();
  if (error && !String(error.message).toLowerCase().includes('updated_at')) throw error;
  return inserted.id;
}

async function getRecentProducts(limit = 3) {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, starting_price, current_price, status')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

async function seedBids(productId, buyerId, base, steps = [0, 5000, 10000]) {
  for (const inc of steps) {
    const amount = base + inc;
    const { error } = await supabase
      .from('bids')
      .insert({ product_id: productId, bidder_id: buyerId, amount, status: 'active' });
    const msg = String(error?.message || '').toLowerCase();
    if (error && !msg.includes('duplicate') && !msg.includes('updated_at')) throw error;
  }
}

(async () => {
  try {
    const seller = await getUserByEmail('seller1@test.in');
    const buyer = await getUserByEmail('buyer1@test.in');

    // Ensure buyer wallet has funds
    await ensureWallet(buyer.id, 75000);

    // Fetch products; if none, exit with instruction to run seed:products
    const products = await getRecentProducts(3);
    if ((products?.length || 0) === 0) {
      console.log('No products found. Please run: npm run seed:products');
      process.exit(0);
    }

    // Place a few bids on first product to populate seller dashboard metrics
    const p0 = products[0];
    const base = Number(p0.current_price || p0.starting_price || 100000);
    await seedBids(p0.id, buyer.id, isNaN(base) ? 100000 : base, [0, 5000, 10000, 15000]);

    // Create example transactions for wallet history
    const { error: txErr } = await supabase.from('transactions').insert([
      { user_id: buyer.id, type: 'wallet_topup', amount: 50000, status: 'completed', description: 'Initial top-up' },
      { user_id: buyer.id, type: 'bid_deposit', amount: 5000, status: 'completed', description: 'Bid deposit hold' },
    ]);
    if (txErr && !String(txErr.message).toLowerCase().includes('updated_at')) throw txErr;

    console.log('Seller dashboard seed complete. Bids and wallet history added (skipping updated_at trigger issues if any).');
  } catch (e) {
    console.error('Seller dashboard seed failed:', e?.message || e);
    process.exitCode = 1;
  }
})();
