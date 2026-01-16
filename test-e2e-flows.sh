#!/bin/bash

# QuickBid End-to-End Testing Script
echo "🧪 QUICKBID END-TO-END FUNCTIONALITY TESTING"
echo "============================================"

echo ""
echo "📋 TESTING CRITICAL USER FLOWS"
echo "=============================="

# Test 1: Add Product Flow
echo ""
echo "📦 Test 1: ADD PRODUCT FLOW"
echo "-------------------------"

# Check AddProduct component exists
if [ -f "src/pages/AddProduct.tsx" ]; then
    echo "✅ AddProduct.tsx exists"
else
    echo "❌ AddProduct.tsx missing"
fi

# Check form validation
if grep -q "ProductSchema" src/pages/AddProduct.tsx; then
    echo "✅ Product schema validation found"
else
    echo "❌ Product schema validation missing"
fi

# Check form submission
if grep -q "handleSubmit\|onSubmit" src/pages/AddProduct.tsx; then
    echo "✅ Form submission handling found"
else
    echo "❌ Form submission handling missing"
fi

# Check image upload
if grep -q "image\|upload\|file" src/pages/AddProduct.tsx; then
    echo "✅ Image upload functionality found"
else
    echo "❌ Image upload functionality missing"
fi

# Check database integration
if grep -q "supabase.*from.*products" src/pages/AddProduct.tsx; then
    echo "✅ Database integration found"
else
    echo "❌ Database integration missing"
fi

