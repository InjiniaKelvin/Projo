import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'expo-router';

const services = [
  { name: 'Plumbing', icon: 'water', color: '#2196F3', bg: '#E3F2FD' },
  { name: 'Electrical', icon: 'flash', color: '#FF9800', bg: '#FFF3E0' },
  { name: 'Carpentry', icon: 'hammer', color: '#795548', bg: '#EFEBE9' },
  { name: 'Cleaning', icon: 'sparkles', color: '#4CAF50', bg: '#E8F5E9' },
  { name: 'Painting', icon: 'brush', color: '#9C27B0', bg: '#F3E5F5' },
  { name: 'AC Repair', icon: 'snow', color: '#00BCD4', bg: '#E0F7FA' },
  { name: 'Appliance', icon: 'tv', color: '#F44336', bg: '#FFEBEE' },
  { name: 'Locksmith', icon: 'key', color: '#607D8B', bg: '#ECEFF1' },
];

export function PopularServices() {
  const router = useRouter();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <ThemedText style={styles.sectionTitle}>Popular Services</ThemedText>
        <TouchableOpacity onPress={() => router.push('/booking/redesigned-form')}>
          <ThemedText style={styles.viewAllText}>View All</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.servicesScroll}
        contentContainerStyle={styles.servicesContent}
      >
        {services.map((service) => (
          <TouchableOpacity
            key={service.name}
            style={[styles.serviceCard, { backgroundColor: service.bg }]}
            onPress={() => router.push(`/booking/redesigned-form?service=${service.name.toLowerCase()}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
              <Ionicons name={service.icon} size={28} color="#FFF" />
            </View>
            <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  servicesScroll: {
    marginHorizontal: -4,
  },
  servicesContent: {
    paddingHorizontal: 4,
  },
  serviceCard: {
    width: 100,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
});
