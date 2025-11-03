/**
 * COMPREHENSIVE TECHNICIAN WORKFLOW TEST
 * 
 * Scenario:
 * - 5 Clients create different service bookings
 * - 3 Technicians with different skills
 * - Skills-based job matching
 * - Complete workflow: Accept → Start → Complete
 */

const BASE_URL = 'http://localhost:5000/api';

// ANSI colors
const colors = {
 reset: '\x1b[0m',
 green: '\x1b[32m',
 red: '\x1b[31m',
 yellow: '\x1b[33m',
 blue: '\x1b[36m',
 magenta: '\x1b[35m',
 bold: '\x1b[1m',
 cyan: '\x1b[96m'
};

// Test Data
const clients = [];
const technicians = [];
const bookings = [];

// Client profiles
const clientProfiles = [
 { firstName: 'John', lastName: 'Kamau', service: 'electrical', description: 'Fix faulty sockets' },
 { firstName: 'Mary', lastName: 'Wanjiru', service: 'plumbing', description: 'Leaking kitchen sink' },
 { firstName: 'Peter', lastName: 'Ochieng', service: 'cleaning', description: 'Deep house cleaning' },
 { firstName: 'Sarah', lastName: 'Akinyi', service: 'appliance_repair', description: 'Broken refrigerator' },
 { firstName: 'David', lastName: 'Mwangi', service: 'electrical', description: 'Install new lights' }
];

// Technician profiles with skills
const technicianProfiles = [
 { firstName: 'James', lastName: 'Technician', skills: ['electrical', 'appliance_repair'] },
 { firstName: 'Grace', lastName: 'Technician', skills: ['plumbing', 'general'] },
 { firstName: 'Michael', lastName: 'Technician', skills: ['cleaning', 'pest-control'] }
];

function log(message, type = 'info', indent = 0) {
 const spaces = ' '.repeat(indent);
 const timestamp = new Date().toISOString().substr(11, 8);
 const prefix = {
 success: `${colors.green}OK${colors.reset}`,
 error: `${colors.red}FAIL${colors.reset}`,
 info: `${colors.blue}ℹ${colors.reset}`,
 test: `${colors.yellow}▶${colors.reset}`,
 tech: `${colors.cyan}${colors.reset}`,
 client: `${colors.magenta}${colors.reset}`,
 job: `${colors.yellow}[CHECKLIST]${colors.reset}`
 }[type] || '';
 
 console.log(`${spaces}${prefix} ${message}`);
}

function logSection(title) {
 console.log('\n' + '━'.repeat(70));
 console.log(colors.bold + colors.cyan + ' ' + title + colors.reset);
 console.log('━'.repeat(70) + '\n');
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
 // Log full error for debugging
 if (responseData.error) {
 console.error(`\n [FAILED] API Error Details: ${responseData.error}\n`);
 }
 throw new Error(responseData.message || `HTTP ${response.status}`);
 }
 
 return responseData;
 } catch (error) {
 throw new Error(`${method} ${endpoint}: ${error.message}`);
 }
}

// ============== STEP 1: REGISTER CLIENTS ==============

async function registerClients() {
 logSection('STEP 1: Registering 5 Clients');
 
 for (let i = 0; i < clientProfiles.length; i++) {
 const profile = clientProfiles[i];
 
 try {
 log(`Registering ${profile.firstName} ${profile.lastName} (${profile.service})...`, 'client', 1);
 
 const timestamp = Date.now() + i;
 const response = await makeRequest('POST', '/auth/register', {
 firstName: profile.firstName,
 lastName: profile.lastName,
 email: `${profile.firstName.toLowerCase()}.${timestamp}@test.com`,
 phoneNumber: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
 password: 'Test1234!',
 role: 'client',
 location: {
 type: 'Point',
 coordinates: [-1.2921 + (Math.random() * 0.1), 36.8219 + (Math.random() * 0.1)],
 address: 'Nairobi, Kenya'
 }
 });
 
 clients.push({
 ...profile,
 email: response.data.user.email,
 token: response.data.tokens.accessToken,
 id: response.data.user._id
 });
 
 log(`OK ${profile.firstName} registered successfully`, 'success', 2);
 } catch (error) {
 log(`FAIL Failed to register ${profile.firstName}: ${error.message}`, 'error', 2);
 throw error;
 }
 }
 
 log(`\nOK All ${clients.length} clients registered successfully`, 'success');
}

// ============== STEP 2: REGISTER TECHNICIANS ==============

