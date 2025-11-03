#!/bin/bash

# BOOKING SYSTEM QUALITY ASSURANCE AUTOMATION
# 
# This script provides automated quality checks and bug prevention
# Run this before any deployment or major changes

echo "[LAUNCH] Starting Booking System Quality Assurance..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print status
print_status() {
 if [ $1 -eq 0 ]; then
 echo -e "${GREEN}[OK] $2${NC}"
 ((PASSED++))
 else
 echo -e "${RED}[FAIL] $2${NC}"
 ((FAILED++))
 fi
}

print_warning() {
 echo -e "${YELLOW}[WARNING] $1${NC}"
 ((WARNINGS++))
}

print_info() {
 echo -e "${BLUE}ℹ $1${NC}"
}

# 1. CHECK BACKEND SERVER
echo -e "\n${BLUE}1. Checking Backend Server...${NC}"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
 print_status 0 "Backend server is running"
else
 print_status 1 "Backend server is not running"
 echo " → Start with: node server.js"
fi

# 2. CHECK DATABASE CONNECTION
echo -e "\n${BLUE}2. Checking Database Connection...${NC}"
if pgrep mongod > /dev/null; then
 print_status 0 "MongoDB is running"
else
 print_status 1 "MongoDB is not running"
 echo " → Start with: sudo systemctl start mongod"
fi

# 3. VALIDATE ENVIRONMENT VARIABLES
echo -e "\n${BLUE}3. Checking Environment Variables...${NC}"
if [ -f .env ]; then
 print_status 0 ".env file exists"
 
 # Check required variables
 if grep -q "JWT_SECRET" .env; then
 print_status 0 "JWT_SECRET is configured"
 else
 print_status 1 "JWT_SECRET is missing"
 fi
 
 if grep -q "MONGODB_URI" .env; then
 print_status 0 "MONGODB_URI is configured"
 else
 print_warning "MONGODB_URI not found (may use default)"
 fi
else
 print_status 1 ".env file is missing"
fi

# 4. CHECK FILE STRUCTURE
echo -e "\n${BLUE}4. Validating File Structure...${NC}"

# Backend files
if [ -f "backend/models/BookingRedesigned.js" ]; then
 print_status 0 "Redesigned booking model exists"
else
 print_status 1 "Redesigned booking model missing"
fi

if [ -f "backend/controllers/BookingControllerRedesigned.js" ]; then
 print_status 0 "Redesigned booking controller exists"
else
 print_status 1 "Redesigned booking controller missing"
fi

if [ -f "backend/routes/bookingRedesigned.js" ]; then
 print_status 0 "Redesigned booking routes exist"
else
 print_status 1 "Redesigned booking routes missing"
fi

# Frontend files
if [ -f "app/booking/redesigned-form.tsx" ]; then
 print_status 0 "Redesigned booking form exists"
else
 print_status 1 "Redesigned booking form missing"
fi

# 5. RUN AUTOMATED TESTS
echo -e "\n${BLUE}5. Running Automated Tests...${NC}"
if [ -f "scripts/comprehensive-booking-validator.js" ]; then
 print_info "Running comprehensive validation..."
 if node scripts/comprehensive-booking-validator.js; then
 print_status 0 "Automated tests completed"
 else
 print_status 1 "Some automated tests failed"
 fi
else
 print_warning "Comprehensive validator not found"
fi

# 6. CHECK CODE QUALITY
echo -e "\n${BLUE}6. Code Quality Checks...${NC}"

# Check for TODO/FIXME comments
TODO_COUNT=$(find . -name "*.js" -o -name "*.tsx" -o -name "*.ts" | xargs grep -c "TODO\|FIXME" 2>/dev/null | awk -F: '{sum += $2} END {print sum}')
if [ "$TODO_COUNT" -gt 0 ]; then
 print_warning "Found $TODO_COUNT TODO/FIXME comments"
else
 print_status 0 "No pending TODO/FIXME items"
fi

# Check for console.log statements (should be minimal in production)
CONSOLE_COUNT=$(find . -name "*.js" -o -name "*.tsx" -o -name "*.ts" | xargs grep -c "console\.log" 2>/dev/null | awk -F: '{sum += $2} END {print sum}')
if [ "$CONSOLE_COUNT" -gt 10 ]; then
 print_warning "Found $CONSOLE_COUNT console.log statements (consider reducing for production)"
else
 print_status 0 "Console.log usage is reasonable ($CONSOLE_COUNT found)"
fi

# 7. SECURITY CHECKS
echo -e "\n${BLUE}7. Security Checks...${NC}"

# Check for hardcoded secrets
if grep -r "password\s*=\s*['\"][^'\"]*['\"]" . --exclude-dir=node_modules 2>/dev/null; then
 print_status 1 "Potential hardcoded passwords found"
else
 print_status 0 "No hardcoded passwords detected"
fi

# Check for exposed API keys
if grep -r "api[_-]key\s*=\s*['\"][^'\"]*['\"]" . --exclude-dir=node_modules 2>/dev/null; then
 print_status 1 "Potential exposed API keys found"
else
 print_status 0 "No exposed API keys detected"
fi

# 8. PERFORMANCE CHECKS
echo -e "\n${BLUE}8. Performance Checks...${NC}"

# Check for large files
LARGE_FILES=$(find . -name "*.js" -o -name "*.tsx" -o -name "*.ts" | xargs wc -l 2>/dev/null | awk '$1 > 500 {print $2 " (" $1 " lines)"}' | head -5)
if [ -n "$LARGE_FILES" ]; then
 print_warning "Large files found (consider breaking down):"
 echo "$LARGE_FILES" | while read line; do
 echo " → $line"
 done
else
 print_status 0 "No excessively large files found"
fi

# 9. DEPENDENCY CHECKS
echo -e "\n${BLUE}9. Dependency Checks...${NC}"

if [ -f "package.json" ]; then
 print_status 0 "package.json exists"
 
 # Check for outdated packages (if npm is available)
 if command -v npm &> /dev/null; then
 print_info "Checking for outdated packages..."
 OUTDATED=$(npm outdated 2>/dev/null | wc -l)
 if [ "$OUTDATED" -gt 1 ]; then
 print_warning "$((OUTDATED-1)) packages may need updating"
 else
 print_status 0 "All packages are up to date"
 fi
 fi
else
 print_status 1 "package.json is missing"
fi

# 10. FINAL REPORT
echo -e "\n${BLUE}================================================${NC}"
echo -e "${BLUE}[METRICS] QUALITY ASSURANCE SUMMARY${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}[OK] Passed: $PASSED${NC}"
echo -e "${YELLOW}[WARNING] Warnings: $WARNINGS${NC}"
echo -e "${RED}[FAIL] Failed: $FAILED${NC}"

# Calculate score
TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
 SCORE=$((PASSED * 100 / TOTAL))
 echo -e "${BLUE} Quality Score: $SCORE%${NC}"
 
 if [ $FAILED -eq 0 ]; then
 echo -e "\n${GREEN} EXCELLENT! All critical checks passed.${NC}"
 echo -e "${GREEN} System is ready for deployment.${NC}"
 exit 0
 elif [ $SCORE -ge 80 ]; then
 echo -e "\n${YELLOW} GOOD! Most checks passed.${NC}"
 echo -e "${YELLOW} Address the failed items before deployment.${NC}"
 exit 1
 else
 echo -e "\n${RED} NEEDS ATTENTION! Multiple issues found.${NC}"
 echo -e "${RED} Please fix critical issues before proceeding.${NC}"
 exit 2
 fi
else
 echo -e "\n${RED} Unable to run quality checks properly.${NC}"
 exit 3
fi
