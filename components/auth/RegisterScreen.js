/**
 * Registration Screen Component
 * Handles user registration with role selection and backend integration
 */

import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
 Alert,
 Dimensions,
 KeyboardAvoidingView,
 Platform,
 ScrollView,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/SimpleAuthContext';
import WebCompatibleButton from '../WebCompatibleButton';
import { QUICKFIX_SERVICES } from '../../constants/services';
import { SHADOWS } from '../../utils/shadows';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RegisterScreen() {
 const [formData, setFormData] = useState({
 firstName: '',
 lastName: '',
 email: '',
 phoneNumber: '',
 password: '',
 confirmPassword: '',
 role: 'client',
 skills: []
 });
 const [isLoading, setIsLoading] = useState(false);
 const [skillInput, setSkillInput] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [passwordsMatch, setPasswordsMatch] = useState(true);

 const router = useRouter();
 const { register, error, clearError } = useAuth();

 const handleInputChange = (field, value) => {
 setFormData(prev => ({
 ...prev,
 [field]: value
 }));
 
 // Check password matching in real-time
 if (field === 'password' || field === 'confirmPassword') {
 const updatedData = { ...formData, [field]: value };
 if (updatedData.confirmPassword) {
 setPasswordsMatch(updatedData.password === updatedData.confirmPassword);
 } else {
 setPasswordsMatch(true); // Reset when confirm password is empty
 }
 }
 };

 const addSkill = () => {
 if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
 setFormData(prev => ({
 ...prev,
 skills: [...prev.skills, skillInput.trim()]
 }));
 setSkillInput('');
 }
 };

 const removeSkill = (skillToRemove) => {
 setFormData(prev => ({
 ...prev,
 skills: prev.skills.filter(skill => skill !== skillToRemove)
 }));
 };

 const validateForm = () => {
 const { firstName, lastName, email, phoneNumber, password, confirmPassword, role } = formData;

 if (!firstName.trim() || !lastName.trim()) {
 Alert.alert('Error', 'Please enter your first and last name');
 return false;
 }

 if (!email.trim() || !email.includes('@')) {
 Alert.alert('Error', 'Please enter a valid email address');
 return false;
 }

 if (!phoneNumber.trim()) {
 Alert.alert('Error', 'Please enter your phone number');
 return false;
 }

 if (password.length < 6) {
 Alert.alert('Error', 'Password must be at least 6 characters long');
 return false;
 }

 if (password !== confirmPassword) {
 Alert.alert('Error', 'Passwords do not match');
 return false;
 }

 if (role === 'technician' && formData.skills.length === 0) {
 Alert.alert('Error', 'Please add at least one skill for technician registration');
 return false;
 }

 return true;
 };

 const handleRegister = async () => {
 console.log('RegisterScreen: handleRegister called');
 
 if (!validateForm()) {
 return;
 }

 console.log('RegisterScreen: validation passed, starting registration...');
 setIsLoading(true);
 clearError && clearError();

 try {
 const { firstName, lastName, email, phoneNumber, password, role, skills } = formData;
 console.log('RegisterScreen: calling register with:', email, firstName, lastName);
 
 const result = await register(email, password, firstName, lastName, phoneNumber, role, skills);
 console.log('RegisterScreen: register result:', result);
 
 if (result && result.success) {
 Alert.alert(
 'Success',
 'Registration successful! Welcome to QuickFix.',
 [
 {
 text: 'OK',
 onPress: () => {
 // Redirect to appropriate dashboard based on role
 if (formData.role === 'admin') {
 router.replace('/dashboard/admin');
 } else if (formData.role === 'technician') {
 router.replace('/dashboard/technician');
 } else {
 router.replace('/dashboard/client');
 }
 }
 }
 ]
 );
 } else {
 Alert.alert('Registration Failed', result?.message || 'Registration failed');
 }
 } catch (error) {
 console.error('Registration error:', error);
 const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
 Alert.alert('Registration Failed', errorMessage);
 } finally {
 setIsLoading(false);
 }
 };

 const handleSignIn = () => {
 router.push('/auth/login');
 };

 return (
 <KeyboardAvoidingView 
 style={styles.container}
 behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
 keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
 >
 <ScrollView 
 style={styles.scrollView} 
 contentContainerStyle={styles.scrollContent}
 showsVerticalScrollIndicator={false}
 keyboardShouldPersistTaps="handled"
 >
 <View style={styles.content}>
 <Text style={styles.title}>Create Account</Text>
 <Text style={styles.subtitle}>Join QuickFix today</Text>

 <View style={styles.form}>
 <TextInput
 style={styles.input}
 placeholder="First Name"
 placeholderTextColor="#999"
 value={formData.firstName}
 onChangeText={(value) => handleInputChange('firstName', value)}
 autoCapitalize="words"
 textContentType="givenName"
 autoComplete="name-given"
 />

 <TextInput
 style={styles.input}
 placeholder="Last Name"
 placeholderTextColor="#999"
 value={formData.lastName}
 onChangeText={(value) => handleInputChange('lastName', value)}
 autoCapitalize="words"
 textContentType="familyName"
 autoComplete="name-family"
 />

 <TextInput
 style={styles.input}
 placeholder="Email"
 placeholderTextColor="#999"
 value={formData.email}
 onChangeText={(value) => handleInputChange('email', value)}
 keyboardType="email-address"
 autoCapitalize="none"
 autoCorrect={false}
 textContentType="emailAddress"
 autoComplete="email"
 />

 <TextInput
 style={styles.input}
 placeholder="Phone Number (e.g., +254712345678)"
 placeholderTextColor="#999"
 value={formData.phoneNumber}
 onChangeText={(value) => handleInputChange('phoneNumber', value)}
 keyboardType="phone-pad"
 textContentType="telephoneNumber"
 autoComplete="tel"
 />

 <View style={styles.passwordContainer}>
 <TextInput
 style={styles.passwordInput}
 placeholder="Password"
 placeholderTextColor="#999"
 value={formData.password}
 onChangeText={(value) => handleInputChange('password', value)}
 secureTextEntry={!showPassword}
 autoCapitalize="none"
 textContentType="newPassword"
 autoComplete="password-new"
 />
 <TouchableOpacity
 style={styles.eyeButton}
 onPress={() => setShowPassword(!showPassword)}
 accessible={true}
 accessibilityLabel={showPassword ? "Hide password" : "Show password"}
 accessibilityRole="button"
 >
 <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
 </TouchableOpacity>
 </View>

 <View style={styles.passwordContainer}>
 <TextInput
 style={styles.passwordInput}
 placeholder="Confirm Password"
 placeholderTextColor="#999"
 value={formData.confirmPassword}
 onChangeText={(value) => handleInputChange('confirmPassword', value)}
 secureTextEntry={!showConfirmPassword}
 autoCapitalize="none"
 textContentType="newPassword"
 />
 <TouchableOpacity
 style={styles.eyeButton}
 onPress={() => setShowConfirmPassword(!showConfirmPassword)}
 accessible={true}
 accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
 accessibilityRole="button"
 >
 <Text style={styles.eyeText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
 </TouchableOpacity>
 </View>

 {formData.confirmPassword && !passwordsMatch && (
 <Text style={styles.passwordMismatchText}>
 Passwords do not match
 </Text>
 )}

 <View style={styles.pickerContainer}>
 <Text style={styles.label}>I am a:</Text>
 <Picker
 selectedValue={formData.role}
 style={styles.picker}
 onValueChange={(value) => handleInputChange('role', value)}
 >
 <Picker.Item label="Client (Need Services)" value="client" />
 <Picker.Item label="Technician (Provide Services)" value="technician" />
 </Picker>
 </View>

 {formData.role === 'technician' && (
 <View style={styles.skillsSection}>
 <Text style={styles.label}>Select Your Services (at least 1):</Text>
 <Text style={styles.helperText}>Choose services you can provide</Text>
 
 <View style={styles.servicesGrid}>
 {QUICKFIX_SERVICES.map((service) => {
   const isSelected = formData.skills.includes(service.id);
   return (
     <TouchableOpacity
       key={service.id}
       style={[
         styles.serviceCard,
         isSelected && styles.serviceCardSelected
       ]}
       onPress={() => {
         setFormData(prev => ({
           ...prev,
           skills: isSelected
             ? prev.skills.filter(s => s !== service.id)
             : [...prev.skills, service.id]
         }));
       }}
     >
       <Ionicons 
         name={service.icon} 
         size={24} 
         color={isSelected ? '#fff' : '#0d6efd'} 
       />
       <Text style={[
         styles.serviceName,
         isSelected && styles.serviceNameSelected
       ]}>
         {service.name}
       </Text>
       {isSelected && (
         <Ionicons 
           name="checkmark-circle" 
           size={20} 
           color="#fff" 
           style={styles.checkmark}
         />
       )}
     </TouchableOpacity>
   );
 })}
 </View>
 
 {formData.skills.length > 0 && (
   <Text style={styles.selectedCount}>
     {formData.skills.length} service{formData.skills.length > 1 ? 's' : ''} selected
   </Text>
 )}
 </View>
 )}

 <WebCompatibleButton
 title={isLoading ? "Creating Account..." : "Create Account"}
 onPress={handleRegister}
 disabled={isLoading}
 style={[styles.registerButton, isLoading && styles.disabledButton]}
 />
 </View>

 <View style={styles.footer}>
 <Text style={styles.footerText}>Already have an account? </Text>
 <TouchableOpacity onPress={handleSignIn}>
 <Text style={styles.signInText}>Sign In</Text>
 </TouchableOpacity>
 </View>
 </View>
 </ScrollView>
 </KeyboardAvoidingView>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f5f5'
 },
 scrollView: {
 flex: 1
 },
 scrollContent: {
 flexGrow: 1,
 paddingVertical: 20
 },
 content: {
 paddingHorizontal: SCREEN_WIDTH < 768 ? 20 : 40,
 paddingVertical: 20,
 maxWidth: Platform.OS === 'web' ? 500 : '100%',
 width: '100%',
 alignSelf: 'center'
 },
 title: {
 fontSize: Platform.select({
 ios: 32,
 android: 30,
 web: 36
 }),
 fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
 textAlign: 'center',
 marginBottom: 8,
 color: '#333',
 ...Platform.select({
 web: {
 fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
 }
 })
 },
 subtitle: {
 fontSize: Platform.select({
 ios: 16,
 android: 15,
 web: 17
 }),
 textAlign: 'center',
 marginBottom: 32,
 color: '#666',
 ...Platform.select({
 web: {
 fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
 }
 })
 },
 form: {
 marginBottom: 32,
 width: '100%'
 },
 input: {
 borderWidth: 1,
 borderColor: '#ddd',
 borderRadius: Platform.OS === 'ios' ? 10 : 8,
 paddingHorizontal: 16,
 paddingVertical: Platform.OS === 'ios' ? 14 : 12,
 fontSize: Platform.select({
 ios: 16,
 android: 15,
 web: 16
 }),
 marginBottom: 16,
 backgroundColor: '#fff',
 ...SHADOWS.small,
 ...Platform.select({
 web: {
 boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
 transition: 'border-color 0.2s ease',
 fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
 }
 })
 },
 passwordContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 borderWidth: 1,
 borderColor: '#ddd',
 borderRadius: Platform.OS === 'ios' ? 10 : 8,
 backgroundColor: '#fff',
 marginBottom: 16,
 paddingRight: 8,
 ...SHADOWS.small,
 ...Platform.select({
 web: {
 boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
 }
 })
 },
 passwordInput: {
 flex: 1,
 paddingHorizontal: 16,
 paddingVertical: Platform.OS === 'ios' ? 14 : 12,
 fontSize: Platform.select({
 ios: 16,
 android: 15,
 web: 16
 }),
 ...Platform.select({
 web: {
 fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
 }
 })
 },
 eyeButton: {
 paddingHorizontal: 12,
 paddingVertical: 8,
 ...Platform.select({
 web: {
 cursor: 'pointer'
 }
 })
 },
 eyeText: {
 fontSize: Platform.select({
 ios: 14,
 android: 13,
 web: 14
 }),
 color: '#007AFF',
 fontWeight: '600'
 },
 passwordMismatchText: {
 color: '#ff4444',
 fontSize: Platform.select({
 ios: 14,
 android: 13,
 web: 14
 }),
 marginTop: -8,
 marginBottom: 16,
 fontStyle: 'italic'
 },
 pickerContainer: {
 marginBottom: 16
 },
 label: {
 fontSize: Platform.select({
 ios: 16,
 android: 15,
 web: 16
 }),
 fontWeight: '600',
 marginBottom: 8,
 color: '#333'
 },
 picker: {
 borderWidth: 1,
 borderColor: '#ddd',
 borderRadius: Platform.OS === 'ios' ? 10 : 8,
 backgroundColor: '#fff',
 ...SHADOWS.small,
 ...Platform.select({
 web: {
 boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
 }
 })
 },
 skillsSection: {
 marginBottom: 16
 },
 helperText: {
 fontSize: 12,
 color: '#666',
 marginBottom: 12,
 },
 servicesGrid: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 marginTop: 8,
 },
 serviceCard: {
 width: '48%',
 backgroundColor: '#fff',
 borderWidth: 2,
 borderColor: '#e0e0e0',
 borderRadius: 12,
 padding: 12,
 marginRight: '2%',
 marginBottom: 12,
 alignItems: 'center',
 minHeight: 80,
 justifyContent: 'center',
 },
 serviceCardSelected: {
 backgroundColor: '#0d6efd',
 borderColor: '#0d6efd',
 },
 serviceName: {
 fontSize: 13,
 color: '#333',
 marginTop: 8,
 textAlign: 'center',
 fontWeight: '500',
 },
 serviceNameSelected: {
 color: '#fff',
 fontWeight: '600',
 },
 checkmark: {
 position: 'absolute',
 top: 8,
 right: 8,
 },
 selectedCount: {
 fontSize: 14,
 color: '#0d6efd',
 fontWeight: '600',
 marginTop: 8,
 textAlign: 'center',
 },
 skillInputContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 8
 },
 skillInput: {
 flex: 1,
 marginRight: 8,
 marginBottom: 0
 },
 addButton: {
 backgroundColor: '#007AFF',
 paddingHorizontal: 16,
 paddingVertical: Platform.OS === 'ios' ? 14 : 12,
 borderRadius: Platform.OS === 'ios' ? 10 : 8,
 ...SHADOWS.button,
 ...Platform.select({
 web: {
 boxShadow: '0 2px 8px rgba(0,122,255,0.2)',
 cursor: 'pointer',
 transition: 'all 0.2s ease'
 }
 })
 },
 addButtonText: {
 color: '#fff',
 fontWeight: '600',
 fontSize: Platform.select({
 ios: 15,
 android: 14,
 web: 15
 })
 },
 skillsList: {
 flexDirection: 'row',
 flexWrap: 'wrap'
 },
 skillTag: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#e3f2fd',
 paddingHorizontal: 12,
 paddingVertical: 6,
 borderRadius: 16,
 margin: 4
 },
 skillText: {
 color: '#1976d2',
 marginRight: 8,
 fontSize: Platform.select({
 ios: 14,
 android: 13,
 web: 14
 })
 },
 removeSkill: {
 color: '#1976d2',
 fontSize: 20,
 fontWeight: 'bold',
 lineHeight: 20,
 ...Platform.select({
 web: {
 cursor: 'pointer'
 }
 })
 },
 registerButton: {
 backgroundColor: '#007AFF',
 borderRadius: Platform.OS === 'ios' ? 10 : 8,
 paddingVertical: Platform.OS === 'ios' ? 16 : 14,
 alignItems: 'center',
 ...SHADOWS.button,
 ...Platform.select({
 web: {
 boxShadow: '0 2px 8px rgba(0,122,255,0.2)',
 cursor: 'pointer',
 transition: 'all 0.2s ease'
 }
 })
 },
 disabledButton: {
 backgroundColor: '#ccc',
 ...Platform.select({
 ios: {
 shadowOpacity: 0
 },
 android: {
 elevation: 0
 },
 web: {
 boxShadow: 'none',
 cursor: 'not-allowed'
 }
 })
 },
 registerButtonText: {
 color: '#fff',
 fontSize: Platform.select({
 ios: 16,
 android: 15,
 web: 16
 }),
 fontWeight: '600'
 },
 footer: {
 flexDirection: 'row',
 justifyContent: 'center',
 alignItems: 'center',
 flexWrap: 'wrap',
 paddingBottom: 20
 },
 footerText: {
 fontSize: Platform.select({
 ios: 16,
 android: 15,
 web: 16
 }),
 color: '#666'
 },
 signInText: {
 fontSize: Platform.select({
 ios: 16,
 android: 15,
 web: 16
 }),
 color: '#007AFF',
 fontWeight: '600',
 ...Platform.select({
 web: {
 cursor: 'pointer',
 transition: 'opacity 0.2s ease'
 }
 })
 }
});
