#!/bin/bash

# 🚀 QUICKBID SUPABASE PRODUCTION SETUP SCRIPT
# This script automates the setup of Supabase production project

set -e  # Exit on any error

echo "🚀 Starting Supabase Production Setup..."

# ================================
# 📋 PRE-REQUISITES CHECK
# ================================

echo "📋 Checking prerequisites..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ ERROR: Supabase CLI not found"
    echo "Please install Supabase CLI: npm install -g supabase"
    exit 1
fi

# Check if user is logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ ERROR: Not logged in to Supabase"
    echo "Please login: supabase login"
    exit 1
fi

echo "✅ Prerequisites check passed"

# ================================
# 🏗️ CREATE PRODUCTION PROJECT
# ================================

echo "🏗️ Creating Supabase Production Project..."

PROJECT_NAME="quickbid-production"
PROJECT_DESCRIPTION="QuickBid Auction Platform - Production Database"
PROJECT_REGION="ap-south-1"  # Singapore region

# Create the project
echo "📝 Creating project: $PROJECT_NAME"
PROJECT_OUTPUT=$(supabase projects create \
    --name "$PROJECT_NAME" \
    --description "$PROJECT_DESCRIPTION" \
    --region "$PROJECT_REGION" \
    --org-id "quickbid-org" \
    --db-password "$(openssl rand -base64 32)" \
    --output json)

# Extract project details
PROJECT_ID=$(echo "$PROJECT_OUTPUT" | jq -r '.id')
PROJECT_URL=$(echo "$PROJECT_OUTPUT" | jq -r '.api_url')
PROJECT_ANON_KEY=$(echo "$PROJECT_OUTPUT" | jq -r '.anon_key')
PROJECT_SERVICE_KEY=$(echo "$PROJECT_OUTPUT" | jq -r '.service_key')

echo "✅ Project created successfully"
echo "📊 Project ID: $PROJECT_ID"
echo "🌐 Project URL: $PROJECT_URL"

# ================================
# 🗄️ DATABASE CONFIGURATION
# ================================

echo "🗄️ Configuring database..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Enable required extensions
echo "🔧 Enabling database extensions..."
supabase db push --project-ref "$PROJECT_ID" << 'EOF'
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_accounts_email" ON "accounts"("email");
CREATE INDEX IF NOT EXISTS "idx_accounts_role" ON "accounts"("role");
CREATE INDEX IF NOT EXISTS "idx_accounts_status" ON "accounts"("status");
CREATE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "profiles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_profiles_role" ON "profiles"("role");
CREATE INDEX IF NOT EXISTS "idx_products_seller_id" ON "products"("seller_id");
CREATE INDEX IF NOT EXISTS "idx_products_status" ON "products"("status");
CREATE INDEX IF NOT EXISTS "idx_auctions_seller_id" ON "auctions"("seller_id");
CREATE INDEX IF NOT EXISTS "idx_auctions_status" ON "auctions"("status");
CREATE INDEX IF NOT EXISTS "idx_auctions_end_time" ON "auctions"("end_time");
CREATE INDEX IF NOT EXISTS "idx_user_sessions_user_id" ON "user_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_timestamp" ON "audit_logs"("created_at");

-- Create function for admin role check
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
EOF

echo "✅ Database configuration completed"

# ================================
# 🔒 SECURITY CONFIGURATION
# ================================

echo "🔒 Configuring security settings..."

# Enable Row Level Security
echo "🛡️ Enabling Row Level Security..."
supabase db push --project-ref "$PROJECT_ID" << 'EOF'
-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts table
CREATE POLICY "Users can view own account" ON accounts
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own account" ON accounts
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own account" ON accounts
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS Policies for products table
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

-- RLS Policies for auctions table
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

-- RLS Policies for user_sessions table
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for audit_logs table
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Admin policies
CREATE POLICY "Admins can view all accounts" ON accounts
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all accounts" ON accounts
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can view all products" ON products
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all products" ON products
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete any product" ON products
  FOR DELETE USING (is_admin());

CREATE POLICY "Admins can view all auctions" ON auctions
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all auctions" ON auctions
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete any auction" ON auctions
  FOR DELETE USING (is_admin());

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (is_admin());
EOF

echo "✅ Security configuration completed"

# ================================
# 🔐 AUTHENTICATION CONFIGURATION
# ================================

echo "🔐 Configuring authentication..."

# Configure authentication providers
echo "📧 Setting up email authentication..."
supabase auth update --project-ref "$PROJECT_ID" << 'EOF'
{
  "site_url": "https://quickbid.com",
  "additional_redirect_urls": ["https://www.quickbid.com"],
  "jwt_expiry": 3600,
  "disable_signup": false,
  "external": {
    "email": {
      "enabled": true,
      "auto_confirm": false
    }
  }
}
EOF

echo "✅ Authentication configuration completed"

# ================================
# 📊 ENVIRONMENT FILE UPDATE
# ================================

echo "📊 Updating environment file..."

# Update .env.production with actual values
cat > /Users/sanieevmusugu/Desktop/quick-bid-jan-6/.env.production << EOF
# 🚀 QUICKBID PLATFORM - PRODUCTION ENVIRONMENT
# UPDATED WITH ACTUAL SUPABASE VALUES

# ================================
# 🌍 APPLICATION CONFIGURATION
# ================================
NODE_ENV=production
PORT=4010

# Frontend Configuration
VITE_APP_NAME=QuickBid Platform
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_APP_URL=https://quickbid.com
VITE_API_URL=https://api.quickbid.com

