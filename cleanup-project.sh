#!/bin/bash

# QuickFix Project Cleanup Script
# This script organizes the project by moving old files to backup folders
# and removing emojis from active code files

set -e # Exit on error

PROJECT_ROOT="/home/injinia47/Desktop/PROJO/Projo"
cd "$PROJECT_ROOT"

echo "========================================="
echo "QuickFix Project Cleanup"
echo "========================================="
echo ""

# Create backup folder structure
echo "1. Creating backup folder structure..."
mkdir -p backup/old-documentation
mkdir -p backup/old-tests
mkdir -p backup/old-scripts
mkdir -p backup/old-files
mkdir -p backup/temporary-files
echo "OK Backup folders created"
echo ""

# Move old documentation files
echo "2. Moving old documentation files..."
OLD_DOCS=(
 "ANDROID_SETUP_GUIDE.md"
 "AUTH_PAGES_CENTERED.md"
 "AUTH_PERFORMANCE_FIX.md"
 "AUTH_TROUBLESHOOTING_GUIDE.md"
 "AUTHENTICATION_SYSTEM.md"
 "BOOKING_FIXES_COMPLETE.md"
 "BOOKING_FIXES_REPORT.md"
 "BOOKING_FIX_SUMMARY.md"
 "BOOKING_IMPLEMENTATION_PLAN.md"
 "BOOKING_ISSUE_FINAL_SOLUTION.md"
 "BOOKING_QUICK_REFERENCE.md"
 "BOOKING_REDESIGN_FULL_IMPLEMENTATION.md"
 "BOOKING_RETRIEVAL_COMPLETE.md"
 "BOOKING_SUBMISSION_FIX_COMPLETE.md"
 "BOOKING_SYSTEM_REDESIGN_COMPLETE.md"
 "BOOKING_SYSTEM_REDESIGN_GUIDE.md"
 "BOOKING_TOKEN_FIX.md"
 "BROWSER_CONSOLE_FIXES.md"
 "BROWSER_FIX_FINAL.md"
 "CLEANUP_ANALYSIS.md"
 "COMPLETE_BOOKING_IMPLEMENTATION_SUMMARY.md"
 "COMPLETE_REDESIGN_SUMMARY.md"
 "COMPLETE_STATUS_REPORT.md"
 "DELIVERABLES_INDEX.md"
 "DEMO_GUIDE.md"
 "E2E_TESTING_COMPARISON.md"
 "E2E_TESTING_GUIDE.md"
 "ENV_CONFIGURATION.md"
 "EXECUTIVE_SUMMARY.md"
 "FINAL_COMPLETION_REPORT.md"
 "FINAL_IMPLEMENTATION_COMPLETE.md"
 "FINAL_STATUS_AUTHENTICATION.md"
 "FRONTEND_FINALIZATION_STATUS.md"
 "FRONTEND_PAYMENT_MODULE_COMPLETE.md"
 "IMPLEMENTATION_VERIFICATION_COMPLETE.md"
 "INTASEND_IMPLEMENTATION_SUMMARY.md"
 "INTASEND_INTEGRATION_COMPLETE.md"
 "MANUAL_E2E_TESTING_GUIDE.md"
 "MILESTONE_ROADMAP.md"
 "MOCK_FILES_CLEANUP_REPORT.md"
 "MOCK_FILES_INVENTORY.md"
 "MONGODB_ATLAS_PRODUCTION_STATUS.md"
 "MONGODB_CONNECTION_FIX.md"
 "MONGODB_QUICK_START.md"
 "MONGODB_SETUP_GUIDE.md"
 "NAIROBI_LOCATION_PICKER_COMPLETE.md"
 "PAYMENT_CLEANUP_COMPLETE.md"
 "PHASE_1_IMPLEMENTATION_COMPLETE.md"
 "PROJECT_AUDIT_REPORT.md"
 "QUICKFIX_BOOKING_WORKFLOW.md"
 "QUICK_REFERENCE.md"
 "QUICK_START_GUIDE.md"
 "QUICK_START_TESTING_GUIDE.md"
 "REDESIGNED_SYSTEM_QUICK_START.md"
 "REGISTRATION_FIX_COMPLETE.md"
 "REGISTRATION_LOGIN_SUCCESS.md"
 "RESPONSIVE_DESIGN_COMPLETE.md"
 "RESTART_BACKEND_REQUIRED.md"
 "STARTUP_GUIDE.md"
 "STATUS_TABLES.md"
 "TECHNICIAN_COMMIT_SUMMARY.md"
 "TECHNICIAN_DASHBOARD_ANALYSIS.md"
 "TECHNICIAN_DASHBOARD_COMPLETE.md"
 "TECHNICIAN_DASHBOARD_COMPLETE_AUDIT.md"
 "TECHNICIAN_DASHBOARD_FINAL_COMPLETION.md"
 "TECHNICIAN_E2E_TEST_STATUS.md"
 "TECHNICIAN_MANUAL_TEST_GUIDE.md"
 "TECHNICIAN_PROGRESS_REPORT.md"
 "TECHNICIAN_REMAINING_FEATURES.md"
 "TESTING_GUIDE.md"
)

