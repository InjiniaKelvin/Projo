/**
 * Clean up test users from database before running E2E tests
 * Run: node cleanup-test-users.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./backend/models/User');
const Wallet = require('./backend/models/Wallet');
const Booking = require('./backend/models/Booking');

async function cleanupTestUsers() {
 try {
 // Connect to MongoDB
 await mongoose.connect(process.env.MONGO_URI);
 console.log('[COMPLETED] Connected to MongoDB');

 // Delete test users
 const testEmails = [
 'john.client@quickfix.test',
 'jane.client@quickfix.test',
 'bob.client@quickfix.test',
 'alice.client@quickfix.test',
 'charlie.client@quickfix.test',
 'mike.tech@quickfix.test',
 'sarah.tech@quickfix.test',
 'david.tech@quickfix.test'
 ];

 console.log('\n Deleting test users...');
 
 // Find users first to get their IDs
 const users = await User.find({ email: { $in: testEmails } });
 const userIds = users.map(u => u._id);
 const walletIds = users.map(u => u.walletId).filter(Boolean);

 console.log(`Found ${users.length} test users`);

 // Delete associated data
 if (userIds.length > 0) {
 const bookingsDeleted = await Booking.deleteMany({ userId: { $in: userIds } });
 console.log(`[COMPLETED] Deleted ${bookingsDeleted.deletedCount} bookings`);
 
 const techBookingsDeleted = await Booking.deleteMany({ technicianId: { $in: userIds } });
 console.log(`[COMPLETED] Deleted ${techBookingsDeleted.deletedCount} technician bookings`);
 }

 if (walletIds.length > 0) {
 const walletsDeleted = await Wallet.deleteMany({ _id: { $in: walletIds } });
 console.log(`[COMPLETED] Deleted ${walletsDeleted.deletedCount} wallets`);
 }

 // Delete users
 const result = await User.deleteMany({ email: { $in: testEmails } });
 console.log(`[COMPLETED] Deleted ${result.deletedCount} test users\n`);

 console.log('[COMPLETED] Cleanup complete! Ready to run E2E tests.');

 } catch (error) {
 console.error('[FAILED] Error during cleanup:', error.message);
 } finally {
 await mongoose.disconnect();
 console.log('[COMPLETED] Disconnected from MongoDB');
 process.exit(0);
 }
}

cleanupTestUsers();
