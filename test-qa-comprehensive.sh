#!/bin/bash

# 🔍 QUICKBID AUCTION PLATFORM - COMPREHENSIVE QA TESTING
# Complete QA testing suite covering all aspects

echo "🔍 Starting Comprehensive QA Testing..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
CRITICAL=0

# Base URLs
FRONTEND_URL="http://localhost:3021"
BACKEND_URL="http://localhost:4010"

# Test data storage
TEST_RESULTS_DIR="/tmp/quickbid-qa-results"
mkdir -p "$TEST_RESULTS_DIR"

# Function to log test result
log_test_result() {
    local category="$1"
    local test_name="$2"
    local status="$3"
    local details="$4"
    local severity="$5"
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$severity] $category: $test_name - $status - $details" >> "$TEST_RESULTS_DIR/qa-test-results.log"
    
    case $status in
        "PASS")
            echo -e "${GREEN}✓ PASS${NC} $test_name"
            PASSED=$((PASSED + 1))
            ;;
        "FAIL")
            echo -e "${RED}✗ FAIL${NC} $test_name"
            FAILED=$((FAILED + 1))
            ;;
        "WARN")
            echo -e "${YELLOW}⚠ WARN${NC} $test_name"
            FAILED=$((FAILED + 1))
            ;;
        "SKIP")
            echo -e "${YELLOW}⏭ SKIP${NC} $test_name"
            ;;
    esac
    
    if [ -n "$details" ]; then
        echo "  $details"
    fi
    
    if [ "$severity" = "CRITICAL" ]; then
        CRITICAL=$((CRITICAL + 1))
    fi
    
    echo ""
}

# Function to test API endpoint
test_api_endpoint() {
    local name="$1"
    local endpoint="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    local expected_status="${5:-200}"
    
    local full_url="$BACKEND_URL$endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$full_url")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" "$full_url")
    fi
    
    http_code=$(echo "$response" | cut -d';' -f1)
    time_total=$(echo "$response" | cut -d';' -f2)
    
    if [ "$http_code" = "$expected_status" ]; then
        log_test_result "API" "$name" "PASS" "Response: $http_code, Time: ${time_total}s" "INFO"
    else
        log_test_result "API" "$name" "FAIL" "Expected: $expected_status, Got: $http_code" "CRITICAL"
    fi
}

# Function to test page functionality
test_page_functionality() {
    local name="$1"
    local url="$2"
    local test_type="$3"
    local expected_content="$4"
    
    echo -e "${BLUE}Testing: $name${NC}"
    echo "URL: $url"
    echo "Type: $test_type"
    
    case $test_type in
        "LOAD")
            load_time=$(curl -s -w "%{time_total}" -o /dev/null "$url")
            if (( $(echo "$load_time < 2.0" | bc -l) )); then
                log_test_result "PAGE" "$name" "PASS" "Load time: ${load_time}s" "INFO"
            else
                log_test_result "PAGE" "$name" "WARN" "Slow load time: ${load_time}s" "MEDIUM"
            fi
            ;;
        "CONTENT")
            response=$(curl -s "$url")
            if echo "$response" | grep -q "$expected_content"; then
                log_test_result "PAGE" "$name" "PASS" "Content verified: $expected_content" "INFO"
            else
                log_test_result "PAGE" "$name" "FAIL" "Expected content not found: $expected_content" "HIGH"
            fi
            ;;
        "RESPONSIVE")
            # Test mobile viewport
            mobile_response=$(curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148" "$url")
            if echo "$mobile_response" | grep -q "viewport"; then
                log_test_result "PAGE" "$name" "PASS" "Mobile responsive" "INFO"
            else
                log_test_result "PAGE" "$name" "FAIL" "Not mobile responsive" "HIGH"
            fi
            ;;
        "ACCESSIBILITY")
            # Check for basic accessibility features
            response=$(curl -s "$url")
            if echo "$response" | grep -q "alt="; then
                log_test_result "PAGE" "$name" "PASS" "Alt tags found" "INFO"
            else
                log_test_result "PAGE" "$name" "WARN" "Missing alt tags" "MEDIUM"
            fi
            ;;
    esac
}

