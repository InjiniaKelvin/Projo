/**
 * Payment Service - Production Ready
 * 
 * Fully integrated with IntaSend backend
 * Uses centralized axios instance for authentication
 */

import { apiClient } from '../contexts/SimpleAuthContext';

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
 data: { balance: 0, escrowBalance: 0 }
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
 description: `Wallet top-up via ${paymentMethod}`
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
 phoneNumber
 }
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
 
 const headers = await this.getHeaders();
 const response = await fetch(`${API_BASE_URL}/payments/escrow/deposit`, {
 method: 'POST',
 headers,
 body: JSON.stringify({
 amount,
 bookingId,
 description: description || `Escrow for booking ${bookingId}`
 })
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PaymentService.depositToEscrow error:', error);
 throw error;
 }
 }

 async releaseFromEscrow(params) {
 try {
 const { amount, bookingId, recipientUserId, description } = params;
 
 const headers = await this.getHeaders();
 const response = await fetch(`${API_BASE_URL}/payments/escrow/release`, {
 method: 'POST',
 headers,
 body: JSON.stringify({
 amount,
 bookingId,
 recipientUserId,
 description: description || `Payment for booking ${bookingId}`
 })
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PaymentService.releaseFromEscrow error:', error);
 throw error;
 }
 }

 async getTransactions(params = {}) {
 try {
 const { page = 1, limit = 20, type } = params;
 
 const queryParams = new URLSearchParams({
 page: page.toString(),
 limit: limit.toString()
 });
 
 if (type) {
 queryParams.append('type', type);
 }
 
 const headers = await this.getHeaders();
 const response = await fetch(
 `${API_BASE_URL}/payments/transactions?${queryParams.toString()}`,
 {
 method: 'GET',
 headers
 }
 );

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PaymentService.getTransactions error:', error);
 throw error;
 }
 }

 async checkPaymentStatus(transactionId) {
 try {
 const headers = await this.getHeaders();
 const response = await fetch(`${API_BASE_URL}/payments/status/${transactionId}`, {
 method: 'GET',
 headers
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PaymentService.checkPaymentStatus error:', error);
 throw error;
 }
 }

 async pollPaymentStatus(transactionId, onStatusChange, maxAttempts = 20, interval = 6000) {
 let attempts = 0;
 
 const poll = async () => {
 try {
 const result = await this.checkPaymentStatus(transactionId);
 
 if (onStatusChange) {
 onStatusChange(result);
 }
 
 const status = result.transaction?.status;
 
 if (status === 'completed') {
 return { success: true, status: 'completed', transaction: result.transaction };
 } else if (status === 'failed') {
 return { success: false, status: 'failed', transaction: result.transaction };
 }
 
 attempts++;
 if (attempts < maxAttempts) {
 await new Promise(resolve => setTimeout(resolve, interval));
 return await poll();
 } else {
 return { success: false, status: 'timeout', message: 'Payment verification timeout' };
 }
 } catch (error) {
 console.error('Poll error:', error);
 throw error;
 }
 };
 
 return await poll();
 }

 async getPaymentMethods() {
 return {
 success: true,
 methods: [
 {
 id: 'mpesa',
 name: 'M-Pesa',
 description: 'Pay with your M-Pesa mobile money',
 icon: 'phone-portrait',
 color: '#00a651',
 fees: '1.5% + KES 10',
 enabled: true
 },
 {
 id: 'card',
 name: 'Credit/Debit Card',
 description: 'Visa, Mastercard',
 icon: 'card',
 color: '#6366f1',
 fees: '3.5%',
 enabled: true
 },
 {
 id: 'wallet',
 name: 'QuickFix Wallet',
 description: 'Use your wallet balance',
 icon: 'wallet',
 color: '#0d6efd',
 fees: 'No fees',
 enabled: true
 }
 ]
 };
 }

 async getPaymentSummary(period = '30d') {
 try {
 const headers = await this.getHeaders();
 const response = await fetch(
 `${API_BASE_URL}/payments/summary?period=${period}`,
 {
 method: 'GET',
 headers
 }
 );

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PaymentService.getPaymentSummary error:', error);
 throw error;
 }
 }

 formatPhoneNumber(phone) {
 if (!phone) return '';
 
 let cleaned = phone.replace(/[\s\-\(\)]/g, '');
 
 if (cleaned.startsWith('0')) {
 return '254' + cleaned.substring(1);
 } else if (cleaned.startsWith('+254')) {
 return cleaned.substring(1);
 } else if (cleaned.startsWith('254')) {
 return cleaned;
 } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
 return '254' + cleaned;
 }
 
 return cleaned;
 }

 validatePhoneNumber(phone) {
 const formatted = this.formatPhoneNumber(phone);
 return /^254[71]\d{8}$/.test(formatted);
 }

 calculateFees(amount, method) {
 if (method === 'mpesa') {
 const percentage = amount * 0.015;
 const fixed = 10;
 return Math.round((percentage + fixed) * 100) / 100;
 } else if (method === 'card') {
 const percentage = amount * 0.035;
 return Math.round(percentage * 100) / 100;
 }
 return 0;
 }
}

export default new PaymentService();
