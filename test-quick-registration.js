// Quick test to see registration response structure
const API_BASE_URL = 'http://localhost:5000/api';

async function testRegistration() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'QuickTest',
        lastName: 'User',
        email: `quicktest${Date.now()}@test.com`,
        phoneNumber: '+254799999999',
        password: 'Test@123',
        role: 'client'
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response structure:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRegistration();
