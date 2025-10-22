// services/StorageService.js
// Secure storage service for handling user session data and sensitive information

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Storage Service Class
 * Handles secure storage of user session data and sensitive information
 * Uses Expo SecureStore for sensitive data and AsyncStorage for general data
 */
class StorageService {
  // Storage keys
  static KEYS = {
    SESSION_TOKEN: 'authToken', // Match SimpleAuthContext
    USER_DATA: 'userData', // Match SimpleAuthContext
    BIOMETRIC_ENABLED: 'quickfix_biometric_enabled',
    REMEMBER_ME: 'quickfix_remember_me',
    LAST_LOGIN_EMAIL: 'quickfix_last_login_email',
    APP_SETTINGS: 'quickfix_app_settings',
    WALLET_DATA: 'quickfix_wallet_data',
    PAYMENT_METHODS: 'quickfix_payment_methods',
    TRANSACTION_CACHE: 'quickfix_transaction_cache',
  };

  /**
   * Store user session data securely
   * @param {Object} sessionData - Session data containing user and token
   * @param {Object} sessionData.user - User information
   * @param {string} sessionData.token - Authentication token
   */
  static async storeSession(sessionData) {
    try {
      console.log('StorageService: storeSession called');
      
      // Store sensitive authentication token in SecureStore (with web fallback)
      if (sessionData.token) {
        try {
          console.log('StorageService: trying to store token in SecureStore');
          await SecureStore.setItemAsync(
            this.KEYS.SESSION_TOKEN,
            sessionData.token
          );
          console.log('StorageService: token stored in SecureStore');
        } catch (secureStoreError) {
          console.log('StorageService: SecureStore failed (probably web), using AsyncStorage fallback');
          // Fallback to AsyncStorage for web
          await AsyncStorage.setItem(this.KEYS.SESSION_TOKEN, sessionData.token);
          console.log('StorageService: token stored in AsyncStorage');
        }
      }

      // Store user data in AsyncStorage (non-sensitive)
      if (sessionData.user) {
        console.log('StorageService: storing user data in AsyncStorage');
        await AsyncStorage.setItem(
          this.KEYS.USER_DATA,
          JSON.stringify(sessionData.user)
        );
        console.log('StorageService: user data stored in AsyncStorage');
      }

      console.log('Session stored successfully');
    } catch (error) {
      console.error('Error storing session:', error);
      throw new Error('Failed to store session data');
    }
  }

  /**
   * Retrieve user session data
   * @returns {Promise<Object|null>} Session data or null if not found
   */
  static async getSession() {
    try {
      console.log('StorageService: getSession called');
      
      // Get authentication token from SecureStore (with web fallback)
      let token = null;
      try {
        console.log('StorageService: trying to get token from SecureStore');
        token = await SecureStore.getItemAsync(this.KEYS.SESSION_TOKEN);
        console.log('StorageService: SecureStore token result:', token ? 'found' : 'not found');
      } catch (secureStoreError) {
        console.log('StorageService: SecureStore failed (probably web), trying AsyncStorage fallback');
        // Fallback to AsyncStorage for web
        token = await AsyncStorage.getItem(this.KEYS.SESSION_TOKEN);
        console.log('StorageService: AsyncStorage token result:', token ? 'found' : 'not found');
      }
      
      // Get user data from AsyncStorage
      console.log('StorageService: getting user data from AsyncStorage');
      const userDataString = await AsyncStorage.getItem(this.KEYS.USER_DATA);
      const user = userDataString ? JSON.parse(userDataString) : null;
      console.log('StorageService: user data result:', user ? 'found' : 'not found');

      // Return session data if both token and user exist
      if (token && user) {
        console.log('StorageService: returning session data');
        return {
          token,
          user,
        };
      }

      console.log('StorageService: no complete session found');
      return null;
    } catch (error) {
      console.error('StorageService: Error retrieving session:', error);
      return null;
    }
  }

