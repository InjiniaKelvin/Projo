/**
 * Wallet Service - Production Ready
 * 
 * Dedicated wallet operations service
 * No mock data - all real API calls
 */

import apiClient from '../config/api';

class WalletService {
  /**
   * GET WALLET BALANCE
   * Returns full balance breakdown: available, escrow, pending
   */
  async getWalletBalance() {
    try {
      const response = await apiClient.get('/payments/wallet');
      return response.data;
    } catch (error) {
      console.error('WalletService.getWalletBalance error:', error);
      // Provide a structured error response
      throw new Error(error.response?.data?.message || 'Failed to fetch wallet balance.');
    }
  }

  /**
   * ADD FUNDS TO WALLET
   * @param {Object} params
   * @param {number} params.amount - Amount to add
   * @param {string} params.paymentMethod - 'mpesa' or 'card'
   * @param {string} params.phoneNumber - Phone for M-Pesa
   * @param {string} params.email - Email for notifications
   */
  async addFunds(params) {
    try {
      const response = await apiClient.post('/payments/add-funds', params);
      return response.data;
    } catch (error) {
      console.error('WalletService.addFunds error:', error);
      throw new Error(error.response?.data?.message || 'Failed to add funds.');
    }
  }

  /**
   * WITHDRAW FUNDS
   * @param {Object} params
   * @param {number} params.amount - Amount to withdraw
   * @param {string} params.phoneNumber - M-Pesa phone number
   */
  async withdrawFunds(params) {
    try {
      const payload = {
        amount: params.amount,
        withdrawalMethod: 'mpesa',
        withdrawalDetails: {
          phoneNumber: params.phoneNumber,
        },
      };
      const response = await apiClient.post('/payments/withdraw-funds', payload);
      return response.data;
    } catch (error) {
      console.error('WalletService.withdrawFunds error:', error);
      throw new Error(error.response?.data?.message || 'Failed to withdraw funds.');
    }
  }
}

export default new WalletService();
