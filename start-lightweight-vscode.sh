#!/bin/bash
# Lightweight VS Code Launcher for QuickFix Development

echo "🚀 Starting VS Code in lightweight mode..."

# Set resource limits
export NODE_OPTIONS="--max-old-space-size=2048"

# Disable some VS Code features for performance
code \
  --disable-gpu \
  --disable-gpu-sandbox \
  --disable-software-rasterizer \
  --disable-background-timer-throttling \
  --disable-renderer-backgrounding \
  --disable-backgrounding-occluded-windows \
  --max-memory=2048 \
  /home/engkejumwa/Desktop/PROJO12/Projo &

echo "✅ VS Code started in lightweight mode"
echo "💡 Tip: Use Ctrl+Shift+P -> 'Developer: Show Running Extensions' to monitor extension usage"
