# 🚀 LOAD BALANCER & SSL DEPLOYMENT GUIDE

## 📋 **OVERVIEW**

This guide provides comprehensive instructions for setting up a production-grade load balancer with SSL certificates for the QuickBid platform, ensuring high availability, security, and performance.

---

## 🏗️ **LOAD BALANCER ARCHITECTURE**

### **1.1 Infrastructure Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Backend API   │    │   Frontend      │
│   (Nginx)        │───▶│   Servers       │───▶│   Servers       │
│   Port 443/80    │    │   Port 4010     │    │   Port 80       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐            ┌─────▼─────┐         ┌─────▼─────┐
    │  SSL    │            │  Systemd  │         │  Nginx    │
    │  Certs  │            │  Services │         │  Static   │
    └─────────┘            └───────────┘         └───────────┘
```

### **1.2 Server Configuration**

#### **Load Balancer Server**
- **IP**: 192.168.1.100
- **Role**: Primary load balancer
- **Software**: Nginx + SSL
- **Ports**: 80, 443

#### **Backend API Servers**
- **Server 1**: 192.168.1.101 (Primary)
- **Server 2**: 192.168.1.102 (Secondary)
- **Role**: API processing
- **Software**: Node.js + NestJS
- **Ports**: 4010

#### **Frontend Servers**
- **Server 1**: 192.168.1.103 (Primary)
- **Server 2**: 192.168.1.104 (Secondary)
- **Role**: Static file serving
- **Software**: Nginx
- **Ports**: 80

---

## 🔒 **SSL CERTIFICATE SETUP**

### **2.1 SSL Certificate Generation**

#### **Install Certbot**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### **Generate SSL Certificates**
```bash
# Generate certificates for all domains
DOMAINS=("quickbid.com" "www.quickbid.com" "api.quickbid.com")

for domain in "${DOMAINS[@]}"; do
    echo "🔐 Generating SSL certificate for $domain..."
    
    certbot certonly --standalone \
        --email "admin@quickbid.com" \
        --agree-tos \
        --no-eff-email \
        -d "$domain" \
        --non-interactive
done
```

#### **SSL Certificate Locations**
```
/etc/letsencrypt/live/
├── quickbid.com/
│   ├── fullchain.pem
│   ├── privkey.pem
│   └── chain.pem
├── www.quickbid.com/
│   ├── fullchain.pem
│   ├── privkey.pem
│   └── chain.pem
└── api.quickbid.com/
    ├── fullchain.pem
    ├── privkey.pem
    └── chain.pem
```

### **2.2 SSL Auto-Renewal**

#### **Configure Auto-Renewal**
```bash
# Add to crontab
sudo crontab -e

# Add line:
0 12 * * * root /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
```

#### **Test Auto-Renewal**
```bash
# Test renewal process
certbot renew --dry-run

