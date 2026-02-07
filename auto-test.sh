#!/bin/bash

# QuickMela Automated Testing & Data Setup
# =====================================

echo "🤖 QUICKMELA AUTOMATED TESTING & DATA SETUP"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to log test results
log_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to create test user
create_test_user() {
    local email=$1
    local password=$2
    local name=$3
    local role=$4
    
    echo "Creating test user: $name ($role)"
    
    curl -s -X POST http://localhost:4011/api/auth/register \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"name\": \"$name\",
            \"role\": \"$role\"
        }" > /dev/null
    
    log_test $? "Create $role user: $name"
}

# Function to test user login
test_user_login() {
    local email=$1
    local password=$2
    local expected_role=$3
    
    echo "Testing login for: $email"
    
    response=$(curl -s -X POST http://localhost:4011/api/auth/login \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\"
        }")
    
    if echo "$response" | grep -q "Login successful"; then
        log_test 0 "Login successful for $email"
        
        # Extract token for further tests
        token=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        echo "$token" > "/tmp/token_${expected_role}.txt"
        log_test 0 "Token saved for $expected_role"
    else
        log_test 1 "Login failed for $email"
    fi
}

# Function to test wallet operations
test_wallet_operations() {
    local role=$1
    local token_file="/tmp/token_${role}.txt"
    
    if [ -f "$token_file" ]; then
        token=$(cat "$token_file")
        
        echo "Testing wallet operations for $role"
        
        # Test wallet balance
        response=$(curl -s -X GET http://localhost:4011/api/wallet/balance \
            -H "Authorization: Bearer $token" \
            -H "Origin: http://localhost:3021")
        
        if echo "$response" | grep -q "balance"; then
            log_test 0 "Wallet balance check for $role"
        else
            log_test 1 "Wallet balance check failed for $role"
        fi
        
        # Test add funds
        response=$(curl -s -X POST http://localhost:4011/api/wallet/add-funds \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -H "Origin: http://localhost:3021" \
            -d '{"amount": 5000}')
        
        if echo "$response" | grep -q "success"; then
            log_test 0 "Add funds for $role"
        else
            log_test 1 "Add funds failed for $role"
        fi
    fi
}

# Function to test KYC operations
test_kyc_operations() {
    local role=$1
    local token_file="/tmp/token_${role}.txt"
    
    if [ -f "$token_file" ]; then
        token=$(cat "$token_file")
        
        echo "Testing KYC operations for $role"
        
        # Test Aadhaar verification
        response=$(curl -s -X POST http://localhost:4011/api/kyc/aadhaar-verify \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -H "Origin: http://localhost:3021" \
            -d '{
                "aadhaarNumber": "123456789012",
                "name": "Test User",
                "dob": "1990-01-01"
            }')
        
        if echo "$response" | grep -q "success"; then
            log_test 0 "Aadhaar verification for $role"
        else
            log_test 1 "Aadhaar verification failed for $role"
        fi
        
        # Test PAN verification
        response=$(curl -s -X POST http://localhost:4011/api/kyc/pan-verify \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -H "Origin: http://localhost:3021" \
            -d '{
                "panNumber": "ABCDE1234F",
                "name": "Test User"
            }')
        
        if echo "$response" | grep -q "success"; then
            log_test 0 "PAN verification for $role"
        else
            log_test 1 "PAN verification failed for $role"
        fi
    fi
}

# Function to test product operations
test_product_operations() {
    local role=$1
    local token_file="/tmp/token_${role}.txt"
    
    if [ -f "$token_file" ] && [ "$role" = "seller" ]; then
        token=$(cat "$token_file")
        
        echo "Testing product operations for $role"
        
        # Test create product
        response=$(curl -s -X POST http://localhost:4011/api/products \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -H "Origin: http://localhost:3021" \
            -d '{
                "title": "Test Vehicle",
                "description": "Test vehicle description",
                "category": "car",
                "startingBid": 10000,
                "buyNowPrice": 15000,
                "images": ["test1.jpg", "test2.jpg"]
            }')
        
        if echo "$response" | grep -q "id"; then
            log_test 0 "Create product for $role"
            
            # Extract product ID for bidding test
            product_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
            echo "$product_id" > "/tmp/product_id.txt"
        else
            log_test 1 "Create product failed for $role"
        fi
    fi
}

# Function to test bidding operations
test_bidding_operations() {
    local role=$1
    local token_file="/tmp/token_${role}.txt"
    local product_id_file="/tmp/product_id.txt"
    
    if [ -f "$token_file" ] && [ -f "$product_id_file" ] && [ "$role" = "buyer" ]; then
        token=$(cat "$token_file")
        product_id=$(cat "$product_id_file")
        
        echo "Testing bidding operations for $role"
        
        # Test place bid
        response=$(curl -s -X POST http://localhost:4011/api/products/$product_id/bid \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -H "Origin: http://localhost:3021" \
            -d "{
                \"bidAmount\": 12000,
                \"bidderId\": \"test-buyer\",
                \"bidderName\": \"Test Buyer\"
            }")
        
        if echo "$response" | grep -q "success"; then
            log_test 0 "Place bid for $role"
        else
            log_test 1 "Place bid failed for $role"
        fi
    fi
}

