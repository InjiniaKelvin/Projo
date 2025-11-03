#!/bin/bash

# MongoDB Atlas Setup Helper for QuickFix
# This script helps you set up MongoDB Atlas for production

echo "╔════════════════════════════════════════════════════════════╗"
echo "║ QuickFix - MongoDB Atlas Setup Helper ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[DOCS] STEP-BY-STEP GUIDE:${NC}"
echo ""

echo -e "${YELLOW}Step 1: Create MongoDB Atlas Account${NC}"
echo " → Visit: https://www.mongodb.com/cloud/atlas/register"
echo " → Sign up with Email, Google, or GitHub"
echo " → Verify your email"
echo ""
read -p "Press Enter when you've created your account..."
echo ""

echo -e "${YELLOW}Step 2: Create a FREE Cluster${NC}"
echo " → Click 'Build a Database' or 'Create'"
echo " → Choose: Shared (FREE)"
echo " → Provider: AWS (recommended)"
echo " → Region: Choose closest to you:"
echo " * Cape Town (Africa)"
echo " * Mumbai (Asia)"
echo " * Frankfurt (Europe)"
echo " → Cluster Name: QuickFix-Cluster"
echo " → Click 'Create Cluster' (wait 3-5 minutes)"
echo ""
read -p "Press Enter when your cluster is ready..."
echo ""

echo -e "${YELLOW}Step 3: Create Database User${NC}"
echo " → Username: quickfix_admin"
echo " → Password: Click 'Autogenerate Secure Password'"
echo " → ${RED}[WARNING] SAVE THIS PASSWORD! You'll need it next${NC}"
echo " → Click 'Create User'"
echo ""
read -p "Press Enter after saving your password..."
echo ""

echo -e "${YELLOW}Step 4: Configure Network Access${NC}"
echo " → Click 'Add IP Address'"
echo " → Choose 'Allow Access from Anywhere'"
echo " → IP: 0.0.0.0/0"
echo " → Click 'Add Entry'"
echo " → Click 'Finish and Close'"
echo ""
read -p "Press Enter when network access is configured..."
echo ""

echo -e "${YELLOW}Step 5: Get Connection String${NC}"
echo " → Click 'Connect' button on your cluster"
echo " → Choose 'Drivers'"
echo " → Driver: Node.js, Version: 5.5 or later"
echo " → Copy the connection string"
echo " → It looks like:"
echo -e " ${BLUE}mongodb+srv://quickfix_admin:<password>@cluster.mongodb.net/?retryWrites=true&w=majority${NC}"
echo ""

echo -e "${GREEN}[NOTE] Now paste your connection string:${NC}"
echo "(Replace <password> with your actual password)"
echo ""
read -p "Connection String: " MONGO_URI
echo ""

# Validate connection string format
if [[ $MONGO_URI == mongodb+srv://* ]] || [[ $MONGO_URI == mongodb://* ]]; then
 
 # Add database name if not present
 if [[ ! $MONGO_URI == *"/quickfix"* ]]; then
 # Insert /quickfix before the query parameters
 MONGO_URI=$(echo $MONGO_URI | sed 's/\(mongodb+srv:\/\/[^\/]*\)\(\/\?\)\([?&].*\|$\)/\1\/quickfix\3/')
 fi
 
 echo -e "${GREEN}[OK] Connection string format looks good!${NC}"
 echo ""
 
 # Update .env file
 if [ -f ".env" ]; then
 echo -e "${YELLOW}Updating .env file...${NC}"
 
 # Escape special characters for sed
 ESCAPED_URI=$(echo "$MONGO_URI" | sed 's/[\/&]/\\&/g')
 
 # Update MONGO_URI in .env
 if grep -q "^MONGO_URI=" .env; then
 sed -i.backup "s|^MONGO_URI=.*|MONGO_URI=$ESCAPED_URI|" .env
 echo -e "${GREEN}[OK] .env file updated!${NC}"
 echo ""
 else
 echo -e "${RED}[FAIL] MONGO_URI not found in .env${NC}"
 echo "Please manually add this line to your .env file:"
 echo "MONGO_URI=$MONGO_URI"
 echo ""
 fi
 else
 echo -e "${RED}[FAIL] .env file not found${NC}"
 echo "Please create .env file and add:"
 echo "MONGO_URI=$MONGO_URI"
 echo ""
 fi
 
 echo -e "${BLUE} Testing connection...${NC}"
 
 # Create test script
 cat > test_mongodb_connection.js << 'EOL'
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
 try {
 const uri = process.env.MONGO_URI;
 const maskedUri = uri.replace(/:[^:]*@/, ':****@');
 
 console.log('Testing connection to:', maskedUri);
 console.log('');
 
 await mongoose.connect(uri, {
 serverSelectionTimeoutMS: 5000
 });
 
 console.log('[OK] MongoDB Atlas connection successful!');
 console.log('');
 
 const dbName = mongoose.connection.db.databaseName;
 console.log('[DOCS] Connected to database:', dbName);
 
 await mongoose.disconnect();
 console.log('[OK] Test complete!');
 process.exit(0);
 } catch (error) {
 console.error('[FAIL] Connection failed:', error.message);
 console.error('');
 console.error('Troubleshooting:');
 console.error(' 1. Check your password (no typos?)');
 console.error(' 2. Verify IP whitelist includes 0.0.0.0/0');
 console.error(' 3. Ensure cluster is active (not paused)');
 process.exit(1);
 }
}

testConnection();
EOL
 
 if command -v node &> /dev/null; then
 echo ""
 node test_mongodb_connection.js
 rm test_mongodb_connection.js 2>/dev/null
 else
 echo -e "${YELLOW}Node.js not found. Skipping connection test.${NC}"
 rm test_mongodb_connection.js 2>/dev/null
 fi
 
 echo ""
 echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
 echo -e "${GREEN}║ SETUP COMPLETE! ║${NC}"
 echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
 echo ""
 echo -e "${BLUE}Next steps:${NC}"
 echo " 1. Restart your backend server:"
 echo " ${YELLOW}node server.js${NC}"
 echo ""
 echo " 2. Look for: ${GREEN}'MongoDB connected successfully'${NC}"
 echo ""
 echo " 3. Test user registration in your app"
 echo ""
 echo " 4. View data in MongoDB Atlas:"
 echo " → Database → Browse Collections → quickfix"
 echo ""
 
else
 echo -e "${RED}[FAIL] Invalid connection string format${NC}"
 echo ""
 echo "Expected format:"
 echo -e "${BLUE}mongodb+srv://username:password@cluster.mongodb.net/quickfix?retryWrites=true&w=majority${NC}"
 echo ""
 echo "Please check your connection string and try again."
 echo ""
fi

echo "═══════════════════════════════════════════════════════════"
echo "For detailed instructions, see: MONGODB_SETUP_GUIDE.md"
echo "═══════════════════════════════════════════════════════════"
