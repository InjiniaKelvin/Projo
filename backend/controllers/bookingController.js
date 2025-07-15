/**
 * Booking Controller
 * 
 * This controller handles service booking management including
 * creation, updates, assignments, and status tracking.
 */

const { Booking, User, Transaction } = require('../models');

class BookingController {
  /**
   * Create a new booking
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createBooking(req, res) {
    try {
      const clientId = req.user._id;
      const {
        serviceType,
        serviceDescription,
        urgency,
        location,
        scheduling,
        pricing = {}
      } = req.body;
      
      // Create new booking
      const booking = new Booking({
        clientId,
        serviceType,
        serviceDescription,
        urgency,
        location,
        scheduling,
        pricing: {
          quotedAmount: pricing.quotedAmount || 0,
          currency: pricing.currency || 'KES'
        },
        metadata: {
          platform: 'mobile',
          deviceInfo: req.get('User-Agent'),
          source: 'app'
        }
      });
      
      await booking.save();
      
      // Populate client information
      await booking.populate('clientId', 'firstName lastName email phoneNumber');
      
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: { booking: booking.toJSON() }
      });
      
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }
  }

  /**
   * Get booking by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;
      
      const booking = await Booking.findByBookingId(bookingId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check if user has access to this booking
      const isClient = booking.clientId._id.toString() === userId.toString();
      const isTechnician = booking.technicianId && booking.technicianId._id.toString() === userId.toString();
      const isAdmin = userRole === 'admin';
      
      if (!isClient && !isTechnician && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this booking'
        });
      }
      
      res.json({
        success: true,
        data: { booking: booking.toJSON() }
      });
      
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get booking',
        error: error.message
      });
    }
  }

  /**
   * Get user's bookings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserBookings(req, res) {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;
      const { page = 1, limit = 10, status, serviceType } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
          { path: 'clientId', select: 'firstName lastName email phoneNumber' },
          { path: 'technicianId', select: 'firstName lastName email phoneNumber skills rating' }
        ]
      };
      
      let query = {};
      
      // Set query based on user role
      if (userRole === 'client') {
        query.clientId = userId;
      } else if (userRole === 'technician') {
        query.technicianId = userId;
      } else if (userRole === 'admin') {
        // Admin can see all bookings
      } else {
        return res.status(403).json({
          success: false,
          message: 'Invalid user role'
        });
      }
      
      // Add filters
      if (status) {
        query.status = status;
      }
      
      if (serviceType) {
        query.serviceType = serviceType;
      }
      
      const bookings = await Booking.paginate(query, options);
      
      res.json({
        success: true,
        data: {
          bookings: bookings.docs,
          pagination: {
            page: bookings.page,
            totalPages: bookings.totalPages,
            totalDocs: bookings.totalDocs,
            limit: bookings.limit,
            hasNextPage: bookings.hasNextPage,
            hasPrevPage: bookings.hasPrevPage
          }
        }
      });
      
    } catch (error) {
      console.error('Get user bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bookings',
        error: error.message
      });
    }
  }

  /**
   * Get available bookings for technicians
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableBookings(req, res) {
    try {
      const { serviceType, location, maxDistance = 10000 } = req.query;
      const userRole = req.user.role;
      
      if (userRole !== 'technician') {
        return res.status(403).json({
          success: false,
          message: 'Only technicians can view available bookings'
        });
      }
      
      let query = Booking.findPendingBookings(
        location ? { 
          coordinates: JSON.parse(location), 
          maxDistance: parseInt(maxDistance) 
        } : null,
        serviceType
      );
      
      const bookings = await query.exec();
      
      res.json({
        success: true,
        data: { bookings }
      });
      
    } catch (error) {
      console.error('Get available bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available bookings',
        error: error.message
      });
    }
  }

  /**
   * Assign technician to booking
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async assignTechnician(req, res) {
    try {
      const { bookingId } = req.params;
      const technicianId = req.user._id;
      const userRole = req.user.role;
      
      if (userRole !== 'technician') {
        return res.status(403).json({
          success: false,
          message: 'Only technicians can accept bookings'
        });
      }
      
      const booking = await Booking.findOne({ bookingId })
        .populate('clientId', 'firstName lastName email phoneNumber');
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      if (booking.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Booking is not available for assignment'
        });
      }
      
      // Assign technician
      await booking.assignTechnician(technicianId);
      
      // Populate technician information
      await booking.populate('technicianId', 'firstName lastName email phoneNumber skills rating');
      
      res.json({
        success: true,
        message: 'Booking assigned successfully',
        data: { booking: booking.toJSON() }
      });
      
    } catch (error) {
      console.error('Assign technician error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign technician',
        error: error.message
      });
    }
  }

  /**
   * Confirm booking
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async confirmBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;
      
      const booking = await Booking.findOne({ bookingId });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check if user is the client
      if (booking.clientId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the client can confirm the booking'
        });
      }
      
      if (booking.status !== 'assigned') {
        return res.status(400).json({
          success: false,
          message: 'Booking must be assigned before confirmation'
        });
      }
      
      await booking.confirmBooking();
      
      res.json({
        success: true,
        message: 'Booking confirmed successfully',
        data: { booking: booking.toJSON() }
      });
      
    } catch (error) {
      console.error('Confirm booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm booking',
        error: error.message
      });
    }
  }

  /**
   * Start work on booking
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async startWork(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;
      
      const booking = await Booking.findOne({ bookingId });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check if user is the assigned technician
      if (!booking.technicianId || booking.technicianId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned technician can start work'
        });
      }
      
      await booking.startWork();
      
      res.json({
        success: true,
        message: 'Work started successfully',
        data: { booking: booking.toJSON() }
      });
      
    } catch (error) {
      console.error('Start work error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start work',
        error: error.message
      });
    }
  }

  /**
   * Complete work on booking
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async completeWork(req, res) {
    try {
      const { bookingId } = req.params;
      const { finalAmount } = req.body;
      const userId = req.user._id;
      
      const booking = await Booking.findOne({ bookingId });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check if user is the assigned technician
      if (!booking.technicianId || booking.technicianId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned technician can complete work'
        });
      }
      
      await booking.completeWork(finalAmount);
      
      res.json({
        success: true,
        message: 'Work completed successfully',
        data: { booking: booking.toJSON() }
      });
      
    } catch (error) {
      console.error('Complete work error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete work',
        error: error.message
      });
    }
  }

  /**
   * Cancel booking
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;
      const userId = req.user._id;
      
      const booking = await Booking.findOne({ bookingId });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check if user has permission to cancel
      const isClient = booking.clientId.toString() === userId.toString();
      const isTechnician = booking.technicianId && booking.technicianId.toString() === userId.toString();
      
      if (!isClient && !isTechnician) {
        return res.status(403).json({
          success: false,
          message: 'You can only cancel your own bookings'
        });
      }
      
      await booking.cancelBooking(userId, reason);
      
      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: { booking: booking.toJSON() }
      });
      
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: error.message
      });
    }
  }

  /**
   * Add message to booking
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addMessage(req, res) {
    try {
      const { bookingId } = req.params;
      const { message } = req.body;
      const userId = req.user._id;
      
      const booking = await Booking.findOne({ bookingId });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check if user is part of this booking
      const isClient = booking.clientId.toString() === userId.toString();
      const isTechnician = booking.technicianId && booking.technicianId.toString() === userId.toString();
      
      if (!isClient && !isTechnician) {
        return res.status(403).json({
          success: false,
          message: 'You can only message in your own bookings'
        });
      }
      
      await booking.addMessage(userId, message);
      
      res.json({
        success: true,
        message: 'Message added successfully',
        data: { booking: booking.toJSON() }
      });
      
    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add message',
        error: error.message
      });
    }
  }

  /**
   * Add rating and review
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addRating(req, res) {
    try {
      const { bookingId } = req.params;
      const { rating, review } = req.body;
      const userId = req.user._id;
      
      const booking = await Booking.findOne({ bookingId });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      await booking.addRating(userId, rating, review);
      
      // Update user's overall rating if this is a technician rating
      const isClient = booking.clientId.toString() === userId.toString();
      if (isClient && booking.technicianId) {
        const technician = await User.findById(booking.technicianId);
        if (technician) {
          // Recalculate technician's average rating
          const technicianBookings = await Booking.find({
            technicianId: booking.technicianId,
            'rating.clientRating.stars': { $exists: true }
          });
          
          if (technicianBookings.length > 0) {
            const totalRating = technicianBookings.reduce((sum, b) => sum + b.rating.clientRating.stars, 0);
            const averageRating = totalRating / technicianBookings.length;
            
            technician.rating.average = Math.round(averageRating * 10) / 10; // Round to 1 decimal
            technician.rating.count = technicianBookings.length;
            await technician.save();
          }
        }
      }
      
      res.json({
        success: true,
        message: 'Rating added successfully',
        data: { booking: booking.toJSON() }
      });
      
    } catch (error) {
      console.error('Add rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add rating',
        error: error.message
      });
    }
  }

  /**
   * Get booking statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBookingStats(req, res) {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;
      
      if (userRole === 'admin') {
        // Admin can see overall stats
        const stats = await Booking.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$pricing.finalAmount' }
            }
          }
        ]);
        
        res.json({
          success: true,
          data: { stats }
        });
      } else {
        // User-specific stats
        const stats = await Booking.getBookingStats(userId, userRole);
        
        res.json({
          success: true,
          data: { stats }
        });
      }
      
    } catch (error) {
      console.error('Get booking stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get booking statistics',
        error: error.message
      });
    }
  }

  /**
   * Upload booking images
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadImages(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;
      const files = req.files || [];
      
      if (!files.length) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      const booking = await Booking.findOne({ bookingId });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check if user is part of this booking
      const isClient = booking.clientId.toString() === userId.toString();
      const isTechnician = booking.technicianId && booking.technicianId.toString() === userId.toString();
      
      if (!isClient && !isTechnician) {
        return res.status(403).json({
          success: false,
          message: 'You can only upload images to your own bookings'
        });
      }
      
      // Process uploaded files
      const images = files.map(file => ({
        url: `/uploads/${file.filename}`,
        description: file.originalname,
        uploadedAt: new Date(),
        uploadedBy: userId
      }));
      
      booking.images.push(...images);
      await booking.save();
      
      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: { 
          booking: booking.toJSON(),
          uploadedImages: images
        }
      });
      
    } catch (error) {
      console.error('Upload images error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error.message
      });
    }
  }
}

module.exports = new BookingController();
