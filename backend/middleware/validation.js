/**
 * Validation Middleware
 * 
 * This middleware provides request validation using express-validator
 * for the QuickFix app API endpoints.
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

/**
 * User Registration Validation
 */
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phoneNumber')
    .matches(/^(\+?254|0)[1-9]\d{8}$/)
    .withMessage('Please provide a valid Kenyan phone number'),
  
  body('role')
    .optional()
    .isIn(['client', 'technician'])
    .withMessage('Role must be either client or technician'),
  
  handleValidationErrors
];

/**
 * User Login Validation
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * User Profile Update Validation
 */
const validateUserProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phoneNumber')
    .optional()
    .matches(/^(\+?254|0)[1-9]\d{8}$/)
    .withMessage('Please provide a valid Kenyan phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender value'),
  
  handleValidationErrors
];

/**
 * Booking Creation Validation
 */
const validateBookingCreation = [
  body('serviceType')
    .isIn([
      'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
      'appliance_repair', 'air_conditioning', 'roofing', 'gardening',
      'pest_control', 'security_systems', 'solar_installation',
      'general_maintenance', 'other'
    ])
    .withMessage('Invalid service type'),
  
  body('serviceDescription')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Service description must be between 10 and 1000 characters'),
  
  body('urgency')
    .isIn(['low', 'medium', 'high', 'emergency'])
    .withMessage('Urgency must be low, medium, high, or emergency'),
  
  body('location.address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('location.address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('location.address.county')
    .trim()
    .notEmpty()
    .withMessage('County is required'),
  
  body('location.coordinates.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]')
    .custom((value) => {
      const [lng, lat] = value;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error('Coordinates must be numbers');
      }
      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  
  body('scheduling.preferredDate')
    .isISO8601()
    .withMessage('Please provide a valid preferred date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Preferred date must be in the future');
      }
      return true;
    }),
  
  body('scheduling.preferredTimeSlot.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('scheduling.preferredTimeSlot.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  
  handleValidationErrors
];

/**
 * Payment Validation
 */
const validatePayment = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number'),
  
  body('paymentMethod')
    .isIn(['mpesa', 'bank', 'card', 'paypal'])
    .withMessage('Invalid payment method'),
  
  body('currency')
    .optional()
    .isIn(['KES', 'USD', 'EUR', 'GBP'])
    .withMessage('Invalid currency'),
  
  handleValidationErrors
];

/**
 * Wallet Transaction Validation
 */
const validateWalletTransaction = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('type')
    .isIn(['deposit', 'withdrawal', 'transfer'])
    .withMessage('Transaction type must be deposit, withdrawal, or transfer'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  handleValidationErrors
];

/**
 * Rating and Review Validation
 */
const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters'),
  
  handleValidationErrors
];

/**
 * ID Parameter Validation
 */
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  
  handleValidationErrors
];

/**
 * Pagination Validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .matches(/^[a-zA-Z_]+:(asc|desc)$/)
    .withMessage('Sort format must be field:asc or field:desc'),
  
  handleValidationErrors
];

/**
 * Search Validation
 */
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('serviceType')
    .optional()
    .isIn([
      'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
      'appliance_repair', 'air_conditioning', 'roofing', 'gardening',
      'pest_control', 'security_systems', 'solar_installation',
      'general_maintenance', 'other'
    ])
    .withMessage('Invalid service type'),
  
  query('location')
    .optional()
    .custom((value) => {
      try {
        const coords = JSON.parse(value);
        if (!Array.isArray(coords) || coords.length !== 2) {
          throw new Error('Location must be [longitude, latitude]');
        }
        const [lng, lat] = coords;
        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          throw new Error('Invalid coordinates');
        }
        return true;
      } catch (error) {
        throw new Error('Invalid location format');
      }
    }),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserProfileUpdate,
  validateBookingCreation,
  validatePayment,
  validateWalletTransaction,
  validateRating,
  validateObjectId,
  validatePagination,
  validateSearch
};
