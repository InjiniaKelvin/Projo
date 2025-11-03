/**
 * Pricing Engine Service
 * 
 * Dynamic pricing algorithm that considers multiple market factors
 * to calculate optimal service pricing in real-time.
 */

const { Booking } = require('../models');
const LocationService = require('./LocationService');

class PricingEngine {
 /**
 * Calculate service price with dynamic factors
 * @param {Object} criteria - Pricing criteria
 * @returns {Object} Pricing details with breakdown
 */
 async calculateServicePrice(criteria) {
 const {
 service,
 location,
 scheduledDate,
 urgency = 'normal',
 userHistory = [],
 marketDemand = { level: 'medium', count: 0 }
 } = criteria;
 
 try {
 let basePrice = service.basePrice || this.getDefaultPrice(service.category.name);
 
 // Calculate all dynamic factors
 const factors = await this.calculatePricingFactors({
 service,
 location,
 scheduledDate,
 urgency,
 userHistory,
 marketDemand
 });
 
 // Apply factors to base price
 let finalPrice = basePrice;
 Object.values(factors).forEach(factor => {
 finalPrice *= factor.multiplier;
 });
 
 // Round to nearest 50 KES
 finalPrice = Math.round(finalPrice / 50) * 50;
 
 // Ensure minimum price
 const minimumPrice = basePrice * 0.7; // Never go below 70% of base price
 finalPrice = Math.max(finalPrice, minimumPrice);
 
 // Generate price breakdown
 const breakdown = this.generatePriceBreakdown(basePrice, finalPrice, factors);
 
 return {
 basePrice,
 factors,
 finalPrice,
 breakdown,
 priceRange: {
 min: Math.round(finalPrice * 0.9),
 max: Math.round(finalPrice * 1.1)
 },
 calculatedAt: new Date(),
 validUntil: new Date(Date.now() + 30 * 60 * 1000) // Valid for 30 minutes
 };
 
 } catch (error) {
 console.error('Calculate service price error:', error);
 return {
 basePrice: service.basePrice || 1000,
 finalPrice: service.basePrice || 1000,
 factors: {},
 breakdown: {},
 error: error.message
 };
 }
 }
 
 /**
 * Calculate all pricing factors
 */
 async calculatePricingFactors(criteria) {
 const { service, location, scheduledDate, urgency, userHistory, marketDemand } = criteria;
 
 const factors = {};
 
 // 1. Time-based factors
 factors.timeOfDay = await this.getTimeOfDayFactor(scheduledDate);
 factors.dayOfWeek = this.getDayOfWeekFactor(scheduledDate);
 factors.seasonality = await this.getSeasonalityFactor(scheduledDate, service.category);
 
 // 2. Demand-based factors
 factors.marketDemand = this.getMarketDemandFactor(marketDemand);
 factors.locationDemand = await this.getLocationDemandFactor(location, scheduledDate);
 
 // 3. Urgency and priority factors
 factors.urgency = this.getUrgencyFactor(urgency);
 factors.advanceBooking = this.getAdvanceBookingFactor(scheduledDate);
 
 // 4. Location-based factors
 factors.serviceZone = await this.getServiceZoneFactor(location);
 factors.accessibility = await this.getAccessibilityFactor(location);
 
 // 5. Weather factors
 factors.weather = await this.getWeatherFactor(location, scheduledDate);
 
 // 6. Customer factors
 factors.customerLoyalty = this.getCustomerLoyaltyFactor(userHistory);
 factors.customerSegment = this.getCustomerSegmentFactor(userHistory);
 
 // 7. Market competition factors
 factors.competition = await this.getCompetitionFactor(service, location);
 
 return factors;
 }
 
 /**
 * Time of day pricing factor
 */
 async getTimeOfDayFactor(scheduledDate) {
 const hour = new Date(scheduledDate).getHours();
 
 let multiplier, description;
 
 if (hour >= 6 && hour < 8) {
 multiplier = 1.3; // Early morning premium
 description = 'Early morning service';
 } else if (hour >= 8 && hour < 12) {
 multiplier = 1.0; // Normal morning rates
 description = 'Morning service';
 } else if (hour >= 12 && hour < 14) {
 multiplier = 1.1; // Lunch time slight premium
 description = 'Lunch time service';
 } else if (hour >= 14 && hour < 17) {
 multiplier = 1.0; // Normal afternoon rates
 description = 'Afternoon service';
 } else if (hour >= 17 && hour < 20) {
 multiplier = 1.2; // Evening premium
 description = 'Evening service';
 } else if (hour >= 20 && hour < 22) {
 multiplier = 1.4; // Night premium
 description = 'Night service';
 } else {
 multiplier = 1.8; // Late night premium
 description = 'Late night/emergency service';
 }
 
 return { multiplier, description, impact: 'Time-based pricing' };
 }
 
