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

async function getUserIdByEmail(email) {
  const { data: listRes, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listErr) throw listErr;
  const user = listRes?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error(`User not found for email ${email}`);
  return user.id;
}

function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  const sellerEmail = 'seller1@test.in';
  const sellerId = await getUserIdByEmail(sellerEmail);

  const cars = [
    {
      title: 'Maruti Suzuki Swift VXi 2019',
      description: 'Well-maintained hatchback, single owner, service history available.',
      category: 'vehicles',
      subcategory: 'car',
      starting_price: 250000,
      current_price: 250000,
      reserve_price: 275000,
      increment_amount: 5000,
      images: [
        'https://images.unsplash.com/photo-1549921296-3a6b3f9026c9',
        'https://images.unsplash.com/photo-1511300636408-a63a89df3482',
      ],
      status: 'pending',
      auction_type: 'timed',
      start_date: new Date().toISOString(),
      end_date: futureDate(7),
      condition: 'good',
      location: 'Bengaluru, KA',
      metadata: { km_driven: 38000, fuel_type: 'Petrol', owners_count: 1, registration_city: 'Bengaluru' },
    },
    {
      title: 'Hyundai Creta SX 2020',
      description: 'SUV with premium features, minimal scratches, comprehensive insurance.',
      category: 'vehicles',
      subcategory: 'car',
      starting_price: 900000,
      current_price: 900000,
      reserve_price: 980000,
      increment_amount: 10000,
      images: [
        'https://images.unsplash.com/photo-1550355291-bbee04a92027',
        'https://images.unsplash.com/photo-1549924231-f129b911e442',
      ],
      status: 'pending',
      auction_type: 'live',
      start_date: new Date().toISOString(),
      end_date: futureDate(3),
      condition: 'excellent',
      location: 'Mumbai, MH',
      metadata: { km_driven: 22000, fuel_type: 'Diesel', owners_count: 1, registration_city: 'Mumbai' },
    },
    {
      title: 'Honda Activa 5G 2018',
      description: 'Reliable scooter, city usage, timely serviced.',
      category: 'vehicles',
      subcategory: 'two-wheeler',
      starting_price: 25000,
      current_price: 25000,
      reserve_price: 32000,
      increment_amount: 1000,
      images: [
        'https://images.unsplash.com/photo-1517940310602-2635cef8fd17',
      ],
      status: 'pending',
      auction_type: 'timed',
      start_date: new Date().toISOString(),
      end_date: futureDate(5),
      condition: 'good',
      location: 'Pune, MH',
      metadata: { km_driven: 18000, fuel_type: 'Petrol', owners_count: 1, registration_city: 'Pune' },
    },
    {
      title: 'Government Office Furniture Liquidation Lot',
      description: 'Bulk tender lot of office desks, chairs, and cabinets. Inspection available.',
      category: 'industrial',
      subcategory: 'furniture',
      starting_price: 150000,
      current_price: 150000,
      reserve_price: 200000,
      increment_amount: 5000,
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c',
      ],
      status: 'pending',
      auction_type: 'tender',
      start_date: new Date().toISOString(),
      end_date: futureDate(10),
      condition: 'good',
      location: 'Delhi, DL',
      metadata: { lot_items: 120, inspection_date: futureDate(2) },
    },
  ];

  for (const c of cars) {
    const payload = {
      title: c.title,
      description: c.description,
      category: c.category,
      subcategory: c.subcategory,
      starting_price: c.starting_price,
      current_price: c.current_price,
      reserve_price: c.reserve_price,
      increment_amount: c.increment_amount,
      image_url: c.images[0],
      images: c.images,
      seller_id: sellerId,
      status: c.status,
      auction_type: c.auction_type,
      start_date: c.start_date,
      end_date: c.end_date,
      condition: c.condition,
      location: c.location,
      metadata: c.metadata,
    };

    const { data, error } = await supabase.from('products').insert(payload).select('id, title');
    if (error) throw error;
    console.log('Inserted product:', data[0]);
  }
  console.log('Product seeding complete.');
}

main().catch((e) => {
  console.error('Seeding failed:', e.message || e);
  process.exit(1);
});
