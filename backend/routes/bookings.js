/**
 * BOOKING ROUTES - PHONE-BASED CLIENT ID
 * 
 * Main booking API routes using the redesigned system
 */

const express = require('express');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

// CREATE BOOKING - MAIN ENDPOINT
router.post('/', bookingController.createBooking);

// GET BOOKINGS BY PHONE NUMBER
router.get('/phone/:phoneNumber', bookingController.getBookingsByPhone);

// GET SINGLE BOOKING BY ID
router.get('/:bookingId', bookingController.getBooking);

// UPDATE BOOKING STATUS
router.patch('/:bookingId/status', bookingController.updateBookingStatus);

// ASSIGN TECHNICIAN
router.patch('/:bookingId/assign', bookingController.assignTechnician);

module.exports = router;
