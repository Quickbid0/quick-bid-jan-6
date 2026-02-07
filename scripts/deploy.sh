#!/bin/bash

# QuickBid Platform - Production Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 QuickBid Platform - Production Deployment"
echo "============================================"

# Check if required environment variables are set
check_env_vars() {
    echo "🔍 Checking environment variables..."
    
    required_vars=(
        "VITE_SUPABASE_URL"
        "VITE_SUPABASE_ANON_KEY"
        "VITE_SUPABASE_SERVICE_ROLE_KEY"
        "VITE_API_URL"
        "RAZORPAY_KEY_ID"
        "RAZORPAY_KEY_SECRET"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "   - $var"
        done
        exit 1
    fi
    
    echo "✅ All required environment variables are set"
}

# Build the application
build_app() {
    echo "🔨 Building application for production..."
    
    # Clean previous build
    rm -rf dist/
    
    # Build with production configuration
    npm run build -- --mode production
    
    echo "✅ Application built successfully"
}

# Deploy to hosting (Vercel/Netlify)
deploy_frontend() {
    echo "🌐 Deploying frontend..."
    
    # Check if Vercel CLI is installed
    if command -v vercel &> /dev/null; then
        echo "Deploying to Vercel..."
        vercel --prod
    elif command -v netlify &> /dev/null; then
        echo "Deploying to Netlify..."
        netlify deploy --prod --dir=dist
    else
        echo "❌ Neither Vercel nor Netlify CLI found"
        echo "Please install one of them and try again"
        exit 1
    fi
    
    echo "✅ Frontend deployed successfully"
}

# Setup database
setup_database() {
    echo "🗄️ Setting up database..."
    
    # Check if Supabase CLI is installed
    if command -v supabase &> /dev/null; then
        echo "Applying database migrations..."
        supabase db push
        echo "✅ Database setup completed"
    else
        echo "⚠️  Supabase CLI not found. Please run migrations manually:"
        echo "   1. Go to your Supabase project"
        echo "   2. Run the SQL in supabase/migrations/001_initial_schema.sql"
    fi
}

# Setup backend (if exists)
setup_backend() {
    if [ -d "backend" ]; then
        echo "🔧 Setting up backend..."
        
        cd backend
        
        # Install dependencies
        npm ci --production
        
        # Build backend
        npm run build
        
        echo "✅ Backend setup completed"
        echo "📝 Note: Deploy backend manually to your hosting provider"
        
        cd ..
    fi
}

# Run health checks
health_checks() {
    echo "🏥 Running health checks..."
    
    # Check if frontend is accessible
    if [ ! -z "$VITE_APP_URL" ]; then
        echo "Checking frontend accessibility..."
        if curl -f -s "$VITE_APP_URL" > /dev/null; then
            echo "✅ Frontend is accessible"
        else
            echo "⚠️  Frontend may not be accessible yet"
        fi
    fi
    
    # Check if API is accessible
    if [ ! -z "$VITE_API_URL" ]; then
        echo "Checking API accessibility..."
        if curl -f -s "$VITE_API_URL/health" > /dev/null; then
            echo "✅ API is accessible"
        else
            echo "⚠️  API may not be accessible yet"
        fi
    fi
}

# Main deployment flow
main() {
    echo "Starting deployment process..."
    
    # Check environment variables
    check_env_vars
    
    # Build application
    build_app
    
    # Setup database
    setup_database
    
    # Setup backend
    setup_backend
    
    # Deploy frontend
    deploy_frontend
    
    # Run health checks
    health_checks
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Update your DNS records to point to the frontend"
    echo "   2. Configure your domain SSL certificates"
    echo "   3. Set up monitoring and error tracking"
    echo "   4. Test all user flows"
    echo "   5. Configure payment webhooks"
    echo ""
    echo "🔗 Important URLs:"
    echo "   Frontend: $VITE_APP_URL"
    echo "   API: $VITE_API_URL"
    echo "   Database: $VITE_SUPABASE_URL"
}

# Run main function
main "$@"
