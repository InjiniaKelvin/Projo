# System Optimization Guide for QuickFix Development

## Problem Analysis
- **RAM:** 3.7GB total, 2.5GB used, only 647MB free
- **Swap:** 1.3GB already in use (system is thrashing)
- **VS Code:** Using ~600MB RAM (15.9%)
- **Brave Browser:** Using ~600MB+ RAM (15.6% + 10.5%)
- **Total Issue:** When starting Expo/Metro, system runs out of memory and hangs

---

## IMMEDIATE FIXES (Apply Now)

### 1. Optimize VS Code Settings

Create `.vscode/settings.json` in project root with these settings:

```json
{
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/.hg/store/**": true,
    "**/dist/**": true,
    "**/build/**": true,
    "**/.expo/**": true,
    "**/.expo-shared/**": true,
    "**/android/**": true,
    "**/ios/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/.expo": true,
    "**/.expo-shared": true,
    "**/dist": true,
    "**/build": true,
    "**/android": true,
    "**/ios": true
  },
  "files.exclude": {
    "**/.expo": true,
    "**/.expo-shared": true
  },
  "typescript.tsserver.maxTsServerMemory": 1024,
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": false,
  "editor.semanticHighlighting.enabled": false,
  "editor.suggest.showWords": false,
  "javascript.suggest.enabled": true,
  "typescript.suggest.enabled": true,
  "git.enabled": true,
  "git.autorefresh": false,
  "git.autofetch": false
}
```

### 2. Optimize Metro Bundler

Update `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reduce memory usage
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      drop_console: true, // Remove console logs in production
    },
  },
  // Reduce worker threads to save memory
  maxWorkers: 2,
};

// Optimize caching
config.cacheStores = [
  {
    type: 'FileStore',
    root: '/tmp/metro-cache',
  },
];

// Reset cache on every start to prevent memory buildup
config.resetCache = true;

// Exclude heavy directories
config.watchFolders = [];
config.resolver.blacklistRE = /node_modules\/.*\/node_modules\/.*/;

module.exports = config;
```

### 3. Use Lightweight Browser Alternative

Instead of Brave with 2 tabs, use one of these:

**Option A: Use Firefox with minimal tabs**
```bash
# Install Firefox if not already installed
sudo apt install firefox
```

**Option B: Use Chromium with flags to reduce memory**
```bash
# Install Chromium
sudo apt install chromium-browser

# Run with memory-saving flags
chromium-browser --disable-gpu --disable-software-rasterizer --disable-dev-shm-usage --disable-extensions
```

**Option C: Use lightweight browser**
```bash
# Install Midori (very lightweight)
sudo apt install midori
```

### 4. Increase Swap Space

```bash
# Check current swap
sudo swapon --show

# Create 4GB swap file (if you have space)
sudo fallocate -l 4G /swapfile2
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2

# Make permanent (add to /etc/fstab)
echo '/swapfile2 none swap sw 0 0' | sudo tee -a /etc/fstab

# Adjust swappiness (how aggressively system uses swap)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### 5. Kill Unnecessary Processes Before Development

```bash
# Create helper script
cat > ~/kill-heavy-processes.sh << 'EOF'
#!/bin/bash
echo "Killing unnecessary processes to free memory..."

# Kill gnome-software if running
pkill -9 gnome-software

# Kill evolution (email client)
pkill -9 evolution

# Kill tracker (indexing service)
pkill -9 tracker

# Kill snapd if you don't use snap apps
sudo systemctl stop snapd

# Clear system caches
sync; echo 3 | sudo tee /proc/sys/vm/drop_caches

# Show memory status
free -h
EOF

chmod +x ~/kill-heavy-processes.sh

# Run before starting development
~/kill-heavy-processes.sh
```

---

## DEVELOPMENT WORKFLOW CHANGES

### 6. Start Backend and Frontend Separately

**Terminal 1 - Backend Only:**
```bash
# Start backend with limited memory
NODE_OPTIONS="--max-old-space-size=512" npm run server
```

**Terminal 2 - Frontend (after backend is stable):**
```bash
# Start Expo with reduced memory
NODE_OPTIONS="--max-old-space-size=1024" npm run web
```

### 7. Use Tunnel Mode Instead of Web

Expo web mode uses more memory. Use tunnel mode and test on your phone:

```bash
# Start with tunnel (uses less memory than web)
npx expo start --tunnel

