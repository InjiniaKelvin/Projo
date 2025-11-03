/**
 * FINAL TECHNICIAN DASHBOARD TEST
 * Tests all connected features after 10% completion
 */

const BASE_URL = 'http://localhost:5000/api';
let technicianToken = '';
let clientToken = '';
let testJobId = '';

// ANSI color codes for output
const colors = {
 reset: '\x1b[0m',
 green: '\x1b[32m',
 red: '\x1b[31m',
 yellow: '\x1b[33m',
 blue: '\x1b[36m',
 bold: '\x1b[1m'
};

function log(message, type = 'info') {
 const timestamp = new Date().toISOString();
 const prefix = {
 success: `${colors.green}OK${colors.reset}`,
 error: `${colors.red}FAIL${colors.reset}`,
 info: `${colors.blue}ℹ${colors.reset}`,
 test: `${colors.yellow}→${colors.reset}`
 }[type] || '';
 
 console.log(`${prefix} ${message}`);
}

async function makeRequest(method, endpoint, data = null, token = null) {
 const url = `${BASE_URL}${endpoint}`;
 const options = {
 method,
 headers: {
 'Content-Type': 'application/json'
 }
 };

 if (token) {
 options.headers['Authorization'] = `Bearer ${token}`;
 }

 if (data) {
 options.body = JSON.stringify(data);
 }

 try {
 const response = await fetch(url, options);
 const responseData = await response.json();
 
 if (!response.ok) {
 throw new Error(responseData.message || `HTTP ${response.status}`);
 }
 
 return responseData;
 } catch (error) {
 throw new Error(`${method} ${endpoint}: ${error.message}`);
 }
}

// ============== SETUP ==============

async function setupTestUsers() {
 log('\n[CHECKLIST] Setting up test users...', 'test');
 
 try {
 // Register client
 log('Creating test client...', 'info');
 const clientData = await makeRequest('POST', '/auth/register', {
 firstName: 'Test',
 lastName: 'Client',
 email: `client.final.${Date.now()}@test.com`,
 phoneNumber: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
 password: 'Test1234!',
 role: 'client',
 location: {
 type: 'Point',
 coordinates: [-1.2921, 36.8219],
 address: 'Nairobi CBD'
 }
 });
 clientToken = clientData.data.tokens.accessToken;
 log('Client created successfully', 'success');

 // Register technician
 log('Creating test technician...', 'info');
 const techData = await makeRequest('POST', '/auth/register', {
 firstName: 'Final',
 lastName: 'Technician',
 email: `tech.final.${Date.now()}@test.com`,
 phoneNumber: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
 password: 'Test1234!',
 role: 'technician',
 skills: ['electrical', 'plumbing'],
 location: {
 type: 'Point',
 coordinates: [-1.2921, 36.8219],
 address: 'Nairobi'
 }
 });
 technicianToken = techData.data.tokens.accessToken;
 log('Technician created successfully', 'success');

 return true;
 } catch (error) {
 log(`Setup failed: ${error.message}`, 'error');
 return false;
 }
}

// ============== TEST SCENARIOS ==============

async function testDashboardData() {
 log('\n[METRICS] Testing Dashboard Data...', 'test');
 
 try {
 // Test My Jobs endpoint
 log('Fetching my jobs...', 'info');
 const jobsData = await makeRequest('GET', '/technician/my-jobs', null, technicianToken);
 log(`Found ${jobsData.data.jobs.length} jobs`, 'success');
 
 // Test Earnings endpoint
 log('Fetching earnings data...', 'info');
 const earningsData = await makeRequest('GET', '/technician/earnings', null, technicianToken);
 log(`Total earnings: KES ${earningsData.data.totalEarnings}`, 'success');
 
 return true;
 } catch (error) {
 log(`Dashboard test failed: ${error.message}`, 'error');
 return false;
 }
}

async function testAvailabilityToggle() {
 log('\n Testing Availability Toggle...', 'test');
 
 try {
 // Set available
 log('Setting status to available...', 'info');
 await makeRequest('PUT', '/technician/availability', 
 { isAvailable: true }, 
 technicianToken
 );
 log('Status set to AVAILABLE', 'success');
 
 // Set unavailable
 log('Setting status to unavailable...', 'info');
 await makeRequest('PUT', '/technician/availability', 
 { isAvailable: false }, 
 technicianToken
 );
 log('Status set to UNAVAILABLE', 'success');
 
 // Set back to available for other tests
 await makeRequest('PUT', '/technician/availability', 
 { isAvailable: true }, 
 technicianToken
 );
 
 return true;
 } catch (error) {
 log(`Availability toggle failed: ${error.message}`, 'error');
 return false;
 }
}

