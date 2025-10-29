/**
 * Debug IntaSend API Response
 * This will show EXACTLY what IntaSend returns
 */

const IntaSend = require('intasend-node');
require('dotenv').config();

async function debugIntaSend() {
 console.log('\n[SEARCH] INTASEND API DEBUG\n');
 console.log('=' .repeat(60));
 
 const pubKey = process.env.INTASEND_PUBLISHABLE_KEY;
 const secretKey = process.env.INTASEND_SECRET_KEY;
 const isTest = process.env.INTASEND_ENV === 'sandbox';
 
 console.log('Publishable Key:', pubKey?.substring(0, 25) + '...');
 console.log('Secret Key:', secretKey?.substring(0, 25) + '...');
 console.log('Mode:', isTest ? '🟡 SANDBOX/TEST' : '[URGENT] LIVE/PRODUCTION');
 console.log('=' .repeat(60));
 
 try {
 console.log('\n Initializing IntaSend client...');
 const intasend = new IntaSend(pubKey, secretKey, isTest);
 const collection = intasend.collection();
 
 console.log('[COMPLETED] IntaSend client initialized');
 
 console.log('\n[MOBILE] Sending M-Pesa STK Push...');
 console.log('Phone: 0794536984 -> 254794536984');
 console.log('Amount: KES 10');
 console.log('Email: debug@test.com\n');
 
 const paymentData = {
 amount: 10,
 phone_number: '254794536984',
 email: 'debug@test.com',
 api_ref: `DEBUG_${Date.now()}`
 };
 
 console.log('Request data:', JSON.stringify(paymentData, null, 2));
 console.log('\n[IN PROGRESS] Calling IntaSend API...\n');
 
 const response = await collection.mpesaStkPush(paymentData);
 
 console.log('=' .repeat(60));
 console.log('[COMPLETED] INTASEND RESPONSE RECEIVED');
 console.log('=' .repeat(60));
 console.log(JSON.stringify(response, null, 2));
 
 if (response.invoice) {
 console.log('\n[CHECKLIST] Invoice Details:');
 console.log(' Invoice ID:', response.invoice.invoice_id);
 console.log(' State:', response.invoice.state);
 console.log(' Amount:', response.invoice.value);
 console.log(' Currency:', response.invoice.currency);
 
 if (response.invoice.state === 'PENDING') {
 console.log('\n[COMPLETED] STK Push should have been sent to phone!');
 } else {
 console.log('\n[WARNING] State is not PENDING - check status');
 }
 }
 
 } catch (error) {
 console.log('\n=' .repeat(60));
 console.log('[FAILED] INTASEND ERROR');
 console.log('=' .repeat(60));
 console.log('Error Message:', error.message);
 console.log('Error Name:', error.name);
 console.log('Error Type:', typeof error);
 
 if (error.response) {
 console.log('\n HTTP Response:');
 console.log('Status:', error.response.status);
 console.log('Status Text:', error.response.statusText);
 console.log('Headers:', JSON.stringify(error.response.headers, null, 2));
 console.log('Data:', JSON.stringify(error.response.data, null, 2));
 }
 
 if (error.request) {
 console.log('\n Request was made but no response received');
 console.log('Request:', error.request);
 }
 
 console.log('\n[NOTE] Full Error Object:');
 console.log(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
 
 console.log('\n[SEARCH] Error Keys:', Object.keys(error));
 console.log('Error Properties:', Object.getOwnPropertyNames(error));
 }
}

debugIntaSend();
