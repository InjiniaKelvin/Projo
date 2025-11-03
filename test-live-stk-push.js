/**
 * LIVE PRODUCTION STK PUSH TEST
 * This will send a REAL M-Pesa payment prompt to 0794536984
 * [WARNING] WARNING: This uses LIVE IntaSend keys - REAL money will be processed!
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';
const PHONE = '0794536984';
const AMOUNT = 10; // KES 10 - minimum test amount

async function sendLiveSTKPush() {
 console.log('\n[LAUNCH] LIVE PRODUCTION STK PUSH TEST');
 console.log('=' .repeat(60));
 console.log('[WARNING] WARNING: Using LIVE IntaSend keys');
 console.log('[PAYMENT] REAL money will be processed!');
 console.log('=' .repeat(60));
 
 try {
 // Step 1: Register test user
 console.log('\n[NOTE] Step 1: Creating test customer...');
 const timestamp = Date.now();
 const registerData = {
 firstName: 'Live',
 lastName: 'Test',
 email: `live${timestamp}@quickfix.com`,
 password: 'LiveTest123!@#',
 phoneNumber: `072${timestamp.toString().slice(-7)}`, // Different phone for registration
 role: 'client'
 };
 
 const regResponse = await fetch(`${API_BASE}/auth/register`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(registerData)
 });
 
 const userData = await regResponse.json();
 
 if (!userData.success) {
 console.error('[FAILED] Registration failed:', userData.message);
 return;
 }
 
 const token = userData.data.tokens.accessToken;
 const userId = userData.data.user._id;
 console.log('[COMPLETED] Customer created:', registerData.email);
 console.log(' User ID:', userId);
 
 // Step 2: Verify user for payment access
 console.log('\n[SECURE] Step 2: Verifying customer account...');
 await fetch(`${API_BASE}/auth/test-verify/${userId}`, {
 method: 'POST'
 });
 console.log('[COMPLETED] Account verified - payment access enabled');
 
 // Step 3: Send LIVE STK Push
 console.log('\n[MOBILE] Step 3: Initiating LIVE M-Pesa STK Push...');
 console.log('=' .repeat(60));
 console.log('[URGENT] LIVE MODE - REAL TRANSACTION');
 console.log(`[CONTACT] Target Phone: ${PHONE}`);
 console.log(`[PAYMENT] Amount: KES ${AMOUNT}`);
 console.log('[IN PROGRESS] Sending request to IntaSend...\n');
 
 const paymentData = {
 amount: AMOUNT,
 paymentMethod: 'mpesa',
 paymentDetails: {
 phoneNumber: PHONE,
 email: registerData.email
 }
 };
 
 const startTime = Date.now();
 const paymentResponse = await fetch(`${API_BASE}/payments/add-funds`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(paymentData)
 });
 
 const paymentResult = await paymentResponse.json();
 const responseTime = Date.now() - startTime;
 
 console.log('IntaSend Response (received in', responseTime, 'ms):');
 console.log(JSON.stringify(paymentResult, null, 2));
 
 if (paymentResult.success) {
 console.log('\n' + '='.repeat(60));
 console.log('[COMPLETED] SUCCESS! LIVE STK PUSH SENT TO YOUR PHONE!');
 console.log('=' .repeat(60));
 console.log(`\n[MOBILE] CHECK PHONE NOW: ${PHONE}`);
 console.log('[CARD] You should see an M-Pesa payment prompt');
 console.log(`[PAYMENT] Amount: KES ${AMOUNT}`);
 console.log(`🆔 Transaction ID: ${paymentResult.data?.transaction?._id || 'N/A'}`);
 console.log(`[SEARCH] Tracking ID: ${paymentResult.data?.trackingId || 'N/A'}`);
 console.log('\n[NOTE] NEXT STEPS:');
 console.log(' 1. Check your phone for M-Pesa prompt');
 console.log(' 2. Enter your M-Pesa PIN');
 console.log(' 3. Confirm the payment');
 console.log(` 4. You will pay KES ${AMOUNT} (REAL MONEY)`);
 console.log('\n[WARNING] This is LIVE mode - actual payment will be processed!');
 console.log('[CURRENCY] Money will be credited to QuickFix wallet\n');
 
 // Save transaction details for reference
 console.log('Transaction Details:');
 console.log('-------------------');
 console.log('User Email:', registerData.email);
 console.log('User ID:', userId);
 console.log('Transaction ID:', paymentResult.data?.transaction?._id);
 console.log('Status:', paymentResult.data?.transaction?.status);
 console.log('Created:', new Date().toISOString());
 
 } else {
 console.log('\n' + '='.repeat(60));
 console.log('[FAILED] FAILED TO SEND STK PUSH');
 console.log('=' .repeat(60));
 console.log('Error:', paymentResult.message || paymentResult.error);
 
 if (paymentResult.error) {
 console.log('\nError Details:', paymentResult.error);
 }
 
 console.log('\nPossible reasons:');
 console.log(' * IntaSend live keys not configured correctly');
 console.log(' * Phone number format issue');
 console.log(' * IntaSend account not fully verified');
 console.log(' * Network connectivity issue');
 }
 
 } catch (error) {
 console.error('\n[FAILED] Error:', error.message);
 console.error(error);
 }
}

// Pre-flight checks
console.log('\n[WARNING] PRE-FLIGHT CHECKS');
console.log('=' .repeat(60));
console.log('OK Backend server must be running on http://localhost:5000');
console.log('OK Phone 0794536984 must be ON and have network signal');
console.log('OK IntaSend LIVE keys must be configured in .env');
console.log('OK IntaSend account must be verified');
console.log('OK You will pay REAL money (KES 10)');
console.log('=' .repeat(60));
console.log('\nStarting in 3 seconds...\n');

setTimeout(() => {
 sendLiveSTKPush();
}, 3000);
