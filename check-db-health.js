const mongoose = require('mongoose');
require('dotenv').config();

const checkDatabaseConnection = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ MONGO_URI not found in .env file.');
    process.exit(1);
  }

  console.log('Attempting to connect to MongoDB Atlas...');
  console.log(`(Using URI from .env file)`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds
    });
    console.log('✅ MongoDB connection successful!');
    
    // Check the connection state
    const state = mongoose.connection.readyState;
    console.log(`Connection state: ${state} (1 = connected)`);

  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    // Ensure we close the connection after checking
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
};

checkDatabaseConnection();
