import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ServiceRequestScreen() {
  const router = useRouter();

  const serviceTypes = [
    { id: 'plumbing', name: 'Plumbing', icon: 'water-outline', category: 'plumbing', description: 'Pipe repairs, leaks, installations' },
    { id: 'electrical', name: 'Electrical', icon: 'flash-outline', category: 'electrical', description: 'Wiring, outlets, electrical repairs' },
    { id: 'hvac', name: 'HVAC', icon: 'thermometer-outline', category: 'air_conditioning', description: 'Heating, ventilation, air conditioning' },
    { id: 'appliance', name: 'Appliance Repair', icon: 'construct-outline', category: 'appliance_repair', description: 'Fix household appliances' },
    { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline', category: 'cleaning', description: 'House cleaning, deep cleaning' },
    { id: 'carpentry', name: 'Carpentry', icon: 'hammer-outline', category: 'carpentry', description: 'Wood work, furniture repair' },
    { id: 'painting', name: 'Painting', icon: 'brush-outline', category: 'painting', description: 'Interior and exterior painting' },
    { id: 'gardening', name: 'Gardening', icon: 'leaf-outline', category: 'gardening', description: 'Lawn care, landscaping' },
  ];

  const handleServiceTypeSelect = (service) => {
    // Redirect to the main booking flow with service data
    router.push({
      pathname: '/booking/details',
      params: {
        serviceData: JSON.stringify({
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category
        })
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What service do you need?</Text>
          <Text style={styles.sectionSubtitle}>Select a service to continue with booking</Text>
          
          <View style={styles.serviceGrid}>
            {serviceTypes.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleServiceTypeSelect(service)}
              >
                <View style={styles.serviceIconContainer}>
                  <Ionicons name={service.icon} size={32} color="#007AFF" />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                <View style={styles.serviceAction}>
                  <Text style={styles.serviceActionText}>Book Now</Text>
                  <Ionicons name="arrow-forward" size={16} color="#007AFF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Services Note */}
        <View style={styles.emergencyNote}>
          <Ionicons name="warning-outline" size={24} color="#dc3545" />
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>Need Emergency Service?</Text>
            <Text style={styles.emergencyDescription}>
              For urgent repairs and emergencies, visit our Emergency Services section for faster response times.
            </Text>
            <TouchableOpacity 
              style={styles.emergencyButton}
              onPress={() => router.push('/booking/details?isEmergency=true')}
            >
              <Text style={styles.emergencyButtonText}>Emergency Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#007AFF',
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIconContainer: {
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  serviceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceActionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  emergencyNote: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    marginTop: 20,
  },
  emergencyTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
    marginBottom: 8,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  emergencyButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
