/**
 * Pricing Service
 * 
 * This service handles dynamic pricing calculations based on:
 * - Service type and complexity
 * - Time of day and demand
 * - Location and distance
 * - Technician experience
 * - Urgency level
 * - Market conditions
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Base pricing configuration
const BASE_PRICES = {
  plumbing: {
    basic: 50,      // Basic repairs
    moderate: 80,   // Pipe installations
    complex: 120    // Major installations
  },
  electrical: {
    basic: 60,      // Switch replacements
    moderate: 90,   // Outlet installations
    complex: 150    // Panel upgrades
  },
  hvac: {
    basic: 70,      // Filter changes
    moderate: 120,  // Tune-ups
    complex: 200    // System installations
  },
  appliance: {
    basic: 45,      // Small appliance repair
    moderate: 75,   // Washing machine repair
    complex: 110    // Refrigerator repair
  },
  handyman: {
    basic: 40,      // Picture hanging
    moderate: 65,   // Furniture assembly
    complex: 90     // Deck repairs
  },
  roofing: {
    basic: 80,      // Minor repairs
    moderate: 150,  // Shingle replacement
    complex: 300    // Major repairs
  },
  painting: {
    basic: 35,      // Touch-ups
    moderate: 60,   // Room painting
    complex: 100    // Exterior painting
  },
  flooring: {
    basic: 55,      // Minor repairs
    moderate: 95,   // Tile replacement
    complex: 140    // Floor installation
  },
  carpentry: {
    basic: 50,      // Small repairs
    moderate: 85,   // Cabinet installation
    complex: 130    // Custom work
  },
  locksmith: {
    basic: 60,      // Lock changes
    moderate: 90,   // Rekey service
    complex: 150    // Security systems
  }
};

// Time-based multipliers
const TIME_MULTIPLIERS = {
  peak: {
    // 7 AM - 9 AM and 5 PM - 8 PM weekdays
    multiplier: 1.2,
    description: 'Peak hours'
  },
  normal: {
    // 9 AM - 5 PM weekdays
    multiplier: 1.0,
    description: 'Normal hours'
  },
  evening: {
    // 8 PM - 11 PM
    multiplier: 1.15,
    description: 'Evening hours'
  },
  late_night: {
    // 11 PM - 7 AM
    multiplier: 1.5,
    description: 'Late night hours'
  },
  weekend: {
    // Saturdays and Sundays
    multiplier: 1.1,
    description: 'Weekend hours'
  },
  holiday: {
    // National holidays
    multiplier: 1.3,
    description: 'Holiday hours'
  }
};

// Urgency multipliers
const URGENCY_MULTIPLIERS = {
  low: 1.0,
  normal: 1.0,
  high: 1.25,
  emergency: 1.8
};

// Distance calculation (per km)
const DISTANCE_RATES = {
  base_distance: 10, // Free up to 10km
  rate_per_km: 2.5   // $2.50 per km after base
};

// Experience multipliers for technicians
const EXPERIENCE_MULTIPLIERS = {
  novice: 0.9,       // 0-1 years
  intermediate: 1.0,  // 1-3 years
  experienced: 1.1,   // 3-5 years
  expert: 1.2,       // 5+ years
  master: 1.3        // 10+ years with high ratings
};

/**
 * Calculate base price for a service
 */
const calculateBasePrice = (serviceType, description = '', estimatedHours = 1) => {
  const servicePrices = BASE_PRICES[serviceType.toLowerCase()];
  if (!servicePrices) {
    throw new Error(`Unknown service type: ${serviceType}`);
  }

  // Determine complexity based on description and estimated hours
  let complexity = 'basic';
  
  if (estimatedHours > 3 || description.toLowerCase().includes('major') || 
      description.toLowerCase().includes('installation') ||
      description.toLowerCase().includes('replacement')) {
    complexity = 'complex';
  } else if (estimatedHours > 1.5 || description.toLowerCase().includes('repair') ||
             description.toLowerCase().includes('fix')) {
    complexity = 'moderate';
  }

  return servicePrices[complexity] * estimatedHours;
};

/**
 * Get time multiplier based on current time
 */
