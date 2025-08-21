/**
 * Technician Matching Service
 * 
 * Advanced algorithm to match technicians with service requests
 * based on multiple weighted factors for optimal assignments.
 */

const { Technician, Booking, Service } = require('../models');
const LocationService = require('./LocationService');

class TechnicianMatchingService {
  /**
   * Find optimal technicians for a service request
   * @param {Object} criteria - Matching criteria
   * @returns {Array} Sorted array of technician matches
   */
  async findOptimalTechnicians(criteria) {
    const {
      serviceId,
      location,
      scheduledDate,
      urgency = 'normal',
      preferences = {},
      customerBudget,
      maxResults = 5
    } = criteria;
    
    try {
      // Get service details
      const service = await Service.findById(serviceId).populate('category');
      if (!service) {
        throw new Error('Service not found');
      }
      
      // Find available technicians
      const availableTechnicians = await this.getAvailableTechnicians({
        serviceId,
        location,
        scheduledDate,
        preferences
      });
      
      if (availableTechnicians.length === 0) {
        return [];
      }
      
      // Calculate match scores for each technician
      const technicianMatches = await Promise.all(
        availableTechnicians.map(async (technician) => {
          const matchData = await this.calculateMatchScore(technician, {
            service,
            location,
            scheduledDate,
            urgency,
            preferences,
            customerBudget
          });
          
          return {
            technician,
            score: matchData.score,
            factors: matchData.factors,
            estimatedArrival: matchData.estimatedArrival,
            pricing: matchData.pricing
          };
        })
      );
      
      // Sort by match score (highest first) and return top matches
      return technicianMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
        
    } catch (error) {
      console.error('Find optimal technicians error:', error);
      return [];
    }
  }
  
