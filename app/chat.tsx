import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ChatScreen from './components/ChatScreen';

/**
 * Chat Screen
 * Full-screen chat interface for booking communication
 */
export default function Chat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId as string;

  if (!bookingId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No booking ID provided</Text>
        <Text style={styles.infoText}>Please navigate from a booking screen</Text>
      </View>
    );
  }

  return <ChatScreen bookingId={bookingId} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
