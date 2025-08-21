/**
 * Booking Status Screen
 * 
 * Real-time booking status tracking with technician matching,
 * live updates, chat functionality, and payment integration
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ChatInterface from '../../components/ChatInterface';

// Type definitions
interface Booking {
  id: string;
  serviceName: string;
  status: string;
  createdAt: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  pricing: {
    estimatedPrice: number;
    finalPrice: number | null;
  };
  urgency: string;
  timeline: TimelineItem[];
}

interface Technician {
  id: string;
  name: string;
  phoneNumber: string;
  rating: number;
  completedJobs: number;
  specializations: string[];
  profileImage: string | null;
  currentLocation: { lat: number; lng: number };
  estimatedArrival: string;
}

// Type definitions
interface TimelineItem {
  status: string;
  timestamp: string;
  description: string;
  icon?: string;
  color?: string;
}

interface Booking {
  id: string;
  serviceName: string;
  status: string;
  createdAt: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  pricing: {
    estimatedPrice: number;
    finalPrice: number | null;
  };
  urgency: string;
  timeline: TimelineItem[];
}

interface Technician {
  id: string;
  name: string;
  phoneNumber: string;
  rating: number;
  completedJobs: number;
  specializations: string[];
  profileImage: string | null;
  currentLocation: { lat: number; lng: number };
  estimatedArrival: string;
}

export default function BookingStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);

  const statusSteps = [
    { id: 'searching', name: 'Finding Technician', icon: 'search', color: '#f59e0b' },
    { id: 'assigned', name: 'Technician Assigned', icon: 'person-add', color: '#0d6efd' },
    { id: 'confirmed', name: 'Confirmed', icon: 'checkmark-circle', color: '#10b981' },
    { id: 'in_progress', name: 'Work in Progress', icon: 'construct', color: '#8b5cf6' },
    { id: 'completed', name: 'Completed', icon: 'star', color: '#059669' }
  ];

  const loadBookingData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock booking data - in real app, this would come from API
      const mockBooking: Booking = {
        id: (params.bookingId as string) || 'QF1234567890',
        serviceName: (params.serviceName as string) || 'Pipe Repair & Replacement',
        status: 'searching', // searching, assigned, confirmed, in_progress, completed
        createdAt: new Date().toISOString(),
        location: {
          address: '123 Main Street, Nairobi, Kenya',
          coordinates: { lat: -1.2921, lng: 36.8219 }
        },
        pricing: {
          estimatedPrice: 3500,
          finalPrice: null
        },
        urgency: 'urgent',
        timeline: [
          {
            status: 'created',
            timestamp: new Date().toISOString(),
            description: 'Booking created successfully',
            icon: 'checkmark-circle',
            color: '#10b981'
          }
        ]
      };
      
      // In real app, fetch booking data from API
      setBooking(mockBooking);
      setCurrentStep(0); // searching
    } catch (error) {
      console.error('Error loading booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  }, [params.bookingId, params.serviceName]);

  const simulateStatusUpdate = useCallback(() => {
    if (currentStep < statusSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Simulate technician assignment
      if (nextStep === 1) { // assigned
        const mockTechnician: Technician = {
          id: 'TECH001',
          name: 'John Mwangi',
          phoneNumber: '+254712345678',
          rating: 4.8,
          completedJobs: 156,
          specializations: ['Plumbing', 'Pipe Repair'],
          profileImage: null,
          currentLocation: { lat: -1.2800, lng: 36.8200 },
          estimatedArrival: '15-30 minutes'
        };
        setTechnician(mockTechnician);
        setEstimatedArrival(mockTechnician.estimatedArrival);
        
        // Update booking timeline
        setBooking(prev => prev ? ({
          ...prev,
          status: 'assigned',
          timeline: [
            ...prev.timeline,
            {
              status: 'assigned',
              timestamp: new Date().toISOString(),
              description: `Assigned to ${mockTechnician.name}`,
              icon: 'person-add',
              color: '#0d6efd'
            }
          ]
        }) : null);
      }
    }
  }, [currentStep, statusSteps.length]);

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    loadBookingData();
    startPulseAnimation();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      simulateStatusUpdate();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadBookingData, simulateStatusUpdate, startPulseAnimation]);

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            router.replace('/dashboard');
          }
        }
      ]
    );
  };

  const handleCallTechnician = () => {
    if (technician?.phoneNumber) {
      Alert.alert(
        'Call Technician',
        `Call ${technician.name} at ${technician.phoneNumber}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Calling technician...') }
        ]
      );
    }
  };

  const handleChatWithTechnician = () => {
    if (technician && booking) {
      router.push({
        pathname: '/chat',
        params: {
          bookingId: booking.id,
          technicianId: technician.id,
          technicianName: technician.name
        }
      });
    }
  };

  const renderStatusProgress = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>Booking Progress</Text>
      {statusSteps.map((step, index) => {
        const isActive = index <= currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <View key={step.id} style={styles.progressStep}>
            <View style={styles.progressStepLine}>
              <Animated.View style={[
                styles.progressDot,
                { backgroundColor: isActive ? step.color : '#e5e7eb' },
                isCurrent && { transform: [{ scale: pulseAnim }] }
              ]}>
                <Ionicons 
                  name={step.icon as any} 
                  size={16} 
                  color={isActive ? '#fff' : '#9ca3af'} 
                />
              </Animated.View>
              {index < statusSteps.length - 1 && (
                <View style={[
                  styles.progressLine,
                  { backgroundColor: isActive ? step.color : '#e5e7eb' }
                ]} />
              )}
            </View>
            <View style={styles.progressStepContent}>
              <Text style={[
                styles.progressStepName,
                { color: isActive ? step.color : '#9ca3af' }
              ]}>
                {step.name}
              </Text>
              {isCurrent && (
                <View style={styles.activeIndicator}>
                  <ActivityIndicator size="small" color={step.color} />
                  <Text style={[styles.activeText, { color: step.color }]}>
                    In Progress...
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderBookingDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Booking Details</Text>
      
      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <Ionicons name="construct-outline" size={20} color="#6b7280" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Service</Text>
            <Text style={styles.detailValue}>{booking?.serviceName}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="receipt-outline" size={20} color="#6b7280" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Booking ID</Text>
            <Text style={styles.detailValue}>{booking?.id}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={20} color="#6b7280" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{booking?.location.address}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="wallet-outline" size={20} color="#6b7280" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Estimated Cost</Text>
            <Text style={styles.detailValue}>
              KSh {booking?.pricing.estimatedPrice.toLocaleString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="flash-outline" size={20} color="#6b7280" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Priority</Text>
            <Text style={[
              styles.detailValue,
              { color: booking?.urgency === 'urgent' ? '#ef4444' : '#10b981' }
            ]}>
              {booking?.urgency ? (booking.urgency.charAt(0).toUpperCase() + booking.urgency.slice(1)) : 'Standard'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTechnicianInfo = () => {
    if (!technician) return null;

    return (
      <View style={styles.technicianContainer}>
        <Text style={styles.sectionTitle}>Your Technician</Text>
        
        <View style={styles.technicianCard}>
          <View style={styles.technicianHeader}>
            <View style={styles.technicianAvatar}>
              <Ionicons name="person" size={32} color="#0d6efd" />
            </View>
            <View style={styles.technicianInfo}>
              <Text style={styles.technicianName}>{technician.name}</Text>
              <View style={styles.technicianStats}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.technicianRating}>{technician.rating}</Text>
                <Text style={styles.technicianJobs}>
                  • {technician.completedJobs} jobs completed
                </Text>
              </View>
              <Text style={styles.technicianSpecializations}>
                {technician.specializations.join(' • ')}
              </Text>
            </View>
          </View>
          
          {estimatedArrival && (
            <View style={styles.arrivalContainer}>
              <Ionicons name="time-outline" size={16} color="#0d6efd" />
              <Text style={styles.arrivalText}>
                Estimated arrival: {estimatedArrival}
              </Text>
            </View>
          )}
          
          <View style={styles.technicianActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCallTechnician}
            >
              <Ionicons name="call" size={18} color="#10b981" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleChatWithTechnician}
            >
              <Ionicons name="chatbubble" size={18} color="#0d6efd" />
              <Text style={styles.actionButtonText}>Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/tracking')}
            >
              <Ionicons name="navigate" size={18} color="#8b5cf6" />
              <Text style={styles.actionButtonText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setShowChat(true)}
          disabled={!technician}
        >
          <Ionicons name="chatbubble-outline" size={24} color={technician ? "#10b981" : "#9ca3af"} />
          <Text style={[styles.quickActionText, { color: technician ? "#10b981" : "#9ca3af" }]}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push('/support')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#0d6efd" />
          <Text style={styles.quickActionText}>Get Help</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push('/bookings')}
        >
          <Ionicons name="list-outline" size={24} color="#0d6efd" />
          <Text style={styles.quickActionText}>All Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, styles.cancelButton]}
          onPress={handleCancelBooking}
        >
          <Ionicons name="close-circle-outline" size={24} color="#ef4444" />
          <Text style={[styles.quickActionText, styles.cancelText]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading booking status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Status</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadBookingData}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStatusProgress()}
        {renderBookingDetails()}
        {renderTechnicianInfo()}
        {renderQuickActions()}
      </ScrollView>

      {/* Chat Modal */}
      {technician && (
        <Modal
          visible={showChat}
          animationType="slide"
          onRequestClose={() => setShowChat(false)}
        >
          {booking && technician && (
            <ChatInterface
              bookingId={booking.id}
              participantId={technician.id}
              participantName={technician.name}
              participantRole="technician"
              onClose={() => setShowChat(false)}
            />
          )}
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d6efd',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  refreshButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  progressContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressStepLine: {
    alignItems: 'center',
    marginRight: 15,
  },
  progressDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLine: {
    width: 2,
    height: 30,
    marginTop: 5,
  },
  progressStepContent: {
    flex: 1,
  },
  progressStepName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 15,
  },
  detailsContainer: {
    margin: 15,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailContent: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  technicianContainer: {
    margin: 15,
  },
  technicianCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  technicianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  technicianAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  technicianInfo: {
    flex: 1,
  },
  technicianName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  technicianStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  technicianRating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 4,
  },
  technicianJobs: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  technicianSpecializations: {
    fontSize: 14,
    color: '#0d6efd',
  },
  arrivalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  arrivalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0d6efd',
    marginLeft: 8,
  },
  technicianActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: 80,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginTop: 4,
  },
  quickActionsContainer: {
    margin: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0d6efd',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
  },
  cancelText: {
    color: '#ef4444',
  },
});
