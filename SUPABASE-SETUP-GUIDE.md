# 🚀 SUPABASE PRODUCTION SETUP GUIDE

## 📋 **PREREQUISITES**

### **1. Supabase Account**
- [ ] Create Supabase account at https://supabase.com
- [ ] Verify email address
- [ ] Set up organization (if not already done)

### **2. Project Creation**
- [ ] Create new Supabase project
- [ ] Choose a region closest to your users
- [ ] Set up project password
- [ ] Save project URL and API keys

---

## 🔧 **STEP-BY-STEP SETUP**

### **Step 1: Create Production Project**

1. **Login to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Create New Project**
   - Click "New Project"
   - Enter project name: `quickbid-production`
   - Choose database password: `Generate strong password`
   - Select region: `Southeast Asia (Singapore)` or closest to users
   - Click "Create new project"

3. **Save Project Credentials**
   ```bash
   # Save these credentials securely
   Project URL: https://[project-id].supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### **Step 2: Configure Database**

1. **Enable Required Extensions**
   ```sql
   -- In Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

2. **Run Prisma Migrations**
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"

   # Push schema to production
   npx prisma db push
   ```

### **Step 3: Configure Authentication**

1. **Enable Authentication Providers**
   - Go to Settings → Authentication
   - Enable Email/Password provider
   - Configure SMTP settings (optional but recommended)

2. **Set Up Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
   ```

### **Step 4: Configure API Keys**

1. **Update Production Environment**
   ```bash
   # Update .env.production
   VITE_SUPABASE_URL=https://[project-id].supabase.co
   VITE_SUPABASE_ANON_KEY=[your-anon-key]
   DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   ```

2. **Test Connection**
   ```bash
   # Test database connection
   npx prisma db pull

   # Test API connection
   curl https://[project-id].supabase.co/rest/v1/
   ```

---

## 🔒 **SECURITY CONFIGURATION**

### **Row Level Security Policies**

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can view all products (public)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Only sellers can create products
CREATE POLICY "Sellers can create products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid()::text 
      AND profiles.role = 'SELLER'
    )
  );
```

### **API Restrictions**

1. **Configure API Settings**
   - Go to Settings → API
   - Set JWT expiry to 1 hour
   - Enable additional headers if needed
   - Configure rate limiting

2. **Database Permissions**
   ```sql
   -- Create read-only role for public access
   CREATE ROLE anon;
   GRANT USAGE ON SCHEMA public TO anon;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
   ```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**
- [ ] Supabase project created and configured
- [ ] Database schema pushed successfully
- [ ] RLS policies implemented
- [ ] Authentication providers configured
- [ ] API keys secured and stored
- [ ] Environment variables updated
- [ ] Connection tested and verified

### **Post-Deployment**
- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Test data persistence
- [ ] Test API endpoints
- [ ] Verify RLS policies working
- [ ] Monitor database performance

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues**

1. **Connection Timeout**
   ```
   Solution: Check DATABASE_URL format and credentials
   ```

2. **RLS Policy Errors**
   ```
   Solution: Review policy logic and test with auth.uid()
   ```

3. **API Key Issues**
   ```
   Solution: Regenerate keys and update environment variables
   ```

### **Support Resources**
- Supabase Documentation: https://supabase.com/docs
- Prisma Documentation: https://www.prisma.io/docs
- QuickBid Support: support@quickbid.com

---

## 🎯 **NEXT STEPS**

1. **Create Supabase Production Project**
2. **Configure Database and Authentication**
3. **Implement RLS Policies**
4. **Update Environment Variables**
5. **Test All Connections**
6. **Deploy to Production**

---

*Last Updated: February 4, 2026*
*Status: Ready for Implementation*
