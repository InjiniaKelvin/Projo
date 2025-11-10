/**
 * QuickFix Client Dashboard - Beautiful UI with Real Data
 * Complete integration with backend APIs
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ClientDashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalSpent: 0,
    walletBalance: 0,
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch data from multiple endpoints
      const [bookingsRes, walletRes] = await Promise.all([
        fetch(`${API_URL}/api/bookings/client`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/payments/wallet`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ json: async () => ({ success: false, data: { balance: 0 } }) }))
      ]);
      
      const bookingsData = await bookingsRes.json();
      const walletData = await walletRes.json();
      
      if (bookingsData.success) {
        const bookings = bookingsData.data;
        
        // Calculate stats
        const active = bookings.filter(b => 
          ['pending', 'confirmed', 'in-progress'].includes(b.status)
        ).length;
        
        const completed = bookings.filter(b => b.status === 'completed').length;
        const cancelled = bookings.filter(b => b.status === 'cancelled').length;
        
        const totalSpent = bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.estimatedCost || 0), 0);
        
        setStats({
          activeBookings: active,
          completedBookings: completed,
          cancelledBookings: cancelled,
          totalSpent: totalSpent,
          walletBalance: walletData.success ? walletData.data.balance : 0
        });
        
        // Get recent bookings (last 5)
        setRecentBookings(bookings.slice(0, 5));
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      'in-progress': '#9C27B0',
      completed: '#4CAF50',
      cancelled: '#FF5252'
    };
    return colors[status] || '#757575';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'time-outline',
      confirmed: 'checkmark-circle-outline',
      'in-progress': 'construct-outline',
      completed: 'checkmark-done-circle',
      cancelled: 'close-circle-outline'
    };
    return icons[status] || 'help-circle-outline';
  };

  const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount || 0).toLocaleString('en-KE')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* Header with Gradient */}
      <LinearGradient colors={['#1976D2', '#2196F3', '#42A5F5']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.activeCard]}>
              <Ionicons name="time" size={32} color="#FF9800" />
              <Text style={styles.statNumber}>{stats.activeBookings}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={[styles.statCard, styles.completedCard]}>
              <Ionicons name="checkmark-done" size={32} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.completedBookings}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.walletCard}
            onPress={() => router.push('/wallet')}
          >
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.walletGradient}>
              <View style={styles.walletLeft}>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <Text style={styles.walletAmount}>{formatCurrency(stats.walletBalance)}</Text>
              </View>
              <Ionicons name="wallet" size={40} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#EF5350' }]}
              onPress={() => router.push('/booking/details')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="flash" size={28} color="#FFF" />
              </View>
              <Text style={styles.actionText}>Emergency{'\n'}Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#42A5F5' }]}
              onPress={() => router.push('/booking/redesigned-form')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="add-circle" size={28} color="#FFF" />
              </View>
              <Text style={styles.actionText}>New{'\n'}Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#66BB6A' }]}
              onPress={() => router.push('/bookings')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="list" size={28} color="#FFF" />
              </View>
              <Text style={styles.actionText}>My{'\n'}Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#AB47BC' }]}
              onPress={() => router.push('/messages')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="chatbubbles" size={28} color="#FFF" />
              </View>
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity onPress={() => router.push('/bookings')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>No bookings yet</Text>
              <TouchableOpacity
                style={styles.createBookingButton}
                onPress={() => router.push('/booking/redesigned-form')}
              >
                <Text style={styles.createBookingButtonText}>Create Your First Booking</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentBookings.map((booking) => (
              <TouchableOpacity
                key={booking._id}
                style={styles.bookingCard}
                onPress={() => router.push(`/booking/${booking._id}`)}
              >
                <View style={styles.bookingHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                    <Ionicons
                      name={getStatusIcon(booking.status)}
                      size={16}
                      color={getStatusColor(booking.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.bookingDate}>{formatDate(booking.createdAt)}</Text>
                </View>

                <Text style={styles.bookingService}>{booking.serviceType}</Text>
                <Text style={styles.bookingLocation} numberOfLines={1}>
                  <Ionicons name="location" size={14} color="#666" />
                  {' '}{booking.location?.ward}, {booking.location?.constituency}
                </Text>

                {booking.estimatedCost && (
                  <Text style={styles.bookingCost}>{formatCurrency(booking.estimatedCost)}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { name: 'Plumbing', icon: 'water', color: '#2196F3' },
              { name: 'Electrical', icon: 'flash', color: '#FF9800' },
              { name: 'Carpentry', icon: 'hammer', color: '#795548' },
              { name: 'Cleaning', icon: 'sparkles', color: '#4CAF50' },
              { name: 'Painting', icon: 'color-palette', color: '#9C27B0' },
            ].map((service) => (
              <TouchableOpacity
                key={service.name}
                style={styles.serviceCard}
                onPress={() => router.push(`/booking/redesigned-form?service=${service.name}`)}
              >
                <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
                  <Ionicons name={service.icon} size={28} color={service.color} />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Emergency FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/booking/details')}
      >
        <LinearGradient colors={['#EF5350', '#F44336']} style={styles.fabGradient}>
          <Ionicons name="flash" size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF5350',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  statsContainer: {
    padding: 16,
    marginTop: -20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  walletCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  walletGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  walletLeft: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  walletAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  actionCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDate: {
    fontSize: 12,
    color: '#999',
  },
  bookingService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  bookingLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookingCost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  createBookingButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createBookingButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceCard: {
    width: 100,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabGradient: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
