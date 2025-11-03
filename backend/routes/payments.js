/**
 * Payment Routes
 * 
 * This file defines all payment and wallet-related API endpoints
 * including wallet management, transactions, and payment processing.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireVerified } = require('../middleware/auth');
const {
 validatePayment,
 validateWalletTransaction,
 validatePagination,
 validateObjectId,
 handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// Rate limiting for payment operations
const paymentLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 10, // limit each IP to 10 payment requests per windowMs
 message: {
 success: false,
 message: 'Too many payment requests, please try again later'
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

// Apply authentication and verification to all routes
router.use(authenticateToken);
router.use(requireVerified);

/**
 * @route GET /api/payments/wallet
 * @desc Get user wallet information
 * @access Private
 */
router.get('/wallet', generalLimiter, paymentController.getWallet);

/**
 * @route POST /api/payments/add-funds
 * @desc Add funds to wallet
 * @access Private
 */
router.post('/add-funds', paymentLimiter, validatePayment, paymentController.addFunds);

/**
 * @route POST /api/payments/withdraw-funds
 * @desc Withdraw funds from wallet
 * @access Private
 */
router.post('/withdraw-funds', paymentLimiter, [
 require('express-validator').body('amount')
 .isFloat({ min: 1 })
 .withMessage('Amount must be a positive number'),
 require('express-validator').body('withdrawalMethod')
 .isIn(['mpesa', 'bank', 'paypal'])
 .withMessage('Invalid withdrawal method'),
 require('express-validator').body('withdrawalDetails')
 .isObject()
 .withMessage('Withdrawal details are required'),
 handleValidationErrors
], paymentController.withdrawFunds);

/**
 * @route POST /api/payments/escrow/deposit
 * @desc Transfer funds to escrow
 * @access Private
 */
router.post('/escrow/deposit', paymentLimiter, [
 require('express-validator').body('amount')
 .isFloat({ min: 1 })
 .withMessage('Amount must be a positive number'),
 require('express-validator').body('bookingId')
 .isMongoId()
 .withMessage('Valid booking ID is required'),
 handleValidationErrors
], paymentController.transferToEscrow);

/**
 * @route POST /api/payments/escrow/release
 * @desc Release funds from escrow
 * @access Private
 */
router.post('/escrow/release', paymentLimiter, [
 require('express-validator').body('amount')
 .isFloat({ min: 1 })
 .withMessage('Amount must be a positive number'),
 require('express-validator').body('bookingId')
 .isMongoId()
 .withMessage('Valid booking ID is required'),
 require('express-validator').body('recipientUserId')
 .isMongoId()
 .withMessage('Valid recipient user ID is required'),
 handleValidationErrors
], paymentController.releaseFromEscrow);

/**
 * @route GET /api/payments/transactions
 * @desc Get transaction history
 * @access Private
 */
router.get('/transactions', generalLimiter, validatePagination, paymentController.getTransactionHistory);

/**
 * @route POST /api/payments/payment-methods
 * @desc Add payment method
 * @access Private
 */
router.post('/payment-methods', generalLimiter, [
 require('express-validator').body('type')
 .isIn(['mpesa', 'bank', 'card', 'paypal'])
 .withMessage('Invalid payment method type'),
 require('express-validator').body('details')
 .isObject()
 .withMessage('Payment method details are required'),
 require('express-validator').body('isDefault')
 .optional()
 .isBoolean()
 .withMessage('isDefault must be a boolean'),
 handleValidationErrors
], paymentController.addPaymentMethod);

/**
 * @route POST /api/payments/intasend/callback
 * @desc IntaSend payment webhook callback
 * @access Public (webhook)
 */
router.post('/intasend/callback', paymentController.handleIntaSendWebhook);

/**
 * @route GET /api/payments/status/:transactionId
 * @desc Check payment status for a transaction
 * @access Private
 */
router.get('/status/:transactionId', generalLimiter, paymentController.checkPaymentStatus);

/**
 * @route POST /api/payments/mpesa/callback
 * @desc M-Pesa payment callback (legacy - replaced by IntaSend)
 * @access Public (webhook)
 * @deprecated Use IntaSend callback instead
 */
router.post('/mpesa/callback', (req, res) => {
 // Handle M-Pesa callback
 // This endpoint should be secured with M-Pesa credentials validation
 try {
 console.log('M-Pesa callback received:', req.body);
 
 // Process the callback
 // Update transaction status based on callback data
 
 res.json({
 ResultCode: 0,
 ResultDesc: 'Success'
 });
 } catch (error) {
 console.error('M-Pesa callback error:', error);
 res.status(500).json({
 ResultCode: 1,
 ResultDesc: 'Error processing callback'
 });
 }
});

/**
 * @route POST /api/payments/stripe/webhook
 * @desc Stripe payment webhook
 * @access Public (webhook)
 */
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
 // Handle Stripe webhook
 // This endpoint should be secured with Stripe webhook secret validation
 try {
 const sig = req.headers['stripe-signature'];
 // Verify webhook signature
 // Process the webhook event
 
 console.log('Stripe webhook received');
 res.json({ received: true });
 } catch (error) {
 console.error('Stripe webhook error:', error);
 res.status(400).send(`Webhook Error: ${error.message}`);
 }
});

/**
 * @route POST /api/payments/paypal/webhook
 * @desc PayPal payment webhook
 * @access Public (webhook)
 */
router.post('/paypal/webhook', (req, res) => {
 // Handle PayPal webhook
 // This endpoint should be secured with PayPal webhook validation
 try {
 console.log('PayPal webhook received:', req.body);
 
 // Process the webhook
 // Update transaction status based on webhook data
 
 res.json({
 success: true,
 message: 'Webhook processed'
 });
 } catch (error) {
 console.error('PayPal webhook error:', error);
 res.status(500).json({
 success: false,
 message: 'Error processing webhook'
 });
 }
});

module.exports = router;
