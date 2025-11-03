import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Tracking Redirect
 * Redirects to booking tracking with the current booking
 */
export default function TrackingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to booking tracking
    router.replace('/booking/tracking');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0d6efd" />
      <Text style={styles.text}>Loading tracking...</Text>
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
