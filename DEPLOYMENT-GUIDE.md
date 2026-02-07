# 🚀 QuickMela Production Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the QuickMela auction platform to production environments.

## Prerequisites

### System Requirements
- Node.js 18+ and npm
- Git
- Production accounts for chosen platforms

### Required Accounts
- **Frontend Hosting**: Vercel or Netlify
- **Backend Hosting**: Railway, Render, or DigitalOcean
- **Database**: Supabase (PostgreSQL)
- **Payment Gateway**: Razorpay
- **Domain Registrar**: For custom domain
- **Monitoring**: Sentry, Google Analytics

---

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Update `.env.production` with real production values
- [ ] Create production Supabase project
- [ ] Set up Razorpay production account
- [ ] Configure custom domain

### 2. Accounts & Services Setup
- [ ] Create Vercel/Netlify account
- [ ] Create Railway/Render account
- [ ] Set up Supabase production project
- [ ] Configure Razorpay production keys
- [ ] Set up custom domain DNS

### 3. Security Configuration
- [ ] Generate strong JWT secrets
- [ ] Configure CORS settings
- [ ] Set up SSL certificates
- [ ] Enable rate limiting

---

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Production Environment

#### Update .env.production
```bash
# Replace all placeholder values with real production credentials
cp .env.production .env.production.backup
# Edit .env.production with actual values
```

#### Required Environment Variables
```bash
# Supabase Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# Razorpay Production
RAZORPAY_KEY_ID=rzp_live_your-key-id
RAZORPAY_KEY_SECRET=your-production-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Domain & URLs
VITE_APP_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

### Step 2: Database Setup

#### Create Production Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project
3. Choose production region (closest to users)
4. Set strong database password
5. Enable Row Level Security (RLS)

#### Run Database Migrations
```bash
cd backend
npm install
npm run migration:run
```

#### Configure Database Security
- Enable RLS policies
- Set up authentication
- Configure API keys
- Set up database backups

### Step 3: Payment Gateway Setup

#### Configure Razorpay Production
1. Create Razorpay production account
2. Generate API keys (live keys)
3. Configure webhook endpoints:
   - Payment success: `https://api.yourdomain.com/webhooks/razorpay`
   - Payment failure: `https://api.yourdomain.com/webhooks/razorpay`

#### Webhook Configuration
```json
{
  "webhook_url": "https://api.yourdomain.com/webhooks/razorpay",
  "events": [
    "payment.captured",
    "payment.failed",
    "refund.created"
  ]
}
```

### Step 4: Deploy Backend

#### Option A: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Link project
railway link

# Set environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=your-db-url
# ... set all other variables

# Deploy
railway deploy
```

#### Option B: Render
1. Connect GitHub repository to Render
2. Use `backend/render.yaml` configuration
3. Set environment variables in Render dashboard
4. Deploy

### Step 5: Deploy Frontend

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel
vercel login

# Deploy with production settings
vercel --prod

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# ... set all frontend variables
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Step 6: Domain Configuration

#### DNS Setup
```
# Frontend (Vercel/Netlify)
yourdomain.com     -> Vercel/Netlify deployment

# Backend API
api.yourdomain.com -> Railway/Render backend URL
```

#### SSL Certificates
- Vercel/Netlify: Automatic SSL
- Railway/Render: Automatic SSL
- Custom domain: Configure in hosting platform

---

## 📊 Monitoring & Analytics Setup

### Google Analytics 4
```bash
# Add to .env.production
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
```

### Sentry Error Tracking
```bash
# Install Sentry
npm install @sentry/react @sentry/tracing

# Add to .env.production
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Application Monitoring
```javascript
// Add to main app file
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

---

## 🔒 Security Configuration

### CORS Setup
```bash
# Update .env.production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Rate Limiting
```bash
# Configure in your hosting platform
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### SSL/TLS
- Enable HTTPS redirect
- Use strong SSL certificates
- Configure security headers

---

## 🧪 Post-Deployment Testing

### Automated Testing
```bash
# Run production tests
npm run test:e2e
npm run test:integration
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Auction creation and bidding
- [ ] Payment processing
- [ ] Order tracking
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Performance Testing
- Core Web Vitals
- Lighthouse scores
- Load testing
- API response times

---

## 🚨 Emergency Procedures

### Rollback Process
```bash
# If deployment fails, rollback immediately
railway deploy --rollback
# or
vercel rollback
```

### Critical Issues
1. **Database Issues**: Check Supabase dashboard
2. **Payment Failures**: Verify Razorpay webhooks
3. **API Errors**: Check Railway/Render logs
4. **Performance Issues**: Monitor Core Web Vitals

---

## 📈 Monitoring & Maintenance

### Daily Tasks
- Monitor error rates
- Check payment processing
- Verify auction functionality
- Review user feedback

### Weekly Tasks
- Update dependencies
- Review security logs
- Optimize performance
- Backup verification

### Monthly Tasks
- Security audits
- Performance reviews
- Feature updates
- Cost optimization

---

## 📞 Support & Emergency Contacts

### Technical Support
- **Primary**: support@quickmela.com
- **Emergency**: +91-XXXX-XXXXXX
- **Slack**: #production-alerts

### Service Providers
- **Supabase**: support@supabase.com
- **Razorpay**: support@razorpay.com
- **Railway**: support@railway.app
- **Vercel**: support@vercel.com

---

## 🎯 Success Metrics

### Launch Targets (First 30 Days)
- **Users**: 5,000 registered
- **Auctions**: 500+ active auctions
- **Revenue**: ₹10,00,000+ GMV
- **Uptime**: 99.9%
- **Performance**: Core Web Vitals < 2.5s

### Long-term Goals (6 Months)
- **Users**: 50,000+ registered
- **Auctions**: 5,000+ monthly
- **Revenue**: ₹1 Crore+ monthly
- **Market Position**: Top 3 in category

---

## 📝 Deployment Commands

### Quick Deployment (Recommended)
```bash
# Make script executable
chmod +x deploy.sh

# Deploy to Vercel + Railway
./deploy.sh production vercel railway

# Deploy to Netlify + Render
./deploy.sh production netlify render
```

### Manual Deployment
```bash
# Build applications
npm run build          # Frontend
cd backend && npm run build && cd ..

# Deploy backend
railway login
railway deploy

# Deploy frontend
vercel --prod
```

---

## ✅ Final Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Payment gateway configured
- [ ] Domain DNS configured
- [ ] SSL certificates enabled
- [ ] Monitoring tools set up
- [ ] Security policies configured
- [ ] Backup systems enabled
- [ ] Emergency procedures documented
- [ ] Team notified of launch

---

*QuickMela Production Deployment Guide v1.0*
