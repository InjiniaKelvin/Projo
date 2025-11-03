/**
 * Scheduling Service
 * 
 * Intelligent scheduling system that manages technician availability,
 * optimal time slots, and booking conflicts resolution.
 */

const { Booking, Technician, Service } = require('../models');
const LocationService = require('./LocationService');

class SchedulingService {
 /**
 * Get alternative time slots when primary request can't be fulfilled
 */
 async getAlternativeSlots(serviceId, location, originalDate) {
 try {
 const service = await Service.findById(serviceId);
 if (!service) {
 return [];
 }
 
 const requestDate = new Date(originalDate);
 const alternatives = [];
 
 // Look for alternatives within the next 7 days
 for (let i = 1; i <= 7; i++) {
 const alternativeDate = new Date(requestDate);
 alternativeDate.setDate(alternativeDate.getDate() + i);
 
 const daySlots = await this.getAvailableSlotsForDay(serviceId, location, alternativeDate);
 
 if (daySlots.length > 0) {
 alternatives.push({
 date: alternativeDate,
 slots: daySlots.slice(0, 3), // Top 3 slots per day
 dayOfWeek: alternativeDate.toLocaleDateString('en-US', { weekday: 'long' })
 });
 }
 
 // Stop after finding 3 alternative days
 if (alternatives.length >= 3) break;
 }
 
 return alternatives;
 
 } catch (error) {
 console.error('Get alternative slots error:', error);
 return [];
 }
 }
 
 /**
 * Get available slots for a specific day
 */
 async getAvailableSlotsForDay(serviceId, location, date) {
 try {
 const availableTechnicians = await this.getAvailableTechniciansForDay(serviceId, location, date);
 const slots = [];
 
 // Define time slots (8 AM to 8 PM, 2-hour intervals)
 const timeSlots = this.generateTimeSlots(date);
 
 for (const timeSlot of timeSlots) {
 for (const technician of availableTechnicians) {
 const isAvailable = await this.isTechnicianAvailable(technician._id, timeSlot.start, timeSlot.end);
 
 if (isAvailable) {
 slots.push({
 startTime: timeSlot.start,
 endTime: timeSlot.end,
 technician: {
 id: technician._id,
 name: `${technician.firstName} ${technician.lastName}`,
 rating: technician.averageRating,
 specializations: technician.specializations
 },
 estimatedPrice: await this.calculateSlotPrice(timeSlot, technician),
 confidence: await this.calculateSlotConfidence(technician, timeSlot)
 });
 }
 }
 }
 
 // Sort by confidence and price
 return slots
 .sort((a, b) => (b.confidence - a.confidence) || (a.estimatedPrice - b.estimatedPrice))
 .slice(0, 10); // Return top 10 slots
 
 } catch (error) {
 console.error('Get available slots for day error:', error);
 return [];
 }
 }
 
 /**
 * Generate time slots for a given date
 */
 generateTimeSlots(date) {
 const slots = [];
 const baseDate = new Date(date);
 
 // Operating hours: 8 AM to 8 PM
 for (let hour = 8; hour < 20; hour += 2) {
 const startTime = new Date(baseDate);
 startTime.setHours(hour, 0, 0, 0);
 
 const endTime = new Date(startTime);
 endTime.setHours(hour + 2, 0, 0, 0);
 
 slots.push({
 start: startTime,
 end: endTime,
 label: `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`,
 isPeak: this.isPeakHour(hour),
 demand: this.getExpectedDemand(hour)
 });
 }
 
 return slots;
 }
 
 /**
 * Get available technicians for a specific day
 */
 async getAvailableTechniciansForDay(serviceId, location, date) {
 try {
 const service = await Service.findById(serviceId);
 const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
 
 const query = {
 isActive: true,
 isVerified: true,
 specializations: { $in: [service.category] },
 'availability.isAvailable': true,
 'availability.workingDays': dayOfWeek
 };
 
 // Add location filter if specified
 if (location && location.coordinates) {
 query['serviceArea.coordinates'] = {
 $near: {
 $geometry: {
 type: 'Point',
 coordinates: [location.coordinates.lng, location.coordinates.lat]
 },
 $maxDistance: 50000 // 50km radius
 }
 };
 }
 
 const technicians = await Technician.find(query)
 .populate('specializations')
 .lean();
 
 return technicians;
 
 } catch (error) {
 console.error('Get available technicians for day error:', error);
 return [];
 }
 }
 
