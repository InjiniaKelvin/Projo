/**
 * Login Screen Component
 * Handles user authentication with backend integration
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';
import WebCompatibleButton from '../WebCompatibleButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  let router;
  try {
    router = useRouter();
  } catch (error) {
    console.error('LoginScreen: useRouter failed:', error);
    router = { push: () => console.log('Router not available') };
  }
  
  // Test if useAuth is working
  let authState;
  try {
    authState = useAuth();
    console.log('LoginScreen: useAuth successful:', authState);
  } catch (error) {
    console.error('LoginScreen: useAuth failed:', error);
    authState = { login: null, error: null, clearError: () => {} };
  }
  
  const { login, error, clearError } = authState;

  const handleLogin = async () => {
    console.log('LoginScreen: handleLogin called');
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    console.log('LoginScreen: validation passed, starting login...');
    setIsLoading(true);
    clearError && clearError();

    try {
      console.log('LoginScreen: calling login with:', email);
      if (login) {
        const result = await login(email.trim(), password);
        console.log('LoginScreen: login result:', result);
        if (result && result.success) {
          console.log('Login successful - navigating to dashboard...');
          // Navigate directly since we're on the login screen
          const user = result.user;
          if (user && user.role) {
            const dashboardRoute = user.role === 'admin' ? '/dashboard/admin' :
                                 user.role === 'technician' ? '/dashboard/technician' :
                                 '/dashboard/client';
            console.log('LoginScreen: Navigating to:', dashboardRoute);
            // Use replace to prevent back navigation to login
            router.replace(dashboardRoute);
          } else {
            console.log('LoginScreen: No user role, defaulting to client dashboard');
            router.replace('/dashboard/client');
          }
        } else {
          Alert.alert('Login Failed', result?.message || 'Login failed');
        }
      } else {
        Alert.alert('Error', 'Authentication service not available');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    Alert.alert('Info', 'Forgot password feature coming soon');
  };

  const handleSignUp = () => {
    try {
      router.push('/auth/register');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: try to navigate with window location for web
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/register';
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to QuickFix</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <WebCompatibleButton
            title={isLoading ? "Signing In..." : "Sign In"}
            onPress={() => {
              console.log('Login button pressed!');
              handleLogin();
            }}
            disabled={isLoading}
            style={{
              ...styles.loginButton,
              ...(isLoading && styles.disabledButton)
            }}
          />

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24
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
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16
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
  signUpText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600'
  }
});
