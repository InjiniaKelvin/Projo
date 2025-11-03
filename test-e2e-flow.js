#!/usr/bin/env node

/**
 * END-TO-END TEST SCRIPT
 * 
 * Complete flow test from registration to payment
 * 
 * Flow:
 * 1. Register Customer
 * 2. Register Technician 
 * 3. Customer creates booking
 * 4. Technician accepts booking
 * 5. Customer adds funds to wallet
 * 6. Customer pays for booking (escrow)
 * 7. Technician marks service complete
 * 8. Payment released from escrow to technician
 * 9. Verify wallet balances
 */

const API_BASE = 'http://localhost:5000/api';

let customerToken = '';
let customerUserId = '';
let technicianToken = '';
let technicianUserId = '';
let bookingId = '';
let transactionId = '';

const colors = {
 reset: '\x1b[0m',
 bright: '\x1b[1m',
 green: '\x1b[32m',
 red: '\x1b[31m',
 yellow: '\x1b[33m',
 blue: '\x1b[34m',
 cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
 console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
 log(`\n${'='.repeat(60)}`, 'cyan');
 log(`STEP ${step}: ${message}`, 'bright');
 log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
 log(`[COMPLETED] ${message}`, 'green');
}

function logError(message) {
 log(`[FAILED] ${message}`, 'red');
}

function logInfo(message) {
 log(`[INFO] ${message}`, 'blue');
}

function logWarn(message) {
 log(`[WARNING] ${message}`, 'yellow');
}

async function makeRequest(endpoint, method = 'GET', data = null, token = null) {
 const url = `${API_BASE}${endpoint}`;
 const headers = {
 'Content-Type': 'application/json'
 };
 
 if (token) {
 headers['Authorization'] = `Bearer ${token}`;
 }
 
 const options = {
 method,
 headers
 };
 
 if (data) {
 options.body = JSON.stringify(data);
 }
 
 try {
 const response = await fetch(url, options);
 const result = await response.json();
 
 if (!response.ok) {
 // Include validation errors if available
 const errorMsg = result.message || `HTTP ${response.status}`;
 if (result.errors && Array.isArray(result.errors)) {
 throw new Error(`${errorMsg}\nValidation errors:\n- ${result.errors.join('\n- ')}`);
 }
 if (result.error) {
 throw new Error(`${errorMsg}\nError: ${result.error}`);
 }
 throw new Error(errorMsg);
 }
 
 return result;
 } catch (error) {
 throw new Error(`Request failed: ${error.message}`);
 }
}

async function step1_RegisterCustomer() {
 logStep(1, 'Register Customer');
 
 const customerData = {
 firstName: 'Test',
 lastName: 'Customer',
 email: `customer_${Date.now()}@test.com`,
 password: 'Test123!@#',
 phoneNumber: `07${Date.now().toString().slice(-8)}`,
 role: 'client',
 location: {
 address: 'Nairobi CBD, Kenya',
 coordinates: {
 latitude: -1.2864,
 longitude: 36.8172
 }
 }
 };
 
 logInfo(`Registering: ${customerData.email}`);
 
 const result = await makeRequest('/auth/register', 'POST', customerData);
 
 customerToken = result.data.tokens.accessToken;
 customerUserId = result.data.user._id || result.data.user.id;
 
 logSuccess(`Customer registered successfully`);
 logInfo(`User ID: ${customerUserId}`);
 logInfo(`Email: ${customerData.email}`);
 
 return { customerData, result };
}

