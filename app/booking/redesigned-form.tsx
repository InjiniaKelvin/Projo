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
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { completeNairobiLocations } from '../../data/completeNairobiLocations';
import { useAuth } from '../../contexts/SimpleAuthContext';

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
  clientPhone2?: string; // Optional alternate phone number
  clientEmail: string;
  serviceType: string;
  serviceDescription: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  location: LocationData;
  preferredDate: string;
  preferredTimeSlot: string;
  specialRequirements: string;
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

export default function RedesignedBookingForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // BOOKING DATA - MATCHING BACKEND STRUCTURE EXACTLY
  const [bookingData, setBookingData] = useState<BookingFormData>({
    // CLIENT DETAILS
    clientName: '',
    clientPhone: '',
    clientPhone2: '', // Optional alternate phone
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
  const [availableWards, setAvailableWards] = useState<any[]>([]);
  const [availableRoads, setAvailableRoads] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Handle booking parameters from navigation (both emergency and regular)
  useEffect(() => {
    if (params) {
      console.log('📋 Loading booking form with params:', params);
      setBookingData(prev => ({
        ...prev,
        serviceType: params.serviceType as string || '',
        // DO NOT autopopulate serviceDescription - let user input it manually
        urgency: params.isEmergency === 'true' ? 'emergency' : 'normal',
        // DO NOT autopopulate specialRequirements from params
      }));
    }
  }, [params]);

  // Auto-populate user data when user context is available
  useEffect(() => {
    if (user) {
      console.log('📋 Auto-populating user data:', user);
      setBookingData(prev => ({
        ...prev,
        clientName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name || '',
        clientPhone: user.phoneNumber || '',
        clientEmail: user.email || ''
      }));
    }
  }, [user]);

  // Handle date selection
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false); // Always close on selection
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      setBookingData(prev => ({ ...prev, preferredDate: formattedDate }));
    }
  };

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
        road: '' // Reset road when constituency changes
      }
    }));
    
    // Get wards for selected constituency using the new complete data
    const constituencyData = completeNairobiLocations.find(c => c.name === constituency);
    setAvailableWards(constituencyData ? constituencyData.wards : []);
    setAvailableRoads([]);
  };

  /**
   * HANDLE WARD CHANGE
   */
  const handleWardChange = (ward: string) => {
    setBookingData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        ward,
        road: '' // Reset road when ward changes
      }
    }));
    
    // Get roads for selected ward
    const constituencyData = completeNairobiLocations.find(c => c.name === selectedConstituency);
    if (constituencyData) {
      const wardData = constituencyData.wards.find(w => w.name === ward);
      setAvailableRoads(wardData ? wardData.roads : []);
    }
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
    } else if (bookingData.preferredDate && bookingData.preferredTimeSlot) {
      // Enhanced time validation - 2-hour minimum advance booking
      const prefDate = new Date(bookingData.preferredDate);
      const now = new Date();
      
      // Parse time slot (format: "09:00-12:00", "14:00-17:00", etc.)
      const timeSlotMatch = bookingData.preferredTimeSlot.match(/(\d{2}):(\d{2})/);
      if (timeSlotMatch) {
        const [, hours, minutes] = timeSlotMatch;
        prefDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Calculate minimum booking time (2 hours from now)
        const minimumBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        if (prefDate < minimumBookingTime && bookingData.urgency !== 'emergency') {
          newErrors.preferredTimeSlot = 'Regular bookings must be scheduled at least 2 hours in advance. For urgent needs, please select emergency booking.';
        }
      }
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
      const response = await fetch('http://localhost:3000/api/bookings-redesigned', {
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
          <Text style={styles.label}>Alternate Phone Number (Optional)</Text>
          <TextInput
            style={styles.input}
            value={bookingData.clientPhone2 || ''}
            onChangeText={(text) => {
              const formatted = formatPhoneNumber(text);
              setBookingData(prev => ({ ...prev, clientPhone2: formatted }));
            }}
            placeholder="0722 123 456 (Optional backup number)"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
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
              {completeNairobiLocations.map((constituency) => (
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
              onValueChange={handleWardChange}
              style={styles.picker}
              enabled={availableWards.length > 0}
            >
              <Picker.Item label="Select ward" value="" />
              {availableWards.map((ward: any) => (
                <Picker.Item key={ward.name} label={ward.name} value={ward.name} />
              ))}
            </Picker>
          </View>
          {errors.ward && <Text style={styles.errorText}>{errors.ward}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Road/Street *</Text>
          <View style={[styles.pickerContainer, errors.road && styles.inputError]}>
            <Picker
              selectedValue={bookingData.location.road}
              onValueChange={(road) => setBookingData(prev => ({
                ...prev,
                location: { ...prev.location, road }
              }))}
              style={styles.picker}
              enabled={availableRoads.length > 0}
            >
              <Picker.Item label={availableRoads.length > 0 ? "Select road" : "Select ward first"} value="" />
              {availableRoads.map((road: string) => (
                <Picker.Item key={road} label={road} value={road} />
              ))}
            </Picker>
          </View>
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
          {Platform.OS === 'web' ? (
            <View style={[styles.datePickerButton, errors.preferredDate && styles.inputError]}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <input
                type="date"
                style={{
                  fontSize: 16,
                  color: '#333',
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: 'inherit'
                }}
                value={bookingData.preferredDate}
                onChange={(e) => setBookingData(prev => ({ ...prev, preferredDate: e.target.value }))}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.datePickerButton, errors.preferredDate && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.datePickerText}>
                  {bookingData.preferredDate || 'Select preferred date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
            </>
          )}
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    gap: 10,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dateInputWeb: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
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
