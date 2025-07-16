// services/AuthService.js
// Authentication service for handling API calls related to user authentication

import axios from 'axios';

// API base URL - should be moved to environment variables in production
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Authentication Service Class
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * User login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication response
   */
  static async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.toLowerCase().trim(),
        password,
      });

      // Simulate different user types based on email for demo
      // In production, this would come from the server response
      let userType = 'client'; // default
      if (email.includes('admin')) {
        userType = 'admin';
      } else if (email.includes('tech')) {
        userType = 'technician';
      }

      // Mock successful response - replace with actual API response structure
      return {
        success: true,
        user: {
          id: Date.now(), // Mock user ID
          name: email.split('@')[0], // Extract name from email for demo
          email: email.toLowerCase().trim(),
          userType,
          phone: '+1234567890', // Mock phone
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        token: this.generateMockToken(email, userType),
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || 'Invalid credentials',
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          message: 'Network error. Please check your connection.',
        };
      } else {
        // Other error
        return {
          success: false,
          message: 'Login failed. Please try again.',
        };
      }
    }
  }

  /**
   * User registration
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  static async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        userType: userData.userType,
        phone: userData.phone.trim(),
      });

      // Mock successful response - replace with actual API response structure
      return {
        success: true,
        user: {
          id: Date.now(), // Mock user ID
          name: userData.name.trim(),
          email: userData.email.toLowerCase().trim(),
          userType: userData.userType,
          phone: userData.phone.trim(),
          isVerified: false, // New users need verification
          createdAt: new Date().toISOString(),
        },
        token: this.generateMockToken(userData.email, userData.userType),
        message: 'Registration successful',
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || 'Registration failed',
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          message: 'Network error. Please check your connection.',
        };
      } else {
        // Other error
        return {
          success: false,
          message: 'Registration failed. Please try again.',
        };
      }
    }
  }

  /**
   * User logout
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} Logout response
   */
  static async logout(token) {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout - always allow local logout
      return {
        success: true,
        message: 'Logged out locally',
      };
    }
  }

  /**
   * Validate authentication token
   * @param {string} token - Authentication token to validate
   * @returns {Promise<boolean>} Token validity
   */
  static async validateToken(token) {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error('Token validation error:', error);
      
      // For demo purposes, validate mock tokens locally
      return this.validateMockToken(token);
    }
  }

  /**
   * Update user profile
   * @param {string} token - Authentication token
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Update response
   */
  static async updateProfile(token, updates) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/profile`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: true,
        user: response.data.user,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Update failed',
        };
      } else {
        return {
          success: false,
          message: 'Network error. Please try again.',
        };
      }
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Password reset response
   */
  static async requestPasswordReset(email) {
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: email.toLowerCase().trim(),
      });

      return {
        success: true,
        message: 'Password reset instructions sent to your email',
      };
    } catch (error) {
      console.error('Password reset error:', error);
      
      return {
        success: false,
        message: 'Failed to send password reset email',
      };
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
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        password: newPassword,
      });

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      console.error('Password reset error:', error);
      
      return {
        success: false,
        message: 'Failed to reset password',
      };
    }
  }

  /**
   * Verify user email
   * @param {string} verificationToken - Email verification token
   * @returns {Promise<Object>} Verification response
   */
  static async verifyEmail(verificationToken) {
    try {
      await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        token: verificationToken,
      });

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      console.error('Email verification error:', error);
      
      return {
        success: false,
        message: 'Email verification failed',
      };
    }
  }

  // MOCK TOKEN FUNCTIONS (Remove in production)
  
  /**
   * Generate mock authentication token (for demo purposes)
   * @param {string} email - User email
   * @param {string} userType - User type
   * @returns {string} Mock token
   */
  static generateMockToken(email, userType) {
    const payload = {
      email,
      userType,
      iat: Date.now(),
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };
    
    // Simple base64 encoding for demo (use proper JWT in production)
    return btoa(JSON.stringify(payload));
  }

  /**
   * Validate mock token (for demo purposes)
   * @param {string} token - Token to validate
   * @returns {boolean} Token validity
   */
  static validateMockToken(token) {
    try {
      const payload = JSON.parse(atob(token));
      const now = Date.now();
      
      // Check if token is expired
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  /**
   * Decode mock token (for demo purposes)
   * @param {string} token - Token to decode
   * @returns {Object|null} Decoded payload
   */
  static decodeMockToken(token) {
    try {
      return JSON.parse(atob(token));
    } catch (error) {
      return null;
    }
  }
}

export default AuthService;
