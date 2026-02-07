#!/bin/bash

# 🚀 FRONTEND ↔ BACKEND AUTH INTEGRATION TEST
# ==========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
PASSED=0
FAILED=0

# Helper functions
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if frontend is running
check_frontend_health() {
    log_info "Checking frontend health..."
    
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        log_success "Frontend is running and healthy"
        return 0
    else
        log_error "Frontend is not running or unhealthy"
        return 1
    fi
}

# Check if backend is running
check_backend_health() {
    log_info "Checking backend health..."
    
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        log_success "Backend is running and healthy"
        return 0
    else
        log_error "Backend is not running or unhealthy"
        return 1
    fi
}

# Test backend API endpoints
test_backend_api() {
    echo ""
    echo "1️⃣ BACKEND API ENDPOINTS TEST"
    echo "============================"
    
    BASE_URL="http://localhost:3000"
    
    # Test login endpoint
    log_info "Testing /auth/login endpoint..."
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin-test@quickbid.com","password":"TestAdminPassword123!"}')
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        log_success "Login endpoint working"
        
        # Extract tokens for further tests
        ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
        
        # Test /auth/me endpoint
        log_info "Testing /auth/me endpoint..."
        ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
            -H "Authorization: Bearer $ACCESS_TOKEN")
        
        if echo "$ME_RESPONSE" | grep -q '"role":"ADMIN"'; then
            log_success "/auth/me endpoint working"
        else
            log_error "/auth/me endpoint failed"
        fi
        
        # Test token refresh
        log_info "Testing /auth/refresh endpoint..."
        REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
            -H "Content-Type: application/json" \
            -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
        
        if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
            log_success "/auth/refresh endpoint working"
        else
            log_error "/auth/refresh endpoint failed"
        fi
        
        # Test logout
        log_info "Testing /auth/logout endpoint..."
        LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
            -H "Authorization: Bearer $ACCESS_TOKEN")
        
        if echo "$LOGOUT_RESPONSE" | grep -q "Logged out successfully\|message"; then
            log_success "/auth/logout endpoint working"
        else
            log_error "/auth/logout endpoint failed"
        fi
        
    else
        log_error "Login endpoint failed"
    fi
}

# Test frontend integration files
test_frontend_integration() {
    echo ""
    echo "2️⃣ FRONTEND INTEGRATION FILES TEST"
    echo "==================================="
    
    # Check backend API service
    if [ -f "src/services/backendAuthAPI.ts" ]; then
        log_success "Backend API service exists"
        
        # Check for required functions
        if grep -q "login.*async" src/services/backendAuthAPI.ts; then
            log_success "Login function implemented"
        else
            log_error "Login function missing"
        fi
        
        if grep -q "register.*async" src/services/backendAuthAPI.ts; then
            log_success "Register function implemented"
        else
            log_error "Register function missing"
        fi
        
        if grep -q "getProfile.*async" src/services/backendAuthAPI.ts; then
            log_success "Get profile function implemented"
        else
            log_error "Get profile function missing"
        fi
        
        if grep -q "refreshAccessToken.*async" src/services/backendAuthAPI.ts; then
            log_success "Token refresh function implemented"
        else
            log_error "Token refresh function missing"
        fi
        
        if grep -q "logout.*async" src/services/backendAuthAPI.ts; then
            log_success "Logout function implemented"
        else
            log_error "Logout function missing"
        fi
    else
        log_error "Backend API service missing"
    fi
    
    # Check UnifiedAuthContext integration
    if [ -f "src/context/UnifiedAuthContext.tsx" ]; then
        log_success "UnifiedAuthContext exists"
        
        # Check for backend API import
        if grep -q "backendAuthAPI" src/context/UnifiedAuthContext.tsx; then
            log_success "Backend API imported in UnifiedAuthContext"
        else
            log_error "Backend API not imported in UnifiedAuthContext"
        fi
        
        # Check for real auth login integration
        if grep -q "backendAuthAPI.login" src/context/UnifiedAuthContext.tsx; then
            log_success "Real auth login integrated"
        else
            log_error "Real auth login not integrated"
        fi
        
        # Check for real auth register integration
        if grep -q "backendAuthAPI.register" src/context/UnifiedAuthContext.tsx; then
            log_success "Real auth register integrated"
        else
            log_error "Real auth register not integrated"
        fi
        
        # Check for real auth logout integration
        if grep -q "backendAuthAPI.logout" src/context/UnifiedAuthContext.tsx; then
            log_success "Real auth logout integrated"
        else
            log_error "Real auth logout not integrated"
        fi
        
        # Check for token validation
        if grep -q "validateBackendToken" src/context/UnifiedAuthContext.tsx; then
            log_success "Backend token validation implemented"
        else
            log_error "Backend token validation missing"
        fi
    else
        log_error "UnifiedAuthContext missing"
    fi
}

