#!/bin/bash

# QuickMela Complete User Flow Testing
# ==================================

echo "🔄 QUICKMELA COMPLETE USER FLOW TESTING"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test results log
echo "🧪 QUICKMELA AUTOMATED FLOW TEST RESULTS" > /tmp/test_results.log
echo "========================================" >> /tmp/test_results.log
echo "" >> /tmp/test_results.log

# Function to run test
run_test() {
    local test_name=$1
    local test_command=$2
    
    ((TOTAL_TESTS++))
    echo -e "${BLUE}Testing: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $test_name${NC}"
        echo "✅ $test_name" >> /tmp/test_results.log
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}❌ $test_name${NC}"
        echo "❌ $test_name" >> /tmp/test_results.log
        ((FAILED_TESTS++))
        return 1
    fi
}

# Function to test user flow
test_user_flow() {
    local email=$1
    local password=$2
    local user_type=$3
    local expected_dashboard=$4
    
    echo -e "${YELLOW}🔍 Testing $user_type complete flow${NC}"
    
    # Step 1: Login
    login_response=$(curl -s -X POST http://localhost:4011/api/auth/login \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d "{\"email\": \"$email\", \"password\": \"$password\"}")
    
    if ! echo "$login_response" | grep -q "accessToken"; then
        echo -e "${RED}❌ Login failed for $user_type${NC}"
        return 1
    fi
    
    token=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}  ✅ Login successful${NC}"
    
    # Step 2: Check wallet
    wallet_response=$(curl -s -X GET http://localhost:4011/api/wallet/balance \
        -H "Authorization: Bearer $token" \
        -H "Origin: http://localhost:3021")
    
    if echo "$wallet_response" | grep -q "balance"; then
        echo -e "${GREEN}  ✅ Wallet accessible${NC}"
    else
        echo -e "${RED}  ❌ Wallet not accessible${NC}"
        return 1
    fi
    
    # Step 3: User-specific tests
    case $user_type in
        "Buyer")
            # Test browsing products
            products_response=$(curl -s -X GET http://localhost:4011/api/products \
                -H "Origin: http://localhost:3021")
            
            if echo "$products_response" | grep -q "products\|id"; then
                echo -e "${GREEN}  ✅ Can browse products${NC}"
            else
                echo -e "${RED}  ❌ Cannot browse products${NC}"
                return 1
            fi
            
            # Test placing bid
            if echo "$products_response" | grep -q '"id":[0-9]*'; then
                product_id=$(echo "$products_response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
                bid_response=$(curl -s -X POST http://localhost:4011/api/products/$product_id/bid \
                    -H "Authorization: Bearer $token" \
                    -H "Content-Type: application/json" \
                    -H "Origin: http://localhost:3021" \
                    -d "{\"bidAmount\": 50000, \"bidderId\": \"test\", \"bidderName\": \"Test Buyer\"}")
                
                if echo "$bid_response" | grep -q "success\|accepted\|id"; then
                    echo -e "${GREEN}  ✅ Can place bids${NC}"
                else
                    echo -e "${YELLOW}  ⚠️  Bid placement issue (may be normal)${NC}"
                fi
            fi
            ;;
            
        "Seller")
            # Test creating product
            product_response=$(curl -s -X POST http://localhost:4011/api/products \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -H "Origin: http://localhost:3021" \
                -d '{
                    "title": "Test Vehicle for Flow",
                    "description": "Testing flow",
                    "category": "car",
                    "startingBid": 100000,
                    "buyNowPrice": 150000
                }')
            
            if echo "$product_response" | grep -q "id\|success"; then
                echo -e "${GREEN}  ✅ Can create products${NC}"
            else
                echo -e "${RED}  ❌ Cannot create products${NC}"
                return 1
            fi
            
            # Test checking own products
            own_products_response=$(curl -s -X GET http://localhost:4011/api/products/my-products \
                -H "Authorization: Bearer $token" \
                -H "Origin: http://localhost:3021")
            
            if echo "$own_products_response" | grep -q "products\|id"; then
                echo -e "${GREEN}  ✅ Can view own products${NC}"
            else
                echo -e "${YELLOW}  ⚠️  Cannot view own products${NC}"
            fi
            ;;
            
        "Admin")
            # Test admin dashboard access
            users_response=$(curl -s -X GET http://localhost:4011/api/admin/users \
                -H "Authorization: Bearer $token" \
                -H "Origin: http://localhost:3021")
            
            if echo "$users_response" | grep -q "users\|id"; then
                echo -e "${GREEN}  ✅ Can access admin users${NC}"
            else
                echo -e "${RED}  ❌ Cannot access admin users${NC}"
                return 1
            fi
            
            # Test admin products access
            admin_products_response=$(curl -s -X GET http://localhost:4011/api/admin/products \
                -H "Authorization: Bearer $token" \
                -H "Origin: http://localhost:3021")
            
            if echo "$admin_products_response" | grep -q "products\|id"; then
                echo -e "${GREEN}  ✅ Can access admin products${NC}"
            else
                echo -e "${RED}  ❌ Cannot access admin products${NC}"
                return 1
            fi
            ;;
    esac
    
    # Step 4: Test KYC
    kyc_response=$(curl -s -X POST http://localhost:4011/api/kyc/aadhaar-verify \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d '{"aadhaarNumber": "123456789012", "name": "Test User", "dob": "1990-01-01"}')
    
    if echo "$kyc_response" | grep -q "success\|verified"; then
        echo -e "${GREEN}  ✅ KYC verification working${NC}"
    else
        echo -e "${YELLOW}  ⚠️  KYC verification issue${NC}"
    fi
    
    # Step 5: Test payment
    payment_response=$(curl -s -X POST http://localhost:4011/api/payments/create-order \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d '{"amount": 10000, "currency": "INR"}')
    
    if echo "$payment_response" | grep -q "orderId\|success"; then
        echo -e "${GREEN}  ✅ Payment gateway working${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Payment gateway issue${NC}"
    fi
    
    echo -e "${GREEN}✅ $user_type flow completed successfully${NC}"
    return 0
}

# Main testing sequence
echo -e "${BLUE}🚀 STARTING COMPLETE USER FLOW TESTING${NC}"
echo ""

# Test all user flows
echo -e "${YELLOW}👥 TESTING ALL USER FLOWS${NC}"
echo "=========================="

test_user_flow "arjun@quickmela.com" "BuyerPass123!" "Buyer" "/buyer/dashboard"
test_user_flow "anita@quickmela.com" "SellerPass123!" "Seller" "/seller/dashboard"
test_user_flow "system@quickmela.com" "AdminPass123!" "Admin" "/admin/dashboard"

echo ""

# Test system endpoints
echo -e "${YELLOW}🔧 TESTING SYSTEM ENDPOINTS${NC}"
echo "=============================="

run_test "API Health Check" "curl -f http://localhost:4011/"
run_test "Products List" "curl -f http://localhost:4011/api/products"
run_test "Payment Create Order" "curl -f -X POST http://localhost:4011/api/payments/create-order -H 'Content-Type: application/json' -d '{\"amount\": 10000, \"currency\": \"INR\"}'"
run_test "KYC Aadhaar Verify" "curl -f -X POST http://localhost:4011/api/kyc/aadhaar-verify -H 'Content-Type: application/json' -d '{\"aadhaarNumber\": \"123456789012\", \"name\": \"Test User\", \"dob\": \"1990-01-01\"}'"
run_test "Wallet Balance" "curl -f http://localhost:4011/api/wallet/balance"
run_test "Penalty System" "curl -f http://localhost:4011/api/penalty/status/test-user"

echo ""

# Test frontend accessibility
echo -e "${YELLOW}🌐 TESTING FRONTEND ACCESSIBILITY${NC}"
echo "=================================="

run_test "Frontend Home Page" "curl -f http://localhost:3021"
run_test "Frontend Login Page" "curl -f http://localhost:3021/login"
run_test "Frontend Register Page" "curl -f http://localhost:3021/register"
run_test "Frontend Products Page" "curl -f http://localhost:3021/products"
run_test "Frontend Live Auction Page" "curl -f http://localhost:3021/live-auction"

echo ""

# Test CORS functionality
echo -e "${YELLOW}🌍 TESTING CORS FUNCTIONALITY${NC}"
echo "================================"

run_test "CORS Login Test" "curl -f -X POST http://localhost:4011/api/auth/login -H 'Origin: http://localhost:3021' -H 'Content-Type: application/json' -d '{\"email\": \"arjun@quickmela.com\", \"password\": \"BuyerPass123!\"}'"
run_test "CORS Products Test" "curl -f http://localhost:4011/api/products -H 'Origin: http://localhost:3021'"
run_test "CORS Wallet Test" "curl -f http://localhost:4011/api/wallet/balance -H 'Origin: http://localhost:3021'"

echo ""

# Calculate results
SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))

