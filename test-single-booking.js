// Test a single booking to see validation errors
const API_BASE_URL = 'http://localhost:5000/api';

async function testBooking() {
  const timestamp = Date.now();
  const phoneNumber = `+2547${String(timestamp).slice(-8)}`;
  
  // First create a client
  const regResponse = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'TestBooking',
      lastName: 'Client',
      email: `testbooking${timestamp}@test.com`,
      phoneNumber: phoneNumber,
      password: 'Test@123',
      role: 'client'
    })
  });

  const regData = await regResponse.json();
  console.log('Registration status:', regResponse.status);
  
  if (!regData.data?.tokens) {
    console.log('Registration failed:', regData);
    return;
  }

  const token = regData.data.tokens.accessToken;
  console.log('Got token:', token.substring(0, 20) + '...');

  // Try to create a booking
  const bookingData = {
    serviceType: 'plumbing',
    serviceName: 'Pipe Repair',
    serviceDescription: 'Leaking pipe in kitchen sink, water dripping constantly. Need immediate repair as water is damaging cabinet.',
    urgency: 'emergency',
    location: { 
      latitude: -1.2921, 
      longitude: 36.8219, 
      estate: 'Westlands', 
      address: 'ABC Mall, Waiyaki Way',
      constituency: 'Westlands',
      ward: 'Parklands/Highridge',
      road: 'Waiyaki Way',
      description: 'Near ABC Mall'
    },
    price: 2500,
    clientName: 'TestBooking Client',
    clientPhone: phoneNumber,
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTimeSlot: 'emergency-asap',
    isCritical: true
  };

  console.log('\nSending booking data:');
  console.log(JSON.stringify(bookingData, null, 2));

  const bookingResponse = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });

  const bookingResult = await bookingResponse.json();
  console.log('\nBooking response status:', bookingResponse.status);
  console.log('Booking response:');
  console.log(JSON.stringify(bookingResult, null, 2));
}

testBooking();
