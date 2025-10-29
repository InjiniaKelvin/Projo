/**
 * Admin Routes
 * 
 * Routes for admin panel functionality including:
 * - Dashboard analytics
 * - User management
 * - Technician verification
 * - Dispute resolution
 * - System configuration
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
 getDashboardAnalytics,
 getUsers,
 verifyTechnician,
 toggleUserStatus,
 resolveDispute,
 updatePricing,
 sendBroadcastNotification
} = require('../controllers/adminController');

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard analytics
router.get('/dashboard', getDashboardAnalytics);

// User management
router.get('/users', getUsers);
router.post('/users/:userId/verify', verifyTechnician);
router.post('/users/:userId/toggle-status', toggleUserStatus);

// Dispute resolution
router.post('/disputes/:bookingId/resolve', resolveDispute);

// System configuration
router.post('/pricing/update', updatePricing);

// Broadcast notifications
router.post('/notifications/broadcast', sendBroadcastNotification);

// System health check (admin only)
router.get('/system/health', async (req, res) => {
 try {
 const health = {
 status: 'healthy',
 timestamp: new Date(),
 services: {
 database: 'connected',
 redis: process.env.REDIS_URL ? 'connected' : 'not_configured',
 email: process.env.EMAIL_SERVICE ? 'configured' : 'not_configured',
 sms: process.env.AFRICAS_TALKING_API_KEY ? 'configured' : 'not_configured',
 stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
 paypal: process.env.PAYPAL_CLIENT_ID ? 'configured' : 'not_configured',
 mpesa: process.env.MPESA_CONSUMER_KEY ? 'configured' : 'not_configured'
 },
 version: '1.0.0'
 };
 
 res.json({ success: true, data: health });
 } catch (error) {
 res.status(500).json({ 
 success: false, 
 message: 'Health check failed',
 error: error.message 
 });
 }
});

module.exports = router;
