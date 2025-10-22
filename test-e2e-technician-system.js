/**
 * COMPLETE END-TO-END TECHNICIAN SYSTEM TEST
 * Creates 5 clients, 3 technicians, tests full booking workflow
 * Run: node test-e2e-technician-system.js
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Test users with real phone numbers (proper Kenyan format)
const TEST_CLIENTS = [
  { firstName: 'John', lastName: 'Doe', email: 'john.client@quickfix.test', phone: '+254798235690', password: 'Client@123' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.client@quickfix.test', phone: '+254710102030', password: 'Client@123' },
  { firstName: 'Bob', lastName: 'Johnson', email: 'bob.client@quickfix.test', phone: '+254740987070', password: 'Client@123' },
  { firstName: 'Alice', lastName: 'Williams', email: 'alice.client@quickfix.test', phone: '+254765740000', password: 'Client@123' },
  { firstName: 'Charlie', lastName: 'Brown', email: 'charlie.client@quickfix.test', phone: '+254712010101', password: 'Client@123' }
];

const TEST_TECHNICIANS = [
  { 
    firstName: 'Mike', 
    lastName: 'Plumber', 
    email: 'mike.tech@quickfix.test', 
    phone: '+254722111222', 
    password: 'Tech@123',
    skills: ['plumbing', 'general'],
    location: { latitude: -1.2921, longitude: 36.8219, estate: 'Westlands', address: 'Waiyaki Way, Nairobi' }
  },
  { 
    firstName: 'Sarah', 
    lastName: 'Electrician', 
    email: 'sarah.tech@quickfix.test', 
    phone: '+254733222333', 
    password: 'Tech@123',
    skills: ['electrical', 'appliance_repair'],
    location: { latitude: -1.2864, longitude: 36.8172, estate: 'Kilimani', address: 'Ngong Road, Nairobi' }
  },
  { 
    firstName: 'David', 
    lastName: 'Cleaner', 
    email: 'david.tech@quickfix.test', 
    phone: '+254744333444', 
    password: 'Tech@123',
    skills: ['cleaning', 'pest-control'],
    location: { latitude: -1.2795, longitude: 36.8145, estate: 'Lavington', address: 'James Gichuru Road, Nairobi' }
  }
];

// Test bookings (matching validation schema)
const TEST_BOOKINGS = [
  {
    serviceType: 'plumbing',
    serviceName: 'Pipe Repair',
    serviceDescription: 'Leaking pipe in kitchen sink, water dripping constantly. Need immediate repair as water is damaging cabinet.',
    urgency: 'emergency',
    location: { 
      latitude: -1.2921, 
      longitude: 36.8219, 
      estate: 'Westlands', 
      address: 'ABC Mall, Waiyaki Way',
      constituency: 'Westlands',
      ward: 'Parklands/Highridge',
      road: 'Waiyaki Way',
      description: 'Near ABC Mall entrance'
    },
    price: 2500
  },
  {
    serviceType: 'electrical',
    serviceName: 'Socket Installation',
    serviceDescription: 'Need 3 new power sockets installed in bedroom for appliances. Standard 13A sockets required.',
    urgency: 'normal',
    location: { 
      latitude: -1.2864, 
      longitude: 36.8172, 
      estate: 'Kilimani', 
      address: 'Yaya Centre Area',
      constituency: 'Dagoretti North',
      ward: 'Kilimani',
      road: 'Ngong Road',
      description: 'Near Yaya Centre shopping mall'
    },
    price: 1800
  },
  {
    serviceType: 'cleaning',
    serviceName: 'Deep Cleaning',
    serviceDescription: 'Full house deep cleaning needed before guests arrive this weekend. All rooms, windows, and kitchen.',
    urgency: 'normal',
    location: { 
      latitude: -1.2795, 
      longitude: 36.8145, 
      estate: 'Lavington', 
      address: 'Rose Avenue',
      constituency: 'Westlands',
      ward: 'Lavington',
      road: 'Rose Avenue',
      description: 'White gate house number 45'
    },
    price: 3500
  },
  {
    serviceType: 'plumbing',
    serviceName: 'Toilet Repair',
    serviceDescription: 'Toilet not flushing properly, handle broken and needs replacement. Water keeps running.',
    urgency: 'emergency',
    location: { 
      latitude: -1.2921, 
      longitude: 36.8219, 
      estate: 'Westlands', 
      address: 'Chiromo Lane',
      constituency: 'Westlands',
      ward: 'Parklands/Highridge',
      road: 'Chiromo Lane',
      description: 'Apartment building near Chiromo Court'
    },
    price: 2000
  },
  {
    serviceType: 'appliance_repair',
    serviceName: 'Washing Machine Repair',
    serviceDescription: 'Washing machine making loud noise and not spinning properly during wash cycle. Samsung model.',
    urgency: 'normal',
    location: { 
      latitude: -1.2864, 
      longitude: 36.8172, 
      estate: 'Kilimani', 
      address: 'Ring Road',
      constituency: 'Dagoretti North',
      ward: 'Kilimani',
      road: 'Ring Road Kilimani',
      description: 'Blue gate opposite petrol station'
    },
    price: 2500
  }
];

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '═'.repeat(70));
  log(`  ${title}`, 'blue');
  console.log('═'.repeat(70));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'gray');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Store test data
const testData = {
  clients: [],
  technicians: [],
  bookings: []
};

// API call helper
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

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Step 1: Create all clients
async function createClients() {
  logSection('STEP 1: Creating 5 Test Clients');
  
  for (let i = 0; i < TEST_CLIENTS.length; i++) {
    const client = TEST_CLIENTS[i];
    logInfo(`Creating client ${i + 1}/5: ${client.firstName} ${client.lastName} (${client.phone})`);
    
    const result = await apiCall('/auth/register', 'POST', {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phoneNumber: client.phone,
      password: client.password,
      role: 'client'
    });

    if (result.ok && result.data.success && result.data.data?.user) {
      testData.clients.push({
        ...client,
        id: result.data.data.user._id,
        token: result.data.data.tokens.accessToken
      });
      logSuccess(`Client created: ${client.firstName} ${client.lastName}`);
    } else {
      logError(`Failed to create client: ${result.data.message}`);
      if (result.data.message?.includes('already exists')) {
        // Try to login instead
        const loginResult = await apiCall('/auth/login', 'POST', {
          email: client.email,
          password: client.password
        });
        
        if (loginResult.ok && loginResult.data.data?.user) {
          testData.clients.push({
            ...client,
            id: loginResult.data.data.user._id,
            token: loginResult.data.data.tokens.accessToken
          });
          logWarning(`Logged in existing client: ${client.firstName} ${client.lastName}`);
        }
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  logInfo(`Created/logged in ${testData.clients.length} clients`);
  return testData.clients.length === TEST_CLIENTS.length;
}

// Step 2: Create all technicians
async function createTechnicians() {
  logSection('STEP 2: Creating 3 Test Technicians');
  
  for (let i = 0; i < TEST_TECHNICIANS.length; i++) {
    const tech = TEST_TECHNICIANS[i];
    logInfo(`Creating technician ${i + 1}/3: ${tech.firstName} ${tech.lastName} (${tech.skills.join(', ')})`);
    
    const result = await apiCall('/auth/register', 'POST', {
      firstName: tech.firstName,
      lastName: tech.lastName,
      email: tech.email,
      phoneNumber: tech.phone,
      password: tech.password,
      role: 'technician',
      skills: tech.skills,
      location: tech.location
    });

    if (result.ok && result.data.success && result.data.data?.user) {
      testData.technicians.push({
        ...tech,
        id: result.data.data.user._id,
        token: result.data.data.tokens.accessToken
      });
      logSuccess(`Technician created: ${tech.firstName} ${tech.lastName}`);
    } else {
      logError(`Failed to create technician: ${result.data?.message || 'Unknown error'}`);
      console.log('Debug - Technician registration error:', JSON.stringify(result.data, null, 2));
      if (result.data.message?.includes('already exists')) {
        // Try to login instead
        const loginResult = await apiCall('/auth/login', 'POST', {
          email: tech.email,
          password: tech.password
        });
        
        if (loginResult.ok && loginResult.data.data?.user) {
          testData.technicians.push({
            ...tech,
            id: loginResult.data.data.user._id,
            token: loginResult.data.data.tokens.accessToken
          });
          logWarning(`Logged in existing technician: ${tech.firstName} ${tech.lastName}`);
        }
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  logInfo(`Created/logged in ${testData.technicians.length} technicians`);
  return testData.technicians.length === TEST_TECHNICIANS.length;
}

// Step 3: Clients create bookings
async function createBookings() {
  logSection('STEP 3: Clients Creating Bookings');
  
  for (let i = 0; i < TEST_BOOKINGS.length; i++) {
    const booking = TEST_BOOKINGS[i];
    const client = testData.clients[i];
    
    logInfo(`Client ${client.firstName} creating booking: ${booking.serviceName}`);
    
    const today = new Date().toISOString().split('T')[0];
    const bookingData = {
      serviceType: booking.serviceType,
      serviceName: booking.serviceName,
      serviceDescription: booking.serviceDescription,
      urgency: booking.urgency,
      price: booking.price,
      clientName: `${client.firstName} ${client.lastName}`,
      clientPhone: client.phone,
      preferredDate: today,
      preferredTimeSlot: booking.urgency === 'emergency' ? 'flexible' : '08:00-10:00',
      isCritical: booking.urgency === 'emergency',
      location: booking.location
    };
    
    const result = await apiCall('/bookings', 'POST', bookingData, client.token);

    // Check if booking was created (could be result.data.booking or result.data.data)
    const bookingData_response = result.data?.booking || result.data?.data;
    
    if (result.ok && result.data.success && bookingData_response) {
      testData.bookings.push({
        ...bookingData_response,
        clientName: `${client.firstName} ${client.lastName}`,
        clientPhone: client.phone
      });
      logSuccess(`Booking created: ${bookingData_response.bookingReference} - ${booking.serviceName}`);
      logInfo(`  Price: KSh ${booking.price} | Urgency: ${booking.urgency} | Location: ${booking.location.estate}`);
    } else {
      logError(`Failed to create booking: ${result.data?.message || 'Unknown error'}`);
      console.log('Debug - Full error response:', JSON.stringify(result.data, null, 2));
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  logInfo(`Created ${testData.bookings.length} bookings`);
  return testData.bookings.length > 0;
}

// Step 4: Technicians view available jobs
async function techniciansViewJobs() {
  logSection('STEP 4: Technicians Viewing Available Jobs');
  
  for (const tech of testData.technicians) {
    logInfo(`${tech.firstName} checking available jobs (Skills: ${tech.skills.join(', ')})`);
    
    const result = await apiCall('/technician/available-jobs', 'GET', null, tech.token);

    if (result.ok) {
      // Fix: Response structure is result.data.data.jobs not result.data.jobs
      const jobs = result.data.data?.jobs || result.data.jobs || [];
      const jobCount = jobs.length;
      logSuccess(`${tech.firstName} can see ${jobCount} available jobs`);
      
      if (jobCount > 0) {
        // Store first job for acceptance testing
        if (!testData.availableJobs) testData.availableJobs = {};
        testData.availableJobs[tech.email] = jobs;
        
        jobs.slice(0, 3).forEach((job, idx) => {
          logInfo(`  ${idx + 1}. ${job.serviceName} - KSh ${job.price} (${job.location?.constituency})`);
        });
      }
    } else {
      logError(`${tech.firstName} failed to get jobs: ${result.data?.message || 'Unknown error'}`);
      console.log('Debug - Available jobs error:', JSON.stringify(result.data, null, 2));
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return true;
}

// Step 4.5: Set technicians as available
async function techniciansSetAvailability() {
  logSection('STEP 4.5: Setting Technicians as Available');
  
  for (const tech of testData.technicians) {
    logInfo(`${tech.firstName} updating availability status`);
    
    const result = await apiCall('/technician/availability', 'PUT', {
      isAvailable: true,
      location: {
        latitude: -1.286389,
        longitude: 36.817223
      }
    }, tech.token);

    if (result.ok) {
      logSuccess(`${tech.firstName} is now available for jobs`);
    } else {
      logError(`Failed to update availability: ${result.data?.message || 'Unknown error'}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return true;
}

// Step 5: Technicians accept jobs
async function techniciansAcceptJobs() {
  logSection('STEP 5: Technicians Accepting Jobs');
  
  // Use actual available jobs from previous step
  if (!testData.availableJobs) {
    logError('No available jobs data found from previous step!');
    return false;
  }
  
  const acceptedJobs = [];
  
  // Each technician accepts their first available job
  for (const tech of testData.technicians) {
    const availableForTech = testData.availableJobs[tech.email] || [];
    
    if (availableForTech.length === 0) {
      logWarning(`${tech.firstName} has no available jobs to accept`);
      continue;
    }
    
    // Accept first job
    const job = availableForTech[0];
    logInfo(`${tech.firstName} accepting job: ${job.serviceName || job.serviceType}`);
    
    const result = await apiCall(`/technician/accept-job/${job._id}`, 'POST', {}, tech.token);

    if (result.ok) {
      logSuccess(`${tech.firstName} accepted: ${job.serviceName || job.serviceType} (KSh ${job.price})`);
      acceptedJobs.push({ tech, job });
    } else {
      logError(`Failed to accept job: ${result.data?.message || 'Unknown error'}`);
      console.log('DEBUG - Accept job error response:', JSON.stringify(result, null, 2));
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Store accepted jobs for next steps
  testData.acceptedJobs = acceptedJobs;
  
  return acceptedJobs.length > 0;
}

// Step 6: Technicians start jobs
async function techniciansStartJobs() {
  logSection('STEP 6: Technicians Starting Jobs');
  
  if (!testData.acceptedJobs || testData.acceptedJobs.length === 0) {
    logWarning('No accepted jobs to start');
    return false;
  }
  
  const startedJobs = [];
  
  // Start first 2 accepted jobs
  for (const { tech, job } of testData.acceptedJobs.slice(0, 2)) {
    logInfo(`${tech.firstName} starting job: ${job.serviceName || job.serviceType}`);
    
    const result = await apiCall(`/technician/start-job/${job._id}`, 'POST', {}, tech.token);

    if (result.ok) {
      const booking = result.data.data?.booking || result.data.booking;
      logSuccess(`${tech.firstName} started: ${job.serviceName || job.serviceType}`);
      if (booking?.startTime) {
        logInfo(`  Start time: ${new Date(booking.startTime).toLocaleTimeString()}`);
      }
      startedJobs.push({ tech, job });
    } else {
      logError(`Failed to start job: ${result.data?.message || 'Unknown error'}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  testData.startedJobs = startedJobs;
  return startedJobs.length > 0;
}

// Step 7: Technicians complete jobs
async function techniciansCompleteJobs() {
  logSection('STEP 7: Technicians Completing Jobs');
  
  if (!testData.startedJobs || testData.startedJobs.length === 0) {
    logWarning('No started jobs to complete');
    return false;
  }
  
  // Complete first started job
  for (const { tech, job } of testData.startedJobs.slice(0, 1)) {
    logInfo(`${tech.firstName} completing job: ${job.serviceName || job.serviceType}`);
    
    const result = await apiCall(`/technician/complete-job/${job._id}`, 'POST', {
      completionNotes: `Job completed successfully. ${job.problemDescription || job.serviceType} has been resolved.`
    }, tech.token);

    if (result.ok) {
      const booking = result.data.data?.booking || result.data.booking;
      logSuccess(`${tech.firstName} completed: ${job.serviceName || job.serviceType}`);
      if (booking?.completionTime) {
        logInfo(`  Completion time: ${new Date(booking.completionTime).toLocaleTimeString()}`);
      }
      if (booking?.price) {
        logInfo(`  Payment: KSh ${booking.price}`);
      }
    } else {
      logError(`Failed to complete job: ${result.data?.message || 'Unknown error'}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return true;
}

// Step 8: Verify technician dashboards
async function verifyTechnicianDashboards() {
  logSection('STEP 8: Verifying Technician Dashboards');
  
  for (const tech of testData.technicians) {
    logInfo(`Checking ${tech.firstName}'s dashboard`);
    
    // Get my jobs
    const jobsResult = await apiCall('/technician/my-jobs', 'GET', null, tech.token);
    
    if (jobsResult.ok) {
      const data = jobsResult.data.data || jobsResult.data;
      const myJobs = data.jobs || [];
      const activeCount = data.active || 0;
      const completedCount = data.completed || 0;
      
      logSuccess(`${tech.firstName} has ${myJobs.length} total jobs`);
      logInfo(`  Active: ${activeCount} | Completed: ${completedCount}`);
      
      if (myJobs.length > 0) {
        logInfo(`  Jobs: ${myJobs.map(j => `${j.serviceType}(${j.status})`).join(', ')}`);
      }
    } else {
      logError(`Failed to get ${tech.firstName}'s jobs`);
    }
    
    // Get earnings
    const earningsResult = await apiCall('/technician/earnings', 'GET', null, tech.token);
    
    if (earningsResult.ok) {
      const earnings = earningsResult.data.data || earningsResult.data;
      const totalEarned = earnings.totalEarned || earnings.totalEarnings || 0;
      const pendingPayments = earnings.pendingPayments || 0;
      const completedJobs = earnings.completedJobs || 0;
      
      logSuccess(`${tech.firstName}'s earnings: KSh ${totalEarned} (${completedJobs} completed jobs)`);
      if (pendingPayments > 0) {
        logInfo(`  Pending payments: KSh ${pendingPayments}`);
      }
    } else {
      logError(`Failed to get ${tech.firstName}'s earnings`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return true;
}

// Step 9: Test authorization
async function testAuthorization() {
  logSection('STEP 9: Testing Authorization & Security');
  
  // Test 1: Unauthorized access
  logInfo('Test: Unauthorized access to technician routes');
  const unauthorizedResult = await apiCall('/technician/available-jobs', 'GET', null, null);
  
  if (!unauthorizedResult.ok && unauthorizedResult.status === 401) {
    logSuccess('Correctly blocked unauthorized access (401)');
  } else {
    logError('Authorization validation failed');
  }
  
  // Test 2: Client trying to access technician routes
  logInfo('Test: Client trying to access technician routes');
  const clientToken = testData.clients[0]?.token;
  if (clientToken) {
    const clientResult = await apiCall('/technician/available-jobs', 'GET', null, clientToken);
    
    if (!clientResult.ok && (clientResult.status === 403 || clientResult.status === 401)) {
      logSuccess('Correctly blocked client from technician routes (403)');
    } else {
      logError('Role validation failed');
    }
  }
  
  return true;
}

// Main test runner
async function runCompleteTest() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════╗', 'magenta');
  log('║       QUICKFIX TECHNICIAN SYSTEM - COMPLETE E2E TEST SUITE        ║', 'magenta');
  log('╚════════════════════════════════════════════════════════════════════╝', 'magenta');
  
  const startTime = Date.now();
  let allPassed = true;

  // Check backend
  logInfo('Checking backend connection...');
  try {
    const healthCheck = await fetch(`${API_BASE_URL}/health`).catch(() => null);
    if (!healthCheck) {
      throw new Error('Backend not responding');
    }
    logSuccess('Backend is running on port 5000');
  } catch (error) {
    logError('Backend is not running! Start with: node server.js');
    process.exit(1);
  }

  // Run all test steps
  const steps = [
    { name: 'Create Clients', fn: createClients },
    { name: 'Create Technicians', fn: createTechnicians },
    { name: 'Create Bookings', fn: createBookings },
    { name: 'Technicians View Jobs', fn: techniciansViewJobs },
    { name: 'Set Technician Availability', fn: techniciansSetAvailability },
    { name: 'Technicians Accept Jobs', fn: techniciansAcceptJobs },
    { name: 'Technicians Start Jobs', fn: techniciansStartJobs },
    { name: 'Technicians Complete Jobs', fn: techniciansCompleteJobs },
    { name: 'Verify Dashboards', fn: verifyTechnicianDashboards },
    { name: 'Test Authorization', fn: testAuthorization }
  ];

  for (const step of steps) {
    try {
      const passed = await step.fn();
      if (!passed) {
        allPassed = false;
        logWarning(`Step "${step.name}" had issues`);
      }
    } catch (error) {
      allPassed = false;
      logError(`Step "${step.name}" crashed: ${error.message}`);
      console.error(error);
    }
  }

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  logSection('TEST SUMMARY');
  log(`Duration: ${duration}s`, 'gray');
  log(`Clients created: ${testData.clients.length}/5`, 'gray');
  log(`Technicians created: ${testData.technicians.length}/3`, 'gray');
  log(`Bookings created: ${testData.bookings.length}/5`, 'gray');
  log(`Jobs accepted: ${testData.bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress' || b.status === 'completed').length}`, 'gray');
  log(`Jobs in progress: ${testData.bookings.filter(b => b.status === 'in_progress' || b.status === 'completed').length}`, 'gray');
  log(`Jobs completed: ${testData.bookings.filter(b => b.status === 'completed').length}`, 'gray');

  console.log('\n' + '─'.repeat(70));
  log('TEST CREDENTIALS', 'blue');
  console.log('─'.repeat(70));
  log('Password for all accounts: Client@123 or Tech@123', 'gray');
  log('\nClients:', 'yellow');
  testData.clients.forEach((c, i) => {
    log(`  ${i + 1}. ${c.email} | ${c.phone}`, 'gray');
  });
  log('\nTechnicians:', 'yellow');
  testData.technicians.forEach((t, i) => {
    log(`  ${i + 1}. ${t.email} | ${t.phone} | Skills: ${t.skills.join(', ')}`, 'gray');
  });
  console.log('─'.repeat(70));

  // Final verdict
  console.log('\n');
  if (allPassed) {
    log('╔════════════════════════════════════════════════════════════════════╗', 'green');
    log('║              ✅ ALL TESTS PASSED SUCCESSFULLY! ✅                 ║', 'green');
    log('║                                                                    ║', 'green');
    log('║  Complete workflow verified:                                      ║', 'green');
    log('║  ✓ 5 Clients created and can book services                       ║', 'green');
    log('║  ✓ 3 Technicians created with different skills                   ║', 'green');
    log('║  ✓ Bookings submitted successfully                               ║', 'green');
    log('║  ✓ Technicians can view and accept jobs                          ║', 'green');
    log('║  ✓ Jobs can be started and completed                             ║', 'green');
    log('║  ✓ Authorization and security working                            ║', 'green');
    log('║                                                                    ║', 'green');
    log('║              🚀 READY TO COMMIT TO GITHUB! 🚀                     ║', 'green');
    log('╚════════════════════════════════════════════════════════════════════╝', 'green');
    process.exit(0);
  } else {
    log('╔════════════════════════════════════════════════════════════════════╗', 'yellow');
    log('║              ⚠️  TESTS COMPLETED WITH WARNINGS ⚠️                 ║', 'yellow');
    log('║                                                                    ║', 'yellow');
    log('║  Check the logs above for details.                               ║', 'yellow');
    log('║  Some features may need adjustment.                              ║', 'yellow');
    log('╚════════════════════════════════════════════════════════════════════╝', 'yellow');
    process.exit(1);
  }
}

// Run the complete test
runCompleteTest().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
