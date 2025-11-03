#!/bin/bash
# Emergency script to free memory when system is hanging

echo "[ALERT] EMERGENCY MEMORY CLEANUP"
echo "============================="
echo ""

# Kill memory-intensive processes
echo "Killing memory-intensive processes..."

# Kill VS Code
pkill -9 code
echo "✓ Killed VS Code"

# Kill Brave/Chrome/Chromium
pkill -9 brave
pkill -9 chrome
pkill -9 chromium
echo "✓ Killed browsers"

# Kill Node processes
pkill -9 node
echo "✓ Killed Node processes"

# Kill Expo processes
pkill -9 expo
echo "✓ Killed Expo processes"

# Stop unnecessary services
sudo systemctl stop snapd 2>/dev/null
sudo systemctl stop bluetooth 2>/dev/null
echo "✓ Stopped services"

# Clear caches
sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null
echo "✓ Cleared system caches"

echo ""
echo "Memory status after cleanup:"
free -h

echo ""
echo "[OK] Emergency cleanup complete!"
echo ""
echo "You can now:"
echo "  1. Wait 10 seconds for system to stabilize"
echo "  2. Restart only what you need"
echo "  3. Use ./start-dev.sh to restart development"
