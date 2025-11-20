import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';

type StatsProps = {
  stats: {
    activeBookings: number;
    completedBookings: number;
    walletBalance: number;
  };
};

const formatCurrency = (amount) => {
  return `KES ${parseFloat(amount || 0).toLocaleString('en-KE')}`;
};

export function ClientStats({ stats }: StatsProps) {
  return (
    <Card style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="pulse-outline" size={20} color="#FF9800" />
          <ThemedText style={styles.statNumber}>{stats.activeBookings}</ThemedText>
          <ThemedText style={styles.statLabel}>Active</ThemedText>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done-outline" size={20} color="#4CAF50" />
          <ThemedText style={styles.statNumber}>{stats.completedBookings}</ThemedText>
          <ThemedText style={styles.statLabel}>Completed</ThemedText>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={20} color="#6366F1" />
          <ThemedText style={styles.statNumber}>{formatCurrency(stats.walletBalance)}</ThemedText>
          <ThemedText style={styles.statLabel}>Wallet</ThemedText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    marginTop: -20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});
