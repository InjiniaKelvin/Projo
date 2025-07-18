/**
 * Enhanced Booking Controller with Real-time Features
 * 
 * This controller handles advanced booking operations including:
 * - Real-time technician matching
 * - Dynamic pricing
 * - Scheduling system
 * - Real-time status updates
 */

const Booking = require('../models/Booking');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const axios = require('axios');

// WebSocket for real-time updates
let io;

const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

/**
 * Enhanced technician matching algorithm
 */
const findBestTechnician = async (serviceType, location, urgency = 'normal', requirements = {}) => {
  try {
    // Build the match criteria
    const matchCriteria = {
      role: 'technician',
      isVerified: true,
      isActive: true,
      'technicianProfile.availability.isAvailable': true,
      'technicianProfile.skills.name': serviceType
    };

    // Find available technicians
    const technicians = await User.find(matchCriteria).select(
      'firstName lastName email phoneNumber technicianProfile location'
    );

    if (technicians.length === 0) {
      return null;
    }

    // Calculate scores for each technician
    const scoredTechnicians = technicians.map(tech => {
      let score = 0;
      
      // Distance score (closer is better)
      const distance = calculateDistance(location, tech.location);
      const distanceScore = Math.max(0, 100 - (distance * 2)); // 50km = 0 points
      score += distanceScore * 0.4;
      
      // Rating score
      const rating = tech.technicianProfile.rating || 0;
      score += (rating / 5) * 100 * 0.3;
      
      // Experience score
      const skillData = tech.technicianProfile.skills.find(s => s.name === serviceType);
      const experience = skillData ? skillData.experience : 0;
      score += Math.min(experience * 10, 100) * 0.2; // Max 10 years = 100 points
      
      // Availability score based on urgency
      if (urgency === 'emergency') {
        const availability = tech.technicianProfile.availability;
        if (availability.emergency) score += 50;
      }
      
      // Completion rate score
      const completionRate = tech.technicianProfile.completionRate || 0;
      score += completionRate * 0.1;

      return {
        technician: tech,
        score,
        distance,
        estimatedArrival: calculateETA(distance, urgency)
      };
    });

    // Sort by score (highest first)
    scoredTechnicians.sort((a, b) => b.score - a.score);
    
    return scoredTechnicians[0];
  } catch (error) {
    console.error('Find best technician error:', error);
    throw error;
  }
};

/**
 * Calculate distance between two coordinates
 */
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calculate estimated time of arrival
 */
const calculateETA = (distance, urgency) => {
  const baseSpeed = urgency === 'emergency' ? 40 : 30; // km/h
  const travelTime = (distance / baseSpeed) * 60; // minutes
  const preparationTime = urgency === 'emergency' ? 10 : 20; // minutes
  
  return Math.round(travelTime + preparationTime);
};

/**
 * Dynamic pricing calculation
 */
const calculateServicePrice = (serviceType, urgency, distance, timeOfDay, demand = 1) => {
  // Base prices for different services
  const basePrices = {
    'plumbing': 50,
    'electrical': 60,
    'appliance_repair': 45,
    'air_conditioning': 70,
    'carpentry': 40,
    'painting': 35,
    'cleaning': 30,
    'roofing': 80,
    'gardening': 25
  };

  let price = basePrices[serviceType] || 50;

  // Urgency multiplier
  const urgencyMultipliers = {
    'low': 1.0,
    'normal': 1.1,
    'high': 1.3,
    'emergency': 1.8
  };
  price *= urgencyMultipliers[urgency] || 1.1;

  // Distance fee
  if (distance > 10) {
    price += (distance - 10) * 2; // $2 per km beyond 10km
  }

  // Time of day multiplier
  const hour = new Date().getHours();
  if (hour < 7 || hour > 20) {
    price *= 1.2; // 20% surcharge for early morning/late night
  }

  // Demand multiplier
  price *= demand;

  // Weekend surcharge
  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend) {
    price *= 1.15;
  }

  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

/**
 * Create enhanced booking with real-time matching
 */
