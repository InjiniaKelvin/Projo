#!/bin/bash
# EMERGENCY FIX - Run immediately to stabilize system

echo "[ALERT] EMERGENCY SYSTEM STABILIZATION"
echo "=================================="

# 1. Clear system cache
echo "1. Clearing system cache..."
sudo sh -c 'sync; echo 3 > /proc/sys/vm/drop_caches'

# 2. Kill memory hogs
echo "2. Killing heavy processes..."
pkill -f "chrome|chromium" 2>/dev/null
pkill -f "node.*expo" 2>/dev/null
pkill -f "node.*metro" 2>/dev/null

# 3. Increase swap priority
echo "3. Optimizing swap..."
sudo sysctl vm.swappiness=10
sudo sysctl vm.vfs_cache_pressure=50

# 4. Disable unnecessary VS Code extensions
echo "4. Creating minimal VS Code settings..."
mkdir -p ~/.config/Code/User
cat > ~/.config/Code/User/settings.json << 'EOF'
{
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/.expo/**": true,
    "**/.expo-shared/**": true,
    "**/android/**": true,
    "**/ios/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/.expo": true,
    "**/.expo-shared": true
  },
  "editor.fontSize": 13,
  "editor.minimap.enabled": false,
  "editor.renderWhitespace": "none",
  "workbench.tree.indent": 10,
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": false,
  "typescript.surveys.enabled": false,
  "git.autorefresh": false,
  "git.autofetch": false
}
EOF

# 5. Create lightweight browser profile
echo "5. Browser optimization..."
mkdir -p ~/.config/brave-flags.conf
cat > ~/.config/brave-flags.conf << 'EOF'
--disable-gpu
--disable-software-rasterizer
--disable-extensions
--disable-sync
--disk-cache-size=52428800
--media-cache-size=52428800
EOF

# 6. Set Node.js memory limit
echo "6. Setting Node.js limits..."
echo "export NODE_OPTIONS='--max-old-space-size=512'" >> ~/.zshrc

echo ""
echo "[OK] EMERGENCY FIX APPLIED!"
echo ""
echo "[WARNING]  IMPORTANT - DO THESE NOW:"
echo "1. Close ALL Brave tabs"
echo "2. Source the shell config: source ~/.zshrc"
echo "3. Restart VS Code"
echo "4. Only open ONE browser tab at a time"
echo ""
