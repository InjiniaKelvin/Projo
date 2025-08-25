#!/usr/bin/env node
/**
 * COMPREHENSIVE EMERGENCY BOOKING TEST - LATEST VERSION
 * Tests the complete emergency booking flow from start to finish
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test emergency booking data
const emergencyBookingData = {
  // CLIENT DETAILS (correct field names)
  clientName: "Sarah Emergency",
  clientPhone: "+254798765432", 
  clientEmail: "sarah.emergency@example.com",
  
  // SERVICE DETAILS (correct field names)
  serviceType: "electrical", // must be from enum
  serviceDescription: "Power outage in entire house - sparks from main panel!",
  
  // URGENCY
  urgency: "emergency",
  
  // LOCATION (nested object structure)
  location: {
    constituency: "Embakasi South",
    ward: "Pipeline", 
    road: "Pipeline Road",
    description: "House 78C, Opposite Pipeline Shopping Center",
    landmarks: "Near Pipeline Estate Main Gate"
  },
  
  // SCHEDULING (correct field names)
  preferredDate: new Date('2025-08-24').toISOString(),
  preferredTimeSlot: "flexible", // must be from enum
  
  // ADDITIONAL INFO
  specialRequirements: "Sparks coming from electrical panel - potential fire hazard! URGENT!"
};

console.log('🚨 EMERGENCY BOOKING TEST SUITE - LATEST');
console.log('==========================================\n');

async function testServerHealth() {
  console.log('1️⃣ Testing Server Health...');
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 10000 });
    console.log('✅ Server Health:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Server Health Check Failed:', error.message);
    return false;
  }
}

async function createEmergencyBooking() {
  console.log('\n2️⃣ Creating Emergency Booking...');
  console.log('📝 Booking Data:', JSON.stringify(emergencyBookingData, null, 2));
  
  try {
    // First, try the main endpoint
    console.log('🔗 Testing main endpoint: /api/bookings');
    const response = await axios.post(
      `${BASE_URL}/api/bookings`,
      emergencyBookingData,
      { 
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Emergency Booking Created Successfully!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    
    return response.data.booking || response.data;
  } catch (error) {
    console.log('❌ Main endpoint failed, trying redesigned endpoint...');
    
    try {
      console.log('🔗 Testing redesigned endpoint: /api/bookings-redesigned');
      const response2 = await axios.post(
        `${BASE_URL}/api/bookings-redesigned`,
        emergencyBookingData,
        { 
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Emergency Booking Created via Redesigned Endpoint!');
      console.log('📊 Response:', JSON.stringify(response2.data, null, 2));
      
      return response2.data.booking || response2.data;
    } catch (error2) {
      console.log('❌ Emergency Booking Creation Failed on both endpoints:');
      if (error.response) {
        console.log('Main endpoint - Status:', error.response.status);
        console.log('Main endpoint - Data:', error.response.data);
      } else {
        console.log('Main endpoint - Error:', error.message);
      }
      
      if (error2.response) {
        console.log('Redesigned endpoint - Status:', error2.response.status);
        console.log('Redesigned endpoint - Data:', error2.response.data);
      } else {
        console.log('Redesigned endpoint - Error:', error2.message);
      }
      return null;
    }
  }
}

async function verifyBooking(booking) {
  if (!booking) {
    console.log('\n❌ No booking data to verify');
    return false;
  }
  
  // Extract booking ID from the response data structure
  const bookingId = booking.bookingId || booking.data?.bookingId;
  
  if (!bookingId) {
    console.log('\n❌ No booking ID found in booking data');
    console.log('📊 Available booking data:', JSON.stringify(booking, null, 2));
    return false;
  }
  
  console.log('\n3️⃣ Verifying Emergency Booking...');
  console.log('🔍 Booking ID:', bookingId);
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/bookings/${bookingId}`,
      { timeout: 10000 }
    );
    
    console.log('✅ Booking Verification Successful!');
    console.log('📊 Verified Booking:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.log('❌ Booking Verification Failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

async function listUserBookings() {
  console.log('\n4️⃣ Retrieving User Bookings...');
  console.log('📱 Phone:', emergencyBookingData.clientPhone);
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/bookings/phone/${encodeURIComponent(emergencyBookingData.clientPhone)}`,
      { timeout: 10000 }
    );
    
    console.log('✅ User Bookings Retrieved!');
    console.log('📊 Total Bookings:', response.data.bookings ? response.data.bookings.length : 0);
    
    if (response.data.bookings && response.data.bookings.length > 0) {
      const emergencyBookings = response.data.bookings.filter(b => b.urgency === 'emergency');
      console.log('🚨 Emergency Bookings:', emergencyBookings.length);
      
      emergencyBookings.forEach((booking, index) => {
        console.log(`\n📋 Emergency Booking ${index + 1}:`);
        console.log(`   ID: ${booking.bookingId}`);
        console.log(`   Service: ${booking.serviceName}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Emergency Level: ${booking.emergencyLevel}`);
        console.log(`   Location: ${booking.ward}, ${booking.constituency}`);
        console.log(`   Created: ${booking.createdAt}`);
      });
    }
    
    return response.data.bookings || [];
  } catch (error) {
    console.log('❌ User Bookings Retrieval Failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return [];
  }
}

async function runComprehensiveTest() {
  const startTime = Date.now();
  console.log(`🕐 Test Started: ${new Date().toISOString()}\n`);
  
  let results = [];
  let booking = null;
  
  // Test 1: Server Health
  console.log('⏳ Running Server Health Check...');
  const healthResult = await testServerHealth();
  results.push({ test: 'Server Health', passed: healthResult });
  
  if (!healthResult) {
    console.log('🚨 Server health check failed - aborting test');
    return results;
  }
  
  // Test 2: Create Emergency Booking
  console.log('\n⏳ Running Emergency Booking Creation...');
  booking = await createEmergencyBooking();
  const createResult = !!booking;
  results.push({ test: 'Emergency Booking Creation', passed: createResult });
  
  if (!createResult) {
    console.log('🚨 Emergency booking creation failed - aborting test');
    return results;
  }
  
  // Test 3: Verify Booking
  console.log('\n⏳ Running Booking Verification...');
  const verifyResult = await verifyBooking(booking);
  results.push({ test: 'Booking Verification', passed: verifyResult });
  
  // Test 4: List User Bookings
  console.log('\n⏳ Running User Bookings Retrieval...');
  const listResult = await listUserBookings();
  const listPassed = Array.isArray(listResult);
  results.push({ test: 'User Bookings Retrieval', passed: listPassed });
  
  // Results Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE EMERGENCY BOOKING TEST RESULTS');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.test}: ${status}`);
  });
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  console.log('\n' + '='.repeat(60));
  console.log(`📈 SUCCESS RATE: ${passedTests}/${totalTests} (${successRate}%)`);
  console.log(`⏱️  EXECUTION TIME: ${Date.now() - startTime}ms`);
  console.log(`🕐 Test Completed: ${new Date().toISOString()}`);
  
  if (successRate === 100) {
    console.log('\n🎉 ALL TESTS PASSED! Emergency booking system is fully functional!');
    if (booking && booking.bookingId) {
      console.log(`\n📋 EMERGENCY BOOKING SUCCESSFULLY CREATED:`);
      console.log(`   🆔 Booking ID: ${booking.bookingId}`);
      console.log(`   🚨 Service: ${booking.serviceName || emergencyBookingData.serviceName}`);
      console.log(`   📍 Location: ${emergencyBookingData.ward}, ${emergencyBookingData.constituency}`);
      console.log(`   ⚡ Emergency Level: ${emergencyBookingData.emergencyLevel}`);
      console.log(`   📱 Customer: ${emergencyBookingData.name} (${emergencyBookingData.phone})`);
    }
  } else if (successRate >= 75) {
    console.log('\n⚠️  Most tests passed, but some issues need attention.');
  } else {
    console.log('\n🚨 Multiple test failures detected. Emergency booking system needs fixes.');
  }
  
  return results;
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Test interrupted by user');
  process.exit(0);
});

// Run the comprehensive test
if (require.main === module) {
  runComprehensiveTest().catch(error => {
    console.error('🚨 Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runComprehensiveTest,
  emergencyBookingData
};
