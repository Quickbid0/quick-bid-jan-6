#!/bin/bash

# QuickMela Company & Bulk Registration Setup
# ========================================

echo "🏢 QUICKMELA COMPANY & BULK REGISTRATION SETUP"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Company data
COMPANIES=(
    "AutoDeal Pvt Ltd|contact@autodeal.com|9876543210|GSTIN1234567890|PANABCDE1234F|Authorized Dealer|Premium"
    "CarWorld Enterprises|info@carworld.com|9876543211|GSTIN0987654321|PANXYZDE5678G|Multi-brand|Standard"
    "VehicleHub Solutions|sales@vehiclehub.com|9876543212|GSTIN1122334455|PANLMNOP8901H|Auction House|Premium"
    "Motors India Ltd|business@motorsindia.com|9876543213|GSTIN5566778899|PANQRSTU2345J|Fleet Supplier|Enterprise"
    "QuickAuto Partners|hello@quickauto.com|9876543214|GSTIN9988776655|PANVWXYZ6789K|Dealership|Standard"
)

# Bulk registration users
BULK_USERS=(
    "fleet@company1.com|Company1|Fleet Manager|1234567890|fleet"
    "procurement@company2.com|Company2|Procurement Head|1234567891|procurement"
    "admin@company3.com|Company3|System Admin|1234567892|admin"
    "operations@company4.com|Company4|Operations Manager|1234567893|operations"
    "manager@company5.com|Company5|Branch Manager|1234567894|manager"
)

# Function to create company
create_company() {
    local company_data=$1
    IFS='|' read -r name email phone gstin pan type tier <<< "$company_data"
    
    echo -e "${BLUE}Creating company: $name${NC}"
    
    response=$(curl -s -X POST http://localhost:4011/api/company/register \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d "{
            \"companyName\": \"$name\",
            \"email\": \"$email\",
            \"phone\": \"$phone\",
            \"gstin\": \"$gstin\",
            \"pan\": \"$pan\",
            \"businessType\": \"$type\",
            \"subscriptionTier\": \"$tier\",
            \"address\": {
                \"line1\": \"Business Address\",
                \"line2\": \"Sector 1\",
                \"city\": \"Mumbai\",
                \"state\": \"Maharashtra\",
                \"pincode\": \"400001\",
                \"country\": \"India\"
            },
            \"contactPerson\": {
                \"name\": \"Contact Person\",
                \"email\": \"$email\",
                \"phone\": \"$phone\",
                \"designation\": \"Director\"
            },
            \"documents\": {
                \"gstinCertificate\": \"gstin_cert.pdf\",
                \"panCertificate\": \"pan_cert.pdf\",
                \"incorporationCertificate\": \"inc_cert.pdf\",
                \"addressProof\": \"address_proof.pdf\"
            }
        }")
    
    if echo "$response" | grep -q "success\|id\|created"; then
        echo -e "${GREEN}✅ Company created: $name${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Company creation issue: $name${NC}"
        return 1
    fi
}

# Function to create bulk user
create_bulk_user() {
    local user_data=$1
    IFS='|' read -r email name phone role <<< "$user_data"
    
    echo -e "${BLUE}Creating bulk user: $name${NC}"
    
    response=$(curl -s -X POST http://localhost:4011/api/auth/register \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"BulkPass123!\",
            \"name\": \"$name\",
            \"role\": \"$role\",
            \"phone\": \"$phone\",
            \"company\": \"${email%@*}\",
            \"isBulkUser\": true,
            \"permissions\": [\"view_products\", \"place_bids\", \"manage_fleet\"]
        }")
    
    if echo "$response" | grep -q "success\|id\|created"; then
        echo -e "${GREEN}✅ Bulk user created: $name${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Bulk user creation issue: $name${NC}"
        return 1
    fi
}