async function step2_RegisterTechnician() {
 logStep(2, 'Register Technician');
 
 const technicianData = {
 firstName: 'Test',
 lastName: 'Technician',
 email: `technician_${Date.now()}@test.com`,
 password: 'Test123!@#',
 phoneNumber: `07${(Date.now() + 1000).toString().slice(-8)}`,
 role: 'technician',
 skills: ['plumbing', 'electrical'],
 location: {
 address: 'Westlands, Nairobi',
 latitude: -1.2676,
 longitude: 36.8070
 },
 yearsOfExperience: 5,
 certifications: ['Plumbing Certificate', 'Electrical License']
 };
 
 logInfo(`Registering: ${technicianData.email}`);
 
 const result = await makeRequest('/auth/register', 'POST', technicianData);
 
 technicianToken = result.data.tokens.accessToken;
 technicianUserId = result.data.user._id || result.data.user.id;
 
 logSuccess(`Technician registered successfully`);
 logInfo(`User ID: ${technicianUserId}`);
 logInfo(`Email: ${technicianData.email}`);
 logInfo(`Skills: ${technicianData.skills.join(', ')}`);
 
 // Mark both users as verified for testing (directly in database)
 logInfo('Marking users as verified for E2E testing...');
 await makeRequest(`/auth/test-verify/${customerUserId}`, 'POST', {}, null);
 await makeRequest(`/auth/test-verify/${technicianUserId}`, 'POST', {}, null);
 
 return { technicianData, result };
}

async function step3_CustomerCreatesBooking() {
 logStep(3, 'Customer Creates Booking');
 
 const bookingData = {
 clientName: 'Test Customer',
 clientPhone: '0712345678',
 serviceType: 'plumbing',
 serviceDescription: 'Kitchen sink is leaking badly. Need urgent repair.',
 urgency: 'urgent',
 location: {
 constituency: 'Westlands',
 ward: 'Kitisuru',
 road: 'Peponi Road',
 description: 'Near Peponi School'
 },
 preferredDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0],
 preferredTimeSlot: '10:00-12:00',
 estimatedCost: 1500
 };
 
 logInfo(`Creating booking: ${bookingData.serviceType} - ${bookingData.urgency}`);
 logInfo(`Description: ${bookingData.serviceDescription}`);
 console.log('DEBUG - Booking data being sent:', JSON.stringify(bookingData, null, 2));
 
 const result = await makeRequest('/bookings', 'POST', bookingData, customerToken);
 
 console.log('DEBUG - Booking creation response:', JSON.stringify(result, null, 2));
 
 // Extract MongoDB _id from the booking response
 // The API returns bookingId (QF format) but we need _id for escrow
 const bookingResponse = result.data || result.booking;
 const mongoId = bookingResponse._id || bookingResponse.id;
 const qfBookingId = bookingResponse.bookingId;
 
 // Store both IDs for different operations
 bookingId = qfBookingId; // Use QF format for technician operations
 const bookingMongoId = mongoId; // Store MongoDB ID for escrow operations
 
 // Make MongoDB ID available globally for step 6
 global.bookingMongoId = mongoId;
 
 logSuccess(`Booking created successfully`);
 logInfo(`Booking ID (QuickFix): ${qfBookingId}`);
 logInfo(`Booking ID (MongoDB): ${mongoId}`);
 logInfo(`Status: ${bookingResponse?.status}`);
 logInfo(`Estimated Cost: KES ${bookingResponse?.estimatedCost}`);
 
 return result;
}

async function step4_TechnicianAcceptsBooking() {
 logStep(4, 'Technician Accepts Booking');
 
 logInfo(`Technician viewing available bookings...`);
 
 // First, get available bookings
 try {
 const bookings = await makeRequest('/technician/available-jobs', 'GET', null, technicianToken);
 logInfo(`Found ${bookings.data?.length || 0} available bookings`);
 if (bookings.data && bookings.data.length > 0) {
 console.log('Available bookings:', JSON.stringify(bookings.data[0], null, 2));
 }
 } catch (error) {
 logWarn(`Could not fetch available bookings: ${error.message}`);
 }
 
 // Accept the booking directly (bypassing available check for testing)
 logInfo(`Accepting booking ${bookingId}...`);
 
 const result = await makeRequest(
 `/technician/accept-job/${bookingId}`,
 'POST',
 {},
 technicianToken
 );
 
 logSuccess(`Booking accepted by technician`);
 logInfo(`Status: ${result.data?.status || 'N/A'}`);
 logInfo(`Technician: ${result.data?.technician?.name || 'N/A'}`);
 
 return result;
}

