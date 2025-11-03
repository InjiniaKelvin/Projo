import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Bookings List Redirect
 * Redirects to client dashboard bookings section
 */
export default function BookingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to client dashboard (which should show bookings)
    router.replace('/dashboard/client');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0d6efd" />
      <Text style={styles.text}>Loading bookings...</Text>
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
