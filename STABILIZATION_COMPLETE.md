# QUICK REFERENCE - System Stabilization

## [OK] WHAT WAS DONE:
1. [OK] Cleared system cache
2. [OK] Killed memory-hungry processes
3. [OK] Optimized swap settings (swappiness=10)
4. [OK] Created minimal VS Code configuration
5. [OK] Set Node.js memory limit to 512MB
6. [OK] Created lightweight startup scripts

## [ALERT] DO THIS NOW TO PREVENT CRASHES:

### 1. **CLOSE ALL BRAVE TABS** (Keep only 1-2 tabs max)

### 2. **RELOAD YOUR SHELL:**
```bash
source ~/.zshrc
```

### 3. **RESTART VS CODE** (if it crashed, reopen it)

### 4. **Use Resource Monitor** (run in separate terminal):
```bash
./monitor-resources.sh
```
This will warn you BEFORE the system crashes!

## [START] HOW TO START FRONTEND (LIGHTWEIGHT MODE):

Instead of `npm start` or `npx expo start`, use:

```bash
./start-lightweight.sh
```

This runs Expo with:
- Cleared cache
- Memory limits
- Minimal features
- Web-only mode (lighter than native)

## [STATS] MONITOR WHILE WORKING:

Open a second terminal and run:
```bash
./monitor-resources.sh
```

**Watch for warnings:**
- [WARNING]  = Close some tabs/apps
- [ALERT] = CRITICAL - Close apps immediately!

## [CONFIG] IF SYSTEM GETS SLOW:

1. **Quick fix:**
   ```bash
   sudo sh -c 'sync; echo 3 > /proc/sys/vm/drop_caches'
   ```

2. **Kill Metro if stuck:**
   ```bash
   pkill -f metro
   ```

3. **Restart everything:**
   ```bash
   ./emergency-fix.sh
   ```

## [TIP] BEST PRACTICES:

### While Coding:
- [OK] Use only 1 browser tab
- [OK] Close VS Code terminal when not needed
- [OK] Disable VS Code extensions you don't use
- [OK] Use `./monitor-resources.sh` in separate terminal

### When Starting Frontend:
- [OK] Close all other apps first
- [OK] Use `./start-lightweight.sh`
- [OK] Wait for server to fully start before opening browser
- [OK] Open browser AFTER server says "ready"

### Browser Usage:
- [OK] Use localhost:8081 only
- [OK] Close browser dev tools when not debugging
- [OK] Disable browser extensions
- [OK] Clear browser cache regularly

## [HELP] IF SYSTEM FREEZES:

1. **Press:** `Ctrl + Alt + F2` (switch to terminal)
2. **Login** with your credentials
3. **Run:** `pkill -f "brave|code|node"`
4. **Return:** `Ctrl + Alt + F7`

## [NOTE] SYSTEM SPECS (Your Laptop):
- RAM: 3.7GB (LOW!)
- Typical Usage: 2.5GB (68%)
- Available: ~1.2GB
- **Critical threshold: 90% (3.3GB used)**

## ⚙️ WHAT'S OPTIMIZED:

### VS Code Settings:
- Disabled file watchers for node_modules
- Disabled minimap
- Disabled auto-updates
- Disabled Git auto-fetch

### Node.js:
- Memory limit: 512MB (was unlimited)

### System:
- Swap priority: 10 (was 60)
- Cache pressure: 50 (was 100)

### Browser:
- Disabled GPU acceleration
- Disabled extensions
- Limited cache size

## [TARGET] TESTING FRONTEND:

```bash
# Terminal 1: Monitor resources
./monitor-resources.sh

# Terminal 2: Start backend
node server.js

# Terminal 3: Start frontend (lightweight)
./start-lightweight.sh

# Browser: Open ONLY ONE TAB
http://localhost:8081
```

## [PROGRESS] EXPECTED RESULTS:

**Before optimization:**
- Memory: 95%+ → System hangs
- Can't open frontend

**After optimization:**
- Memory: 75-85% → System stable
- Frontend works smoothly

## [WARNING] WARNING SIGNS:

Watch the monitor for these:
- Memory > 85% → Close browser tabs
- Memory > 90% → Close VS Code terminal
- Memory > 95% → Emergency: Close everything except VS Code
- "CRITICAL" warning → STOP and close apps NOW

## [REFRESH] PERMANENT FIX (For Later):

Consider:
1. Upgrade RAM to 8GB ($30-50)
2. Use cloud development (GitHub Codespaces)
3. Develop backend only, test frontend on phone

---

**Status:** [OK] System stabilized
**Next:** Follow the steps above carefully!
