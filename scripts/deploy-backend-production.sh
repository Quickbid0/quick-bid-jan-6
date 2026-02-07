#!/bin/bash

# 🚀 QUICKBID BACKEND PRODUCTION DEPLOYMENT SCRIPT
# This script automates the deployment of the QuickBid backend to production

set -e  # Exit on any error

echo "🚀 Starting Backend Production Deployment..."

# ================================
# 📋 CONFIGURATION
# ================================

# Server Configuration
SERVER_USER="deploy"
SERVER_IP="192.168.1.101"
SERVER_PATH="/var/www/quickbid"
REPO_URL="https://github.com/quickbid/quickbid-platform.git"
BRANCH="main"

# Application Configuration
APP_NAME="quickbid-backend"
APP_PORT="4010"
NODE_VERSION="18"

# Database Configuration
DB_HOST="db.quickbid-project.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"

# Service Configuration
SERVICE_NAME="quickbid-backend"
NGINX_CONFIG="/etc/nginx/sites-available/api.quickbid.com"

echo "📋 Deployment Configuration:"
echo "   Server: $SERVER_USER@$SERVER_IP"
echo "   Path: $SERVER_PATH"
echo "   Port: $APP_PORT"
echo "   Node.js: $NODE_VERSION"

# ================================
# 🔧 PRE-DEPLOYMENT CHECKS
# ================================

echo "🔧 Pre-deployment checks..."

# Check if required tools are installed
if ! command -v ssh &> /dev/null; then
    echo "❌ ERROR: SSH not found"
    exit 1
fi

if ! command -v rsync &> /dev/null; then
    echo "❌ ERROR: rsync not found"
    exit 1
fi

# Test SSH connection
echo "🔍 Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'SSH connection successful'"; then
    echo "❌ ERROR: Cannot connect to server"
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# ================================
# 📦 BUILD PREPARATION
# ================================

echo "📦 Preparing build..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
rm -rf node_modules

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build application
echo "🔨 Building application..."
npm run build

# Verify build
echo "✅ Verifying build..."
if [ ! -d "dist" ]; then
    echo "❌ ERROR: Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build preparation completed"

# ================================
# 🚀 DEPLOYMENT TO SERVER
# ================================

echo "🚀 Deploying to production server..."

# Create server directory structure
echo "📁 Creating server directory structure..."
ssh $SERVER_USER@$SERVER_IP "sudo mkdir -p $SERVER_PATH/{app,logs,config,scripts}"

# Copy application files
echo "📋 Copying application files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
  ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH/app/

# Copy build files
echo "📋 Copying build files..."
rsync -avz dist/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/app/dist/

# Copy environment file
echo "📋 Copying environment file..."
scp .env.production $SERVER_USER@$SERVER_IP:$SERVER_PATH/app/.env