const getTimeMultiplier = (requestTime = new Date()) => {
  const hour = requestTime.getHours();
  const day = requestTime.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6;

  // Check for holidays (simplified - you can expand this)
  const holidays = [
    '2024-01-01', // New Year
    '2024-12-25', // Christmas
    // Add more holidays as needed
  ];
  const dateString = requestTime.toISOString().split('T')[0];
  const isHoliday = holidays.includes(dateString);

  if (isHoliday) {
    return TIME_MULTIPLIERS.holiday;
  }

  if (isWeekend) {
    return TIME_MULTIPLIERS.weekend;
  }

  // Weekday time calculations
  if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 20)) {
    return TIME_MULTIPLIERS.peak;
  } else if (hour >= 23 || hour < 7) {
    return TIME_MULTIPLIERS.late_night;
  } else if (hour >= 20 && hour < 23) {
    return TIME_MULTIPLIERS.evening;
  } else {
    return TIME_MULTIPLIERS.normal;
  }
};

/**
 * Calculate distance surcharge
 */
const calculateDistanceSurcharge = (distanceKm) => {
  if (distanceKm <= DISTANCE_RATES.base_distance) {
    return 0;
  }
  
  const extraDistance = distanceKm - DISTANCE_RATES.base_distance;
  return extraDistance * DISTANCE_RATES.rate_per_km;
};

/**
 * Get technician experience multiplier
 */
const getTechnicianMultiplier = (technician) => {
  if (!technician || !technician.technicianProfile) {
    return EXPERIENCE_MULTIPLIERS.intermediate;
  }

  const profile = technician.technicianProfile;
  const yearsExperience = profile.yearsExperience || 0;
  const rating = profile.rating || 3.0;
  const completedJobs = profile.completedJobs || 0;

  // Master level: 10+ years, 4.8+ rating, 500+ jobs
  if (yearsExperience >= 10 && rating >= 4.8 && completedJobs >= 500) {
    return EXPERIENCE_MULTIPLIERS.master;
  }
  
  // Expert level: 5+ years, 4.5+ rating, 200+ jobs
  if (yearsExperience >= 5 && rating >= 4.5 && completedJobs >= 200) {
    return EXPERIENCE_MULTIPLIERS.expert;
  }
  
  // Experienced: 3+ years, 4.0+ rating, 100+ jobs
  if (yearsExperience >= 3 && rating >= 4.0 && completedJobs >= 100) {
    return EXPERIENCE_MULTIPLIERS.experienced;
  }
  
  // Novice: Less than 1 year or low rating
  if (yearsExperience < 1 || rating < 3.5) {
    return EXPERIENCE_MULTIPLIERS.novice;
  }
  
  // Default to intermediate
  return EXPERIENCE_MULTIPLIERS.intermediate;
};

/**
 * Calculate demand multiplier based on current bookings
 */
const calculateDemandMultiplier = async (serviceType, location, timeSlot) => {
  try {
    const startTime = new Date(timeSlot);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hour window

    // Count bookings in the area and time slot
    const nearbyBookings = await Booking.countDocuments({
      serviceType,
      createdAt: {
        $gte: startTime,
        $lte: endTime
      },
      status: { $in: ['pending', 'assigned', 'in_progress'] }
    });

    // Count available technicians in the area
    const availableTechnicians = await User.countDocuments({
      role: 'technician',
      'technicianProfile.specializations': serviceType,
      'technicianProfile.isAvailable': true,
      'location.coordinates': {
        $near: {
          $geometry: location,
          $maxDistance: 20000 // 20km radius
        }
      }
    });

    // Calculate demand ratio
    const demandRatio = availableTechnicians > 0 ? nearbyBookings / availableTechnicians : 2;

    // Return multiplier based on demand
    if (demandRatio >= 2) return 1.4;      // Very high demand
    if (demandRatio >= 1.5) return 1.25;   // High demand
    if (demandRatio >= 1) return 1.15;     // Moderate demand
    if (demandRatio >= 0.5) return 1.0;    // Normal demand
    return 0.95; // Low demand - slight discount
  } catch (error) {
    console.error('Error calculating demand multiplier:', error);
    return 1.0; // Default to no adjustment
  }
};

/**
 * Main pricing calculation function
 */
