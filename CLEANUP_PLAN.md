# QuickFix Project Cleanup Plan
**Date:** October 29, 2025

## Files to Delete (Unused/Obsolete)

### 1. Backup Files (Move to /backup folder)
```
package.json.backup
```

### 2. Old Documentation Files (Superseded by QUICKFIX_PROJECT_DOCUMENTATION.md)
```
ANDROID_SETUP_GUIDE.md
AUTH_PAGES_CENTERED.md
AUTH_PERFORMANCE_FIX.md
AUTH_TROUBLESHOOTING_GUIDE.md
AUTHENTICATION_SYSTEM.md
BOOKING_FIXES_COMPLETE.md
BOOKING_FIXES_REPORT.md
BOOKING_FIX_SUMMARY.md
BOOKING_IMPLEMENTATION_PLAN.md
BOOKING_ISSUE_FINAL_SOLUTION.md
BOOKING_QUICK_REFERENCE.md
BOOKING_REDESIGN_FULL_IMPLEMENTATION.md
BOOKING_RETRIEVAL_COMPLETE.md
BOOKING_SUBMISSION_FIX_COMPLETE.md
BOOKING_SYSTEM_REDESIGN_COMPLETE.md
BOOKING_SYSTEM_REDESIGN_GUIDE.md
BOOKING_TOKEN_FIX.md
BROWSER_CONSOLE_FIXES.md
BROWSER_FIX_FINAL.md
CLEANUP_ANALYSIS.md
COMPLETE_BOOKING_IMPLEMENTATION_SUMMARY.md
COMPLETE_REDESIGN_SUMMARY.md
COMPLETE_STATUS_REPORT.md
DELIVERABLES_INDEX.md
DEMO_GUIDE.md
E2E_TESTING_COMPARISON.md
E2E_TESTING_GUIDE.md
ENV_CONFIGURATION.md
EXECUTIVE_SUMMARY.md
FINAL_COMPLETION_REPORT.md
FINAL_IMPLEMENTATION_COMPLETE.md
FINAL_STATUS_AUTHENTICATION.md
FRONTEND_FINALIZATION_STATUS.md
FRONTEND_PAYMENT_MODULE_COMPLETE.md
IMPLEMENTATION_VERIFICATION_COMPLETE.md
INTASEND_IMPLEMENTATION_SUMMARY.md
INTASEND_INTEGRATION_COMPLETE.md
MANUAL_E2E_TESTING_GUIDE.md
MILESTONE_ROADMAP.md
MOCK_FILES_CLEANUP_REPORT.md
MOCK_FILES_INVENTORY.md
MONGODB_ATLAS_PRODUCTION_STATUS.md
MONGODB_CONNECTION_FIX.md
MONGODB_QUICK_START.md
MONGODB_SETUP_GUIDE.md
NAIROBI_LOCATION_PICKER_COMPLETE.md
PAYMENT_CLEANUP_COMPLETE.md
PHASE_1_IMPLEMENTATION_COMPLETE.md
PROJECT_AUDIT_REPORT.md
QUICKFIX_BOOKING_WORKFLOW.md
QUICK_REFERENCE.md
QUICK_START_GUIDE.md
QUICK_START_TESTING_GUIDE.md
REDESIGNED_SYSTEM_QUICK_START.md
REGISTRATION_FIX_COMPLETE.md
REGISTRATION_LOGIN_SUCCESS.md
RESPONSIVE_DESIGN_COMPLETE.md
RESTART_BACKEND_REQUIRED.md
STARTUP_GUIDE.md
STATUS_TABLES.md
TECHNICIAN_COMMIT_SUMMARY.md
TECHNICIAN_DASHBOARD_ANALYSIS.md
TECHNICIAN_DASHBOARD_COMPLETE.md
TECHNICIAN_DASHBOARD_COMPLETE_AUDIT.md
TECHNICIAN_DASHBOARD_FINAL_COMPLETION.md
TECHNICIAN_E2E_TEST_STATUS.md
TECHNICIAN_MANUAL_TEST_GUIDE.md
TECHNICIAN_PROGRESS_REPORT.md
TECHNICIAN_REMAINING_FEATURES.md
TESTING_GUIDE.md
```

### 3. Old/Unused Test Files (Move to /backup/old-tests)
```
test-atlas-connection.js
test-auth-speed.js
test-booking-complete.js
test-booking-flow-validation.js
test-booking-redesign.js
test-booking-retrieval.js
test-booking-simple.js
test-booking-validation.js
test-comprehensive-workflow.js
test-data-flow-compatibility.js
test-debug-auth.js
test-direct-api.js
test-error-capture.js
test-fast-auth-and-booking.js
test-intasend-integration.js
test-intasend-raw.js
test-live-keys.js
test-live-stk-push.js
test-mongo-connection.js
test-mpesa-live.js
test-quick-registration.js
test-single-booking.js
test-technician-final.js
test-technician-implementation.js
test-token-retrieval.js
backend/test-intasend-integration.js
```

