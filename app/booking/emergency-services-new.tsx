import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface EmergencyService {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  responseTime: string;
  isAvailable24x7: boolean;
  urgencyLevel: 'critical' | 'high' | 'medium';
  priceRange: string;
}

const EMERGENCY_SERVICES: EmergencyService[] = [
  {
    id: 'emergency-vehicle-breakdown',
    name: '🚗 Vehicle Breakdown Rescue',
    description: 'Immediate roadside assistance for broken-down vehicles anywhere in Nairobi',
    icon: 'car-outline',
    category: 'Transport Emergency',
    responseTime: '15-30 minutes',
    isAvailable24x7: true,
    urgencyLevel: 'critical',
    priceRange: 'KSh 2,000 - 8,000'
  },
  {
    id: 'emergency-plumbing',
    name: '🚰 Emergency Plumbing',
    description: 'Urgent plumbing repairs for burst pipes, blocked drains, and water emergencies',
    icon: 'water-outline',
    category: 'Home Emergency',
    responseTime: '20-45 minutes',
    isAvailable24x7: true,
    urgencyLevel: 'high',
    priceRange: 'KSh 1,500 - 5,000'
  },
  {
    id: 'emergency-electrical',
    name: '⚡ Emergency Electrical',
    description: 'Urgent electrical repairs and power restoration services',
    icon: 'flash-outline',
    category: 'Home Emergency',
    responseTime: '30-60 minutes',
    isAvailable24x7: true,
    urgencyLevel: 'critical',
    priceRange: 'KSh 2,000 - 6,000'
  },
  {
    id: 'emergency-locksmith',
    name: '🔐 Emergency Locksmith',
    description: 'Lockout assistance and emergency lock repairs',
    icon: 'key-outline',
    category: 'Security Emergency',
    responseTime: '15-30 minutes',
    isAvailable24x7: true,
    urgencyLevel: 'high',
    priceRange: 'KSh 1,000 - 3,000'
  },
  {
    id: 'emergency-medical-transport',
    name: '🚑 Medical Transport',
    description: 'Emergency medical transportation and first aid assistance',
    icon: 'medical-outline',
    category: 'Medical Emergency',
    responseTime: '10-20 minutes',
    isAvailable24x7: true,
    urgencyLevel: 'critical',
    priceRange: 'KSh 3,000 - 10,000'
  }
];

export default function EmergencyServicesScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  console.log('🚨 EmergencyServicesScreen: Component mounted');
  console.log('🚨 User context:', user ? 'Available' : 'Not available');

  useEffect(() => {
    console.log('🚨 EmergencyServicesScreen: Component loaded');
    setIsLoading(false);
  }, []);

  const handleEmergencyBooking = (service: EmergencyService) => {
    console.log('🚨 Emergency booking initiated for:', service.name);
    
    Alert.alert(
      '🚨 EMERGENCY SERVICE BOOKING',
      `You are about to book "${service.name}"\n\nResponse Time: ${service.responseTime}\nPrice Range: ${service.priceRange}\n\nThis is an EMERGENCY service with priority response.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'BOOK NOW',
          style: 'destructive',
          onPress: () => {
            console.log('🚨 Navigating to booking form with emergency params');
            router.push({
              pathname: '/booking/redesigned-form',
              params: {
                serviceType: service.category,
                serviceName: service.name,
                serviceDescription: service.description,
                urgency: 'emergency',
                isEmergency: 'true',
                priceRange: service.priceRange,
                responseTime: service.responseTime
              }
            });
          }
        }
      ]
    );
  };

  const categories = ['all', ...Array.from(new Set(EMERGENCY_SERVICES.map(s => s.category)))];
  const filteredServices = selectedCategory === 'all' 
    ? EMERGENCY_SERVICES 
    : EMERGENCY_SERVICES.filter(s => s.category === selectedCategory);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Loading Emergency Services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🚨 Emergency Services</Text>
          <Text style={styles.subtitle}>24/7 Priority Response Available</Text>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category === 'all' ? 'All Services' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Emergency Services List */}
        <View style={styles.servicesContainer}>
          {filteredServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                service.urgencyLevel === 'critical' && styles.criticalService
              ]}
              onPress={() => handleEmergencyBooking(service)}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIcon}>
                  <Ionicons name={service.icon as any} size={24} color="#fff" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceCategory}>{service.category}</Text>
                </View>
                <View style={styles.urgencyBadge}>
                  <Text style={styles.urgencyText}>
                    {service.urgencyLevel.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.serviceDescription}>{service.description}</Text>
              
              <View style={styles.serviceDetails}>
                <View style={styles.serviceDetail}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.serviceDetailText}>{service.responseTime}</Text>
                </View>
                <View style={styles.serviceDetail}>
                  <Ionicons name="cash-outline" size={16} color="#666" />
                  <Text style={styles.serviceDetailText}>{service.priceRange}</Text>
                </View>
              </View>
              
              {service.isAvailable24x7 && (
                <View style={styles.availabilityBadge}>
                  <Text style={styles.availabilityText}>24/7 Available</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  categoryButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  servicesContainer: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  criticalService: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#666',
  },
  urgencyBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  urgencyText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 'bold',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  availabilityBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  availabilityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
