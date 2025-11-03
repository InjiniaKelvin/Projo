/**
 * MongoDB Database Configuration
 * 
 * This file handles MongoDB connection setup with Mongoose.
 * Optimized for Vercel serverless functions with connection caching.
 */

const mongoose = require('mongoose');

// Global connection promise for serverless caching
let cached = global.mongoose;

if (!cached) {
 cached = global.mongoose = { conn: null, promise: null };
}

class Database {
 constructor() {
 this.connection = null;
 }

 /**
 * Connect to MongoDB database (Vercel serverless optimized)
 * @param {string} uri - MongoDB connection URI (optional, uses env if not provided)
 * @returns {Promise<mongoose.Connection>}
 */
 async connect(uri = null) {
 // Return cached connection if available
 if (cached.conn) {
 console.log(' Using cached MongoDB connection');
 return cached.conn;
 }

 // Return existing connection promise if in progress
 if (cached.promise) {
 console.log(' Waiting for MongoDB connection in progress...');
 cached.conn = await cached.promise;
 return cached.conn;
 }

 try {
 const connectionUri = uri || process.env.MONGO_URI || process.env.MONGODB_URI;
 
 if (!connectionUri) {
 throw new Error('MONGO_URI environment variable is not set');
 }
 
 console.log(` Connecting to MongoDB...`);
 console.log(` URI starts with: ${connectionUri.substring(0, 25)}...`);
 
 // Mongoose connection options optimized for Vercel serverless
 const options = {
 maxPoolSize: 10,
 serverSelectionTimeoutMS: 10000, // 10 seconds for faster failure
 socketTimeoutMS: 45000,
 connectTimeoutMS: 10000,
 family: 4,
 // Vercel-specific optimizations
 retryWrites: true,
 w: 'majority'
 };

 // Create connection promise
 cached.promise = mongoose.connect(connectionUri, options).then((mongoose) => {
 console.log(` MongoDB connected successfully!`);
 console.log(` Database: ${mongoose.connection.name}`);
 console.log(` Host: ${mongoose.connection.host}`);
 return mongoose;
 });

 cached.conn = await cached.promise;
 this.connection = cached.conn;
 
 return cached.conn;
 } catch (error) {
 console.error(' MongoDB connection error:', error.message);
 console.error(' Error details:', error);
 cached.promise = null; // Reset promise on error
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
 
 // Don't set up SIGINT/SIGTERM here - let server.js handle it
 // This prevents premature disconnection
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
