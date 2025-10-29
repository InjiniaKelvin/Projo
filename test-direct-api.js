require('dotenv').config();
const https = require('https');

async function directAPITest() {
 console.log('[SEARCH] DIRECT INTASEND API TEST (No SDK)\n');
 console.log('Testing direct HTTP request to IntaSend API\n');
 
 const publishableKey = 'ISPubKey_live_a8e1266e-b13c-46f2-895c-7f06e2b52ff5';
 const secretKey = 'ISSecretKey_live_9543caf6-ec49-4803-959e-f3ef89f97640';
 
 const payload = {
 amount: 10,
 phone_number: '254794536984',
 email: 'test@quickfix.com',
 api_ref: `DIRECT_TEST_${Date.now()}`,
 method: 'M-PESA',
 currency: 'KES',
 public_key: publishableKey
 };
 
 console.log('Request Payload:');
 console.log(JSON.stringify(payload, null, 2));
 console.log('');
 
 const options = {
 hostname: 'sandbox.intasend.com', // SANDBOX for testing connectivity
 port: 443,
 path: '/api/v1/payment/mpesa-stk-push/',
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${secretKey}`,
 'INTASEND_PUBLIC_API_KEY': publishableKey
 }
 };
 
 console.log('Request Details:');
 console.log('Host:', options.hostname, '(LIVE)');
 console.log('Path:', options.path);
 console.log('Method:', options.method);
 console.log('Auth Header:', 'Bearer ' + secretKey.substring(0, 30) + '...');
 console.log('Public Key Header:', publishableKey.substring(0, 30) + '...');
 console.log('');
 
 return new Promise((resolve, reject) => {
 const req = https.request(options, (res) => {
 console.log(' Response Received');
 console.log('Status Code:', res.statusCode);
 console.log('Status Message:', res.statusMessage);
 console.log('Headers:', JSON.stringify(res.headers, null, 2));
 console.log('');
 
 let data = '';
 
 res.on('data', (chunk) => {
 data += chunk;
 });
 
 res.on('end', () => {
 console.log('Response Body:');
 console.log(data);
 console.log('');
 
 if (res.statusCode === 200 || res.statusCode === 201) {
 try {
 const result = JSON.parse(data);
 console.log('[COMPLETED] SUCCESS!');
 console.log(JSON.stringify(result, null, 2));
 
 if (result.invoice) {
 console.log('\n[SUCCESS] STK PUSH INITIATED!');
 console.log('Invoice ID:', result.invoice.invoice_id);
 console.log('State:', result.invoice.state);
 console.log('Check your phone:', '0794536984');
 }
 } catch (e) {
 console.log('[COMPLETED] Success but could not parse JSON');
 }
 resolve(data);
 } else {
 console.log('[FAILED] HTTP ERROR:', res.statusCode);
 
 try {
 const errorData = JSON.parse(data);
 console.log('\n[CHECKLIST] Error Details:');
 console.log(JSON.stringify(errorData, null, 2));
 
 if (errorData.errors) {
 console.log('\n Errors:');
 errorData.errors.forEach(err => {
 console.log(` - ${err.code}: ${err.detail}`);
 });
 }
 } catch (e) {
 console.log('Could not parse error response');
 }
 
 reject(new Error(`HTTP ${res.statusCode}: ${data}`));
 }
 });
 });
 
 req.on('error', (error) => {
 console.log('[FAILED] REQUEST ERROR');
 console.log(error);
 reject(error);
 });
 
 req.write(JSON.stringify(payload));
 req.end();
 });
}

directAPITest()
 .then(() => console.log('\n[COMPLETED] Test complete'))
 .catch(err => console.log('\n[FAILED] Test failed:', err.message));
