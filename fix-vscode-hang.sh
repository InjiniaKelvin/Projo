#!/bin/bash

echo "🚨 VS Code Emergency Fix"
echo "========================"

# Option 1: Reload window (if VS Code is responsive)
echo "1. First try: Ctrl+Shift+P > 'Developer: Reload Window'"
echo ""

# Option 2: Kill and restart with minimal resources
echo "2. If unresponsive, killing VS Code processes..."
pkill -f "code"
pkill -f "tsserver"
pkill -f "eslint"

sleep 3

echo "3. Checking memory..."
free -h

echo ""
echo "4. Choose your restart option:"
echo "   a) ./restart-vscode-light.sh  (minimal features)"
echo "   b) code .                     (normal restart)"
echo ""
echo "💡 Tips to prevent hanging:"
echo "   - Close file tabs you're not using"
echo "   - Disable extensions temporarily"
echo "   - Use Ctrl+S to save frequently"
echo "   - Restart VS Code every 2 hours"
