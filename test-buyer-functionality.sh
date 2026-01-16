#!/bin/bash

# QuickBid Buyer Dashboard Functionality Test
echo "🧪 TESTING BUYER DASHBOARD FUNCTIONALITY"
echo "======================================="

echo ""
echo "📊 BUYER DASHBOARD COMPONENT ANALYSIS"
echo "======================================="

# Test 1: Check BuyerDashboard component structure
echo "📋 Test 1: Analyzing BuyerDashboard component structure..."
if [ -f "src/pages/BuyerDashboard.tsx" ]; then
    echo "✅ BuyerDashboard.tsx exists"
    
    # Check for key dashboard sections
    if grep -q "activeBids" src/pages/BuyerDashboard.tsx; then
        echo "✅ Active bids section found"
    else
        echo "❌ Active bids section missing"
    fi
    
    if grep -q "wonAuctions" src/pages/BuyerDashboard.tsx; then
        echo "✅ Won auctions section found"
    else
        echo "❌ Won auctions section missing"
    fi
    
    if grep -q "watchlistItems" src/pages/BuyerDashboard.tsx; then
        echo "✅ Watchlist section found"
    else
        echo "❌ Watchlist section missing"
    fi
    
    if grep -q "walletBalance" src/pages/BuyerDashboard.tsx; then
        echo "✅ Wallet balance section found"
    else
        echo "❌ Wallet balance section missing"
    fi
    
    if grep -q "useSession" src/pages/BuyerDashboard.tsx; then
        echo "✅ Session context integration found"
    else
        echo "❌ Session context integration missing"
    fi
    
    if grep -q "supabase" src/pages/BuyerDashboard.tsx; then
        echo "✅ Supabase integration found"
    else
        echo "❌ Supabase integration missing"
    fi
else
    echo "❌ BuyerDashboard.tsx not found"
fi

# Test 2: Check data fetching functions
echo ""
echo "🔄 Test 2: Checking data fetching functions..."
if grep -q "fetchBuyerData" src/pages/BuyerDashboard.tsx; then
    echo "✅ fetchBuyerData function found"
else
    echo "❌ fetchBuyerData function missing"
fi

if grep -q "from.*bids" src/pages/BuyerDashboard.tsx; then
    echo "✅ Bids data fetching found"
else
    echo "❌ Bids data fetching missing"
fi

if grep -q "from.*wishlist" src/pages/BuyerDashboard.tsx; then
    echo "✅ Watchlist data fetching found"
else
    echo "❌ Watchlist data fetching missing"
fi

if grep -q "from.*wallets" src/pages/BuyerDashboard.tsx; then
    echo "✅ Wallet data fetching found"
else
    echo "❌ Wallet data fetching missing"
fi

# Test 3: Check UI components and rendering
echo ""
echo "🎨 Test 3: Checking UI components and rendering..."
if grep -q "StatCard" src/pages/BuyerDashboard.tsx; then
    echo "✅ StatCard component usage found"
else
    echo "❌ StatCard component usage missing"
fi

if grep -q "motion\." src/pages/BuyerDashboard.tsx; then
    echo "✅ Framer Motion animations found"
else
    echo "❌ Framer Motion animations missing"
fi

if grep -q "Link.*to=" src/pages/BuyerDashboard.tsx; then
    echo "✅ Navigation links found"
else
    echo "❌ Navigation links missing"
fi

if grep -q "Trophy\|Clock\|Wallet\|Heart" src/pages/BuyerDashboard.tsx; then
    echo "✅ Lucide icons usage found"
else
    echo "❌ Lucide icons usage missing"
fi

# Test 4: Check routing and navigation
echo ""
echo "🧭 Test 4: Checking routing and navigation..."
if grep -q "/my/wins" src/pages/BuyerDashboard.tsx; then
    echo "✅ Wins page navigation found"
else
    echo "❌ Wins page navigation missing"
fi

if grep -q "/watchlist" src/pages/BuyerDashboard.tsx; then
    echo "✅ Watchlist navigation found"
else
    echo "❌ Watchlist navigation missing"
fi

if grep -q "/wallet" src/pages/BuyerDashboard.tsx; then
    echo "✅ Wallet navigation found"
else
    echo "❌ Wallet navigation missing"
fi

