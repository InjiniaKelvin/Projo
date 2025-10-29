/**
 * Admin Authentication Middleware
 * 
 * This middleware ensures only admin users can access admin routes
 */

const adminAuth = (req, res, next) => {
 // Check if user is authenticated (should be done by auth middleware first)
 if (!req.user) {
 return res.status(401).json({
 success: false,
 message: 'Authentication required'
 });
 }

 // Check if user has admin role
 if (req.user.role !== 'admin') {
 return res.status(403).json({
 success: false,
 message: 'Access denied. Admin privileges required.'
 });
 }

 // Check if admin account is active
 if (!req.user.isActive) {
 return res.status(403).json({
 success: false,
 message: 'Admin account is deactivated'
 });
 }

 next();
};

module.exports = adminAuth;
