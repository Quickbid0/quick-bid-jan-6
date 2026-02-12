-- QuickBid Platform - Complete Database Schema
-- Includes core platform tables and security/moderation features
-- Run this in Supabase SQL Editor to create the full database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User roles enum
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'seller', 'buyer');

-- User status enum
CREATE TYPE IF NOT EXISTS user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');

-- Email verification status
CREATE TYPE IF NOT EXISTS email_verification_status AS ENUM ('verified', 'unverified', 'pending');

-- Product verification status
CREATE TYPE IF NOT EXISTS product_verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Transaction status
CREATE TYPE IF NOT EXISTS transaction_status AS ENUM ('pending', 'completed', 'failed');

-- Transaction type
CREATE TYPE IF NOT EXISTS transaction_type AS ENUM ('bid', 'win', 'refund', 'deposit');

-- Auction status
CREATE TYPE IF NOT EXISTS auction_status AS ENUM ('active', 'ended', 'cancelled');

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

-- Security and Moderation Tables

-- 1. User Security Status Table
CREATE TABLE user_security_status (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  risk_score INT DEFAULT 0 CHECK (risk_score >= 0),
  risk_level TEXT CHECK (risk_level IN ('low','medium','high','critical')) DEFAULT 'low',
  is_restricted BOOLEAN DEFAULT FALSE,
  restriction_reason TEXT,
  restricted_at TIMESTAMP WITH TIME ZONE,
  restriction_expires_at TIMESTAMP WITH TIME ZONE,
  verification_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Security Events Table
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low','medium','high')) NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Content Reports Table
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  report_reason TEXT NOT NULL,
  report_weight INT DEFAULT 1 CHECK (report_weight > 0),
  ip_hash TEXT,
  device_hash TEXT,
  is_coordinated BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pending','reviewed','dismissed','actioned')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Report Clusters Table
CREATE TABLE report_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  cluster_score INT DEFAULT 0 CHECK (cluster_score >= 0),
  suspected_attack BOOLEAN DEFAULT FALSE,
  analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Account Restrictions Table
CREATE TABLE account_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restriction_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  applied_by UUID REFERENCES users(id) ON DELETE SET NULL,
  start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  appeal_allowed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Identity Verifications Table
CREATE TABLE identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL,
  document_number_hash TEXT,
  document_url TEXT,
  selfie_url TEXT,
  extracted_name TEXT,
  extracted_dob DATE,
  status TEXT CHECK (status IN ('pending','verified','rejected')) DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  ai_match_score DECIMAL(3,2),
  manual_review_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Content Appeals Table
CREATE TABLE content_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  related_restriction_id UUID REFERENCES account_restrictions(id) ON DELETE SET NULL,
  related_report_id UUID REFERENCES content_reports(id) ON DELETE SET NULL,
  appeal_type TEXT NOT NULL,
  explanation TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  public_interest BOOLEAN DEFAULT FALSE,
  whistleblower_tag BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pending','approved','rejected','escalated')) DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  decision TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Admin Moderation Actions Table
CREATE TABLE admin_moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_content_id UUID,
  target_content_type TEXT,
  notes TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  severity TEXT CHECK (severity IN ('low','medium','high','critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. User Security Logs Table
CREATE TABLE user_security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  related_event_id UUID REFERENCES security_events(id) ON DELETE SET NULL,
  related_restriction_id UUID REFERENCES account_restrictions(id) ON DELETE SET NULL,
  related_appeal_id UUID REFERENCES content_appeals(id) ON DELETE SET NULL,
  visible_to_user BOOLEAN DEFAULT TRUE,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Risk Scoring Rules Table
CREATE TABLE risk_scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low','medium','high')) NOT NULL,
  base_score INT NOT NULL DEFAULT 1,
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_verification_status ON products(verification_status);
CREATE INDEX IF NOT EXISTS idx_products_auction_status ON products(auction_status);
CREATE INDEX IF NOT EXISTS idx_products_auction_end ON products(auction_end);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_product_id ON bids(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(amount);

-- Security indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_content_reports_reported_user ON content_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_content_id ON content_reports(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_account_restrictions_user_id ON account_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_restrictions_active ON account_restrictions(is_active, end_at);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_status ON identity_verifications(status);
CREATE INDEX IF NOT EXISTS idx_content_appeals_status ON content_appeals(status);
CREATE INDEX IF NOT EXISTS idx_content_appeals_user_id ON content_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_moderation_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON admin_moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_logs_user_id ON user_security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_logs_visible ON user_security_logs(visible_to_user);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_logs ENABLE ROW LEVEL SECURITY;

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

-- Security RLS Policies
CREATE POLICY "Users can view own security status" ON user_security_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage security status" ON user_security_status
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can view own security events" ON security_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON content_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can view restrictions against them" ON account_restrictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own verifications" ON identity_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own appeals" ON content_appeals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own security logs" ON user_security_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admin policies for moderation tables
CREATE POLICY "Admins can manage all moderation data" ON security_events
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage reports" ON content_reports
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage restrictions" ON account_restrictions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage verifications" ON identity_verifications
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage appeals" ON content_appeals
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage security logs" ON user_security_logs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

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

-- Functions for risk score calculation
CREATE OR REPLACE FUNCTION calculate_user_risk_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER := 0;
  event_record RECORD;
BEGIN
  -- Sum all security event scores for the user
  FOR event_record IN
    SELECT se.severity, rsr.base_score
    FROM security_events se
    JOIN risk_scoring_rules rsr ON se.event_type = rsr.event_type
    WHERE se.user_id = user_uuid
    AND rsr.is_active = true
    AND se.created_at > NOW() - INTERVAL '30 days'
  LOOP
    CASE event_record.severity
      WHEN 'low' THEN total_score := total_score + event_record.base_score;
      WHEN 'medium' THEN total_score := total_score + (event_record.base_score * 2);
      WHEN 'high' THEN total_score := total_score + (event_record.base_score * 3);
    END CASE;
  END LOOP;

  RETURN total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user risk level based on score
CREATE OR REPLACE FUNCTION update_user_risk_level()
RETURNS TRIGGER AS $$
DECLARE
  new_risk_level TEXT;
  current_score INTEGER;
BEGIN
  -- Calculate new risk score
  current_score := calculate_user_risk_score(NEW.user_id);

  -- Determine risk level
  CASE
    WHEN current_score >= 100 THEN new_risk_level := 'critical';
    WHEN current_score >= 50 THEN new_risk_level := 'high';
    WHEN current_score >= 20 THEN new_risk_level := 'medium';
    ELSE new_risk_level := 'low';
  END CASE;

  -- Update user security status
  INSERT INTO user_security_status (user_id, risk_score, risk_level, updated_at)
  VALUES (NEW.user_id, current_score, new_risk_level, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    risk_score = EXCLUDED.risk_score,
    risk_level = EXCLUDED.risk_level,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update risk scores
CREATE TRIGGER trigger_update_risk_score
  AFTER INSERT ON security_events
  FOR EACH ROW
  EXECUTE FUNCTION update_user_risk_level();

-- Function to log security events for users
CREATE OR REPLACE FUNCTION log_user_security_event(
  p_user_id UUID,
  p_message TEXT,
  p_category TEXT DEFAULT 'general',
  p_related_event_id UUID DEFAULT NULL,
  p_related_restriction_id UUID DEFAULT NULL,
  p_related_appeal_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO user_security_logs (
    user_id,
    message,
    category,
    related_event_id,
    related_restriction_id,
    related_appeal_id
  ) VALUES (
    p_user_id,
    p_message,
    p_category,
    p_related_event_id,
    p_related_restriction_id,
    p_related_appeal_id
  ) RETURNING id INTO log_id;

  RETURN log_id;
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

CREATE TRIGGER set_user_security_status_timestamp
    BEFORE UPDATE ON user_security_status
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Insert default risk scoring rules
INSERT INTO risk_scoring_rules (rule_name, event_type, severity, base_score, conditions) VALUES
('Login from new device', 'device_change', 'medium', 5, '{"description": "Login from unrecognized device"}'),
('Mass reporting detected', 'mass_reports', 'high', 15, '{"description": "Multiple reports from same user/network"}'),
('Sensitive content posted', 'sensitive_post', 'high', 10, '{"description": "Content involving financial institutions or individuals"}'),
('API abuse detected', 'api_abuse', 'high', 20, '{"description": "Automated or excessive API usage"}'),
('Policy violation', 'policy_violation', 'medium', 8, '{"description": "Content edging on platform policies"}'),
('Login anomaly', 'login_anomaly', 'low', 3, '{"description": "Unusual login pattern or location"}'),
('Harassment report', 'harassment', 'medium', 12, '{"description": "User reported for harassment"}'),
('Fraud report', 'fraud', 'high', 25, '{"description": "User reported for fraudulent activity"}'),
('Misinformation', 'misinformation', 'medium', 6, '{"description": "Spreading false information"}'),
('Privacy violation', 'privacy_violation', 'high', 18, '{"description": "Violation of user privacy"}')
ON CONFLICT (rule_name) DO NOTHING;

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
