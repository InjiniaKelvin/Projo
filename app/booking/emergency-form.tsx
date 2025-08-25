/**
 * EMERGENCY BOOKING FORM
 * 
 * Dedicated form for emergency services with:
 * 1. Pre-filled urgency and service type
 * 2. Streamlined for quick booking
 * 3. All location data with complete Nairobi mapping
 * 4. Auto-populated user data
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

interface EmergencyBookingFormData {
  clientName: string;
  clientPhone: string;
  clientPhone2?: string;
  clientEmail: string;
  serviceType: string;
  serviceDescription: string;
  urgency: 'emergency';
  location: LocationData;
  preferredDate: string;
  preferredTimeSlot: string;
  emergencyNotes: string;
}

// TIME SLOTS - EMERGENCY AVAILABLE 24/7
const EMERGENCY_TIME_SLOTS = [
  { value: 'immediate', label: 'ASAP - Emergency Response' },
  { value: '08:00-10:00', label: '8:00 AM - 10:00 AM' },
  { value: '10:00-12:00', label: '10:00 AM - 12:00 PM' },
  { value: '12:00-14:00', label: '12:00 PM - 2:00 PM' },
  { value: '14:00-16:00', label: '2:00 PM - 4:00 PM' },
  { value: '16:00-18:00', label: '4:00 PM - 6:00 PM' },
  { value: '18:00-20:00', label: '6:00 PM - 8:00 PM' },
  { value: 'any-time', label: 'Any Time - 24/7 Available' }
];

export default function EmergencyBookingForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // EMERGENCY BOOKING DATA
  const [bookingData, setBookingData] = useState<EmergencyBookingFormData>({
    clientName: '',
    clientPhone: '',
    clientPhone2: '',
    clientEmail: '',
    serviceType: '',
    serviceDescription: '',
    urgency: 'emergency',
    location: {
      constituency: '',
      ward: '',
      road: '',
      description: '',
      landmarks: ''
    },
    preferredDate: new Date().toISOString().split('T')[0], // Default to today
    preferredTimeSlot: 'immediate', // Default to immediate
    emergencyNotes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [availableWards, setAvailableWards] = useState<any[]>([]);
  const [availableRoads, setAvailableRoads] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Handle emergency service parameters from navigation
  useEffect(() => {
    if (params) {
      console.log('🚨 Loading emergency booking form with params:', params);
      setBookingData(prev => ({
        ...prev,
        serviceType: params.serviceType as string || '',
        // Don't auto-populate serviceDescription - let user describe their emergency
        emergencyNotes: params.serviceName ? `Emergency Service: ${params.serviceName}` : ''
      }));
    }
  }, [params]);

  // Auto-populate user data when available
  useEffect(() => {
    if (user) {
      console.log('🚨 Auto-populating emergency user data:', user);
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
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setBookingData(prev => ({ ...prev, preferredDate: formattedDate }));
    }
  };

  // Handle constituency change
  const handleConstituencyChange = (constituency: string) => {
    setSelectedConstituency(constituency);
    setBookingData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        constituency,
        ward: '',
        road: ''
      }
    }));
    
    const constituencyData = completeNairobiLocations.find(c => c.name === constituency);
    setAvailableWards(constituencyData ? constituencyData.wards : []);
    setAvailableRoads([]);
  };

  // Handle ward change
  const handleWardChange = (ward: string) => {
    setBookingData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        ward,
        road: ''
      }
    }));
    
    const constituencyData = completeNairobiLocations.find(c => c.name === selectedConstituency);
    if (constituencyData) {
      const wardData = constituencyData.wards.find(w => w.name === ward);
      setAvailableRoads(wardData ? wardData.roads : []);
    }
  };

  // Validation for emergency form
  const validateEmergencyForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!bookingData.clientName.trim()) {
      newErrors.clientName = 'Name is required for emergency response';
    }
    
    if (!bookingData.clientPhone.trim()) {
      newErrors.clientPhone = 'Phone number is required for emergency contact';
    }
    
    if (!bookingData.serviceDescription.trim()) {
      newErrors.serviceDescription = 'Please describe your emergency situation';
    }
    
    if (!bookingData.location.constituency) {
      newErrors.constituency = 'Constituency is required for emergency dispatch';
    }
    
    if (!bookingData.location.ward) {
      newErrors.ward = 'Ward is required for emergency dispatch';
    }
    
    if (!bookingData.location.description.trim()) {
      newErrors.locationDescription = 'Location details are critical for emergency response';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit emergency booking
  const handleEmergencySubmit = async () => {
    if (!validateEmergencyForm()) {
      Alert.alert('⚠️ Missing Information', 'Please fill in all required fields for emergency response.');
      return;
    }

    setIsSubmitting(true);
    console.log('🚨 Submitting emergency booking:', bookingData);

    try {
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          isEmergency: true,
          priority: 'urgent'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          '🚨 Emergency Booking Submitted!',
          `Your emergency request has been submitted with ID: ${result.booking._id}\\n\\nResponse time: ${params.responseTime || '15-30 minutes'}\\n\\nOur team will contact you immediately.`,
          [
            {
              text: 'OK',
              onPress: () => router.push('/dashboard/client')
            }
          ]
        );
      } else {
        throw new Error('Emergency booking submission failed');
      }
    } catch (error) {
      console.error('❌ Emergency booking error:', error);
      Alert.alert('❌ Emergency Booking Failed', 'Unable to submit emergency booking. Please call our emergency hotline: +254 700 000 000');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚨 Emergency Booking</Text>
      </View>

      <View style={styles.emergencyBanner}>
        <Ionicons name="warning" size={24} color="#ff4444" />
        <Text style={styles.emergencyText}>Emergency Service - Priority Response</Text>
      </View>

      {/* EMERGENCY SERVICE INFO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Service Details</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Service Type</Text>
          <Text style={styles.serviceTypeDisplay}>{params.serviceName || 'Emergency Service'}</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Describe Your Emergency *</Text>
          <TextInput
            style={[styles.textArea, errors.serviceDescription && styles.inputError]}
            value={bookingData.serviceDescription}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, serviceDescription: text }))}
            placeholder="Please describe your emergency situation in detail..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.serviceDescription && <Text style={styles.errorText}>{errors.serviceDescription}</Text>}
        </View>
      </View>

      {/* CONTACT INFORMATION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, errors.clientName && styles.inputError]}
            value={bookingData.clientName}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, clientName: text }))}
            placeholder="Your full name"
            placeholderTextColor="#999"
          />
          {errors.clientName && <Text style={styles.errorText}>{errors.clientName}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={[styles.input, errors.clientPhone && styles.inputError]}
            value={bookingData.clientPhone}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, clientPhone: text }))}
            placeholder="+254 7XX XXX XXX"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
          {errors.clientPhone && <Text style={styles.errorText}>{errors.clientPhone}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Alternate Phone (Optional)</Text>
          <TextInput
            style={styles.input}
            value={bookingData.clientPhone2}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, clientPhone2: text }))}
            placeholder="+254 7XX XXX XXX"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* EMERGENCY LOCATION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Location</Text>
        
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
          <Text style={styles.label}>Exact Location Description *</Text>
          <TextInput
            style={[styles.textArea, errors.locationDescription && styles.inputError]}
            value={bookingData.location.description}
            onChangeText={(text) => setBookingData(prev => ({
              ...prev,
              location: { ...prev.location, description: text }
            }))}
            placeholder="Building name, floor, room number, nearest landmarks..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {errors.locationDescription && <Text style={styles.errorText}>{errors.locationDescription}</Text>}
        </View>
      </View>

      {/* EMERGENCY TIMING */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Response Time</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Date</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              style={[styles.input, errors.preferredDate && styles.inputError]}
              value={bookingData.preferredDate}
              onChangeText={(text) => setBookingData(prev => ({ ...prev, preferredDate: text }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.datePickerButton, errors.preferredDate && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.datePickerText}>
                  {bookingData.preferredDate || 'Select date'}
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
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Response Time Needed *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bookingData.preferredTimeSlot}
              onValueChange={(value) => setBookingData(prev => ({ ...prev, preferredTimeSlot: value }))}
              style={styles.picker}
            >
              {EMERGENCY_TIME_SLOTS.map(slot => (
                <Picker.Item key={slot.value} label={slot.label} value={slot.value} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* EMERGENCY NOTES */}
      <View style={styles.section}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Additional Emergency Notes</Text>
          <TextInput
            style={styles.textArea}
            value={bookingData.emergencyNotes}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, emergencyNotes: text }))}
            placeholder="Any additional information that might help our emergency response team..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* SUBMIT BUTTON */}
      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submittingButton]}
        onPress={handleEmergencySubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>🚨 SUBMIT EMERGENCY REQUEST</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.emergencyHotline}>
        Emergency Hotline: +254 700 000 000
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyBanner: {
    backgroundColor: '#ffe6e6',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  emergencyText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#ff4444',
    paddingBottom: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
  serviceTypeDisplay: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: 'bold',
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#ff4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    gap: 10,
  },
  submittingButton: {
    backgroundColor: '#cc3333',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emergencyHotline: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ff4444',
    fontWeight: 'bold',
    marginVertical: 20,
  },
});
