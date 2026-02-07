#!/bin/bash

# 🚀 QUICKBID AUCTION PLATFORM - SMOKE TESTS
# Comprehensive smoke testing for all critical flows

echo "🚀 Starting Comprehensive Smoke Tests..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
CRITICAL=0

# Base URLs
FRONTEND_URL="http://localhost:3021"
BACKEND_URL="http://localhost:4010"

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local method="${4:-GET}"
    local data="${5:-}"
    
    echo -e "${BLUE}Testing: ${name}${NC}"
    echo "URL: $url"
    echo "Method: $method"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$url")
    fi
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (${http_code})"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (${http_code})"
        FAILED=$((FAILED + 1))
        if [ "$http_code" = "500" ]; then
            CRITICAL=$((CRITICAL + 1))
        fi
    fi
    
    echo ""
}

# Function to test page load
test_page_load() {
    local name="$1"
    local url="$2"
    local expected_content="$3"
    
    echo -e "${BLUE}Testing: ${name}${NC}"
    echo "URL: $url"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code};SIZE:%{size_download}" "$url")
    http_code=$(echo "$response" | cut -d';' -f1)
    size=$(echo "$response" | cut -d';' -f2)
    
    if [ "$http_code" = "200" ] && [ "$size" -gt 1000 ]; then
        echo -e "${GREEN}✓ PASS${NC} (${http_code}, ${size} bytes)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (${http_code}, ${size} bytes)"
        FAILED=$((FAILED + 1))
        if [ "$http_code" = "500" ]; then
            CRITICAL=$((CRITICAL + 1))
        fi
    fi
    
    echo ""
}

# Function to test form submission
test_form_submission() {
    local name="$1"
    local url="$2"
    local form_data="$3"
    
    echo -e "${BLUE}Testing: ${name}${NC}"
    echo "URL: $url"
    echo "Data: $form_data"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$form_data" \
        "$url")
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ] || [ "$http_code" = "400" ]; then
        echo -e "${GREEN}✓ PASS${NC} (${http_code})"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (${http_code})"
        FAILED=$((FAILED + 1))
        if [ "$http_code" = "500" ]; then
            CRITICAL=$((CRITICAL + 1))
        fi
    fi
    
    echo ""
}

echo -e "${YELLOW}🔥 PHASE 1: BASIC CONNECTIVITY${NC}"
echo "=================================="

# Test basic connectivity
test_endpoint "Frontend Health" "$FRONTEND_URL" "200"
test_endpoint "Backend Health" "$BACKEND_URL/api/health" "200"
test_endpoint "Products API" "$BACKEND_URL/api/products" "200"
test_endpoint "Auctions API" "$BACKEND_URL/api/auctions" "200"

echo -e "${YELLOW}🔥 PHASE 2: AUTHENTICATION FLOWS${NC}"
echo "=================================="

# Test authentication endpoints
test_form_submission "User Registration" "$BACKEND_URL/api/auth/register" '{
    "email": "testuser@example.com",
    "password": "TestPassword123!",
    "name": "Test User",
    "role": "buyer"
}'

test_form_submission "User Login" "$BACKEND_URL/api/auth/login" '{
    "email": "testuser@example.com",
    "password": "TestPassword123!"
}'

test_endpoint "Get User Profile" "$BACKEND_URL/api/auth/profile" "200"

echo -e "${YELLOW}🔥 PHASE 3: BUYER FLOWS${NC}"
echo "=================================="

# Test buyer-specific endpoints
test_endpoint "Buyer Dashboard" "$FRONTEND_URL/buyer/dashboard" "200"
test_endpoint "Browse Products" "$FRONTEND_URL/products" "200"
test_endpoint "Auction Detail" "$FRONTEND_URL/auction/123" "200"
test_endpoint "Place Bid" "$BACKEND_URL/api/bids" "201" "POST" '{
    "auctionId": "123",
    "userId": "test-user-id",
    "amount": 1000
}'

test_endpoint "Wallet Balance" "$BACKEND_URL/api/wallet/balance" "200"
test_endpoint "Add Funds" "$BACKEND_URL/api/wallet/add" "200" "POST" '{
    "amount": 1000,
    "paymentMethod": "credit_card"
}'

test_endpoint "Watchlist" "$FRONTEND_URL/buyer/watchlist" "200"
test_endpoint "Order History" "$FRONTEND_URL/buyer/orders" "200"
test_endpoint "My Wins" "$FRONTEND_URL/buyer/wins" "200"

echo -e "${YELLOW}🔥 PHASE 4: SELLER FLOWS${NC}"
echo "=================================="

