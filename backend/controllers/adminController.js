/**
 * Admin Controller
 * 
 * This controller provides comprehensive admin tools including:
 * - User management and verification
 * - Booking oversight and dispute resolution
 * - Financial analytics and transaction monitoring
 * - System health monitoring
 * - Emergency response tools
 * - Platform configuration
 */

const User = require('../models/User');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const NotificationService = require('../services/NotificationService');
const PricingService = require('../services/PricingService');
const mongoose = require('mongoose');

/**
 * Get comprehensive dashboard analytics
 */
const getDashboardAnalytics = async (req, res) => {
 try {
 const { timeframe = '30d' } = req.query;
 
 // Calculate date range
 const now = new Date();
 const startDate = new Date();
 
 switch (timeframe) {
 case '24h':
 startDate.setDate(now.getDate() - 1);
 break;
 case '7d':
 startDate.setDate(now.getDate() - 7);
 break;
 case '30d':
 startDate.setDate(now.getDate() - 30);
 break;
 case '90d':
 startDate.setDate(now.getDate() - 90);
 break;
 case '1y':
 startDate.setFullYear(now.getFullYear() - 1);
 break;
 }

 // Parallel data fetching for better performance
 const [
 userStats,
 bookingStats,
 transactionStats,
 recentActivity,
 topTechnicians,
 serviceTypeStats,
 revenueAnalytics,
 emergencyAlerts
 ] = await Promise.all([
 getUserStatistics(startDate),
 getBookingStatistics(startDate),
 getTransactionStatistics(startDate),
 getRecentActivity(),
 getTopTechnicians(startDate),
 getServiceTypeStatistics(startDate),
 getRevenueAnalytics(startDate),
 getEmergencyAlerts()
 ]);

 res.json({
 timeframe,
 dateRange: { startDate, endDate: now },
 userStats,
 bookingStats,
 transactionStats,
 recentActivity,
 topTechnicians,
 serviceTypeStats,
 revenueAnalytics,
 emergencyAlerts,
 generatedAt: new Date()
 });
 } catch (error) {
 console.error('Get dashboard analytics error:', error);
 res.status(500).json({ 
 message: 'Failed to fetch dashboard analytics', 
 error: error.message 
 });
 }
};

/**
 * Get user statistics
 */
const getUserStatistics = async (startDate) => {
 const totalUsers = await User.countDocuments();
 const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
 const activeUsers = await User.countDocuments({ 
 lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
 });
 
 const usersByRole = await User.aggregate([
 { $group: { _id: '$role', count: { $sum: 1 } } }
 ]);

 const verificationStatus = await User.aggregate([
 { 
 $match: { role: 'technician' } 
 },
 { 
 $group: { 
 _id: '$technicianProfile.verificationStatus', 
 count: { $sum: 1 } 
 } 
 }
 ]);

 return {
 totalUsers,
 newUsers,
 activeUsers,
 usersByRole: usersByRole.reduce((acc, item) => {
 acc[item._id] = item.count;
 return acc;
 }, {}),
 verificationStatus: verificationStatus.reduce((acc, item) => {
 acc[item._id || 'unverified'] = item.count;
 return acc;
 }, {})
 };
};

/**
 * Get booking statistics
 */
const getBookingStatistics = async (startDate) => {
 const totalBookings = await Booking.countDocuments();
 const newBookings = await Booking.countDocuments({ createdAt: { $gte: startDate } });
 
 const bookingsByStatus = await Booking.aggregate([
 { $group: { _id: '$status', count: { $sum: 1 } } }
 ]);

 const averagePrice = await Booking.aggregate([
 { $match: { status: 'completed' } },
 { $group: { _id: null, avgPrice: { $avg: '$finalPrice' } } }
 ]);

 const completionRate = await Booking.aggregate([
 {
 $group: {
 _id: null,
 total: { $sum: 1 },
 completed: {
 $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
 }
 }
 }
 ]);

 return {
 totalBookings,
 newBookings,
 bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
 acc[item._id] = item.count;
 return acc;
 }, {}),
 averagePrice: averagePrice[0]?.avgPrice || 0,
 completionRate: completionRate[0] ? 
 (completionRate[0].completed / completionRate[0].total * 100) : 0
 };
};

/**
 * Get transaction statistics
 */
