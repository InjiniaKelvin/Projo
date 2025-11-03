import { router } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function Messages() {
  useEffect(() => {
    // Redirect to chat
    router.replace('/chat');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0d6efd" />
      <Text style={styles.text}>Loading messages...</Text>
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
