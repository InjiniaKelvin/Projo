import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

export default function AdminDashboard() {
  const [pendingTechnicians, setPendingTechnicians] = useState(0);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    // TODO: fetch count of technicians awaiting vetting
    // setPendingTechnicians(response.count);
  }, []);

  const handleLogout = async () => {
    try {
      console.log('Admin Dashboard: Starting logout process...');
      
      // Clear localStorage immediately for web
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('Admin Dashboard: Clearing localStorage...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
      
      // Call the logout function
      await logout();
      console.log('Admin Dashboard: Logout function completed');
      
      // Force navigation to auth screen
      console.log('Admin Dashboard: Navigating to /auth...');
      router.replace('/auth');
      
    } catch (error) {
      console.error('Admin Dashboard: Logout error:', error);
      
      // Force clear storage and navigation even if logout fails
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
      
      router.replace('/auth');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.welcomeText}>Welcome, Admin</Text>
        <Text style={styles.emailText}>{user?.email || 'admin@quickfix.com'}</Text>
        <Text style={styles.header}>Admin Dashboard</Text>
      </View>

      {/* Dashboard Cards */}
      <View style={styles.cardsContainer}>
        {/* Button: Approve Technicians */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push('/admin/technicians');
          }}
        >
          <Text style={styles.buttonText}>
            Vet Technicians ({pendingTechnicians})
          </Text>
        </TouchableOpacity>

        {/* Button: Manage Payments */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push('/admin/payments');
          }}
        >
          <Text style={styles.buttonText}>Payment Management</Text>
        </TouchableOpacity>

        {/* Button: Spare Parts Inventory */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push('/admin/inventory');
          }}
        >
          <Text style={styles.buttonText}>Spare Parts Inventory</Text>
        </TouchableOpacity>

        {/* Button: User Management */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push('/admin/users');
          }}
        >
          <Text style={styles.buttonText}>User Management</Text>
        </TouchableOpacity>

        {/* Button: System Settings */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push('/admin/settings');
          }}
        >
          <Text style={styles.buttonText}>System Settings</Text>
        </TouchableOpacity>

        {/* Button: Analytics & Reports */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push('/admin/analytics');
          }}
        >
          <Text style={styles.buttonText}>Analytics & Reports</Text>
        </TouchableOpacity>

        {/* Button: Logout */}
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Logout', 
                  style: 'destructive',
                  onPress: handleLogout
                }
              ]
            );
          }}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f7fa'
  },
  headerSection: {
    backgroundColor: '#0d6efd',
    padding: 20,
    paddingTop: 50,
    marginBottom: 20
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9
  },
  emailText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 10
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff',
    textAlign: 'center'
  },
  cardsContainer: {
    padding: 20
  },
  button: { 
    backgroundColor: '#0d6efd', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 20
  },
  buttonText: { 
    color: '#fff', 
    textAlign: 'center', 
    fontWeight: '600',
    fontSize: 16
  }
});
