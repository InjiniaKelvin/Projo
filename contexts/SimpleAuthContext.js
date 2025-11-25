// Authentication Context with Backend Integration
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { Platform } from 'react-native';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';

// Configure axios defaults
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL 
  ? `${process.env.EXPO_PUBLIC_API_URL}/api`
  : 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

// Export configured axios instance for use in other services
export const apiClient = axios;

// Storage helper for web/native compatibility
const storage = {
 async setItem(key, value) {
 console.log(' Storage: Setting item', key, '=', value);
 if (Platform.OS === 'web') {
 localStorage.setItem(key, value);
 console.log(' Storage: Set in localStorage successfully');
 } else {
 await AsyncStorage.setItem(key, value);
 console.log(' Storage: Set in AsyncStorage successfully');
 }
 },
 async getItem(key) {
 if (Platform.OS === 'web') {
 const value = localStorage.getItem(key);
 console.log(' Storage: Got from localStorage', key, '=', value);
 return value;
 } else {
 const value = await AsyncStorage.getItem(key);
 console.log(' Storage: Got from AsyncStorage', key, '=', value);
 return value;
 }
 },
 async removeItem(key) {
 console.log(' Storage: Removing item', key);
 if (Platform.OS === 'web') {
 localStorage.removeItem(key);
 } else {
 await AsyncStorage.removeItem(key);
 }
 }
};

const AuthContext = createContext();

// Detect web environment immediately at module level
const isWebEnvironment = Platform.OS === 'web' || typeof window !== 'undefined';
console.log(' Auth: Module level - Platform.OS:', Platform.OS, 'isWeb:', isWebEnvironment);

const initialState = {
 isLoading: isWebEnvironment ? false : true, // Immediately false for web, true for native
 isAuthenticated: false,
 user: null,
 token: null,
 error: null,
 isLoginLoading: false,
 isRegisterLoading: false,
};

console.log(' Auth: Initial state created with isLoading:', initialState.isLoading);

function authReducer(state, action) {
 console.log(' Auth: Reducer called with action:', action.type, action.payload);
 switch (action.type) {
 case 'SET_LOADING':
 return {
 ...state,
 isLoading: action.payload,
 };
 case 'LOGIN_START':
 return {
 ...state,
 isLoginLoading: true,
 error: null,
 };
 case 'LOGIN_SUCCESS':
 console.log(' Auth: LOGIN_SUCCESS reducer - payload:', action.payload);
 return {
 ...state,
 isAuthenticated: true,
 user: action.payload.user,
 token: action.payload.token,
 isLoginLoading: false,
 error: null,
 };
 case 'LOGIN_FAILURE':
 return {
 ...state,
 isLoginLoading: false,
 isAuthenticated: false,
 error: action.payload.error,
 };
 case 'LOGOUT':
 return {
 ...initialState,
 isLoading: false,
 };
 case 'REGISTER_START':
 return {
 ...state,
 isRegisterLoading: true,
 error: null,
 };
 case 'REGISTER_SUCCESS':
 return {
 ...state,
 isAuthenticated: true,
 user: action.payload.user,
 token: action.payload.token,
 isRegisterLoading: false,
 error: null,
 };
 case 'REGISTER_FAILURE':
 return {
 ...state,
 isRegisterLoading: false,
 error: action.payload.error,
 };
 case 'SET_ERROR':
 return {
 ...state,
 error: action.payload.error,
 };
 case 'CLEAR_ERROR':
 return {
 ...state,
 error: null,
 };
 case 'UPDATE_USER':
 console.log(' Auth Reducer: UPDATE_USER action received', action.payload);
 return {
 ...state,
 user: { ...state.user, ...action.payload },
 };
 default:
 return state;
 }
}