# Or use LAN mode
npx expo start --lan
```

### 8. Close VS Code While Testing Frontend

```bash
# Workflow:
# 1. Edit code in VS Code
# 2. Save all files
# 3. Close VS Code
# 4. Start Expo server
# 5. Test in browser/phone
# 6. Stop Expo
# 7. Reopen VS Code for next edit
```

---

## PERMANENT SOLUTIONS

### 9. Disable VS Code Extensions You Don't Need

Open VS Code and disable these extensions if you have them:
- GitLens (uses lots of memory)
- Prettier (use CLI instead)
- ESLint (use CLI instead)
- Docker extensions
- Any theme extensions
- Language extensions you don't use

Keep only:
- Python
- JavaScript/TypeScript
- React Native Tools

### 10. Use Alternative Editor for Quick Edits

Install a lightweight editor for small changes:

```bash
# Install nano, vim, or micro
sudo apt install micro

# Use for quick edits
micro filename.js
```

### 11. Optimize System Services

```bash
# Disable unnecessary services
sudo systemctl disable bluetooth
sudo systemctl disable cups  # Printing service
sudo systemctl disable avahi-daemon  # Network discovery

# Disable automatic updates
sudo systemctl disable apt-daily.timer
sudo systemctl disable apt-daily-upgrade.timer
```

### 12. Use Preact Instead of React (Optional)

For web testing, Preact uses less memory:

```bash
# Install preact compatibility layer
npm install --save preact preact-compat

# Alias in metro.config.js
config.resolver.alias = {
  'react': 'preact/compat',
  'react-dom': 'preact/compat'
};
```

---

## TESTING WITHOUT WEB BROWSER

### 13. Use Expo Go App on Phone

```bash
# Start with tunnel
npx expo start --tunnel

# Scan QR code with Expo Go app on phone
# No browser needed!
```

### 14. Use API Testing Tools Instead of Browser

For testing backend APIs:

```bash
# Install httpie (lightweight curl alternative)
sudo apt install httpie

# Test API without browser
http GET http://localhost:3000/api/bookings Authorization:"Bearer YOUR_TOKEN"
```

### 15. Use Headless Chrome for Testing

```bash
# Install puppeteer for automated testing
npm install --save-dev puppeteer

# Run tests without GUI browser
node test-with-puppeteer.js
```

---

## IMMEDIATE CHECKLIST BEFORE EACH DEV SESSION

```bash
#!/bin/bash
# Save as: ~/start-quickfix-dev.sh

echo "=== QuickFix Development Startup ==="

# 1. Show current memory
echo "Current Memory:"
free -h

# 2. Kill heavy processes
echo "Stopping unnecessary services..."
sudo systemctl stop snapd 2>/dev/null
pkill -9 gnome-software 2>/dev/null
pkill -9 evolution 2>/dev/null

# 3. Clear caches
echo "Clearing caches..."
sync; echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null

# 4. Check memory again
echo "Memory after cleanup:"
free -h

# 5. Check if MongoDB is running
echo "Checking MongoDB..."
if systemctl is-active --quiet mongod; then
    echo "✓ MongoDB is running"
else
    echo "✗ MongoDB is not running. Start it with: sudo systemctl start mongod"
fi

# 6. Navigate to project
cd ~/Desktop/PROJO/Projo

