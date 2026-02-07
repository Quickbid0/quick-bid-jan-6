#!/bin/bash

# 🚀 QUICKBID BACKEND SETUP SCRIPT
# ===============================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if required tools are installed
check_prerequisites() {
    echo "🔍 CHECKING PREREQUISITES"
    echo "========================"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js installed: $NODE_VERSION"
    else
        log_error "Node.js not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "npm installed: $NPM_VERSION"
    else
        log_error "npm not installed"
        exit 1
    fi
    
    # Check PostgreSQL
    if command -v psql &> /dev/null; then
        POSTGRES_VERSION=$(psql --version | head -n1)
        log_success "PostgreSQL installed: $POSTGRES_VERSION"
    else
        log_warning "PostgreSQL not found. Please ensure PostgreSQL is installed and running"
    fi
    
    echo ""
}

# Setup backend directory
setup_backend_directory() {
    echo "📁 SETTING UP BACKEND DIRECTORY"
    echo "==============================="
    
    # Create backend directory if it doesn't exist
    if [ ! -d "backend" ]; then
        mkdir -p backend
        log_success "Created backend directory"
    else
        log_info "Backend directory already exists"
    fi
    
    # Copy package.json if it doesn't exist
    if [ ! -f "backend/package.json" ]; then
        cp backend/package.json backend/package.json 2>/dev/null || {
            log_warning "package.json not found in backend directory"
        }
    fi
    
    echo ""
}

# Install dependencies
install_dependencies() {
    echo "📦 INSTALLING DEPENDENCIES"
    echo "=========================="
    
    cd backend
    
    if [ ! -d "node_modules" ]; then
        log_info "Installing Node.js dependencies..."
        npm install
        
        if [ $? -eq 0 ]; then
            log_success "Dependencies installed successfully"
        else
            log_error "Failed to install dependencies"
            exit 1
        fi
    else
        log_info "Dependencies already installed"
    fi
    
    cd ..
    echo ""
}

# Setup database
setup_database() {
    echo "🗄️ SETTING UP DATABASE"
    echo "====================="
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        log_warning "DATABASE_URL not set, using default"
        export DATABASE_URL="postgresql://quickbid:password@localhost:5432/quickbid_db"
    fi
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    cd backend
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        log_success "Prisma client generated"
    else
        log_error "Failed to generate Prisma client"
        exit 1
    fi
    
    # Run database migration
    log_info "Running database migration..."
    npx prisma migrate dev --name init
    
    if [ $? -eq 0 ]; then
        log_success "Database migration completed"
    else
        log_error "Database migration failed"
        exit 1
    fi
    
    cd ..
    echo ""
}

# Setup environment
setup_environment() {
    echo "🔧 SETTING UP ENVIRONMENT"
    echo "========================"
    
    cd backend
    
    # Copy environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success "Environment file created from .env.example"
            log_warning "Please update .env with your actual configuration"
        else
            log_warning ".env.example not found, creating basic .env"
            cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://quickbid:password@localhost:5432/quickbid_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-please"
JWT_EXPIRES_IN="30m"

# Admin User Configuration
ADMIN_EMAIL="admin@quickbid.com"
ADMIN_PASSWORD="secureAdminPassword123!"
ADMIN_NAME="System Administrator"

# Application Configuration
NODE_ENV="development"
PORT=3000
EOF
            log_success "Basic .env file created"
        fi
    else
        log_info "Environment file already exists"
    fi
    
    cd ..
    echo ""
}

# Seed admin user
seed_admin_user() {
    echo "👥 SEEDING ADMIN USER"
    echo "===================="
    
    cd backend
    
    # Check if admin seeding script exists
    if [ -f "../scripts/seed-admin.ts" ]; then
        log_info "Running admin seeding script..."
        npx ts-node ../scripts/seed-admin.ts
        
        if [ $? -eq 0 ]; then
            log_success "Admin user seeded successfully"
        else
            log_error "Admin seeding failed"
            exit 1
        fi
    else
        log_error "Admin seeding script not found"
        exit 1
    fi
    
    cd ..
    echo ""
}

# Verify installation
verify_installation() {
    echo "🔍 VERIFYING INSTALLATION"
    echo "========================"
    
    cd backend
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        log_success "Dependencies installed"
    else
        log_error "Dependencies not found"
        exit 1
    fi
    
    # Check if Prisma client is generated
    if [ -d "node_modules/.prisma" ]; then
        log_success "Prisma client generated"
    else
        log_error "Prisma client not found"
        exit 1
    fi
    
    # Check if environment file exists
    if [ -f ".env" ]; then
        log_success "Environment file exists"
    else
        log_error "Environment file not found"
        exit 1
    fi
    
    # Test build
    log_info "Testing build..."
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "Build successful"
    else
        log_error "Build failed"
        exit 1
    fi
    
    cd ..
    echo ""
}

# Create startup script
create_startup_script() {
    echo "🚀 CREATING STARTUP SCRIPT"
    echo "========================"
    
    cat > start-backend.sh << 'EOF'
#!/bin/bash

# 🚀 QUICKBID BACKEND STARTUP SCRIPT
# =================================

echo "🚀 Starting QuickBid Backend..."
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found"
    exit 1
fi

cd backend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if environment file exists
if [ ! -f ".env" ]; then
    echo "❌ Environment file not found. Please run setup first."
    exit 1
fi

# Start the backend
echo "🔥 Starting backend server..."
npm run start:dev

EOF
    
    chmod +x start-backend.sh
    log_success "Startup script created: start-backend.sh"
    echo ""
}

# Main setup function
main() {
    echo "🚀 QUICKBID BACKEND SETUP"
    echo "========================"
    echo ""
    echo "This script will set up the QuickBid backend with:"
    echo "  • NestJS authentication system"
    echo "  • Prisma database integration"
    echo "  • Admin user seeding"
    echo "  • Production-ready configuration"
    echo ""
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    echo ""
    
    # Run setup steps
    check_prerequisites
    setup_backend_directory
    install_dependencies
    setup_database
    setup_environment
    seed_admin_user
    verify_installation
    create_startup_script
    
    echo "🎉 BACKEND SETUP COMPLETE!"
    echo "========================="
    echo ""
    echo -e "${GREEN}✅ Backend is ready for development!${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Update backend/.env with your actual configuration"
    echo "   2. Ensure PostgreSQL is running"
    echo "   3. Run: ./start-backend.sh"
    echo "   4. Run: ./verify-backend-auth.sh"
    echo ""
    echo "🔗 Backend will be available at: http://localhost:3000"
    echo "📚 API Documentation: http://localhost:3000/api"
    echo ""
    echo "🚀 Ready for frontend integration!"
}

# Run the setup
main
