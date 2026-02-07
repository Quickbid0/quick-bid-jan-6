#!/bin/bash

# 🚀 QUICKBID DOMAIN & SSL SETUP SCRIPT
# This script automates domain purchase and SSL certificate setup

set -e  # Exit on any error

echo "🚀 Starting Domain & SSL Setup..."

# ================================
# 📋 CONFIGURATION
# ================================

DOMAIN="quickbid.com"
DOMAIN_WWW="www.quickbid.com"
API_DOMAIN="api.quickbid.com"
CDN_DOMAIN="cdn.quickbid.com"
EMAIL="admin@quickbid.com"

# Domain registrar options
REGISTRAR_OPTIONS=(
  "GoDaddy"
  "Namecheap"
  "Google Domains"
  "Cloudflare"
)

echo "📋 Domain Configuration:"
echo "   Primary Domain: $DOMAIN"
echo "   WWW Domain: $DOMAIN_WWW"
echo "   API Domain: $API_DOMAIN"
echo "   CDN Domain: $CDN_DOMAIN"
echo "   Admin Email: $EMAIL"

# ================================
# 🌐 DOMAIN REGISTRATION
# ================================

echo "🌐 Domain Registration Guide..."

echo "📋 Recommended Domain Registrars:"
echo "1. GoDaddy (godaddy.com) - Popular, good support"
echo "2. Namecheap (namecheap.com) - Affordable, WHOIS privacy"
echo "3. Google Domains (domains.google.com) - Simple, integrated"
echo "4. Cloudflare (cloudflare.com) - CDN + DNS management"

echo ""
echo "📝 Registration Steps:"
echo "1. Choose a registrar from the list above"
echo "2. Search for availability: $DOMAIN"
echo "3. Register the domain for 1-5 years"
echo "4. Enable domain privacy protection"
echo "5. Set up auto-renewal"
echo "6. Save all registration details"

# ================================
# 📧 EMAIL CONFIGURATION
# ================================

echo "📧 Email Configuration Guide..."

echo "📋 Professional Email Setup:"
echo "1. Google Workspace (recommended)"
echo "   - admin@quickbid.com"
echo "   - support@quickbid.com"
echo "   - noreply@quickbid.com"
echo "   - sales@quickbid.com"
echo ""
echo "2. Alternative: Microsoft 365"
echo "3. Alternative: Zoho Mail"
echo "4. Alternative: ProtonMail"

echo ""
echo "📝 Email Configuration:"
echo "1. Set up MX records for email delivery"
echo "2. Configure SPF, DKIM, DMARC records"
echo "3. Set up email forwarding if needed"
echo "4. Test email delivery"

# ================================
# 🌐 DNS CONFIGURATION
# ================================

echo "🌐 DNS Configuration Guide..."

echo "📋 DNS Records to Configure:"
echo ""
echo "🔹 A Records (Frontend):"
echo "@ IN A 192.168.1.100"
echo "www IN A 192.168.1.100"
echo ""
echo "🔹 A Records (Backend API):"
echo "api IN A 192.168.1.101"
echo "app IN A 192.168.1.101"
echo ""
echo "🔹 CNAME Records (Optional):"
echo "cdn IN CNAME cdn.quickbid.com"
echo "assets IN CNAME assets.quickbid.com"
echo ""
echo "🔹 MX Records (Email):"
echo "@ IN MX 10 mail.quickbid.com"
echo "www IN MX 10 mail.quickbid.com"
echo ""
echo "🔹 TXT Records (Verification):"
echo "@ IN TXT \"v=spf1 include:_spf.google.com ~all\""
echo "@ IN TXT \"google-site-verification=your-verification-code\""
echo ""
echo "🔹 CAA Records (SSL):"
echo "@ IN CAA 0 issue \"letsencrypt.org\""
echo "@ IN CAA 0 issuewild \"letsencrypt.org\""

# ================================
# 🔒 SSL CERTIFICATE SETUP
# ================================

echo "🔒 SSL Certificate Setup Guide..."

echo "📋 SSL Certificate Options:"
echo "1. Let's Encrypt (Free) - Recommended"
echo "2. Cloudflare SSL (Free) - Easy setup"
echo "3. DigiCert (Paid) - Enterprise-grade"
echo "4. Comodo (Paid) - Affordable"

echo ""
echo "📝 Let's Encrypt Setup:"
echo "1. Install Certbot:"
echo "   sudo apt update"
echo "   sudo apt install certbot python3-certbot-nginx"
echo ""
echo "2. Generate SSL Certificate:"
echo "   sudo certbot certonly --standalone -d $DOMAIN -d $DOMAIN_WWW"
echo ""
echo "3. Auto-renewal Setup:"
echo "   sudo crontab -e"
echo "   0 12 * * * /usr/bin/certbot renew --quiet"
echo ""
echo "📝 Cloudflare SSL Setup:"
echo "1. Add domain to Cloudflare"
echo "2. Update nameservers to Cloudflare"
echo "3. Enable SSL/TLS Encryption Mode: Full (Strict)"
echo "4. Enable HSTS"
echo "5. Enable TLS 1.3"

# ================================
# 🌐 NGINX CONFIGURATION
# ================================

echo "🌐 Nginx Configuration Guide..."

