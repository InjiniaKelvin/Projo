// LoginScreen.js
// Enhanced login screen with comprehensive authentication features

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
 ActivityIndicator,
 Alert,
 KeyboardAvoidingView,
 Platform,
 ScrollView,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View
} from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';
import StorageService from '../services/StorageService';

export default function LoginScreen({ navigation }) {
 // Authentication context
 const { login, isLoginLoading, error } = useAuth();
 
 // Form state
 const [formData, setFormData] = useState({
 email: '',
 password: '',
 });
 
 // UI state
 const [showPassword, setShowPassword] = useState(false);
 const [rememberMe, setRememberMe] = useState(false);
 const [validationErrors, setValidationErrors] = useState({});

 // Load remembered email on component mount
 useEffect(() => {
 loadRememberedEmail();
 }, []);

 /**
 * Load remembered email from storage if "Remember Me" was enabled
 */
 const loadRememberedEmail = async () => {
 try {
 const rememberedEmail = await StorageService.getRememberedEmail();
 if (rememberedEmail) {
 setFormData(prev => ({ ...prev, email: rememberedEmail }));
 setRememberMe(true);
 }
 } catch (error) {
 console.error('Error loading remembered email:', error);
 }
 };

 /**
 * Update form data
 * @param {string} field - Field name to update
 * @param {string} value - New value
 */
 const updateFormData = (field, value) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 
 // Clear validation error for this field
 if (validationErrors[field]) {
 setValidationErrors(prev => ({ ...prev, [field]: null }));
 }
 };

 /**
 * Validate form data
 * @returns {boolean} - Whether form is valid
 */
 const validateForm = () => {
 const errors = {};

 // Email validation
 if (!formData.email.trim()) {
 errors.email = 'Email is required';
 } else if (!isValidEmail(formData.email)) {
 errors.email = 'Please enter a valid email address';
 }

 // Password validation
 if (!formData.password) {
 errors.password = 'Password is required';
 } else if (formData.password.length < 6) {
 errors.password = 'Password must be at least 6 characters';
 }

 setValidationErrors(errors);
 return Object.keys(errors).length === 0;
 };

 /**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
 const isValidEmail = (email) => {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 return emailRegex.test(email);
 };

 /**
 * Handle login form submission
 */
 const handleLogin = async () => {
 // Validate form
 if (!validateForm()) {
 return;
 }

 try {
 // Attempt login
 const result = await login(formData.email, formData.password);
 
 if (result.success) {
 // Store email if "Remember Me" is enabled
 if (rememberMe) {
 await StorageService.storeRememberedEmail(formData.email);
 } else {
 await StorageService.clearRememberedEmail();
 }

 // Navigation is handled automatically by AuthContext state change
 Alert.alert('Success', 'Login successful!');
 } else {
 // Show error message
 Alert.alert('Login Failed', result.message || 'Invalid credentials');
 }
 } catch (error) {
 console.error('Login error:', error);
 Alert.alert('Error', 'An unexpected error occurred. Please try again.');
 }
 };

 /**
 * Handle forgot password
 */
 const handleForgotPassword = () => {
 if (!formData.email.trim()) {
 Alert.alert(
 'Email Required',
 'Please enter your email address first.',
 [
 {
 text: 'OK',
 onPress: () => {
 // Focus email input (you could use a ref here)
 }
 }
 ]
 );
 return;
 }

 Alert.alert(
 'Password Reset',
 `Password reset instructions will be sent to ${formData.email}`,
 [
 {
 text: 'Cancel',
 style: 'cancel',
 },
 {
 text: 'Send',
 onPress: () => {
 // TODO: Implement password reset
 Alert.alert('Sent', 'Password reset instructions sent to your email.');
 }
 }
 ]
 );
 };

 return (
 <KeyboardAvoidingView 
 style={styles.container}
 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
 >
 <ScrollView 
 contentContainerStyle={styles.scrollContent}
 keyboardShouldPersistTaps="handled"
 >
 {/* Header */}
 <View style={styles.header}>
 <Ionicons name="construct" size={60} color="#0d6efd" />
 <Text style={styles.title}>Welcome Back</Text>
 <Text style={styles.subtitle}>Sign in to your QuickFix account</Text>
 </View>

 {/* Error Display */}
 {error && (
 <View style={styles.errorContainer}>
 <Ionicons name="alert-circle" size={20} color="#dc3545" />
 <Text style={styles.errorText}>{error}</Text>
 </View>
 )}

 {/* Login Form */}
 <View style={styles.form}>
 {/* Email Input */}
 <View style={styles.inputContainer}>
 <Text style={styles.inputLabel}>Email Address</Text>
 <View style={[styles.inputWrapper, validationErrors.email && styles.inputError]}>
 <Ionicons name="mail-outline" size={20} color="#6c757d" style={styles.inputIcon} />
 <TextInput
 style={styles.textInput}
 placeholder="Enter your email"
 value={formData.email}
 onChangeText={(value) => updateFormData('email', value)}
 keyboardType="email-address"
 autoCapitalize="none"
 autoCorrect={false}
 editable={!isLoginLoading}
 />
 </View>
 {validationErrors.email && (
 <Text style={styles.validationError}>{validationErrors.email}</Text>
 )}
 </View>

 {/* Password Input */}
 <View style={styles.inputContainer}>
 <Text style={styles.inputLabel}>Password</Text>
 <View style={[styles.inputWrapper, validationErrors.password && styles.inputError]}>
 <Ionicons name="lock-closed-outline" size={20} color="#6c757d" style={styles.inputIcon} />
 <TextInput
 style={styles.textInput}
 placeholder="Enter your password"
 value={formData.password}
 onChangeText={(value) => updateFormData('password', value)}
 secureTextEntry={!showPassword}
 editable={!isLoginLoading}
 />
 <TouchableOpacity
 style={styles.passwordToggle}
 onPress={() => setShowPassword(!showPassword)}
 >
 <Ionicons 
 name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
 size={20} 
 color="#6c757d" 
 />
 </TouchableOpacity>
 </View>
 {validationErrors.password && (
 <Text style={styles.validationError}>{validationErrors.password}</Text>
 )}
 </View>

 {/* Remember Me & Forgot Password */}
 <View style={styles.optionsContainer}>
 <TouchableOpacity
 style={styles.rememberMeContainer}
 onPress={() => setRememberMe(!rememberMe)}
 >
 <Ionicons
 name={rememberMe ? 'checkbox' : 'checkbox-outline'}
 size={20}
 color="#0d6efd"
 />
 <Text style={styles.rememberMeText}>Remember me</Text>
 </TouchableOpacity>

 <TouchableOpacity onPress={handleForgotPassword}>
 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
 </TouchableOpacity>
 </View>

 {/* Login Button */}
 <TouchableOpacity
 style={[styles.loginButton, isLoginLoading && styles.disabledButton]}
 onPress={handleLogin}
 disabled={isLoginLoading}
 >
 {isLoginLoading ? (
 <ActivityIndicator color="#fff" size="small" />
 ) : (
 <Text style={styles.loginButtonText}>Sign In</Text>
 )}
 </TouchableOpacity>

 {/* Registration Link */}
 <View style={styles.registerContainer}>
 <Text style={styles.registerText}>Don't have an account? </Text>
 <TouchableOpacity 
 onPress={() => navigation.navigate('Register')}
 disabled={isLoginLoading}
 >
 <Text style={styles.registerLink}>Sign Up</Text>
 </TouchableOpacity>
 </View>
 </View>
 </ScrollView>
 </KeyboardAvoidingView>
 );
}

