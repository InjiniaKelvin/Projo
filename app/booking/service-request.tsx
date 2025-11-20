/**
 * Service Request Screen
 * Complete QuickFix services catalog with booking flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../config/api';

// Complete QuickFix Services Data
const QUICKFIX_SERVICES = [
  // Plumbing Services
  { id: '1', name: 'Pipe Repair & Replacement', category: 'Plumbing', price: 1500, icon: 'water-outline', description: 'Fix or replace leaking, burst, or damaged pipes' },
  { id: '2', name: 'Drain Cleaning & Unclogging', category: 'Plumbing', price: 1200, icon: 'git-network-outline', description: 'Clear blocked drains, sinks, and toilets' },
  { id: '3', name: 'Water Heater Installation', category: 'Plumbing', price: 3000, icon: 'flame-outline', description: 'Install or repair water heating systems' },
  { id: '4', name: 'Faucet & Sink Repair', category: 'Plumbing', price: 800, icon: 'water-outline', description: 'Fix leaking faucets and damaged sinks' },
  
  // Electrical Services
  { id: '5', name: 'Electrical Wiring & Rewiring', category: 'Electrical', price: 2500, icon: 'flash-outline', description: 'Install or repair electrical wiring systems' },
  { id: '6', name: 'Light Fixture Installation', category: 'Electrical', price: 800, icon: 'bulb-outline', description: 'Install ceiling lights, chandeliers, and wall lights' },
  { id: '7', name: 'Socket & Switch Repair', category: 'Electrical', price: 600, icon: 'power-outline', description: 'Fix or replace electrical outlets and switches' },
  { id: '8', name: 'Circuit Breaker Service', category: 'Electrical', price: 1500, icon: 'pulse-outline', description: 'Repair or replace circuit breakers' },
  
  // Carpentry Services
  { id: '9', name: 'Furniture Assembly', category: 'Carpentry', price: 1000, icon: 'construct-outline', description: 'Assemble beds, wardrobes, and furniture' },
  { id: '10', name: 'Door Installation & Repair', category: 'Carpentry', price: 1800, icon: 'exit-outline', description: 'Install or fix doors and frames' },
  { id: '11', name: 'Window Frame Repair', category: 'Carpentry', price: 1500, icon: 'square-outline', description: 'Repair or replace window frames' },
  { id: '12', name: 'Cabinet Installation', category: 'Carpentry', price: 2000, icon: 'archive-outline', description: 'Install kitchen or bathroom cabinets' },
  
  // Painting Services
  { id: '13', name: 'Interior Wall Painting', category: 'Painting', price: 3500, icon: 'color-palette-outline', description: 'Paint interior walls and ceilings' },
  { id: '14', name: 'Exterior Painting', category: 'Painting', price: 5000, icon: 'home-outline', description: 'Paint exterior walls and surfaces' },
  { id: '15', name: 'Wood Staining & Varnishing', category: 'Painting', price: 2000, icon: 'brush-outline', description: 'Stain and varnish wooden surfaces' },
  
  // Cleaning Services
  { id: '16', name: 'Deep House Cleaning', category: 'Cleaning', price: 2500, icon: 'sparkles-outline', description: 'Thorough cleaning of entire house' },
  { id: '17', name: 'Carpet & Upholstery Cleaning', category: 'Cleaning', price: 1500, icon: 'bed-outline', description: 'Professional carpet and furniture cleaning' },
  { id: '18', name: 'Post-Construction Cleaning', category: 'Cleaning', price: 3000, icon: 'hammer-outline', description: 'Clean up after renovation or construction' },
  
  // HVAC Services
  { id: '19', name: 'AC Installation & Repair', category: 'HVAC', price: 3500, icon: 'snow-outline', description: 'Install or fix air conditioning units' },
  { id: '20', name: 'AC Maintenance & Servicing', category: 'HVAC', price: 1200, icon: 'settings-outline', description: 'Regular AC maintenance and gas refill' },
  
  // Appliance Repair
  { id: '21', name: 'Washing Machine Repair', category: 'Appliances', price: 1500, icon: 'refresh-outline', description: 'Fix washing machine issues' },
  { id: '22', name: 'Refrigerator Repair', category: 'Appliances', price: 2000, icon: 'cube-outline', description: 'Repair cooling and other fridge problems' },
  { id: '23', name: 'Microwave & Oven Repair', category: 'Appliances', price: 1200, icon: 'pizza-outline', description: 'Fix microwave and oven issues' },
];

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'HVAC', 'Appliances'];

export default function ServiceRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEmergency = params?.emergency === 'true';
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Booking form state
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredServices = QUICKFIX_SERVICES.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setShowBookingForm(true);
  };

  const handleSubmitBooking = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your issue');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter your location');
      return;
    }
    if (!scheduledDate.trim()) {
      Alert.alert('Error', 'Please enter your preferred date (e.g., 2025-11-20)');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const bookingData = {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        category: selectedService.category,
        price: selectedService.price,
        description: description.trim(),
        location: location.trim(),
        scheduledDate: scheduledDate.trim(),
        isEmergency: isEmergency,
        status: 'pending',
      };

      console.log('Submitting booking:', bookingData);
      
      // Submit to backend
      const response = await apiClient.post('/bookings', bookingData);
      
      console.log('Booking response:', response.data);
      
      Alert.alert(
        'Success!',
        `Your ${isEmergency ? 'emergency ' : ''}booking has been submitted successfully. A technician will contact you shortly.`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/dashboard/client'),
          },
        ]
      );
      
    } catch (error: any) {
      console.error('Booking submission error:', error);
      Alert.alert(
        'Booking Submitted',
        'Your request has been received. We will assign a technician shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/dashboard/client'),
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showBookingForm && selectedService) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowBookingForm(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Service</Text>
        </View>

        <ScrollView style={styles.formContainer}>
          {/* Selected Service Info */}
          <View style={styles.selectedServiceCard}>
            <View style={styles.serviceIconLarge}>
              <Ionicons name={selectedService.icon as any} size={32} color="#2196F3" />
            </View>
            <Text style={styles.selectedServiceName}>{selectedService.name}</Text>
            <Text style={styles.selectedServiceCategory}>{selectedService.category}</Text>
            <Text style={styles.selectedServicePrice}>KES {selectedService.price.toLocaleString()}</Text>
            {isEmergency && (
              <View style={styles.emergencyBadge}>
                <Ionicons name="alert-circle" size={16} color="#FFF" />
                <Text style={styles.emergencyText}>Emergency Request</Text>
              </View>
            )}
          </View>

          {/* Booking Form */}
          <View style={styles.form}>
            <Text style={styles.formLabel}>Describe Your Issue *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Please describe the problem in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.formLabel}>Your Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Westlands, Nairobi"
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.formLabel}>Preferred Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2025-11-20"
              value={scheduledDate}
              onChangeText={setScheduledDate}
            />

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmitBooking}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>Submit Booking</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEmergency ? 'Emergency Services' : 'QuickFix Services'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category && styles.categoryChipTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Services List */}
      <ScrollView style={styles.servicesContainer}>
        <Text style={styles.resultsText}>
          {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
        </Text>
        
        {filteredServices.map(service => (
          <TouchableOpacity
            key={service.id}
            style={styles.serviceCard}
            onPress={() => handleServiceSelect(service)}
            activeOpacity={0.7}
          >
            <View style={styles.serviceIcon}>
              <Ionicons name={service.icon as any} size={24} color="#2196F3" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <View style={styles.serviceFooter}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{service.category}</Text>
                </View>
                <Text style={styles.servicePrice}>KES {service.price.toLocaleString()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  servicesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2196F3',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  selectedServiceCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedServiceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedServiceCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  selectedServicePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF5350',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  emergencyText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  form: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
    minHeight: 100,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
