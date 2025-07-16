import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlaceholderScreen({ title = "Coming Soon" }) {
  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={80} color="#6c757d" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>This feature is under development</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Stay Tuned</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