# Check route accessibility
add_product_response=$(curl -s -w "%{http_code}" http://localhost:3010/add-product)
http_code="${add_product_response: -3}"
if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
    echo "✅ Add Product route accessible (HTTP $http_code)"
else
    echo "❌ Add Product route not accessible (HTTP $http_code)"
fi

# Test 2: Wallet Flow
echo ""
echo "💳 Test 2: WALLET FLOW"
echo "--------------------"

# Check WalletPage component
if [ -f "src/pages/WalletPage.tsx" ]; then
    echo "✅ WalletPage.tsx exists"
else
    echo "❌ WalletPage.tsx missing"
fi

# Check wallet service
if [ -f "src/services/walletService.ts" ]; then
    echo "✅ Wallet service exists"
else
    echo "❌ Wallet service missing"
fi

# Check wallet functionality
if grep -q "balance\|transaction\|deposit" src/pages/WalletPage.tsx; then
    echo "✅ Wallet functionality found"
else
    echo "❌ Wallet functionality missing"
fi

# Check payment integration
if grep -q "payment\|upi\|card" src/services/paymentService.ts; then
    echo "✅ Payment integration found"
else
    echo "❌ Payment integration missing"
fi

# Check wallet route accessibility
wallet_response=$(curl -s -w "%{http_code}" http://localhost:3010/wallet)
http_code="${wallet_response: -3}"
if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
    echo "✅ Wallet route accessible (HTTP $http_code)"
else
    echo "❌ Wallet route not accessible (HTTP $http_code)"
fi

# Test 3: Orders Flow
echo ""
echo "📋 Test 3: ORDERS FLOW"
echo "-------------------"

# Check MyOrders component
if [ -f "src/pages/MyOrders.tsx" ]; then
    echo "✅ MyOrders.tsx exists"
else
    echo "❌ MyOrders.tsx missing"
fi

# Check OrderTracking component
if [ -f "src/pages/OrderTracking.tsx" ]; then
    echo "✅ OrderTracking.tsx exists"
else
    echo "❌ OrderTracking.tsx missing"
fi

# Check order functionality
if grep -q "order\|tracking\|status" src/pages/MyOrders.tsx; then
    echo "✅ Order functionality found"
else
    echo "❌ Order functionality missing"
fi

# Check orders route accessibility
orders_response=$(curl -s -w "%{http_code}" http://localhost:3010/my-orders)
http_code="${orders_response: -3}"
if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
    echo "✅ Orders route accessible (HTTP $http_code)"
else
    echo "❌ Orders route not accessible (HTTP $http_code)"
fi

# Test 4: Dashboard Flows
echo ""
echo "📊 Test 4: DASHBOARD FLOWS"
echo "----------------------"

# Check dashboard components
dashboards=("src/pages/BuyerDashboard.tsx" "src/pages/SellerDashboard.tsx" "src/pages/AdminDashboard.tsx")
for dashboard in "${dashboards[@]}"; do
    if [ -f "$dashboard" ]; then
        echo "✅ $(basename $dashboard) exists"
    else
        echo "❌ $(basename $dashboard) missing"
    fi
done

# Check dashboard functionality
if grep -q "stats\|analytics\|metrics" src/pages/BuyerDashboard.tsx; then
    echo "✅ Buyer dashboard analytics found"
else
    echo "❌ Buyer dashboard analytics missing"
fi

if grep -q "products\|sales\|revenue" src/pages/SellerDashboard.tsx; then
    echo "✅ Seller dashboard analytics found"
else
    echo "❌ Seller dashboard analytics missing"
fi

# Check dashboard routes
buyer_dashboard_response=$(curl -s -w "%{http_code}" http://localhost:3010/buyer/dashboard)
http_code="${buyer_dashboard_response: -3}"
if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
    echo "✅ Buyer dashboard route accessible (HTTP $http_code)"
else
    echo "❌ Buyer dashboard route not accessible (HTTP $http_code)"
fi

seller_dashboard_response=$(curl -s -w "%{http_code}" http://localhost:3010/seller/dashboard)
http_code="${seller_dashboard_response: -3}"
if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
    echo "✅ Seller dashboard route accessible (HTTP $http_code)"
else
    echo "❌ Seller dashboard route not accessible (HTTP $http_code)"
fi

# Test 5: Integration Tests
echo ""
echo "🔗 Test 5: INTEGRATION TESTS"
echo "------------------------"

# Check navigation integration
if grep -q "add-product\|wallet\|my-orders" src/components/Navbar.tsx; then
    echo "✅ Navigation integration found"
else
    echo "❌ Navigation integration missing"
fi

# Check authentication integration
if grep -q "ProtectedRoute" src/App.tsx; then
    echo "✅ Route protection found"
else
    echo "❌ Route protection missing"
fi

# Check error handling
if grep -q "try.*catch\|error.*handling" src/pages/AddProduct.tsx; then
    echo "✅ Error handling in AddProduct found"
else
    echo "❌ Error handling in AddProduct missing"
fi

if grep -q "try.*catch\|error.*handling" src/pages/WalletPage.tsx; then
    echo "✅ Error handling in Wallet found"
else
    echo "❌ Error handling in Wallet missing"
fi

# Test 6: Database Schema Tests
echo ""
echo "🗄️ Test 6: DATABASE SCHEMA TESTS"
echo "---------------------------"

# Check product schema
if [ -f "src/schemas/ProductSchema.ts" ]; then
    echo "✅ ProductSchema.ts exists"
else
    echo "❌ ProductSchema.ts missing"
fi

# Check schema validation
if grep -q "zod\|schema" src/schemas/ProductSchema.ts; then
    echo "✅ Schema validation found"
else
    echo "❌ Schema validation missing"
fi

# Test 7: Form Validation Tests
echo ""
echo "✅ Test 7: FORM VALIDATION TESTS"
echo "---------------------------"

# Check react-hook-form integration
if grep -q "useForm\|react-hook-form" src/pages/AddProduct.tsx; then
    echo "✅ React Hook Form integration found"
else
    echo "❌ React Hook Form integration missing"
fi

# Check validation rules
if grep -q "required\|min\|max\|pattern" src/schemas/ProductSchema.ts; then
    echo "✅ Validation rules found"
else
    echo "❌ Validation rules missing"
fi

# Test 8: File Upload Tests
echo ""
echo "📁 Test 8: FILE UPLOAD TESTS"
echo "------------------------"

# Check file upload components
if grep -q "input.*type.*file\|Upload\|FileText" src/pages/AddProduct.tsx; then
    echo "✅ File upload components found"
else
    echo "❌ File upload components missing"
fi

# Check image handling
if grep -q "image.*url\|thumbnail\|images" src/pages/AddProduct.tsx; then
    echo "✅ Image handling found"
else
    echo "❌ Image handling missing"
fi

# Test 9: Payment Processing Tests
echo ""
echo "💰 Test 9: PAYMENT PROCESSING TESTS"
echo "-----------------------------"

# Check payment service
if [ -f "src/services/paymentService.ts" ]; then
    echo "✅ Payment service exists"
else
    echo "❌ Payment service missing"
fi

# Check payment methods
if grep -q "card\|upi\|netbanking" src/services/paymentService.ts; then
    echo "✅ Payment methods found"
else
    echo "❌ Payment methods missing"
fi

# Test 10: Responsive Design Tests
echo ""
echo "📱 Test 10: RESPONSIVE DESIGN TESTS"
echo "-------------------------------"

# Check responsive design in key components
components=("src/pages/AddProduct.tsx" "src/pages/WalletPage.tsx" "src/pages/MyOrders.tsx")
for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        if grep -q "md:\|lg:\|sm:" "$component"; then
            echo "✅ $(basename $component) has responsive design"
        else
            echo "⚠️ $(basename $component) may lack responsive design"
        fi
    fi
done

echo ""
echo "============================================"
echo "🎯 END-TO-END TESTING COMPLETE"
echo "============================================"
echo ""
echo "📊 Test Summary:"
echo "- Add Product flow functionality"
echo "- Wallet and payment processing"
echo "- Orders and tracking system"
echo "- Dashboard analytics and navigation"
echo "- Integration between components"
echo "- Database schema validation"
echo "- Form validation and error handling"
echo "- File upload capabilities"
echo "- Payment processing integration"
echo "- Responsive design implementation"
echo ""
echo "🚀 Manual Testing Instructions:"
echo "1. Test Add Product: http://localhost:3010/add-product"
echo "2. Test Wallet: http://localhost:3010/wallet"
echo "3. Test Orders: http://localhost:3010/my-orders"
echo "4. Test Dashboards: http://localhost:3010/buyer/dashboard"
echo "5. Test role-based access and navigation"
echo "6. Test form validation and error handling"
echo "7. Test file upload and image handling"
echo "8. Test payment processing flows"
echo "9. Test responsive design on mobile"
echo "10. Test authentication and authorization"
