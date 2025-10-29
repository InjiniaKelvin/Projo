/**
 * Notification Service
 * 
 * Comprehensive notification system for real-time updates,
 * push notifications, SMS, and email communications.
 */

const { Notification, User } = require('../models');

class NotificationService {
 constructor() {
 this.io = null; // Will be set by socket.io instance
 this.pushService = null; // Will be initialized with FCM
 this.smsService = null; // Will be initialized with SMS provider
 this.emailService = null; // Will be initialized with email provider
 }
 
 /**
 * Initialize notification service with external services
 */
 initialize(io, pushService, smsService, emailService) {
 this.io = io;
 this.pushService = pushService;
 this.smsService = smsService;
 this.emailService = emailService;
 }
 
 /**
 * Send booking opportunity notification to technicians
 */
 async sendBookingOpportunity(technicianId, bookingData) {
 try {
 const { bookingId, booking, priority, responseDeadline } = bookingData;
 
 const notification = await this.createNotification({
 recipientId: technicianId,
 type: 'booking_opportunity',
 title: ' New Job Opportunity',
 message: `${booking.service} needed in ${booking.location}`,
 data: {
 bookingId,
 booking,
 priority,
 responseDeadline,
 estimatedEarnings: booking.estimatedEarnings,
 urgency: booking.urgency
 },
 priority,
 expiresAt: responseDeadline
 });
 
 // Send via multiple channels based on priority
 const channels = priority === 'high' ? ['push', 'sms', 'realtime'] : ['push', 'realtime'];
 
 await this.sendMultiChannel(notification, channels);
 
 return { success: true, notificationId: notification._id };
 
 } catch (error) {
 console.error('Send booking opportunity error:', error);
 return { success: false, error: error.message };
 }
 }
 
 /**
 * Send booking status update to customer
 */
 async sendBookingUpdate(booking, timelineEntry) {
 try {
 const customerId = booking.userId;
 const status = timelineEntry.status;
 
 const statusMessages = {
 'assigned': {
 title: ' Technician Assigned',
 message: `Your technician is on the way! ETA: ${booking.estimatedArrival || 'TBD'}`
 },
 'in_progress': {
 title: ' Work Started',
 message: 'Your technician has started working on your service request'
 },
 'completed': {
 title: ' Service Completed',
 message: 'Your service has been completed. Please rate your experience!'
 },
 'cancelled': {
 title: ' Booking Cancelled',
 message: 'Your booking has been cancelled. Refund will be processed if applicable.'
 },
 'on_hold': {
 title: '⏸ Service On Hold',
 message: 'Your service is temporarily on hold. Technician will update you shortly.'
 }
 };
 
 const messageData = statusMessages[status] || {
 title: ' Booking Update',
 message: `Your booking status has been updated to: ${status}`
 };
 
 const notification = await this.createNotification({
 recipientId: customerId,
 type: 'booking_update',
 title: messageData.title,
 message: messageData.message,
 data: {
 bookingId: booking._id,
 bookingRef: booking.bookingId,
 status,
 timeline: timelineEntry,
 nextAction: this.getCustomerNextAction(status)
 },
 priority: 'normal'
 });
 
 // Send via push and real-time
 await this.sendMultiChannel(notification, ['push', 'realtime', 'email']);
 
 return { success: true, notificationId: notification._id };
 
 } catch (error) {
 console.error('Send booking update error:', error);
 return { success: false, error: error.message };
 }
 }
 
 /**
 * Send assignment confirmation to customer
 */
 async sendAssignmentConfirmation(customerId, booking, technician) {
 try {
 const notification = await this.createNotification({
 recipientId: customerId,
 type: 'assignment_confirmation',
 title: ' Technician Assigned!',
 message: `${technician.firstName} ${technician.lastName} will handle your service request`,
 data: {
 bookingId: booking._id,
 bookingRef: booking.bookingId,
 technician: {
 id: technician._id,
 name: `${technician.firstName} ${technician.lastName}`,
 rating: technician.averageRating,
 phoneNumber: technician.phoneNumber,
 photo: technician.profilePhoto
 },
 estimatedArrival: booking.estimatedArrival,
 canContact: true
 },
 priority: 'high'
 });
 
 await this.sendMultiChannel(notification, ['push', 'realtime', 'email']);
 
 return { success: true, notificationId: notification._id };
 
 } catch (error) {
 console.error('Send assignment confirmation error:', error);
 return { success: false, error: error.message };
 }
 }
 
 /**
 * Send job assignment to technician
 */
 async sendJobAssignment(technicianId, booking) {
 try {
 const notification = await this.createNotification({
 recipientId: technicianId,
 type: 'job_assignment',
 title: ' Job Assigned to You',
 message: `You've been assigned: ${booking.serviceId.name}`,
 data: {
 bookingId: booking._id,
 bookingRef: booking.bookingId,
 customer: {
 name: `${booking.userId.firstName} ${booking.userId.lastName}`,
 phoneNumber: booking.userId.phoneNumber,
 rating: booking.userId.averageRating
 },
 location: booking.location,
 scheduledDate: booking.scheduledDate,
 estimatedEarnings: booking.pricing.finalPrice * 0.8,
 requirements: booking.description
 },
 priority: 'high'
 });
 
 await this.sendMultiChannel(notification, ['push', 'realtime', 'sms']);
 
 return { success: true, notificationId: notification._id };
 
 } catch (error) {
 console.error('Send job assignment error:', error);
 return { success: false, error: error.message };
 }
 }
 
