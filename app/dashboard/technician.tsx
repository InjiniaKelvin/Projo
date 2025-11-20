import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/SimpleAuthContext';
import apiClient from '@/config/api';
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';
import { getGreeting } from '@/utils/greetings';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import * as Location from 'expo-location';
import io from 'socket.io-client';

interface Job {
  _id: string;
  serviceType: string;
  description: string;
  status: string;
  estimatedCost?: number;
  location?: {
    address?: string;
  };
  createdAt: string;
}

export default function TechnicianDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [greeting, setGreeting] = useState({ greeting: '', quote: '' });
  const [stats, setStats] = useState({
    walletBalance: 0,
    pendingJobs: 0,
    completedJobs: 0,
    activeJobs: 0,
    rating: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      const greetingData = getGreeting(user);
      setGreeting(greetingData);
    }
    loadDashboardData();

    // WebSocket connection
    socketRef.current = io(API_CONFIG.BASE_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current?.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    // Location tracking
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (location) => {
          socketRef.current?.emit('update_location', {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      return () => {
        locationSubscription.remove();
      };
    })();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, token]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [jobsResponse, earningsResponse] = await Promise.all([
        apiClient.get(API_ENDPOINTS.TECHNICIAN.MY_JOBS).catch(() => ({ data: { success: true, data: { jobs: [] } } })),
        apiClient.get(API_ENDPOINTS.TECHNICIAN.EARNINGS).catch(() => ({ data: { success: true, data: { totalEarnings: 0, completedJobs: 0, activeJobs: 0 } } }))
      ]);

      const jobsData = jobsResponse.data?.data?.jobs || [];
      const earningsData = earningsResponse.data?.data || {};

      const pendingJobsCount = jobsData.filter((j: Job) => j.status === 'pending' || j.status === 'technician_assigned').length;
      const activeJobsCount = jobsData.filter((j: Job) => j.status === 'in_progress').length;
      const completedJobsCount = earningsData.completedJobs || 0;

      setStats({
        walletBalance: earningsData.totalEarnings || 0,
        pendingJobs: pendingJobsCount,
        activeJobs: activeJobsCount,
        completedJobs: completedJobsCount,
        rating: user?.rating?.average || 0
      });

      setJobs(jobsData.filter((j: Job) =>
        j.status === 'pending' ||
        j.status === 'technician_assigned' ||
        j.status === 'in_progress'
      ).slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
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
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText>Loading dashboard...</ThemedText>
      </ThemedView>
    );
  }

  const renderJob = ({ item }: { item: Job }) => (
    <Card style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <ThemedText style={styles.jobTitle}>{item.serviceType}</ThemedText>
        <ThemedText style={styles.jobPrice}>KES {item.estimatedCost || 0}</ThemedText>
      </View>
      <ThemedText style={styles.jobDetails} numberOfLines={2}>{item.description}</ThemedText>
      <ThemedText style={styles.jobAddress} numberOfLines={1}>
        {item.location?.address || 'Location not specified'}
      </ThemedText>
      <View style={styles.jobFooter}>
        <ThemedText style={styles.jobDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </ThemedText>
        <View style={[styles.jobStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <ThemedText style={styles.jobStatusText}>{item.status}</ThemedText>
        </View>
      </View>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9500';
      case 'accepted': return '#007AFF';
      case 'in_progress': return '#32d74b';
      case 'completed': return '#34c759';
      default: return '#666';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Technician Dashboard" showLogout={true} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.welcomeText}>{greeting.greeting}</ThemedText>
          <ThemedText style={styles.userName}>{user?.firstName || 'Technician'}</ThemedText>
          <ThemedText style={styles.quoteText}>&quot;{greeting.quote}&quot;</ThemedText>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="time-outline" size={24} color="#1976D2" />
            <ThemedText style={[styles.statNumber, { color: '#1976D2' }]}>{stats.pendingJobs}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: '#1976D2' }]}>Pending</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="construct-outline" size={24} color="#388E3C" />
            <ThemedText style={[styles.statNumber, { color: '#388E3C' }]}>{stats.activeJobs}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: '#388E3C' }]}>Active</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#F57C00" />
            <ThemedText style={[styles.statNumber, { color: '#F57C00' }]}>{stats.completedJobs}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: '#F57C00' }]}>Done</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="star-outline" size={24} color="#7B1FA2" />
            <ThemedText style={[styles.statNumber, { color: '#7B1FA2' }]}>{(stats.rating || 0).toFixed(1)}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: '#7B1FA2' }]}>Rating</ThemedText>
          </View>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/technician/jobs/browse')}>
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="search" size={24} color="#1976D2" />
            </View>
            <ThemedText style={styles.actionText}>Browse Jobs</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/technician/jobs/my-jobs')}>
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="briefcase" size={24} color="#388E3C" />
            </View>
            <ThemedText style={styles.actionText}>My Jobs</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/wallet')}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="wallet" size={24} color="#F57C00" />
            </View>
            <ThemedText style={styles.actionText}>Earnings</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/technician/profile')}>
            <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="person" size={24} color="#7B1FA2" />
            </View>
            <ThemedText style={styles.actionText}>Profile</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Recent Jobs</ThemedText>
          <TouchableOpacity onPress={() => router.push('/technician/jobs/my-jobs')}>
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
          </TouchableOpacity>
        </View>

        {jobs.length === 0 ? (
          <View style={styles.noJobsContainer}>
            <Ionicons name="briefcase-outline" size={48} color="#ccc" />
            <ThemedText style={styles.noJobs}>No active jobs</ThemedText>
            <ThemedText style={styles.noJobsSubtext}>Check back later for new opportunities</ThemedText>
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item._id}
            renderItem={renderJob}
            scrollEnabled={false}
          />
        )}

        <View style={styles.logoutContainer}>
          <Button title="Logout" onPress={handleLogout} variant="danger" style={styles.logoutButton} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  quoteText: {
    fontSize: 14,
    color: '#0d6efd',
    fontStyle: 'italic',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0d6efd',
    fontWeight: '600',
  },
  noJobsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
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
  },
  jobCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745'
  },
  jobDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  jobAddress: {
    fontSize: 13,
    color: '#555',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  jobDate: {
    fontSize: 12,
    color: '#999'
  },
  jobStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center'
  },
  jobStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  logoutContainer: {
    padding: 20,
  },
  logoutButton: {
    marginTop: 10,
  }
});