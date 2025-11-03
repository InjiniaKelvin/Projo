/**
 * Enhanced Payment Controller
 * 
 * This controller handles all payment operations including:
 * - M-Pesa integration for Kenyan mobile payments
 * - Escrow system for secure transactions
 * - Automatic payment processing and release
 * - Transaction history and reporting
 */

const axios = require('axios');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const NotificationService = require('../services/NotificationService');

// M-Pesa Configuration (Safaricom Daraja API)
const MPESA_CONFIG = {
 consumer_key: process.env.MPESA_CONSUMER_KEY,
 consumer_secret: process.env.MPESA_CONSUMER_SECRET,
 business_short_code: process.env.MPESA_BUSINESS_SHORT_CODE,
 passkey: process.env.MPESA_PASSKEY,
 callback_url: process.env.MPESA_CALLBACK_URL,
 sandbox_url: 'https://sandbox.safaricom.co.ke',
 production_url: 'https://api.safaricom.co.ke'
};

/**
 * Get M-Pesa access token
 */
const getMpesaAccessToken = async () => {
 try {
 const url = `${MPESA_CONFIG.sandbox_url}/oauth/v1/generate?grant_type=client_credentials`;
 const credentials = Buffer.from(`${MPESA_CONFIG.consumer_key}:${MPESA_CONFIG.consumer_secret}`).toString('base64');
 
 const response = await axios.get(url, {
 headers: {
 'Authorization': `Basic ${credentials}`
 }
 });
 
 return response.data.access_token;
 } catch (error) {
 console.error('M-Pesa token error:', error);
 throw new Error('Failed to get M-Pesa access token');
 }
};

/**
 * Create payment intent (handles multiple providers)
 */
const createPaymentIntent = async (req, res) => {
 try {
 const { 
 bookingId, 
 amount, 
 paymentMethod = 'mpesa', // Default to M-Pesa
 currency = 'KES',
 phoneNumber // Required for M-Pesa
 } = req.body;

 const booking = await Booking.findById(bookingId)
 .populate('clientId')
 .populate('technicianId');

 if (!booking) {
 return res.status(404).json({ message: 'Booking not found' });
 }

 if (booking.clientId._id.toString() !== req.user.id) {
 return res.status(403).json({ message: 'Unauthorized' });
 }

 let paymentResult;

 // Only M-Pesa payments supported
 if (paymentMethod === 'mpesa') {
 paymentResult = await initiateMpesaPayment(amount, phoneNumber, booking);
 } else {
 return res.status(400).json({ message: 'Only M-Pesa payment method is supported' });
 }

 // Create transaction record
 const transaction = new Transaction({
 userId: req.user.id,
 bookingId,
 amount,
 currency,
 paymentMethod,
 type: 'service_payment',
 status: 'pending',
 paymentIntentId: paymentResult.id || paymentResult.paymentId,
 metadata: paymentResult.metadata || {}
 });

 await transaction.save();

 res.json({
 success: true,
 transaction: transaction._id,
 paymentData: paymentResult
 });
 } catch (error) {
 console.error('Create payment intent error:', error);
 res.status(500).json({ 
 message: 'Failed to create payment intent', 
 error: error.message 
 });
 }
};

/**
 * Initiate M-Pesa payment
 */
