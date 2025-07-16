/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from '../config/api';

export class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  static async register(userData) {
    try {
      console.log('AuthService: register called with:', userData);
      console.log('AuthService: making POST request to /auth/register');
      const response = await apiClient.post('/auth/register', userData);
      console.log('AuthService: register response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @returns {Promise<Object>} Login response
   */
  static async login(credentials) {
    try {
      console.log('AuthService: login called with:', credentials);
      console.log('AuthService: making POST request to /auth/login');
      const response = await apiClient.post('/auth/login', credentials);
      console.log('AuthService: login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Logout user
   * @param {string} token - User's auth token
   * @returns {Promise<Object>} Logout response
   */
  static async logout(token) {
    try {
      const response = await apiClient.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw on logout errors, just log them
      return { success: true };
    }
  }

  /**
   * Get current user profile
   * @param {string} token - User's auth token
   * @returns {Promise<Object>} User profile response
   */
  static async getProfile(token) {
    try {
      const response = await apiClient.get('/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to get profile');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Refresh authentication token
   * @param {string} refreshToken - User's refresh token
   * @returns {Promise<Object>} Token refresh response
   */
  static async refreshToken(refreshToken) {
    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken
      });
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Token refresh failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Verify user email
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Verification response
   */
  static async verifyEmail(token) {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Email verification failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Request password reset
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Password reset response
   */
  static async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Password reset request failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Password reset response
   */
  static async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Password reset failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Validate authentication token
   * @param {string} token - User's auth token
   * @returns {Promise<boolean>} Token validation response
   */
  static async validateToken(token) {
    try {
      const response = await apiClient.get('/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.success || true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}

export default AuthService;
