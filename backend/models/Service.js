/**
 * Service Model
 * Defines available services in the QuickFix platform
 */

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'plumbing',
      'electrical',
      'carpentry',
      'painting',
      'appliance-repair',
      'hvac',
      'roofing',
      'landscaping',
      'cleaning',
      'security',
      'automotive',
      'electronics',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceRange: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    }
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true,
    min: 15
  },
  skillLevel: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmergencyService: {
    type: Boolean,
    default: false
  },
  requirements: [{
    type: String,
    trim: true
  }],
  tools: [{
    name: String,
    required: Boolean
  }],
  materials: [{
    name: String,
    estimatedCost: Number,
    required: Boolean
  }],
  icon: {
    type: String,
    default: 'construct-outline'
  },
  images: [{
    url: String,
    description: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  popularity: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  metadata: {
    searchKeywords: [String],
    seoTitle: String,
    seoDescription: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ popularity: -1 });
serviceSchema.index({ averageRating: -1 });

// Virtual for price display
serviceSchema.virtual('priceDisplay').get(function() {
  if (this.priceRange.min === this.priceRange.max) {
    return `KSh ${this.priceRange.min.toLocaleString()}`;
  }
  return `KSh ${this.priceRange.min.toLocaleString()} - ${this.priceRange.max.toLocaleString()}`;
});

// Virtual for duration display
serviceSchema.virtual('durationDisplay').get(function() {
  const hours = Math.floor(this.estimatedDuration / 60);
  const minutes = this.estimatedDuration % 60;
  
  if (hours === 0) {
    return `${minutes} mins`;
  } else if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours}h ${minutes}m`;
  }
});

// Static method to get popular services
serviceSchema.statics.getPopularServices = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ popularity: -1, averageRating: -1 })
    .limit(limit);
};

// Static method to search services
serviceSchema.statics.searchServices = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    ...filters
  };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  return this.find(searchQuery)
    .sort(query ? { score: { $meta: 'textScore' } } : { popularity: -1 });
};

// Method to update popularity
serviceSchema.methods.incrementPopularity = function() {
  this.popularity += 1;
  return this.save();
};

// Method to update rating
serviceSchema.methods.updateRating = function(newRating) {
  const totalScore = this.averageRating * this.totalRatings + newRating;
  this.totalRatings += 1;
  this.averageRating = totalScore / this.totalRatings;
  return this.save();
};

module.exports = mongoose.model('Service', serviceSchema);
