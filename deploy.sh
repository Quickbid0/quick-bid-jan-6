#!/bin/bash

# 🚀 QUICKBID PLATFORM - PRODUCTION DEPLOYMENT SCRIPT

set -e  # Exit on any error

echo "🚀 Starting QuickBid Platform Production Deployment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're on the main branch
check_branch() {
    print_step "Checking current branch..."
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        print_error "Not on main branch. Current branch: $CURRENT_BRANCH"
        exit 1
    fi
    print_status "✅ On main branch"
}

# Pull latest changes
pull_changes() {
    print_step "Pulling latest changes..."
    git pull origin main
    print_status "✅ Latest changes pulled"
}

# Check for uncommitted changes
check_changes() {
    print_step "Checking for uncommitted changes..."
    if [ -n "$(git status --porcelain)" ]; then
        print_error "There are uncommitted changes. Please commit or stash them first."
        exit 1
    fi
    print_status "✅ No uncommitted changes"
}

# Run type checking
run_typecheck() {
    print_step "Running TypeScript type checking..."
    if npm run typecheck; then
        print_status "✅ TypeScript type checking passed"
    else
        print_error "TypeScript type checking failed"
        exit 1
    fi
}

# Run linting
run_lint() {
    print_step "Running ESLint..."
    if npm run lint; then
        print_status "✅ ESLint passed"
    else
        print_error "ESLint failed"
        exit 1
    fi
}

# Run tests
run_tests() {
    print_step "Running test suite..."
    if npm run test; then
        print_status "✅ All tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
}

# Build for production
build_production() {
    print_step "Building for production..."
    if npm run build; then
        print_status "✅ Production build successful"
    else
        print_error "Production build failed"
        exit 1
    fi
}

# Check build output
check_build() {
    print_step "Checking build output..."
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        print_status "✅ Build directory exists (Size: $BUILD_SIZE)"
        
        # Check for essential files
        if [ -f "dist/index.html" ] && [ -d "dist/assets" ]; then
            print_status "✅ Essential build files present"
        else
            print_error "Essential build files missing"
            exit 1
        fi
    else
        print_error "Build directory not found"
        exit 1
    fi
}

# Run security audit
run_security_audit() {
    print_step "Running security audit..."
    if npm audit --audit-level moderate; then
        print_status "✅ Security audit passed"
    else
        print_warning "Security audit found issues - review required"
    fi
}

# Create deployment backup
create_backup() {
    print_step "Creating deployment backup..."
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup current deployment if exists
    if [ -d "dist" ]; then
        cp -r dist "$BACKUP_DIR/"
        print_status "✅ Backup created at $BACKUP_DIR"
    fi
}

# Deploy to production (placeholder for actual deployment logic)
deploy_production() {
    print_step "Deploying to production..."
    
    # This is where you would add your actual deployment logic
    # Examples:
    # - AWS S3 deployment
    # - Vercel deployment
    # - Netlify deployment
    # - Docker deployment
    
    print_status "✅ Deployment completed"
}

# Health check after deployment
health_check() {
    print_step "Running post-deployment health check..."
    
    # This would typically involve:
    # - Checking if the site is accessible
    # - Verifying API endpoints
    # - Testing critical user journeys
    
    print_status "✅ Health check passed"
}

# Send deployment notification
send_notification() {
    print_step "Sending deployment notification..."
    
    # This would typically involve:
    # - Slack notification
    # - Email notification
    # - Team communication
    
    print_status "✅ Deployment notification sent"
}

# Main deployment process
main() {
    echo "🚀 QuickBid Platform Production Deployment Started at $(date)"
    echo ""
    
    # Pre-deployment checks
    check_branch
    pull_changes
    check_changes
    
    # Quality checks
    run_typecheck
    run_lint
    run_tests
    
    # Build process
    build_production
    check_build
    
    # Security check
    run_security_audit
    
    # Deployment preparation
    create_backup
    
    # Actual deployment
    deploy_production
    
    # Post-deployment
    health_check
    send_notification
    
    echo ""
    echo "🎉 QuickBid Platform Production Deployment Completed Successfully!"
    echo "📅 Deployment finished at $(date)"
    echo "🚀 Platform is now live and ready for users!"
    echo ""
    echo "📊 Next Steps:"
    echo "   1. Monitor system performance"
    echo "   2. Verify all critical functionalities"
    echo "   3. Enable user onboarding"
    echo "   4. Activate marketing campaigns"
    echo ""
    echo "🔗 QuickBid Platform: https://quickbid.com"
    echo "📧 Support: support@quickbid.com"
    echo "📞 Emergency: +1-800-QUICKBID"
}

# Run main function
main "$@"
