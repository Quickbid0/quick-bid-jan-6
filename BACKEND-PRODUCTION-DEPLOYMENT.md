# 🚀 BACKEND PRODUCTION DEPLOYMENT GUIDE

## 📋 **OVERVIEW**

This guide provides comprehensive instructions for deploying the QuickBid backend API to production servers with proper security, monitoring, and scalability considerations.

---

## 🏗️ **DEPLOYMENT ARCHITECTURE**

### **1.1 Infrastructure Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │   Database      │
│   (Nginx)        │───▶│   (Node.js)     │───▶│   (Supabase)    │
│   Port 443/80    │    │   Port 4010     │    │   Port 5432     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐            ┌─────▼─────┐         ┌─────▼─────┐
    │  SSL    │            │  Systemd  │         │  RLS      │
    │  Cert   │            │  Service  │         │  Policies  │
    └─────────┘            └───────────┘         └───────────┘
```

### **1.2 Server Requirements**

#### **Minimum Requirements**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+
- **Network**: 100Mbps

#### **Recommended Requirements**
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Network**: 1Gbps

---

## 🔧 **PRE-DEPLOYMENT PREPARATION**

### **2.1 Server Setup**

#### **Update System**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### **Install Required Packages**
```bash
# Ubuntu/Debian
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y curl wget git nginx certbot python3-certbot-nginx
```

#### **Create Deploy User**
```bash
# Create deploy user
sudo adduser deploy
sudo usermod -aG sudo deploy

# Switch to deploy user
sudo su - deploy
```

#### **Setup SSH Keys**
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "deploy@quickbid.com"

# Copy public key to server
ssh-copy-id deploy@your-server-ip
```

### **2.2 Node.js Installation**

#### **Install Node.js 18**
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### **Install PM2 (Alternative to Systemd)**
```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'quickbid-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4010
    },
    error_file: '/var/log/quickbid/error.log',
    out_file: '/var/log/quickbid/out.log',
    log_file: '/var/log/quickbid/combined.log',
    time: true
  }]
};
EOF
```

---

## 🚀 **DEPLOYMENT PROCESS**

### **3.1 Automated Deployment**

#### **Run Deployment Script**
```bash
# Make script executable
chmod +x scripts/deploy-backend-production.sh

# Run deployment
./scripts/deploy-backend-production.sh
```

#### **Manual Deployment Steps**
```bash
# 1. Clone repository
git clone https://github.com/quickbid/quickbid-platform.git
cd quickbid-platform

# 2. Install dependencies
npm ci --production

# 3. Build application
npm run build

# 4. Copy to server
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ deploy@your-server:/var/www/quickbid/

# 5. Install production dependencies
ssh deploy@your-server "cd /var/www/quickbid && npm ci --production"

# 6. Set up environment
scp .env.production deploy@your-server:/var/www/quickbid/.env

# 7. Start service
ssh deploy@your-server "sudo systemctl start quickbid-backend"
```

### **3.2 Environment Configuration**

#### **Production Environment Variables**
```bash
# /var/www/quickbid/.env
NODE_ENV=production
PORT=4010

# Database
DATABASE_URL=postgresql://postgres:[password]@db.project-id.supabase.co:5432/postgres
SUPABASE_URL=https://project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key

# Payment
RAZORPAY_KEY_ID=rzp_live_your-production-key
RAZORPAY_KEY_SECRET=your-production-secret

# Communication
TWILIO_ACCOUNT_SID=your-production-account-sid
TWILIO_AUTH_TOKEN=your-production-auth-token

# Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## 🔧 **SERVICE CONFIGURATION**

### **4.1 Systemd Service**

#### **Create Service File**
```bash
# /etc/systemd/system/quickbid-backend.service
[Unit]
Description=QuickBid Backend API
After=network.target

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/var/www/quickbid
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=quickbid-backend

[Install]
WantedBy=multi-user.target
```

#### **Enable and Start Service**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable quickbid-backend

# Start service
sudo systemctl start quickbid-backend

# Check status
sudo systemctl status quickbid-backend
```

### **4.2 PM2 Configuration (Alternative)**

