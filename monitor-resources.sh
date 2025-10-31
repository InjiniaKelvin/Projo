#!/bin/bash
# Monitor system resources and warn before crash

while true; do
    clear
    echo "======================================"
    echo "  SYSTEM RESOURCE MONITOR"
    echo "======================================"
    date
    echo ""
    
    # Get memory info
    MEM_TOTAL=$(free -h | awk '/^Mem:/ {print $2}')
    MEM_USED=$(free -h | awk '/^Mem:/ {print $3}')
    MEM_AVAIL=$(free -h | awk '/^Mem:/ {print $7}')
    MEM_PERCENT=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2 * 100}')
    
    SWAP_TOTAL=$(free -h | awk '/^Swap:/ {print $2}')
    SWAP_USED=$(free -h | awk '/^Swap:/ {print $3}')
    
    echo "[MEMORY] MEMORY:"
    echo "   Total: $MEM_TOTAL | Used: $MEM_USED | Available: $MEM_AVAIL"
    echo "   Usage: $MEM_PERCENT%"
    
    if [ "$MEM_PERCENT" -gt 85 ]; then
        echo "   [WARNING]  WARNING: Memory usage HIGH!"
    fi
    
    if [ "$MEM_PERCENT" -gt 95 ]; then
        echo "   [ALERT] CRITICAL: Memory almost full! CLOSE APPS NOW!"
    fi
    
    echo ""
    echo "[SWAP] SWAP:"
    echo "   Total: $SWAP_TOTAL | Used: $SWAP_USED"
    
    echo ""
    echo "[TOP] TOP PROCESSES:"
    ps aux --sort=-%mem | head -6 | awk '{printf "   %-10s %6s %6s %s\n", $1, $3, $4, $11}'
    
    echo ""
    echo "======================================"
    echo "Press Ctrl+C to stop monitoring"
    
    sleep 5
done
