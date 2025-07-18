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
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import database connection
const database = require('./backend/config/database');

// Import routes
const authRoutes = require('./backend/routes/auth');
const paymentRoutes = require('./backend/routes/payments');
const bookingRoutes = require('./backend/routes/bookings');

// Import new enhanced routes
const enhancedPaymentRoutes = require('./backend/routes/enhancedPayments');
const adminRoutes = require('./backend/routes/admin');
const notificationRoutes = require('./backend/routes/notifications');
const analyticsRoutes = require('./backend/routes/analytics');
const chatRoutes = require('./backend/routes/chat');

// Import WebSocket configuration
const { initializeSocketIO } = require('./backend/config/websocket');

// Import controllers for WebSocket integration
const enhancedBookingController = require('./backend/controllers/enhancedBookingController');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Setup WebSocket with all handlers
const io = initializeSocketIO(server);

// Pass io instance to controllers that need real-time features
enhancedBookingController.setSocketIO(io);

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

// CORS configuration with improved preflight handling
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, add your allowed origins here
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8081', // Expo web (current)
      'http://localhost:19006', // Expo web (alternative)
      'exp://localhost:19000', // Expo app
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (after CORS setup)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'QuickFix API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: database.getConnectionStatus()
  });
});

// Add /api/health endpoint for compatibility
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'QuickFix API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: database.getConnectionStatus()
  });
});

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);

// Enhanced API Routes
app.use('/api/payments/enhanced', enhancedPaymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);

// M-Pesa callback route (needs to be before error middleware)
app.post('/api/payments/mpesa/callback', require('./backend/controllers/enhancedPaymentController').handleMpesaCallback);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
  }
  
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
 * Start the server
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await database.connect();
    console.log('✅ Database connected successfully');
    
    // Start HTTP server with Socket.IO
    server.listen(PORT, () => {
      console.log(`🚀 QuickFix server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API base URL: http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket server initialized`);
      console.log(`📱 Real-time features enabled`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        await database.disconnect();
        console.log('✅ Server shut down successfully');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received. Shutting down gracefully...');
      server.close(async () => {
        await database.disconnect();
        console.log('✅ Server shut down successfully');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

/**
 * Export the app for testing or external usage
 */
module.exports = app;