# Test 5: Check error handling and loading states
echo ""
echo "⚠️ Test 5: Checking error handling and loading states..."
if grep -q "loading" src/pages/BuyerDashboard.tsx; then
    echo "✅ Loading state handling found"
else
    echo "❌ Loading state handling missing"
fi

if grep -q "error" src/pages/BuyerDashboard.tsx; then
    echo "✅ Error handling found"
else
    echo "❌ Error handling missing"
fi

if grep -q "try.*catch" src/pages/BuyerDashboard.tsx; then
    echo "✅ Try-catch blocks found"
else
    echo "❌ Try-catch blocks missing"
fi

# Test 6: Check responsive design
echo ""
echo "📱 Test 6: Checking responsive design..."
if grep -q "grid-cols-1.*md:grid-cols" src/pages/BuyerDashboard.tsx; then
    echo "✅ Responsive grid layout found"
else
    echo "❌ Responsive grid layout missing"
fi

if grep -q "sm:.*md:.*lg:" src/pages/BuyerDashboard.tsx; then
    echo "✅ Responsive breakpoints found"
else
    echo "❌ Responsive breakpoints missing"
fi

# Test 7: Check TypeScript types and interfaces
echo ""
echo "🔧 Test 7: Checking TypeScript types and interfaces..."
if grep -q "interface.*BuyerStats" src/pages/BuyerDashboard.tsx; then
    echo "✅ BuyerStats interface found"
else
    echo "❌ BuyerStats interface missing"
fi

if grep -q "interface.*Bid" src/pages/BuyerDashboard.tsx; then
    echo "✅ Bid interface found"
else
    echo "❌ Bid interface missing"
fi

if grep -q "interface.*WatchlistItem" src/pages/BuyerDashboard.tsx; then
    echo "✅ WatchlistItem interface found"
else
    echo "❌ WatchlistItem interface missing"
fi

# Test 8: Check authentication integration
echo ""
echo "🔐 Test 8: Checking authentication integration..."
if grep -q "user?.id" src/pages/BuyerDashboard.tsx; then
    echo "✅ User ID authentication check found"
else
    echo "❌ User ID authentication check missing"
fi

if grep -q "session?.user" src/pages/BuyerDashboard.tsx; then
    echo "✅ Session user check found"
else
    echo "❌ Session user check missing"
fi

# Test 9: Check data formatting utilities
echo ""
echo "📊 Test 9: Checking data formatting utilities..."
if grep -q "formatCurrency" src/pages/BuyerDashboard.tsx; then
    echo "✅ Currency formatting found"
else
    echo "❌ Currency formatting missing"
fi

if grep -q "formatRelativeTime\|getTimeLeft" src/pages/BuyerDashboard.tsx; then
    echo "✅ Time formatting utilities found"
else
    echo "❌ Time formatting utilities missing"
fi

# Test 10: Check component exports and imports
echo ""
echo "📦 Test 10: Checking component exports and imports..."
if grep -q "export default BuyerDashboard" src/pages/BuyerDashboard.tsx; then
    echo "✅ Component export found"
else
    echo "❌ Component export missing"
fi

if grep -q "import.*React" src/pages/BuyerDashboard.tsx; then
    echo "✅ React import found"
else
    echo "❌ React import missing"
fi

echo ""
echo "======================================="
echo "🎯 BUYER DASHBOARD FUNCTIONALITY TEST COMPLETE"
echo "======================================="
echo ""
echo "📊 Test Results Summary:"
echo "- Component structure and sections"
echo "- Data fetching functions"
echo "- UI components and rendering"
echo "- Routing and navigation"
echo "- Error handling and loading states"
echo "- Responsive design"
echo "- TypeScript types and interfaces"
echo "- Authentication integration"
echo "- Data formatting utilities"
echo "- Component exports and imports"
echo ""
echo "🚀 Manual Testing Instructions:"
echo "1. Visit http://localhost:3010/demo"
echo "2. Login as 'Demo Buyer'"
echo "3. Verify redirect to /buyer/dashboard"
echo "4. Check dashboard statistics display"
echo "5. Test navigation to wins, watchlist, wallet"
echo "6. Test responsive design on mobile"
echo "7. Check console for auth logs (🔐 AUTH:)"
echo "8. Verify data loading and error states"
