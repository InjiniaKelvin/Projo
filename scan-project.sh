#!/bin/bash
# Comprehensive Project Scan - Identify all used files and features

echo "PROJECT SCAN REPORT"
echo "===================="
echo "Date: $(date)"
echo ""

# 1. Backend Core Files
echo "BACKEND CORE FILES (USED):"
echo "-------------------------"
find backend -name "*.js" | grep -E "(models|controllers|routes|services|config|middleware)" | sort

echo ""
echo "FRONTEND APP STRUCTURE:"
echo "----------------------"
find app -name "*.tsx" -o -name "*.ts" | sort

echo ""
echo "BACKEND ROUTES REGISTERED IN SERVER.JS:"
echo "---------------------------------------"
grep -E "app.use.*require|const.*Routes.*require" server.js | sed 's/^/  /'

echo ""
echo "NAVIGATION PATHS (router.push/replace):"
echo "---------------------------------------"
grep -r "router\.\(push\|replace\)" app --include="*.tsx" | cut -d: -f1-2 | sort -u

echo ""
echo "API ENDPOINTS (Backend Routes):"
echo "-------------------------------"
grep -r "router\.\(get\|post\|put\|patch\|delete\)" backend/routes --include="*.js" | cut -d: -f1-2 | head -50

echo ""
echo "MODELS IN USE:"
echo "-------------"
ls -1 backend/models/*.js | xargs basename -a

echo ""
echo "CONTROLLERS IN USE:"
echo "------------------"
ls -1 backend/controllers/*.js | xargs basename -a

echo ""
echo "COMPLETED: Scan report generated"