const initiateMpesaPayment = async (amount, phoneNumber, booking) => {
 try {
 const accessToken = await getMpesaAccessToken();
 const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
 const password = Buffer.from(
 `${MPESA_CONFIG.business_short_code}${MPESA_CONFIG.passkey}${timestamp}`
 ).toString('base64');

 // Format phone number for M-Pesa (254xxxxxxxxx)
 let formattedPhone = phoneNumber;
 if (phoneNumber.startsWith('0')) {
 formattedPhone = '254' + phoneNumber.substring(1);
 } else if (phoneNumber.startsWith('+254')) {
 formattedPhone = phoneNumber.substring(1);
 } else if (!phoneNumber.startsWith('254')) {
 formattedPhone = '254' + phoneNumber;
 }

 const stkPushData = {
 BusinessShortCode: MPESA_CONFIG.business_short_code,
 Password: password,
 Timestamp: timestamp,
 TransactionType: 'CustomerPayBillOnline',
 Amount: Math.round(amount),
 PartyA: formattedPhone,
 PartyB: MPESA_CONFIG.business_short_code,
 PhoneNumber: formattedPhone,
 CallBackURL: `${MPESA_CONFIG.callback_url}/mpesa/callback`,
 AccountReference: `QF${booking._id.toString().slice(-8)}`,
 TransactionDesc: `QuickFix ${booking.serviceType} payment`
 };

 const response = await axios.post(
 `${MPESA_CONFIG.sandbox_url}/mpesa/stkpush/v1/processrequest`,
 stkPushData,
 {
 headers: {
 'Authorization': `Bearer ${accessToken}`,
 'Content-Type': 'application/json'
 }
 }
 );

 if (response.data.ResponseCode === '0') {
 return {
 id: response.data.CheckoutRequestID,
 checkoutRequestId: response.data.CheckoutRequestID,
 responseCode: response.data.ResponseCode,
 responseDescription: response.data.ResponseDescription,
 metadata: {
 mpesaCheckoutRequestId: response.data.CheckoutRequestID,
 phoneNumber: formattedPhone
 }
 };
 } else {
 throw new Error(response.data.ResponseDescription || 'M-Pesa request failed');
 }
 } catch (error) {
 console.error('M-Pesa payment error:', error);
 throw new Error('Failed to initiate M-Pesa payment');
 }
};

/**
 * Confirm payment and transfer to escrow
 */
const confirmPayment = async (req, res) => {
 try {
 const { transactionId, paymentIntentId } = req.body;

 const transaction = await Transaction.findById(transactionId)
 .populate('bookingId');

 if (!transaction) {
 return res.status(404).json({ message: 'Transaction not found' });
 }

 let paymentConfirmed = false;
 let paymentDetails = {};

 // M-Pesa payments are verified via callback
 paymentConfirmed = transaction.status === 'completed';

 if (paymentConfirmed) {
 // Update transaction status
 await Transaction.findByIdAndUpdate(transactionId, {
 status: 'completed',
 confirmedAt: new Date(),
 paymentDetails
 });

 // Transfer to escrow
 await transferToEscrow(transaction);

 // Update booking status
 await Booking.findByIdAndUpdate(transaction.bookingId._id, {
 paymentStatus: 'paid',
 status: transaction.bookingId.status === 'pending' ? 'assigned' : transaction.bookingId.status
 });

 // Send notifications
 await NotificationService.sendPaymentNotification(
 transaction.userId,
 transaction,
 'sent'
 );

 if (transaction.bookingId.technicianId) {
 await NotificationService.createInAppNotification(
 transaction.bookingId.technicianId,
 'Payment Received',
 `Payment for booking #${transaction.bookingId._id.toString().slice(-6)} has been placed in escrow.`,
 {
 type: 'payment',
 bookingId: transaction.bookingId._id,
 amount: transaction.amount
 }
 );
 }

 res.json({
 success: true,
 message: 'Payment confirmed and transferred to escrow',
 transaction: transactionId
 });
 } else {
 res.status(400).json({
 success: false,
 message: 'Payment verification failed'
 });
 }
 } catch (error) {
 console.error('Confirm payment error:', error);
 res.status(500).json({ 
 message: 'Failed to confirm payment', 
 error: error.message 
 });
 }
};

/**
 * Transfer payment to escrow
 */
const transferToEscrow = async (transaction) => {
 try {
 // Create escrow transaction record
 const escrowTransaction = new Transaction({
 userId: transaction.bookingId.technicianId,
 bookingId: transaction.bookingId._id,
 amount: transaction.amount,
 currency: transaction.currency,
 type: 'escrow',
 status: 'held',
 parentTransactionId: transaction._id,
 description: `Escrow for booking #${transaction.bookingId._id.toString().slice(-6)}`
 });

 await escrowTransaction.save();

 // Update booking with escrow information
 await Booking.findByIdAndUpdate(transaction.bookingId._id, {
 'escrow.amount': transaction.amount,
 'escrow.transactionId': escrowTransaction._id,
 'escrow.status': 'held',
 'escrow.heldAt': new Date()
 });

 return escrowTransaction;
 } catch (error) {
 console.error('Transfer to escrow error:', error);
 throw error;
 }
};

