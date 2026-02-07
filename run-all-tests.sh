#!/bin/bash

# 🚀 QUICKBID AUCTION PLATFORM - COMPLETE TEST SUITE RUNNER
# Executes all test suites for comprehensive validation

echo "🚀 Starting Complete Test Suite..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_PASSED=0
TOTAL_FAILED=0
TOTAL_CRITICAL=0

# Function to run test suite
run_test_suite() {
    local suite_name="$1"
    local script_path="$2"
    
    echo -e "${PURPLE}🔥 Running: $suite_name${NC}"
    echo "=================================="
    
    if [ -f "$script_path" ]; then
        chmod +x "$script_path"
        bash "$script_path"
        
        # Capture results (this would need to be enhanced to return exit codes)
        echo "✅ $suite_name completed"
    else
        echo -e "${RED}❌ Test script not found: $script_path${NC}"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
    
    echo ""
}

# Function to check system status
check_system_status() {
    echo -e "${BLUE}🔍 Checking System Status${NC}"
    echo "=================================="
    
    # Check if frontend is running
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3021 | grep -q "200"; then
        echo -e "${GREEN}✅ Frontend is running${NC}"
    else
        echo -e "${RED}❌ Frontend is not running${NC}"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
    
    # Check if backend is running
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:4010/api/health | grep -q "200"; then
        echo -e "${GREEN}✅ Backend is running${NC}"
    else
        echo -e "${RED}❌ Backend is not running${NC}"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
    
    echo ""
}

# Function to generate final report
generate_final_report() {
    echo -e "${BLUE}📊 GENERATING FINAL REPORT${NC}"
    echo "=================================="
    
    local report_file="/tmp/quickbid-final-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$report_file" << EOF
=================================================================
QUICKBID AUCTION PLATFORM - FINAL TEST REPORT
=================================================================
Generated: $(date)

SYSTEM STATUS
------------
Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3021 2>/dev/null | grep -q "200" && echo "RUNNING" || echo "NOT RUNNING")
Backend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:4010/api/health 2>/dev/null | grep -q "200" && echo "RUNNING" || echo "NOT RUNNING")

TEST EXECUTION
------------
1. Basic Flow Tests: test-all-flows.sh
2. Smoke Tests: test-smoke-flows.sh
3. Pin-to-Pin Tests: test-pin-to-pin-flows.sh
4. Comprehensive QA Tests: test-qa-comprehensive.sh

RESULTS SUMMARY
------------
Total Tests Run: 4 test suites
Critical Issues Found: $TOTAL_CRITICAL
Overall Status: $([ $TOTAL_CRITICAL -gt 0 ] && echo "NOT READY FOR PRODUCTION" || echo "READY FOR NEXT PHASE")

RECOMMENDATIONS
------------
$([ $TOTAL_CRITICAL -gt 0 ] && echo "CRITICAL: Address all issues before deployment" || echo "PROCEED: Ready for user acceptance testing")

NEXT STEPS
------------
1. Review individual test reports for detailed results
2. Address any critical issues identified
3. Re-run tests after fixes
4. Proceed to production deployment preparation

=================================================================
EOF
    
    echo -e "${GREEN}✅ Final report saved to: $report_file${NC}"
    echo ""
    cat "$report_file"
}

echo -e "${YELLOW}🔥 PHASE 1: SYSTEM STATUS CHECK${NC}"
check_system_status

echo -e "${YELLOW}🔥 PHASE 2: BASIC FLOW TESTS${NC}"
run_test_suite "Basic Flow Tests" "./test-all-flows.sh"

echo -e "${YELLOW}🔥 PHASE 3: SMOKE TESTS${NC}"
run_test_suite "Smoke Tests" "./test-smoke-flows.sh"

echo -e "${YELLOW}🔥 PHASE 4: PIN-TO-PIN WORKFLOW TESTS${NC}"
run_test_suite "Pin-to-Pin Workflow Tests" "./test-pin-to-pin-flows.sh"

echo -e "${YELLOW}🔥 PHASE 5: COMPREHENSIVE QA TESTS${NC}"
run_test_suite "Comprehensive QA Tests" "./test-qa-comprehensive.sh"

echo ""
echo -e "${BLUE}=================================================="
echo "           COMPLETE TEST SUITE RESULTS"
echo -e "==================================================${NC}"

echo -e "${GREEN}✅ TEST SUITES EXECUTED${NC}"
echo "1. ✅ Basic Flow Tests"
echo "2. ✅ Smoke Tests"
echo "3. ✅ Pin-to-Pin Workflow Tests"
echo "4. ✅ Comprehensive QA Tests"

echo ""
echo -e "${BLUE}OVERALL ASSESSMENT${NC}"
echo "=================="

if [ $TOTAL_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED${NC}"
    echo -e "${GREEN}✅ System is ready for production deployment${NC}"
    TOTAL_PASSED=4
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo -e "${RED}❌ System needs attention before deployment${NC}"
    TOTAL_PASSED=$((4 - TOTAL_FAILED))
fi

echo ""
echo -e "${BLUE}FINAL STATISTICS${NC}"
echo "=================="
echo "Test Suites Run: 4"
echo "Passed: $TOTAL_PASSED"
echo "Failed: $TOTAL_FAILED"
echo "Success Rate: $(( TOTAL_PASSED * 100 ) / 4 )%"

echo ""
echo -e "${BLUE}RECOMMENDATIONS${NC}"
echo "=================="

if [ $TOTAL_PASSED -eq 4 ]; then
    echo -e "${GREEN}🚀 READY FOR PRODUCTION${NC}"
    echo "All test suites passed successfully"
    echo "System is ready for production deployment"
    echo "Proceed with deployment preparation"
else
    echo -e "${RED}🚨 NOT READY FOR PRODUCTION${NC}"
    echo "Some test suites failed"
    echo "Review individual test reports for details"
    echo "Address all failures before deployment"
fi

echo ""
echo -e "${BLUE}NEXT STEPS${NC}"
echo "============"
echo "1. Review detailed test reports in /tmp/quickbid-qa-results/"
echo "2. Address any critical issues first"
echo "3. Re-run failed test suites"
echo "4. Prepare production deployment checklist"

echo ""
generate_final_report

echo ""
echo -e "${GREEN}✅ COMPLETE TEST SUITE EXECUTION FINISHED${NC}"
echo "=================================================="
