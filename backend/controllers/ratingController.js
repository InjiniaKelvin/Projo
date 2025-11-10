/**
 * Rating Controller
 * 
 * Handles all rating and review operations
 * Including submission, retrieval, moderation, and technician responses
 */

const Rating = require('../models/Rating');
const Booking = require('../models/BookingRedesigned');
const User = require('../models/User');

/**
 * Submit a new rating for a completed booking
 * POST /api/ratings
 */
exports.submitRating = async (req, res) => {
  try {
    const {
      bookingId,
      ratings,
      feedback,
      quickFeedback,
      media
    } = req.body;
    
    const userId = req.user._id;
    
    // Validate required fields
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }
    
    if (!ratings || !ratings.service || !ratings.technician || !ratings.overall) {
      return res.status(400).json({
        success: false,
        message: 'All rating fields (service, technician, overall) are required'
      });
    }
    
    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings'
      });
    }
    
    // Verify user is the customer who made the booking
    const bookingCustomerId = booking.userId?._id?.toString() || booking.userId?.toString();
    if (bookingCustomerId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate your own bookings'
      });
    }
    
    // Check if booking already has a rating
    const existingRating = await Rating.findOne({ booking: bookingId });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been rated'
      });
    }
    
    // Get technician ID from booking
    const technicianId = booking.technicianId?._id?.toString() || booking.technicianId?.toString();
    
    if (!technicianId) {
      return res.status(400).json({
        success: false,
        message: 'Booking does not have an assigned technician'
      });
    }
    
    // Create new rating
    const newRating = new Rating({
      booking: bookingId,
      technician: technicianId,
      customer: userId,
      ratings: {
        service: ratings.service,
        technician: ratings.technician,
        overall: ratings.overall
      },
      feedback: feedback || '',
      quickFeedback: quickFeedback || [],
      media: media || [],
      isVerified: true,
      submittedAt: new Date()
    });
    
    await newRating.save();
    
    // Update booking with rating reference
    booking.rating = {
      service: ratings.service,
      technician: ratings.technician,
      overall: ratings.overall,
      feedback: feedback || ''
    };
    await booking.save();
    
    // Populate rating details for response
    await newRating.populate('customer', 'firstName lastName');
    await newRating.populate('technician', 'firstName lastName rating');
    await newRating.populate('booking', 'bookingId serviceType completedAt');
    
    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: newRating
      }
    });
    
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};

/**
 * Get all ratings for a specific technician
 * GET /api/ratings/technician/:technicianId
 */
exports.getTechnicianRatings = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;
    
    // Validate technician exists
    const technician = await User.findById(technicianId);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }
    
    // Build query
    const query = {
      technician: technicianId,
      isVisible: true,
      'flagged.isFlagged': false
    };
    
    // Determine sort order
    let sortOption = { submittedAt: -1 }; // Default: most recent first
    if (sortBy === 'highest') {
      sortOption = { 'ratings.overall': -1, submittedAt: -1 };
    } else if (sortBy === 'lowest') {
      sortOption = { 'ratings.overall': 1, submittedAt: -1 };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get ratings
    const ratings = await Rating.find(query)
      .populate('customer', 'firstName lastName')
      .populate('booking', 'bookingId serviceType completedAt')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count
    const totalRatings = await Rating.countDocuments(query);
    
    // Get technician statistics
    const stats = await Rating.getTechnicianStats(technicianId);
    
    res.status(200).json({
      success: true,
      data: {
        ratings,
        statistics: stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRatings / parseInt(limit)),
          totalRatings,
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get technician ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve technician ratings',
      error: error.message
    });
  }
};

/**
 * Get rating for a specific booking
 * GET /api/ratings/booking/:bookingId
 */
exports.getBookingRating = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const rating = await Rating.findOne({ booking: bookingId })
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName rating')
      .populate('booking', 'bookingId serviceType completedAt')
      .lean();
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found for this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        rating
      }
    });
    
  } catch (error) {
    console.error('Get booking rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking rating',
      error: error.message
    });
  }
};

/**
 * Get customer's rating history
 * GET /api/ratings/customer/history
 */
exports.getCustomerRatings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const ratings = await Rating.find({ customer: userId })
      .populate('technician', 'firstName lastName rating')
      .populate('booking', 'bookingId serviceType completedAt')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalRatings = await Rating.countDocuments({ customer: userId });
    
    res.status(200).json({
      success: true,
      data: {
        ratings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRatings / parseInt(limit)),
          totalRatings,
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get customer ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer ratings',
      error: error.message
    });
  }
};

/**
 * Flag a rating as inappropriate
 * POST /api/ratings/:ratingId/flag
 */
exports.flagRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Flag reason is required'
      });
    }
    
    const validReasons = ['inappropriate', 'spam', 'offensive', 'misleading', 'fake', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid flag reason'
      });
    }
    
    const rating = await Rating.findById(ratingId);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    if (rating.flagged.isFlagged) {
      return res.status(400).json({
        success: false,
        message: 'Rating has already been flagged'
      });
    }
    
    await rating.flagRating(userId, reason);
    
    res.status(200).json({
      success: true,
      message: 'Rating flagged successfully. Our team will review it.',
      data: {
        rating
      }
    });
    
  } catch (error) {
    console.error('Flag rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to flag rating',
      error: error.message
    });
  }
};

