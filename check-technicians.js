const mongoose = require('mongoose');
require('dotenv').config();

// Import model
const User = require('./backend/models/User');

async function checkTechnicians() {
 try {
 await mongoose.connect(process.env.MONGO_URI);
 console.log('[COMPLETED] Connected to MongoDB\n');

 const technicians = await User.find({ role: 'technician' })
 .select('firstName lastName email skills')
 .sort({ createdAt: -1 })
 .limit(10);

 console.log(`Found ${technicians.length} technicians:\n`);
 
 technicians.forEach((tech, index) => {
 console.log(`${index + 1}. ${tech.firstName} ${tech.lastName}`);
 console.log(` Email: ${tech.email}`);
 console.log(` Skills: ${tech.skills.join(', ') || 'NONE'}`);
 console.log('');
 });

 await mongoose.disconnect();
 } catch (error) {
 console.error('Error:', error.message);
 process.exit(1);
 }
}

checkTechnicians();