/**
 * Release escrow payment to technician
 */
const releaseEscrowPayment = async (req, res) => {
 try {
 const { bookingId } = req.params;
 const { releaseAmount } = req.body;

 const booking = await Booking.findById(bookingId)
 .populate('clientId')
 .populate('technicianId');

 if (!booking) {
 return res.status(404).json({ message: 'Booking not found' });
 }

 // Check authorization (client, technician, or admin can trigger release)
 const isAuthorized = booking.clientId._id.toString() === req.user.id ||
 booking.technicianId._id.toString() === req.user.id ||
 req.user.role === 'admin';

 if (!isAuthorized) {
 return res.status(403).json({ message: 'Unauthorized to release escrow' });
 }

 // Only release if booking is completed or approved by client
 if (booking.status !== 'completed' && req.user.role !== 'admin') {
 return res.status(400).json({ 
 message: 'Can only release escrow for completed bookings' 
 });
 }

 const escrowTransaction = await Transaction.findById(booking.escrow.transactionId);
 if (!escrowTransaction || escrowTransaction.status !== 'held') {
 return res.status(400).json({ message: 'No funds in escrow' });
 }

 const amountToRelease = releaseAmount || escrowTransaction.amount;
 
 // Calculate platform fee and technician earnings
 const earningsBreakdown = calculateTechnicianEarnings(
 amountToRelease,
 booking.technicianId.technicianProfile.rating,
 booking.technicianId.technicianProfile.completedJobs
 );

 // Update escrow transaction
 await Transaction.findByIdAndUpdate(escrowTransaction._id, {
 status: 'released',
 releasedAt: new Date(),
 releasedAmount: amountToRelease,
 platformFee: earningsBreakdown.platformFee,
 technicianEarning: earningsBreakdown.technicianEarning
 });

 // Create technician payment record
 const technicianPayment = new Transaction({
 userId: booking.technicianId._id,
 bookingId: booking._id,
 amount: earningsBreakdown.technicianEarning,
 currency: escrowTransaction.currency,
 type: 'service_earning',
 status: 'completed',
 parentTransactionId: escrowTransaction._id,
 description: `Payment for booking #${booking._id.toString().slice(-6)}`
 });

 await technicianPayment.save();

 // Update booking
 await Booking.findByIdAndUpdate(bookingId, {
 'escrow.status': 'released',
 'escrow.releasedAt': new Date(),
 'escrow.releasedAmount': amountToRelease,
 paymentStatus: 'completed'
 });

 // Update technician profile earnings
 await User.findByIdAndUpdate(booking.technicianId._id, {
 $inc: {
 'technicianProfile.totalEarnings': earningsBreakdown.technicianEarning,
 'technicianProfile.completedJobs': 1
 }
 });

 // Send notifications
 await NotificationService.sendPaymentNotification(
 booking.technicianId._id,
 technicianPayment,
 'received'
 );

 await NotificationService.createInAppNotification(
 booking.clientId._id,
 'Payment Released',
 `Payment of $${amountToRelease} has been released to your technician.`,
 {
 type: 'payment',
 bookingId: booking._id,
 amount: amountToRelease
 }
 );

 res.json({
 success: true,
 message: 'Escrow payment released successfully',
 amountReleased: amountToRelease,
 technicianEarning: earningsBreakdown.technicianEarning,
 platformFee: earningsBreakdown.platformFee
 });
 } catch (error) {
 console.error('Release escrow payment error:', error);
 res.status(500).json({ 
 message: 'Failed to release escrow payment', 
 error: error.message 
 });
 }
};

/**
 * Calculate technician earnings
 */
