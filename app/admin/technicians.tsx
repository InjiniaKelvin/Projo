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
  View,
  Platform,
} from 'react-native';
import apiClient, { API_ENDPOINTS } from '@/config/api';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

interface TechnicianProfile {
  specialization?: string;
  yearsOfExperience?: number;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  documents?: string[];
}

interface Technician {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  technicianProfile?: TechnicianProfile;
}

export default function TechniciansScreen() {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadTechnicians();
  }, [filter]);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      // Fetch all technicians (limit 100) and filter client-side to handle missing backend fields
      const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}?role=technician&limit=100`);
      if (response.data.users) {
        const allTechnicians = response.data.users;
        
        const filtered = allTechnicians.filter((tech: Technician) => {
          const status = tech.technicianProfile?.verificationStatus || 'pending';
          return status === filter;
        });
        
        setTechnicians(filtered);
      }
    } catch (error) {
      console.error('Error loading technicians:', error);
      Alert.alert('Error', 'Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTechnicians();
    setRefreshing(false);
  };

  const handleApprove = (technician: Technician) => {
    const approveAction = async () => {
      try {
        console.log('Approving technician:', technician._id);
        await apiClient.post(API_ENDPOINTS.ADMIN.VERIFY_TECHNICIAN(technician._id), { action: 'approve' });
        console.log('Technician approved');
        if (Platform.OS === 'web') {
          window.alert('Technician approved successfully');
        } else {
          Alert.alert('Success', 'Technician approved successfully');
        }
        loadTechnicians();
      } catch (error) {
        console.error('Approve error:', error);
        if (Platform.OS === 'web') {
          window.alert('Failed to approve technician');
        } else {
          Alert.alert('Error', 'Failed to approve technician');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to approve ${technician.firstName} ${technician.lastName}?`)) {
        approveAction();
      }
    } else {
      Alert.alert(
        'Approve Technician',
        `Are you sure you want to approve ${technician.firstName} ${technician.lastName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Approve',
            onPress: approveAction
          }
        ]
      );
    }
  };

  const handleReject = (technician: Technician) => {
    const rejectAction = async () => {
      try {
        console.log('Rejecting technician:', technician._id);
        await apiClient.post(API_ENDPOINTS.ADMIN.VERIFY_TECHNICIAN(technician._id), { action: 'reject', reason: 'Not specified' });
        console.log('Technician rejected');
        if (Platform.OS === 'web') {
          window.alert('Technician rejected successfully');
        } else {
          Alert.alert('Success', 'Technician rejected successfully');
        }
        loadTechnicians();
      } catch (error) {
        console.error('Reject error:', error);
        if (Platform.OS === 'web') {
          window.alert('Failed to reject technician');
        } else {
          Alert.alert('Error', 'Failed to reject technician');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to reject ${technician.firstName} ${technician.lastName}?`)) {
        rejectAction();
      }
    } else {
      Alert.alert(
        'Reject Technician',
        `Are you sure you want to reject ${technician.firstName} ${technician.lastName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: rejectAction
          }
        ]
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const pendingCount = technicians.filter(t => (t.technicianProfile?.verificationStatus || 'pending') === 'pending').length;

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

      <View style={styles.filterContainer}>
        <SegmentedControl
          segments={['pending', 'verified', 'rejected']}
          activeSegment={filter}
          onSegmentChange={setFilter}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {technicians.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No {filter} technicians found.</Text>
          </View>
        ) : (
          technicians.map((technician) => (
            <View key={technician._id} style={styles.technicianCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.technicianName}>{technician.firstName} {technician.lastName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(technician.technicianProfile?.verificationStatus || 'pending') }]}>
                  <Text style={styles.statusText}>{(technician.technicianProfile?.verificationStatus || 'pending').toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.technicianInfo}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{technician.email}</Text>
              </View>
              
              <View style={styles.technicianInfo}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{technician.phoneNumber}</Text>
              </View>

              <View style={styles.technicianInfo}>
                <Text style={styles.infoLabel}>Specialization:</Text>
                <Text style={styles.infoValue}>{technician.technicianProfile?.specialization || 'N/A'}</Text>
              </View>

              <View style={styles.technicianInfo}>
                <Text style={styles.infoLabel}>Experience:</Text>
                <Text style={styles.infoValue}>{technician.technicianProfile?.yearsOfExperience || 0} years</Text>
              </View>

              <View style={styles.technicianInfo}>
                <Text style={styles.infoLabel}>Submitted:</Text>
                <Text style={styles.infoValue}>{new Date(technician.createdAt).toLocaleDateString()}</Text>
              </View>

              <View style={styles.documentsSection}>
                <Text style={styles.documentsTitle}>Documents:</Text>
                {technician.technicianProfile?.documents && technician.technicianProfile.documents.length > 0 ? (
                  technician.technicianProfile.documents.map((doc: string, index: number) => (
                    <Text key={index} style={styles.documentLink}>• {doc}</Text>
                  ))
                ) : (
                  <Text style={styles.noDocuments}>No documents uploaded</Text>
                )}
              </View>

              {(technician.technicianProfile?.verificationStatus || 'pending') === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(technician)}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(technician)}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
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
  },
  loadingText: {
    marginTop: 10,
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
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  filterContainer: {
    padding: 15,
  },
  content: {
    padding: 15,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
  technicianCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  technicianName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    width: 100,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  documentsSection: {
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
  },
  documentsTitle: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  documentLink: {
    color: '#0d6efd',
    marginBottom: 3,
  },
  noDocuments: {
    color: '#999',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