 /**
 * Check if technician is available for specific time slot
 */
 async isTechnicianAvailable(technicianId, startTime, endTime) {
 try {
 // Check for existing bookings
 const conflictingBookings = await Booking.find({
 assignedTechnician: technicianId,
 status: { $in: ['assigned', 'in_progress'] },
 $or: [
 {
 scheduledDate: {
 $gte: startTime,
 $lt: endTime
 }
 },
 {
 scheduledDate: { $lt: startTime },
 estimatedCompletion: { $gt: startTime }
 }
 ]
 });
 
 if (conflictingBookings.length > 0) {
 return false;
 }
 
 // Check technician's availability preferences
 const technician = await Technician.findById(technicianId);
 if (!technician || !technician.availability.isAvailable) {
 return false;
 }
 
 // Check working hours
 const hour = startTime.getHours();
 const workingHours = technician.availability.workingHours || { start: 8, end: 18 };
 
 if (hour < workingHours.start || hour >= workingHours.end) {
 return false;
 }
 
 return true;
 
 } catch (error) {
 console.error('Check technician availability error:', error);
 return false;
 }
 }
 
 /**
 * Calculate price for a specific time slot
 */
 async calculateSlotPrice(timeSlot, technician) {
 try {
 let basePrice = 1500; // Default base price
 
 // Time-based pricing
 if (timeSlot.isPeak) {
 basePrice *= 1.2; // 20% premium for peak hours
 }
 
 if (this.isWeekend(timeSlot.start)) {
 basePrice *= 1.15; // 15% weekend premium
 }
 
 // Technician rating premium
 if (technician.averageRating >= 4.5) {
 basePrice *= 1.1; // 10% premium for top-rated technicians
 }
 
 // Demand-based pricing
 if (timeSlot.demand === 'high') {
 basePrice *= 1.25;
 } else if (timeSlot.demand === 'low') {
 basePrice *= 0.9;
 }
 
 return Math.round(basePrice);
 
 } catch (error) {
 console.error('Calculate slot price error:', error);
 return 1500; // Return default price on error
 }
 }
 
 /**
 * Calculate confidence score for a time slot
 */
 async calculateSlotConfidence(technician, timeSlot) {
 try {
 let confidence = 0.5; // Base confidence
 
 // Technician rating factor
 confidence += (technician.averageRating || 3) / 10; // 0.3 to 0.5 points
 
 // Response time factor
 const avgResponseTime = technician.averageResponseTime || 30;
 if (avgResponseTime <= 15) confidence += 0.2;
 else if (avgResponseTime <= 30) confidence += 0.1;
 
 // Completion rate factor
 const completionRate = technician.completionRate || 80;
 confidence += completionRate / 500; // 0.16 to 0.2 points
 
 // Time slot preference factor
 if (!timeSlot.isPeak) confidence += 0.1; // Off-peak times are more reliable
 
 // Workload factor
 const todayBookings = await this.getTechnicianBookingsForDay(technician._id, timeSlot.start);
 if (todayBookings < 3) confidence += 0.1;
 else if (todayBookings >= 5) confidence -= 0.2;
 
 return Math.min(Math.max(confidence, 0), 1); // Clamp between 0 and 1
 
 } catch (error) {
 console.error('Calculate slot confidence error:', error);
 return 0.5; // Return neutral confidence on error
 }
 }
 
 /**
 * Get technician's bookings for a specific day
 */
 async getTechnicianBookingsForDay(technicianId, date) {
 try {
 const startOfDay = new Date(date);
 startOfDay.setHours(0, 0, 0, 0);
 
 const endOfDay = new Date(date);
 endOfDay.setHours(23, 59, 59, 999);
 
 const count = await Booking.countDocuments({
 assignedTechnician: technicianId,
 scheduledDate: { $gte: startOfDay, $lte: endOfDay },
 status: { $in: ['assigned', 'in_progress', 'completed'] }
 });
 
 return count;
 
 } catch (error) {
 console.error('Get technician bookings for day error:', error);
 return 0;
 }
 }
 
 /**
 * Optimize technician schedules
 */
 async optimizeSchedules(date = new Date()) {
 try {
 const startOfDay = new Date(date);
 startOfDay.setHours(0, 0, 0, 0);
 
 const endOfDay = new Date(date);
 endOfDay.setHours(23, 59, 59, 999);
 
 // Get all bookings for the day
 const dayBookings = await Booking.find({
 scheduledDate: { $gte: startOfDay, $lte: endOfDay },
 status: { $in: ['assigned', 'pending_assignment'] }
 }).populate('assignedTechnician userId serviceId');
 
 const optimizedSchedules = new Map();
 
 for (const booking of dayBookings) {
 if (!booking.assignedTechnician) continue;
 
 const technicianId = booking.assignedTechnician._id.toString();
 
 if (!optimizedSchedules.has(technicianId)) {
 optimizedSchedules.set(technicianId, {
 technician: booking.assignedTechnician,
 bookings: [],
 totalTravelTime: 0,
 efficiency: 0
 });
 }
 
 optimizedSchedules.get(technicianId).bookings.push(booking);
 }
 
 // Optimize each technician's route
 for (const [, schedule] of optimizedSchedules) {
 const optimizedRoute = await this.optimizeRoute(schedule.bookings);
 schedule.optimizedBookings = optimizedRoute.bookings;
 schedule.totalTravelTime = optimizedRoute.totalTravelTime;
 schedule.efficiency = optimizedRoute.efficiency;
 }
 
 return Array.from(optimizedSchedules.values());
 
 } catch (error) {
 console.error('Optimize schedules error:', error);
 return [];
 }
 }
 