 /**
 * Send auto-assignment notification
 */
 async sendAutoAssignmentNotification(customerId, booking, technician) {
 try {
 const notification = await this.createNotification({
 recipientId: customerId,
 type: 'auto_assignment',
 title: ' Auto-Assigned Technician',
 message: `We've automatically assigned ${technician.firstName} to your request for faster service`,
 data: {
 bookingId: booking._id,
 technician: {
 name: `${technician.firstName} ${technician.lastName}`,
 rating: technician.averageRating,
 phoneNumber: technician.phoneNumber
 },
 assignmentReason: 'Optimal match found for immediate service'
 },
 priority: 'high'
 });
 
 await this.sendMultiChannel(notification, ['push', 'realtime']);
 
 return { success: true, notificationId: notification._id };
 
 } catch (error) {
 console.error('Send auto assignment notification error:', error);
 return { success: false, error: error.message };
 }
 }
 
 /**
 * Send escalation alert to admin
 */
 async sendEscalationAlert(booking) {
 try {
 // Find admin users
 const admins = await User.find({ role: 'admin', isActive: true });
 
 const notifications = await Promise.all(
 admins.map(admin => this.createNotification({
 recipientId: admin._id,
 type: 'escalation_alert',
 title: ' Booking Requires Attention',
 message: `Booking ${booking.bookingId} couldn't find technician - needs manual assignment`,
 data: {
 bookingId: booking._id,
 bookingRef: booking.bookingId,
 customer: booking.userId,
 service: booking.serviceId,
 location: booking.location,
 urgency: booking.urgency,
 timeElapsed: Date.now() - booking.createdAt.getTime()
 },
 priority: 'urgent'
 }))
 );
 
 // Send to all admins
 await Promise.all(
 notifications.map(notification => 
 this.sendMultiChannel(notification, ['push', 'realtime', 'email'])
 )
 );
 
 return { success: true, notificationsSent: notifications.length };
 
 } catch (error) {
 console.error('Send escalation alert error:', error);
 return { success: false, error: error.message };
 }
 }
 
 /**
 * Cancel pending notifications (e.g., when booking is assigned)
 */
 async cancelPendingNotifications(bookingId) {
 try {
 await Notification.updateMany(
 {
 'data.bookingId': bookingId,
 status: 'sent',
 type: 'booking_opportunity'
 },
 {
 $set: { 
 status: 'cancelled',
 cancelledAt: new Date(),
 cancelReason: 'Booking assigned to another technician'
 }
 }
 );
 
 return { success: true };
 
 } catch (error) {
 console.error('Cancel pending notifications error:', error);
 return { success: false, error: error.message };
 }
 }
 
 /**
 * Create notification record in database
 */
 async createNotification(notificationData) {
 try {
 const notification = new Notification({
 ...notificationData,
 status: 'created',
 createdAt: new Date()
 });
 
 await notification.save();
 return notification;
 
 } catch (error) {
 console.error('Create notification error:', error);
 throw error;
 }
 }
 
 /**
 * Send notification via multiple channels
 */
 async sendMultiChannel(notification, channels) {
 const results = {};
 
 for (const channel of channels) {
 try {
 switch (channel) {
 case 'push':
 results.push = await this.sendPushNotification(notification);
 break;
 case 'sms':
 results.sms = await this.sendSMSNotification(notification);
 break;
 case 'email':
 results.email = await this.sendEmailNotification(notification);
 break;
 case 'realtime':
 results.realtime = await this.sendRealtimeNotification(notification);
 break;
 }
 } catch (error) {
 console.error(`${channel} notification error:`, error);
 results[channel] = { success: false, error: error.message };
 }
 }
 
 // Update notification status
 notification.status = 'sent';
 notification.sentAt = new Date();
 notification.deliveryResults = results;
 await notification.save();
 
 return results;
 }
 
 /**
 * Send real-time notification via WebSocket
 */
 async sendRealtimeNotification(notification) {
 if (!this.io) {
 return { success: false, error: 'Socket.IO not initialized' };
 }
 
 try {
 const userRoom = `user_${notification.recipientId}`;
 
 this.io.to(userRoom).emit('notification', {
 id: notification._id,
 type: notification.type,
 title: notification.title,
 message: notification.message,
 data: notification.data,
 priority: notification.priority,
 timestamp: notification.createdAt
 });
 
 return { success: true, delivered: true };
 
 } catch (error) {
 return { success: false, error: error.message };
 }
 }
 
 /**
 * Get customer's next action based on booking status
 */
 getCustomerNextAction(status) {
 const actions = {
 'assigned': 'Contact technician or track arrival',
 'in_progress': 'Technician is working on your request',
 'completed': 'Rate your experience and check for warranty',
 'cancelled': 'Book a new service or contact support',
 'on_hold': 'Wait for technician update or contact support'
 };
 
 return actions[status] || 'Check booking details for updates';
 }
 
 // Legacy methods for compatibility
 async sendSMSNotification(notification) {
 // Mock implementation - replace with actual SMS service
 return { success: true, messageId: 'mock_sms_' + Date.now() };
 }
 
 async sendEmailNotification(notification) {
 // Mock implementation - replace with actual email service
 return { success: true, messageId: 'mock_email_' + Date.now() };
 }
 
 async sendPushNotification(notification) {
 // Mock implementation - replace with actual push service
 return { success: true, messageId: 'mock_push_' + Date.now() };
 }
}

module.exports = new NotificationService();

