#!/bin/bash

# Comprehensive Application Flow Testing Script
# Tests all major user flows and data connectivity

echo "🚀 Starting Comprehensive Application Flow Testing..."
echo "=================================================="

BASE_URL="http://localhost:3021"
BACKEND_URL="http://localhost:4010"
FAILED_TESTS=()
PASSED_TESTS=()
CRITICAL_ERRORS=()

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to test a URL with detailed analysis
test_url_detailed() {
    local url="$1"
    local description="$2"
    local expected_content="$3"
    
    echo -n "Testing: $description ($url)... "
    
    # Make HTTP request and get status code and response time
    response=$(curl -s -w "\nHTTPSTATUS:%{http_code}\nTIME_TOTAL:%{time_total}\nSIZE:%{size_download}" "$url")
    
    # Parse response
    status_code=$(echo "$response" | grep -o 'HTTPSTATUS:[0-9]*' | cut -d: -f2)
    time_total=$(echo "$response" | grep -o 'TIME_TOTAL:[0-9.]*' | cut -d: -f2)
    size=$(echo "$response" | grep -o 'SIZE:[0-9]*' | cut -d: -f2)
    content=$(echo "$response" | sed '/HTTPSTATUS:/d' | sed '/TIME_TOTAL:/d' | sed '/SIZE:/d')
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (${time_total}s, ${size} bytes)"
        PASSED_TESTS+=("$description")
        
        # Check for expected content if provided
        if [ -n "$expected_content" ]; then
            if echo "$content" | grep -q "$expected_content"; then
                echo -e "  ${GREEN}✓ Content verified${NC}"
            else
                echo -e "  ${YELLOW}⚠ Content mismatch${NC}"
                FAILED_TESTS+=("$description (content issue)")
            fi
        fi
        
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} ($status_code)"
        FAILED_TESTS+=("$description ($status_code)")
        
        # Check for critical errors
        if [ "$status_code" = "500" ]; then
            CRITICAL_ERRORS+=("$description - Server Error")
        elif [ "$status_code" = "404" ]; then
            CRITICAL_ERRORS+=("$description - Not Found")
        fi
        
        return 1
    fi
}

# Function to test API endpoints
test_api_endpoint() {
    local endpoint="$1"
    local description="$2"
    local method="${3:-GET}"
    
    echo -n "Testing API: $description ($endpoint)... "
    
    # Test API endpoint
    if [ "$method" = "POST" ]; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password","name":"Test User"}' "$BACKEND_URL$endpoint")
    else
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL$endpoint")
    fi
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ] || [ "$status_code" = "401" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($status_code)"
        PASSED_TESTS+=("$description")
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} ($status_code)"
        FAILED_TESTS+=("$description ($status_code)")
        return 1
    fi
}

# Function to test database connectivity
test_database_connectivity() {
    echo -e "\n${BLUE}Testing Database Connectivity${NC}"
    echo "-------------------------------"
    
    # Test Supabase connection
    echo -n "Testing Supabase connection... "
    
    # Extract Supabase URL from .env
    supabase_url=$(grep "VITE_SUPABASE_URL" /Users/sanieevmusugu/Desktop/quick-bid-jan-6/.env | cut -d'"' -f2)
    
    if [ -n "$supabase_url" ]; then
        # Test basic connectivity to Supabase
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$supabase_url/rest/v1/" -H "apikey: $(grep 'VITE_SUPABASE_ANON_KEY' /Users/sanieevmusugu/Desktop/quick-bid-jan-6/.env | cut -d'"' -f2)")
        
        if [ "$status_code" = "200" ] || [ "$status_code" = "406" ]; then
            echo -e "${GREEN}✓ CONNECTED${NC}"
            PASSED_TESTS+=("Supabase Database")
        else
            echo -e "${RED}✗ FAILED${NC} ($status_code)"
            FAILED_TESTS+=("Supabase Database ($status_code)")
            CRITICAL_ERRORS+=("Database Connection Failed")
        fi
    else
        echo -e "${RED}✗ NOT CONFIGURED${NC}"
        FAILED_TESTS+=("Supabase Configuration")
        CRITICAL_ERRORS+=("Database Not Configured")
    fi
}

