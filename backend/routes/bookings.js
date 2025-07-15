/**
 * Booking Routes
 * 
 * This file defines all booking-related API endpoints
 * including creation, management, assignment, and status updates.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const bookingController = require('../controllers/bookingController');
const { 
  authenticateToken, 
  requireClient, 
  requireTechnician, 
  requireClientOrTechnician 
} = require('../middleware/auth');
const {
  validateBookingCreation,
  validateRating,
  validateObjectId,
  validatePagination,
  validateSearch,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000, // 5MB default
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private (Client only)
 */
router.post('/', generalLimiter, requireClient, validateBookingCreation, bookingController.createBooking);

/**
 * @route   GET /api/bookings
 * @desc    Get user's bookings
 * @access  Private
 */
router.get('/', generalLimiter, validatePagination, bookingController.getUserBookings);

/**
 * @route   GET /api/bookings/available
 * @desc    Get available bookings for technicians
 * @access  Private (Technician only)
 */
router.get('/available', generalLimiter, requireTechnician, validateSearch, bookingController.getAvailableBookings);

/**
 * @route   GET /api/bookings/stats
 * @desc    Get booking statistics
 * @access  Private
 */
router.get('/stats', generalLimiter, bookingController.getBookingStats);

/**
 * @route   GET /api/bookings/:bookingId
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:bookingId', generalLimiter, bookingController.getBooking);

/**
 * @route   POST /api/bookings/:bookingId/assign
 * @desc    Assign technician to booking
 * @access  Private (Technician only)
 */
router.post('/:bookingId/assign', generalLimiter, requireTechnician, bookingController.assignTechnician);

/**
 * @route   POST /api/bookings/:bookingId/confirm
 * @desc    Confirm booking
 * @access  Private (Client only)
 */
router.post('/:bookingId/confirm', generalLimiter, requireClient, bookingController.confirmBooking);

/**
 * @route   POST /api/bookings/:bookingId/start
 * @desc    Start work on booking
 * @access  Private (Technician only)
 */
router.post('/:bookingId/start', generalLimiter, requireTechnician, bookingController.startWork);

/**
 * @route   POST /api/bookings/:bookingId/complete
 * @desc    Complete work on booking
 * @access  Private (Technician only)
 */
router.post('/:bookingId/complete', generalLimiter, requireTechnician, [
  require('express-validator').body('finalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Final amount must be a positive number'),
  handleValidationErrors
], bookingController.completeWork);

/**
 * @route   POST /api/bookings/:bookingId/cancel
 * @desc    Cancel booking
 * @access  Private (Client or Technician)
 */
router.post('/:bookingId/cancel', generalLimiter, requireClientOrTechnician, [
  require('express-validator').body('reason')
    .notEmpty()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Cancellation reason is required (5-500 characters)'),
  handleValidationErrors
], bookingController.cancelBooking);

/**
 * @route   POST /api/bookings/:bookingId/messages
 * @desc    Add message to booking
 * @access  Private (Client or Technician)
 */
router.post('/:bookingId/messages', generalLimiter, requireClientOrTechnician, [
  require('express-validator').body('message')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message is required (1-1000 characters)'),
  handleValidationErrors
], bookingController.addMessage);

/**
 * @route   POST /api/bookings/:bookingId/rating
 * @desc    Add rating and review
 * @access  Private (Client or Technician)
 */
router.post('/:bookingId/rating', generalLimiter, requireClientOrTechnician, validateRating, bookingController.addRating);

/**
 * @route   POST /api/bookings/:bookingId/images
 * @desc    Upload images for booking
 * @access  Private (Client or Technician)
 */
router.post('/:bookingId/images', generalLimiter, requireClientOrTechnician, upload.array('images', 5), bookingController.uploadImages);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  next(error);
});

module.exports = router;