  /**
   * Get available technicians based on initial criteria
   */
  async getAvailableTechnicians(criteria) {
    const { serviceId, location, scheduledDate, preferences } = criteria;
    
    const service = await Service.findById(serviceId);
    const requestDate = new Date(scheduledDate);
    
    // Base query for technicians
    const query = {
      isActive: true,
      isVerified: true,
      'availability.isAvailable': true,
      specializations: { $in: [service.category._id] }
    };
    
    // Add preference filters
    if (preferences.gender) {
      query.gender = preferences.gender;
    }
    
    if (preferences.minRating) {
      query.averageRating = { $gte: preferences.minRating };
    }
    
    if (preferences.maxDistance) {
      // Add geospatial query for location
      query['currentLocation.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.coordinates.lng, location.coordinates.lat]
          },
          $maxDistance: preferences.maxDistance * 1000 // Convert km to meters
        }
      };
    }
    
    const technicians = await Technician.find(query)
      .populate('specializations')
      .lean();
    
    // Filter out technicians with scheduling conflicts
    const availableTechnicians = [];
    for (const technician of technicians) {
      const hasConflict = await this.hasSchedulingConflict(technician._id, requestDate);
      if (!hasConflict) {
        availableTechnicians.push(technician);
      }
    }
    
    return availableTechnicians;
  }
  
  /**
   * Calculate comprehensive match score for a technician
   */
  async calculateMatchScore(technician, criteria) {
    const { service, location, scheduledDate, urgency, customerBudget } = criteria;
    
    const factors = {};
    
    // 1. Distance Factor (25% weight)
    const distance = await LocationService.calculateDistance(
      technician.currentLocation?.coordinates || technician.baseLocation?.coordinates,
      location.coordinates
    );
    factors.distance = this.calculateDistanceScore(distance);
    
    // 2. Rating Factor (20% weight)
    factors.rating = this.calculateRatingScore(technician.averageRating || 0);
    
    // 3. Specialization Factor (20% weight)
    factors.specialization = this.calculateSpecializationScore(technician, service);
    
    // 4. Availability Factor (15% weight)
    factors.availability = await this.calculateAvailabilityScore(technician._id, scheduledDate);
    
    // 5. Response Time Factor (10% weight)
    factors.responseTime = this.calculateResponseTimeScore(technician.averageResponseTime || 30);
    
    // 6. Price Factor (10% weight)
    const proposedPrice = await this.calculateProposedPrice(technician, service, urgency);
    factors.price = this.calculatePriceScore(proposedPrice, customerBudget);
    
    // Calculate weighted total score
    const weights = {
      distance: 0.25,
      rating: 0.20,
      specialization: 0.20,
      availability: 0.15,
      responseTime: 0.10,
      price: 0.10
    };
    
    const totalScore = Object.keys(factors).reduce((sum, factor) => {
      return sum + (factors[factor] * weights[factor]);
    }, 0);
    
    // Calculate estimated arrival time
    const estimatedArrival = await this.calculateEstimatedArrival(technician, location, scheduledDate);
    
    return {
      score: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
      factors,
      estimatedArrival,
      pricing: {
        proposedPrice,
        breakdown: await this.getPriceBreakdown(proposedPrice, service)
      }
    };
  }
  
  /**
   * Calculate distance-based score (closer = higher score)
   */
  calculateDistanceScore(distanceKm) {
    if (distanceKm <= 5) return 1.0;
    if (distanceKm <= 10) return 0.8;
    if (distanceKm <= 20) return 0.6;
    if (distanceKm <= 50) return 0.4;
    return 0.2;
  }
  
  /**
   * Calculate rating-based score
   */
  calculateRatingScore(rating) {
    return Math.min(rating / 5.0, 1.0);
  }
  
  /**
   * Calculate specialization score based on technician's expertise
   */
  calculateSpecializationScore(technician, service) {
    let score = 0;
    
    // Check if technician specializes in this service category
    const hasSpecialization = technician.specializations.some(
      spec => spec._id.toString() === service.category._id.toString()
    );
    
    if (hasSpecialization) {
      score += 0.6; // Base specialization score
      
      // Bonus for experience in this category
      const categoryExperience = technician.experienceYears || 0;
      if (categoryExperience >= 5) score += 0.4;
      else if (categoryExperience >= 2) score += 0.2;
      else score += 0.1;
    } else {
      // Check for related specializations
      const hasRelated = technician.specializations.some(
        spec => service.category.relatedCategories?.includes(spec._id)
      );
      score = hasRelated ? 0.3 : 0.1;
    }
    
    return Math.min(score, 1.0);
  }
  
  /**
   * Calculate availability score based on current workload
   */
  async calculateAvailabilityScore(technicianId, scheduledDate) {
    const date = new Date(scheduledDate);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    // Count active bookings for the day
    const activeBookings = await Booking.countDocuments({
      assignedTechnician: technicianId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['assigned', 'in_progress'] }
    });
    
    // Score based on workload
    if (activeBookings === 0) return 1.0;
    if (activeBookings === 1) return 0.8;
    if (activeBookings === 2) return 0.6;
    if (activeBookings === 3) return 0.4;
    return 0.2;
  }
  
  /**
   * Calculate response time score (faster = higher score)
   */
  calculateResponseTimeScore(averageResponseMinutes) {
    if (averageResponseMinutes <= 5) return 1.0;
    if (averageResponseMinutes <= 15) return 0.8;
    if (averageResponseMinutes <= 30) return 0.6;
    if (averageResponseMinutes <= 60) return 0.4;
    return 0.2;
  }
  
  /**
   * Calculate price competitiveness score
   */
  calculatePriceScore(proposedPrice, customerBudget) {
    if (!customerBudget) return 0.8; // Neutral score if no budget specified
    
    const priceRatio = proposedPrice / customerBudget;
    
    if (priceRatio <= 0.8) return 1.0;      // 20% under budget
    if (priceRatio <= 0.9) return 0.9;      // 10% under budget
    if (priceRatio <= 1.0) return 0.8;      // Within budget
    if (priceRatio <= 1.1) return 0.6;      // 10% over budget
    if (priceRatio <= 1.2) return 0.4;      // 20% over budget
    return 0.2;                              // More than 20% over budget
  }
  
  /**
   * Calculate proposed price for service
   */
  async calculateProposedPrice(technician, service, urgency) {
    let basePrice = service.basePrice || 1000; // Default base price in KES
    
    // Apply technician's rate modifier
    if (technician.rateModifier) {
      basePrice *= technician.rateModifier;
    }
    
    // Apply urgency multiplier
    const urgencyMultipliers = {
      'low': 0.9,
      'normal': 1.0,
      'high': 1.2,
      'urgent': 1.5
    };
    
    basePrice *= urgencyMultipliers[urgency] || 1.0;
    
    // Apply technician's premium based on rating
    if (technician.averageRating >= 4.5) {
      basePrice *= 1.1; // 10% premium for top-rated technicians
    } else if (technician.averageRating >= 4.0) {
      basePrice *= 1.05; // 5% premium for well-rated technicians
    }
    
    return Math.round(basePrice);
  }
  
  /**
   * Calculate estimated arrival time
   */
  async calculateEstimatedArrival(technician, location, scheduledDate) {
    const distance = await LocationService.calculateDistance(
      technician.currentLocation?.coordinates || technician.baseLocation?.coordinates,
      location.coordinates
    );
    
    // Average travel speed in Nairobi: 20 km/h during peak, 40 km/h off-peak
    const averageSpeed = this.isRushHour(scheduledDate) ? 20 : 40;
    const travelTimeHours = distance / averageSpeed;
    const travelTimeMinutes = Math.round(travelTimeHours * 60);
    
    // Add buffer time for preparation
    const bufferTime = 15; // 15 minutes
    
    const estimatedArrival = new Date(scheduledDate);
    estimatedArrival.setMinutes(estimatedArrival.getMinutes() + travelTimeMinutes + bufferTime);
    
    return estimatedArrival;
  }
  
  /**
   * Get price breakdown
   */
  async getPriceBreakdown(totalPrice, service) {
    return {
      serviceCharge: Math.round(totalPrice * 0.85),
      platformFee: Math.round(totalPrice * 0.10),
      taxes: Math.round(totalPrice * 0.05),
      total: totalPrice
    };
  }
  
  /**
   * Check if technician has scheduling conflict
   */
  async hasSchedulingConflict(technicianId, scheduledDate) {
    const requestDate = new Date(scheduledDate);
    const buffer = 2 * 60 * 60 * 1000; // 2 hour buffer
    
    const conflicts = await Booking.find({
      assignedTechnician: technicianId,
      status: { $in: ['assigned', 'in_progress'] },
      scheduledDate: {
        $gte: new Date(requestDate.getTime() - buffer),
        $lte: new Date(requestDate.getTime() + buffer)
      }
    });
    
    return conflicts.length > 0;
  }
  
  /**
   * Check if time is during rush hour
   */
  isRushHour(date) {
    const hour = new Date(date).getHours();
    return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  }
  
  /**
   * Get alternative technicians if primary matches are unavailable
   */
  async getAlternativeTechnicians(criteria, excludeIds = []) {
    const expandedCriteria = {
      ...criteria,
      preferences: {
        ...criteria.preferences,
        maxDistance: (criteria.preferences.maxDistance || 10) * 2, // Double the search radius
        minRating: Math.max((criteria.preferences.minRating || 0) - 0.5, 0) // Lower rating requirement
      }
    };
    
    const alternatives = await this.findOptimalTechnicians(expandedCriteria);
    
    // Filter out already excluded technicians
    return alternatives.filter(match => 
      !excludeIds.includes(match.technician._id.toString())
    );
  }
  
  /**
   * Update technician performance metrics after booking completion
   */
  async updateTechnicianMetrics(technicianId, bookingData) {
    try {
      const technician = await Technician.findById(technicianId);
      if (!technician) return;
      
      // Update response time
      if (bookingData.responseTime) {
        const currentAvg = technician.averageResponseTime || 30;
        const newAvg = (currentAvg + bookingData.responseTime) / 2;
        technician.averageResponseTime = Math.round(newAvg);
      }
      
      // Update completion rate
      technician.totalBookings = (technician.totalBookings || 0) + 1;
      if (bookingData.completed) {
        technician.completedBookings = (technician.completedBookings || 0) + 1;
      }
      
      technician.completionRate = (technician.completedBookings / technician.totalBookings) * 100;
      
      await technician.save();
    } catch (error) {
      console.error('Update technician metrics error:', error);
    }
  }
}

module.exports = new TechnicianMatchingService();
