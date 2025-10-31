import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Dashboard Redirect Screen
 * Redirects to appropriate role-based dashboard
 */
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to client dashboard by default
    // In a real app, get user role from auth context
    router.replace('/dashboard/client');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0d6efd" />
      <Text style={styles.text}>Loading dashboard...</Text>
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
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
