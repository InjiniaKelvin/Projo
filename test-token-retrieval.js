/**
 * TEST TOKEN RETRIEVAL FROM LOCALSTORAGE
 * 
 * This script simulates what happens when the booking form tries to get the token
 */

console.log('\n========================================');
console.log('TOKEN RETRIEVAL TEST');
console.log('========================================\n');

// Check if we're in a browser-like environment
if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
  console.log('❌ Cannot test - Not in browser environment');
  console.log('   This test must be run in the browser console\n');
  console.log('To test manually:');
  console.log('1. Open browser console on http://localhost:8081');
  console.log('2. Run: localStorage.getItem("authToken")');
  console.log('3. Should return a JWT token string\n');
  process.exit(1);
}

// If we get here, we're in a browser
console.log('✓ Browser environment detected\n');

// Check for token with different keys
const keys = ['token', 'authToken', 'userData'];

console.log('Checking localStorage for auth data:\n');

keys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value) {
    console.log(`✓ ${key}: Found`);
    if (key === 'authToken' || key === 'token') {
      // Show first/last few characters of token
      console.log(`  Value: ${value.substring(0, 20)}...${value.substring(value.length - 10)}`);
    } else {
      // For userData, show the parsed object
      try {
        const parsed = JSON.parse(value);
        console.log(`  Data: ${JSON.stringify(parsed, null, 2).substring(0, 100)}...`);
      } catch (e) {
        console.log(`  Value: ${value.substring(0, 50)}...`);
      }
    }
  } else {
    console.log(`✗ ${key}: Not found`);
  }
});

console.log('\n========================================\n');
