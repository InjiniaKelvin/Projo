/**
 * Payment Controller
 * 
 * This controller handles payment processing, wallet management,
 * and transaction recording with MongoDB integration.
 * Payment processing is handled through IntaSend integration.
 */

const { Wallet, Transaction, User } = require('../models');
const intasendService = require('../services/IntaSendService');

class PaymentController {
 /**
 * Get user wallet
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 async getWallet(req, res) {
 try {
 const userId = req.user._id;
 
 let wallet = await Wallet.findByUserId(userId);
 
 // Create wallet if it doesn't exist
 if (!wallet) {
 wallet = await Wallet.createWallet(userId);
 }
 
 res.json({
 success: true,
 data: { wallet }
 });
 
 } catch (error) {
 console.error('Get wallet error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to get wallet',
 error: error.message
 });
 }
 }

 /**
 * Add funds to wallet
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 async addFunds(req, res) {
 try {
 const { amount, paymentMethod, paymentDetails = {} } = req.body;
 const userId = req.user._id;
 
 // Get user's wallet
 const wallet = await Wallet.findByUserId(userId);
 if (!wallet) {
 return res.status(404).json({
 success: false,
 message: 'Wallet not found'
 });
 }
 
 // Record balance before transaction
 const balanceBefore = {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 };
 
 // Create transaction record
 const transaction = new Transaction({
 userId,
 walletId: wallet._id,
 type: 'deposit',
 amount: {
 gross: amount,
 fees: this.calculateFees(amount, paymentMethod),
 net: amount - this.calculateFees(amount, paymentMethod)
 },
 currency: 'KES',
 paymentMethod: {
 type: paymentMethod,
 details: paymentDetails
 },
 description: `Wallet deposit via ${paymentMethod}`,
 balanceBefore,
 initiatedBy: userId,
 ipAddress: req.ip,
 userAgent: req.get('User-Agent')
 });
 
 // Process payment based on method using IntaSend
 let paymentResult;
 
 try {
 switch (paymentMethod) {
 case 'mpesa':
 // Validate required fields for M-Pesa
 if (!paymentDetails.phoneNumber) {
 return res.status(400).json({
 success: false,
 message: 'Phone number is required for M-Pesa payment'
 });
 }
 
 // Initiate M-Pesa STK Push via IntaSend
 paymentResult = await intasendService.initiateMpesaSTKPush({
 amount,
 phoneNumber: paymentDetails.phoneNumber,
 email: req.user.email || paymentDetails.email,
 userId: userId.toString(),
 walletId: wallet._id.toString()
 });
 
 // Save IntaSend tracking information
 transaction.externalTransactionId = paymentResult.trackingId;
 transaction.gatewayResponse = {
 invoiceId: paymentResult.invoiceId,
 apiRef: paymentResult.apiRef,
 state: paymentResult.state,
 message: paymentResult.message
 };
 transaction.status = 'pending';
 await transaction.save();
 
 // Add transaction to wallet
 wallet.transactions.push(transaction._id);
 await wallet.save();
 
 // Return response with STK push initiated
 res.json({
 success: true,
 message: 'M-Pesa payment initiated. Please check your phone to complete the payment.',
 data: {
 transaction: transaction.toJSON(),
 wallet: wallet.toJSON(),
 paymentInstructions: 'Complete payment on your M-Pesa phone prompt',
 trackingId: paymentResult.trackingId,
 invoiceId: paymentResult.invoiceId
 }
 });
 break;
 
 case 'card':
 // Validate required fields for card payment
 if (!paymentDetails.email) {
 return res.status(400).json({
 success: false,
 message: 'Email is required for card payment'
 });
 }
 
 // Initiate card payment via IntaSend
 paymentResult = await intasendService.initiateCardPayment({
 amount,
 email: paymentDetails.email,
 firstName: req.user.firstName || paymentDetails.firstName || 'User',
 lastName: req.user.lastName || paymentDetails.lastName || 'Name',
 userId: userId.toString()
 });
 
 // Save IntaSend tracking information
 transaction.externalTransactionId = paymentResult.trackingId;
 transaction.gatewayResponse = {
 checkoutUrl: paymentResult.checkoutUrl,
 apiRef: paymentResult.apiRef
 };
 transaction.status = 'pending';
 await transaction.save();
 
 // Add transaction to wallet
 wallet.transactions.push(transaction._id);
 await wallet.save();
 
 // Return response with checkout URL
 res.json({
 success: true,
 message: 'Card payment initiated. Please complete payment at the checkout URL.',
 data: {
 transaction: transaction.toJSON(),
 wallet: wallet.toJSON(),
 checkoutUrl: paymentResult.checkoutUrl,
 trackingId: paymentResult.trackingId
 }
 });
 break;
 
 case 'bank':
 // Bank transfer remains manual process
 transaction.status = 'pending';
 transaction.gatewayResponse = {
 message: 'Bank transfer pending verification'
 };
 await transaction.save();
 
 // Add transaction to wallet
 wallet.transactions.push(transaction._id);
 await wallet.save();
 
 res.json({
 success: true,
 message: 'Bank transfer initiated. Please transfer funds and provide proof of payment.',
 data: {
 transaction: transaction.toJSON(),
 wallet: wallet.toJSON(),
 bankDetails: {
 accountName: 'QuickFix Platform',
 accountNumber: '1234567890',
 bankName: 'Sample Bank',
 reference: transaction._id.toString()
 }
 }
 });
 break;
 
 default:
 return res.status(400).json({
 success: false,
 message: 'Invalid payment method. Supported methods: mpesa, card, bank'
 });
 }
 } catch (paymentError) {
 // Mark transaction as failed
 await transaction.markAsFailed(paymentError.message, 'PAYMENT_INITIATION_FAILED');
 
 res.status(400).json({
 success: false,
 message: 'Payment initiation failed',
 error: paymentError.message,
 data: {
 transaction: transaction.toJSON()
 }
 });
 }
 
 } catch (error) {
 console.error('Add funds error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to add funds',
 error: error.message
 });
 }
 }

 /**
 * Withdraw funds from wallet
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 async withdrawFunds(req, res) {
 try {
 const { amount, withdrawalMethod, withdrawalDetails = {} } = req.body;
 const userId = req.user._id;
 
 // Get user's wallet
 const wallet = await Wallet.findByUserId(userId);
 if (!wallet) {
 return res.status(404).json({
 success: false,
 message: 'Wallet not found'
 });
 }
 
 // Check if sufficient funds
 if (wallet.balance.available < amount) {
 return res.status(400).json({
 success: false,
 message: 'Insufficient funds'
 });
 }
 
 // Record balance before transaction
 const balanceBefore = {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 };
 
 // Calculate fees
 const fees = this.calculateWithdrawalFees(amount, withdrawalMethod);
 const netAmount = amount - fees;
 
 // Create transaction record
 const transaction = new Transaction({
 userId,
 walletId: wallet._id,
 type: 'withdrawal',
 amount: {
 gross: amount,
 fees: fees,
 net: netAmount
 },
 currency: 'KES',
 paymentMethod: {
 type: withdrawalMethod,
 details: withdrawalDetails
 },
 description: `Wallet withdrawal via ${withdrawalMethod}`,
 balanceBefore,
 initiatedBy: userId,
 ipAddress: req.ip,
 userAgent: req.get('User-Agent')
 });
 
 // Process withdrawal based on method
 try {
 await transaction.markAsProcessing();
 
 if (withdrawalMethod === 'mpesa') {
 // Validate phone number for M-Pesa withdrawal
 if (!withdrawalDetails.phoneNumber) {
 return res.status(400).json({
 success: false,
 message: 'Phone number is required for M-Pesa withdrawal'
 });
 }
 
 // Deduct from wallet balance first
 await wallet.withdrawFunds(amount);
 
 // Process M-Pesa payout via IntaSend
 const payoutResult = await intasendService.payoutToTechnician({
 amount: netAmount,
 phoneNumber: withdrawalDetails.phoneNumber,
 technicianId: userId.toString(),
 description: `Withdrawal from QuickFix wallet - Transaction ${transaction._id}`
 });
 
 // Update transaction with payout information
 transaction.externalTransactionId = payoutResult.trackingId;
 transaction.gatewayResponse = {
 status: payoutResult.status,
 message: payoutResult.message
 };
 transaction.status = 'completed';
 transaction.completedAt = new Date();
 
 } else if (withdrawalMethod === 'bank') {
 // Bank transfer - manual process, mark as pending
 await wallet.withdrawFunds(amount);
 transaction.status = 'pending';
 transaction.gatewayResponse = {
 message: 'Bank transfer pending processing'
 };
 
 } else {
 return res.status(400).json({
 success: false,
 message: 'Invalid withdrawal method. Supported methods: mpesa, bank'
 });
 }
 
 // Update transaction balance after
 transaction.balanceAfter = {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 };
 
 await transaction.save();
 
 // Add transaction to wallet
 wallet.transactions.push(transaction._id);
 await wallet.save();
 
 res.json({
 success: true,
 message: withdrawalMethod === 'mpesa' 
 ? 'Withdrawal completed. Funds sent to your M-Pesa number.' 
 : 'Withdrawal initiated. Funds will be processed within 1-3 business days.',
 data: {
 transaction: transaction.toJSON(),
 wallet: wallet.toJSON()
 }
 });
 
 } catch (withdrawalError) {
 // Rollback wallet balance if withdrawal failed
 await wallet.addFunds(amount);
 
 // Mark transaction as failed
 await transaction.markAsFailed(withdrawalError.message, 'WITHDRAWAL_FAILED');
 
 res.status(400).json({
 success: false,
 message: 'Withdrawal failed',
 error: withdrawalError.message,
 data: {
 transaction: transaction.toJSON()
 }
 });
 }
 
 } catch (error) {
 console.error('Withdraw funds error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to withdraw funds',
 error: error.message
 });
 }
 }

 /**
 * Transfer funds to escrow
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 async transferToEscrow(req, res) {
 try {
 const { amount, bookingId } = req.body;
 const userId = req.user._id;
 
 const wallet = await Wallet.findByUserId(userId);
 if (!wallet) {
 return res.status(404).json({
 success: false,
 message: 'Wallet not found'
 });
 }
 
 // Check if sufficient funds
 if (wallet.balance.available < amount) {
 return res.status(400).json({
 success: false,
 message: 'Insufficient funds'
 });
 }
 
 // Record balance before transaction
 const balanceBefore = {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 };
 
 // Move funds to escrow
 await wallet.moveToEscrow(amount);
 
 // Create transaction record
 const transaction = new Transaction({
 userId,
 walletId: wallet._id,
 bookingId,
 type: 'escrow_hold',
 amount: {
 gross: amount,
 fees: 0,
 net: amount
 },
 currency: 'KES',
 status: 'completed',
 paymentMethod: {
 type: 'wallet',
 details: {}
 },
 description: `Funds moved to escrow for booking`,
 balanceBefore,
 balanceAfter: {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 },
 completedAt: new Date(),
 initiatedBy: userId
 });
 
 await transaction.save();
 
 // Add transaction to wallet
 wallet.transactions.push(transaction._id);
 await wallet.save();
 
 res.json({
 success: true,
 message: 'Funds transferred to escrow successfully',
 data: {
 transaction: transaction.toJSON(),
 wallet: wallet.toJSON()
 }
 });
 
 } catch (error) {
 console.error('Transfer to escrow error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to transfer funds to escrow',
 error: error.message
 });
 }
 }

 /**
 * Release funds from escrow
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 async releaseFromEscrow(req, res) {
 try {
 const { amount, bookingId, recipientUserId } = req.body;
 const userId = req.user._id;
 
 const wallet = await Wallet.findByUserId(userId);
 if (!wallet) {
 return res.status(404).json({
 success: false,
 message: 'Wallet not found'
 });
 }
 
 // Check if sufficient escrow funds
 if (wallet.balance.escrow < amount) {
 return res.status(400).json({
 success: false,
 message: 'Insufficient escrow funds'
 });
 }
 
 // Get recipient wallet
 const recipientWallet = await Wallet.findByUserId(recipientUserId);
 if (!recipientWallet) {
 return res.status(404).json({
 success: false,
 message: 'Recipient wallet not found'
 });
 }
 
 // Calculate platform commission (e.g., 5%)
 const commissionRate = 0.05;
 const commission = amount * commissionRate;
 const netAmount = amount - commission;
 
 // Record balances before transaction
 const balanceBefore = {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 };
 
 const recipientBalanceBefore = {
 available: recipientWallet.balance.available,
 escrow: recipientWallet.balance.escrow,
 pending: recipientWallet.balance.pending
 };
 
 // Release funds from escrow
 await wallet.releaseFromEscrow(amount, false);
 
 // Add funds to recipient wallet
 await recipientWallet.addFunds(netAmount);
 
 // Create transaction records
 const escrowReleaseTransaction = new Transaction({
 userId,
 walletId: wallet._id,
 bookingId,
 type: 'escrow_release',
 amount: {
 gross: amount,
 fees: commission,
 net: netAmount
 },
 currency: 'KES',
 status: 'completed',
 paymentMethod: {
 type: 'wallet',
 details: { recipientUserId }
 },
 description: `Escrow funds released for booking`,
 balanceBefore,
 balanceAfter: {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 },
 completedAt: new Date(),
 initiatedBy: userId
 });
 
 const recipientTransaction = new Transaction({
 userId: recipientUserId,
 walletId: recipientWallet._id,
 bookingId,
 type: 'payment',
 amount: {
 gross: netAmount,
 fees: 0,
 net: netAmount
 },
 currency: 'KES',
 status: 'completed',
 paymentMethod: {
 type: 'wallet',
 details: { fromUserId: userId }
 },
 description: `Payment received from escrow for booking`,
 balanceBefore: recipientBalanceBefore,
 balanceAfter: {
 available: recipientWallet.balance.available,
 escrow: recipientWallet.balance.escrow,
 pending: recipientWallet.balance.pending
 },
 completedAt: new Date(),
 initiatedBy: userId
 });
 
 await escrowReleaseTransaction.save();
 await recipientTransaction.save();
 
 // Add transactions to wallets
 wallet.transactions.push(escrowReleaseTransaction._id);
 recipientWallet.transactions.push(recipientTransaction._id);
 
 await wallet.save();
 await recipientWallet.save();
 
 res.json({
 success: true,
 message: 'Funds released from escrow successfully',
 data: {
 escrowTransaction: escrowReleaseTransaction.toJSON(),
 recipientTransaction: recipientTransaction.toJSON(),
 wallet: wallet.toJSON(),
 recipientWallet: recipientWallet.toJSON()
 }
 });
 
 } catch (error) {
 console.error('Release from escrow error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to release funds from escrow',
 error: error.message
 });
 }
 }

 /**
 * Get transaction history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 async getTransactionHistory(req, res) {
 try {
 const userId = req.user._id;
 const { page = 1, limit = 10, type, status } = req.query;
 
 const options = {
 page: parseInt(page),
 limit: parseInt(limit),
 sort: { createdAt: -1 },
 populate: [
 { path: 'userId', select: 'firstName lastName email' },
 { path: 'bookingId', select: 'bookingId serviceType status' }
 ]
 };
 
 const query = { userId };
 
 if (type) {
 query.type = type;
 }
 
 if (status) {
 query.status = status;
 }
 
 const transactions = await Transaction.paginate(query, options);
 
 res.json({
 success: true,
 data: {
 transactions: transactions.docs,
 pagination: {
 page: transactions.page,
 totalPages: transactions.totalPages,
 totalDocs: transactions.totalDocs,
 limit: transactions.limit,
 hasNextPage: transactions.hasNextPage,
 hasPrevPage: transactions.hasPrevPage
 }
 }
 });
 
 } catch (error) {
 console.error('Get transaction history error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to get transaction history',
 error: error.message
 });
 }
 }

 /**
 * Add payment method
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 async addPaymentMethod(req, res) {
 try {
 const { type, details, isDefault = false } = req.body;
 const userId = req.user._id;
 
 const wallet = await Wallet.findByUserId(userId);
 if (!wallet) {
 return res.status(404).json({
 success: false,
 message: 'Wallet not found'
 });
 }
 
 const paymentMethodData = {
 type,
 details,
 isDefault,
 isVerified: false, // Will be verified later
 createdAt: new Date()
 };
 
 await wallet.addPaymentMethod(paymentMethodData);
 
 res.json({
 success: true,
 message: 'Payment method added successfully',
 data: { wallet: wallet.toJSON() }
 });
 
 } catch (error) {
 console.error('Add payment method error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to add payment method',
 error: error.message
 });
 }
 }

 /**
 * Calculate fees based on payment method and amount
 * @param {number} amount - Transaction amount
 * @param {string} paymentMethod - Payment method type
 * @returns {number} Fee amount
 */
 calculateFees(amount, paymentMethod) {
 const feeRates = {
 mpesa: 0.01, // 1%
 card: 0.029, // 2.9%
 paypal: 0.034, // 3.4%
 bank: 0.005 // 0.5%
 };
 
 const rate = feeRates[paymentMethod] || 0;
 return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
 }

