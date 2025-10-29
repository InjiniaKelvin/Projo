/**
 * Location Service
 * 
 * Comprehensive location management system for distance calculations,
 * service zones, and geographic optimizations.
 */

class LocationService {
 constructor() {
 // Service zones in Nairobi with their boundaries and characteristics
 this.serviceZones = {
 'westlands': {
 name: 'Westlands',
 center: { lat: -1.2676, lng: 36.8108 },
 radius: 5,
 tier: 'premium',
 priceMultiplier: 1.3
 },
 'karen': {
 name: 'Karen',
 center: { lat: -1.3197, lng: 36.6853 },
 radius: 8,
 tier: 'premium',
 priceMultiplier: 1.4
 },
 'kileleshwa': {
 name: 'Kileleshwa',
 center: { lat: -1.2830, lng: 36.7856 },
 radius: 3,
 tier: 'upmarket',
 priceMultiplier: 1.2
 },
 'lavington': {
 name: 'Lavington',
 center: { lat: -1.2830, lng: 36.7677 },
 radius: 4,
 tier: 'upmarket',
 priceMultiplier: 1.3
 },
 'upperhill': {
 name: 'Upper Hill',
 center: { lat: -1.2921, lng: 36.8219 },
 radius: 3,
 tier: 'business',
 priceMultiplier: 1.2
 },
 'downtown': {
 name: 'CBD/Downtown',
 center: { lat: -1.2921, lng: 36.8219 },
 radius: 4,
 tier: 'commercial',
 priceMultiplier: 1.0
 },
 'eastlands': {
 name: 'Eastlands',
 center: { lat: -1.2744, lng: 36.8975 },
 radius: 15,
 tier: 'residential',
 priceMultiplier: 0.9
 },
 'industrial': {
 name: 'Industrial Area',
 center: { lat: -1.3229, lng: 36.8597 },
 radius: 6,
 tier: 'industrial',
 priceMultiplier: 0.95
 },
 'satellite_towns': {
 name: 'Satellite Towns',
 center: { lat: -1.1000, lng: 36.7000 },
 radius: 25,
 tier: 'suburban',
 priceMultiplier: 1.1
 }
 };
 
 // Traffic patterns for different times
 this.trafficPatterns = {
 'rush_hour_morning': { hours: [7, 8, 9], speedMultiplier: 0.4 },
 'rush_hour_evening': { hours: [17, 18, 19], speedMultiplier: 0.4 },
 'lunch_time': { hours: [12, 13, 14], speedMultiplier: 0.7 },
 'off_peak': { speedMultiplier: 1.0 },
 'night': { hours: [22, 23, 0, 1, 2, 3, 4, 5], speedMultiplier: 1.3 }
 };
 }
 
 /**
 * Calculate distance between two coordinates using Haversine formula
 */
 async calculateDistance(coords1, coords2) {
 try {
 if (!coords1 || !coords2) {
 throw new Error('Invalid coordinates provided');
 }
 
 const lat1 = coords1.lat || coords1.latitude;
 const lng1 = coords1.lng || coords1.longitude;
 const lat2 = coords2.lat || coords2.latitude;
 const lng2 = coords2.lng || coords2.longitude;
 
 if (!lat1 || !lng1 || !lat2 || !lng2) {
 throw new Error('Incomplete coordinate data');
 }
 
 const R = 6371; // Radius of the Earth in kilometers
 const dLat = this.degreesToRadians(lat2 - lat1);
 const dLng = this.degreesToRadians(lng2 - lng1);
 
 const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
 Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
 Math.sin(dLng / 2) * Math.sin(dLng / 2);
 
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 const distance = R * c;
 
 return Math.round(distance * 100) / 100; // Round to 2 decimal places
 
 } catch (error) {
 console.error('Calculate distance error:', error);
 return 0;
 }
 }
 
 /**
 * Calculate travel time between two locations considering traffic
 */
 async calculateTravelTime(fromCoords, toCoords, travelTime = new Date()) {
 try {
 const distance = await this.calculateDistance(fromCoords, toCoords);
 const baseSpeedKmh = 30; // Base speed in Nairobi
 
 // Get traffic multiplier based on time
 const trafficMultiplier = this.getTrafficMultiplier(travelTime);
 const adjustedSpeed = baseSpeedKmh * trafficMultiplier;
 
 // Calculate time in minutes
 const timeHours = distance / adjustedSpeed;
 const timeMinutes = Math.round(timeHours * 60);
 
 // Add buffer time for city driving (lights, turns, etc.)
 const bufferTime = Math.min(distance * 2, 15); // 2 min per km, max 15 min
 
 return {
 distance,
 travelTimeMinutes: timeMinutes + bufferTime,
 trafficCondition: this.getTrafficCondition(travelTime),
 estimatedArrival: new Date(travelTime.getTime() + (timeMinutes + bufferTime) * 60000)
 };
 
 } catch (error) {
 console.error('Calculate travel time error:', error);
 return {
 distance: 0,
 travelTimeMinutes: 30,
 trafficCondition: 'unknown',
 estimatedArrival: new Date(travelTime.getTime() + 30 * 60000)
 };
 }
 }
 