// Comprehensive styles for the enhanced login screen
const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f7fa',
 },
 scrollContent: {
 flexGrow: 1,
 justifyContent: 'center',
 padding: 20,
 },
 header: {
 alignItems: 'center',
 marginBottom: 40,
 },
 title: {
 fontSize: 28,
 fontWeight: 'bold',
 color: '#212529',
 marginTop: 20,
 marginBottom: 8,
 },
 subtitle: {
 fontSize: 16,
 color: '#6c757d',
 textAlign: 'center',
 },
 errorContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#f8d7da',
 borderColor: '#f5c6cb',
 borderWidth: 1,
 borderRadius: 8,
 padding: 12,
 marginBottom: 20,
 },
 errorText: {
 color: '#721c24',
 marginLeft: 8,
 flex: 1,
 },
 form: {
 marginBottom: 20,
 },
 inputContainer: {
 marginBottom: 20,
 },
 inputLabel: {
 fontSize: 16,
 fontWeight: '600',
 color: '#212529',
 marginBottom: 8,
 },
 inputWrapper: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#fff',
 borderWidth: 1,
 borderColor: '#dee2e6',
 borderRadius: 8,
 paddingHorizontal: 12,
 minHeight: 50,
 },
 inputError: {
 borderColor: '#dc3545',
 },
 inputIcon: {
 marginRight: 10,
 },
 textInput: {
 flex: 1,
 fontSize: 16,
 color: '#212529',
 paddingVertical: 0,
 },
 passwordToggle: {
 padding: 4,
 },
 validationError: {
 color: '#dc3545',
 fontSize: 14,
 marginTop: 4,
 },
 optionsContainer: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 marginBottom: 30,
 },
 rememberMeContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 rememberMeText: {
 marginLeft: 8,
 fontSize: 16,
 color: '#212529',
 },
 forgotPasswordText: {
 fontSize: 16,
 color: '#0d6efd',
 fontWeight: '500',
 },
 loginButton: {
 backgroundColor: '#0d6efd',
 borderRadius: 8,
 paddingVertical: 15,
 alignItems: 'center',
 marginBottom: 20,
 },
 disabledButton: {
 backgroundColor: '#6c757d',
 },
 loginButtonText: {
 color: '#fff',
 fontSize: 18,
 fontWeight: '600',
 },
 registerContainer: {
 flexDirection: 'row',
 justifyContent: 'center',
 alignItems: 'center',
 },
 registerText: {
 fontSize: 16,
 color: '#6c757d',
 },
 registerLink: {
 fontSize: 16,
 color: '#0d6efd',
 fontWeight: '600',
 },
});