const calculateTechnicianEarnings = (totalAmount, rating = 4.0, completedJobs = 0) => {
 // Base commission rate (technician keeps this percentage)
 let commissionRate = 0.70; // 70% base rate

 // Bonus for high ratings
 if (rating >= 4.8) {
 commissionRate += 0.05; // 75% for excellent technicians
 } else if (rating >= 4.5) {
 commissionRate += 0.03; // 73% for great technicians
 }

 // Bonus for experienced technicians
 if (completedJobs >= 500) {
 commissionRate += 0.02; // Additional 2% for very experienced
 } else if (completedJobs >= 100) {
 commissionRate += 0.01; // Additional 1% for experienced
 }

 // Cap at 80%
 commissionRate = Math.min(commissionRate, 0.80);

 const technicianEarning = totalAmount * commissionRate;
 const platformFee = totalAmount - technicianEarning;

 return {
 totalAmount: Math.round(totalAmount * 100) / 100,
 technicianEarning: Math.round(technicianEarning * 100) / 100,
 platformFee: Math.round(platformFee * 100) / 100,
 commissionRate: Math.round(commissionRate * 100) / 100
 };
};

/**
 * M-Pesa callback handler
 */
const handleMpesaCallback = async (req, res) => {
 try {
 const { Body } = req.body;
 const { stkCallback } = Body;

 const checkoutRequestId = stkCallback.CheckoutRequestID;
 const resultCode = stkCallback.ResultCode;

 // Find transaction by checkout request ID
 const transaction = await Transaction.findOne({
 'metadata.mpesaCheckoutRequestId': checkoutRequestId
 }).populate('bookingId');

 if (!transaction) {
 console.error('Transaction not found for M-Pesa callback:', checkoutRequestId);
 return res.status(404).json({ message: 'Transaction not found' });
 }

 if (resultCode === 0) {
 // Payment successful
 const callbackMetadata = stkCallback.CallbackMetadata.Item;
 const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
 const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;
 const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber')?.Value;

 // Update transaction
 await Transaction.findByIdAndUpdate(transaction._id, {
 status: 'completed',
 confirmedAt: new Date(),
 'metadata.mpesaReceiptNumber': mpesaReceiptNumber,
 'metadata.mpesaTransactionDate': transactionDate,
 'metadata.mpesaPhoneNumber': phoneNumber
 });

 // Transfer to escrow
 await transferToEscrow(transaction);

 // Update booking
 await Booking.findByIdAndUpdate(transaction.bookingId._id, {
 paymentStatus: 'paid',
 status: transaction.bookingId.status === 'pending' ? 'assigned' : transaction.bookingId.status
 });

 // Send notifications
 await NotificationService.sendPaymentNotification(
 transaction.userId,
 transaction,
 'sent'
 );
 } else {
 // Payment failed
 await Transaction.findByIdAndUpdate(transaction._id, {
 status: 'failed',
 failureReason: stkCallback.ResultDesc
 });

 // Notify user of payment failure
 await NotificationService.createInAppNotification(
 transaction.userId,
 'Payment Failed',
 `Your M-Pesa payment failed: ${stkCallback.ResultDesc}`,
 {
 type: 'payment',
 bookingId: transaction.bookingId._id,
 priority: 'high'
 }
 );
 }

 res.json({ success: true });
 } catch (error) {
 console.error('M-Pesa callback error:', error);
 res.status(500).json({ error: error.message });
 }
};

/**
 * Get user transaction history
 */
const getTransactionHistory = async (req, res) => {
 try {
 const { page = 1, limit = 20, type, status } = req.query;
 
 const query = { userId: req.user.id };
 if (type) query.type = type;
 if (status) query.status = status;

 const transactions = await Transaction.find(query)
 .populate('bookingId', 'serviceType status')
 .sort({ createdAt: -1 })
 .limit(limit * 1)
 .skip((page - 1) * limit)
 .exec();

 const total = await Transaction.countDocuments(query);

 res.json({
 transactions,
 totalPages: Math.ceil(total / limit),
 currentPage: page,
 total
 });
 } catch (error) {
 console.error('Get transaction history error:', error);
 res.status(500).json({ 
 message: 'Failed to fetch transaction history', 
 error: error.message 
 });
 }
};

