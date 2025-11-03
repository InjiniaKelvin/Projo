/**
 * Wallet Service - Production Ready
 * 
 * Dedicated wallet operations service
 * No mock data - all real API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
 web: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
 default: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'
});

class WalletService {
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
 * GET WALLET BALANCE
 * Returns full balance breakdown: available, escrow, pending
 */
 async getWalletBalance() {
 try {
 const headers = await this.getAuthHeaders();
 const response = await fetch(`${API_BASE_URL}/payments/wallet`, {
 method: 'GET',
 headers
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('WalletService.getWalletBalance error:', error);
 throw error;
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
 const headers = await this.getAuthHeaders();
 const response = await fetch(`${API_BASE_URL}/payments/add-funds`, {
 method: 'POST',
 headers,
 body: JSON.stringify(params)
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('WalletService.addFunds error:', error);
 throw error;
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
 const headers = await this.getAuthHeaders();
 const response = await fetch(`${API_BASE_URL}/payments/withdraw-funds`, {
 method: 'POST',
 headers,
 body: JSON.stringify({
 amount: params.amount,
 withdrawalMethod: 'mpesa',
 withdrawalDetails: {
 phoneNumber: params.phoneNumber
 }
 })
 });

 return await this.handleResponse(response);
 } catch (error) {
 console.error('WalletService.withdrawFunds error:', error);
 throw error;
 }
 }

 /**
 * GET WALLET TRANSACTIONS
 * Recent wallet-specific transactions
 */
 async getWalletTransactions(page = 1, limit = 10) {
 try {
 const headers = await this.getAuthHeaders();
 const params = new URLSearchParams({
 page: page.toString(),
 limit: limit.toString(),
 type: 'topup,withdrawal'
 });

 const response = await fetch(
 `${API_BASE_URL}/payments/transactions?${params.toString()}`,
 { method: 'GET', headers }
 );

 return await this.handleResponse(response);
 } catch (error) {
 console.error('WalletService.getWalletTransactions error:', error);
 throw error;
 }
 }

 /**
 * CHECK MINIMUM BALANCE
 * Validates if user has sufficient balance for operation
 */
 async checkMinimumBalance(requiredAmount) {
 try {
 const wallet = await this.getWalletBalance();
 const available = wallet.data?.balance || 0;
 
 return {
 sufficient: available >= requiredAmount,
 available,
 required: requiredAmount,
 shortfall: Math.max(0, requiredAmount - available)
 };
 } catch (error) {
 console.error('WalletService.checkMinimumBalance error:', error);
 throw error;
 }
 }

 /**
 * GET BALANCE BREAKDOWN
 * Detailed breakdown of wallet balances
 */
 async getBalanceBreakdown() {
 try {
 const wallet = await this.getWalletBalance();
 const data = wallet.data || {};
 
 return {
 available: data.balance || 0,
 escrow: data.escrowBalance || 0,
 pending: data.pendingBalance || 0,
 total: (data.balance || 0) + (data.escrowBalance || 0) + (data.pendingBalance || 0),
 currency: data.currency || 'KES'
 };
 } catch (error) {
 console.error('WalletService.getBalanceBreakdown error:', error);
 throw error;
 }
 }

 /**
 * VALIDATE WITHDRAWAL
 * Checks if withdrawal is valid
 */
 validateWithdrawal(amount, availableBalance) {
 const errors = [];
 
 if (amount <= 0) {
 errors.push('Amount must be greater than zero');
 }
 
 if (amount < 10) {
 errors.push('Minimum withdrawal amount is KES 10');
 }
 
 if (amount > availableBalance) {
 errors.push('Insufficient balance');
 }
 
 if (amount > 150000) {
 errors.push('Maximum withdrawal amount is KES 150,000');
 }
 
 return {
 valid: errors.length === 0,
 errors
 };
 }

 /**
 * VALIDATE TOP-UP
 */
 validateTopup(amount) {
 const errors = [];
 
 if (amount <= 0) {
 errors.push('Amount must be greater than zero');
 }
 
 if (amount < 10) {
 errors.push('Minimum top-up amount is KES 10');
 }
 
 if (amount > 300000) {
 errors.push('Maximum top-up amount is KES 300,000');
 }
 
 return {
 valid: errors.length === 0,
 errors
 };
 }

 /**
 * FORMAT CURRENCY
 */
 formatCurrency(amount, currency = 'KES') {
 return new Intl.NumberFormat('en-KE', {
 style: 'currency',
 currency
 }).format(amount);
 }
}

export default new WalletService();
