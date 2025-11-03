// RegisterScreen.js
// Enhanced registration screen with comprehensive authentication features

import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
 // Authentication context
 const { register, isRegisterLoading, error } = useAuth();
 
 // Form state
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 password: '',
 confirmPassword: '',
 userType: 'client',
 phone: '',
 });
 
 // UI state
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [validationErrors, setValidationErrors] = useState({});
 const [agreedToTerms, setAgreedToTerms] = useState(false);

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

 // Name validation
 if (!formData.name.trim()) {
 errors.name = 'Full name is required';
 } else if (formData.name.trim().length < 2) {
 errors.name = 'Name must be at least 2 characters';
 }

 // Email validation
 if (!formData.email.trim()) {
 errors.email = 'Email is required';
 } else if (!isValidEmail(formData.email)) {
 errors.email = 'Please enter a valid email address';
 }

 // Phone validation
 if (!formData.phone.trim()) {
 errors.phone = 'Phone number is required';
 } else if (!isValidPhone(formData.phone)) {
 errors.phone = 'Please enter a valid phone number';
 }

 // Password validation
 if (!formData.password) {
 errors.password = 'Password is required';
 } else if (formData.password.length < 8) {
 errors.password = 'Password must be at least 8 characters';
 } else if (!isStrongPassword(formData.password)) {
 errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
 }

 // Confirm password validation
 if (!formData.confirmPassword) {
 errors.confirmPassword = 'Please confirm your password';
 } else if (formData.password !== formData.confirmPassword) {
 errors.confirmPassword = 'Passwords do not match';
 }

 // Terms agreement validation
 if (!agreedToTerms) {
 errors.terms = 'You must agree to the Terms of Service and Privacy Policy';
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
 * Validate phone format
 * @param {string} phone - Phone to validate
 * @returns {boolean} - Whether phone is valid
 */
 const isValidPhone = (phone) => {
 const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
 return phoneRegex.test(phone.replace(/\s/g, ''));
 };

 /**
 * Check if password is strong
 * @param {string} password - Password to validate
 * @returns {boolean} - Whether password is strong
 */
 const isStrongPassword = (password) => {
 const hasUpperCase = /[A-Z]/.test(password);
 const hasLowerCase = /[a-z]/.test(password);
 const hasNumbers = /\d/.test(password);
 return hasUpperCase && hasLowerCase && hasNumbers;
 };

 /**
 * Handle registration form submission
 */
 const handleRegister = async () => {
 // Validate form
 if (!validateForm()) {
 return;
 }

 try {
 // Attempt registration
 const result = await register(formData);
 
 if (result.success) {
 // Registration successful
 Alert.alert(
 'Registration Successful',
 'Your account has been created successfully!',
 [
 {
 text: 'OK',
 onPress: () => {
 // Navigation is handled automatically by AuthContext state change
 }
 }
 ]
 );
 } else {
 // Show error message
 Alert.alert('Registration Failed', result.message || 'Failed to create account');
 }
 } catch (error) {
 console.error('Registration error:', error);
 Alert.alert('Error', 'An unexpected error occurred. Please try again.');
 }
 };

 return (
 <KeyboardAvoidingView 
 style={styles.container}
 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
 >
 <ScrollView 
 contentContainerStyle={styles.scrollContent}
 keyboardShouldPersistTaps="handled"
 showsVerticalScrollIndicator={false}
 >
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity 
 style={styles.backButton}
 onPress={() => navigation.goBack()}
 >
 <Ionicons name="arrow-back" size={24} color="#0d6efd" />
 </TouchableOpacity>
 <View style={styles.headerContent}>
 <Ionicons name="person-add" size={50} color="#0d6efd" />
 <Text style={styles.title}>Create Account</Text>
 <Text style={styles.subtitle}>Join QuickFix today</Text>
 </View>
 </View>

 {/* Error Display */}
 {error && (
 <View style={styles.errorContainer}>
 <Ionicons name="alert-circle" size={20} color="#dc3545" />
 <Text style={styles.errorText}>{error}</Text>
 </View>
 )}

 {/* Registration Form */}
 <View style={styles.form}>
 {/* Full Name Input */}
 <View style={styles.inputContainer}>
 <Text style={styles.inputLabel}>Full Name *</Text>
 <View style={[styles.inputWrapper, validationErrors.name && styles.inputError]}>
 <Ionicons name="person-outline" size={20} color="#6c757d" style={styles.inputIcon} />
 <TextInput
 style={styles.textInput}
 placeholder="Enter your full name"
 value={formData.name}
 onChangeText={(value) => updateFormData('name', value)}
 editable={!isRegisterLoading}
 />
 </View>
 {validationErrors.name && (
 <Text style={styles.validationError}>{validationErrors.name}</Text>
 )}
 </View>

 {/* Email Input */}
 <View style={styles.inputContainer}>
 <Text style={styles.inputLabel}>Email Address *</Text>
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
 editable={!isRegisterLoading}
 />
 </View>
 {validationErrors.email && (
 <Text style={styles.validationError}>{validationErrors.email}</Text>
 )}
 </View>

 {/* Phone Input */}
 <View style={styles.inputContainer}>
 <Text style={styles.inputLabel}>Phone Number *</Text>
 <View style={[styles.inputWrapper, validationErrors.phone && styles.inputError]}>
 <Ionicons name="call-outline" size={20} color="#6c757d" style={styles.inputIcon} />
 <TextInput
 style={styles.textInput}
 placeholder="Enter your phone number"
 value={formData.phone}
 onChangeText={(value) => updateFormData('phone', value)}
 keyboardType="phone-pad"
 editable={!isRegisterLoading}
 />
 </View>
 {validationErrors.phone && (
 <Text style={styles.validationError}>{validationErrors.phone}</Text>
 )}
 </View>

 {/* User Type Picker */}
 <View style={styles.inputContainer}>
 <Text style={styles.inputLabel}>Account Type *</Text>
 <View style={styles.pickerWrapper}>
 <Ionicons name="business-outline" size={20} color="#6c757d" style={styles.inputIcon} />
 <Picker
 selectedValue={formData.userType}
 onValueChange={(value) => updateFormData('userType', value)}
 style={styles.picker}
 enabled={!isRegisterLoading}
 >
 <Picker.Item label="Client - Request Services" value="client" />
 <Picker.Item label="Technician - Provide Services" value="technician" />
 <Picker.Item label="Admin - Manage Platform" value="admin" />
 </Picker>
 </View>
 </View>

 {/* Password Input */}
 <View style={styles.inputContainer}>
 <Text style={styles.inputLabel}>Password *</Text>
 <View style={[styles.inputWrapper, validationErrors.password && styles.inputError]}>
 <Ionicons name="lock-closed-outline" size={20} color="#6c757d" style={styles.inputIcon} />
 <TextInput
 style={styles.textInput}
 placeholder="Create a strong password"
 value={formData.password}
 onChangeText={(value) => updateFormData('password', value)}
 secureTextEntry={!showPassword}
 editable={!isRegisterLoading}
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

 {/* Confirm Password Input */}
 <View style={styles.inputContainer}>
 <Text style={styles.inputLabel}>Confirm Password *</Text>
 <View style={[styles.inputWrapper, validationErrors.confirmPassword && styles.inputError]}>
 <Ionicons name="lock-closed-outline" size={20} color="#6c757d" style={styles.inputIcon} />
 <TextInput
 style={styles.textInput}
 placeholder="Confirm your password"
 value={formData.confirmPassword}
 onChangeText={(value) => updateFormData('confirmPassword', value)}
 secureTextEntry={!showConfirmPassword}
 editable={!isRegisterLoading}
 />
 <TouchableOpacity
 style={styles.passwordToggle}
 onPress={() => setShowConfirmPassword(!showConfirmPassword)}
 >
 <Ionicons 
 name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
 size={20} 
 color="#6c757d" 
 />
 </TouchableOpacity>
 </View>
 {validationErrors.confirmPassword && (
 <Text style={styles.validationError}>{validationErrors.confirmPassword}</Text>
 )}
 </View>

 {/* Terms Agreement */}
 <View style={styles.termsContainer}>
 <TouchableOpacity
 style={styles.checkboxContainer}
 onPress={() => setAgreedToTerms(!agreedToTerms)}
 >
 <Ionicons
 name={agreedToTerms ? 'checkbox' : 'checkbox-outline'}
 size={20}
 color="#0d6efd"
 />
 </TouchableOpacity>
 <View style={styles.termsTextContainer}>
 <Text style={styles.termsText}>
 I agree to the{' '}
 <Text style={styles.termsLink}>Terms of Service</Text>
 {' '}and{' '}
 <Text style={styles.termsLink}>Privacy Policy</Text>
 </Text>
 </View>
 </View>
 {validationErrors.terms && (
 <Text style={styles.validationError}>{validationErrors.terms}</Text>
 )}

 {/* Register Button */}
 <TouchableOpacity
 style={[styles.registerButton, isRegisterLoading && styles.disabledButton]}
 onPress={handleRegister}
 disabled={isRegisterLoading}
 >
 {isRegisterLoading ? (
 <ActivityIndicator color="#fff" size="small" />
 ) : (
 <Text style={styles.registerButtonText}>Create Account</Text>
 )}
 </TouchableOpacity>

 {/* Login Link */}
 <View style={styles.loginContainer}>
 <Text style={styles.loginText}>Already have an account? </Text>
 <TouchableOpacity 
 onPress={() => navigation.navigate('Login')}
 disabled={isRegisterLoading}
 >
 <Text style={styles.loginLink}>Sign In</Text>
 </TouchableOpacity>
 </View>
 </View>
 </ScrollView>
 </KeyboardAvoidingView>
 );
}

