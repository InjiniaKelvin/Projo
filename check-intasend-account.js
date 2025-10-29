require('dotenv').config();
const IntaSend = require('intasend-node');

async function checkAccount() {
 console.log('[SEARCH] INTASEND ACCOUNT CHECK\n');
 console.log('='.repeat(60));
 console.log('Publishable Key:', process.env.INTASEND_PUBLISHABLE_KEY?.substring(0, 30) + '...');
 console.log('Secret Key:', process.env.INTASEND_SECRET_KEY?.substring(0, 30) + '...');
 console.log('Environment:', process.env.INTASEND_ENV);
 console.log('='.repeat(60));
 
 try {
 const intasend = new IntaSend(
 process.env.INTASEND_PUBLISHABLE_KEY,
 process.env.INTASEND_SECRET_KEY,
 process.env.INTASEND_ENV === 'live'
 );
 
 console.log('\n[COMPLETED] IntaSend client initialized\n');
 
 // Try to initialize collection
 console.log(' Testing Collection API...');
 const collection = intasend.collection();
 console.log('[COMPLETED] Collection initialized');
 
 // Test with minimum amount
 console.log('\n[PAYMENT] Testing with KES 1 (minimum amount)...');
 console.log('Phone: 254794536984');
 console.log('Amount: 1 KES\n');
 
 const testData = {
 amount: 1,
 phone_number: '254794536984',
 email: 'test@quickfix.com',
 api_ref: `TEST_${Date.now()}`
 };
 
 console.log('Request:', JSON.stringify(testData, null, 2));
 console.log('\n[IN PROGRESS] Sending request...\n');
 
 const result = await collection.mpesaStkPush(testData);
 
 console.log('='.repeat(60));
 console.log(' RESPONSE RECEIVED');
 console.log('='.repeat(60));
 console.log('Type:', typeof result);
 console.log('Value:', result);
 console.log('\nJSON:', JSON.stringify(result, null, 2));
 
 if (result && result.invoice) {
 console.log('\n[COMPLETED] STK Push request accepted!');
 console.log('Invoice ID:', result.invoice.invoice_id);
 console.log('State:', result.invoice.state);
 } else if (typeof result === 'string' && result === '') {
 console.log('\n[FAILED] Empty string returned - This indicates an API error');
 console.log('\n[SEARCH] POSSIBLE CAUSES:');
 console.log('1. M-Pesa collection not enabled on your IntaSend account');
 console.log('2. Phone number not whitelisted (LIVE mode requirement)');
 console.log('3. Business shortcode/paybill not configured');
 console.log('4. Account verification incomplete');
 console.log('5. API keys don\'t have M-Pesa permissions');
 console.log('\n NEXT STEPS:');
 console.log('1. Login to https://intasend.com/account/');
 console.log('2. Go to Settings → API Keys');
 console.log('3. Check M-Pesa collection status');
 console.log('4. Enable M-Pesa if not enabled');
 console.log('5. Add phone 254794536984 to whitelist if required');
 console.log('6. Contact IntaSend support: support@intasend.com');
 }
 
 } catch (error) {
 console.log('\n[FAILED] ERROR OCCURRED');
 console.log('='.repeat(60));
 console.log('Error type:', typeof error);
 console.log('Error value:', error);
 
 if (error && typeof error === 'object') {
 console.log('\nError details:');
 console.log('- Message:', error.message);
 console.log('- Name:', error.name);
 console.log('- Stack:', error.stack);
 
 if (error.response) {
 console.log('\nHTTP Response:');
 console.log('- Status:', error.response.status);
 console.log('- Data:', JSON.stringify(error.response.data, null, 2));
 }
 }
 }
}

checkAccount();