 /**
 * Optimize route for a technician's bookings
 */
 async optimizeRoute(bookings) {
 try {
 if (bookings.length <= 1) {
 return {
 bookings,
 totalTravelTime: 0,
 efficiency: 1.0
 };
 }
 
 // Sort bookings by scheduled time initially
 let sortedBookings = [...bookings].sort((a, b) => 
 new Date(a.scheduledDate) - new Date(b.scheduledDate)
 );
 
 // Calculate travel times between locations
 const travelMatrix = await this.calculateTravelMatrix(sortedBookings);
 
 // Apply simple nearest neighbor optimization
 const optimizedBookings = await this.nearestNeighborOptimization(sortedBookings, travelMatrix);
 
 // Calculate total travel time
 const totalTravelTime = this.calculateTotalTravelTime(optimizedBookings, travelMatrix);
 
 // Calculate efficiency score
 const efficiency = this.calculateRouteEfficiency(optimizedBookings, totalTravelTime);
 
 return {
 bookings: optimizedBookings,
 totalTravelTime,
 efficiency
 };
 
 } catch (error) {
 console.error('Optimize route error:', error);
 return {
 bookings,
 totalTravelTime: 0,
 efficiency: 0.5
 };
 }
 }
 
 /**
 * Calculate travel time matrix between booking locations
 */
 async calculateTravelMatrix(bookings) {
 const matrix = new Map();
 
 for (let i = 0; i < bookings.length; i++) {
 for (let j = 0; j < bookings.length; j++) {
 if (i === j) {
 matrix.set(`${i}-${j}`, 0);
 continue;
 }
 
 const fromLocation = bookings[i].location.coordinates;
 const toLocation = bookings[j].location.coordinates;
 
 // Calculate travel time (simplified - in reality would use Google Maps API)
 const distance = await LocationService.calculateDistance(fromLocation, toLocation);
 const travelTime = Math.round(distance * 2); // Assume 30 km/h average speed
 
 matrix.set(`${i}-${j}`, travelTime);
 }
 }
 
 return matrix;
 }
 
 /**
 * Apply nearest neighbor optimization
 */
 async nearestNeighborOptimization(bookings, travelMatrix) {
 if (bookings.length <= 1) return bookings;
 
 const visited = new Set();
 const optimized = [];
 let current = 0; // Start with first booking
 
 visited.add(current);
 optimized.push(bookings[current]);
 
 while (visited.size < bookings.length) {
 let nearest = -1;
 let shortestTime = Infinity;
 
 for (let i = 0; i < bookings.length; i++) {
 if (visited.has(i)) continue;
 
 const travelTime = travelMatrix.get(`${current}-${i}`) || 0;
 
 if (travelTime < shortestTime) {
 shortestTime = travelTime;
 nearest = i;
 }
 }
 
 if (nearest !== -1) {
 visited.add(nearest);
 optimized.push(bookings[nearest]);
 current = nearest;
 } else {
 break;
 }
 }
 
 return optimized;
 }
 
 /**
 * Calculate total travel time for optimized route
 */
 calculateTotalTravelTime(bookings, travelMatrix) {
 let totalTime = 0;
 
 for (let i = 0; i < bookings.length - 1; i++) {
 const travelTime = travelMatrix.get(`${i}-${i + 1}`) || 0;
 totalTime += travelTime;
 }
 
 return totalTime;
 }
 
 /**
 * Calculate route efficiency score
 */
 calculateRouteEfficiency(bookings, totalTravelTime) {
 if (bookings.length <= 1) return 1.0;
 
 const totalServiceTime = bookings.reduce((sum, booking) => {
 return sum + (booking.estimatedDuration || 120); // Default 2 hours
 }, 0);
 
 const efficiency = totalServiceTime / (totalServiceTime + totalTravelTime);
 return Math.round(efficiency * 100) / 100;
 }
 
