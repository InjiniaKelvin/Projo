/**
 * Authentication Routes
 * 
 * This file defines all authentication-related API endpoints
 * including registration, login, logout, password management, etc.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
 validateUserRegistration,
 validateUserLogin,
 handleValidationErrors
} = require('../middleware/validation');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Rate limiting (temporarily increased for testing)
const authLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 50, // limit each IP to 50 requests per windowMs (increased for testing)
 message: {
 success: false,
 message: 'Too many authentication attempts, please try again later'
 },
 standardHeaders: true,
 legacyHeaders: false
});

const generalLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 100, // limit each IP to 100 requests per windowMs
 message: {
 success: false,
 message: 'Too many requests, please try again later'
 },
 standardHeaders: true,
 legacyHeaders: false
});

// Configure multer for profile pictures
const storage = multer.diskStorage({
 destination: function (req, file, cb) {
   cb(null, 'uploads/');
 },
 filename: function (req, file, cb) {
   cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
 }
});

const upload = multer({ 
 storage: storage,
 limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
 fileFilter: (req, file, cb) => {
   if (file.mimetype.startsWith('image/')) {
     cb(null, true);
   } else {
     cb(new Error('Not an image! Please upload an image.'), false);
   }
 }
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authLimiter, validateUserRegistration, authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authLimiter, validateUserLogin, authController.login);

/**
 * @route GET /api/auth/validate
 * @desc Validate authentication token
 * @access Private
 */
router.get('/validate', generalLimiter, authenticateToken, authController.validateToken);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', generalLimiter, authController.refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (works with both valid and expired tokens)
 * @access Public/Private
 */
router.post('/logout', generalLimiter, authController.logout);

/**
 * @route POST /api/auth/logout-all
 * @desc Logout user from all devices
 * @access Private
 */
router.post('/logout-all', generalLimiter, authenticateToken, authController.logoutAll);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', authLimiter, [
 require('express-validator').body('email')
 .isEmail()
 .normalizeEmail()
 .withMessage('Please provide a valid email address'),
 handleValidationErrors
], authController.requestPasswordReset);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', authLimiter, [
 require('express-validator').body('token')
 .notEmpty()
 .withMessage('Reset token is required'),
 require('express-validator').body('newPassword')
 .isLength({ min: 6 })
 .withMessage('Password must be at least 6 characters long')
 .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
 .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
 handleValidationErrors
], authController.resetPassword);

/**
 * @route POST /api/auth/change-password
 * @desc Change password
 * @access Private
 */
router.post('/change-password', generalLimiter, authenticateToken, [
 require('express-validator').body('currentPassword')
 .notEmpty()
 .withMessage('Current password is required'),
 require('express-validator').body('newPassword')
 .isLength({ min: 6 })
 .withMessage('Password must be at least 6 characters long')
 .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
 .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
 handleValidationErrors
], authController.changePassword);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', generalLimiter, authenticateToken, authController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Update current user profile
 * @access Private
 */
router.put('/profile', generalLimiter, authenticateToken, authController.updateProfile);

/**
 * @route POST /api/auth/profile/picture
 * @desc Upload profile picture
 * @access Private
 */
router.post('/profile/picture', generalLimiter, authenticateToken, upload.single('profilePicture'), authController.uploadProfilePicture);

/**
 * @route GET /api/auth/verify-email/:token
 * @desc Verify email address
 * @access Public
 */
router.get('/verify-email/:token', generalLimiter, authController.verifyEmail);

/**
 * @route POST /api/auth/test-verify/:userId
 * @desc Mark user as verified (TEST/DEV ONLY)
 * @access Public (should be removed in production)
 */
if (process.env.NODE_ENV !== 'production') {
 router.post('/test-verify/:userId', async (req, res) => {
 try {
 const { User } = require('../models');
 await User.findByIdAndUpdate(req.params.userId, { 
 isVerified: true,
 emailVerified: true 
 });
 res.json({ success: true, message: 'User verified for testing' });
 } catch (error) {
 res.status(500).json({ success: false, message: error.message });
 }
 });
}

module.exports = router;
