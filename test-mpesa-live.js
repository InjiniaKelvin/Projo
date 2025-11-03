/**
 * Live M-Pesa STK Push Test
 * This will send a real STK push to your phone
 */

require('dotenv').config();
const mongoose = require('mongoose');
const IntaSendService = require('./backend/services/IntaSendService');
const User = require('./backend/models/User');
const Wallet = require('./backend/models/Wallet');
const Transaction = require('./backend/models/Transaction');

const TEST_PHONE = '0794536984';
const TEST_AMOUNT = 10; // Small test amount - 10 KES

async function testMpesaSTKPush() {
 console.log('\n========================================');
 console.log(' LIVE M-PESA STK PUSH TEST');
 console.log('========================================\n');
 
 try {
 // Connect to database
 console.log(' Connecting to database...');
 await mongoose.connect(process.env.MONGO_URI);
 console.log('[COMPLETED] Database connected\n');
 
 // Find or create your user
 let user = await User.findOne({ phoneNumber: new RegExp(TEST_PHONE) });
 
 if (!user) {
 console.log(' Creating user account...');
 user = await User.create({
 firstName: 'Kelvin',
 lastName: 'Injinia',
 email: 'kelvin@quickfix.test',
 phoneNumber: TEST_PHONE,
 password: 'TestPassword123!',
 role: 'client',
 isVerified: true,
 isEmailVerified: true,
 isPhoneVerified: true
 });
 console.log('[COMPLETED] User created\n');
 } else {
 console.log('[COMPLETED] User found\n');
 }
 
 // Find or create wallet
 let wallet = await Wallet.findOne({ userId: user._id });
 
 if (!wallet) {
 console.log('[PAYMENT] Creating wallet...');
 wallet = await Wallet.create({
 userId: user._id,
 currency: 'KES'
 });
 console.log('[COMPLETED] Wallet created\n');
 } else {
 console.log(`[COMPLETED] Wallet found - Balance: KES ${wallet.balance.available}\n`);
 }
 
 // Create transaction record
 console.log('[NOTE] Creating transaction record...');
 const transaction = await Transaction.create({
 userId: user._id,
 walletId: wallet._id,
 type: 'deposit',
 amount: {
 gross: TEST_AMOUNT,
 fees: 0,
 net: TEST_AMOUNT
 },
 currency: 'KES',
 paymentMethod: {
 type: 'mpesa',
 details: {
 phoneNumber: TEST_PHONE
 }
 },
 description: 'Live test - M-Pesa wallet top-up',
 balanceBefore: {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 },
 initiatedBy: user._id,
 status: 'pending'
 });
 console.log(`[COMPLETED] Transaction created: ${transaction._id}\n`);
 
 // Initiate M-Pesa STK Push
 console.log('[MOBILE] Initiating M-Pesa STK Push...');
 console.log(` Phone: ${TEST_PHONE}`);
 console.log(` Amount: KES ${TEST_AMOUNT}`);
 console.log(` Email: ${user.email}\n`);
 
 const result = await IntaSendService.initiateMpesaSTKPush({
 amount: TEST_AMOUNT,
 phoneNumber: TEST_PHONE,
 email: user.email,
 userId: user._id.toString(),
 walletId: wallet._id.toString()
 });
 
 if (result.success) {
 console.log('[SUCCESS] STK PUSH SENT SUCCESSFULLY!\n');
 console.log('[METRICS] Payment Details:');
 console.log(` Tracking ID: ${result.trackingId}`);
 console.log(` Provider: ${result.provider}`);
 console.log(` Status: ${result.data?.invoiceId ? 'Pending approval' : 'Initiated'}`);
 console.log(` Message: ${result.message}\n`);
 
 // Update transaction
 transaction.externalTransactionId = result.trackingId || result.data?.invoiceId;
 transaction.gatewayResponse = result;
 transaction.status = 'processing';
 await transaction.save();
 
 console.log('[IN PROGRESS] NEXT STEPS:');
 console.log(' 1. Check your phone (0794536984) for M-Pesa prompt');
 console.log(' 2. Enter your M-Pesa PIN to complete payment');
 console.log(' 3. You will receive M-Pesa confirmation SMS');
 console.log('\n[NOTE] SANDBOX MODE:');
 console.log(' - If no STK prompt appears, login to IntaSend sandbox dashboard');
 console.log(' - Navigate to: https://sandbox.intasend.com');
 console.log(' - Go to Collections → Find transaction → Click "Approve"');
 console.log('\n To check payment status, run:');
 console.log(` node -e "require('./backend/services/IntaSendService').checkPaymentStatus('${result.trackingId}').then(console.log)"`);
 
 } else {
 console.error('[FAILED] STK PUSH FAILED!\n');
 console.error('Error:', result.error);
 console.error('Details:', result.errorDetails);
 
 transaction.status = 'failed';
 transaction.failureReason = result.error;
 await transaction.save();
 }
 
 } catch (error) {
 console.error('\n[FAILED] TEST FAILED:', error.message);
 console.error(error);
 } finally {
 // Keep connection open to monitor webhook
 console.log('\n[IN PROGRESS] Keeping connection open for 60 seconds to monitor webhook...');
 console.log(' (Press Ctrl+C to exit early)\n');
 
 setTimeout(async () => {
 console.log('[COMPLETED] Test complete. Closing connection...');
 await mongoose.disconnect();
 process.exit(0);
 }, 60000);
 }
}

// Run the test
testMpesaSTKPush();
