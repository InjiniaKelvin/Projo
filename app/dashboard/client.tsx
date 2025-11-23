import React, { useState, useEffect } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/SimpleAuthContext';
import apiClient from '@/config/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ClientHeader } from '@/components/dashboard/client/Header';
import { ClientStats } from '@/components/dashboard/client/Stats';
import { QuickActions } from '@/components/dashboard/client/QuickActions';
import { RecentBookings } from '@/components/dashboard/client/RecentBookings';
import { PopularServices } from '@/components/dashboard/client/PopularServices';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function ClientDashboard() {
  const { user } = useAuth();
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

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);
      const [bookingsRes, walletRes] = await Promise.all([
        apiClient.get('/bookings/client'),
        apiClient.get('/payments/wallet').catch(() => ({ data: { success: false, data: { balance: 0 } } }))
      ]);
      const bookingsData = bookingsRes.data;
      const walletData = walletRes.data;
      if (bookingsData.success) {
        const bookings = bookingsData.data;
        const active = bookings.filter(b =>
          ['submitted', 'confirmed', 'technician_assigned', 'in_progress'].includes(b.status)
        ).length;
        const completed = bookings.filter(b => b.status === 'completed').length;
        const cancelled = bookings.filter(b => b.status === 'cancelled').length;
        const totalSpent = bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.finalAmount || 0), 0);
        setStats({
          activeBookings: active,
          completedBookings: completed,
          cancelledBookings: cancelled,
          totalSpent: totalSpent,
          walletBalance: walletData.success ? walletData.data.balance : 0
        });
        setRecentBookings(bookings.slice(0, 5));
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setError(error.message || 'Failed to load dashboard data.');
    } finally {
      if (showLoader) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#2196F3" />
          <ThemedText style={styles.loadingText}>Loading your dashboard...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ClientHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#2196F3']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Ionicons name="hand-right" size={24} color="#FF9800" />
            <ThemedText style={styles.welcomeText}>
              {getTimeGreeting()}, {user?.firstName || user?.name || 'Guest'}!
            </ThemedText>
          </View>
          <ThemedText style={styles.welcomeSubtext}>
            What service do you need today?
          </ThemedText>
        </View>

        <ClientStats stats={stats} />
        <QuickActions />
        <RecentBookings bookings={recentBookings} />
        <PopularServices />
        
        {/* Bottom spacing for better scrolling */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
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
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});