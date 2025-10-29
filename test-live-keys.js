require('dotenv').config();
const IntaSend = require('intasend-node');

async function testLiveMode() {
 console.log('[SEARCH] INTASEND LIVE MODE TEST\n');
 
 const publishableKey = 'ISPubKey_live_a8e1266e-b13c-46f2-895c-7f06e2b52ff5';
 const secretKey = 'ISSecretKey_live_9543caf6-ec49-4803-959e-f3ef89f97640';
 
 console.log('Publishable Key:', publishableKey.substring(0, 30) + '...');
 console.log('Secret Key:', secretKey.substring(0, 30) + '...');
 console.log('Key Type: LIVE\n');
 
 // Test 1: Initialize with test_mode = false (should use production)
 console.log('Test 1: Initializing with test_mode = false');
 const intasend1 = new IntaSend(publishableKey, secretKey, false);
 const collection1 = intasend1.collection();
 console.log('Collection test_mode:', collection1.test_mode);
 console.log('Collection prod_base_url:', collection1.prod_base_url);
 console.log('Collection test_base_url:', collection1.test_base_url);
 console.log('');
 
 // Test 2: Initialize with test_mode = true (should use sandbox)
 console.log('Test 2: Initializing with test_mode = true');
 const intasend2 = new IntaSend(publishableKey, secretKey, true);
 const collection2 = intasend2.collection();
 console.log('Collection test_mode:', collection2.test_mode);
 console.log('');
 
 // Test 3: Try STK push with test_mode = false
 console.log('Test 3: Attempting STK Push with test_mode = false\n');
 console.log('[MOBILE] Sending M-Pesa STK Push...');
 console.log('Phone: 254794536984');
 console.log('Amount: KES 10\n');
 
 try {
 const result = await collection1.mpesaStkPush({
 amount: 10,
 phone_number: '254794536984',
 email: 'test@quickfix.com',
 api_ref: `LIVE_TEST_${Date.now()}`
 });
 
 console.log('[COMPLETED] SUCCESS!');
 console.log(JSON.stringify(result, null, 2));
 
 if (result.invoice) {
 console.log('\n[SUCCESS] STK PUSH SENT TO PHONE!');
 console.log('Invoice ID:', result.invoice.invoice_id);
 console.log('State:', result.invoice.state);
 console.log('Amount:', result.invoice.value, result.invoice.currency);
 }
 
 } catch (error) {
 console.log('[FAILED] ERROR\n');
 
 if (Buffer.isBuffer(error)) {
 const errorText = error.toString('utf8');
 console.log('Error Message:', errorText);
 
 try {
 const errorJson = JSON.parse(errorText);
 console.log('\nParsed Error:');
 console.log(JSON.stringify(errorJson, null, 2));
 
 if (errorJson.errors && errorJson.errors[0]) {
 console.log('\n Error Detail:', errorJson.errors[0].detail);
 }
 } catch (e) {
 // Not JSON
 }
 } else {
 console.log('Error:', error);
 }
 }
}

testLiveMode();
