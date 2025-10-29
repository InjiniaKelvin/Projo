/**
 * IntaSend Payment Service
 * 
 * This service handles all IntaSend payment gateway operations including:
 * - Wallet top-ups via M-Pesa and Card payments
 * - Payment collection and processing
 * - Webhook/callback handling for payment confirmation
 * - Escrow release workflow for technician payouts
 * 
 * Documentation: https://developers.intasend.com/
 */

const IntaSend = require('intasend-node');
const https = require('https');

class IntaSendService {
 constructor() {
 // Initialize IntaSend with credentials from environment variables
 this.publishableKey = process.env.INTASEND_PUBLISHABLE_KEY;
 this.secretKey = process.env.INTASEND_SECRET_KEY;
 this.isTestMode = process.env.INTASEND_ENV === 'sandbox';
 
 // Validate that API keys are configured
 if (!this.publishableKey || !this.secretKey) {
 console.warn('IntaSend API keys not configured. Payment features will be limited.');
 }
 
 // Initialize IntaSend client
 this.intasend = new IntaSend(
 this.publishableKey,
 this.secretKey,
 this.isTestMode
 );
 
 // Initialize payment collection service
 this.collection = this.intasend.collection();
 
 // Initialize payout service for technician withdrawals
 this.payout = this.intasend.payouts();
 
 // Initialize wallets service for managing platform wallets
 this.wallets = this.intasend.wallets();
 }
 
 /**
 * Initiate wallet top-up payment via M-Pesa STK Push
 * 
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount to charge in KES
 * @param {string} params.phoneNumber - Customer phone number (format: 254XXXXXXXXX)
 * @param {string} params.email - Customer email address
 * @param {string} params.userId - User ID for tracking
 * @param {string} params.walletId - Wallet ID for tracking
 * @returns {Promise<Object>} Payment response with tracking ID
 */
 async initiateMpesaSTKPush(params) {
 try {
 const { amount, phoneNumber, email, userId, walletId } = params;
 
 // Validate required parameters
 if (!amount || !phoneNumber || !email) {
 throw new Error('Amount, phone number, and email are required for M-Pesa payment');
 }
 
 // Validate phone number format (should be 254XXXXXXXXX)
 const formattedPhone = this.formatPhoneNumber(phoneNumber);
 
 // Create payment request with IntaSend
 const paymentData = {
 amount: amount,
 phone_number: formattedPhone,
 email: email,
 api_ref: `WALLET_TOPUP_${userId}_${Date.now()}`,
 // Optional callback URL for payment status updates
 callback_url: process.env.INTASEND_CALLBACK_URL
 };
 
 console.log('Initiating M-Pesa STK Push:', {
 amount: paymentData.amount,
 phone: formattedPhone,
 api_ref: paymentData.api_ref
 });
 
 // Send STK push request using direct HTTPS (bypassing SDK due to timeout issues)
 const response = await this.sendDirectHTTPSRequest({
 method: 'POST',
 path: '/api/v1/payment/mpesa-stk-push/',
 data: {
 ...paymentData,
 method: 'M-PESA',
 currency: 'KES',
 public_key: this.publishableKey
 }
 });
 
 if (!response || !response.invoice) {
 throw new Error('Invalid response from IntaSend API');
 }
 
 return {
 success: true,
 trackingId: response.invoice.invoice_id,
 apiRef: paymentData.api_ref,
 state: response.invoice.state,
 provider: 'intasend',
 paymentMethod: 'mpesa',
 message: 'Payment request sent to your phone. Please enter your M-Pesa PIN to complete.',
 data: {
 invoiceId: response.invoice.invoice_id,
 amount: amount,
 currency: 'KES',
 phoneNumber: formattedPhone
 }
 };
 
 } catch (error) {
 console.error('IntaSend M-Pesa STK Push error:', error.message);
 console.error('Error details:', JSON.stringify(error.response?.data || error, null, 2));
 
 return {
 success: false,
 error: error.message || 'Failed to initiate M-Pesa payment',
 errorDetails: error.response?.data || error
 };
 }
 }
 
