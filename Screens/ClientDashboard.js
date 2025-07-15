import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    walletBalance: 0,
    pendingPayments: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigateToServiceRequest = () => {
    console.log('🚀 Navigating to service request...');
    try {
      router.push('/services/request');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to service request. Feature coming soon.');
    }
  };

  const handleNavigateToBookings = () => {
    console.log('🚀 Navigating to bookings...');
    try {
      router.push('/bookings');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to bookings. Feature coming soon.');
    }
  };

  const handleNavigateToWallet = () => {
    console.log('🚀 Navigating to wallet...');
    try {
      router.push('/wallet');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to wallet. Feature coming soon.');
    }
  };

  const handleNavigateToMessages = () => {
    console.log('🚀 Navigating to messages...');
    try {
      router.push('/messages');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to messages. Feature coming soon.');
    }
  };

  const handleNavigateToEmergency = () => {
    console.log('🚀 Navigating to emergency service...');
    try {
      router.push('/services/emergency');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Emergency Service', 'Emergency service feature is being developed. For urgent issues, please call emergency services.');
    }
  };

  const handleNavigateToSupport = () => {
    console.log('🚀 Navigating to support...');
    try {
      router.push('/support');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Support', 'Support feature is being developed. Please contact us at support@quickfix.com');
    }
  };

  const handleNavigateToRating = () => {
    console.log('🚀 Navigating to rating...');
    try {
      router.push('/rating');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Rating', 'Rating feature is being developed.');
    }
  };

  const handleLogout = async () => {
    console.log('🚪 handleLogout called - attempting web-compatible confirmation');
    
    // For web compatibility, use confirm() instead of Alert.alert
    const confirmLogout = () => {
      if (typeof window !== 'undefined' && window.confirm) {
        // Web environment - use browser confirm
        return window.confirm('Are you sure you want to logout?');
      } else {
        // Native environment - use Alert.alert
        return new Promise((resolve) => {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Logout', style: 'destructive', onPress: () => resolve(true) }
            ]
          );
        });
      }
    };

    try {
      console.log('🚪 Showing confirmation dialog...');
      const confirmed = await confirmLogout();
      
      if (!confirmed) {
        console.log('🚪 User cancelled logout');
        return;
      }

      console.log('🚪 Logout confirmed by user - initiating logout...');
      console.log('🚪 Current auth state before logout:', { isAuthenticated: user !== null, userExists: !!user });
      
      // Call logout and wait for it to complete
      console.log('🚪 Calling logout function...');
      await logout();
      console.log('🚪 Logout function completed successfully');
      
      // Log router state before navigation
      console.log('🚪 Router object:', router);
      
      // Try immediate navigation first
      console.log('🚪 Attempting immediate navigation to /auth/login...');
      try {
        router.replace('/auth/login');
        console.log('🚪 Immediate navigation successful');
      } catch (navError) {
        console.error('🚪 Immediate navigation failed:', navError);
        
        // Fallback: try with timeout
        setTimeout(() => {
          console.log('🚪 Attempting delayed navigation to /auth/login...');
          try {
            router.replace('/auth/login');
            console.log('🚪 Delayed navigation successful');
          } catch (delayedNavError) {
            console.error('🚪 Delayed navigation also failed:', delayedNavError);
            // Last resort: try push instead of replace
            router.push('/auth/login');
          }
        }, 200);
      }
      
    } catch (error) {
      console.error('🚪 Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userRole}>Client Account</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#dc3545" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="clipboard-outline" size={24} color="#0d6efd" />
          <Text style={styles.statNumber}>{stats.activeBookings}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#198754" />
          <Text style={styles.statNumber}>{stats.completedBookings}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={24} color="#fd7e14" />
          <Text style={styles.statNumber}>KSh {stats.walletBalance}</Text>
          <Text style={styles.statLabel}>Wallet</Text>
        </View>
      </View>

      {/* Main Action Cards */}
      <View style={styles.cardsContainer}>
        {/* Card: Find a Technician */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleNavigateToServiceRequest}
        >
          <Ionicons name="search" size={28} color="#0d6efd" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Find a Technician</Text>
            <Text style={styles.cardSubtitle}>Browse available services</Text>
          </View>
        </TouchableOpacity>

        {/* Card: My Bookings */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleNavigateToBookings}
        >
          <Ionicons name="list" size={28} color="#0d6efd" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Bookings</Text>
            <Text style={styles.cardSubtitle}>View booking history</Text>
          </View>
        </TouchableOpacity>

        {/* Card: Wallet */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleNavigateToWallet}
        >
          <Ionicons name="wallet" size={28} color="#0d6efd" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Wallet</Text>
            <Text style={styles.cardSubtitle}>Manage payments</Text>
          </View>
        </TouchableOpacity>

        {/* Card: Messages */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleNavigateToMessages}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#0d6efd" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Messages</Text>
            <Text style={styles.cardSubtitle}>Chat with technicians</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentBookings.length > 0 ? (
          recentBookings.map((booking, index) => (
            <View key={index} style={styles.activityItem}>
              <Text style={styles.activityText}>{booking.title}</Text>
              <Text style={styles.activityDate}>{booking.date}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={48} color="#6c757d" />
            <Text style={styles.emptyText}>No recent activity</Text>
            <Text style={styles.emptySubtext}>Start by booking a service!</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleNavigateToEmergency}
          >
            <Ionicons name="alert-circle" size={20} color="#dc3545" />
            <Text style={styles.quickActionText}>Emergency</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleNavigateToSupport}
          >
            <Ionicons name="help-circle" size={20} color="#0d6efd" />
            <Text style={styles.quickActionText}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleNavigateToRating}
          >
            <Ionicons name="star" size={20} color="#ffc107" />
            <Text style={styles.quickActionText}>Rate</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.logoutQuickAction]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#dc3545" />
            <Text style={[styles.quickActionText, styles.logoutQuickActionText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#0d6efd',
    marginTop: 2,
  },
  logoutButton: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  logoutText: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '600',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  cardsContainer: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  activityText: {
    fontSize: 16,
    color: '#212529',
  },
  activityDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#212529',
    marginTop: 8,
    fontWeight: '500',
  },
  logoutQuickAction: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  logoutQuickActionText: {
    color: '#dc3545',
    fontWeight: '600',
  },
});