# Authentication Configuration
VITE_AUTH_MODE=real
VITE_ENABLE_REAL_AUTH=true
VITE_ENABLE_DEMO_AUTH=false
VITE_AUTH_ENABLED=true
VITE_AUTH_PROVIDER=supabase
VITE_SESSION_TIMEOUT=3600000

# ================================
# 🗄️ DATABASE CONFIGURATION
# ================================
# Supabase Production Configuration
VITE_SUPABASE_URL=$PROJECT_URL
VITE_SUPABASE_ANON_KEY=$PROJECT_ANON_KEY
SUPABASE_URL=$PROJECT_URL
SUPABASE_SERVICE_ROLE_KEY=$PROJECT_SERVICE_KEY

# Database Connection String
DATABASE_URL=postgresql://postgres:[password]@db.$PROJECT_ID:5432/postgres

# ================================
# 💳 PAYMENT GATEWAY CONFIGURATION
# ================================
# Razorpay Production (UPDATE WITH ACTUAL VALUES)
RAZORPAY_KEY_ID=rzp_live_your-production-key-id
RAZORPAY_KEY_SECRET=your-production-secret-key
RAZORPAY_WEBHOOK_SECRET=your-production-webhook-secret

# Payment Configuration
VITE_PAYMENT_GATEWAY=razorpay
VITE_PAYMENT_CURRENCY=INR
VITE_PAYMENT_WEBHOOK_URL=https://api.quickbid.com/webhooks/razorpay

# ================================
# 📱 COMMUNICATION CONFIGURATION
# ================================
# Twilio Configuration (UPDATE WITH ACTUAL VALUES)
TWILIO_ACCOUNT_SID=your-production-account-sid
TWILIO_AUTH_TOKEN=your-production-auth-token
TWILIO_USER_SID=your-production-user-sid

# Email Configuration
VITE_EMAIL_FROM=noreply@quickbid.com
VITE_EMAIL_FROM_NAME=QuickBid Platform
VITE_EMAIL_SUPPORT=support@quickbid.com

# ================================
# 🔒 SECURITY CONFIGURATION
# ================================
# JWT Configuration
JWT_SECRET=quickbid-super-secret-jwt-key-2024-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=quickbid-super-secret-session-key-2024-production
SESSION_MAX_AGE=3600000

# CORS Configuration
CORS_ORIGIN=https://quickbid.com,https://www.quickbid.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ================================
# 📊 ANALYTICS & MONITORING
# ================================
# Google Analytics (UPDATE WITH ACTUAL VALUES)
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID

# Sentry Error Tracking (UPDATE WITH ACTUAL VALUES)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Application Monitoring
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# ================================
# 🎨 UI/UX CONFIGURATION
# ================================
# Theme Configuration
VITE_DEFAULT_THEME=system
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_ANIMATIONS=true

# Feature Flags
VITE_ENABLE_LIVE_STREAMING=true
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_CHAT_SUPPORT=true

# ================================
# 🚀 PERFORMANCE CONFIGURATION
# ================================
# Caching Configuration
VITE_CACHE_DURATION=3600000
VITE_ENABLE_SERVICE_WORKER=true
VITE_ENABLE_PWA=true

# CDN Configuration
VITE_CDN_URL=https://cdn.quickbid.com
VITE_ASSET_URL=https://assets.quickbid.com

# ================================
# 📝 LOGGING CONFIGURATION
# ================================
# Log Level
LOG_LEVEL=warn
LOG_FORMAT=json

# File Logging
LOG_FILE_PATH=/var/log/quickbid/app.log
LOG_MAX_FILE_SIZE=10m
LOG_MAX_FILES=5

# ================================
# 🌐 NETWORK CONFIGURATION
# ================================
# Server Configuration
HOST=0.0.0.0
TIMEOUT=30000
KEEP_ALIVE_TIMEOUT=65000

# Proxy Configuration
TRUST_PROXY=true
X_FORWARDED_HOST=true
X_FORWARDED_PROTO=true

# ================================
# 📦 BUILD CONFIGURATION
# ================================
# Build Optimization
VITE_BUILD_SOURCEMAP=false
VITE_MINIFY=true
VITE_CHUNK_SIZE_WARNING_LIMIT=1000

# Asset Optimization
VITE_ASSET_INLINE_LIMIT=4096
VITE_PRELOAD_ASSETS=true
EOF

echo "✅ Environment file updated"

# ================================
# 📋 PROJECT SUMMARY
# ================================

echo ""
echo "🎉 SUPABASE PRODUCTION SETUP COMPLETED!"
echo "=================================="
echo "📊 Project Details:"
echo "   Project ID: $PROJECT_ID"
echo "   Project URL: $PROJECT_URL"
echo "   Database: PostgreSQL with RLS enabled"
echo "   Security: Row-level security configured"
echo "   Authentication: Email auth enabled"
echo ""
echo "📋 Next Steps:"
echo "   1. Update Razorpay keys in .env.production"
echo "   2. Update Twilio keys in .env.production"
echo "   3. Update Google Analytics ID in .env.production"
echo "   4. Update Sentry DSN in .env.production"
echo "   5. Test database connection"
echo "   6. Deploy backend to production"
echo ""
echo "🔗 Useful Links:"
echo "   Supabase Dashboard: https://supabase.com/dashboard"
echo "   Project URL: $PROJECT_URL"
echo "   API Documentation: $PROJECT_URL/docs"
echo ""
echo "📁 Files Created/Updated:"
echo "   .env.production - Updated with actual values"
echo "   Database schema - Applied with RLS policies"
echo "   Authentication - Configured for production"
echo ""
echo "🚀 Supabase production setup completed successfully!"