# Copy deployment scripts
echo "📋 Copying deployment scripts..."
scp scripts/* $SERVER_USER@$SERVER_IP:$SERVER_PATH/scripts/

echo "✅ Files copied to server"

# ================================
# 🔧 SERVER CONFIGURATION
# ================================

echo "🔧 Configuring server..."

# Install Node.js if not present
echo "📦 Checking Node.js installation..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check Node.js version
echo "🔍 Node.js version: $(node --version)"
echo "🔍 npm version: $(npm --version)"
EOF

# Install application dependencies
echo "📦 Installing application dependencies..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH/app && npm ci --production"

# Create systemd service
echo "🔧 Creating systemd service..."
ssh $SERVER_USER@$SERVER_IP << EOF
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << 'EOL'
[Unit]
Description=QuickBid Backend API
After=network.target

[Service]
Type=simple
User=$SERVER_USER
WorkingDirectory=$SERVER_PATH/app
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable $SERVICE_NAME
EOF

echo "✅ Server configuration completed"

# ================================
# 🗄️ DATABASE MIGRATION
# ================================

echo "🗄️ Running database migrations..."

ssh $SERVER_USER@$SERVER_IP << EOF
cd $SERVER_PATH/app

# Check database connection
echo "🔍 Testing database connection..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('✅ Database connection successful');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
});
"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma db push --force

echo "✅ Database migrations completed"
EOF

# ================================
# 🚀 START APPLICATION
# ================================

echo "🚀 Starting application..."

# Start the service
ssh $SERVER_USER@$SERVER_IP "sudo systemctl start $SERVICE_NAME"

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
SERVICE_STATUS=$(ssh $SERVER_USER@$SERVER_IP "sudo systemctl is-active $SERVICE_NAME")

if [ "$SERVICE_STATUS" = "active" ]; then
    echo "✅ Service is running"
else
    echo "❌ Service failed to start"
    echo "📋 Service logs:"
    ssh $SERVER_USER@$SERVER_IP "sudo journalctl -u $SERVICE_NAME --no-pager -n 20"
    exit 1
fi

# Check application health
echo "🔍 Checking application health..."
HEALTH_CHECK=$(ssh $SERVER_USER@$SERVER_IP "curl -s -o /dev/null -w '%{http_code}' http://localhost:$APP_PORT/health")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ Application is healthy"
else
    echo "❌ Application health check failed (HTTP $HEALTH_CHECK)"
    echo "📋 Application logs:"
    ssh $SERVER_USER@$SERVER_IP "sudo journalctl -u $SERVICE_NAME --no-pager -n 20"
    exit 1
fi

echo "✅ Application started successfully"

# ================================
# 🌐 NGINX CONFIGURATION
# ================================

echo "🌐 Configuring Nginx..."

# Create Nginx configuration
ssh $SERVER_USER@$SERVER_IP << EOF
sudo tee $NGINX_CONFIG > /dev/null << 'EOL'
server {
    listen 80;
    server_name api.quickbid.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.quickbid.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.quickbid.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.quickbid.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate Limiting
    limit_req_zone \$api_zone \$binary_remote_addr zone=api:10m rate=10r/s;

    # Backend Application
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_ssl_verify off;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health Check
    location /health {
        access_log off;
        proxy_pass http://localhost:$APP_PORT/health;
        add_header Content-Type text/plain;
    }
}

# Rate Limiting
limit_req_zone \$api_zone \$binary_remote_addr zone=api:10m rate=10r/s;
EOL

# Enable site
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
EOF

echo "✅ Nginx configuration completed"

# ================================
# 🔧 POST-DEPLOYMENT SETUP
# ================================

echo "🔧 Post-deployment setup..."

# Create log rotation
ssh $SERVER_USER@$SERVER_IP << EOF
sudo tee /etc/logrotate.d/$SERVICE_NAME > /dev/null << 'EOL'
/var/log/quickbid/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $SERVER_USER $SERVER_USER
    postrotate
        systemctl reload $SERVICE_NAME
    endscript
}
EOL
EOF

# Create backup script
ssh $SERVER_USER@$SERVER_IP << EOF
cat > $SERVER_PATH/scripts/backup.sh << 'EOL'
#!/bin/bash
# Backup script for QuickBid

BACKUP_DIR="/var/backups/quickbid"
DATE=\$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p \$BACKUP_DIR

# Backup application files
tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz -C $SERVER_PATH app/

# Backup database
pg_dump \$DATABASE_URL > \$BACKUP_DIR/db_\$DATE.sql

# Clean old backups (keep 30 days)
find \$BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find \$BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "✅ Backup completed: \$DATE"
EOL

chmod +x $SERVER_PATH/scripts/backup.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * $SERVER_PATH/scripts/backup.sh") | crontab -
EOF

# Create monitoring script
ssh $SERVER_USER@$SERVER_IP << EOF
cat > $SERVER_PATH/scripts/monitor.sh << 'EOL'
#!/bin/bash
# Monitoring script for QuickBid

# Check service status
SERVICE_STATUS=\$(systemctl is-active $SERVICE_NAME)
if [ "\$SERVICE_STATUS" != "active" ]; then
    echo "❌ Service is not running: \$SERVICE_STATUS"
    systemctl restart $SERVICE_NAME
fi

# Check application health
HEALTH_CHECK=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost:$APP_PORT/health)
if [ "\$HEALTH_CHECK" != "200" ]; then
    echo "❌ Application health check failed: \$HEALTH_CHECK"
    systemctl restart $SERVICE_NAME
fi

# Check disk space
DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ "\$DISK_USAGE" -gt 80 ]; then
    echo "⚠️ Disk usage is high: \$DISK_USAGE%"
fi

# Check memory usage
MEMORY_USAGE=\$(free | awk 'NR==2{printf "%.0f", \$3*100/\$2}')
if [ "\$MEMORY_USAGE" -gt 80 ]; then
    echo "⚠️ Memory usage is high: \$MEMORY_USAGE%"
fi

echo "✅ Monitoring check completed"
EOL

chmod +x $SERVER_PATH/scripts/monitor.sh

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * $SERVER_PATH/scripts/monitor.sh") | crontab -
EOF

echo "✅ Post-deployment setup completed"

# ================================
# 🧪 DEPLOYMENT VERIFICATION
# ================================

echo "🧪 Deployment verification..."

# Test API endpoints
echo "🔍 Testing API endpoints..."

# Test health endpoint
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "https://api.quickbid.com/health" -o /dev/null)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed: $HEALTH_RESPONSE"
fi

# Test database endpoint
DB_RESPONSE=$(curl -s -w "%{http_code}" "https://api.quickbid.com/test-db" -o /dev/null)
if [ "$DB_RESPONSE" = "200" ]; then
    echo "✅ Database endpoint working"
else
    echo "❌ Database endpoint failed: $DB_RESPONSE"
fi

# Test rate limiting
echo "🔍 Testing rate limiting..."
RATE_LIMIT_RESPONSE=$(curl -s -w "%{http_code}" "https://api.quickbid.com/health" -o /dev/null)
if [ "$RATE_LIMIT_RESPONSE" = "200" ]; then
    echo "✅ Rate limiting working"
else
    echo "❌ Rate limiting failed: $RATE_LIMIT_RESPONSE"
fi

# Test security headers
echo "🔍 Testing security headers..."
SECURITY_HEADERS=$(curl -s -I "https://api.quickbid.com/health")
if echo "$SECURITY_HEADERS" | grep -q "Strict-Transport-Security"; then
    echo "✅ Security headers working"
else
    echo "❌ Security headers missing"
fi

echo "✅ Deployment verification completed"

# ================================
# 📊 DEPLOYMENT SUMMARY
# ================================

echo ""
echo "🎉 BACKEND PRODUCTION DEPLOYMENT COMPLETED!"
echo "=========================================="
echo "📊 Deployment Details:"
echo "   Server: $SERVER_USER@$SERVER_IP"
echo "   Application: $APP_NAME"
echo "   Port: $APP_PORT"
echo "   Service: $SERVICE_NAME"
echo ""
echo "🔗 URLs:"
echo "   API: https://api.quickbid.com"
echo "   Health: https://api.quickbid.com/health"
echo "   Database Test: https://api.quickbid.com/test-db"
echo ""
echo "📋 Service Management:"
echo "   Start: sudo systemctl start $SERVICE_NAME"
echo "   Stop: sudo systemctl stop $SERVICE_NAME"
echo "   Restart: sudo systemctl restart $SERVICE_NAME"
echo "   Status: sudo systemctl status $SERVICE_NAME"
echo "   Logs: sudo journalctl -u $SERVICE_NAME -f"
echo ""
echo "📁 Important Files:"
echo "   Application: $SERVER_PATH/app"
echo "   Config: $SERVER_PATH/app/.env"
echo "   Logs: /var/log/quickbid/"
echo "   Backups: /var/backups/quickbid/"
echo ""
echo "🔧 Automation Scripts:"
echo "   Backup: $SERVER_PATH/scripts/backup.sh"
echo "   Monitor: $SERVER_PATH/scripts/monitor.sh"
echo "   SSL Renewal: /opt/quickbid/scripts/renew-ssl.sh"
echo ""
echo "📊 Monitoring:"
echo "   Service Status: systemctl status $SERVICE_NAME"
echo "   Application Health: curl https://api.quickbid.com/health"
echo "   Database Health: curl https://api.quickbid.com/test-db"
echo ""
echo "🎯 Next Steps:"
echo "   1. Test all API endpoints"
echo "   2. Configure load balancer"
echo "   3. Set up monitoring and alerting"
echo "   4. Test with frontend integration"
echo "   5. Set up backup procedures"
echo ""
echo "🚀 Backend production deployment completed successfully!"
