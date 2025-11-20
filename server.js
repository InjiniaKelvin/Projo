/**
 * QuickFix Backend Server
 * 
 * Main server file that initializes the Express app, connects to MongoDB,
 * sets up middleware, routes, WebSocket server, and starts the server.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
require('dotenv').config();

// Import database connection
const database = require('./backend/config/database');

// Import models to ensure indexes are created
const { Booking } = require('./backend/models');

// Import routes
const authRoutes = require('./backend/routes/auth');
const paymentRoutes = require('./backend/routes/payments');
const bookingRoutes = require('./backend/routes/bookingRedesigned');
const servicesRoutes = require('./backend/routes/services');

// Import new enhanced routes
const enhancedPaymentRoutes = require('./backend/routes/enhancedPayments');
const adminRoutes = require('./backend/routes/admin');
const notificationRoutes = require('./backend/routes/notifications');
const analyticsRoutes = require('./backend/routes/analytics');
const chatRoutes = require('./backend/routes/chat');
const ratingRoutes = require('./backend/routes/ratings');
const uploadRoutes = require('./backend/routes/uploads');

// Import WebSocket configuration
const { initializeSocketIO } = require('./backend/config/websocket');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Trust the first proxy in front of the app (e.g., Render's load balancer)
app.set('trust proxy', 1);

// Setup WebSocket with all handlers
initializeSocketIO(server);

// Security middleware
app.use(helmet({
 crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting (increased limits for development)
const limiter = rateLimit({
 windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
 max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // increased to 1000 requests per windowMs for development
 message: {
 success: false,
 message: 'Too many requests from this IP, please try again later'
 },
 standardHeaders: true,
 legacyHeaders: false,
 skip: (req) => {
 // Skip rate limiting for development health checks
 return process.env.NODE_ENV === 'development' && req.path === '/health';
 }
});

// Apply rate limiting to all routes except health checks in development
app.use(limiter);

// CORS configuration with dynamic origin validation for Vercel
const whitelist = [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:19006',
    'exp://localhost:19000',
].concat((process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean));

const corsOptions = {
    origin: function (origin, callback) {
        // Regex to match any Vercel deployment for this project
        const vercelPattern = /^https:\/\/quickfix-.*\.vercel\.app$/;
        
        if (!origin || whitelist.indexOf(origin) !== -1 || vercelPattern.test(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple health check endpoint (no DB required - for Vercel)
app.get('/health', (req, res) => {
 res.json({
 status: 'ok',
 timestamp: new Date().toISOString(),
 serverless: require.main !== module,
 env: {
 hasMongoUri: !!process.env.MONGO_URI,
 nodeEnv: process.env.NODE_ENV
 }
 });
});

// API health check with database status
app.get('/api/health', async (req, res) => {
 try {
 // Try to connect if not connected (for serverless)
 if (database.getConnectionStatus() === 'disconnected') {
 try {
 await database.connect();
 } catch (err) {
 console.error('Health check DB connection error:', err.message);
 }
 }
 
 res.json({
 success: true,
 message: 'QuickFix API is running',
 timestamp: new Date().toISOString(),
 version: '1.0.0',
 database: database.getConnectionStatus(),
 env: {
 hasMongoUri: !!process.env.MONGO_URI,
 nodeEnv: process.env.NODE_ENV
 }
 });
 } catch (error) {
 res.status(500).json({
 success: false,
 error: error.message,
 timestamp: new Date().toISOString()
 });
 }
});

// Routes
app.use('/api/auth', authRoutes);

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/bookings-redesigned', bookingRoutes); // Alias for compatibility
app.use('/api/services', servicesRoutes);

// Enhanced API Routes
app.use('/api/payments/enhanced', enhancedPaymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/uploads', uploadRoutes);

// Technician Routes
app.use('/api/technician', require('./backend/routes/technician'));

// M-Pesa callback route (needs to be before error middleware)
app.post('/api/payments/mpesa/callback', require('./backend/controllers/enhancedPaymentController').handleMpesaCallback);

// Error handling middleware
app.use((error, req, res, next) => {
 console.error('Error:', error);
 
 res.status(error.status || 500).json({
 success: false,
 message: error.message || 'Internal server error',
 ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
 });
});

// 404 handler
app.use('*', (req, res) => {
 res.status(404).json({
 success: false,
 message: 'Endpoint not found',
 path: req.originalUrl
 });
});

/**
 * Ensure database indexes are created
 */
async function ensureIndexes() {
 try {
 console.log(' Ensuring database indexes...');
 
 // Ensure Booking model indexes are created
 await Booking.createIndexes();
 console.log(' Booking indexes created successfully');
 
 } catch (error) {
 console.error(' Error creating indexes:', error.message);
 // Don't fail the server startup for index creation errors
 }
}

/**
 * Start the server
 */
async function startServer() {
 try {
 // Connect to MongoDB
 await database.connect();
 console.log(' Database connected successfully');
 
 // Ensure indexes are created
 await ensureIndexes();
 
 // Start HTTP server with Socket.IO
 server.listen(PORT, () => {
 console.log(` QuickFix server running on http://localhost:${PORT}`);
 console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
 console.log(` Health check: http://localhost:${PORT}/health`);
 console.log(` API base URL: http://localhost:${PORT}/api`);
 console.log(` WebSocket server initialized`);
 console.log(` Real-time features enabled`);
 });
 
 // Graceful shutdown
 process.on('SIGTERM', async () => {
 console.log(' SIGTERM received. Shutting down gracefully...');
 server.close(async () => {
 await database.disconnect();
 console.log(' Server shut down successfully');
 process.exit(0);
 });
 });
 
 process.on('SIGINT', async () => {
 console.log(' SIGINT received. Shutting down gracefully...');
 server.close(async () => {
 await database.disconnect();
 console.log(' Server shut down successfully');
 process.exit(0);
 });
 });
 } catch (error) {
 console.error(' Failed to start server:', error.message);
 process.exit(1);
 }
}

// Start the server if this file is run directly
if (require.main === module) {
 startServer();
} else {
 // For Vercel/serverless: Connect to database when module is imported
 // But don't fail if connection is slow - let individual requests handle it
 database.connect()
 .then(() => {
 console.log(' Database connected successfully (serverless mode)');
 ensureIndexes().catch(err => console.error(' Index creation error:', err.message));
 })
 .catch(err => {
 console.error(' Database connection error (serverless):', err.message);
 console.log(' App will attempt to reconnect on first request');
 });
}

/**
 * Global error handler (must be after all routes)
 */
app.use((err, req, res, next) => {
 console.error('❌ Unhandled error:', err);
 
 // Don't leak error details in production
 const isDev = process.env.NODE_ENV !== 'production';
 
 res.status(err.status || 500).json({
 success: false,
 error: isDev ? err.message : 'Internal server error',
 ...(isDev && { stack: err.stack })
 });
});

/**
 * 404 handler
 */
app.use((req, res) => {
 res.status(404).json({
 success: false,
 error: 'Route not found',
 path: req.path
 });
});

/**
 * Export the app for testing or external usage
 */
module.exports = app;
