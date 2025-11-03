/**
 * Services Controller
 * Manages service catalog, categories, and service-related operations
 */

const { Service } = require('../models');

class ServicesController {
 /**
 * Get all active services with filtering and pagination
 */
 async getServices(req, res) {
 try {
 const {
 category,
 subcategory,
 search,
 minPrice,
 maxPrice,
 skillLevel,
 emergency,
 page = 1,
 limit = 20,
 sortBy = 'popularity'
 } = req.query;

 // Build filter object
 const filter = { isActive: true };
 
 if (category) filter.category = category;
 if (subcategory) filter.subcategory = subcategory;
 if (skillLevel) filter.skillLevel = skillLevel;
 if (emergency !== undefined) filter.isEmergencyService = emergency === 'true';
 
 if (minPrice || maxPrice) {
 filter['priceRange.min'] = {};
 if (minPrice) filter['priceRange.min'].$gte = parseInt(minPrice);
 if (maxPrice) filter['priceRange.max'] = { $lte: parseInt(maxPrice) };
 }

 // Build sort object
 let sort = {};
 switch (sortBy) {
 case 'price_low':
 sort = { 'priceRange.min': 1 };
 break;
 case 'price_high':
 sort = { 'priceRange.max': -1 };
 break;
 case 'rating':
 sort = { averageRating: -1, totalRatings: -1 };
 break;
 case 'duration':
 sort = { estimatedDuration: 1 };
 break;
 default:
 sort = { popularity: -1, averageRating: -1 };
 }

 let query;
 if (search) {
 query = Service.searchServices(search, filter);
 } else {
 query = Service.find(filter).sort(sort);
 }

 const services = await query
 .limit(limit * 1)
 .skip((page - 1) * limit)
 .lean();

 const total = await Service.countDocuments(filter);

 res.json({
 success: true,
 data: {
 services,
 pagination: {
 page: parseInt(page),
 limit: parseInt(limit),
 total,
 pages: Math.ceil(total / limit)
 }
 }
 });
 } catch (error) {
 console.error('Get services error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to get services',
 error: error.message
 });
 }
 }

 /**
 * Get service by ID
 */
 async getService(req, res) {
 try {
 const { serviceId } = req.params;
 
 const service = await Service.findById(serviceId);
 
 if (!service || !service.isActive) {
 return res.status(404).json({
 success: false,
 message: 'Service not found'
 });
 }

 // Increment popularity
 await service.incrementPopularity();

 res.json({
 success: true,
 data: { service }
 });
 } catch (error) {
 console.error('Get service error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to get service',
 error: error.message
 });
 }
 }

 /**
 * Get service categories
 */
 async getCategories(req, res) {
 try {
 const categories = await Service.aggregate([
 { $match: { isActive: true } },
 {
 $group: {
 _id: '$category',
 count: { $sum: 1 },
 avgPrice: { $avg: '$basePrice' },
 subcategories: { $addToSet: '$subcategory' }
 }
 },
 { $sort: { count: -1 } }
 ]);

 const categoryMap = {
 plumbing: { name: 'Plumbing', icon: 'water-outline', color: '#0ea5e9' },
 electrical: { name: 'Electrical', icon: 'flash-outline', color: '#f59e0b' },
 carpentry: { name: 'Carpentry', icon: 'hammer-outline', color: '#8b5cf6' },
 painting: { name: 'Painting', icon: 'color-palette-outline', color: '#06b6d4' },
 'appliance-repair': { name: 'Appliance Repair', icon: 'home-outline', color: '#10b981' },
 hvac: { name: 'HVAC', icon: 'thermometer-outline', color: '#f97316' },
 roofing: { name: 'Roofing', icon: 'home-outline', color: '#6366f1' },
 landscaping: { name: 'Landscaping', icon: 'leaf-outline', color: '#22c55e' },
 cleaning: { name: 'Cleaning', icon: 'sparkles-outline', color: '#a855f7' },
 security: { name: 'Security', icon: 'shield-outline', color: '#ef4444' },
 automotive: { name: 'Automotive', icon: 'car-outline', color: '#3b82f6' },
 electronics: { name: 'Electronics', icon: 'hardware-chip-outline', color: '#64748b' },
 other: { name: 'Other', icon: 'construct-outline', color: '#6b7280' }
 };

 const enrichedCategories = categories.map(cat => ({
 id: cat._id,
 ...categoryMap[cat._id],
 serviceCount: cat.count,
 averagePrice: Math.round(cat.avgPrice),
 subcategories: cat.subcategories.filter(sub => sub)
 }));

 res.json({
 success: true,
 data: { categories: enrichedCategories }
 });
 } catch (error) {
 console.error('Get categories error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to get categories',
 error: error.message
 });
 }
 }

 /**
 * Get popular services
 */
 async getPopularServices(req, res) {
 try {
 const { limit = 10 } = req.query;
 
 const services = await Service.getPopularServices(parseInt(limit));

 res.json({
 success: true,
 data: { services }
 });
 } catch (error) {
 console.error('Get popular services error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to get popular services',
 error: error.message
 });
 }
 }

 /**
 * Search services
 */
 async searchServices(req, res) {
 try {
 const { q: query, category, limit = 20 } = req.query;
 
 if (!query || query.trim().length < 2) {
 return res.status(400).json({
 success: false,
 message: 'Query must be at least 2 characters long'
 });
 }

 const filters = {};
 if (category) filters.category = category;

 const services = await Service.searchServices(query, filters)
 .limit(parseInt(limit));

 res.json({
 success: true,
 data: { services, query }
 });
 } catch (error) {
 console.error('Search services error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to search services',
 error: error.message
 });
 }
 }

 /**
 * Get emergency services
 */
 async getEmergencyServices(req, res) {
 try {
 const services = await Service.find({
 isActive: true,
 isEmergencyService: true
 })
 .sort({ popularity: -1 })
 .limit(20);

 res.json({
 success: true,
 data: { services }
 });
 } catch (error) {
 console.error('Get emergency services error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to get emergency services',
 error: error.message
 });
 }
 }

 /**
 * Get services by category
 */
 async getServicesByCategory(req, res) {
 try {
 const { category } = req.params;
 const { subcategory, page = 1, limit = 20 } = req.query;

 const filter = { 
 isActive: true,
 category: category.toLowerCase()
 };
 
 if (subcategory) {
 filter.subcategory = subcategory;
 }

 const services = await Service.find(filter)
 .sort({ popularity: -1, averageRating: -1 })
 .limit(limit * 1)
 .skip((page - 1) * limit);

 const total = await Service.countDocuments(filter);

 res.json({
 success: true,
 data: {
 services,
 category,
 pagination: {
 page: parseInt(page),
 limit: parseInt(limit),
 total,
 pages: Math.ceil(total / limit)
 }
 }
 });
 } catch (error) {
 console.error('Get services by category error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to get services by category',
 error: error.message
 });
 }
 }

 /**
 * Create new service (Admin only)
 */
 async createService(req, res) {
 try {
 const service = new Service(req.body);
 await service.save();

 res.status(201).json({
 success: true,
 message: 'Service created successfully',
 data: { service }
 });
 } catch (error) {
 console.error('Create service error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to create service',
 error: error.message
 });
 }
 }

 /**
 * Update service (Admin only)
 */
 async updateService(req, res) {
 try {
 const { serviceId } = req.params;
 
 const service = await Service.findByIdAndUpdate(
 serviceId,
 req.body,
 { new: true, runValidators: true }
 );

 if (!service) {
 return res.status(404).json({
 success: false,
 message: 'Service not found'
 });
 }

 res.json({
 success: true,
 message: 'Service updated successfully',
 data: { service }
 });
 } catch (error) {
 console.error('Update service error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to update service',
 error: error.message
 });
 }
 }

 /**
 * Delete service (Admin only)
 */
 async deleteService(req, res) {
 try {
 const { serviceId } = req.params;
 
 const service = await Service.findByIdAndUpdate(
 serviceId,
 { isActive: false },
 { new: true }
 );

 if (!service) {
 return res.status(404).json({
 success: false,
 message: 'Service not found'
 });
 }

 res.json({
 success: true,
 message: 'Service deactivated successfully'
 });
 } catch (error) {
 console.error('Delete service error:', error);
 res.status(500).json({
 success: false,
 message: 'Failed to delete service',
 error: error.message
 });
 }
 }
}

module.exports = new ServicesController();