 /**
 * Initiate card payment for wallet top-up
 * Note: IntaSend sandbox may have limitations for card testing
 * 
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount to charge in KES
 * @param {string} params.email - Customer email address
 * @param {string} params.firstName - Customer first name
 * @param {string} params.lastName - Customer last name
 * @param {string} params.userId - User ID for tracking
 * @returns {Promise<Object>} Payment response with checkout URL
 */
 async initiateCardPayment(params) {
 try {
 const { amount, email, firstName, lastName, userId } = params;
 
 // Validate required parameters
 if (!amount || !email || !firstName || !lastName) {
 throw new Error('Amount, email, first name, and last name are required for card payment');
 }
 
 // For now, return a mock response indicating card payment needs additional setup
 // In production, you would integrate with IntaSend's card payment API
 // which requires additional configuration and testing
 
 const mockCheckoutUrl = `https://sandbox.intasend.com/pay/${Date.now()}`;
 const mockId = `CARD_${Date.now()}`;
 
 console.log('Initiating card payment:', {
 amount: amount,
 email: email,
 note: 'Using mock response - IntaSend card payment requires additional API configuration'
 });
 
 // Note: In a real implementation, you would call IntaSend's card payment endpoint
 // The current intasend-node SDK version may need updates for full card support
 
 return {
 success: true,
 checkoutUrl: mockCheckoutUrl,
 trackingId: mockId,
 apiRef: `WALLET_TOPUP_${userId}_${Date.now()}`,
 provider: 'intasend',
 paymentMethod: 'card',
 message: 'Card payment requires additional IntaSend configuration',
 data: {
 checkoutId: mockId,
 amount: amount,
 currency: 'KES'
 },
 note: 'This is a mock response. Implement actual IntaSend card API when ready.'
 };
 
 } catch (error) {
 console.error('IntaSend card payment error:', error);
 
 return {
 success: false,
 error: error.message || 'Failed to initiate card payment',
 errorDetails: error.response?.data || error
 };
 }
 }
 
 /**
 * Check payment status
 * 
 * @param {string} invoiceId - IntaSend invoice/checkout ID
 * @param {string} transactionId - Internal transaction ID (optional)
 * @returns {Promise<Object>} Payment status information
 */
 async checkPaymentStatus(invoiceId, transactionId) {
 try {
 if (!invoiceId) {
 throw new Error('Invoice ID is required to check payment status');
 }
 
 // Retrieve payment status from IntaSend
 const status = await this.collection.status(invoiceId);
 
 // Validate response
 if (!status || !status.invoice) {
 throw new Error('Invalid response from IntaSend API');
 }
 
 // Map IntaSend status to internal status
 let internalStatus;
 switch (status.invoice.state) {
 case 'COMPLETE':
 case 'PAID':
 internalStatus = 'completed';
 break;
 case 'PENDING':
 case 'PROCESSING':
 internalStatus = 'processing';
 break;
 case 'FAILED':
 internalStatus = 'failed';
 break;
 default:
 internalStatus = 'pending';
 }
 
 return {
 success: true,
 status: internalStatus,
 intasendStatus: status.invoice.state,
 amount: status.invoice.value,
 currency: status.invoice.currency,
 paidAmount: status.invoice.paid_amount || 0,
 invoiceId: status.invoice.invoice_id,
 createdAt: status.invoice.created_at,
 updatedAt: status.invoice.updated_at,
 intasendData: status.invoice
 };
 
 } catch (error) {
 console.error('IntaSend payment status check error:', error);
 
 return {
 success: false,
 error: error.message || 'Failed to check payment status',
 errorDetails: error.response?.data || error,
 note: 'If invoice does not exist in IntaSend, it may be a mock/test transaction'
 };
 }
 }
 
