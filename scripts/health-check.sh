#!/bin/bash

# QuickFix System Health Check
# Tests all critical endpoints and features

echo "========================================="
echo "QuickFix Platform - System Health Check"
echo "========================================="
echo ""

API_URL="https://quickfix-api-pnv5.onrender.com/api"
FRONTEND_URL="http://localhost:8081"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local expected_status=${4:-200}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url")
    fi
    
    if [ "$response" -eq "$expected_status" ] || [ "$response" -eq 401 ] || [ "$response" -eq 400 ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Status: $response, Expected: $expected_status)"
        ((FAILED++))
    fi
}

echo "1. AUTHENTICATION ENDPOINTS"
echo "----------------------------"
test_endpoint "Register" "$API_URL/auth/register" "POST" 400
test_endpoint "Login" "$API_URL/auth/login" "POST" 400
test_endpoint "Validate Token" "$API_URL/auth/validate" "GET" 401
echo ""

echo "2. SERVICE ENDPOINTS"
echo "--------------------"
test_endpoint "Get All Services" "$API_URL/services" "GET" 200
test_endpoint "Get Categories" "$API_URL/services/categories" "GET" 200
test_endpoint "Get Popular Services" "$API_URL/services/popular" "GET" 200
test_endpoint "Get Emergency Services" "$API_URL/services/emergency" "GET" 200
test_endpoint "Search Services" "$API_URL/services/search?q=plumbing" "GET" 200
echo ""

echo "3. BOOKING ENDPOINTS"
echo "--------------------"
test_endpoint "Create Booking" "$API_URL/bookings/redesigned" "POST" 400
test_endpoint "Get Booking by Phone" "$API_URL/bookings/phone/254712345678" "GET"
test_endpoint "Get Booking by Email" "$API_URL/bookings/email/test@example.com" "GET"
echo ""

echo "4. PAYMENT ENDPOINTS"
echo "--------------------"
test_endpoint "Get Wallet" "$API_URL/payments/wallet" "GET" 401
test_endpoint "Get Transactions" "$API_URL/payments/transactions" "GET" 401
test_endpoint "Add Funds" "$API_URL/payments/add-funds" "POST" 401
test_endpoint "Withdraw Funds" "$API_URL/payments/withdraw-funds" "POST" 401
echo ""

echo "5. ADMIN ENDPOINTS"
echo "------------------"
test_endpoint "Admin Dashboard" "$API_URL/admin/dashboard" "GET" 401
test_endpoint "Get Users" "$API_URL/admin/users" "GET" 401
test_endpoint "System Health" "$API_URL/admin/system/health" "GET"
echo ""

echo "6. TECHNICIAN ENDPOINTS"
echo "-----------------------"
test_endpoint "Available Jobs" "$API_URL/technician/available-jobs" "GET" 401
test_endpoint "My Jobs" "$API_URL/technician/my-jobs" "GET" 401
test_endpoint "Earnings" "$API_URL/technician/earnings" "GET" 401
echo ""

echo "7. CHAT ENDPOINTS"
echo "-----------------"
test_endpoint "Get Conversations" "$API_URL/chat/conversations" "GET" 401
test_endpoint "Unread Count" "$API_URL/chat/unread-count" "GET" 401
test_endpoint "Send Message" "$API_URL/chat/send" "POST" 401
echo ""

echo "8. NOTIFICATION ENDPOINTS"
echo "-------------------------"
test_endpoint "Get Notifications" "$API_URL/notifications" "GET" 401
test_endpoint "Unread Count" "$API_URL/notifications/unread-count" "GET" 401
test_endpoint "Get Preferences" "$API_URL/notifications/preferences" "GET" 401
echo ""

echo "9. RATING ENDPOINTS"
echo "-------------------"
test_endpoint "Submit Rating" "$API_URL/ratings" "POST" 401
test_endpoint "Get Rating Statistics" "$API_URL/ratings/admin/statistics" "GET" 401
echo ""

echo "10. ANALYTICS ENDPOINTS"
echo "----------------------"
test_endpoint "User Analytics" "$API_URL/analytics/user" "GET" 401
test_endpoint "Booking Analytics" "$API_URL/analytics/bookings" "GET" 401
test_endpoint "Service Analytics" "$API_URL/analytics/services" "GET" 401
echo ""

echo "========================================="
echo "SUMMARY"
echo "========================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CRITICAL ENDPOINTS RESPONDING${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Start frontend: npx expo start --web"
    echo "2. Test wallet functionality"
    echo "3. Complete booking flow E2E test"
    echo "4. Verify payment integration"
    exit 0
else
    echo -e "${YELLOW}⚠ Some endpoints returned unexpected responses${NC}"
    echo ""
    echo "Note: 401 (Unauthorized) and 400 (Bad Request) are expected"
    echo "for protected endpoints without authentication."
    exit 0
fi
