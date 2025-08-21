/**
 * Services Routes
 * API endpoints for service management
 */

const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', servicesController.getServices);
router.get('/categories', servicesController.getCategories);
router.get('/popular', servicesController.getPopularServices);
router.get('/emergency', servicesController.getEmergencyServices);
router.get('/search', servicesController.searchServices);
router.get('/category/:category', servicesController.getServicesByCategory);
router.get('/:serviceId', servicesController.getService);

// Admin only routes
router.post('/', authenticateToken, requireRole(['admin']), servicesController.createService);
router.put('/:serviceId', authenticateToken, requireRole(['admin']), servicesController.updateService);
router.delete('/:serviceId', authenticateToken, requireRole(['admin']), servicesController.deleteService);

module.exports = router;