export function AuthProvider({ children }) {
 console.log(' Auth: AuthProvider rendered!');
 
 const [state, dispatch] = useReducer(authReducer, initialState);
 const tokenRef = useRef(state.token);
 
 // Register for push notifications when authenticated
 useEffect(() => {
 if (state.isAuthenticated && state.user) {
 registerForPushNotificationsAsync().then(token => {
 if (token) {
 console.log('Push token registered:', token);
 }
 }).catch(err => console.error('Failed to register push token:', err));
 }
 }, [state.isAuthenticated, state.user]);

 // Update token ref whenever state.token changes
 useEffect(() => {
 tokenRef.current = state.token;
 }, [state.token]);
 
 console.log(' Auth: Current state:', state);

 // Set up axios interceptor for authentication - only set up once
 useEffect(() => {
 let isLoggingOut = false; // Prevent logout loops
 
 const requestInterceptor = axios.interceptors.request.use(
 (config) => {
 // Get the current token from ref to avoid stale closure
 const currentToken = tokenRef.current;
 if (currentToken) {
 config.headers.Authorization = `Bearer ${currentToken}`;
 }
 return config;
 },
 (error) => {
 return Promise.reject(error);
 }
 );

 const responseInterceptor = axios.interceptors.response.use(
 (response) => response,
 async (error) => {
 // Only trigger logout for 401 errors that aren't already during logout process
 if (error.response?.status === 401 && tokenRef.current && !isLoggingOut) {
 console.log(' Auth: 401 detected, triggering logout...');
 isLoggingOut = true;
 // Token expired, logout user without calling backend logout to prevent loop
 try {
 console.log(' Auth: Starting local logout cleanup...');
 // Clear local storage using storage helper
 await storage.removeItem('authToken');
 console.log(' Auth: Removed authToken from storage');
 await storage.removeItem('userData');
 console.log(' Auth: Removed userData from storage');
 console.log(' Auth: Local storage cleared successfully');
 
 console.log(' Auth: Dispatching LOGOUT action...');
 dispatch({ type: 'LOGOUT' });
 console.log(' Auth: LOGOUT action dispatched successfully');
 } catch (storageError) {
 console.error(' Auth: Storage cleanup error during interceptor logout:', storageError);
 dispatch({ type: 'LOGOUT' });
 } finally {
 isLoggingOut = false;
 }
 }
 return Promise.reject(error);
 }
 );

 // Cleanup interceptors
 return () => {
 axios.interceptors.request.eject(requestInterceptor);
 axios.interceptors.response.eject(responseInterceptor);
 };
 }, []); // Empty dependency array to set up interceptors only once

 // Check for existing session on app start
 useEffect(() => {
 console.log(' Auth: useEffect triggered - checking environment...');
 console.log(' Auth: Platform.OS:', Platform.OS, 'typeof window:', typeof window);
 
 // Add a small delay to ensure components are mounted
 const timer = setTimeout(() => {
 // Immediate web check in useEffect
 const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';
 console.log(' Auth: Is web environment:', isWeb);
 
 if (isWeb) {
 console.log(' Auth: Web environment detected - checking localStorage');
 checkWebAuthState();
 return;
 }

 console.log(' Auth: Native environment confirmed, calling checkAuthState...');
 checkAuthState();
 }, 50);

 return () => clearTimeout(timer);
 }, []);

 const checkWebAuthState = async () => {
 try {
 console.log(' Auth: Checking web auth state...');
 const token = localStorage.getItem('authToken');
 const userData = localStorage.getItem('userData');
 
 console.log(' Auth: Web check - Token found:', !!token, 'User data found:', !!userData);
 
 if (token && userData) {
 try {
 const user = JSON.parse(userData);
 console.log(' Auth: Attempting to restore web session for user:', user.email);
 
 // Validate the token by making a quick API call
 const response = await axios.get('/auth/validate', {
 headers: { Authorization: `Bearer ${token}` }
 });
 
 if (response.data.valid) {
 console.log(' Auth: Token is valid, restoring session...');
 dispatch({
 type: 'LOGIN_SUCCESS',
 payload: {
 user: user,
 token: token
 }
 });
 console.log(' Auth: Web session restored successfully');
 } else {
 console.log(' Auth: Token is invalid, clearing storage...');
 localStorage.removeItem('authToken');
 localStorage.removeItem('userData');
 }
 } catch (validateError) {
 console.error(' Auth: Token validation failed:', validateError);
 console.log(' Auth: Clearing invalid credentials...');
 localStorage.removeItem('authToken');
 localStorage.removeItem('userData');
 }
 } else {
 console.log(' Auth: No existing web session found');
 }
 } catch (error) {
 console.error(' Auth: Error checking web auth state:', error);
 // Clear potentially corrupted data
 localStorage.removeItem('authToken');
 localStorage.removeItem('userData');
 } finally {
 console.log(' Auth: Web auth check complete - setting loading to false');
 dispatch({ type: 'SET_LOADING', payload: false });
 }
 };

 const checkAuthState = async () => {
 try {
 console.log(' Auth: checkAuthState called - this should only happen on native');
 
 // Double-check we're not on web
 if (Platform.OS === 'web' || typeof window !== 'undefined') {
 console.log(' Auth: ERROR - checkAuthState called on web, forcing loading to false');
 dispatch({ type: 'SET_LOADING', payload: false });
 return;
 }
 
 // Native environment - proceed with storage check
 console.log(' Auth: Proceeding with native storage check...');
 const token = await storage.getItem('authToken');
 const userData = await storage.getItem('userData');
 
 console.log(' Auth: Native check - Token found:', !!token, 'User data found:', !!userData);
 
 if (token && userData) {
 const user = JSON.parse(userData);
 console.log(' Auth: Restoring session for user:', user.email);
 
 dispatch({
 type: 'LOGIN_SUCCESS',
 payload: {
 user: user,
 token: token
 }
 });
 console.log(' Auth: Session restored successfully');
 } else {
 console.log(' Auth: No existing session found');
 }
 } catch (error) {
 console.error(' Auth: Error checking auth state:', error);
 } finally {
 console.log(' Auth: checkAuthState complete - setting loading to false');
 dispatch({ type: 'SET_LOADING', payload: false });
 }
 };

 const login = async (email, password) => {
 console.log(' Auth: Login called with:', email);
 dispatch({ type: 'LOGIN_START' });
 
 try {
 // First, try the real backend
 try {
 console.log(' Auth: Attempting backend login...');
 console.log(' Auth: Request URL:', `${API_BASE_URL}/auth/login`);
 console.log(' Auth: Request payload:', {
 email: email.toLowerCase().trim(),
 password: password
 });
 const response = await axios.post('/auth/login', {
 email: email.toLowerCase().trim(),
 password: password
 });
 
 console.log(' Auth: Backend login response:', response.data);
 
 if (response.data.success) {
 console.log(' Auth: Full response.data:', JSON.stringify(response.data, null, 2));
 const { user, tokens } = response.data.data;
 const token = tokens?.accessToken || tokens?.token; // Handle both structures
 
 console.log(' Auth: Extracted user:', user);
 console.log(' Auth: Extracted tokens:', tokens);
 console.log(' Auth: Final token:', token);
 console.log(' Auth: response.data.data:', response.data.data);
 
 if (!token) {
 console.error(' Auth: Token is missing from response!');
 // Check if token is elsewhere in the response
 console.log(' Auth: Checking response.data.token:', response.data.token);
 console.log(' Auth: Checking response.data.accessToken:', response.data.accessToken);
 throw new Error('No authentication token received');
 }
 
 console.log(' Auth: About to store - user:', user, 'token:', token);
 
 // Store token and user data using storage helper
 await storage.setItem('authToken', token);
 await storage.setItem('userData', JSON.stringify(user));
 
 console.log(' Auth: Storage complete, dispatching LOGIN_SUCCESS');
 
 dispatch({
 type: 'LOGIN_SUCCESS',
 payload: { user, token }
 });
 
 console.log(' Auth: Backend login successful for user:', user.email, 'with token:', token);
 return { success: true, user, token };
 } else {
 throw new Error(response.data.message || 'Login failed');
 }
 } catch (backendError) {
 console.error(' Auth: Backend login failed:', backendError.message);
 throw backendError;
 }
 } catch (error) {
 console.error(' Auth: Login error:', error);
 const errorMessage = error.response?.data?.message || error.message || 'Login failed';
 
 dispatch({
 type: 'LOGIN_FAILURE',
 payload: { error: errorMessage }
 });
 
 return { success: false, message: errorMessage };
 }
 };

 const register = async (email, password, firstName, lastName, phoneNumber, role = 'client', skills = []) => {
 console.log(' Auth: Register called with:', email, firstName, lastName);
 dispatch({ type: 'REGISTER_START' });
 
 try {
 const requestData = {
 email: email.toLowerCase().trim(),
 password: password,
 firstName: firstName.trim(),
 lastName: lastName.trim(),
 phoneNumber: phoneNumber?.trim(),
 role: role
 };
 
 // Add skills if registering as technician
 if (role === 'technician' && skills && skills.length > 0) {
 requestData.skills = skills;
 console.log(' Auth: Including skills for technician:', skills);
 }
 
 const response = await axios.post('/auth/register', requestData);
 
 console.log(' Auth: Register response:', response.data);
 
 if (response.data.success) {
 // Extract user and tokens from response
 const userData = response.data.data.user || response.data.data;
 const tokens = response.data.data.tokens;
 const token = tokens?.accessToken || response.data.data.token;
 
 console.log(' Auth: Extracted userData:', userData);
 console.log(' Auth: Extracted tokens object:', tokens);
 console.log(' Auth: Extracted token (accessToken):', token);
 console.log(' Auth: Token exists?', !!token);
 
 // Validate token exists
 if (!token) {
 throw new Error('No access token received from server');
 }
 
 // Store token and user data using storage helper
 await storage.setItem('authToken', token);
 await storage.setItem('userData', JSON.stringify(userData));
 
 console.log(' Auth: Token and user stored successfully');
 
 dispatch({
 type: 'REGISTER_SUCCESS',
 payload: { user: userData, token }
 });
 
 console.log(' Auth: Registration successful for user:', userData.email);
 return { success: true, user: userData, token };
 } else {
 throw new Error(response.data.message || 'Registration failed');
 }
 } catch (error) {
 console.error(' Auth: Register error:', error);
 const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
 
 dispatch({
 type: 'REGISTER_FAILURE',
 payload: { error: errorMessage }
 });
 
 return { success: false, message: errorMessage };
 }
 };

 const logout = async (skipBackendCall = false) => {
 console.log(' Auth: Logout function called, skipBackendCall:', skipBackendCall);
 
 try {
 // Call backend logout endpoint if we have a token and not skipping
 if (state.token && !skipBackendCall) {
 console.log(' Auth: Calling backend logout endpoint with token...');
 try {
 await axios.post('/auth/logout');
 console.log(' Auth: Backend logout successful');
 } catch (backendError) {
 console.error(' Auth: Backend logout failed but continuing:', backendError.response?.data || backendError.message);
 }
 } else {
 console.log(' Auth: Skipping backend logout call - token:', !!state.token, 'skipBackendCall:', skipBackendCall);
 }
 } catch (error) {
 console.error(' Auth: Backend logout error:', error);
 // Continue with logout even if backend call fails
 } finally {
 try {
 console.log(' Auth: Starting storage cleanup...');
 // Clear local storage using storage helper
 await storage.removeItem('authToken');
 console.log(' Auth: Removed authToken from storage');
 await storage.removeItem('userData');
 console.log(' Auth: Removed userData from storage');
 console.log(' Auth: Local storage cleared successfully');
 
 console.log(' Auth: Dispatching LOGOUT action...');
 dispatch({ type: 'LOGOUT' });
 console.log(' Auth: LOGOUT action dispatched successfully');
 
 } catch (storageError) {
 console.error(' Auth: Storage cleanup error:', storageError);
 // Still dispatch logout even if storage cleanup fails
 console.log(' Auth: Dispatching LOGOUT action despite storage error...');
 dispatch({ type: 'LOGOUT' });
 console.log(' Auth: LOGOUT action dispatched after storage error');
 }
 }
 };

 const clearError = () => {
 dispatch({ type: 'CLEAR_ERROR' });
 };

 const updateUser = async (updates) => {
 try {
 console.log(' Auth: updateUser called with:', updates);
 
 // Update local state immediately for better UX
 dispatch({ type: 'UPDATE_USER', payload: updates });
 
 // Also update stored user data
 const currentUserData = await storage.getItem('userData');
 if (currentUserData) {
 const userData = JSON.parse(currentUserData);
 const updatedUserData = { ...userData, ...updates };
 await storage.setItem('userData', JSON.stringify(updatedUserData));
 console.log(' Auth: Updated user data in storage');
 }
 
 return { success: true };
 } catch (error) {
 console.error(' Auth: updateUser error:', error);
 return { success: false, error: error.message };
 }
 };

 const value = {
 ...state,
 login,
 register,
 logout,
 clearError,
 updateUser,
 };

 return (
 <AuthContext.Provider value={value}>
 {children}
 </AuthContext.Provider>
 );
}

export function useAuth() {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
}
