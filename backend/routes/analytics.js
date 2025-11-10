/**
 * Analytics Routes
 * 
 * Routes for analytics and reporting including:
 * - Booking analytics
 * - Revenue analytics
 * - Performance metrics
 * - Service insights
 */

const express = require('express');
const router = express.Router();
const { authenticateToken: auth, requireAdmin } = require('../middleware/auth');
const Booking = require('../models/BookingRedesigned');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const PricingService = require('../services/PricingService');

// Get user analytics (client/technician specific)
router.get('/user', auth, async (req, res) => {
 try {
 const { timeframe = '30d' } = req.query;
 const userId = req.user.id;
 const userRole = req.user.role;
 
 // Calculate date range
 const now = new Date();
 const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
 const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

 let analytics = {};

 if (userRole === 'client') {
 // Client analytics
 analytics = await getClientAnalytics(userId, startDate);
 } else if (userRole === 'technician') {
 // Technician analytics
 analytics = await getTechnicianAnalytics(userId, startDate);
 }

 res.json({
 success: true,
 data: {
 ...analytics,
 timeframe,
 dateRange: { startDate, endDate: now }
 }
 });
 } catch (error) {
 console.error('Get user analytics error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to fetch user analytics'
 });
 }
});

// Get booking analytics
router.get('/bookings', auth, async (req, res) => {
 try {
 const { timeframe = '30d', serviceType, location } = req.query;
 
 // Calculate date range
 const now = new Date();
 const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
 const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

 const matchQuery = {
 createdAt: { $gte: startDate }
 };

 // Add filters based on user role
 if (req.user.role === 'client') {
 matchQuery.clientId = req.user.id;
 } else if (req.user.role === 'technician') {
 matchQuery.technicianId = req.user.id;
 }

 if (serviceType) matchQuery.serviceType = serviceType;
 if (location) {
 const loc = JSON.parse(location);
 matchQuery['location.latitude'] = {
 $gte: loc.latitude - 0.5,
 $lte: loc.latitude + 0.5
 };
 matchQuery['location.longitude'] = {
 $gte: loc.longitude - 0.5,
 $lte: loc.longitude + 0.5
 };
 }

 const analytics = await Booking.aggregate([
 { $match: matchQuery },
 {
 $group: {
 _id: null,
 totalBookings: { $sum: 1 },
 completedBookings: {
 $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
 },
 cancelledBookings: {
 $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
 },
 pendingBookings: {
 $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
 },
 averagePrice: { $avg: '$estimatedPrice' },
 totalRevenue: {
 $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$finalPrice', 0] }
 },
 averageRating: { $avg: '$rating' }
 }
 }
 ]);

 const result = analytics[0] || {
 totalBookings: 0,
 completedBookings: 0,
 cancelledBookings: 0,
 pendingBookings: 0,
 averagePrice: 0,
 totalRevenue: 0,
 averageRating: 0
 };

 result.completionRate = result.totalBookings > 0 
 ? ((result.completedBookings / result.totalBookings) * 100).toFixed(2)
 : 0;

 res.json({
 success: true,
 data: {
 ...result,
 timeframe,
 dateRange: { startDate, endDate: now }
 }
 });
 } catch (error) {
 console.error('Get booking analytics error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to fetch booking analytics'
 });
 }
});

// Get service type performance
router.get('/services', auth, async (req, res) => {
 try {
 const { timeframe = '30d' } = req.query;
 
 const now = new Date();
 const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
 const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

 const matchQuery = { createdAt: { $gte: startDate } };
 
 // Filter by user role
 if (req.user.role === 'client') {
 matchQuery.clientId = req.user.id;
 } else if (req.user.role === 'technician') {
 matchQuery.technicianId = req.user.id;
 }

 const serviceAnalytics = await Booking.aggregate([
 { $match: matchQuery },
 {
 $group: {
 _id: '$serviceType',
 count: { $sum: 1 },
 avgPrice: { $avg: '$estimatedPrice' },
 avgRating: { $avg: '$rating' },
 completedJobs: {
 $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
 },
 totalRevenue: {
 $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$finalPrice', 0] }
 }
 }
 },
 {
 $addFields: {
 completionRate: {
 $round: [
 { $multiply: [{ $divide: ['$completedJobs', '$count'] }, 100] },
 2
 ]
 }
 }
 },
 { $sort: { count: -1 } }
 ]);

 res.json({
 success: true,
 data: {
 services: serviceAnalytics,
 timeframe,
 dateRange: { startDate, endDate: now }
 }
 });
 } catch (error) {
 console.error('Get service analytics error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to fetch service analytics'
 });
 }
});

