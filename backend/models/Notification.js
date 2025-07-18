/**
 * Notification Model
 * 
 * This model stores in-app notifications for users
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'emergency', 'system', 'promotion', 'reminder', 'info'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  data: {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    // Additional context data
    status: String,
    amount: Number,
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // For scheduled notifications
  scheduledFor: {
    type: Date
  },
  sent: {
    type: Boolean,
    default: true
  },
  // For grouping notifications
  groupKey: {
    type: String,
    index: true
  },
  // Expiry for temporary notifications
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, sent: 1 });

// Mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Mark notification as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = undefined;
  return this.save();
};

// Check if notification is expired
notificationSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    userId, 
    isRead: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { 
      userId, 
      isRead: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to get notifications with pagination
notificationSchema.statics.getNotificationsForUser = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    priority,
    unreadOnly = false
  } = options;

  const query = { 
    userId,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  };

  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (unreadOnly) query.isRead = false;

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('data.bookingId', 'serviceType status estimatedPrice')
    .populate('data.transactionId', 'amount type status')
    .populate('data.relatedUserId', 'firstName lastName profilePicture')
    .exec();
};

// Static method to create bulk notifications
notificationSchema.statics.createBulkNotifications = function(notifications) {
  return this.insertMany(notifications);
};

// Static method to schedule notification
notificationSchema.statics.scheduleNotification = function(userId, title, message, scheduledFor, data = {}) {
  return this.create({
    userId,
    title,
    message,
    scheduledFor,
    sent: false,
    data,
    type: data.type || 'reminder'
  });
};

// Static method to get and send scheduled notifications
notificationSchema.statics.processPendingNotifications = function() {
  return this.find({
    scheduledFor: { $lte: new Date() },
    sent: false
  });
};

// Pre-save middleware to set expiry for certain types
notificationSchema.pre('save', function(next) {
  // Auto-expire promotional notifications after 30 days
  if (this.type === 'promotion' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Auto-expire system notifications after 7 days
  if (this.type === 'system' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Virtual for human-readable time
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Transform output for API responses
notificationSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
  virtuals: true
});

module.exports = mongoose.model('Notification', notificationSchema);