# Check renewal configuration
cat /etc/cron.d/certbot
```

---

## 🌐 **NGINX LOAD BALANCER CONFIGURATION**

### **3.1 Upstream Configuration**

#### **Backend API Upstream**
```nginx
# /etc/nginx/conf.d/upstream-backend.conf
upstream quickbid_backend {
    least_conn;
    server 192.168.1.101:4010 max_fails=3 fail_timeout=30s weight=1;
    server 192.168.1.102:4010 max_fails=3 fail_timeout=30s weight=1;
    
    # Health check configuration
    check interval=5000 rise=2 fall=5 timeout=3000 type=http;
    check_http_send "GET /health HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx http_3xx;
    
    # Session persistence (if needed)
    # ip_hash;
    
    # Keep-alive connections
    keepalive 32;
}
```

#### **Frontend Upstream**
```nginx
# /etc/nginx/conf.d/upstream-frontend.conf
upstream quickbid_frontend {
    least_conn;
    server 192.168.1.103:80 max_fails=3 fail_timeout=30s weight=1;
    server 192.168.1.104:80 max_fails=3 fail_timeout=30s weight=1;
    
    # Health check configuration
    check interval=5000 rise=2 fall=5 timeout=3000 type=http;
    check_http_send "GET / HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx http_3xx;
    
    # Keep-alive connections
    keepalive 32;
}
```

### **3.2 Main Load Balancer Configuration**

#### **Frontend Load Balancer**
```nginx
# /etc/nginx/sites-available/load-balancer.conf
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
    limit_req_zone $frontend_zone $binary_remote_addr zone=frontend:10m rate=20r/s;

    # Logging
    access_log /var/log/nginx/load-balancer.access.log;
    error_log /var/log/nginx/load-balancer.error.log;

    # Frontend Load Balancing
    location / {
        proxy_pass http://quickbid_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
        
        # Compression
        gzip on;
        gzip_vary on;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss;
    }

    # API Proxy
    location /api/ {
        proxy_pass https://api.quickbid.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
        proxy_pass https://cdn.quickbid.com;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### **API Load Balancer**
```nginx
# API Load Balancer
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
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate Limiting
    limit_req_zone $api_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Logging
    access_log /var/log/nginx/api-load-balancer.access.log;
    error_log /var/log/nginx/api-load-balancer.error.log;

    # Backend Load Balancing
    location / {
        proxy_pass http://quickbid_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
        
        # Keep-alive
        proxy_http_version 1.1;
        proxy_set_header Connection "";
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔧 **HEALTH CHECK CONFIGURATION**

### **4.1 Health Check Script**

#### **Automated Health Monitoring**
```bash
#!/bin/bash
# /opt/quickbid/scripts/health-check.sh

LOG_FILE="/var/log/quickbid/health-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Create log directory
mkdir -p /var/log/quickbid

# Check backend servers
echo "[$DATE] Checking backend servers..." >> $LOG_FILE

BACKEND_SERVERS=("192.168.1.101" "192.168.1.102")
for server in "${BACKEND_SERVERS[@]}"; do
    if curl -f -s "http://$server:4010/health" > /dev/null; then
        echo "[$DATE] Backend $server: HEALTHY" >> $LOG_FILE
    else
        echo "[$DATE] Backend $server: UNHEALTHY" >> $LOG_FILE
        # Restart service if unhealthy
        ssh deploy@$server "sudo systemctl restart quickbid-backend" 2>/dev/null || true
    fi
done

# Check frontend servers
echo "[$DATE] Checking frontend servers..." >> $LOG_FILE

FRONTEND_SERVERS=("192.168.1.103" "192.168.1.104")
for server in "${FRONTEND_SERVERS[@]}"; do
    if curl -f -s "http://$server/" > /dev/null; then
        echo "[$DATE] Frontend $server: HEALTHY" >> $LOG_FILE
    else
        echo "[$DATE] Frontend $server: UNHEALTHY" >> $LOG_FILE
    fi
done

# Check SSL certificates
echo "[$DATE] Checking SSL certificates..." >> $LOG_FILE

DOMAINS=("quickbid.com" "www.quickbid.com" "api.quickbid.com")
for domain in "${DOMAINS[@]}"; do
    if openssl s_client -connect $domain:443 -servername $domain -showcerts </dev/null 2>/dev/null | grep -q "Not After"; then
        echo "[$DATE] SSL $domain: VALID" >> $LOG_FILE
    else
        echo "[$DATE] SSL $domain: INVALID" >> $LOG_FILE
    fi
done

echo "[$DATE] Health check completed" >> $LOG_FILE
```

#### **Crontab Configuration**
```bash
# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/quickbid/scripts/health-check.sh") | crontab -
```

### **4.2 Advanced Health Monitoring**

#### **Nginx Health Check Module**
```nginx
# Install nginx-health-check-module
# Add to nginx configuration
upstream quickbid_backend {
    least_conn;
    server 192.168.1.101:4010 max_fails=3 fail_timeout=30s;
    server 192.168.1.102:4010 max_fails=3 fail_timeout=30s;
    
    # Health check
    check interval=5000 rise=2 fall=5 timeout=3000 type=http;
    check_http_send "GET /health HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx http_3xx;
}
```

---

## 📊 **MONITORING & METRICS**

### **5.1 Performance Monitoring**

#### **Monitoring Script**
```bash
#!/bin/bash
# /opt/quickbid/scripts/monitoring.sh

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
```

### **5.2 Log Analysis**

#### **Access Log Analysis**
```bash
# Analyze access logs
#!/bin/bash
# /opt/quickbid/scripts/log-analysis.sh

LOG_FILE="/var/log/nginx/access.log"
DATE=$(date '+%Y-%m-%d')

# Top 10 IP addresses
echo "Top 10 IP addresses:"
awk '{print $1}' $LOG_FILE | sort | uniq -c | sort -nr | head -10

# Top 10 requests
echo "Top 10 requests:"
awk '{print $7}' $LOG_FILE | sort | uniq -c | sort -nr | head -10

# HTTP status codes
echo "HTTP status codes:"
awk '{print $9}' $LOG_FILE | sort | uniq -c | sort -nr

# Response time analysis
echo "Average response time:"
awk '{print $NF}' $LOG_FILE | awk '{sum+=$1; count++} END {print sum/count}'
```

---

## 🔒 **SECURITY CONFIGURATION**

### **6.1 Fail2Ban Configuration**

#### **Nginx Fail2Ban Jails**
```bash
# /etc/fail2ban/jail.d/nginx.conf
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
```

### **6.2 Advanced Security Headers**

#### **Enhanced Security Headers**
```nginx
# Additional security headers
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self';";
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
add_header X-Permitted-Cross-Domain-Policies "none";
add_header X-Download-Options "noopen";
add_header X-Robots-Tag "noindex, nofollow, nosnippet, noarchive";
```

---

## 🔄 **HIGH AVAILABILITY CONFIGURATION**

### **7.1 Active-Passive Setup**

#### **Keepalived Configuration**
```bash
# /etc/keepalived/keepalived.conf
vrrp_script chk_nginx {
    script "/usr/bin/killall -0 nginx"
    interval 2
    weight -2
    fall 3
    rise 2
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 101
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass quickbid123
    }
    virtual_ipaddress {
        192.168.1.100
    }
    track_script {
        chk_nginx
    }
}
```

### **7.2 Database Failover**

#### **Database Connection Pool**
```typescript
// src/config/database.config.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseConfig {
  private readonly connections = [
    'postgresql://primary:password@primary-db:5432/quickbid',
    'postgresql://secondary:password@secondary-db:5432/quickbid'
  ];

  async getConnection() {
    for (const connection of this.connections) {
      try {
        // Try to connect to primary first
        return await this.connect(connection);
      } catch (error) {
        // Try secondary if primary fails
        continue;
      }
    }
    throw new Error('All database connections failed');
  }

  private async connect(connectionString: string) {
    // Database connection logic
    return connection;
  }
}
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### **8.1 Pre-Deployment**
- [ ] Load balancer server provisioned
- [ ] SSL certificates generated
- [ ] Backend servers configured
- [ ] Frontend servers configured
- [ ] Health check endpoints created
- [ ] Monitoring scripts created
- [ ] Security headers configured
- [ ] Fail2Ban configured

