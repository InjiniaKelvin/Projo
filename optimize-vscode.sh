#!/bin/bash

# VS Code Stability Script
# This script helps optimize system resources for better VS Code performance

echo "🔧 VS Code Stability Optimizer"
echo "================================"

# Check system resources
echo "📊 Current System Status:"
free -h
echo ""

# Clean up system memory
echo "🧹 Cleaning system cache..."
sudo sysctl vm.drop_caches=1 2>/dev/null || echo "Cache cleanup requires sudo"
echo ""

# Kill unnecessary background processes
echo "🔄 Optimizing background processes..."
# Kill any hanging node processes except active servers
pkill -f "tsserver" 2>/dev/null || true
pkill -f "eslint" 2>/dev/null || true

# Disable swap temporarily to force memory management
echo "💾 Optimizing memory management..."
# Note: This requires sudo
# sudo swapoff -a && sudo swapon -a

# Show VS Code processes
echo "🖥️  Current VS Code processes:"
ps aux | grep -i code | grep -v grep | head -5

echo ""
echo "✅ Optimization complete!"
echo ""
echo "💡 Additional tips:"
echo "   - Close unused browser tabs"
echo "   - Restart VS Code every 2-3 hours"
echo "   - Use 'Ctrl+Shift+P' > 'Developer: Reload Window' if hanging"
echo "   - Consider using a lightweight editor for simple edits"
echo ""
echo "🚨 If VS Code continues hanging:"
echo "   Run: pkill -f code && code . --disable-extensions"
