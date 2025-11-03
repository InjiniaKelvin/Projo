/**
 * Enhanced Payment Routes
 * 
 * Routes for advanced payment functionality including:
 * - Multi-provider payment processing
 * - Escrow management
 * - Transaction history
 * - Refund processing
 */

const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const {
 createPaymentIntent,
 confirmPayment,
 releaseEscrowPayment,
 handleMpesaCallback,
 getTransactionHistory,
 processRefund
} = require('../controllers/enhancedPaymentController');

// Create payment intent (Stripe, PayPal, M-Pesa)
router.post('/intent', auth, createPaymentIntent);

// Confirm payment after processing
router.post('/confirm', auth, confirmPayment);

// Get user transaction history
router.get('/history', auth, getTransactionHistory);

// Release escrow payment
router.post('/escrow/release/:bookingId', auth, releaseEscrowPayment);

// Process refund (admin or authorized users)
router.post('/refund', auth, processRefund);

// M-Pesa callback (no auth required - called by Safaricom)
router.post('/mpesa/callback', handleMpesaCallback);

// Get payment methods available
router.get('/methods', (req, res) => {
 res.json({
 success: true,
 methods: [
 {
 id: 'stripe',
 name: 'Credit/Debit Card',
 description: 'Visa, Mastercard, American Express',
 currencies: ['USD', 'EUR', 'GBP'],
 icon: 'credit-card'
 },
 {
 id: 'paypal',
 name: 'PayPal',
 description: 'Pay with your PayPal account',
 currencies: ['USD', 'EUR', 'GBP'],
 icon: 'paypal'
 },
 {
 id: 'mpesa',
 name: 'M-Pesa',
 description: 'Mobile money payment',
 currencies: ['KES'],
 icon: 'mobile',
 region: 'Kenya'
 }
 ]
 });
});

module.exports = router;