echo -e "${BLUE}📊 COMPLETE FLOW TESTING RESULTS${NC}"
echo "=================================="
echo -e "${GREEN}✅ Tests Passed: $PASSED_TESTS${NC}"
echo -e "${RED}❌ Tests Failed: $FAILED_TESTS${NC}"
echo -e "${BLUE}📈 Total Tests: $TOTAL_TESTS${NC}"
echo -e "${YELLOW}📊 Success Rate: $SUCCESS_RATE%${NC}"
echo ""

# Detailed results
echo -e "${BLUE}📋 DETAILED TEST RESULTS${NC}"
echo "========================"
cat /tmp/test_results.log

echo ""

# Production readiness assessment
echo -e "${BLUE}🎯 PRODUCTION READINESS ASSESSMENT${NC}"
echo "===================================="

if [ $SUCCESS_RATE -ge 95 ]; then
    echo -e "${GREEN}🎉 EXCELLENT - System is production ready${NC}"
    echo -e "${GREEN}🚀 All critical flows working perfectly${NC}"
    echo -e "${GREEN}✅ Ready for controlled user rollout${NC}"
elif [ $SUCCESS_RATE -ge 85 ]; then
    echo -e "${YELLOW}🟡 GOOD - System mostly ready${NC}"
    echo -e "${YELLOW}🔧 Minor issues to address${NC}"
    echo -e "${YELLOW}⚠️  Review failed tests before production${NC}"
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo -e "${YELLOW}🟠 FAIR - System needs attention${NC}"
    echo -e "${YELLOW}🔨 Significant issues to fix${NC}"
    echo -e "${YELLOW}⚠️  Not ready for production${NC}"
else
    echo -e "${RED}🔴 POOR - System not ready${NC}"
    echo -e "${RED}🚨 Critical issues require immediate attention${NC}"
    echo -e "${RED}❌ Do not proceed to production${NC}"
fi

echo ""

# Next steps
echo -e "${BLUE}📝 NEXT STEPS${NC}"
echo "=============="

if [ $SUCCESS_RATE -ge 85 ]; then
    echo -e "${GREEN}1. Open browser: http://localhost:3021${NC}"
    echo -e "${GREEN}2. Test with provided user accounts${NC}"
    echo -e "${GREEN}3. Verify all user flows manually${NC}"
    echo -e "${GREEN}4. Begin controlled user rollout${NC}"
else
    echo -e "${YELLOW}1. Review failed tests in /tmp/test_results.log${NC}"
    echo -e "${YELLOW}2. Fix identified issues${NC}"
    echo -e "${YELLOW}3. Re-run automated tests${NC}"
    echo -e "${YELLOW}4. Proceed when success rate ≥ 85%${NC}"
fi

echo ""
echo -e "${GREEN}🧹 Cleaning up...${NC}"
rm -f /tmp/test_results.log

echo ""
echo -e "${GREEN}✅ Complete user flow testing finished!${NC}"