const calculateServicePrice = async (serviceRequest) => {
  try {
    const {
      serviceType,
      description,
      estimatedHours = 1,
      urgency = 'normal',
      location,
      technicianId,
      requestTime = new Date(),
      distanceKm = 0
    } = serviceRequest;

    // 1. Calculate base price
    const basePrice = calculateBasePrice(serviceType, description, estimatedHours);

    // 2. Get time multiplier
    const timeMultiplier = getTimeMultiplier(requestTime);

    // 3. Get urgency multiplier
    const urgencyMultiplier = URGENCY_MULTIPLIERS[urgency] || 1.0;

    // 4. Calculate distance surcharge
    const distanceSurcharge = calculateDistanceSurcharge(distanceKm);

    // 5. Get technician multiplier (if specific technician requested)
    let technicianMultiplier = 1.0;
    if (technicianId) {
      const technician = await User.findById(technicianId);
      technicianMultiplier = getTechnicianMultiplier(technician);
    }

    // 6. Calculate demand multiplier
    const demandMultiplier = await calculateDemandMultiplier(
      serviceType, 
      location, 
      requestTime
    );

    // 7. Calculate final price
    const servicePrice = basePrice * timeMultiplier.multiplier * urgencyMultiplier * 
                        technicianMultiplier * demandMultiplier;
    
    const totalPrice = servicePrice + distanceSurcharge;

    // 8. Apply minimum price floor
    const minimumPrice = 30;
    const finalPrice = Math.max(totalPrice, minimumPrice);

    return {
      basePrice: Math.round(basePrice * 100) / 100,
      servicePrice: Math.round(servicePrice * 100) / 100,
      distanceSurcharge: Math.round(distanceSurcharge * 100) / 100,
      totalPrice: Math.round(finalPrice * 100) / 100,
      breakdown: {
        timeMultiplier: {
          factor: timeMultiplier.multiplier,
          description: timeMultiplier.description
        },
        urgencyMultiplier: {
          factor: urgencyMultiplier,
          description: `${urgency} priority`
        },
        technicianMultiplier: {
          factor: technicianMultiplier,
          description: technicianId ? 'Specific technician requested' : 'Standard rate'
        },
        demandMultiplier: {
          factor: Math.round(demandMultiplier * 100) / 100,
          description: 'Current demand in area'
        },
        distanceRate: {
          amount: distanceSurcharge,
          description: distanceKm > DISTANCE_RATES.base_distance ? 
            `${distanceKm}km distance` : 'Within free distance'
        }
      },
      estimatedDuration: estimatedHours,
      priceRange: {
        min: Math.round(finalPrice * 0.9 * 100) / 100,
        max: Math.round(finalPrice * 1.1 * 100) / 100
      }
    };
  } catch (error) {
    console.error('Price calculation error:', error);
    throw new Error('Unable to calculate service price');
  }
};

/**
 * Get pricing estimates for all service types
 */
const getAllServicePricing = async (location, requestTime = new Date()) => {
  const pricing = {};
  
  for (const [serviceType, prices] of Object.entries(BASE_PRICES)) {
    const timeMultiplier = getTimeMultiplier(requestTime);
    const demandMultiplier = await calculateDemandMultiplier(
      serviceType, 
      location, 
      requestTime
    );

    pricing[serviceType] = {
      basic: {
        price: Math.round(prices.basic * timeMultiplier.multiplier * demandMultiplier),
        duration: '1-2 hours'
      },
      moderate: {
        price: Math.round(prices.moderate * timeMultiplier.multiplier * demandMultiplier),
        duration: '2-4 hours'
      },
      complex: {
        price: Math.round(prices.complex * timeMultiplier.multiplier * demandMultiplier),
        duration: '4+ hours'
      }
    };
  }

  return {
    pricing,
    currentMultipliers: {
      time: timeMultiplier,
      demand: Math.round(demandMultiplier * 100) / 100
    },
    lastUpdated: new Date()
  };
};

/**
 * Calculate technician earnings
 */
const calculateTechnicianEarnings = (totalPrice, technicianRating = 4.0, completedJobs = 0) => {
  // Base commission rate (technician keeps this percentage)
  let commissionRate = 0.70; // 70% base rate

  // Bonus for high ratings
  if (technicianRating >= 4.8) {
    commissionRate += 0.05; // 75% for excellent technicians
  } else if (technicianRating >= 4.5) {
    commissionRate += 0.03; // 73% for great technicians
  }

  // Bonus for experienced technicians
  if (completedJobs >= 500) {
    commissionRate += 0.02; // Additional 2% for very experienced
  } else if (completedJobs >= 100) {
    commissionRate += 0.01; // Additional 1% for experienced
  }

  // Cap at 80%
  commissionRate = Math.min(commissionRate, 0.80);

  const technicianEarning = totalPrice * commissionRate;
  const platformFee = totalPrice - technicianEarning;

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    technicianEarning: Math.round(technicianEarning * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    commissionRate: Math.round(commissionRate * 100) / 100
  };
};

module.exports = {
  calculateServicePrice,
  getAllServicePricing,
  calculateTechnicianEarnings,
  calculateBasePrice,
  getTimeMultiplier,
  calculateDistanceSurcharge,
  BASE_PRICES,
  TIME_MULTIPLIERS,
  URGENCY_MULTIPLIERS
};
