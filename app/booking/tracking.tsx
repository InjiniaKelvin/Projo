/**
 * Booking Tracking Screen
 * 
 * Shows real-time tracking of booking progress:
 * - Service ID display
 * - Stage-by-stage progress
 * - Technician matching status
 * - Estimated completion time
 * - Communication with technician
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useAuth } from '../../contexts/SimpleAuthContext';

interface TrackingStage {
 stage: number;
 title: string;
 description: string;
 icon: string;
 completed: boolean;
 timestamp?: string;
 estimatedTime?: string;
 technician?: {
 firstName: string;
 lastName: string;
 phoneNumber: string;
 rating: number;
 };
}

interface BookingTrackingData {
 serviceId: string;
 bookingId: string;
 currentStage: string;
 status: string;
 clientDetails: {
 name: string;
 phoneNumber: string;
 email: string;
 };
 serviceType: string;
 serviceDescription: string;
 urgency: string;
 location: {
 address: {
 street: string;
 city: string;
 county: string;
 };
 landmarks: string;
 };
 scheduling: {
 preferredDate: string;
 preferredTimeSlot: {
 start: string;
 end: string;
 };
 };
 pricing: {
 quotedAmount: number;
 currency: string;
 paymentStatus: string;
 };
 stages: Record<string, TrackingStage>;
 currentStageInfo: TrackingStage;
 nextStage?: TrackingStage;
 estimatedCompletion: {
 estimatedTime: number;
 estimatedCompletion: string;
 timeRemaining: number;
 };
 technician?: {
 firstName: string;
 lastName: string;
 phoneNumber: string;
 rating: number;
 };
 createdAt: string;
 updatedAt: string;
}

export default function BookingTrackingScreen() {
 const router = useRouter();
 const { user } = useAuth();
 const params = useLocalSearchParams();
 
 const [trackingData, setTrackingData] = useState<BookingTrackingData | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [isRefreshing, setIsRefreshing] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const serviceId = params.serviceId as string;

 const fetchTrackingData = async (showLoader = false) => {
 if (showLoader) setIsLoading(true);
 setError(null);
 
 try {
 const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/bookings/tracking/${serviceId}`;
 const response = await fetch(apiUrl, {
 headers: {
 'Authorization': `Bearer ${user?.token}`
 }
 });

 const result = await response.json();

 if (result.success) {
 setTrackingData(result.data);
 } else {
 throw new Error(result.message || 'Failed to fetch tracking data');
 }
 } catch (error) {
 console.error(' Error fetching tracking data:', error);
 setError('Failed to load tracking information');
 } finally {
 setIsLoading(false);
 setIsRefreshing(false);
 }
 };

 useEffect(() => {
 if (serviceId && user?.token) {
 fetchTrackingData(true);
 
 // Set up polling for real-time updates
 const interval = setInterval(() => {
 fetchTrackingData(false);
 }, 30000); // Poll every 30 seconds
 
 return () => clearInterval(interval);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [serviceId, user?.token]);

 const handleRefresh = () => {
 setIsRefreshing(true);
 fetchTrackingData(false);
 };

 const getStageIcon = (iconName: string) => {
 const iconMap: Record<string, string> = {
 'checkmark-circle': 'checkmark-circle',
 'search': 'search',
 'person': 'person',
 'checkmark-done': 'checkmark-done',
 'construct': 'construct',
 'checkmark-circle-outline': 'checkmark-circle-outline'
 };
 return iconMap[iconName] || 'help-circle';
 };

 const formatTimeRemaining = (milliseconds: number) => {
 if (milliseconds <= 0) return 'Completed';
 
 const hours = Math.floor(milliseconds / (1000 * 60 * 60));
 const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
 
 if (hours > 0) {
 return `${hours}h ${minutes}m remaining`;
 }
 return `${minutes}m remaining`;
 };

 const getUrgencyColor = (urgency: string) => {
 switch (urgency) {
 case 'emergency': return '#ff3b30';
 case 'high': return '#ff9500';
 case 'medium': return '#ffcc00';
 case 'low': return '#34c759';
 default: return '#007AFF';
 }
 };

 if (isLoading && !trackingData) {
 return (
 <View style={styles.loadingContainer}>
 <ActivityIndicator size="large" color="#007AFF" />
 <Text style={styles.loadingText}>Loading tracking information...</Text>
 </View>
 );
 }

 if (error && !trackingData) {
 return (
 <View style={styles.errorContainer}>
 <Ionicons name="alert-circle" size={60} color="#ff3b30" />
 <Text style={styles.errorTitle}>Unable to Load Tracking</Text>
 <Text style={styles.errorMessage}>{error}</Text>
 <TouchableOpacity style={styles.retryButton} onPress={() => fetchTrackingData(true)}>
 <Text style={styles.retryButtonText}>Retry</Text>
 </TouchableOpacity>
 </View>
 );
 }

 if (!trackingData) {
 return (
 <View style={styles.errorContainer}>
 <Ionicons name="document-text" size={60} color="#666" />
 <Text style={styles.errorTitle}>No Tracking Data</Text>
 <Text style={styles.errorMessage}>Unable to find booking information</Text>
 </View>
 );
 }

 return (
 <ScrollView
 style={styles.container}
 refreshControl={
 <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
 }
 >
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity onPress={() => router.back()}>
 <Ionicons name="arrow-back" size={24} color="#007AFF" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Track Booking</Text>
 <TouchableOpacity onPress={handleRefresh}>
 <Ionicons name="refresh" size={24} color="#007AFF" />
 </TouchableOpacity>
 </View>

 {/* Service ID Card */}
 <View style={styles.serviceIdCard}>
 <View style={styles.serviceIdHeader}>
 <Ionicons name="qr-code" size={24} color="#007AFF" />
 <Text style={styles.serviceIdLabel}>Service ID</Text>
 </View>
 <Text style={styles.serviceIdText}>{trackingData.serviceId}</Text>
 <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(trackingData.urgency) }]}>
 <Text style={styles.urgencyText}>{trackingData.urgency.toUpperCase()}</Text>
 </View>
 </View>

 {/* Current Status */}
 <View style={styles.statusCard}>
 <Text style={styles.statusTitle}>Current Status</Text>
 <Text style={styles.statusDescription}>{trackingData.currentStageInfo.description}</Text>
 {trackingData.estimatedCompletion.timeRemaining > 0 && (
 <Text style={styles.timeRemaining}>
 {formatTimeRemaining(trackingData.estimatedCompletion.timeRemaining)}
 </Text>
 )}
 </View>

 {/* Progress Tracking */}
 <View style={styles.progressContainer}>
 <Text style={styles.sectionTitle}>Progress Tracking</Text>
 
 {Object.values(trackingData.stages).map((stage) => (
 <View key={stage.stage} style={styles.stageItem}>
 <View style={styles.stageIndicator}>
 <View style={[
 styles.stageIcon,
 stage.completed ? styles.stageIconCompleted : styles.stageIconPending
 ]}>
 <Ionicons
 name={getStageIcon(stage.icon) as any}
 size={20}
 color={stage.completed ? '#fff' : '#666'}
 />
 </View>
 {stage.stage < 6 && (
 <View style={[
 styles.stageLine,
 stage.completed ? styles.stageLineCompleted : styles.stageLinePending
 ]} />
 )}
 </View>
 
 <View style={styles.stageContent}>
 <Text style={[
 styles.stageTitle,
 stage.completed ? styles.stageTitleCompleted : styles.stageTitlePending
 ]}>
 {stage.title}
 </Text>
 <Text style={styles.stageDescription}>{stage.description}</Text>
 
 {stage.timestamp && (
 <Text style={styles.stageTime}>
 {new Date(stage.timestamp).toLocaleString()}
 </Text>
 )}
 
 {stage.estimatedTime && !stage.completed && (
 <Text style={styles.estimatedTime}>
 Estimated: {stage.estimatedTime}
 </Text>
 )}
 
 {stage.technician && (
 <View style={styles.technicianInfo}>
 <Ionicons name="person-circle" size={20} color="#007AFF" />
 <Text style={styles.technicianName}>
 {stage.technician.firstName} {stage.technician.lastName}
 </Text>
 <Text style={styles.technicianPhone}>{stage.technician.phoneNumber}</Text>
 </View>
 )}
 </View>
 </View>
 ))}
 </View>

 {/* Service Details */}
 <View style={styles.detailsContainer}>
 <Text style={styles.sectionTitle}>Service Details</Text>
 
 <View style={styles.detailItem}>
 <Text style={styles.detailLabel}>Service Type</Text>
 <Text style={styles.detailValue}>{trackingData.serviceType}</Text>
 </View>
 
 <View style={styles.detailItem}>
 <Text style={styles.detailLabel}>Description</Text>
 <Text style={styles.detailValue}>{trackingData.serviceDescription}</Text>
 </View>
 
 <View style={styles.detailItem}>
 <Text style={styles.detailLabel}>Location</Text>
 <Text style={styles.detailValue}>
 {trackingData.location.address.street}, {trackingData.location.address.city}
 </Text>
 {trackingData.location.landmarks && (
 <Text style={styles.detailSubValue}>Near: {trackingData.location.landmarks}</Text>
 )}
 </View>
 
 <View style={styles.detailItem}>
 <Text style={styles.detailLabel}>Scheduled Time</Text>
 <Text style={styles.detailValue}>
 {new Date(trackingData.scheduling.preferredDate).toLocaleDateString()} at {' '}
 {trackingData.scheduling.preferredTimeSlot.start}
 </Text>
 </View>
 
 <View style={styles.detailItem}>
 <Text style={styles.detailLabel}>Contact Phone</Text>
 <Text style={styles.detailValue}>{trackingData.clientDetails.phoneNumber}</Text>
 </View>
 </View>

 {/* Technician Contact (if assigned) */}
 {trackingData.technician && (
 <View style={styles.technicianCard}>
 <Text style={styles.sectionTitle}>Your Technician</Text>
 <View style={styles.technicianDetails}>
 <Ionicons name="person-circle" size={40} color="#007AFF" />
 <View style={styles.technicianText}>
 <Text style={styles.technicianName}>
 {trackingData.technician.firstName} {trackingData.technician.lastName}
 </Text>
 <Text style={styles.technicianPhone}>{trackingData.technician.phoneNumber}</Text>
 <View style={styles.ratingContainer}>
 <Ionicons name="star" size={16} color="#ffcc00" />
 <Text style={styles.ratingText}>{trackingData.technician.rating.toFixed(1)}</Text>
 </View>
 </View>
 </View>
 
 <TouchableOpacity 
 style={styles.callButton}
 onPress={() => {
 // Implement call functionality
 Alert.alert('Call Technician', `Call ${trackingData.technician?.phoneNumber}?`);
 }}
 >
 <Ionicons name="call" size={20} color="#fff" />
 <Text style={styles.callButtonText}>Call Technician</Text>
 </TouchableOpacity>
 </View>
 )}

 {/* Action Buttons */}
 <View style={styles.actionButtons}>
 <TouchableOpacity 
 style={styles.secondaryButton}
 onPress={() => {
 // Navigate to support/help
 router.push('/support');
 }}
 >
 <Ionicons name="help-circle" size={20} color="#007AFF" />
 <Text style={styles.secondaryButtonText}>Get Help</Text>
 </TouchableOpacity>
 
 <TouchableOpacity 
 style={styles.primaryButton}
 onPress={() => {
 // Navigate to booking details or modifications
 router.push({
 pathname: '/booking/details',
 params: { serviceId: trackingData.serviceId }
 });
 }}
 >
 <Ionicons name="document-text" size={20} color="#fff" />
 <Text style={styles.primaryButtonText}>View Details</Text>
 </TouchableOpacity>
 </View>
 </ScrollView>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f8f9fa',
 },
 loadingContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: '#f8f9fa',
 },
 loadingText: {
 marginTop: 20,
 fontSize: 16,
 color: '#666',
 },
 errorContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 paddingHorizontal: 20,
 backgroundColor: '#f8f9fa',
 },
 errorTitle: {
 fontSize: 20,
 fontWeight: '600',
 color: '#333',
 marginTop: 20,
 marginBottom: 10,
 },
 errorMessage: {
 fontSize: 16,
 color: '#666',
 textAlign: 'center',
 marginBottom: 30,
 },
 retryButton: {
 backgroundColor: '#007AFF',
 paddingHorizontal: 30,
 paddingVertical: 12,
 borderRadius: 8,
 },
 retryButtonText: {
 color: '#fff',
 fontSize: 16,
 fontWeight: '500',
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingHorizontal: 20,
 paddingTop: 60,
 paddingBottom: 20,
 backgroundColor: '#fff',
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 },
 headerTitle: {
 fontSize: 18,
 fontWeight: '600',
 color: '#333',
 },
 serviceIdCard: {
 backgroundColor: '#fff',
 margin: 20,
 padding: 20,
 borderRadius: 12,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4,
 elevation: 3,
 },
 serviceIdHeader: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 10,
 },
 serviceIdLabel: {
 fontSize: 16,
 fontWeight: '500',
 color: '#666',
 marginLeft: 8,
 },
 serviceIdText: {
 fontSize: 24,
 fontWeight: 'bold',
 color: '#333',
 marginBottom: 10,
 fontFamily: 'monospace',
 },
 urgencyBadge: {
 alignSelf: 'flex-start',
 paddingHorizontal: 12,
 paddingVertical: 4,
 borderRadius: 12,
 },
 urgencyText: {
 color: '#fff',
 fontSize: 12,
 fontWeight: '600',
 },
 statusCard: {
 backgroundColor: '#fff',
 marginHorizontal: 20,
 marginBottom: 20,
 padding: 20,
 borderRadius: 12,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4,
 elevation: 3,
 },
 statusTitle: {
 fontSize: 18,
 fontWeight: '600',
 color: '#333',
 marginBottom: 8,
 },
 statusDescription: {
 fontSize: 16,
 color: '#666',
 marginBottom: 10,
 },
 timeRemaining: {
 fontSize: 14,
 color: '#007AFF',
 fontWeight: '500',
 },
 progressContainer: {
 backgroundColor: '#fff',
 marginHorizontal: 20,
 marginBottom: 20,
 padding: 20,
 borderRadius: 12,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4,
 elevation: 3,
 },
 sectionTitle: {
 fontSize: 18,
 fontWeight: '600',
 color: '#333',
 marginBottom: 20,
 },
 stageItem: {
 flexDirection: 'row',
 marginBottom: 20,
 },
 stageIndicator: {
 alignItems: 'center',
 marginRight: 15,
 },
 stageIcon: {
 width: 40,
 height: 40,
 borderRadius: 20,
 justifyContent: 'center',
 alignItems: 'center',
 },
 stageIconCompleted: {
 backgroundColor: '#34c759',
 },
 stageIconPending: {
 backgroundColor: '#e5e5e7',
 },
 stageLine: {
 width: 2,
 height: 30,
 marginTop: 5,
 },
 stageLineCompleted: {
 backgroundColor: '#34c759',
 },
 stageLinePending: {
 backgroundColor: '#e5e5e7',
 },
 stageContent: {
 flex: 1,
 },
 stageTitle: {
 fontSize: 16,
 fontWeight: '600',
 marginBottom: 4,
 },
 stageTitleCompleted: {
 color: '#333',
 },
 stageTitlePending: {
 color: '#666',
 },
 stageDescription: {
 fontSize: 14,
 color: '#666',
 marginBottom: 5,
 },
 stageTime: {
 fontSize: 12,
 color: '#999',
 },
 estimatedTime: {
 fontSize: 12,
 color: '#007AFF',
 fontWeight: '500',
 },
 technicianInfo: {
 flexDirection: 'row',
 alignItems: 'center',
 marginTop: 8,
 padding: 10,
 backgroundColor: '#f0f9ff',
 borderRadius: 8,
 },
 detailsContainer: {
 backgroundColor: '#fff',
 marginHorizontal: 20,
 marginBottom: 20,
 padding: 20,
 borderRadius: 12,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4,
 elevation: 3,
 },
 detailItem: {
 marginBottom: 15,
 },
 detailLabel: {
 fontSize: 14,
 fontWeight: '500',
 color: '#666',
 marginBottom: 4,
 },
 detailValue: {
 fontSize: 16,
 color: '#333',
 },
 detailSubValue: {
 fontSize: 14,
 color: '#666',
 marginTop: 2,
 },
 technicianCard: {
 backgroundColor: '#fff',
 marginHorizontal: 20,
 marginBottom: 20,
 padding: 20,
 borderRadius: 12,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4,
 elevation: 3,
 },
 technicianDetails: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 15,
 },
 technicianText: {
 marginLeft: 15,
 flex: 1,
 },
 technicianName: {
 fontSize: 18,
 fontWeight: '600',
 color: '#333',
 marginBottom: 4,
 },
 technicianPhone: {
 fontSize: 16,
 color: '#666',
 marginBottom: 4,
 },
 ratingContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 ratingText: {
 fontSize: 14,
 color: '#666',
 marginLeft: 4,
 },
 callButton: {
 flexDirection: 'row',
 backgroundColor: '#34c759',
 paddingVertical: 12,
 paddingHorizontal: 20,
 borderRadius: 8,
 alignItems: 'center',
 justifyContent: 'center',
 },
 callButtonText: {
 color: '#fff',
 fontSize: 16,
 fontWeight: '600',
 marginLeft: 8,
 },
 actionButtons: {
 flexDirection: 'row',
 paddingHorizontal: 20,
 paddingBottom: 40,
 gap: 10,
 },
 primaryButton: {
 flex: 1,
 flexDirection: 'row',
 backgroundColor: '#007AFF',
 paddingVertical: 15,
 borderRadius: 8,
 alignItems: 'center',
 justifyContent: 'center',
 },
 primaryButtonText: {
 color: '#fff',
 fontSize: 16,
 fontWeight: '600',
 marginLeft: 8,
 },
 secondaryButton: {
 flex: 1,
 flexDirection: 'row',
 backgroundColor: '#fff',
 borderWidth: 1,
 borderColor: '#007AFF',
 paddingVertical: 15,
 borderRadius: 8,
 alignItems: 'center',
 justifyContent: 'center',
 },
 secondaryButtonText: {
 color: '#007AFF',
 fontSize: 16,
 fontWeight: '500',
 marginLeft: 8,
 },
});