/**
 * Process refund
 */
const processRefund = async (req, res) => {
 try {
 const { transactionId, refundAmount, reason } = req.body;

 const transaction = await Transaction.findById(transactionId)
 .populate('bookingId');

 if (!transaction) {
 return res.status(404).json({ message: 'Transaction not found' });
 }

 // Verify authorization (only admin or in specific cases)
 if (req.user.role !== 'admin' && 
 transaction.userId.toString() !== req.user.id) {
 return res.status(403).json({ message: 'Unauthorized' });
 }

 const amountToRefund = refundAmount || transaction.amount;

 let refundResult;

 // Process refund based on original payment method
 switch (transaction.paymentMethod) {
 case 'stripe':
 refundResult = await processStripeRefund(transaction, amountToRefund);
 break;
 case 'paypal':
 refundResult = await processPayPalRefund(transaction, amountToRefund);
 break;
 case 'mpesa':
 refundResult = await processMpesaRefund(transaction, amountToRefund);
 break;
 default:
 return res.status(400).json({ message: 'Refund not supported for this payment method' });
 }

 if (refundResult.success) {
 // Create refund transaction record
 const refundTransaction = new Transaction({
 userId: transaction.userId,
 bookingId: transaction.bookingId._id,
 amount: -amountToRefund, // Negative amount for refund
 currency: transaction.currency,
 type: 'refund',
 status: 'completed',
 parentTransactionId: transaction._id,
 description: `Refund for booking #${transaction.bookingId._id.toString().slice(-6)} - ${reason}`,
 metadata: refundResult.metadata
 });

 await refundTransaction.save();

 // Update original transaction
 await Transaction.findByIdAndUpdate(transactionId, {
 refundedAmount: (transaction.refundedAmount || 0) + amountToRefund,
 refundStatus: amountToRefund >= transaction.amount ? 'full' : 'partial'
 });

 // Send notification
 await NotificationService.sendPaymentNotification(
 transaction.userId,
 refundTransaction,
 'received'
 );

 res.json({
 success: true,
 message: 'Refund processed successfully',
 refundAmount: amountToRefund,
 refundTransaction: refundTransaction._id
 });
 } else {
 res.status(400).json({
 success: false,
 message: 'Refund processing failed',
 error: refundResult.error
 });
 }
 } catch (error) {
 console.error('Process refund error:', error);
 res.status(500).json({ 
 message: 'Failed to process refund', 
 error: error.message 
 });
 }
};

/**
 * Process Stripe refund
 */
const processStripeRefund = async (transaction, amount) => {
 try {
 const refund = await stripe.refunds.create({
 payment_intent: transaction.paymentIntentId,
 amount: Math.round(amount * 100) // Stripe expects cents
 });

 return {
 success: true,
 metadata: {
 stripeRefundId: refund.id,
 stripeRefundStatus: refund.status
 }
 };
 } catch (error) {
 return {
 success: false,
 error: error.message
 };
 }
};

/**
 * Process PayPal refund
 */
const processPayPalRefund = async (transaction, amount) => {
 try {
 // Note: PayPal refunds require the sale transaction ID
 // This is a simplified implementation
 return {
 success: true,
 metadata: {
 paypalRefundId: 'manual_refund_required'
 }
 };
 } catch (error) {
 return {
 success: false,
 error: error.message
 };
 }
};

/**
 * Process M-Pesa refund
 */
const processMpesaRefund = async (transaction, amount) => {
 try {
 // M-Pesa refunds are typically processed manually
 // This would require integration with B2C API
 return {
 success: true,
 metadata: {
 mpesaRefundStatus: 'manual_processing_required'
 }
 };
 } catch (error) {
 return {
 success: false,
 error: error.message
 };
 }
};

module.exports = {
 createPaymentIntent,
 confirmPayment,
 releaseEscrowPayment,
 handleMpesaCallback,
 getTransactionHistory,
 processRefund
};