const createEnhancedBooking = async (req, res) => {
  try {
    const {
      serviceType,
      description,
      urgency = 'normal',
      scheduledDate,
      location,
      images = [],
      requirements = {}
    } = req.body;

    const clientId = req.user.id;

    // Validate scheduled date
    if (scheduledDate && new Date(scheduledDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date cannot be in the past'
      });
    }

    // Check if immediate service or scheduled
    const isImmediate = !scheduledDate || new Date(scheduledDate) <= new Date(Date.now() + 30 * 60 * 1000);

    let bestMatch = null;
    let estimatedPrice = 0;

    if (isImmediate) {
      // Find best technician for immediate service
      bestMatch = await findBestTechnician(serviceType, location, urgency, requirements);
      
      if (!bestMatch && urgency !== 'emergency') {
        return res.status(404).json({
          success: false,
          message: 'No technicians available for immediate service. Please schedule for later.'
        });
      }
    }

    // Calculate dynamic pricing
    const currentDemand = await calculateCurrentDemand(serviceType, location);
    const distance = bestMatch ? bestMatch.distance : 10; // Default distance
    estimatedPrice = calculateServicePrice(serviceType, urgency, distance, new Date().getHours(), currentDemand);

    // Create booking
    const booking = new Booking({
      clientId,
      technicianId: bestMatch ? bestMatch.technician._id : null,
      serviceType,
      description,
      urgency,
      status: bestMatch ? 'assigned' : 'pending',
      location,
      scheduledDate: scheduledDate || new Date(),
      estimatedPrice,
      estimatedDuration: getEstimatedDuration(serviceType),
      estimatedArrival: bestMatch ? bestMatch.estimatedArrival : null,
      images,
      requirements,
      metadata: {
        matchingScore: bestMatch ? bestMatch.score : null,
        searchRadius: 50, // km
        matchingCriteria: requirements
      }
    });

    await booking.save();

    // Populate client and technician details
    await booking.populate([
      { path: 'clientId', select: 'firstName lastName email phoneNumber' },
      { path: 'technicianId', select: 'firstName lastName email phoneNumber technicianProfile' }
    ]);

    // Send real-time notifications
    if (bestMatch) {
      // Notify technician
      io.to(`user_${bestMatch.technician._id}`).emit('new_booking', {
        booking,
        message: `New ${urgency} ${serviceType} job assigned to you`
      });

      // Notify client
      io.to(`user_${clientId}`).emit('booking_assigned', {
        booking,
        technician: bestMatch.technician,
        estimatedArrival: bestMatch.estimatedArrival
      });

      // Send SMS/Email notifications
      await sendBookingNotifications(booking, 'assigned');
    } else {
      // Broadcast to available technicians
      const availableTechnicians = await User.find({
        role: 'technician',
        isActive: true,
        'technicianProfile.skills.name': serviceType
      }).select('_id');

      availableTechnicians.forEach(tech => {
        io.to(`user_${tech._id}`).emit('new_job_available', {
          booking,
          message: `New ${serviceType} job available in your area`
        });
      });
    }

    res.status(201).json({
      success: true,
      message: bestMatch ? 'Booking created and technician assigned' : 'Booking created, searching for technician',
      data: {
        booking,
        technician: bestMatch ? bestMatch.technician : null,
        estimatedArrival: bestMatch ? bestMatch.estimatedArrival : null,
        estimatedPrice
      }
    });
  } catch (error) {
    console.error('Create enhanced booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
};

/**
 * Update booking status with real-time notifications
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes, images = [], location } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId).populate([
      { path: 'clientId', select: 'firstName lastName email phoneNumber' },
      { path: 'technicianId', select: 'firstName lastName email phoneNumber' }
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate permissions
    const isTechnician = booking.technicianId && booking.technicianId._id.toString() === userId;
    const isClient = booking.clientId._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isTechnician && !isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['assigned', 'cancelled'],
      'assigned': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': ['reviewed'],
      'cancelled': [],
      'reviewed': []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    // Update booking
    const updateData = {
      status,
      lastUpdated: new Date()
    };

    if (notes) {
      updateData.$push = {
        statusHistory: {
          status,
          notes,
          updatedBy: userId,
          timestamp: new Date(),
          images
        }
      };
    }

    if (location && isTechnician) {
      updateData.technicianLocation = location;
    }

    // Handle specific status updates
    if (status === 'in_progress') {
      updateData.startTime = new Date();
    } else if (status === 'completed') {
      updateData.completionTime = new Date();
      updateData.actualDuration = Math.round((new Date() - booking.startTime) / (1000 * 60)); // minutes
    }

    await Booking.findByIdAndUpdate(bookingId, updateData);
    
    // Reload booking with updates
    const updatedBooking = await Booking.findById(bookingId).populate([
      { path: 'clientId', select: 'firstName lastName email phoneNumber' },
      { path: 'technicianId', select: 'firstName lastName email phoneNumber' }
    ]);

    // Send real-time notifications
    io.to(`user_${booking.clientId._id}`).emit('booking_status_updated', {
      booking: updatedBooking,
      status,
      updatedBy: userId === booking.clientId._id.toString() ? 'client' : 'technician'
    });

    if (booking.technicianId) {
      io.to(`user_${booking.technicianId._id}`).emit('booking_status_updated', {
        booking: updatedBooking,
        status,
        updatedBy: userId === booking.technicianId._id.toString() ? 'technician' : 'client'
      });
    }

    // Handle automatic escrow release for completed jobs
    if (status === 'completed') {
      await handleAutoEscrowRelease(booking);
    }

    // Send notifications
    await sendBookingNotifications(updatedBooking, status);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
};

/**
 * Get available technicians for a specific service
 */
const getAvailableTechnicians = async (req, res) => {
  try {
    const { serviceType, location, urgency = 'normal' } = req.query;

    if (!serviceType || !location) {
      return res.status(400).json({
        success: false,
        message: 'Service type and location are required'
      });
    }

    const locationObj = JSON.parse(location);

    // Find all available technicians
    const technicians = await User.find({
      role: 'technician',
      isVerified: true,
      isActive: true,
      'technicianProfile.availability.isAvailable': true,
      'technicianProfile.skills.name': serviceType
    }).select('firstName lastName technicianProfile location');

    // Score and sort technicians
    const scoredTechnicians = technicians.map(tech => {
      const distance = calculateDistance(locationObj, tech.location);
      const estimatedArrival = calculateETA(distance, urgency);
      
      let score = 0;
      score += Math.max(0, 100 - (distance * 2)) * 0.4;
      score += (tech.technicianProfile.rating / 5) * 100 * 0.3;
      
      const skillData = tech.technicianProfile.skills.find(s => s.name === serviceType);
      const experience = skillData ? skillData.experience : 0;
      score += Math.min(experience * 10, 100) * 0.2;
      score += tech.technicianProfile.completionRate * 0.1;

      return {
        technician: tech,
        distance: Math.round(distance * 10) / 10,
        estimatedArrival,
        score: Math.round(score),
        rating: tech.technicianProfile.rating,
        completedJobs: tech.technicianProfile.completedJobs
      };
    });

    scoredTechnicians.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      data: {
        technicians: scoredTechnicians.slice(0, 10), // Top 10 matches
        total: scoredTechnicians.length
      }
    });
  } catch (error) {
    console.error('Get available technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available technicians'
    });
  }
};

