/**
 * Rating Model
 * 
 * Handles customer ratings and reviews for completed bookings
 * Supports rating submission, moderation, and technician responses
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  // CORE REFERENCES
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'BookingRedesigned',  // Changed from 'Booking' to match actual model name
    required: [true, 'Booking reference is required'],
    unique: true, // Each booking can only be rated once
    index: true
  },
  
  technician: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Technician reference is required'],
    index: true
  },
  
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer reference is required'],
    index: true
  },
  
  // RATING SCORES (1-5 stars)
  ratings: {
    service: {
      type: Number,
      required: [true, 'Service rating is required'],
      min: [1, 'Service rating must be between 1 and 5'],
      max: [5, 'Service rating must be between 1 and 5']
    },
    technician: {
      type: Number,
      required: [true, 'Technician rating is required'],
      min: [1, 'Technician rating must be between 1 and 5'],
      max: [5, 'Technician rating must be between 1 and 5']
    },
    overall: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Overall rating must be between 1 and 5'],
      max: [5, 'Overall rating must be between 1 and 5']
    }
  },
  
  // FEEDBACK CONTENT
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  
  // QUICK FEEDBACK TAGS
  quickFeedback: [{
    type: String,
    trim: true,
    enum: [
      'Professional service',
      'On time arrival',
      'Quality work',
      'Fair pricing',
      'Clean work area',
      'Friendly technician',
      'Quick resolution',
      'Would recommend',
      'Excellent communication',
      'Problem solved',
      'Good value',
      'Courteous behavior'
    ]
  }],
  
  // PHOTO/VIDEO EVIDENCE
  media: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // MODERATION
  flagged: {
    isFlagged: {
      type: Boolean,
      default: false,
      index: true
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'offensive', 'misleading', 'fake', 'other'],
      required: function() {
        return this.flagged.isFlagged;
      }
    },
    flaggedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: Date,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'removed'],
      default: 'pending'
    },
    moderationNotes: String
  },
  
  // TECHNICIAN RESPONSE
  technicianResponse: {
    content: {
      type: String,
      trim: true,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    respondedAt: Date
  },
  
  // HELPFULNESS TRACKING
  helpful: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // VISIBILITY
  isVisible: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // VERIFICATION
  isVerified: {
    type: Boolean,
    default: false // Set to true if booking is verified as completed
  },
  
  // METADATA
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  editedAt: Date,
  deletedAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// INDEXES FOR PERFORMANCE
ratingSchema.index({ technician: 1, submittedAt: -1 }); // Get technician ratings sorted by date
ratingSchema.index({ customer: 1, submittedAt: -1 }); // Get customer rating history
ratingSchema.index({ 'ratings.overall': -1 }); // Sort by overall rating
ratingSchema.index({ isVisible: 1, 'flagged.isFlagged': 1 }); // Moderation queries
ratingSchema.index({ submittedAt: -1 }); // Recent ratings

// VIRTUAL FOR AVERAGE RATING
ratingSchema.virtual('averageRating').get(function() {
  const { service, technician, overall } = this.ratings;
  return ((service + technician + overall) / 3).toFixed(2);
});

// VIRTUAL FOR RATING LABEL
ratingSchema.virtual('ratingLabel').get(function() {
  const overall = this.ratings.overall;
  if (overall === 5) return 'Excellent';
  if (overall === 4) return 'Very Good';
  if (overall === 3) return 'Good';
  if (overall === 2) return 'Fair';
  return 'Poor';
});

// MIDDLEWARE: Validate booking is completed before rating
ratingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Dynamically require Booking model to avoid circular dependency
      const Booking = mongoose.model('BookingRedesigned');
      const booking = await Booking.findById(this.booking);
      
      if (!booking) {
        return next(new Error('Booking not found'));
      }
      
      if (booking.status !== 'completed') {
        return next(new Error('Can only rate completed bookings'));
      }
      
      // Verify customer and technician match
      if (booking.clientPhone !== this.customer.toString() && booking.userId?.toString() !== this.customer.toString()) {
        return next(new Error('Customer does not match booking'));
      }
      
      // Set verified flag
      this.isVerified = true;
      
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// MIDDLEWARE: Update technician average rating after save
ratingSchema.post('save', async function(doc) {
  try {
    await updateTechnicianRating(doc.technician);
  } catch (error) {
    console.error('Error updating technician rating:', error);
  }
});

// MIDDLEWARE: Update technician average rating after update
ratingSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    try {
      await updateTechnicianRating(doc.technician);
    } catch (error) {
      console.error('Error updating technician rating:', error);
    }
  }
});

// MIDDLEWARE: Update technician average rating after delete
ratingSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      await updateTechnicianRating(doc.technician);
    } catch (error) {
      console.error('Error updating technician rating:', error);
    }
  }
});

// STATIC METHOD: Get technician statistics
ratingSchema.statics.getTechnicianStats = async function(technicianId) {
  const stats = await this.aggregate([
    {
      $match: {
        technician: new mongoose.Types.ObjectId(technicianId),
        isVisible: true,
        'flagged.isFlagged': false
      }
    },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageService: { $avg: '$ratings.service' },
        averageTechnician: { $avg: '$ratings.technician' },
        averageOverall: { $avg: '$ratings.overall' },
        rating5: { $sum: { $cond: [{ $eq: ['$ratings.overall', 5] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$ratings.overall', 4] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$ratings.overall', 3] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$ratings.overall', 2] }, 1, 0] } },
        rating1: { $sum: { $cond: [{ $eq: ['$ratings.overall', 1] }, 1, 0] } }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalRatings: 0,
      averageService: 0,
      averageTechnician: 0,
      averageOverall: 0,
      distribution: {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      }
    };
  }
  
  const result = stats[0];
  return {
    totalRatings: result.totalRatings,
    averageService: parseFloat(result.averageService.toFixed(2)),
    averageTechnician: parseFloat(result.averageTechnician.toFixed(2)),
    averageOverall: parseFloat(result.averageOverall.toFixed(2)),
    distribution: {
      5: result.rating5,
      4: result.rating4,
      3: result.rating3,
      2: result.rating2,
      1: result.rating1
    }
  };
};

// STATIC METHOD: Get recent ratings for technician
ratingSchema.statics.getTechnicianRecentRatings = async function(technicianId, limit = 10) {
  return this.find({
    technician: technicianId,
    isVisible: true,
    'flagged.isFlagged': false
  })
  .populate('customer', 'firstName lastName')
  .populate('booking', 'bookingId serviceType completedAt')
  .sort({ submittedAt: -1 })
  .limit(limit)
  .lean();
};

// INSTANCE METHOD: Mark as helpful
ratingSchema.methods.markHelpful = async function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
    await this.save();
  }
  return this;
};

// INSTANCE METHOD: Flag rating
ratingSchema.methods.flagRating = async function(userId, reason) {
  this.flagged.isFlagged = true;
  this.flagged.reason = reason;
  this.flagged.flaggedBy = userId;
  this.flagged.flaggedAt = new Date();
  this.flagged.moderationStatus = 'pending';
  await this.save();
  return this;
};

// INSTANCE METHOD: Add technician response
ratingSchema.methods.addTechnicianResponse = async function(response) {
  this.technicianResponse.content = response;
  this.technicianResponse.respondedAt = new Date();
  await this.save();
  return this;
};

// HELPER FUNCTION: Update technician average rating
async function updateTechnicianRating(technicianId) {
  const Rating = mongoose.model('Rating');
  const User = mongoose.model('User');
  
  const stats = await Rating.getTechnicianStats(technicianId);
  
  await User.findByIdAndUpdate(technicianId, {
    'rating.average': stats.averageOverall,
    'rating.count': stats.totalRatings
  });
}

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
