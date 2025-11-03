/**
 * Transaction Service - Production Ready
 * 
 * Handles transaction history, filtering, exports
 * No mock data - all real API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
 web: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
 default: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'
});

class TransactionService {
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
 * GET TRANSACTION HISTORY
 * @param {Object} filters - Filter options
 * @param {string} filters.type - 'payment', 'withdrawal', 'escrow', 'refund'
 * @param {string} filters.status - 'pending', 'completed', 'failed'
 * @param {Date} filters.startDate - Start date
 * @param {Date} filters.endDate - End date
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 */
 async getTransactionHistory(filters = {}) {
 try {
 const headers = await this.getAuthHeaders();
 
 const params = new URLSearchParams({
 page: (filters.page || 1).toString(),
 limit: (filters.limit || 20).toString()
 });
 
 if (filters.type) params.append('type', filters.type);
 if (filters.status) params.append('status', filters.status);
 if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
 if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
 
 const response = await fetch(
 `${API_BASE_URL}/payments/transactions?${params.toString()}`,
 { method: 'GET', headers }
 );

 return await this.handleResponse(response);
 } catch (error) {
 console.error('TransactionService.getTransactionHistory error:', error);
 throw error;
 }
 }

 /**
 * GET TRANSACTION BY ID
 */
 async getTransactionById(transactionId) {
 try {
 const headers = await this.getAuthHeaders();
 const response = await fetch(
 `${API_BASE_URL}/payments/transactions/${transactionId}`,
 { method: 'GET', headers }
 );

 return await this.handleResponse(response);
 } catch (error) {
 console.error('TransactionService.getTransactionById error:', error);
 throw error;
 }
 }

 /**
 * GET TRANSACTION STATISTICS
 * @param {string} period - '7d', '30d', '90d', '1y'
 */
 async getTransactionStats(period = '30d') {
 try {
 const headers = await this.getAuthHeaders();
 const response = await fetch(
 `${API_BASE_URL}/payments/transactions/stats?period=${period}`,
 { method: 'GET', headers }
 );

 return await this.handleResponse(response);
 } catch (error) {
 console.error('TransactionService.getTransactionStats error:', error);
 throw error;
 }
 }

 /**
 * EXPORT TRANSACTIONS
 * @param {Object} filters - Same as getTransactionHistory
 * @param {string} format - 'csv' or 'pdf'
 */
 async exportTransactions(filters = {}, format = 'csv') {
 try {
 const headers = await this.getAuthHeaders();
 
 const params = new URLSearchParams({ format });
 if (filters.type) params.append('type', filters.type);
 if (filters.status) params.append('status', filters.status);
 if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
 if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
 
 const response = await fetch(
 `${API_BASE_URL}/payments/transactions/export?${params.toString()}`,
 { method: 'GET', headers }
 );

 return await this.handleResponse(response);
 } catch (error) {
 console.error('TransactionService.exportTransactions error:', error);
 throw error;
 }
 }

 /**
 * SEARCH TRANSACTIONS
 * @param {string} query - Search query
 */
 async searchTransactions(query) {
 try {
 const headers = await this.getAuthHeaders();
 const response = await fetch(
 `${API_BASE_URL}/payments/transactions/search?q=${encodeURIComponent(query)}`,
 { method: 'GET', headers }
 );

 return await this.handleResponse(response);
 } catch (error) {
 console.error('TransactionService.searchTransactions error:', error);
 throw error;
 }
 }

 /**
 * FORMAT TRANSACTION TYPE
 */
 formatTransactionType(type) {
 const types = {
 payment: 'Payment',
 withdrawal: 'Withdrawal',
 escrow_deposit: 'Escrow Deposit',
 escrow_release: 'Escrow Release',
 refund: 'Refund',
 topup: 'Wallet Top-up',
 payout: 'Payout'
 };
 return types[type] || type;
 }

 /**
 * FORMAT TRANSACTION STATUS
 */
 formatTransactionStatus(status) {
 const statuses = {
 pending: { label: 'Pending', color: '#f59e0b' },
 completed: { label: 'Completed', color: '#10b981' },
 failed: { label: 'Failed', color: '#ef4444' },
 processing: { label: 'Processing', color: '#3b82f6' }
 };
 return statuses[status] || { label: status, color: '#6b7280' };
 }

 /**
 * GET TRANSACTION ICON
 */
 getTransactionIcon(type) {
 const icons = {
 payment: 'cash-outline',
 withdrawal: 'arrow-up-circle-outline',
 escrow_deposit: 'lock-closed-outline',
 escrow_release: 'unlock-outline',
 refund: 'return-down-back-outline',
 topup: 'add-circle-outline',
 payout: 'arrow-down-circle-outline'
 };
 return icons[type] || 'cash-outline';
 }
}

export default new TransactionService();
