-- QUICKBID PRODUCTION DATABASE SCHEMA
-- Complete schema with constraints, relationships, audit trails, and indexing

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================
-- ENUM TYPES
-- =====================================

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'seller', 'buyer');

-- User status
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');

-- KYC status
CREATE TYPE kyc_status AS ENUM ('not_started', 'pending', 'verified', 'rejected');

-- Email verification status
CREATE TYPE email_verification_status AS ENUM ('unverified', 'pending', 'verified');

-- Auction status
CREATE TYPE auction_status AS ENUM ('draft', 'live', 'ended', 'cancelled');

-- Bid status
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected');

-- Transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Transaction type
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');

-- Payment method
CREATE TYPE payment_method AS ENUM ('razorpay', 'wallet', 'bank_transfer', 'upi');

-- Event types for audit logs
CREATE TYPE audit_event_type AS ENUM (
  'user_created', 'user_updated', 'user_deleted', 'user_login', 'user_logout',
  'auction_created', 'auction_updated', 'auction_started', 'auction_ended',
  'bid_placed', 'bid_accepted', 'bid_rejected',
  'payment_processed', 'payment_failed', 'payment_refunded',
  'wallet_updated', 'security_event', 'admin_action'
);

-- =====================================
-- CORE TABLES
-- =====================================

-- Users table with comprehensive fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'buyer',
    status user_status NOT NULL DEFAULT 'active',
    kyc_status kyc_status NOT NULL DEFAULT 'not_started',
    email_verified email_verification_status NOT NULL DEFAULT 'unverified',
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_token_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP -- Soft delete
);

-- User profiles with additional information
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    bio TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    date_of_birth DATE,
    pan_number VARCHAR(20),
    aadhaar_number VARCHAR(20),
    gst_number VARCHAR(20),
    business_name VARCHAR(255),
    business_type VARCHAR(50),
    business_address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB, -- Store document URLs and metadata
    wallet_available_cents INTEGER DEFAULT 0, -- Available balance in cents
    wallet_escrow_cents INTEGER DEFAULT 0, -- Escrow balance in cents
    wallet_total_earned_cents INTEGER DEFAULT 0, -- Total earnings
    wallet_total_spent_cents INTEGER DEFAULT 0, -- Total spent
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP -- Soft delete
);

-- Categories for products
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id), -- Hierarchical categories
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    condition VARCHAR(50), -- 'new', 'used', 'refurbished'
    brand VARCHAR(100),
    model VARCHAR(100),
    year_manufactured INTEGER,
    specifications JSONB, -- Product specifications
    images JSONB NOT NULL DEFAULT '[]', -- Array of image URLs
    starting_price DECIMAL(12,2) NOT NULL,
    reserve_price DECIMAL(12,2),
    buy_it_now_price DECIMAL(12,2),
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    location VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP -- Soft delete
);

-- Auctions table
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_price DECIMAL(12,2) NOT NULL,
    current_price DECIMAL(12,2) NOT NULL,
    reserve_price DECIMAL(12,2),
    min_increment DECIMAL(8,2) DEFAULT 1.00,
    max_bid_amount DECIMAL(12,2), -- Maximum bid limit
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status auction_status NOT NULL DEFAULT 'draft',
    auction_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'reverse', 'sealed'
    admin_approval_required BOOLEAN DEFAULT FALSE,
    auto_extend BOOLEAN DEFAULT TRUE, -- Auto-extend if bid placed near end
    auto_extend_minutes INTEGER DEFAULT 10,
    min_deposit_percent DECIMAL(5,2) DEFAULT 10.00, -- Security deposit percentage
    min_deposit_fixed_cents INTEGER DEFAULT 0, -- Fixed deposit amount in cents
    commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Platform commission percentage
    bids_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    watchers_count INTEGER DEFAULT 0,
    winner_id UUID REFERENCES users(id),
    winning_bid_id UUID,
    finalized_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP -- Soft delete
);