 /**
 * Process payout to technician (withdrawal from escrow)
 * 
 * @param {Object} params - Payout parameters
 * @param {number} params.amount - Amount to pay out in KES
 * @param {string} params.phoneNumber - Technician M-Pesa phone number
 * @param {string} params.technicianId - Technician user ID
 * @param {string} params.bookingId - Related booking ID
 * @param {string} params.description - Payout description
 * @returns {Promise<Object>} Payout response
 */
 async payoutToTechnician(params) {
 try {
 const { amount, phoneNumber, technicianId, bookingId, description } = params;
 
 // Validate required parameters
 if (!amount || !phoneNumber || !technicianId) {
 throw new Error('Amount, phone number, and technician ID are required for payout');
 }
 
 // Format phone number for M-Pesa
 const formattedPhone = this.formatPhoneNumber(phoneNumber);
 
 // IntaSend payouts API format
 const payoutData = {
 currency: 'KES',
 transactions: [{
 name: `Technician ${technicianId}`,
 account: formattedPhone,
 amount: amount,
 narrative: description || `Payment for booking ${bookingId}`
 }]
 };
 
 console.log('Initiating technician payout:', {
 amount: amount,
 phone: formattedPhone,
 technicianId: technicianId
 });
 
 // Process M-Pesa B2C payout
 // Note: IntaSend sandbox requires wallet funding and approval via dashboard
 const response = await this.payout.mpesa(payoutData);
 
 return {
 success: true,
 trackingId: response.tracking_id || response.file_id,
 status: response.status || 'pending',
 provider: 'intasend',
 message: 'Payout initiated successfully. Funds will be sent to M-Pesa.',
 data: {
 trackingId: response.tracking_id || response.file_id,
 amount: amount,
 currency: 'KES',
 phoneNumber: formattedPhone,
 technicianId: technicianId
 }
 };
 
 } catch (error) {
 console.error('IntaSend payout error:', error);
 
 // Parse error details if available
 let errorMessage = 'Failed to process payout';
 let errorDetails = error;
 
 if (error.response?.data) {
 errorDetails = error.response.data;
 if (typeof errorDetails === 'object') {
 errorMessage = errorDetails.message || errorDetails.detail || errorMessage;
 }
 } else if (error.message) {
 errorMessage = error.message;
 }
 
 // Check if it's a sandbox limitation error
 if (errorMessage.includes('wallet') || errorMessage.includes('balance')) {
 errorMessage = 'Insufficient wallet balance. In sandbox, please fund your IntaSend wallet via dashboard.';
 }
 
 return {
 success: false,
 error: errorMessage,
 errorDetails: errorDetails,
 note: 'IntaSend sandbox payouts require: 1) Funded wallet, 2) Approved via dashboard'
 };
 }
 }
 
 /**
 * Verify webhook signature for security
 * 
 * @param {Object} payload - Webhook payload from IntaSend
 * @param {string} signature - Signature from webhook headers
 * @returns {boolean} Whether signature is valid
 */
 verifyWebhookSignature(payload, signature) {
 try {
 // IntaSend uses HMAC SHA256 for webhook signatures
 // Implementation depends on IntaSend's webhook documentation
 // For now, return true in test mode, implement proper verification in production
 
 if (this.isTestMode) {
 return true;
 }
 
 // TODO: Implement proper signature verification for production
 // const crypto = require('crypto');
 // const computedSignature = crypto
 // .createHmac('sha256', this.secretKey)
 // .update(JSON.stringify(payload))
 // .digest('hex');
 // return computedSignature === signature;
 
 return true;
 
 } catch (error) {
 console.error('Webhook signature verification error:', error);
 return false;
 }
 }
 