# Test seller-specific endpoints
test_endpoint "Seller Dashboard" "$FRONTEND_URL/seller/dashboard" "200"
test_endpoint "Create Product" "$FRONTEND_URL/add-product" "200"
test_endpoint "Product Management" "$BACKEND_URL/api/products" "200"
test_endpoint "Bulk Upload" "$FRONTEND_URL/bulk-upload" "200"

echo -e "${YELLOW}🔥 PHASE 5: ADMIN FLOWS${NC}"
echo "=================================="

# Test admin-specific endpoints
test_endpoint "Admin Dashboard" "$FRONTEND_URL/admin" "200"
test_endpoint "User Management" "$FRONTEND_URL/admin/users" "200"
test_endpoint "Product Verification" "$FRONTEND_URL/admin/verify-products" "200"
test_endpoint "Analytics Dashboard" "$FRONTEND_URL/admin/analytics" "200"

echo -e "${YELLOW}🔥 PHASE 6: PAYMENT FLOWS${NC}"
echo "=================================="

# Test payment endpoints
test_endpoint "Create Payment Order" "$BACKEND_URL/api/razorpay-create-order" "200" "POST" '{
    "amount": 100000,
    "currency": "INR"
}'

test_endpoint "Confirm Payment" "$BACKEND_URL/api/payments/confirm" "200" "POST" '{
    "paymentId": "pay_test123",
    "orderId": "order_test123"
}'

echo -e "${YELLOW}🔥 PHASE 7: ERROR HANDLING${NC}"
echo "=================================="

# Test error handling
test_endpoint "404 Page" "$FRONTEND_URL/nonexistent-page" "200"
test_endpoint "Invalid API Endpoint" "$BACKEND_URL/api/invalid-endpoint" "404"
test_endpoint "Unauthorized Access" "$FRONTEND_URL/admin/users" "401"

echo -e "${YELLOW}🔥 PHASE 8: PERFORMANCE TESTS${NC}"
echo "=================================="

# Test performance
echo -e "${BLUE}Testing page load performance...${NC}"
load_time=$(curl -s -w "%{time_total}" -o /dev/null "$FRONTEND_URL")
if (( $(echo "$load_time < 1.0" | bc -l) )); then
    echo -e "${GREEN}✓ Fast load: ${load_time}s${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ Slow load: ${load_time}s${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo -e "${YELLOW}🔥 PHASE 9: SECURITY TESTS${NC}"
echo "=================================="

# Test security
test_endpoint "SQL Injection Protection" "$BACKEND_URL/api/products" "400" "POST" '{
    "search": "'; DROP TABLE users; --"
}'

test_endpoint "XSS Protection" "$BACKEND_URL/api/products" "400" "POST" '{
    "search": "<script>alert(\"xss\")</script>"
}'

echo ""
echo -e "${BLUE}=================================================="
echo "           SMOKE TEST RESULTS"
echo -e "==================================================${NC}"

echo -e "${GREEN}✓ PASSED TESTS (${PASSED})${NC}"
echo -e "${RED}✗ FAILED TESTS (${FAILED})${NC}"

if [ $CRITICAL -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL ERRORS: ${CRITICAL}${NC}"
fi

TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$(( (PASSED * 100) / TOTAL ))

echo ""
echo -e "${BLUE}SUMMARY${NC}"
echo "--------"
echo "Total Tests: $TOTAL"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Success Rate: ${SUCCESS_RATE}%"

echo ""
echo -e "${BLUE}RECOMMENDATIONS${NC}"
echo "----------------"

if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "${GREEN}✅ EXCELLENT: System is healthy and ready${NC}"
elif [ $SUCCESS_RATE -ge 75 ]; then
    echo -e "${YELLOW}⚠️ GOOD: System mostly functional, minor issues${NC}"
elif [ $SUCCESS_RATE -ge 50 ]; then
    echo -e "${RED}❌ POOR: System has significant issues${NC}"
else
    echo -e "${RED}❌ CRITICAL: System is not functional${NC}"
fi

echo ""
echo -e "${BLUE}NEXT STEPS${NC}"
echo "------------"
echo "1. Fix all failed tests"
echo "2. Address critical errors first"
echo "3. Re-run smoke tests"
echo "4. Proceed to integration testing"

echo ""
if [ $CRITICAL -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL ISSUES FOUND - DO NOT DEPLOY${NC}"
else
    echo -e "${GREEN}🚀 READY FOR NEXT TESTING PHASE${NC}"
fi

echo ""
echo "✅ Smoke testing complete!"
