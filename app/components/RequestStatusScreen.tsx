/**
 * Request Status Screen
 * Shows the status of service requests without maps
 */

import React from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface RequestStatusProps {
  requestId?: string;
}

export default function RequestStatusScreen({ requestId }: RequestStatusProps) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Request Status</Text>
      <Text style={styles.info}>Request ID: {requestId || 'N/A'}</Text>
      <Text style={styles.info}>User: {user?.firstName || 'Unknown'}</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}> Status: Processing</Text>
        <Text style={styles.locationText}> Location tracking available</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f7fa'
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center'
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    color: '#424242'
  },
  statusContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#90caf9'
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976d2'
  },
  locationText: {
    fontSize: 14,
    color: '#424242'
  }
});
