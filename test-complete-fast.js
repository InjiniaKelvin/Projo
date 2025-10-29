/**
 * COMPLETE BOOKING SYSTEM TEST
 * Tests: Auth (register/login) + Critical Booking + Normal Booking
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

// Test user
const testUser = {
 email: `bookingtest.${Date.now()}@quickfix.test`,
 password: 'Test@1234',
 firstName: 'Booking',
 lastName: 'Tester',
 phoneNumber: `+2547${Math.random().toString().slice(2, 10)}`,
 userType: 'client'
};

// Colors for output
const colors = {
 green: '\x1b[32m',
 red: '\x1b[31m',
 yellow: '\x1b[33m',
 blue: '\x1b[34m',
 reset: '\x1b[0m'
};

function log(message, color = 'reset') {
 console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests() {
 console.log('\n' + '='.repeat(80));
 log('BOOKING SYSTEM - COMPLETE TEST SUITE', 'blue');
 console.log('='.repeat(80) + '\n');
 
 let authToken = null;
 
 try {
 // ========== STEP 1: REGISTER USER ==========
 log('STEP 1: User Registration', 'yellow');
 console.log('-'.repeat(80));
 console.log('Email:', testUser.email);
 
 const regStart = Date.now();
 const regResponse = await fetch(`${BASE_URL}/auth/register`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(testUser)
 });
 const regTime = Date.now() - regStart;
 const regResult = await regResponse.json();
 
 if (!regResult.success) {
 log(`FAILED: ${regResult.message}`, 'red');
 return;
 }
 
 log(`SUCCESS: Registered in ${regTime}ms`, 'green');
 console.log('User ID:', regResult.user._id);
 console.log('');
 
 // ========== STEP 2: LOGIN ==========
 log('STEP 2: User Login', 'yellow');
 console.log('-'.repeat(80));
 
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
 
 if (!loginResult.success) {
 log(`FAILED: ${loginResult.message}`, 'red');
 return;
 }
 
 authToken = loginResult.token;
 log(`SUCCESS: Logged in ${loginTime}ms`, 'green');
 console.log('Token:', authToken ? 'Received' : 'Missing');
 console.log('');
 
 // ========== STEP 3: CRITICAL BOOKING ==========
 log('STEP 3: Critical/Emergency Booking', 'yellow');
 console.log('-'.repeat(80));
 console.log('Type: CRITICAL (no date/time required)');
 
 const criticalBooking = {
 clientName: `${testUser.firstName} ${testUser.lastName}`,
 clientPhone: testUser.phoneNumber,
 clientEmail: testUser.email,
 serviceType: 'plumbing',
 serviceDescription: 'Emergency burst pipe - water flooding everywhere!',
 isCritical: true,
 urgency: 'emergency',
 location: {
 constituency: 'Westlands',
 ward: 'Parklands',
 road: 'Limuru Road',
 description: 'Blue gate, second floor apartment',
 landmarks: 'Near Sarit Centre, opposite Shell Station'
 },
 specialRequirements: 'Bring extra tools and materials'
 };
 
 const criticalStart = Date.now();
 const criticalResponse = await fetch(`${BASE_URL}/bookings-redesigned/redesigned`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${authToken}`
 },
 body: JSON.stringify(criticalBooking)
 });
 const criticalTime = Date.now() - criticalStart;
 const criticalResult = await criticalResponse.json();
 
 if (!criticalResult.success) {
 log(`FAILED: ${criticalResult.message}`, 'red');
 console.log('Response:', JSON.stringify(criticalResult, null, 2));
 } else {
 log(`SUCCESS: Critical booking created in ${criticalTime}ms`, 'green');
 console.log('Booking ID:', criticalResult.data.bookingId);
 console.log('Urgency:', criticalResult.data.urgency);
 console.log('Time Slot:', criticalResult.data.preferredTimeSlot);
 console.log('Status:', criticalResult.data.status);
 }
 console.log('');
 
 // ========== STEP 4: NORMAL BOOKING ==========
 log('STEP 4: Normal Booking (with date/time)', 'yellow');
 console.log('-'.repeat(80));
 
 // Get date 3 days from now
 const futureDate = new Date();
 futureDate.setDate(futureDate.getDate() + 3);
 const dateStr = futureDate.toISOString().split('T')[0];
 
 console.log('Type: NORMAL');
 console.log('Date:', dateStr);
 console.log('Time:', '10:00-12:00');
 
 const normalBooking = {
 clientName: `${testUser.firstName} ${testUser.lastName}`,
 clientPhone: testUser.phoneNumber,
 clientEmail: testUser.email,
 serviceType: 'electrical',
 serviceDescription: 'Install ceiling fan in living room and bedroom',
 isCritical: false,
 urgency: 'normal',
 preferredDate: dateStr,
 preferredTimeSlot: '10:00-12:00',
 location: {
 constituency: 'Langata',
 ward: 'Karen',
 road: 'Karen Road',
 description: 'Green gate house, white building',
 landmarks: 'Near Karen Hospital'
 },
 specialRequirements: 'Please call before arriving'
 };
 
 const normalStart = Date.now();
 const normalResponse = await fetch(`${BASE_URL}/bookings-redesigned/redesigned`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${authToken}`
 },
 body: JSON.stringify(normalBooking)
 });
 const normalTime = Date.now() - normalStart;
 const normalResult = await normalResponse.json();
 
 if (!normalResult.success) {
 log(`FAILED: ${normalResult.message}`, 'red');
 console.log('Response:', JSON.stringify(normalResult, null, 2));
 } else {
 log(`SUCCESS: Normal booking created in ${normalTime}ms`, 'green');
 console.log('Booking ID:', normalResult.data.bookingId);
 console.log('Urgency:', normalResult.data.urgency);
 console.log('Date:', normalResult.data.preferredDate);
 console.log('Time Slot:', normalResult.data.preferredTimeSlot);
 console.log('Status:', normalResult.data.status);
 }
 console.log('');
 
 // ========== SUMMARY ==========
 console.log('='.repeat(80));
 log('TEST SUMMARY', 'blue');
 console.log('='.repeat(80));
 console.log(`Registration: ${regTime}ms`);
 console.log(`Login: ${loginTime}ms`);
 console.log(`Critical Booking: ${criticalTime}ms ${criticalResult.success ? '[PASS]' : '[FAIL]'}`);
 console.log(`Normal Booking: ${normalTime}ms ${normalResult.success ? '[PASS]' : '[FAIL]'}`);
 console.log(`Total Time: ${regTime + loginTime + criticalTime + normalTime}ms`);
 
 const allPassed = regResult.success && loginResult.success && 
 criticalResult.success && normalResult.success;
 
 console.log('');
 if (allPassed) {
 log('RESULT: ALL TESTS PASSED', 'green');
 } else {
 log('RESULT: SOME TESTS FAILED', 'red');
 }
 console.log('='.repeat(80) + '\n');
 
 } catch (error) {
 log(`\nERROR: ${error.message}`, 'red');
 if (error.code === 'ECONNREFUSED') {
 console.error('Backend server is not running. Start it with: node server.js');
 }
 }
}

// Run all tests
runTests();
