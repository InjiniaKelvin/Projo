/**
 * REDESIGNED BOOKING FORM - PHONE-BASED CLIENT ID
 * 
 * Simplified, bug-resistant booking form with:
 * 1. Phone number as primary identifier
 * 2. All required fields present
 * 3. Comprehensive validation
 * 4. Direct backend matching
 */

import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { simpleNairobiLocations } from '../../data/simpleLocations';

// TYPE DEFINITIONS
interface LocationData {
  constituency: string;
  ward: string;
  road: string;
  description: string;
  landmarks: string;
}

interface BookingFormData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceType: string;
  serviceDescription: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  location: LocationData;
  preferredDate: string;
  preferredTimeSlot: string;
  specialRequirements: string;
}

interface NairobiWard {
  name: string;
  roads: string[];
}

interface NairobiConstituency {
  name: string;
  wards: NairobiWard[];
}

// SERVICE TYPES - MATCHING BACKEND EXACTLY
const SERVICE_TYPES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'painting', label: 'Painting' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'appliance_repair', label: 'Appliance Repair' },
  { value: 'air_conditioning', label: 'Air Conditioning' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'security_systems', label: 'Security Systems' },
  { value: 'solar_installation', label: 'Solar Installation' },
  { value: 'general_maintenance', label: 'General Maintenance' },
  { value: 'other', label: 'Other' }
];

// TIME SLOTS - MATCHING BACKEND EXACTLY
const TIME_SLOTS = [
  { value: '08:00-10:00', label: '8:00 AM - 10:00 AM' },
  { value: '10:00-12:00', label: '10:00 AM - 12:00 PM' },
  { value: '12:00-14:00', label: '12:00 PM - 2:00 PM' },
  { value: '14:00-16:00', label: '2:00 PM - 4:00 PM' },
  { value: '16:00-18:00', label: '4:00 PM - 6:00 PM' },
  { value: 'flexible', label: 'Flexible' }
];

// URGENCY LEVELS - MATCHING BACKEND EXACTLY
const URGENCY_LEVELS = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' }
];

