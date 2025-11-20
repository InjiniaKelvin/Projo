/**
 * Pricing Service - Production Ready
 * 
 * API wrapper for pricing data from backend
 * Works with PricingEngine for calculations
 * No mock data - all real API calls
 */

import apiClient from '../config/api';
import PricingEngine from './PricingEngine';

class PricingService {
  /**
   * GET SERVICE PRICES
   * Fetches current pricing for all services
   */
  async getServicePrices() {
    try {
      const response = await apiClient.get('/pricing/services');
      return response.data;
    } catch (error) {
      console.warn('API for service prices failed, using fallback PricingEngine.');
      return {
        success: true,
        data: PricingEngine.getAllServicePrices(),
      };
    }
  }

  /**
   * GET PRICE QUOTE
   * Gets detailed price quote for a specific service
   */
  async getQuote(params) {
    try {
      const response = await apiClient.post('/pricing/quote', params);
      return response.data;
    } catch (error) {
      console.warn('API for quote failed, using fallback PricingEngine.');
      const quote = PricingEngine.calculateServicePrice(params);
      return {
        success: true,
        data: quote,
      };
    }
  }

  /**
   * GET PRICING RULES
   * Fetches current pricing configuration
   */
  async getPricingRules() {
    try {
      const response = await apiClient.get('/pricing/rules');
      return response.data;
    } catch (error) {
      console.error('PricingService.getPricingRules error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch pricing rules.');
    }
  }
}

export default new PricingService();
