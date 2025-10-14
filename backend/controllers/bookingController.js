/**
 * BOOKING CONTROLLER - PHONE-BASED CLIENT ID
 * 
 * Simplified, bug-resistant booking management with:
 * 1. Phone number as primary client identifier
 * 2. Unified booking ID system
 * 3. Frontend-backend field consistency
 * 4. Comprehensive validation
 */

const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * VALIDATION HELPER - Updated to handle critical/emergency bookings
 */
function validateBookingData(data, isCritical = false) {
  const errors = [];
  
  if (!data.clientName?.trim()) {
    errors.push('Client name is required');
  }
  
  if (!data.clientPhone?.trim()) {
    errors.push('Client phone number is required');
  } else if (!isValidPhoneNumber(data.clientPhone)) {
    errors.push('Invalid phone number format');
  }
  
  if (!data.serviceType) {
    errors.push('Service type is required');
  }
  
  if (!data.serviceDescription?.trim()) {
    errors.push('Service description is required');
  }
  
  if (!data.constituency?.trim()) {
    errors.push('Constituency is required');
  }
  
  if (!data.ward?.trim()) {
    errors.push('Ward is required');
  }
  
  if (!data.road?.trim()) {
    errors.push('Road/Street is required');
  }
  
  if (!data.locationDescription?.trim()) {
    errors.push('Location description is required');
  }
  
  // Skip date/time validation for critical/emergency bookings
  if (!isCritical) {
    if (!data.preferredDate) {
      errors.push('Preferred date is required');
    } else {
      const prefDate = new Date(data.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (prefDate < today) {
        errors.push('Preferred date cannot be in the past');
      }
    }
    
    if (!data.preferredTimeSlot) {
      errors.push('Preferred time slot is required');
    }
  }
  
  return errors;
}

/**
 * PHONE NUMBER HELPERS
 */
function isValidPhoneNumber(phone) {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');
  return /^(254|0)?[17][0-9]{8}$/.test(cleanPhone);
}

function normalizePhoneNumber(phone) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');
  
  if (cleanPhone.startsWith('0')) {
    return '+254' + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith('254')) {
    return '+' + cleanPhone;
  } else if (cleanPhone.startsWith('+254')) {
    return cleanPhone;
  }
  
  return '+254' + cleanPhone;
}

