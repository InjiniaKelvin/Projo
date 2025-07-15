import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/SimpleAuthContext';

export default function MyJobs() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed'
  const [jobs, setJobs] = useState({
    active: [
      {
        _id: '1',
        serviceType: 'Plumbing',
        description: 'Fix kitchen sink drainage issue',
        location: { address: 'Westlands, Nairobi' },
        estimatedCost: 3500,
        status: 'in_progress',
        clientName: 'Sarah M.',
        clientPhone: '+254712345678',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        acceptedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        _id: '2',
        serviceType: 'Electrical',
        description: 'Install new ceiling fan in bedroom',
        location: { address: 'Karen, Nairobi' },
        estimatedCost: 4200,
        status: 'accepted',
        clientName: 'John K.',
        clientPhone: '+254723456789',
        scheduledDate: new Date(Date.now() + 172800000).toISOString(),
        acceptedAt: new Date(Date.now() - 1800000).toISOString()
      }
    ],
    completed: [
      {
        _id: '3',
        serviceType: 'Appliance Repair',
        description: 'Fixed washing machine motor issue',
        location: { address: 'Kilimani, Nairobi' },
        estimatedCost: 2800,
        actualCost: 2800,
        status: 'completed',
        clientName: 'Mary W.',
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        rating: 5,
        clientFeedback: 'Excellent work! Very professional and quick.'
      },
      {
        _id: '4',
        serviceType: 'Plumbing',
        description: 'Repaired bathroom shower head',
        location: { address: 'Parklands, Nairobi' },
        estimatedCost: 1500,
        actualCost: 1200,
        status: 'completed',
        clientName: 'David L.',
        completedAt: new Date(Date.now() - 172800000).toISOString(),
        rating: 4,
        clientFeedback: 'Good service, arrived on time.'
      }
    ]
  });
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#0d6efd';
      case 'in_progress': return '#ffc107';
      case 'completed': return '#28a745';
      default: return '#6c757d';
    }
  };

  const handleJobAction = (job, action) => {
    switch (action) {
      case 'start':
        Alert.alert(
          'Start Job',
          'Mark this job as in progress?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Start Job', 
              onPress: () => {
                const updatedJobs = { ...jobs };
                const jobIndex = updatedJobs.active.findIndex(j => j._id === job._id);
                if (jobIndex !== -1) {
                  updatedJobs.active[jobIndex].status = 'in_progress';
                  setJobs(updatedJobs);
                  Alert.alert('Success', 'Job marked as in progress!');
                }
              }
            }
          ]
        );
        break;
      case 'complete':
        Alert.alert(
          'Complete Job',
          'Mark this job as completed?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Complete', 
              onPress: () => {
                Alert.alert('Success', 'Job completed! Payment will be processed.');
              }
            }
          ]
        );
        break;
      case 'contact':
        Alert.alert(
          'Contact Client',
          `Call ${job.clientName}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call Now', onPress: () => Alert.alert('Calling', `Calling ${job.clientPhone}...`) }
          ]
        );
        break;
      case 'navigate':
        Alert.alert('Navigation', `Opening directions to ${job.location.address}...`);
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
