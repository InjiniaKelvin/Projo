/**
 * Authentication Middleware
 * 
 * This middleware handles JWT token verification, user authentication,
 * and role-based access control for the QuickFix app API endpoints.
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = async (req, res, next) => {
 try {
 // Get token from header
 const authHeader = req.headers['authorization'];
 const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
 
 if (!token) {
 return res.status(401).json({
 success: false,
 message: 'Access token required'
 });
 }
 
 // Verify token
 const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
 // Find user and attach to request
 const user = await User.findById(decoded.userId)
 .select('-password -refreshTokens -passwordResetToken -emailVerificationToken')
 .populate('walletId');
 
 if (!user) {
 return res.status(401).json({
 success: false,
 message: 'User not found'
 });
 }
 
 if (!user.isActive) {
 return res.status(401).json({
 success: false,
 message: 'Account is deactivated'
 });
 }
 
 // Attach user to request
 req.user = user;
 next();
 
 } catch (error) {
 if (error.name === 'JsonWebTokenError') {
 return res.status(403).json({
 success: false,
 message: 'Invalid token'
 });
 }
 
 if (error.name === 'TokenExpiredError') {
 return res.status(403).json({
 success: false,
 message: 'Token expired'
 });
 }
 
 return res.status(500).json({
 success: false,
 message: 'Authentication failed',
 error: error.message
 });
 }
};

/**
 * Middleware to check if user has required role
 * @param {string|Array} roles - Required role(s)
 * @returns {Function} Express middleware function
 */
const requireRole = (roles) => {
 return (req, res, next) => {
 if (!req.user) {
 return res.status(401).json({
 success: false,
 message: 'Authentication required'
 });
 }
 
 const allowedRoles = Array.isArray(roles) ? roles : [roles];
 
 if (!allowedRoles.includes(req.user.role)) {
 return res.status(403).json({
 success: false,
 message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
 });
 }
 
 next();
 };
};

/**
 * Middleware to check if user is client
 */
const requireClient = requireRole('client');

/**
 * Middleware to check if user is technician
 */
const requireTechnician = requireRole('technician');

/**
 * Middleware to check if user is admin
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware to check if user is client or technician
 */
const requireClientOrTechnician = requireRole(['client', 'technician']);

/**
 * Middleware to check if user is technician or admin
 */
const requireTechnicianOrAdmin = requireRole(['technician', 'admin']);

/**
 * Middleware to verify user owns resource or is admin
 * @param {string} userIdField - Field name containing user ID in req.params or req.body
 * @returns {Function} Express middleware function
 */
const requireOwnershipOrAdmin = (userIdField = 'userId') => {
 return (req, res, next) => {
 if (!req.user) {
 return res.status(401).json({
 success: false,
 message: 'Authentication required'
 });
 }
 
 const resourceUserId = req.params[userIdField] || req.body[userIdField];
 const isOwner = req.user._id.toString() === resourceUserId;
 const isAdmin = req.user.role === 'admin';
 
 if (!isOwner && !isAdmin) {
 return res.status(403).json({
 success: false,
 message: 'Access denied. You can only access your own resources.'
 });
 }
 
 next();
 };
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
const optionalAuth = async (req, res, next) => {
 try {
 const authHeader = req.headers['authorization'];
 const token = authHeader && authHeader.split(' ')[1];
 
 if (!token) {
 req.user = null;
 return next();
 }
 
 const decoded = jwt.verify(token, process.env.JWT_SECRET);
 const user = await User.findById(decoded.userId)
 .select('-password -refreshTokens -passwordResetToken -emailVerificationToken')
 .populate('walletId');
 
 req.user = user && user.isActive ? user : null;
 next();
 
 } catch (error) {
 req.user = null;
 next();
 }
};

/**
 * Middleware to check if user's account is verified
 */
const requireVerified = (req, res, next) => {
  // Skip verification in development environment
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required'
    });
  }
  
  next();
};

/**
 * Middleware to check if user's email is verified
 */
const requireEmailVerified = (req, res, next) => {
 if (!req.user) {
 return res.status(401).json({
 success: false,
 message: 'Authentication required'
 });
 }
 
 if (!req.user.isEmailVerified) {
 return res.status(403).json({
 success: false,
 message: 'Email verification required'
 });
 }
 
 next();
};

module.exports = {
 authenticateToken,
 requireRole,
 requireClient,
 requireTechnician,
 requireAdmin,
 requireClientOrTechnician,
 requireTechnicianOrAdmin,
 requireOwnershipOrAdmin,
 optionalAuth,
 requireVerified,
 requireEmailVerified
};
