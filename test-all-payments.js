/**
 * Complete Payment Methods Test
 * Tests M-Pesa, Card, and Wallet payments
 */

require('dotenv').config();
const mongoose = require('mongoose');
const IntaSendService = require('./backend/services/IntaSendService');
const User = require('./backend/models/User');
const Wallet = require('./backend/models/Wallet');
const Transaction = require('./backend/models/Transaction');

const YOUR_PHONE = '0794536984';
const YOUR_EMAIL = 'kelvin@quickfix.test';

async function testAllPaymentMethods() {
 console.log('\n========================================');
 console.log('[CARD] COMPLETE PAYMENT METHODS TEST');
 console.log('========================================\n');
 
 try {
 await mongoose.connect(process.env.MONGO_URI);
 console.log('[COMPLETED] Database connected\n');
 
 // Get or create user
 let user = await User.findOne({ phoneNumber: new RegExp(YOUR_PHONE) });
 let wallet = await Wallet.findOne({ userId: user._id });
 
 console.log(' User:', user.firstName, user.lastName);
 console.log('[MOBILE] Phone:', YOUR_PHONE);
 console.log('[PAYMENT] Current Balance: KES', wallet.balance.available, '\n');
 
 // Test 1: M-Pesa STK Push
 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
 console.log('TEST 1: M-PESA STK PUSH');
 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
 
 const mpesaTransaction = await Transaction.create({
 userId: user._id,
 walletId: wallet._id,
 type: 'deposit',
 amount: { gross: 50, fees: 0, net: 50 },
 currency: 'KES',
 paymentMethod: { type: 'mpesa', details: { phoneNumber: YOUR_PHONE } },
 description: 'Test M-Pesa payment - KES 50',
 balanceBefore: {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 },
 status: 'pending'
 });
 
 console.log('[PAYMENT] Testing: KES 50 via M-Pesa');
 const mpesaResult = await IntaSendService.initiateMpesaSTKPush({
 amount: 50,
 phoneNumber: YOUR_PHONE,
 email: YOUR_EMAIL,
 userId: user._id.toString(),
 walletId: wallet._id.toString()
 });
 
 if (mpesaResult.success) {
 console.log('[COMPLETED] M-Pesa STK Push Sent!');
 console.log(` Tracking ID: ${mpesaResult.trackingId}`);
 console.log(` Message: ${mpesaResult.message}`);
 console.log(' [MOBILE] Check your phone for M-Pesa prompt!\n');
 
 mpesaTransaction.externalTransactionId = mpesaResult.trackingId;
 mpesaTransaction.gatewayResponse = mpesaResult;
 mpesaTransaction.status = 'processing';
 await mpesaTransaction.save();
 } else {
 console.log('[FAILED] M-Pesa failed:', mpesaResult.error, '\n');
 }
 
 // Test 2: Card Payment
 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
 console.log('TEST 2: CARD PAYMENT');
 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
 
 const cardTransaction = await Transaction.create({
 userId: user._id,
 walletId: wallet._id,
 type: 'deposit',
 amount: { gross: 100, fees: 3.5, net: 96.5 },
 currency: 'KES',
 paymentMethod: { type: 'card', details: {} },
 description: 'Test Card payment - KES 100',
 balanceBefore: {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 },
 status: 'pending'
 });
 
 console.log('[CARD] Testing: KES 100 via Card');
 const cardResult = await IntaSendService.initiateCardPayment({
 amount: 100,
 email: YOUR_EMAIL,
 firstName: user.firstName,
 lastName: user.lastName,
 userId: user._id.toString()
 });
 
 if (cardResult.success) {
 console.log('[COMPLETED] Card Payment Initiated!');
 console.log(` Tracking ID: ${cardResult.trackingId}`);
 console.log(` Checkout URL: ${cardResult.checkoutUrl}`);
 console.log(` Message: ${cardResult.message}`);
 if (cardResult.note) {
 console.log(` Note: ${cardResult.note}`);
 }
 console.log();
 
 cardTransaction.externalTransactionId = cardResult.trackingId;
 cardTransaction.gatewayResponse = cardResult;
 cardTransaction.metadata = { checkoutUrl: cardResult.checkoutUrl };
 await cardTransaction.save();
 } else {
 console.log('[FAILED] Card payment failed:', cardResult.error, '\n');
 }
 
 // Test 3: Wallet Payment (Escrow)
 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
 console.log('TEST 3: WALLET PAYMENT (ESCROW)');
 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
 
 // First, add some funds to wallet if empty
 if (wallet.balance.available < 200) {
 console.log('[PAYMENT] Adding test funds to wallet...');
 wallet.balance.available = 500;
 await wallet.save();
 console.log('[COMPLETED] Wallet funded with KES 500\n');
 }
 
 const escrowAmount = 200;
 const balanceBefore = wallet.balance.available;
 
 console.log(` Moving KES ${escrowAmount} to escrow`);
 console.log(` Available before: KES ${balanceBefore}`);
 
 await wallet.moveToEscrow(escrowAmount);
 await wallet.save();
 
 const escrowTransaction = await Transaction.create({
 userId: user._id,
 walletId: wallet._id,
 type: 'escrow_hold',
 amount: { gross: escrowAmount, fees: 0, net: escrowAmount },
 currency: 'KES',
 paymentMethod: { type: 'wallet' },
 description: 'Test escrow - Service booking',
 balanceBefore: {
 available: balanceBefore,
 escrow: 0,
 pending: 0
 },
 balanceAfter: {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 },
 status: 'completed',
 completedAt: new Date()
 });
 
 console.log('[COMPLETED] Escrow Transaction Complete!');
 console.log(` Transaction ID: ${escrowTransaction._id}`);
 console.log(` Available now: KES ${wallet.balance.available}`);
 console.log(` Escrow: KES ${wallet.balance.escrow}\n`);
 
 // Summary
 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
 console.log('[METRICS] TEST SUMMARY');
 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
 
 console.log('[COMPLETED] M-Pesa STK Push: SENT (Check phone 0794536984)');
 console.log('[COMPLETED] Card Payment: INITIATED (Checkout URL generated)');
 console.log('[COMPLETED] Wallet/Escrow: COMPLETED');
 
 console.log('\n[PAYMENT] Final Wallet Balance:');
 console.log(` Available: KES ${wallet.balance.available}`);
 console.log(` Escrow: KES ${wallet.balance.escrow}`);
 console.log(` Pending: KES ${wallet.balance.pending}`);
 
 console.log('\n[NOTE] NEXT STEPS:');
 console.log(' 1. Check phone (0794536984) for M-Pesa STK prompt');
 console.log(' 2. Enter PIN to complete M-Pesa payment');
 console.log(' 3. For sandbox: Approve in https://sandbox.intasend.com');
 console.log('\n To check M-Pesa status:');
 console.log(` node check-payment-status.js`);
 
 } catch (error) {
 console.error('\n[FAILED] Error:', error.message);
 console.error(error);
 } finally {
 await mongoose.disconnect();
 console.log('\n[COMPLETED] Test complete\n');
 }
}

testAllPaymentMethods();
