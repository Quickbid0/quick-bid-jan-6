# QuickMela Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [CI/CD Pipeline](#ci-cd-pipeline)
5. [Infrastructure Deployment](#infrastructure-deployment)
6. [Application Deployment](#application-deployment)
7. [Database Setup](#database-setup)
8. [Monitoring Setup](#monitoring-setup)
9. [Security Configuration](#security-configuration)
10. [Performance Testing](#performance-testing)
11. [Go-Live Checklist](#go-live-checklist)
12. [Post-Deployment](#post-deployment)
13. [Troubleshooting](#troubleshooting)
14. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### System Requirements
- **Node.js**: 18.x LTS or higher
- **Docker**: 20.x or higher
- **Docker Compose**: 2.x or higher
- **AWS CLI**: 2.x or higher
- **Terraform**: 1.x or higher
- **PostgreSQL**: 15.x (for local development)
- **Redis**: 7.x (for local development)

### AWS Resources Required
- **EC2/ECS**: For application hosting
- **RDS PostgreSQL**: For database
- **ElastiCache Redis**: For caching
- **S3**: For file storage
- **CloudFront**: For CDN
- **Route 53**: For DNS
- **ACM**: For SSL certificates
- **WAF**: For security
- **CloudWatch**: For monitoring

### Access Requirements
- AWS account with appropriate permissions
- Domain registrar access (for DNS)
- SSL certificate access
- Database admin access
- Monitoring tool access (DataDog, New Relic, etc.)

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/quickmela/quickmela.git
cd quickmela
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Environment Configuration
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment variables (see deployment/production-setup.md)
# Fill in all required values for your environment
```

### 4. Local Development Setup
```bash
# Start local services
docker-compose -f docker-compose.dev.yml up -d

# Run database migrations
cd backend
npm run migration:run

# Seed database (optional)
npm run seed

# Start backend
npm run start:dev

# Start frontend (new terminal)
cd ../frontend
npm run start
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/production.yml
name: Production Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test:ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: |
            backend/dist/
            frontend/build/
            docker-compose.prod.yml
            nginx/

  security-scan:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run security scan
        uses: securecodewarrior/github-action-security-scan@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Run dependency check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'QuickMela'
          path: '.'
          format: 'ALL'

  deploy-staging:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # Staging deployment commands

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.event.inputs.environment == 'production'
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
          # Production deployment commands
```

## Infrastructure Deployment

### 1. AWS Infrastructure Setup
```bash
# Initialize Terraform
cd infrastructure
terraform init

# Plan deployment
terraform plan -var-file=production.tfvars

# Apply infrastructure
terraform apply -var-file=production.tfvars
```

### 2. Domain Configuration
```bash
# Update Route 53 records
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.quickmela.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "YOUR_ALB_DNS_NAME"}]
      }
    }]
  }'
```

### 3. SSL Certificate Setup
```bash
# Request SSL certificate
aws acm request-certificate \
  --domain-name "*.quickmela.com" \
  --validation-method DNS \
  --subject-alternative-names quickmela.com

# Validate certificate (DNS records will be provided)
aws acm describe-certificate --certificate-arn YOUR_CERT_ARN
```

## Application Deployment

### 1. Build Docker Images
```bash
# Build backend image
cd backend
docker build -f Dockerfile.prod -t quickmela/api:latest .

# Build frontend image
cd ../frontend
docker build -f Dockerfile.prod -t quickmela/web:latest .

# Push to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
docker push quickmela/api:latest
docker push quickmela/web:latest
```

### 2. Deploy to ECS
```bash
# Update ECS service
aws ecs update-service \
  --cluster quickmela-production \
  --service quickmela-api-service \
  --force-new-deployment

# Monitor deployment
aws ecs describe-services \
  --cluster quickmela-production \
  --services quickmela-api-service
```

### 3. Database Migration
```bash
# Run database migrations
aws ecs run-task \
  --cluster quickmela-production \
  --task-definition quickmela-migration \
  --overrides '{
    "containerOverrides": [{
      "name": "migration-runner",
      "command": ["npm", "run", "migration:run"]
    }]
  }'
```

## Database Setup

### 1. Create Database
```sql
-- Connect to PostgreSQL
psql -h YOUR_RDS_ENDPOINT -U quickmela_admin -d postgres

-- Create production database
CREATE DATABASE quickmela_prod;
GRANT ALL PRIVILEGES ON DATABASE quickmela_prod TO quickmela_prod;
```

### 2. Run Migrations
```bash
# Run Prisma migrations
cd backend
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 3. Seed Initial Data
```bash
# Run seed script
npm run seed:prod
```

### 4. Backup Configuration
```bash
# Enable automated backups
aws rds modify-db-instance \
  --db-instance-identifier quickmela-prod \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --apply-immediately
```

## Monitoring Setup

### 1. Application Monitoring
```bash
# Deploy monitoring stack
docker-compose -f monitoring/docker-compose.yml up -d

# Configure New Relic
export NEW_RELIC_LICENSE_KEY=YOUR_LICENSE_KEY
export NEW_RELIC_APP_NAME="QuickMela Production"

# Configure DataDog
export DD_API_KEY=YOUR_API_KEY
export DD_APP_KEY=YOUR_APP_KEY
```

### 2. Infrastructure Monitoring
```bash
# CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name "HighCPUUsage" \
  --alarm-description "CPU usage above 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ClusterName,Value=quickmela-production Name=ServiceName,Value=quickmela-api-service \
  --alarm-actions YOUR_SNS_TOPIC_ARN
```

### 3. Log Aggregation
```bash
# Configure CloudWatch Logs
aws logs create-log-group --log-group-name quickmela-production-api
aws logs create-log-group --log-group-name quickmela-production-web

# Subscribe to log groups for monitoring
aws logs put-subscription-filter \
  --log-group-name quickmela-production-api \
  --filter-name "ErrorFilter" \
  --filter-pattern "ERROR" \
  --destination-arn YOUR_LAMBDA_ARN
```

## Security Configuration

### 1. WAF Setup
```bash
# Enable AWS WAF
aws wafv2 associate-web-acl \
  --web-acl-arn YOUR_WAF_ARN \
  --resource-arn YOUR_ALB_ARN
```

### 2. Security Groups
```bash
# Restrict database access
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_DB_SECURITY_GROUP \
  --protocol tcp \
  --port 5432 \
  --source-group YOUR_ECS_SECURITY_GROUP
```

### 3. IAM Roles
```bash
# Create ECS task execution role
aws iam create-role \
  --role-name QuickMelaECSTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'
```

## Performance Testing

### 1. Load Testing Setup
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml --output report.json

# Generate HTML report
artillery report report.json
```

### 2. Performance Benchmarks
```yaml
# performance-test.yml
config:
  target: 'https://api.quickmela.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Load test"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"

scenarios:
  - name: "API Load Test"
    weight: 70
    flow:
      - get:
          url: "/health"
      - post:
          url: "/auth/login"
          json:
            email: "loadtest@example.com"
            password: "password"
      - get:
          url: "/auctions?page=1&limit=20"

  - name: "Auction Activity"
    weight: 30
    flow:
      - get:
          url: "/auctions/live"
      - think: 2
      - get:
          url: "/auctions/{{auctionId}}/bids"
```

### 3. Lighthouse Performance Audit
```bash
# Install Lighthouse
npm install -g lighthouse

# Run performance audit
lighthouse https://app.quickmela.com \
  --output json \
  --output html \
  --output-path ./reports/lighthouse-report.json
```

## Go-Live Checklist

### Pre-Launch (1 week before)
- [ ] All code reviews completed
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Backup and recovery tested
- [ ] Monitoring and alerting configured
- [ ] SSL certificates validated
- [ ] DNS records propagated

### Launch Day (Day 0)
- [ ] Final build deployed to staging
- [ ] Staging smoke tests passed
- [ ] Production deployment initiated
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] CDN cache invalidated
- [ ] DNS switched to production

### Post-Launch (First 24 hours)
- [ ] Real user monitoring active
- [ ] Error tracking alerts configured
- [ ] Performance monitoring dashboards active
- [ ] Customer support team briefed
- [ ] Incident response team on standby
- [ ] Stakeholder notifications sent

### Week 1 Monitoring
- [ ] Daily performance reports generated
- [ ] User feedback collected and analyzed
- [ ] Error rates monitored and addressed
- [ ] Scalability tested with real traffic
- [ ] Cost optimization reviewed

## Post-Deployment

### 1. Performance Monitoring
```bash
# Check application metrics
curl -s https://api.quickmela.com/metrics | jq '.'

# Monitor error rates
aws logs filter-log-events \
  --log-group-name quickmela-production-api \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000
```

### 2. Scaling Configuration
```bash
# Auto-scaling setup
aws application-autoscaling put-scaling-policy \
  --policy-name "api-cpu-scaling" \
  --service-namespace ecs \
  --resource-id service/quickmela-production/quickmela-api-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 300
  }'
```

### 3. Cost Optimization
```bash
# Monitor AWS costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE

# Set up cost alerts
aws budgets create-budget \
  --budget '{
    "BudgetName": "QuickMelaMonthlyBudget",
    "BudgetLimit": {
      "Amount": "5000",
      "Unit": "USD"
    },
    "CostFilters": {
      "Service": ["Amazon Elastic Compute Cloud - Compute", "Amazon Relational Database Service"]
    },
    "TimeUnit": "MONTHLY"
  }'
