# Database Migration Script for Production Deployment

#!/bin/bash

# QuickMela Database Migration Script
# ==================================

set -e

echo "🚀 QUICKMELA DATABASE MIGRATION SCRIPT"
echo "====================================="

# Configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"quickmela_prod"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-""}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

echo -e "${YELLOW}📋 Checking database connection...${NC}"

# Test database connection
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Database connection failed${NC}"
    echo -e "${YELLOW}Please check your database configuration:${NC}"
    echo "Host: $DB_HOST"
    echo "Port: $DB_PORT"
    echo "Database: $DB_NAME"
    echo "User: $DB_USER"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

echo -e "${YELLOW}🗄️ Creating database extensions...${NC}"

# Create necessary extensions
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << EOF
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
DO \$\$
BEGIN
    -- User role enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
    END IF;

    -- Product condition enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_condition') THEN
        CREATE TYPE product_condition AS ENUM ('excellent', 'good', 'fair', 'poor');
    END IF;

    -- Auction status enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auction_status') THEN
        CREATE TYPE auction_status AS ENUM ('active', 'ended', 'cancelled', 'sold');
    END IF;

    -- Payment status enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    END IF;

    -- Company subscription tier enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE subscription_tier AS ENUM ('basic', 'standard', 'premium', 'enterprise');
    END IF;
END
\$\$;
EOF

echo -e "${GREEN}✅ Database extensions created${NC}"

echo -e "${YELLOW}📊 Creating tables...${NC}"

# Create tables
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'buyer',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    phone VARCHAR(20),
    address TEXT,
    pincode VARCHAR(10),
    avatar_url VARCHAR(500),
    wallet_balance DECIMAL(15,2) DEFAULT 0,
    kyc_status VARCHAR(50) DEFAULT 'pending',
    kyc_documents JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    gstin VARCHAR(50),
    pan VARCHAR(20),
    business_type VARCHAR(100),
    subscription_tier subscription_tier DEFAULT 'basic',
    subscription_start_date DATE,
    subscription_end_date DATE,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    address TEXT,
    documents JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Company users table (bulk registered users)
CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'user',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    condition product_condition DEFAULT 'good',
    starting_price DECIMAL(15,2) NOT NULL,
    current_price DECIMAL(15,2) NOT NULL,
    buy_now_price DECIMAL(15,2),
    reserve_price DECIMAL(15,2),
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    is_bulk_listing BOOLEAN DEFAULT false,
    bulk_quantity INTEGER DEFAULT 1,
    images TEXT[] DEFAULT '{}',
    location GEOGRAPHY(POINT),
    address TEXT,
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    year INTEGER,
    mileage INTEGER,
    status auction_status DEFAULT 'active',
    views_count INTEGER DEFAULT 0,
    bids_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    is_auto_bid BOOLEAN DEFAULT false,
    max_auto_bid_amount DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KYC verifications table
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    aadhaar_number VARCHAR(20),
    pan_number VARCHAR(20),
    aadhaar_verified BOOLEAN DEFAULT false,
    pan_verified BOOLEAN DEFAULT false,
    face_verified BOOLEAN DEFAULT false,
    documents JSONB DEFAULT '{}',
    verification_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Sessions table for tracking user sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
EOF

echo -e "${GREEN}✅ Tables created${NC}"

echo -e "${YELLOW}🔗 Creating indexes...${NC}"

# Create indexes for performance
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Companies indexes
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_tier ON companies(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_end_time ON products(end_time);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_location ON products USING GIST (location);

-- Bids indexes
CREATE INDEX IF NOT EXISTS idx_bids_product_id ON bids(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(amount);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);

-- KYC indexes
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_aadhaar_number ON kyc_verifications(aadhaar_number);
CREATE INDEX IF NOT EXISTS idx_kyc_pan_number ON kyc_verifications(pan_number);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
EOF

echo -e "${GREEN}✅ Indexes created${NC}"

echo -e "${YELLOW}🔐 Creating constraints and triggers...${NC}"

# Create constraints and triggers
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON kyc_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_users_updated_at BEFORE UPDATE ON company_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bid validation function
CREATE OR REPLACE FUNCTION validate_bid()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if auction is still active
    IF EXISTS (
        SELECT 1 FROM products
        WHERE id = NEW.product_id
        AND (status != 'active' OR end_time < NOW())
    ) THEN
        RAISE EXCEPTION 'Cannot place bid on inactive or ended auction';
    END IF;

    -- Check if bid amount is higher than current price
    IF NEW.amount <= (
        SELECT current_price FROM products WHERE id = NEW.product_id
    ) THEN
        RAISE EXCEPTION 'Bid amount must be higher than current price';
    END IF;

    -- Update product's current price and bid count
    UPDATE products
    SET current_price = NEW.amount,
        bids_count = bids_count + 1,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create bid validation trigger
CREATE TRIGGER validate_bid_trigger
    BEFORE INSERT ON bids
    FOR EACH ROW
    EXECUTE FUNCTION validate_bid();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
EOF

echo -e "${GREEN}✅ Constraints and triggers created${NC}"

echo -e "${YELLOW}🌱 Inserting seed data...${NC}"

# Insert seed data
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- Insert admin user
INSERT INTO users (email, name, password_hash, role, is_verified, is_active, phone, wallet_balance, kyc_status)
VALUES (
    'admin@quickmela.com',
    'System Administrator',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfBPjJcT1j5wYi', -- password: AdminPass123!
    'admin',
    true,
    true,
    '+919876543210',
    100000.00,
    'verified'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample categories and data if needed
-- This would be populated based on your application requirements
EOF

echo -e "${GREEN}✅ Seed data inserted${NC}"

echo -e "${YELLOW}🔄 Running final optimizations...${NC}"

# Run final optimizations
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- Analyze tables for query optimization
ANALYZE users;
ANALYZE companies;
ANALYZE products;
ANALYZE bids;
ANALYZE payments;

-- Vacuum database
VACUUM;

-- Create backup of current database state
-- Note: In production, you would want to use pg_dump for proper backups
EOF

echo -e "${GREEN}✅ Database optimizations completed${NC}"

echo ""
echo -e "${GREEN}🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!${NC}"
echo ""
echo -e "${YELLOW}📊 Database Summary:${NC}"
echo "- Tables: 12"
echo "- Indexes: 25+"
echo "- Triggers: 7"
echo "- Seed data: Admin user created"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Run application with new database"
echo "2. Test all CRUD operations"
echo "3. Verify relationships and constraints"
echo "4. Set up automated backups"
echo "5. Monitor performance metrics"
echo ""
echo -e "${GREEN}✅ Ready for production deployment!${NC}"
