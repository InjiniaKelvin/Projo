import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';

export default function ServiceRequestScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    location: '',
    urgency: 'normal',
    preferredDate: '',
    preferredTime: '',
    budget: ''
  });

  const serviceTypes = [
    { id: 'plumbing', name: 'Plumbing', icon: 'water-outline' },
    { id: 'electrical', name: 'Electrical', icon: 'flash-outline' },
    { id: 'hvac', name: 'HVAC', icon: 'thermometer-outline' },
    { id: 'appliance', name: 'Appliance Repair', icon: 'construct-outline' },
    { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline' },
    { id: 'carpentry', name: 'Carpentry', icon: 'hammer-outline' },
    { id: 'painting', name: 'Painting', icon: 'brush-outline' },
    { id: 'gardening', name: 'Gardening', icon: 'leaf-outline' },
  ];

  const urgencyLevels = [
    { id: 'low', name: 'Low', color: '#198754', description: 'Within a week' },
    { id: 'normal', name: 'Normal', color: '#0d6efd', description: 'Within 2-3 days' },
    { id: 'high', name: 'High', color: '#fd7e14', description: 'Within 24 hours' },
    { id: 'urgent', name: 'Urgent', color: '#dc3545', description: 'ASAP' },
  ];

  const handleServiceTypeSelect = (serviceType) => {
    setFormData(prev => ({ ...prev, serviceType }));
  };

  const handleUrgencySelect = (urgency) => {
    setFormData(prev => ({ ...prev, urgency }));
  };

  const handleSubmit = async () => {
    if (!formData.serviceType) {
      Alert.alert('Error', 'Please select a service type');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please describe your service request');
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please provide your location');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Request Submitted!',
        'Your service request has been submitted. You will receive notifications when technicians respond.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What service do you need?</Text>
          <View style={styles.serviceGrid}>
            {serviceTypes.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  formData.serviceType === service.id && styles.selectedServiceCard
                ]}
                onPress={() => handleServiceTypeSelect(service.id)}
              >
                <Ionicons 
                  name={service.icon} 
                  size={24} 
                  color={formData.serviceType === service.id ? '#fff' : '#0d6efd'} 
                />
                <Text style={[
                  styles.serviceCardText,
                  formData.serviceType === service.id && styles.selectedServiceCardText
                ]}>
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe your problem</Text>
          <TextInput
            style={styles.textArea}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Please describe what needs to be fixed or done..."
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{formData.description.length}/500</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your location</Text>
          <TextInput
            style={styles.textInput}
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            placeholder="Enter your address or area..."
          />
        </View>

        {/* Urgency Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How urgent is this?</Text>
          <View style={styles.urgencyContainer}>
            {urgencyLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.urgencyCard,
                  formData.urgency === level.id && styles.selectedUrgencyCard,
                  { borderColor: level.color }
                ]}
                onPress={() => handleUrgencySelect(level.id)}
              >
                <Text style={[
                  styles.urgencyName,
                  { color: level.color },
                  formData.urgency === level.id && styles.selectedUrgencyName
                ]}>
                  {level.name}
                </Text>
                <Text style={[
                  styles.urgencyDescription,
                  formData.urgency === level.id && styles.selectedUrgencyDescription
                ]}>
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferred Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred schedule (optional)</Text>
          <View style={styles.scheduleContainer}>
            <TextInput
              style={[styles.textInput, styles.scheduleInput]}
              value={formData.preferredDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, preferredDate: text }))}
              placeholder="Date (YYYY-MM-DD)"
            />
            <TextInput
              style={[styles.textInput, styles.scheduleInput]}
              value={formData.preferredTime}
              onChangeText={(text) => setFormData(prev => ({ ...prev, preferredTime: text }))}
              placeholder="Time (HH:MM)"
            />
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated budget (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.budget}
            onChangeText={(text) => setFormData(prev => ({ ...prev, budget: text }))}
            placeholder="Budget in KSh"
            keyboardType="numeric"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d6efd',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  placeholder: {
    width: 39,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedServiceCard: {
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
  },
  serviceCardText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  selectedServiceCardText: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
  },
  urgencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  urgencyCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  selectedUrgencyCard: {
    backgroundColor: '#f8f9fa',
  },
  urgencyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedUrgencyName: {
    color: '#333',
  },
  urgencyDescription: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  selectedUrgencyDescription: {
    color: '#495057',
  },
  scheduleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleInput: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#0d6efd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