### 4. Utility Scripts (Keep but move to /backup/old-scripts)
```
check-bookings.js
check-intasend-account.js
check-payment-status.js
check-technicians.js
cleanup-indexes.js
cleanup-payment-systems.js
cleanup-test-users.js
debug-intasend.js
debug-skills-matching.js
verify-intasend-config.js
```

### 5. Old Shell Scripts (Move to /backup/old-scripts)
```
test-booking-fixes.sh
test-booking-submission.sh
test-e2e-booking-flow.sh
test-technician-start.sh
run-e2e-tests.sh
fix-vscode-hang.sh
optimize-vscode.sh
performance-monitor.sh
setup-mongodb-atlas.sh
start-backend.sh
start-expo-offline.sh
start-lightweight-vscode.sh
restart-vscode-light.sh
```

### 6. Old Batch Files (Move to /backup/old-scripts)
```
create-payment-branch.bat
fix-maps-error.bat
restart-expo.bat
setup-android-sdk.bat
setup-mongodb.bat
start-all-servers.bat
start-backend-improved.bat
start-backend-safe.bat
start-backend.bat
start-web-dev.bat
start-web.bat
```

### 7. Old Web Test Files (Move to /backup/old-tests)
```
test-location-picker.html
web-api-test.html
web-debug-tool.html
```

### 8. Temporary/Generated Files (Delete)
```
diagnostic-report.json
emoji-removal-report.json
payment-cleanup-report.json
e2e-test-results.log
test-scripts.json
```

### 9. Unused Folders (Review and potentially delete/move)
```
web-mocks/ (if not used)
web-shims/ (if not used)
Utils/ (check if empty or unused)
```

## Files to KEEP (Active/Important)

### Essential Test Files
```
test-e2e-flow.js # Main E2E test - KEEP
test-e2e-technician-system.js # Technician E2E test - KEEP
test-stk-push-now.js # IntaSend STK test - KEEP
test-stk-working.js # IntaSend validation - KEEP
test-all-payments.js # Payment integration test - KEEP
test-complete-booking-flow.js # Booking flow test - KEEP
test-complete-fast.js # Fast test suite - KEEP
```

### Essential Documentation
```
README.md # Main project README - KEEP
QUICKFIX_PROJECT_DOCUMENTATION.md # Master documentation - KEEP
PROJECT_TODO_LIST.md # Active TODO list - KEEP
LICENSE # Project license - KEEP
```

### Essential Scripts
```
remove-emojis.js # Emoji cleanup script - KEEP
server.js # Backend server - KEEP
index.js # Frontend entry - KEEP
```

## Emoji Removal Task

### Files Containing Emojis (to be cleaned)
1. All test files (test-*.js)
2. Script files (scripts/*.js)
3. Backend controllers
4. Frontend components
5. Documentation files (if keeping any with emojis)

### Emojis to Remove
- Console.log emojis: [COMPLETED] [FAILED] [WARNING] [MOBILE] [PAYMENT] [LAUNCH] [NOTE] [INFO] etc.
- Comment emojis in code
- String literals with emojis

## Recommended Actions

1. **Create backup folder structure:**
 ```
 backup/
 ├── old-documentation/
 ├── old-tests/
 ├── old-scripts/
 └── old-files/
 ```

2. **Move files to backup:**
 - All old documentation → backup/old-documentation/
 - Obsolete test files → backup/old-tests/
 - Old scripts → backup/old-scripts/
 - Backup files → backup/old-files/

3. **Delete temporary files:**
 - *.json reports
 - *.log files
 - diagnostic files

4. **Clean emojis from active files:**
 - Run emoji removal script on all kept files
 - Replace emojis with text indicators

5. **Final project structure should have:**
 ```
 /app # Frontend code
 /backend # Backend code
 /components # Reusable components
 /scripts # Active utility scripts
 /tests # Clean test suite
 /backup # All old/archived files
 README.md
 QUICKFIX_PROJECT_DOCUMENTATION.md
 PROJECT_TODO_LIST.md
 server.js
 package.json
 ```

## Estimated Cleanup Impact

- **Files to move to backup:** ~120 files
- **Files to delete:** ~15 files
- **Files to keep:** ~50 files
- **Files to clean (emojis):** ~40 files
- **Disk space to recover:** ~5-10 MB

## Risk Assessment

- **Low Risk:** Moving old documentation and test files (can restore if needed)
- **Medium Risk:** Deleting temporary files (can be regenerated)
- **No Risk:** Emoji removal (cosmetic change only)