/**
 * Calculate current demand for dynamic pricing
 */
const calculateCurrentDemand = async (serviceType, location) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Count recent bookings in the area
    const recentBookings = await Booking.countDocuments({
      serviceType,
      createdAt: { $gte: oneHourAgo },
      'location.latitude': {
        $gte: location.latitude - 0.1,
        $lte: location.latitude + 0.1
      },
      'location.longitude': {
        $gte: location.longitude - 0.1,
        $lte: location.longitude + 0.1
      }
    });

    // Count available technicians
    const availableTechnicians = await User.countDocuments({
      role: 'technician',
      isActive: true,
      'technicianProfile.availability.isAvailable': true,
      'technicianProfile.skills.name': serviceType
    });

    // Calculate demand ratio
    const demandRatio = availableTechnicians > 0 ? recentBookings / availableTechnicians : 2;
    
    // Convert to multiplier (1.0 = normal demand, 2.0 = high demand)
    return Math.min(Math.max(1.0, 1.0 + (demandRatio * 0.5)), 2.0);
  } catch (error) {
    console.error('Calculate demand error:', error);
    return 1.0; // Default to normal demand
  }
};

/**
 * Get estimated duration for service type
 */
const getEstimatedDuration = (serviceType) => {
  const durations = {
    'plumbing': 120,
    'electrical': 90,
    'appliance_repair': 150,
    'air_conditioning': 180,
    'carpentry': 240,
    'painting': 300,
    'cleaning': 120,
    'roofing': 360,
    'gardening': 180
  };
  
  return durations[serviceType] || 120; // Default 2 hours
};