async function testQuickAccept() {
 log('\n Testing Quick Accept Feature...', 'test');
 
 try {
 // First, create a job as client
 log('Creating test job as client...', 'info');
 const bookingData = await makeRequest('POST', '/bookings', {
 serviceType: 'electrical',
 clientName: 'Test Client',
 clientPhone: '+254712345678',
 serviceDescription: 'Quick accept test job',
 preferredDate: new Date(Date.now() + 86400000).toISOString(),
 preferredTimeSlot: 'morning',
 urgency: 'normal',
 location: {
 constituency: 'Westlands',
 ward: 'Parklands',
 road: 'Test Road',
 description: 'Near test building',
 coordinates: {
 type: 'Point',
 coordinates: [-1.2921, 36.8219]
 }
 }
 }, clientToken);
 testJobId = bookingData.data._id;
 log(`Test job created: ${testJobId}`, 'success');
 
 // Get available jobs
 log('Fetching available jobs...', 'info');
 const availableJobs = await makeRequest('GET', '/technician/available-jobs', null, technicianToken);
 
 if (availableJobs.data.jobs.length === 0) {
 log('No available jobs to quick accept', 'error');
 return false;
 }
 
 const firstJob = availableJobs.data.jobs[0];
 log(`Found job: ${firstJob.serviceType} (${firstJob._id})`, 'info');
 
 // Accept the job
 log('Quick accepting job...', 'info');
 await makeRequest('POST', `/technician/accept-job/${firstJob._id}`, null, technicianToken);
 log('Job accepted successfully!', 'success');
 
 return true;
 } catch (error) {
 log(`Quick accept failed: ${error.message}`, 'error');
 return false;
 }
}

async function testCompleteWorkflow() {
 log('\n Testing Complete Job Workflow...', 'test');
 
 try {
 // Get accepted job
 log('Fetching my jobs...', 'info');
 const myJobs = await makeRequest('GET', '/technician/my-jobs', null, technicianToken);
 const acceptedJob = myJobs.data.jobs.find(j => j.status === 'accepted');
 
 if (!acceptedJob) {
 log('No accepted job found for workflow test', 'error');
 return false;
 }
 
 log(`Testing with job: ${acceptedJob._id}`, 'info');
 
 // Start job
 log('Starting job...', 'info');
 await makeRequest('POST', `/technician/start-job/${acceptedJob._id}`, null, technicianToken);
 log('Job started', 'success');
 
 // Complete job
 log('Completing job...', 'info');
 await makeRequest('POST', `/technician/complete-job/${acceptedJob._id}`, {
 actualCost: 1500,
 completionNotes: 'Test completion'
 }, technicianToken);
 log('Job completed', 'success');
 
 return true;
 } catch (error) {
 log(`Workflow test failed: ${error.message}`, 'error');
 return false;
 }
}

async function testEarningsUpdate() {
 log('\n[PAYMENT] Testing Earnings Update...', 'test');
 
 try {
 log('Fetching updated earnings...', 'info');
 const earnings = await makeRequest('GET', '/technician/earnings', null, technicianToken);
 
 log(`Total Earned: KES ${earnings.data.totalEarnings}`, 'success');
 log(`Completed Jobs: ${earnings.data.completedJobs}`, 'success');
 log(`This Month: KES ${earnings.data.thisMonth}`, 'success');
 
 return true;
 } catch (error) {
 log(`Earnings test failed: ${error.message}`, 'error');
 return false;
 }
}

async function testWithdrawalRequest() {
 log('\n Testing Withdrawal Request...', 'test');
 
 try {
 log('Requesting withdrawal of KES 1000...', 'info');
 const result = await makeRequest('POST', '/technician/withdraw', {
 amount: 1000
 }, technicianToken);
 
 log(`Withdrawal request: ${result.message}`, 'success');
 
 return true;
 } catch (error) {
 log(`Withdrawal test failed: ${error.message}`, 'error');
 return false;
 }
}

// ============== MAIN TEST RUNNER ==============

async function runAllTests() {
 console.log('\n' + '='.repeat(60));
 console.log(colors.bold + colors.blue + ' TECHNICIAN DASHBOARD - FINAL VERIFICATION TEST' + colors.reset);
 console.log('='.repeat(60));
 
 const results = {
 passed: 0,
 failed: 0,
 total: 0
 };
 
 const tests = [
 { name: 'Setup', fn: setupTestUsers, critical: true },
 { name: 'Dashboard Data', fn: testDashboardData },
 { name: 'Availability Toggle', fn: testAvailabilityToggle },
 { name: 'Quick Accept', fn: testQuickAccept },
 { name: 'Complete Workflow', fn: testCompleteWorkflow },
 { name: 'Earnings Update', fn: testEarningsUpdate },
 { name: 'Withdrawal Request', fn: testWithdrawalRequest }
 ];
 
 for (const test of tests) {
 results.total++;
 const success = await test.fn();
 
 if (success) {
 results.passed++;
 } else {
 results.failed++;
 if (test.critical) {
 log('\n Critical test failed. Stopping execution.', 'error');
 break;
 }
 }
 }
 
 // Print summary
 console.log('\n' + '='.repeat(60));
 console.log(colors.bold + '[METRICS] TEST SUMMARY' + colors.reset);
 console.log('='.repeat(60));
 console.log(`Total Tests: ${results.total}`);
 console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
 console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
 console.log('='.repeat(60) + '\n');
 
 if (results.failed === 0) {
 log('[SUCCESS] ALL TESTS PASSED! Technician Dashboard is 100% functional!', 'success');
 } else {
 log(`[WARNING] ${results.failed} test(s) failed. Check logs above.`, 'error');
 }
}

// Run tests
runAllTests().catch(error => {
 log(`Fatal error: ${error.message}`, 'error');
 process.exit(1);
});
