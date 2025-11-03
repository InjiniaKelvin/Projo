import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/SimpleAuthContext';
import { API_ENDPOINTS, API_CONFIG } from '../../../config/api';

export default function BrowseJobs() {
 const router = useRouter();
 const { user, token } = useAuth();
 const [jobs, setJobs] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isRefreshing, setIsRefreshing] = useState(false);
 const [error, setError] = useState(null);

 // Fetch available jobs from backend
 const fetchAvailableJobs = async (isRefresh = false) => {
 try {
 if (isRefresh) {
 setIsRefreshing(true);
 } else {
 setIsLoading(true);
 }
 setError(null);

 const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.TECHNICIAN.AVAILABLE_JOBS}`, {
 method: 'GET',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 }
 });

 const data = await response.json();

 if (response.ok) {
 setJobs(data.jobs || []);
 } else {
 throw new Error(data.message || 'Failed to fetch jobs');
 }
 } catch (err) {
 console.error('Error fetching jobs:', err);
 setError(err.message);
 Alert.alert('Error', err.message || 'Failed to load available jobs');
 } finally {
 setIsLoading(false);
 setIsRefreshing(false);
 }
 };

 // Fetch jobs when screen comes into focus
 useFocusEffect(
 useCallback(() => {
 fetchAvailableJobs();
 }, [])
 );

 const onRefresh = () => {
 fetchAvailableJobs(true);
 };

 const getUrgencyColor = (urgency) => {
 switch (urgency?.toLowerCase()) {
 case 'emergency':
 case 'high': return '#dc3545';
 case 'medium': return '#ffc107';
 case 'normal':
 case 'low': return '#28a745';
 default: return '#6c757d';
 }
 };

 const handleAcceptJob = async (job) => {
 Alert.alert(
 'Accept Job',
 `Accept this ${job.serviceType || 'service'} job for KES ${job.estimatedCost}?`,
 [
 { text: 'Cancel', style: 'cancel' },
 { 
 text: 'Accept Job', 
 onPress: async () => {
 try {
 const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.TECHNICIAN.ACCEPT_JOB(job._id)}`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 }
 });

 const data = await response.json();

 if (response.ok) {
 Alert.alert('Success!', `You've accepted the ${job.serviceType || 'service'} job. The client will be notified.`);
 // Remove job from available list
 setJobs(prevJobs => prevJobs.filter(j => j._id !== job._id));
 // Navigate to my jobs
 router.push('/technician/jobs/my-jobs');
 } else {
 throw new Error(data.message || 'Failed to accept job');
 }
 } catch (err) {
 console.error('Error accepting job:', err);
 Alert.alert('Error', err.message || 'Failed to accept job. Please try again.');
 }
 }
 }
 ]
 );
 };

 const handleViewDetails = (job) => {
 // Navigate to job details page
 router.push(`/technician/jobs/${job._id}`);
 };

 const renderJob = ({ item }) => (
 <View style={styles.jobCard}>
 <View style={styles.jobHeader}>
 <View style={styles.jobTitleContainer}>
 <Text style={styles.jobTitle}>{item.serviceType || 'Service'}</Text>
 <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
 <Text style={styles.urgencyText}>{item.urgency || 'normal'}</Text>
 </View>
 </View>
 <Text style={styles.jobPrice}>KES {item.estimatedCost || 0}</Text>
 </View>
 
 <Text style={styles.jobDescription} numberOfLines={2}>{item.description || 'No description'}</Text>
 
 <View style={styles.jobMeta}>
 <View style={styles.locationContainer}>
 <Ionicons name="location-outline" size={14} color="#666" />
 <Text style={styles.locationText}>{item.location?.address || item.location?.estate || 'Location not specified'}</Text>
 {item.distance && <Text style={styles.distanceText}>* {item.distance}</Text>}
 </View>
 <View style={styles.clientInfo}>
 <Text style={styles.clientName}>{item.clientName || item.userId?.name || 'Client'}</Text>
 {item.clientRating && (
 <View style={styles.ratingContainer}>
 <Ionicons name="star" size={12} color="#ffc107" />
 <Text style={styles.ratingText}>{item.clientRating}</Text>
 </View>
 )}
 </View>
 </View>

 <View style={styles.jobActions}>
 <TouchableOpacity 
 style={styles.viewDetailsButton}
 onPress={() => handleViewDetails(item)}
 >
 <Text style={styles.viewDetailsText}>View Details</Text>
 </TouchableOpacity>
 <TouchableOpacity 
 style={styles.acceptButton}
 onPress={() => handleAcceptJob(item)}
 >
 <Text style={styles.acceptButtonText}>Accept Job</Text>
 </TouchableOpacity>
 </View>
 </View>
 );

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
 <Ionicons name="arrow-back" size={24} color="#333" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Available Jobs</Text>
 <TouchableOpacity style={styles.filterButton}>
 <Ionicons name="filter" size={24} color="#0d6efd" />
 </TouchableOpacity>
 </View>

 {/* Jobs List */}
 {isLoading ? (
 <View style={styles.loadingContainer}>
 <ActivityIndicator size="large" color="#0d6efd" />
 <Text style={styles.loadingText}>Finding jobs near you...</Text>
 </View>
 ) : error ? (
 <View style={styles.errorContainer}>
 <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
 <Text style={styles.errorText}>Failed to load jobs</Text>
 <Text style={styles.errorSubtext}>{error}</Text>
 <TouchableOpacity 
 style={styles.retryButton}
 onPress={() => fetchAvailableJobs()}
 >
 <Text style={styles.retryButtonText}>Retry</Text>
 </TouchableOpacity>
 </View>
 ) : (
 <FlatList
 data={jobs}
 keyExtractor={(item) => item._id}
 renderItem={renderJob}
 contentContainerStyle={styles.jobsList}
 showsVerticalScrollIndicator={false}
 refreshControl={
 <RefreshControl
 refreshing={isRefreshing}
 onRefresh={onRefresh}
 colors={['#0d6efd']}
 />
 }
 ListEmptyComponent={
 <View style={styles.emptyContainer}>
 <Ionicons name="briefcase-outline" size={64} color="#ccc" />
 <Text style={styles.emptyText}>No jobs available</Text>
 <Text style={styles.emptySubtext}>Check back later for new opportunities</Text>
 </View>
 }
 />
 )}
 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f7fa'
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 padding: 20,
 paddingTop: 60,
 backgroundColor: '#fff',
 borderBottomWidth: 1,
 borderBottomColor: '#eee'
 },
 backButton: {
 padding: 8
 },
 headerTitle: {
 fontSize: 20,
 fontWeight: 'bold',
 color: '#333',
 flex: 1,
 textAlign: 'center'
 },
 filterButton: {
 padding: 8
 },
 loadingContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center'
 },
 loadingText: {
 marginTop: 16,
 fontSize: 16,
 color: '#666'
 },
 jobsList: {
 padding: 20
 },
 jobCard: {
 backgroundColor: '#fff',
 borderRadius: 12,
 padding: 16,
 marginBottom: 16,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4
 },
 jobHeader: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'flex-start',
 marginBottom: 8
 },
 jobTitleContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 flex: 1
 },
 jobTitle: {
 fontSize: 18,
 fontWeight: '600',
 color: '#333',
 marginRight: 8
 },
 urgencyBadge: {
 paddingHorizontal: 6,
 paddingVertical: 2,
 borderRadius: 8,
 minWidth: 40,
 alignItems: 'center'
 },
 urgencyText: {
 fontSize: 10,
 fontWeight: '600',
 color: '#fff',
 textTransform: 'uppercase'
 },
 jobPrice: {
 fontSize: 18,
 fontWeight: 'bold',
 color: '#28a745'
 },
 jobDescription: {
 fontSize: 14,
 color: '#666',
 marginBottom: 12,
 lineHeight: 20
 },
 jobMeta: {
 marginBottom: 16
 },
 locationContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 4
 },
 locationText: {
 fontSize: 12,
 color: '#666',
 marginLeft: 4
 },
 distanceText: {
 fontSize: 12,
 color: '#999',
 marginLeft: 4
 },
 clientInfo: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between'
 },
 clientName: {
 fontSize: 12,
 color: '#666'
 },
 ratingContainer: {
 flexDirection: 'row',
 alignItems: 'center'
 },
 ratingText: {
 fontSize: 12,
 color: '#666',
 marginLeft: 2
 },
 jobActions: {
 flexDirection: 'row',
 gap: 12
 },
 viewDetailsButton: {
 flex: 1,
 padding: 12,
 borderRadius: 8,
 borderWidth: 1,
 borderColor: '#0d6efd',
 alignItems: 'center'
 },
 viewDetailsText: {
 fontSize: 14,
 fontWeight: '500',
 color: '#0d6efd'
 },
 acceptButton: {
 flex: 1,
 padding: 12,
 borderRadius: 8,
 backgroundColor: '#28a745',
 alignItems: 'center'
 },
 acceptButtonText: {
 fontSize: 14,
 fontWeight: '600',
 color: '#fff'
 },
 emptyContainer: {
 alignItems: 'center',
 paddingVertical: 60
 },
 emptyText: {
 fontSize: 18,
 fontWeight: '600',
 color: '#666',
 marginTop: 16
 },
 emptySubtext: {
 fontSize: 14,
 color: '#999',
 marginTop: 8,
 textAlign: 'center'
 },
 errorContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 padding: 20
 },
 errorText: {
 fontSize: 18,
 fontWeight: '600',
 color: '#dc3545',
 marginTop: 16
 },
 errorSubtext: {
 fontSize: 14,
 color: '#999',
 marginTop: 8,
 textAlign: 'center'
 },
 retryButton: {
 marginTop: 20,
 paddingHorizontal: 24,
 paddingVertical: 12,
 backgroundColor: '#0d6efd',
 borderRadius: 8
 },
 retryButtonText: {
 fontSize: 14,
 fontWeight: '600',
 color: '#fff'
 }
});