/**
 * Handle automatic escrow release
 */
const handleAutoEscrowRelease = async (booking) => {
  try {
    // Check if there's money in escrow
    if (booking.paymentStatus !== 'escrowed' || !booking.escrowAmount) {
      return;
    }

    // Wait 24 hours before auto-release (configurable)
    const autoReleaseDelay = 24 * 60 * 60 * 1000; // 24 hours
    
    setTimeout(async () => {
      try {
        const currentBooking = await Booking.findById(booking._id);
        
        // Check if still needs auto-release
        if (currentBooking.paymentStatus === 'escrowed') {
          // Auto-release to technician
          await releaseEscrowFunds(booking._id, 'complete', 'system');
          
          // Notify both parties
          io.to(`user_${booking.clientId._id}`).emit('escrow_auto_released', {
            booking: currentBooking,
            message: 'Payment automatically released to technician after 24 hours'
          });
          
          io.to(`user_${booking.technicianId._id}`).emit('payment_received', {
            booking: currentBooking,
            amount: booking.escrowAmount,
            message: 'Payment automatically released from escrow'
          });
        }
      } catch (error) {
        console.error('Auto escrow release error:', error);
      }
    }, autoReleaseDelay);
  } catch (error) {
    console.error('Handle auto escrow release error:', error);
  }
};

/**
 * Send booking notifications (SMS/Email)
 */
const sendBookingNotifications = async (booking, status) => {
  try {
    // This would integrate with SMS/Email services
    console.log(`Sending notifications for booking ${booking._id} status: ${status}`);
    
    // SMS notifications would go here
    // Email notifications would go here
    
  } catch (error) {
    console.error('Send notifications error:', error);
  }
};

/**
 * Release escrow funds
 */
const releaseEscrowFunds = async (bookingId, releaseType, userId) => {
  // This would call the payment controller's escrow release function
  console.log(`Releasing escrow for booking ${bookingId}, type: ${releaseType}`);
};

/**
 * Get booking analytics
 */
const getBookingAnalytics = async (req, res) => {
  try {
    const { period = '30d', serviceType, location } = req.query;
    
    // Calculate date range
    const now = new Date();
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const matchQuery = {
      createdAt: { $gte: startDate }
    };

    if (serviceType) matchQuery.serviceType = serviceType;
    if (location) {
      const loc = JSON.parse(location);
      matchQuery['location.latitude'] = {
        $gte: loc.latitude - 0.5,
        $lte: loc.latitude + 0.5
      };
      matchQuery['location.longitude'] = {
        $gte: loc.longitude - 0.5,
        $lte: loc.longitude + 0.5
      };
    }

    const analytics = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          averagePrice: { $avg: '$estimatedPrice' },
          averageDuration: { $avg: '$actualDuration' },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$estimatedPrice', 0] }
          }
        }
      }
    ]);

    const result = analytics[0] || {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      averagePrice: 0,
      averageDuration: 0,
      totalRevenue: 0
    };

    result.completionRate = result.totalBookings > 0 
      ? (result.completedBookings / result.totalBookings * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get booking analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking analytics'
    });
  }
};

module.exports = {
  createEnhancedBooking,
  updateBookingStatus,
  getAvailableTechnicians,
  getBookingAnalytics,
  setSocketIO,
  findBestTechnician,
  calculateServicePrice
};
