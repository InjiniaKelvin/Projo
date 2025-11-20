/**
 * REDESIGNED BOOKING ROUTES - PHONE-BASED CLIENT ID
 * 
 * Simplified, consistent API routes matching the redesigned system
 */

const express = require('express');
const bookingController = require('../controllers/BookingControllerRedesigned');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET CLIENT BOOKINGS (Protected)
router.get('/client', authenticateToken, bookingController.getClientBookings);

// CREATE BOOKING - MAIN ENDPOINT
router.post('/redesigned', bookingController.createBooking);

// GET BOOKINGS BY PHONE NUMBER
router.get('/phone/:phoneNumber', bookingController.getBookingsByPhone);

// GET BOOKINGS BY EMAIL
router.get('/email/:email', bookingController.getBookingsByEmail);

// GET SINGLE BOOKING BY ID
router.get('/:bookingId', bookingController.getBooking);

// UPDATE BOOKING STATUS
router.patch('/:bookingId/status', bookingController.updateBookingStatus);

// ASSIGN TECHNICIAN
router.patch('/:bookingId/assign', bookingController.assignTechnician);

module.exports = router;
