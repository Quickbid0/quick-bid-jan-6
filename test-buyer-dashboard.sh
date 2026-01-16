#!/bin/bash

# QuickBid Buyer Dashboard & Navigation Test Script
echo "🧪 TESTING BUYER DASHBOARD & NAVIGATION FUNCTIONALITY"
echo "=================================================="

# Test 1: Check if dev server is running
echo "📡 Test 1: Checking if dev server is running..."
if curl -s http://localhost:3010 > /dev/null; then
    echo "✅ Dev server is running on port 3010"
else
    echo "❌ Dev server is not accessible"
    exit 1
fi

# Test 2: Check catalog route accessibility
echo ""
echo "📦 Test 2: Testing Catalog route accessibility..."
catalog_response=$(curl -s -w "%{http_code}" http://localhost:3010/catalog)
http_code="${catalog_response: -3}"
if [ "$http_code" = "200" ]; then
    echo "✅ Catalog route accessible (HTTP 200)"
else
    echo "❌ Catalog route not accessible (HTTP $http_code)"
fi

# Test 3: Check live-auction route accessibility
echo ""
echo "🔨 Test 3: Testing Live Auction route accessibility..."
auction_response=$(curl -s -w "%{http_code}" http://localhost:3010/live-auction)
http_code="${auction_response: -3}"
if [ "$http_code" = "200" ]; then
    echo "✅ Live Auction route accessible (HTTP 200)"
else
    echo "❌ Live Auction route not accessible (HTTP $http_code)"
fi

# Test 4: Check buyer dashboard route accessibility
echo ""
echo "👤 Test 4: Testing Buyer Dashboard route accessibility..."
dashboard_response=$(curl -s -w "%{http_code}" http://localhost:3010/buyer/dashboard)
http_code="${dashboard_response: -3}"
if [ "$http_code" = "200" ]; then
    echo "✅ Buyer Dashboard route accessible (HTTP 200)"
else
    echo "❌ Buyer Dashboard route not accessible (HTTP $http_code)"
fi

# Test 5: Check demo login route accessibility
echo ""
echo "🔐 Test 5: Testing Demo Login route accessibility..."
demo_response=$(curl -s -w "%{http_code}" http://localhost:3010/demo)
http_code="${demo_response: -3}"
if [ "$http_code" = "200" ]; then
    echo "✅ Demo Login route accessible (HTTP 200)"
else
    echo "❌ Demo Login route not accessible (HTTP $http_code)"
fi

# Test 6: Check if required components exist
echo ""
echo "📁 Test 6: Checking if required component files exist..."

components=(
    "src/pages/BuyerDashboard.tsx"
    "src/pages/ProductCatalog.tsx"
    "src/pages/LiveAuctionPage.tsx"
    "src/pages/DemoLogin.tsx"
    "src/components/Navbar.tsx"
    "src/context/SessionContext.tsx"
    "src/components/ProtectedRoute.tsx"
)

for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        echo "✅ $component exists"
    else
        echo "❌ $component missing"
    fi
done

# Test 7: Check TypeScript compilation
echo ""
echo "🔧 Test 7: Checking TypeScript compilation..."
cd /Users/sanieevmusugu/Desktop/quick-bid-jan-6
if npm run build > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
fi

# Test 8: Check for authentication console logs
echo ""
echo "🔍 Test 8: Checking for authentication console logs..."
if grep -r "🔐 AUTH:" src/pages/DemoLogin.tsx > /dev/null; then
    echo "✅ Demo login console logging found"
else
    echo "❌ Demo login console logging missing"
fi

if grep -r "🔐 AUTH:" src/context/SessionContext.tsx > /dev/null; then
    echo "✅ Session context console logging found"
else
    echo "❌ Session context console logging missing"
fi

if grep -r "🔐 AUTH:" src/components/ProtectedRoute.tsx > /dev/null; then
    echo "✅ Protected route console logging found"
else
    echo "❌ Protected route console logging missing"
fi

# Test 9: Check navigation menu items
echo ""
echo "🧭 Test 9: Checking navigation menu items..."
if grep -q "to: '/catalog'" src/components/Navbar.tsx; then
    echo "✅ Catalog link found in navigation"
else
    echo "❌ Catalog link missing from navigation"
fi

if grep -q "to: '/live-auction'" src/components/Navbar.tsx; then
    echo "✅ Live Auction link found in navigation"
else
    echo "❌ Live Auction link missing from navigation"
fi

# Test 10: Check role validation
echo ""
echo "👥 Test 10: Checking role validation..."
if grep -q "admin.*seller.*buyer" src/context/SessionContext.tsx; then
    echo "✅ Role validation found in SessionContext"
else
    echo "❌ Role validation missing from SessionContext"
fi

echo ""
echo "=================================================="
echo "🎯 BUYER DASHBOARD & NAVIGATION TEST COMPLETE"
echo "=================================================="
echo ""
echo "📊 Test Summary:"
echo "- All routes should return HTTP 200"
echo "- All component files should exist"
echo "- TypeScript should compile successfully"
echo "- Auth logging should be present"
echo "- Navigation links should be configured"
echo "- Role validation should be implemented"
echo ""
echo "🚀 For manual testing, visit: http://localhost:3010"
echo "🔐 Test demo login at: http://localhost:3010/demo"
echo "👤 Test buyer dashboard at: http://localhost:3010/buyer/dashboard"
echo "📦 Test catalog at: http://localhost:3010/catalog"
echo "🔨 Test live auction at: http://localhost:3010/live-auction"
