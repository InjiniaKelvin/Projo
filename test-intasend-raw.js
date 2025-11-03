require('dotenv').config();
const IntaSend = require('intasend-node');

async function testRaw() {
 console.log(' RAW INTASEND API TEST\n');
 
 const publishableKey = process.env.INTASEND_PUBLISHABLE_KEY;
 const secretKey = process.env.INTASEND_SECRET_KEY;
 const isLive = process.env.INTASEND_ENV === 'live';
 
 console.log('Keys:', publishableKey?.substring(0, 20) + '...', secretKey?.substring(0, 20) + '...');
 console.log('Mode:', isLive ? 'LIVE' : 'SANDBOX');
 console.log('');
 
 try {
 // Initialize with boolean for test mode
 const intasend = new IntaSend(publishableKey, secretKey, isLive);
 console.log('[COMPLETED] IntaSend initialized');
 
 // Get collection instance
 const collection = intasend.collection();
 console.log('[COMPLETED] Collection initialized');
 console.log('Collection object:', collection);
 console.log('');
 
 // Try calling the method
 console.log('[CONTACT] Calling mpesaStkPush...\n');
 
 const result = await collection.mpesaStkPush({
 amount: 10,
 phone_number: '254794536984',
 email: 'test@example.com',
 api_ref: 'TEST_' + Date.now()
 });
 
 console.log('[COMPLETED] Result received!');
 console.log('Type:', typeof result);
 console.log('Value:', result);
 console.log('\nJSON:', JSON.stringify(result, null, 2));
 
 } catch (error) {
 console.log('[FAILED] Caught error!');
 console.log('Type:', typeof error);
 console.log('Value:', error);
 console.log('String:', String(error));
 
 if (error && typeof error === 'object') {
 console.log('\nError Object Properties:');
 console.log('- message:', error.message);
 console.log('- name:', error.name);
 console.log('- code:', error.code);
 console.log('- response:', error.response);
 
 if (error.response) {
 console.log('\nResponse Details:');
 console.log('- status:', error.response.status);
 console.log('- statusText:', error.response.statusText);
 console.log('- data:', error.response.data);
 }
 }
 
 console.log('\nAll properties:', Object.keys(error));
 console.log('All own properties:', Object.getOwnPropertyNames(error));
 }
}

testRaw().catch(err => {
 console.error('Unhandled error:', err);
});
