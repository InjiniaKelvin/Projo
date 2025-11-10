/**
 * Technician Controller
 * 
 * Handles all technician-specific operations:
 * - Browse available jobs
 * - Accept/Reject job requests
 * - Start and complete jobs
 * - Upload job photos
 * - Manage availability status
 * - Track earnings and withdrawals
 */

const Booking = require('../models/BookingRedesigned');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const NotificationService = require('../services/NotificationService');
const multer = require('multer');
const path = require('path');

// Configure multer for job photo uploads
const storage = multer.diskStorage({
 destination: function (req, file, cb) {
 cb(null, 'uploads/job-photos/');
 },
 filename: function (req, file, cb) {
 const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
 cb(null, 'job-' + uniqueSuffix + path.extname(file.originalname));
 }
});

const upload = multer({
 storage: storage,
 limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
 fileFilter: (req, file, cb) => {
 const allowedTypes = /jpeg|jpg|png/;
 const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
 const mimetype = allowedTypes.test(file.mimetype);

 if (mimetype && extname) {
 return cb(null, true);
 } else {
 cb(new Error('Only JPEG, JPG, and PNG images are allowed!'));
 }
 }
}).array('photos', 5); // Max 5 photos per job

class TechnicianController {
 /**
 * GET AVAILABLE JOBS
 * Fetch jobs that are available for technicians to accept
 */
 async getAvailableJobs(req, res) {
 try {
 const technicianId = req.user.id;
 const { 
 page = 1, 
 limit = 20, 
 urgency, 
 serviceType, 
 maxDistance = 20 // km
 } = req.query;

 // Get technician profile to check skills
 const technician = await User.findById(technicianId);
 if (!technician || technician.role !== 'technician') {
 return res.status(403).json({
 success: false,
 message: 'Access denied: Technician role required'
 });
 }

 // Extract skill names from technician's skills
 const technicianSkills = technician.skills.map(skill => skill.name);

 // Build query for available jobs
 const query = {
 status: 'submitted', // Only jobs that haven't been assigned
 technicianId: null,
 // Optional filters
 ...(urgency && { urgency })
 };

 // Filter by technician's skills OR specific serviceType if provided
 if (serviceType) {
 query.serviceType = serviceType;
 } else if (technicianSkills.length > 0) {
 query.serviceType = { $in: technicianSkills };
 }

 console.log(`[SEARCH] Technician ${technician.firstName} skills:`, technicianSkills);
 console.log(`[SEARCH] Query for available jobs:`, JSON.stringify(query));

 // Execute query with pagination
 const jobs = await Booking.find(query)
 .populate('userId', 'firstName lastName phoneNumber email')
 .sort({ createdAt: -1, urgency: -1 }) // Emergency jobs first
 .limit(limit * 1)
 .skip((page - 1) * limit)
 .exec();

 const count = await Booking.countDocuments(query);

 // Calculate distance for each job (if technician location available)
 const jobsWithDistance = jobs.map(job => {
 const jobData = job.toObject();
 
 // Calculate distance if both locations available
 if (technician.location?.coordinates && job.location?.coordinates) {
 const distance = calculateDistance(
 technician.location.coordinates[1], // lat
 technician.location.coordinates[0], // lng
 job.location.coordinates[1],
 job.location.coordinates[0]
 );
 jobData.distance = distance.toFixed(1);
 } else {
 jobData.distance = 'N/A';
 }

 // Add client rating
 jobData.clientRating = job.userId?.rating?.average || 0;
 jobData.clientName = `${job.userId?.firstName || ''} ${job.userId?.lastName || ''}`.trim();

 return jobData;
 });

 // Filter by distance if specified
 const filteredJobs = maxDistance 
 ? jobsWithDistance.filter(job => 
 job.distance === 'N/A' || parseFloat(job.distance) <= parseFloat(maxDistance)
 )
 : jobsWithDistance;

 res.json({
 success: true,
 data: {
 jobs: filteredJobs,
 totalPages: Math.ceil(count / limit),
 currentPage: parseInt(page),
 totalJobs: count,
 availableNearby: filteredJobs.length
 }
 });

 } catch (error) {
 console.error('ERROR: Get available jobs failed:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to fetch available jobs',
 error: error.message
 });
 }
 }

 /**
 * ACCEPT JOB
 * Technician accepts a job request
 */
 async acceptJob(req, res) {
 try {
 const technicianId = req.user.id;
 const { id: bookingIdParam } = req.params;
 const { estimatedArrival } = req.body;

 // Find the booking by custom bookingId field (e.g., QF2025102611165678XN3E)
 const booking = await Booking.findOne({ bookingId: bookingIdParam })
 .populate('userId', 'firstName lastName phoneNumber email deviceToken');

 if (!booking) {
 return res.status(404).json({
 success: false,
 message: 'Booking not found'
 });
 }

 // Check if already assigned
 if (booking.technicianId) {
 return res.status(400).json({
 success: false,
 message: 'This job has already been assigned to another technician'
 });
 }

 // Check if booking is in correct status
 if (booking.status !== 'submitted') {
 return res.status(400).json({
 success: false,
 message: `Cannot accept job with status: ${booking.status}`
 });
 }

 // Get technician details
 const technician = await User.findById(technicianId);
 if (!technician || technician.role !== 'technician') {
 return res.status(403).json({
 success: false,
 message: 'Access denied: Technician role required'
 });
 }

 // Check if technician is available
 if (!technician.availability?.isAvailable) {
 return res.status(400).json({
 success: false,
 message: 'You are currently marked as unavailable. Please update your status first.'
 });
 }

 // Update booking with technician assignment
 booking.technicianId = technicianId;
 booking.technicianPhone = technician.phoneNumber;
 booking.status = 'technician_assigned';
 booking.assignedAt = new Date();
 
 if (estimatedArrival) {
 booking.estimatedArrival = new Date(estimatedArrival);
 }

 await booking.save();

 // Send notification to client (optional - skip if service not available)
 try {
 // SEND NOTIFICATION TO CLIENT (if userId exists)
 try {
 if (booking.userId) {
 await notificationService.create({
 recipientId: booking.userId._id,
 type: 'booking', // Valid enum value
 title: 'Technician Assigned!',
 message: `${technician.firstName} ${technician.lastName} has accepted your booking. They will arrive soon.`,
 data: {
 bookingId: booking._id,
 technicianId: technician._id,
 technicianName: `${technician.firstName} ${technician.lastName}`,
 technicianPhone: technician.phoneNumber,
 technicianRating: technician.rating?.average || 0,
 estimatedArrival: booking.estimatedArrival
 }
 });
 } else {
 console.log('Note: Client not registered, skipping notification');
 }
 } catch (notifError) {
 console.log('Note: Could not send notification (non-critical):', notifError.message);
 }
 } catch (notifError) {
 console.log('Note: Could not send notification (non-critical):', notifError.message);
 }

 res.json({
 success: true,
 message: 'Job accepted successfully! Client has been notified.',
 data: {
 booking: {
 _id: booking._id,
 bookingNumber: booking.bookingNumber,
 status: booking.status,
 clientName: booking.clientName || (booking.userId ? `${booking.userId.firstName} ${booking.userId.lastName}` : 'Unknown Client'),
 clientPhone: booking.clientPhone || (booking.userId ? booking.userId.phoneNumber : 'N/A'),
 serviceType: booking.serviceType,
 location: booking.location,
 estimatedCost: booking.estimatedCost,
 assignedAt: booking.assignedAt,
 estimatedArrival: booking.estimatedArrival
 }
 }
 });

 } catch (error) {
 console.error('ERROR: Accept job failed:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to accept job',
 error: error.message
 });
 }
 }

 /**
 * REJECT JOB
 * Technician declines a job request
 */
 async rejectJob(req, res) {
 try {
 const technicianId = req.user.id;
 const { id: bookingIdParam } = req.params;
 const { reason } = req.body;

 // Find the booking by custom bookingId field
 const booking = await Booking.findOne({ bookingId: bookingIdParam });

 if (!booking) {
 return res.status(404).json({
 success: false,
 message: 'Booking not found'
 });
 }

 // Log rejection (for analytics)
 if (!booking.rejectedBy) {
 booking.rejectedBy = [];
 }
 
 booking.rejectedBy.push({
 technicianId,
 reason: reason || 'Not specified',
 rejectedAt: new Date()
 });

 await booking.save();

 res.json({
 success: true,
 message: 'Job declined successfully'
 });

 } catch (error) {
 console.error('ERROR: Reject job failed:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to reject job',
 error: error.message
 });
 }
 }

 /**
 * START JOB
 * Technician marks job as started
 */
 async startJob(req, res) {
 try {
 const technicianId = req.user.id;
 const { id: bookingIdParam } = req.params;
 const { location } = req.body; // Current location when starting

 // Find and verify booking by custom bookingId field
 const booking = await Booking.findOne({ bookingId: bookingIdParam })
 .populate('userId', 'firstName lastName deviceToken');

 if (!booking) {
 return res.status(404).json({
 success: false,
 message: 'Booking not found'
 });
 }

 // Verify technician owns this booking
 if (booking.technicianId.toString() !== technicianId) {
 return res.status(403).json({
 success: false,
 message: 'You are not assigned to this job'
 });
 }

 // Check current status
 if (booking.status !== 'technician_assigned') {
 return res.status(400).json({
 success: false,
 message: `Cannot start job with current status: ${booking.status}`
 });
 }

 // Update booking status
 booking.status = 'in_progress';
 booking.startedAt = new Date();
 
 if (location) {
 booking.technicianStartLocation = {
 type: 'Point',
 coordinates: [location.longitude, location.latitude],
 address: location.address
 };
 }

 await booking.save();

 // Notify client (optional)
 try {
 if (booking.userId && NotificationService && NotificationService.createNotification) {
 await NotificationService.createNotification({
 recipientId: booking.userId._id,
 type: 'booking', // Valid enum value
 title: 'Technician Has Started',
 message: 'Your technician has started working on your request.',
 data: {
 bookingId: booking._id,
 startedAt: booking.startedAt
 }
 });
 }
 } catch (notifError) {
 console.log('Note: Could not send notification (non-critical):', notifError.message);
 }

 res.json({
 success: true,
 message: 'Job started successfully!',
 data: {
 booking: {
 _id: booking._id,
 status: booking.status,
 startedAt: booking.startedAt
 }
 }
 });

 } catch (error) {
 console.error('ERROR: Start job failed:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to start job',
 error: error.message
 });
 }
 }

 /**
 * COMPLETE JOB
 * Technician marks job as completed with photos
 */
 async completeJob(req, res) {
 try {
 const technicianId = req.user.id;
 const { id: bookingIdParam } = req.params;
 const { 
 actualCost,
 completionNotes,
 photosUrls // Array of uploaded photo URLs
 } = req.body;

 // Find and verify booking by custom bookingId field
 const booking = await Booking.findOne({ bookingId: bookingIdParam })
 .populate('userId', 'firstName lastName deviceToken');

 if (!booking) {
 return res.status(404).json({
 success: false,
 message: 'Booking not found'
 });
 }

 // Verify technician owns this booking
 if (booking.technicianId.toString() !== technicianId) {
 return res.status(403).json({
 success: false,
 message: 'You are not assigned to this job'
 });
 }

 // Check current status
 if (booking.status !== 'in_progress') {
 return res.status(400).json({
 success: false,
 message: `Cannot complete job with current status: ${booking.status}`
 });
 }

 // Update booking
 booking.status = 'completed';
 booking.completedAt = new Date();
 booking.actualCost = actualCost || booking.estimatedCost;
 booking.completionNotes = completionNotes;
 
 if (photosUrls && photosUrls.length > 0) {
 booking.completionPhotos = photosUrls;
 }

 // Calculate job duration
 if (booking.startedAt) {
 const durationMs = booking.completedAt - booking.startedAt;
 booking.actualDuration = Math.round(durationMs / (1000 * 60)); // minutes
 }

 await booking.save();

 // Update technician stats
 await User.findByIdAndUpdate(technicianId, {
 $inc: {
 'technicianProfile.completedJobs': 1
 }
 });

 // Notify client for rating (optional)
 try {
 if (booking.userId && NotificationService && NotificationService.createNotification) {
 await NotificationService.createNotification({
 recipientId: booking.userId._id,
 type: 'booking', // Valid enum value
 title: 'Job Completed!',
 message: 'Your technician has completed the work. Please rate your experience.',
 data: {
 bookingId: booking._id,
 completedAt: booking.completedAt,
 actualCost: booking.actualCost
 }
 });
 }
 } catch (notifError) {
 console.log('Note: Could not send notification (non-critical):', notifError.message);
 }

 res.json({
 success: true,
 message: 'Job completed successfully! Awaiting client confirmation.',
 data: {
 booking: {
 _id: booking._id,
 status: booking.status,
 completedAt: booking.completedAt,
 actualCost: booking.actualCost,
 actualDuration: booking.actualDuration
 }
 }
 });

 } catch (error) {
 console.error('ERROR: Complete job failed:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to complete job',
 error: error.message
 });
 }
 }

 /**
 * UPLOAD JOB PHOTOS
 * Handle photo uploads for job completion
 */
 uploadJobPhotos(req, res) {
 upload(req, res, function (err) {
 if (err instanceof multer.MulterError) {
 return res.status(400).json({
 success: false,
 message: `Upload error: ${err.message}`
 });
 } else if (err) {
 return res.status(400).json({
 success: false,
 message: err.message
 });
 }

 if (!req.files || req.files.length === 0) {
 return res.status(400).json({
 success: false,
 message: 'No files uploaded'
 });
 }

 const photoUrls = req.files.map(file => `/uploads/job-photos/${file.filename}`);

 res.json({
 success: true,
 message: `${req.files.length} photo(s) uploaded successfully`,
 data: {
 photos: photoUrls
 }
 });
 });
 }

 /**
 * GET MY JOBS
 * Fetch technician's assigned jobs
 */
 async getMyJobs(req, res) {
 try {
 const technicianId = req.user.id;
 const { 
 status, 
 page = 1, 
 limit = 20,
 dateFrom,
 dateTo
 } = req.query;

 // Build query
 const query = {
 technicianId
 };

 if (status) {
 query.status = status;
 }

 if (dateFrom || dateTo) {
 query.createdAt = {};
 if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
 if (dateTo) query.createdAt.$lte = new Date(dateTo);
 }

 // Fetch jobs with pagination
 const jobs = await Booking.find(query)
 .populate('userId', 'firstName lastName phoneNumber email')
 .sort({ createdAt: -1 })
 .limit(limit * 1)
 .skip((page - 1) * limit)
 .exec();

 const count = await Booking.countDocuments(query);

 // Group by status
 const activeJobs = jobs.filter(job => 
 ['technician_assigned', 'in_progress'].includes(job.status)
 );
 
 const completedJobs = jobs.filter(job => 
 job.status === 'completed'
 );

 res.json({
 success: true,
 data: {
 jobs: jobs.map(job => ({
 ...job.toObject(),
 clientName: `${job.userId?.firstName || ''} ${job.userId?.lastName || ''}`.trim()
 })),
 active: activeJobs.length,
 completed: completedJobs.length,
 totalPages: Math.ceil(count / limit),
 currentPage: parseInt(page),
 total: count
 }
 });

 } catch (error) {
 console.error('ERROR: Get my jobs failed:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to fetch your jobs',
 error: error.message
 });
 }
 }

 /**
 * UPDATE AVAILABILITY
 * Toggle technician's availability status
 */
 async updateAvailability(req, res) {
 try {
 const technicianId = req.user.id;
 const { 
 isAvailable, 
 emergencyAvailable,
 workingHours,
 workRadius
 } = req.body;

 const updateData = {};

 if (typeof isAvailable !== 'undefined') {
 updateData['availability.isAvailable'] = isAvailable;
 }

 if (typeof emergencyAvailable !== 'undefined') {
 updateData['technicianProfile.emergencyAvailable'] = emergencyAvailable;
 }

 if (workingHours) {
 updateData['technicianProfile.workingHours'] = workingHours;
 }

 if (workRadius) {
 updateData['technicianProfile.workRadius'] = workRadius;
 }

 const technician = await User.findByIdAndUpdate(
 technicianId,
 { $set: updateData },
 { new: true }
 ).select('availability technicianProfile');

 res.json({
 success: true,
 message: 'Availability updated successfully',
 data: {
 isAvailable: technician.availability?.isAvailable,
 technicianProfile: technician.technicianProfile
 }
 });

 } catch (error) {
 console.error('ERROR: Update availability failed:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to update availability',
 error: error.message
 });
 }
 }

 /**
 * GET EARNINGS
 * Fetch technician's earnings data
 */
 async getEarnings(req, res) {
 try {
 const technicianId = req.user.id;
 const { period = 'all' } = req.query; // 'week', 'month', 'year', 'all'

 // Get technician profile
 const technician = await User.findById(technicianId)
 .select('technicianProfile walletBalance');

 // Get earnings from completed jobs
 const dateFilter = getDateFilter(period);
 const completedJobs = await Booking.find({
 technicianId,
 status: 'completed',
 ...dateFilter
 });

 // ESCROW SYSTEM: Separate released vs pending payments
 const releasedJobs = completedJobs.filter(job => job.paymentReleased === true);
 const pendingEscrowJobs = completedJobs.filter(job => !job.paymentReleased);

 // Released earnings (available to withdraw)
 const totalEarnings = releasedJobs.reduce((sum, job) => 
 sum + (job.actualCost || job.estimatedCost || 0), 0
 );

 // Pending in escrow (waiting for client review)
 const pendingEscrow = pendingEscrowJobs.reduce((sum, job) => 
 sum + (job.actualCost || job.estimatedCost || 0), 0
 );

 // Calculate this month's earnings (both released and pending)
 const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
 const thisMonthJobs = await Booking.find({
 technicianId,
 status: 'completed',
 completedAt: { $gte: monthStart }
 });
 
 const thisMonth = thisMonthJobs.reduce((sum, job) => 
 sum + (job.actualCost || job.estimatedCost || 0), 0
 );

 // Get transactions
 const transactions = await Transaction.find({
 userId: technicianId,
 createdAt: dateFilter.createdAt
 }).sort({ createdAt: -1 }).limit(50);

 res.json({
 success: true,
 data: {
 // Wallet balance (released funds available for withdrawal)
 walletBalance: technician.walletBalance || 0,
 
 // Released earnings (client reviewed, funds released)
 totalEarnings,
 
 // Pending in escrow (awaiting client review)
 pendingEscrow,
 
 // Total from all completed jobs (released + escrow)
 totalCompleted: totalEarnings + pendingEscrow,
 
 thisMonth,
 completedJobs: completedJobs.length,
 releasedJobs: releasedJobs.length,
 pendingReviewJobs: pendingEscrowJobs.length,
 
 averageJobValue: completedJobs.length > 0 
 ? (totalEarnings + pendingEscrow) / completedJobs.length 
 : 0,
 
 transactions: transactions.map(t => ({
 _id: t._id,
 type: t.type,
 amount: t.amount,
 status: t.status,
 description: t.description,
 date: t.createdAt
 })),
 
 period
 }
 });

 } catch (error) {
 console.error('ERROR: Get earnings failed:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to fetch earnings data',
 error: error.message
 });
 }
 }

 /**
 * REQUEST WITHDRAWAL
 * Request payout to bank account
 */
 async requestWithdrawal(req, res) {
 try {
 const technicianId = req.user.id;
 const { amount, bankAccount } = req.body;

 if (!amount || amount < 1000) {
 return res.status(400).json({
 success: false,
 message: 'Minimum withdrawal amount is KES 1,000'
 });
 }

 // Get technician wallet balance
 const technician = await User.findById(technicianId);
 const availableBalance = technician.walletBalance || 0;

 if (amount > availableBalance) {
 return res.status(400).json({
 success: false,
 message: `Insufficient balance. Available: KES ${availableBalance}`
 });
 }

 // Create withdrawal transaction
 const withdrawal = new Transaction({
 userId: technicianId,
 type: 'withdrawal',
 amount: -amount,
 status: 'pending',
 description: 'Withdrawal request',
 metadata: {
 bankAccount,
 requestedAt: new Date()
 }
 });

 await withdrawal.save();

 // Deduct from wallet (will be restored if withdrawal fails)
 technician.walletBalance -= amount;
 await technician.save();

 res.json({
 success: true,
 message: 'Withdrawal request submitted successfully. Processing time: 1-3 business days.',
 data: {
 transactionId: withdrawal._id,
 amount,
 newBalance: technician.walletBalance,
 status: 'pending'
 }
 });

 } catch (error) {
 console.error('ERROR: Request withdrawal failed:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to process withdrawal request',
 error: error.message
 });
 }
 }

 /**
 * UPDATE LOCATION
 * Update technician's real-time location
 */
 async updateLocation(req, res) {
 try {
 const technicianId = req.user.id;
 const { latitude, longitude, accuracy } = req.body;

 if (!latitude || !longitude) {
 return res.status(400).json({
 success: false,
 message: 'Latitude and longitude are required'
 });
 }

 // Validate coordinates
 if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
 return res.status(400).json({
 success: false,
 message: 'Invalid coordinates'
 });
 }

 // Update technician location
 await User.findByIdAndUpdate(technicianId, {
 $set: {
 location: {
 type: 'Point',
 coordinates: [longitude, latitude]
 },
 lastLocationUpdate: new Date()
 }
 });

 res.json({
 success: true,
 message: 'Location updated successfully'
 });

 } catch (error) {
 console.error('ERROR: Update location failed:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to update location',
 error: error.message
 });
 }
 }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
 const R = 6371; // Radius of the Earth in km
 const dLat = (lat2 - lat1) * Math.PI / 180;
 const dLon = (lon2 - lon1) * Math.PI / 180;
 const a = 
 Math.sin(dLat/2) * Math.sin(dLat/2) +
 Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
 Math.sin(dLon/2) * Math.sin(dLon/2);
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
 return R * c; // Distance in km
}

// Helper function to get date filter based on period
function getDateFilter(period) {
 const now = new Date();
 const filter = {};

 switch (period) {
 case 'week':
 filter.createdAt = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
 break;
 case 'month':
 filter.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
 break;
 case 'year':
 filter.createdAt = { $gte: new Date(now.getFullYear(), 0, 1) };
 break;
 default:
 // 'all' - no date filter
 break;
 }

 return filter;
}

module.exports = new TechnicianController();
