#!/bin/bash

# Lightweight VS Code launcher to prevent system freezing
echo "🚀 Starting Lightweight VS Code..."

# Kill any existing VS Code processes
pkill -f "code"
sleep 2

# Clear VS Code cache
rm -rf ~/.config/Code/CachedData/*
rm -rf ~/.config/Code/logs/*

# Start VS Code with minimal extensions and reduced memory usage
code --disable-extensions --max-memory=2048 --disable-gpu --no-sandbox .

echo "✅ Lightweight VS Code started!"
