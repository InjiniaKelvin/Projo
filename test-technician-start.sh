#!/bin/bash

# Technician Implementation Test & Start Script
# This script starts the backend and runs tests

echo "[LAUNCH] TECHNICIAN IMPLEMENTATION - TEST & START"
echo "==========================================="
echo ""

# Check if MongoDB is running
echo "[METRICS] Checking MongoDB connection..."
if ! pgrep -x "mongod" > /dev/null; then
 echo "[WARNING] MongoDB may not be running locally"
 echo " Using MongoDB Atlas connection from .env"
fi

# Check if .env file exists
if [ ! -f .env ]; then
 echo "[FAIL] .env file not found!"
 echo " Please create .env file with required variables"
 exit 1
fi

echo "[OK] .env file found"
echo ""

# Check if node_modules exists
if [ ! -d node_modules ]; then
 echo "[PACKAGE] Installing dependencies..."
 npm install
fi

echo " Starting backend server..."
echo ""

# Start the server in background
node server.js > backend.log 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 3

# Check if server started successfully
if ps -p $SERVER_PID > /dev/null; then
 echo "[OK] Backend server started (PID: $SERVER_PID)"
 echo " Log file: backend.log"
 echo ""
 
 # Wait a bit more for full initialization
 sleep 2
 
 # Run tests
 echo " Running tests..."
 echo ""
 node test-technician-implementation.js
 TEST_EXIT_CODE=$?
 
 # Stop the server
 echo ""
 echo " Stopping backend server..."
 kill $SERVER_PID 2>/dev/null
 
 # Show test results
 echo ""
 if [ $TEST_EXIT_CODE -eq 0 ]; then
 echo "[OK] ALL TESTS PASSED!"
 echo " Ready to commit and push to GitHub"
 else
 echo "[FAIL] SOME TESTS FAILED"
 echo " Check the output above for details"
 echo " Backend log: backend.log"
 fi
 
 exit $TEST_EXIT_CODE
else
 echo "[FAIL] Failed to start backend server"
 echo " Check backend.log for errors"
 cat backend.log
 exit 1
fi
