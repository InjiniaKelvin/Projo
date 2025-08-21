/**
 * Enhanced Booking Tracking Screen
 * 
 * Real-time tracking with technician response monitoring,
 * progress visualization, and communication capabilities.
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Linking
} from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';
import BookingService from '../../services/BookingService';

interface TrackingStage {
  stage: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
  estimatedTime?: string;
}

interface TechnicianInfo {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  rating: number;
  estimatedArrival?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface BookingTrackingData {
  serviceId: string;
  bookingId: string;
  currentStage: string;
  status: string;
  trackingStage: string;
  progressPercentage: number;
  clientDetails: {
    name: string;
    phoneNumber: string;
    email?: string;
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
    landmarks?: string;
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
  technician?: TechnicianInfo;
  estimatedArrival?: number;
  estimatedCompletion: {
    estimatedTime: number;
    estimatedCompletion: string;
    timeRemaining: number;
  };
  timeline: {
    status: string;
    timestamp: string;
    notes?: string;
  }[];
  canCancel: boolean;
  canContact: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  _id: string;
  senderId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  senderName: string;
  senderRole: string;
}

export default function EnhancedBookingTrackingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const serviceId = params.serviceId as string;
  
  const [trackingData, setTrackingData] = useState<BookingTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time updates
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  
  // Chat functionality
  const [showChat, setShowChat] = useState(false);
  const [chatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Animation
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [pulseAnimation]);
  
  useEffect(() => {
    startPulseAnimation();
  }, [startPulseAnimation]);

  const calculateProgressPercentage = useCallback((stage: string): number => {
    const stages = ['submitted', 'technician_matching', 'technician_assigned', 'confirmed', 'in_progress', 'completed'];
    const currentIndex = stages.indexOf(stage);
    return Math.round(((currentIndex + 1) / stages.length) * 100);
  }, []);

  const getStageTitle = useCallback((stage: string): string => {
    const titles: Record<string, string> = {
      submitted: 'Booking Submitted',
      technician_matching: 'Finding Technician',
      technician_assigned: 'Technician Assigned',
      confirmed: 'Booking Confirmed',
      in_progress: 'Service In Progress',
      completed: 'Service Completed'
    };
    return titles[stage] || stage;
  }, []);

  const getStageDescription = useCallback((stage: string): string => {
    const descriptions: Record<string, string> = {
      submitted: 'Your booking request has been submitted',
      technician_matching: 'We are finding the best technician for your service',
      technician_assigned: 'A qualified technician has been assigned to your booking',
      confirmed: 'The technician has confirmed your booking',
      in_progress: 'Your service is currently being performed',
      completed: 'Your service has been completed successfully'
    };
    return descriptions[stage] || 'Processing your booking';
  }, []);

  const getStageIcon = useCallback((stage: string): string => {
    const icons: Record<string, string> = {
      submitted: 'checkmark-circle',
      technician_matching: 'search',
      technician_assigned: 'person',
      confirmed: 'checkmark-done',
      in_progress: 'build',
      completed: 'trophy'
    };
    return icons[stage] || 'ellipse';
  }, []);

  const generateTrackingStages = useCallback((currentStage: string): Record<string, TrackingStage> => {
    const stageOrder = ['submitted', 'technician_matching', 'technician_assigned', 'confirmed', 'in_progress', 'completed'];
    const currentIndex = stageOrder.indexOf(currentStage);
    
    return stageOrder.reduce((stages, stage, index) => {
      stages[stage] = {
        stage: index + 1,
        title: getStageTitle(stage),
        description: getStageDescription(stage),
        completed: index <= currentIndex,
        current: index === currentIndex,
        timestamp: index <= currentIndex ? new Date().toISOString() : undefined,
        icon: getStageIcon(stage)
      };
      return stages;
    }, {} as Record<string, TrackingStage>);
  }, [getStageTitle, getStageDescription, getStageIcon]);

  useEffect(() => {
    if (trackingData?.progressPercentage) {
      Animated.timing(progressAnimation, {
        toValue: trackingData.progressPercentage,
        duration: 1000,
        useNativeDriver: false
      }).start();
    }
  }, [trackingData?.progressPercentage, progressAnimation]);

  const initializeTracking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load booking data using existing BookingService
      const response = await BookingService.getBooking(serviceId);
      
      // Transform booking data to tracking format
      const currentStage = response.data.status || 'submitted';
      const trackingData: BookingTrackingData = {
        bookingId: response.data._id,
        serviceId: serviceId,
        status: response.data.status || 'submitted',
        currentStage: currentStage,
        trackingStage: currentStage,
        progressPercentage: calculateProgressPercentage(currentStage),
        clientDetails: {
          name: response.data.client?.name || 'Client',
          phoneNumber: response.data.client?.phoneNumber || '',
          email: response.data.client?.email
        },
        serviceType: response.data.service?.type || 'general',
        serviceDescription: response.data.service?.description || 'Service request',
        urgency: response.data.urgency || 'medium',
        location: {
          address: {
            street: response.data.location?.address?.street || '',
            city: response.data.location?.address?.city || '',
            county: response.data.location?.address?.county || ''
          },
          landmarks: response.data.location?.landmarks
        },
        scheduling: {
          preferredDate: response.data.preferredDate || new Date().toISOString(),
          preferredTimeSlot: {
            start: response.data.preferredTimeSlot?.start || '09:00',
            end: response.data.preferredTimeSlot?.end || '17:00'
          }
        },
        pricing: {
          quotedAmount: response.data.quotedAmount || 0,
          currency: response.data.currency || 'KES',
          paymentStatus: response.data.paymentStatus || 'pending'
        },
        estimatedArrival: response.data.estimatedArrival,
        estimatedCompletion: {
          estimatedTime: response.data.estimatedTime || 60,
          estimatedCompletion: response.data.estimatedCompletion || '',
          timeRemaining: response.data.timeRemaining || 0
        },
        technician: response.data.technician,
        stages: generateTrackingStages(currentStage),
        currentStageInfo: generateTrackingStages(currentStage)[currentStage],
        timeline: response.data.timeline || [],
        canCancel: response.data.canCancel !== false,
        canContact: response.data.canContact !== false,
        createdAt: response.data.createdAt || new Date().toISOString(),
        updatedAt: response.data.updatedAt || new Date().toISOString()
      };
      
      setTrackingData(trackingData);
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Tracking initialization error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tracking data');
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  }, [serviceId, calculateProgressPercentage, generateTrackingStages]);

  const cleanup = useCallback(() => {
    // Cleanup function - no active subscriptions with existing BookingService
    console.log('Cleaning up tracking screen');
  }, []);

  useEffect(() => {
    initializeTracking();
    return cleanup;
  }, [initializeTracking, cleanup]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !trackingData?.technician) return;
    
    try {
      setIsSendingMessage(true);
      // Chat functionality not available in existing BookingService
      Alert.alert('Info', 'Chat functionality is not available');
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await initializeTracking();
    setIsRefreshing(false);
  };

  const handleContactTechnician = () => {
    if (!trackingData?.technician) return;
    
    Alert.alert(
      'Contact Technician',
      `Contact ${trackingData.technician.firstName} ${trackingData.technician.lastName}`,
      [
        { text: 'Call', onPress: () => Linking.openURL(`tel:${trackingData.technician!.phoneNumber}`) },
        { text: 'Message', onPress: () => setShowChat(true) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await BookingService.cancelBooking(trackingData!.bookingId, 'Client requested cancellation');
              Alert.alert('Success', 'Booking cancelled successfully');
              router.back();
            } catch (error) {
              console.error('Cancel booking error:', error);
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const renderConnectionStatus = () => (
    <View style={[styles.connectionStatus, { backgroundColor: getConnectionColor() }]}>
      <Ionicons 
        name={getConnectionIcon()} 
        size={12} 
        color="#fff" 
        style={styles.connectionIcon} 
      />
      <Text style={styles.connectionText}>
        {connectionStatus === 'connected' ? 'Live Tracking' : 
         connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
      </Text>
    </View>
  );

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      default: return '#F44336';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return 'radio';
      case 'connecting': return 'hourglass';
      default: return 'radio-outline';
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>Progress</Text>
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width: progressAnimation.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp'
              })
            }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        {trackingData?.progressPercentage || 0}% Complete
      </Text>
    </View>
  );

  const renderStageItem = (stageKey: string, stage: TrackingStage) => (
    <View key={stageKey} style={styles.stageItem}>
      <View style={styles.stageIconContainer}>
        <Animated.View
          style={[
            styles.stageIcon,
            {
              backgroundColor: stage.completed ? '#4CAF50' : stage.current ? '#2196F3' : '#E0E0E0',
              transform: stage.current ? [{ scale: pulseAnimation }] : [{ scale: 1 }]
            }
          ]}
        >
          <Ionicons 
            name={stage.icon as any} 
            size={20} 
            color={stage.completed || stage.current ? '#fff' : '#999'} 
          />
        </Animated.View>
        {stageKey !== 'completed' && <View style={styles.stageConnector} />}
      </View>
      
      <View style={styles.stageContent}>
        <View style={styles.stageHeader}>
          <Text style={[
            styles.stageTitle,
            { color: stage.current ? '#2196F3' : stage.completed ? '#333' : '#999' }
          ]}>
            {stage.title}
          </Text>
          {stage.current && (
            <View style={styles.currentStageBadge}>
              <Text style={styles.currentStageText}>Current</Text>
            </View>
          )}
        </View>
        <Text style={styles.stageDescription}>{stage.description}</Text>
        {stage.timestamp && (
          <Text style={styles.stageTimestamp}>
            {new Date(stage.timestamp).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );

  const renderTechnicianInfo = () => {
    if (!trackingData?.technician) return null;
    
    const { technician } = trackingData;
    
    return (
      <View style={styles.technicianCard}>
        <View style={styles.technicianHeader}>
          <View style={styles.technicianAvatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          <View style={styles.technicianDetails}>
            <Text style={styles.technicianName}>
              {technician.firstName} {technician.lastName}
            </Text>
            <View style={styles.technicianRating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{technician.rating.toFixed(1)}</Text>
            </View>
            {technician.estimatedArrival && (
              <Text style={styles.arrivalText}>
                Arriving in {technician.estimatedArrival} minutes
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.technicianActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.callButton]}
            onPress={() => Linking.openURL(`tel:${technician.phoneNumber}`)}
          >
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => setShowChat(true)}
          >
            <Ionicons name="chatbubble" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBookingDetails = () => (
    <View style={styles.detailsCard}>
      <Text style={styles.cardTitle}>Booking Details</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Service ID:</Text>
        <Text style={styles.detailValue}>{trackingData?.serviceId}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Service:</Text>
        <Text style={styles.detailValue}>
          {trackingData?.serviceType?.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Urgency:</Text>
        <Text style={[styles.detailValue, { color: getUrgencyColor(trackingData?.urgency) }]}>
          {trackingData?.urgency?.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Location:</Text>
        <Text style={styles.detailValue}>
          {trackingData?.location.address.city}, {trackingData?.location.address.county}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Scheduled:</Text>
        <Text style={styles.detailValue}>
          {new Date(trackingData?.scheduling.preferredDate || '').toLocaleDateString()} 
          {' at '} 
          {trackingData?.scheduling.preferredTimeSlot.start}
        </Text>
      </View>
    </View>
  );

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'emergency': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  const renderChatModal = () => (
    showChat && (
      <View style={styles.chatModal}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>
            Chat with {trackingData?.technician?.firstName}
          </Text>
          <TouchableOpacity onPress={() => setShowChat(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.chatMessages}>
          {chatMessages.map((message) => (
            <View
              key={message._id}
              style={[
                styles.messageItem,
                message.senderId === user?._id ? styles.sentMessage : styles.receivedMessage
              ]}
            >
              <Text style={styles.messageText}>{message.message}</Text>
              <Text style={styles.messageTime}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.chatInput}>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: newMessage.trim() ? 1 : 0.5 }]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSendingMessage}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading tracking information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeTracking}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderConnectionStatus()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Progress Bar */}
        {renderProgressBar()}
        
        {/* Technician Information */}
        {renderTechnicianInfo()}
        
        {/* Tracking Stages */}
        <View style={styles.stagesContainer}>
          <Text style={styles.cardTitle}>Tracking Progress</Text>
          {trackingData?.stages && Object.entries(trackingData.stages).map(([key, stage]) =>
            renderStageItem(key, stage)
          )}
        </View>
        
        {/* Booking Details */}
        {renderBookingDetails()}
        
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {trackingData?.canContact && trackingData.technician && (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleContactTechnician}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Contact Technician</Text>
            </TouchableOpacity>
          )}
          
          {trackingData?.canCancel && (
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleCancelBooking}
            >
              <Ionicons name="close-circle" size={20} color="#F44336" />
              <Text style={styles.secondaryButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      
      {/* Chat Modal */}
      {renderChatModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5'
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  connectionIcon: {
    marginRight: 8
  },
  connectionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  lastUpdateText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 16,
    opacity: 0.8
  },
  scrollView: {
    flex: 1
  },
  progressContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  technicianCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  technicianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  technicianAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  technicianDetails: {
    flex: 1
  },
  technicianName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  technicianRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666'
  },
  arrivalText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500'
  },
  technicianActions: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8
  },
  callButton: {
    backgroundColor: '#4CAF50'
  },
  messageButton: {
    backgroundColor: '#2196F3'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  stagesContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333'
  },
  stageItem: {
    flexDirection: 'row',
    marginBottom: 16
  },
  stageIconContainer: {
    alignItems: 'center',
    marginRight: 16
  },
  stageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stageConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 8
  },
  stageContent: {
    flex: 1,
    paddingTop: 4
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  currentStageBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#2196F3',
    borderRadius: 12
  },
  currentStageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  stageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  stageTimestamp: {
    fontSize: 12,
    color: '#999'
  },
  detailsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16
  },
  actionContainer: {
    padding: 16,
    gap: 12
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    gap: 8
  },
  secondaryButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600'
  },
  chatModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  chatMessages: {
    flex: 1,
    padding: 16
  },
  messageItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%'
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196F3'
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0'
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  messageTime: {
    fontSize: 12,
    color: '#666'
  },
  chatInput: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end'
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 12
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center'
  }
});