 /**
 * Day of week pricing factor
 */
 getDayOfWeekFactor(scheduledDate) {
 const dayOfWeek = new Date(scheduledDate).getDay();
 
 let multiplier, description;
 
 if (dayOfWeek === 0) { // Sunday
 multiplier = 1.3;
 description = 'Sunday premium';
 } else if (dayOfWeek === 6) { // Saturday
 multiplier = 1.2;
 description = 'Saturday premium';
 } else if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdays
 multiplier = 1.0;
 description = 'Weekday rate';
 }
 
 return { multiplier, description, impact: 'Day-based pricing' };
 }
 
 /**
 * Seasonal pricing factor
 */
 async getSeasonalityFactor(scheduledDate, serviceCategory) {
 const month = new Date(scheduledDate).getMonth() + 1;
 
 // Different services have different seasonal patterns
 const seasonalPatterns = {
 'electrical': {
 'dry_season': { months: [1, 2, 12], multiplier: 1.0 },
 'rainy_season': { months: [3, 4, 5, 10, 11], multiplier: 1.2 },
 'peak_rain': { months: [6, 7, 8, 9], multiplier: 1.3 }
 },
 'plumbing': {
 'dry_season': { months: [1, 2, 12], multiplier: 1.1 },
 'rainy_season': { months: [3, 4, 5, 10, 11], multiplier: 1.0 },
 'peak_rain': { months: [6, 7, 8, 9], multiplier: 0.9 }
 },
 'hvac': {
 'cool_months': { months: [6, 7, 8], multiplier: 0.9 },
 'hot_months': { months: [1, 2, 3, 12], multiplier: 1.2 },
 'moderate': { months: [4, 5, 9, 10, 11], multiplier: 1.0 }
 }
 };
 
 const categoryName = serviceCategory.name.toLowerCase();
 const pattern = seasonalPatterns[categoryName] || seasonalPatterns['electrical'];
 
 for (const [season, data] of Object.entries(pattern)) {
 if (data.months.includes(month)) {
 return {
 multiplier: data.multiplier,
 description: `${season.replace('_', ' ')} adjustment`,
 impact: 'Seasonal demand variation'
 };
 }
 }
 
 return { multiplier: 1.0, description: 'No seasonal adjustment', impact: 'Seasonal factor' };
 }
 
 /**
 * Market demand pricing factor
 */
 getMarketDemandFactor(marketDemand) {
 const { level, count } = marketDemand;
 
 let multiplier, description;
 
 switch (level) {
 case 'low':
 multiplier = 0.9;
 description = 'Low demand discount';
 break;
 case 'medium':
 multiplier = 1.0;
 description = 'Normal market demand';
 break;
 case 'high':
 multiplier = 1.3;
 description = 'High demand premium';
 break;
 case 'very_high':
 multiplier = 1.5;
 description = 'Peak demand premium';
 break;
 default:
 multiplier = 1.0;
 description = 'Standard market rate';
 }
 
 return { multiplier, description, impact: `${count} concurrent requests` };
 }
 
 /**
 * Location demand pricing factor
 */
 async getLocationDemandFactor(location, scheduledDate) {
 const zone = await LocationService.getServiceZone(location.coordinates);
 
 // High-end areas typically have higher pricing
 const zonePricing = {
 'westlands': 1.3,
 'karen': 1.4,
 'kileleshwa': 1.2,
 'lavington': 1.3,
 'upperhill': 1.2,
 'downtown': 1.0,
 'eastlands': 0.9,
 'industrial': 0.95,
 'residential': 1.0
 };
 
 const multiplier = zonePricing[zone.toLowerCase()] || 1.0;
 
 return {
 multiplier,
 description: `${zone} area pricing`,
 impact: 'Location-based adjustment'
 };
 }
 
 /**
 * Urgency pricing factor
 */
 getUrgencyFactor(urgency) {
 const urgencyMultipliers = {
 'low': { multiplier: 0.9, description: 'Flexible timing discount' },
 'normal': { multiplier: 1.0, description: 'Standard urgency' },
 'high': { multiplier: 1.2, description: 'Priority service' },
 'urgent': { multiplier: 1.5, description: 'Emergency service premium' },
 'emergency': { multiplier: 2.0, description: 'Emergency response premium' }
 };
 
 const factor = urgencyMultipliers[urgency] || urgencyMultipliers['normal'];
 return { ...factor, impact: 'Service urgency level' };
 }
 
 /**
 * Advance booking pricing factor
 */
 getAdvanceBookingFactor(scheduledDate) {
 const hoursInAdvance = (new Date(scheduledDate) - new Date()) / (1000 * 60 * 60);
 
 let multiplier, description;
 
 if (hoursInAdvance < 2) {
 multiplier = 1.3;
 description = 'Same-day booking premium';
 } else if (hoursInAdvance < 24) {
 multiplier = 1.1;
 description = 'Next-day booking';
 } else if (hoursInAdvance < 48) {
 multiplier = 1.0;
 description = 'Standard advance booking';
 } else if (hoursInAdvance < 168) { // 1 week
 multiplier = 0.95;
 description = 'Early booking discount';
 } else {
 multiplier = 0.9;
 description = 'Advanced planning discount';
 }
 
 return { multiplier, description, impact: 'Booking lead time' };
 }
 
 /**
 * Service zone pricing factor
 */
 async getServiceZoneFactor(location) {
 const zone = await LocationService.getServiceZone(location.coordinates);
 
 // Different zones have different operational costs
 const zoneFactors = {
 'central': 1.0,
 'suburban': 1.1,
 'remote': 1.3,
 'industrial': 0.95,
 'commercial': 1.05
 };
 
 const multiplier = zoneFactors[zone.toLowerCase()] || 1.0;
 
 return {
 multiplier,
 description: `${zone} zone operations`,
 impact: 'Operational zone costs'
 };
 }
 
 /**
 * Accessibility pricing factor
 */
 async getAccessibilityFactor(location) {
 // This could be enhanced with real accessibility data
 let multiplier = 1.0;
 let description = 'Standard accessibility';
 
 // Check for accessibility indicators in location data
 if (location.accessInstructions) {
 const instructions = location.accessInstructions.toLowerCase();
 
 if (instructions.includes('difficult') || instructions.includes('limited access')) {
 multiplier = 1.2;
 description = 'Limited access adjustment';
 } else if (instructions.includes('high floor') || instructions.includes('stairs')) {
 multiplier = 1.1;
 description = 'Multi-level access adjustment';
 } else if (instructions.includes('easy') || instructions.includes('ground floor')) {
 multiplier = 0.95;
 description = 'Easy access discount';
 }
 }
 
 return { multiplier, description, impact: 'Site accessibility' };
 }
 
 /**
 * Weather pricing factor
 */
 async getWeatherFactor(location, scheduledDate) {
 try {
 // This would integrate with a weather API
 // For now, we'll use a simplified approach
 const month = new Date(scheduledDate).getMonth() + 1;
 const isRainySeason = [3, 4, 5, 10, 11].includes(month);
 const isPeakRain = [6, 7, 8, 9].includes(month);
 
 let multiplier, description;
 
 if (isPeakRain) {
 multiplier = 1.15;
 description = 'Rainy season adjustment';
 } else if (isRainySeason) {
 multiplier = 1.05;
 description = 'Weather consideration';
 } else {
 multiplier = 1.0;
 description = 'Good weather conditions';
 }
 
 return { multiplier, description, impact: 'Weather conditions' };
 
 } catch (_error) {
 return { multiplier: 1.0, description: 'Weather data unavailable', impact: 'Weather factor' };
 }
 }
 
 /**
 * Customer loyalty pricing factor
 */
 getCustomerLoyaltyFactor(userHistory) {
 const completedBookings = userHistory.filter(booking => booking.status === 'completed').length;
 
 let multiplier, description;
 
 if (completedBookings === 0) {
 multiplier = 1.0;
 description = 'New customer rate';
 } else if (completedBookings < 3) {
 multiplier = 0.98;
 description = 'Return customer discount';
 } else if (completedBookings < 10) {
 multiplier = 0.95;
 description = 'Loyal customer discount';
 } else {
 multiplier = 0.9;
 description = 'VIP customer discount';
 }
 
 return { multiplier, description, impact: `${completedBookings} previous bookings` };
 }
 
 /**
 * Customer segment pricing factor
 */
 getCustomerSegmentFactor(userHistory) {
 if (userHistory.length === 0) {
 return { multiplier: 1.0, description: 'New customer', impact: 'Customer segmentation' };
 }
 
 const totalSpent = userHistory.reduce((sum, booking) => sum + (booking.pricing?.finalPrice || 0), 0);
 const averageSpending = totalSpent / userHistory.length;
 
 let multiplier, description;
 
 if (averageSpending >= 5000) {
 multiplier = 1.0; // Premium customers pay standard rates
 description = 'Premium customer';
 } else if (averageSpending >= 2000) {
 multiplier = 0.98;
 description = 'Regular customer';
 } else {
 multiplier = 0.95;
 description = 'Budget-conscious customer';
 }
 
 return { multiplier, description, impact: `Avg spend: KES ${Math.round(averageSpending)}` };
 }
 
 /**
 * Competition pricing factor
 */
 async getCompetitionFactor(service, location) {
 // This could integrate with competitor pricing data
 // For now, use a simplified market position approach
 
 const marketPosition = service.marketPosition || 'standard';
 
 const positionFactors = {
 'premium': 1.1,
 'standard': 1.0,
 'budget': 0.9
 };
 
 const multiplier = positionFactors[marketPosition] || 1.0;
 
 return {
 multiplier,
 description: `${marketPosition} market positioning`,
 impact: 'Competitive positioning'
 };
 }
 
 /**
 * Generate detailed price breakdown
 */
 generatePriceBreakdown(basePrice, finalPrice, factors) {
 const breakdown = {
 basePrice,
 adjustments: {},
 subtotal: finalPrice,
 fees: {
 platformFee: Math.round(finalPrice * 0.05), // 5% platform fee
 processingFee: 50, // Flat processing fee
 taxes: Math.round(finalPrice * 0.08) // 8% VAT
 }
 };
 
 // Calculate factor impacts
 Object.entries(factors).forEach(([factorName, factor]) => {
 const impact = Math.round(basePrice * (factor.multiplier - 1));
 if (impact !== 0) {
 breakdown.adjustments[factorName] = {
 description: factor.description,
 amount: impact,
 multiplier: factor.multiplier
 };
 }
 });
 
 breakdown.total = breakdown.subtotal + 
 breakdown.fees.platformFee + 
 breakdown.fees.processingFee + 
 breakdown.fees.taxes;
 
 return breakdown;
 }
 
 /**
 * Get default price for service category
 */
 getDefaultPrice(categoryName) {
 const defaultPrices = {
 'electrical': 1500,
 'plumbing': 1200,
 'hvac': 2000,
 'appliance_repair': 1800,
 'carpentry': 1600,
 'painting': 1000,
 'cleaning': 800,
 'gardening': 600,
 'security': 2500,
 'general_maintenance': 1000
 };
 
 return defaultPrices[categoryName.toLowerCase()] || 1000;
 }
 
 /**
 * Update pricing model based on market feedback
 */
 async updatePricingModel(bookingData) {
 // This would analyze completed bookings to optimize pricing
 // Implementation would involve machine learning algorithms
 console.log('Pricing model update with booking data:', bookingData);
 }
 
 /**
 * Get pricing recommendations for service providers
 */
 async getPricingRecommendations(serviceId, location, timeframe = '30d') {
 try {
 const bookings = await Booking.find({
 serviceId,
 'location.zone': await LocationService.getServiceZone(location.coordinates),
 createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
 status: 'completed'
 });
 
 if (bookings.length === 0) {
 return { message: 'Insufficient data for recommendations' };
 }
 
 const prices = bookings.map(b => b.pricing.finalPrice);
 const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
 const minPrice = Math.min(...prices);
 const maxPrice = Math.max(...prices);
 
 return {
 averagePrice: Math.round(avgPrice),
 priceRange: { min: minPrice, max: maxPrice },
 bookingVolume: bookings.length,
 recommendations: {
 competitive: Math.round(avgPrice * 0.95),
 premium: Math.round(avgPrice * 1.1),
 budget: Math.round(avgPrice * 0.85)
 }
 };
 
 } catch (error) {
 console.error('Get pricing recommendations error:', error);
 return { error: error.message };
 }
 }
}

module.exports = new PricingEngine();
