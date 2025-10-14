// Test MongoDB Atlas Connection
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('\n🧪 Testing MongoDB Atlas connection...\n');
    
    // Mask password in log
    const uri = process.env.MONGO_URI;
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log('Connecting to:', maskedUri);
    console.log('');
    
    // Connect with timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ MongoDB Atlas connection successful!');
    console.log('');
    
    // Get database info
    const dbName = mongoose.connection.db.databaseName;
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📚 Database:', dbName);
    console.log('📊 Collections:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None yet (will be created automatically)');
    console.log('');
    
    // Test write operation
    console.log('🧪 Testing write operation...');
    const TestModel = mongoose.model('Test', new mongoose.Schema({ test: String }));
    await TestModel.create({ test: 'Connection test from QuickFix' });
    console.log('✅ Write test successful!');
    
    // Cleanup
    await TestModel.deleteMany({ test: 'Connection test from QuickFix' });
    
    await mongoose.disconnect();
    console.log('✅ Test complete! Your MongoDB Atlas is ready.\n');
    
    console.log('═══════════════════════════════════════════════');
    console.log('Next step: Restart your backend server');
    console.log('  → node server.js');
    console.log('═══════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('Authentication failed')) {
      console.error('🔒 Authentication Issue:');
      console.error('   → Check your password is correct');
      console.error('   → Verify user exists in Database Access');
      console.error('   → Ensure special characters are URL-encoded');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('🌐 Network Issue:');
      console.error('   → Check your internet connection');
      console.error('   → Verify IP whitelist (0.0.0.0/0)');
      console.error('   → Check cluster is active (not paused)');
    } else if (error.message.includes('timeout')) {
      console.error('⏱️ Timeout Issue:');
      console.error('   → Cluster may be paused or starting');
      console.error('   → Check MongoDB Atlas dashboard');
      console.error('   → Wait a few minutes and try again');
    }
    
    console.error('');
    process.exit(1);
  }
}

testConnection();
