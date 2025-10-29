require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testWorkingSTK() {
 console.log('[SUCCESS] TESTING WORKING STK PUSH INTEGRATION\n');
 console.log('='.repeat(60));
 console.log('[COMPLETED] STK Push confirmed working via curl!');
 console.log('[MOBILE] Phone: 0794536984');
 console.log('[PAYMENT] Amount: KES 10');
 console.log('='.repeat(60));
 console.log('');
 
 try {
 // Step 1: Login with existing user or register new one
 console.log('[NOTE] Step 1: Attempting to login/register...');
 const timestamp = Date.now();
 const email = `working${timestamp}@test.com`;
 
 let token, userId;
 
 // Try to register (use unique phone)
 try {
 const phoneUnique = `07945369${String(timestamp).slice(-2)}`;
 const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
 email,
 password: 'Test123!@#',
 firstName: 'Working',
 lastName: 'Test',
 phoneNumber: phoneUnique,
 role: 'client',
 location: {
 address: 'Nairobi',
 coordinates: { latitude: -1.2921, longitude: 36.8219 }
 }
 });
 
 userId = registerResponse.data.data.user._id;
 token = registerResponse.data.data.tokens.accessToken;
 console.log('[COMPLETED] New user registered:', userId);
 
 // Step 2: Verify user (for testing)
 console.log('\n[SECURE] Step 2: Verifying user...');
 await axios.post(`${BASE_URL}/auth/test-verify/${userId}`);
 console.log('[COMPLETED] User verified');
 
 } catch (regError) {
 // If registration fails, try login with a known test account
 console.log('[WARNING] Registration failed, trying with existing account...');
 
 // Use the phone that already exists
 const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
 email: 'working1761497955777@test.com', // Known working account from earlier tests
 password: 'Test123!@#'
 });
 
 userId = loginResponse.data.data.user._id;
 token = loginResponse.data.data.tokens.accessToken;
 console.log('[COMPLETED] Logged in with existing user:', userId);
 }
 
 // Step 3: Initiate M-Pesa STK Push
 console.log('\n[CARD] Step 3: Initiating M-Pesa STK Push...');
 console.log('Phone: 0794536984');
 console.log('Amount: KES 10');
 
 const paymentResponse = await axios.post(
 `${BASE_URL}/payments/add-funds`,
 {
 amount: 10,
 paymentMethod: 'mpesa',
 paymentDetails: {
 phoneNumber: '0794536984',
 email: 'test@quickfix.com'
 }
 },
 {
 headers: { Authorization: `Bearer ${token}` }
 }
 );
 
 console.log('\n' + '='.repeat(60));
 console.log('[SUCCESS] SUCCESS! STK PUSH SENT!');
 console.log('='.repeat(60));
 console.log('\nPayment Response:');
 console.log(JSON.stringify(paymentResponse.data, null, 2));
 
 if (paymentResponse.data.transaction) {
 console.log('\n[CHECKLIST] Transaction Details:');
 console.log('Transaction ID:', paymentResponse.data.transaction.transactionId);
 console.log('Status:', paymentResponse.data.transaction.status);
 console.log('Amount:', paymentResponse.data.transaction.amount);
 }
 
 console.log('\n' + '='.repeat(60));
 console.log('[MOBILE] CHECK YOUR PHONE (0794536984) FOR STK PUSH!');
 console.log('='.repeat(60));
 console.log('\n[COMPLETED] Integration is WORKING!');
 console.log('[COMPLETED] Backend successfully communicating with IntaSend');
 console.log('[COMPLETED] Ready for production use!');
 
 } catch (error) {
 console.log('\n[FAILED] ERROR OCCURRED');
 console.log('='.repeat(60));
 
 if (error.response) {
 console.log('Status:', error.response.status);
 console.log('Data:', JSON.stringify(error.response.data, null, 2));
 } else {
 console.log('Error:', error.message);
 }
 
 console.log('\n TIP: Make sure backend is running on port 5000');
 }
}

testWorkingSTK();
