import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ClientDashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Client Dashboard</Text>

      {/* Card: Find a Technician */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RequestService')}

      >
        <Ionicons name="wrench" size={28} color="#0d6efd" />
        <Text style={styles.cardText}>Find a Technician</Text>
      </TouchableOpacity>

      {/* Card: My Escrow Wallet */}
      <TouchableOpacity style={styles.card}>
        <Ionicons name="wallet" size={28} color="#0d6efd" />
        <Text style={styles.cardText}>My Escrow Wallet</Text>
      </TouchableOpacity>

      {/* Card: Messages */}
      <TouchableOpacity style={styles.card}>
        <Ionicons name="chatbubbles" size={28} color="#0d6efd" />
        <Text style={styles.cardText}>Messages</Text>
      </TouchableOpacity>

      {/* Placeholder for future loyalty/gamification widget */}
      <View style={styles.loyaltyBanner}>
        <Text style={styles.loyaltyText}>⭐ You're 3 jobs away from Gold status!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, padding: 20, backgroundColor: '#f5f7fa' },
  header:       { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#212529' },
  card:         { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 15,
                  backgroundColor: '#fff', borderRadius: 10, elevation: 3 },
  cardText:     { marginLeft: 15, fontSize: 18, color: '#212529' },
  loyaltyBanner:{ padding: 15, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  loyaltyText:  { textAlign: 'center', color: '#0d6efd' }
});
