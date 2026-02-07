# 🚀 SUPABASE PRODUCTION DEPLOYMENT GUIDE

## 📋 **OVERVIEW**

This guide provides step-by-step instructions for deploying the QuickBid platform's Supabase production database.

---

## 🏗️ **STEP 1: CREATE SUPABASE PRODUCTION PROJECT**

### **1.1 Prerequisites**
- Supabase account (free or paid)
- Supabase CLI installed
- QuickBid project ready

### **1.2 Installation**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### **1.3 Create Production Project**
```bash
# Run the automated setup script
./scripts/setup-supabase-production.sh

# Or create manually:
supabase projects create \
  --name "quickbid-production" \
  --description "QuickBid Auction Platform - Production Database" \
  --region "ap-south-1" \
  --db-password "$(openssl rand -base64 32)"
```

---

## 🗄️ **STEP 2: DATABASE CONFIGURATION**

### **2.1 Enable Extensions**
```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### **2.2 Apply Schema**
```bash
# Push the schema to production
npx prisma db push --force

# Or use the automated script
supabase db push --project-ref [PROJECT_ID] < prisma/seed-rls.sql
```

### **2.3 Create Indexes**
```sql
-- Performance indexes
CREATE INDEX IF NOT EXISTS "idx_accounts_email" ON "accounts"("email");
CREATE INDEX IF NOT EXISTS "idx_accounts_role" ON "accounts"("role");
CREATE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "profiles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_products_seller_id" ON "products"("seller_id");
CREATE INDEX IF NOT EXISTS "idx_auctions_seller_id" ON "auctions"("seller_id");
CREATE INDEX IF NOT EXISTS "idx_auctions_end_time" ON "auctions"("end_time");
```

---

## 🔒 **STEP 3: SECURITY CONFIGURATION**

### **3.1 Enable Row Level Security**
```sql
-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### **3.2 Apply RLS Policies**
```bash
# Apply RLS policies
supabase db push --project-ref [PROJECT_ID] < prisma/seed-rls.sql
```

### **3.3 Create Admin Function**
```sql
-- Admin role check function
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
```

---

## 🔐 **STEP 4: AUTHENTICATION CONFIGURATION**

### **4.1 Configure Email Auth**
```bash
# Update authentication settings
supabase auth update --project-ref [PROJECT_ID]
```

### **4.2 Auth Configuration JSON**
```json
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
```

### **4.3 SMTP Configuration (Optional)**
```bash
# Configure SMTP for email verification
supabase config update --project-ref [PROJECT_ID]
```

---

## 📊 **STEP 5: ENVIRONMENT CONFIGURATION**

### **5.1 Get Production Credentials**
```bash
# Get project details
supabase projects list

# Get API keys
supabase keys list --project-ref [PROJECT_ID]
```

### **5.2 Update .env.production**
```bash
# The automated script updates this automatically
# Update with actual values:
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
DATABASE_URL=postgresql://postgres:[password]@db.[PROJECT_ID]:5432/postgres
```

---

## 🧪 **STEP 6: TESTING & VALIDATION**

### **6.1 Test Database Connection**
```bash
# Test connection
npx prisma db pull

# Test schema
npx prisma generate

# Test API
curl -H "apikey: [ANON_KEY]" https://[PROJECT_ID].supabase.co/rest/v1/
```

### **6.2 Test RLS Policies**
```sql
-- Test RLS policies
SELECT * FROM accounts;  -- Should return empty (no auth)
SELECT * FROM profiles;  -- Should return empty (no auth)
```

### **6.3 Test Authentication**
```bash
# Test auth endpoint
curl -X POST https://[PROJECT_ID].supabase.co/auth/v1/signup \
  -H "apikey: [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🚀 **STEP 7: PRODUCTION DEPLOYMENT**

### **7.1 Update Backend Configuration**
```bash
# Update backend environment
cp .env.production .env

# Test backend
npm run build
npm start
```

### **7.2 Test Full Integration**
```bash
# Test health endpoint
curl http://localhost:4010/api/health

# Test database endpoint
curl http://localhost:4010/api/test-db
```

### **7.3 Deploy to Production**
```bash
# Deploy backend to production server
# Configure load balancer
# Set up SSL certificates
# Configure monitoring
```

---

## 📋 **PRODUCTION CHECKLIST**

### **✅ Pre-Deployment**
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] RLS policies implemented
- [ ] Authentication configured
- [ ] Environment variables updated
- [ ] Database connection tested
- [ ] RLS policies tested
- [ ] Authentication tested

### **✅ Post-Deployment**
- [ ] Backend deployed to production
- [ ] Database connection working
- [ ] All API endpoints functional
- [ ] Authentication working
- [ ] RLS policies working
- [ ] Monitoring configured
- [ ] Backup procedures in place

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

#### **Database Connection Failed**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL -c "SELECT 1;"
```

#### **RLS Policy Errors**
```sql
-- Check RLS status
SELECT schemaname, tablename, rowlevelsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### **Authentication Issues**
```bash
# Check auth configuration
supabase auth status --project-ref [PROJECT_ID]

# Test auth endpoint
curl -X POST https://[PROJECT_ID].supabase.co/auth/v1/settings
```

---

## 📊 **PERFORMANCE OPTIMIZATION**

### **Database Optimization**
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

### **Connection Pooling**
```bash
# Configure connection pool
DATABASE_URL="postgresql://postgres:[password]@db.[PROJECT_ID]:5432/postgres?connection_limit=20&pool_timeout=10"
```

---

## 🔒 **SECURITY BEST PRACTICES**

### **Database Security**
- [ ] Use strong database passwords
- [ ] Enable RLS on all tables
- [ ] Implement least privilege principle
- [ ] Regular security audits
- [ ] Monitor database access logs

### **API Security**
- [ ] Use service role key for server operations
- [ ] Implement rate limiting
- [ ] Use JWT with proper expiration
- [ ] Validate all inputs
- [ ] Implement proper CORS

---

## 📈 **MONITORING & MAINTENANCE**

### **Database Monitoring**
```bash
# Monitor database size
SELECT pg_size_pretty(pg_database_size('postgres'));

# Monitor table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size DESC;
```

### **Backup Procedures**
```bash
# Create backup
supabase db dump --project-ref [PROJECT_ID] > backup.sql

# Restore backup
supabase db restore --project-ref [PROJECT_ID] backup.sql
```

---

## 📞 **SUPPORT & RESOURCES**

### **Supabase Documentation**
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)

### **QuickBid Support**
- Technical: tech-support@quickbid.com
- Database: db-support@quickbid.com
- Security: security@quickbid.com

---

## 🎯 **NEXT STEPS**

1. **Complete Supabase setup** using the automated script
2. **Update environment variables** with actual values
3. **Test database connection** and RLS policies
4. **Deploy backend** to production server
5. **Configure monitoring** and alerting
6. **Set up backup procedures**
7. **Test full integration** with frontend

---

## 🚀 **PRODUCTION DEPLOYMENT READY**

**🎉 Supabase production deployment guide completed!**

**📊 Status: Ready for production deployment**
**🎯 Next: Configure domain and SSL certificates**
**🚀 Timeline: On track for Week 2 completion**

---

*Last Updated: February 4, 2026*
*Status: Ready for Implementation*
