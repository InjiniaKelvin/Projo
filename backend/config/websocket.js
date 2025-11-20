/**
 * WebSocket Server for Real-time Communication
 * 
 * This module handles real-time features including:
 * - Live chat between clients and technicians
 * - Real-time booking status updates
 * - Live location tracking
 * - Push notifications
 */

const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Booking = require('../models/BookingRedesigned');
const NotificationService = require('../services/NotificationService');

let io;

const initializeSocketIO = (server) => {
 io = socketIo(server, {
 cors: {
 origin: process.env.FRONTEND_URL || "http://localhost:8081",
 methods: ["GET", "POST"],
 credentials: true
 }
 });

 // Initialize NotificationService with the socket instance
 NotificationService.initialize(io);

 // Authentication middleware for WebSocket
 io.use(async (socket, next) => {
 try {
 const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
 
 if (!token) {
 return next(new Error('Authentication error'));
 }

 const decoded = jwt.verify(token, process.env.JWT_SECRET);
 const user = await User.findById(decoded.id).select('-password');
 
 if (!user) {
 return next(new Error('User not found'));
 }

 socket.user = user;
 next();
 } catch (error) {
 next(new Error('Authentication error'));
 }
 });

 io.on('connection', (socket) => {
 console.log(`User ${socket.user.firstName} connected (${socket.user.role})`);

 // Join user to their personal room
 socket.join(`user_${socket.user._id}`);

 // Join role-based rooms
 socket.join(`role_${socket.user.role}`);

 // If technician, join location-based room
 if (socket.user.role === 'technician' && socket.user.location) {
 const locationRoom = `location_${Math.floor(socket.user.location.latitude)}_${Math.floor(socket.user.location.longitude)}`;
 socket.join(locationRoom);
 }

 // Handle technician availability updates
 socket.on('update_availability', async (data) => {
 try {
 if (socket.user.role !== 'technician') return;

 await User.findByIdAndUpdate(socket.user._id, {
 'technicianProfile.availability.isAvailable': data.isAvailable,
 'technicianProfile.availability.lastUpdated': new Date()
 });

 // Broadcast availability to nearby clients
 socket.broadcast.emit('technician_availability_updated', {
 technicianId: socket.user._id,
 isAvailable: data.isAvailable,
 location: socket.user.location
 });

 socket.emit('availability_updated', { success: true });
 } catch (error) {
 socket.emit('error', { message: 'Failed to update availability' });
 }
 });

 // Handle location updates
 socket.on('update_location', async (data) => {
 try {
 const { latitude, longitude } = data;
 
 await User.findByIdAndUpdate(socket.user._id, {
 location: { latitude, longitude },
 'technicianProfile.availability.lastLocationUpdate': new Date()
 });

 // Update location room membership
 if (socket.user.role === 'technician') {
 const newLocationRoom = `location_${Math.floor(latitude)}_${Math.floor(longitude)}`;
 socket.join(newLocationRoom);
 }

 // If technician is on a job, update client
 const activeBooking = await Booking.findOne({
 technicianId: socket.user._id,
 status: { $in: ['assigned', 'in_progress'] }
 });

 if (activeBooking) {
  activeBooking.locationHistory.push({
    latitude,
    longitude,
    timestamp: new Date(),
  });
  await activeBooking.save();
 io.to(`user_${activeBooking.clientId}`).emit('technician_location_updated', {
 bookingId: activeBooking._id,
 location: { latitude, longitude },
 timestamp: new Date()
 });
 }

 socket.emit('location_updated', { success: true });
 } catch (error) {
 socket.emit('error', { message: 'Failed to update location' });
 }
 });

 // Handle get location history
 socket.on('get_location_history', async (data) => {
  try {
    const { bookingId } = data;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return socket.emit('error', { message: 'Booking not found' });
    }

    // Optional: Check if the user is authorized to view this history
    const isAuthorized = booking.clientId.toString() === socket.user._id.toString() ||
                         socket.user.role === 'admin';

    if (!isAuthorized) {
      return socket.emit('error', { message: 'Unauthorized' });
    }

    socket.emit('location_history', {
      bookingId: booking._id,
      history: booking.locationHistory,
    });
  } catch (error) {
    socket.emit('error', { message: 'Failed to get location history' });
  }
});

 // Handle chat messages
 socket.on('send_message', async (data) => {
 try {
 const { bookingId, message, messageType = 'text', attachments = [] } = data;

 // Verify user is part of this booking
 const booking = await Booking.findById(bookingId);
 if (!booking) {
 return socket.emit('error', { message: 'Booking not found' });
 }

 const isAuthorized = booking.clientId.toString() === socket.user._id.toString() ||
 booking.technicianId?.toString() === socket.user._id.toString() ||
 socket.user.role === 'admin';

 if (!isAuthorized) {
 return socket.emit('error', { message: 'Unauthorized' });
 }

 // Create message
 const newMessage = new Message({
 bookingId,
 senderId: socket.user._id,
 message,
 messageType,
 attachments,
 timestamp: new Date()
 });

 await newMessage.save();
 await newMessage.populate('senderId', 'firstName lastName role');

 // Send to all participants
 io.to(`user_${booking.clientId}`).emit('new_message', newMessage);
 if (booking.technicianId) {
 io.to(`user_${booking.technicianId}`).emit('new_message', newMessage);
 }

 // Send to admins if needed
 if (data.flagForAdmin) {
 io.to('role_admin').emit('flagged_message', newMessage);
 }

 socket.emit('message_sent', { success: true, messageId: newMessage._id });
 } catch (error) {
 socket.emit('error', { message: 'Failed to send message' });
 }
 });

 // Handle typing indicators
 socket.on('typing_start', (data) => {
 const { bookingId } = data;
 socket.to(`booking_${bookingId}`).emit('user_typing', {
 userId: socket.user._id,
 userName: socket.user.firstName,
 isTyping: true
 });
 });

 socket.on('typing_stop', (data) => {
 const { bookingId } = data;
 socket.to(`booking_${bookingId}`).emit('user_typing', {
 userId: socket.user._id,
 userName: socket.user.firstName,
 isTyping: false
 });
 });

 // Handle job acceptance/rejection
 socket.on('respond_to_job', async (data) => {
 try {
 const { bookingId, response, estimatedArrival } = data; // response: 'accept' or 'reject'
 
 if (socket.user.role !== 'technician') return;

 const booking = await Booking.findById(bookingId).populate('clientId', 'firstName lastName');
 if (!booking || booking.status !== 'pending') {
 return socket.emit('error', { message: 'Booking not available' });
 }

 if (response === 'accept') {
 // Assign booking to technician
 booking.technicianId = socket.user._id;
 booking.status = 'assigned';
 booking.estimatedArrival = estimatedArrival || 30;
 await booking.save();

 // Notify client
 io.to(`user_${booking.clientId._id}`).emit('booking_assigned', {
 booking,
 technician: {
 _id: socket.user._id,
 firstName: socket.user.firstName,
 lastName: socket.user.lastName,
 rating: socket.user.technicianProfile.rating,
 phoneNumber: socket.user.phoneNumber
 },
 estimatedArrival
 });

 // Remove from other technicians' available jobs
 io.to('role_technician').emit('job_taken', { bookingId });

 socket.emit('job_accepted', { success: true, booking });
 } else {
 // Log rejection for analytics
 socket.emit('job_rejected', { success: true });
 }
 } catch (error) {
 socket.emit('error', { message: 'Failed to respond to job' });
 }
 });

 // Handle emergency broadcasts
 socket.on('emergency_help', async (data) => {
 try {
 const { bookingId, emergencyType, description } = data;

 const booking = await Booking.findById(bookingId).populate('clientId technicianId');
 if (!booking) return;

 // Broadcast to all admins
 io.to('role_admin').emit('emergency_alert', {
 bookingId,
 emergencyType,
 description,
 client: booking.clientId,
 technician: booking.technicianId,
 location: booking.location,
 timestamp: new Date()
 });

 // Notify the other party
 if (socket.user._id.toString() === booking.clientId._id.toString()) {
 // Client sent emergency, notify technician
 if (booking.technicianId) {
 io.to(`user_${booking.technicianId._id}`).emit('client_emergency', {
 bookingId,
 emergencyType,
 description,
 client: booking.clientId
 });
 }
 } else if (booking.technicianId && socket.user._id.toString() === booking.technicianId._id.toString()) {
 // Technician sent emergency, notify client
 io.to(`user_${booking.clientId._id}`).emit('technician_emergency', {
 bookingId,
 emergencyType,
 description,
 technician: booking.technicianId
 });
 }

 socket.emit('emergency_sent', { success: true });
 } catch (error) {
 socket.emit('error', { message: 'Failed to send emergency alert' });
 }
 });

 // Handle live rating/feedback
 socket.on('live_feedback', async (data) => {
 try {
 const { bookingId, rating, feedback, isPublic = false } = data;

 const booking = await Booking.findById(bookingId);
 if (!booking) return;

 // Only client can give feedback during service
 if (socket.user._id.toString() !== booking.clientId.toString()) return;

 // Send to technician if service is in progress
 if (booking.status === 'in_progress' && booking.technicianId) {
 io.to(`user_${booking.technicianId}`).emit('live_feedback_received', {
 bookingId,
 rating,
 feedback,
 isPublic,
 timestamp: new Date()
 });
 }

 // Send to admins for monitoring
 io.to('role_admin').emit('live_feedback_logged', {
 bookingId,
 clientId: socket.user._id,
 rating,
 feedback,
 timestamp: new Date()
 });

 socket.emit('feedback_sent', { success: true });
 } catch (error) {
 socket.emit('error', { message: 'Failed to send feedback' });
 }
 });

 // Handle admin broadcasts
 socket.on('admin_broadcast', (data) => {
 if (socket.user.role !== 'admin') return;

 const { target, message, messageType = 'info' } = data;

 if (target === 'all') {
 io.emit('admin_message', { message, messageType, timestamp: new Date() });
 } else if (target.startsWith('role_')) {
 io.to(target).emit('admin_message', { message, messageType, timestamp: new Date() });
 } else if (target.startsWith('user_')) {
 io.to(target).emit('admin_message', { message, messageType, timestamp: new Date() });
 }
 });

 // Handle disconnection
 socket.on('disconnect', async () => {
 console.log(`User ${socket.user.firstName} disconnected`);

 // Update last seen
 await User.findByIdAndUpdate(socket.user._id, {
 'profile.lastSeen': new Date(),
 'technicianProfile.availability.isOnline': false
 });

 // Notify relevant parties if technician disconnects during active job
 if (socket.user.role === 'technician') {
 const activeBooking = await Booking.findOne({
 technicianId: socket.user._id,
 status: { $in: ['assigned', 'in_progress'] }
 });

 if (activeBooking) {
 io.to(`user_${activeBooking.clientId}`).emit('technician_offline', {
 bookingId: activeBooking._id,
 technicianId: socket.user._id,
 timestamp: new Date()
 });
 }
 }
 });
 });

 return io;
};

// Utility functions for sending notifications from other parts of the app
const sendNotificationToUser = (userId, event, data) => {
 if (io) {
 io.to(`user_${userId}`).emit(event, data);
 }
};

const sendNotificationToRole = (role, event, data) => {
 if (io) {
 io.to(`role_${role}`).emit(event, data);
 }
};

const broadcastToAll = (event, data) => {
 if (io) {
 io.emit(event, data);
 }
};

const sendLocationBasedNotification = (latitude, longitude, event, data) => {
 if (io) {
 const locationRoom = `location_${Math.floor(latitude)}_${Math.floor(longitude)}`;
 io.to(locationRoom).emit(event, data);
 }
};

module.exports = {
 initializeSocketIO,
 sendNotificationToUser,
 sendNotificationToRole,
 broadcastToAll,
 sendLocationBasedNotification
};
