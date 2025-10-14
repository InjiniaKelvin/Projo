import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';
import BookingService from '../services/BookingService';
import PaymentService from '../services/PaymentService';

export default function TechnicianDashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    walletBalance: 0,
    pendingJobs: 0,
    completedJobs: 0,
    rating: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Navigation handlers for technician-specific features
  const handleBrowseJobs = () => {
    console.log(' TECH: Navigating to browse jobs...');
    try {
      router.push('/technician/jobs/browse');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Browse Jobs', 'Searching for available jobs in your area...');
    }
  };

  const handleMyJobs = () => {
    console.log(' TECH: Navigating to my jobs...');
    try {
      router.push('/technician/jobs/my-jobs');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('My Jobs', 'Viewing your job history and current assignments...');
    }
  };

  const handleEarnings = () => {
    console.log(' TECH: Navigating to earnings...');
    try {
      router.push('/technician/earnings');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Earnings', `Your current balance: KES ${stats.walletBalance.toFixed(2)}\n\nEarnings management feature coming soon!`);
    }
  };

  const handleProfile = () => {
    console.log(' TECH: Navigating to profile...');
    try {
      router.push('/technician/profile');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Profile', 'Manage your skills, availability, and professional profile...');
    }
  };

  const handleJobDetails = (jobId) => {
    console.log(' TECH: Navigating to job details for:', jobId);
    try {
      router.push(`/technician/jobs/${jobId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Job Details', 'Opening job details and client information...');
    }
  };

  const handleQuickAcceptJob = () => {
    console.log(' TECH: Quick accept next available job...');
    Alert.alert(
      'Quick Accept',
      'Accept the next available job in your area?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept Next Job', 
          onPress: () => {
            Alert.alert('Success', 'Looking for the next available job that matches your skills...');
          }
        }
      ]
    );
  };

  const handleUpdateAvailability = () => {
    console.log(' TECH: Update availability status...');
    Alert.alert(
      'Availability Status',
      'Update your work availability:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Available Now', onPress: () => Alert.alert('Status Updated', 'You are now available for new jobs!') },
        { text: 'Busy', onPress: () => Alert.alert('Status Updated', 'Your status is set to busy. No new jobs will be assigned.') },
        { text: 'Off Duty', onPress: () => Alert.alert('Status Updated', 'You are now off duty. Have a great rest!') }
      ]
    );
  };

  const handleEmergencySupport = () => {
    console.log(' TECH: Emergency support...');
    Alert.alert(
      'Emergency Support',
      'Need immediate assistance?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Support', onPress: () => Alert.alert('Calling', 'Connecting to technician support hotline...') },
        { text: 'Report Issue', onPress: () => Alert.alert('Report', 'Opening incident report form...') }
      ]
    );
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load wallet info and bookings in parallel
      const [walletResponse, jobsResponse, statsResponse] = await Promise.all([
        PaymentService.getWallet().catch(() => ({ data: { balance: 0 } })),
        BookingService.getBookings(1, 10, { technician: user?.id, status: 'pending' }).catch(() => ({ data: { docs: [] } })),
        BookingService.getBookingStats().catch(() => ({ data: { completed: 0, pending: 0 } }))
      ]);

      setStats({
        walletBalance: walletResponse.data?.balance || 0,
        pendingJobs: statsResponse.data?.pending || 0,
        completedJobs: statsResponse.data?.completed || 0,
        rating: user?.rating?.average || 0
      });

      setJobs(jobsResponse.data?.docs || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log(' TECH: handleLogout called - attempting web-compatible confirmation');
    
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
      console.log(' TECH: Showing confirmation dialog...');
      const confirmed = await confirmLogout();
      
      if (!confirmed) {
        console.log(' TECH: User cancelled logout');
        return;
      }

      console.log(' TECH: Logout confirmed by user - initiating logout...');
      console.log(' TECH: Current auth state before logout:', { isAuthenticated: user !== null, userExists: !!user });
      
      // Call logout and wait for it to complete
      console.log(' TECH: Calling logout function...');
      await logout();
      console.log(' TECH: Logout function completed successfully');
      
      // Log router state before navigation
      console.log(' TECH: Router object:', router);
      
      // Try immediate navigation first
      console.log(' TECH: Attempting immediate navigation to /auth/login...');
      try {
        router.replace('/auth/login');
        console.log(' TECH: Immediate navigation successful');
      } catch (navError) {
        console.error(' TECH: Immediate navigation failed:', navError);
        
        // Fallback: try with timeout
        setTimeout(() => {
          console.log(' TECH: Attempting delayed navigation to /auth/login...');
          try {
            router.replace('/auth/login');
            console.log(' TECH: Delayed navigation successful');
          } catch (delayedNavError) {
            console.error(' TECH: Delayed navigation also failed:', delayedNavError);
            // Last resort: try push instead of replace
            router.push('/auth/login');
          }
        }, 200);
      }
      
    } catch (error) {
      console.error(' TECH: Logout error:', error);
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

  // Render each job as a list item
  const renderJob = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => handleJobDetails(item._id)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.serviceType}</Text>
        <Text style={styles.jobPrice}>KES {item.estimatedCost || 0}</Text>
      </View>
      <Text style={styles.jobDetails} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.jobAddress} numberOfLines={1}>
         {item.location?.address || 'Location not specified'}
      </Text>
      <View style={styles.jobFooter}>
        <Text style={styles.jobDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <View style={styles.jobStatusContainer}>
          <View style={[styles.jobStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.jobStatusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9500';
      case 'accepted': return '#007AFF';
      case 'in_progress': return '#32d74b';
      case 'completed': return '#34c759';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.userName}>{user?.firstName || 'Technician'}</Text>
          <View style={styles.availabilityContainer}>
            <View style={[styles.availabilityDot, { backgroundColor: '#28a745' }]} />
            <Text style={styles.availabilityText}>Available</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pendingJobs}</Text>
          <Text style={styles.statLabel}>Pending Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completedJobs}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Main Action Cards */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={handleBrowseJobs}
        >
          <Ionicons name="search" size={28} color="#0d6efd" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Browse Jobs</Text>
            <Text style={styles.cardSubtitle}>Find available work near you</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={handleMyJobs}
        >
          <Ionicons name="list" size={28} color="#28a745" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Jobs</Text>
            <Text style={styles.cardSubtitle}>Current & completed assignments</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={handleEarnings}
        >
          <Ionicons name="wallet" size={28} color="#ffc107" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Earnings</Text>
            <Text style={styles.cardSubtitle}>KES {stats.walletBalance.toFixed(2)} available</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={handleProfile}
        >
          <Ionicons name="person" size={28} color="#6f42c1" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Profile & Skills</Text>
            <Text style={styles.cardSubtitle}>Manage availability & expertise</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleQuickAcceptJob}
          >
            <Ionicons name="flash" size={20} color="#28a745" />
            <Text style={styles.quickActionText}>Quick Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleUpdateAvailability}
          >
            <Ionicons name="time" size={20} color="#0d6efd" />
            <Text style={styles.quickActionText}>Availability</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleEmergencySupport}
          >
            <Ionicons name="alert-circle" size={20} color="#dc3545" />
            <Text style={styles.quickActionText}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Jobs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Jobs</Text>
        {jobs.length === 0 ? (
          <View style={styles.noJobsContainer}>
            <Ionicons name="briefcase-outline" size={48} color="#ccc" />
            <Text style={styles.noJobs}>No active jobs</Text>
            <Text style={styles.noJobsSubtext}>Check back later for new opportunities</Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item._id}
            renderItem={renderJob}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f7fa' 
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerLeft: {
    flex: 1
  },
  welcomeText: {
    fontSize: 16,
    color: '#666'
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  availabilityText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500'
  },
  logoutButton: {
    padding: 8
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 8
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d6efd'
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center'
  },
  cardsContainer: {
    padding: 20,
    paddingTop: 0
  },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    marginBottom: 12,
    backgroundColor: '#fff', 
    borderRadius: 12, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardContent: {
    marginLeft: 16,
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  section: {
    margin: 20,
    marginTop: 0
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  quickActionsContainer: {
    margin: 20,
    marginTop: 0
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 80
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
    textAlign: 'center'
  },
  noJobsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 1
  },
  noJobs: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12
  },
  noJobsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center'
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745'
  },
  jobDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  jobAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  jobDate: {
    fontSize: 12,
    color: '#666'
  },
  jobStatusContainer: {
    alignItems: 'flex-end'
  },
  jobStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center'
  },
  jobStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize'
  }
});