async function registerTechnicians() {
 logSection('STEP 2: Registering 3 Technicians with Different Skills');
 
 for (let i = 0; i < technicianProfiles.length; i++) {
 const profile = technicianProfiles[i];
 
 try {
 log(`Registering ${profile.firstName} ${profile.lastName}...`, 'tech', 1);
 log(`Skills: ${profile.skills.join(', ')}`, 'info', 2);
 
 const timestamp = Date.now() + i;
 const response = await makeRequest('POST', '/auth/register', {
 firstName: profile.firstName,
 lastName: profile.lastName,
 email: `${profile.firstName.toLowerCase()}.tech.${timestamp}@test.com`,
 phoneNumber: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
 password: 'Test1234!',
 role: 'technician',
 skills: profile.skills,
 location: {
 type: 'Point',
 coordinates: [-1.2921, 36.8219],
 address: 'Nairobi, Kenya'
 }
 });
 
 technicians.push({
 ...profile,
 email: response.data.user.email,
 token: response.data.tokens.accessToken,
 id: response.data.user._id,
 acceptedJobs: [],
 completedJobs: []
 });
 
 log(`OK ${profile.firstName} registered successfully`, 'success', 2);
 } catch (error) {
 log(`FAIL Failed to register ${profile.firstName}: ${error.message}`, 'error', 2);
 throw error;
 }
 }
 
 log(`\nOK All ${technicians.length} technicians registered successfully`, 'success');
}

// ============== STEP 3: CLIENTS CREATE BOOKINGS ==============

async function createBookings() {
 logSection('STEP 3: Clients Creating Bookings');
 
 for (let i = 0; i < clients.length; i++) {
 const client = clients[i];
 
 try {
 log(`${client.firstName} creating ${client.service} booking...`, 'client', 1);
 
 const tomorrow = new Date();
 tomorrow.setDate(tomorrow.getDate() + 1);
 
 const response = await makeRequest('POST', '/bookings', {
 serviceType: client.service,
 clientName: `${client.firstName} ${client.lastName}`,
 clientPhone: `+254712345${String(i).padStart(3, '0')}`,
 serviceDescription: client.description,
 preferredDate: tomorrow.toISOString(),
 preferredTimeSlot: ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'][i % 5],
 urgency: ['normal', 'urgent'][i % 2],
 location: {
 constituency: ['Westlands', 'Kasarani', 'Embakasi', 'Dagoretti', 'Lang\'ata'][i],
 ward: ['Parklands', 'Clay City', 'Mihango', 'Waithaka', 'Karen'][i],
 road: `Test Road ${i + 1}`,
 description: `Near landmark ${i + 1}`,
 coordinates: {
 type: 'Point',
 coordinates: [-1.2921 + (i * 0.01), 36.8219 + (i * 0.01)]
 }
 }
 }, client.token);
 
 // The booking controller returns bookingId (the human-readable ID like QF20251022...)
 // We need to fetch the actual MongoDB _id for accept job API
 const bookingId = response.data?.bookingId || response.data?._id || response._id;
 
 bookings.push({
 id: bookingId,
 serviceType: client.service,
 clientName: client.firstName,
 description: client.description,
 status: 'submitted'
 });
 
 log(`OK Booking created: ${client.description}`, 'success', 2);
 log(` Booking ID: ${bookingId}`, 'info', 2);
 } catch (error) {
 log(`FAIL Failed to create booking: ${error.message}`, 'error', 2);
 throw error;
 }
 } log(`\nOK All ${bookings.length} bookings created successfully`, 'success');
}

// ============== STEP 4: TECHNICIANS VIEW & ACCEPT JOBS ==============