export default function RedesignedBookingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // BOOKING DATA - MATCHING BACKEND STRUCTURE EXACTLY
  const [bookingData, setBookingData] = useState<BookingFormData>({
    // CLIENT DETAILS
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    
    // SERVICE DETAILS
    serviceType: '',
    serviceDescription: '',
    urgency: 'normal',
    
    // LOCATION
    location: {
      constituency: '',
      ward: '',
      road: '',
      description: '',
      landmarks: ''
    },
    
    // SCHEDULING
    preferredDate: '',
    preferredTimeSlot: '',
    
    // OPTIONAL
    specialRequirements: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [availableWards, setAvailableWards] = useState<NairobiWard[]>([]);

  /**
   * HANDLE CONSTITUENCY CHANGE
   */
  const handleConstituencyChange = (constituency: string) => {
    setSelectedConstituency(constituency);
    setBookingData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        constituency,
        ward: '', // Reset ward when constituency changes
      }
    }));
    
    // Get wards for selected constituency
    const constituencyData = simpleNairobiLocations.constituencies.find((c: NairobiConstituency) => c.name === constituency);
    setAvailableWards(constituencyData ? constituencyData.wards : []);
  };

  /**
   * COMPREHENSIVE FORM VALIDATION
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // CLIENT DETAILS
    if (!bookingData.clientName.trim()) {
      newErrors.clientName = 'Name is required';
    }
    
    if (!bookingData.clientPhone.trim()) {
      newErrors.clientPhone = 'Phone number is required';
    } else if (!isValidKenyanPhone(bookingData.clientPhone)) {
      newErrors.clientPhone = 'Please enter a valid Kenyan phone number';
    }
    
    if (bookingData.clientEmail && !isValidEmail(bookingData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email address';
    }
    
    // SERVICE DETAILS
    if (!bookingData.serviceType) {
      newErrors.serviceType = 'Service type is required';
    }
    
    if (!bookingData.serviceDescription.trim()) {
      newErrors.serviceDescription = 'Service description is required';
    } else if (bookingData.serviceDescription.length < 10) {
      newErrors.serviceDescription = 'Please provide more details (at least 10 characters)';
    }
    
    // LOCATION
    if (!bookingData.location.constituency) {
      newErrors.constituency = 'Constituency is required';
    }
    
    if (!bookingData.location.ward) {
      newErrors.ward = 'Ward is required';
    }
    
    if (!bookingData.location.road.trim()) {
      newErrors.road = 'Road/Street is required';
    }
    
    if (!bookingData.location.description.trim()) {
      newErrors.locationDescription = 'Location description is required';
    }
    
    // SCHEDULING
    if (!bookingData.preferredDate) {
      newErrors.preferredDate = 'Preferred date is required';
    } else {
      const selectedDate = new Date(bookingData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.preferredDate = 'Date cannot be in the past';
      }
    }
    
    if (!bookingData.preferredTimeSlot) {
      newErrors.preferredTimeSlot = 'Time slot is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * SUBMIT BOOKING
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/bookings/redesigned', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        Alert.alert(
          'Booking Submitted!',
          `Your booking has been submitted successfully.\\n\\nBooking ID: ${result.data.bookingId}\\n\\nWe'll contact you at ${result.data.clientPhone} for confirmation.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to booking confirmation or home
                router.replace('/');
              }
            }
          ]
        );
      } else {
        Alert.alert('Submission Failed', result.message || 'Please try again');
      }
      
    } catch (error) {
      console.error('Booking submission error:', error);
      Alert.alert('Network Error', 'Please check your connection and try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * HELPER FUNCTIONS
   */
  const isValidKenyanPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    return /^(254|0)?[17][0-9]{8}$/.test(cleanPhone);
  };
  
  const isValidEmail = (email: string): boolean => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };
  
  const formatPhoneNumber = (phone: string): string => {
    // Auto-format as user types
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    if (cleanPhone.startsWith('0') && cleanPhone.length <= 10) {
      return cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    } else if (cleanPhone.startsWith('254') && cleanPhone.length <= 12) {
      return '+' + cleanPhone.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    }
    return phone;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Book a Service</Text>
      </View>

      {/* CLIENT DETAILS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, errors.clientName && styles.inputError]}
            value={bookingData.clientName}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, clientName: text }))}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
          />
          {errors.clientName && <Text style={styles.errorText}>{errors.clientName}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={[styles.input, errors.clientPhone && styles.inputError]}
            value={bookingData.clientPhone}
            onChangeText={(text) => {
              const formatted = formatPhoneNumber(text);
              setBookingData(prev => ({ ...prev, clientPhone: formatted }));
            }}
            placeholder="0712 345 678 or +254 712 345 678"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
          {errors.clientPhone && <Text style={styles.errorText}>{errors.clientPhone}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={[styles.input, errors.clientEmail && styles.inputError]}
            value={bookingData.clientEmail}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, clientEmail: text }))}
            placeholder="your.email@example.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.clientEmail && <Text style={styles.errorText}>{errors.clientEmail}</Text>}
        </View>
      </View>

      {/* SERVICE DETAILS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Service Type *</Text>
          <View style={[styles.pickerContainer, errors.serviceType && styles.inputError]}>
            <Picker
              selectedValue={bookingData.serviceType}
              onValueChange={(value) => setBookingData(prev => ({ ...prev, serviceType: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Select service type" value="" />
              {SERVICE_TYPES.map(type => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
          {errors.serviceType && <Text style={styles.errorText}>{errors.serviceType}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Service Description *</Text>
          <TextInput
            style={[styles.textArea, errors.serviceDescription && styles.inputError]}
            value={bookingData.serviceDescription}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, serviceDescription: text }))}
            placeholder="Describe what needs to be fixed or done..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.serviceDescription && <Text style={styles.errorText}>{errors.serviceDescription}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Urgency Level</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bookingData.urgency}
              onValueChange={(value) => setBookingData(prev => ({ ...prev, urgency: value }))}
              style={styles.picker}
            >
              {URGENCY_LEVELS.map(level => (
                <Picker.Item key={level.value} label={level.label} value={level.value} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* LOCATION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Constituency *</Text>
          <View style={[styles.pickerContainer, errors.constituency && styles.inputError]}>
            <Picker
              selectedValue={selectedConstituency}
              onValueChange={handleConstituencyChange}
              style={styles.picker}
            >
              <Picker.Item label="Select constituency" value="" />
              {simpleNairobiLocations.constituencies.map((constituency: NairobiConstituency) => (
                <Picker.Item 
                  key={constituency.name} 
                  label={constituency.name} 
                  value={constituency.name} 
                />
              ))}
            </Picker>
          </View>
          {errors.constituency && <Text style={styles.errorText}>{errors.constituency}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ward *</Text>
          <View style={[styles.pickerContainer, errors.ward && styles.inputError]}>
            <Picker
              selectedValue={bookingData.location.ward}
              onValueChange={(value) => setBookingData(prev => ({
                ...prev,
                location: { ...prev.location, ward: value }
              }))}
              style={styles.picker}
              enabled={availableWards.length > 0}
            >
              <Picker.Item label="Select ward" value="" />
              {availableWards.map((ward: NairobiWard) => (
                <Picker.Item key={ward.name} label={ward.name} value={ward.name} />
              ))}
            </Picker>
          </View>
          {errors.ward && <Text style={styles.errorText}>{errors.ward}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Road/Street *</Text>
          <TextInput
            style={[styles.input, errors.road && styles.inputError]}
            value={bookingData.location.road}
            onChangeText={(text) => setBookingData(prev => ({
              ...prev,
              location: { ...prev.location, road: text }
            }))}
            placeholder="Enter road or street name"
            placeholderTextColor="#999"
          />
          {errors.road && <Text style={styles.errorText}>{errors.road}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location Description *</Text>
          <TextInput
            style={[styles.textArea, errors.locationDescription && styles.inputError]}
            value={bookingData.location.description}
            onChangeText={(text) => setBookingData(prev => ({
              ...prev,
              location: { ...prev.location, description: text }
            }))}
            placeholder="Describe the exact location (e.g., apartment number, building name, etc.)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {errors.locationDescription && <Text style={styles.errorText}>{errors.locationDescription}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Landmarks (Optional)</Text>
          <TextInput
            style={styles.input}
            value={bookingData.location.landmarks}
            onChangeText={(text) => setBookingData(prev => ({
              ...prev,
              location: { ...prev.location, landmarks: text }
            }))}
            placeholder="Nearby landmarks or notable features"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* SCHEDULING */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scheduling</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Date *</Text>
          <TextInput
            style={[styles.input, errors.preferredDate && styles.inputError]}
            value={bookingData.preferredDate}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, preferredDate: text }))}
            placeholder="YYYY-MM-DD (e.g., 2024-12-25)"
            placeholderTextColor="#999"
          />
          {errors.preferredDate && <Text style={styles.errorText}>{errors.preferredDate}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Time Slot *</Text>
          <View style={[styles.pickerContainer, errors.preferredTimeSlot && styles.inputError]}>
            <Picker
              selectedValue={bookingData.preferredTimeSlot}
              onValueChange={(value) => setBookingData(prev => ({ ...prev, preferredTimeSlot: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Select time slot" value="" />
              {TIME_SLOTS.map(slot => (
                <Picker.Item key={slot.value} label={slot.label} value={slot.value} />
              ))}
            </Picker>
          </View>
          {errors.preferredTimeSlot && <Text style={styles.errorText}>{errors.preferredTimeSlot}</Text>}
        </View>
      </View>

      {/* ADDITIONAL REQUIREMENTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Special Requirements (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={bookingData.specialRequirements}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, specialRequirements: text }))}
            placeholder="Any special requirements or additional information..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* SUBMIT BUTTON */}
      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.submitButtonText}>Submit Booking</Text>
          </>
        )}
      </TouchableOpacity>
      
      <View style={styles.bottomPadding} />
    </ScrollView>
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
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 80,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});
