# PHASE 1 PRODUCTION DEPLOYMENT EXECUTION
**Ready to Execute:** YES ✓  
**Date:** February 19, 2026  
**Estimated Time:** 45 minutes  

---

## AUTOMATED DEPLOYMENT CHECKLIST

Complete these steps in order to deploy Phase 1 to production.

### ✅ Pre-Deployment (5 minutes)

```bash
# 1. Verify git status is clean
cd /Users/sanieevmusugu/Desktop/quick-bid-jan-6
git status

# 2. Create backup
mkdir -p backups
pg_dump $DATABASE_URL > backups/db_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Verify builds
npm run build | tail -3
cd backend && npm run build 2>&1 | tail -3
cd ..
```

**Checkpoint:** Both builds should show "✓ built in X.XXs" or "Successfully compiled"

---

### ✅ Environment Setup (5 minutes)

```bash
# 1. Set production environment variables (already set)
export NODE_ENV=production
export DATABASE_URL="<prod-database-url>"
export JWT_SECRET="<prod-jwt-secret>"

# 2. Verify Prisma
npx prisma generate
npx prisma validate

# 3. Check database connection
npx prisma db execute "SELECT version()"
```

**Checkpoint:** All commands should execute without errors

---

### ✅ Phase 1 Models Verification (5 minutes)

```bash
# 1. Verify 3 new tables exist in production database
psql $DATABASE_URL -c "
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('toy_metadata', 'youtube_embeds', 'review_replies')
"

# 2. Verify table structure
psql $DATABASE_URL -c "\d toy_metadata"
psql $DATABASE_URL -c "\d youtube_embeds"
psql $DATABASE_URL -c "\d review_replies"

# 3. Count records (should be 0+)
psql $DATABASE_URL -c "
  SELECT 
    'toy_metadata' as table_name, COUNT(*) as row_count FROM toy_metadata
  UNION ALL
  SELECT 'youtube_embeds', COUNT(*) FROM youtube_embeds
  UNION ALL
  SELECT 'review_replies', COUNT(*) FROM review_replies
"
```

**Checkpoint:** All 3 tables should exist with proper structure

---

### ✅ Deployment Package Preparation (5 minutes)

```bash
# 1. Clean old builds
rm -rf dist/ backend/dist/

# 2. Build for production
npm run build
cd backend && npm run build && cd ..

# 3. Create deployment timestamp
DEPLOY_ID=$(date +%Y%m%d_%H%M%S)
mkdir -p backups/deploy_$DEPLOY_ID

# 4. Package files
cp -r dist/ backups/deploy_$DEPLOY_ID/
cp -r backend/dist/ backups/deploy_$DEPLOY_ID/
cp package*.json backups/deploy_$DEPLOY_ID/
cp Dockerfile backups/deploy_$DEPLOY_ID/

echo "Deployment package: backups/deploy_$DEPLOY_ID"
```

**Checkpoint:** dist/ and backend/dist/ folders exist with compiled code

---

### ✅ Code Commit (2 minutes)

```bash
# 1. Stage all changes
git add -A

# 2. Commit deployment
git commit -m "Production Deployment: Phase 1 $(date +%Y-%m-%d_%H:%M:%S)" || true

# 3. Push to repository
git push origin main

# 4. Verify push
git log --oneline -1
```

**Checkpoint:** Last commit shows "Production Deployment: Phase 1"

---

### ✅ Platform-Specific Deployment (20 minutes)

#### **Option A: Railway Platform** (Recommended)

```bash
# 1. Connect to Railway project
railway link

# 2. Set environment variables in Railway dashboard
# DATABASE_URL
# JWT_SECRET  
# NODE_ENV=production

# 3. Trigger deployment
railway up

# 4. Monitor logs
railway logs --tail

# 5. Check status
railway status
```

**Expected Output:** "Build successful" → "Deployment active"

---

#### **Option B: AWS Elastic Beanstalk**

```bash
# 1. Initialize EB CLI
eb init -p node.js-20 quickmela --region us-east-1

# 2. Create environment
eb create quickmela-prod --instance-type t3.small

# 3. Deploy
eb deploy

# 4. Monitor
eb logs
```

**Expected Output:** "Environment update completed successfully"

---

#### **Option C: GCP Cloud Run**

```bash
# 1. Build and push image
gcloud builds submit --tag gcr.io/PROJECT-ID/quickmela:phase1

# 2. Deploy to Cloud Run
gcloud run deploy quickmela \
  --image gcr.io/PROJECT-ID/quickmela:phase1 \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=$DATABASE_URL,JWT_SECRET=$JWT_SECRET

# 3. Check deployment
gcloud run services describe quickmela
```

**Expected Output:** Service URL with "ACTIVE" status

---

#### **Option D: Manual Docker Deployment**