// Get pricing insights
router.get('/pricing', auth, async (req, res) => {
 try {
 const { location } = req.query;
 
 if (!location) {
 return res.status(400).json({
 success: false,
 message: 'Location is required for pricing insights'
 });
 }

 const locationObj = JSON.parse(location);
 const pricingData = await PricingService.getAllServicePricing(locationObj);

 res.json({
 success: true,
 data: pricingData
 });
 } catch (error) {
 console.error('Get pricing insights error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to fetch pricing insights'
 });
 }
});

// Get earnings report (technicians only)
router.get('/earnings', auth, async (req, res) => {
 try {
 if (req.user.role !== 'technician') {
 return res.status(403).json({
 success: false,
 message: 'Access denied. Technicians only.'
 });
 }

 const { timeframe = '30d' } = req.query;
 
 const now = new Date();
 const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
 const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

 // Get earnings from transactions
 const earnings = await Transaction.aggregate([
 {
 $match: {
 userId: req.user.id,
 type: 'service_earning',
 status: 'completed',
 createdAt: { $gte: startDate }
 }
 },
 {
 $group: {
 _id: null,
 totalEarnings: { $sum: '$amount' },
 totalJobs: { $sum: 1 },
 avgEarningPerJob: { $avg: '$amount' }
 }
 }
 ]);

 // Get daily earnings breakdown
 const dailyEarnings = await Transaction.aggregate([
 {
 $match: {
 userId: req.user.id,
 type: 'service_earning',
 status: 'completed',
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
 dailyEarnings: { $sum: '$amount' },
 jobsCompleted: { $sum: 1 }
 }
 },
 { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
 ]);

 const result = earnings[0] || {
 totalEarnings: 0,
 totalJobs: 0,
 avgEarningPerJob: 0
 };

 res.json({
 success: true,
 data: {
 ...result,
 dailyBreakdown: dailyEarnings,
 timeframe,
 dateRange: { startDate, endDate: now }
 }
 });
 } catch (error) {
 console.error('Get earnings report error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to fetch earnings report'
 });
 }
});

// Helper function to get client analytics
const getClientAnalytics = async (clientId, startDate) => {
 const bookings = await Booking.aggregate([
 { $match: { clientId, createdAt: { $gte: startDate } } },
 {
 $group: {
 _id: null,
 totalBookings: { $sum: 1 },
 completedBookings: {
 $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
 },
 totalSpent: {
 $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$finalPrice', 0] }
 },
 avgRating: { $avg: '$rating' },
 favoriteService: { $first: '$serviceType' }
 }
 }
 ]);

 return bookings[0] || {
 totalBookings: 0,
 completedBookings: 0,
 totalSpent: 0,
 avgRating: 0,
 favoriteService: null
 };
};

// Helper function to get technician analytics
const getTechnicianAnalytics = async (technicianId, startDate) => {
 const bookings = await Booking.aggregate([
 { $match: { technicianId, createdAt: { $gte: startDate } } },
 {
 $group: {
 _id: null,
 totalJobs: { $sum: 1 },
 completedJobs: {
 $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
 },
 avgRating: { $avg: '$technicianRating' },
 totalRevenue: {
 $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$finalPrice', 0] }
 }
 }
 }
 ]);

 const earnings = await Transaction.aggregate([
 {
 $match: {
 userId: technicianId,
 type: 'service_earning',
 status: 'completed',
 createdAt: { $gte: startDate }
 }
 },
 {
 $group: {
 _id: null,
 totalEarnings: { $sum: '$amount' }
 }
 }
 ]);

 const bookingData = bookings[0] || {
 totalJobs: 0,
 completedJobs: 0,
 avgRating: 0,
 totalRevenue: 0
 };

 const earningData = earnings[0] || { totalEarnings: 0 };

 return {
 ...bookingData,
 totalEarnings: earningData.totalEarnings,
 completionRate: bookingData.totalJobs > 0 
 ? ((bookingData.completedJobs / bookingData.totalJobs) * 100).toFixed(2)
 : 0
 };
};

module.exports = router;