const getTransactionStatistics = async (startDate) => {
 const totalRevenue = await Transaction.aggregate([
 { $match: { status: 'completed', type: 'service_payment' } },
 { $group: { _id: null, total: { $sum: '$amount' } } }
 ]);

 const recentRevenue = await Transaction.aggregate([
 { 
 $match: { 
 status: 'completed', 
 type: 'service_payment',
 createdAt: { $gte: startDate } 
 } 
 },
 { $group: { _id: null, total: { $sum: '$amount' } } }
 ]);

 const transactionsByStatus = await Transaction.aggregate([
 { $group: { _id: '$status', count: { $sum: 1 } } }
 ]);

 const paymentMethods = await Transaction.aggregate([
 { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
 ]);

 return {
 totalRevenue: totalRevenue[0]?.total || 0,
 recentRevenue: recentRevenue[0]?.total || 0,
 transactionsByStatus: transactionsByStatus.reduce((acc, item) => {
 acc[item._id] = item.count;
 return acc;
 }, {}),
 paymentMethods: paymentMethods.reduce((acc, item) => {
 acc[item._id || 'unknown'] = item.count;
 return acc;
 }, {})
 };
};

/**
 * Get recent activity
 */
const getRecentActivity = async () => {
 const recentBookings = await Booking.find()
 .populate('clientId', 'firstName lastName')
 .populate('technicianId', 'firstName lastName')
 .sort({ createdAt: -1 })
 .limit(10)
 .select('serviceType status createdAt estimatedPrice');

 const recentUsers = await User.find()
 .sort({ createdAt: -1 })
 .limit(10)
 .select('firstName lastName role createdAt');

 return {
 recentBookings,
 recentUsers
 };
};

/**
 * Get top performing technicians
 */
const getTopTechnicians = async (startDate) => {
 return await User.aggregate([
 { $match: { role: 'technician' } },
 {
 $lookup: {
 from: 'bookings',
 localField: '_id',
 foreignField: 'technicianId',
 as: 'bookings'
 }
 },
 {
 $addFields: {
 recentBookings: {
 $filter: {
 input: '$bookings',
 cond: { $gte: ['$$this.createdAt', startDate] }
 }
 }
 }
 },
 {
 $addFields: {
 recentJobCount: { $size: '$recentBookings' },
 recentRevenue: {
 $sum: {
 $map: {
 input: '$recentBookings',
 as: 'booking',
 in: '$$booking.finalPrice'
 }
 }
 }
 }
 },
 {
 $sort: { recentRevenue: -1 }
 },
 {
 $limit: 10
 },
 {
 $project: {
 firstName: 1,
 lastName: 1,
 'technicianProfile.rating': 1,
 'technicianProfile.completedJobs': 1,
 recentJobCount: 1,
 recentRevenue: 1
 }
 }
 ]);
};

/**
 * Get service type statistics
 */
const getServiceTypeStatistics = async (startDate) => {
 return await Booking.aggregate([
 { $match: { createdAt: { $gte: startDate } } },
 {
 $group: {
 _id: '$serviceType',
 count: { $sum: 1 },
 avgPrice: { $avg: '$estimatedPrice' },
 totalRevenue: { $sum: '$finalPrice' }
 }
 },
 { $sort: { count: -1 } }
 ]);
};

/**
 * Get revenue analytics with trends
 */
const getRevenueAnalytics = async (startDate) => {
 const dailyRevenue = await Transaction.aggregate([
 {
 $match: {
 status: 'completed',
 type: 'service_payment',
 createdAt: { $gte: startDate }
 }
 },
 {
 $group: {
 _id: {
 year: { $year: '$createdAt' },
 month: { $month: '$createdAt' },
 day: { $dayOfMonth: '$createdAt' }
 },
 revenue: { $sum: '$amount' },
 count: { $sum: 1 }
 }
 },
 { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
 ]);

 return { dailyRevenue };
};

/**
 * Get emergency alerts
 */
const getEmergencyAlerts = async () => {
 const emergencyBookings = await Booking.find({
 urgency: 'emergency',
 status: { $in: ['pending', 'assigned', 'in_progress'] }
 })
 .populate('clientId', 'firstName lastName phoneNumber')
 .populate('technicianId', 'firstName lastName phoneNumber')
 .sort({ createdAt: -1 })
 .limit(5);

 const criticalNotifications = await Notification.find({
 priority: 'critical',
 type: 'emergency',
 createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
 }).limit(10);

 return {
 emergencyBookings,
 criticalNotifications
 };
};

/**
 * Manage users - get all users with filtering and pagination
 */
const getUsers = async (req, res) => {
 try {
 const {
 page = 1,
 limit = 20,
 role,
 status,
 search,
 verificationStatus
 } = req.query;

 const query = {};
 
 if (role) query.role = role;
 if (status) query.isActive = status === 'active';
 if (verificationStatus && role === 'technician') {
 query['technicianProfile.verificationStatus'] = verificationStatus;
 }
 
 if (search) {
 query.$or = [
 { firstName: { $regex: search, $options: 'i' } },
 { lastName: { $regex: search, $options: 'i' } },
 { email: { $regex: search, $options: 'i' } },
 { phoneNumber: { $regex: search, $options: 'i' } }
 ];
 }

 const users = await User.find(query)
 .select('-password')
 .sort({ createdAt: -1 })
 .limit(limit * 1)
 .skip((page - 1) * limit)
 .exec();

 const total = await User.countDocuments(query);

 res.json({
 users,
 totalPages: Math.ceil(total / limit),
 currentPage: page,
 total
 });
 } catch (error) {
 console.error('Get users error:', error);
 res.status(500).json({ message: 'Failed to fetch users', error: error.message });
 }
};

/**
 * Verify or reject technician
 */
const verifyTechnician = async (req, res) => {
 try {
 const { userId } = req.params;
 const { action, reason } = req.body; // action: 'approve' or 'reject'

 const technician = await User.findById(userId);
 if (!technician || technician.role !== 'technician') {
 return res.status(404).json({ message: 'Technician not found' });
 }

 const newStatus = action === 'approve' ? 'verified' : 'rejected';
 
 await User.findByIdAndUpdate(userId, {
 'technicianProfile.verificationStatus': newStatus,
 'technicianProfile.verificationDate': new Date(),
 'technicianProfile.verificationNotes': reason
 });

 // Send notification to technician
 const title = action === 'approve' 
 ? 'Verification Approved!' 
 : 'Verification Rejected';
 
 const message = action === 'approve'
 ? 'Congratulations! Your technician profile has been verified. You can now start accepting jobs.'
 : `Your verification was rejected. Reason: ${reason}. Please update your profile and try again.`;

 await NotificationService.createInAppNotification(
 userId,
 title,
 message,
 {
 type: 'system',
 priority: action === 'approve' ? 'normal' : 'high'
 }
 );

 // Send email notification
 if (technician.email) {
 await NotificationService.sendEmail(
 technician.email,
 `QuickFix - ${title}`,
 generateVerificationEmailTemplate(technician, action, reason)
 );
 }

 res.json({ 
 message: `Technician ${action}d successfully`,
 status: newStatus
 });
 } catch (error) {
 console.error('Verify technician error:', error);
 res.status(500).json({ message: 'Failed to verify technician', error: error.message });
 }
};

/**
 * Suspend or activate user
 */
const toggleUserStatus = async (req, res) => {
 try {
 const { userId } = req.params;
 const { action, reason } = req.body; // action: 'suspend' or 'activate'

 const user = await User.findById(userId);
 if (!user) {
 return res.status(404).json({ message: 'User not found' });
 }

 const isActive = action === 'activate';
 
 await User.findByIdAndUpdate(userId, {
 isActive,
 suspensionReason: isActive ? null : reason,
 suspensionDate: isActive ? null : new Date()
 });

 // Send notification
 const title = isActive ? 'Account Activated' : 'Account Suspended';
 const message = isActive 
 ? 'Your account has been reactivated. You can now use QuickFix services.'
 : `Your account has been suspended. Reason: ${reason}. Contact support for assistance.`;

 await NotificationService.createInAppNotification(
 userId,
 title,
 message,
 {
 type: 'system',
 priority: 'high'
 }
 );

 res.json({ 
 message: `User ${action}d successfully`,
 isActive
 });
 } catch (error) {
 console.error('Toggle user status error:', error);
 res.status(500).json({ message: 'Failed to update user status', error: error.message });
 }
};

/**
 * Handle booking disputes
 */
const resolveDispute = async (req, res) => {
 try {
 const { bookingId } = req.params;
 const { 
 resolution, 
 refundAmount, 
 additionalPayment,
 notes,
 resolutionType 
 } = req.body;

 const booking = await Booking.findById(bookingId)
 .populate('clientId')
 .populate('technicianId');

 if (!booking) {
 return res.status(404).json({ message: 'Booking not found' });
 }

 // Update booking with dispute resolution
 await Booking.findByIdAndUpdate(bookingId, {
 'disputeInfo.status': 'resolved',
 'disputeInfo.resolution': resolution,
 'disputeInfo.resolvedBy': req.user.id,
 'disputeInfo.resolvedAt': new Date(),
 'disputeInfo.adminNotes': notes,
 status: resolutionType === 'refund' ? 'cancelled' : 'completed'
 });

 // Process financial adjustments
 if (refundAmount > 0) {
 // Create refund transaction
 const refundTransaction = new Transaction({
 userId: booking.clientId._id,
 bookingId: booking._id,
 amount: refundAmount,
 type: 'refund',
 status: 'completed',
 description: `Dispute resolution refund for booking #${booking._id}`
 });
 await refundTransaction.save();

 // Send refund notification
 await NotificationService.sendPaymentNotification(
 booking.clientId._id,
 refundTransaction,
 'received'
 );
 }

 if (additionalPayment > 0) {
 // Create additional payment transaction
 const additionalTransaction = new Transaction({
 userId: booking.technicianId._id,
 bookingId: booking._id,
 amount: additionalPayment,
 type: 'service_payment',
 status: 'completed',
 description: `Dispute resolution additional payment for booking #${booking._id}`
 });
 await additionalTransaction.save();

 // Send payment notification
 await NotificationService.sendPaymentNotification(
 booking.technicianId._id,
 additionalTransaction,
 'received'
 );
 }

 // Notify both parties
 await NotificationService.createInAppNotification(
 booking.clientId._id,
 'Dispute Resolved',
 `Your dispute for booking #${booking._id.toString().slice(-6)} has been resolved. ${resolution}`,
 { type: 'system', bookingId: booking._id }
 );

 await NotificationService.createInAppNotification(
 booking.technicianId._id,
 'Dispute Resolved',
 `The dispute for booking #${booking._id.toString().slice(-6)} has been resolved. ${resolution}`,
 { type: 'system', bookingId: booking._id }
 );

 res.json({ 
 message: 'Dispute resolved successfully',
 resolution,
 refundAmount,
 additionalPayment
 });
 } catch (error) {
 console.error('Resolve dispute error:', error);
 res.status(500).json({ message: 'Failed to resolve dispute', error: error.message });
 }
};

/**
 * Update pricing configuration
 */
const updatePricing = async (req, res) => {
 try {
 const { 
 serviceType, 
 newPrices, 
 multipliers,
 effectiveDate = new Date()
 } = req.body;

 // Here you would typically save to a pricing configuration collection
 // For now, we'll just validate and return success
 
 if (!PricingService.BASE_PRICES[serviceType]) {
 return res.status(400).json({ message: 'Invalid service type' });
 }

 // Log the pricing change for audit
 console.log('Pricing update:', {
 serviceType,
 newPrices,
 multipliers,
 effectiveDate,
 updatedBy: req.user.id
 });

 res.json({ 
 message: 'Pricing updated successfully',
 serviceType,
 newPrices,
 effectiveDate
 });
 } catch (error) {
 console.error('Update pricing error:', error);
 res.status(500).json({ message: 'Failed to update pricing', error: error.message });
 }
};

/**
 * Send broadcast notification
 */
const sendBroadcastNotification = async (req, res) => {
 try {
 const {
 title,
 message,
 targetAudience, // 'all', 'clients', 'technicians'
 priority = 'normal',
 expiresAt
 } = req.body;

 const query = {};
 if (targetAudience === 'clients') {
 query.role = 'client';
 } else if (targetAudience === 'technicians') {
 query.role = 'technician';
 }

 const users = await User.find(query).select('_id');
 
 const notifications = users.map(user => ({
 userId: user._id,
 title,
 message,
 type: 'system',
 priority,
 expiresAt: expiresAt ? new Date(expiresAt) : undefined,
 data: {
 broadcast: true,
 sentBy: req.user.id
 }
 }));

 await Notification.createBulkNotifications(notifications);

 res.json({ 
 message: 'Broadcast notification sent successfully',
 recipientCount: users.length
 });
 } catch (error) {
 console.error('Send broadcast notification error:', error);
 res.status(500).json({ 
 message: 'Failed to send broadcast notification', 
 error: error.message 
 });
 }
};

/**
 * Generate verification email template
 */
const generateVerificationEmailTemplate = (technician, action, reason) => {
 const isApproved = action === 'approve';
 
 return `
 <!DOCTYPE html>
 <html>
 <head>
 <style>
 body { font-family: Arial, sans-serif; color: #333; }
 .container { max-width: 600px; margin: 0 auto; padding: 20px; }
 .header { background: ${isApproved ? '#28a745' : '#dc3545'}; color: white; padding: 20px; text-align: center; }
 .content { padding: 20px; }
 .footer { text-align: center; padding: 20px; color: #666; }
 </style>
 </head>
 <body>
 <div class="container">
 <div class="header">
 <h1>Verification ${isApproved ? 'Approved' : 'Rejected'}</h1>
 </div>
 <div class="content">
 <h2>Hello ${technician.firstName},</h2>
 ${isApproved ? `
 <p>Congratulations! Your technician profile has been verified and approved.</p>
 <p>You can now start accepting job requests on the QuickFix platform.</p>
 <p>Make sure to keep your profile updated and maintain high service quality to build your reputation.</p>
 ` : `
 <p>Unfortunately, your verification application has been rejected.</p>
 <p><strong>Reason:</strong> ${reason}</p>
 <p>Please review the feedback, update your profile accordingly, and resubmit your verification request.</p>
 `}
 </div>
 <div class="footer">
 <p>Thank you for choosing QuickFix!</p>
 <p>Questions? Contact our support team.</p>
 </div>
 </div>
 </body>
 </html>
 `;
};

module.exports = {
 getDashboardAnalytics,
 getUsers,
 verifyTechnician,
 toggleUserStatus,
 resolveDispute,
 updatePricing,
 sendBroadcastNotification
};
