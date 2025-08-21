import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
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

// Emergency services data (moved outside component to avoid re-renders)
const comprehensiveEmergencyServices: EmergencyService[] = [
  // **CRITICAL TRANSPORT EMERGENCIES**
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
    id: 'emergency-motorcycle-rescue',
      name: '🏍️ Motorcycle Emergency Service',
      description: 'Fast response for motorcycle breakdowns, accidents, and mechanical failures',
      icon: 'bicycle-outline',
      category: 'Transport Emergency',
      responseTime: '10-20 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'critical',
      priceRange: 'KSh 1,500 - 5,000'
    },
    {
      id: 'emergency-tire-change',
      name: '🛞 Emergency Tire Replacement',
      description: 'Flat tire? We come to you with tools and spare tires',
      icon: 'disc-outline',
      category: 'Transport Emergency',
      responseTime: '15-25 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'high',
      priceRange: 'KSh 1,000 - 3,500'
    },
    {
      id: 'emergency-battery-jumpstart',
      name: '🔋 Battery Jump Start Service',
      description: 'Dead battery? Professional jump start and battery replacement',
      icon: 'battery-dead-outline',
      category: 'Transport Emergency',
      responseTime: '10-20 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'high',
      priceRange: 'KSh 800 - 4,000'
    },
    {
      id: 'emergency-fuel-delivery',
      name: '⛽ Emergency Fuel Delivery',
      description: 'Out of fuel? We deliver petrol/diesel to your location',
      icon: 'car-outline',
      category: 'Transport Emergency',
      responseTime: '20-35 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'high',
      priceRange: 'KSh 500 + fuel cost'
    },
    {
      id: 'emergency-towing',
      name: '🚛 Emergency Towing Service',
      description: 'Vehicle cannot be repaired on-site? Professional towing available',
      icon: 'car-outline',
      category: 'Transport Emergency',
      responseTime: '30-45 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'critical',
      priceRange: 'KSh 3,000 - 15,000'
    },

    // **CRITICAL HOME EMERGENCIES**
    {
      id: 'emergency-plumbing',
      name: '🚰 Emergency Plumbing Crisis',
      description: 'Burst pipes, flooding, sewage backup - immediate response',
      icon: 'water-outline',
      category: 'Home Emergency',
      responseTime: '20-40 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'critical',
      priceRange: 'KSh 2,500 - 12,000'
    },
    {
      id: 'emergency-electrical',
      name: '⚡ Emergency Electrical Crisis',
      description: 'Power outages, sparking outlets, electrical fires - urgent repair',
      icon: 'flash-outline',
      category: 'Home Emergency',
      responseTime: '25-45 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'critical',
      priceRange: 'KSh 2,000 - 10,000'
    },
    {
      id: 'emergency-lockout',
      name: '🔐 Emergency Lockout Service',
      description: 'Locked out of home, office, or car? Professional lock opening',
      icon: 'key-outline',
      category: 'Security Emergency',
      responseTime: '15-30 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'high',
      priceRange: 'KSh 1,500 - 6,000'
    },
    {
      id: 'emergency-security-repair',
      name: '🛡️ Emergency Security Breach',
      description: 'Broken doors, windows, locks after break-in - immediate securing',
      icon: 'shield-outline',
      category: 'Security Emergency',
      responseTime: '20-35 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'critical',
      priceRange: 'KSh 2,000 - 8,000'
    },
    {
      id: 'emergency-gas-leak',
      name: '💨 Gas Leak Emergency',
      description: 'Gas leak detection and immediate repair - life-threatening situations',
      icon: 'warning-outline',
      category: 'Safety Emergency',
      responseTime: '15-25 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'critical',
      priceRange: 'KSh 3,000 - 15,000'
    },

    // **BUSINESS EMERGENCIES**
    {
      id: 'emergency-generator',
      name: '🔌 Emergency Generator Service',
      description: 'Generator breakdown during blackout? Immediate repair or replacement',
      icon: 'battery-charging-outline',
      category: 'Business Emergency',
      responseTime: '30-60 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'high',
      priceRange: 'KSh 4,000 - 20,000'
    },
    {
      id: 'emergency-aircon-breakdown',
      name: '❄️ Critical AC System Failure',
      description: 'AC breakdown in server rooms, medical facilities, or during extreme heat',
      icon: 'snow-outline',
      category: 'Business Emergency',
      responseTime: '45-90 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'high',
      priceRange: 'KSh 3,500 - 18,000'
    },
    {
      id: 'emergency-internet-network',
      name: '🌐 Emergency Network Outage',
      description: 'Critical business internet/network failure - immediate restoration',
      icon: 'wifi-outline',
      category: 'Business Emergency',
      responseTime: '30-60 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'high',
      priceRange: 'KSh 2,500 - 12,000'
    },

    // **WATER & SANITATION EMERGENCIES**
    {
      id: 'emergency-water-supply',
      name: '💧 Emergency Water System Crisis',
      description: 'No water supply, pump failure, tank overflow - immediate response',
      icon: 'water-outline',
      category: 'Water Emergency',
      responseTime: '30-50 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'critical',
      priceRange: 'KSh 2,000 - 10,000'
    },
    {
      id: 'emergency-septic-overflow',
      name: '🚽 Septic/Sewage Emergency',
      description: 'Septic overflow, blocked sewage lines - health hazard response',
      icon: 'warning-outline',
      category: 'Sanitation Emergency',
      responseTime: '25-45 minutes',
      isAvailable24x7: true,
      urgencyLevel: 'critical',
      priceRange: 'KSh 3,000 - 15,000'
  }
];

