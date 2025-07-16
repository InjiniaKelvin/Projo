/**
 * Wallet Model for QuickFix App
 * 
 * This model manages user wallets, balances, transactions, and escrow functionality.
 * Supports multiple payment methods and transaction types.
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const walletSchema = new mongoose.Schema({
  // Wallet Owner
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Wallet Balance
  balance: {
    available: {
      type: Number,
      default: 0,
      min: [0, 'Available balance cannot be negative']
    },
    escrow: {
      type: Number,
      default: 0,
      min: [0, 'Escrow balance cannot be negative']
    },
    pending: {
      type: Number,
      default: 0,
      min: [0, 'Pending balance cannot be negative']
    }
  },
  
  // Currency
  currency: {
    type: String,
    default: 'KES',
    enum: ['KES', 'USD', 'EUR', 'GBP']
  },
  
  // Wallet Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFrozen: {
    type: Boolean,
    default: false
  },
  
  freezeReason: {
    type: String,
    default: null
  },
  
  // Payment Methods
  paymentMethods: [{
    type: {
      type: String,
      enum: ['mpesa', 'bank', 'card', 'paypal'],
      required: true
    },
    details: {
      // For M-Pesa
      phoneNumber: String,
      
      // For Bank
      accountNumber: String,
      bankName: String,
      bankCode: String,
      
      // For Card (Stripe)
      cardLast4: String,
      cardBrand: String,
      stripePaymentMethodId: String,
      
      // For PayPal
      paypalEmail: String,
      paypalId: String
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Transaction History Reference
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  
  // Limits and Settings
  limits: {
    dailyWithdraw: {
      type: Number,
      default: 50000 // KES
    },
    monthlyWithdraw: {
      type: Number,
      default: 200000 // KES
    },
    dailyDeposit: {
      type: Number,
      default: 100000 // KES
    },
    monthlyDeposit: {
      type: Number,
      default: 500000 // KES
    }
  },
  
  // Verification Status
  isKYCVerified: {
    type: Boolean,
    default: false
  },
  
  verificationLevel: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    default: 'basic'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total balance
walletSchema.virtual('totalBalance').get(function() {
  return this.balance.available + this.balance.escrow + this.balance.pending;
});

// Indexes
// Note: userId already has unique index
walletSchema.index({ isActive: 1 });
walletSchema.index({ 'paymentMethods.type': 1 });

// Instance methods
walletSchema.methods.addFunds = async function(amount, source = 'deposit') {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  this.balance.available += amount;
  await this.save();
  
  return this;
};

walletSchema.methods.withdrawFunds = async function(amount) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  if (this.balance.available < amount) {
    throw new Error('Insufficient funds');
  }
  
  this.balance.available -= amount;
  await this.save();
  
  return this;
};

walletSchema.methods.moveToEscrow = async function(amount) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  if (this.balance.available < amount) {
    throw new Error('Insufficient available funds');
  }
  
  this.balance.available -= amount;
  this.balance.escrow += amount;
  await this.save();
  
  return this;
};

walletSchema.methods.releaseFromEscrow = async function(amount, toAvailable = true) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  if (this.balance.escrow < amount) {
    throw new Error('Insufficient escrow funds');
  }
  
  this.balance.escrow -= amount;
  
  if (toAvailable) {
    this.balance.available += amount;
  }
  
  await this.save();
  return this;
};

walletSchema.methods.addPaymentMethod = async function(paymentMethodData) {
  // Remove default from other methods if this one is default
  if (paymentMethodData.isDefault) {
    this.paymentMethods.forEach(pm => {
      pm.isDefault = false;
    });
  }
  
  this.paymentMethods.push(paymentMethodData);
  await this.save();
  
  return this;
};

walletSchema.methods.removePaymentMethod = async function(paymentMethodId) {
  this.paymentMethods = this.paymentMethods.filter(
    pm => pm._id.toString() !== paymentMethodId
  );
  await this.save();
  
  return this;
};

walletSchema.methods.getDefaultPaymentMethod = function() {
  return this.paymentMethods.find(pm => pm.isDefault) || this.paymentMethods[0];
};

// Static methods
walletSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId', 'firstName lastName email');
};

walletSchema.statics.createWallet = async function(userId) {
  const existingWallet = await this.findOne({ userId });
  if (existingWallet) {
    throw new Error('Wallet already exists for this user');
  }
  
  const wallet = new this({ userId });
  await wallet.save();
  
  return wallet;
};

// Add pagination plugin
walletSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Wallet', walletSchema);