```

## Troubleshooting

### Common Issues

#### Application Not Starting
```bash
# Check ECS service status
aws ecs describe-services \
  --cluster quickmela-production \
  --services quickmela-api-service

# Check container logs
aws logs tail quickmela-production-api --follow

# Restart service
aws ecs update-service \
  --cluster quickmela-production \
  --service quickmela-api-service \
  --force-new-deployment
```

#### Database Connection Issues
```bash
# Test database connectivity
psql -h YOUR_RDS_ENDPOINT -U quickmela_prod -d quickmela_prod

# Check database logs
aws rds describe-db-log-files \
  --db-instance-identifier quickmela-prod \
  --filename-contains error
```

#### High Error Rates
```bash
# Check recent errors
aws logs filter-log-events \
  --log-group-name quickmela-production-api \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --max-items 100

# Check application metrics
curl -s https://api.quickmela.com/health | jq '.'
```

#### Performance Issues
```bash
# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ClusterName,Value=quickmela-production Name=ServiceName,Value=quickmela-api-service \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --period 300 \
  --statistics Average

# Check RDS performance
aws rds describe-db-instances \
  --db-instance-identifier quickmela-prod \
  --query 'DBInstances[0].{DBInstanceStatus:DBInstanceStatus,DBInstanceClass:DBInstanceClass}'
