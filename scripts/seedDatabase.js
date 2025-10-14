/**
 * Database Seeding Script
 * 
 * This script seeds the MongoDB database with sample data
 * for development and testing purposes.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Wallet, Booking, Transaction } = require('../backend/models');
const database = require('../backend/config/database');

// Sample data
const sampleUsers = [
  {
    email: 'john.client@test.com',
    password: 'Password123',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '0712345678',
    role: 'client',
    isActive: true,
    isVerified: true,
    isEmailVerified: true,
    location: {
      type: 'Point',
      coordinates: [36.8219, -1.2921] // Nairobi coordinates
    },
    address: {
      street: '123 Kenyatta Avenue',
      city: 'Nairobi',
      county: 'Nairobi',
      country: 'Kenya'
    }
  },
  {
    email: 'jane.client@test.com',
    password: 'Password123',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '0723456789',
    role: 'client',
    isActive: true,
    isVerified: true,
    isEmailVerified: true,
    location: {
      type: 'Point',
      coordinates: [36.8256, -1.2884]
    },
    address: {
      street: '456 Uhuru Highway',
      city: 'Nairobi',
      county: 'Nairobi',
      country: 'Kenya'
    }
  },
  {
    email: 'mike.technician@test.com',
    password: 'Password123',
    firstName: 'Mike',
    lastName: 'Johnson',
    phoneNumber: '0734567890',
    role: 'technician',
    isActive: true,
    isVerified: true,
    isEmailVerified: true,
    skills: [
      { name: 'plumbing', experience: 5, certified: true },
      { name: 'electrical', experience: 3, certified: false }
    ],
    availability: {
      isAvailable: true,
      workingHours: { start: '08:00', end: '18:00' },
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    location: {
      type: 'Point',
      coordinates: [36.8194, -1.2906]
    },
    address: {
      street: '789 Moi Avenue',
      city: 'Nairobi',
      county: 'Nairobi',
      country: 'Kenya'
    },
    rating: { average: 4.5, count: 10 }
  },
  {
    email: 'sarah.technician@test.com',
    password: 'Password123',
    firstName: 'Sarah',
    lastName: 'Wilson',
    phoneNumber: '0745678901',
    role: 'technician',
    isActive: true,
    isVerified: true,
    isEmailVerified: true,
    skills: [
      { name: 'electrical', experience: 7, certified: true },
      { name: 'air_conditioning', experience: 4, certified: true },
      { name: 'appliance_repair', experience: 3, certified: false }
    ],
    availability: {
      isAvailable: true,
      workingHours: { start: '09:00', end: '17:00' },
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    location: {
      type: 'Point',
      coordinates: [36.8167, -1.2950]
    },
    address: {
      street: '321 Tom Mboya Street',
      city: 'Nairobi',
      county: 'Nairobi',
      country: 'Kenya'
    },
    rating: { average: 4.8, count: 15 }
  },
  {
    email: 'admin@quickfix.com',
    password: 'AdminPassword123',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '0756789012',
    role: 'admin',
    isActive: true,
    isVerified: true,
    isEmailVerified: true,
    location: {
      type: 'Point',
      coordinates: [36.8219, -1.2921]
    }
  }
];

async function seedDatabase() {
  try {
    console.log(' Starting database seeding...');
    
    // Connect to database
    await database.connect();
    
    // Clear existing data
    console.log(' Clearing existing data...');
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await Booking.deleteMany({});
    await Transaction.deleteMany({});
    
    // Create users and wallets
    console.log(' Creating users and wallets...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      // Create user (password will be hashed by the User model's pre-save hook)
      const user = new User(userData);
      await user.save();
      
      // Create wallet for user
      const wallet = await Wallet.createWallet(user._id);
      user.walletId = wallet._id;
      
      // Add some sample balance for non-admin users
      if (user.role !== 'admin') {
        wallet.balance.available = Math.floor(Math.random() * 5000) + 1000; // Random balance between 1000-6000
        await wallet.save();
      }
      
      await user.save();
      createdUsers.push(user);
      
      console.log(` Created ${user.role}: ${user.email}`);
    }
    
    // Create sample bookings
    console.log(' Creating sample bookings...');
    const clients = createdUsers.filter(u => u.role === 'client');
    const technicians = createdUsers.filter(u => u.role === 'technician');
    
    const sampleBookings = [
      {
        clientId: clients[0]._id,
        technicianId: technicians[0]._id,
        serviceType: 'plumbing',
        serviceDescription: 'Kitchen sink is leaking and needs immediate repair',
        urgency: 'high',
        location: {
          address: {
            street: '123 Kenyatta Avenue',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
          },
          coordinates: {
            type: 'Point',
            coordinates: [36.8219, -1.2921]
          }
        },
        scheduling: {
          preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          preferredTimeSlot: { start: '10:00', end: '12:00' },
          confirmedDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        pricing: {
          quotedAmount: 2500,
          finalAmount: 2200,
          currency: 'KES'
        },
        status: 'completed'
      },
      {
        clientId: clients[1]._id,
        serviceType: 'electrical',
        serviceDescription: 'Power outlets not working in the living room',
        urgency: 'medium',
        location: {
          address: {
            street: '456 Uhuru Highway',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
          },
          coordinates: {
            type: 'Point',
            coordinates: [36.8256, -1.2884]
          }
        },
        scheduling: {
          preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          preferredTimeSlot: { start: '14:00', end: '16:00' }
        },
        pricing: {
          quotedAmount: 1800,
          currency: 'KES'
        },
        status: 'pending'
      },
      {
        clientId: clients[0]._id,
        technicianId: technicians[1]._id,
        serviceType: 'air_conditioning',
        serviceDescription: 'AC unit making strange noises and not cooling properly',
        urgency: 'medium',
        location: {
          address: {
            street: '123 Kenyatta Avenue',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
          },
          coordinates: {
            type: 'Point',
            coordinates: [36.8219, -1.2921]
          }
        },
        scheduling: {
          preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          preferredTimeSlot: { start: '09:00', end: '11:00' },
          confirmedDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
        pricing: {
          quotedAmount: 3500,
          currency: 'KES'
        },
        status: 'confirmed'
      }
    ];
    
    for (const bookingData of sampleBookings) {
      const booking = new Booking(bookingData);
      await booking.save();
      console.log(` Created booking: ${booking.serviceType} - ${booking.status}`);
    }
    
    // Create sample transactions
    console.log(' Creating sample transactions...');
    const wallets = await Wallet.find().populate('userId');
    
    for (const wallet of wallets) {
      if (wallet.userId.role !== 'admin' && wallet.balance.available > 0) {
        // Create a deposit transaction
        const transaction = new Transaction({
          userId: wallet.userId._id,
          walletId: wallet._id,
          type: 'deposit',
          amount: {
            gross: wallet.balance.available,
            fees: wallet.balance.available * 0.01, // 1% fee
            net: wallet.balance.available * 0.99
          },
          currency: 'KES',
          status: 'completed',
          paymentMethod: {
            type: 'mpesa',
            details: { phoneNumber: wallet.userId.phoneNumber }
          },
          description: 'Initial wallet deposit',
          balanceBefore: { available: 0, escrow: 0, pending: 0 },
          balanceAfter: {
            available: wallet.balance.available,
            escrow: wallet.balance.escrow,
            pending: wallet.balance.pending
          },
          completedAt: new Date(),
          initiatedBy: wallet.userId._id
        });
        
        await transaction.save();
        wallet.transactions.push(transaction._id);
        await wallet.save();
        
        console.log(` Created transaction for ${wallet.userId.email}: KES ${wallet.balance.available}`);
      }
    }
    
    console.log(' Database seeding completed successfully!');
    console.log('\n Summary:');
    console.log(` Users created: ${createdUsers.length}`);
    console.log(` Clients: ${clients.length}`);
    console.log(` Technicians: ${technicians.length}`);
    console.log(` Bookings created: ${sampleBookings.length}`);
    console.log(` Transactions created: ${wallets.length - 1}`); // Exclude admin
    
    console.log('\n Test accounts:');
    console.log('Client 1: john.client@test.com / Password123');
    console.log('Client 2: jane.client@test.com / Password123');
    console.log('Technician 1: mike.technician@test.com / Password123');
    console.log('Technician 2: sarah.technician@test.com / Password123');
    console.log('Admin: admin@quickfix.com / AdminPassword123');
    
  } catch (error) {
    console.error(' Database seeding failed:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
