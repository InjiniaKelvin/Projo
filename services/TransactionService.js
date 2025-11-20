/**
 * Transaction Service - Production Ready
 * 
 * Handles transaction history, filtering, exports
 * No mock data - all real API calls
 */

import apiClient from '../config/api';

class TransactionService {
  /**
   * GET TRANSACTION HISTORY
   * @param {Object} filters - Filter options
   */
  async getTransactionHistory(filters = {}) {
    try {
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 20).toString(),
        ...filters,
      });

      const response = await apiClient.get(`/payments/transactions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('TransactionService.getTransactionHistory error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction history.');
    }
  }

  /**
   * GET TRANSACTION BY ID
   */
  async getTransactionById(transactionId) {
    try {
      const response = await apiClient.get(`/payments/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('TransactionService.getTransactionById error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction details.');
    }
  }

  /**
   * GET TRANSACTION STATISTICS
   * @param {string} period - '7d', '30d', '90d', '1y'
   */
  async getTransactionStats(period = '30d') {
    try {
      const response = await apiClient.get(`/payments/transactions/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('TransactionService.getTransactionStats error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction statistics.');
    }
  }
}

export default new TransactionService();
