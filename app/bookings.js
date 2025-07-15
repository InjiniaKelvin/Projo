import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

export default function BookingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'cancelled'
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data - in a real app, this would come from an API
  const [bookings] = useState([
    {
      id: '1',
      service: 'Plumbing Repair',
      technician: 'John Doe',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'active',
      location: 'Nairobi, Kenya',
      amount: 2500,
    },
    {
      id: '2',
      service: 'AC Installation',
      technician: 'Jane Smith',
      date: '2024-01-10',
      time: '2:00 PM',
      status: 'completed',
      location: 'Mombasa, Kenya',
      amount: 8000,
    },
    {
      id: '3',
      service: 'Electrical Wiring',
      technician: 'Mike Johnson',
      date: '2024-01-05',
      time: '9:00 AM',
      status: 'cancelled',
      location: 'Kisumu, Kenya',
      amount: 5500,
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getFilteredBookings = () => {
    return bookings.filter(booking => booking.status === activeTab);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#0d6efd';
      case 'completed': return '#198754';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'time-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const renderBookingCard = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.serviceTitle}>{item.service}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color="#fff" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#6c757d" />
          <Text style={styles.detailText}>{item.technician}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6c757d" />
          <Text style={styles.detailText}>{item.date} at {item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6c757d" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="wallet-outline" size={16} color="#6c757d" />
          <Text style={styles.detailText}>KSh {item.amount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.bookingActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        {item.status === 'active' && (
          <TouchableOpacity style={[styles.actionButton, styles.chatButton]}>
            <Ionicons name="chatbubble-outline" size={16} color="#0d6efd" />
            <Text style={[styles.actionButtonText, styles.chatButtonText]}>Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="clipboard-outline" size={64} color="#6c757d" />
      <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'active' 
          ? 'Book a service to see your active bookings here'
          : `You don't have any ${activeTab} bookings yet`
        }
      </Text>
      {activeTab === 'active' && (
        <TouchableOpacity 
          style={styles.createBookingButton}
          onPress={() => router.push('/services/request')}
        >
          <Text style={styles.createBookingText}>Find a Technician</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['active', 'completed', 'cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <FlatList
        data={getFilteredBookings()}
        renderItem={renderBookingCard}
        keyExtractor={item => item.id}
        style={styles.bookingsList}
        contentContainerStyle={styles.bookingsContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  placeholder: {
    width: 39,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#0d6efd',
  },
  tabText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0d6efd',
    fontWeight: '600',
  },
  bookingsList: {
    flex: 1,
  },
  bookingsContent: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    marginRight: 10,
  },
  chatButton: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    borderColor: '#0d6efd',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  chatButtonText: {
    color: '#0d6efd',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  createBookingButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createBookingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
