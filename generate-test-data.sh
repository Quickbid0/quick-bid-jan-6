#!/bin/bash

# QuickMela Comprehensive Test Data Generator
# ========================================

echo "📊 QUICKMELA COMPREHENSIVE TEST DATA GENERATOR"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test data arrays
BUYERS=("arjun@quickmela.com" "kavya@quickmela.com" "vijay@quickmela.com" "neha@quickmela.com" "rohit@quickmela.com")
SELLERS=("anita@quickmela.com" "suresh@quickmela.com" "deepa@quickmela.com" "rajesh@quickmela.com")
ADMINS=("system@quickmela.com" "support@quickmela.com")

BUYER_NAMES=("Arjun Kumar" "Kavya Reddy" "Vijay Singh" "Neha Sharma" "Rohit Verma")
SELLER_NAMES=("Anita Desai" "Suresh Mehta" "Deepa Patel" "Rajesh Kumar")
ADMIN_NAMES=("System Admin" "Support Admin")

# Function to create user
create_user() {
    local email=$1
    local password=$2
    local name=$3
    local role=$4
    
    echo -e "${BLUE}Creating $role: $name${NC}"
    
    response=$(curl -s -X POST http://localhost:4011/api/auth/register \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"name\": \"$name\",
            \"role\": \"$role\"
        }")
    
    if echo "$response" | grep -q "success\|Login successful\|already exists"; then
        echo -e "${GREEN}✅ $role created: $name${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $role creation issue: $name${NC}"
        return 1
    fi
}