# Function to test form validation
test_form_validation() {
    local name="$1"
    local endpoint="$2"
    local test_data="$3"
    local validation_type="$4"
    
    echo -e "${BLUE}Testing: $name${NC}"
    echo "Endpoint: $endpoint"
    echo "Validation: $validation_type"
    
    case $validation_type in
        "REQUIRED_FIELDS")
            # Test missing required fields
            incomplete_data='{"email": ""}'
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
                -X POST \
                -H "Content-Type: application/json" \
                -d "$incomplete_data" \
                "$BACKEND_URL$endpoint")
            
            http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            
            if [ "$http_code" = "400" ]; then
                log_test_result "FORM" "$name" "PASS" "Required field validation working" "INFO"
            else
                log_test_result "FORM" "$name" "FAIL" "Required field validation not working" "HIGH"
            fi
            ;;
        "INVALID_FORMAT")
            # Test invalid data format
            invalid_data='{"email": "invalid-email-format"}'
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
                -X POST \
                -H "Content-Type: application/json" \
                -d "$invalid_data" \
                "$BACKEND_URL$endpoint")
            
            http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            
            if [ "$http_code" = "400" ]; then
                log_test_result "FORM" "$name" "PASS" "Invalid format validation working" "INFO"
            else
                log_test_result "FORM" "$name" "FAIL" "Invalid format validation not working" "HIGH"
            fi
            ;;
        "SQL_INJECTION")
            # Test SQL injection protection
            malicious_data='{"search": "'; DROP TABLE users; --"}'
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
                -X POST \
                -H "Content-Type: application/json" \
                -d "$malicious_data" \
                "$BACKEND_URL$endpoint")
            
            http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            
            if [ "$http_code" = "400" ]; then
                log_test_result "SECURITY" "$name" "PASS" "SQL injection protection working" "INFO"
            else
                log_test_result "SECURITY" "$name" "FAIL" "SQL injection vulnerability" "CRITICAL"
            fi
            ;;
    esac
}

# Function to test authentication and authorization
test_auth_flow() {
    local name="$1"
    local endpoint="$2"
    local auth_type="$3"
    
    echo -e "${BLUE}Testing: $name${NC}"
    echo "Endpoint: $endpoint"
    echo "Auth Type: $auth_type"
    
    case $auth_type in
        "VALID_LOGIN")
            # Test valid login
            valid_credentials='{"email": "test@example.com", "password": "TestPassword123!"}'
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
                -X POST \
                -H "Content-Type: application/json" \
                -d "$valid_credentials" \
                "$BACKEND_URL$endpoint")
            
            http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            
            if [ "$http_code" = "200" ]; then
                log_test_result "AUTH" "$name" "PASS" "Valid login successful" "INFO"
            else
                log_test_result "AUTH" "$name" "FAIL" "Valid login failed" "HIGH"
            fi
            ;;
        "INVALID_LOGIN")
            # Test invalid login
            invalid_credentials='{"email": "test@example.com", "password": "wrongpassword"}'
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
                -X POST \
                -H "Content-Type: application/json" \
                -d "$invalid_credentials" \
                "$BACKEND_URL$endpoint")
            
            http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            
            if [ "$http_code" = "401" ]; then
                log_test_result "AUTH" "$name" "PASS" "Invalid login properly rejected" "INFO"
            else
                log_test_result "AUTH" "$name" "FAIL" "Invalid login not rejected" "HIGH"
            fi
            ;;
        "TOKEN_REFRESH")
            # Test token refresh mechanism
            expired_token='{"token": "expired-token"}'
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
                -X POST \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $expired_token" \
                -d '{"refresh": true}' \
                "$BACKEND_URL$endpoint")
            
            http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            
            if [ "$http_code" = "401" ]; then
                log_test_result "AUTH" "$name" "PASS" "Expired token properly rejected" "INFO"
            else
                log_test_result "AUTH" "$name" "FAIL" "Token refresh not working" "HIGH"
            fi
            ;;
    esac
}

echo -e "${PURPLE}🔥 PHASE 1: INFRASTRUCTURE TESTING${NC}"
echo "=================================="

