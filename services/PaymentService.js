// services/PaymentService.js
// Comprehensive payment service supporting MPesa, Stripe, PayPal, and Bank transfers

import axios from 'axios';

// Payment gateway configuration
const PAYMENT_CONFIG = {
  STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_key_here', // Replace with actual key
  PAYPAL_CLIENT_ID: 'your_paypal_client_id_here', // Replace with actual client ID
  MPESA_API_URL: 'https://sandbox.safaricom.co.ke', // Use production URL for live
  API_BASE_URL: 'http://localhost:3000/api', // Replace with your backend URL
};

/**
 * Payment Service Class
 * Handles all payment operations across multiple gateways
 */
class PaymentService {
  
  /**
   * Initialize payment service with user session
   * @param {string} userToken - Authentication token
   */
  static setUserToken(userToken) {
    this.userToken = userToken;
  }

  // ==================== STRIPE PAYMENT METHODS ====================

  /**
   * Process Stripe payment
   * @param {Object} paymentData - Payment information
   * @param {number} paymentData.amount - Amount in cents
   * @param {string} paymentData.currency - Currency code (USD, KES, etc.)
   * @param {string} paymentData.paymentMethodId - Stripe payment method ID
   * @param {string} paymentData.description - Payment description
   * @returns {Promise<Object>} Payment result
   */
  static async processStripePayment(paymentData) {
    try {
      console.log('Processing Stripe payment:', paymentData);

      // Mock successful Stripe payment for development
      // In production, integrate with Stripe SDK
      const response = await axios.post(`${PAYMENT_CONFIG.API_BASE_URL}/payments/stripe`, {
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        payment_method: paymentData.paymentMethodId,
        description: paymentData.description,
        metadata: {
          userId: paymentData.userId,
          serviceId: paymentData.serviceId,
        },
      }, {
        headers: {
          'Authorization': `Bearer ${this.userToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Mock response for development
      const mockResponse = {
        success: true,
        transactionId: `stripe_${Date.now()}`,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        status: 'succeeded',
        paymentMethod: 'stripe_card',
        receiptUrl: `https://stripe.com/receipt/${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      console.log('Stripe payment successful:', mockResponse);
      return mockResponse;

    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        error: error.message || 'Stripe payment failed',
        code: 'STRIPE_ERROR',
      };
    }
  }

  // ==================== PAYPAL PAYMENT METHODS ====================

  /**
   * Process PayPal payment
   * @param {Object} paymentData - Payment information
   * @param {number} paymentData.amount - Amount
   * @param {string} paymentData.currency - Currency code
   * @param {string} paymentData.description - Payment description
   * @returns {Promise<Object>} Payment result
   */
  static async processPayPalPayment(paymentData) {
    try {
      console.log('Processing PayPal payment:', paymentData);

      // Mock PayPal integration for development
      // In production, integrate with PayPal SDK
      const response = await axios.post(`${PAYMENT_CONFIG.API_BASE_URL}/payments/paypal`, {
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        description: paymentData.description,
        return_url: 'quickfix://payment/success',
        cancel_url: 'quickfix://payment/cancel',
      }, {
        headers: {
          'Authorization': `Bearer ${this.userToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Mock response for development
      const mockResponse = {
        success: true,
        transactionId: `paypal_${Date.now()}`,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        status: 'completed',
        paymentMethod: 'paypal',
        payerEmail: 'user@example.com',
        createdAt: new Date().toISOString(),
      };

      console.log('PayPal payment successful:', mockResponse);
      return mockResponse;

    } catch (error) {
      console.error('PayPal payment error:', error);
      return {
        success: false,
        error: error.message || 'PayPal payment failed',
        code: 'PAYPAL_ERROR',
      };
    }
  }

  // ==================== MPESA PAYMENT METHODS ====================

  /**
   * Process MPesa STK Push payment
   * @param {Object} paymentData - Payment information
   * @param {number} paymentData.amount - Amount in KES
   * @param {string} paymentData.phoneNumber - Phone number (254XXXXXXXXX format)
   * @param {string} paymentData.description - Payment description
   * @returns {Promise<Object>} Payment result
   */
  static async processMPesaPayment(paymentData) {
    try {
      console.log('Processing MPesa payment:', paymentData);

      // Validate phone number format
      if (!this.validateKenyanPhoneNumber(paymentData.phoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format. Use 254XXXXXXXXX',
          code: 'INVALID_PHONE',
        };
      }

      // Mock MPesa STK Push for development
      // In production, integrate with Safaricom MPesa API
      const response = await axios.post(`${PAYMENT_CONFIG.API_BASE_URL}/payments/mpesa`, {
        BusinessShortCode: '174379', // Sandbox shortcode
        Password: 'MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjMwNjEwMTAyMzU5', // Sandbox password
        Timestamp: this.generateMPesaTimestamp(),
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(paymentData.amount),
        PartyA: paymentData.phoneNumber,
        PartyB: '174379',
        PhoneNumber: paymentData.phoneNumber,
        CallBackURL: `${PAYMENT_CONFIG.API_BASE_URL}/payments/mpesa/callback`,
        AccountReference: `QuickFix-${Date.now()}`,
        TransactionDesc: paymentData.description,
      }, {
        headers: {
          'Authorization': `Bearer ${this.userToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Mock response for development
      const mockResponse = {
        success: true,
        transactionId: `mpesa_${Date.now()}`,
        checkoutRequestId: `ws_CO_${Date.now()}`,
        amount: Math.round(paymentData.amount),
        currency: 'KES',
        status: 'pending', // Will be updated via callback
        paymentMethod: 'mpesa',
        phoneNumber: paymentData.phoneNumber,
        merchantRequestId: `merchant_${Date.now()}`,
        createdAt: new Date().toISOString(),
        message: 'STK Push sent successfully. Check your phone to complete payment.',
      };

      console.log('MPesa STK Push sent:', mockResponse);
      return mockResponse;

    } catch (error) {
      console.error('MPesa payment error:', error);
      return {
        success: false,
        error: error.message || 'MPesa payment failed',
        code: 'MPESA_ERROR',
      };
    }
  }

  /**
   * Check MPesa payment status
   * @param {string} checkoutRequestId - Checkout request ID from STK Push
   * @returns {Promise<Object>} Payment status
   */
  static async checkMPesaPaymentStatus(checkoutRequestId) {
    try {
      // Mock status check for development
      const mockStatuses = ['pending', 'completed', 'failed', 'cancelled'];
      const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];

      return {
        success: true,
        status: randomStatus,
        transactionId: `mpesa_${Date.now()}`,
        mpesaReceiptNumber: randomStatus === 'completed' ? `NLJ7RT61SV` : null,
        resultDesc: randomStatus === 'completed' ? 'The service request is processed successfully.' : 'Payment pending',
      };

    } catch (error) {
      console.error('MPesa status check error:', error);
      return {
        success: false,
        error: error.message || 'Failed to check payment status',
      };
    }
  }

  // ==================== BANK TRANSFER METHODS ====================

  /**
   * Process bank transfer
   * @param {Object} transferData - Transfer information
   * @param {number} transferData.amount - Amount to transfer
   * @param {string} transferData.currency - Currency code
   * @param {Object} transferData.bankAccount - Bank account details
   * @param {string} transferData.description - Transfer description
   * @returns {Promise<Object>} Transfer result
   */
  static async processBankTransfer(transferData) {
    try {
      console.log('Processing bank transfer:', transferData);

      // Mock bank transfer for development
      // In production, integrate with banking APIs (Plaid, Open Banking, etc.)
      const response = await axios.post(`${PAYMENT_CONFIG.API_BASE_URL}/payments/bank-transfer`, {
        amount: transferData.amount,
        currency: transferData.currency || 'USD',
        bank_account: transferData.bankAccount,
        description: transferData.description,
        routing_number: transferData.bankAccount.routingNumber,
        account_number: transferData.bankAccount.accountNumber,
        account_holder_name: transferData.bankAccount.accountHolderName,
      }, {
        headers: {
          'Authorization': `Bearer ${this.userToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Mock response for development
      const mockResponse = {
        success: true,
        transactionId: `bank_${Date.now()}`,
        amount: transferData.amount,
        currency: transferData.currency || 'USD',
        status: 'processing', // Bank transfers take time
        paymentMethod: 'bank_transfer',
        bankName: transferData.bankAccount.bankName,
        accountLast4: transferData.bankAccount.accountNumber.slice(-4),
        estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
        createdAt: new Date().toISOString(),
      };

      console.log('Bank transfer initiated:', mockResponse);
      return mockResponse;

    } catch (error) {
      console.error('Bank transfer error:', error);
      return {
        success: false,
        error: error.message || 'Bank transfer failed',
        code: 'BANK_TRANSFER_ERROR',
      };
    }
  }

  // ==================== PAYMENT VALIDATION METHODS ====================

  /**
   * Validate Kenyan phone number format for MPesa
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} Is valid format
   */
  static validateKenyanPhoneNumber(phoneNumber) {
    const kenyanPhoneRegex = /^254[17]\d{8}$/;
    return kenyanPhoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number for MPesa
   * @param {string} phoneNumber - Phone number to format
   * @returns {string} Formatted phone number
   */
  static formatPhoneNumberForMPesa(phoneNumber) {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Handle different input formats
    if (digits.startsWith('254')) {
      return digits;
    } else if (digits.startsWith('07') || digits.startsWith('01')) {
      return '254' + digits.substring(1);
    } else if (digits.startsWith('7') || digits.startsWith('1')) {
      return '254' + digits;
    }
    
    return phoneNumber; // Return as-is if can't format
  }

  /**
   * Generate MPesa timestamp
   * @returns {string} Timestamp in required format
   */
  static generateMPesaTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Validate payment amount
   * @param {number} amount - Amount to validate
   * @param {string} currency - Currency code
   * @returns {Object} Validation result
   */
  static validatePaymentAmount(amount, currency = 'USD') {
    const minAmounts = {
      USD: 0.50,   // $0.50 minimum
      KES: 10,     // KES 10 minimum
      EUR: 0.50,   // €0.50 minimum
      GBP: 0.50,   // £0.50 minimum
    };

    const maxAmounts = {
      USD: 10000,   // $10,000 maximum
      KES: 1000000, // KES 1M maximum
      EUR: 10000,   // €10,000 maximum
      GBP: 10000,   // £10,000 maximum
    };

    const minAmount = minAmounts[currency] || minAmounts.USD;
    const maxAmount = maxAmounts[currency] || maxAmounts.USD;

    if (!amount || amount <= 0) {
      return {
        valid: false,
        error: 'Amount must be greater than zero',
      };
    }

    if (amount < minAmount) {
      return {
        valid: false,
        error: `Minimum amount is ${currency} ${minAmount}`,
      };
    }

    if (amount > maxAmount) {
      return {
        valid: false,
        error: `Maximum amount is ${currency} ${maxAmount}`,
      };
    }

    return {
      valid: true,
      amount: amount,
      currency: currency,
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get supported payment methods for user's location
   * @param {string} countryCode - ISO country code
   * @returns {Array} Available payment methods
   */
  static getSupportedPaymentMethods(countryCode = 'US') {
    const allMethods = [
      {
        id: 'stripe_card',
        name: 'Credit/Debit Card',
        icon: 'card',
        countries: ['US', 'CA', 'GB', 'EU', 'KE', 'UG', 'TZ'],
        currencies: ['USD', 'CAD', 'GBP', 'EUR', 'KES'],
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: 'logo-paypal',
        countries: ['US', 'CA', 'GB', 'EU'],
        currencies: ['USD', 'CAD', 'GBP', 'EUR'],
      },
      {
        id: 'mpesa',
        name: 'M-Pesa',
        icon: 'phone-portrait',
        countries: ['KE'],
        currencies: ['KES'],
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: 'business',
        countries: ['US', 'CA', 'GB', 'EU', 'KE'],
        currencies: ['USD', 'CAD', 'GBP', 'EUR', 'KES'],
      },
    ];

    return allMethods.filter(method => 
      method.countries.includes(countryCode) || 
      method.countries.includes('GLOBAL')
    );
  }

  /**
   * Format currency amount for display
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string} Formatted amount
   */
  static formatCurrency(amount, currency = 'USD') {
    const formatters = {
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      KES: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }),
      EUR: new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }),
      GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
    };

    const formatter = formatters[currency] || formatters.USD;
    return formatter.format(amount);
  }
}

export default PaymentService;
