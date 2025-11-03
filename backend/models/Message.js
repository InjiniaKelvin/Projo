/**
 * Message Model for Chat System
 * 
 * This model handles all chat messages between clients, technicians, and admins
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const messageSchema = new mongoose.Schema({
 bookingId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'Booking',
 required: [true, 'Booking ID is required']
 },

 senderId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 required: [true, 'Sender ID is required']
 },

 message: {
 type: String,
 required: [true, 'Message content is required'],
 maxlength: [1000, 'Message cannot exceed 1000 characters']
 },

 messageType: {
 type: String,
 enum: ['text', 'image', 'audio', 'video', 'file', 'location', 'system'],
 default: 'text'
 },

 attachments: [{
 type: {
 type: String,
 enum: ['image', 'audio', 'video', 'file']
 },
 url: String,
 filename: String,
 size: Number,
 mimeType: String
 }],

 // For location messages
 location: {
 latitude: Number,
 longitude: Number,
 address: String
 },

 // Message status
 status: {
 type: String,
 enum: ['sent', 'delivered', 'read'],
 default: 'sent'
 },

 // Read receipts
 readBy: [{
 userId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User'
 },
 readAt: {
 type: Date,
 default: Date.now
 }
 }],

 // For system messages
 systemMessageType: {
 type: String,
 enum: ['booking_created', 'status_updated', 'payment_processed', 'technician_assigned', 'service_completed'],
 required: function() {
 return this.messageType === 'system';
 }
 },

 // Admin flags
 isFlagged: {
 type: Boolean,
 default: false
 },

 flagReason: String,

 flaggedBy: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User'
 },

 flaggedAt: Date,

 // Message metadata
 metadata: {
 type: mongoose.Schema.Types.Mixed,
 default: {}
 },

 // Timestamps
 timestamp: {
 type: Date,
 default: Date.now
 },

 editedAt: Date,

 deletedAt: Date,

 isDeleted: {
 type: Boolean,
 default: false
 }
}, {
 timestamps: true,
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

// Indexes for better performance
messageSchema.index({ bookingId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1, timestamp: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ isFlagged: 1 });

// Virtual for formatted timestamp
messageSchema.virtual('formattedTimestamp').get(function() {
 return this.timestamp.toLocaleString();
});

// Virtual for time ago
messageSchema.virtual('timeAgo').get(function() {
 const now = new Date();
 const diff = now - this.timestamp;
 const minutes = Math.floor(diff / 60000);
 const hours = Math.floor(minutes / 60);
 const days = Math.floor(hours / 24);

 if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
 if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
 if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
 return 'Just now';
});

// Static methods
messageSchema.statics.getConversation = async function(bookingId, options = {}) {
 const {
 page = 1,
 limit = 50,
 before = null,
 after = null
 } = options;

 const query = { 
 bookingId,
 isDeleted: false
 };

 if (before) {
 query.timestamp = { $lt: new Date(before) };
 }

 if (after) {
 query.timestamp = { $gt: new Date(after) };
 }

 const paginateOptions = {
 page,
 limit,
 sort: { timestamp: -1 },
 populate: {
 path: 'senderId',
 select: 'firstName lastName role profilePicture'
 }
 };

 return await this.paginate(query, paginateOptions);
};

messageSchema.statics.markAsRead = async function(bookingId, userId) {
 return await this.updateMany(
 {
 bookingId,
 senderId: { $ne: userId },
 'readBy.userId': { $ne: userId }
 },
 {
 $push: {
 readBy: {
 userId,
 readAt: new Date()
 }
 },
 $set: { status: 'read' }
 }
 );
};

messageSchema.statics.getUnreadCount = async function(bookingId, userId) {
 return await this.countDocuments({
 bookingId,
 senderId: { $ne: userId },
 'readBy.userId': { $ne: userId },
 isDeleted: false
 });
};

messageSchema.statics.createSystemMessage = async function(bookingId, messageType, data = {}) {
 const systemMessages = {
 'booking_created': 'A new service request has been created.',
 'status_updated': `Service status updated to ${data.status}.`,
 'payment_processed': `Payment of $${data.amount} has been processed.`,
 'technician_assigned': `Technician ${data.technicianName} has been assigned to your service.`,
 'service_completed': 'Service has been completed successfully.'
 };

 const message = new this({
 bookingId,
 senderId: null, // System message
 message: systemMessages[messageType] || 'System notification',
 messageType: 'system',
 systemMessageType: messageType,
 metadata: data
 });

 return await message.save();
};

// Instance methods
messageSchema.methods.markAsRead = async function(userId) {
 if (!this.readBy.find(r => r.userId.toString() === userId.toString())) {
 this.readBy.push({
 userId,
 readAt: new Date()
 });
 this.status = 'read';
 return await this.save();
 }
 return this;
};

messageSchema.methods.flag = async function(reason, flaggedBy) {
 this.isFlagged = true;
 this.flagReason = reason;
 this.flaggedBy = flaggedBy;
 this.flaggedAt = new Date();
 return await this.save();
};

messageSchema.methods.softDelete = async function() {
 this.isDeleted = true;
 this.deletedAt = new Date();
 return await this.save();
};

// Add pagination plugin
messageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Message', messageSchema);
