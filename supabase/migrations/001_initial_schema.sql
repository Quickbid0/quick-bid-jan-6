-- QuickBid Platform - Initial Schema
-- MVP Production Database Setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'seller', 'buyer');

-- User status enum
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');

-- Email verification status
CREATE TYPE email_verification_status AS ENUM ('verified', 'unverified', 'pending');

-- Product verification status
CREATE TYPE product_verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

-- Transaction type
CREATE TYPE transaction_type AS ENUM ('bid', 'win', 'refund', 'deposit');

-- Auction status
CREATE TYPE auction_status AS ENUM ('active', 'ended', 'cancelled');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'buyer',
    status user_status NOT NULL DEFAULT 'pending_verification',
    email_verification_status email_verification_status NOT NULL DEFAULT 'unverified',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Seller profiles table
CREATE TABLE seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    business_address TEXT,
    phone VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    verification_documents TEXT[], -- JSON array of document URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    images TEXT[], -- JSON array of image URLs
    starting_price DECIMAL(12,2) NOT NULL CHECK (starting_price > 0),
    current_bid DECIMAL(12,2) DEFAULT 0 CHECK (current_bid >= 0),
    auction_end TIMESTAMP WITH TIME ZONE NOT NULL,
    seller_id UUID NOT NULL REFERENCES users(id),
    verification_status product_verification_status NOT NULL DEFAULT 'pending',
    auction_status auction_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT products_auction_end_check CHECK (auction_end > created_at)
);

-- Wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    is_sandbox BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id)
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    type transaction_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    status transaction_status NOT NULL DEFAULT 'pending',
    is_sandbox BOOLEAN DEFAULT TRUE,
    metadata JSONB, -- Additional transaction data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    is_winning BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, product_id) -- One bid per user per product
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_verification_status ON products(verification_status);
CREATE INDEX idx_products_auction_status ON products(auction_status);
CREATE INDEX idx_products_auction_end ON products(auction_end);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_product_id ON transactions(product_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_product_id ON bids(product_id);
CREATE INDEX idx_bids_amount ON bids(amount);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Anyone can view approved products
CREATE POLICY "Anyone can view approved products" ON products
    FOR SELECT USING (verification_status = 'approved' AND auction_status = 'active');

-- Sellers can view their own products
CREATE POLICY "Sellers can view own products" ON products
    FOR SELECT USING (auth.uid() = seller_id);

-- Sellers can create products
CREATE POLICY "Sellers can create products" ON products
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own products
CREATE POLICY "Sellers can update own products" ON products
    FOR UPDATE USING (auth.uid() = seller_id);

-- Users can view own wallet
CREATE POLICY "Users can view own wallet" ON wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view own bids
CREATE POLICY "Users can view own bids" ON bids
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create bids
CREATE POLICY "Users can create bids" ON bids
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for wallet operations
CREATE OR REPLACE FUNCTION add_wallet_funds(user_id UUID, amount DECIMAL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE wallets 
    SET balance = balance + amount, updated_at = NOW()
    WHERE user_id = add_wallet_funds.user_id;
    
    -- Record transaction
    INSERT INTO transactions (user_id, type, amount, status)
    VALUES (user_id, 'deposit', amount, 'completed');
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION place_bid_transaction(user_id UUID, product_id UUID, amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance DECIMAL;
BEGIN
    -- Check user's wallet balance
    SELECT balance INTO current_balance 
    FROM wallets 
    WHERE user_id = place_bid_transaction.user_id;
    
    IF current_balance < amount THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct from wallet
    UPDATE wallets 
    SET balance = balance - amount, updated_at = NOW()
    WHERE user_id = place_bid_transaction.user_id;
    
    -- Record transaction
    INSERT INTO transactions (user_id, product_id, type, amount, status)
    VALUES (user_id, product_id, 'bid', amount, 'completed');
    
    -- Update or create bid
    INSERT INTO bids (user_id, product_id, amount)
    VALUES (user_id, product_id, amount)
    ON CONFLICT (user_id, product_id) 
    DO UPDATE SET amount = EXCLUDED.amount;
    
    -- Update product current bid if higher
    UPDATE products 
    SET current_bid = GREATEST(current_bid, amount)
    WHERE id = product_id AND amount > current_bid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_seller_profiles_timestamp
    BEFORE UPDATE ON seller_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_products_timestamp
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_wallets_timestamp
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_transactions_timestamp
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Sample data for testing
INSERT INTO users (email, name, role, status, email_verification_status) VALUES
('admin@quickbid.com', 'Admin User', 'admin', 'active', 'verified'),
('seller@quickbid.com', 'Seller User', 'seller', 'active', 'verified'),
('buyer@quickbid.com', 'Buyer User', 'buyer', 'active', 'verified');

-- Create wallets for users
INSERT INTO wallets (user_id, balance, is_sandbox) 
SELECT id, 1000.00, false FROM users;

-- Sample product
INSERT INTO products (title, description, category, starting_price, auction_end, seller_id) VALUES
('Sample Auction Item', 'This is a sample product for testing', 'electronics', 100.00, NOW() + INTERVAL '7 days', 
 (SELECT id FROM users WHERE role = 'seller' LIMIT 1));

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
