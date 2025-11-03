/**
 * Fix Admin User Password Script
 * This script updates the admin user password to ensure proper hashing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../backend/models');

async function fixAdminPassword() {
 try {
 console.log(' Connecting to MongoDB...');
 await mongoose.connect(process.env.MONGODB_URI);
 console.log(' Connected to MongoDB');

 // Find the admin user
 const admin = await User.findOne({ email: 'admin@quickfix.com' });
 
 if (!admin) {
 console.error(' Admin user not found');
 process.exit(1);
 }

 console.log(' Found admin user:', admin.email);

 // Hash the password properly using the same method as the User model
 const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
 const hashedPassword = await bcrypt.hash('admin123', saltRounds);

 // Update the admin user password directly in database to avoid double hashing
 await User.updateOne(
 { email: 'admin@quickfix.com' },
 { $set: { password: hashedPassword } }
 );

 // Fetch the updated user
 const updatedAdmin = await User.findOne({ email: 'admin@quickfix.com' });

 // Test the password
 const isValid = await updatedAdmin.comparePassword('admin123');
 console.log(' Password updated successfully');
 console.log(' Password verification test:', isValid ? 'PASSED' : 'FAILED');

 if (isValid) {
 console.log(' Admin password fixed successfully!');
 console.log(' Email: admin@quickfix.com');
 console.log(' Password: admin123');
 console.log(' Phone: +254712345678');
 console.log(' Role: admin');
 } else {
 console.error(' Password fix failed - verification still failing');
 }

 } catch (error) {
 console.error(' Error fixing admin password:', error);
 } finally {
 console.log(' Database connection closed');
 await mongoose.connection.close();
 process.exit(0);
 }
}

fixAdminPassword();
