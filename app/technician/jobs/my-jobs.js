import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/SimpleAuthContext';
import { API_ENDPOINTS, API_CONFIG } from '../../../config/api';

export default function MyJobs() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed'
  const [jobs, setJobs] = useState({
    active: [],
    completed: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch technician's jobs from backend
  const fetchMyJobs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.TECHNICIAN.MY_JOBS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Separate jobs into active and completed
        const activeJobs = data.jobs?.filter(job => 
          ['accepted', 'in_progress'].includes(job.status)
        ) || [];
        const completedJobs = data.jobs?.filter(job => 
          job.status === 'completed'
        ) || [];

        setJobs({
          active: activeJobs,
          completed: completedJobs
        });
      } else {
        throw new Error(data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching my jobs:', err);
      setError(err.message);
      Alert.alert('Error', err.message || 'Failed to load your jobs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch jobs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMyJobs();
    }, [])
  );

  const onRefresh = () => {
    fetchMyJobs(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#0d6efd';
      case 'in_progress': return '#ffc107';
      case 'completed': return '#28a745';
      default: return '#6c757d';
    }
  };

  const handleJobAction = async (job, action) => {
    switch (action) {
      case 'start':
        Alert.alert(
          'Start Job',
          'Mark this job as in progress?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Start Job', 
              onPress: async () => {
                try {
                  const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.TECHNICIAN.START_JOB(job._id)}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    }
                  });

                  const data = await response.json();

                  if (response.ok) {
                    Alert.alert('Success', 'Job marked as in progress!');
                    fetchMyJobs(); // Refresh jobs list
                  } else {
                    throw new Error(data.message || 'Failed to start job');
                  }
                } catch (err) {
                  console.error('Error starting job:', err);
                  Alert.alert('Error', err.message || 'Failed to start job');
                }
              }
            }
          ]
        );
        break;
      case 'complete':
        // Navigate to job details for completion
        router.push(`/technician/jobs/${job._id}`);
        break;
      case 'contact':
        Alert.alert(
          'Contact Client',
          `Call ${job.clientName || job.userId?.name || 'client'}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call Now', onPress: () => Alert.alert('Calling', `Calling ${job.clientPhone || job.userId?.phone || 'client'}...`) }
          ]
        );
        break;
      case 'navigate':
        Alert.alert('Navigation', `Opening directions to ${job.location?.address || job.location?.estate || 'location'}...`);
        break;
      case 'viewDetails':
        router.push(`/technician/jobs/${job._id}`);
        break;
      default:
        break;
    }
  };

  const renderActiveJob = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.serviceType}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
      
      <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.clientName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.location.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.scheduledDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#28a745" />
          <Text style={[styles.detailText, { color: '#28a745', fontWeight: '600' }]}>
            KES {item.estimatedCost}
          </Text>
        </View>
      </View>

      <View style={styles.jobActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleJobAction(item, 'contact')}
        >
          <Ionicons name="call" size={16} color="#0d6efd" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleJobAction(item, 'navigate')}
        >
          <Ionicons name="navigate" size={16} color="#0d6efd" />
          <Text style={styles.actionText}>Navigate</Text>
        </TouchableOpacity>
        
        {item.status === 'accepted' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => handleJobAction(item, 'start')}
          >
            <Ionicons name="play" size={16} color="#fff" />
            <Text style={[styles.actionText, { color: '#fff' }]}>Start</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'in_progress' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.successAction]}
            onPress={() => handleJobAction(item, 'complete')}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={[styles.actionText, { color: '#fff' }]}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderCompletedJob = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.serviceType}</Text>
        <Text style={styles.earningsText}>+KES {item.actualCost}</Text>
      </View>
      
      <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.clientName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Completed: {new Date(item.completedAt).toLocaleDateString()}
          </Text>
        </View>
        {item.rating && (
          <View style={styles.detailRow}>
            <Ionicons name="star" size={16} color="#ffc107" />
            <Text style={styles.detailText}>{item.rating}/5 stars</Text>
          </View>
        )}
      </View>

      {item.clientFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>Client Feedback:</Text>
          <Text style={styles.feedbackText}>"{item.clientFeedback}"</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({jobs.active.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed ({jobs.completed.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d6efd" />
          <Text style={styles.loadingText}>Loading your jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={jobs[activeTab]}
          keyExtractor={(item) => item._id}
          renderItem={activeTab === 'active' ? renderActiveJob : renderCompletedJob}
          contentContainerStyle={styles.jobsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                No {activeTab} jobs
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'active' 
                  ? 'Accept jobs from the browse section to see them here'
                  : 'Completed jobs will appear here after finishing work'
                }
              </Text>
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
  placeholder: {
    width: 40
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#0d6efd'
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666'
  },
  activeTabText: {
    color: '#0d6efd',
    fontWeight: '600'
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
    alignItems: 'center',
    marginBottom: 8
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize'
  },
  earningsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745'
  },
  jobDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  jobDetails: {
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8
  },
  jobActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0d6efd'
  },
  primaryAction: {
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd'
  },
  successAction: {
    backgroundColor: '#28a745',
    borderColor: '#28a745'
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0d6efd',
    marginLeft: 4
  },
  feedbackContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745'
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic'
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
    textAlign: 'center',
    paddingHorizontal: 20
  }
});
