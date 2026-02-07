#!/bin/bash

# Buyer Dashboard Navigation Test Script
# Tests all navigation links from the buyer dashboard to ensure no 404 errors

echo "🚀 Starting Buyer Dashboard Navigation Test..."
echo "=============================================="

BASE_URL="http://localhost:3021"
TEST_RESULTS=()
FAILED_TESTS=()
PASSED_TESTS=()

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test a URL
test_url() {
    local url="$1"
    local description="$2"
    
    echo -n "Testing: $description ($url)... "
    
    # Make HTTP request and get status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (200)"
        PASSED_TESTS+=("$description")
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} ($status_code)"
        FAILED_TESTS+=("$description ($url) - Status: $status_code")
        return 1
    fi
}

# Function to test buyer-specific routes
test_buyer_routes() {
    echo -e "\n${BLUE}Testing Buyer Dashboard Navigation Routes${NC}"
    echo "--------------------------------------------"
    
    # Test main buyer dashboard
    test_url "$BASE_URL/buyer/dashboard" "Buyer Dashboard"
    
    # Test buyer navigation links found in dashboard
    test_url "$BASE_URL/buyer/watchlist" "Buyer Watchlist"
    test_url "$BASE_URL/buyer/orders" "Buyer Orders"
    test_url "$BASE_URL/buyer/wins" "Buyer Wins"
    test_url "$BASE_URL/buyer/saved-searches" "Buyer Saved Searches"
    test_url "$BASE_URL/buyer/auctions" "Buyer Auctions"
    
    # Test wallet functionality
    test_url "$BASE_URL/wallet" "Wallet Page"
    test_url "$BASE_URL/wallet/add" "Add Funds Page"
    
    # Test auction detail pages
    test_url "$BASE_URL/auction/123" "Auction Detail Page (Sample ID)"
    test_url "$BASE_URL/live-auction/123" "Live Auction Page"
    test_url "$BASE_URL/timed-auction/123" "Timed Auction Page"
    test_url "$BASE_URL/tender-auction/123" "Tender Auction Page"
    
    # Test alternative routes (legacy/redirects)
    test_url "$BASE_URL/watchlist" "Legacy Watchlist Route"
    test_url "$BASE_URL/my/orders" "Legacy Orders Route"
    test_url "$BASE_URL/my/wins" "Legacy Wins Route"
    test_url "$BASE_URL/products" "Products/Auctions Route"
}

# Function to test authentication redirects
test_auth_flows() {
    echo -e "\n${BLUE}Testing Authentication Flows${NC}"
    echo "-------------------------------"
    
    # Test that protected routes redirect when not authenticated
    test_url "$BASE_URL/buyer/dashboard" "Protected Buyer Dashboard (should redirect)"
    test_url "$BASE_URL/wallet" "Protected Wallet (should redirect)"
    test_url "$BASE_URL/wallet/add" "Protected Add Funds (should redirect)"
}

# Function to test fallback routes
test_fallback_routes() {
    echo -e "\n${BLUE}Testing Fallback Routes${NC}"
    echo "---------------------------"
    
    # Test 404 handling
    test_url "$BASE_URL/buyer/nonexistent" "Non-existent Buyer Route"
    test_url "$BASE_URL/auction/invalid" "Invalid Auction ID"
    test_url "$BASE_URL/nonexistent-page" "Completely Invalid Route"
}

# Function to test performance
test_performance() {
    echo -e "\n${BLUE}Testing Page Load Performance${NC}"
    echo "----------------------------------"
    
    # Test load times for key pages
    for url in "$BASE_URL/buyer/dashboard" "$BASE_URL/wallet" "$BASE_URL/auctions"; do
        echo -n "Testing load time for $url... "
        load_time=$(curl -s -o /dev/null -w "%{time_total}" "$url")
        if (( $(echo "$load_time < 3.0" | bc -l) )); then
            echo -e "${GREEN}✓ GOOD${NC} (${load_time}s)"
        else
            echo -e "${YELLOW}⚠ SLOW${NC} (${load_time}s)"
        fi
    done
}

# Function to generate report
generate_report() {
    echo -e "\n${BLUE}=============================================="
    echo "           TEST RESULTS SUMMARY"
    echo "==============================================${NC}"
    
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
    
    total_tests=$((${#PASSED_TESTS[@]} + ${#FAILED_TESTS[@]}))
    pass_rate=$((${#PASSED_TESTS[@]} * 100 / total_tests))
    
    echo -e "\n${BLUE}SUMMARY${NC}"
    echo "--------"
    echo "Total Tests: $total_tests"
    echo "Passed: ${#PASSED_TESTS[@]}"
    echo "Failed: ${#FAILED_TESTS[@]}"
    echo "Success Rate: $pass_rate%"
    
    if [ $pass_rate -eq 100 ]; then
        echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Buyer navigation is ready for production.${NC}"
        exit 0
    elif [ $pass_rate -ge 80 ]; then
        echo -e "\n${YELLOW}⚠️  MOST TESTS PASSED. Review failed tests before production.${NC}"
        exit 1
    else
        echo -e "\n${RED}❌ MANY TESTS FAILED. Fix critical issues before production.${NC}"
        exit 2
    fi
}

# Check if server is running
echo "Checking if server is running at $BASE_URL..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Server is not running at $BASE_URL${NC}"
    echo "Please start the development server with: npm run dev"
    exit 3
fi

echo -e "${GREEN}✓ Server is running${NC}"

# Run all tests
test_buyer_routes
test_auth_flows
test_fallback_routes
test_performance

# Generate final report
generate_report