 /**
 * Get service zone for given coordinates
 */
 async getServiceZone(coordinates) {
 try {
 const lat = coordinates.lat || coordinates.latitude;
 const lng = coordinates.lng || coordinates.longitude;
 
 if (!lat || !lng) {
 return 'unknown';
 }
 
 // Find the closest service zone
 let closestZone = 'downtown'; // Default zone
 let shortestDistance = Infinity;
 
 for (const [zoneKey, zone] of Object.entries(this.serviceZones)) {
 const distance = await this.calculateDistance(
 { lat, lng },
 zone.center
 );
 
 if (distance <= zone.radius && distance < shortestDistance) {
 shortestDistance = distance;
 closestZone = zoneKey;
 }
 }
 
 return closestZone;
 
 } catch (error) {
 console.error('Get service zone error:', error);
 return 'downtown';
 }
 }
 
 /**
 * Get zone information including pricing tier
 */
 async getZoneInfo(zoneKey) {
 const zone = this.serviceZones[zoneKey];
 if (!zone) {
 return this.serviceZones['downtown']; // Default to downtown
 }
 
 return {
 ...zone,
 key: zoneKey,
 coverage: await this.getZoneCoverage(zoneKey),
 demandLevel: await this.getZoneDemand(zoneKey)
 };
 }
 
 /**
 * Get zone coverage statistics
 */
 async getZoneCoverage(zoneKey) {
 // This would typically query database for technician coverage
 // For now, return mock data based on zone tier
 const zone = this.serviceZones[zoneKey];
 
 const coverageMap = {
 'premium': { technicians: 15, responseTime: 20, coverage: 95 },
 'upmarket': { technicians: 12, responseTime: 25, coverage: 90 },
 'business': { technicians: 20, responseTime: 15, coverage: 98 },
 'commercial': { technicians: 25, responseTime: 18, coverage: 95 },
 'residential': { technicians: 8, responseTime: 35, coverage: 80 },
 'industrial': { technicians: 6, responseTime: 30, coverage: 85 },
 'suburban': { technicians: 5, responseTime: 45, coverage: 70 }
 };
 
 return coverageMap[zone?.tier] || coverageMap['commercial'];
 }
 
 /**
 * Get zone demand level
 */
 async getZoneDemand(zoneKey) {
 // This would analyze booking patterns
 // For now, return based on zone characteristics
 const demandMap = {
 'westlands': 'high',
 'karen': 'medium',
 'kileleshwa': 'high',
 'lavington': 'medium',
 'upperhill': 'high',
 'downtown': 'very_high',
 'eastlands': 'medium',
 'industrial': 'low',
 'satellite_towns': 'low'
 };
 
 return demandMap[zoneKey] || 'medium';
 }
 
 /**
 * Find optimal meeting point between technician and customer
 */
 async findOptimalMeetingPoint(technicianCoords, customerCoords, preferences = {}) {
 try {
 const { preferCustomerLocation = true, maxDeviationKm = 2 } = preferences;
 
 if (preferCustomerLocation) {
 return {
 coordinates: customerCoords,
 reason: 'Customer location preferred',
 deviationKm: 0
 };
 }
 
 // Calculate midpoint
 const midLat = (technicianCoords.lat + customerCoords.lat) / 2;
 const midLng = (technicianCoords.lng + customerCoords.lng) / 2;
 
 const midpoint = { lat: midLat, lng: midLng };
 
 // Check if midpoint is within acceptable deviation
 const deviationFromCustomer = await this.calculateDistance(midpoint, customerCoords);
 
 if (deviationFromCustomer <= maxDeviationKm) {
 return {
 coordinates: midpoint,
 reason: 'Optimal midpoint selected',
 deviationKm: deviationFromCustomer
 };
 }
 
 // If midpoint is too far, suggest point closer to customer
 const ratio = maxDeviationKm / deviationFromCustomer;
 const adjustedLat = customerCoords.lat + (midLat - customerCoords.lat) * ratio;
 const adjustedLng = customerCoords.lng + (midLng - customerCoords.lng) * ratio;
 
 return {
 coordinates: { lat: adjustedLat, lng: adjustedLng },
 reason: 'Adjusted for customer convenience',
 deviationKm: maxDeviationKm
 };
 
 } catch (error) {
 console.error('Find optimal meeting point error:', error);
 return {
 coordinates: customerCoords,
 reason: 'Default to customer location',
 deviationKm: 0
 };
 }
 }
 