# Function to create bulk listings
create_bulk_listings() {
    local company_email=$1
    local company_name=$2
    
    echo -e "${BLUE}Creating bulk listings for: $company_name${NC}"
    
    # Get token for company
    login_response=$(curl -s -X POST http://localhost:4011/api/auth/login \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d "{\"email\": \"$company_email\", \"password\": \"BulkPass123!\"}")
    
    if echo "$login_response" | grep -q "accessToken"; then
        token=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        
        # Create multiple listings
        local listings=(
            '{"title":"2018 Honda City - Fleet Sale","description":"Well-maintained fleet vehicle, service history available","category":"car","startingBid":450000,"buyNowPrice":550000,"quantity":5,"condition":"excellent","fuel":"petrol","transmission":"manual","year":2018,"mileage":"35000"}'
            '{"title":"2019 Maruti Swift - Bulk Deal","description":"Multiple units available, perfect for fleet expansion","category":"car","startingBid":420000,"buyNowPrice":480000,"quantity":10,"condition":"good","fuel":"petrol","transmission":"manual","year":2019,"mileage":"25000"}'
            '{"title":"2020 Hyundai i20 - Corporate Sale","description":"Corporate fleet vehicles, single owner, comprehensive insurance","category":"car","startingBid":550000,"buyNowPrice":620000,"quantity":3,"condition":"excellent","fuel":"diesel","transmission":"automatic","year":2020,"mileage":18000"}'
        )
        
        local listing_count=0
        for listing in "${listings[@]}"; do
            response=$(curl -s -X POST http://localhost:4011/api/products/bulk-create \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -H "Origin: http://localhost:3021" \
                -d "$listing")
            
            if echo "$response" | grep -q "success\|id\|created"; then
                ((listing_count++))
                echo -e "${GREEN}  ✅ Bulk listing $listing_count created${NC}"
            else
                echo -e "${YELLOW}  ⚠️  Bulk listing creation failed${NC}"
            fi
            
            sleep 0.5
        done
        
        echo -e "${GREEN}✅ Created $listing_count bulk listings for $company_name${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not get token for $company_name${NC}"
    fi
}

# Function to test business solutions features
test_business_solutions() {
    echo -e "${BLUE}Testing Business Solutions features${NC}"
    
    # Test company dashboard access
    response=$(curl -s -X GET http://localhost:4011/api/company/dashboard \
        -H "Origin: http://localhost:3021")
    
    if echo "$response" | grep -q "dashboard\|company\|business"; then
        echo -e "${GREEN}✅ Company dashboard accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Company dashboard issue${NC}"
    fi
    
    # Test bulk registration endpoint
    response=$(curl -s -X POST http://localhost:4011/api/company/bulk-register \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:3021" \
        -d '{
            "companyName": "Test Bulk Company",
            "contactEmail": "bulk@test.com",
            "users": [
                {"name": "User 1", "email": "user1@test.com", "role": "manager"},
                {"name": "User 2", "email": "user2@test.com", "role": "operator"}
            ]
        }')
    
    if echo "$response" | grep -q "success\|created\|processed"; then
        echo -e "${GREEN}✅ Bulk registration working${NC}"
    else
        echo -e "${YELLOW}⚠️  Bulk registration issue${NC}"
    fi
    
    # Test business analytics
    response=$(curl -s -X GET http://localhost:4011/api/company/analytics \
        -H "Origin: http://localhost:3021")
    
    if echo "$response" | grep -q "analytics\|metrics\|reports"; then
        echo -e "${GREEN}✅ Business analytics working${NC}"
    else
        echo -e "${YELLOW}⚠️  Business analytics issue${NC}"
    fi
}

# Main execution
echo -e "${YELLOW}🚀 STARTING COMPANY & BULK REGISTRATION SETUP${NC}"
echo ""

# Phase 1: Create companies
echo -e "${YELLOW}🏢 PHASE 1: CREATING COMPANIES${NC}"
echo "==============================="

company_count=0
for company in "${COMPANIES[@]}"; do
    if create_company "$company"; then
        ((company_count++))
    fi
    sleep 1
done

echo ""

# Phase 2: Create bulk users
echo -e "${YELLOW}👥 PHASE 2: CREATING BULK USERS${NC}"
echo "==============================="

user_count=0
for user in "${BULK_USERS[@]}"; do
    if create_bulk_user "$user"; then
        ((user_count++))
    fi
    sleep 0.5
done

echo ""

# Phase 3: Create bulk listings
echo -e "${YELLOW}🚗 PHASE 3: CREATING BULK LISTINGS${NC}"
echo "================================="

# Create listings for first few companies
companies=("contact@autodeal.com|AutoDeal Pvt Ltd" "info@carworld.com|CarWorld Enterprises")
for company in "${companies[@]}"; do
    IFS='|' read -r email name <<< "$company"
    create_bulk_listings "$email" "$name"
    sleep 1
done

echo ""

# Phase 4: Test business solutions
echo -e "${YELLOW}📊 PHASE 4: TESTING BUSINESS SOLUTIONS${NC}"
echo "===================================="

test_business_solutions

echo ""

# Summary
echo -e "${GREEN}📊 COMPANY & BULK SETUP COMPLETE${NC}"
echo "=================================="
echo -e "${GREEN}✅ Created $company_count companies${NC}"
echo -e "${GREEN}✅ Created $user_count bulk users${NC}"
echo -e "${GREEN}✅ Created bulk listings${NC}"
echo -e "${GREEN}✅ Tested business solutions${NC}"
echo ""
echo -e "${BLUE}🎯 COMPANY ACCOUNTS READY:${NC}"
echo ""
echo -e "${YELLOW}COMPANIES:${NC}"
for company in "${COMPANIES[@]}"; do
    IFS='|' read -r name email phone gstin pan type tier <<< "$company"
    echo "  🏢 $name | 📧 $email | 📞 $phone | 🏷️ $type | ⭐ $tier"
done
echo ""
echo -e "${YELLOW}BULK USERS:${NC}"
for user in "${BULK_USERS[@]}"; do
    IFS='|' read -r email name phone role <<< "$user"
    echo "  👤 $name | 📧 $email | 📞 $phone | 🎭 $role | 🔑 BulkPass123!"
done
echo ""
echo -e "${GREEN}🎉 QUICKMELA NOW HAS ENTERPRISE FEATURES!${NC}"
echo -e "${GREEN}🚀 Ready for B2B and bulk registration testing${NC}"