#### **Start with PM2**
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

---

## 🌐 **NGINX CONFIGURATION**

### **5.1 API Server Configuration**

#### **Create Nginx Config**
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
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
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
    limit_req_zone $api_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Logging
    access_log /var/log/nginx/api.quickbid.com.access.log;
    error_log /var/log/nginx/api.quickbid.com.error.log;

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
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Health Check
    location /health {
        access_log off;
        proxy_pass http://localhost:4010/health;
        add_header Content-Type text/plain;
    }

    # API Documentation
    location /docs {
        proxy_pass http://localhost:4010/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Rate Limiting
limit_req_zone $api_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

#### **Enable Site**
```bash
# Enable site
sudo ln -sf /etc/nginx/sites-available/api.quickbid.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 **SECURITY CONFIGURATION**

### **6.1 Firewall Setup**

#### **UFW Configuration**
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application port (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 4010

# Check status
sudo ufw status
```

#### **Fail2Ban Configuration**
```bash
# Install fail2ban
sudo apt install fail2ban

# Create jail configuration
sudo tee /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5
EOF

# Restart fail2ban
sudo systemctl restart fail2ban
```

### **6.2 SSL Configuration**

#### **Generate SSL Certificate**
```bash
# Generate certificate
sudo certbot certonly --standalone -d api.quickbid.com

# Or use Nginx plugin
sudo certbot --nginx -d api.quickbid.com
```

#### **Auto-Renewal Setup**
```bash
# Add to crontab
sudo crontab -e

# Add line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 **MONITORING & LOGGING**

### **7.1 Log Management**

#### **Configure Log Rotation**
```bash
# Create logrotate config
sudo tee /etc/logrotate.d/quickbid-backend << 'EOF'
/var/log/quickbid/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 deploy deploy
    postrotate
        systemctl reload quickbid-backend
    endscript
}
EOF
```

#### **Configure Application Logging**
```typescript
// src/config/logger.config.ts
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure logger
  app.useLogger(new Logger('QuickBid'));
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  await app.listen(4010);
}
bootstrap();
```

### **7.2 Health Monitoring**

#### **Health Check Endpoint**
```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check() {
    return this.healthService.check();
  }
}
```

#### **Health Check Service**
```typescript
// src/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: await this.checkDatabase(),
      services: await this.checkServices(),
    };
    
    return checks;
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  private async checkServices() {
    return {
      auth: { status: 'ok' },
      payments: { status: 'ok' },
      notifications: { status: 'ok' },
    };
  }
}
```

---

## 🔄 **DEPLOYMENT AUTOMATION**

### **8.1 CI/CD Pipeline**

#### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_KEY }}
          script: |
            cd /var/www/quickbid
            git pull origin main
            npm ci --production
            npm run build
            sudo systemctl restart quickbid-backend
```

### **8.2 Deployment Scripts**

#### **Update Script**
```bash
#!/bin/bash
# /var/www/quickbid/scripts/update.sh

echo "🔄 Updating QuickBid Backend..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Build application
npm run build

# Restart service
sudo systemctl restart quickbid-backend

# Check status
sudo systemctl status quickbid-backend

echo "✅ Update completed!"
```

#### **Rollback Script**
```bash
#!/bin/bash
# /var/www/quickbid/scripts/rollback.sh

echo "🔄 Rolling back QuickBid Backend..."

# Get previous commit
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

# Checkout previous commit
git checkout $PREVIOUS_COMMIT

# Install dependencies
npm ci --production

# Build application
npm run build

# Restart service
sudo systemctl restart quickbid-backend

echo "✅ Rollback completed to $PREVIOUS_COMMIT"
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### **9.1 Pre-Deployment**
- [ ] Server provisioned and configured
- [ ] SSH keys configured
- [ ] Node.js installed
- [ ] Firewall configured
- [ ] SSL certificates generated
- [ ] Nginx configured
- [ ] Database connection tested
- [ ] Environment variables set
- [ ] Application built successfully

### **9.2 Post-Deployment**
- [ ] Service running and healthy
- [ ] API endpoints responding
- [ ] SSL certificates working
- [ ] Security headers active
- [ ] Rate limiting working
- [ ] Monitoring configured
- [ ] Logging configured
- [ ] Backup procedures in place
- [ ] Rollback procedures tested

---

## 🔧 **TROUBLESHOOTING**

### **10.1 Common Issues**

#### **Service Won't Start**
```bash
# Check service status
sudo systemctl status quickbid-backend

