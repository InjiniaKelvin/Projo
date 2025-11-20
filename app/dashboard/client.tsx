import React, { useState, useEffect } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
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

export default function ClientDashboard() {
  const { user } = useAuth();
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ClientHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <ClientStats stats={stats} />
        <QuickActions />
        <RecentBookings bookings={recentBookings} />
        <PopularServices />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
});