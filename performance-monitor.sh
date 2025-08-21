#!/bin/bash

# QuickFix Performance Monitor
# Monitors system resources and kills resource-heavy processes

echo "🔍 QuickFix Performance Monitor"
echo "================================"

while true; do
    # Get memory usage
    MEM_AVAILABLE=$(free | grep '^Mem:' | awk '{print $7}')
    MEM_AVAILABLE_MB=$((MEM_AVAILABLE / 1024))
    
    # Get CPU load
    CPU_LOAD=$(uptime | awk -F'load average:' '{ print $2 }' | awk '{ print $1 }' | sed 's/,//')
    
    # Current time
    TIMESTAMP=$(date '+%H:%M:%S')
    
    echo "[$TIMESTAMP] Memory: ${MEM_AVAILABLE_MB}MB available | CPU Load: $CPU_LOAD"
    
    # Alert if memory is critically low (less than 300MB)
    if [ $MEM_AVAILABLE_MB -lt 300 ]; then
        echo "⚠️  CRITICAL: Low memory detected! Cleaning up..."
        
        # Kill heavy VS Code processes
        pkill -f "extensionHost" 2>/dev/null
        pkill -f "tsserver" 2>/dev/null
        
        # Clear caches
        sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1
        
        echo "✅ Emergency cleanup completed"
    fi
    
    sleep 10
done
