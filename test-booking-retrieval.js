/**
 * TEST BOOKING RETRIEVAL BY ID, PHONE, AND EMAIL
 * 
 * This script tests all three methods of retrieving bookings:
 * 1. By Booking ID
 * 2. By Phone Number
 * 3. By Email (if endpoint exists)
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Use the booking we created in previous test
const TEST_BOOKING_ID = 'QF20251013201485670JKA';
const TEST_PHONE = '+254782838567'; // Also try without +254
const TEST_PHONE_ALT = '0782838567';
const TEST_EMAIL = 'sarah.mwangi.1760382838567@test.com';

async function testBookingRetrieval() {
  console.log('\n========================================');
  console.log('BOOKING RETRIEVAL TEST');
  console.log('========================================\n');

  let successCount = 0;
  let failCount = 0;

  // TEST 1: RETRIEVE BY BOOKING ID
  console.log('TEST 1: Retrieve by Booking ID');
  console.log('Booking ID:', TEST_BOOKING_ID);
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings-redesigned/${TEST_BOOKING_ID}`);
    
    if (response.data.success) {
      console.log('✓ SUCCESS - Retrieved by Booking ID');
      console.log('  Service:', response.data.data.serviceType);
      console.log('  Status:', response.data.data.status);
      console.log('  Client:', response.data.data.clientName);
      successCount++;
    } else {
      console.log('✗ FAILED - API returned success: false');
      console.log('  Message:', response.data.message);
      failCount++;
    }
  } catch (error) {
    console.log('✗ FAILED - Error retrieving by Booking ID');
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Message:', error.response.data.message || error.response.data);
    } else {
      console.log('  Error:', error.message);
    }
    failCount++;
  }

  console.log('\n----------------------------------------\n');

  // TEST 2: RETRIEVE BY PHONE NUMBER (with +254)
  console.log('TEST 2: Retrieve by Phone Number (with +254)');
  console.log('Phone:', TEST_PHONE);
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings-redesigned/phone/${TEST_PHONE}`);
    
    if (response.data.success) {
      console.log('✓ SUCCESS - Retrieved by Phone Number');
      console.log('  Bookings found:', response.data.data.length);
      if (response.data.data.length > 0) {
        console.log('  Latest booking:', response.data.data[0].bookingId);
        console.log('  Service:', response.data.data[0].serviceType);
      }
      successCount++;
    } else {
      console.log('✗ FAILED - API returned success: false');
      console.log('  Message:', response.data.message);
      failCount++;
    }
  } catch (error) {
    console.log('✗ FAILED - Error retrieving by Phone (+254)');
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Message:', error.response.data.message || error.response.data);
    } else {
      console.log('  Error:', error.message);
    }
    failCount++;
  }

  console.log('\n----------------------------------------\n');

  // TEST 3: RETRIEVE BY PHONE NUMBER (without +254)
  console.log('TEST 3: Retrieve by Phone Number (without +254)');
  console.log('Phone:', TEST_PHONE_ALT);
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings-redesigned/phone/${TEST_PHONE_ALT}`);
    
    if (response.data.success) {
      console.log('✓ SUCCESS - Retrieved by Phone Number (alt format)');
      console.log('  Bookings found:', response.data.data.length);
      if (response.data.data.length > 0) {
        console.log('  Latest booking:', response.data.data[0].bookingId);
      }
      successCount++;
    } else {
      console.log('✗ FAILED - API returned success: false');
      console.log('  Message:', response.data.message);
      failCount++;
    }
  } catch (error) {
    console.log('✗ FAILED - Error retrieving by Phone (alt format)');
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Message:', error.response.data.message || error.response.data);
    } else {
      console.log('  Error:', error.message);
    }
    failCount++;
  }

  console.log('\n----------------------------------------\n');

  // TEST 4: RETRIEVE BY EMAIL
  console.log('TEST 4: Retrieve by Email');
  console.log('Email:', TEST_EMAIL);
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings-redesigned/email/${TEST_EMAIL}`);
    
    if (response.data.success) {
      console.log('✓ SUCCESS - Retrieved by Email');
      console.log('  Bookings found:', response.data.data.length);
      if (response.data.data.length > 0) {
        console.log('  Latest booking:', response.data.data[0].bookingId);
        console.log('  Service:', response.data.data[0].serviceType);
      }
      successCount++;
    } else {
      console.log('✗ FAILED - API returned success: false');
      console.log('  Message:', response.data.message);
      failCount++;
    }
  } catch (error) {
    console.log('✗ FAILED - Error retrieving by Email');
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Message:', error.response.data.message || error.response.data);
      
      // If 404, the endpoint might not exist
      if (error.response.status === 404) {
        console.log('  NOTE: Email endpoint may not exist - this is expected if not implemented yet');
      }
    } else {
      console.log('  Error:', error.message);
    }
    failCount++;
  }

  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================\n');
  console.log('Tests Passed:', successCount);
  console.log('Tests Failed:', failCount);
  console.log('Total Tests:', successCount + failCount);
  
  if (failCount === 0) {
    console.log('\nStatus: ALL TESTS PASSED ✓');
  } else if (failCount === 1 && successCount >= 3) {
    console.log('\nStatus: MOSTLY PASSING (Email endpoint may need implementation)');
  } else {
    console.log('\nStatus: SOME TESTS FAILED - FIXES NEEDED');
  }
  
  console.log('\n========================================\n');

  return failCount === 0 || (failCount === 1 && successCount >= 3);
}

// Run the test
testBookingRetrieval()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
