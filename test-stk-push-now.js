/**
 * Quick STK Push Test
 * This will send an M-Pesa payment prompt to 0794536984
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';
const PHONE = '0794536984';
const AMOUNT = 10; // KES 10

async function sendSTKPush() {
 console.log('\n[LAUNCH] STK PUSH TEST - IntaSend Sandbox\n');
 console.log('=' .repeat(50));
 
 try {
 // Step 1: Register test user
 console.log('\n[NOTE] Step 1: Creating test user...');
 const timestamp = Date.now();
 const registerData = {
 firstName: 'Test',
 lastName: 'STK',
 email: `stk${timestamp}@test.com`,
 password: 'TestPass123!',
 phoneNumber: `071${timestamp.toString().slice(-7)}`, // Different phone for registration
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
 console.log('[COMPLETED] User created:', registerData.email);
 
 // Step 2: Verify user
 console.log('\n[COMPLETED] Step 2: Verifying user...');
 await fetch(`${API_BASE}/auth/test-verify/${userId}`, {
 method: 'POST'
 });
 console.log('[COMPLETED] User verified for payments');
 
 // Step 3: Send STK Push
 console.log('\n[MOBILE] Step 3: Sending M-Pesa STK Push...');
 console.log('=' .repeat(50));
 console.log(`[CONTACT] Target Phone: ${PHONE}`);
 console.log(`[PAYMENT] Amount: KES ${AMOUNT}`);
 console.log('[IN PROGRESS] Waiting for IntaSend...\n');
 
 const paymentData = {
 amount: AMOUNT,
 paymentMethod: 'mpesa',
 paymentDetails: {
 phoneNumber: PHONE,
 email: registerData.email
 }
 };
 
 const paymentResponse = await fetch(`${API_BASE}/payments/add-funds`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(paymentData)
 });
 
 const paymentResult = await paymentResponse.json();
 
 console.log('IntaSend Response:');
 console.log(JSON.stringify(paymentResult, null, 2));
 
 if (paymentResult.success) {
 console.log('\n' + '='.repeat(50));
 console.log('[COMPLETED] SUCCESS! STK PUSH SENT TO YOUR PHONE!');
 console.log('=' .repeat(50));
 console.log(`\n[MOBILE] CHECK PHONE: ${PHONE}`);
 console.log('[CARD] You should see an M-Pesa payment prompt');
 console.log(`[PAYMENT] Amount: KES ${AMOUNT}`);
 console.log(`🆔 Tracking ID: ${paymentResult.data?.trackingId || 'N/A'}`);
 console.log('\n[NOTE] Enter your M-Pesa PIN to complete the payment');
 console.log('[WARNING] Note: This is SANDBOX - no real money will be deducted\n');
 } else {
 console.log('\n' + '='.repeat(50));
 console.log('[FAILED] FAILED TO SEND STK PUSH');
 console.log('=' .repeat(50));
 console.log('Error:', paymentResult.message || paymentResult.error);
 
 if (paymentResult.error) {
 console.log('\nDetails:', paymentResult.error);
 }
 }
 
 } catch (error) {
 console.error('\n[FAILED] Error:', error.message);
 console.error(error);
 }
}

// Run the test
console.log('\n[WARNING] Make sure the backend server is running on http://localhost:5000');
console.log('[WARNING] Make sure phone 0794536984 is ON and has network signal\n');

sendSTKPush();
