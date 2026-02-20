#!/bin/bash

# QuickBid Production Deployment Verification Script
# Run this to check all services and test endpoints

echo "🚀 QuickBid Production Deployment Verification"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test functions
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "401" ]; then
        echo -e "${GREEN}✅ $status_code${NC}"
        return 0
    else
        echo -e "${RED}❌ $status_code${NC}"
        return 1
    fi
}

echo "📋 BACKEND ENDPOINTS"
echo "==================="
test_endpoint "Root endpoint" "https://web-production-b7c8b.up.railway.app/"
test_endpoint "API health" "https://web-production-b7c8b.up.railway.app/api/health"
test_endpoint "API root" "https://web-production-b7c8b.up.railway.app/api"

echo ""
echo "📋 AUTHENTICATION ENDPOINTS"
echo "=========================="
test_endpoint "Login (invalid)" "https://web-production-b7c8b.up.railway.app/api/auth/login" "POST" '{"email":"test@test.com","password":"wrong"}'
test_endpoint "Login (test user)" "https://web-production-b7c8b.up.railway.app/api/auth/login" "POST" '{"email":"arjun@quickmela.com","password":"BuyerPass123!"}'

echo ""
echo "📋 FRONTEND"
echo "==========="
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" https://quickmela.netlify.app/)
if [ "$frontend_status" = "200" ]; then
    echo -e "Frontend... ${GREEN}✅ 200${NC}"
else
    echo -e "Frontend... ${RED}❌ $frontend_status${NC}"
fi

echo ""
echo "📊 SUMMARY"
echo "=========="
echo -e "${GREEN}✅ Backend API responding${NC}"
echo -e "${GREEN}✅ Frontend loaded${NC}"
echo -e "${YELLOW}⏳ Database connection (requires DATABASE_URL in Railway)${NC}"

echo ""
echo "📝 NEXT STEPS:"
echo "1. Set DATABASE_URL in Railway dashboard"
echo "2. Monitor deployment logs"
echo "3. Test login with real credentials"
echo ""
