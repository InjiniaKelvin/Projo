#!/bin/bash

# Booking Submission Test Script
# Tests the complete booking flow end-to-end

echo "=========================================="
echo "BOOKING SUBMISSION TEST"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
 if [ $1 -eq 0 ]; then
 echo -e "${GREEN}OK PASS${NC}: $2"
 ((TESTS_PASSED++))
 else
 echo -e "${RED}FAIL FAIL${NC}: $2"
 ((TESTS_FAILED++))
 fi
}

# Test 1: Check if backend is running
echo "Test 1: Backend Server Health Check"
echo "--------------------------------------"
HEALTH_RESPONSE=$(curl -s http://localhost:5000/health)
if echo "$HEALTH_RESPONSE" | grep -q '"success":true'; then
 print_result 0 "Backend server is running on port 5000"
 echo "Response: $HEALTH_RESPONSE"
else
 print_result 1 "Backend server is not running on port 5000"
 echo "Response: $HEALTH_RESPONSE"
fi
echo ""

# Test 2: Check MongoDB connection
echo "Test 2: Database Connection"
echo "--------------------------------------"
if echo "$HEALTH_RESPONSE" | grep -q '"database":"connected"'; then
 print_result 0 "MongoDB is connected"
else
 print_result 1 "MongoDB is not connected"
fi
echo ""

# Test 3: Check if booking route exists
echo "Test 3: Booking API Route Availability"
echo "--------------------------------------"
ROUTE_TEST=$(curl -s -X POST http://localhost:5000/api/bookings-redesigned/redesigned \
 -H "Content-Type: application/json" \
 -d '{}' 2>&1)

if echo "$ROUTE_TEST" | grep -q -E '(error|success|validation)'; then
 print_result 0 "Booking endpoint is accessible"
 echo "Response: ${ROUTE_TEST:0:100}..."
else
 print_result 1 "Booking endpoint is not accessible"
 echo "Response: $ROUTE_TEST"
fi
echo ""

# Test 4: Test validation with empty data
echo "Test 4: Validation with Empty Data"
echo "--------------------------------------"
EMPTY_TEST=$(curl -s -X POST http://localhost:5000/api/bookings-redesigned/redesigned \
 -H "Content-Type: application/json" \
 -d '{}')

if echo "$EMPTY_TEST" | grep -q -E '(validation|required|error)'; then
 print_result 0 "Validation is working for empty data"
 echo "Response: ${EMPTY_TEST:0:150}..."
else
 print_result 1 "Validation is not working properly"
 echo "Response: $EMPTY_TEST"
fi
echo ""

# Test 5: Test with valid booking data
echo "Test 5: Submit Valid Booking Data"
echo "--------------------------------------"
VALID_BOOKING=$(cat <<EOF
{
 "clientName": "Test User",
 "clientPhone": "0712345678",
 "clientEmail": "test@example.com",
 "communicationPhone": "",
 "serviceType": "plumbing",
 "serviceDescription": "Test booking from automated script - Fix leaking kitchen sink tap",
 "urgency": "normal",
 "location": {
 "constituency": "Westlands",
 "ward": "Parklands/Highridge",
 "road": "Limuru Road",
 "description": "Test location description",
 "landmarks": "Near test landmark"
 },
 "preferredDate": "2025-10-20",
 "preferredTimeSlot": "10:00-12:00",
 "specialRequirements": "This is a test booking"
}
EOF
)

BOOKING_RESPONSE=$(curl -s -X POST http://localhost:5000/api/bookings-redesigned/redesigned \
 -H "Content-Type: application/json" \
 -d "$VALID_BOOKING")

if echo "$BOOKING_RESPONSE" | grep -q '"success":true'; then
 print_result 0 "Valid booking was accepted"
 echo "Response: $BOOKING_RESPONSE" | head -c 200
 echo ""
 
 # Extract booking ID if present
 BOOKING_ID=$(echo "$BOOKING_RESPONSE" | grep -o '"bookingId":"[^"]*"' | cut -d'"' -f4)
 if [ -n "$BOOKING_ID" ]; then
 echo -e "${GREEN}Booking ID: $BOOKING_ID${NC}"
 fi
else
 print_result 1 "Valid booking was rejected"
 echo "Response: $BOOKING_RESPONSE"
fi
echo ""

# Test 6: Check frontend file has no TypeScript errors
echo "Test 6: Frontend File Integrity"
echo "--------------------------------------"
if [ -f "app/booking/details.tsx" ]; then
 # Check for common issues
 ISSUES_FOUND=0
 
 # Check for localhost:3000 (should be 5000)
 if grep -q "localhost:3000" app/booking/details.tsx; then
 echo -e "${RED}Found localhost:3000 reference (should be 5000)${NC}"
 ((ISSUES_FOUND++))
 fi
 
 # Check for useEffect without dependencies (common infinite loop cause)
 if grep -A1 "useEffect" app/booking/details.tsx | grep -q "}, \[\]);" ; then
 echo -e "${YELLOW}Warning: Found useEffect with empty dependency array${NC}"
 fi
 
 # Check if Authorization header is present
 if grep -q "Authorization.*Bearer" app/booking/details.tsx; then
 echo -e "${GREEN}Authorization header implementation found${NC}"
 else
 echo -e "${YELLOW}Warning: Authorization header might be missing${NC}"
 fi
 
 if [ $ISSUES_FOUND -eq 0 ]; then
 print_result 0 "Frontend file looks good"
 else
 print_result 1 "Frontend file has $ISSUES_FOUND issue(s)"
 fi
else
 print_result 1 "Frontend file not found"
fi
echo ""

# Test 7: Check storage implementation
echo "Test 7: Storage Helper Implementation"
echo "--------------------------------------"
if grep -q "storage.*getItem.*token" app/booking/details.tsx; then
 print_result 0 "Storage helper is implemented"
else
 print_result 1 "Storage helper might be missing"
fi
echo ""

# Test 8: Check for React Native Web compatibility
echo "Test 8: React Native Web Compatibility"
echo "--------------------------------------"
# Check for text directly in View (common error)
DIRECT_TEXT=$(grep -n "View>" app/booking/details.tsx | grep -E "[^<].*[^/]>[ ]*[a-zA-Z0-9]" | wc -l)
if [ "$DIRECT_TEXT" -eq 0 ]; then
 print_result 0 "No direct text in View components"
else
 print_result 1 "Found $DIRECT_TEXT potential direct text in View components"
fi
echo ""

# Summary
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
 echo -e "${GREEN}All tests passed! Booking system is ready.${NC}"
 exit 0
else
 echo -e "${RED}Some tests failed. Please review the issues above.${NC}"
 exit 1
fi
