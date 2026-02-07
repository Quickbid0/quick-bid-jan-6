-- 🔒 QUICKBID ROW LEVEL SECURITY (RLS) POLICIES - LOCAL DEVELOPMENT
-- This is a simplified version for local PostgreSQL development
-- Use seed-rls.sql for Supabase production deployment

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create a simple user context function for local development
CREATE OR REPLACE FUNCTION current_user_id() 
RETURNS TEXT 
LANGUAGE plpgsql 
AS $$
BEGIN
  -- For local development, return a placeholder
  -- In production, this would be auth.uid() from Supabase
  RETURN 'dev-user-id';
END;
$$;

-- ACCOUNTS TABLE POLICIES (Simplified for local dev)
CREATE POLICY "Users can view all accounts (local dev)" ON accounts
  FOR SELECT USING (true);

CREATE POLICY "Users can update accounts (local dev)" ON accounts
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert accounts (local dev)" ON accounts
  FOR INSERT WITH CHECK (true);

-- PROFILES TABLE POLICIES (Simplified for local dev)
CREATE POLICY "Users can view all profiles (local dev)" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update profiles (local dev)" ON profiles
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert profiles (local dev)" ON profiles
  FOR INSERT WITH CHECK (true);

-- PRODUCTS TABLE POLICIES (Simplified for local dev)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Users can create products (local dev)" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update products (local dev)" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete products (local dev)" ON products
  FOR DELETE USING (true);

-- AUCTIONS TABLE POLICIES (Simplified for local dev)
CREATE POLICY "Auctions are viewable by everyone" ON auctions
  FOR SELECT USING (true);

CREATE POLICY "Users can create auctions (local dev)" ON auctions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update auctions (local dev)" ON auctions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete auctions (local dev)" ON auctions
  FOR DELETE USING (true);

-- USER SESSIONS TABLE POLICIES (Simplified for local dev)
CREATE POLICY "Users can view all sessions (local dev)" ON user_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can delete sessions (local dev)" ON user_sessions
  FOR DELETE USING (true);

-- AUDIT LOGS TABLE POLICIES (Simplified for local dev)
CREATE POLICY "Users can view all audit logs (local dev)" ON audit_logs
  FOR SELECT USING (true);

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Grant necessary permissions for local development
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO PUBLIC;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_auctions_seller_id ON auctions(seller_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