# 7. Show options
echo ""
echo "Choose what to start:"
echo "1) Backend only (recommended to start first)"
echo "2) Frontend web (use after backend is stable)"
echo "3) Frontend tunnel (test on phone - RECOMMENDED)"
echo "4) Both (not recommended on low memory)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "Starting backend only..."
        NODE_OPTIONS="--max-old-space-size=512" npm run server
        ;;
    2)
        echo "Starting frontend web..."
        NODE_OPTIONS="--max-old-space-size=1024" npm run web
        ;;
    3)
        echo "Starting frontend tunnel mode..."
        NODE_OPTIONS="--max-old-space-size=1024" npx expo start --tunnel
        ;;
    4)
        echo "Starting both (risky on low memory)..."
        # Start backend in background
        NODE_OPTIONS="--max-old-space-size=512" npm run server &
        sleep 3
        # Start frontend
        NODE_OPTIONS="--max-old-space-size=1024" npm run web
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
```

Make it executable:
```bash
chmod +x ~/start-quickfix-dev.sh
```

---

## BROWSER MEMORY OPTIMIZATION

### If You Must Use Brave/Chrome:

1. **Enable Memory Saver:**
   - Go to `brave://settings/performance`
   - Enable "Memory Saver"
   - Enable "High Efficiency Mode"

2. **Disable Extensions:**
   - Go to `brave://extensions`
   - Disable all extensions you don't need

3. **Use Single Tab:**
   - Close all other tabs
   - Use bookmarks instead of keeping tabs open

4. **Use Brave Flags:**
   ```bash
   brave-browser \
     --disable-gpu \
     --disable-software-rasterizer \
     --disable-dev-shm-usage \
     --disable-extensions \
     --js-flags="--max-old-space-size=512" \
     http://localhost:8081
   ```

---

## MONITORING SCRIPT

```bash
# Save as: ~/monitor-memory.sh
#!/bin/bash

watch -n 2 '
echo "=== Memory Usage ==="
free -h
echo ""
echo "=== Top Memory Consumers ==="
ps aux --sort=-%mem | head -10 | awk "{printf \"%-10s %5s %5s %s\n\", \$1, \$3, \$4, \$11}"
echo ""
echo "=== Swap Usage ==="
swapon --show
'
```

Run in separate terminal:
```bash
chmod +x ~/monitor-memory.sh
~/monitor-memory.sh
```

---

## BEST PRACTICE WORKFLOW

### Daily Development Routine:

1. **Morning:**
   ```bash
   ~/start-quickfix-dev.sh
   # Choose option 1 (Backend only)
   ```

2. **Edit Code:**
   - Use VS Code with optimized settings
   - Make your changes
   - Save files

3. **Test Backend:**
   ```bash
   # Use httpie or curl
   http GET http://localhost:3000/api/bookings
   ```

4. **Test Frontend:**
   ```bash
   # Close VS Code first
   ~/start-quickfix-dev.sh
   # Choose option 3 (Tunnel mode)
   # Test on phone with Expo Go
   ```

5. **If You Need Browser:**
   - Close VS Code
   - Close all other apps
   - Start only backend
   - Open Brave with SINGLE tab
   - Test quickly
   - Close browser
   - Reopen VS Code

---

## EMERGENCY: SYSTEM HANGING

If system hangs:

1. **Press:** `Ctrl + Alt + F2` (switch to terminal)
2. **Login**
3. **Kill processes:**
   ```bash
   pkill -9 code
   pkill -9 brave
   pkill -9 node
   ```
4. **Clear cache:**
   ```bash
   sync; echo 3 | sudo tee /proc/sys/vm/drop_caches
   ```
5. **Return to GUI:** `Ctrl + Alt + F1`

---

## HARDWARE UPGRADE RECOMMENDATION

Consider upgrading:
- **RAM:** Add 4GB-8GB RAM stick (~$30-50)
- **SSD:** If using HDD, switch to SSD (~$40)

This will solve the problem permanently.

---

## SUMMARY

**Quick Wins (Do Now):**
1. Create `.vscode/settings.json` with optimization
2. Update `metro.config.js` with memory limits
3. Create `start-quickfix-dev.sh` script
4. Increase swap space
5. Use tunnel mode instead of web
6. Test on phone, not browser

**Workflow Change:**
- Never run VS Code + Brave + Expo simultaneously
- Start backend first, test it
- Close VS Code, then start frontend
- Use phone for testing (Expo Go app)

**Long Term:**
- Add more RAM to laptop
- Disable unused services
- Use lightweight alternatives
