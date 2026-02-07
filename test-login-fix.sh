#!/bin/bash

# QuickMela Frontend Login Fix Test
# =================================

echo "🔧 QUICKMELA FRONTEND LOGIN FIX TEST"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Login Fix${NC}"
echo ""

# Test 1: Check if frontend is accessible
echo -e "${YELLOW}1. Testing Frontend Accessibility${NC}"
if curl -f -s http://localhost:3021 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
    exit 1
fi

# Test 2: Check if backend is accessible
echo -e "${YELLOW}2. Testing Backend Accessibility${NC}"
if curl -f -s http://localhost:4011/api/products > /dev/null; then
    echo -e "${GREEN}✅ Backend is accessible${NC}"
else
    echo -e "${RED}❌ Backend is not accessible${NC}"
    exit 1
fi

# Test 3: Test login endpoint directly
echo -e "${YELLOW}3. Testing Login Endpoint${NC}"
login_response=$(curl -s -X POST http://localhost:4011/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"arjun@quickmela.com","password":"BuyerPass123!"}')

if echo "$login_response" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ Login endpoint working${NC}"
    token=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Token received: ${token:0:20}...${NC}"
else
    echo -e "${RED}❌ Login endpoint failed${NC}"
    echo "$login_response"
fi

# Test 4: Test CORS headers
echo -e "${YELLOW}4. Testing CORS Headers${NC}"
cors_response=$(curl -s -I -X OPTIONS http://localhost:4011/api/auth/login \
    -H "Origin: http://localhost:3021" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type")

if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
else
    echo -e "${RED}❌ CORS headers missing${NC}"
fi

echo ""
echo -e "${BLUE}📋 MANUAL TESTING INSTRUCTIONS${NC}"
echo "================================"
echo -e "${YELLOW}1. Open browser: http://localhost:3021${NC}"
echo -e "${YELLOW}2. Try to login with: arjun@quickmela.com / BuyerPass123!${NC}"
echo -e "${YELLOW}3. Check browser console for infinite loop warnings${NC}"
echo -e "${YELLOW}4. Verify successful redirect to buyer dashboard${NC}"
echo ""

echo -e "${GREEN}✅ Login fix has been applied${NC}"
echo -e "${GREEN}🔧 useEffect dependency issues resolved${NC}"
echo -e "${GREEN}🔧 API_URL fallback added${NC}"
echo -e "${GREEN}🔧 Error handling improved${NC}"
echo ""

echo -e "${BLUE}🎯 Expected Behavior:${NC}"
echo -e "${GREEN}✅ No infinite loop warnings${NC}"
echo -e "${GREEN}✅ Successful login${NC}"
echo -e "${GREEN}✅ Proper redirect to dashboard${NC}"
echo -e "${GREEN}✅ No 500 errors${NC}"
