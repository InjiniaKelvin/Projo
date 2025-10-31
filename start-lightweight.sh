#!/bin/bash
# Lightweight Expo server for low-memory systems

echo "[START] Starting Lightweight Expo Server"
echo "===================================="

# Set memory limits
export NODE_OPTIONS="--max-old-space-size=512"

# Clear Metro cache
echo "Clearing Metro cache..."
rm -rf node_modules/.cache
rm -rf .expo

# Kill any existing Metro processes
pkill -f "metro" 2>/dev/null

# Start Expo with minimal features
echo ""
echo "Starting Expo (minimal mode)..."
echo "[WARNING]  Access via browser at: http://localhost:8081"
echo ""

npx expo start --clear --web --no-dev --minify
