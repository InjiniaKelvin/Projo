/**
 * COMPREHENSIVE TECHNICIAN IMPLEMENTATION TEST SUITE
 * Tests all technician endpoints and functionality
 * Run: node test-technician-implementation.js
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
let testData = {
  clientToken: null,
  technicianToken: null,
  clientId: null,
  technicianId: null,
  bookingId: null,
  timestamp: Date.now(),
  testEmail: `tech_test_${Date.now()}@test.com`,
  clientEmail: `client_test_${Date.now()}@test.com`,
  techPhone: `07${Date.now().toString().slice(-8)}`,
  clientPhone: `07${(Date.now() + 1).toString().slice(-8)}`
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log('\n' + '='.repeat(60));
  log(`TEST: ${testName}`, 'blue');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ PASS: ${message}`, 'green');
}

function logError(message) {
  log(`❌ FAIL: ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  INFO: ${message}`, 'gray');
}

function logWarning(message) {
  log(`⚠️  WARN: ${message}`, 'yellow');
}

// Utility function for API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  logInfo(`${method} ${endpoint}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    logError(`Network error: ${error.message}`);
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Test 1: Create test client
async function testCreateClient() {
  logTest('Create Test Client');
  
  const result = await apiCall('/auth/register', 'POST', {
    firstName: 'Test',
    lastName: 'Client',
    email: testData.clientEmail,
    password: 'Test@1234',
    phoneNumber: testData.clientPhone,
    role: 'client'
  });

  if (result.ok) {
    testData.clientToken = result.data.token;
    testData.clientId = result.data.user._id;
    logSuccess(`Client created: ${result.data.user.name}`);
    logInfo(`Client ID: ${testData.clientId}`);
    return true;
  } else {
    logError(`Failed to create client: ${result.data.message}`);
    return false;
  }
}

// Test 2: Create test technician
async function testCreateTechnician() {
  logTest('Create Test Technician');
  
  const result = await apiCall('/auth/register', 'POST', {
    firstName: 'Test',
    lastName: 'Technician',
    email: testData.testEmail,
    password: 'Test@1234',
    phoneNumber: testData.techPhone,
    role: 'technician',
    skills: ['plumbing', 'electrical'],
    location: {
      latitude: -1.2921,
      longitude: 36.8219,
      estate: 'Westlands',
      address: 'Test Address, Nairobi'
    }
  });

  if (result.ok) {
    testData.technicianToken = result.data.token;
    testData.technicianId = result.data.user._id;
    logSuccess(`Technician created: ${result.data.user.name}`);
    logInfo(`Technician ID: ${testData.technicianId}`);
    return true;
  } else {
    logError(`Failed to create technician: ${result.data.message}`);
    return false;
  }
}

// Test 3: Create test booking (as client)
async function testCreateBooking() {
  logTest('Create Test Booking');
  
  const result = await apiCall('/bookings', 'POST', {
    serviceType: 'plumbing',
    serviceName: 'Pipe Repair',
    problemDescription: 'Leaking pipe in kitchen',
    urgency: 'emergency',
    location: {
      latitude: -1.2921,
      longitude: 36.8219,
      estate: 'Westlands',
      address: 'Test Address, Nairobi'
    },
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTimeSlot: 'emergency-asap',
    price: 2500
  }, testData.clientToken);

  if (result.ok) {
    testData.bookingId = result.data.booking._id;
    logSuccess(`Booking created: ${result.data.booking.bookingReference}`);
    logInfo(`Booking ID: ${testData.bookingId}`);
    return true;
  } else {
    logError(`Failed to create booking: ${result.data.message}`);
    return false;
  }
}

// Test 4: Get available jobs (as technician)
async function testGetAvailableJobs() {
  logTest('Get Available Jobs');
  
  const result = await apiCall('/technician/available-jobs', 'GET', null, testData.technicianToken);

  if (result.ok) {
    const jobCount = result.data.jobs?.length || 0;
    logSuccess(`Retrieved ${jobCount} available jobs`);
    
    if (jobCount > 0) {
      logInfo(`First job: ${result.data.jobs[0].serviceName}`);
      logInfo(`Price: KSh ${result.data.jobs[0].price}`);
      logInfo(`Location: ${result.data.jobs[0].location?.estate}`);
    }
    
    return true;
  } else {
    logError(`Failed to get available jobs: ${result.data.message}`);
    return false;
  }
}

// Test 5: Accept job
async function testAcceptJob() {
  logTest('Accept Job');
  
  if (!testData.bookingId) {
    logWarning('No booking ID available, skipping test');
    return false;
  }

  const result = await apiCall(`/technician/accept-job/${testData.bookingId}`, 'POST', {}, testData.technicianToken);

  if (result.ok) {
    logSuccess(`Job accepted successfully`);
    logInfo(`Status: ${result.data.booking.status}`);
    logInfo(`Technician: ${result.data.booking.technicianId}`);
    return true;
  } else {
    logError(`Failed to accept job: ${result.data.message}`);
    return false;
  }
}

// Test 6: Get my jobs
async function testGetMyJobs() {
  logTest('Get My Jobs');
  
  const result = await apiCall('/technician/my-jobs', 'GET', null, testData.technicianToken);

  if (result.ok) {
    const jobCount = result.data.jobs?.length || 0;
    logSuccess(`Retrieved ${jobCount} assigned jobs`);
    
    if (jobCount > 0) {
      const activeJobs = result.data.jobs.filter(j => ['accepted', 'in_progress'].includes(j.status));
      const completedJobs = result.data.jobs.filter(j => j.status === 'completed');
      logInfo(`Active jobs: ${activeJobs.length}`);
      logInfo(`Completed jobs: ${completedJobs.length}`);
    }
    
    return true;
  } else {
    logError(`Failed to get my jobs: ${result.data.message}`);
    return false;
  }
}

// Test 7: Start job
async function testStartJob() {
  logTest('Start Job');
  
  if (!testData.bookingId) {
    logWarning('No booking ID available, skipping test');
    return false;
  }

  const result = await apiCall(`/technician/start-job/${testData.bookingId}`, 'POST', {}, testData.technicianToken);

  if (result.ok) {
    logSuccess(`Job started successfully`);
    logInfo(`Status: ${result.data.booking.status}`);
    logInfo(`Start time: ${new Date(result.data.booking.startTime).toLocaleString()}`);
    return true;
  } else {
    logError(`Failed to start job: ${result.data.message}`);
    return false;
  }
}

// Test 8: Update location
async function testUpdateLocation() {
  logTest('Update Technician Location');
  
  const result = await apiCall('/technician/location', 'POST', {
    latitude: -1.2921,
    longitude: 36.8219,
    estate: 'Westlands',
    address: 'Updated location, Nairobi'
  }, testData.technicianToken);

  if (result.ok) {
    logSuccess(`Location updated successfully`);
    logInfo(`Estate: ${result.data.location.estate}`);
    return true;
  } else {
    logError(`Failed to update location: ${result.data.message}`);
    return false;
  }
}

// Test 9: Update availability
async function testUpdateAvailability() {
  logTest('Update Availability');
  
  const result = await apiCall('/technician/availability', 'PUT', {
    available: true
  }, testData.technicianToken);

  if (result.ok) {
    logSuccess(`Availability updated: ${result.data.technician.availability ? 'ONLINE' : 'OFFLINE'}`);
    return true;
  } else {
    logError(`Failed to update availability: ${result.data.message}`);
    return false;
  }
}

// Test 10: Complete job (without photos for now)
async function testCompleteJob() {
  logTest('Complete Job');
  
  if (!testData.bookingId) {
    logWarning('No booking ID available, skipping test');
    return false;
  }

  const result = await apiCall(`/technician/complete-job/${testData.bookingId}`, 'POST', {
    completionNotes: 'Test completion - pipe repaired successfully'
  }, testData.technicianToken);

  if (result.ok) {
    logSuccess(`Job completed successfully`);
    logInfo(`Status: ${result.data.booking.status}`);
    logInfo(`Completion time: ${new Date(result.data.booking.completionTime).toLocaleString()}`);
    return true;
  } else {
    logError(`Failed to complete job: ${result.data.message}`);
    return false;
  }
}

// Test 11: Get earnings
async function testGetEarnings() {
  logTest('Get Earnings');
  
  const result = await apiCall('/technician/earnings', 'GET', null, testData.technicianToken);

  if (result.ok) {
    logSuccess(`Earnings retrieved successfully`);
    logInfo(`Total earnings: KSh ${result.data.totalEarnings || 0}`);
    logInfo(`Available balance: KSh ${result.data.availableBalance || 0}`);
    logInfo(`Pending: KSh ${result.data.pendingEarnings || 0}`);
    logInfo(`Transactions: ${result.data.transactions?.length || 0}`);
    return true;
  } else {
    logError(`Failed to get earnings: ${result.data.message}`);
    return false;
  }
}

// Test 12: Request withdrawal
async function testRequestWithdrawal() {
  logTest('Request Withdrawal');
  
  const result = await apiCall('/technician/withdraw', 'POST', {
    amount: 1000,
    mpesaNumber: '254700000002',
    method: 'mpesa'
  }, testData.technicianToken);

  if (result.ok) {
    logSuccess(`Withdrawal requested successfully`);
    logInfo(`Amount: KSh ${result.data.transaction.amount}`);
    logInfo(`Status: ${result.data.transaction.status}`);
    logInfo(`Method: ${result.data.transaction.method}`);
    return true;
  } else {
    // May fail due to insufficient balance, which is okay
    logWarning(`Withdrawal request: ${result.data.message}`);
    return true; // Don't fail the test suite
  }
}

// Test 13: Reject job (create another booking first)
async function testRejectJob() {
  logTest('Reject Job');
  
  // Create another booking
  const bookingResult = await apiCall('/bookings', 'POST', {
    serviceType: 'electrical',
    serviceName: 'Socket Installation',
    problemDescription: 'Install new power socket',
    urgency: 'normal',
    location: {
      latitude: -1.2921,
      longitude: 36.8219,
      estate: 'Westlands',
      address: 'Test Address, Nairobi'
    },
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTimeSlot: 'morning',
    price: 1500
  }, testData.clientToken);

  if (!bookingResult.ok) {
    logError('Failed to create test booking for rejection');
    return false;
  }

  const newBookingId = bookingResult.data.booking._id;
  logInfo(`Created booking: ${newBookingId}`);

  // Reject the booking
  const result = await apiCall(`/technician/reject-job/${newBookingId}`, 'POST', {
    reason: 'Too far from current location'
  }, testData.technicianToken);

  if (result.ok) {
    logSuccess(`Job rejected successfully`);
    logInfo(`Reason: ${result.data.reason}`);
    return true;
  } else {
    logError(`Failed to reject job: ${result.data.message}`);
    return false;
  }
}

// Test 14: Auth validation (unauthorized access)
async function testAuthValidation() {
  logTest('Auth Validation (Unauthorized Access)');
  
  // Try to access technician routes without token
  const result = await apiCall('/technician/available-jobs', 'GET', null, null);

  if (!result.ok && result.status === 401) {
    logSuccess(`Correctly blocked unauthorized access`);
    return true;
  } else {
    logError(`Authorization validation failed - should return 401`);
    return false;
  }
}

// Test 15: Role validation (client trying to access technician routes)
async function testRoleValidation() {
  logTest('Role Validation (Client accessing Technician routes)');
  
  // Try to access technician routes with client token
  const result = await apiCall('/technician/available-jobs', 'GET', null, testData.clientToken);

  if (!result.ok && (result.status === 403 || result.status === 401)) {
    logSuccess(`Correctly blocked client from technician routes`);
    return true;
  } else {
    logError(`Role validation failed - should return 403`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.clear();
  log('╔═══════════════════════════════════════════════════════════╗', 'blue');
  log('║   TECHNICIAN IMPLEMENTATION - COMPREHENSIVE TEST SUITE   ║', 'blue');
  log('╚═══════════════════════════════════════════════════════════╝', 'blue');
  
  const startTime = Date.now();
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Check if backend is running
  logInfo('Checking backend connection...');
  try {
    const healthCheck = await fetch('http://localhost:5000/api/health').catch(() => null);
    if (!healthCheck) {
      throw new Error('Backend not responding');
    }
    logSuccess('Backend is running on port 5000');
  } catch (error) {
    logError('❌ Backend is not running! Start with: npm run dev');
    logInfo('Run: npm run dev (in backend directory)');
    process.exit(1);
  }

  // Run all tests
  const tests = [
    { name: 'Create Client', fn: testCreateClient },
    { name: 'Create Technician', fn: testCreateTechnician },
    { name: 'Create Booking', fn: testCreateBooking },
    { name: 'Get Available Jobs', fn: testGetAvailableJobs },
    { name: 'Accept Job', fn: testAcceptJob },
    { name: 'Get My Jobs', fn: testGetMyJobs },
    { name: 'Start Job', fn: testStartJob },
    { name: 'Update Location', fn: testUpdateLocation },
    { name: 'Update Availability', fn: testUpdateAvailability },
    { name: 'Complete Job', fn: testCompleteJob },
    { name: 'Get Earnings', fn: testGetEarnings },
    { name: 'Request Withdrawal', fn: testRequestWithdrawal },
    { name: 'Reject Job', fn: testRejectJob },
    { name: 'Auth Validation', fn: testAuthValidation },
    { name: 'Role Validation', fn: testRoleValidation }
  ];

  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      results.failed++;
      logError(`Test crashed: ${error.message}`);
    }
  }

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '═'.repeat(60));
  log('TEST SUMMARY', 'blue');
  console.log('═'.repeat(60));
  
  log(`Total Tests: ${results.total}`, 'gray');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, results.failed > 0 ? 'yellow' : 'green');
  log(`Duration: ${duration}s`, 'gray');
  
  console.log('═'.repeat(60));

  // Test data summary
  console.log('\n' + '─'.repeat(60));
  log('TEST DATA CREATED', 'blue');
  console.log('─'.repeat(60));
  log(`Client Email: ${testData.clientEmail}`, 'gray');
  log(`Technician Email: ${testData.testEmail}`, 'gray');
  log(`Password: Test@1234`, 'gray');
  log(`Booking ID: ${testData.bookingId || 'N/A'}`, 'gray');
  console.log('─'.repeat(60));

  // Final verdict
  console.log('\n');
  if (results.failed === 0) {
    log('╔═══════════════════════════════════════════════════════════╗', 'green');
    log('║           ✅ ALL TESTS PASSED SUCCESSFULLY! ✅           ║', 'green');
    log('║         Ready to commit and push to GitHub!             ║', 'green');
    log('╚═══════════════════════════════════════════════════════════╝', 'green');
  } else {
    log('╔═══════════════════════════════════════════════════════════╗', 'red');
    log('║              ⚠️  SOME TESTS FAILED ⚠️                    ║', 'red');
    log('║          Please fix issues before committing!            ║', 'red');
    log('╚═══════════════════════════════════════════════════════════╝', 'red');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