# Function to test authentication flows
test_authentication_flows() {
    echo -e "\n${BLUE}Testing Authentication Flows${NC}"
    echo "--------------------------------"
    
    # Test login page
    test_url_detailed "$BASE_URL/login" "Login Page" "root"
    
    # Test register page
    test_url_detailed "$BASE_URL/register" "Register Page" "root"
    
    # Test demo login
    test_url_detailed "$BASE_URL/demo" "Demo Login" "root"
    
    # Test protected routes (should redirect)
    test_url_detailed "$BASE_URL/buyer/dashboard" "Protected Dashboard (redirect)"
    test_url_detailed "$BASE_URL/wallet" "Protected Wallet (redirect)"
}

# Function to test buyer flows
test_buyer_flows() {
    echo -e "\n${BLUE}Testing Buyer Flows${NC}"
    echo "-------------------------"
    
    # Test all buyer routes
    test_url_detailed "$BASE_URL/buyer/dashboard" "Buyer Dashboard"
    test_url_detailed "$BASE_URL/buyer/watchlist" "Buyer Watchlist"
    test_url_detailed "$BASE_URL/buyer/orders" "Buyer Orders"
    test_url_detailed "$BASE_URL/buyer/wins" "Buyer Wins"
    test_url_detailed "$BASE_URL/buyer/saved-searches" "Buyer Saved Searches"
    test_url_detailed "$BASE_URL/buyer/auctions" "Buyer Auctions"
    
    # Test wallet functionality
    test_url_detailed "$BASE_URL/wallet" "Wallet Page"
    test_url_detailed "$BASE_URL/wallet/add" "Add Funds Page"
    
    # Test auction pages
    test_url_detailed "$BASE_URL/auction/123" "Auction Detail Page"
    test_url_detailed "$BASE_URL/auctions" "Auctions List"
    test_url_detailed "$BASE_URL/products" "Products Page"
}

# Function to test seller flows
test_seller_flows() {
    echo -e "\n${BLUE}Testing Seller Flows${NC}"
    echo "--------------------------"
    
    # Test seller routes
    test_url_detailed "$BASE_URL/seller/dashboard" "Seller Dashboard"
    test_url_detailed "$BASE_URL/seller/membership" "Seller Membership"
    test_url_detailed "$BASE_URL/add-product" "Add Product"
    test_url_detailed "$BASE_URL/bulk-upload" "Bulk Upload"
}

# Function to test admin flows
test_admin_flows() {
    echo -e "\n${BLUE}Testing Admin Flows${NC}"
    echo "------------------------"
    
    # Test admin routes
    test_url_detailed "$BASE_URL/admin" "Admin Dashboard"
    test_url_detailed "$BASE_URL/admin/users" "Admin User Management"
    test_url_detailed "$BASE_URL/admin/products" "Admin Products"
    test_url_detailed "$BASE_URL/admin/analytics" "Admin Analytics"
}

# Function to test API endpoints
test_api_endpoints() {
    echo -e "\n${BLUE}Testing API Endpoints${NC}"
    echo "-------------------------"
    
    # Test public API endpoints
    test_api_endpoint "/api/auth/login" "Auth Login API" "POST"
    test_api_endpoint "/api/auth/register" "Auth Register API" "POST"
    test_api_endpoint "/api/products" "Products API" "GET"
    test_api_endpoint "/api/auctions" "Auctions API" "GET"
}

# Function to test static assets
test_static_assets() {
    echo -e "\n${BLUE}Testing Static Assets${NC}"
    echo "-----------------------"
    
    # Test static files
    test_url_detailed "$BASE_URL/favicon.ico" "Favicon"
    test_url_detailed "$BASE_URL/manifest.json" "Manifest"
}

# Function to test error handling
test_error_handling() {
    echo -e "\n${BLUE}Testing Error Handling${NC}"
    echo "-------------------------"
    
    # Test 404 handling
    test_url_detailed "$BASE_URL/nonexistent-page" "404 Error Page" "root"
    test_url_detailed "$BASE_URL/buyer/nonexistent" "Buyer 404 Page" "root"
    
    # Test unauthorized access
    test_url_detailed "$BASE_URL/admin/secret" "Unauthorized Admin Access"
}

