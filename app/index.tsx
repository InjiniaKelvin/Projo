import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

// Type declaration for JSX intrinsic elements on web
declare global {
 namespace JSX {
 interface IntrinsicElements {
 div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
 }
 }
}

export default function Index() {
 const { user, isLoading } = useAuth();
 const router = useRouter();
 const [showSplash, setShowSplash] = useState(true);
 const [hasMounted, setHasMounted] = useState(false);

 useEffect(() => {
  setHasMounted(true);
 }, []);

 console.log('Index: isLoading:', isLoading, 'user:', user, 'showSplash:', showSplash);

 const handleGetStarted = () => {
 console.log(' Index: Get Started button pressed! Setting showSplash to false');
 setShowSplash(false);
 };

 useEffect(() => {
 console.log('Index: useEffect triggered, isLoading:', isLoading, 'user:', user, 'showSplash:', showSplash);
 
 // If we have a user and loading is complete, navigate immediately regardless of splash state
 if (!isLoading && user && user.role) {
 console.log('Index: User authenticated with role:', user.role, 'navigating to dashboard immediately');
 
 const timer = setTimeout(() => {
 try {
 const dashboardRoute = user.role === 'admin' ? '/dashboard/admin' :
 user.role === 'technician' ? '/dashboard/technician' :
 '/dashboard/client';
 console.log('Index: Navigating authenticated user to:', dashboardRoute);
 router.replace(dashboardRoute);
 } catch (error) {
 console.error('Index: Navigation error for authenticated user:', error);
 }
 }, 100);
 
 return () => clearTimeout(timer);
 }
 
 // For non-authenticated users, only proceed with navigation if loading is complete and splash is dismissed
 if (!showSplash && !isLoading && !user) {
 console.log('Index: No user, navigating to login');
 
 const timer = setTimeout(() => {
 try {
 router.push('/auth/login');
 } catch (error) {
 console.error('Index: Navigation error to login:', error);
 }
 }, 200);
 
 return () => clearTimeout(timer);
 }
 }, [user, isLoading, router, showSplash]);

 // Auto-proceed after 5 seconds if button doesn't work
 useEffect(() => {
 const timer = setTimeout(() => {
 if (showSplash) {
 console.log(' Index: Auto-proceeding after 5 seconds (button fallback)');
 setShowSplash(false);
 }
 }, 5000);

 return () => clearTimeout(timer);
 }, [showSplash]);

 if (!hasMounted) {
  return (
  <View style={styles.container}>
  <ActivityIndicator size="large" color="#0096FF" />
  <Text style={styles.loadingText}>Initializing...</Text>
  </View>
  );
 }

 // Show splash screen
 if (showSplash) {
 console.log(' Index: Rendering splash screen with button');
 
 // Show different content for authenticated users
 if (user) {
 return (
 <View style={styles.splashContainer}>
 <Text style={styles.title}>QuickFix</Text>
 <Text style={styles.subtitle}>Welcome back, {user.name || user.email}!</Text>
 <ActivityIndicator size="large" color="#0d6efd" style={{ marginVertical: 20 }} />
 <Text style={styles.description}>
 Redirecting to your dashboard...
 </Text>
 </View>
 );
 }
 
 return (
 <View style={styles.splashContainer}>
 <Text style={styles.title}>QuickFix</Text>
 <Text style={styles.subtitle}>Smart Repair Service System</Text>
 <Text style={styles.description}>
 Connect with skilled technicians for fast, reliable repairs
 {'\n\n'}(Auto-proceeding in 5 seconds...)
 </Text>
 
 <Pressable 
 style={[styles.button]} 
 onPress={handleGetStarted}
 accessible={true}
 accessibilityRole="button"
 accessibilityLabel="Get Started"
 >
 <Text style={styles.buttonText}>Get Started</Text>
 </Pressable>
 </View>
 );
 }

 // Show loading while checking auth
 if (isLoading) {
 return (
 <View style={styles.container}>
 <ActivityIndicator size="large" color="#0096FF" />
 <Text style={styles.loadingText}>Loading QuickFix...</Text>
 </View>
 );
 }

 // Show redirecting message
 return (
 <View style={styles.container}>
 <ActivityIndicator size="large" color="#0096FF" />
 <Text style={styles.loadingText}>Redirecting...</Text>
 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: '#fff',
 },
 loadingText: {
 marginTop: 10,
 fontSize: 16,
 color: '#666',
 },
 splashContainer: {
 flex: 1,
 backgroundColor: '#0d6efd',
 justifyContent: 'center',
 alignItems: 'center',
 padding: 20,
 },
 title: {
 fontSize: 48,
 fontWeight: 'bold',
 color: '#fff',
 marginBottom: 10,
 },
 subtitle: {
 fontSize: 18,
 color: '#fff',
 marginBottom: 20,
 textAlign: 'center',
 },
 description: {
 fontSize: 16,
 color: '#fff',
 textAlign: 'center',
 marginBottom: 40,
 opacity: 0.9,
 },
 button: {
 backgroundColor: '#fff',
 paddingHorizontal: 30,
 paddingVertical: 15,
 borderRadius: 25,
 cursor: 'pointer',
 },
 buttonPressed: {
 backgroundColor: '#f0f0f0',
 transform: [{ scale: 0.95 }],
 },
 buttonText: {
 color: '#0d6efd',
 fontSize: 18,
 fontWeight: '600',
 },
});
