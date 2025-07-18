/**
 * Demo Instructions Component
 * Shows demo credentials when backend is offline
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DemoInstructions = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Demo Mode</Text>
      <Text style={styles.subtitle}>Backend server is offline. Try these demo credentials:</Text>
      
      <View style={styles.credentialsContainer}>
        <View style={styles.credentialRow}>
          <Text style={styles.roleLabel}>👑 Admin:</Text>
          <Text style={styles.credentialText}>admin@quickfix.com / admin123</Text>
        </View>
        
        <View style={styles.credentialRow}>
          <Text style={styles.roleLabel}>👤 Client:</Text>
          <Text style={styles.credentialText}>client@quickfix.com / client123</Text>
        </View>
        
        <View style={styles.credentialRow}>
          <Text style={styles.roleLabel}>🔧 Technician:</Text>
          <Text style={styles.credentialText}>tech@quickfix.com / tech123</Text>
        </View>
      </View>
      
      <Text style={styles.note}>
        💡 All features work offline with mock data!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#90caf9'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1565c0',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 16
  },
  credentialsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap'
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    minWidth: 80,
    marginRight: 8
  },
  credentialText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#424242',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic'
  }
});

export default DemoInstructions;
