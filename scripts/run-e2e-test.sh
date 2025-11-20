#!/bin/bash

# ==============================================================================
# E2E Test Runner Script
#
# This script provides a robust way to run Cypress E2E tests.
#
# Usage:
# ./scripts/run-e2e-test.sh <path_to_spec_file>
#
# Example:
# ./scripts/run-e2e-test.sh cypress/e2e/client.cy.js
#
# Features:
# - Runs a specific Cypress test spec.
# - Uses the Brave browser for the test run.
# - Creates a dedicated, timestamped log file for each run in the 'logs' directory.
# - Logs all stdout and stderr for detailed analysis.
# - Provides clear start and end markers in the log file.
# ==============================================================================

# --- Configuration ---
LOGS_DIR="logs"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# --- Input Validation ---
if [ -z "$1" ]; then
  echo "❌ Error: No spec file provided."
  echo "Usage: $0 <path_to_spec_file>"
  exit 1
fi

SPEC_FILE=$1
LOG_FILE="${LOGS_DIR}/test_run_${TIMESTAMP}.log"

# --- Pre-run Setup ---
mkdir -p $LOGS_DIR
touch $LOG_FILE

# --- Execution ---
echo "============================================================" | tee -a $LOG_FILE
echo "🚀 Starting E2E Test Run" | tee -a $LOG_FILE
echo "============================================================" | tee -a $LOG_FILE
echo "▶️  Spec File: ${SPEC_FILE}" | tee -a $LOG_FILE
echo "📁 Log File:  ${LOG_FILE}" | tee -a $LOG_FILE
echo "⏰ Timestamp: ${TIMESTAMP}" | tee -a $LOG_FILE
echo "============================================================" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# Run Cypress with Chromium, logging all output
# Using 'script' command to capture output exactly as it appears in the terminal
script -q -c "npm run cypress:run -- --spec ${SPEC_FILE} --browser chromium" /dev/null | tee -a $LOG_FILE

# --- Post-run Analysis ---
TEST_EXIT_CODE=${PIPESTATUS[0]}

echo "" | tee -a $LOG_FILE
echo "============================================================" | tee -a $LOG_FILE
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ Test Run Finished Successfully" | tee -a $LOG_FILE
else
  echo "❌ Test Run Finished with Errors (Exit Code: ${TEST_EXIT_CODE})" | tee -a $LOG_FILE
fi
echo "============================================================" | tee -a $LOG_FILE

exit $TEST_EXIT_CODE
