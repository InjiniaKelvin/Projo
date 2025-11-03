/**
 * Payment Service - Production Ready
 * 
 * Fully integrated with IntaSend backend
 * No mock data - all real API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
 web: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
 default: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'
});

class PaymentService {
 async getAuthToken() {
 try {
 return await AsyncStorage.getItem('authToken');
 } catch (error) {
 console.error('Failed to get auth token:', error);
 return null;
 }
 }

 async getHeaders() {
 const token = await this.getAuthToken();
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

 async getWallet() {
 try {
 const headers = await this.getHeaders();
 const response = await fetch(`${API_BASE_URL}/payments/wallet`, {
 method: 'GET',
 headers
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PaymentService.getWallet error:', error);
 throw error;
 }
 }

 async addFunds(params) {
 try {
 const { amount, paymentMethod, phoneNumber, email } = params;
 
 const headers = await this.getHeaders();
 const response = await fetch(`${API_BASE_URL}/payments/add-funds`, {
 method: 'POST',
 headers,
 body: JSON.stringify({
 amount,
 paymentMethod,
 phoneNumber,
 email,
 description: `Wallet top-up via ${paymentMethod}`
 })
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('PaymentService.addFunds error:', error);
 throw error;
 }
 }

 async withdrawFunds(params) {
 try {
 const { amount, phoneNumber } = params;
 
 const headers = await this.getHeaders();
 const response = await fetch(`${API_BASE_URL}/payments/withdraw-funds`, {
 method: 'POST',
 headers,
 body: JSON.stringify({
 amount,
 withdrawalMethod: 'mpesa',
 withdrawalDetails: {
 phoneNumber
 }
 })
 });

 return await this.handleResponse(response);
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