```

## Rollback Procedures

### Automated Rollback
```bash
#!/bin/bash
# rollback.sh

set -e

echo "🔄 Starting Rollback Process"

# Get previous deployment
PREVIOUS_IMAGE=$(aws ecs describe-task-definition \
  --task-definition quickmela-api \
  --query 'taskDefinition.containerDefinitions[0].image' \
  --output text)

# Find previous stable version (from tags)
PREVIOUS_TAG=$(git tag --sort=-version:refname | sed -n '2p')

if [ -z "$PREVIOUS_TAG" ]; then
  echo "❌ No previous deployment found"
  exit 1
fi

echo "📦 Rolling back to $PREVIOUS_TAG"

# Build and push rollback image
git checkout $PREVIOUS_TAG
docker build -f backend/Dockerfile.prod -t quickmela/api:rollback .
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
docker push quickmela/api:rollback

# Update ECS service
aws ecs update-service \
  --cluster quickmela-production \
  --service quickmela-api-service \
  --task-definition quickmela-api-rollback \
  --force-new-deployment

# Monitor rollback
echo "⏳ Monitoring rollback..."
sleep 60

# Health check
if curl -f https://api.quickmela.com/health >/dev/null 2>&1; then
  echo "✅ Rollback successful"
else
  echo "❌ Rollback failed - manual intervention required"
  exit 1
fi
```

### Emergency Rollback
```bash
# Immediate rollback to last known good state
aws ecs update-service \
  --cluster quickmela-production \
  --service quickmela-api-service \
  --task-definition quickmela-api-stable \
  --force-new-deployment

# Switch traffic back to previous version
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions Type=forward,TargetGroupArn=$PREVIOUS_TARGET_GROUP_ARN
```

## Maintenance Procedures

### Regular Maintenance Tasks
```bash
# Weekly tasks
## Update dependencies
npm audit fix
npm update

## Rotate database credentials
aws secretsmanager update-secret \
  --secret-id quickmela-db-credentials \
  --secret-string '{"username":"newuser","password":"newpass"}'

## Update SSL certificates
certbot renew

# Monthly tasks
## Review and optimize database queries
aws rds describe-db-instances --db-instance-identifier quickmela-prod

## Analyze application performance
npm run lighthouse
npm run performance-test

## Review security logs
aws logs filter-log-events --log-group-name quickmela-production-api --filter-pattern "WARN|ERROR"

# Quarterly tasks
## Full security audit
npm run security-audit

## Disaster recovery test
./scripts/disaster-recovery-test.sh

## Cost optimization review
aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-03-31
```

---

## Support and Contact

### Emergency Contacts
- **DevOps Lead**: devops@quickmela.com | +91-XXXX-XXXXXX
- **Security Team**: security@quickmela.com | +91-XXXX-XXXXXX
- **Infrastructure**: infra@quickmela.com | +91-XXXX-XXXXXX

### Documentation Links
- [API Documentation](https://api.quickmela.com/docs)
- [Runbooks](https://docs.quickmela.com/runbooks)
- [Incident Response](https://docs.quickmela.com/incident-response)
- [Architecture Diagrams](https://docs.quickmela.com/architecture)

### Monitoring Dashboards
- [Grafana](https://monitoring.quickmela.com)
- [DataDog](https://app.datadoghq.com)
- [AWS Console](https://console.aws.amazon.com)
- [New Relic](https://one.newrelic.com)

---

**QuickMela deployment documentation is complete!** 📋

**Production deployment is fully documented and ready!** 🚀

**Enterprise-grade deployment procedures established!** ✅
