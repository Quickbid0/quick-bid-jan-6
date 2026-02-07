-- 🔒 QUICKBID ROW LEVEL SECURITY (RLS) POLICIES
-- Run this in Supabase SQL Editor after database setup

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ACCOUNTS TABLE POLICIES
CREATE POLICY "Users can view own account" ON accounts
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own account" ON accounts
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own account" ON accounts
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- PROFILES TABLE POLICIES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- PRODUCTS TABLE POLICIES
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Sellers can create products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid()::text 
      AND profiles.role = 'SELLER'
    )
  );

CREATE POLICY "Product owners can update own products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = products.seller_id 
      AND profiles.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Product owners can delete own products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = products.seller_id 
      AND profiles.user_id = auth.uid()::text
    )
  );

-- AUCTIONS TABLE POLICIES
CREATE POLICY "Auctions are viewable by everyone" ON auctions
  FOR SELECT USING (true);

CREATE POLICY "Sellers can create auctions" ON auctions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auctions.seller_id 
      AND profiles.user_id = auth.uid()::text
      AND profiles.role = 'SELLER'
    )
  );

CREATE POLICY "Auction owners can update own auctions" ON auctions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auctions.seller_id 
      AND profiles.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Auction owners can delete own auctions" ON auctions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auctions.seller_id 
      AND profiles.user_id = auth.uid()::text
    )
  );

-- USER SESSIONS TABLE POLICIES
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (auth.uid()::text = user_id);

-- AUDIT LOGS TABLE POLICIES
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Admin-specific policies (create admin role and policies)
-- First, create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid()::text 
    AND profiles.role = 'ADMIN'
  );
END;
$$;

-- Admin can view all accounts
CREATE POLICY "Admins can view all accounts" ON accounts
  FOR SELECT USING (is_admin());

-- Admin can update all accounts
CREATE POLICY "Admins can update all accounts" ON accounts
  FOR UPDATE USING (is_admin());

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

-- Admin can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- Admin can view all products
CREATE POLICY "Admins can view all products" ON products
  FOR SELECT USING (is_admin());

-- Admin can update all products
CREATE POLICY "Admins can update all products" ON products
  FOR UPDATE USING (is_admin());

-- Admin can delete any product
CREATE POLICY "Admins can delete any product" ON products
  FOR DELETE USING (is_admin());

-- Admin can view all auctions
CREATE POLICY "Admins can view all auctions" ON auctions
  FOR SELECT USING (is_admin());

-- Admin can update all auctions
CREATE POLICY "Admins can update all auctions" ON auctions
  FOR UPDATE USING (is_admin());

-- Admin can delete any auction
CREATE POLICY "Admins can delete any auction" ON auctions
  FOR DELETE USING (is_admin());

-- Admin can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_role ON accounts(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_auctions_seller_id ON auctions(seller_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
