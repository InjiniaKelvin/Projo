/**
 * Booking Service for QuickFix App
 * Handles all booking-related API calls
 */

import { default as apiClient } from '../config/api';

class BookingService {
 
 /**
 * Get all bookings for the current user
 */
 async getBookings(page = 1, limit = 20, filters = {}) {
 try {
 const params = { page, limit, ...filters };
 const response = await apiClient.get('/bookings', { params });
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Get specific booking details
 */
 async getBooking(bookingId) {
 try {
 const response = await apiClient.get(`/bookings/${bookingId}`);
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Create a new booking
 */
 async createBooking(bookingData) {
 try {
 const response = await apiClient.post('/bookings', bookingData);
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Update booking details
 */
 async updateBooking(bookingId, updateData) {
 try {
 const response = await apiClient.put(`/bookings/${bookingId}`, updateData);
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Accept a booking (technician action)
 */
 async acceptBooking(bookingId) {
 try {
 const response = await apiClient.post(`/bookings/${bookingId}/accept`);
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Start work on a booking
 */
 async startBooking(bookingId) {
 try {
 const response = await apiClient.post(`/bookings/${bookingId}/start`);
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Complete a booking
 */
 async completeBooking(bookingId, completionData = {}) {
 try {
 const response = await apiClient.post(`/bookings/${bookingId}/complete`, completionData);
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Cancel a booking
 */
 async cancelBooking(bookingId, reason) {
 try {
 const response = await apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Rate and review a completed booking
 */
 async rateBooking(bookingId, rating, review) {
 try {
 const response = await apiClient.post(`/bookings/${bookingId}/rate`, {
 rating,
 review
 });
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Get available technicians for a service
 */
 async getAvailableTechnicians(serviceType, location, radius = 10) {
 try {
 const params = {
 serviceType,
 latitude: location.latitude,
 longitude: location.longitude,
 radius
 };
 
 const response = await apiClient.get('/bookings/technicians/available', { params });
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Get service categories
 */
 async getServiceCategories() {
 try {
 const response = await apiClient.get('/bookings/services/categories');
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Get estimated cost for a service
 */
 async getServiceEstimate(serviceType, location, details = {}) {
 try {
 const requestData = {
 serviceType,
 location,
 ...details
 };
 
 const response = await apiClient.post('/bookings/estimate', requestData);
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Upload booking-related files
 */
 async uploadBookingFiles(bookingId, files) {
 try {
 const formData = new FormData();
 
 files.forEach((file, index) => {
 formData.append(`file_${index}`, file);
 });
 
 const response = await apiClient.post(`/bookings/${bookingId}/files`, formData, {
 headers: {
 'Content-Type': 'multipart/form-data'
 }
 });
 
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Get booking history
 */
 async getBookingHistory(page = 1, limit = 20, status = null) {
 try {
 const params = { page, limit };
 if (status) params.status = status;
 
 const response = await apiClient.get('/bookings/history', { params });
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Get booking statistics
 */
 async getBookingStats(period = '30d') {
 try {
 const response = await apiClient.get('/bookings/stats', {
 params: { period }
 });
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Search for technicians by skill and location
 */
 async searchTechnicians(skill, location, filters = {}) {
 try {
 const params = {
 skill,
 latitude: location.latitude,
 longitude: location.longitude,
 ...filters
 };
 
 const response = await apiClient.get('/bookings/technicians/search', { params });
 return response.data;
 } catch (error) {
 throw this.handleBookingError(error);
 }
 }

 /**
 * Get real-time booking updates
 */
 subscribeToBookingUpdates(bookingId, callback) {
 // Implementation would depend on your real-time solution (WebSocket, Server-Sent Events, etc.)
 // For now, we'll use polling as a fallback
 const pollInterval = setInterval(async () => {
 try {
 const booking = await this.getBooking(bookingId);
 callback(booking);
 } catch (error) {
 console.error('Error polling booking updates:', error);
 }
 }, 10000); // Poll every 10 seconds

 return () => clearInterval(pollInterval);
 }

 /**
 * Error handling for booking operations
 */
 handleBookingError(error) {
 if (error.response) {
 const { status, data } = error.response;
 
 if (status === 404) {
 return new Error('Booking not found.');
 }
 
 if (status === 409) {
 return new Error('Booking conflict. The booking may have been modified by another user.');
 }
 
 if (status === 422) {
 const message = data.errors 
 ? Object.values(data.errors).flat().join(', ')
 : data.message || 'Booking validation failed';
 return new Error(message);
 }
 
 return new Error(data.message || `Booking operation failed with status ${status}`);
 }
 
 if (error.request) {
 return new Error('Network error. Please check your connection and try again.');
 }
 
 return new Error(error.message || 'An unexpected booking error occurred');
 }
}

// Export singleton instance
export default new BookingService();
