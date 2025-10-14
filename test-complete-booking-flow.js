/**
 * COMPLETE END-TO-END BOOKING FLOW TEST
 * 
 * This script tests the entire booking workflow:
 * 1. Register a new user
 * 2. Login with credentials
 * 3. Create a booking with authentication
 * 4. Verify booking was created
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test user data - Using timestamp for unique phone
const timestamp = Date.now();
const uniquePhone = `07${timestamp.toString().slice(-8)}`;

const testUser = {
  firstName: 'Sarah',
  lastName: 'Mwangi',
  email: `sarah.mwangi.${timestamp}@test.com`,
  phoneNumber: uniquePhone,
  password: 'TestPassword123!',
  userType: 'client'
};

// Test booking data
const testBooking = {
  clientName: 'Sarah Mwangi',
  clientPhone: uniquePhone,
  clientEmail: `sarah.mwangi.${timestamp}@test.com`,
  communicationPhone: '',
  serviceType: 'plumbing',
  serviceDescription: 'Kitchen sink is leaking badly. Water dripping from the U-bend pipe under the sink. Need urgent repair.',
  urgency: 'normal',
  location: {
    constituency: 'Westlands',
    ward: 'Kitisuru',
    road: 'Spring Valley Road',
    description: 'Green apartment building, Unit 5B, second floor',
    landmarks: 'Near Village Market shopping center'
  },
  preferredDate: '2025-10-15',
  preferredTimeSlot: '10:00-12:00',
  specialRequirements: 'Please bring pipe sealant and replacement washers'
};

async function runCompleteTest() {
  console.log('\n========================================');
  console.log('COMPLETE BOOKING FLOW TEST');
  console.log('========================================\n');

  let authToken = null;
  let userId = null;

  try {
    // STEP 1: REGISTER NEW USER
    console.log('STEP 1: Registering new user...');
    console.log('User details:', {
      name: `${testUser.firstName} ${testUser.lastName}`,
      email: testUser.email,
      phone: testUser.phoneNumber,
      type: testUser.userType
    });

    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    
    if (registerResponse.data.success) {
      console.log('✓ Registration successful!');
      console.log('  User ID:', registerResponse.data.data.userId);
      console.log('  Token received:', registerResponse.data.data.token ? 'Yes' : 'No');
      userId = registerResponse.data.data.userId;
      authToken = registerResponse.data.data.token;
    } else {
      throw new Error('Registration failed: ' + registerResponse.data.message);
    }

    console.log('\n----------------------------------------\n');

    // STEP 2: LOGIN
    console.log('STEP 2: Logging in with credentials...');
    console.log('Login details:', {
      email: testUser.email,
      password: '***hidden***'
    });

    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    if (loginResponse.data.success) {
      console.log('✓ Login successful!');
      console.log('  User ID:', loginResponse.data.data.userId);
      console.log('  User Type:', loginResponse.data.data.userType);
      console.log('  Token received:', loginResponse.data.data.token ? 'Yes' : 'No');
      authToken = loginResponse.data.data.token; // Update token from login
    } else {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    console.log('\n----------------------------------------\n');

    // STEP 3: CREATE BOOKING WITH AUTHENTICATION
    console.log('STEP 3: Creating booking with authentication...');
    console.log('Booking details:', {
      service: testBooking.serviceType,
      location: `${testBooking.location.ward}, ${testBooking.location.constituency}`,
      date: testBooking.preferredDate,
      time: testBooking.preferredTimeSlot
    });

    const bookingResponse = await axios.post(
      `${API_BASE_URL}/bookings-redesigned/redesigned`,
      testBooking,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (bookingResponse.data.success) {
      console.log('✓ Booking created successfully!');
      console.log('  Booking ID:', bookingResponse.data.data.bookingId);
      console.log('  Status:', bookingResponse.data.data.status);
      console.log('  Client Phone:', bookingResponse.data.data.clientPhone);
      
      console.log('\n----------------------------------------\n');

      // STEP 4: VERIFY BOOKING
      console.log('STEP 4: Verifying booking was created...');
      const bookingId = bookingResponse.data.data.bookingId;

      const verifyResponse = await axios.get(
        `${API_BASE_URL}/bookings-redesigned/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (verifyResponse.data.success) {
        console.log('✓ Booking verified in database!');
        console.log('  Service Type:', verifyResponse.data.data.serviceType);
        console.log('  Description:', verifyResponse.data.data.serviceDescription.substring(0, 50) + '...');
        console.log('  Location:', `${verifyResponse.data.data.location.ward}, ${verifyResponse.data.data.location.constituency}`);
        console.log('  Scheduled:', `${verifyResponse.data.data.preferredDate} at ${verifyResponse.data.data.preferredTimeSlot}`);
      } else {
        throw new Error('Booking verification failed');
      }

      console.log('\n========================================');
      console.log('ALL TESTS PASSED SUCCESSFULLY!');
      console.log('========================================\n');

      // Print summary
      console.log('SUMMARY:');
      console.log('  User registered: ' + testUser.email);
      console.log('  User logged in: ' + testUser.phoneNumber);
      console.log('  Booking created: ' + bookingId);
      console.log('  Booking status: ' + verifyResponse.data.data.status);
      console.log('\nThe complete booking flow is working correctly!\n');

      return true;

    } else {
      throw new Error('Booking creation failed: ' + bookingResponse.data.message);
    }

  } catch (error) {
    console.error('\n========================================');
    console.error('TEST FAILED');
    console.error('========================================\n');
    
    if (error.response) {
      console.error('Error Response:');
      console.error('  Status:', error.response.status);
      console.error('  Message:', error.response.data.message || error.response.data);
      if (error.response.data.errors) {
        console.error('  Validation Errors:', error.response.data.errors);
      }
    } else if (error.request) {
      console.error('Network Error:');
      console.error('  No response received from server');
      console.error('  Check if backend is running on port 5000');
    } else {
      console.error('Error:', error.message);
    }
    
    return false;
  }
}

// Run the test
runCompleteTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
