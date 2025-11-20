/**
 * Payment Service - Production Ready
 * 
 * Fully integrated with IntaSend backend
 * Uses centralized axios instance for authentication
 */

import apiClient from '../config/api';

class PaymentService {
  async getWallet() {
    try {
      const response = await apiClient.get('/payments/wallet');
      return response.data;
    } catch (error) {
      console.error('PaymentService.getWallet error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: { balance: 0, escrowBalance: 0 },
      };
    }
  }

  async addFunds(params) {
    try {
      const { amount, paymentMethod, phoneNumber, email } = params;
      const response = await apiClient.post('/payments/add-funds', {
        amount,
        paymentMethod,
        phoneNumber,
        email,
        description: `Wallet top-up via ${paymentMethod}`,
      });
      return response.data;
    } catch (error) {
      console.error('PaymentService.addFunds error:', error);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async withdrawFunds(params) {
    try {
      const { amount, phoneNumber } = params;
      const response = await apiClient.post('/payments/withdraw-funds', {
        amount,
        withdrawalMethod: 'mpesa',
        withdrawalDetails: {
          phoneNumber,
        },
      });
      return response.data;
    } catch (error) {
      console.error('PaymentService.withdrawFunds error:', error);
      throw error;
    }
  }

  async depositToEscrow(params) {
    try {
      const { amount, bookingId, description } = params;
      const response = await apiClient.post('/payments/escrow/deposit', {
        amount,
        bookingId,
        description: description || `Escrow for booking ${bookingId}`,
      });
      return response.data;
    } catch (error) {
      console.error('PaymentService.depositToEscrow error:', error);
      throw error;
    }
  }

  async releaseFromEscrow(params) {
    try {
      const { amount, bookingId, recipientUserId, description } = params;
      const response = await apiClient.post('/payments/escrow/release', {
        amount,
        bookingId,
        recipientUserId,
        description: description || `Payment for booking ${bookingId}`,
      });
      return response.data;
    } catch (error) {
      console.error('PaymentService.releaseFromEscrow error:', error);
      throw error;
    }
  }
}

export default new PaymentService();