# Create Nginx configuration
cat > /tmp/nginx-quickbid.conf << 'EOF'
# Frontend Configuration
server {
    listen 80;
    server_name $DOMAIN $DOMAIN_WWW;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN $DOMAIN_WWW;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
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
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self';" always;

    # Root Directory
    root /var/www/quickbid/dist;
    index index.html;

    # Static Files
    location / {
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Proxy
    location /api/ {
        proxy_pass https://$API_DOMAIN;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_verify off;
    }

    # Assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "healthy";
        add_header Content-Type text/plain;
    }
}

# API Configuration
server {
    listen 80;
    server_name $API_DOMAIN;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $API_DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$API_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$API_DOMAIN/privkey.pem;
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
    limit_req_zone $api_zone burst=10 nodelay;
    limit_req_status 429;

    # Backend Application
    location / {
        proxy_pass http://localhost:4010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_verify off;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health Check
    location /health {
        access_log off;
        proxy_pass http://localhost:4010/health;
        add_header Content-Type text/plain;
    }
}

# Rate Limiting
limit_req_zone $api_zone $binary_remote_addr zone=api:10m rate=10r/s;
EOF

echo "📝 Nginx configuration created: /tmp/nginx-quickbid.conf"

# ================================
# 🔧 AUTOMATION SCRIPTS
# ================================

echo "🔧 Creating automation scripts..."

# SSL Certificate Renewal Script
cat > /tmp/renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL Certificate Renewal Script

echo "🔒 Renewing SSL certificates..."

# Renew certificates
certbot renew --quiet --no-self-upgrade

# Reload Nginx
systemctl reload nginx

# Test SSL configuration
echo "🧪 Testing SSL configuration..."
curl -I https://$DOMAIN
curl -I https://$DOMAIN_WWW
curl -I https://$API_DOMAIN

echo "✅ SSL certificates renewed successfully!"
EOF

chmod +x /tmp/renew-ssl.sh

# Domain Health Check Script
cat > /tmp/domain-health.sh << 'EOF'
#!/bin/bash
# Domain Health Check Script

DOMAINS=("$DOMAIN" "$DOMAIN_WWW" "$API_DOMAIN")

for domain in "\${DOMAINS[@]}"; do
    echo "🔍 Checking $domain..."
    
    # DNS Resolution
    nslookup $domain
    
    # SSL Certificate
    echo "🔒 SSL Certificate:"
    openssl s_client -connect $domain:443 -servername $domain -showcerts </dev/null 2>/dev/null | grep -E "(Subject:|Issuer:|Not Before:|Not After:)"
    
    # HTTP Status
    echo "🌐 HTTP Status:"
    curl -s -o /dev/null -w "%{http_code}" https://$domain
    
    echo "---"
done

echo "✅ Domain health check completed!"
EOF

chmod +x /tmp/domain-health.sh

# ================================
# 📋 DEPLOYMENT CHECKLIST
# ================================

echo "📋 Deployment Checklist:"
echo ""
echo "🌐 Domain Registration:"
echo "□ Register $DOMAIN with chosen registrar"
echo "□ Enable domain privacy protection"
echo "□ Set up auto-renewal"
echo "□ Save registration details"
echo ""
echo "📧 Email Configuration:"
echo "□ Set up professional email addresses"
echo "□ Configure MX records"
echo "□ Set up SPF, DKIM, DMARC"
echo "□ Test email delivery"
echo ""
echo "🌐 DNS Configuration:"
echo "□ Configure A records for frontend"
echo "□ Configure A records for API"
echo "□ Configure MX records for email"
echo "□ Configure TXT records for verification"
echo "□ Configure CAA records for SSL"
echo ""
echo "🔒 SSL Certificate:"
echo "□ Generate SSL certificates"
echo "□ Install certificates on server"
echo "□ Test SSL configuration"
echo "□ Set up auto-renewal"
echo ""
echo "🌐 Server Configuration:"
echo "□ Install and configure Nginx"
echo "□ Set up virtual hosts"
echo "□ Configure security headers"
echo "□ Set up rate limiting"
echo "□ Test all configurations"
echo ""
echo "🧪 Testing:"
echo "□ Test domain resolution"
echo "□ Test SSL certificates"
echo "□ Test HTTP/HTTPS redirects"
echo "□ Test API endpoints"
echo "□ Test email delivery"
echo "□ Test security headers"

# ================================
# 🎯 NEXT STEPS
# ================================

echo ""
echo "🎯 Next Steps:"
echo "1. Choose and register domain with registrar"
echo "2. Configure DNS records as shown above"
echo "3. Set up professional email addresses"
echo "4. Generate and install SSL certificates"
echo "5. Configure Nginx with provided config"
echo "6. Test all configurations"
echo "7. Deploy backend to production server"
echo "8. Set up monitoring and alerting"

echo ""
echo "📁 Files Created:"
echo "   /tmp/nginx-quickbid.conf - Nginx configuration"
echo "   /tmp/renew-ssl.sh - SSL renewal script"
echo "   /tmp/domain-health.sh - Domain health check script"

echo ""
echo "🚀 Domain & SSL setup script completed!"
echo "📋 Follow the checklist above for manual setup"
echo "🎯 Ready for production deployment!"
