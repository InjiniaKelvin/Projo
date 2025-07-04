// contexts/AuthContext.js
// Authentication Context Provider for managing user authentication state across the app

import { createContext, useContext, useEffect, useReducer } from 'react';
import AuthService from '../services/AuthService';
import StorageService from '../services/StorageService';

// Create Authentication Context
const AuthContext = createContext();

// Authentication action types for reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  RESTORE_SESSION: 'RESTORE_SESSION',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
};

// Initial authentication state
const initialState = {
  isLoading: true,        // App loading state during session restore
  isAuthenticated: false, // User authentication status
  user: null,            // Current user data
  token: null,           // Authentication token
  error: null,           // Authentication error message
  isLoginLoading: false, // Login process loading state
  isRegisterLoading: false, // Registration process loading state
};

// Authentication state reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoginLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isLoginLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoginLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isRegisterLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isRegisterLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isRegisterLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        token: action.payload.token,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user },
      };

    default:
      return state;
  }
}

// Authentication Context Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore user session on app startup
  useEffect(() => {
    restoreSession();
  }, []);

  /**
   * Restore user session from secure storage
   * Called when the app starts to check if user is already logged in
   */
  const restoreSession = async () => {
    try {
      const sessionData = await StorageService.getSession();
      
      if (sessionData && sessionData.token && sessionData.user) {
        // Validate token with backend (optional)
        const isTokenValid = await AuthService.validateToken(sessionData.token);
        
        if (isTokenValid) {
          dispatch({
            type: AUTH_ACTIONS.RESTORE_SESSION,
            payload: {
              isAuthenticated: true,
              user: sessionData.user,
              token: sessionData.token,
            },
          });
        } else {
          // Token is invalid, clear storage
          await StorageService.clearSession();
          dispatch({
            type: AUTH_ACTIONS.RESTORE_SESSION,
            payload: {
              isAuthenticated: false,
              user: null,
              token: null,
            },
          });
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.RESTORE_SESSION,
          payload: {
            isAuthenticated: false,
            user: null,
            token: null,
          },
        });
      }
    } catch (error) {
      console.error('Session restore error:', error);
      dispatch({
        type: AUTH_ACTIONS.RESTORE_SESSION,
        payload: {
          isAuthenticated: false,
          user: null,
          token: null,
        },
      });
    }
  };

  /**
   * User login function
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Call authentication service
      const response = await AuthService.login(email, password);
      
      if (response.success) {
        // Store session data securely
        await StorageService.storeSession({
          user: response.user,
          token: response.token,
        });

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            token: response.token,
          },
        });

        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: response.message || 'Login failed' },
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  /**
   * User registration function
   * @param {Object} userData - User registration data
   */
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      // Call authentication service
      const response = await AuthService.register(userData);
      
      if (response.success) {
        // Store session data securely
        await StorageService.storeSession({
          user: response.user,
          token: response.token,
        });

        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: {
            user: response.user,
            token: response.token,
          },
        });

        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: { error: response.message || 'Registration failed' },
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  /**
   * User logout function
   * Clears all stored session data and resets authentication state
   */
  const logout = async () => {
    try {
      // Call logout service (optional - for server-side logout)
      await AuthService.logout(state.token);
      
      // Clear stored session data
      await StorageService.clearSession();
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local data
      await StorageService.clearSession();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  /**
   * Update user profile information
   * @param {Object} updates - User data updates
   */
  const updateUser = async (updates) => {
    try {
      const response = await AuthService.updateProfile(state.token, updates);
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: { user: updates },
        });

        // Update stored session data
        await StorageService.updateSession({ user: { ...state.user, ...updates } });
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} - Whether user has the role
   */
  const hasRole = (role) => {
    return state.user && state.user.userType === role;
  };

  /**
   * Check if user has any of the specified roles
   * @param {Array} roles - Array of roles to check
   * @returns {boolean} - Whether user has any of the roles
   */
  const hasAnyRole = (roles) => {
    return state.user && roles.includes(state.user.userType);
  };

  // Context value object
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    restoreSession,
    
    // Role-based access control
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;
