/**
 * MongoDB Atlas Connection Test
 * 
 * Quick script to verify MongoDB Atlas connectivity
 * Run: node test-mongo-connection.js
 */

const mongoose = require('mongoose');

const uri = 'mongodb+srv://ENG_Kelvin:QuickFix%402025@cluster0quickfix.p5exnhe.mongodb.net/quickfix?retryWrites=true&w=majority';

console.log('🔄 Testing MongoDB Atlas connection...');
console.log('📍 Cluster: cluster0quickfix.p5exnhe.mongodb.net');
console.log('⏱️  Timeout: 30 seconds\n');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 75000,
  connectTimeoutMS: 30000,
  family: 4
})
.then(() => {
  console.log('✅ CONNECTION SUCCESSFUL!');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🖥️  Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  console.log(`⚡ Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Unknown'}\n`);
  
  // Test a simple query
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('✅ Database ping successful!\n');
  console.log('🎉 MongoDB Atlas is working correctly!');
  console.log('💡 You can now run: node server.js\n');
  return mongoose.disconnect();
})
.then(() => {
  console.log('👋 Disconnected gracefully');
  process.exit(0);
})
.catch(err => {
  console.error('❌ CONNECTION FAILED!\n');
  console.error('Error Type:', err.name);
  console.error('Error Message:', err.message);
  
  if (err.name === 'MongoServerSelectionError') {
    console.error('\n🔧 TROUBLESHOOTING STEPS:');
    console.error('1. Check MongoDB Atlas Network Access:');
    console.error('   - Go to: https://cloud.mongodb.com');
    console.error('   - Navigate to: Network Access');
    console.error('   - Add IP: 62.24.120.159 (your current IP)');
    console.error('   - OR allow all: 0.0.0.0/0');
    console.error('2. Verify cluster is ACTIVE (not paused)');
    console.error('3. Check internet connectivity');
    console.error('4. Try again in 2 minutes after whitelisting IP\n');
  }
  
  process.exit(1);
});