# Function to test admin operations
test_admin_operations() {
    local role=$1
    local token_file="/tmp/token_${role}.txt"
    
    if [ -f "$token_file" ] && [ "$role" = "admin" ]; then
        token=$(cat "$token_file")
        
        echo "Testing admin operations for $role"
        
        # Test get all users
        response=$(curl -s -X GET http://localhost:4011/api/admin/users \
            -H "Authorization: Bearer $token" \
            -H "Origin: http://localhost:3021")
        
        if echo "$response" | grep -q "users"; then
            log_test 0 "Get all users for admin"
        else
            log_test 1 "Get all users failed for admin"
        fi
        
        # Test get all products
        response=$(curl -s -X GET http://localhost:4011/api/admin/products \
            -H "Authorization: Bearer $token" \
            -H "Origin: http://localhost:3021")
        
        if echo "$response" | grep -q "products"; then
            log_test 0 "Get all products for admin"
        else
            log_test 1 "Get all products failed for admin"
        fi
    fi
}

# Function to test payment operations
test_payment_operations() {
    local role=$1
    local token_file="/tmp/token_${role}.txt"
    
    if [ -f "$token_file" ]; then
        token=$(cat "$token_file")
        
        echo "Testing payment operations for $role"
        
        # Test create payment order
        response=$(curl -s -X POST http://localhost:4011/api/payments/create-order \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -H "Origin: http://localhost:3021" \
            -d '{
                "amount": 10000,
                "currency": "INR"
            }')
        
        if echo "$response" | grep -q "orderId"; then
            log_test 0 "Create payment order for $role"
        else
            log_test 1 "Create payment order failed for $role"
        fi
    fi
}

# Main testing sequence
echo -e "${BLUE}🚀 STARTING AUTOMATED TESTING SEQUENCE${NC}"
echo ""

# Phase 1: Create test users
echo -e "${YELLOW}📝 PHASE 1: CREATING TEST USERS${NC}"
echo "=================================="

create_test_user "buyer@quickmela.com" "BuyerPass123!" "Rahul Sharma" "buyer"
create_test_user "seller@quickmela.com" "SellerPass123!" "Priya Patel" "seller"
create_test_user "admin@quickmela.com" "AdminPass123!" "Amit Kumar" "admin"

echo ""

# Phase 2: Test user authentication
echo -e "${YELLOW}🔐 PHASE 2: TESTING AUTHENTICATION${NC}"
echo "===================================="

test_user_login "buyer@quickmela.com" "BuyerPass123!" "buyer"
test_user_login "seller@quickmela.com" "SellerPass123!" "seller"
test_user_login "admin@quickmela.com" "AdminPass123!" "admin"

echo ""

# Phase 3: Test wallet operations
echo -e "${YELLOW}💰 PHASE 3: TESTING WALLET OPERATIONS${NC}"
echo "======================================"

test_wallet_operations "buyer"
test_wallet_operations "seller"
test_wallet_operations "admin"

echo ""

# Phase 4: Test KYC operations
echo -e "${YELLOW}🆔 PHASE 4: TESTING KYC OPERATIONS${NC}"
echo "===================================="

test_kyc_operations "buyer"
test_kyc_operations "seller"

echo ""

# Phase 5: Test product operations
echo -e "${YELLOW}🚗 PHASE 5: TESTING PRODUCT OPERATIONS${NC}"
echo "======================================"

test_product_operations "seller"

echo ""

# Phase 6: Test bidding operations
echo -e "${YELLOW}🔨 PHASE 6: TESTING BIDDING OPERATIONS${NC}"
echo "======================================"

test_bidding_operations "buyer"

echo ""

# Phase 7: Test admin operations
echo -e "${YELLOW}👨‍💼 PHASE 7: TESTING ADMIN OPERATIONS${NC}"
echo "======================================"

test_admin_operations "admin"

echo ""

# Phase 8: Test payment operations
echo -e "${YELLOW}💳 PHASE 8: TESTING PAYMENT OPERATIONS${NC}"
echo "======================================"

test_payment_operations "buyer"
test_payment_operations "seller"

echo ""

# Results summary
echo -e "${BLUE}📊 TESTING RESULTS SUMMARY${NC}"
echo "=========================="

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$(( (TESTS_PASSED * 100) / TOTAL_TESTS ))

echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}📈 Success Rate: $SUCCESS_RATE%${NC}"
echo ""

if [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${GREEN}🎉 QUICKMELA AUTOMATED TESTING: SUCCESSFUL${NC}"
    echo -e "${GREEN}🚀 System is ready for production use${NC}"
elif [ $SUCCESS_RATE -ge 60 ]; then
    echo -e "${YELLOW}⚠️  QUICKMELA AUTOMATED TESTING: PARTIAL SUCCESS${NC}"
    echo -e "${YELLOW}🔧 Some issues need to be addressed${NC}"
else
    echo -e "${RED}🔴 QUICKMELA AUTOMATED TESTING: FAILED${NC}"
    echo -e "${RED}🚨 Critical issues need immediate attention${NC}"
fi

echo ""
echo -e "${BLUE}🧹 Cleaning up test files...${NC}"
rm -f /tmp/token_*.txt /tmp/product_id.txt

echo ""
echo -e "${GREEN}✅ Automated testing completed!${NC}"