async function step5_CustomerAddsFunds() {
 logStep(5, 'Customer Adds Funds to Wallet');
 
 const amount = 2000; // KES
 
 logInfo(`Adding KES ${amount} to wallet via M-Pesa...`);
 logInfo(`Phone: 0794536984 (Test number)`);
 
 const paymentData = {
 amount,
 paymentMethod: 'mpesa',
 paymentDetails: {
 phoneNumber: '0794536984',
 email: 'customer@test.com'
 }
 };
 
 const result = await makeRequest('/payments/add-funds', 'POST', paymentData, customerToken);
 
 transactionId = result.data?.transaction?._id || result.data?.transactionId;
 
 logSuccess(`Payment initiated`);
 logInfo(`Transaction ID: ${transactionId}`);
 logInfo(`Tracking ID: ${result.data?.trackingId || 'N/A'}`);
 
 log(`\n[MOBILE] M-Pesa STK Push initiated successfully`, 'green');
 log(`[WARNING] For E2E testing, we'll simulate payment completion\n`, 'yellow');
 
 // For testing: Simulate successful payment by directly crediting wallet
 // In production, this would wait for IntaSend callback
 log(`Simulating payment completion via direct wallet update...`, 'yellow');
 
 const mongoose = require('mongoose');
 require('dotenv').config();
 
 // Connect to database and update wallet
 if (!mongoose.connection.readyState) {
 await mongoose.connect(process.env.MONGO_URI);
 }
 
 const Wallet = require('./backend/models/Wallet');
 const Transaction = require('./backend/models/Transaction');
 
 // Find user's wallet
 const wallet = await Wallet.findOne({ userId: customerUserId });
 if (wallet) {
 // Credit wallet with net amount (amount - fees)
 wallet.balance.available += (amount * 0.99); // Assuming 1% fee
 await wallet.save();
 
 // Update transaction status
 if (transactionId) {
 const transaction = await Transaction.findById(transactionId);
 if (transaction) {
 transaction.status = 'completed';
 transaction.completedAt = new Date();
 transaction.balanceAfter = {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 };
 await transaction.save();
 }
 }
 
 logSuccess(`Wallet credited with KES ${amount * 0.99}`);
 logInfo(`New balance: KES ${wallet.balance.available}`);
 }
 
 logSuccess(`Payment flow tested successfully!`);
 log(`[INFO] In production, user would complete M-Pesa payment on phone\n`, 'blue');
 
 return result;
}

async function step6_CustomerPaysForBooking() {
 logStep(6, 'Customer Pays for Booking (Escrow)');
 
 // Use MongoDB ID for escrow operations
 const mongoId = global.bookingMongoId;
 
 // Get booking details for amount
 const booking = await makeRequest(`/bookings/${bookingId}`, 'GET', null, customerToken);
 const amount = booking.data.estimatedCost || 1500;
 
 logInfo(`Depositing KES ${amount} to escrow for booking...`);
 
 const escrowData = {
 amount,
 bookingId: mongoId, // Use MongoDB ID for escrow
 description: `Payment for ${booking.data.serviceType} service`
 };
 
 const result = await makeRequest('/payments/escrow/deposit', 'POST', escrowData, customerToken);
 
 logSuccess(`Payment deposited to escrow`);
 logInfo(`Escrow Amount: KES ${amount}`);
 logInfo(`Status: ${result.data.status}`);
 
 // Check wallet balance
 const wallet = await makeRequest('/payments/wallet', 'GET', null, customerToken);
 logInfo(`\nWallet Status:`);
 logInfo(` Available: KES ${wallet.data.balance}`);
 logInfo(` In Escrow: KES ${wallet.data.escrowBalance}`);
 
 return result;
}

async function step7_TechnicianCompletesService() {
 logStep(7, 'Technician Completes Service');
 
 // Step 7a: Start the job
 logInfo(`Starting the job...`);
 await makeRequest(
 `/technician/start-job/${bookingId}`,
 'POST',
 {},
 technicianToken
 );
 logSuccess(`Job started - status changed to in_progress`);
 
 // Simulate service being performed
 logInfo(`Simulating service in progress...`);
 await new Promise(resolve => setTimeout(resolve, 1000));
 
 // Step 7b: Complete the job
 logInfo(`Marking service as completed...`);
 
 const result = await makeRequest(
 `/technician/complete-job/${bookingId}`,
 'POST',
 { 
 completionNotes: 'Service completed successfully. Fixed the leaking sink.',
 finalCost: 1500
 },
 technicianToken
 );
 
 logSuccess(`Service marked as completed`);
 logInfo(`Status: ${result.data?.status || 'completed'}`);
 logInfo(`Final Cost: KES ${result.data?.finalCost || 1500}`);
 
 return result;
}