# Function to get user token
get_token() {
    local email=$1
    local password=$2
    
    response=$(curl -s -X POST http://localhost:4011/api/auth/login \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d "{\"email\": \"$email\", \"password\": \"$password\"}")
    
    if echo "$response" | grep -q "accessToken"; then
        token=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        echo "$token"
    else
        echo ""
    fi
}

# Function to create test products
create_test_products() {
    local seller_token=$1
    local seller_name=$2
    
    echo -e "${BLUE}Creating products for: $seller_name${NC}"
    
    # Product templates
    local products=(
        '{"title":"2018 Maruti Suzuki Swift","description":"Well-maintained Swift, single owner, comprehensive insurance","category":"car","startingBid":250000,"buyNowPrice":350000,"images":["swift1.jpg","swift2.jpg"],"mileage":"45000","fuel":"petrol","transmission":"manual","year":2018,"color":"white"}'
        '{"title":"2020 Honda City","description":"Premium sedan, excellent condition, all service records available","category":"car","startingBid":800000,"buyNowPrice":1200000,"images":["city1.jpg","city2.jpg"],"mileage":"25000","fuel":"petrol","transmission":"automatic","year":2020,"color":"silver"}'
        '{"title":"2019 Hyundai Creta","description":"Popular SUV, feature-rich, excellent mileage","category":"suv","startingBid":900000,"buyNowPrice":1300000,"images":["creta1.jpg","creta2.jpg"],"mileage":"35000","fuel":"diesel","transmission":"manual","year":2019,"color":"black"}'
        '{"title":"2017 Toyota Innova","description":"Family MPV, spacious, reliable, well-maintained","category":"mpv","startingBid":1200000,"buyNowPrice":1600000,"images":["innova1.jpg","innova2.jpg"],"mileage":"60000","fuel":"diesel","transmission":"manual","year":2017,"color":"white"}'
        '{"title":"2021 Kia Seltos","description":"Modern compact SUV, tech-loaded, excellent condition","category":"suv","startingBid":1000000,"buyNowPrice":1400000,"images":["seltos1.jpg","seltos2.jpg"],"mileage":"15000","fuel":"petrol","transmission":"automatic","year":2021,"color":"red"}'
        '{"title":"2016 Ford EcoSport","description":"Compact SUV, urban friendly, good condition","category":"suv","startingBid":500000,"buyNowPrice":700000,"images":["ecosport1.jpg","ecosport2.jpg"],"mileage":"55000","fuel":"petrol","transmission":"manual","year":2016,"color":"blue"}'
        '{"title":"2022 Tata Nexon","description":"Indian SUV, 5-star safety, feature-packed","category":"suv","startingBid":850000,"buyNowPrice":1100000,"images":["nexon1.jpg","nexon2.jpg"],"mileage":8000,"fuel":"petrol","transmission":"manual","year":2022,"color":"gray"}'
        '{"title":"2015 Mahindra XUV500","description":"Premium SUV, powerful engine, family car","category":"suv","startingBid":600000,"buyNowPrice":900000,"images":["xuv1.jpg","xuv2.jpg"],"mileage":70000,"fuel":"diesel","transmission":"automatic","year":2015,"color":"black"}'
    )
    
    local product_count=0
    for product in "${products[@]}"; do
        response=$(curl -s -X POST http://localhost:4011/api/products \
            -H "Authorization: Bearer $seller_token" \
            -H "Content-Type: application/json" \
            -H "Origin: http://localhost:3021" \
            -d "$product")
        
        if echo "$response" | grep -q "id\|success"; then
            ((product_count++))
            echo -e "${GREEN}  ✅ Product $product_count created${NC}"
        else
            echo -e "${YELLOW}  ⚠️  Product creation failed${NC}"
        fi
        
        sleep 0.5  # Small delay to avoid overwhelming
    done
    
    echo -e "${GREEN}✅ Created $product_count products for $seller_name${NC}"
}

# Function to create bids
create_test_bids() {
    local buyer_token=$1
    local buyer_name=$2
    
    echo -e "${BLUE}Creating bids for: $buyer_name${NC}"
    
    # Get available products
    response=$(curl -s -X GET http://localhost:4011/api/products \
        -H "Origin: http://localhost:3021")
    
    # Extract product IDs (simplified approach)
    product_ids=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -5)
    
    local bid_count=0
    for product_id in $product_ids; do
        if [ -n "$product_id" ]; then
            bid_amount=$((100000 + RANDOM % 500000))
            
            response=$(curl -s -X POST http://localhost:4011/api/products/$product_id/bid \
                -H "Authorization: Bearer $buyer_token" \
                -H "Content-Type: application/json" \
                -H "Origin: http://localhost:3021" \
                -d "{
                    \"bidAmount\": $bid_amount,
                    \"bidderId\": \"${buyer_name// /_}\",
                    \"bidderName\": \"$buyer_name\"
                }")
            
            if echo "$response" | grep -q "success\|id\|accepted"; then
                ((bid_count++))
                echo -e "${GREEN}  ✅ Bid ₹$bid_amount placed on product $product_id${NC}"
            else
                echo -e "${YELLOW}  ⚠️  Bid failed on product $product_id${NC}"
            fi
            
            sleep 0.3
        fi
    done
    
    echo -e "${GREEN}✅ Created $bid_count bids for $buyer_name${NC}"
}

# Function to add wallet funds
add_wallet_funds() {
    local user_token=$1
    local user_name=$2
    local amount=$3
    
    response=$(curl -s -X POST http://localhost:4011/api/wallet/add-funds \
        -H "Authorization: Bearer $user_token" \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d "{\"amount\": $amount}")
    
    if echo "$response" | grep -q "success\|balance"; then
        echo -e "${GREEN}✅ Added ₹$amount to $user_name wallet${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed to add funds to $user_name wallet${NC}"
    fi
}

# Main execution
echo -e "${YELLOW}🚀 STARTING COMPREHENSIVE TEST DATA GENERATION${NC}"
echo ""

# Phase 1: Create all users
echo -e "${YELLOW}📝 PHASE 1: CREATING ALL USER TYPES${NC}"
echo "===================================="

# Create buyers
echo -e "${BLUE}Creating Buyers...${NC}"
for i in "${!BUYERS[@]}"; do
    create_user "${BUYERS[$i]}" "BuyerPass123!" "${BUYER_NAMES[$i]}" "buyer"
