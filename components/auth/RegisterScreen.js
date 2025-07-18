/**
 * Registration Screen Component
 * Handles user registration with role selection and backend integration
 */

import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
import { useAuth } from '../../contexts/SimpleAuthContext';
import WebCompatibleButton from '../WebCompatibleButton';

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
      const { firstName, lastName, email, phoneNumber, password, role } = formData;
      console.log('RegisterScreen: calling register with:', email, firstName, lastName);
      
      const result = await register(email, password, firstName, lastName, phoneNumber, role);
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join QuickFix today</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number (e.g., +254712345678)"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              keyboardType="phone-pad"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '🙈'}</Text>
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
                <Text style={styles.label}>Skills & Services:</Text>
                
                <View style={styles.skillInputContainer}>
                  <TextInput
                    style={[styles.input, styles.skillInput]}
                    placeholder="Add a skill (e.g., Plumbing, Electrical)"
                    value={skillInput}
                    onChangeText={setSkillInput}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={addSkill}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.skillsList}>
                  {formData.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                      <TouchableOpacity onPress={() => removeSkill(skill)}>
                        <Text style={styles.removeSkill}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
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
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666'
  },
  form: {
    marginBottom: 32
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingRight: 8
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16
  },
  eyeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  eyeText: {
    fontSize: 18
  },
  passwordMismatchText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 16,
    fontStyle: 'italic'
  },
  pickerContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  skillsSection: {
    marginBottom: 16
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
    paddingVertical: 12,
    borderRadius: 8
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600'
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
    marginRight: 8
  },
  removeSkill: {
    color: '#1976d2',
    fontSize: 18,
    fontWeight: 'bold'
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 16,
    color: '#666'
  },
  signInText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600'
  }
});
