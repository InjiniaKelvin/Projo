import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/SimpleAuthContext';

export default function BrowseJobs() {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([
    {
      _id: '1',
      serviceType: 'Plumbing',
      description: 'Leaky kitchen faucet needs repair. Water dripping constantly.',
      location: { address: 'Westlands, Nairobi' },
      estimatedCost: 2500,
      urgency: 'medium',
      distance: '2.3 km',
      createdAt: new Date().toISOString(),
      clientName: 'Sarah M.',
      clientRating: 4.8
    },
    {
      _id: '2',
      serviceType: 'Electrical',
      description: 'Power outlet not working in bedroom. Need immediate fix.',
      location: { address: 'Karen, Nairobi' },
      estimatedCost: 1800,
      urgency: 'high',
      distance: '5.1 km',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      clientName: 'John K.',
      clientRating: 4.9
    },
    {
      _id: '3',
      serviceType: 'Appliance Repair',
      description: 'Washing machine making loud noise during spin cycle.',
      location: { address: 'Kilimani, Nairobi' },
      estimatedCost: 3200,
      urgency: 'low',
      distance: '3.7 km',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      clientName: 'Mary W.',
      clientRating: 4.6
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const handleAcceptJob = (job) => {
    Alert.alert(
      'Accept Job',
      `Accept this ${job.serviceType} job for KES ${job.estimatedCost}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept Job', 
          onPress: () => {
            Alert.alert('Success!', `You've accepted the ${job.serviceType} job. The client will be notified.`);
            setJobs(prevJobs => prevJobs.filter(j => j._id !== job._id));
          }
        }
      ]
    );
  };

  const renderJob = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle}>{item.serviceType}</Text>
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
            <Text style={styles.urgencyText}>{item.urgency}</Text>
          </View>
        </View>
        <Text style={styles.jobPrice}>KES {item.estimatedCost}</Text>
      </View>
      
      <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.jobMeta}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText}>{item.location.address}</Text>
          <Text style={styles.distanceText}>• {item.distance}</Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#ffc107" />
            <Text style={styles.ratingText}>{item.clientRating}</Text>
          </View>
        </View>
      </View>

      <View style={styles.jobActions}>
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => Alert.alert('Job Details', 'Viewing detailed job information...')}
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
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          renderItem={renderJob}
          contentContainerStyle={styles.jobsList}
          showsVerticalScrollIndicator={false}
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
  }
});
