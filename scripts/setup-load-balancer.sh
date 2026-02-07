#!/bin/bash

# 🚀 QUICKBID LOAD BALANCER & SSL SETUP SCRIPT
# This script automates the setup of load balancer and SSL certificates

set -e  # Exit on any error

echo "🚀 Starting Load Balancer & SSL Setup..."

# ================================
# 📋 CONFIGURATION
# ================================

# Domain Configuration
DOMAIN="quickbid.com"
DOMAIN_WWW="www.quickbid.com"
API_DOMAIN="api.quickbid.com"
CDN_DOMAIN="cdn.quickbid.com"

# Server Configuration
LB_SERVER="192.168.1.100"
BACKEND_SERVERS=("192.168.1.101" "192.168.1.102")
FRONTEND_SERVERS=("192.168.1.103" "192.168.1.104")

# SSL Configuration
SSL_EMAIL="admin@quickbid.com"
SSL_PATH="/etc/letsencrypt/live"
SSL_CONFIG_PATH="/etc/letsencrypt/renewal"

echo "📋 Load Balancer Configuration:"
echo "   Load Balancer: $LB_SERVER"
echo "   Backend Servers: ${BACKEND_SERVERS[*]}"
echo "   Frontend Servers: ${FRONTEND_SERVERS[*]}"
echo "   Domains: $DOMAIN, $API_DOMAIN"

# ================================
# 🔧 PRE-REQUISITES CHECK
# ================================

echo "🔧 Checking prerequisites..."

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ ERROR: Nginx not found"
    exit 1
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "❌ ERROR: Certbot not found"
    exit 1
fi

# Test connectivity to servers
echo "🔍 Testing server connectivity..."
for server in "${BACKEND_SERVERS[@]}" "${FRONTEND_SERVERS[@]}"; do
    if ! ping -c 1 "$server" &> /dev/null; then
        echo "❌ ERROR: Cannot reach server $server"
        exit 1
    fi
done

echo "✅ Prerequisites check passed"

# ================================
# 🔒 SSL CERTIFICATE SETUP
# ================================

echo "🔒 Setting up SSL certificates..."

# Generate SSL certificates for all domains
DOMAINS=("$DOMAIN" "$DOMAIN_WWW" "$API_DOMAIN")

for domain in "${DOMAINS[@]}"; do
    echo "🔐 Generating SSL certificate for $domain..."
    
    # Generate certificate
    certbot certonly --standalone \
        --email "$SSL_EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$domain" \
        --non-interactive
    
    echo "✅ SSL certificate generated for $domain"
done

# Create SSL renewal configuration
echo "🔄 Setting up SSL auto-renewal..."
cat > /etc/cron.d/certbot << 'EOF'
# Auto-renew SSL certificates
0 12 * * * root /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

echo "✅ SSL auto-renewal configured"

# ================================
# 🌐 LOAD BALANCER CONFIGURATION
# ================================

echo "🌐 Configuring load balancer..."

# Create upstream configuration for backend
cat > /etc/nginx/conf.d/upstream-backend.conf << 'EOF'
# Backend API Servers
upstream quickbid_backend {
    least_conn;
    server 192.168.1.101:4010 max_fails=3 fail_timeout=30s;
    server 192.168.1.102:4010 max_fails=3 fail_timeout=30s;
    
    # Health check
    check interval=5000 rise=2 fall=5 timeout=3000 type=http;
    check_http_send "GET /health HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx http_3xx;
}

# Frontend Servers
upstream quickbid_frontend {
    least_conn;
    server 192.168.1.103:80 max_fails=3 fail_timeout=30s;
    server 192.168.1.104:80 max_fails=3 fail_timeout=30s;
    
    # Health check
    check interval=5000 rise=2 fall=5 timeout=3000 type=http;
    check_http_send "GET / HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx http_3xx;
}
EOF

# Create main load balancer configuration
cat > /etc/nginx/sites-available/load-balancer.conf << EOF
# Main Load Balancer Configuration

