# 🌐 DOMAIN CONFIGURATION GUIDE

## 📋 OVERVIEW

This guide covers the complete domain setup for QuickBid production deployment.

---

## 🚀 **STEP 2: CONFIGURE DOMAIN**

### **Option 1: Custom Domain Setup**

#### **1. DNS Configuration**

```bash
# Primary Domain (A Record)
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600

# WWW Subdomain (CNAME)
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 3600

# API Subdomain (A Record)
Type: A
Name: api
Value: YOUR_SERVER_IP
TTL: 3600
```

#### **2. SSL Certificate Setup**

```bash
# Using Let's Encrypt (Recommended)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Or use Cloudflare SSL (Free)
# Enable SSL/TLS in Cloudflare dashboard
# Set to "Full (Strict)" mode
```

#### **3. Nginx Configuration**

```nginx
# /etc/nginx/sites-available/quickbid
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/quickbid/dist;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:4010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API Subdomain
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🌐 **DEPLOYMENT PLATFORMS**

### **Option 2: Vercel (Recommended)**

#### **1. Install Vercel CLI**
```bash
npm i -g vercel
```

#### **2. Deploy to Vercel**
```bash
# Login to Vercel
vercel login

# Deploy project
vercel --prod

# Add custom domain
vercel domains add yourdomain.com
```

#### **3. Environment Variables in Vercel**
```bash
# Set production environment variables
vercel env add VITE_AUTH_MODE production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

### **Option 3: Netlify**

#### **1. Install Netlify CLI**
```bash
npm i -g netlify-cli
```

#### **2. Deploy to Netlify**
```bash
# Login to Netlify
netlify login

# Deploy site
netlify deploy --prod --dir=dist

# Add custom domain
netlify domains:add yourdomain.com
```

#### **3. Netlify Configuration**
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build:production"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

---

## 🔧 **ENVIRONMENT CONFIGURATION**

### **Production Environment Variables**

Create `.env.production` with your domain:

```bash
# 🌐 DOMAIN CONFIGURATION
VITE_APP_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com

# 🔐 AUTHENTICATION
VITE_AUTH_MODE=real
VITE_ENABLE_REAL_AUTH=true
VITE_ENABLE_DEMO_AUTH=false

# 🗄️ DATABASE
VITE_SUPABASE_URL=https://your-production-supabase.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# 💳 PAYMENTS
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
VITE_RAZORPAY_KEY_ID=your_production_razorpay_key

# 📊 ANALYTICS
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_HOTJAR_ID=your-hotjar-id
```

---

## 🔒 **SECURITY CONFIGURATION**

### **SSL/TLS Setup**

#### **1. Let's Encrypt (Free)**
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL Certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### **2. Cloudflare SSL (Free)**
1. **Sign up** for Cloudflare
2. **Add your domain** to Cloudflare
3. **Update nameservers** to Cloudflare
4. **Enable SSL/TLS** in dashboard
5. **Set to "Full (Strict)"** mode

### **Security Headers**

```nginx
# Add to Nginx config
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 📊 **MONITORING SETUP**

### **1. Google Analytics 4**

```javascript
// Add to production build
gtag('config', 'GA_MEASUREMENT_ID', {
  send_page_view: true,
  debug_mode: false,
  custom_map: {
    'custom_parameter_1': 'user_type',
    'custom_parameter_2': 'auction_category'
  }
});
```

### **2. Sentry Error Tracking**

```javascript
// Add to production build
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1,
  release: "quickbid@1.0.0"
});
```

### **3. Uptime Monitoring**

```bash
# Using UptimeRobot (Free)
# Monitor: https://yourdomain.com
# Monitor: https://api.yourdomain.com/health
# Alert: email + SMS
```

---

## 🚀 **DEPLOYMENT COMMANDS**

### **Production Deployment**

```bash
# 1. Build for production
npm run build:production

# 2. Deploy to platform
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist

# Manual server
rsync -avz dist/ user@server:/var/www/quickbid/

# 3. Restart services
sudo systemctl restart nginx
sudo systemctl reload nginx
```

### **Domain Verification**

```bash
# Check DNS propagation
dig yourdomain.com
nslookup yourdomain.com

# Check SSL certificate
curl -I https://yourdomain.com
openssl s_client -connect yourdomain.com:443

# Check security headers
curl -I https://yourdomain.com | grep -E "(X-Frame|X-Content|X-XSS|Strict)"
```

---

## 📞 **SUPPORT CONTACTS**

### **Domain Issues**
- **DNS Support**: contact@yourdomain.com
- **SSL Support**: ssl@yourdomain.com
- **Technical Support**: tech@quickbid.com

### **Platform Support**
- **Vercel**: support@vercel.com
- **Netlify**: support@netlify.com
- **Cloudflare**: support@cloudflare.com

---

## ✅ **DOMAIN CONFIGURATION CHECKLIST**

### **Pre-Launch Checklist**
- [ ] **Domain purchased** and configured
- [ ] **DNS records** set up correctly
- [ ] **SSL certificate** installed
- [ ] **Nginx configuration** updated
- [ ] **Security headers** added
- [ ] **Environment variables** updated
- [ ] **Analytics tracking** configured
- [ ] **Error monitoring** set up
- [ ] **Uptime monitoring** active
- [ ] **Domain verification** complete

### **Post-Launch Verification**
- [ ] **HTTPS redirects** working
- [ ] **Security headers** present
- [ ] **Analytics tracking** data
- [ ] **Error monitoring** receiving data
- [ ] **Mobile responsive** on domain
- [ ] **Performance metrics** acceptable
- [ ] **User registration** working
- [ ] **Payment processing** functional

---

## 🎉 **DOMAIN CONFIGURATION COMPLETE**

**Your QuickBid platform is ready for:**

✅ **Custom Domain** - Professional branding
✅ **SSL Security** - HTTPS encryption
✅ **Performance Optimization** - Fast loading
✅ **Security Headers** - Production security
✅ **Analytics Tracking** - User insights
✅ **Error Monitoring** - Production stability

**Ready for professional market launch!** 🎊

---

*Domain Configuration Guide*
*Version: 1.0.0*
*Last Updated: January 2026*
