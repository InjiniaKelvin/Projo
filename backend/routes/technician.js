/**
 * Technician Routes
 * 
 * All routes for technician-specific operations
 * Protected by authentication middleware
 */

const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { authenticateToken, requireTechnician } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireTechnician);

// ===== JOB MANAGEMENT =====

// GET /api/technician/available-jobs
router.get('/available-jobs', technicianController.getAvailableJobs);

// POST /api/technician/accept-job/:id
router.post('/accept-job/:id', technicianController.acceptJob);

// POST /api/technician/reject-job/:id
router.post('/reject-job/:id', technicianController.rejectJob);

// POST /api/technician/start-job/:id
router.post('/start-job/:id', technicianController.startJob);

// POST /api/technician/complete-job/:id
router.post('/complete-job/:id', technicianController.completeJob);

// GET /api/technician/my-jobs
router.get('/my-jobs', technicianController.getMyJobs);

// POST /api/technician/upload-photos/:id
router.post('/upload-photos/:id', technicianController.uploadJobPhotos);

// ===== AVAILABILITY & LOCATION =====

// PUT /api/technician/availability
router.put('/availability', technicianController.updateAvailability);

// POST /api/technician/location
router.post('/location', technicianController.updateLocation);

// ===== EARNINGS & PAYMENTS =====

// GET /api/technician/earnings
router.get('/earnings', technicianController.getEarnings);

// POST /api/technician/withdraw
router.post('/withdraw', technicianController.requestWithdrawal);

module.exports = router;
