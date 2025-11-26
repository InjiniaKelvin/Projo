import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="hourglass-outline" size={24} color="#1976D2" />
          </View>
          <ThemedText style={[styles.statNumber, { color: '#1976D2' }]}>{stats.activeBookings}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: '#1565C0' }]}>Active Bookings</ThemedText>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-done-circle" size={24} color="#388E3C" />
          </View>
          <ThemedText style={[styles.statNumber, { color: '#388E3C' }]}>{stats.completedBookings}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: '#2E7D32' }]}>Completed Jobs</ThemedText>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.walletCard]}
        onPress={() => router.push('/wallet')}
        activeOpacity={0.7}
      >
        <View style={styles.walletLeft}>
          <View style={[styles.walletIcon, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="wallet" size={18} color="#FFF" />
          </View>
          <View style={styles.walletInfo}>
            <ThemedText style={styles.walletLabel}>Wallet Balance</ThemedText>
            <ThemedText style={styles.walletAmount}>{formatCurrency(stats.walletBalance)}</ThemedText>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    marginTop: -5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: {
    justifyContent: 'center',
  },
  walletLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 1,
  },
  walletAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    marginTop: -10,
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
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
