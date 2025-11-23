import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'expo-router';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    { 
      title: 'Book Service', 
      icon: 'hammer', 
      color: '#2196F3',
      gradient: ['#2196F3', '#1976D2'],
      route: '/booking/redesigned-form' 
    },
    { 
      title: 'Emergency Help', 
      icon: 'flash', 
      color: '#F44336',
      gradient: ['#F44336', '#D32F2F'],
      route: '/booking/redesigned-form?isEmergency=true' 
    },
    { 
      title: 'My Bookings', 
      icon: 'calendar', 
      color: '#9C27B0',
      gradient: ['#9C27B0', '#7B1FA2'],
      route: '/bookings' 
    },
    { 
      title: 'Messages', 
      icon: 'chatbubbles', 
      color: '#FF9800',
      gradient: ['#FF9800', '#F57C00'],
      route: '/messages' 
    },
  ];

  return (
    <Card style={styles.card}>
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
              <Ionicons name={action.icon} size={26} color="#FFF" />
            </View>
            <ThemedText style={styles.actionLabel}>{action.title}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
});
