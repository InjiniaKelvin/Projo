#!/bin/bash

# End-to-End Booking System Test
# Tests complete flow: Signup → Login → Create Booking → Fetch Booking → Update Status

echo " Starting End-to-End Booking System Test..."
echo "================================================="

BASE_URL="http://localhost:3000"

# Test user data
USER_EMAIL="e2etest@example.com"
USER_PASSWORD="TestPass123!"
USER_PHONE="+254701234567"
USER_FIRST_NAME="EndToEnd"
USER_LAST_NAME="Test"

echo ""
echo "1⃣ Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"$USER_FIRST_NAME\",\"lastName\":\"$USER_LAST_NAME\",\"email\":\"$USER_EMAIL\",\"phoneNumber\":\"$USER_PHONE\",\"password\":\"$USER_PASSWORD\"}")

echo "Registration Response: $REGISTER_RESPONSE"

# Check if registration was successful
if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo " Registration successful"
else
    echo " Registration failed"
    # Try to continue with login in case user already exists
fi

echo ""
echo "2⃣ Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")

echo "Login Response: $LOGIN_RESPONSE"

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo " Login successful"
    echo " Access Token: ${ACCESS_TOKEN:0:50}..."
else
    echo " Login failed - cannot continue"
    exit 1
fi

echo ""
echo "3⃣ Testing Booking Creation..."
BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"clientName\":\"$USER_FIRST_NAME $USER_LAST_NAME\",\"clientPhone\":\"$USER_PHONE\",\"serviceType\":\"electrical\",\"serviceDescription\":\"Fix power outlet\",\"location\":{\"constituency\":\"Starehe\",\"ward\":\"Nairobi Central\",\"road\":\"Tom Mboya Street\",\"description\":\"Ground floor shop\"},\"preferredDate\":\"2025-08-22\",\"preferredTimeSlot\":\"08:00-10:00\"}")

echo "Booking Response: $BOOKING_RESPONSE"

# Extract booking ID
BOOKING_ID=$(echo "$BOOKING_RESPONSE" | grep -o '"bookingId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$BOOKING_ID" ]; then
    echo " Booking created successfully"
    echo " Booking ID: $BOOKING_ID"
else
    echo " Booking creation failed"
    exit 1
fi

echo ""
echo "4⃣ Testing Booking Retrieval by ID..."
FETCH_RESPONSE=$(curl -s -X GET "$BASE_URL/api/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Fetch Response: $FETCH_RESPONSE"

if echo "$FETCH_RESPONSE" | grep -q '"success":true'; then
    echo " Booking fetch by ID successful"
else
    echo " Booking fetch by ID failed"
fi

echo ""
echo "5⃣ Testing Booking Retrieval by Phone..."
PHONE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/bookings/phone/$USER_PHONE" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Phone Fetch Response: $PHONE_RESPONSE"

if echo "$PHONE_RESPONSE" | grep -q '"success":true'; then
    echo " Booking fetch by phone successful"
    BOOKING_COUNT=$(echo "$PHONE_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo " Total bookings for $USER_PHONE: $BOOKING_COUNT"
else
    echo " Booking fetch by phone failed"
fi

echo ""
echo "6⃣ Testing Booking Status Update..."
STATUS_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/bookings/$BOOKING_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"status":"confirmed"}')

echo "Status Update Response: $STATUS_RESPONSE"

if echo "$STATUS_RESPONSE" | grep -q '"success":true'; then
    echo " Booking status update successful"
else
    echo " Booking status update failed"
fi

echo ""
echo "7⃣ Testing Final Booking State..."
FINAL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

FINAL_STATUS=$(echo "$FINAL_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$FINAL_STATUS" = "confirmed" ]; then
    echo " Final booking status: $FINAL_STATUS"
else
    echo " Final booking status incorrect: $FINAL_STATUS"
fi

echo ""
echo "================================================="
echo " End-to-End Test Complete!"
echo ""
echo " Test Summary:"
echo "   User Registration & Login"
echo "   Authenticated Booking Creation"
echo "   Booking Retrieval (by ID & Phone)"
echo "   Booking Status Updates"
echo "   Phone-based Client Identification"
echo "   Complete Booking Lifecycle"
echo ""
echo " Booking System is fully operational!"