const EmergencyServicesScreen = () => {
  const { user } = useAuth();
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug logging for authentication
  useEffect(() => {
    console.log('🚨 EmergencyServicesScreen: Component mounted');
    console.log('🚨 User context:', user ? 'Available' : 'Not available');
  }, [user]);

  useEffect(() => {
    setEmergencyServices(comprehensiveEmergencyServices);
    setIsLoading(false);
  }, []);  const handleEmergencyBooking = (service: EmergencyService) => {
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
            router.push({
              pathname: '/booking/details',
              params: {
                serviceId: service.id,
                serviceName: service.name,
                serviceDescription: service.description,
                responseTime: service.responseTime,
                priceRange: service.priceRange,
                urgencyLevel: service.urgencyLevel,
                category: service.category,
                isEmergency: 'true'
              }
            });
          }
        }
      ]
    );
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Transport')) return 'car-outline';
    if (category.includes('Home')) return 'home-outline';
    if (category.includes('Business')) return 'business-outline';
    if (category.includes('Security')) return 'shield-outline';
    if (category.includes('Safety')) return 'warning-outline';
    if (category.includes('Water')) return 'water-outline';
    if (category.includes('Sanitation')) return 'medical-outline';
    return 'flash-outline';
  };

  const groupedServices = emergencyServices.reduce((groups, service) => {
    const category = service.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(service);
    return groups;
  }, {} as Record<string, EmergencyService[]>);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading Emergency Services...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚨 EMERGENCY SERVICES</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.emergencyBanner}>
        <Ionicons name="warning" size={24} color="#dc2626" />
        <Text style={styles.bannerText}>
          24/7 Emergency Response • Priority Dispatch • Trained Professionals
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedServices).map(([category, services]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons 
                name={getCategoryIcon(category)} 
                size={20} 
                color="#dc2626" 
              />
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>

            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  { borderLeftColor: getUrgencyColor(service.urgencyLevel) }
                ]}
                onPress={() => handleEmergencyBooking(service)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <View style={styles.urgencyBadge}>
                    <Text 
                      style={[
                        styles.urgencyText,
                        { color: getUrgencyColor(service.urgencyLevel) }
                      ]}
                    >
                      {service.urgencyLevel.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.serviceDescription}>{service.description}</Text>

                <View style={styles.serviceDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>{service.responseTime}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>{service.priceRange}</Text>
                  </View>
                  {service.isAvailable24x7 && (
                    <View style={styles.detailItem}>
                      <Ionicons name="shield-checkmark" size={16} color="#059669" />
                      <Text style={[styles.detailText, { color: '#059669' }]}>24/7</Text>
                    </View>
                  )}
                </View>

                <View style={styles.bookingButton}>
                  <Text style={styles.bookingButtonText}>BOOK EMERGENCY</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 45,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '600',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginVertical: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  bookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookingButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
});

export default EmergencyServicesScreen;
