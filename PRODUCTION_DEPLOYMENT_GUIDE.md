# QuickMela Production Deployment Guide
# Complete step-by-step deployment instructions for production launch

# ================================
# DEPLOYMENT OVERVIEW
# ================================

# This guide covers the complete production deployment of QuickMela
# including backend, frontend, database, and monitoring setup.

# Target Platform: Railway
# Environment: Production
# Expected Duration: 4-6 hours
# Team Required: 1 DevOps Engineer + 1 Developer

# ================================
# PRE-DEPLOYMENT CHECKLIST
# ================================

# [ ] All code changes committed and tested
# [ ] Environment variables prepared
# [ ] Database schema migrations ready
# [ ] SSL certificates configured
# [ ] Monitoring services set up
# [ ] Backup systems configured
# [ ] Rollback plan documented
# [ ] Emergency contacts notified
# [ ] Go-live checklist completed

# ================================
# PHASE 1: INFRASTRUCTURE SETUP
# ================================

## 1.1 Railway Account Setup

# 1. Create Railway account at https://railway.app
# 2. Set up billing and payment method
# 3. Create new project: "QuickMela-Production"
# 4. Enable production environment

## 1.2 Database Setup

# PostgreSQL Database
railway add postgresql
railway up

# Get database URL from Railway dashboard
# Add to environment variables as DATABASE_URL

# Run initial migration
npx prisma migrate deploy

# Seed production data
npx prisma db seed

## 1.3 Redis Setup

# Redis Cache
railway add redis

# Get Redis URL from Railway dashboard
# Add to environment variables as REDIS_URL

## 1.4 Environment Variables

# Copy .env.production to Railway environment variables
# Or use Railway CLI to set variables

railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set DATABASE_URL=postgresql://...
railway variables set REDIS_URL=rediss://...
railway variables set JWT_SECRET=<strong-random-secret>
railway variables set WHATSAPP_ACCESS_TOKEN=<whatsapp-token>
# ... set all required variables

# ================================
# PHASE 2: APPLICATION DEPLOYMENT
# ================================

## 2.1 Backend Deployment

# Initialize Railway project
railway login
railway link

# Deploy backend
railway up

# Monitor deployment logs
railway logs

# Verify health check
curl https://quickmela-production.up.railway.app/health

## 2.2 Database Migration

# Run Prisma migrations on production
railway run npx prisma migrate deploy

# Verify database connection
railway run npx prisma db push --accept-data-loss

# Seed initial data
railway run npm run seed:production

## 2.3 Frontend Deployment

# Build and deploy frontend (Netlify/Vercel/Railway)
npm run build
npm run preview  # Test build locally first

# For Netlify deployment:
# 1. Connect GitHub repository
# 2. Set build command: npm run build
# 3. Set publish directory: dist
# 4. Configure environment variables
# 5. Set custom domain: quickmela.com

# For Railway frontend deployment:
railway add --name quickmela-frontend
railway up

# ================================
# PHASE 3: EXTERNAL SERVICES SETUP
# ================================

## 3.1 WhatsApp Business API

# 1. Create Meta Business account
# 2. Set up WhatsApp Business API
# 3. Get access token and phone number ID
# 4. Configure webhook URL: https://quickmela-production.up.railway.app/webhooks/whatsapp
# 5. Test webhook with verification token

## 3.2 Payment Gateways

# Razorpay Setup:
# 1. Create production account
# 2. Get API keys
# 3. Configure webhook URL
# 4. Test payment flow

# PayU Setup (if needed):
# 1. Production merchant account
# 2. Configure API credentials
# 3. Set up webhook endpoints

## 3.3 Email Service

# SendGrid Setup:
# 1. Create production account
# 2. Verify domain
# 3. Get API key
# 4. Configure SMTP settings

## 3.4 Monitoring Services

# Sentry Setup:
# 1. Create production project
# 2. Get DSN
# 3. Configure releases
# 4. Set up alerts

# New Relic Setup:
# 1. Create application
# 2. Get license key
# 3. Configure APM
# 4. Set up dashboards

# ================================
# PHASE 4: SECURITY CONFIGURATION
# ================================

## 4.1 SSL/TLS Setup

# Railway provides automatic SSL certificates
# Verify SSL certificate is valid:
curl -I https://quickmela.com

# Should return HTTP/2 200 with proper security headers

## 4.2 Security Headers

# Verify security headers are applied:
curl -I https://quickmela.com

# Expected headers:
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
# - X-XSS-Protection: 1; mode=block
# - Strict-Transport-Security: max-age=31536000
# - Content-Security-Policy: default-src 'self'

## 4.3 CORS Configuration

# Verify CORS is properly configured for production domains
curl -H "Origin: https://quickmela.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api.quickmela.com/api/auth/login

## 4.4 Rate Limiting

# Test rate limiting is working:
for i in {1..15}; do
  curl -s https://api.quickmela.com/api/products > /dev/null &
done

# Should see 429 responses after limit exceeded

# ================================
# PHASE 5: TESTING & VALIDATION
# ================================

## 5.1 Health Checks

# Backend health check
curl https://quickmela-production.up.railway.app/health

# Database health
curl https://quickmela-production.up.railway.app/health/database

# External services health
curl https://quickmela-production.up.railway.app/health/services

## 5.2 API Testing

# Test core APIs
curl https://api.quickmela.com/api/products
curl https://api.quickmela.com/api/auth/register
curl https://api.quickmela.com/api/bids

