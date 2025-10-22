/**
 * Login Screen Component
 * Handles user authentication with backend integration
 */

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
import { useAuth } from '../../contexts/SimpleAuthContext';
import { SHADOWS } from '../../utils/shadows';
import WebCompatibleButton from '../WebCompatibleButton';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to QuickFix</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
              autoComplete="password"
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

            <TouchableOpacity 
              onPress={handleForgotPassword}
              accessible={true}
              accessibilityLabel="Forgot Password"
              accessibilityRole="button"
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={handleSignUp}
              accessible={true}
              accessibilityLabel="Sign Up"
              accessibilityRole="button"
            >
              <Text style={styles.signUpText}>Sign Up</Text>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: SCREEN_HEIGHT,
    paddingVertical: 20
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH < 768 ? 20 : 40,
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
        transition: 'border-color 0.2s ease',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }
    })
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: Platform.OS === 'ios' ? 10 : 8,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    alignItems: 'center',
    marginBottom: 16,
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
        cursor: 'not-allowed'
      }
    }),
    ...Platform.select({
      web: {
        ...(Platform.OS === 'web' && { boxShadow: 'none' })
      }
    })
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#007AFF',
    fontSize: Platform.select({
      ios: 16,
      android: 15,
      web: 16
    }),
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'opacity 0.2s ease'
      }
    })
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  footerText: {
    fontSize: Platform.select({
      ios: 16,
      android: 15,
      web: 16
    }),
    color: '#666'
  },
  signUpText: {
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
        textDecorationLine: 'none',
        textDecorationStyle: 'solid',
        textDecorationColor: 'transparent',
        transition: 'opacity 0.2s ease'
      }
    })
  }
});