# Function to generate comprehensive report
generate_comprehensive_report() {
    echo -e "\n${PURPLE}=================================================="
    echo "           COMPREHENSIVE TEST REPORT"
    echo "==================================================${NC}"
    
    echo -e "\n${GREEN}✓ PASSED TESTS (${#PASSED_TESTS[@]})${NC}"
    for test in "${PASSED_TESTS[@]}"; do
        echo "  ✓ $test"
    done
    
    if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
        echo -e "\n${RED}✗ FAILED TESTS (${#FAILED_TESTS[@]})${NC}"
        for test in "${FAILED_TESTS[@]}"; do
            echo "  ✗ $test"
        done
    fi
    
    if [ ${#CRITICAL_ERRORS[@]} -gt 0 ]; then
        echo -e "\n${RED}🚨 CRITICAL ERRORS (${#CRITICAL_ERRORS[@]})${NC}"
        for error in "${CRITICAL_ERRORS[@]}"; do
            echo "  🔥 $error"
        done
    fi
    
    total_tests=$((${#PASSED_TESTS[@]} + ${#FAILED_TESTS[@]}))
    pass_rate=$((${#PASSED_TESTS[@]} * 100 / total_tests))
    
    echo -e "\n${BLUE}SUMMARY${NC}"
    echo "--------"
    echo "Total Tests: $total_tests"
    echo "Passed: ${#PASSED_TESTS[@]}"
    echo "Failed: ${#FAILED_TESTS[@]}"
    echo "Critical Errors: ${#CRITICAL_ERRORS[@]}"
    echo "Success Rate: $pass_rate%"
    
    # Recommendations
    echo -e "\n${BLUE}RECOMMENDATIONS${NC}"
    echo "----------------"
    
    if [ ${#CRITICAL_ERRORS[@]} -gt 0 ]; then
        echo -e "${RED}🔥 CRITICAL: Fix database connectivity and backend errors immediately${NC}"
    fi
    
    if [ $pass_rate -lt 80 ]; then
        echo -e "${RED}❌ LOW SUCCESS RATE: Major issues need to be addressed${NC}"
    elif [ $pass_rate -lt 95 ]; then
        echo -e "${YELLOW}⚠️  MODERATE SUCCESS RATE: Some issues need attention${NC}"
    else
        echo -e "${GREEN}✅ HIGH SUCCESS RATE: Application is performing well${NC}"
    fi
    
    if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
        echo -e "${YELLOW}📋 ACTION ITEMS:${NC}"
        echo "  • Review failed tests and fix routing issues"
        echo "  • Check authentication and authorization logic"
        echo "  • Verify API endpoint implementations"
        echo "  • Test database connectivity and queries"
    fi
    
    # Final verdict
    if [ ${#CRITICAL_ERRORS[@]} -eq 0 ] && [ $pass_rate -ge 95 ]; then
        echo -e "\n${GREEN}🎉 APPLICATION IS PRODUCTION-READY!${NC}"
        echo "All critical systems are functioning properly."
        exit 0
    elif [ ${#CRITICAL_ERRORS[@]} -eq 0 ] && [ $pass_rate -ge 80 ]; then
        echo -e "\n${YELLOW}⚠️  APPLICATION IS MOSTLY READY${NC}"
        echo "Minor issues should be addressed before production."
        exit 1
    else
        echo -e "\n${RED}❌ APPLICATION NEEDS MAJOR FIXES${NC}"
        echo "Critical issues must be resolved before production."
        exit 2
    fi
}

# Check if server is running
echo "Checking if server is running at $BASE_URL..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Server is not running at $BASE_URL${NC}"
    echo "Please start development server with: npm run dev"
    exit 3
fi

echo -e "${GREEN}✓ Server is running${NC}"

# Run all test suites
test_database_connectivity
test_authentication_flows
test_buyer_flows
test_seller_flows
test_admin_flows
test_api_endpoints
test_static_assets
test_error_handling

# Generate final comprehensive report
generate_comprehensive_report
