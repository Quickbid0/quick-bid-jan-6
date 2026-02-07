#!/bin/bash

# 🚀 QUICKBID AUCTION PLATFORM - PRODUCTION DEPLOYMENT SCRIPT
# Automated production deployment with health checks and rollback capability

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE VALUES
DOMAIN="yourdomain.com"
BACKEND_URL="https://api.yourdomain.com"
FRONTEND_URL="https://yourdomain.com"
BACKEND_PORT="4010"
NODE_ENV="production"

# Log file
LOG_FILE="/var/log/quickbid-deploy-$(date +%Y%m%d-%H%M%S).log"

# Function to log messages
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to perform health check
health_check() {
    local service="$1"
    local url="$2"
    
    log_message "INFO" "Performing health check for $service"
    
    if curl -f --max-time 10 "$url" >/dev/null 2>&1; then
        log_message "SUCCESS" "$service is healthy ($url)"
        echo -e "${GREEN}✅ $service: HEALTHY${NC}"
        return 0
    else
        log_message "ERROR" "$service is not responding ($url)"
        echo -e "${RED}❌ $service: UNHEALTHY${NC}"
        return 1
    fi
}

# Function to backup current state
backup_current_state() {
    log_message "INFO" "Creating backup of current state"
    
    local backup_dir="/backup/quickbid-pre-deploy-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup current running processes
    if command_exists pm2; then
        pm2 save > "$backup_dir/pm2-snapshot.json"
        log_message "INFO" "PM2 snapshot saved"
    fi
    
    # Backup current database schema
    if [ -d "prisma" ]; then
        npx prisma db push --schema-only > "$backup_dir/schema-backup.sql"
        log_message "INFO" "Database schema backed up"
    fi
    
    # Backup configuration files
    cp .env "$backup_dir/.env.backup"
    cp ecosystem.config.js "$backup_dir/ecosystem.config.js.backup" 2>/dev/null
    
    log_message "SUCCESS" "Backup completed: $backup_dir"
}

# Function to rollback deployment
rollback_deployment() {
    log_message "CRITICAL" "ROLLBACK INITIATED"
    echo ""
    echo -e "${RED}🚨 EMERGENCY ROLLBACK${NC}"
    echo "=================================="
    
    # Find most recent backup
    local backup_dir=$(ls -t /backup/quickbid-pre-deploy-* | head -1)
    
    if [ -z "$backup_dir" ]; then
        log_message "ERROR" "No backup found for rollback"
        echo -e "${RED}❌ No backup found for rollback${NC}"
        return 1
    fi
    
    log_message "INFO" "Rolling back to: $backup_dir"
    
    # Restore configuration
    if [ -f "$backup_dir/.env.backup" ]; then
        cp "$backup_dir/.env.backup" .env
        log_message "INFO" "Environment configuration restored"
    fi
    
    # Restart services with backup configuration
    if command_exists pm2; then
        if [ -f "$backup_dir/ecosystem.config.js.backup" ]; then
            cp "$backup_dir/ecosystem.config.js.backup" ecosystem.config.js
        fi
        
        pm2 reload ecosystem.config.js --env production
        log_message "INFO" "Services restarted with backup configuration"
    fi
    
    # Wait for services to start
    log_message "INFO" "Waiting for services to start..."
    sleep 10
    
    # Verify rollback
    if health_check "Backend" "$BACKEND_URL/api/health"; then
        log_message "SUCCESS" "Rollback completed successfully"
        echo -e "${GREEN}✅ ROLLBACK COMPLETED${NC}"
    else
        log_message "ERROR" "Rollback verification failed"
        echo -e "${RED}❌ ROLLBACK FAILED${NC}"
        return 1
    fi
}

# Function to deploy backend
deploy_backend() {
    log_message "INFO" "Starting backend deployment"
    echo -e "${YELLOW}🔥 DEPLOYING BACKEND${NC}"
    
    # Navigate to backend directory
    cd backend || exit 1
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log_message "INFO" "Installing backend dependencies"
        npm ci
    fi
    
    # Run database migrations
    log_message "INFO" "Running database migrations"
    if command_exists npx; then
        npx prisma migrate deploy
    fi
    
    # Build application
    log_message "INFO" "Building backend application"
    npm run build
    
    # Check if PM2 is installed
    if ! command_exists pm2; then
        log_message "INFO" "Installing PM2"
        npm install -g pm2
    fi
    
    # Create or update PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'quickbid-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: '$NODE_ENV',
      PORT: $BACKEND_PORT
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF
    
    # Stop existing processes
    log_message "INFO" "Stopping existing processes"
    pm2 stop ecosystem.config.js 2>/dev/null || true
    
    # Start application
    log_message "INFO" "Starting backend application"
    pm2 start ecosystem.config.js --env production
    
    # Wait for application to start
    log_message "INFO" "Waiting for backend to start..."
    sleep 15
    
    # Health check
    if health_check "Backend" "$BACKEND_URL/api/health"; then
        log_message "SUCCESS" "Backend deployed successfully"
        echo -e "${GREEN}✅ BACKEND DEPLOYED${NC}"
        return 0
    else
        log_message "ERROR" "Backend deployment failed"
        echo -e "${RED}❌ BACKEND DEPLOYMENT FAILED${NC}"
        return 1
    fi
}

