#!/bin/bash

# QUICK SETUP SCRIPT FOR REDESIGNED BOOKING SYSTEM
# 
# This script sets up the redesigned booking system

echo "[LAUNCH] Setting up Redesigned Booking System..."
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Check if we're in the right directory
if [ ! -f "package.json" ]; then
 echo -e "${RED}[FAIL] Error: Please run this script from the project root directory${NC}"
 exit 1
fi

echo -e "${BLUE} Setting up directories...${NC}"
mkdir -p scripts
mkdir -p backend/models
mkdir -p backend/controllers
mkdir -p backend/routes
mkdir -p app/booking

# 2. Update server.js to include new routes
echo -e "${BLUE} Updating server.js...${NC}"

if [ -f "server.js" ]; then
 # Check if redesigned routes are already added
 if ! grep -q "bookingRedesigned" server.js; then
 # Add the route
 echo -e "\n// Redesigned booking routes" >> server.js
 echo "const bookingRedesignedRoutes = require('./backend/routes/bookingRedesigned');" >> server.js
 echo "app.use('/api/bookings', bookingRedesignedRoutes);" >> server.js
 echo -e "${GREEN}[OK] Added redesigned booking routes to server.js${NC}"
 else
 echo -e "${GREEN}[OK] Redesigned booking routes already configured${NC}"
 fi
else
 echo -e "${RED}[FAIL] Warning: server.js not found${NC}"
fi

# 3. Create a simple integration test
echo -e "${BLUE} Creating integration test...${NC}"

cat > scripts/test-redesigned-system.js << 'EOF'
/**
 * Simple integration test for redesigned booking system
 */

const axios = require('axios');

const testData = {
 clientName: 'Test User',
 clientPhone: '0712345678',
 clientEmail: 'test@example.com',
 serviceType: 'plumbing',
 serviceDescription: 'Test booking for system validation',
 urgency: 'normal',
 location: {
 constituency: 'Starehe',
 ward: 'Nairobi Central',
 road: 'Test Street',
 description: 'Test location',
 landmarks: 'Near test landmark'
 },
 preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
 preferredTimeSlot: '10:00-12:00',
 specialRequirements: 'Test requirements'
};

async function testRedesignedSystem() {
 try {
 console.log(' Testing redesigned booking system...');
 
 const response = await axios.post('http://localhost:3000/api/bookings/redesigned', testData);
 
 if (response.data.success) {
 console.log('[OK] Test booking created successfully!');
 console.log('[CHECKLIST] Booking ID:', response.data.data.bookingId);
 console.log(' Client Phone:', response.data.data.clientPhone);
 return true;
 } else {
 console.log('[FAIL] Test failed:', response.data.message);
 return false;
 }
 
 } catch (error) {
 if (error.response) {
 console.log('[FAIL] Test failed with status:', error.response.status);
 console.log('[NOTE] Error message:', error.response.data.message);
 } else if (error.code === 'ECONNREFUSED') {
 console.log('[FAIL] Cannot connect to server. Make sure backend is running on port 3000');
 } else {
 console.log('[FAIL] Test failed:', error.message);
 }
 return false;
 }
}

if (require.main === module) {
 testRedesignedSystem();
}

module.exports = { testRedesignedSystem };
EOF

# 4. Create package.json scripts if they don't exist
echo -e "${BLUE}[PACKAGE] Updating package.json scripts...${NC}"

if [ -f "package.json" ]; then
 # Add scripts using node
 node -e "
 const fs = require('fs');
 const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
 
 if (!pkg.scripts) pkg.scripts = {};
 
 pkg.scripts['test:redesigned'] = 'node scripts/test-redesigned-system.js';
 pkg.scripts['validate:booking'] = 'node scripts/comprehensive-booking-validator.js';
 pkg.scripts['qa:check'] = './scripts/quality-assurance.sh';
 
 fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
 console.log('[OK] Updated package.json with new scripts');
 "
else
 echo -e "${RED}[FAIL] Warning: package.json not found${NC}"
fi

# 5. Create a simple startup guide
echo -e "${BLUE}[DOCS] Creating startup guide...${NC}"

cat > REDESIGNED_SYSTEM_QUICK_START.md << 'EOF'
# Redesigned Booking System - Quick Start

## [LAUNCH] Getting Started

### 1. Start the Backend
```bash
node server.js
```

### 2. Test the Redesigned System
```bash
# Quick test
npm run test:redesigned

# Comprehensive validation
npm run validate:booking

# Quality assurance
npm run qa:check
```

### 3. Use the New Booking Form
Navigate to: `/booking/redesigned-form`

### 4. API Endpoints
- `POST /api/bookings/redesigned` - Create booking
- `GET /api/bookings/phone/:phone` - Get bookings by phone
- `GET /api/bookings/:bookingId` - Get booking by ID

## [CHECKLIST] Key Differences

### Phone as Primary ID
- Use phone number instead of userId
- Phone automatically normalized to +254XXXXXXXXX
- Direct phone-based lookups

### Unified Booking ID
- Single bookingId (no separate serviceId)
- Format: QF[DATE][TIME][PHONE][RANDOM]

### Field Consistency
- Exact matching between frontend and backend
- Comprehensive validation at all levels

## Troubleshooting

### Common Issues
1. **Server not running**: Start with `node server.js`
2. **Database not connected**: Start MongoDB
3. **Validation errors**: Check field requirements
4. **Phone format**: Use Kenyan format (0712... or +254712...)

### Need Help?
Run the quality assurance script: `npm run qa:check`
EOF

# 6. Final instructions
echo -e "\n${GREEN} Setup Complete!${NC}"
echo -e "${GREEN}==================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Start your backend: node server.js"
echo "2. Test the system: npm run test:redesigned"
echo "3. Run quality check: npm run qa:check"
echo "4. Read the guide: BOOKING_SYSTEM_REDESIGN_GUIDE.md"
echo ""
echo -e "${BLUE}New scripts available:${NC}"
echo "* npm run test:redesigned - Quick system test"
echo "* npm run validate:booking - Comprehensive validation"
echo "* npm run qa:check - Quality assurance check"
echo ""
echo -e "${GREEN} The redesigned booking system is ready to use!${NC}"
