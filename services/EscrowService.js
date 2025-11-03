// services/EscrowService.js
// Comprehensive escrow wallet service for secure transactions

import PaymentService from './PaymentService';
import StorageService from './StorageService';

// Escrow configuration
const ESCROW_CONFIG = {
 API_BASE_URL: 'http://localhost:5000/api',
 ESCROW_HOLD_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
 AUTO_RELEASE_DELAY: 48 * 60 * 60 * 1000, // 48 hours in milliseconds
 DISPUTE_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

/**
 * Escrow Service Class
 * Handles secure escrow transactions for service payments
 */
class EscrowService {

 /**
 * Initialize escrow service with user session
 * @param {string} userToken - Authentication token
 */
 static setUserToken(userToken) {
 this.userToken = userToken;
 }

 // ==================== ESCROW WALLET MANAGEMENT ====================

 /**
 * Get user's escrow wallet balance and details
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Wallet information
 */
 static async getWalletBalance(userId) {
 try {
 console.log('Fetching wallet balance for user:', userId);

 // Mock wallet data for development
 // In production, fetch from backend API
 const mockWalletData = {
 success: true,
 wallet: {
 userId: userId,
 totalBalance: 1250.75,
 availableBalance: 950.25,
 escrowBalance: 300.50,
 currency: 'USD',
 lastUpdated: new Date().toISOString(),
 escrowTransactions: [
 {
 id: 'escrow_001',
 amount: 150.00,
 serviceId: 'service_123',
 status: 'held',
 createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
 releaseDate: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
 },
 {
 id: 'escrow_002',
 amount: 150.50,
 serviceId: 'service_124',
 status: 'held',
 createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
 releaseDate: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
 },
 ],
 },
 };

 // Store wallet data locally for offline access
 await StorageService.storeWalletData(mockWalletData.wallet);

 console.log('Wallet balance fetched successfully:', mockWalletData);
 return mockWalletData;

 } catch (error) {
 console.error('Error fetching wallet balance:', error);
 
 // Try to get cached wallet data
 const cachedWallet = await StorageService.getWalletData();
 if (cachedWallet) {
 return {
 success: true,
 wallet: cachedWallet,
 fromCache: true,
 };
 }

 return {
 success: false,
 error: error.message || 'Failed to fetch wallet balance',
 code: 'WALLET_FETCH_ERROR',
 };
 }
 }

 /**
 * Add funds to wallet
 * @param {Object} fundingData - Funding information
 * @param {number} fundingData.amount - Amount to add
 * @param {string} fundingData.paymentMethod - Payment method ID
 * @param {string} fundingData.currency - Currency code
 * @returns {Promise<Object>} Funding result
 */
 static async addFundsToWallet(fundingData) {
 try {
 console.log('Adding funds to wallet:', fundingData);

 // Validate funding amount
 const validation = PaymentService.validatePaymentAmount(
 fundingData.amount, 
 fundingData.currency
 );

 if (!validation.valid) {
 return {
 success: false,
 error: validation.error,
 code: 'INVALID_AMOUNT',
 };
 }

 // Process payment based on selected method
 let paymentResult;
 
 switch (fundingData.paymentMethod) {
 case 'mpesa':
 paymentResult = await PaymentService.processMPesaPayment({
 amount: fundingData.amount,
 phoneNumber: fundingData.phoneNumber,
 description: 'Wallet funding',
 });
 break;

 case 'bank_transfer':
 paymentResult = await PaymentService.processBankTransfer({
 amount: fundingData.amount,
 currency: fundingData.currency,
 bankAccount: fundingData.bankAccount,
 description: 'Wallet funding',
 });
 break;

 default:
 return {
 success: false,
 error: 'Unsupported payment method',
 code: 'INVALID_PAYMENT_METHOD',
 };
 }

 if (!paymentResult.success) {
 return paymentResult;
 }

 // Mock wallet update for development
 const walletTransaction = {
 id: `wallet_${Date.now()}`,
 type: 'credit',
 amount: fundingData.amount,
 currency: fundingData.currency,
 paymentMethod: fundingData.paymentMethod,
 paymentTransactionId: paymentResult.transactionId,
 status: paymentResult.status === 'succeeded' ? 'completed' : 'pending',
 description: 'Wallet funding',
 createdAt: new Date().toISOString(),
 };

 console.log('Funds added successfully:', walletTransaction);
 return {
 success: true,
 transaction: walletTransaction,
 paymentResult: paymentResult,
 };

 } catch (error) {
 console.error('Error adding funds to wallet:', error);
 return {
 success: false,
 error: error.message || 'Failed to add funds to wallet',
 code: 'WALLET_FUNDING_ERROR',
 };
 }
 }

 /**
 * Withdraw funds from wallet
 * @param {Object} withdrawalData - Withdrawal information
 * @param {number} withdrawalData.amount - Amount to withdraw
 * @param {string} withdrawalData.withdrawMethod - Withdrawal method
 * @param {Object} withdrawalData.destination - Withdrawal destination
 * @returns {Promise<Object>} Withdrawal result
 */
 static async withdrawFundsFromWallet(withdrawalData) {
 try {
 console.log('Withdrawing funds from wallet:', withdrawalData);

 // Validate withdrawal amount
 const validation = PaymentService.validatePaymentAmount(
 withdrawalData.amount, 
 withdrawalData.currency
 );

 if (!validation.valid) {
 return {
 success: false,
 error: validation.error,
 code: 'INVALID_AMOUNT',
 };
 }

 // Check available balance
 const walletData = await this.getWalletBalance(withdrawalData.userId);
 if (!walletData.success) {
 return {
 success: false,
 error: 'Unable to verify wallet balance',
 code: 'WALLET_BALANCE_ERROR',
 };
 }

 if (walletData.wallet.availableBalance < withdrawalData.amount) {
 return {
 success: false,
 error: 'Insufficient available balance',
 code: 'INSUFFICIENT_FUNDS',
 };
 }

 // Mock withdrawal processing for development
 const withdrawalTransaction = {
 id: `withdrawal_${Date.now()}`,
 type: 'debit',
 amount: withdrawalData.amount,
 currency: withdrawalData.currency || 'USD',
 withdrawMethod: withdrawalData.withdrawMethod,
 destination: withdrawalData.destination,
 status: 'processing',
 description: 'Wallet withdrawal',
 estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
 createdAt: new Date().toISOString(),
 };

 console.log('Withdrawal initiated:', withdrawalTransaction);
 return {
 success: true,
 transaction: withdrawalTransaction,
 };

 } catch (error) {
 console.error('Error withdrawing funds from wallet:', error);
 return {
 success: false,
 error: error.message || 'Failed to withdraw funds from wallet',
 code: 'WALLET_WITHDRAWAL_ERROR',
 };
 }
 }

 // ==================== ESCROW TRANSACTION MANAGEMENT ====================

 /**
 * Create escrow transaction for service payment
 * @param {Object} escrowData - Escrow transaction data
 * @param {string} escrowData.serviceId - Service ID
 * @param {string} escrowData.clientId - Client user ID
 * @param {string} escrowData.technicianId - Technician user ID
 * @param {number} escrowData.amount - Escrow amount
 * @param {string} escrowData.currency - Currency code
 * @param {string} escrowData.description - Service description
 * @returns {Promise<Object>} Escrow creation result
 */
 static async createEscrowTransaction(escrowData) {
 try {
 console.log('Creating escrow transaction:', escrowData);

 // Validate escrow amount
 const validation = PaymentService.validatePaymentAmount(
 escrowData.amount, 
 escrowData.currency
 );

 if (!validation.valid) {
 return {
 success: false,
 error: validation.error,
 code: 'INVALID_AMOUNT',
 };
 }

 // Check client wallet balance
 const walletData = await this.getWalletBalance(escrowData.clientId);
 if (!walletData.success) {
 return {
 success: false,
 error: 'Unable to verify wallet balance',
 code: 'WALLET_BALANCE_ERROR',
 };
 }

 if (walletData.wallet.availableBalance < escrowData.amount) {
 return {
 success: false,
 error: 'Insufficient wallet balance. Please add funds first.',
 code: 'INSUFFICIENT_FUNDS',
 };
 }

 // Create escrow transaction
 const escrowTransaction = {
 id: `escrow_${Date.now()}`,
 serviceId: escrowData.serviceId,
 clientId: escrowData.clientId,
 technicianId: escrowData.technicianId,
 amount: escrowData.amount,
 currency: escrowData.currency || 'USD',
 status: 'held',
 description: escrowData.description,
 createdAt: new Date().toISOString(),
 releaseDate: new Date(Date.now() + ESCROW_CONFIG.ESCROW_HOLD_DURATION).toISOString(),
 autoReleaseDate: new Date(Date.now() + ESCROW_CONFIG.AUTO_RELEASE_DELAY).toISOString(),
 disputeDeadline: new Date(Date.now() + ESCROW_CONFIG.DISPUTE_TIMEOUT).toISOString(),
 conditions: {
 serviceCompleted: false,
 clientApproval: false,
 technicianConfirmation: false,
 disputeRaised: false,
 },
 };

 console.log('Escrow transaction created:', escrowTransaction);
 return {
 success: true,
 escrowTransaction: escrowTransaction,
 };

 } catch (error) {
 console.error('Error creating escrow transaction:', error);
 return {
 success: false,
 error: error.message || 'Failed to create escrow transaction',
 code: 'ESCROW_CREATION_ERROR',
 };
 }
 }

 /**
 * Release escrow funds to technician
 * @param {string} escrowId - Escrow transaction ID
 * @param {string} userId - User requesting release
 * @param {string} reason - Release reason
 * @returns {Promise<Object>} Release result
 */
 static async releaseEscrowFunds(escrowId, userId, reason = 'Service completed') {
 try {
 console.log('Releasing escrow funds:', { escrowId, userId, reason });

 // Mock escrow release for development
 const releaseTransaction = {
 id: `release_${Date.now()}`,
 escrowId: escrowId,
 releasedBy: userId,
 amount: 150.00, // Mock amount
 currency: 'USD',
 status: 'completed',
 reason: reason,
 releasedAt: new Date().toISOString(),
 processingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
 };

 console.log('Escrow funds released:', releaseTransaction);
 return {
 success: true,
 release: releaseTransaction,
 };

 } catch (error) {
 console.error('Error releasing escrow funds:', error);
 return {
 success: false,
 error: error.message || 'Failed to release escrow funds',
 code: 'ESCROW_RELEASE_ERROR',
 };
 }
 }

 /**
 * Refund escrow funds to client
 * @param {string} escrowId - Escrow transaction ID
 * @param {string} userId - User requesting refund
 * @param {string} reason - Refund reason
 * @returns {Promise<Object>} Refund result
 */
 static async refundEscrowFunds(escrowId, userId, reason = 'Service cancelled') {
 try {
 console.log('Refunding escrow funds:', { escrowId, userId, reason });

 // Mock escrow refund for development
 const refundTransaction = {
 id: `refund_${Date.now()}`,
 escrowId: escrowId,
 refundedBy: userId,
 amount: 150.00, // Mock amount
 currency: 'USD',
 status: 'completed',
 reason: reason,
 refundedAt: new Date().toISOString(),
 processingTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
 };

 console.log('Escrow funds refunded:', refundTransaction);
 return {
 success: true,
 refund: refundTransaction,
 };

 } catch (error) {
 console.error('Error refunding escrow funds:', error);
 return {
 success: false,
 error: error.message || 'Failed to refund escrow funds',
 code: 'ESCROW_REFUND_ERROR',
 };
 }
 }

 /**
 * Raise dispute for escrow transaction
 * @param {string} escrowId - Escrow transaction ID
 * @param {string} userId - User raising dispute
 * @param {string} reason - Dispute reason
 * @param {string} description - Detailed description
 * @returns {Promise<Object>} Dispute result
 */
 static async raiseEscrowDispute(escrowId, userId, reason, description) {
 try {
 console.log('Raising escrow dispute:', { escrowId, userId, reason });

 // Mock dispute creation for development
 const dispute = {
 id: `dispute_${Date.now()}`,
 escrowId: escrowId,
 raisedBy: userId,
 reason: reason,
 description: description,
 status: 'open',
 priority: 'medium',
 createdAt: new Date().toISOString(),
 resolutionDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
 assignedTo: 'admin_001',
 evidence: [],
 };

 console.log('Dispute raised:', dispute);
 return {
 success: true,
 dispute: dispute,
 };

 } catch (error) {
 console.error('Error raising escrow dispute:', error);
 return {
 success: false,
 error: error.message || 'Failed to raise dispute',
 code: 'DISPUTE_CREATION_ERROR',
 };
 }
 }

 // ==================== TRANSACTION HISTORY ====================

 /**
 * Get transaction history for user
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Transaction history
 */
 static async getTransactionHistory(userId, filters = {}) {
 try {
 console.log('Fetching transaction history:', { userId, filters });

 // Mock transaction history for development
 const mockTransactions = [
 {
 id: 'txn_001',
 type: 'escrow_created',
 amount: 150.00,
 currency: 'USD',
 status: 'held',
 serviceId: 'service_123',
 description: 'AC Repair Service',
 createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
 },
 {
 id: 'txn_002',
 type: 'wallet_credit',
 amount: 500.00,
 currency: 'KES',
 status: 'completed',
 paymentMethod: 'mpesa',
 description: 'Wallet funding',
 createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
 },
 {
 id: 'txn_003',
 type: 'escrow_released',
 amount: 200.00,
 currency: 'USD',
 status: 'completed',
 serviceId: 'service_122',
 description: 'Plumbing Service - Payment released',
 createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
 },
 {
 id: 'txn_004',
 type: 'wallet_debit',
 amount: 50.00,
 currency: 'USD',
 status: 'completed',
 description: 'Service fee',
 createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
 },
 ];

 // Apply filters
 let filteredTransactions = mockTransactions;
 
 if (filters.type) {
 filteredTransactions = filteredTransactions.filter(txn => txn.type === filters.type);
 }
 
 if (filters.status) {
 filteredTransactions = filteredTransactions.filter(txn => txn.status === filters.status);
 }
 
 if (filters.dateFrom) {
 filteredTransactions = filteredTransactions.filter(txn => 
 new Date(txn.createdAt) >= new Date(filters.dateFrom)
 );
 }

 console.log('Transaction history fetched:', filteredTransactions);
 return {
 success: true,
 transactions: filteredTransactions,
 totalCount: filteredTransactions.length,
 summary: {
 totalCredit: filteredTransactions
 .filter(txn => txn.type.includes('credit') || txn.type.includes('released'))
 .reduce((sum, txn) => sum + txn.amount, 0),
 totalDebit: filteredTransactions
 .filter(txn => txn.type.includes('debit') || txn.type.includes('created'))
 .reduce((sum, txn) => sum + txn.amount, 0),
 },
 };

 } catch (error) {
 console.error('Error fetching transaction history:', error);
 return {
 success: false,
 error: error.message || 'Failed to fetch transaction history',
 code: 'TRANSACTION_HISTORY_ERROR',
 };
 }
 }

 // ==================== UTILITY METHODS ====================

 /**
 * Calculate escrow fees
 * @param {number} amount - Transaction amount
 * @param {string} currency - Currency code
 * @returns {Object} Fee calculation
 */
 static calculateEscrowFees(amount, currency = 'USD') {
 const feeRates = {
 USD: 0.029, // 2.9%
 KES: 0.035, // 3.5%
 EUR: 0.029, // 2.9%
 GBP: 0.029, // 2.9%
 };

 const minFees = {
 USD: 0.30,
 KES: 10,
 EUR: 0.30,
 GBP: 0.25,
 };

 const feeRate = feeRates[currency] || feeRates.USD;
 const minFee = minFees[currency] || minFees.USD;
 
 const calculatedFee = Math.max(amount * feeRate, minFee);
 const totalAmount = amount + calculatedFee;

 return {
 originalAmount: amount,
 escrowFee: calculatedFee,
 totalAmount: totalAmount,
 currency: currency,
 feeRate: feeRate * 100, // Convert to percentage
 };
 }

 /**
 * Get escrow transaction status details
 * @param {string} status - Escrow status
 * @returns {Object} Status details
 */
 static getEscrowStatusDetails(status) {
 const statusMap = {
 'held': {
 color: '#ffc107',
 icon: 'time',
 description: 'Funds are securely held in escrow',
 action: 'Waiting for service completion',
 },
 'released': {
 color: '#28a745',
 icon: 'checkmark-circle',
 description: 'Funds released to technician',
 action: 'Payment completed successfully',
 },
 'refunded': {
 color: '#17a2b8',
 icon: 'arrow-back-circle',
 description: 'Funds refunded to client',
 action: 'Refund processed successfully',
 },
 'disputed': {
 color: '#dc3545',
 icon: 'warning',
 description: 'Transaction under dispute',
 action: 'Awaiting resolution',
 },
 'cancelled': {
 color: '#6c757d',
 icon: 'close-circle',
 description: 'Transaction cancelled',
 action: 'No action required',
 },
 };

 return statusMap[status] || statusMap['held'];
 }
}

export default EscrowService;
