-- QuickBid Realistic Seed Data
-- This script populates the database with realistic test data

-- Insert sample profiles (users, sellers, companies)
INSERT INTO profiles (id, email, name, phone, user_type, role, is_verified, verification_status, avatar_url, business_name, company_type)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@quickbid.com', 'Admin User', '+919876543210', 'buyer', 'admin', true, 'approved', 'https://randomuser.me/api/portraits/men/1.jpg', NULL, NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'john.buyer@example.com', 'John Smith', '+919876543211', 'buyer', 'user', true, 'approved', 'https://randomuser.me/api/portraits/men/32.jpg', NULL, NULL),
  ('550e8400-e29b-41d4-a716-446655440003', 'seller1@example.com', 'Neha Sharma', '+919876543212', 'seller', 'user', true, 'approved', 'https://randomuser.me/api/portraits/women/45.jpg', NULL, NULL),
  ('550e8400-e29b-41d4-a716-446655440004', 'company@nbfc.com', 'NBFC Finance Corp', '+919876543213', 'company', 'user', true, 'approved', 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=NBFC', 'NBFC Finance Corp', 'nbfc'),
  ('550e8400-e29b-41d4-a716-446655440005', 'seller2@example.com', 'Ravi Kumar', '+919876543214', 'seller', 'user', true, 'approved', 'https://randomuser.me/api/portraits/men/52.jpg', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert products (various categories and auction types)
INSERT INTO products (id, title, description, category, subcategory, starting_price, current_price, reserve_price, image_url, images, seller_id, status, auction_type, start_date, end_date, condition, location, is_featured, is_trending)
VALUES
  (gen_random_uuid(), 'Vintage Rolex Submariner 1960s', 'Rare vintage Rolex Submariner from 1960s in excellent condition. Original box and papers included. This iconic timepiece features automatic movement and is a true collector''s item.', 'Jewelry & Watches', 'Luxury Watches', 250000, 285000, 350000, 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800', ARRAY['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800'], '550e8400-e29b-41d4-a716-446655440003', 'active', 'timed', NOW() - INTERVAL '2 days', NOW() + INTERVAL '3 days', 'excellent', 'Mumbai, Maharashtra', true, true),

  (gen_random_uuid(), '2019 BMW 5 Series - Bank Seized', 'Bank seized BMW 5 Series 2019 model. Low mileage, excellent condition. Full service history available. White color with beige leather interiors.', 'Vehicles', 'Cars', 1200000, 1350000, 1500000, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'], '550e8400-e29b-41d4-a716-446655440004', 'active', 'live', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 'excellent', 'Delhi, Delhi', true, true),

  (gen_random_uuid(), 'Antique Persian Carpet 1890s', 'Authentic Persian carpet from late 1890s. Hand-woven with intricate patterns. Size: 12x9 feet. Museum quality piece with certificate of authenticity.', 'Antiques & Collectibles', 'Furniture & Decor', 180000, 195000, 250000, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800', ARRAY['https://images.unsplash.com/photo-1600166898405-da9535204843?w=800'], '550e8400-e29b-41d4-a716-446655440003', 'active', 'timed', NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days', 'good', 'Jaipur, Rajasthan', true, false),

  (gen_random_uuid(), 'Industrial CNC Machine 2020', 'High-precision CNC milling machine. Lightly used, maintained regularly. Perfect for small to medium manufacturing units. Comes with all accessories and training.', 'Industrial Equipment', 'Manufacturing', 450000, 450000, 500000, 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800', ARRAY['https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800'], '550e8400-e29b-41d4-a716-446655440004', 'active', 'tender', NOW() - INTERVAL '3 days', NOW() + INTERVAL '7 days', 'good', 'Pune, Maharashtra', false, true),

  (gen_random_uuid(), 'Original MF Husain Painting 1985', 'Rare original painting by master artist MF Husain. Signed and dated 1985. Provenance documented. Vibrant colors depicting Indian culture. Investment-grade art piece.', 'Art & Paintings', 'Modern Art', 850000, 920000, 1200000, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'], '550e8400-e29b-41d4-a716-446655440003', 'active', 'timed', NOW() - INTERVAL '4 days', NOW() + INTERVAL '1 day', 'excellent', 'Mumbai, Maharashtra', true, true),

  (gen_random_uuid(), 'Handcrafted Wooden Furniture Set', 'Beautiful handcrafted teak wood furniture set including dining table and 6 chairs. Intricate carvings, traditional Indian design. Perfect for luxury homes.', 'Handmade & Creative', 'Furniture', 125000, 135000, 150000, 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800', ARRAY['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800'], '550e8400-e29b-41d4-a716-446655440005', 'active', 'timed', NOW() - INTERVAL '1 day', NOW() + INTERVAL '4 days', 'new', 'Bangalore, Karnataka', false, false),

  (gen_random_uuid(), '2020 Royal Enfield Classic 350', 'Well-maintained Royal Enfield Classic 350. Single owner, complete service records. Black color, chrome finish. Perfect for enthusiasts.', 'Vehicles', 'Motorcycles', 85000, 92000, 110000, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'], '550e8400-e29b-41d4-a716-446655440005', 'active', 'live', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '1 hour', 'good', 'Chennai, Tamil Nadu', false, true),

  (gen_random_uuid(), 'Diamond Necklace Set 18K Gold', 'Exquisite diamond necklace set in 18K gold. Total weight: 45 grams. Diamonds: 2.5 carats. Certified by GIA. Comes with insurance valuation and original bill.', 'Jewelry & Watches', 'Fine Jewelry', 320000, 355000, 400000, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'], '550e8400-e29b-41d4-a716-446655440003', 'active', 'timed', NOW() - INTERVAL '6 days', NOW() + INTERVAL '12 hours', 'new', 'Surat, Gujarat', true, true),

  (gen_random_uuid(), 'Commercial Office Equipment Lot', 'Bulk lot of office equipment including 20 computers, printers, furniture. Suitable for new office setup or resale. All items working condition.', 'Industrial Equipment', 'Office Equipment', 280000, 280000, 320000, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'], '550e8400-e29b-41d4-a716-446655440004', 'active', 'tender', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 'good', 'Hyderabad, Telangana', false, false),

  (gen_random_uuid(), 'Rare Stamp Collection 1940-1960', 'Comprehensive stamp collection from 1940-1960 era. Includes rare Indian and British stamps. Mint condition, properly catalogued. Great for collectors.', 'Antiques & Collectibles', 'Stamps & Coins', 65000, 72000, 85000, 'https://images.unsplash.com/photo-1509803874385-db7c23652552?w=800', ARRAY['https://images.unsplash.com/photo-1509803874385-db7c23652552?w=800'], '550e8400-e29b-41d4-a716-446655440005', 'active', 'timed', NOW() - INTERVAL '3 days', NOW() + INTERVAL '2 days', 'excellent', 'Kolkata, West Bengal', false, true)
ON CONFLICT DO NOTHING;

-- Insert bids for products
INSERT INTO bids (id, product_id, bidder_id, amount, created_at, status)
SELECT
  gen_random_uuid(),
  p.id,
  '550e8400-e29b-41d4-a716-446655440002',
  p.current_price - 5000,
  NOW() - INTERVAL '2 hours',
  'active'
FROM products p
WHERE p.auction_type IN ('live', 'timed')
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert wallet balances
INSERT INTO wallets (user_id, balance, currency, last_updated)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 500000, 'INR', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 250000, 'INR', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 180000, 'INR', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 1500000, 'INR', NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 120000, 'INR', NOW())
ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance;

-- Insert notifications
INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'bid_update', 'Bid Outbid', 'Your bid on Vintage Rolex Submariner has been outbid', false, NOW() - INTERVAL '1 hour'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'auction_ending', 'Auction Ending Soon', 'BMW 5 Series auction ends in 2 hours', false, NOW() - INTERVAL '30 minutes'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'product_approved', 'Product Approved', 'Your listing for Diamond Necklace Set has been approved', true, NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Insert transactions
INSERT INTO transactions (id, user_id, type, amount, status, description, created_at)
VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'wallet_topup', 100000, 'completed', 'Wallet top-up via UPI', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'bid_deposit', -5000, 'completed', 'Deposit for BMW 5 Series bid', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'sale_payout', 285000, 'completed', 'Payout for sold item', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Update product view counts
UPDATE products
SET view_count = FLOOR(RANDOM() * 1000 + 100),
    bid_count = FLOOR(RANDOM() * 50 + 5)
WHERE status = 'active';

-- Success message
SELECT 'Seed data inserted successfully!' as message;
