#!/bin/bash
# QuickFix Development Startup Script
# Optimized for low-memory systems (3-4GB RAM)

echo "╔════════════════════════════════════════════════╗"
echo "║   QuickFix Development Environment Manager    ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Function to show memory usage
show_memory() {
    echo "[STATS] Memory Status:"
    free -h | grep -E "Mem:|Swap:"
    echo ""
}

# Function to clean memory
clean_memory() {
    echo "🧹 Cleaning system memory..."
    
    # Kill unnecessary processes
    pkill -9 gnome-software 2>/dev/null
    pkill -9 evolution 2>/dev/null
    pkill -9 tracker-miner 2>/dev/null
    
    # Stop snapd if not needed
    sudo systemctl stop snapd 2>/dev/null
    
    # Clear page cache, dentries and inodes
    sync
    echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null
    
    echo "✓ Memory cleaned"
    echo ""
}

# Function to check MongoDB
check_mongodb() {
    echo "🗄️  Checking MongoDB status..."
    if systemctl is-active --quiet mongod; then
        echo "✓ MongoDB is running"
    else
        echo "[WARNING]  MongoDB is not running"
        read -p "Start MongoDB? (y/n): " start_mongo
        if [ "$start_mongo" = "y" ]; then
            sudo systemctl start mongod
            echo "✓ MongoDB started"
        fi
    fi
    echo ""
}

# Show initial memory
show_memory

# Ask if user wants to clean memory
read -p "Clean system memory? (recommended) (y/n): " clean
if [ "$clean" = "y" ]; then
    clean_memory
    show_memory
fi

# Check MongoDB
check_mongodb

# Navigate to project directory
cd ~/Desktop/PROJO/Projo || exit

# Show menu
echo "Select what to start:"
echo ""
echo "  1) [CONFIG] Backend Server Only (Node.js)"
echo "     Uses ~300-400MB RAM"
echo "     Recommended: Start this first"
echo ""
echo "  2) 📱 Frontend Tunnel (Expo - Phone Testing)"
echo "     Uses ~600-800MB RAM"
echo "     [OK] RECOMMENDED for low memory"
echo "     Opens tunnel for testing on phone via Expo Go"
echo ""
echo "  3) 🌐 Frontend Web (Expo - Browser Testing)"
echo "     Uses ~800-1200MB RAM"
echo "     [WARNING]  May cause lag on low memory"
echo "     Opens browser at localhost:8081"
echo ""
echo "  4) [CONFIG]📱 Backend + Frontend Tunnel"
echo "     Uses ~1000-1200MB RAM"
echo "     Backend in background, frontend in foreground"
echo ""
echo "  5) [ERROR] Cancel"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "[CONFIG] Starting Backend Server..."
        echo "Memory limit: 512MB"
        echo "URL: http://localhost:3000"
        echo ""
        NODE_OPTIONS="--max-old-space-size=512" npm run server
        ;;
    2)
        echo ""
        echo "📱 Starting Frontend in Tunnel Mode..."
        echo "Memory limit: 1024MB"
        echo ""
        echo "Instructions:"
        echo "1. Install 'Expo Go' app on your phone"
        echo "2. Scan the QR code that appears"
        echo "3. App will load on your phone"
        echo ""
        NODE_OPTIONS="--max-old-space-size=1024" npx expo start --tunnel
        ;;
    3)
        echo ""
        echo "🌐 Starting Frontend in Web Mode..."
        echo "Memory limit: 1024MB"
        echo "Browser will open at: http://localhost:8081"
        echo ""
        echo "[WARNING]  Warning: This uses more memory"
        echo "[WARNING]  Close VS Code if system becomes slow"
        echo ""
        NODE_OPTIONS="--max-old-space-size=1024" npm run web
        ;;
    4)
        echo ""
        echo "[CONFIG]📱 Starting Backend + Frontend Tunnel..."
        echo ""
        echo "Starting backend in background..."
        NODE_OPTIONS="--max-old-space-size=512" npm run server &
        BACKEND_PID=$!
        
        echo "Waiting for backend to initialize (3 seconds)..."
        sleep 3
        
        echo ""
        echo "Starting frontend in tunnel mode..."
        echo "Scan QR code with Expo Go app on phone"
        echo ""
        NODE_OPTIONS="--max-old-space-size=1024" npx expo start --tunnel
        
        # When frontend exits, kill backend
        kill $BACKEND_PID 2>/dev/null
        ;;
    5)
        echo "Cancelled"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✓ Development server stopped"
echo ""
show_memory
