/**
 * Simple integration test for redesigned booking system
 */

const axios = require('axios');

const testData = {
  clientName: 'Test User',
  clientPhone: '0712345678',
  clientEmail: 'test@example.com',
  serviceType: 'plumbing',
  serviceDescription: 'Test booking for system validation',
  urgency: 'normal',
  location: {
    constituency: 'Starehe',
    ward: 'Nairobi Central',
    road: 'Test Street',
    description: 'Test location',
    landmarks: 'Near test landmark'
  },
  preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  preferredTimeSlot: '10:00-12:00',
  specialRequirements: 'Test requirements'
};

async function testRedesignedSystem() {
  try {
    console.log('🧪 Testing redesigned booking system...');
    
    const response = await axios.post('http://localhost:3000/api/bookings-redesigned/redesigned', testData);
    
    if (response.data.success) {
      console.log('✅ Test booking created successfully!');
      console.log('📋 Booking ID:', response.data.data.bookingId);
      console.log('📱 Client Phone:', response.data.data.clientPhone);
      return true;
    } else {
      console.log('❌ Test failed:', response.data.message);
      return false;
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Test failed with status:', error.response.status);
      console.log('📝 Error message:', error.response.data.message);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to server. Make sure backend is running on port 3000');
    } else {
      console.log('❌ Test failed:', error.message);
    }
    return false;
  }
}

if (require.main === module) {
  testRedesignedSystem();
}

module.exports = { testRedesignedSystem };
