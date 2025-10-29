/**
 * Pricing Engine - Production Ready
 * 
 * Dynamic pricing calculations for QuickFix services
 * Handles base pricing, distance multipliers, urgency fees, platform fees
 * No mock data - configurable pricing rules
 */

class PricingEngine {
 constructor() {
 // Base service prices (KES)
 this.basePrices = {
 plumbing: 500,
 electrical: 600,
 carpentry: 550,
 painting: 450,
 cleaning: 400,
 appliance_repair: 700,
 hvac: 800,
 locksmith: 600,
 pest_control: 650,
 general_handyman: 400
 };

 // Distance pricing (per km beyond free distance)
 this.distancePricing = {
 freeDistance: 5, // km
 pricePerKm: 50 // KES per km
 };

 // Urgency multipliers
 this.urgencyMultipliers = {
 standard: 1.0, // Normal booking
 urgent: 1.3, // Within 2 hours
 emergency: 1.5 // Immediate (within 30 mins)
 };

 // Platform fee (percentage)
 this.platformFeePercentage = 0.15; // 15%

 // Time-based multipliers
 this.timeMultipliers = {
 weekday: {
 normal: 1.0, // 8 AM - 6 PM
 evening: 1.2, // 6 PM - 10 PM
 night: 1.5 // 10 PM - 8 AM
 },
 weekend: {
 normal: 1.15,
 evening: 1.3,
 night: 1.6
 }
 };

 // Minimum and maximum prices
 this.minPrice = 200; // KES
 this.maxPrice = 50000; // KES
 }

 /**
 * CALCULATE SERVICE PRICE
 * Main pricing calculation method
 * @param {Object} params
 * @param {string} params.serviceType - Type of service
 * @param {number} params.distance - Distance in km
 * @param {string} params.urgency - 'standard', 'urgent', 'emergency'
 * @param {Date} params.scheduledTime - When service is scheduled
 * @param {number} params.estimatedHours - Estimated service duration
 * @param {Object} params.additionalParams - Extra parameters
 */
 calculateServicePrice(params) {
 const {
 serviceType,
 distance = 0,
 urgency = 'standard',
 scheduledTime = new Date(),
 estimatedHours = 1,
 additionalParams = {}
 } = params;

 // 1. Get base price
 const basePrice = this.getBasePrice(serviceType);

 // 2. Calculate distance fee
 const distanceFee = this.calculateDistanceFee(distance);

 // 3. Apply urgency multiplier
 const urgencyMultiplier = this.getUrgencyMultiplier(urgency);

 // 4. Apply time-based multiplier
 const timeMultiplier = this.getTimeMultiplier(scheduledTime);

 // 5. Calculate labor cost based on hours
 const laborCost = basePrice * estimatedHours;

 // 6. Calculate subtotal
 const subtotal = (laborCost + distanceFee) * urgencyMultiplier * timeMultiplier;

 // 7. Calculate platform fee
 const platformFee = this.calculatePlatformFee(subtotal);

 // 8. Calculate total
 let total = subtotal + platformFee;

 // 9. Apply min/max limits
 total = Math.max(this.minPrice, Math.min(this.maxPrice, total));

 // 10. Round to nearest 10 KES
 total = Math.round(total / 10) * 10;

 return {
 basePrice,
 laborCost,
 distanceFee,
 urgencyMultiplier,
 timeMultiplier,
 subtotal,
 platformFee,
 total,
 breakdown: {
 basePrice: `KES ${basePrice}`,
 estimatedHours,
 laborCost: `KES ${Math.round(laborCost)}`,
 distanceFee: `KES ${distanceFee}`,
 urgencyCharge: `${(urgencyMultiplier - 1) * 100}%`,
 timeCharge: `${(timeMultiplier - 1) * 100}%`,
 subtotal: `KES ${Math.round(subtotal)}`,
 platformFee: `KES ${Math.round(platformFee)}`,
 total: `KES ${total}`
 }
 };
 }

 /**
 * GET BASE PRICE
 */
 getBasePrice(serviceType) {
 return this.basePrices[serviceType] || this.basePrices.general_handyman;
 }

 /**
 * CALCULATE DISTANCE FEE
 */
 calculateDistanceFee(distance) {
 if (distance <= this.distancePricing.freeDistance) {
 return 0;
 }
 const chargeableDistance = distance - this.distancePricing.freeDistance;
 return Math.round(chargeableDistance * this.distancePricing.pricePerKm);
 }