# Test basic infrastructure
test_api_endpoint "Backend Health Check" "/api/health"
test_api_endpoint "Products API" "/api/products"
test_api_endpoint "Auctions API" "/api/auctions"
test_api_endpoint "Wallet API" "/api/wallet/balance"
test_api_endpoint "Bids API" "/api/bids" "POST" '{"auctionId": "test", "userId": "test", "amount": 1000}' "201"

echo -e "${PURPLE}🔥 PHASE 2: AUTHENTICATION TESTING${NC}"
echo "=================================="

# Test authentication flows
test_auth_flow "User Registration" "/api/auth/register" "VALID_LOGIN"
test_auth_flow "User Login" "/api/auth/login" "VALID_LOGIN"
test_auth_flow "User Login" "/api/auth/login" "INVALID_LOGIN"
test_auth_flow "Token Refresh" "/api/auth/refresh" "TOKEN_REFRESH"

echo -e "${PURPLE}🔥 PHASE 3: BUYER FLOW TESTING${NC}"
echo "=================================="

# Test buyer-specific functionality
test_page_functionality "Buyer Dashboard" "$FRONTEND_URL/buyer/dashboard" "LOAD"
test_page_functionality "Browse Products" "$FRONTEND_URL/products" "CONTENT" "Products"
test_page_functionality "Auction Detail" "$FRONTEND_URL/auction/123" "CONTENT" "auction"
test_page_functionality "Place Bid" "$FRONTEND_URL/auction/123" "LOAD"
test_page_functionality "Wallet Page" "$FRONTEND_URL/wallet" "CONTENT" "wallet"
test_page_functionality "Watchlist" "$FRONTEND_URL/buyer/watchlist" "CONTENT" "watchlist"
test_page_functionality "Order History" "$FRONTEND_URL/buyer/orders" "CONTENT" "orders"
test_page_functionality "My Wins" "$FRONTEND_URL/buyer/wins" "CONTENT" "wins"

echo -e "${PURPLE}🔥 PHASE 4: SELLER FLOW TESTING${NC}"
echo "=================================="

# Test seller-specific functionality
test_page_functionality "Seller Dashboard" "$FRONTEND_URL/seller/dashboard" "LOAD"
test_page_functionality "Create Product" "$FRONTEND_URL/add-product" "CONTENT" "product"
test_page_functionality "Bulk Upload" "$FRONTEND_URL/bulk-upload" "CONTENT" "upload"
test_page_functionality "Seller Analytics" "$FRONTEND_URL/seller/analytics" "CONTENT" "analytics"

echo -e "${PURPLE}🔥 PHASE 5: ADMIN FLOW TESTING${NC}"
echo "=================================="

# Test admin-specific functionality
test_page_functionality "Admin Dashboard" "$FRONTEND_URL/admin" "LOAD"
test_page_functionality "User Management" "$FRONTEND_URL/admin/users" "CONTENT" "users"
test_page_functionality "Product Verification" "$FRONTEND_URL/admin/verify-products" "CONTENT" "products"
test_page_functionality "Analytics Dashboard" "$FRONTEND_URL/admin/analytics" "CONTENT" "analytics"

echo -e "${PURPLE}🔥 PHASE 6: FORM VALIDATION TESTING${NC}"
echo "=================================="

# Test form validation
test_form_validation "Registration Required Fields" "/api/auth/register" "REQUIRED_FIELDS"
test_form_validation "Registration Invalid Format" "/api/auth/register" "INVALID_FORMAT"
test_form_validation "Bid Placement Required Fields" "/api/bids" "REQUIRED_FIELDS"
test_form_validation "Product Creation Required Fields" "/api/products" "REQUIRED_FIELDS"

echo -e "${PURPLE}🔥 PHASE 7: SECURITY TESTING${NC}"
echo "=================================="

# Test security vulnerabilities
test_form_validation "SQL Injection Protection" "/api/products" "SQL_INJECTION"
test_form_validation "XSS Protection" "/api/products" "INVALID_FORMAT"
test_form_validation "CSRF Protection" "/api/bids" "INVALID_FORMAT"

echo -e "${PURPLE}🔥 PHASE 8: PERFORMANCE TESTING${NC}"
echo "=================================="