# Function to deploy frontend
deploy_frontend() {
    log_message "INFO" "Starting frontend deployment"
    echo -e "${YELLOW}🔥 DEPLOYING FRONTEND${NC}"
    
    # Navigate to frontend directory
    cd frontend || exit 1
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log_message "INFO" "Installing frontend dependencies"
        npm ci
    fi
    
    # Build application
    log_message "INFO" "Building frontend application"
    npm run build
    
    # Check if Vercel CLI is installed
    if ! command_exists vercel; then
        log_message "INFO" "Installing Vercel CLI"
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    log_message "INFO" "Deploying frontend to Vercel"
    vercel --prod --confirm
    
    # Wait for deployment to complete
    log_message "INFO" "Waiting for frontend deployment..."
    sleep 30
    
    # Health check
    if health_check "Frontend" "$FRONTEND_URL"; then
        log_message "SUCCESS" "Frontend deployed successfully"
        echo -e "${GREEN}✅ FRONTEND DEPLOYED${NC}"
        return 0
    else
        log_message "ERROR" "Frontend deployment failed"
        echo -e "${RED}❌ FRONTEND DEPLOYMENT FAILED${NC}"
        return 1
    fi
}

# Function to perform post-deployment verification
post_deployment_verification() {
    log_message "INFO" "Starting post-deployment verification"
    echo -e "${BLUE}🔍 POST-DEPLOYMENT VERIFICATION${NC}"
    echo "=================================="
    
    local verification_passed=true
    
    # Check frontend
    if ! health_check "Frontend" "$FRONTEND_URL"; then
        verification_passed=false
    fi
    
    # Check backend
    if ! health_check "Backend" "$BACKEND_URL/api/health"; then
        verification_passed=false
    fi
    
    # Check API endpoints
    if ! health_check "Products API" "$BACKEND_URL/api/products"; then
        verification_passed=false
    fi
    
    if ! health_check "Auctions API" "$BACKEND_URL/api/auctions"; then
        verification_passed=false
    fi
    
    # Check wallet API
    if ! health_check "Wallet API" "$BACKEND_URL/api/wallet/balance"; then
        verification_passed=false
    fi
    
    if [ "$verification_passed" = true ]; then
        log_message "SUCCESS" "Post-deployment verification passed"
        echo -e "${GREEN}✅ ALL SYSTEMS HEALTHY${NC}"
    else
        log_message "ERROR" "Post-deployment verification failed"
        echo -e "${RED}❌ SOME SYSTEMS UNHEALTHY${NC}"
    fi
    
    return $([ "$verification_passed" = true ] && echo 0 || echo 1)
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 QUICKBID AUCTION PLATFORM - PRODUCTION DEPLOYMENT${NC}"
    echo "=================================================="
    echo "Domain: $DOMAIN"
    echo "Environment: $NODE_ENV"
    echo "Backend URL: $BACKEND_URL"
    echo "Frontend URL: $FRONTEND_URL"
    echo ""
    
    # Check prerequisites
    log_message "INFO" "Checking deployment prerequisites"
    
    local prerequisites_met=true
    
    # Check if directories exist
    if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        prerequisites_met=false
        log_message "ERROR" "Backend or frontend directory not found"
    fi
    
    # Check if git is available
    if ! command_exists git; then
        prerequisites_met=false
        log_message "ERROR" "Git is not available"
    fi
    
    # Check if curl is available
    if ! command_exists curl; then
        prerequisites_met=false
        log_message "ERROR" "Curl is not available"
    fi
    
    if [ "$prerequisites_met" = false ]; then
        log_message "ERROR" "Prerequisites not met"
        echo -e "${RED}❌ PREREQUISITES NOT MET${NC}"
        exit 1
    fi
    
    log_message "SUCCESS" "Prerequisites met"
    echo -e "${GREEN}✅ PREREQUISITES MET${NC}"
    echo ""
    
    # Create backup
    backup_current_state
    
    # Deploy backend
    if ! deploy_backend; then
        log_message "ERROR" "Backend deployment failed"
        echo -e "${RED}❌ BACKEND DEPLOYMENT FAILED${NC}"
        exit 1
    fi
    
    # Deploy frontend
    if ! deploy_frontend; then
        log_message "ERROR" "Frontend deployment failed"
        echo -e "${RED}❌ FRONTEND DEPLOYMENT FAILED${NC}"
        exit 1
    fi
    
    # Post-deployment verification
    if ! post_deployment_verification; then
        log_message "ERROR" "Post-deployment verification failed"
        echo -e "${RED}❌ DEPLOYMENT VERIFICATION FAILED${NC}"
        echo -e "${YELLOW}⚠️ CONSIDERING ROLLBACK${NC}"
        
        read -p "Rollback? (y/N): " -n 1 -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback_deployment
        fi
        exit 1
    fi
    
    log_message "SUCCESS" "Production deployment completed successfully"
    echo ""
    echo -e "${GREEN}🎉 PRODUCTION DEPLOYMENT COMPLETED${NC}"
    echo "=================================="
    echo "Frontend: $FRONTEND_URL"
    echo "Backend: $BACKEND_URL"
    echo "Log file: $LOG_FILE"
    echo ""
    echo -e "${BLUE}NEXT STEPS${NC}"
    echo "1. Monitor application performance"
    echo "2. Check logs regularly: tail -f $LOG_FILE"
    echo "3. Set up monitoring alerts"
    echo "4. Test all user flows"
    echo "5. Monitor database performance"
    echo ""
    echo -e "${GREEN}🚀 QUICKBID PLATFORM IS LIVE!${NC}"
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback_deployment
        ;;
    "health")
        health_check "Backend" "$BACKEND_URL/api/health"
        health_check "Frontend" "$FRONTEND_URL"
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health}"
        echo "  deploy  - Deploy to production"
        echo "  rollback - Rollback to previous version"
        echo "  health   - Check system health"
        exit 1
        ;;
esac
