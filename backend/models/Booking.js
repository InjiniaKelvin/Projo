/**
 * REDESIGNED BOOKING SYSTEM - PHONE-BASED CLIENT ID
 * 
 * This redesign simplifies the booking process by:
 * 1. Using phone number as the primary client identifier
 * 2. Eliminating separate bookingId and serviceId - using one unified ID
 * 3. Ensuring frontend-backend field consistency
 * 4. Creating bug-prevention automation
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

/**
 * Simplified Booking Schema with Phone-Based Client ID
 */
const bookingSchema = new mongoose.Schema({
  // UNIFIED BOOKING ID - replaces both bookingId and serviceId
  bookingId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // Format: QF[YYYYMMDD][HHMM][PHONE_LAST4][RANDOM]
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
      const phoneLast4 = this.clientPhone ? this.clientPhone.slice(-4) : '0000';
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      return `QF${dateStr}${timeStr}${phoneLast4}${random}`;
    }
  },
  
  // CLIENT IDENTIFICATION - PHONE NUMBER AS PRIMARY ID
  clientPhone: {
    type: String,
    required: [true, 'Client phone number is required'],
    validate: {
      validator: function(v) {
        // Kenyan phone number validation (normalize format)
        const cleanPhone = v.replace(/[\s\-\+]/g, '');
        return /^(254|0)?[17][0-9]{8}$/.test(cleanPhone);
      },
      message: 'Please provide a valid Kenyan phone number'
    },
    set: function(v) {
      // Normalize phone number format to +254XXXXXXXXX
      if (!v) return v;
      const cleanPhone = v.replace(/[\s\-\+]/g, '');
      if (cleanPhone.startsWith('0')) {
        return '+254' + cleanPhone.slice(1);
      } else if (cleanPhone.startsWith('254')) {
        return '+' + cleanPhone;
      } else if (cleanPhone.startsWith('+254')) {
        return cleanPhone;
      }
      return '+254' + cleanPhone;
    }
  },
  
  // CLIENT DETAILS - ALL REQUIRED FOR BOOKING
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  clientEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  
  // LINKED USER ID (if user is registered) - OPTIONAL
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // SERVICE DETAILS - SIMPLIFIED
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
  
  // URGENCY LEVEL
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal',
    required: true
  },
  
  // LOCATION - NAIROBI HIERARCHY
  location: {
    constituency: {
      type: String,
      required: [true, 'Constituency is required'],
      trim: true
    },
    ward: {
      type: String,
      required: [true, 'Ward is required'],
      trim: true
    },
    road: {
      type: String,
      required: [true, 'Road/Street is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Location description is required'],
      trim: true,
      maxlength: [200, 'Location description cannot exceed 200 characters']
    },
    landmarks: {
      type: String,
      trim: true
    }
  },
  
  // SCHEDULING
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required'],
    validate: {
      validator: function(v) {
        return v && v >= new Date(Date.now() - 24 * 60 * 60 * 1000); // Allow today
      },
      message: 'Preferred date cannot be in the past'
    }
  },
  
  preferredTimeSlot: {
    type: String,
    required: [true, 'Preferred time slot is required'],
    enum: [
      '08:00-10:00',
      '10:00-12:00', 
      '12:00-14:00',
      '14:00-16:00',
      '16:00-18:00',
      'emergency-asap',
      'emergency-today',
      'flexible'
    ]
  },
  
  // TECHNICIAN ASSIGNMENT
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  technicianPhone: {
    type: String,
    default: null
  },
  
  // STATUS TRACKING
  status: {
    type: String,
    enum: [
      'submitted',        // Just submitted
      'confirmed',        // Admin confirmed
      'technician_assigned', // Technician assigned
      'in_progress',      // Work started
      'completed',        // Work finished
      'cancelled',        // Cancelled
      'on_hold'          // Temporarily paused
    ],
    default: 'submitted'
  },
  
  // PRICING
  quotedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Amount cannot be negative']
  },
  
  finalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Amount cannot be negative']
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'refunded'],
    default: 'pending'
  },
  
  // ADDITIONAL INFO
  specialRequirements: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requirements cannot exceed 500 characters']
  },
  
  // TIMESTAMPS
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  confirmedAt: Date,
  assignedAt: Date,
  completedAt: Date,
  
  // COMMUNICATION
  notes: [{
    content: String,
    author: String, // 'client', 'technician', 'admin'
    timestamp: { type: Date, default: Date.now }
  }],
  
  // RATING & FEEDBACK
  rating: {
    service: { type: Number, min: 1, max: 5 },
    technician: { type: Number, min: 1, max: 5 },
    overall: { type: Number, min: 1, max: 5 },
    feedback: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// INDEXES FOR PERFORMANCE
 bookingSchema.index({ clientPhone: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ serviceType: 1 });
bookingSchema.index({ 'location.constituency': 1, 'location.ward': 1 });
bookingSchema.index({ preferredDate: 1 });
bookingSchema.index({ submittedAt: -1 });

// VIRTUAL FOR DISPLAY NAME
bookingSchema.virtual('displayId').get(function() {
  return this.bookingId;
});

// VIRTUAL FOR FORMATTED LOCATION
bookingSchema.virtual('formattedLocation').get(function() {
  return `${this.location.road}, ${this.location.ward}, ${this.location.constituency}`;
});

// PRE-SAVE MIDDLEWARE
bookingSchema.pre('save', function(next) {
  // Ensure phone number is properly formatted
  if (this.clientPhone && this.isModified('clientPhone')) {
    const cleanPhone = this.clientPhone.replace(/[\s\-\+]/g, '');
    if (cleanPhone.startsWith('0')) {
      this.clientPhone = '+254' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('254')) {
      this.clientPhone = '+' + cleanPhone;
    }
  }
  
  next();
});

// PAGINATION PLUGIN
bookingSchema.plugin(mongoosePaginate);

// EXPORT MODEL WITH DIFFERENT NAME
const BookingRedesigned = mongoose.model('BookingRedesigned', bookingSchema);

module.exports = BookingRedesigned;
