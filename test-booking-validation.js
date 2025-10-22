// Test booking creation to see validation errors
const API_BASE_URL = 'http://localhost:5000/api';

async function testBooking() {
  // First register and login a client
  const registerRes = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'TestBooking',
      lastName: 'User',
      email: `testbooking${Date.now()}@test.com`,
      phoneNumber: '+254700000001',
      password: 'Test@123',
      role: 'client'
    })
  });

  const registerData = await registerRes.json();
  console.log('Registration:', registerRes.status, registerData.message);
  
  if (!registerData.data?.tokens?.accessToken) {
    console.error('No token received');
    return;
  }

  const token = registerData.data.tokens.accessToken;

  // Now try to create a booking
  const bookingData = {
    serviceType: 'plumbing',
    serviceName: 'Test Pipe Repair',
    serviceDescription: 'This is a test booking with minimum 10 characters description.',
    urgency: 'medium',
    price: 2500,
    clientName: 'TestBooking User',
    clientPhone: '+254700000001',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTimeSlot: 'morning',
    isCritical: false,
    location: {
      latitude: -1.2921,
      longitude: 36.8219,
      estate: 'Westlands',
      address: 'ABC Mall, Waiyaki Way',
      constituency: 'Westlands',
      ward: 'Parklands/Highridge',
      road: 'Waiyaki Way',
      locationDescription: 'Near ABC Mall entrance'
    }
  };

  console.log('\nSending booking data:');
  console.log(JSON.stringify(bookingData, null, 2));

  const bookingRes = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });

  const bookingResult = await bookingRes.json();
  console.log('\nBooking Response:', bookingRes.status);
  console.log(JSON.stringify(bookingResult, null, 2));
}

testBooking().catch(console.error);
