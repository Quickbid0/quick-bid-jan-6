# 🔧 PRODUCTION API KEYS SETUP GUIDE

## 📋 **OVERVIEW**

This guide covers the setup of all production API keys required for QuickBid platform deployment.

---

## 🏦 **PAYMENT GATEWAY: RAZORPAY**

### **1. Create Production Account**
1. **Login to Razorpay Dashboard**
   ```
   https://dashboard.razorpay.com
   ```

2. **Complete KYC Verification**
   - Business registration documents
   - Bank account details
   - PAN card verification
   - GST registration (if applicable)

3. **Generate Production Keys**
   - Go to Settings → API Keys
   - Click "Generate Key"
   - Select "Production Mode"
   - Save Key ID and Secret securely

### **2. Configure Webhooks**
1. **Create Webhook Endpoint**
   ```
   URL: https://api.quickbid.com/webhooks/razorpay
   Events: payment.captured, payment.failed, refund.processed
   Secret: Generate webhook secret
   ```

2. **Test Webhook**
   ```bash
   # Test webhook endpoint
   curl -X POST https://api.quickbid.com/webhooks/razorpay \
     -H "Content-Type: application/json" \
     -d '{"event":"payment.captured","payload":{}}'
   ```

### **3. Environment Variables**
```bash
# Add to .env.production
RAZORPAY_KEY_ID=rzp_live_your_production_key_id
RAZORPAY_KEY_SECRET=your_production_secret_key
RAZORPAY_WEBHOOK_SECRET=your_production_webhook_secret
```

---

## 📱 **COMMUNICATION: TWILIO**

### **1. Create Production Account**
1. **Login to Twilio Console**
   ```
   https://console.twilio.com
   ```

2. **Upgrade to Production Account**
   - Go to Billing → Upgrade
   - Select appropriate plan
   - Add payment method

3. **Get Production Credentials**
   - Go to Settings → General
   - Copy Account SID
   - Generate Auth Token
   - Create messaging service

### **2. Configure SMS Service**
1. **Create Messaging Service**
   - Go to Messaging → Services
   - Click "Create Service"
   - Set friendly name: "QuickBid Notifications"
   - Configure webhook URL

2. **Get Phone Number**
   - Go to Phone Numbers → Buy Number
   - Select country and number
   - Configure webhook URL

### **3. Environment Variables**
```bash
# Add to .env.production
TWILIO_ACCOUNT_SID=your_production_account_sid
TWILIO_AUTH_TOKEN=your_production_auth_token
TWILIO_USER_SID=your_production_user_sid
```

---

## 🔐 **AUTHENTICATION: SUPABASE**

### **1. Create Production Project**
1. **Login to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Create New Project**
   - Click "New Project"
   - Name: "quickbid-production"
   - Database password: Generate strong password
   - Region: Choose closest to users

3. **Get API Keys**
   - Go to Settings → API
   - Copy Project URL
   - Copy Anon Key
   - Copy Service Role Key

### **2. Configure Authentication**
1. **Enable Auth Providers**
   - Go to Authentication → Providers
   - Enable Email/Password
   - Configure SMTP settings (optional)

2. **Set Up Row Level Security**
   - Run RLS policies from `prisma/seed-rls.sql`
   - Test policies with different user roles

### **3. Environment Variables**
```bash
# Add to .env.production
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
```

---

## 📊 **MONITORING: SENTRY**

### **1. Create Production Account**
1. **Login to Sentry**
   ```
   https://sentry.io
   ```

2. **Create Organization**
   - Click "Create Organization"
   - Name: "QuickBid"
   - Plan: Choose appropriate plan

3. **Create Project**
   - Click "Create Project"
   - Platform: Node.js
   - Name: "quickbid-production"

### **2. Configure Error Tracking**
1. **Get DSN**
   - Go to Project Settings → Client Keys
   - Copy DSN URL

2. **Configure Source Maps**
   - Upload source maps for better error tracking
   - Configure release tracking

