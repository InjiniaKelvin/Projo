/**
 * DEBUG TEST - Check registration validation
 */

const API_BASE_URL = 'http://localhost:5000/api';

async function testRegistration() {
 console.log('Testing user registration...\n');
 
 // Test 1: Register client
 console.log('1. Registering client...');
 try {
 const clientData = {
 firstName: 'Test',
 lastName: 'Client',
 email: `client_${Date.now()}@test.com`,
 password: 'Test@1234',
 phoneNumber: '0700000001',
 role: 'client'
 };
 
 console.log('Sending data:', JSON.stringify(clientData, null, 2));
 
 const response = await fetch(`${API_BASE_URL}/auth/register`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(clientData)
 });

 const data = await response.json();
 console.log('Status:', response.status);
 console.log('Response:', JSON.stringify(data, null, 2));
 
 if (response.ok) {
 console.log('[COMPLETED] Client registration SUCCESS\n');
 return data.token;
 } else {
 console.log('[FAILED] Client registration FAILED\n');
 return null;
 }
 } catch (error) {
 console.log('[FAILED] Error:', error.message);
 return null;
 }
}

async function testTechnicianEndpoint(token) {
 if (!token) {
 console.log('[WARNING] Skipping technician endpoint test - no token');
 return;
 }

 console.log('2. Testing technician endpoint with client token...');
 try {
 const response = await fetch(`${API_BASE_URL}/technician/available-jobs`, {
 method: 'GET',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 }
 });

 const data = await response.json();
 console.log('Status:', response.status);
 console.log('Response:', JSON.stringify(data, null, 2));
 
 if (response.status === 403) {
 console.log('[COMPLETED] Correctly blocked client from technician routes\n');
 }
 } catch (error) {
 console.log('[FAILED] Error:', error.message);
 }
}

async function run() {
 const token = await testRegistration();
 await testTechnicianEndpoint(token);
}

run();
