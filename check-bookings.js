const mongoose = require('mongoose');
require('dotenv').config();

// Import model
const Booking = require('./backend/models/Booking');

async function checkBookings() {
 try {
 await mongoose.connect(process.env.MONGO_URI);
 console.log('[COMPLETED] Connected to MongoDB\n');

 const bookings = await Booking.find({})
 .select('serviceName serviceType status technicianId urgency createdAt')
 .sort({ createdAt: -1 })
 .limit(10);

 console.log(`Found ${bookings.length} bookings:\n`);
 
 bookings.forEach((booking, index) => {
 console.log(`${index + 1}. ${booking.serviceName}`);
 console.log(` Status: ${booking.status}`);
 console.log(` Type: ${booking.serviceType}`);
 console.log(` Urgency: ${booking.urgency}`);
 console.log(` TechnicianId: ${booking.technicianId || 'null'}`);
 console.log(` Created: ${booking.createdAt}`);
 console.log('');
 });

 await mongoose.disconnect();
 } catch (error) {
 console.error('Error:', error.message);
 process.exit(1);
 }
}

checkBookings();
