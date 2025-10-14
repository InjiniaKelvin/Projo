/**
 * FAST AUTHENTICATION TEST
 * Tests registration and login speed with optimized bcrypt rounds
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: `speedtest.${Date.now()}@quickfix.test`,
  password: 'Test@1234',
  firstName: 'Speed',
  lastName: 'Test',
  phoneNumber: `+2547${Math.random().toString().slice(2, 10)}`,
  userType: 'client'
};

console.log('\n' + '='.repeat(80));
console.log('AUTHENTICATION SPEED TEST');
console.log('='.repeat(80) + '\n');

async function testAuth() {
  try {
    // TEST 1: REGISTRATION
    console.log('TEST 1: User Registration');
    console.log('-'.repeat(80));
    console.log('Email:', testUser.email);
    console.log('Phone:', testUser.phoneNumber);
    
    const regStart = Date.now();
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regEnd = Date.now();
    const regTime = regEnd - regStart;
    
    const registerResult = await registerResponse.json();
    
    if (registerResult.success) {
      console.log(`SUCCESS: User registered in ${regTime}ms`);
      console.log(`Status: ${regTime < 1000 ? 'FAST (< 1s)' : regTime < 2000 ? 'ACCEPTABLE (< 2s)' : 'SLOW (>= 2s)'}`);
      console.log('User ID:', registerResult.user._id);
    } else {
      console.log(`FAILED: ${registerResult.message}`);
      return;
    }
    
    console.log('\n');
    
    // TEST 2: LOGIN
    console.log('TEST 2: User Login');
    console.log('-'.repeat(80));
    console.log('Email:', testUser.email);
    
    const loginStart = Date.now();
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginEnd = Date.now();
    const loginTime = loginEnd - loginStart;
    
    const loginResult = await loginResponse.json();
    
    if (loginResult.success) {
      console.log(`SUCCESS: User logged in ${loginTime}ms`);
      console.log(`Status: ${loginTime < 500 ? 'BLAZING FAST (< 500ms)' : loginTime < 1000 ? 'FAST (< 1s)' : 'ACCEPTABLE (< 2s)'}`);
      console.log('Token received:', loginResult.token ? 'YES' : 'NO');
    } else {
      console.log(`FAILED: ${loginResult.message}`);
      return;
    }
    
    console.log('\n');
    
    // SUMMARY
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Registration: ${regTime}ms ${regTime < 1000 ? '[FAST]' : '[NEEDS OPTIMIZATION]'}`);
    console.log(`Login:        ${loginTime}ms ${loginTime < 500 ? '[BLAZING FAST]' : loginTime < 1000 ? '[FAST]' : '[ACCEPTABLE]'}`);
    console.log(`Total:        ${regTime + loginTime}ms`);
    
    if (regTime < 1000 && loginTime < 500) {
      console.log('\nRESULT: ALL TESTS PASSED - Authentication is optimized!');
    } else if (regTime < 2000 && loginTime < 1000) {
      console.log('\nRESULT: ACCEPTABLE - Consider further optimization');
    } else {
      console.log('\nRESULT: NEEDS OPTIMIZATION - Check bcrypt rounds and database');
    }
    console.log('='.repeat(80) + '\n');
    
    return loginResult.token;
    
  } catch (error) {
    console.error('\nERROR:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running. Start it with: node server.js');
    }
  }
}

// Run the test
testAuth();
