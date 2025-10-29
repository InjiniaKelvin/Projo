import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
 ActivityIndicator,
 Alert,
 RefreshControl,
 ScrollView,
 StyleSheet,
 Text,
 TouchableOpacity,
 View
} from 'react-native';

interface Technician {
 id: string;
 name: string;
 email: string;
 phone: string;
 specialization: string;
 experience: string;
 status: 'pending' | 'approved' | 'rejected';
 submissionDate: string;
 documents: string[];
}

export default function TechniciansScreen() {
 const router = useRouter();
 const [technicians, setTechnicians] = useState<Technician[]>([]);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);

 // Mock data for demonstration
 const mockTechnicians: Technician[] = [
 {
 id: '1',
 name: 'John Doe',
 email: 'john.doe@email.com',
 phone: '+1234567890',
 specialization: 'HVAC Systems',
 experience: '5 years',
 status: 'pending',
 submissionDate: '2025-07-15',
 documents: ['Certificate.pdf', 'ID.pdf']
 },
 {
 id: '2',
 name: 'Jane Smith',
 email: 'jane.smith@email.com',
 phone: '+1234567891',
 specialization: 'Electrical',
 experience: '3 years',
 status: 'pending',
 submissionDate: '2025-07-14',
 documents: ['License.pdf', 'Resume.pdf']
 },
 {
 id: '3',
 name: 'Mike Johnson',
 email: 'mike.johnson@email.com',
 phone: '+1234567892',
 specialization: 'Plumbing',
 experience: '7 years',
 status: 'approved',
 submissionDate: '2025-07-13',
 documents: ['Certificate.pdf', 'ID.pdf', 'References.pdf']
 }
 ];

 useEffect(() => {
 loadTechnicians();
 }, []);

 const loadTechnicians = async () => {
 try {
 setLoading(true);
 // TODO: Replace with actual API call
 // const response = await fetch('/api/admin/technicians');
 // const data = await response.json();
 
 // Simulate API delay
 setTimeout(() => {
 setTechnicians(mockTechnicians);
 setLoading(false);
 }, 1000);
 } catch (error) {
 console.error('Error loading technicians:', error);
 Alert.alert('Error', 'Failed to load technicians');
 setLoading(false);
 }
 };

 const onRefresh = async () => {
 setRefreshing(true);
 await loadTechnicians();
 setRefreshing(false);
 };

 const handleApprove = (technician: Technician) => {
 Alert.alert(
 'Approve Technician',
 `Are you sure you want to approve ${technician.name}?`,
 [
 { text: 'Cancel', style: 'cancel' },
 {
 text: 'Approve',
 style: 'default',
 onPress: () => {
 // TODO: API call to approve technician
 setTechnicians(prev =>
 prev.map(t =>
 t.id === technician.id ? { ...t, status: 'approved' } : t
 )
 );
 Alert.alert('Success', `${technician.name} has been approved!`);
 }
 }
 ]
 );
 };

 const handleReject = (technician: Technician) => {
 Alert.alert(
 'Reject Technician',
 `Are you sure you want to reject ${technician.name}?`,
 [
 { text: 'Cancel', style: 'cancel' },
 {
 text: 'Reject',
 style: 'destructive',
 onPress: () => {
 // TODO: API call to reject technician
 setTechnicians(prev =>
 prev.map(t =>
 t.id === technician.id ? { ...t, status: 'rejected' } : t
 )
 );
 Alert.alert('Success', `${technician.name} has been rejected.`);
 }
 }
 ]
 );
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'approved': return '#28a745';
 case 'rejected': return '#dc3545';
 case 'pending': return '#ffc107';
 default: return '#6c757d';
 }
 };

 const pendingCount = technicians.filter(t => t.status === 'pending').length;

 if (loading) {
 return (
 <View style={styles.loadingContainer}>
 <ActivityIndicator size="large" color="#0d6efd" />
 <Text style={styles.loadingText}>Loading technicians...</Text>
 </View>
 );
 }

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity 
 style={styles.backButton}
 onPress={() => router.push('/dashboard/admin')}
 >
 <Text style={styles.backButtonText}>← Back to Dashboard</Text>
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Vet Technicians</Text>
 <View style={styles.statsContainer}>
 <Text style={styles.statsText}>Pending: {pendingCount}</Text>
 </View>
 </View>

 <ScrollView
 style={styles.content}
 refreshControl={
 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
 }
 >
 {technicians.map((technician) => (
 <View key={technician.id} style={styles.technicianCard}>
 <View style={styles.cardHeader}>
 <Text style={styles.technicianName}>{technician.name}</Text>
 <View style={[styles.statusBadge, { backgroundColor: getStatusColor(technician.status) }]}>
 <Text style={styles.statusText}>{technician.status.toUpperCase()}</Text>
 </View>
 </View>

 <View style={styles.technicianInfo}>
 <Text style={styles.infoLabel}>Email:</Text>
 <Text style={styles.infoValue}>{technician.email}</Text>
 </View>

 <View style={styles.technicianInfo}>
 <Text style={styles.infoLabel}>Phone:</Text>
 <Text style={styles.infoValue}>{technician.phone}</Text>
 </View>

 <View style={styles.technicianInfo}>
 <Text style={styles.infoLabel}>Specialization:</Text>
 <Text style={styles.infoValue}>{technician.specialization}</Text>
 </View>

 <View style={styles.technicianInfo}>
 <Text style={styles.infoLabel}>Experience:</Text>
 <Text style={styles.infoValue}>{technician.experience}</Text>
 </View>

 <View style={styles.technicianInfo}>
 <Text style={styles.infoLabel}>Submitted:</Text>
 <Text style={styles.infoValue}>{new Date(technician.submissionDate).toLocaleDateString()}</Text>
 </View>

 <View style={styles.documentsSection}>
 <Text style={styles.documentsLabel}>Documents:</Text>
 {technician.documents.map((doc, index) => (
 <TouchableOpacity key={index} style={styles.documentItem}>
 <Text style={styles.documentText}> {doc}</Text>
 </TouchableOpacity>
 ))}
 </View>

 {technician.status === 'pending' && (
 <View style={styles.actionButtons}>
 <TouchableOpacity
 style={[styles.actionButton, styles.approveButton]}
 onPress={() => handleApprove(technician)}
 >
 <Text style={styles.actionButtonText}>Approve</Text>
 </TouchableOpacity>

 <TouchableOpacity
 style={[styles.actionButton, styles.rejectButton]}
 onPress={() => handleReject(technician)}
 >
 <Text style={styles.actionButtonText}>Reject</Text>
 </TouchableOpacity>
 </View>
 )}
 </View>
 ))}

 {technicians.length === 0 && (
 <View style={styles.emptyContainer}>
 <Text style={styles.emptyText}>No technicians found</Text>
 </View>
 )}
 </ScrollView>
 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f7fa',
 },
 loadingContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: '#f5f7fa',
 },
 loadingText: {
 marginTop: 10,
 fontSize: 16,
 color: '#666',
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
 headerTitle: {
 fontSize: 24,
 fontWeight: 'bold',
 color: '#fff',
 textAlign: 'center',
 marginBottom: 10,
 },
 statsContainer: {
 alignItems: 'center',
 },
 statsText: {
 color: '#fff',
 fontSize: 16,
 opacity: 0.9,
 },
 content: {
 flex: 1,
 padding: 20,
 },
 technicianCard: {
 backgroundColor: '#fff',
 borderRadius: 10,
 padding: 20,
 marginBottom: 15,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 },
 cardHeader: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 marginBottom: 15,
 },
 technicianName: {
 fontSize: 18,
 fontWeight: 'bold',
 color: '#333',
 flex: 1,
 },
 statusBadge: {
 paddingHorizontal: 12,
 paddingVertical: 6,
 borderRadius: 20,
 },
 statusText: {
 color: '#fff',
 fontSize: 12,
 fontWeight: 'bold',
 },
 technicianInfo: {
 flexDirection: 'row',
 marginBottom: 8,
 },
 infoLabel: {
 fontSize: 14,
 fontWeight: '600',
 color: '#666',
 width: 100,
 },
 infoValue: {
 fontSize: 14,
 color: '#333',
 flex: 1,
 },
 documentsSection: {
 marginTop: 15,
 marginBottom: 15,
 },
 documentsLabel: {
 fontSize: 14,
 fontWeight: '600',
 color: '#666',
 marginBottom: 8,
 },
 documentItem: {
 backgroundColor: '#f8f9fa',
 padding: 8,
 borderRadius: 5,
 marginBottom: 5,
 },
 documentText: {
 fontSize: 14,
 color: '#0d6efd',
 },
 actionButtons: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginTop: 15,
 },
 actionButton: {
 flex: 1,
 padding: 12,
 borderRadius: 8,
 marginHorizontal: 5,
 },
 approveButton: {
 backgroundColor: '#28a745',
 },
 rejectButton: {
 backgroundColor: '#dc3545',
 },
 actionButtonText: {
 color: '#fff',
 textAlign: 'center',
 fontWeight: '600',
 fontSize: 16,
 },
 emptyContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 paddingTop: 50,
 },
 emptyText: {
 fontSize: 16,
 color: '#666',
 },
});