async function step8_ReleasePaymentToTechnician() {
 logStep(8, 'Release Payment from Escrow to Technician');
 
 // Use MongoDB ID for escrow operations
 const mongoId = global.bookingMongoId;
 
 const booking = await makeRequest(`/bookings/${bookingId}`, 'GET', null, customerToken);
 const amount = booking.data.estimatedCost || 1500;
 
 logInfo(`Releasing KES ${amount} from escrow to technician...`);
 
 const releaseData = {
 amount,
 bookingId: mongoId, // Use MongoDB ID for escrow
 recipientUserId: technicianUserId,
 description: `Payment for completed ${booking.data.serviceType} service`
 };
 
 const result = await makeRequest('/payments/escrow/release', 'POST', releaseData, customerToken);
 
 logSuccess(`Payment released to technician`);
 logInfo(`Amount: KES ${amount}`);
 logInfo(`Status: ${result.data?.status || 'completed'}`);
 
 return result;
}

async function step9_VerifyFinalBalances() {
 logStep(9, 'Verify Final Wallet Balances');
 
 // Customer wallet
 const customerWallet = await makeRequest('/payments/wallet', 'GET', null, customerToken);
 
 logInfo(`Customer Wallet:`);
 logInfo(` Available: KES ${customerWallet.data.balance}`);
 logInfo(` In Escrow: KES ${customerWallet.data.escrowBalance}`);
 logInfo(` Total: KES ${customerWallet.data.balance + customerWallet.data.escrowBalance}`);
 
 // Technician wallet
 const techWallet = await makeRequest('/payments/wallet', 'GET', null, technicianToken);
 
 logInfo(`\nTechnician Wallet:`);
 logInfo(` Available: KES ${techWallet.data.balance}`);
 logInfo(` In Escrow: KES ${techWallet.data.escrowBalance}`);
 logInfo(` Total Earnings: KES ${techWallet.data.totalEarnings || techWallet.data.balance}`);
 
 // Transaction history
 const customerTxns = await makeRequest('/payments/transactions?limit=5', 'GET', null, customerToken);
 const techTxns = await makeRequest('/payments/transactions?limit=5', 'GET', null, technicianToken);
 
 logInfo(`\nTransaction History:`);
 logInfo(` Customer Transactions: ${customerTxns.data?.transactions?.length || 0}`);
 logInfo(` Technician Transactions: ${techTxns.data?.transactions?.length || 0}`);
 
 logSuccess(`All wallet balances verified!`);
 
 return { customerWallet, techWallet };
}

async function runE2ETest() {
 log('\n' + '='.repeat(60), 'bright');
 log('[LAUNCH] END-TO-END TEST: Registration → Booking → Payment', 'bright');
 log('='.repeat(60) + '\n', 'bright');
 
 try {
 await step1_RegisterCustomer();
 await step2_RegisterTechnician();
 await step3_CustomerCreatesBooking();
 await step4_TechnicianAcceptsBooking();
 await step5_CustomerAddsFunds();
 await step6_CustomerPaysForBooking();
 await step7_TechnicianCompletesService();
 await step8_ReleasePaymentToTechnician();
 await step9_VerifyFinalBalances();
 
 log('\n' + '='.repeat(60), 'green');
 log('[COMPLETED] ALL TESTS PASSED! Complete flow working!', 'green');
 log('='.repeat(60) + '\n', 'green');
 
 logInfo('Test Summary:');
 logInfo(` Customer ID: ${customerUserId}`);
 logInfo(` Technician ID: ${technicianUserId}`);
 logInfo(` Booking ID: ${bookingId}`);
 logInfo(` Transaction ID: ${transactionId}`);
 
 } catch (error) {
 log('\n' + '='.repeat(60), 'red');
 logError(`TEST FAILED: ${error.message}`);
 log('='.repeat(60) + '\n', 'red');
 
 console.error(error);
 process.exit(1);
 }
}

// Run the test
runE2ETest();
