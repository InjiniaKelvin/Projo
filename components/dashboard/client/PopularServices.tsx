import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'expo-router';

const services = [
  { name: 'Plumbing', icon: 'water', color: '#2196F3' },
  { name: 'Electrical', icon: 'flash', color: '#FF9800' },
  { name: 'Carpentry', icon: 'hammer', color: '#795548' },
  { name: 'Cleaning', icon: 'sparkles', color: '#4CAF50' },
  { name: 'Painting', icon: 'brush', color: '#9C27B0' },
  { name: 'AC Repair', icon: 'thermometer', color: '#00BCD4' },
];

export function PopularServices() {
  const router = useRouter();

  return (
    <Card>
      <ThemedText style={styles.sectionTitle}>Popular Services</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.name}
            style={styles.serviceCard}
            onPress={() => router.push(`/booking/service-selection?service=${service.name.toLowerCase()}`)}
          >
            <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
              <Ionicons name={service.icon} size={22} color={service.color} />
            </View>
            <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  servicesScroll: {
    marginTop: 12,
  },
  serviceCard: {
    width: 85,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
