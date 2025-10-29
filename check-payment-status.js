/**
 * Check M-Pesa Payment Status
 * Run this after approving the payment in IntaSend dashboard
 */

require('dotenv').config();
const mongoose = require('mongoose');
const IntaSendService = require('./backend/services/IntaSendService');
const Transaction = require('./backend/models/Transaction');
const Wallet = require('./backend/models/Wallet');

const TRACKING_ID = 'R5W2D8Q'; // From the STK push test

async function checkPaymentStatus() {
 console.log('\n========================================');
 console.log('[SEARCH] CHECKING PAYMENT STATUS');
 console.log('========================================\n');
 
 try {
 await mongoose.connect(process.env.MONGO_URI);
 console.log('[COMPLETED] Connected to database\n');
 
 // Find transaction
 const transaction = await Transaction.findOne({
 externalTransactionId: TRACKING_ID
 }).populate('walletId');
 
 if (!transaction) {
 console.log('[FAILED] Transaction not found with tracking ID:', TRACKING_ID);
 await mongoose.disconnect();
 return;
 }
 
 console.log('[NOTE] Transaction Details:');
 console.log(` ID: ${transaction._id}`);
 console.log(` Amount: KES ${transaction.amount.gross}`);
 console.log(` Current Status: ${transaction.status}`);
 console.log(` Created: ${transaction.createdAt}\n`);
 
 // Check status with IntaSend
 console.log(' Checking status with IntaSend...');
 const statusResult = await IntaSendService.checkPaymentStatus(TRACKING_ID, transaction._id.toString());
 
 if (statusResult.success) {
 console.log('\n[COMPLETED] Payment Status from IntaSend:');
 console.log(` Status: ${statusResult.status}`);
 console.log(` IntaSend State: ${statusResult.intasendStatus}`);
 
 if (statusResult.status === 'completed') {
 console.log('\n[SUCCESS] PAYMENT COMPLETED!');
 
 // Check wallet balance
 const wallet = await Wallet.findById(transaction.walletId);
 console.log('\n[PAYMENT] Updated Wallet Balance:');
 console.log(` Available: KES ${wallet.balance.available}`);
 console.log(` Escrow: KES ${wallet.balance.escrow}`);
 console.log(` Pending: KES ${wallet.balance.pending}`);
 
 } else if (statusResult.status === 'processing') {
 console.log('\n[IN PROGRESS] Payment is still processing...');
 console.log(' Please wait a moment and try again');
 console.log(' Or approve it manually in IntaSend dashboard');
 
 } else if (statusResult.status === 'failed') {
 console.log('\n[FAILED] Payment failed');
 console.log(' Reason:', transaction.failureReason || 'Unknown');
 }
 
 } else {
 console.log('\n[WARNING] Could not retrieve status from IntaSend');
 console.log(' This is normal for sandbox mock transactions');
 console.log(` Local status: ${transaction.status}`);
 
 if (statusResult.note) {
 console.log(` Note: ${statusResult.note}`);
 }
 }
 
 } catch (error) {
 console.error('\n[FAILED] Error:', error.message);
 } finally {
 await mongoose.disconnect();
 console.log('\n[COMPLETED] Done\n');
 }
}

checkPaymentStatus();
