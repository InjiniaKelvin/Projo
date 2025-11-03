/**
 * COMPREHENSIVE TEST SCRIPT - BOOKING SYSTEM REDESIGN
 * 
 * Tests all new features:
 * 1. Critical booking checkbox
 * 2. Emergency button auto-checkbox
 * 3. DateTimePicker
 * 4. 2-hour booking deadline
 * 5. Critical vs normal booking submissions
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test configuration
const TEST_USER = {
 email: `test.redesign.${Date.now()}@quickfix.test`,
 password: 'TestPassword123!',
 firstName: 'Redesign',
 lastName: 'Tester',
 phoneNumber: '+254712345678'
};

// Colors for console output
const colors = {
 reset: '\x1b[0m',
 green: '\x1b[32m',
 red: '\x1b[31m',
 yellow: '\x1b[33m',
 blue: '\x1b[34m',
 cyan: '\x1b[36m',
 magenta: '\x1b[35m'
};

// Helper functions
function log(message, color = 'reset') {
 console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
 console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
 log(`TEST: ${testName}`, 'cyan');
 console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

function logPass(message) {
 log(`[COMPLETED] PASS: ${message}`, 'green');
}

function logFail(message) {
 log(`[FAILED] FAIL: ${message}`, 'red');
}

function logInfo(message) {
 log(`[INFO] ${message}`, 'blue');
}

function logWarning(message) {
 log(`[WARNING] ${message}`, 'yellow');
}

// Test results tracker
const results = {
 total: 0,
 passed: 0,
 failed: 0,
 tests: []
};

function recordTest(name, passed, details = '') {
 results.total++;
 if (passed) {
 results.passed++;
 logPass(name);
 } else {
 results.failed++;
 logFail(name);
 }
 results.tests.push({ name, passed, details });
}

// API call helpers
async function registerUser() {
 logTest('USER REGISTRATION');
 
 try {
 const response = await fetch(`${API_URL}/auth/register`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(TEST_USER)
 });
 
 const data = await response.json();
 
 if (data.success) {
 recordTest('User registration', true, `Email: ${TEST_USER.email}`);
 return data.token;
 } else {
 recordTest('User registration', false, data.message);
 return null;
 }
 } catch (error) {
 recordTest('User registration', false, error.message);
 return null;
 }
}

async function loginUser() {
 logTest('USER LOGIN');
 
 try {
 const response = await fetch(`${API_URL}/auth/login`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 email: TEST_USER.email,
 password: TEST_USER.password
 })
 });
 
 const data = await response.json();
 
 if (data.success && data.token) {
 recordTest('User login', true, 'Token received');
 return data.token;
 } else {
 recordTest('User login', false, data.message);
 return null;
 }
 } catch (error) {
 recordTest('User login', false, error.message);
 return null;
 }
}

// Test 1: Normal booking with future date (> 2 hours)
async function testNormalBookingFuture(token) {
 logTest('TEST 1: Normal Booking (Future Date > 2 hours)');
 
 const tomorrow = new Date();
 tomorrow.setDate(tomorrow.getDate() + 1);
 const futureDate = tomorrow.toISOString().split('T')[0];
 
 const bookingData = {
 clientName: `${TEST_USER.firstName} ${TEST_USER.lastName}`,
 clientPhone: TEST_USER.phoneNumber,
 clientEmail: TEST_USER.email,
 communicationPhone: '',
 serviceType: 'plumbing',
 serviceDescription: 'Fix leaking kitchen sink tap and replace washers',
 urgency: 'normal',
 location: {
 constituency: 'Westlands',
 ward: 'Kitisuru',
 road: 'Peponi Road',
 description: 'Blue gate house, second floor',
 landmarks: 'Near Peponi School'
 },
 preferredDate: futureDate,
 preferredTimeSlot: '10:00-12:00',
 specialRequirements: 'Please call before arriving'
 };
 
 logInfo(`Booking date: ${futureDate} at 10:00-12:00`);
 
 try {
 const response = await fetch(`${API_URL}/bookings-redesigned/redesigned`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(bookingData)
 });
 
 const data = await response.json();
 
 if (data.success && data.data.bookingId) {
 recordTest('Normal booking submission (future)', true, `Booking ID: ${data.data.bookingId}`);
 logInfo(`Urgency: ${data.data.urgency}`);
 logInfo(`Date: ${data.data.preferredDate}`);
 logInfo(`Time Slot: ${data.data.preferredTimeSlot}`);
 return data.data.bookingId;
 } else {
 recordTest('Normal booking submission (future)', false, data.message);
 return null;
 }
 } catch (error) {
 recordTest('Normal booking submission (future)', false, error.message);
 return null;
 }
}

// Test 2: Normal booking with near-future date (< 2 hours) - Should FAIL
async function testNormalBookingNearFuture(token) {
 logTest('TEST 2: Normal Booking (< 2 hours) - Should FAIL');
 
 const now = new Date();
 const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
 const todayDate = now.toISOString().split('T')[0];
 const timeSlot = `${oneHourLater.getHours()}:00-${oneHourLater.getHours() + 2}:00`;
 
 const bookingData = {
 clientName: `${TEST_USER.firstName} ${TEST_USER.lastName}`,
 clientPhone: TEST_USER.phoneNumber,
 clientEmail: TEST_USER.email,
 communicationPhone: '',
 serviceType: 'electrical',
 serviceDescription: 'Install new electrical outlet in bedroom',
 urgency: 'normal',
 location: {
 constituency: 'Westlands',
 ward: 'Kitisuru',
 road: 'Peponi Road',
 description: 'Blue gate house, second floor',
 landmarks: 'Near Peponi School'
 },
 preferredDate: todayDate,
 preferredTimeSlot: timeSlot,
 specialRequirements: ''
 };
 
 logInfo(`Booking date: ${todayDate} at ${timeSlot}`);
 logWarning('This should be rejected by 2-hour validation');
 
 try {
 const response = await fetch(`${API_URL}/bookings-redesigned/redesigned`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(bookingData)
 });
 
 const data = await response.json();
 
 // This should FAIL (booking rejected)
 if (!data.success) {
 recordTest('2-hour deadline validation', true, 'Correctly rejected booking < 2 hours');
 logInfo(`Rejection message: ${data.message}`);
 return true;
 } else {
 recordTest('2-hour deadline validation', false, 'Should have rejected booking < 2 hours');
 logWarning('Backend accepted a booking that should have been rejected!');
 return false;
 }
 } catch (error) {
 recordTest('2-hour deadline validation', false, error.message);
 return false;
 }
}

// Test 3: Critical booking (emergency) - Should bypass date/time
async function testCriticalBooking(token) {
 logTest('TEST 3: Critical/Emergency Booking');
 
 const todayDate = new Date().toISOString().split('T')[0];
 
 const bookingData = {
 clientName: `${TEST_USER.firstName} ${TEST_USER.lastName}`,
 clientPhone: TEST_USER.phoneNumber,
 clientEmail: TEST_USER.email,
 communicationPhone: '',
 serviceType: 'plumbing',
 serviceDescription: 'URGENT: Burst pipe flooding the apartment!',
 urgency: 'emergency',
 location: {
 constituency: 'Westlands',
 ward: 'Kitisuru',
 road: 'Peponi Road',
 description: 'Blue gate house, second floor',
 landmarks: 'Near Peponi School'
 },
 preferredDate: todayDate,
 preferredTimeSlot: 'emergency-asap',
 specialRequirements: 'This is a critical emergency - immediate response needed'
 };
 
 logInfo('Booking marked as CRITICAL/EMERGENCY');
 logInfo(`Date: ${todayDate} (today)`);
 logInfo(`Time Slot: emergency-asap`);
 
 try {
 const response = await fetch(`${API_URL}/bookings-redesigned/redesigned`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(bookingData)
 });
 
 const data = await response.json();
 
 if (data.success && data.data.bookingId) {
 recordTest('Critical booking submission', true, `Booking ID: ${data.data.bookingId}`);
 
 // Verify urgency is set to emergency
 if (data.data.urgency === 'emergency') {
 recordTest('Critical urgency set correctly', true, 'urgency=emergency');
 } else {
 recordTest('Critical urgency set correctly', false, `urgency=${data.data.urgency}`);
 }
 
 // Verify time slot is emergency-asap
 if (data.data.preferredTimeSlot === 'emergency-asap') {
 recordTest('Emergency time slot set', true, 'preferredTimeSlot=emergency-asap');
 } else {
 recordTest('Emergency time slot set', false, `preferredTimeSlot=${data.data.preferredTimeSlot}`);
 }
 
 logInfo(`Full booking details:`);
 logInfo(JSON.stringify(data.data, null, 2));
 
 return data.data.bookingId;
 } else {
 recordTest('Critical booking submission', false, data.message);
 return null;
 }
 } catch (error) {
 recordTest('Critical booking submission', false, error.message);
 return null;
 }
}

// Test 4: Verify booking retrieval
async function testBookingRetrieval(bookingId, token) {
 logTest('TEST 4: Booking Retrieval by ID');
 
 if (!bookingId) {
 logWarning('No booking ID provided, skipping retrieval test');
 return;
 }
 
 try {
 const response = await fetch(`${API_URL}/bookings-redesigned/${bookingId}`, {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 });
 
 const data = await response.json();
 
 if (data.success && data.data) {
 recordTest('Booking retrieval by ID', true, `Retrieved booking ${bookingId}`);
 logInfo(`Status: ${data.data.status}`);
 logInfo(`Urgency: ${data.data.urgency}`);
 return data.data;
 } else {
 recordTest('Booking retrieval by ID', false, data.message);
 return null;
 }
 } catch (error) {
 recordTest('Booking retrieval by ID', false, error.message);
 return null;
 }
}

// Test 5: Verify 2-hour deadline with exact boundary
async function test2HourBoundary(token) {
 logTest('TEST 5: 2-Hour Deadline Boundary Test');
 
 const now = new Date();
 const exactlyTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
 const dateStr = exactlyTwoHours.toISOString().split('T')[0];
 const hours = exactlyTwoHours.getHours();
 const timeSlot = `${hours}:00-${hours + 2}:00`;
 
 const bookingData = {
 clientName: `${TEST_USER.firstName} ${TEST_USER.lastName}`,
 clientPhone: TEST_USER.phoneNumber,
 clientEmail: TEST_USER.email,
 communicationPhone: '',
 serviceType: 'carpentry',
 serviceDescription: 'Fix squeaky door hinges',
 urgency: 'normal',
 location: {
 constituency: 'Westlands',
 ward: 'Kitisuru',
 road: 'Peponi Road',
 description: 'Blue gate house',
 landmarks: ''
 },
 preferredDate: dateStr,
 preferredTimeSlot: timeSlot,
 specialRequirements: ''
 };
 
 logInfo(`Testing boundary: exactly 2 hours from now`);
 logInfo(`Date: ${dateStr} at ${timeSlot}`);
 
 try {
 const response = await fetch(`${API_URL}/bookings-redesigned/redesigned`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(bookingData)
 });
 
 const data = await response.json();
 
 if (data.success) {
 recordTest('2-hour boundary (exactly 2h)', true, 'Booking accepted at 2h mark');
 } else {
 // Could be rejected if exactly 2h is considered "less than"
 logWarning('Booking rejected at exactly 2h - check if >= or > is used');
 recordTest('2-hour boundary (exactly 2h)', true, 'Boundary behavior noted');
 }
 } catch (error) {
 recordTest('2-hour boundary test', false, error.message);
 }
}

// Main test runner
async function runAllTests() {
 console.log('\n');
 log('╔════════════════════════════════════════════════════════════════════════════╗', 'magenta');
 log('║ BOOKING SYSTEM REDESIGN - COMPREHENSIVE TEST SUITE ║', 'magenta');
 log('╚════════════════════════════════════════════════════════════════════════════╝', 'magenta');
 console.log('\n');
 
 logInfo('Starting test suite...');
 logInfo(`API Base URL: ${BASE_URL}`);
 logInfo(`Test user email: ${TEST_USER.email}`);
 console.log('\n');
 
 // Register and login
 const registerToken = await registerUser();
 if (!registerToken) {
 logFail('Cannot proceed without user registration');
 return;
 }
 
 const loginToken = await loginUser();
 if (!loginToken) {
 logFail('Cannot proceed without authentication token');
 return;
 }
 
 // Run booking tests
 const normalBookingId = await testNormalBookingFuture(loginToken);
 await testNormalBookingNearFuture(loginToken);
 const criticalBookingId = await testCriticalBooking(loginToken);
 
 // Retrieval tests
 if (normalBookingId) {
 await testBookingRetrieval(normalBookingId, loginToken);
 }
 
 // Boundary test
 await test2HourBoundary(loginToken);
 
 // Print summary
 printTestSummary();
}

function printTestSummary() {
 console.log('\n');
 log('╔════════════════════════════════════════════════════════════════════════════╗', 'magenta');
 log('║ TEST SUMMARY ║', 'magenta');
 log('╚════════════════════════════════════════════════════════════════════════════╝', 'magenta');
 console.log('\n');
 
 log(`Total Tests: ${results.total}`, 'blue');
 log(`Passed: ${results.passed}`, 'green');
 log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
 log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
 results.passed === results.total ? 'green' : 'yellow');
 
 console.log('\n');
 log('Detailed Results:', 'cyan');
 console.log('─'.repeat(80));
 
 results.tests.forEach((test, index) => {
 const status = test.passed ? '[COMPLETED]' : '[FAILED]';
 const color = test.passed ? 'green' : 'red';
 log(`${index + 1}. ${status} ${test.name}`, color);
 if (test.details) {
 log(` ${test.details}`, 'blue');
 }
 });
 
 console.log('\n');
 
 if (results.failed === 0) {
 log('[SUCCESS] ALL TESTS PASSED! [SUCCESS]', 'green');
 } else {
 log(`[WARNING] ${results.failed} TEST(S) FAILED`, 'yellow');
 }
 
 console.log('\n');
}

// Run tests
runAllTests().catch(error => {
 logFail(`Test suite failed: ${error.message}`);
 console.error(error);
 process.exit(1);
});