  /**
   * Get just the access token
   * @returns {Promise<string|null>} Access token or null
   */
  static async getAccessToken() {
    try {
      // For web, check localStorage directly (used by SimpleAuthContext)
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = window.localStorage.getItem('authToken');
        if (token) return token;
      }

      // Try to get token from SecureStore first (native)
      let token = null;
      
      try {
        token = await SecureStore.getItemAsync(this.KEYS.SESSION_TOKEN);
      } catch (secureStoreError) {
        // Fallback to AsyncStorage
        token = await AsyncStorage.getItem(this.KEYS.SESSION_TOKEN);
      }

      return token;
    } catch (error) {
      console.error('StorageService: Error retrieving access token:', error);
      return null;
    }
  }  /**
   * Update existing session data
   * @param {Object} updates - Updates to apply to session
   */
  static async updateSession(updates) {
    try {
      const currentSession = await this.getSession();
      
      if (!currentSession) {
        throw new Error('No existing session to update');
      }

      // Merge updates with existing session data
      const updatedSession = {
        ...currentSession,
        ...updates,
      };

      // Store updated session
      await this.storeSession(updatedSession);
      
      console.log('Session updated successfully');
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session data');
    }
  }

  /**
   * Clear all session data
   */
  static async clearSession() {
    try {
      console.log('StorageService: clearSession called');
      
      // Remove authentication token from SecureStore (with web fallback)
      try {
        console.log('StorageService: trying to remove token from SecureStore');
        await SecureStore.deleteItemAsync(this.KEYS.SESSION_TOKEN);
        console.log('StorageService: token removed from SecureStore');
      } catch (secureStoreError) {
        console.log('StorageService: SecureStore failed (probably web), using AsyncStorage fallback');
        // Fallback to AsyncStorage for web
        await AsyncStorage.removeItem(this.KEYS.SESSION_TOKEN);
        console.log('StorageService: token removed from AsyncStorage');
      }
      
      // Remove user data from AsyncStorage
      console.log('StorageService: removing user data from AsyncStorage');
      await AsyncStorage.removeItem(this.KEYS.USER_DATA);
      console.log('StorageService: user data removed from AsyncStorage');
      
      console.log('Session cleared successfully');
    } catch (error) {
      console.error('Error clearing session:', error);
      // Don't throw error for clearing - always allow logout
    }
  }

  /**
   * Store user's email for "Remember Me" functionality
   * @param {string} email - User email to remember
   */
  static async storeRememberedEmail(email) {
    try {
      await AsyncStorage.setItem(this.KEYS.LAST_LOGIN_EMAIL, email);
      await AsyncStorage.setItem(this.KEYS.REMEMBER_ME, 'true');
    } catch (error) {
      console.error('Error storing remembered email:', error);
    }
  }

  /**
   * Get remembered email
   * @returns {Promise<string|null>} Remembered email or null
   */
  static async getRememberedEmail() {
    try {
      const rememberMe = await AsyncStorage.getItem(this.KEYS.REMEMBER_ME);
      
      if (rememberMe === 'true') {
        return await AsyncStorage.getItem(this.KEYS.LAST_LOGIN_EMAIL);
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving remembered email:', error);
      return null;
    }
  }

  /**
   * Clear remembered email
   */
  static async clearRememberedEmail() {
    try {
      await AsyncStorage.removeItem(this.KEYS.LAST_LOGIN_EMAIL);
      await AsyncStorage.removeItem(this.KEYS.REMEMBER_ME);
    } catch (error) {
      console.error('Error clearing remembered email:', error);
    }
  }

  /**
   * Store biometric authentication preference
   * @param {boolean} enabled - Whether biometric auth is enabled
   */
  static async setBiometricEnabled(enabled) {
    try {
      await AsyncStorage.setItem(
        this.KEYS.BIOMETRIC_ENABLED,
        enabled.toString()
      );
    } catch (error) {
      console.error('Error storing biometric preference:', error);
    }
  }

  /**
   * Get biometric authentication preference
   * @returns {Promise<boolean>} Whether biometric auth is enabled
   */
  static async isBiometricEnabled() {
    try {
      const enabled = await AsyncStorage.getItem(this.KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error retrieving biometric preference:', error);
      return false;
    }
  }

  /**
   * Store app settings
   * @param {Object} settings - App settings object
   */
  static async storeAppSettings(settings) {
    try {
      await AsyncStorage.setItem(
        this.KEYS.APP_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Error storing app settings:', error);
    }
  }

  /**
   * Get app settings
   * @returns {Promise<Object>} App settings object
   */
  static async getAppSettings() {
    try {
      const settingsString = await AsyncStorage.getItem(this.KEYS.APP_SETTINGS);
      return settingsString ? JSON.parse(settingsString) : {};
    } catch (error) {
      console.error('Error retrieving app settings:', error);
      return {};
    }
  }

  /**
   * Store arbitrary secure data
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   */
  static async storeSecureData(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error storing secure data for key ${key}:`, error);
      throw new Error('Failed to store secure data');
    }
  }

  /**
   * Retrieve arbitrary secure data
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} Stored value or null
   */
  static async getSecureData(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error retrieving secure data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete arbitrary secure data
   * @param {string} key - Storage key
   */
  static async deleteSecureData(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error deleting secure data for key ${key}:`, error);
    }
  }

  /**
   * Clear all app data (for debugging or user request)
   */
  static async clearAllData() {
    try {
      // Clear all AsyncStorage data
      await AsyncStorage.clear();
      
      // Clear SecureStore items (individual deletion required)
      const secureKeys = [
        this.KEYS.SESSION_TOKEN,
      ];

      for (const key of secureKeys) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          // Continue with other keys even if one fails
          console.warn(`Failed to delete secure key ${key}:`, error);
        }
      }
      
      console.log('All app data cleared successfully');
    } catch (error) {
      console.error('Error clearing all app data:', error);
      throw new Error('Failed to clear app data');
    }
  }

  /**
   * Check if secure storage is available
   * @returns {Promise<boolean>} Whether secure storage is available
   */
  static async isSecureStoreAvailable() {
    try {
      return await SecureStore.isAvailableAsync();
    } catch (error) {
      console.error('Error checking SecureStore availability:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Promise<Object>} Storage usage information
   */
  static async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      
      let totalSize = 0;
      const itemInfo = items.map(([key, value]) => {
        const size = new Blob([value || '']).size;
        totalSize += size;
        return {
          key,
          size,
          sizeKB: (size / 1024).toFixed(2),
        };
      });

      return {
        totalItems: keys.length,
        totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        items: itemInfo,
        isSecureStoreAvailable: await this.isSecureStoreAvailable(),
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        totalSizeKB: '0',
        items: [],
        isSecureStoreAvailable: false,
      };
    }
  }

  /**
   * Store wallet data
   * @param {Object} walletData - Wallet information
   */
  static async storeWalletData(walletData) {
    try {
      await AsyncStorage.setItem(
        this.KEYS.WALLET_DATA,
        JSON.stringify(walletData)
      );
      console.log('Wallet data stored successfully');
    } catch (error) {
      console.error('Error storing wallet data:', error);
      throw new Error('Failed to store wallet data');
    }
  }

  /**
   * Retrieve wallet data
   * @returns {Object|null} Wallet data or null if not found
   */
  static async getWalletData() {
    try {
      const walletDataJson = await AsyncStorage.getItem(this.KEYS.WALLET_DATA);
      if (walletDataJson) {
        return JSON.parse(walletDataJson);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving wallet data:', error);
      return null;
    }
  }

  /**
   * Store payment methods
   * @param {Array} paymentMethods - User's saved payment methods
   */
  static async storePaymentMethods(paymentMethods) {
    try {
      // Encrypt sensitive payment method data
      await SecureStore.setItemAsync(
        this.KEYS.PAYMENT_METHODS,
        JSON.stringify(paymentMethods)
      );
      console.log('Payment methods stored securely');
    } catch (error) {
      console.error('Error storing payment methods:', error);
      throw new Error('Failed to store payment methods');
    }
  }

  /**
   * Retrieve payment methods
   * @returns {Array} User's payment methods
   */
  static async getPaymentMethods() {
    try {
      const paymentMethodsJson = await SecureStore.getItemAsync(this.KEYS.PAYMENT_METHODS);
      if (paymentMethodsJson) {
        return JSON.parse(paymentMethodsJson);
      }
      return [];
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      return [];
    }
  }

  /**
   * Cache transaction data for offline access
   * @param {Array} transactions - Transaction history
   */
  static async cacheTransactions(transactions) {
    try {
      await AsyncStorage.setItem(
        this.KEYS.TRANSACTION_CACHE,
        JSON.stringify({
          transactions,
          cachedAt: new Date().toISOString(),
        })
      );
      console.log('Transactions cached successfully');
    } catch (error) {
      console.error('Error caching transactions:', error);
    }
  }

  /**
   * Get cached transactions
   * @returns {Array} Cached transactions
   */
  static async getCachedTransactions() {
    try {
      const cacheJson = await AsyncStorage.getItem(this.KEYS.TRANSACTION_CACHE);
      if (cacheJson) {
        const cache = JSON.parse(cacheJson);
        // Return cached data if less than 1 hour old
        const cacheAge = Date.now() - new Date(cache.cachedAt).getTime();
        if (cacheAge < 60 * 60 * 1000) { // 1 hour
          return cache.transactions;
        }
      }
      return [];
    } catch (error) {
      console.error('Error retrieving cached transactions:', error);
      return [];
    }
  }
}

export default StorageService;