 /**
 * Reschedule booking to optimal time slot
 */
 async rescheduleBooking(bookingId, newPreferences = {}) {
 try {
 const booking = await Booking.findById(bookingId)
 .populate('serviceId userId assignedTechnician');
 
 if (!booking) {
 return { success: false, error: 'Booking not found' };
 }
 
 if (booking.status !== 'assigned') {
 return { success: false, error: 'Can only reschedule assigned bookings' };
 }
 
 // Find alternative slots
 const currentDate = booking.scheduledDate;
 const alternatives = await this.getAlternativeSlots(
 booking.serviceId._id,
 booking.location,
 currentDate
 );
 
 if (alternatives.length === 0) {
 return { success: false, error: 'No alternative slots available' };
 }
 
 // Select best alternative based on preferences
 const bestSlot = this.selectBestAlternative(alternatives, newPreferences);
 
 // Update booking
 booking.scheduledDate = bestSlot.startTime;
 booking.timeline.push({
 status: 'rescheduled',
 timestamp: new Date(),
 description: `Booking rescheduled to ${bestSlot.startTime}`,
 metadata: {
 originalDate: currentDate,
 newDate: bestSlot.startTime,
 reason: newPreferences.reason || 'Customer request'
 }
 });
 
 await booking.save();
 
 return {
 success: true,
 newSchedule: {
 date: bestSlot.startTime,
 technician: bestSlot.technician,
 estimatedPrice: bestSlot.estimatedPrice
 }
 };
 
 } catch (error) {
 console.error('Reschedule booking error:', error);
 return { success: false, error: error.message };
 }
 }
 
 /**
 * Select best alternative slot based on preferences
 */
 selectBestAlternative(alternatives, preferences = {}) {
 const { preferredTime, maxPriceIncrease = 0.2 } = preferences;
 
 let bestSlot = alternatives[0].slots[0]; // Default to first available
 
 for (const alternative of alternatives) {
 for (const slot of alternative.slots) {
 // Time preference matching
 if (preferredTime) {
 const slotHour = new Date(slot.startTime).getHours();
 const preferredHour = preferredTime.getHours();
 
 if (Math.abs(slotHour - preferredHour) < Math.abs(
 new Date(bestSlot.startTime).getHours() - preferredHour
 )) {
 bestSlot = slot;
 }
 }
 
 // Price consideration
 if (slot.estimatedPrice <= bestSlot.estimatedPrice * (1 + maxPriceIncrease)) {
 if (slot.confidence > bestSlot.confidence) {
 bestSlot = slot;
 }
 }
 }
 }
 
 return bestSlot;
 }
 
 // Helper methods
 
 formatTime(date) {
 return date.toLocaleTimeString('en-US', { 
 hour: 'numeric', 
 minute: '2-digit',
 hour12: true 
 });
 }
 
 isPeakHour(hour) {
 return (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
 }
 
 isWeekend(date) {
 const day = date.getDay();
 return day === 0 || day === 6; // Sunday or Saturday
 }
 
 getExpectedDemand(hour) {
 if (this.isPeakHour(hour)) return 'high';
 if (hour >= 12 && hour <= 14) return 'medium'; // Lunch time
 if (hour >= 20 || hour <= 7) return 'low'; // Evening/early morning
 return 'medium';
 }
 
 /**
 * Get scheduling recommendations for technicians
 */
 async getSchedulingRecommendations(technicianId, date = new Date()) {
 try {
 const technician = await Technician.findById(technicianId);
 if (!technician) {
 return { error: 'Technician not found' };
 }
 
 const dayBookings = await this.getTechnicianBookingsForDay(technicianId, date);
 const availableSlots = await this.getAvailableSlotsForDay(
 null, // Any service
 technician.serviceArea,
 date
 );
 
 return {
 currentBookings: dayBookings,
 availableSlots: availableSlots.slice(0, 5),
 recommendations: {
 optimalWorkload: dayBookings < 4 ? 'Can take more bookings' : 'Optimal workload',
 preferredTimeSlots: this.getPreferredTimeSlots(technician),
 efficiencyTips: this.getEfficiencyTips(technician, dayBookings)
 }
 };
 
 } catch (error) {
 console.error('Get scheduling recommendations error:', error);
 return { error: error.message };
 }
 }
 
 getPreferredTimeSlots(technician) {
 // Based on historical performance
 return [
 { time: '9:00 AM - 11:00 AM', reason: 'High completion rate' },
 { time: '2:00 PM - 4:00 PM', reason: 'Low travel time' },
 { time: '4:00 PM - 6:00 PM', reason: 'Premium pricing' }
 ];
 }
 
 getEfficiencyTips(technician, currentBookings) {
 const tips = [];
 
 if (currentBookings < 3) {
 tips.push('Consider accepting more bookings to maximize earnings');
 }
 
 if (technician.averageResponseTime > 30) {
 tips.push('Faster response times can improve your matching score');
 }
 
 tips.push('Schedule similar services together to reduce travel time');
 
 return tips;
 }
}

module.exports = new SchedulingService();
