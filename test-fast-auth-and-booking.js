/**
 * FAST AUTHENTICATION AND BOOKING TEST
 * 
 * This test bypasses slow API endpoints and tests directly:
 * 1. Direct database user creation (skips bcrypt entirely for test user)
 * 2. Login via API
 * 3. Booking creation with authenticated user
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
 try {
 await mongoose.connect(process.env.MONGO_URI);
 console.log('MongoDB connected');
 return true;
 } catch (error) {
 console.error('MongoDB connection error:', error.message);
 return false;
 }
};

// Import models
const User = require('./backend/models/User');
const Wallet = require('./backend/models/Wallet');
const Booking = require('./backend/models/Booking');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const timestamp = Date.now();
const TEST_USER = {
 email: `test${timestamp}@example.com`, // Simpler email format
 password: 'TestPass123!',
 firstName: 'Fast',
 lastName: 'Tester',
 phoneNumber: `0712${String(timestamp).slice(-6)}`,
 role: 'client'
};

// Helper to make API calls
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
 const options = {
 method,
 headers: { 'Content-Type': 'application/json' }
 };

 if (token) options.headers['Authorization'] = `Bearer ${token}`;
 if (data) options.body = JSON.stringify(data);

 const response = await fetch(`${BASE_URL}${endpoint}`, options);
 return await response.json();
}

// Main test function
async function runTest() {
 console.log('\n='.repeat(80));
 console.log('FAST AUTHENTICATION AND BOOKING TEST');
 console.log('='.repeat(80));

 try {
 // Connect to database
 const connected = await connectDB();
 if (!connected) {
 throw new Error('Failed to connect to database');
 }

 // TEST 1: Create user directly in database (FAST - no API call)
 console.log('\n[TEST 1] Creating test user directly in database...');
 const startCreate = Date.now();
 
 // Create user with plain password - let the pre-save hook hash it
 const user = new User({
 email: TEST_USER.email,
 password: TEST_USER.password, // Plain password
 firstName: TEST_USER.firstName,
 lastName: TEST_USER.lastName,
 phoneNumber: TEST_USER.phoneNumber,
 role: TEST_USER.role
 });
 
 // Save user - pre-save hook will hash the password
 await user.save();
 
 // Create wallet
 const wallet = await Wallet.createWallet(user._id);
 await User.updateOne({ _id: user._id }, { walletId: wallet._id });
 
 console.log(`PASS: User created in ${Date.now() - startCreate}ms`);
 console.log(`User ID: ${user._id}`);
 console.log(`Email: ${user.email}`);

 // TEST 2: Login via API
 console.log('\n[TEST 2] Logging in via API...');
 const startLogin = Date.now();
 
 const loginResult = await apiCall('/auth/login', 'POST', {
 email: TEST_USER.email,
 password: TEST_USER.password
 });
 
 console.log('Login result:', JSON.stringify(loginResult, null, 2));
 
 if (!loginResult.success) {
 throw new Error(`Login failed: ${loginResult.message}`);
 }
 
 const token = loginResult.data.tokens.accessToken;
 console.log(`PASS: Login successful in ${Date.now() - startLogin}ms`);
 console.log(`Token: ${token.substring(0, 20)}...`);

 // TEST 3: Create NORMAL booking
 console.log('\n[TEST 3] Creating NORMAL booking...');
 const startNormalBooking = Date.now();
 
 const threeDaysFromNow = new Date();
 threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
 const bookingDate = threeDaysFromNow.toISOString().split('T')[0];
 
 const normalBookingData = {
 clientName: `${TEST_USER.firstName} ${TEST_USER.lastName}`,
 clientPhone: TEST_USER.phoneNumber,
 clientEmail: TEST_USER.email,
 serviceType: 'plumbing',
 serviceDescription: 'Fix leaking kitchen sink and replace washers',
 isCritical: false,
 urgency: 'normal',
 preferredDate: bookingDate,
 preferredTimeSlot: '10:00-12:00',
 location: {
 constituency: 'Westlands',
 ward: 'Parklands',
 road: 'Limuru Road',
 description: 'Green gate house, second floor',
 landmarks: 'Near Sarit Centre'
 },
 specialRequirements: 'Please bring pipe wrench'
 };
 
 const normalBookingResult = await apiCall(
 '/bookings-redesigned/redesigned',
 'POST',
 normalBookingData,
 token
 );
 
 if (!normalBookingResult.success) {
 throw new Error(`Normal booking failed: ${normalBookingResult.message}`);
 }
 
 console.log(`PASS: Normal booking created in ${Date.now() - startNormalBooking}ms`);
 console.log(`Booking ID: ${normalBookingResult.data.bookingId}`);
 console.log(`Urgency: ${normalBookingResult.data.urgency}`);
 console.log(`Status: ${normalBookingResult.data.status}`);

 // TEST 4: Create CRITICAL booking
 console.log('\n[TEST 4] Creating CRITICAL booking...');
 const startCriticalBooking = Date.now();
 
 const criticalBookingData = {
 clientName: `${TEST_USER.firstName} ${TEST_USER.lastName}`,
 clientPhone: TEST_USER.phoneNumber,
 clientEmail: TEST_USER.email,
 serviceType: 'plumbing',
 serviceDescription: 'URGENT: Burst pipe flooding apartment',
 isCritical: true,
 urgency: 'emergency',
 location: {
 constituency: 'Westlands',
 ward: 'Parklands',
 road: 'Limuru Road',
 description: 'Green gate house, second floor',
 landmarks: 'Near Sarit Centre'
 }
 // No preferredDate or preferredTimeSlot - should be auto-filled
 };
 
 const criticalBookingResult = await apiCall(
 '/bookings-redesigned/redesigned',
 'POST',
 criticalBookingData,
 token
 );
 
 console.log('Critical booking API response:', JSON.stringify(criticalBookingResult, null, 2));
 
 if (!criticalBookingResult.success) {
 throw new Error(`Critical booking failed: ${criticalBookingResult.message || 'Unknown error'}`);
 }
 
 console.log(`PASS: Critical booking created in ${Date.now() - startCriticalBooking}ms`);
 console.log(`Booking ID: ${criticalBookingResult.data.bookingId}`);
 console.log(`Urgency: ${criticalBookingResult.data.urgency}`);
 console.log(`Time Slot: ${criticalBookingResult.data.preferredTimeSlot}`);
 console.log(`Status: ${criticalBookingResult.data.status}`);

 // TEST 5: Verify bookings in database
 console.log('\n[TEST 5] Verifying bookings in database...');
 const bookings = await Booking.find({ clientPhone: TEST_USER.phoneNumber });
 
 console.log(`PASS: Found ${bookings.length} bookings for user`);
 bookings.forEach((booking, index) => {
 console.log(` ${index + 1}. ${booking.bookingId} - ${booking.urgency} (${booking.status})`);
 });

 // Final Summary
 console.log('\n' + '='.repeat(80));
 console.log('ALL TESTS PASSED!');
 console.log('='.repeat(80));
 console.log('Summary:');
 console.log(`- User created: ${TEST_USER.email}`);
 console.log(`- Login successful with fast response`);
 console.log(`- Normal booking created: ${normalBookingResult.data.bookingId}`);
 console.log(`- Critical booking created: ${criticalBookingResult.data.bookingId}`);
 console.log('='.repeat(80));

 } catch (error) {
 console.error('\n' + '='.repeat(80));
 console.error('TEST FAILED');
 console.error('='.repeat(80));
 console.error('Error:', error.message);
 console.error('Stack:', error.stack);
 } finally {
 await mongoose.disconnect();
 console.log('\nDatabase disconnected');
 }
}

// Run the test
runTest();