# Check logs
sudo journalctl -u quickbid-backend -n 50

# Check configuration
sudo nginx -t

# Check port availability
sudo netstat -tlnp | grep :4010
```

#### **Database Connection Issues**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check environment variables
cat /var/www/quickbid/.env

# Test from application
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('Database connected');
  process.exit(0);
}).catch((error) => {
  console.error('Database connection failed:', error);
  process.exit(1);
});
"
```

#### **SSL Certificate Issues**
```bash
# Check certificate
openssl s_client -connect api.quickbid.com:443 -servername api.quickbid.com

# Test renewal
certbot renew --dry-run

# Check Nginx SSL config
sudo nginx -t | grep ssl
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **11.1 Application Optimization**

#### **Enable Clustering**
```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cluster from 'cluster';
import * as os from 'os';

async function bootstrap() {
  if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    const app = await NestFactory.create(AppModule);
    await app.listen(4010);
    console.log(`Worker ${process.pid} started`);
  }
}

bootstrap();
```

#### **Enable Compression**
```typescript
// src/main.ts
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable compression
  app.use(compression());
  
  await app.listen(4010);
}
```

### **11.2 Database Optimization**

#### **Connection Pooling**
```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

---

## 🔒 **SECURITY BEST PRACTICES**

### **12.1 Application Security**

#### **Input Validation**
```typescript
// src/pipes/validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('Validation failed: No data provided');
    }
    return value;
  }
}
```

#### **Rate Limiting**
```typescript
// src/middleware/rate-limiting.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private requests = new Map<string, number[]>();
  private readonly limit = 100;
  private readonly window = 15 * 60 * 1000; // 15 minutes

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const now = Date.now();
    const requests = this.requests.get(ip) || [];
    
    // Remove old requests
    const validRequests = requests.filter(timestamp => now - timestamp < this.window);
    
    if (validRequests.length >= this.limit) {
      return res.status(429).json({ message: 'Too many requests' });
    }
    
    validRequests.push(now);
    this.requests.set(ip, validRequests);
    
    next();
  }
}
```

---

## 📞 **SUPPORT & MAINTENANCE**

### **13.1 Monitoring Commands**

```bash
# Service status
sudo systemctl status quickbid-backend

# Service logs
sudo journalctl -u quickbid-backend -f

# Nginx status
sudo systemctl status nginx

# Nginx logs
sudo tail -f /var/log/nginx/api.quickbid.com.error.log

# System resources
htop
free -h
df -h
```

### **13.2 Maintenance Tasks**

```bash
# Daily tasks
- Check service status
- Review error logs
- Monitor resource usage
- Verify backup completion

# Weekly tasks
- Update dependencies
- Review security patches
- Clean up old logs
- Performance analysis

# Monthly tasks
- SSL certificate renewal check
- Security audit
- Database optimization
- Capacity planning
```

---

## 🎯 **NEXT STEPS**

### **14.1 Immediate Actions**
1. **Deploy backend** to production server
2. **Configure monitoring** and alerting
3. **Set up load balancer** for high availability
4. **Test all API endpoints** thoroughly
5. **Configure backup procedures**

### **14.2 Long-term Planning**
1. **Implement auto-scaling** for traffic spikes
2. **Set up multi-region deployment**
3. **Implement advanced monitoring**
4. **Set up disaster recovery**
5. **Plan for capacity expansion**

---

## 🚀 **BACKEND DEPLOYMENT READY**

**🎉 Backend production deployment guide completed!**

**📊 Status: Ready for implementation**
**🎯 Next: Configure load balancer and SSL**
**🚀 Timeline: On track for Week 2 completion**

---

*Last Updated: February 4, 2026*
*Status: Ready for Implementation*
