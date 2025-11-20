import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'expo-router';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    { title: 'Find Technician', icon: 'search', color: '#2196F3', route: '/booking/redesigned-form' },
    { title: 'Emergency', icon: 'alert-circle', color: '#EF5350', route: '/booking/redesigned-form?isEmergency=true' },
    { title: 'My Bookings', icon: 'file-tray-stacked-outline', color: '#78909C', route: '/bookings' },
    { title: 'Wallet', icon: 'wallet', color: '#78909C', route: '/wallet' },
    { title: 'Messages', icon: 'chatbubbles', color: '#FFA726', route: '/messages' },
    { title: 'History', icon: 'archive-outline', color: '#78909C', route: '/bookings?filter=completed' },
  ];

  return (
    <Card>
      <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
      <View style={styles.quickActionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.actionButton}
            onPress={() => router.push(action.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={20} color="#FFF" />
            </View>
            <ThemedText style={styles.actionLabel}>{action.title}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '32%',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