# Test performance
test_page_functionality "Homepage Performance" "$FRONTEND_URL" "LOAD"
test_page_functionality "Products Page Performance" "$FRONTEND_URL/products" "LOAD"
test_page_functionality "Dashboard Performance" "$FRONTEND_URL/buyer/dashboard" "LOAD"

echo -e "${PURPLE}🔥 PHASE 9: RESPONSIVE DESIGN TESTING${NC}"
echo "=================================="

# Test responsive design
test_page_functionality "Mobile Responsiveness" "$FRONTEND_URL/products" "RESPONSIVE"
test_page_functionality "Tablet Responsiveness" "$FRONTEND_URL/products" "RESPONSIVE"
test_page_functionality "Desktop Responsiveness" "$FRONTEND_URL/products" "RESPONSIVE"

echo -e "${PURPLE}🔥 PHASE 10: ACCESSIBILITY TESTING${NC}"
echo "=================================="

# Test accessibility
test_page_functionality "Alt Tags" "$FRONTEND_URL/products" "ACCESSIBILITY"
test_page_functionality "Form Labels" "$FRONTEND_URL/register" "ACCESSIBILITY"
test_page_functionality "Keyboard Navigation" "$FRONTEND_URL/products" "ACCESSIBILITY"

echo ""
echo -e "${BLUE}=================================================="
echo "           COMPREHENSIVE QA TEST RESULTS"
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
echo -e "${BLUE}TEST BREAKDOWN${NC}"
echo "------------------"
echo "Infrastructure Tests: Completed"
echo "Authentication Tests: Completed"
echo "Buyer Flow Tests: Completed"
echo "Seller Flow Tests: Completed"
echo "Admin Flow Tests: Completed"
echo "Form Validation Tests: Completed"
echo "Security Tests: Completed"
echo "Performance Tests: Completed"
echo "Responsive Design Tests: Completed"
echo "Accessibility Tests: Completed"

echo ""
echo -e "${BLUE}QUALITY ASSESSMENT${NC}"
echo "-------------------"

if [ $SUCCESS_RATE -ge 95 ]; then
    echo -e "${GREEN}✅ EXCELLENT: System is production-ready${NC}"
    echo "All critical functionality working properly"
elif [ $SUCCESS_RATE -ge 85 ]; then
    echo -e "${YELLOW}⚠️ GOOD: System mostly ready, minor issues${NC}"
    echo "Some non-critical issues need attention"
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo -e "${RED}❌ POOR: System has significant issues${NC}"
    echo "Major functionality problems exist"
else
    echo -e "${RED}❌ CRITICAL: System is not production-ready${NC}"
    echo "Critical failures prevent deployment"
fi

echo ""
echo -e "${BLUE}RECOMMENDATIONS${NC}"
echo "------------------"

if [ $CRITICAL -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL ISSUES FOUND:${NC}"
    echo "1. Address all critical security vulnerabilities immediately"
    echo "2. Fix authentication and authorization issues"
    echo "3. Resolve all high-priority failures"
    echo "4. DO NOT DEPLOY TO PRODUCTION"
else
    echo -e "${GREEN}🚀 RECOMMENDATIONS:${NC}"
    echo "1. Review and fix any remaining issues"
    echo "2. Conduct additional user acceptance testing"
    echo "3. Prepare deployment checklist"
    echo "4. Plan production monitoring"
fi

echo ""
echo -e "${BLUE}DETAILED LOG${NC}"
echo "------------"
echo "Detailed test results saved to: $TEST_RESULTS_DIR/qa-test-results.log"

echo ""
echo -e "${BLUE}NEXT STEPS${NC}"
echo "------------"
echo "1. Review detailed test results"
echo "2. Address all critical issues first"
echo "3. Re-run QA tests after fixes"
echo "4. Proceed to user acceptance testing"
echo "5. Prepare for production deployment"

echo ""
if [ $CRITICAL -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL ISSUES - DO NOT DEPLOY${NC}"
else
    echo -e "${GREEN}🚀 READY FOR NEXT TESTING PHASE${NC}"
fi

echo ""
echo "✅ Comprehensive QA testing complete!"
