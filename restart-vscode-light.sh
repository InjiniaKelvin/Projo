#!/bin/bash

# Lightweight VS Code restart for better performance
echo " Restarting VS Code with minimal extensions..."

# Kill current VS Code processes
pkill -f "code"
sleep 2

# Start VS Code with minimal features
echo " Starting optimized VS Code..."
code . --disable-extensions --disable-gpu --max-memory=1024 &

echo " VS Code restarted with performance optimizations!"
echo " Extensions are disabled. Enable only essential ones if needed."