```bash
# 1. Build Docker image
docker build -t quickmela:phase1-prod .

# 2. Tag for registry
docker tag quickmela:phase1-prod your-registry.com/quickmela:latest

# 3. Push to registry
docker push your-registry.com/quickmela:latest

# 4. Deploy on server
ssh user@production-server
docker pull your-registry.com/quickmela:latest
docker run -d \
  --name quickmela-api \
  -p 3000:3000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e JWT_SECRET=$JWT_SECRET \
  -e NODE_ENV=production \
  your-registry.com/quickmela:latest

# 5. Verify
curl http://production-server:3000/health
```

**Expected Output:** Health check response (200 OK)

---

### ✅ Post-Deployment Verification (5 minutes)

```bash
# 1. Test health endpoint
curl https://api.yourdomain.com/health
# Expected: {"status":"ok"}

# 2. Test toy safety endpoint
curl -X POST https://api.yourdomain.com/api/toys/metadata \
  -H "Content-Type: application/json" \
  -d '{
    "productId":"test-001",
    "ageMin":3,
    "ageMax":8,
    "materials":["plastic"],
    "hazards":["sharp_edges"],
    "safetyCompliances":["CE"]
  }'
# Expected: {"success":true,"data":{...}}

# 3. Test YouTube gallery endpoint
curl https://api.yourdomain.com/api/seller/youtube/seller-123
# Expected: [] or array of videos

# 4. Test review reply endpoint
curl https://api.yourdomain.com/api/review/review-123/replies
# Expected: [] or array of replies

# 5. Check logs for errors
# Platform-specific: 
# Railway: railway logs
# AWS: eb logs
# GCP: gcloud run logs read
# Docker: docker logs quickmela-api
```

**Checkpoint:** All 4 endpoints return successful responses (200-201 status)

---

### ✅ Monitoring Setup (5 minutes)

```bash
# Monitor performance metrics
# 1. Set up error tracking (Sentry)
# 2. Set up APM (Datadog/New Relic)
# 3. Set up alerts for:
#    - Error rate > 1%
#    - Response time > 500ms
#    - Database connection failures
#    - CPU usage > 80%
```

---

## ROLLBACK PROCEDURE

If issues occur within 1 hour of deployment:

```bash
# 1. Check error logs
# Look for 5XX errors or connection issues

# 2. Get previous deployment ID
git log --oneline | head -5
PREV_COMMIT=$(git log --oneline -2 | tail -1 | cut -d' ' -f1)

# 3. Rollback database (if schema issue)
# Restore from backup:
psql $DATABASE_URL < backups/db_backup_YYYYMMDD_HHMMSS.sql

# 4. Rollback code
git revert HEAD
git push origin main

# 5. Redeploy previous version
# Platform-specific redeploy commands

# 6. Verify rollback
curl https://api.yourdomain.com/health
```

**Note:** Rollback should take < 10 minutes

---

## SUCCESS CRITERIA

✅ All Phase 1 features working when:

- [ ] Health endpoint returns 200 OK
- [ ] All 10 API endpoints responding
- [ ] Database queries executing <100ms
- [ ] Error rate < 0.1%
- [ ] No failed deployments
- [ ] All 3 new tables populated with schema
- [ ] No critical errors in logs
- [ ] CPU < 40%, Memory < 60%
- [ ] Uptime > 99.9%

---

## DEPLOYMENT TIMELINE

| Step | Duration | Cumulative |
|------|----------|-----------|
| Pre-deployment checks | 5 min | 5 min |
| Environment setup | 5 min | 10 min |
| Models verification | 5 min | 15 min |
| Package preparation | 5 min | 20 min |
| Code commit & push | 2 min | 22 min |
| Platform deployment | 20 min | 42 min |
| Verification | 5 min | 47 min |

**Total: ~45 minutes**

---

## TROUBLESHOOTING

### Build fails
```bash
# Clear cache and rebuild
rm -rf node_modules backend/node_modules
npm install
npm run build
```

### Database connection fails
```bash
# Verify connection string
echo $DATABASE_URL
psql $DATABASE_URL -c "SELECT 1"
```

### Deployment timeout
```bash
# Check service logs
# Increase timeout in platform settings
# Verify resources available
```

### API endpoints not responding
```bash
# Check if service started
ps aux | grep node
# Check logs for errors
# Verify environment variables set
```

---

## SUCCESS! 🎉

When all checkpoints pass, Phase 1 is successfully deployed to production.

**Next Steps:**
1. Notify stakeholders
2. Monitor metrics for 24 hours
3. Gather user feedback
4. Plan Phase 2 features

---

**Ready to Deploy:** YES ✓  
**Automated:** YES ✓  
**Rollback Ready:** YES ✓  

*Execute the steps above to deploy Phase 1 to production*
