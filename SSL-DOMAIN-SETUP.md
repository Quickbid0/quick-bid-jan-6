# 🔒 SSL CERTIFICATES AND DOMAIN SETUP GUIDE

## 📋 **OVERVIEW**

This guide covers the complete setup of SSL certificates and domain configuration for QuickBid production deployment.

---

## 🌐 **DOMAIN CONFIGURATION**

### **1. Purchase Domain**
1. **Choose Domain Registrar**
   - GoDaddy (godaddy.com)
   - Namecheap (namecheap.com)
   - Google Domains (domains.google.com)
   - Cloudflare (cloudflare.com)

2. **Register Domain**
   ```
   Domain: quickbid.com
   Alternative: quickbid.in, quickbid.co
   Duration: 1-5 years
   Privacy Protection: Enabled
   Auto-renewal: Enabled
   ```

### **2. Configure DNS Records**
```bash
# A Records (Frontend)
@ IN A 192.168.1.100
www IN A 192.168.1.100

# A Records (Backend API)
api IN A 192.168.1.101
app IN A 192.168.1.101

# CNAME Records (Optional)
cdn IN CNAME cdn.quickbid.com
assets IN CNAME assets.quickbid.com

# MX Records (Email)
@ IN MX 10 mail.quickbid.com
www IN MX 10 mail.quickbid.com

# TXT Records (Verification)
@ IN TXT "v=spf1 include:_spf.google.com ~all"
@ IN TXT "google-site-verification=your-verification-code"

# CAA Records (SSL)
@ IN CAA 0 issue "letsencrypt.org"
@ IN CAA 0 issuewild "letsencrypt.org"
```

---

## 🔒 **SSL CERTIFICATE SETUP**

### **1. Let's Encrypt (Free SSL)**
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate SSL Certificate
sudo certbot certonly --standalone -d quickbid.com -d www.quickbid.com

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### **2. Cloudflare SSL (Recommended)**
1. **Add Domain to Cloudflare**
   - Sign up for Cloudflare account
   - Add domain: quickbid.com
   - Update nameservers to Cloudflare

2. **Configure SSL/TLS**
   - SSL/TLS Encryption Mode: Full (Strict)
   - Opportunistic Encryption: On
   - TLS 1.3: On
   - HSTS: On
   - Minimum TLS Version: 1.2

### **3. Commercial SSL (Optional)**
```bash
# DigiCert
https://www.digicert.com/
- Wildcard SSL: *.quickbid.com
- Organization Validation (OV)
- Extended Validation (EV)

# Comodo
https://www.comodo.com/
- PositiveSSL
- InstantSSL
- EssentialSSL

# GlobalSign
https://www.globalsign.com/
- DomainSSL
- OrganizationSSL
- ExtendedSSL
```

---

## 🚀 **NGINX CONFIGURATION**

### **1. Frontend SSL Configuration**
```nginx
# /etc/nginx/sites-available/quickbid.com
server {
    listen 80;
    server_name quickbid.com www.quickbid.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name quickbid.com www.quickbid.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/quickbid.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quickbid.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
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
        proxy_pass https://api.quickbid.com;
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
```

### **2. Backend API SSL Configuration**
```nginx
# /etc/nginx/sites-available/api.quickbid.com
server {
    listen 80;
    server_name api.quickbid.com;
    return 301 https://$server_name$request_uri;
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
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
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
```

---

## 🔧 **AUTOMATION SCRIPTS**

### **1. SSL Certificate Renewal**
```bash
#!/bin/bash
# /opt/quickbid/scripts/renew-ssl.sh

#!/bin/bash
# SSL Certificate Renewal Script

echo "🔒 Renewing SSL certificates..."

# Renew certificates
certbot renew --quiet --no-self-upgrade

# Reload Nginx
systemctl reload nginx

# Test SSL configuration
echo "🧪 Testing SSL configuration..."
curl -I https://quickbid.com
curl -I https://api.quickbid.com

echo "✅ SSL certificates renewed successfully!"
```

