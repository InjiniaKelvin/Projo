#!/bin/bash
# Start Expo with offline mode to avoid fetch errors

echo "Starting Expo in offline mode..."
EXPO_OFFLINE=1 npx expo start --web --offline
