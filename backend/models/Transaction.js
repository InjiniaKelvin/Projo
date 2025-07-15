/**
 * Transaction Model for QuickFix App
 * 
 * This model tracks all financial transactions including payments, 
 * withdrawals, deposits, escrow movements, and service payments.
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const transactionSchema = new mongoose.Schema({
  // Transaction Identification
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  
  // Related Entities
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null // null for non-service transactions
  },
  
  // Transaction Details
  type: {
    type: String,
    enum: [
      'deposit',           // Adding money to wallet
      'withdrawal',        // Removing money from wallet
      'payment',          // Paying for a service
      'refund',           // Refund for cancelled service
      'escrow_hold',      // Moving money to escrow
      'escrow_release',   // Releasing money from escrow
      'commission',       // Platform commission deduction
      'bonus',            // Platform bonus/reward
      'transfer_in',      // Money transfer received
      'transfer_out'      // Money transfer sent
    ],
    required: true
  },
  
  // Amount Details
  amount: {
    gross: {
      type: Number,
      required: true,
      min: [0, 'Gross amount cannot be negative']
    },
    fees: {
      type: Number,
      default: 0,
      min: [0, 'Fees cannot be negative']
    },
    net: {
      type: Number,
      required: true
    }
  },
  
  currency: {
    type: String,
    default: 'KES',
    enum: ['KES', 'USD', 'EUR', 'GBP']
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    required: true
  },
  
  // Payment Method Information
  paymentMethod: {
    type: {
      type: String,
      enum: ['mpesa', 'bank', 'card', 'paypal', 'wallet'],
      required: true
    },
    details: {
      // M-Pesa
      phoneNumber: String,
      mpesaTransactionId: String,
      
      // Bank Transfer
      accountNumber: String,
      bankName: String,
      referenceNumber: String,
      
      // Card/Stripe
      cardLast4: String,
      cardBrand: String,
      stripePaymentIntentId: String,
      stripeChargeId: String,
      
      // PayPal
      paypalTransactionId: String,
      paypalPayerId: String,
      
      // Wallet
      fromWalletId: String,
      toWalletId: String
    }
  },
  
  // External Payment Gateway Information
  externalTransactionId: {
    type: String,
    default: null
  },
  
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Description and Metadata
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Balance Information (before and after transaction)
  balanceBefore: {
    available: { type: Number, default: 0 },
    escrow: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  },
  
  balanceAfter: {
    available: { type: Number, default: 0 },
    escrow: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  },
  
  // Timing Information
  processedAt: {
    type: Date,
    default: null
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  failedAt: {
    type: Date,
    default: null
  },
  
  // Error Information
  errorMessage: {
    type: String,
    default: null
  },
  
  errorCode: {
    type: String,
    default: null
  },
  
  // Retry Information
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  maxRetries: {
    type: Number,
    default: 3,
    min: 0
  },
  
  // Notification Status
  notificationSent: {
    type: Boolean,
    default: false
  },
  
  // Audit Trail
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  ipAddress: {
    type: String,
    default: null
  },
  
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ walletId: 1, createdAt: -1 });
// Note: transactionId already has unique index
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ 'paymentMethod.type': 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ externalTransactionId: 1 });

// Virtual for transaction fee
transactionSchema.virtual('feePercentage').get(function() {
  if (this.amount.gross === 0) return 0;
  return (this.amount.fees / this.amount.gross) * 100;
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.net.toFixed(2)}`;
});

// Pre-save middleware to calculate net amount
transactionSchema.pre('save', function(next) {
  if (this.isModified('amount.gross') || this.isModified('amount.fees')) {
    this.amount.net = this.amount.gross - this.amount.fees;
  }
  next();
});

// Instance methods
transactionSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  return this.save();
};

transactionSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

transactionSchema.methods.markAsFailed = function(errorMessage, errorCode = null) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  return this.save();
};

transactionSchema.methods.incrementRetry = function() {
  this.retryCount += 1;
  return this.save();
};

transactionSchema.methods.canRetry = function() {
  return this.retryCount < this.maxRetries && this.status === 'failed';
};

// Static methods
transactionSchema.statics.findByUserId = function(userId, options = {}) {
  const query = this.find({ userId })
    .populate('userId', 'firstName lastName email')
    .populate('bookingId', 'serviceType status')
    .sort({ createdAt: -1 });
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.type) {
    query.where('type').equals(options.type);
  }
  
  return query;
};

transactionSchema.statics.findByTransactionId = function(transactionId) {
  return this.findOne({ transactionId })
    .populate('userId', 'firstName lastName email')
    .populate('walletId')
    .populate('bookingId');
};

transactionSchema.statics.getTransactionsByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ createdAt: -1 });
};

transactionSchema.statics.getTotalsByUser = function(userId, timeframe = 'month') {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'day':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(0); // All time
  }
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount.net' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Add pagination plugin
transactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Transaction', transactionSchema);
