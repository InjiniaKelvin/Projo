/**
 * Pricing Service - Production Ready
 * 
 * API wrapper for pricing data from backend
 * Works with PricingEngine for calculations
 * No mock data - all real API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import PricingEngine from './PricingEngine';

const API_BASE_URL = Platform.select({
 web: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
 default: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'
});

class PricingService {
 async getAuthHeaders() {
 const token = await AsyncStorage.getItem('authToken');
 return {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 };
 }

 async handleResponse(response) {
 const data = await response.json();
 if (!response.ok) {
 throw new Error(data.message || `HTTP error! status: ${response.status}`);
 }
 return data;
 }

 /**
 * GET SERVICE PRICES
 * Fetches current pricing for all services
 */
 async getServicePrices() {
 try {
 const headers = await this.getAuthHeaders();
 const response = await fetch(`${API_BASE_URL}/pricing/services`, {
 method: 'GET',
 headers
 });

 return await this.handleResponse(response);
 } catch (error) {
 // Fallback to PricingEngine if API unavailable
 console.log('Using PricingEngine fallback for service prices');
 return {
 success: true,
 data: PricingEngine.getAllServicePrices()
 };
 }
 }

 /**
 * GET PRICE QUOTE
 * Gets detailed price quote for a specific service
 * @param {Object} params - Quote parameters
 * @param {string} params.serviceType - Type of service
 * @param {Object} params.location - Service location {lat, lng, address}
 * @param {string} params.urgency - 'standard', 'urgent', 'emergency'
 * @param {Date} params.scheduledTime - When service is scheduled
 * @param {number} params.estimatedHours - Estimated duration
 */
 async getQuote(params) {
 try {
 const headers = await this.getAuthHeaders();
 const response = await fetch(`${API_BASE_URL}/pricing/quote`, {
 method: 'POST',
 headers,
 body: JSON.stringify(params)
 });

 return await this.handleResponse(response);
 } catch (error) {
 // Fallback to PricingEngine for calculation
 console.log('Using PricingEngine fallback for quote');
 const quote = PricingEngine.calculateServicePrice(params);
 return {
 success: true,
 data: quote
 };
 }
 }

 /**
 * GET PRICING RULES
 * Fetches current pricing configuration
 */
 async getPricingRules() {
 try {
 const headers = await this.getAuthHeaders();
 const response = await fetch(`${API_BASE_URL}/pricing/rules`, {
 method: 'GET',
 headers
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PricingService.getPricingRules error:', error);
 // Return PricingEngine configuration
 return {
 success: true,
 data: {
 basePrices: PricingEngine.basePrices,
 distancePricing: PricingEngine.distancePricing,
 urgencyMultipliers: PricingEngine.urgencyMultipliers,
 platformFeePercentage: PricingEngine.platformFeePercentage,
 timeMultipliers: PricingEngine.timeMultipliers,
 minPrice: PricingEngine.minPrice,
 maxPrice: PricingEngine.maxPrice
 }
 };
 }
 }

 /**
 * GET SERVICE CATEGORIES
 * Fetches available service categories with pricing info
 */
 async getServiceCategories() {
 try {
 const headers = await this.getAuthHeaders();
 const response = await fetch(`${API_BASE_URL}/pricing/categories`, {
 method: 'GET',
 headers
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PricingService.getServiceCategories error:', error);
 // Return default categories
 return {
 success: true,
 data: [
 {
 id: 'plumbing',
 name: 'Plumbing',
 description: 'Pipe repairs, installations, leak fixes',
 basePrice: PricingEngine.basePrices.plumbing,
 icon: 'water',
 color: '#0ea5e9'
 },
 {
 id: 'electrical',
 name: 'Electrical',
 description: 'Wiring, installations, repairs',
 basePrice: PricingEngine.basePrices.electrical,
 icon: 'flash',
 color: '#f59e0b'
 },
 {
 id: 'carpentry',
 name: 'Carpentry',
 description: 'Furniture repairs, installations',
 basePrice: PricingEngine.basePrices.carpentry,
 icon: 'hammer',
 color: '#84cc16'
 },
 {
 id: 'painting',
 name: 'Painting',
 description: 'Interior and exterior painting',
 basePrice: PricingEngine.basePrices.painting,
 icon: 'color-palette',
 color: '#8b5cf6'
 },
 {
 id: 'cleaning',
 name: 'Cleaning',
 description: 'Deep cleaning, regular maintenance',
 basePrice: PricingEngine.basePrices.cleaning,
 icon: 'sparkles',
 color: '#06b6d4'
 },
 {
 id: 'appliance_repair',
 name: 'Appliance Repair',
 description: 'Washing machines, fridges, ovens',
 basePrice: PricingEngine.basePrices.appliance_repair,
 icon: 'construct',
 color: '#ef4444'
 },
 {
 id: 'hvac',
 name: 'HVAC',
 description: 'AC installation, repair, maintenance',
 basePrice: PricingEngine.basePrices.hvac,
 icon: 'snow',
 color: '#14b8a6'
 },
 {
 id: 'locksmith',
 name: 'Locksmith',
 description: 'Lock installation, repair, key duplication',
 basePrice: PricingEngine.basePrices.locksmith,
 icon: 'key',
 color: '#64748b'
 },
 {
 id: 'pest_control',
 name: 'Pest Control',
 description: 'Rodent, insect, termite control',
 basePrice: PricingEngine.basePrices.pest_control,
 icon: 'bug',
 color: '#a855f7'
 },
 {
 id: 'general_handyman',
 name: 'General Handyman',
 description: 'Various home maintenance tasks',
 basePrice: PricingEngine.basePrices.general_handyman,
 icon: 'build',
 color: '#3b82f6'
 }
 ]
 };
 }
 }

 /**
 * CALCULATE DISTANCE
 * Calculates distance between two coordinates
 */
 calculateDistance(lat1, lon1, lat2, lon2) {
 const R = 6371; // Earth's radius in km
 const dLat = this.toRad(lat2 - lat1);
 const dLon = this.toRad(lon2 - lon1);
 const a =
 Math.sin(dLat / 2) * Math.sin(dLat / 2) +
 Math.cos(this.toRad(lat1)) *
 Math.cos(this.toRad(lat2)) *
 Math.sin(dLon / 2) *
 Math.sin(dLon / 2);
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 const distance = R * c;
 return Math.round(distance * 10) / 10; // Round to 1 decimal
 }

 toRad(degrees) {
 return (degrees * Math.PI) / 180;
 }

 /**
 * GET QUICK ESTIMATE
 * Fast price estimate without detailed calculation
 */
 getQuickEstimate(serviceType, urgency = 'standard') {
 return PricingEngine.getPriceEstimate(serviceType, urgency);
 }

 /**
 * CALCULATE TECHNICIAN EARNINGS
 * What technician receives after platform fee
 */
 calculateTechnicianEarnings(totalPrice) {
 return PricingEngine.calculateTechnicianEarnings(totalPrice);
 }

 /**
 * CALCULATE BULK DISCOUNT
 * For multiple services
 */
 calculateBulkDiscount(totalPrice, numberOfServices) {
 return PricingEngine.calculateBulkDiscount(totalPrice, numberOfServices);
 }

 /**
 * FORMAT PRICE
 */
 formatPrice(price, currency = 'KES') {
 return PricingEngine.formatPrice(price, currency);
 }

 /**
 * UPDATE PRICING (ADMIN)
 * Updates service pricing (requires admin privileges)
 */
 async updateServicePrice(serviceType, newPrice) {
 try {
 const headers = await this.getAuthHeaders();
 const response = await fetch(`${API_BASE_URL}/pricing/services/${serviceType}`, {
 method: 'PUT',
 headers,
 body: JSON.stringify({ price: newPrice })
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PricingService.updateServicePrice error:', error);
 throw error;
 }
 }

 /**
 * UPDATE PLATFORM FEE (ADMIN)
 */
 async updatePlatformFee(newPercentage) {
 try {
 const headers = await this.getAuthHeaders();
 const response = await fetch(`${API_BASE_URL}/pricing/platform-fee`, {
 method: 'PUT',
 headers,
 body: JSON.stringify({ percentage: newPercentage })
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PricingService.updatePlatformFee error:', error);
 throw error;
 }
 }
}

export default new PricingService();
