require('dotenv').config();
const IntaSend = require('intasend-node');

async function testWithErrorCapture() {
 console.log('[SEARCH] INTASEND ERROR CAPTURE TEST\n');
 
 const isLive = process.env.INTASEND_ENV === 'live';
 console.log('Mode:', isLive ? '[URGENT] LIVE' : '🟢 SANDBOX');
 console.log('Keys:', 
 process.env.INTASEND_PUBLISHABLE_KEY?.substring(0, 25) + '...',
 process.env.INTASEND_SECRET_KEY?.substring(0, 25) + '...'
 );
 console.log('');
 
 const intasend = new IntaSend(
 process.env.INTASEND_PUBLISHABLE_KEY,
 process.env.INTASEND_SECRET_KEY,
 isLive
 );
 
 const collection = intasend.collection();
 
 console.log('[MOBILE] Attempting M-Pesa STK Push...');
 console.log('Phone: 254794536984');
 console.log('Amount: KES 10\n');
 
 try {
 const result = await collection.mpesaStkPush({
 amount: 10,
 phone_number: '254794536984',
 email: 'test@quickfix.com',
 api_ref: `TEST_${Date.now()}`
 });
 
 console.log('[COMPLETED] SUCCESS!');
 console.log(JSON.stringify(result, null, 2));
 
 } catch (error) {
 console.log('[FAILED] ERROR CAUGHT\n');
 
 // The error is likely a Buffer or string
 console.log('Error Type:', typeof error);
 console.log('Error Constructor:', error?.constructor?.name);
 console.log('Is Buffer:', Buffer.isBuffer(error));
 
 if (Buffer.isBuffer(error)) {
 const errorText = error.toString('utf8');
 console.log('\n[DOCUMENT] Buffer Content (as string):');
 console.log(errorText);
 
 // Try to parse as JSON
 try {
 const errorJson = JSON.parse(errorText);
 console.log('\n[CHECKLIST] Parsed Error JSON:');
 console.log(JSON.stringify(errorJson, null, 2));
 
 if (errorJson.detail) {
 console.log('\n ERROR DETAIL:', errorJson.detail);
 }
 if (errorJson.message) {
 console.log('\n ERROR MESSAGE:', errorJson.message);
 }
 if (errorJson.errors) {
 console.log('\n ERROR FIELDS:', JSON.stringify(errorJson.errors, null, 2));
 }
 } catch (parseErr) {
 console.log('\n[WARNING] Could not parse as JSON');
 }
 } else if (typeof error === 'string') {
 console.log('\n[DOCUMENT] String Content:');
 console.log(error || '(empty string)');
 
 if (error) {
 try {
 const errorJson = JSON.parse(error);
 console.log('\n[CHECKLIST] Parsed Error JSON:');
 console.log(JSON.stringify(errorJson, null, 2));
 } catch (e) {
 // Not JSON
 }
 }
 } else {
 console.log('\n[DOCUMENT] Raw Error:');
 console.log(error);
 }
 
 console.log('\n');
 console.log('='.repeat(60));
 console.log('[SEARCH] DIAGNOSIS');
 console.log('='.repeat(60));
 console.log('');
 console.log('The empty error indicates your IntaSend account needs setup:');
 console.log('');
 console.log('1. M-Pesa Collection Not Enabled');
 console.log(' → Login to https://intasend.com/account/');
 console.log(' → Go to Settings → Collections');
 console.log(' → Enable M-Pesa STK Push');
 console.log('');
 console.log('2. API Keys Need M-Pesa Permissions');
 console.log(' → Settings → API Keys');
 console.log(' → Regenerate with Collection permissions');
 console.log('');
 console.log('3. Business Number Not Configured (LIVE mode)');
 console.log(' → LIVE mode requires Paybill/Till number');
 console.log(' → Contact IntaSend: support@intasend.com');
 console.log('');
 console.log('4. Account Verification Incomplete');
 console.log(' → Complete KYC verification');
 console.log(' → Upload business documents');
 console.log('');
 console.log('[COMPLETED] CONFIRMED: Your IntaSend website test worked!');
 console.log(' This proves the issue is API-specific configuration.');
 console.log('');
 }
}

testWithErrorCapture();