 /**
 * Get nearby landmarks and points of interest
 */
 async getNearbyLandmarks(coordinates, radiusKm = 1) {
 try {
 // This would typically integrate with Google Places API
 // For now, return common Nairobi landmarks based on zone
 
 const zone = await this.getServiceZone(coordinates);
 const landmarks = this.getZoneLandmarks(zone);
 
 // Filter landmarks by distance
 const nearbyLandmarks = [];
 
 for (const landmark of landmarks) {
 const distance = await this.calculateDistance(coordinates, landmark.coordinates);
 if (distance <= radiusKm) {
 nearbyLandmarks.push({
 ...landmark,
 distance: Math.round(distance * 100) / 100
 });
 }
 }
 
 return nearbyLandmarks.sort((a, b) => a.distance - b.distance);
 
 } catch (error) {
 console.error('Get nearby landmarks error:', error);
 return [];
 }
 }
 
 /**
 * Get landmarks for a specific zone
 */
 getZoneLandmarks(zoneKey) {
 const landmarkMap = {
 'westlands': [
 { name: 'Westgate Mall', coordinates: { lat: -1.2676, lng: 36.8108 }, type: 'mall' },
 { name: 'Sarit Centre', coordinates: { lat: -1.2632, lng: 36.8041 }, type: 'mall' },
 { name: 'ABC Place', coordinates: { lat: -1.2608, lng: 36.8081 }, type: 'office' }
 ],
 'karen': [
 { name: 'Karen Country Club', coordinates: { lat: -1.3197, lng: 36.6853 }, type: 'club' },
 { name: 'Karen Hospital', coordinates: { lat: -1.3245, lng: 36.6927 }, type: 'hospital' },
 { name: 'Galleria Mall', coordinates: { lat: -1.3169, lng: 36.7053 }, type: 'mall' }
 ],
 'downtown': [
 { name: 'KICC', coordinates: { lat: -1.2921, lng: 36.8219 }, type: 'landmark' },
 { name: 'City Market', coordinates: { lat: -1.2860, lng: 36.8247 }, type: 'market' },
 { name: 'Nairobi Railway Station', coordinates: { lat: -1.3044, lng: 36.8317 }, type: 'transport' }
 ]
 };
 
 return landmarkMap[zoneKey] || [];
 }
 
 /**
 * Validate address and coordinates
 */
 async validateLocation(locationData) {
 try {
 const { address, coordinates } = locationData;
 const errors = [];
 const warnings = [];
 
 // Validate coordinates
 if (!coordinates || !coordinates.lat || !coordinates.lng) {
 errors.push('Missing or invalid coordinates');
 } else {
 // Check if coordinates are within Nairobi bounds
 const nairobiBounds = {
 north: -1.09,
 south: -1.45,
 east: 37.10,
 west: 36.60
 };
 
 if (coordinates.lat < nairobiBounds.south || coordinates.lat > nairobiBounds.north ||
 coordinates.lng < nairobiBounds.west || coordinates.lng > nairobiBounds.east) {
 warnings.push('Location appears to be outside Nairobi service area');
 }
 }
 
 // Validate address
 if (!address || address.length < 10) {
 warnings.push('Address seems incomplete');
 }
 
 // Get zone information
 let zone = null;
 if (coordinates && coordinates.lat && coordinates.lng) {
 zone = await this.getServiceZone(coordinates);
 }
 
 return {
 isValid: errors.length === 0,
 errors,
 warnings,
 zone,
 suggestions: errors.length > 0 ? this.getLocationSuggestions(locationData) : []
 };
 
 } catch (error) {
 console.error('Validate location error:', error);
 return {
 isValid: false,
 errors: ['Location validation failed'],
 warnings: [],
 zone: null,
 suggestions: []
 };
 }
 }
 
 /**
 * Get location improvement suggestions
 */
 getLocationSuggestions(locationData) {
 const suggestions = [];
 
 if (!locationData.coordinates) {
 suggestions.push('Please provide GPS coordinates for accurate location');
 }
 
 if (!locationData.address || locationData.address.length < 10) {
 suggestions.push('Please provide a more detailed address including building name or landmarks');
 }
 
 if (!locationData.landmark) {
 suggestions.push('Adding a nearby landmark will help technicians find you faster');
 }
 
 return suggestions;
 }
 
