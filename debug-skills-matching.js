const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./backend/models/User');
const Booking = require('./backend/models/Booking');

async function debugSkillsMatching() {
 try {
 await mongoose.connect(process.env.MONGO_URI);
 console.log('[COMPLETED] Connected to MongoDB\n');

 // Get Mike's skills
 const mike = await User.findOne({ email: 'mike.tech@quickfix.test' });
 console.log('Mike\'s skills:', mike.skills.map(s => s.name));
 
 // Get all bookings
 const bookings = await Booking.find({ status: 'submitted', technicianId: null })
 .select('serviceName serviceType status');
 
 console.log('\nAvailable bookings:');
 bookings.forEach(b => {
 console.log(` - ${b.serviceName} (${b.serviceType})`);
 });

 // Test the query Mike would use
 const mikeSkills = mike.skills.map(s => s.name);
 console.log('\nMike query would be: serviceType: { $in:', mikeSkills, '}');
 
 const mikeJobs = await Booking.find({
 status: 'submitted',
 technicianId: null,
 serviceType: { $in: mikeSkills }
 });
 
 console.log(`\nMike would see ${mikeJobs.length} jobs:`);
 mikeJobs.forEach(j => console.log(` - ${j.serviceName} (${j.serviceType})`));

 await mongoose.disconnect();
 } catch (error) {
 console.error('Error:', error.message);
 process.exit(1);
 }
}

debugSkillsMatching();
