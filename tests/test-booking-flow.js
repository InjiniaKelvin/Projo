/**
 * Test booking creation, submission, and fetching
 */

const fetch = require('node-fetch').default || require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data for booking creation
const testBookingData = {
 clientName: "John Doe",
 phoneNumber: "+254712345678", 
 serviceType: "Plumbing",
 serviceDescription: "Fix leaking tap",
 constituency: "Nairobi Central",
 ward: "City Center", 
 roadStreet: "Kenyatta Avenue",
 locationDescription: "Near post office",
 preferredDate: "2025-08-20",
 preferredTimeSlot: "09:00-12:00"
};

console.log(' Testing Booking System...\n');

async function testBookingFlow() {
 try {
 // Test 1: Health Check
 console.log('1⃣ Testing server health...');
 const healthResponse = await fetch(`${BASE_URL}/health`);
 const healthData = await healthResponse.json();
 console.log(' Health:', healthData.success ? ' Healthy' : ' Unhealthy');
 
 // Test 2: Create Booking
 console.log('\n2⃣ Testing booking creation...');
 const createResponse = await fetch(`${BASE_URL}/api/bookings`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify(testBookingData)
 });
 
 const createResult = await createResponse.json();
 console.log(' Status:', createResponse.status);
 console.log(' Response:', JSON.stringify(createResult, null, 2));
 
 if (createResult.success && createResult.data?.bookingId) {
 const bookingId = createResult.data.bookingId;
 const phoneNumber = testBookingData.phoneNumber;
 
 // Test 3: Fetch single booking
 console.log('\n3⃣ Testing single booking fetch...');
 const fetchResponse = await fetch(`${BASE_URL}/api/bookings/${bookingId}`);
 const fetchResult = await fetchResponse.json();
 console.log(' Status:', fetchResponse.status);
 console.log(' Response:', JSON.stringify(fetchResult, null, 2));
 
 // Test 4: Fetch bookings by phone
 console.log('\n4⃣ Testing bookings by phone fetch...');
 const phoneResponse = await fetch(`${BASE_URL}/api/bookings/phone/${encodeURIComponent(phoneNumber)}`);
 const phoneResult = await phoneResponse.json();
 console.log(' Status:', phoneResponse.status);
 console.log(' Response:', JSON.stringify(phoneResult, null, 2));
 
 } else {
 console.log(' Booking creation failed, skipping fetch tests');
 }
 
 } catch (error) {
 console.error(' Test failed:', error.message);
 }
}

testBookingFlow();