### **2. Domain Health Check**
```bash
#!/bin/bash
# /opt/quickbid/scripts/domain-health.sh

#!/bin/bash
# Domain Health Check Script

DOMAINS=("quickbid.com" "www.quickbid.com" "api.quickbid.com")

for domain in "${DOMAINS[@]}"; do
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
```

---

## 📊 **PERFORMANCE OPTIMIZATION**

### **1. CDN Configuration**
```nginx
# Cloudflare CDN Settings
- Caching Level: Standard
- Browser Cache TTL: 4 hours
- Edge Cache TTL: 2 hours
- Development Mode: Off
- Security Level: High
- SSL/TLS: Full (Strict)
- Brotli: On
- HTTP/3 (with HSTS): On
```

### **2. Asset Optimization**
```bash
# Enable Brotli Compression
gzip on;
gzip_vary on;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Enable Brotli
brotli on;
brotli_vary on;
brotli_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

---

## 🔒 **SECURITY HARDENING**

### **1. Firewall Configuration**
```bash
# UFW Firewall Rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### **2. Fail2Ban Configuration**
```bash
# /etc/fail2ban/jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
findtime = 600
bantime = 3600
```

---

## 🧪 **TESTING AND VALIDATION**

### **1. SSL Testing**
```bash
# SSL Labs Test
curl -s https://www.ssllabs.com/ssltest/analyze.html?d=quickbid.com&hideResults=on

# SSL Certificate Check
openssl s_client -connect quickbid.com:443 -servername quickbid.com

# HTTP Headers Check
curl -I https://quickbid.com
```

### **2. Performance Testing**
```bash
# Page Speed Test
curl -o /dev/null -s -w "Time: %{time_total}s\nSize: %{size_download} bytes\n" https://quickbid.com

# Load Testing
ab -n 1000 -c 10 https://quickbid.com/
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**
- [ ] Domain purchased and configured
- [ ] DNS records updated
- [ ] SSL certificates generated
- [ ] Nginx configured
- [ ] Security headers added
- [ ] Performance optimization enabled

### **Post-Deployment**
- [ ] SSL certificates working
- [ ] HTTPS redirects working
- [ ] Security headers active
- [ ] Performance optimized
- [ ] Monitoring configured
- [ ] Backup procedures in place

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**
```bash
# SSL Certificate Error
sudo certbot certificates
sudo certbot delete --cert-name quickbid.com
sudo certbot certonly --standalone -d quickbid.com

# Nginx Not Starting
sudo nginx -t
sudo systemctl status nginx
sudo journalctl -u nginx -f

# DNS Resolution Issues
nslookup quickbid.com
dig quickbid.com
host quickbid.com

# Mixed Content Issues
curl -I https://quickbid.com | grep -i "content-security-policy"
```

---

## 📞 **SUPPORT RESOURCES**

### **SSL Certificate Providers**
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **Cloudflare**: https://developers.cloudflare.com/ssl/
- **DigiCert**: https://www.digicert.com/support/

### **Domain Registrars**
- **GoDaddy**: https://www.godaddy.com/help/
- **Namecheap**: https://www.namecheap.com/support/
- **Google Domains**: https://support.google.com/domains/

### **Web Server Support**
- **Nginx**: https://www.nginx.org/support/
- **Certbot**: https://certbot.eff.org/docs/
- **Fail2Ban**: https://www.fail2ban.org/wiki/index.php/Main_Page

---

## 🎯 **NEXT STEPS**

1. **Purchase and configure domain**
2. **Generate SSL certificates**
3. **Configure Nginx with SSL**
4. **Set up security headers**
5. **Implement performance optimization**
6. **Configure monitoring and alerts**
7. **Test and validate all configurations**

---

*Last Updated: February 4, 2026*
*Status: Ready for Implementation*
