import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, View, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Ionicons } from '@expo/vector-icons';
import apiClient, { API_ENDPOINTS } from '@/config/api';

export default function AdminDashboard() {
  const [pendingTechnicians, setPendingTechnicians] = useState(0);
  const [stats, setStats] = useState({
    users: 0,
    payments: 0,
    inventory: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const loadDashboardData = useCallback(async () => {
    try {
      const [pendingRes, statsRes] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.ADMIN.PENDING_TECHNICIANS),
        apiClient.get(API_ENDPOINTS.ADMIN.SYSTEM_STATS)
      ]);

      if (pendingRes.status === 'fulfilled' && pendingRes.value.data.success) {
        setPendingTechnicians(pendingRes.value.data.count || pendingRes.value.data.data?.length || 0);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };



  const AdminActionCard = ({ title, icon, color, onPress, badge }: any) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <ThemedText style={styles.actionTitle}>{title}</ThemedText>
      {badge > 0 && (
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{badge}</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Admin Dashboard" 
        canGoBack={false} 
        showNotifications={false} 
        showLogout={true} 
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeSection}>
          <View>
            <ThemedText style={styles.welcomeText}>Welcome Back,</ThemedText>
            <ThemedText style={styles.adminName}>Administrator</ThemedText>
          </View>
          <View style={styles.adminAvatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Management</ThemedText>
          <View style={styles.grid}>
            <AdminActionCard
              title="Vet Technicians"
              icon="shield-checkmark"
              color="#4CAF50"
              onPress={() => router.push('/admin/technicians')}
              badge={pendingTechnicians}
            />
            <AdminActionCard
              title="Bookings"
              icon="calendar"
              color="#FF5722"
              onPress={() => router.push('/admin/bookings')}
            />
            <AdminActionCard
              title="Users"
              icon="people"
              color="#2196F3"
              onPress={() => router.push('/admin/users')}
              badge={stats.users}
            />
            <AdminActionCard
              title="Payments"
              icon="card"
              color="#9C27B0"
              onPress={() => router.push('/admin/payments')}
              badge={stats.payments}
            />
            <AdminActionCard
              title="Inventory"
              icon="cube"
              color="#FF9800"
              onPress={() => router.push('/admin/inventory')}
              badge={stats.inventory}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>System</ThemedText>
          <View style={styles.grid}>
            <AdminActionCard
              title="Finances"
              icon="wallet"
              color="#009688"
              onPress={() => router.push('/wallet')}
            />
            <AdminActionCard
              title="Analytics"
              icon="bar-chart"
              color="#3F51B5"
              onPress={() => router.push('/admin/analytics')}
            />
            <AdminActionCard
              title="Settings"
              icon="settings"
              color="#607D8B"
              onPress={() => router.push('/admin/settings')}
            />
          </View>
        </View>


      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  adminName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutContainer: {
    padding: 20,
    marginTop: 10,
  },
});