 /**
 * GET URGENCY MULTIPLIER
 */
 getUrgencyMultiplier(urgency) {
 return this.urgencyMultipliers[urgency] || this.urgencyMultipliers.standard;
 }

 /**
 * GET TIME MULTIPLIER
 * Based on day of week and time of day
 */
 getTimeMultiplier(scheduledTime) {
 const date = new Date(scheduledTime);
 const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
 const hour = date.getHours();

 const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
 const dayType = isWeekend ? 'weekend' : 'weekday';

 let timeOfDay = 'normal';
 if (hour >= 22 || hour < 8) {
 timeOfDay = 'night';
 } else if (hour >= 18) {
 timeOfDay = 'evening';
 }

 return this.timeMultipliers[dayType][timeOfDay];
 }

 /**
 * CALCULATE PLATFORM FEE
 */
 calculatePlatformFee(subtotal) {
 return Math.round(subtotal * this.platformFeePercentage);
 }

 /**
 * CALCULATE TECHNICIAN EARNINGS
 * What the technician receives after platform fee
 */
 calculateTechnicianEarnings(totalPrice) {
 const platformFee = totalPrice * this.platformFeePercentage;
 const technicianEarnings = totalPrice - platformFee;
 
 return {
 totalPrice,
 platformFee: Math.round(platformFee),
 technicianEarnings: Math.round(technicianEarnings),
 platformFeePercentage: this.platformFeePercentage * 100
 };
 }

 /**
 * GET PRICE ESTIMATE
 * Quick price estimate without full calculation
 */
 getPriceEstimate(serviceType, urgency = 'standard') {
 const basePrice = this.getBasePrice(serviceType);
 const urgencyMultiplier = this.getUrgencyMultiplier(urgency);
 const estimated = basePrice * urgencyMultiplier;
 
 return {
 min: Math.round(estimated * 0.8),
 max: Math.round(estimated * 1.5),
 estimated: Math.round(estimated)
 };
 }

 /**
 * CALCULATE BULK DISCOUNT
 * For multiple services booked together
 */
 calculateBulkDiscount(totalPrice, numberOfServices) {
 let discountPercentage = 0;
 
 if (numberOfServices >= 5) {
 discountPercentage = 0.15; // 15%
 } else if (numberOfServices >= 3) {
 discountPercentage = 0.10; // 10%
 } else if (numberOfServices >= 2) {
 discountPercentage = 0.05; // 5%
 }
 
 const discount = Math.round(totalPrice * discountPercentage);
 const finalPrice = totalPrice - discount;
 
 return {
 originalPrice: totalPrice,
 discount,
 discountPercentage: discountPercentage * 100,
 finalPrice
 };
 }

 /**
 * VALIDATE PRICE
 * Ensures price is within acceptable range
 */
 validatePrice(price) {
 return price >= this.minPrice && price <= this.maxPrice;
 }

 /**
 * FORMAT PRICE
 */
 formatPrice(price, currency = 'KES') {
 return `${currency} ${Math.round(price).toLocaleString()}`;
 }

 /**
 * GET ALL SERVICE PRICES
 * Returns base prices for all services
 */
 getAllServicePrices() {
 return Object.entries(this.basePrices).map(([service, price]) => ({
 serviceType: service,
 name: this.formatServiceName(service),
 basePrice: price,
 formatted: this.formatPrice(price)
 }));
 }

 /**
 * FORMAT SERVICE NAME
 */
 formatServiceName(serviceType) {
 return serviceType
 .split('_')
 .map(word => word.charAt(0).toUpperCase() + word.slice(1))
 .join(' ');
 }

 /**
 * UPDATE BASE PRICE
 * Admin function to update pricing
 */
 updateBasePrice(serviceType, newPrice) {
 if (this.validatePrice(newPrice)) {
 this.basePrices[serviceType] = newPrice;
 return { success: true, serviceType, newPrice };
 }
 return { success: false, error: 'Invalid price range' };
 }

 /**
 * UPDATE PLATFORM FEE
 */
 updatePlatformFee(newPercentage) {
 if (newPercentage >= 0 && newPercentage <= 0.3) { // 0-30%
 this.platformFeePercentage = newPercentage;
 return { success: true, newPercentage };
 }
 return { success: false, error: 'Invalid fee percentage' };
 }
}

export default new PricingEngine();