 /**
 * Calculate withdrawal fees
 * @param {number} amount - Withdrawal amount
 * @param {string} method - Withdrawal method
 * @returns {number} Fee amount
 */
 calculateWithdrawalFees(amount, method) {
 const feeRates = {
 mpesa: 0.015, // 1.5%
 bank: 0.01, // 1%
 paypal: 0.02 // 2%
 };
 
 const rate = feeRates[method] || 0;
 return Math.round(amount * rate * 100) / 100;
 }

 /**
 * Handle IntaSend webhook callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 async handleIntaSendWebhook(req, res) {
 try {
 const webhookData = req.body;
 
 // Verify webhook signature in production
 // const signature = req.headers['x-intasend-signature'];
 // const isValid = intasendService.verifyWebhookSignature(webhookData, signature);
 // if (!isValid) {
 // return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
 // }
 
 // Process webhook data
 const webhookResult = intasendService.handleWebhook(webhookData);
 
 if (!webhookResult.invoiceId) {
 return res.status(400).json({
 success: false,
 message: 'Invalid webhook data: missing invoice ID'
 });
 }
 
 // Find transaction by invoice ID
 const transaction = await Transaction.findOne({
 'gatewayResponse.invoiceId': webhookResult.invoiceId
 }).populate('walletId');
 
 if (!transaction) {
 console.warn('Transaction not found for invoice:', webhookResult.invoiceId);
 return res.status(404).json({
 success: false,
 message: 'Transaction not found'
 });
 }
 
 // Update transaction based on webhook status
 if (webhookResult.isSuccess) {
 // Payment successful - update wallet and transaction
 const wallet = transaction.walletId;
 
 // Add funds to wallet
 await wallet.addFunds(transaction.amount.net);
 
 // Update transaction
 transaction.status = 'completed';
 transaction.completedAt = new Date();
 transaction.balanceAfter = {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 };
 transaction.gatewayResponse = {
 ...transaction.gatewayResponse,
 state: webhookResult.state,
 paidAmount: webhookResult.paidAmount,
 mpesaReference: webhookResult.mpesaReference,
 updatedAt: new Date()
 };
 
 await transaction.save();
 
 console.log('Payment completed via webhook:', {
 transactionId: transaction._id,
 invoiceId: webhookResult.invoiceId,
 amount: webhookResult.paidAmount
 });
 
 } else if (webhookResult.isFailed) {
 // Payment failed
 await transaction.markAsFailed(
 webhookResult.failedReason || 'Payment failed',
 'PAYMENT_FAILED'
 );
 
 console.log('Payment failed via webhook:', {
 transactionId: transaction._id,
 invoiceId: webhookResult.invoiceId,
 reason: webhookResult.failedReason
 });
 }
 
 // Acknowledge webhook
 res.json({
 success: true,
 message: 'Webhook processed successfully'
 });
 
 } catch (error) {
 console.error('IntaSend webhook error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to process webhook',
 error: error.message
 });
 }
 }

 /**
 * Check payment status for a transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 async checkPaymentStatus(req, res) {
 try {
 const { transactionId } = req.params;
 const userId = req.user._id;
 
 // Find transaction
 const transaction = await Transaction.findOne({
 _id: transactionId,
 userId
 }).populate('walletId');
 
 if (!transaction) {
 return res.status(404).json({
 success: false,
 message: 'Transaction not found'
 });
 }
 
 // If transaction is already completed or failed, return current status
 if (transaction.status === 'completed' || transaction.status === 'failed') {
 return res.json({
 success: true,
 data: {
 transaction: transaction.toJSON(),
 status: transaction.status
 }
 });
 }
 
 // Check status with IntaSend
 const invoiceId = transaction.gatewayResponse?.invoiceId;
 if (!invoiceId) {
 return res.status(400).json({
 success: false,
 message: 'No invoice ID found for this transaction'
 });
 }
 
 const paymentStatus = await intasendService.checkPaymentStatus(invoiceId);
 
 // Update transaction if status changed
 if (paymentStatus.status === 'completed' && transaction.status !== 'completed') {
 const wallet = transaction.walletId;
 
 // Add funds to wallet
 await wallet.addFunds(transaction.amount.net);
 
 // Update transaction
 transaction.status = 'completed';
 transaction.completedAt = new Date();
 transaction.balanceAfter = {
 available: wallet.balance.available,
 escrow: wallet.balance.escrow,
 pending: wallet.balance.pending
 };
 transaction.gatewayResponse = {
 ...transaction.gatewayResponse,
 ...paymentStatus.metadata,
 updatedAt: new Date()
 };
 
 await transaction.save();
 
 } else if (paymentStatus.status === 'failed' && transaction.status !== 'failed') {
 await transaction.markAsFailed('Payment failed', 'PAYMENT_FAILED');
 }
 
 res.json({
 success: true,
 data: {
 transaction: transaction.toJSON(),
 paymentStatus
 }
 });
 
 } catch (error) {
 console.error('Check payment status error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to check payment status',
 error: error.message
 });
 }
 }

 /**
   * Get transaction statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTransactionStats(req, res) {
    try {
      const userId = req.user._id;
      const { period = '30d' } = req.query;
      
      let startDate = new Date();
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      } else if (period === '1y') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      } else {
        startDate.setDate(startDate.getDate() - 30); // Default to 30d
      }

      const stats = await Transaction.aggregate([
        {
          $match: {
            userId: userId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalVolume: { $sum: '$amount.gross' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$amount.gross' },
            successful: { 
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            failed: { 
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        }
      ]);

      // Get daily volume for chart
      const dailyVolume = await Transaction.aggregate([
        {
          $match: {
            userId: userId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            amount: { $sum: '$amount.gross' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        success: true,
        data: {
          summary: stats[0] || {
            totalVolume: 0,
            count: 0,
            avgAmount: 0,
            successful: 0,
            failed: 0
          },
          dailyVolume
        }
      });

    } catch (error) {
      console.error('Get transaction stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction statistics',
        error: error.message
      });
    }
  }

  /**
 * Process M-Pesa payment (mock implementation)
 * @param {number} amount - Payment amount
 * @param {Object} details - Payment details
 * @param {Object} transaction - Transaction object
 * @returns {Object} Payment result
 * @deprecated Use IntaSend integration instead
 */
 async processMpesaPayment(amount, details, transaction) {
 try {
 // Mock M-Pesa implementation
 // In production, integrate with Safaricom Daraja API
 
 const mockSuccess = Math.random() > 0.1; // 90% success rate for demo
 
 if (mockSuccess) {
 return {
 success: true,
 externalTransactionId: 'MPESA' + Date.now(),
 gatewayResponse: {
 responseCode: '0',
 responseDescription: 'Success',
 transactionId: 'MPESA' + Date.now(),
 phoneNumber: details.phoneNumber
 }
 };
 } else {
 return {
 success: false,
 error: 'M-Pesa payment failed',
 errorCode: 'MPESA_ERROR'
 };
 }
 } catch (error) {
 return {
 success: false,
 error: error.message,
 errorCode: 'MPESA_EXCEPTION'
 };
 }
 }

 /**
 * Process bank transfer (mock implementation)
 * @param {number} amount - Payment amount
 * @param {Object} details - Payment details
 * @param {Object} transaction - Transaction object
 * @returns {Object} Payment result
 */
 async processBankTransfer(amount, details, transaction) {
 try {
 // Mock bank transfer implementation
 // In production, integrate with banking APIs
 
 return {
 success: true,
 externalTransactionId: 'BANK' + Date.now(),
 gatewayResponse: {
 status: 'PENDING',
 referenceNumber: 'BANK' + Date.now(),
 accountNumber: details.accountNumber
 }
 };
 } catch (error) {
 return {
 success: false,
 error: error.message,
 errorCode: 'BANK_ERROR'
 };
 }
 }
}

const paymentController = new PaymentController();

// Bind all methods to preserve 'this' context when used as middleware
Object.getOwnPropertyNames(PaymentController.prototype).forEach(method => {
 if (method !== 'constructor' && typeof paymentController[method] === 'function') {
 paymentController[method] = paymentController[method].bind(paymentController);
 }
});

module.exports = paymentController;