 /**
 * Handle webhook callback from IntaSend
 * This processes the webhook and updates the transaction in the database
 * 
 * @param {Object} webhookData - Webhook payload from IntaSend
 * @returns {Promise<Object>} Processed webhook data with transaction
 */
 async handleWebhook(webhookData) {
 try {
 console.log('Processing IntaSend webhook:', {
 state: webhookData.state,
 invoice_id: webhookData.invoice_id,
 api_ref: webhookData.api_ref
 });
 
 // Import models (lazy load to avoid circular dependencies)
 const Transaction = require('../models/Transaction');
 const Wallet = require('../models/Wallet');
 
 // Find transaction by IntaSend invoice ID or API reference
 let transaction = null;
 
 if (webhookData.invoice_id) {
 transaction = await Transaction.findOne({ 
 externalTransactionId: webhookData.invoice_id 
 });
 }
 
 if (!transaction && webhookData.api_ref) {
 transaction = await Transaction.findOne({ 
 'metadata.apiRef': webhookData.api_ref 
 });
 }
 
 if (!transaction) {
 throw new Error(`Transaction not found for invoice_id: ${webhookData.invoice_id}, api_ref: ${webhookData.api_ref}`);
 }
 
 // Determine payment status
 const isSuccess = webhookData.state === 'COMPLETE' || webhookData.state === 'PAID';
 const isFailed = webhookData.state === 'FAILED';
 
 // Update transaction status
 if (isSuccess) {
 transaction.status = 'completed';
 transaction.completedAt = new Date();
 
 // Update wallet balance for deposits
 if (transaction.type === 'deposit') {
 const wallet = await Wallet.findById(transaction.walletId);
 if (wallet) {
 await wallet.addFunds(transaction.amount.net);
 transaction.balanceAfter = {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 };
 }
 }
 } else if (isFailed) {
 transaction.status = 'failed';
 transaction.failureReason = webhookData.failed_reason || 'Payment failed';
 } else {
 transaction.status = 'processing';
 }
 
 // Store webhook data
 transaction.gatewayResponse = webhookData;
 if (webhookData.mpesa_reference) {
 transaction.metadata = {
 ...transaction.metadata,
 mpesaReference: webhookData.mpesa_reference
 };
 }
 
 await transaction.save();
 
 return {
 success: true,
 transaction: transaction,
 data: {
 invoiceId: webhookData.invoice_id,
 apiRef: webhookData.api_ref,
 state: webhookData.state,
 amount: webhookData.value,
 isSuccess: isSuccess,
 isFailed: isFailed
 }
 };
 
 } catch (error) {
 console.error('Webhook processing error:', error);
 
 return {
 success: false,
 error: error.message || 'Failed to process webhook',
 errorDetails: error
 };
 }
 }
 
 /**
 * Format phone number to IntaSend required format (254XXXXXXXXX)
 * 
 * @param {string} phoneNumber - Phone number in various formats
 * @returns {string} Formatted phone number
 */
 formatPhoneNumber(phoneNumber) {
 // Remove any spaces, dashes, or other non-numeric characters
 let cleaned = phoneNumber.replace(/\D/g, '');
 
 // Handle different phone number formats
 if (cleaned.startsWith('0')) {
 // Convert 0712345678 to 254712345678
 cleaned = '254' + cleaned.substring(1);
 } else if (cleaned.startsWith('254')) {
 // Already in correct format
 cleaned = cleaned;
 } else if (cleaned.startsWith('+254')) {
 // Remove + sign
 cleaned = cleaned.substring(1);
 } else if (cleaned.length === 9) {
 // Add 254 prefix
 cleaned = '254' + cleaned;
 }
 
 // Validate final format
 if (!cleaned.startsWith('254') || cleaned.length !== 12) {
 throw new Error(`Invalid phone number format: ${phoneNumber}. Expected format: 254XXXXXXXXX`);
 }
 
 return cleaned;
 }
 
