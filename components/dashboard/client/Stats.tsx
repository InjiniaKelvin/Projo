import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

type StatsProps = {
  stats: {
    activeBookings: number;
    completedBookings: number;
    walletBalance: number;
  };
};

const formatCurrency = (amount) => {
  return `KES ${parseFloat(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export function ClientStats({ stats }: StatsProps) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="hourglass-outline" size={28} color="#1976D2" />
          </View>
          <ThemedText style={[styles.statNumber, { color: '#1976D2' }]}>{stats.activeBookings}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: '#1565C0' }]}>Active Bookings</ThemedText>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-done-circle" size={28} color="#388E3C" />
          </View>
          <ThemedText style={[styles.statNumber, { color: '#388E3C' }]}>{stats.completedBookings}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: '#2E7D32' }]}>Completed Jobs</ThemedText>
        </View>
      </View>
      
      <View style={[styles.walletCard]}>
        <View style={styles.walletLeft}>
          <View style={[styles.walletIcon, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="wallet" size={24} color="#FFF" />
          </View>
          <View style={styles.walletInfo}>
            <ThemedText style={styles.walletLabel}>Wallet Balance</ThemedText>
            <ThemedText style={styles.walletAmount}>{formatCurrency(stats.walletBalance)}</ThemedText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    marginTop: -30,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletInfo: {
    justifyContent: 'center',
  },
  walletLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  walletAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