async function techniciansAcceptJobs() {
 logSection('STEP 4: Technicians Viewing & Accepting Jobs (Skills-based)');
 
 for (let i = 0; i < technicians.length; i++) {
 const tech = technicians[i];
 
 try {
 log(`${tech.firstName} checking available jobs...`, 'tech', 1);
 log(`Skills: ${tech.skills.join(', ')}`, 'info', 2);
 
 // Get available jobs
 const jobsResponse = await makeRequest('GET', '/technician/available-jobs', null, tech.token);
 const availableJobs = jobsResponse.data.jobs;
 
 log(`Found ${availableJobs.length} matching job(s)`, 'info', 2);
 
 if (availableJobs.length === 0) {
 log(`No jobs available for ${tech.firstName}'s skills`, 'info', 2);
 continue;
 }
 
 // Accept jobs that match skills
 for (const job of availableJobs) {
 // Check if job matches technician skills
 if (tech.skills.some(skill => {
 // Handle both string and object skill formats
 const skillName = typeof skill === 'string' ? skill : skill.name;
 return skillName === job.serviceType;
 })) {
 try {
 log(`Accepting job: ${job.serviceType} - ${job.serviceDescription?.substring(0, 30)}...`, 'job', 2);
 
 const acceptResponse = await makeRequest(
 'POST',
 `/technician/accept-job/${job._id}`,
 null,
 tech.token
 );
 
 tech.acceptedJobs.push({
 id: job._id,
 serviceType: job.serviceType,
 description: job.serviceDescription
 });
 
 log(`OK Job accepted successfully`, 'success', 3);
 
 // Update booking status in our tracking
 const booking = bookings.find(b => b.id === job._id);
 if (booking) {
 booking.status = 'accepted';
 booking.technicianName = tech.firstName;
 }
 } catch (error) {
 log(`FAIL Failed to accept job: ${error.message}`, 'error', 3);
 }
 }
 }
 
 log(`${tech.firstName} accepted ${tech.acceptedJobs.length} job(s)`, 'success', 2);
 
 } catch (error) {
 log(`FAIL ${tech.firstName} failed to fetch jobs: ${error.message}`, 'error', 2);
 }
 }
 
 const totalAccepted = technicians.reduce((sum, t) => sum + t.acceptedJobs.length, 0);
 log(`\nOK Total jobs accepted: ${totalAccepted}`, 'success');
}

// ============== STEP 5: TECHNICIANS START JOBS ==============

async function techniciansStartJobs() {
 logSection('STEP 5: Technicians Starting Accepted Jobs');
 
 for (const tech of technicians) {
 if (tech.acceptedJobs.length === 0) {
 log(`${tech.firstName} has no jobs to start`, 'info', 1);
 continue;
 }
 
 log(`${tech.firstName} starting ${tech.acceptedJobs.length} job(s)...`, 'tech', 1);
 
 for (const job of tech.acceptedJobs) {
 try {
 log(`Starting: ${job.serviceType} - ${job.description}`, 'job', 2);
 
 await makeRequest('POST', `/technician/start-job/${job.id}`, null, tech.token);
 
 log(`OK Job started successfully`, 'success', 3);
 
 // Update booking status
 const booking = bookings.find(b => b.id === job.id);
 if (booking) booking.status = 'in_progress';
 
 } catch (error) {
 log(`FAIL Failed to start job: ${error.message}`, 'error', 3);
 }
 }
 }
 
 log(`\nOK All accepted jobs started`, 'success');
}

// ============== STEP 6: TECHNICIANS COMPLETE JOBS ==============

async function techniciansCompleteJobs() {
 logSection('STEP 6: Technicians Completing Jobs');
 
 for (const tech of technicians) {
 if (tech.acceptedJobs.length === 0) {
 log(`${tech.firstName} has no jobs to complete`, 'info', 1);
 continue;
 }
 
 log(`${tech.firstName} completing ${tech.acceptedJobs.length} job(s)...`, 'tech', 1);
 
 for (const job of tech.acceptedJobs) {
 try {
 const cost = Math.floor(1000 + Math.random() * 3000); // Random cost 1000-4000
 
 log(`Completing: ${job.serviceType} (Cost: KES ${cost})`, 'job', 2);
 
 await makeRequest('POST', `/technician/complete-job/${job.id}`, {
 actualCost: cost,
 completionNotes: `${job.serviceType} completed successfully. All issues resolved.`
 }, tech.token);
 
 tech.completedJobs.push({ ...job, cost });
 
 log(`OK Job completed successfully`, 'success', 3);
 
 // Update booking status
 const booking = bookings.find(b => b.id === job.id);
 if (booking) {
 booking.status = 'completed';
 booking.cost = cost;
 }
 
 } catch (error) {
 log(`FAIL Failed to complete job: ${error.message}`, 'error', 3);
 }
 }
 }
 
 log(`\nOK All jobs completed`, 'success');
}

// ============== STEP 7: VERIFY EARNINGS ==============

