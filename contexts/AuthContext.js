// contexts/AuthContext.js
// Authentication Context Provider for managing user authentication state across the app

import { createContext, useContext, useEffect, useReducer } from 'react';
// Temporarily comment out imports to test if they're causing issues
// import AuthService from '../services/AuthService';
// import StorageService from '../services/StorageService';

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
  CLEAR_ERROR: 'CLEAR_ERROR',
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

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Authentication Context Provider Component
export function AuthProvider({ children }) {
  console.log(' AuthProvider: Component rendered');
  
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  console.log(' AuthProvider: state after useReducer:', state);

  // Restore user session on app startup
  useEffect(() => {
    console.log(' AuthContext: useEffect called - starting session restore');
    
    // For debugging: immediately set as unauthenticated to bypass storage issues
    setTimeout(() => {
      console.log(' AuthContext: Force setting unauthenticated to bypass storage issues');
      dispatch({
        type: AUTH_ACTIONS.RESTORE_SESSION,
        payload: {
          isAuthenticated: false,
          user: null,
          token: null,
        },
      });
    }, 100);
    
    // Commented out for debugging
    // restoreSession();
  }, []);

  /**
   * Restore user session from secure storage
   * Called when the app starts to check if user is already logged in
   */
  const restoreSession = async () => {
    console.log('AuthContext: restoreSession called');
    try {
      console.log('AuthContext: calling StorageService.getSession');
      
      // Add shorter timeout to prevent hanging (reduced from 3000ms to 1000ms)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Storage timeout after 1s')), 1000)
      );
      
      let sessionData;
      try {
        sessionData = await Promise.race([
          StorageService.getSession(),
          timeoutPromise
        ]);
        console.log('AuthContext: getSession result:', sessionData);
      } catch (timeoutError) {
        console.log('AuthContext: Storage operation timed out, proceeding as unauthenticated');
        sessionData = null;
      }
      
      if (sessionData && sessionData.token && sessionData.user) {
        console.log('AuthContext: restoring session for user:', sessionData.user.email);
        // For now, trust the stored session without backend validation
        // This avoids blocking the app if backend is not available
        dispatch({
          type: AUTH_ACTIONS.RESTORE_SESSION,
          payload: {
            isAuthenticated: true,
            user: sessionData.user,
            token: sessionData.token,
          },
        });
      } else {
        console.log('AuthContext: no valid session found, setting unauthenticated');
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
      console.error('AuthContext: Session restore error:', error);
      console.log('AuthContext: setting unauthenticated due to error');
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
    console.log('AuthContext: login called with:', email);
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Temporarily return success for testing
      console.log('AuthContext: TEMPORARY - returning mock success');
      const mockResponse = {
        success: true,
        user: { email, role: 'client', id: '123' },
        token: 'mock-token'
      };
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: mockResponse.user,
          token: mockResponse.token,
        },
      });

      return { success: true };
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
    console.log('AuthContext: register called with:', userData);
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      // Temporarily return success for testing
      console.log('AuthContext: TEMPORARY - returning mock registration success');
      const mockResponse = {
        success: true,
        user: { email: userData.email, role: userData.userType || 'client', id: '123' },
        token: 'mock-token'
      };
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          user: mockResponse.user,
          token: mockResponse.token,
        },
      });

      return { success: true };
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
      // Temporarily simplified logout
      console.log('AuthContext: TEMPORARY - simplified logout');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  /**
   * Clear authentication error
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  /**
   * Update user profile information
   * @param {Object} updates - User data updates
   */
  const updateUser = async (updates) => {
    try {
      // Temporarily simplified update
      console.log('AuthContext: TEMPORARY - simplified updateUser');
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { user: updates },
      });
      
      return { success: true };
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
    clearError,
    
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