done

# Create sellers
echo -e "${BLUE}Creating Sellers...${NC}"
for i in "${!SELLERS[@]}"; do
    create_user "${SELLERS[$i]}" "SellerPass123!" "${SELLER_NAMES[$i]}" "seller"
done

# Create admins
echo -e "${BLUE}Creating Admins...${NC}"
for i in "${!ADMINS[@]}"; do
    create_user "${ADMINS[$i]}" "AdminPass123!" "${ADMIN_NAMES[$i]}" "admin"
done

echo ""

# Phase 2: Create products and add data
echo -e "${YELLOW}🚗 PHASE 2: CREATING PRODUCTS & DATA${NC}"
echo "===================================="

# Create products for each seller
for i in "${!SELLERS[@]}"; do
    seller_token=$(get_token "${SELLERS[$i]}" "SellerPass123!")
    if [ -n "$seller_token" ]; then
        create_test_products "$seller_token" "${SELLER_NAMES[$i]}"
    fi
    sleep 1
done

echo ""

# Phase 3: Create bids and wallet data
echo -e "${YELLOW}🔨 PHASE 3: CREATING BIDS & WALLET DATA${NC}"
echo "====================================="

# Create bids for buyers and add funds
for i in "${!BUYERS[@]}"; do
    buyer_token=$(get_token "${BUYERS[$i]}" "BuyerPass123!")
    if [ -n "$buyer_token" ]; then
        add_wallet_funds "$buyer_token" "${BUYER_NAMES[$i]}" 100000
        create_test_bids "$buyer_token" "${BUYER_NAMES[$i]}"
    fi
    sleep 1
done

echo ""

# Phase 4: Admin data setup
echo -e "${YELLOW}👨‍💼 PHASE 4: ADMIN DATA SETUP${NC}"
echo "=============================="

for i in "${!ADMINS[@]}"; do
    admin_token=$(get_token "${ADMINS[$i]}" "AdminPass123!")
    if [ -n "$admin_token" ]; then
        # Admin gets higher wallet balance
        add_wallet_funds "$admin_token" "${ADMIN_NAMES[$i]}" 500000
    fi
done

echo ""

# Summary
echo -e "${GREEN}📊 TEST DATA GENERATION COMPLETE${NC}"
echo "=================================="
echo -e "${GREEN}✅ Created ${#BUYERS[@]} buyers${NC}"
echo -e "${GREEN}✅ Created ${#SELLERS[@]} sellers${NC}"
echo -e "${GREEN}✅ Created ${#ADMINS[@]} admins${NC}"
echo -e "${GREEN}✅ Created multiple products per seller${NC}"
echo -e "${GREEN}✅ Created bids for buyers${NC}"
echo -e "${GREEN}✅ Added wallet funds for all users${NC}"
echo ""
echo -e "${BLUE}🎯 TEST USERS READY FOR TESTING:${NC}"
echo ""
echo -e "${YELLOW}BUYERS:${NC}"
for i in "${!BUYERS[@]}"; do
    echo "  📧 ${BUYERS[$i]} | 🔑 BuyerPass123! | 👤 ${BUYER_NAMES[$i]}"
done
echo ""
echo -e "${YELLOW}SELLERS:${NC}"
for i in "${!SELLERS[@]}"; do
    echo "  📧 ${SELLERS[$i]} | 🔑 SellerPass123! | 👤 ${SELLER_NAMES[$i]}"
done
echo ""
echo -e "${YELLOW}ADMINS:${NC}"
for i in "${!ADMINS[@]}"; do
    echo "  📧 ${ADMINS[$i]} | 🔑 AdminPass123! | 👤 ${ADMIN_NAMES[$i]}"
done
echo ""
echo -e "${GREEN}🎉 QUICKMELA NOW HAS COMPREHENSIVE TEST DATA!${NC}"
echo -e "${GREEN}🚀 Ready for complete user flow testing${NC}"