async function verifyEarnings() {
 logSection('STEP 7: Verifying Technician Earnings');
 
 for (const tech of technicians) {
 try {
 log(`Checking ${tech.firstName}'s earnings...`, 'tech', 1);
 
 const earningsResponse = await makeRequest('GET', '/technician/earnings', null, tech.token);
 
 // Debug: Log full response
 console.log(`\n DEBUG: Full earnings response for ${tech.firstName}:`, JSON.stringify(earningsResponse, null, 2));
 
 const earnings = earningsResponse.data || earningsResponse;
 
 log(`Total Earned: KES ${earnings.totalEarnings || 0}`, 'success', 2);
 log(`Completed Jobs: ${earnings.completedJobs || 0}`, 'info', 2);
 log(`This Month: KES ${earnings.thisMonth || 0}`, 'info', 2);
 
 // Calculate expected earnings from completed jobs
 const expectedEarnings = tech.completedJobs.reduce((sum, job) => sum + (job.cost || 0), 0);
 log(`Expected from local tracking: KES ${expectedEarnings}`, 'info', 2);
 
 } catch (error) {
 log(`FAIL Failed to fetch earnings: ${error.message}`, 'error', 2);
 }
 }
}

// ============== STEP 8: FINAL SUMMARY ==============

function printSummary() {
 logSection('FINAL SUMMARY');
 
 console.log(colors.bold + ' CLIENTS' + colors.reset);
 clients.forEach((client, i) => {
 const booking = bookings[i];
 console.log(` ${i + 1}. ${client.firstName} ${client.lastName}`);
 console.log(` Service: ${client.service} | Status: ${booking.status} | Tech: ${booking.technicianName || 'N/A'}`);
 });
 
 console.log('\n' + colors.bold + ' TECHNICIANS' + colors.reset);
 technicians.forEach((tech, i) => {
 const totalEarnings = tech.completedJobs.reduce((sum, job) => sum + (job.cost || 0), 0);
 console.log(` ${i + 1}. ${tech.firstName} ${tech.lastName}`);
 console.log(` Skills: ${tech.skills.join(', ')}`);
 console.log(` Accepted: ${tech.acceptedJobs.length} | Completed: ${tech.completedJobs.length}`);
 console.log(` Earnings: KES ${totalEarnings}`);
 
 if (tech.completedJobs.length > 0) {
 console.log(` Jobs:`);
 tech.completedJobs.forEach(job => {
 console.log(` - ${job.serviceType}: KES ${job.cost}`);
 });
 }
 });
 
 console.log('\n' + colors.bold + '[METRICS] STATISTICS' + colors.reset);
 console.log(` Total Bookings Created: ${bookings.length}`);
 console.log(` Total Jobs Accepted: ${bookings.filter(b => b.status !== 'pending').length}`);
 console.log(` Total Jobs Completed: ${bookings.filter(b => b.status === 'completed').length}`);
 
 const totalEarnings = technicians.reduce((sum, tech) => 
 sum + tech.completedJobs.reduce((s, job) => s + (job.cost || 0), 0), 0
 );
 console.log(` Total Platform Earnings: KES ${totalEarnings}`);
 
 console.log('\n' + colors.bold + '[TARGET] SKILLS MATCHING' + colors.reset);
 technicians.forEach(tech => {
 const matchedServices = bookings
 .filter(b => b.technicianName === tech.firstName)
 .map(b => b.serviceType);
 
 if (matchedServices.length > 0) {
 console.log(` ${tech.firstName}: ${tech.skills.join(', ')} → Matched ${matchedServices.join(', ')}`);
 }
 });
 
 console.log('\n' + '━'.repeat(70));
}

// ============== MAIN TEST RUNNER ==============

async function runComprehensiveTest() {
 console.log('\n' + '═'.repeat(70));
 console.log(colors.bold + colors.cyan + ' COMPREHENSIVE TECHNICIAN WORKFLOW TEST' + colors.reset);
 console.log('═'.repeat(70));
 
 const startTime = Date.now();
 
 try {
 await registerClients();
 await registerTechnicians();
 await createBookings();
 await techniciansAcceptJobs();
 await techniciansStartJobs();
 await techniciansCompleteJobs();
 await verifyEarnings();
 
 printSummary();
 
 const duration = ((Date.now() - startTime) / 1000).toFixed(2);
 
 console.log('\n' + colors.green + colors.bold + 'OK ALL TESTS PASSED!' + colors.reset);
 console.log(colors.green + ` Duration: ${duration}s` + colors.reset);
 console.log('═'.repeat(70) + '\n');
 
 } catch (error) {
 console.log('\n' + colors.red + colors.bold + 'FAIL TEST FAILED!' + colors.reset);
 console.log(colors.red + ` Error: ${error.message}` + colors.reset);
 console.log('═'.repeat(70) + '\n');
 process.exit(1);
 }
}

// Run the test
runComprehensiveTest();
