import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import apiClient, { API_ENDPOINTS } from '@/config/api';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

interface Booking {
  _id: string;
  bookingId: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  serviceDescription: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  urgency: 'normal' | 'emergency';
  createdAt: string;
  location: {
    constituency: string;
    ward: string;
    road: string;
  };
  technicianId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface Technician {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  technicianProfile?: {
    specialization?: string;
  };
}

export default function AdminBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('pending');
  
  // Assignment Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/bookings?status=${filter}`);
      if (response.data.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const openAssignModal = async (booking: Booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
    loadTechnicians();
  };

  const loadTechnicians = async () => {
    try {
      setLoadingTechnicians(true);
      // Fetch verified technicians
      const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}?role=technician&verificationStatus=verified&limit=100`);
      if (response.data.users) {
        setTechnicians(response.data.users);
      }
    } catch (error) {
      console.error('Error loading technicians:', error);
      Alert.alert('Error', 'Failed to load technicians');
    } finally {
      setLoadingTechnicians(false);
    }
  };

  const handleAssign = async (technicianId: string) => {
    if (!selectedBooking) return;

    try {
      await apiClient.post(`/admin/bookings/${selectedBooking._id}/assign`, {
        technicianId
      });
      Alert.alert('Success', 'Technician assigned successfully');
      setModalVisible(false);
      loadBookings();
    } catch (error) {
      console.error('Error assigning technician:', error);
      Alert.alert('Error', 'Failed to assign technician');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'assigned': return '#17a2b8';
      case 'in_progress': return '#007bff';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.bookingId}>{item.bookingId}</Text>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.rowText}>{item.clientName} ({item.clientPhone})</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.rowText}>
            {item.location.road}, {item.location.ward}, {item.location.constituency}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="alert-circle-outline" size={16} color={item.urgency === 'emergency' ? '#dc3545' : '#666'} />
          <Text style={[styles.rowText, item.urgency === 'emergency' && { color: '#dc3545', fontWeight: 'bold' }]}>
            {item.urgency.toUpperCase()} Priority
          </Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.serviceDescription}</Text>
        
        {item.technicianId && (
          <View style={styles.assignedTo}>
            <Text style={styles.assignedLabel}>Assigned to:</Text>
            <Text style={styles.assignedValue}>{item.technicianId.firstName} {item.technicianId.lastName}</Text>
          </View>
        )}
      </View>

      {item.status === 'pending' && (
        <TouchableOpacity 
          style={styles.assignButton}
          onPress={() => openAssignModal(item)}
        >
          <Text style={styles.assignButtonText}>Assign Technician</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterContainer}>
        <SegmentedControl
          segments={['pending', 'assigned', 'completed']}
          activeSegment={filter}
          onSegmentChange={setFilter}
        />
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No {filter} bookings found</Text>
            </View>
          ) : null
        }
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0d6efd" />
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Technician</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Select a technician for {selectedBooking?.serviceType}</Text>

            {loadingTechnicians ? (
              <ActivityIndicator size="large" color="#0d6efd" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={technicians}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.technicianItem}
                    onPress={() => handleAssign(item._id)}
                  >
                    <View>
                      <Text style={styles.techName}>{item.firstName} {item.lastName}</Text>
                      <Text style={styles.techSpecialization}>{item.technicianProfile?.specialization || 'General'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                )}
                style={styles.technicianList}
              />
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#0d6efd',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContent: {
    padding: 15,
  },
  card: {
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bookingId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rowText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
  },
  description: {
    marginTop: 8,
    color: '#666',
    fontStyle: 'italic',
    fontSize: 13,
  },
  assignedTo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignedLabel: {
    fontWeight: '600',
    marginRight: 5,
    color: '#555',
  },
  assignedValue: {
    color: '#0d6efd',
    fontWeight: 'bold',
  },
  assignButton: {
    backgroundColor: '#0d6efd',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: '#666',
    marginBottom: 20,
  },
  technicianList: {
    flex: 1,
  },
  technicianItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  techName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  techSpecialization: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