/**
 * Technician responds to a rating
 * POST /api/ratings/:ratingId/respond
 */
exports.respondToRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { response } = req.body;
    const userId = req.user._id;
    
    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response content is required'
      });
    }
    
    if (response.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Response cannot exceed 500 characters'
      });
    }
    
    const rating = await Rating.findById(ratingId);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    // Verify user is the technician who received the rating
    if (rating.technician.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to your own ratings'
      });
    }
    
    if (rating.technicianResponse.content) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this rating'
      });
    }
    
    await rating.addTechnicianResponse(response);
    
    await rating.populate('customer', 'firstName lastName');
    await rating.populate('technician', 'firstName lastName rating');
    await rating.populate('booking', 'bookingId serviceType completedAt');
    
    res.status(200).json({
      success: true,
      message: 'Response submitted successfully',
      data: {
        rating
      }
    });
    
  } catch (error) {
    console.error('Respond to rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit response',
      error: error.message
    });
  }
};

/**
 * Mark rating as helpful
 * POST /api/ratings/:ratingId/helpful
 */
exports.markHelpful = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user._id;
    
    const rating = await Rating.findById(ratingId);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    await rating.markHelpful(userId);
    
    res.status(200).json({
      success: true,
      message: 'Rating marked as helpful',
      data: {
        helpfulCount: rating.helpful.count
      }
    });
    
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark rating as helpful',
      error: error.message
    });
  }
};

/**
 * Delete a rating (Admin only)
 * DELETE /api/ratings/:ratingId
 */
exports.deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user._id;
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete ratings'
      });
    }
    
    const rating = await Rating.findById(ratingId);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    // Soft delete: mark as not visible
    rating.isVisible = false;
    rating.deletedAt = new Date();
    await rating.save();
    
    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rating',
      error: error.message
    });
  }
};

/**
 * Moderate flagged ratings (Admin only)
 * PUT /api/ratings/:ratingId/moderate
 */
exports.moderateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { action, notes } = req.body; // action: 'approve', 'reject', 'remove'
    const userId = req.user._id;
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can moderate ratings'
      });
    }
    
    const rating = await Rating.findById(ratingId);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    if (!rating.flagged.isFlagged) {
      return res.status(400).json({
        success: false,
        message: 'Rating has not been flagged'
      });
    }
    
    // Update moderation status
    rating.flagged.moderationStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'removed';
    rating.flagged.reviewedBy = userId;
    rating.flagged.reviewedAt = new Date();
    rating.flagged.moderationNotes = notes || '';
    
    if (action === 'approve') {
      rating.flagged.isFlagged = false; // Unflag if approved
    } else if (action === 'remove') {
      rating.isVisible = false; // Hide if removed
      rating.deletedAt = new Date();
    }
    
    await rating.save();
    
    res.status(200).json({
      success: true,
      message: `Rating ${action}ed successfully`,
      data: {
        rating
      }
    });
    
  } catch (error) {
    console.error('Moderate rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate rating',
      error: error.message
    });
  }
};

/**
 * Get all flagged ratings for moderation (Admin only)
 * GET /api/ratings/admin/flagged
 */
exports.getFlaggedRatings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view flagged ratings'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const flaggedRatings = await Rating.find({
      'flagged.isFlagged': true,
      'flagged.moderationStatus': 'pending'
    })
      .populate('customer', 'firstName lastName email')
      .populate('technician', 'firstName lastName email')
      .populate('booking', 'bookingId serviceType')
      .populate('flagged.flaggedBy', 'firstName lastName')
      .sort({ 'flagged.flaggedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalFlagged = await Rating.countDocuments({
      'flagged.isFlagged': true,
      'flagged.moderationStatus': 'pending'
    });
    
    res.status(200).json({
      success: true,
      data: {
        flaggedRatings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalFlagged / parseInt(limit)),
          totalFlagged,
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get flagged ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve flagged ratings',
      error: error.message
    });
  }
};

/**
 * Get rating statistics (Admin dashboard)
 * GET /api/ratings/admin/statistics
 */
exports.getRatingStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view rating statistics'
      });
    }
    
    const totalRatings = await Rating.countDocuments({ isVisible: true });
    const flaggedRatings = await Rating.countDocuments({ 'flagged.isFlagged': true });
    const averageOverallRating = await Rating.aggregate([
      { $match: { isVisible: true } },
      { $group: { _id: null, avg: { $avg: '$ratings.overall' } } }
    ]);
    
    const recentRatings = await Rating.find({ isVisible: true })
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName')
      .populate('booking', 'bookingId serviceType')
      .lean();
    
    res.status(200).json({
      success: true,
      data: {
        totalRatings,
        flaggedRatings,
        averageOverallRating: averageOverallRating.length > 0 ? averageOverallRating[0].avg.toFixed(2) : 0,
        recentRatings
      }
    });
    
  } catch (error) {
    console.error('Get rating statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve rating statistics',
      error: error.message
    });
  }
};

module.exports = exports;