### **8.2 Post-Deployment**
- [ ] Load balancer configuration tested
- [ ] SSL certificates verified
- [ ] Health checks working
- [ ] Monitoring active
- [ ] Log rotation configured
- [ ] Auto-renewal configured
- [ ] Failover tested
- [ ] Performance optimized

---

## 🧪 **TESTING PROCEDURES**

### **9.1 Load Testing**

#### **Apache Benchmark**
```bash
# Test frontend load
ab -n 1000 -c 100 https://quickbid.com/

# Test API load
ab -n 1000 -c 50 https://api.quickbid.com/health
```

#### **JMeter Test Plan**
```xml
<!-- JMeter test plan for load testing -->
<TestPlan>
  <ThreadGroup>
    <stringProp name="ThreadGroup.num_threads">100</stringProp>
    <stringProp name="ThreadGroup.ramp_time">10</stringProp>
    <stringProp name="ThreadGroup.duration">60</stringProp>
  </ThreadGroup>
  <HTTPSamplerProxy>
    <stringProp name="HTTPSampler.domain">quickbid.com</stringProp>
    <stringProp name="HTTPSampler.path">/</stringProp>
    <stringProp name="HTTPSampler.method">GET</stringProp>
  </HTTPSamplerProxy>
</TestPlan>
```

### **9.2 Failover Testing**

#### **Manual Failover Test**
```bash
# Stop primary backend server
ssh deploy@192.168.1.101 "sudo systemctl stop quickbid-backend"

# Test if traffic goes to secondary
curl https://api.quickbid.com/health

# Start primary server
ssh deploy@192.168.1.101 "sudo systemctl start quickbid-backend"
```

---

## 🔧 **TROUBLESHOOTING**

### **10.1 Common Issues**

#### **SSL Certificate Issues**
```bash
# Check certificate validity
openssl s_client -connect quickbid.com:443 -servername quickbid.com -showcerts

# Test certificate renewal
certbot renew --dry-run

# Check Nginx SSL configuration
nginx -t | grep ssl
```

#### **Load Balancer Issues**
```bash
# Check Nginx status
systemctl status nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Test upstream servers
curl http://192.168.1.101:4010/health
curl http://192.168.1.102:4010/health
```

#### **Health Check Issues**
```bash
# Check health check script
/opt/quickbid/scripts/health-check.sh

# Check health check logs
tail -f /var/log/quickbid/health-check.log
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **11.1 Caching Configuration**

#### **Nginx Caching**
```nginx
# Proxy cache configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

server {
    location /api/ {
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_key "$scheme$request_method$host$request_uri$is_args$args";
        proxy_cache_bypass $http_pragma $http_authorization;
    }
}
```

### **11.2 Connection Optimization**

#### **Keep-Alive Configuration**
```nginx
# Keep-alive settings
keepalive_timeout 65;
keepalive_requests 100;

# Upstream keep-alive
upstream quickbid_backend {
    keepalive 32;
    server 192.168.1.101:4010;
    server 192.168.1.102:4010;
}
```

---

## 🎯 **NEXT STEPS**

### **12.1 Immediate Actions**
1. **Deploy load balancer** to production
2. **Configure SSL certificates** for all domains
3. **Set up health monitoring** and alerting
4. **Test failover scenarios** thoroughly
5. **Optimize performance** based on metrics

### **12.2 Long-term Planning**
1. **Implement CDN** for static assets
2. **Set up multi-region** deployment
3. **Implement advanced monitoring**
4. **Configure auto-scaling**
5. **Set up disaster recovery**

---

## 🚀 **LOAD BALANCER & SSL DEPLOYMENT READY**

**🎉 Load balancer and SSL deployment guide completed!**

**📊 Status: Ready for implementation**
**🎯 Next: Set up monitoring and alerting**
**🚀 Timeline: On track for Week 2 completion**

---

*Last Updated: February 4, 2026*
*Status: Ready for Implementation*