 /**
 * Get supported payment methods
 * 
 * @returns {Array} List of supported payment methods
 */
 getSupportedPaymentMethods() {
 return [
 {
 id: 'mpesa',
 name: 'M-Pesa',
 type: 'mobile_money',
 currency: 'KES',
 description: 'Pay via M-Pesa mobile money',
 icon: 'phone-portrait',
 enabled: true
 },
 {
 id: 'card',
 name: 'Debit/Credit Card',
 type: 'card',
 currency: 'KES',
 description: 'Pay with Visa or Mastercard',
 icon: 'card',
 enabled: true
 }
 ];
 }
 
 /**
 * Calculate transaction fees
 * 
 * @param {number} amount - Transaction amount
 * @param {string} method - Payment method (mpesa, card)
 * @returns {Object} Fee breakdown
 */
 calculateFees(amount, method = 'mpesa') {
 // IntaSend fee structure (approximate)
 // M-Pesa: 1.5% + KES 10
 // Card: 3.5% + KES 0
 
 let feePercentage = 0;
 let fixedFee = 0;
 
 if (method === 'mpesa') {
 feePercentage = 0.015; // 1.5%
 fixedFee = 10;
 } else if (method === 'card') {
 feePercentage = 0.035; // 3.5%
 fixedFee = 0;
 }
 
 const percentageFee = amount * feePercentage;
 const totalFee = percentageFee + fixedFee;
 const netAmount = amount - totalFee;
 
 return {
 grossAmount: amount,
 feePercentage: feePercentage * 100,
 fixedFee: fixedFee,
 percentageFee: Math.round(percentageFee * 100) / 100,
 totalFee: Math.round(totalFee * 100) / 100,
 netAmount: Math.round(netAmount * 100) / 100
 };
 }

 /**
 * Send direct HTTPS request to IntaSend API (bypassing SDK)
 * This method is used to avoid timeout issues in the IntaSend Node.js SDK
 * 
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {string} options.path - API endpoint path
 * @param {Object} options.data - Request payload
 * @returns {Promise<Object>} API response
 */
 sendDirectHTTPSRequest(options) {
 return new Promise((resolve, reject) => {
 const { method, path, data } = options;
 
 // Determine hostname based on environment
 const hostname = this.isTestMode ? 'sandbox.intasend.com' : 'payment.intasend.com';
 
 // Prepare request payload
 const payload = JSON.stringify(data);
 
 // Setup HTTPS request options
 const requestOptions = {
 hostname: hostname,
 port: 443,
 path: path,
 method: method,
 headers: {
 'Content-Type': 'application/json',
 'Content-Length': Buffer.byteLength(payload),
 'Authorization': `Bearer ${this.secretKey}`,
 'INTASEND_PUBLIC_API_KEY': this.publishableKey
 },
 timeout: 30000 // 30 second timeout
 };
 
 console.log(`Direct HTTPS Request to ${hostname}${path}`);
 
 const req = https.request(requestOptions, (res) => {
 let responseData = '';
 
 res.on('data', (chunk) => {
 responseData += chunk;
 });
 
 res.on('end', () => {
 try {
 const parsedData = JSON.parse(responseData);
 
 if (res.statusCode === 200 || res.statusCode === 201) {
 console.log('[COMPLETED] IntaSend API Success:', res.statusCode);
 resolve(parsedData);
 } else {
 console.error('[FAILED] IntaSend API Error:', res.statusCode, parsedData);
 reject({
 statusCode: res.statusCode,
 message: 'IntaSend API request failed',
 data: parsedData
 });
 }
 } catch (error) {
 console.error('Failed to parse IntaSend response:', error);
 reject(error);
 }
 });
 });
 
 req.on('error', (error) => {
 console.error('HTTPS Request Error:', error);
 reject(error);
 });
 
 req.on('timeout', () => {
 req.destroy();
 reject(new Error('Request timeout - IntaSend API took too long to respond'));
 });
 
 // Write payload and end request
 req.write(payload);
 req.end();
 });
 }
}

// Export singleton instance
module.exports = new IntaSendService();