### **3. Environment Variables**
```bash
# Add to .env.production
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

---

## 📈 **ANALYTICS: GOOGLE ANALYTICS**

### **1. Create Property**
1. **Login to Google Analytics**
   ```
   https://analytics.google.com
   ```

2. **Create Property**
   - Click "Create Property"
   - Property name: "QuickBid Platform"
   - Industry: "Technology"
   - Time zone: Choose appropriate

3. **Get Tracking ID**
   - Go to Admin → Property Settings
   - Copy Measurement ID (starts with "G-")

### **2. Configure Tracking**
1. **Add to Frontend**
   - Install Google Analytics 4
   - Configure page tracking
   - Set up event tracking

2. **Environment Variables**
```bash
# Add to .env.production
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## 🔒 **SECURITY BEST PRACTICES**

### **1. Key Management**
```bash
# ✅ DO: Store keys in environment variables
# ❌ DON'T: Hardcode keys in source code

# ✅ DO: Use different keys for dev/staging/prod
# ❌ DON'T: Use same keys across environments

# ✅ DO: Rotate keys regularly
# ❌ DON'T: Use same keys indefinitely
```

### **2. Access Control**
```bash
# ✅ DO: Limit access to production keys
# ❌ DON'T: Share keys in public repositories

# ✅ DO: Use least privilege principle
# ❌ DON'T: Grant unnecessary permissions

# ✅ DO: Monitor key usage
# ❌ DON'T: Ignore unusual activity
```

### **3. Backup Strategy**
```bash
# ✅ DO: Store keys in secure vault
# ❌ DON'T: Store keys in plain text

# ✅ DO: Have key rotation plan
# ❌ DON'T: Wait until keys are compromised

# ✅ DO: Document key management
# ❌ DON'T: Leave undocumented keys
```

---

## 🧪 **TESTING CONFIGURATION**

### **1. API Key Validation**
```bash
# Test Razorpay
curl -X POST https://api.razorpay.com/v1/payments/keys \
  -u "rzp_live_your_key_id:your_secret_key"

# Test Twilio
curl -X POST https://api.twilio.com/2010-04-01/Accounts.json \
  -u "your_account_sid:your_auth_token"

# Test Supabase
curl -H "apikey: your_anon_key" \
  https://your-project.supabase.co/rest/v1/
```

### **2. Environment Validation**
```bash
# Check environment variables
echo "DATABASE_URL: $DATABASE_URL"
echo "RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID:0:10}..."
echo "TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID:0:10}..."

# Validate required variables
required_vars=("DATABASE_URL" "RAZORPAY_KEY_ID" "TWILIO_ACCOUNT_SID")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ ERROR: $var is not set"
    exit 1
  fi
done
echo "✅ All required environment variables are set"
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**
- [ ] All production API keys generated
- [ ] Environment variables configured
- [ ] API keys tested and validated
- [ ] Security policies implemented
- [ ] Backup procedures documented

### **Post-Deployment**
- [ ] API keys working in production
- [ ] Error tracking configured
- [ ] Analytics tracking active
- [ ] Monitoring alerts set up
- [ ] Key rotation schedule established

---

## 📞 **SUPPORT RESOURCES**

### **API Provider Support**
- **Razorpay**: support@razorpay.com
- **Twilio**: support@twilio.com
- **Supabase**: support@supabase.com
- **Sentry**: support@sentry.io
- **Google Analytics**: ga-support@google.com

### **QuickBid Support**
- **Technical**: tech-support@quickbid.com
- **Security**: security@quickbid.com
- **Deployment**: deploy@quickbid.com

---

## 🎯 **NEXT STEPS**

1. **Generate all production API keys**
2. **Update .env.production with actual values**
3. **Test all API integrations**
4. **Implement security best practices**
5. **Set up monitoring and alerts**
6. **Document key management procedures**

---

*Last Updated: February 4, 2026*
*Status: Ready for Implementation*