const BookingControllerRedesigned = {
  /**
   * CREATE BOOKING - SIMPLIFIED PHONE-BASED APPROACH
   */
  async createBooking(req, res) {
    try {
      console.log('Creating redesigned booking with data:', req.body);
      
      // EXTRACT AND VALIDATE REQUIRED FIELDS
      const {
        // CLIENT DETAILS (REQUIRED)
        clientName,
        clientPhone, 
        clientEmail,
        
        // SERVICE DETAILS (REQUIRED)
        serviceType,
        serviceDescription,
        urgency = 'normal',
        
        // LOCATION (REQUIRED)
        location: {
          constituency,
          ward,
          road,
          description: locationDescription,
          landmarks
        } = {},
        
        // SCHEDULING (REQUIRED for normal, optional for critical)
        preferredDate,
        preferredTimeSlot,
        
        // OPTIONAL
        specialRequirements,
        
        // CRITICAL BOOKING FLAG
        isCritical = false
      } = req.body;
      
      // Detect if this is a critical/emergency booking
      const isEmergencyBooking = isCritical || urgency === 'emergency' || 
                                  preferredTimeSlot === 'emergency-asap' ||
                                  preferredTimeSlot === 'emergency-today';
      
      console.log(`CRITICAL: Booking type: ${isEmergencyBooking ? 'CRITICAL/EMERGENCY' : 'NORMAL'}`);
      
      // COMPREHENSIVE VALIDATION (skip date/time for emergency)
      const validationErrors = validateBookingData({
        clientName,
        clientPhone,
        serviceType,
        serviceDescription,
        constituency,
        ward,
        road,
        locationDescription,
        preferredDate,
        preferredTimeSlot
      }, isEmergencyBooking);
      
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      // NORMALIZE PHONE NUMBER
      const normalizedPhone = normalizePhoneNumber(clientPhone);
      
      // CHECK IF USER EXISTS (OPTIONAL LINKING)
      let userId = null;
      const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
      if (existingUser) {
        userId = existingUser._id;
        console.log('👤 Found existing user for phone:', normalizedPhone);
      }
      
      // PREPARE BOOKING DATA
      const bookingData = {
        clientPhone: normalizedPhone,
        clientName: clientName.trim(),
        clientEmail: clientEmail?.trim(),
        userId,
        
        serviceType,
        serviceDescription: serviceDescription.trim(),
        urgency: isEmergencyBooking ? 'emergency' : urgency,
        
        location: {
          constituency: constituency.trim(),
          ward: ward.trim(),
          road: road.trim(),
          description: locationDescription.trim(),
          landmarks: landmarks?.trim()
        },
        
        // For critical bookings, use today's date and emergency-asap slot if not provided
        preferredDate: preferredDate ? new Date(preferredDate) : new Date(),
        preferredTimeSlot: preferredTimeSlot || 'emergency-asap',
        
        specialRequirements: specialRequirements?.trim(),
        
        status: 'submitted',
        submittedAt: new Date()
      };
      
      // CREATE BOOKING
      const booking = new Booking(bookingData);
      await booking.save();
      
      console.log('SUCCESS: Booking created successfully:', booking.bookingId);
      console.log(`INFO: Urgency: ${booking.urgency}, Time Slot: ${booking.preferredTimeSlot}`);
      
      // RESPONSE WITH ESSENTIAL DATA
      res.status(201).json({
        success: true,
        message: isEmergencyBooking 
          ? 'Critical booking submitted successfully - Technician will be assigned ASAP!' 
          : 'Booking submitted successfully',
        data: {
          bookingId: booking.bookingId,
          clientPhone: booking.clientPhone,
          serviceType: booking.serviceType,
          status: booking.status,
          urgency: booking.urgency,
          formattedLocation: booking.formattedLocation,
          preferredDate: booking.preferredDate,
          preferredTimeSlot: booking.preferredTimeSlot,
          submittedAt: booking.submittedAt,
          isEmergency: isEmergencyBooking
        }
      });
      
    } catch (error) {
      console.error('ERROR: Error creating booking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }
  },
  
  /**
   * GET BOOKINGS BY PHONE NUMBER
   */
  async getBookingsByPhone(req, res) {
    try {
      const { phoneNumber } = req.params;
      
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }
      
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      const bookings = await Booking.find({ clientPhone: normalizedPhone })
        .sort({ submittedAt: -1 })
        .lean();
      
      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
      
    } catch (error) {
      console.error(' Error fetching bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings',
        error: error.message
      });
    }
  },
  
  /**
   * GET SINGLE BOOKING BY ID
   */
  async getBooking(req, res) {
    try {
      const { bookingId } = req.params;
      
      const booking = await Booking.findOne({ bookingId })
        .populate('userId', 'firstName lastName email')
        .populate('technicianId', 'firstName lastName phoneNumber')
        .lean();
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      res.json({
        success: true,
        data: booking
      });
      
    } catch (error) {
      console.error(' Error fetching booking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking',
        error: error.message
      });
    }
  },
  
  /**
   * UPDATE BOOKING STATUS
   */
  async updateBookingStatus(req, res) {
    try {
      const { bookingId } = req.params;
      const { status, notes } = req.body;
      
      const validStatuses = [
        'submitted', 'confirmed', 'technician_assigned', 
        'in_progress', 'completed', 'cancelled', 'on_hold'
      ];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      
      const booking = await Booking.findOne({ bookingId });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // UPDATE STATUS AND TIMESTAMP
      booking.status = status;
      
      if (status === 'confirmed' && !booking.confirmedAt) {
        booking.confirmedAt = new Date();
      } else if (status === 'technician_assigned' && !booking.assignedAt) {
        booking.assignedAt = new Date();
      } else if (status === 'completed' && !booking.completedAt) {
        booking.completedAt = new Date();
      }
      
      // ADD NOTES IF PROVIDED
      if (notes) {
        booking.notes.push({
          content: notes,
          author: 'admin', // Or get from token
          timestamp: new Date()
        });
      }
      
      await booking.save();
      
      res.json({
        success: true,
        message: 'Booking status updated',
        data: {
          bookingId: booking.bookingId,
          status: booking.status
        }
      });
      
    } catch (error) {
      console.error(' Error updating booking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking',
        error: error.message
      });
    }
  },
  
  /**
   * ASSIGN TECHNICIAN
   */
  async assignTechnician(req, res) {
    try {
      const { bookingId } = req.params;
      const { technicianId } = req.body;
      
      const booking = await Booking.findOne({ bookingId });
      const technician = await User.findById(technicianId);
      
      if (!booking || !technician) {
        return res.status(404).json({
          success: false,
          message: 'Booking or technician not found'
        });
      }
      
      booking.technicianId = technicianId;
      booking.technicianPhone = technician.phoneNumber;
      booking.status = 'technician_assigned';
      booking.assignedAt = new Date();
      
      await booking.save();
      
      res.json({
        success: true,
        message: 'Technician assigned successfully',
        data: {
          bookingId: booking.bookingId,
          technicianName: `${technician.firstName} ${technician.lastName}`,
          technicianPhone: technician.phoneNumber
        }
      });
      
    } catch (error) {
      console.error(' Error assigning technician:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign technician',
        error: error.message
      });
    }
  },

  /**
   * GET BOOKINGS BY EMAIL
   */
  async getBookingsByEmail(req, res) {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Normalize email (lowercase, trim)
      const normalizedEmail = email.toLowerCase().trim();
      
      // Find bookings by client email
      const bookings = await Booking.find({ 
        clientEmail: normalizedEmail 
      })
        .sort({ submittedAt: -1 })
        .lean();
      
      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
      
    } catch (error) {
      console.error(' Error fetching bookings by email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings',
        error: error.message
      });
    }
  }
};

module.exports = BookingControllerRedesigned;
