/**
 * Database Reset Script
 * 
 * This script resets the MongoDB database by dropping all collections.
 * Use with caution as this will delete all data.
 */

require('dotenv').config();
const database = require('../backend/config/database');
const { User, Wallet, Booking, Transaction } = require('../backend/models');

async function resetDatabase() {
  try {
    console.log('  Starting database reset...');
    console.log(' This will delete ALL data from the database!');
    
    // Connect to database
    await database.connect();
    
    // Drop all collections
    console.log(' Dropping collections...');
    
    await User.deleteMany({});
    console.log(' Users collection cleared');
    
    await Wallet.deleteMany({});
    console.log(' Wallets collection cleared');
    
    await Booking.deleteMany({});
    console.log(' Bookings collection cleared');
    
    await Transaction.deleteMany({});
    console.log(' Transactions collection cleared');
    
    console.log(' Database reset completed successfully!');
    console.log(' Run "npm run db:seed" to populate with sample data');
    
  } catch (error) {
    console.error(' Database reset failed:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

// Run reset if called directly
if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;
