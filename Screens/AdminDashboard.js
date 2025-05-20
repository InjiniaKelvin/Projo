import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AdminDashboard({ navigation }) {
  const [pendingTechnicians, setPendingTechnicians] = useState(0);

  useEffect(() => {
    // TODO: fetch count of technicians awaiting vetting
    // setPendingTechnicians(response.count);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      {/* Button: Approve Technicians */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TechnicianApproval')}
      >
        <Text style={styles.buttonText}>
          Vet Technicians ({pendingTechnicians})
        </Text>
      </TouchableOpacity>

      {/* Button: Manage Payments */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PaymentManagement')}
      >
        <Text style={styles.buttonText}>Payment Management</Text>
      </TouchableOpacity>

      {/* Button: Spare Parts Inventory */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PartsInventory')}
      >
        <Text style={styles.buttonText}>Spare Parts Inventory</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f5f7fa', justifyContent:'center' },
  header:    { fontSize:24, fontWeight:'bold', marginBottom:30, textAlign:'center' },
  button:    { backgroundColor:'#0d6efd', padding:15, borderRadius:8, marginBottom:15 },
  buttonText:{ color:'#fff', textAlign:'center', fontWeight:'600' }
});
