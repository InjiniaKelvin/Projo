/**
 * API Configuration for QuickFix App
 * Central configuration for all API endpoints and settings
 */

import axios from 'axios';
import StorageService from '../services/StorageService';

// API Configuration
// The single source of truth for the backend API URL.
// It prioritizes the Vercel environment variable and falls back to the live Render URL.
const PROD_API_URL = 'https://quickfix-api-pnv5.onrender.com/api';

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL ? `${process.env.EXPO_PUBLIC_API_URL}/api` : PROD_API_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Create axios instance with default configuration
const apiClient = axios.create({
 baseURL: API_CONFIG.BASE_URL,
 timeout: API_CONFIG.TIMEOUT,
 headers: {
 'Content-Type': 'application/json',
 'Accept': 'application/json',
 },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
 async (config) => {
 try {
 const token = await StorageService.getAccessToken();
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 } catch (error) {
 console.warn('Failed to get access token:', error);
 }
 return config;
 },
 (error) => {
 return Promise.reject(error);
 }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
 (response) => response,
 async (error) => {
 const originalRequest = error.config;

 if (error.response?.status === 401 && !originalRequest._retry) {
 originalRequest._retry = true;

 try {
 const refreshToken = await StorageService.getRefreshToken();
 if (refreshToken) {
 const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
 refreshToken,
 });

 const { accessToken } = response.data.data;
 await StorageService.storeAccessToken(accessToken);

 // Retry the original request with new token
 originalRequest.headers.Authorization = `Bearer ${accessToken}`;
 return apiClient(originalRequest);
 }
 } catch (refreshError) {
 // Refresh failed, redirect to login
 await StorageService.clearAll();
 // You might want to emit an event here to redirect to login
 console.log('Session expired, please login again');
 }
 }

 return Promise.reject(error);
 }
);

// API endpoints
export const API_ENDPOINTS = {
 // Authentication
 AUTH: {
 LOGIN: '/auth/login',
 REGISTER: '/auth/register',
 LOGOUT: '/auth/logout',
 REFRESH: '/auth/refresh',
 PROFILE: '/auth/profile',
 FORGOT_PASSWORD: '/auth/forgot-password',
 RESET_PASSWORD: '/auth/reset-password',
 VERIFY_EMAIL: '/auth/verify-email',
 },
 
 // Payments
 PAYMENTS: {
 WALLET: '/payments/wallet',
 TOPUP: '/payments/wallet/topup',
 PROCESS: '/payments/process',
 TRANSACTIONS: '/payments/transactions',
 VERIFY_PAYMENT: '/payments/verify',
 },

 // Technician
 TECHNICIAN: {
  PROFILE: '/technician/profile',
  AVAILABILITY: '/technician/availability',
  SKILLS: '/technician/skills',
 },

 // Admin
 ADMIN: {
  SYSTEM_STATS: '/admin/system/stats',
  PENDING_TECHNICIANS: '/admin/technicians/pending',
  USERS: '/admin/users',
  VERIFY_TECHNICIAN: (userId) => `/admin/users/${userId}/verify`,
  ANALYTICS: '/admin/dashboard',
  INVENTORY: '/inventory',
 },

 // Technician
 TECHNICIAN: {
 // Job Management
 AVAILABLE_JOBS: '/technician/available-jobs',
 MY_JOBS: '/technician/my-jobs',
 ACCEPT_JOB: (id) => `/technician/accept-job/${id}`,
 REJECT_JOB: (id) => `/technician/reject-job/${id}`,
 START_JOB: (id) => `/technician/start-job/${id}`,
 COMPLETE_JOB: (id) => `/technician/complete-job/${id}`,
 
 // Photo Upload
 UPLOAD_PHOTOS: (id) => `/technician/upload-photos/${id}`,
 
 // Availability & Location
 UPDATE_AVAILABILITY: '/technician/availability',
 UPDATE_LOCATION: '/technician/location',
 
 // Earnings & Payments
 EARNINGS: '/technician/earnings',
 WITHDRAW: '/technician/withdraw',
 }
};

export default apiClient;
