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
    SESSION_TOKEN: 'quickfix_session_token',
    USER_DATA: 'quickfix_user_data',
    BIOMETRIC_ENABLED: 'quickfix_biometric_enabled',
    REMEMBER_ME: 'quickfix_remember_me',
    LAST_LOGIN_EMAIL: 'quickfix_last_login_email',
    APP_SETTINGS: 'quickfix_app_settings',
  };

  /**
   * Store user session data securely
   * @param {Object} sessionData - Session data containing user and token
   * @param {Object} sessionData.user - User information
   * @param {string} sessionData.token - Authentication token
   */
  static async storeSession(sessionData) {
    try {
      // Store sensitive authentication token in SecureStore
      if (sessionData.token) {
        await SecureStore.setItemAsync(
          this.KEYS.SESSION_TOKEN,
          sessionData.token
        );
      }

      // Store user data in AsyncStorage (non-sensitive)
      if (sessionData.user) {
        await AsyncStorage.setItem(
          this.KEYS.USER_DATA,
          JSON.stringify(sessionData.user)
        );
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
      // Get authentication token from SecureStore
      const token = await SecureStore.getItemAsync(this.KEYS.SESSION_TOKEN);
      
      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem(this.KEYS.USER_DATA);
      const user = userDataString ? JSON.parse(userDataString) : null;

      // Return session data if both token and user exist
      if (token && user) {
        return {
          token,
          user,
        };
      }

      return null;
    } catch (error) {
      console.error('Error retrieving session:', error);
      return null;
    }
  }

  /**
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
      // Remove authentication token from SecureStore
      await SecureStore.deleteItemAsync(this.KEYS.SESSION_TOKEN);
      
      // Remove user data from AsyncStorage
      await AsyncStorage.removeItem(this.KEYS.USER_DATA);
      
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
}

export default StorageService;