 /**
 * Get traffic multiplier based on current time
 */
 getTrafficMultiplier(dateTime) {
 const hour = dateTime.getHours();
 
 for (const [, data] of Object.entries(this.trafficPatterns)) {
 if (data.hours && data.hours.includes(hour)) {
 return data.speedMultiplier;
 }
 }
 
 return this.trafficPatterns.off_peak.speedMultiplier;
 }
 
 /**
 * Get traffic condition description
 */
 getTrafficCondition(dateTime) {
 const hour = dateTime.getHours();
 
 if ([7, 8, 9, 17, 18, 19].includes(hour)) {
 return 'heavy';
 } else if ([12, 13, 14].includes(hour)) {
 return 'moderate';
 } else if ([22, 23, 0, 1, 2, 3, 4, 5].includes(hour)) {
 return 'light';
 }
 
 return 'normal';
 }
 
 /**
 * Convert degrees to radians
 */
 degreesToRadians(degrees) {
 return degrees * (Math.PI / 180);
 }
 
 /**
 * Get route optimization suggestions
 */
 async getRouteOptimizations(locations) {
 try {
 if (locations.length < 2) {
 return { optimizedOrder: locations, totalDistance: 0, estimatedTime: 0 };
 }
 
 // Calculate distance matrix
 const distanceMatrix = new Map();
 
 for (let i = 0; i < locations.length; i++) {
 for (let j = 0; j < locations.length; j++) {
 if (i !== j) {
 const distance = await this.calculateDistance(
 locations[i].coordinates,
 locations[j].coordinates
 );
 distanceMatrix.set(`${i}-${j}`, distance);
 }
 }
 }
 
 // Simple nearest neighbor optimization
 const optimized = this.nearestNeighborRoute(locations, distanceMatrix);
 
 return optimized;
 
 } catch (error) {
 console.error('Get route optimizations error:', error);
 return { optimizedOrder: locations, totalDistance: 0, estimatedTime: 0 };
 }
 }
 
 /**
 * Nearest neighbor route optimization
 */
 nearestNeighborRoute(locations, distanceMatrix) {
 if (locations.length <= 1) {
 return { optimizedOrder: locations, totalDistance: 0, estimatedTime: 0 };
 }
 
 const visited = new Set();
 const optimizedOrder = [];
 let current = 0;
 let totalDistance = 0;
 
 visited.add(current);
 optimizedOrder.push(locations[current]);
 
 while (visited.size < locations.length) {
 let nearest = -1;
 let shortestDistance = Infinity;
 
 for (let i = 0; i < locations.length; i++) {
 if (visited.has(i)) continue;
 
 const distance = distanceMatrix.get(`${current}-${i}`) || 0;
 if (distance < shortestDistance) {
 shortestDistance = distance;
 nearest = i;
 }
 }
 
 if (nearest !== -1) {
 visited.add(nearest);
 optimizedOrder.push(locations[nearest]);
 totalDistance += shortestDistance;
 current = nearest;
 }
 }
 
 // Estimate time (30 km/h average speed + 10 min per stop)
 const estimatedTime = (totalDistance / 30) * 60 + (locations.length - 1) * 10;
 
 return {
 optimizedOrder,
 totalDistance: Math.round(totalDistance * 100) / 100,
 estimatedTime: Math.round(estimatedTime)
 };
 }
 
 /**
 * Get service coverage heat map data
 */
 async getServiceCoverageHeatMap() {
 const heatMapData = [];
 
 for (const [zoneKey, zone] of Object.entries(this.serviceZones)) {
 const coverage = await this.getZoneCoverage(zoneKey);
 const demand = await this.getZoneDemand(zoneKey);
 
 heatMapData.push({
 zone: zoneKey,
 name: zone.name,
 center: zone.center,
 radius: zone.radius,
 coverage: coverage.coverage,
 technicians: coverage.technicians,
 responseTime: coverage.responseTime,
 demand,
 tier: zone.tier,
 intensity: this.calculateIntensity(coverage.coverage, demand)
 });
 }
 
 return heatMapData;
 }
 
 /**
 * Calculate intensity for heat map
 */
 calculateIntensity(coverage, demand) {
 const demandWeights = { low: 0.2, medium: 0.5, high: 0.8, very_high: 1.0 };
 const demandWeight = demandWeights[demand] || 0.5;
 const coverageWeight = coverage / 100;
 
 return Math.round((demandWeight * 0.6 + coverageWeight * 0.4) * 100);
 }
}

module.exports = new LocationService();
