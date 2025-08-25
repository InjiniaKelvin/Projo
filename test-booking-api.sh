#!/bin/bash

echo "🧪 Testing QuickFix Booking System..."

# Start backend server in background
echo "🚀 Starting backend server..."
cd /home/engkejumwa/Desktop/PROJO12/Projo
node server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test booking endpoint
echo "📝 Testing booking submission..."
curl -X POST http://localhost:3000/api/bookings-redesigned \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test User",
    "clientPhone": "0712345678",
    "clientEmail": "test@example.com",
    "serviceType": "plumbing",
    "serviceDescription": "Test emergency plumbing repair needed",
    "location": {
      "constituency": "Westlands",
      "ward": "Kitisuru",
      "road": "Peponi Road",
      "description": "Near Two Rivers Mall"
    },
    "preferredDate": "2025-08-26",
    "preferredTimeSlot": "09:00-12:00",
    "urgency": "standard",
    "additionalInfo": "Test booking via curl"
  }' \
  | python3 -m json.tool

# Test emergency booking endpoint
echo -e "\n🚨 Testing emergency booking..."
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Emergency Test User",
    "clientPhone": "0798765432",
    "clientEmail": "emergency@example.com",
    "serviceType": "emergency",
    "serviceDescription": "Emergency test booking",
    "location": {
      "constituency": "Westlands",
      "ward": "Kitisuru", 
      "road": "Peponi Road",
      "description": "Emergency location test"
    },
    "preferredDate": "2025-08-26",
    "preferredTimeSlot": "ASAP",
    "urgency": "emergency",
    "additionalInfo": "Emergency curl test"
  }' \
  | python3 -m json.tool

# Stop server
kill $SERVER_PID

echo "✅ Test completed!"
