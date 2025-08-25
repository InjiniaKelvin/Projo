#!/bin/bash

echo "🔧 Emergency System Optimization..."

# Free up memory
sudo sync
sudo echo 3 > /proc/sys/vm/drop_caches

# Kill heavy processes
pkill -f "chrome"
pkill -f "firefox"
pkill -f "code"
pkill -f "electron"

# Limit CPU usage for node processes
sudo renice -n 19 -p $(pgrep node) 2>/dev/null

# Clear temp files
rm -rf /tmp/*
rm -rf ~/.cache/*

echo "✅ System optimized for development!"

# Start minimal backend only
cd /home/engkejumwa/Desktop/PROJO12/Projo
echo "🚀 Starting backend server..."
node server.js
