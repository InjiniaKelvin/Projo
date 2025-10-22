/**
 * MongoDB Database Configuration
 * 
 * This file handles MongoDB connection setup with Mongoose.
 * Includes connection pooling, error handling, and environment-based configuration.
 */

const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB database
   * @param {string} uri - MongoDB connection URI (optional, uses env if not provided)
   * @returns {Promise<mongoose.Connection>}
   */
  async connect(uri = null) {
    try {
      const connectionUri = uri || process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/quickfix';
      
      // Mongoose connection options for optimal performance and stability
      const options = {
        // Connection pool settings
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 30000, // Increased to 30 seconds for high latency networks
        socketTimeoutMS: 75000, // Increased to 75 seconds for slow connections
        connectTimeoutMS: 30000, // Initial connection timeout
        family: 4, // Force IPv4 (prevents IPv6 fallback delays)
      };

      this.connection = await mongoose.connect(connectionUri, options);
      
      console.log(` MongoDB connected successfully to: ${connectionUri}`);
      console.log(` Database: ${this.connection.connection.name}`);
      console.log(` Host: ${this.connection.connection.host}:${this.connection.connection.port}`);
      
      return this.connection;
    } catch (error) {
      console.error(' MongoDB connection error:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        console.log(' MongoDB disconnected successfully');
      }
    } catch (error) {
      console.error(' MongoDB disconnection error:', error.message);
      throw error;
    }
  }

  /**
   * Get current connection status
   * @returns {string} Connection status
   */
  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }

  /**
   * Setup database event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log(' Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error(' Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(' Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Drop database (use with caution - mainly for testing)
   * @returns {Promise<void>}
   */
  async dropDatabase() {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot drop database in production environment');
      }
      
      await mongoose.connection.db.dropDatabase();
      console.log(' Database dropped successfully');
    } catch (error) {
      console.error(' Error dropping database:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

// Setup event listeners
database.setupEventListeners();

module.exports = database;
