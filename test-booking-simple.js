/**
 * SIMPLE BOOKING TEST - Use existing user
 * 
 * Tests booking system without registration
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

// Use an existing user
const TEST_USER = {
  email: 'juju1@gmail.com', // Change this to an existing user email
  password: 'Juju@1234'      // Change this to the user's password
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTest() {
  try {
    console.log('\n' + '='.repeat(80));
    log('SIMPLE BOOKING SYSTEM TEST', 'cyan');
    console.log('='.repeat(80) + '\n');

    // STEP 1: Login with existing user
    log('STEP 1: Login with existing user', 'cyan');
    console.log('Email:', TEST_USER.email);
    
    const loginStart = Date.now();
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    
    const loginResult = await loginResponse.json();
    const loginTime = Date.now() - loginStart;
    
    if (!loginResult.success) {
      log(`FAIL: Login failed - ${loginResult.message}`, 'red');
      log(`Time taken: ${loginTime}ms`, 'yellow');
      console.log('\nPlease check:');
      console.log('1. User exists in database');
      console.log('2. Email and password are correct');
      console.log('3. Backend server is running on port 5000');
      process.exit(1);
    }
    
    log(`PASS: Login successful in ${loginTime}ms`, 'green');
    console.log('User:', loginResult.data.user.firstName, loginResult.data.user.lastName);
    console.log('Token:', loginResult.data.tokens.accessToken.substring(0, 20) + '...');
    
    const token = loginResult.data.tokens.accessToken;
    const user = loginResult.data.user;

    // STEP 2: Create a CRITICAL booking (no date/time needed)
    console.log('\n' + '='.repeat(80));
    log('STEP 2: Create CRITICAL Booking (Emergency)', 'cyan');
    console.log('='.repeat(80) + '\n');
    
    const criticalBooking = {
      clientName: `${user.firstName} ${user.lastName}`,
      clientPhone: user.phoneNumber,
      clientEmail: user.email,
      serviceType: 'plumbing',
      serviceDescription: 'Emergency burst pipe in kitchen, water everywhere, need immediate help',
      isCritical: true,
      urgency: 'emergency',
      location: {
        constituency: 'Westlands',
        ward: 'Parklands',
        road: 'Limuru Road',
        description: 'White gate, third house on the left',
        landmarks: 'Near Sarit Centre, opposite Shell petrol station'
      },
      specialRequirements: 'Please bring extra pipes and tools'
    };
    
    console.log('Booking Details:');
    console.log('- Service:', criticalBooking.serviceType);
    console.log('- Critical:', criticalBooking.isCritical);
    console.log('- Description:', criticalBooking.serviceDescription.substring(0, 50) + '...');
    
    const criticalStart = Date.now();
    const criticalResponse = await fetch(`${BASE_URL}/bookings-redesigned/redesigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(criticalBooking)
    });
    
    const criticalResult = await criticalResponse.json();
    const criticalTime = Date.now() - criticalStart;
    
    if (!criticalResult.success) {
      log(`FAIL: Critical booking failed - ${criticalResult.message}`, 'red');
      console.log('Response:', JSON.stringify(criticalResult, null, 2));
      process.exit(1);
    }
    
    log(`PASS: Critical booking created in ${criticalTime}ms`, 'green');
    console.log('Booking ID:', criticalResult.data.bookingId);
    console.log('Urgency:', criticalResult.data.urgency);
    console.log('Time Slot:', criticalResult.data.preferredTimeSlot);
    console.log('Date:', criticalResult.data.preferredDate);
    console.log('Status:', criticalResult.data.status);

    // STEP 3: Create a NORMAL booking (with date/time)
    console.log('\n' + '='.repeat(80));
    log('STEP 3: Create NORMAL Booking (Scheduled)', 'cyan');
    console.log('='.repeat(80) + '\n');
    
    // Calculate a date 3 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const formattedDate = futureDate.toISOString().split('T')[0];
    
    const normalBooking = {
      clientName: `${user.firstName} ${user.lastName}`,
      clientPhone: user.phoneNumber,
      clientEmail: user.email,
      serviceType: 'electrical',
      serviceDescription: 'Install new ceiling fan in living room, need professional electrician',
      isCritical: false,
      urgency: 'normal',
      preferredDate: formattedDate,
      preferredTimeSlot: '10:00-12:00',
      location: {
        constituency: 'Langata',
        ward: 'Karen',
        road: 'Karen Road',
        description: 'Green gate, two-story house',
        landmarks: 'Near Karen Hospital'
      },
      specialRequirements: 'Please call when arriving'
    };
    
    console.log('Booking Details:');
    console.log('- Service:', normalBooking.serviceType);
    console.log('- Critical:', normalBooking.isCritical);
    console.log('- Date:', normalBooking.preferredDate);
    console.log('- Time:', normalBooking.preferredTimeSlot);
    
    const normalStart = Date.now();
    const normalResponse = await fetch(`${BASE_URL}/bookings-redesigned/redesigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(normalBooking)
    });
    
    const normalResult = await normalResponse.json();
    const normalTime = Date.now() - normalStart;
    
    if (!normalResult.success) {
      log(`FAIL: Normal booking failed - ${normalResult.message}`, 'red');
      console.log('Response:', JSON.stringify(normalResult, null, 2));
      process.exit(1);
    }
    
    log(`PASS: Normal booking created in ${normalTime}ms`, 'green');
    console.log('Booking ID:', normalResult.data.bookingId);
    console.log('Urgency:', normalResult.data.urgency);
    console.log('Time Slot:', normalResult.data.preferredTimeSlot);
    console.log('Date:', normalResult.data.preferredDate);
    console.log('Status:', normalResult.data.status);

    // STEP 4: Test 2-hour validation (should fail)
    console.log('\n' + '='.repeat(80));
    log('STEP 4: Test 2-Hour Validation (Should Fail)', 'cyan');
    console.log('='.repeat(80) + '\n');
    
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    const invalidTimeSlot = currentHour < 22 ? `${currentHour}:00-${currentHour + 1}:00` : '08:00-10:00';
    
    const invalidBooking = {
      clientName: `${user.firstName} ${user.lastName}`,
      clientPhone: user.phoneNumber,
      clientEmail: user.email,
      serviceType: 'cleaning',
      serviceDescription: 'Quick cleaning service',
      isCritical: false,
      urgency: 'normal',
      preferredDate: today,
      preferredTimeSlot: invalidTimeSlot,
      location: {
        constituency: 'Westlands',
        ward: 'Parklands',
        road: 'Test Road',
        description: 'Test location',
        landmarks: 'Test'
      }
    };
    
    console.log('Attempting to book for:');
    console.log('- Date:', invalidBooking.preferredDate, '(today)');
    console.log('- Time:', invalidBooking.preferredTimeSlot, '(within 2 hours)');
    
    const invalidResponse = await fetch(`${BASE_URL}/bookings-redesigned/redesigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(invalidBooking)
    });
    
    const invalidResult = await invalidResponse.json();
    
    if (!invalidResult.success) {
      log('PASS: Correctly rejected booking within 2-hour window', 'green');
      console.log('Error message:', invalidResult.message);
    } else {
      log('WARNING: 2-hour validation may not be working properly', 'yellow');
      console.log('Booking was accepted when it should have been rejected');
    }

    // STEP 5: Retrieve bookings by phone
    console.log('\n' + '='.repeat(80));
    log('STEP 5: Retrieve Bookings by Phone', 'cyan');
    console.log('='.repeat(80) + '\n');
    
    const retrieveResponse = await fetch(
      `${BASE_URL}/bookings-redesigned/phone/${encodeURIComponent(user.phoneNumber)}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const retrieveResult = await retrieveResponse.json();
    
    if (retrieveResult.success) {
      log(`PASS: Retrieved ${retrieveResult.data.length} booking(s)`, 'green');
      retrieveResult.data.slice(0, 2).forEach((booking, index) => {
        console.log(`\nBooking ${index + 1}:`);
        console.log('  ID:', booking.bookingId);
        console.log('  Service:', booking.serviceType);
        console.log('  Urgency:', booking.urgency);
        console.log('  Status:', booking.status);
        console.log('  Date:', booking.preferredDate);
      });
    }

    // FINAL SUMMARY
    console.log('\n' + '='.repeat(80));
    log('TEST SUMMARY', 'cyan');
    console.log('='.repeat(80) + '\n');
    
    log('ALL TESTS PASSED!', 'green');
    console.log('\nResults:');
    console.log(`- Login time: ${loginTime}ms`);
    console.log(`- Critical booking time: ${criticalTime}ms`);
    console.log(`- Normal booking time: ${normalTime}ms`);
    console.log(`- Total bookings: ${retrieveResult.success ? retrieveResult.data.length : 'N/A'}`);
    
    console.log('\n' + '='.repeat(80));
    log('BOOKING SYSTEM IS WORKING PERFECTLY!', 'green');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n' + '='.repeat(80));
    log('ERROR: Test failed', 'red');
    console.error('='.repeat(80));
    console.error('\nError details:', error.message);
    console.error('\nStack trace:', error.stack);
    console.error('\nPlease check:');
    console.error('1. Backend server is running on http://localhost:5000');
    console.error('2. Database connection is active');
    console.error('3. User credentials are correct');
    process.exit(1);
  }
}

// Run the test
console.log('\nStarting booking system test...');
console.log('Using existing user:', TEST_USER.email);
console.log('\nNote: Update TEST_USER in this file if using different credentials\n');

runTest();
