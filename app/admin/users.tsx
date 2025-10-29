import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserManagement() {
 const router = useRouter();

 return (
 <ScrollView style={styles.container}>
 <View style={styles.header}>
 <TouchableOpacity 
 style={styles.backButton}
 onPress={() => router.push('/dashboard/admin')}
 >
 <Text style={styles.backButtonText}>← Back to Dashboard</Text>
 </TouchableOpacity>
 <Text style={styles.title}>User Management</Text>
 </View>

 <View style={styles.content}>
 <Text style={styles.sectionTitle}>User Statistics</Text>
 
 <View style={styles.statsContainer}>
 <View style={styles.statCard}>
 <Text style={styles.statNumber}>0</Text>
 <Text style={styles.statLabel}>Total Users</Text>
 </View>
 
 <View style={styles.statCard}>
 <Text style={styles.statNumber}>0</Text>
 <Text style={styles.statLabel}>Active Users</Text>
 </View>
 
 <View style={styles.statCard}>
 <Text style={styles.statNumber}>0</Text>
 <Text style={styles.statLabel}>Technicians</Text>
 </View>
 </View>

 <Text style={styles.sectionTitle}>Quick Actions</Text>
 
 <TouchableOpacity style={styles.actionButton}>
 <Text style={styles.actionButtonText}>View All Users</Text>
 </TouchableOpacity>
 
 <TouchableOpacity style={styles.actionButton}>
 <Text style={styles.actionButtonText}>Pending Verifications</Text>
 </TouchableOpacity>
 
 <TouchableOpacity style={styles.actionButton}>
 <Text style={styles.actionButtonText}>Export User Data</Text>
 </TouchableOpacity>
 </View>
 </ScrollView>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f7fa',
 },
 header: {
 backgroundColor: '#0d6efd',
 padding: 20,
 paddingTop: 50,
 },
 backButton: {
 marginBottom: 10,
 },
 backButtonText: {
 color: '#fff',
 fontSize: 16,
 },
 title: {
 fontSize: 24,
 fontWeight: 'bold',
 color: '#fff',
 textAlign: 'center',
 },
 content: {
 padding: 20,
 },
 sectionTitle: {
 fontSize: 18,
 fontWeight: '600',
 marginBottom: 15,
 color: '#333',
 },
 statsContainer: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: 30,
 },
 statCard: {
 backgroundColor: '#fff',
 padding: 15,
 borderRadius: 8,
 alignItems: 'center',
 flex: 1,
 marginHorizontal: 5,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: {
 width: 0,
 height: 1,
 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 },
 statNumber: {
 fontSize: 24,
 fontWeight: 'bold',
 color: '#0d6efd',
 },
 statLabel: {
 fontSize: 12,
 color: '#666',
 textAlign: 'center',
 },
 actionButton: {
 backgroundColor: '#fff',
 padding: 15,
 borderRadius: 8,
 marginBottom: 10,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: {
 width: 0,
 height: 1,
 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 },
 actionButtonText: {
 textAlign: 'center',
 fontWeight: '600',
 color: '#0d6efd',
 },
});
