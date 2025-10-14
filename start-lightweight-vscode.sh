#!/bin/bash

# QuickFix Development - Lightweight VS Code Setup
# This script starts VS Code with minimal resource usage

echo " Starting QuickFix Development Environment..."

# Kill any hanging VS Code processes
pkill -f "code.*tsserver" 2>/dev/null
pkill -f "code.*typescript" 2>/dev/null

# Set environment variables for performance
export NODE_OPTIONS="--max-old-space-size=2048"
export VSCODE_DISABLE_WORKSPACE_TRUST=true

# Start VS Code with performance flags
code \
    --max-memory=2048 \
    --disable-extensions \
    --disable-telemetry \
    --disable-crash-reporter \
    --disable-updates \
    --no-sandbox \
    "$@"

echo " Lightweight VS Code started!"
