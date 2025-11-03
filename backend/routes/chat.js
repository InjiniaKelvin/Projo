/**
 * Chat Routes
 * 
 * Routes for real-time chat functionality including:
 * - Send messages
 * - Get chat history
 * - Upload images
 * - Mark messages as read
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken: auth } = require('../middleware/auth');
const Message = require('../models/Message');
const Booking = require('../models/Booking');

// Configure multer for image uploads
const storage = multer.diskStorage({
 destination: function (req, file, cb) {
 cb(null, 'uploads/chat/');
 },
 filename: function (req, file, cb) {
 const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
 cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
 }
});

const upload = multer({
 storage: storage,
 limits: {
 fileSize: 5 * 1024 * 1024 // 5MB limit
 },
 fileFilter: function (req, file, cb) {
 if (file.mimetype.startsWith('image/')) {
 cb(null, true);
 } else {
 cb(new Error('Only image files are allowed'), false);
 }
 }
});

// Get chat messages for a booking
router.get('/:bookingId/messages', auth, async (req, res) => {
 try {
 const { bookingId } = req.params;
 const { page = 1, limit = 50 } = req.query;

 // Verify user has access to this booking
 const booking = await Booking.findById(bookingId);
 if (!booking) {
 return res.status(404).json({
 success: false,
 message: 'Booking not found'
 });
 }

 if (booking.clientId.toString() !== req.user.id && 
 booking.technicianId?.toString() !== req.user.id) {
 return res.status(403).json({
 success: false,
 message: 'Access denied'
 });
 }

 const messages = await Message.find({
 bookingId,
 isDeleted: false
 })
 .populate('senderId', 'firstName lastName profilePicture')
 .sort({ createdAt: -1 })
 .limit(limit * 1)
 .skip((page - 1) * limit);

 const total = await Message.countDocuments({
 bookingId,
 isDeleted: false
 });

 res.json({
 success: true,
 data: {
 messages,
 pagination: {
 page: parseInt(page),
 limit: parseInt(limit),
 total,
 pages: Math.ceil(total / limit)
 }
 }
 });
 } catch (error) {
 console.error('Get chat messages error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to fetch messages'
 });
 }
});

// Send a text message
router.post('/send', auth, async (req, res) => {
 try {
 const {
 bookingId,
 content,
 messageType = 'text',
 recipientId,
 location
 } = req.body;

 // Verify booking exists and user has access
 const booking = await Booking.findById(bookingId);
 if (!booking) {
 return res.status(404).json({
 success: false,
 message: 'Booking not found'
 });
 }

 if (booking.clientId.toString() !== req.user.id && 
 booking.technicianId?.toString() !== req.user.id) {
 return res.status(403).json({
 success: false,
 message: 'Access denied'
 });
 }

 // Create message
 const messageData = {
 bookingId,
 senderId: req.user.id,
 recipientId,
 content,
 messageType,
 status: 'sent'
 };

 if (messageType === 'location' && location) {
 messageData.location = location;
 }

 const message = new Message(messageData);
 await message.save();

 // Populate sender details
 await message.populate('senderId', 'firstName lastName profilePicture');

 // TODO: Emit real-time event via WebSocket
 // io.to(`booking_${bookingId}`).emit('new_message', message);

 res.status(201).json({
 success: true,
 data: { message }
 });
 } catch (error) {
 console.error('Send message error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to send message'
 });
 }
});

// Send an image message
router.post('/send-image', auth, upload.single('image'), async (req, res) => {
 try {
 const {
 bookingId,
 recipientId,
 messageType = 'image'
 } = req.body;

 if (!req.file) {
 return res.status(400).json({
 success: false,
 message: 'No image file provided'
 });
 }

 // Verify booking exists and user has access
 const booking = await Booking.findById(bookingId);
 if (!booking) {
 return res.status(404).json({
 success: false,
 message: 'Booking not found'
 });
 }

 if (booking.clientId.toString() !== req.user.id && 
 booking.technicianId?.toString() !== req.user.id) {
 return res.status(403).json({
 success: false,
 message: 'Access denied'
 });
 }

 // Create message with image attachment
 const message = new Message({
 bookingId,
 senderId: req.user.id,
 recipientId,
 content: 'Image',
 messageType,
 attachments: [{
 type: 'image',
 url: `/uploads/chat/${req.file.filename}`,
 filename: req.file.filename,
 size: req.file.size
 }],
 status: 'sent'
 });

 await message.save();
 await message.populate('senderId', 'firstName lastName profilePicture');

 // TODO: Emit real-time event via WebSocket
 // io.to(`booking_${bookingId}`).emit('new_message', message);

 res.status(201).json({
 success: true,
 data: { message }
 });
 } catch (error) {
 console.error('Send image message error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to send image message'
 });
 }
});

// Mark message as read
router.put('/messages/:messageId/read', auth, async (req, res) => {
 try {
 const { messageId } = req.params;

 const message = await Message.findById(messageId);
 if (!message) {
 return res.status(404).json({
 success: false,
 message: 'Message not found'
 });
 }

 // Only recipient can mark message as read
 if (message.recipientId.toString() !== req.user.id) {
 return res.status(403).json({
 success: false,
 message: 'Access denied'
 });
 }

 if (!message.readAt) {
 message.readAt = new Date();
 message.status = 'read';
 await message.save();

 // TODO: Emit real-time event via WebSocket
 // io.to(`booking_${message.bookingId}`).emit('message_status_updated', {
 // messageId: message._id,
 // status: 'read',
 // readAt: message.readAt
 // });
 }

 res.json({
 success: true,
 message: 'Message marked as read'
 });
 } catch (error) {
 console.error('Mark message as read error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to mark message as read'
 });
 }
});

// Delete a message
router.delete('/messages/:messageId', auth, async (req, res) => {
 try {
 const { messageId } = req.params;

 const message = await Message.findById(messageId);
 if (!message) {
 return res.status(404).json({
 success: false,
 message: 'Message not found'
 });
 }

 // Only sender can delete message
 if (message.senderId.toString() !== req.user.id) {
 return res.status(403).json({
 success: false,
 message: 'Access denied'
 });
 }

 // Soft delete
 message.isDeleted = true;
 message.deletedAt = new Date();
 await message.save();

 res.json({
 success: true,
 message: 'Message deleted'
 });
 } catch (error) {
 console.error('Delete message error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to delete message'
 });
 }
});

// Get unread message count for user
router.get('/unread-count', auth, async (req, res) => {
 try {
 const count = await Message.countDocuments({
 recipientId: req.user.id,
 readAt: { $exists: false },
 isDeleted: false
 });

 res.json({
 success: true,
 data: { count }
 });
 } catch (error) {
 console.error('Get unread count error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to get unread count'
 });
 }
});

// Get user's recent conversations
router.get('/conversations', auth, async (req, res) => {
 try {
 const conversations = await Message.aggregate([
 {
 $match: {
 $or: [
 { senderId: req.user.id },
 { recipientId: req.user.id }
 ],
 isDeleted: false
 }
 },
 {
 $sort: { createdAt: -1 }
 },
 {
 $group: {
 _id: '$bookingId',
 lastMessage: { $first: '$$ROOT' },
 unreadCount: {
 $sum: {
 $cond: [
 {
 $and: [
 { $eq: ['$recipientId', req.user.id] },
 { $not: { $ifNull: ['$readAt', false] } }
 ]
 },
 1,
 0
 ]
 }
 }
 }
 },
 {
 $lookup: {
 from: 'bookings',
 localField: '_id',
 foreignField: '_id',
 as: 'booking'
 }
 },
 {
 $lookup: {
 from: 'users',
 localField: 'lastMessage.senderId',
 foreignField: '_id',
 as: 'sender'
 }
 },
 {
 $project: {
 booking: { $arrayElemAt: ['$booking', 0] },
 lastMessage: 1,
 unreadCount: 1,
 sender: { $arrayElemAt: ['$sender', 0] }
 }
 },
 {
 $sort: { 'lastMessage.createdAt': -1 }
 }
 ]);

 res.json({
 success: true,
 data: { conversations }
 });
 } catch (error) {
 console.error('Get conversations error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to get conversations'
 });
 }
});

module.exports = router;
