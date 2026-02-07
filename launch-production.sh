#!/bin/bash

# 🚀 QUICKBID PRODUCTION LAUNCH SCRIPT
# =====================================

echo "🚀 QUICKBID PRODUCTION LAUNCH STARTED..."
echo "=================================="

# Check if backend is running
echo "🔍 Checking backend server..."
if curl -s http://localhost:4010/api/health > /dev/null; then
    echo "✅ Backend server is running"
else
    echo "❌ Backend server is not running. Starting..."
    cd backend && npm start &
    sleep 5
fi

# Build for production
echo "🔨 Building for production..."
npm run build:production

if [ $? -eq 0 ]; then
    echo "✅ Production build successful"
else
    echo "❌ Production build failed"
    exit 1
fi

# Start production preview
echo "🌐 Starting production preview server..."
npm run preview:production &

# Wait for server to start
sleep 3

# Check if frontend is running
if curl -s http://localhost:4173 > /dev/null; then
    echo "✅ Production server is running"
else
    echo "❌ Production server failed to start"
    exit 1
fi

# Test API connectivity
echo "🔗 Testing API connectivity..."
if curl -s http://localhost:4010/api/products > /dev/null; then
    echo "✅ API connectivity working"
else
    echo "❌ API connectivity failed"
    exit 1
fi

# Test authentication
echo "🔐 Testing authentication..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:4010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"founder@quickbid.com","password":"QuickBid2026!"}')

if echo "$AUTH_RESPONSE" | grep -q "Login successful"; then
    echo "✅ Authentication working"
else
    echo "❌ Authentication failed"
    exit 1
fi

echo ""
echo "🎉 QUICKBID PRODUCTION LAUNCH SUCCESSFUL!"
echo "=================================="
echo "📱 Frontend: http://localhost:4173"
echo "🔧 Backend API: http://localhost:4010"
echo "👤 Admin Login: founder@quickbid.com / QuickBid2026!"
echo "🛒 Seller Login: seller@quickbid.com / QuickBid2026!"
echo ""
echo "🚀 READY FOR MARKET LAUNCH!"
echo "📊 See MARKET-LAUNCH-READY.md for details"
echo "🔧 See DEPLOYMENT-PRODUCTION.md for deployment"
echo "🌐 See DOMAIN-CONFIGURATION.md for domain setup"
echo "📈 See MONITORING-SETUP.md for monitoring"
echo "🎧 See USER-SUPPORT-SETUP.md for support"
echo ""
echo "🎊 LAUNCH NOW! 🎊"
