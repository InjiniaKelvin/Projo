/**
 * Rating Routes
 * 
 * API routes for rating and review functionality
 */

const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// PUBLIC RATING ROUTES (authenticated users)

/**
 * Submit a new rating
 * POST /api/ratings
 * Body: { bookingId, ratings: { service, technician, overall }, feedback, quickFeedback, media }
 */
router.post('/', ratingController.submitRating);

/**
 * Get all ratings for a specific technician
 * GET /api/ratings/technician/:technicianId
 * Query params: page, limit, sortBy (recent|highest|lowest)
 */
router.get('/technician/:technicianId', ratingController.getTechnicianRatings);

/**
 * Get rating for a specific booking
 * GET /api/ratings/booking/:bookingId
 */
router.get('/booking/:bookingId', ratingController.getBookingRating);

/**
 * Get customer's own rating history
 * GET /api/ratings/customer/history
 * Query params: page, limit
 */
router.get('/customer/history', ratingController.getCustomerRatings);

/**
 * Flag a rating as inappropriate
 * POST /api/ratings/:ratingId/flag
 * Body: { reason }
 */
router.post('/:ratingId/flag', ratingController.flagRating);

/**
 * Technician responds to a rating
 * POST /api/ratings/:ratingId/respond
 * Body: { response }
 */
router.post('/:ratingId/respond', ratingController.respondToRating);

/**
 * Mark a rating as helpful
 * POST /api/ratings/:ratingId/helpful
 */
router.post('/:ratingId/helpful', ratingController.markHelpful);

// ADMIN ROUTES (require admin role)

/**
 * Get all flagged ratings for moderation
 * GET /api/ratings/admin/flagged
 * Query params: page, limit
 */
router.get('/admin/flagged', ratingController.getFlaggedRatings);

/**
 * Get rating statistics for admin dashboard
 * GET /api/ratings/admin/statistics
 */
router.get('/admin/statistics', ratingController.getRatingStatistics);

/**
 * Moderate a flagged rating
 * PUT /api/ratings/:ratingId/moderate
 * Body: { action: 'approve'|'reject'|'remove', notes }
 */
router.put('/:ratingId/moderate', ratingController.moderateRating);

/**
 * Delete a rating (soft delete)
 * DELETE /api/ratings/:ratingId
 */
router.delete('/:ratingId', ratingController.deleteRating);

module.exports = router;
