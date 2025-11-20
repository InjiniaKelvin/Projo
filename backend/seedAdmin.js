const mongoose = require('mongoose');
const User = require('./models/User');
const Wallet = require('./models/Wallet');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quickfix');
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@quickfix.com';
    const adminPassword = 'admin123';

    // Check if admin exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log('Admin user already exists');
      // Update password if needed
      admin.password = adminPassword;
      await admin.save();
      console.log('Admin password updated');
    } else {
      // Create new admin
      admin = await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: adminPassword,
        phoneNumber: '0700000000',
        role: 'admin',
        isVerified: true,
        isEmailVerified: true,
        isPhoneVerified: true
      });
      console.log('Admin user created successfully');
    }

    // Ensure admin has a wallet
    let wallet = await Wallet.findOne({ userId: admin._id });
    if (!wallet) {
      await Wallet.create({
        userId: admin._id,
        balance: {
          available: 1000000, // Seed with some funds
          pending: 0,
          escrow: 0
        },
        currency: 'KES',
        isActive: true
      });
      console.log('Admin wallet created');
    } else {
        console.log('Admin wallet already exists');
    }

    console.log('Admin seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
