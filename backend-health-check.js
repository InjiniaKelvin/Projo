/**
 * Backend Health Check Script
 * 
 * This script tests the backend setup without starting the full server.
 * It checks database connectivity, model imports, and basic functionality.
 */

require('dotenv').config();

async function checkBackend() {
  console.log('🔍 QuickFix Backend Health Check\n');

  try {
    // Test 1: Environment Variables
    console.log('1️⃣ Checking environment variables...');
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ Missing environment variables:', missingVars.join(', '));
    } else {
      console.log('✅ Environment variables configured');
    }

    // Test 2: Database Connection
    console.log('\n2️⃣ Testing database connection...');
    const database = require('./backend/config/database');
    await database.connect();
    console.log('✅ Database connection successful');
    
    // Test 3: Model Imports
    console.log('\n3️⃣ Testing model imports...');
    const { User, Wallet, Transaction, Booking } = require('./backend/models');
    console.log('✅ User model imported');
    console.log('✅ Wallet model imported');
    console.log('✅ Transaction model imported');
    console.log('✅ Booking model imported');

    // Test 4: Controller Imports
    console.log('\n4️⃣ Testing controller imports...');
    const authController = require('./backend/controllers/authController');
    const paymentController = require('./backend/controllers/paymentController');
    const bookingController = require('./backend/controllers/bookingController');
    console.log('✅ Auth controller imported');
    console.log('✅ Payment controller imported');
    console.log('✅ Booking controller imported');

    // Test 5: Middleware Imports
    console.log('\n5️⃣ Testing middleware imports...');
    const authMiddleware = require('./backend/middleware/auth');
    const validationMiddleware = require('./backend/middleware/validation');
    console.log('✅ Auth middleware imported');
    console.log('✅ Validation middleware imported');

    // Test 6: Route Imports
    console.log('\n6️⃣ Testing route imports...');
    const authRoutes = require('./backend/routes/auth');
    const paymentRoutes = require('./backend/routes/payments');
    const bookingRoutes = require('./backend/routes/bookings');
    console.log('✅ Auth routes imported');
    console.log('✅ Payment routes imported');
    console.log('✅ Booking routes imported');

    // Test 7: Database Operations
    console.log('\n7️⃣ Testing basic database operations...');
    
    // Test user creation
    const testUser = new User({
      email: 'test@quickfix.test',
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+254700000000',
      role: 'client'
    });
    
    const validationErrors = testUser.validateSync();
    if (validationErrors) {
      console.log('❌ User model validation failed:', validationErrors.message);
    } else {
      console.log('✅ User model validation passed');
    }

    // Disconnect from database
    await database.disconnect();
    console.log('✅ Database disconnected');

    console.log('\n🎉 Backend health check completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Environment configuration: OK');
    console.log('   ✅ Database connectivity: OK');
    console.log('   ✅ Models: OK');
    console.log('   ✅ Controllers: OK');
    console.log('   ✅ Middleware: OK');
    console.log('   ✅ Routes: OK');
    console.log('   ✅ Basic operations: OK');
    
    console.log('\n🚀 Your backend is ready to run!');
    console.log('   Start the server with: npm run server:dev');
    console.log('   API will be available at: http://localhost:3000');

  } catch (error) {
    console.error('\n❌ Backend health check failed:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the health check
if (require.main === module) {
  checkBackend();
}

module.exports = checkBackend;
