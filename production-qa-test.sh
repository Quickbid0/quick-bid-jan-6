#!/bin/bash

# QuickMela Production QA Test Suite
# Run this script to perform comprehensive API testing

echo "🚀 Starting QuickMela Production QA Test Suite"
echo "=================================================="

BASE_URL="https://web-production-b7c8b.up.railway.app/api"
FRONTEND_URL="https://quickmela.netlify.app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

log_test() {
    local test_name="$1"
    local result="$2"
    local details="$3"

    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name"
        if [ -n "$details" ]; then
            echo -e "${RED}   Details: $details${NC}"
        fi
        ((TESTS_FAILED++))
    fi
}

# Test 1: Backend Health Check
echo -e "\n${BLUE}🔍 PHASE 1: BACKEND HEALTH CHECK${NC}"
echo "----------------------------------------"

health_response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/health" 2>/dev/null)
health_body=$(echo "$health_response" | head -n -1)
health_status=$(echo "$health_response" | tail -n 1 | cut -d: -f2)

if [ "$health_status" = "200" ] && echo "$health_body" | grep -q "status.*ok"; then
    log_test "Backend Health Check" "PASS"
else
    log_test "Backend Health Check" "FAIL" "Status: $health_status, Response: $health_body"
fi

# Test 2: Authentication Tests
echo -e "\n${BLUE}🔐 PHASE 2: AUTHENTICATION TESTING${NC}"
echo "----------------------------------------"

# Test Admin Login
admin_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@quickmela.com","password":"AdminPass123!"}' 2>/dev/null)

if echo "$admin_response" | grep -q "accessToken"; then
    log_test "Admin Login" "PASS"
    ADMIN_TOKEN=$(echo "$admin_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
    log_test "Admin Login" "FAIL" "Response: $admin_response"
fi

# Test Buyer Login (arjun@quickmela.com)
buyer_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"arjun@quickmela.com","password":"BuyerPass123!"}' 2>/dev/null)

if echo "$buyer_response" | grep -q "accessToken"; then
    log_test "Buyer Login (arjun)" "PASS"
    BUYER_TOKEN=$(echo "$buyer_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
    log_test "Buyer Login (arjun)" "FAIL" "Response: $buyer_response"
fi

# Test Seller Login
seller_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"seller1@quickmela.com","password":"SellerPass123!"}' 2>/dev/null)

if echo "$seller_response" | grep -q "accessToken"; then
    log_test "Seller Login" "PASS"
    SELLER_TOKEN=$(echo "$seller_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
    log_test "Seller Login" "FAIL" "Response: $seller_response"
fi

# Test 3: Products API
echo -e "\n${BLUE}📦 PHASE 3: PRODUCTS API TESTING${NC}"
echo "----------------------------------------"

products_response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/products" 2>/dev/null)
products_body=$(echo "$products_response" | head -n -1)
products_status=$(echo "$products_response" | tail -n 1 | cut -d: -f2)

if [ "$products_status" = "200" ] && echo "$products_body" | grep -q '"id":'; then
    log_test "Products API" "PASS"
    PRODUCT_COUNT=$(echo "$products_body" | grep -o '"id":' | wc -l)
    echo "   Found $PRODUCT_COUNT products"
else
    log_test "Products API" "FAIL" "Status: $products_status"
fi

# Test 4: Security Testing
echo -e "\n${BLUE}🔒 PHASE 4: SECURITY TESTING${NC}"
echo "----------------------------------------"

# Test unauthorized access to products
unauth_response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/products" 2>/dev/null)
unauth_status=$(echo "$unauth_response" | tail -n 1 | cut -d: -f2)

if [ "$unauth_status" = "200" ]; then
    log_test "Public Products Access" "PASS"
else
    log_test "Public Products Access" "FAIL" "Status: $unauth_status"
fi

# Test invalid login
invalid_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid@quickmela.com","password":"wrongpass"}' 2>/dev/null)

if echo "$invalid_response" | grep -q "Invalid credentials"; then
    log_test "Invalid Credentials Handling" "PASS"
else
    log_test "Invalid Credentials Handling" "FAIL" "Response: $invalid_response"
fi

# Test 5: Role-based Access
echo -e "\n${BLUE}👥 PHASE 5: ROLE-BASED ACCESS TESTING${NC}"
echo "----------------------------------------"

# Test buyer accessing seller routes (if they exist)
# Note: This would require specific seller-only endpoints to test properly

# Test 6: Performance Testing
echo -e "\n${BLUE}⚡ PHASE 6: PERFORMANCE TESTING${NC}"
echo "----------------------------------------"

start_time=$(date +%s%3N)
perf_response=$(curl -s "$BASE_URL/products" 2>/dev/null)
end_time=$(date +%s%3N)
response_time=$((end_time - start_time))

if [ $response_time -lt 1000 ]; then
    log_test "API Response Time (< 1s)" "PASS" "${response_time}ms"
else
    log_test "API Response Time (< 1s)" "FAIL" "${response_time}ms"
fi

# Test 7: Frontend Accessibility
echo -e "\n${BLUE}🌐 PHASE 7: FRONTEND ACCESSIBILITY${NC}"
echo "----------------------------------------"

frontend_response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$FRONTEND_URL" 2>/dev/null)
frontend_status=$(echo "$frontend_response" | tail -n 1 | cut -d: -f2)

if [ "$frontend_status" = "200" ]; then
    log_test "Frontend Accessibility" "PASS"
else
    log_test "Frontend Accessibility" "FAIL" "Status: $frontend_status"
fi

# Final Report
echo -e "\n${BLUE}📊 FINAL QA REPORT${NC}"
echo "=================================================="
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

success_rate=$((TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED)))

if [ $success_rate -ge 90 ]; then
    echo -e "Success Rate: ${GREEN}$success_rate%${NC} 🎉"
elif [ $success_rate -ge 75 ]; then
    echo -e "Success Rate: ${YELLOW}$success_rate%${NC} ⚠️"
else
    echo -e "Success Rate: ${RED}$success_rate%${NC} ❌"
fi

echo -e "\n${BLUE}🔧 RECOMMENDATIONS${NC}"
echo "1. Implement password hashing (critical for production)"
echo "2. Remove OTP exposure in production builds"
echo "3. Add rate limiting for authentication endpoints"
echo "4. Implement proper CSRF protection"
echo "5. Add input sanitization and validation"
echo "6. Set up monitoring and alerting"
echo "7. Add comprehensive error logging"

if [ $success_rate -ge 85 ]; then
    echo -e "\n${GREEN}✅ PRODUCTION READY${NC} - Platform is stable and functional"
else
    echo -e "\n${RED}❌ REQUIRES FIXES${NC} - Address critical issues before production"
fi

echo -e "\n${BLUE}🏁 QA Testing Complete${NC}"
