#!/bin/bash

# Detox E2E Test Runner Script
# This script sets up and runs the complete booking flow tests

echo " Starting Detox E2E Test Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
 echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
 echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
 echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
 echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required dependencies are installed
print_status "Checking dependencies..."

# Check Node.js
if ! command -v node &> /dev/null; then
 print_error "Node.js is not installed"
 exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
 print_error "npm is not installed"
 exit 1
fi

# Check if Detox is installed
if ! npx detox --version &> /dev/null; then
 print_warning "Detox CLI not found, installing..."
 npm install -g detox-cli
fi

print_success "Dependencies check complete"

# Check if backend server is running
print_status "Checking backend server..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
 print_success "Backend server is running on port 3000"
else
 print_warning "Backend server not detected on port 3000"
 print_status "Starting backend server..."
 
 # Start backend in background
 npm run server &
 BACKEND_PID=$!
 
 # Wait for server to start
 for i in {1..30}; do
 if curl -s http://localhost:3000/health > /dev/null 2>&1; then
 print_success "Backend server started successfully"
 break
 fi
 
 if [ $i -eq 30 ]; then
 print_error "Backend server failed to start"
 exit 1
 fi
 
 sleep 1
 done
fi

# Check if mobile simulator/emulator is available
print_status "Checking mobile environment..."

# For iOS Simulator
if command -v xcrun &> /dev/null; then
 if xcrun simctl list devices | grep -q "iPhone.*Booted"; then
 print_success "iOS Simulator is running"
 MOBILE_ENV="ios"
 else
 print_warning "No iOS Simulator detected"
 fi
fi

# For Android Emulator
if command -v adb &> /dev/null; then
 if adb devices | grep -q "emulator"; then
 print_success "Android Emulator is running"
 MOBILE_ENV="android"
 else
 print_warning "No Android Emulator detected"
 fi
fi

# If no simulator/emulator, suggest Expo Go
if [ -z "$MOBILE_ENV" ]; then
 print_warning "No mobile simulator/emulator detected"
 print_status "For development, you can use Expo Go on a physical device"
 print_status "Starting Expo development server..."
 
 # Start Expo in background
 npm start &
 EXPO_PID=$!
 
 sleep 5
 print_success "Expo development server started"
 print_status "Scan QR code with Expo Go app to test on physical device"
fi

# Create test artifacts directory
print_status "Setting up test environment..."
mkdir -p e2e/artifacts
print_success "Test artifacts directory created"

# Run the tests based on available environment
print_status "Running E2E tests..."

if [ "$MOBILE_ENV" = "ios" ]; then
 print_status "Running tests on iOS Simulator..."
 npx detox test --configuration ios.sim.debug e2e/booking-flow.test.js
elif [ "$MOBILE_ENV" = "android" ]; then
 print_status "Running tests on Android Emulator..."
 npx detox test --configuration android.emu.debug e2e/booking-flow.test.js
else
 print_status "Running basic test validation..."
 # Run a dry run to validate test structure
 node -c e2e/booking-flow.test.js
 if [ $? -eq 0 ]; then
 print_success "Test file syntax validation passed"
 print_status "Test structure is valid"
 print_warning "To run full E2E tests, please start an iOS Simulator or Android Emulator"
 else
 print_error "Test file has syntax errors"
 exit 1
 fi
fi

# Cleanup function
cleanup() {
 print_status "Cleaning up processes..."
 
 if [ ! -z "$BACKEND_PID" ]; then
 kill $BACKEND_PID 2>/dev/null
 print_status "Backend server stopped"
 fi
 
 if [ ! -z "$EXPO_PID" ]; then
 kill $EXPO_PID 2>/dev/null
 print_status "Expo server stopped"
 fi
}

# Set trap to cleanup on script exit
trap cleanup EXIT

print_success "E2E test execution completed!"

# Show test results summary
echo ""
echo " Test Results Summary:"
echo "========================"

if [ -f "e2e/artifacts/test-results.xml" ]; then
 print_success "Test results saved to e2e/artifacts/test-results.xml"
fi

if [ -d "e2e/artifacts" ] && [ "$(ls -A e2e/artifacts)" ]; then
 echo "Test artifacts:"
 ls -la e2e/artifacts/
else
 print_status "No test artifacts generated"
fi

echo ""
echo " Next Steps:"
echo "==============="
echo "1. Review test results in e2e/artifacts/"
echo "2. Check screenshots and videos for failed tests"
echo "3. Run specific tests: npm run test:booking"
echo "4. For mobile testing, ensure simulator/emulator is running"
echo ""

print_success "Booking flow E2E tests setup complete!"
