/**
 * COMPLETE BOOKING TEST - Registration, Login, and Booking
 * Tests the entire flow from user creation to booking submission
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const timestamp = Date.now();
const testUser = {
 email: `test.booking.${timestamp}@quickfix.test`,
 password: 'Test@1234',
 firstName: 'Booking',
 lastName: 'Tester',
 phoneNumber: `0712${String(timestamp).slice(-6)}`,
 userType: 'client'
};

// Colors for console output
const colors = {
 reset: '\x1b[0m',
 green: '\x1b[32m',
 red: '\x1b[31m',
 yellow: '\x1b[33m',
 blue: '\x1b[34m',
 cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
 console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
 console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
 log(title, 'cyan');
 console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

async function runTest() {
 let authToken = null;
 const results = {
 registration: false,
 login: false,
 criticalBooking: false,
 normalBooking: false
 };

 try {
 // ==================== STEP 1: REGISTER USER ====================
 logSection('STEP 1: USER REGISTRATION');
 
 log(`Creating user: ${testUser.email}`, 'blue');
 log(`Phone: ${testUser.phoneNumber}`, 'blue');
 log('Please wait... (password hashing can take a few seconds)', 'yellow');
 
 const regStart = Date.now();
 const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(testUser)
 });

 const regTime = Date.now() - regStart;
 const registerResult = await registerResponse.json();
 
 log(`Registration took ${(regTime / 1000).toFixed(2)}s`, 'yellow');

 if (!registerResult.success) {
 throw new Error(`Registration failed: ${registerResult.message}`);
 }

 log('PASS: User registered successfully', 'green');
 log(`User ID: ${registerResult.user._id}`, 'blue');
 results.registration = true;

 // ==================== STEP 2: LOGIN ====================
 logSection('STEP 2: USER LOGIN');
 
 log(`Logging in: ${testUser.email}`, 'blue');
 
 const loginStart = Date.now();
 const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 email: testUser.email,
 password: testUser.password
 })
 });

 const loginTime = Date.now() - loginStart;
 const loginResult = await loginResponse.json();
 
 log(`Login took ${(loginTime / 1000).toFixed(2)}s`, 'yellow');

 if (!loginResult.success) {
 throw new Error(`Login failed: ${loginResult.message}`);
 }

 authToken = loginResult.data.tokens.accessToken;
 log('PASS: Login successful', 'green');
 log(`Token: ${authToken.substring(0, 20)}...`, 'blue');
 results.login = true;

 // ==================== STEP 3: CRITICAL BOOKING ====================
 logSection('STEP 3: CRITICAL BOOKING SUBMISSION');
 
 const criticalBooking = {
 clientName: `${testUser.firstName} ${testUser.lastName}`,
 clientPhone: testUser.phoneNumber,
 clientEmail: testUser.email,
 serviceType: 'plumbing',
 serviceDescription: 'EMERGENCY: Burst pipe in kitchen, water flooding everywhere',
 isCritical: true,
 urgency: 'emergency',
 location: {
 constituency: 'Westlands',
 ward: 'Parklands',
 road: 'Limuru Road',
 description: 'White apartment building, 3rd floor',
 landmarks: 'Near Sarit Centre Mall'
 },
 specialRequirements: 'Please bring extra tools and materials'
 };

 log('Submitting CRITICAL booking (no date/time required)...', 'blue');
 log(`Service: ${criticalBooking.serviceType}`, 'blue');
 log(`Description: ${criticalBooking.serviceDescription}`, 'blue');

 const criticalResponse = await fetch(`${BASE_URL}/bookings-redesigned/redesigned`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${authToken}`
 },
 body: JSON.stringify(criticalBooking)
 });

 const criticalResult = await criticalResponse.json();

 if (!criticalResult.success) {
 throw new Error(`Critical booking failed: ${criticalResult.message}`);
 }

 log('PASS: Critical booking created successfully', 'green');
 log(`Booking ID: ${criticalResult.data.bookingId}`, 'blue');
 log(`Urgency: ${criticalResult.data.urgency}`, 'blue');
 log(`Time Slot: ${criticalResult.data.preferredTimeSlot}`, 'blue');
 log(`Date: ${criticalResult.data.preferredDate}`, 'blue');
 results.criticalBooking = true;

 // ==================== STEP 4: NORMAL BOOKING ====================
 logSection('STEP 4: NORMAL BOOKING SUBMISSION');
 
 // Calculate date 3 days from now
 const futureDate = new Date();
 futureDate.setDate(futureDate.getDate() + 3);
 const formattedDate = futureDate.toISOString().split('T')[0];

 const normalBooking = {
 clientName: `${testUser.firstName} ${testUser.lastName}`,
 clientPhone: testUser.phoneNumber,
 clientEmail: testUser.email,
 serviceType: 'electrical',
 serviceDescription: 'Install new ceiling fan in living room and bedroom',
 isCritical: false,
 urgency: 'normal',
 preferredDate: formattedDate,
 preferredTimeSlot: '10:00-12:00',
 location: {
 constituency: 'Langata',
 ward: 'Karen',
 road: 'Karen Road',
 description: 'Green gate house with large garden',
 landmarks: 'Opposite Karen Hospital'
 },
 specialRequirements: 'Customer prefers morning appointments'
 };

 log('Submitting NORMAL booking (with date/time)...', 'blue');
 log(`Service: ${normalBooking.serviceType}`, 'blue');
 log(`Date: ${normalBooking.preferredDate}`, 'blue');
 log(`Time: ${normalBooking.preferredTimeSlot}`, 'blue');

 const normalResponse = await fetch(`${BASE_URL}/bookings-redesigned/redesigned`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${authToken}`
 },
 body: JSON.stringify(normalBooking)
 });

 const normalResult = await normalResponse.json();

 if (!normalResult.success) {
 throw new Error(`Normal booking failed: ${normalResult.message}`);
 }

 log('PASS: Normal booking created successfully', 'green');
 log(`Booking ID: ${normalResult.data.bookingId}`, 'blue');
 log(`Urgency: ${normalResult.data.urgency}`, 'blue');
 log(`Time Slot: ${normalResult.data.preferredTimeSlot}`, 'blue');
 log(`Date: ${normalResult.data.preferredDate}`, 'blue');
 results.normalBooking = true;

 // ==================== STEP 5: VERIFY BOOKINGS ====================
 logSection('STEP 5: VERIFY BOOKINGS');
 
 log(`Fetching bookings for phone: ${testUser.phoneNumber}`, 'blue');

 const bookingsResponse = await fetch(
 `${BASE_URL}/bookings-redesigned/phone/${encodeURIComponent(testUser.phoneNumber)}`,
 {
 headers: {
 'Authorization': `Bearer ${authToken}`
 }
 }
 );

 const bookingsResult = await bookingsResponse.json();

 if (!bookingsResult.success) {
 throw new Error(`Failed to fetch bookings: ${bookingsResult.message}`);
 }

 log('PASS: Bookings retrieved successfully', 'green');
 log(`Total bookings: ${bookingsResult.data.length}`, 'blue');
 
 bookingsResult.data.forEach((booking, index) => {
 log(`\nBooking ${index + 1}:`, 'cyan');
 log(` ID: ${booking.bookingId}`, 'blue');
 log(` Service: ${booking.serviceType}`, 'blue');
 log(` Urgency: ${booking.urgency}`, 'blue');
 log(` Status: ${booking.status}`, 'blue');
 log(` Date: ${booking.preferredDate}`, 'blue');
 log(` Time: ${booking.preferredTimeSlot}`, 'blue');
 });

 // ==================== FINAL RESULTS ====================
 logSection('TEST RESULTS SUMMARY');
 
 const totalTests = Object.keys(results).length;
 const passedTests = Object.values(results).filter(Boolean).length;

 console.log(`\nResults:`);
 console.log(` Registration: ${results.registration ? 'OK PASS' : 'FAIL FAIL'}`);
 console.log(` Login: ${results.login ? 'OK PASS' : 'FAIL FAIL'}`);
 console.log(` Critical Booking: ${results.criticalBooking ? 'OK PASS' : 'FAIL FAIL'}`);
 console.log(` Normal Booking: ${results.normalBooking ? 'OK PASS' : 'FAIL FAIL'}`);
 console.log(`\nTotal: ${passedTests}/${totalTests} tests passed\n`);

 if (passedTests === totalTests) {
 log('ALL TESTS PASSED! Booking system is working correctly.', 'green');
 process.exit(0);
 } else {
 log(`${totalTests - passedTests} test(s) failed`, 'red');
 process.exit(1);
 }

 } catch (error) {
 log(`\nERROR: ${error.message}`, 'red');
 console.error('Full error:', error);
 
 logSection('TEST RESULTS SUMMARY');
 const totalTests = Object.keys(results).length;
 const passedTests = Object.values(results).filter(Boolean).length;
 
 console.log(`\nResults (before failure):`);
 console.log(` Registration: ${results.registration ? 'OK PASS' : 'FAIL FAIL'}`);
 console.log(` Login: ${results.login ? 'OK PASS' : 'FAIL FAIL'}`);
 console.log(` Critical Booking: ${results.criticalBooking ? 'OK PASS' : 'FAIL FAIL'}`);
 console.log(` Normal Booking: ${results.normalBooking ? 'OK FAIL' : 'FAIL FAIL'}`);
 console.log(`\nTotal: ${passedTests}/${totalTests} tests passed before error\n`);
 
 process.exit(1);
 }
}

// Run the test
console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
log('BOOKING SYSTEM COMPLETE TEST SUITE', 'cyan');
log(`Testing: Registration → Login → Critical Booking → Normal Booking`, 'cyan');
console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);

runTest();
