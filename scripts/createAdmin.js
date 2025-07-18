/**
 * Create Admin User Script
 * 
 * This script creates an admin user directly in the database
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const { User } = require('../backend/models');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickfix');
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@quickfix.com' },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      process.exit(0);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@quickfix.com',
      password: hashedPassword,
      phoneNumber: '+254712345678',
      role: 'admin',
      isVerified: true,
      isActive: true,
      profilePicture: null,
      location: {
        latitude: -1.286389,
        longitude: 36.817223,
        address: 'Nairobi, Kenya'
      },
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        language: 'en',
        currency: 'USD'
      }
    });

    await adminUser.save();

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@quickfix.com');
    console.log('🔑 Password: admin123');
    console.log('� Phone: +254712345678');
    console.log('�👤 Role: admin');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    console.log('');
    console.log('You can now log in to the admin dashboard with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
createAdminUser();