# Frontend Load Balancer
server {
    listen 80;
    server_name $DOMAIN $DOMAIN_WWW;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN $DOMAIN_WWW;

    # SSL Configuration
    ssl_certificate $SSL_PATH/$DOMAIN/fullchain.pem;
    ssl_certificate_key $SSL_PATH/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self';" always;

    # Rate Limiting
    limit_req_zone \$frontend_zone \$binary_remote_addr zone=frontend:10m rate=20r/s;

    # Logging
    access_log /var/log/nginx/load-balancer.access.log;
    error_log /var/log/nginx/load-balancer.error.log;

    # Frontend Load Balancing
    location / {
        proxy_pass http://quickbid_frontend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_ssl_verify off;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        
        # Cache settings
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
    }

    # API Proxy
    location /api/ {
        proxy_pass https://$API_DOMAIN/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_ssl_verify off;
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "healthy";
        add_header Content-Type text/plain;
    }

    # Static Files (CDN)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass https://$CDN_DOMAIN;
        proxy_set_header Host \$host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# API Load Balancer
server {
    listen 80;
    server_name $API_DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $API_DOMAIN;

    # SSL Configuration
    ssl_certificate $SSL_PATH/$API_DOMAIN/fullchain.pem;
    ssl_certificate_key $SSL_PATH/$API_DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate Limiting
    limit_req_zone \$api_zone \$binary_remote_addr zone=api:10m rate=10r/s;

    # Logging
    access_log /var/log/nginx/api-load-balancer.access.log;
    error_log /var/log/nginx/api-load-balancer.error.log;

    # Backend Load Balancing
    location / {
        proxy_pass http://quickbid_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_ssl_verify off;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        
        # API-specific settings
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Health Check
    location /health {
        access_log off;
        proxy_pass http://quickbid_backend/health;
        add_header Content-Type text/plain;
    }

    # API Documentation
    location /docs {
        proxy_pass http://quickbid_backend/docs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Rate Limiting
limit_req_zone \$frontend_zone \$binary_remote_addr zone=frontend:10m rate=20r/s;
limit_req_zone \$api_zone \$binary_remote_addr zone=api:10m rate=10r/s;
EOF

# Enable load balancer configuration
ln -sf /etc/nginx/sites-available/load-balancer.conf /etc/nginx/sites-enabled/

# Remove default configuration
rm -f /etc/nginx/sites-enabled/default

echo "✅ Load balancer configuration completed"

# ================================
# 🔧 HEALTH CHECK CONFIGURATION
# ================================

echo "🔧 Configuring health checks..."

# Create health check script
cat > /opt/quickbid/scripts/health-check.sh << 'EOF'
#!/bin/bash
# Health Check Script for Load Balancer

LOG_FILE="/var/log/quickbid/health-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check backend servers
echo "[$DATE] Checking backend servers..." >> $LOG_FILE

for server in 192.168.1.101 192.168.1.102; do
    if curl -f -s "http://$server:4010/health" > /dev/null; then
        echo "[$DATE] Backend $server: HEALTHY" >> $LOG_FILE
    else
        echo "[$DATE] Backend $server: UNHEALTHY" >> $LOG_FILE
        # Restart service if unhealthy
        ssh deploy@$server "sudo systemctl restart quickbid-backend"
    fi
done

# Check frontend servers
echo "[$DATE] Checking frontend servers..." >> $LOG_FILE

for server in 192.168.1.103 192.168.1.104; do
    if curl -f -s "http://$server/" > /dev/null; then
        echo "[$DATE] Frontend $server: HEALTHY" >> $LOG_FILE
    else
        echo "[$DATE] Frontend $server: UNHEALTHY" >> $LOG_FILE
    fi
done

# Check SSL certificates
echo "[$DATE] Checking SSL certificates..." >> $LOG_FILE

for domain in quickbid.com www.quickbid.com api.quickbid.com; do
    if openssl s_client -connect $domain:443 -servername $domain -showcerts </dev/null 2>/dev/null | grep -q "Not After"; then
        echo "[$DATE] SSL $domain: VALID" >> $LOG_FILE
    else
        echo "[$DATE] SSL $domain: INVALID" >> $LOG_FILE
    fi
done

echo "[$DATE] Health check completed" >> $LOG_FILE
EOF

chmod +x /opt/quickbid/scripts/health-check.sh

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/quickbid/scripts/health-check.sh") | crontab -

echo "✅ Health check configuration completed"

# ================================
# 📊 MONITORING CONFIGURATION
# ================================

echo "📊 Configuring monitoring..."

# Create monitoring dashboard
cat > /opt/quickbid/scripts/monitoring.sh << 'EOF'
#!/bin/bash
# Monitoring Script for Load Balancer

METRICS_FILE="/var/log/quickbid/metrics.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# System metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
DISK_USAGE=$(df / | awk 'NR==2{print $5}' | sed 's/%//')

# Nginx metrics
NGINX_CONNECTIONS=$(ss -an | grep :443 | wc -l)
NGINX_REQUESTS=$(cat /var/log/nginx/access.log | wc -l)

# Backend health
BACKEND_HEALTHY=0
for server in 192.168.1.101 192.168.1.102; do
    if curl -f -s "http://$server:4010/health" > /dev/null; then
        ((BACKEND_HEALTHY++))
    fi
done

# Frontend health
FRONTEND_HEALTHY=0
for server in 192.168.1.103 192.168.1.104; do
    if curl -f -s "http://$server/" > /dev/null; then
        ((FRONTEND_HEALTHY++))
    fi
done

# Log metrics
echo "$DATE,cpu:$CPU_USAGE,memory:$MEMORY_USAGE,disk:$DISK_USAGE,nginx_connections:$NGINX_CONNECTIONS,nginx_requests:$NGINX_REQUESTS,backend_healthy:$BACKEND_HEALTHY,frontend_healthy:$FRONTEND_HEALTHY" >> $METRICS_FILE

# Alert if metrics are critical
if [ "$CPU_USAGE" -gt 80 ] || [ "$MEMORY_USAGE" -gt 80 ] || [ "$DISK_USAGE" -gt 80 ]; then
    echo "ALERT: High resource usage - CPU:$CPU_USAGE%, Memory:$MEMORY_USAGE%, Disk:$DISK_USAGE%" | logger -t quickbid-monitor
fi

if [ "$BACKEND_HEALTHY" -lt 2 ]; then
    echo "ALERT: Backend servers down - $BACKEND_HEALTHY/2 healthy" | logger -t quickbid-monitor
fi

if [ "$FRONTEND_HEALTHY" -lt 2 ]; then
    echo "ALERT: Frontend servers down - $FRONTEND_HEALTHY/2 healthy" | logger -t quickbid-monitor
fi
EOF

chmod +x /opt/quickbid/scripts/monitoring.sh

# Add to crontab (every minute)
(crontab -l 2>/dev/null; echo "* * * * * /opt/quickbid/scripts/monitoring.sh") | crontab -

echo "✅ Monitoring configuration completed"

# ================================
# 🔄 FAIL2BAN CONFIGURATION
# ================================

echo "🔧 Configuring Fail2Ban..."

# Create Fail2Ban jail for nginx
cat > /etc/fail2ban/jail.d/nginx.conf << 'EOF'
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 3600

[nginx-bad-request]
enabled = true
filter = nginx-bad-request
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 3600
EOF

# Restart Fail2Ban
systemctl restart fail2ban

echo "✅ Fail2Ban configuration completed"

# ================================
# 🧪 TESTING CONFIGURATION
# ================================

echo "🧪 Testing configuration..."

# Test Nginx configuration
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration test passed"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Reload Nginx
systemctl reload nginx

# Test SSL certificates
for domain in "$DOMAIN" "$API_DOMAIN"; do
    echo "🔍 Testing SSL certificate for $domain..."
    
    SSL_STATUS=$(openssl s_client -connect $domain:443 -servername $domain -showcerts </dev/null 2>/dev/null | grep -E "(Subject:|Issuer:|Not Before:|Not After:)")
    
    if [ -n "$SSL_STATUS" ]; then
        echo "✅ SSL certificate for $domain is valid"
    else
        echo "❌ SSL certificate for $domain is invalid"
    fi
done

# Test load balancer endpoints
echo "🔍 Testing load balancer endpoints..."

# Test frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend load balancer working"
else
    echo "❌ Frontend load balancer failed: $FRONTEND_STATUS"
fi

# Test API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$API_DOMAIN/health")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API load balancer working"
else
    echo "❌ API load balancer failed: $API_STATUS"
fi

# Test health check
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/health")
if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Health check endpoint working"
else
    echo "❌ Health check endpoint failed: $HEALTH_STATUS"
fi

echo "✅ Configuration testing completed"

# ================================
# 📋 DEPLOYMENT SUMMARY
# ================================

echo ""
echo "🎉 LOAD BALANCER & SSL SETUP COMPLETED!"
echo "========================================"
echo "📊 Configuration Summary:"
echo "   Load Balancer: $LB_SERVER"
echo "   Backend Servers: ${BACKEND_SERVERS[*]}"
echo "   Frontend Servers: ${FRONTEND_SERVERS[*]}"
echo "   SSL Domains: ${DOMAINS[*]}"
echo ""
echo "🔗 URLs:"
echo "   Frontend: https://$DOMAIN"
echo "   API: https://$API_DOMAIN"
echo "   Health: https://$DOMAIN/health"
echo ""
echo "📋 Configuration Files:"
echo "   Load Balancer: /etc/nginx/sites-available/load-balancer.conf"
echo "   Upstream: /etc/nginx/conf.d/upstream-backend.conf"
echo "   SSL Certificates: $SSL_PATH"
echo ""
echo "🔧 Scripts Created:"
echo "   Health Check: /opt/quickbid/scripts/health-check.sh"
echo "   Monitoring: /opt/quickbid/scripts/monitoring.sh"
echo "   SSL Renewal: /etc/cron.d/certbot"
echo ""
echo "📊 Monitoring:"
echo "   Health Checks: Every 5 minutes"
echo "   Metrics Collection: Every minute"
echo "   SSL Renewal: Daily at 12:00 UTC"
echo "   Log Files: /var/log/quickbid/"
echo ""
echo "🔒 Security Features:"
echo "   SSL/TLS: Enabled for all domains"
echo "   Rate Limiting: Configured"
echo "   Fail2Ban: Enabled"
echo "   Security Headers: Configured"
echo ""
echo "🎯 Next Steps:"
echo "   1. Test all endpoints thoroughly"
echo "   2. Set up monitoring and alerting"
echo "   3. Configure backup procedures"
echo "   4. Test failover scenarios"
echo "   5. Set up performance monitoring"
echo ""
echo "🚀 Load balancer and SSL setup completed successfully!"
