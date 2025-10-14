/**
 * Payment Controller
 * 
 * This controller handles payment processing, wallet management,
 * and transaction recording with MongoDB integration.
 * Payment processing is handled through M-Pesa integration.
 */

const { Wallet, Transaction, User } = require('../models');

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
      
      // Process payment based on method
      let paymentResult;
      
      switch (paymentMethod) {
        case 'mpesa':
          paymentResult = await this.processMpesaPayment(amount, paymentDetails, transaction);
          break;
        case 'bank':
          paymentResult = await this.processBankTransfer(amount, paymentDetails, transaction);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid payment method. Only M-Pesa and bank transfer supported.'
          });
      }
      
      if (paymentResult.success) {
        // Update wallet balance
        await wallet.addFunds(transaction.amount.net);
        
        // Update transaction status and balance after
        transaction.status = 'completed';
        transaction.completedAt = new Date();
        transaction.balanceAfter = {
          available: wallet.balance.available,
          escrow: wallet.balance.escrow,
          pending: wallet.balance.pending
        };
        transaction.externalTransactionId = paymentResult.externalTransactionId;
        transaction.gatewayResponse = paymentResult.gatewayResponse;
        
        await transaction.save();
        
        // Add transaction to wallet
        wallet.transactions.push(transaction._id);
        await wallet.save();
        
        res.json({
          success: true,
          message: 'Funds added successfully',
          data: {
            transaction: transaction.toJSON(),
            wallet: wallet.toJSON()
          }
        });
      } else {
        // Mark transaction as failed
        await transaction.markAsFailed(paymentResult.error, paymentResult.errorCode);
        
        res.status(400).json({
          success: false,
          message: 'Payment failed',
          error: paymentResult.error,
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
      
      // Process withdrawal
      await transaction.markAsProcessing();
      
      // Deduct from wallet balance
      await wallet.withdrawFunds(amount);
      
      // Update transaction
      transaction.status = 'completed';
      transaction.completedAt = new Date();
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
        message: 'Withdrawal initiated successfully',
        data: {
          transaction: transaction.toJSON(),
          wallet: wallet.toJSON()
        }
      });
      
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
   * Process M-Pesa payment (mock implementation)
   * @param {number} amount - Payment amount
   * @param {Object} details - Payment details
   * @param {Object} transaction - Transaction object
   * @returns {Object} Payment result
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

module.exports = new PaymentController();