# Test demo auth preservation
test_demo_auth_preservation() {
    echo ""
    echo "3️⃣ DEMO AUTH PRESERVATION TEST"
    echo "==============================="
    
    # Check if demo auth logic is preserved
    if [ -f "src/context/UnifiedAuthContext.tsx" ]; then
        # Check for demo login logic
        if grep -q "demoUsers.*=" src/context/UnifiedAuthContext.tsx; then
            log_success "Demo login logic preserved"
        else
            log_error "Demo login logic missing"
        fi
        
        # Check for demo session handling
        if grep -q "demo-session" src/context/UnifiedAuthContext.tsx; then
            log_success "Demo session handling preserved"
        else
            log_error "Demo session handling missing"
        fi
        
        # Check for demo register logic
        if grep -q "isDemo.*true" src/context/UnifiedAuthContext.tsx; then
            log_success "Demo register logic preserved"
        else
            log_error "Demo register logic missing"
        fi
        
        # Check for demo logout logic
        if grep -q "authMode.*===.*demo" src/context/UnifiedAuthContext.tsx; then
            log_success "Demo logout logic preserved"
        else
            log_error "Demo logout logic missing"
        fi
    fi
}

# Test token management
test_token_management() {
    echo ""
    echo "4️⃣ TOKEN MANAGEMENT TEST"
    echo "========================"
    
    if [ -f "src/services/backendAuthAPI.ts" ]; then
        # Check for token storage functions
        if grep -q "setAuthTokens" src/services/backendAuthAPI.ts; then
            log_success "Token storage function implemented"
        else
            log_error "Token storage function missing"
        fi
        
        if grep -q "clearAuthTokens" src/services/backendAuthAPI.ts; then
            log_success "Token clearing function implemented"
        else
            log_error "Token clearing function missing"
        fi
        
        if grep -q "getAccessToken" src/services/backendAuthAPI.ts; then
            log_success "Access token retrieval function implemented"
        else
            log_error "Access token retrieval function missing"
        fi
        
        # Check for axios interceptors
        if grep -q "interceptors.request" src/services/backendAuthAPI.ts; then
            log_success "Request interceptor implemented"
        else
            log_error "Request interceptor missing"
        fi
        
        if grep -q "interceptors.response" src/services/backendAuthAPI.ts; then
            log_success "Response interceptor implemented"
        else
            log_error "Response interceptor missing"
        fi
        
        # Check for token refresh logic
        if grep -q "401.*_retry" src/services/backendAuthAPI.ts; then
            log_success "Token refresh logic implemented"
        else
            log_error "Token refresh logic missing"
        fi
    fi
}

# Test error handling
test_error_handling() {
    echo ""
    echo "5️⃣ ERROR HANDLING TEST"
    echo "====================="
    
    if [ -f "src/context/UnifiedAuthContext.tsx" ]; then
        # Check for login error handling
        if grep -q "error.response?.status.*401" src/context/UnifiedAuthContext.tsx; then
            log_success "Login error handling implemented"
        else
            log_error "Login error handling missing"
        fi
        
        # Check for registration error handling
        if grep -q "error.response?.status.*409" src/context/UnifiedAuthContext.tsx; then
            log_success "Registration error handling implemented"
        else
            log_error "Registration error handling missing"
        fi
        
        # Check for rate limit error handling
        if grep -q "error.response?.status.*429" src/context/UnifiedAuthContext.tsx; then
            log_success "Rate limit error handling implemented"
        else
            log_error "Rate limit error handling missing"
        fi
        
        # Check for network error handling
        if grep -q "error.code.*NETWORK_ERROR" src/context/UnifiedAuthContext.tsx; then
            log_success "Network error handling implemented"
        else
            log_error "Network error handling missing"
        fi
    fi
}

# Main execution
main() {
    echo "🚀 FRONTEND ↔ BACKEND AUTH INTEGRATION VERIFICATION"
    echo "=================================================="
    echo ""
    echo "This script tests the integration between frontend and backend authentication"
    echo ""
    
    # Check if both services are running
    FRONTEND_HEALTH=false
    BACKEND_HEALTH=false
    
    if check_frontend_health; then
        FRONTEND_HEALTH=true
    fi
    
    if check_backend_health; then
        BACKEND_HEALTH=true
    fi
    
    if [ "$FRONTEND_HEALTH" = false ] || [ "$BACKEND_HEALTH" = false ]; then
        echo ""
        log_error "Both frontend and backend must be running for full integration test"
        echo ""
        echo "📋 To start services:"
        echo "   Frontend: npm start (port 3001)"
        echo "   Backend: cd backend && npm run start:dev (port 3000)"
        echo ""
        echo "⚠️ Running file-based tests only..."
    fi
    
    # Run all tests
    test_backend_api
    test_frontend_integration
    test_demo_auth_preservation
    test_token_management
    test_error_handling
    
    # Final results
    echo ""
    echo "📊 INTEGRATION TEST RESULTS"
    echo "=========================="
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
    echo -e "${RED}❌ Failed: $FAILED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL INTEGRATION TESTS PASSED!${NC}"
        echo ""
        echo "🚀 Frontend ↔ Backend auth integration is complete!"
        echo ""
        echo "📋 Integration Summary:"
        echo "   ✅ Backend API endpoints working"
        echo "   ✅ Frontend integration files complete"
        echo "   ✅ Demo auth preserved"
        echo "   ✅ Token management implemented"
        echo "   ✅ Error handling implemented"
        echo ""
        echo "🎯 Ready for Phase 2 - Environment Separation!"
        exit 0
    else
        echo -e "${RED}❌ SOME INTEGRATION TESTS FAILED${NC}"
        echo ""
        echo "🔧 Please fix the failed integration issues before proceeding."
        exit 1
    fi
}

# Run the integration test
main