DOC_COUNT=0
for doc in "${OLD_DOCS[@]}"; do
 if [ -f "$doc" ]; then
 mv "$doc" backup/old-documentation/
 ((DOC_COUNT++))
 fi
done
echo "OK Moved $DOC_COUNT documentation files"
echo ""

# Move old test files
echo "3. Moving old test files..."
OLD_TESTS=(
 "test-atlas-connection.js"
 "test-auth-speed.js"
 "test-booking-complete.js"
 "test-booking-flow-validation.js"
 "test-booking-redesign.js"
 "test-booking-retrieval.js"
 "test-booking-simple.js"
 "test-booking-validation.js"
 "test-comprehensive-workflow.js"
 "test-data-flow-compatibility.js"
 "test-debug-auth.js"
 "test-direct-api.js"
 "test-error-capture.js"
 "test-fast-auth-and-booking.js"
 "test-intasend-integration.js"
 "test-intasend-raw.js"
 "test-live-keys.js"
 "test-live-stk-push.js"
 "test-mongo-connection.js"
 "test-mpesa-live.js"
 "test-quick-registration.js"
 "test-single-booking.js"
 "test-technician-final.js"
 "test-technician-implementation.js"
 "test-token-retrieval.js"
 "backend/test-intasend-integration.js"
 "test-location-picker.html"
 "web-api-test.html"
 "web-debug-tool.html"
)

TEST_COUNT=0
for test in "${OLD_TESTS[@]}"; do
 if [ -f "$test" ]; then
 mv "$test" backup/old-tests/
 ((TEST_COUNT++))
 fi
done
echo "OK Moved $TEST_COUNT test files"
echo ""

# Move old scripts
echo "4. Moving old scripts..."
OLD_SCRIPTS=(
 "check-bookings.js"
 "check-intasend-account.js"
 "check-payment-status.js"
 "check-technicians.js"
 "cleanup-indexes.js"
 "cleanup-payment-systems.js"
 "cleanup-test-users.js"
 "debug-intasend.js"
 "debug-skills-matching.js"
 "verify-intasend-config.js"
 "test-booking-fixes.sh"
 "test-booking-submission.sh"
 "test-e2e-booking-flow.sh"
 "test-technician-start.sh"
 "run-e2e-tests.sh"
 "fix-vscode-hang.sh"
 "optimize-vscode.sh"
 "performance-monitor.sh"
 "setup-mongodb-atlas.sh"
 "start-backend.sh"
 "start-expo-offline.sh"
 "start-lightweight-vscode.sh"
 "restart-vscode-light.sh"
 "create-payment-branch.bat"
 "fix-maps-error.bat"
 "restart-expo.bat"
 "setup-android-sdk.bat"
 "setup-mongodb.bat"
 "start-all-servers.bat"
 "start-backend-improved.bat"
 "start-backend-safe.bat"
 "start-backend.bat"
 "start-web-dev.bat"
 "start-web.bat"
)

SCRIPT_COUNT=0
for script in "${OLD_SCRIPTS[@]}"; do
 if [ -f "$script" ]; then
 mv "$script" backup/old-scripts/
 ((SCRIPT_COUNT++))
 fi
done
echo "OK Moved $SCRIPT_COUNT script files"
echo ""

# Move backup and temporary files
echo "5. Moving backup and temporary files..."
TEMP_FILES=(
 "package.json.backup"
 "diagnostic-report.json"
 "emoji-removal-report.json"
 "payment-cleanup-report.json"
 "e2e-test-results.log"
 "test-scripts.json"
)

TEMP_COUNT=0
for temp in "${TEMP_FILES[@]}"; do
 if [ -f "$temp" ]; then
 if [[ "$temp" == *.backup ]]; then
 mv "$temp" backup/old-files/
 else
 mv "$temp" backup/temporary-files/
 fi
 ((TEMP_COUNT++))
 fi
done
echo "OK Moved $TEMP_COUNT backup/temporary files"
echo ""

# Remove emojis from active files
echo "6. Removing emojis from active files..."
echo " Running emoji removal script..."

# Check if remove-emojis.js exists
if [ -f "remove-emojis.js" ]; then
 node remove-emojis.js
 echo "OK Emojis removed from active files"
else
 echo " remove-emojis.js not found, skipping emoji removal"
fi
echo ""

# Generate cleanup summary
echo "========================================="
echo "Cleanup Summary"
echo "========================================="
echo "Documentation files moved: $DOC_COUNT"
echo "Test files moved: $TEST_COUNT"
echo "Script files moved: $SCRIPT_COUNT"
echo "Backup/temp files moved: $TEMP_COUNT"
echo "Total files organized: $((DOC_COUNT + TEST_COUNT + SCRIPT_COUNT + TEMP_COUNT))"
echo ""
echo "All files have been moved to backup/ folder"
echo "You can safely delete the backup folder if not needed"
echo ""
echo "OK Cleanup completed successfully!"
echo "========================================="