-- Bids table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(12,2) NOT NULL,
    status bid_status NOT NULL DEFAULT 'pending',
    type VARCHAR(20) DEFAULT 'manual', -- 'manual', 'auto', 'admin_override'
    proxy_amount DECIMAL(12,2), -- For auto-bidding
    is_anonymous BOOLEAN DEFAULT FALSE,
    ip_address INET,
    user_agent TEXT,
    meta JSONB, -- Additional metadata
    sequence BIGSERIAL NOT NULL, -- For ordering within auction
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(12,2) NOT NULL,
    transaction_type transaction_type NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    payment_method payment_method DEFAULT 'wallet',
    gateway_transaction_id VARCHAR(255), -- External transaction ID
    auction_id UUID REFERENCES auctions(id),
    bid_id UUID REFERENCES bids(id),
    order_id VARCHAR(255),
    description TEXT NOT NULL,
    metadata JSONB, -- Additional transaction data
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Wallet audit logs
CREATE TABLE wallet_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    auction_id UUID REFERENCES auctions(id),
    bid_id UUID REFERENCES bids(id),
    order_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    amount_delta_cents INTEGER NOT NULL, -- Change in amount in cents
    wallet_before_cents INTEGER NOT NULL,
    wallet_after_cents INTEGER NOT NULL,
    escrow_before_cents INTEGER,
    escrow_after_cents INTEGER,
    source_type VARCHAR(50),
    source_reference VARCHAR(255),
    reason_code VARCHAR(50),
    reason_text TEXT,
    policy_codes TEXT[], -- Compliance policy codes
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status transaction_status NOT NULL DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    gateway VARCHAR(50) NOT NULL, -- 'razorpay', 'stripe', etc.
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_refund_id VARCHAR(255),
    purpose VARCHAR(50) NOT NULL, -- 'wallet_topup', 'auction_payment', etc.
    auction_id UUID REFERENCES auctions(id),
    bid_id UUID REFERENCES bids(id),
    commission_amount DECIMAL(12,2),
    gst_amount DECIMAL(12,2),
    net_amount DECIMAL(12,2),
    refund_amount DECIMAL(12,2) DEFAULT 0,
    notes JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'bid_won', 'bid_outbid', 'auction_ended', etc.
    auction_id UUID REFERENCES auctions(id),
    product_id UUID REFERENCES products(id),
    bid_id UUID REFERENCES bids(id),
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_sms_sent BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    last_accessed TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    event_type audit_event_type NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    details JSONB,
    severity VARCHAR(20) DEFAULT 'info', -- 'low', 'medium', 'high', 'critical'
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- System configuration
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Whether config is exposed to frontend
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================
-- INDEXES FOR PERFORMANCE
-- =====================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_is_verified ON user_profiles(is_verified);
CREATE INDEX idx_user_profiles_wallet_available ON user_profiles(wallet_available_cents);

-- Categories indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Products indexes
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_title ON products USING gin(to_tsvector('english', title));

-- Auctions indexes
CREATE INDEX idx_auctions_product_id ON auctions(product_id);
CREATE INDEX idx_auctions_seller_id ON auctions(seller_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_start_time ON auctions(start_time);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);
CREATE INDEX idx_auctions_current_price ON auctions(current_price);
CREATE INDEX idx_auctions_created_at ON auctions(created_at);

-- Bids indexes
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_created_at ON bids(created_at);
CREATE INDEX idx_bids_amount ON bids(amount);
CREATE INDEX idx_bids_auction_sequence ON bids(auction_id, sequence DESC);

-- Wallet transactions indexes
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at);
CREATE INDEX idx_wallet_transactions_auction_id ON wallet_transactions(auction_id);

-- Payment transactions indexes
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_gateway_order_id ON payment_transactions(gateway_order_id);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- =====================================
-- TRIGGERS AND CONSTRAINTS
-- =====================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_transactions_updated_at BEFORE UPDATE ON wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auction constraints
ALTER TABLE auctions ADD CONSTRAINT check_end_time_after_start 
    CHECK (end_time > start_time);

ALTER TABLE auctions ADD CONSTRAINT check_reserve_price 
    CHECK (reserve_price IS NULL OR reserve_price >= start_price);

ALTER TABLE auctions ADD CONSTRAINT check_min_increment 
    CHECK (min_increment >= 0);

ALTER TABLE auctions ADD CONSTRAINT check_commission_rate 
    CHECK (commission_rate >= 0 AND commission_rate <= 100);

-- Bid constraints
ALTER TABLE bids ADD CONSTRAINT check_bid_amount 
    CHECK (amount > 0);

-- Transaction constraints
ALTER TABLE wallet_transactions ADD CONSTRAINT check_transaction_amount 
    CHECK (amount != 0);