## 5.3 WhatsApp Integration Test

# Test WhatsApp webhook
curl -X POST https://quickmela-production.up.railway.app/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

## 5.4 Payment Flow Test

# Test payment integration (use test credentials first)
# Test webhook handling
# Verify transaction recording

## 5.5 Load Testing

# Run load tests against production
npm run test:load

# Monitor performance during load test
# Check error rates and response times

# ================================
# PHASE 6: MONITORING & ALERTING
# ================================

## 6.1 Application Monitoring

# Verify Sentry is receiving errors
# Check New Relic APM dashboard
# Confirm logging is working

## 6.2 Business Metrics

# Verify analytics are being collected
# Check Google Analytics setup
# Confirm conversion tracking

## 6.3 Alert Configuration

# Test alert notifications
# Verify email/Slack alerts are working
# Confirm monitoring thresholds

## 6.4 Performance Monitoring

# Check response times
# Monitor error rates
# Verify uptime monitoring

# ================================
# PHASE 7: BACKUP & RECOVERY
# ================================

## 7.1 Database Backups

# Verify automated backups are scheduled
railway backups list

# Test backup restoration (in staging environment)
railway backups restore <backup-id>

## 7.2 Application Backups

# Verify application deployment history
railway deploys list

# Test rollback capability
railway deploys rollback <deploy-id>

## 7.3 Disaster Recovery

# Document recovery procedures
# Test failover scenarios
# Verify backup data integrity

# ================================
# PHASE 8: FINAL VALIDATION
# ================================

## 8.1 Pre-Launch Checklist

# [ ] All environment variables set
# [ ] Database migrations completed
# [ ] SSL certificates valid
# [ ] DNS records propagated
# [ ] CDN configured
# [ ] Monitoring active
# [ ] Alerts configured
# [ ] Backup systems operational

## 8.2 User Journey Testing

# Test complete user flows:
# 1. User registration
# 2. KYC verification
# 3. Product browsing
# 4. Bid placement
# 5. Payment processing
# 6. Auction completion
# 7. WhatsApp notifications

## 8.3 Admin Panel Testing

# Test admin functionalities:
# 1. Launch control center
# 2. Feature flag management
# 3. Campaign management
# 4. User management
# 5. Analytics dashboard
# 6. Emergency controls

## 8.4 Performance Validation

# Run final performance tests:
# - Page load times < 2 seconds
# - API response times < 500ms
# - Error rates < 1%
# - Mobile performance optimized

# ================================
# PHASE 9: GO-LIVE EXECUTION
# ================================

## 9.1 Pre-Launch Activities

# 30 minutes before launch:
# - Final database backup
# - Enable launch mode features
# - Start monitoring closely
# - Notify support team

## 9.2 Launch Execution

# At launch time:
# - Activate launch campaigns
# - Enable public access
# - Monitor error logs
# - Watch performance metrics

## 9.3 Post-Launch Monitoring

# First 24 hours:
# - Monitor error rates
# - Watch user registrations
# - Track payment success rates
# - Monitor server performance

# ================================
# EMERGENCY PROCEDURES
# ================================

## Emergency Rollback

# If critical issues arise:
railway deploys rollback <previous-deploy-id>

# Disable problematic features:
curl -X PUT https://api.quickmela.com/api/feature-flags/emergency-pause \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"enable": true}'

# Communicate with users:
# - Update status page
# - Send email notifications
# - Post on social media

## Contact Information

# Development Team:
# - Lead Developer: [Name] - [Phone] - [Email]
# - DevOps Engineer: [Name] - [Phone] - [Email]

# Emergency Contacts:
# - CEO: [Name] - [Phone] - [Email]
# - CTO: [Name] - [Phone] - [Email]
# - Support Lead: [Name] - [Phone] - [Email]

# ================================
# SUCCESS METRICS
# ================================

# Launch Success Criteria:
# - Zero critical errors in first hour
# - 99% uptime in first 24 hours
# - User registration rate > 100/day
# - Payment success rate > 95%
# - Average response time < 500ms
# - WhatsApp delivery rate > 90%

# ================================
# POST-LAUNCH CHECKLIST
# ================================

# 24 hours after launch:
# [ ] Review error logs and fix issues
# [ ] Optimize performance bottlenecks
# [ ] Update user onboarding flow
# [ ] Send user feedback surveys
# [ ] Plan next feature releases

# 1 week after launch:
# [ ] Complete security audit
# [ ] Performance optimization
# [ ] User behavior analysis
# [ ] Marketing campaign analysis
# [ ] Revenue tracking setup

# ================================
# DOCUMENTATION UPDATES
# ================================

# After successful launch:
# 1. Update API documentation
# 2. Create user guides
# 3. Document known issues
# 4. Update deployment procedures
# 5. Create maintenance schedules

# ================================
# CELEBRATION TIME!
# ================================

# 🎉 If you made it this far, congratulations!
# 🚀 QuickMela is now live in production!
# 🎊 Time to celebrate the successful launch!

# Remember to:
# - Thank the team
# - Share success metrics
# - Plan the next milestones
# - Take some well-deserved rest

# ================================
# SUPPORT & MAINTENANCE
# ================================

# Ongoing Tasks:
# - Monitor error rates and fix bugs
# - Optimize performance based on usage patterns
# - Update security patches
# - Scale infrastructure as needed
# - Collect user feedback and iterate

# Contact: dev@quickmela.com
# Documentation: https://docs.quickmela.com
# Status Page: https://status.quickmela.com