// Comprehensive styles for the enhanced registration screen
const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f7fa',
 },
 scrollContent: {
 flexGrow: 1,
 padding: 20,
 },
 header: {
 marginBottom: 30,
 marginTop: 20,
 },
 backButton: {
 alignSelf: 'flex-start',
 padding: 8,
 marginBottom: 20,
 },
 headerContent: {
 alignItems: 'center',
 },
 title: {
 fontSize: 28,
 fontWeight: 'bold',
 color: '#212529',
 marginTop: 15,
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
 pickerWrapper: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#fff',
 borderWidth: 1,
 borderColor: '#dee2e6',
 borderRadius: 8,
 paddingLeft: 12,
 minHeight: 50,
 },
 picker: {
 flex: 1,
 height: 50,
 },
 validationError: {
 color: '#dc3545',
 fontSize: 14,
 marginTop: 4,
 },
 termsContainer: {
 flexDirection: 'row',
 alignItems: 'flex-start',
 marginBottom: 20,
 },
 checkboxContainer: {
 marginRight: 10,
 marginTop: 2,
 },
 termsTextContainer: {
 flex: 1,
 },
 termsText: {
 fontSize: 14,
 color: '#6c757d',
 lineHeight: 20,
 },
 termsLink: {
 color: '#0d6efd',
 fontWeight: '500',
 },
 registerButton: {
 backgroundColor: '#0d6efd',
 borderRadius: 8,
 paddingVertical: 15,
 alignItems: 'center',
 marginBottom: 20,
 },
 disabledButton: {
 backgroundColor: '#6c757d',
 },
 registerButtonText: {
 color: '#fff',
 fontSize: 18,
 fontWeight: '600',
 },
 loginContainer: {
 flexDirection: 'row',
 justifyContent: 'center',
 alignItems: 'center',
 },
 loginText: {
 fontSize: 16,
 color: '#6c757d',
 },
 loginLink: {
 fontSize: 16,
 color: '#0d6efd',
 fontWeight: '600',
 },
});