ALTER TABLE payment_transactions ADD CONSTRAINT check_payment_amount 
    CHECK (amount > 0);

-- User constraints
ALTER TABLE users ADD CONSTRAINT check_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- =====================================
-- VIEWS FOR COMMON QUERIES
-- =====================================

-- Active auctions view
CREATE VIEW active_auctions AS
SELECT 
    a.*,
    p.title as product_title,
    p.images as product_images,
    p.category_id,
    u.name as seller_name,
    u.is_verified as seller_verified,
    c.name as category_name
FROM auctions a
JOIN products p ON a.product_id = p.id
JOIN users u ON a.seller_id = u.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE a.status = 'live' 
  AND a.end_time > NOW()
  AND a.deleted_at IS NULL
  AND p.deleted_at IS NULL
  AND u.deleted_at IS NULL;

-- User wallet summary view
CREATE VIEW user_wallet_summary AS
SELECT 
    up.user_id,
    up.wallet_available_cents / 100.0 as available_balance,
    up.wallet_escrow_cents / 100.0 as escrow_balance,
    (up.wallet_available_cents + up.wallet_escrow_cents) / 100.0 as total_balance,
    up.wallet_total_earned_cents / 100.0 as total_earned,
    up.wallet_total_spent_cents / 100.0 as total_spent,
    COUNT(wt.id) as transaction_count,
    MAX(wt.created_at) as last_transaction
FROM user_profiles up
LEFT JOIN wallet_transactions wt ON up.user_id = wt.user_id
WHERE up.deleted_at IS NULL
GROUP BY up.user_id, up.wallet_available_cents, up.wallet_escrow_cents, 
         up.wallet_total_earned_cents, up.wallet_total_spent_cents;

-- Auction statistics view
CREATE VIEW auction_statistics AS
SELECT 
    a.id as auction_id,
    a.title,
    COUNT(b.id) as total_bids,
    COUNT(DISTINCT b.user_id) as unique_bidders,
    COALESCE(MAX(b.amount), a.start_price) as highest_bid,
    COALESCE(MIN(b.amount), a.start_price) as lowest_bid,
    COALESCE(AVG(b.amount), a.start_price) as average_bid,
    a.current_price,
    a.end_time,
    CASE 
        WHEN a.end_time <= NOW() THEN 'ended'
        WHEN a.end_time <= NOW() + INTERVAL '1 hour' THEN 'ending_soon'
        ELSE 'active'
    END as status
FROM auctions a
LEFT JOIN bids b ON a.id = b.auction_id AND b.status = 'accepted'
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.title, a.start_price, a.current_price, a.end_time;

-- =====================================
-- INITIAL DATA
-- =====================================

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets'),
('Vehicles', 'vehicles', 'Cars, motorcycles, and other vehicles'),
('Real Estate', 'real-estate', 'Property and real estate'),
('Fashion', 'fashion', 'Clothing, shoes, and accessories'),
('Home & Garden', 'home-garden', 'Home improvement and garden items'),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear'),
('Business & Industrial', 'business-industrial', 'Business equipment and industrial supplies'),
('Other', 'other', 'Miscellaneous items');

-- Insert system configuration
INSERT INTO system_config (key, value, description, is_public) VALUES
('maintenance_mode', 'false', 'Whether the site is in maintenance mode', true),
('min_bid_increment', '1.00', 'Minimum bid increment amount', true),
('max_auction_duration_hours', '168', 'Maximum auction duration in hours', false),
('commission_rate', '5.00', 'Default commission rate percentage', false),
('security_deposit_percent', '10.00', 'Default security deposit percentage', false);

-- =====================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users
    FOR ALL USING (auth.uid() = id::text);

CREATE POLICY user_profiles_own_data ON user_profiles
    FOR ALL USING (auth.uid() = user_id::text);

CREATE POLICY wallet_transactions_own_data ON wallet_transactions
    FOR ALL USING (auth.uid() = user_id::text);

CREATE POLICY payment_transactions_own_data ON payment_transactions
    FOR ALL USING (auth.uid() = user_id::text);

CREATE POLICY notifications_own_data ON notifications
    FOR ALL USING (auth.uid() = user_id::text);

-- Admins can see all data
CREATE POLICY admins_all_users ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid()::uuid 
            AND users.role = 'admin'
        )
    );

-- =====================================
-- SAMPLE DATA (for development)
-- =====================================

-- This would be populated by seed scripts in production
