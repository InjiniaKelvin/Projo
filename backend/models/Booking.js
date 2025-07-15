/**
 * Booking Model for QuickFix App
 * 
 * This model manages service bookings between clients and technicians,
 * including status tracking, payment integration, and location data.
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const bookingSchema = new mongoose.Schema({
  // Booking Identification
  bookingId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'BKG' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  },
  
  // Parties Involved
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null until assigned
  },
  
  // Service Details
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'plumbing',
      'electrical',
      'carpentry',
      'painting',
      'cleaning',
      'appliance_repair',
      'air_conditioning',
      'roofing',
      'gardening',
      'pest_control',
      'security_systems',
      'solar_installation',
      'general_maintenance',
      'other'
    ]
  },
  
  serviceDescription: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [1000, 'Service description cannot exceed 1000 characters']
  },
  
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium',
    required: true
  },
  
  // Pricing
  pricing: {
    quotedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Quoted amount cannot be negative']
    },
    finalAmount: {
      type: Number,
      default: 0,
      min: [0, 'Final amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'KES'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'refunded'],
      default: 'pending'
    }
  },
  
  // Location Information
  location: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      county: { type: String, required: true },
      postalCode: String,
      country: { type: String, default: 'Kenya' }
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    landmarks: String,
    accessInstructions: String
  },
  
  // Scheduling
  scheduling: {
    preferredDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: 'Preferred date must be in the future'
      }
    },
    preferredTimeSlot: {
      start: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
      },
      end: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
      }
    },
    confirmedDateTime: {
      type: Date,
      default: null
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 60
    }
  },
  
  // Booking Status
  status: {
    type: String,
    enum: [
      'pending',       // Waiting for technician assignment
      'assigned',      // Technician assigned
      'confirmed',     // Both parties confirmed
      'in_progress',   // Work in progress
      'completed',     // Work completed
      'cancelled',     // Cancelled by client/technician
      'disputed',      // Under dispute
      'refunded'       // Payment refunded
    ],
    default: 'pending',
    required: true
  },
  
  // Images and Documents
  images: [{
    url: String,
    description: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Communication
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Rating and Review
  rating: {
    clientRating: {
      stars: { type: Number, min: 1, max: 5 },
      review: String,
      submittedAt: Date
    },
    technicianRating: {
      stars: { type: Number, min: 1, max: 5 },
      review: String,
      submittedAt: Date
    }
  },
  
  // Payment Integration
  escrowTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  
  paymentTransactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  
  // Timeline Tracking
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Cancellation Details
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reason: String,
    cancelledAt: Date,
    refundAmount: {
      type: Number,
      default: 0
    }
  },
  
  // Additional Metadata
  metadata: {
    platform: { type: String, default: 'mobile' },
    deviceInfo: String,
    appVersion: String,
    source: { type: String, default: 'app' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ clientId: 1, createdAt: -1 });
bookingSchema.index({ technicianId: 1, createdAt: -1 });
// Note: bookingId already has unique index
bookingSchema.index({ status: 1 });
bookingSchema.index({ serviceType: 1 });
bookingSchema.index({ 'location.coordinates': '2dsphere' });
bookingSchema.index({ 'scheduling.preferredDate': 1 });
bookingSchema.index({ urgency: 1 });

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  if (this.createdAt && this.updatedAt) {
    return this.updatedAt - this.createdAt;
  }
  return null;
});

// Virtual for formatted address
bookingSchema.virtual('formattedAddress').get(function() {
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.county}`;
});

// Pre-save middleware to update timeline
bookingSchema.pre('save', function(next) {
  // Add to timeline if status changed
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.technicianId || this.clientId
    });
  }
  next();
});

// Instance methods
bookingSchema.methods.assignTechnician = async function(technicianId) {
  this.technicianId = technicianId;
  this.status = 'assigned';
  await this.save();
  
  return this;
};

bookingSchema.methods.confirmBooking = async function() {
  if (this.status !== 'assigned') {
    throw new Error('Booking must be assigned before confirmation');
  }
  
  this.status = 'confirmed';
  await this.save();
  
  return this;
};

bookingSchema.methods.startWork = async function() {
  if (this.status !== 'confirmed') {
    throw new Error('Booking must be confirmed before starting work');
  }
  
  this.status = 'in_progress';
  await this.save();
  
  return this;
};

bookingSchema.methods.completeWork = async function(finalAmount = null) {
  if (this.status !== 'in_progress') {
    throw new Error('Work must be in progress before completion');
  }
  
  this.status = 'completed';
  if (finalAmount) {
    this.pricing.finalAmount = finalAmount;
  }
  await this.save();
  
  return this;
};

bookingSchema.methods.cancelBooking = async function(userId, reason) {
  if (['completed', 'cancelled', 'refunded'].includes(this.status)) {
    throw new Error('Cannot cancel booking in current status');
  }
  
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy: userId,
    reason: reason,
    cancelledAt: new Date()
  };
  await this.save();
  
  return this;
};

bookingSchema.methods.addMessage = async function(senderId, message) {
  this.messages.push({
    senderId,
    message,
    timestamp: new Date()
  });
  await this.save();
  
  return this;
};

bookingSchema.methods.addRating = async function(userId, rating, review = '') {
  if (this.status !== 'completed') {
    throw new Error('Booking must be completed before rating');
  }
  
  const isClient = this.clientId.toString() === userId.toString();
  const isTrainician = this.technicianId && this.technicianId.toString() === userId.toString();
  
  if (isClient) {
    this.rating.clientRating = {
      stars: rating,
      review: review,
      submittedAt: new Date()
    };
  } else if (isTrainician) {
    this.rating.technicianRating = {
      stars: rating,
      review: review,
      submittedAt: new Date()
    };
  } else {
    throw new Error('User not authorized to rate this booking');
  }
  
  await this.save();
  return this;
};

// Static methods
bookingSchema.statics.findByBookingId = function(bookingId) {
  return this.findOne({ bookingId })
    .populate('clientId', 'firstName lastName email phoneNumber')
    .populate('technicianId', 'firstName lastName email phoneNumber skills rating')
    .populate('escrowTransactionId')
    .populate('paymentTransactions');
};

bookingSchema.statics.findPendingBookings = function(location = null, serviceType = null) {
  const query = { status: 'pending' };
  
  if (serviceType) {
    query.serviceType = serviceType;
  }
  
  let mongoQuery = this.find(query)
    .populate('clientId', 'firstName lastName')
    .sort({ urgency: -1, createdAt: -1 });
  
  // Add location-based filtering if provided
  if (location && location.coordinates) {
    mongoQuery = mongoQuery.where('location.coordinates').near({
      center: location.coordinates,
      maxDistance: location.maxDistance || 10000 // 10km default
    });
  }
  
  return mongoQuery;
};

bookingSchema.statics.findByUserId = function(userId, role = 'client') {
  const field = role === 'client' ? 'clientId' : 'technicianId';
  return this.find({ [field]: userId })
    .populate('clientId', 'firstName lastName')
    .populate('technicianId', 'firstName lastName skills')
    .sort({ createdAt: -1 });
};

bookingSchema.statics.getBookingStats = function(userId, role = 'client') {
  const matchField = role === 'client' ? 'clientId' : 'technicianId';
  
  return this.aggregate([
    { $match: { [matchField]: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$pricing.finalAmount' }
      }
    }
  ]);
};

// Add pagination plugin
bookingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Booking', bookingSchema);
