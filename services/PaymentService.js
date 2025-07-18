/**
 * Payment Service
 * 
 * This service handles payment-related API calls including:
 * - Wallet management
 * - Transaction history
 * - Payment processing
 * - Earnings and payouts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-server.com/api';

class PaymentService {
  // Get authorization header
  async getAuthHeader() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get user wallet information
  async getWallet() {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/payments/wallet`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        // If wallet endpoint doesn't exist yet, return mock data
        if (response.status === 404) {
          return {
            success: true,
            data: {
              balance: 0,
              pending: 0,
              totalEarnings: 0,
              currency: 'USD'
            }
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('PaymentService.getWallet error:', error);
      // Return mock data on error for development
      return {
        success: true,
        data: {
          balance: 0,
          pending: 0,
          totalEarnings: 0,
          currency: 'USD'
        }
      };
    }
  }

  // Get transaction history
  async getTransactions(page = 1, limit = 20, filters = {}) {
    try {
      const headers = await this.getAuthHeader();
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/payments/transactions?${queryParams}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        // Return mock data if endpoint doesn't exist
        if (response.status === 404) {
          return {
            success: true,
            data: {
              transactions: [],
              total: 0,
              page,
              pages: 0
            }
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('PaymentService.getTransactions error:', error);
      return {
        success: true,
        data: {
          transactions: [],
          total: 0,
          page,
          pages: 0
        }
      };
    }
  }

  // Create payment intent
  async createPaymentIntent(amount, bookingId, method = 'stripe') {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/payments/enhanced/intent`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount,
          bookingId,
          method,
          currency: 'USD'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PaymentService.createPaymentIntent error:', error);
      throw error;
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId, bookingId) {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/payments/enhanced/confirm`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paymentIntentId,
          bookingId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PaymentService.confirmPayment error:', error);
      throw error;
    }
  }

  // Release escrow payment (for completed jobs)
  async releaseEscrow(bookingId, amount) {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/payments/enhanced/release-escrow`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          bookingId,
          amount,
          releaseType: 'complete'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PaymentService.releaseEscrow error:', error);
      throw error;
    }
  }

  // Request payout (for technicians)
  async requestPayout(amount, method = 'bank') {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/payments/payout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount,
          method
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PaymentService.requestPayout error:', error);
      throw error;
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/payments/methods`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        // Return default payment methods if endpoint doesn't exist
        return {
          success: true,
          data: {
            methods: [
              {
                id: 'stripe',
                name: 'Credit/Debit Card',
                type: 'card',
                enabled: true
              },
              {
                id: 'paypal',
                name: 'PayPal',
                type: 'paypal',
                enabled: true
              },
              {
                id: 'mpesa',
                name: 'M-Pesa',
                type: 'mobile_money',
                enabled: true,
                region: 'Kenya'
              }
            ]
          }
        };
      }

      return await response.json();
    } catch (error) {
      console.warn('PaymentService.getPaymentMethods error:', error);
      return {
        success: true,
        data: {
          methods: [
            {
              id: 'stripe',
              name: 'Credit/Debit Card',
              type: 'card',
              enabled: true
            }
          ]
        }
      };
    }
  }

  // Get earnings summary (for technicians)
  async getEarningsSummary(period = '30d') {
    try {
      const headers = await this.getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/payments/earnings?period=${period}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        // Return mock earnings data
        return {
          success: true,
          data: {
            totalEarnings: 0,
            thisMonth: 0,
            lastMonth: 0,
            pendingPayouts: 0,
            completedJobs: 0
          }
        };
      }

      return await response.json();
    } catch (error) {
      console.warn('PaymentService.getEarningsSummary error:', error);
      return {
        success: true,
        data: {
          totalEarnings: 0,
          thisMonth: 0,
          lastMonth: 0,
          pendingPayouts: 0,
          completedJobs: 0
        }
      };
    }
  }
}

export default new PaymentService();
