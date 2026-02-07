# 🚀 QuickBid Platform - Production Deployment Guide

## 📋 Overview
This guide covers the complete production deployment process for the QuickBid auction platform.

## 🔧 Prerequisites

### Required Services
- **Supabase** - PostgreSQL database with auth
- **Vercel/Netlify** - Frontend hosting
- **Razorpay** - Payment gateway
- **Domain** - Custom domain (optional)

### Required Tools
- Node.js 18+
- npm/yarn
- Git
- Supabase CLI (optional)

## 🗝️ Environment Variables

### Production Environment (.env.production)
```bash
# Authentication
VITE_AUTH_MODE=real
VITE_ENABLE_REAL_AUTH=true
VITE_ENABLE_DEMO_AUTH=false

# Database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
VITE_APP_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com

# Payment Gateway
RAZORPAY_KEY_ID=your-production-key
RAZORPAY_KEY_SECRET=your-production-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Features (MVP Only)
VITE_FEATURE_AI_RECOMMENDATIONS=false
VITE_FEATURE_LIVE_AUCTIONS=true
VITE_FEATURE_BUSINESS_SOLUTIONS=false
```

## 🗄️ Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down project URL and keys

### 2. Apply Database Schema
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Run the SQL from: supabase/migrations/001_initial_schema.sql
```

### 3. Configure Authentication
1. Enable email auth in Supabase
2. Configure redirect URLs
3. Set up SMTP for emails

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### Option 3: Custom Hosting
```bash
# Build for production
npm run build -- --mode production

# Deploy dist/ folder to your hosting provider
```

## 🔧 Backend Setup (Optional)

If you have a separate backend:

```bash
cd backend
npm ci --production
npm run build
npm start
```

## 💳 Payment Gateway Setup

### Razorpay Configuration
1. Create Razorpay account
2. Complete KYC verification
3. Get production API keys
4. Configure webhooks:
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events: `payment.captured`, `payment.failed`

## 🔒 Security Configuration

### SSL/TLS
- Enable HTTPS on your domain
- Configure SSL certificates

### Security Headers
```bash
# Add these headers in your hosting provider
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

### Rate Limiting
- Configure rate limiting on API endpoints
- Limit login attempts
- Protect against DDoS

## 📊 Monitoring Setup

### Error Tracking
```javascript
// Add to your application
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

### Performance Monitoring
- Google Analytics 4
- Vercel Analytics (if using Vercel)
- Custom monitoring dashboard

## 🚀 Automated Deployment

### Using the Deployment Script
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### CI/CD Pipeline
```yaml
# Example GitHub Actions
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🧪 Testing Before Launch

### Pre-Launch Checklist
- [ ] All environment variables set
- [ ] Database schema applied
- [ ] Authentication working
- [ ] Payment gateway configured
- [ ] SSL certificates installed
- [ ] Error tracking enabled
- [ ] Performance monitoring set up

### User Flow Testing
- [ ] User registration
- [ ] User login
- [ ] Product browsing
- [ ] Bid placement
- [ ] Payment processing
- [ ] Admin dashboard

## 📈 Post-Launch

### Monitoring
- Check error rates
- Monitor performance
- Track user metrics
- Review payment success rates

### Maintenance
- Regular database backups
- Security updates
- Performance optimization
- Feature updates

## 🆘 Troubleshooting

### Common Issues
1. **Build fails** - Check environment variables
2. **Auth not working** - Verify Supabase configuration
3. **Payments failing** - Check Razorpay webhooks
4. **Database errors** - Review schema and permissions

### Support
- Check logs in hosting provider
- Review Supabase logs
- Monitor error tracking dashboard

## 📞 Emergency Contacts

### Technical Support
- Email: support@quickbid.com
- Phone: +91-XXXX-XXXXX
- Chat: In-app support

---

## 🎉 Launch Checklist

### Final Verification
- [ ] All tests passing
- [ ] Production environment configured
- [ ] Monitoring systems active
- [ ] Support team ready
- [ ] User documentation updated

### Go Live
1. Update DNS to point to production
2. Verify SSL certificates
3. Test all user flows
4. Monitor system performance
5. Announce launch

**🚀 Ready for production launch!**



