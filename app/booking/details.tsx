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
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
import { NairobiWard, getWardsForConstituency, getRoadsForWard, getAllConstituencies } from '../../data/completeNairobiLocations';
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
  clientEmail: string;
  communicationPhone: string; // Optional different phone for communication
  serviceType: string;
  serviceDescription: string;
  urgency: 'normal' | 'emergency';
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
  { value: '08:00-10:00', label: '8:00 AM - 10:00 AM', type: 'normal' },
  { value: '10:00-12:00', label: '10:00 AM - 12:00 PM', type: 'normal' },
  { value: '12:00-14:00', label: '12:00 PM - 2:00 PM', type: 'normal' },
  { value: '14:00-16:00', label: '2:00 PM - 4:00 PM', type: 'normal' },
  { value: '16:00-18:00', label: '4:00 PM - 6:00 PM', type: 'normal' },
  { value: 'emergency-asap', label: '🚨 Emergency - ASAP (Within 2 hours)', type: 'emergency' },
  { value: 'emergency-today', label: '⚡ Same Day Emergency', type: 'emergency' },
  { value: 'flexible', label: 'Flexible', type: 'normal' }
];

// Helper function to provide context-aware placeholder text
const getServiceDescriptionPlaceholder = (serviceType: string): string => {
  const placeholders: Record<string, string> = {
    'plumbing': 'Describe your plumbing issue in detail. For example: "Kitchen sink tap is leaking from the base, needs washer replacement" or "Toilet won\'t flush properly, handle seems loose"',
    'electrical': 'Describe your electrical issue. For example: "Need to install new power outlet in bedroom for TV" or "Circuit breaker keeps tripping in kitchen area"',
    'carpentry': 'Describe your carpentry needs. For example: "Custom kitchen cabinet doors need repair, hinges are broken" or "Install floating shelves in living room"',
    'painting': 'Describe your painting project. For example: "Paint interior walls of bedroom, need primer and 2 coats" or "Touch up exterior house paint on front wall"',
    'cleaning': 'Describe your cleaning requirements. For example: "Deep clean entire house including carpets and windows" or "Post-construction cleanup needed"',
    'appliance_repair': 'Describe your appliance issue. For example: "Washing machine won\'t spin, makes loud noise during cycle" or "Refrigerator not cooling properly"',
    'air_conditioning': 'Describe your AC/HVAC issue. For example: "Air conditioner not cooling, seems to be low on refrigerant" or "Install new split unit AC in master bedroom"',
    'roofing': 'Describe your roofing needs. For example: "Roof leaking during rain, tiles appear damaged on east side" or "Gutter cleaning and minor repairs needed"',
    'gardening': 'Describe your gardening needs. For example: "Lawn mowing and hedge trimming for front and back yard" or "Plant flower beds and install irrigation"',
    'pest_control': 'Describe your pest problem. For example: "Ant infestation in kitchen area, need treatment and prevention" or "Termite inspection and treatment required"',
    'security_systems': 'Describe your security needs. For example: "Install CCTV cameras around property perimeter" or "Repair existing alarm system, sensors not working"',
    'solar_installation': 'Describe your solar project. For example: "Install solar panels on roof for home electricity" or "Solar water heater installation needed"',
    'general_maintenance': 'Describe your maintenance needs. For example: "Fix squeaky door hinges and replace broken window latch" or "General home inspection and minor repairs"',
    'other': 'Describe exactly what work needs to be done. Please be as specific as possible about the issue, location, and any relevant details.'
  };

  return placeholders[serviceType] || 'Describe what specific work needs to be done. For example: "Fix leaking kitchen sink tap and replace worn-out washers" or "Install new electrical outlet in bedroom"';
};

export default function RedesignedBookingForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{bookingId: string, phone: string} | null>(null);
  
  // Parse service data from params - Handle both emergency and regular service formats
  const serviceData = params.serviceData ? JSON.parse(params.serviceData as string) : null;
  
  // Handle emergency service parameters (individual params) - only if isEmergency is explicitly true
  const emergencyServiceData = (params.isEmergency === 'true' && params.serviceId) ? {
    id: params.serviceId as string,
    name: params.serviceName as string,
    description: params.serviceDescription as string,
    category: params.category as string,
    responseTime: params.responseTime as string,
    priceRange: params.priceRange as string,
    urgencyLevel: params.urgencyLevel as string,
    isEmergency: true
  } : null;
  
  // Map emergency service categories to backend serviceType enum values
  const mapEmergencyCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'Transport Emergency': 'general_maintenance',
      'Home Emergency': 'general_maintenance', 
      'Electrical Emergency': 'electrical',
      'Plumbing Emergency': 'plumbing',
      'Security Emergency': 'security_systems',
      'Medical Emergency': 'other',
      'Fire Emergency': 'other',
      'Gas Emergency': 'appliance_repair',
      'HVAC Emergency': 'air_conditioning',
      'Business Emergency': 'general_maintenance'
    };
    return categoryMap[category] || 'other';
  };
  
  // Use emergency data if available, otherwise use regular serviceData
  const activeServiceData = emergencyServiceData || serviceData;
  
  // BOOKING DATA - AUTO-POPULATED WITH USER AND SERVICE DATA
  const [bookingData, setBookingData] = useState<BookingFormData>({
    // CLIENT DETAILS - AUTO-POPULATED FROM USER
    clientName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    clientPhone: user?.phoneNumber || '',
    clientEmail: user?.email || '',
    
    // COMMUNICATION PHONE (OPTIONAL - DEFAULT TO USER PHONE)
    communicationPhone: '',
    
    // SERVICE DETAILS - ONLY SERVICE TYPE AUTO-POPULATED
    serviceType: activeServiceData?.category || '',
    serviceDescription: '', // User will write this manually
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

  // Initialize form with user data and service data on component mount
  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        clientPhone: user.phoneNumber || '',
        clientEmail: user.email || '',
      }));
    }
    
    if (activeServiceData) {
      setBookingData(prev => ({
        ...prev,
        serviceType: activeServiceData.isEmergency 
          ? mapEmergencyCategory(activeServiceData.category) 
          : activeServiceData.category || '',
        // serviceDescription: Leave empty for user to write manually
        urgency: activeServiceData.isEmergency ? 'emergency' : 'normal'
      }));
    }
  }, [user, activeServiceData]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [availableWards, setAvailableWards] = useState<NairobiWard[]>([]);
  const [availableRoads, setAvailableRoads] = useState<string[]>([]);

  /**
   * HANDLE CONSTITUENCY CHANGE - Enhanced with accurate road mapping
   */
  const handleConstituencyChange = (constituency: string) => {
    setSelectedConstituency(constituency);
    setBookingData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        constituency,
        ward: '', // Reset ward when constituency changes
        road: '', // Reset road when constituency changes
      }
    }));
    
    // Get wards for selected constituency using enhanced function
    const wards = getWardsForConstituency(constituency);
    setAvailableWards(wards);
    setAvailableRoads([]); // Clear roads when constituency changes
  };

  /**
   * HANDLE WARD CHANGE - Enhanced with accurate road mapping
   */
  const handleWardChange = (ward: string) => {
    setBookingData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        ward,
        road: '', // Reset road when ward changes
      }
    }));
    
    // Get roads for selected ward using enhanced function
    const roads = getRoadsForWard(selectedConstituency, ward);
    setAvailableRoads(roads);
  };

  /**
   * COMPREHENSIVE FORM VALIDATION
   */
  const validateForm = (): boolean => {
    console.log('🔍 Starting form validation...');
    console.log('📋 Current booking data:', bookingData);
    
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
    
    console.log('🔍 Validation errors found:', newErrors);
    console.log('✅ Validation result:', Object.keys(newErrors).length === 0 ? 'PASSED' : 'FAILED');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * SUBMIT BOOKING
   */
  const handleSubmit = async () => {
    console.log('🚀 Starting booking submission...');
    console.log('📋 Form data:', bookingData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      Alert.alert('Validation Error', 'Please check all required fields');
      return;
    }
    
    console.log('✅ Form validation passed');
    setIsSubmitting(true);
    
    try {
      console.log('📡 Sending request to:', 'http://localhost:3000/api/bookings-redesigned/redesigned');
      console.log('📋 Request payload:', JSON.stringify(bookingData, null, 2));
      
      const response = await fetch('http://localhost:3000/api/bookings-redesigned/redesigned', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      const result = await response.json();
      console.log('📋 Response data:', result);
      
      if (result.success) {
        console.log('✅ Booking submitted successfully:', result.data.bookingId);
        
        // Set success state for UI feedback
        setIsSuccess(true);
        setSuccessData({
          bookingId: result.data.bookingId,
          phone: result.data.clientPhone
        });
        
        // Show success in console for debugging
        console.log('%c🎉 BOOKING SUBMITTED SUCCESSFULLY! 🎉', 'background: green; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
        console.log(`📋 Booking ID: ${result.data.bookingId}`);
        console.log(`📞 Contact Phone: ${result.data.clientPhone}`);
        
        // Navigate to my bookings after showing success for 3 seconds
        setTimeout(() => {
          console.log('📋 Navigating to My Bookings...');
          router.replace('/bookings');
        }, 3000);
        
      } else {
        console.log('❌ Booking submission failed:', result.message);
        console.log('%c❌ BOOKING FAILED', 'background: red; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
        
        try {
          Alert.alert('Submission Failed', result.message || 'Please try again');
        } catch (alertError) {
          console.log('❌ Error:', result.message || 'Please try again');
          console.log('❌ Alert error:', alertError);
        }
      }
      
    } catch (error) {
      console.error('💥 Booking submission error:', error);
      Alert.alert('Network Error', 'Please check your connection and try again');
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Booking submission finished');
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

  // Auto-determine urgency based on time selection and date
  const determineUrgency = (timeSlot: string, date: string): 'normal' | 'emergency' => {
    // Emergency time slots
    if (timeSlot === 'emergency-asap' || timeSlot === 'emergency-today') {
      return 'emergency';
    }

    // Same day or next day booking for non-emergency = normal
    return 'normal';
  };  const formatPhoneNumber = (phone: string): string => {
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
      {/* SUCCESS OVERLAY - BOOKING RECEIPT */}
      {isSuccess && successData && (
        <View style={styles.successOverlay}>
          <View style={styles.receiptCard}>
            {/* Header */}
            <View style={styles.receiptHeader}>
              <Ionicons name="checkmark-circle" size={48} color="#28a745" />
              <Text style={styles.receiptTitle}>Booking Confirmed!</Text>
              <Text style={styles.receiptSubtitle}>QuickFix Repair Services</Text>
            </View>
            
            {/* Booking ID */}
            <View style={styles.bookingIdSection}>
              <Text style={styles.bookingIdLabel}>Booking Reference</Text>
              <Text style={styles.bookingIdValue}>{successData.bookingId}</Text>
            </View>
            
            {/* Service Details */}
            <View style={styles.receiptSection}>
              <Text style={styles.receiptSectionTitle}>Service Details</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Service Type:</Text>
                <Text style={styles.receiptValue}>
                  {activeServiceData?.name || SERVICE_TYPES.find(s => s.value === bookingData.serviceType)?.label || bookingData.serviceType}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Description:</Text>
                <Text style={styles.receiptValue}>{bookingData.serviceDescription}</Text>
              </View>
              {activeServiceData?.isEmergency && (
                <>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Response Time:</Text>
                    <Text style={[styles.receiptValue, styles.emergencyText]}>
                      ⚡ {activeServiceData.responseTime}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Price Range:</Text>
                    <Text style={styles.receiptValue}>{activeServiceData.priceRange}</Text>
                  </View>
                </>
              )}
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Priority:</Text>
                <Text style={[styles.receiptValue, 
                  bookingData.urgency === 'emergency' && styles.emergencyText
                ]}>
                  {bookingData.urgency === 'emergency' && '🚨 '}
                  {bookingData.urgency === 'normal' && '📅 '}
                  {bookingData.urgency.charAt(0).toUpperCase() + bookingData.urgency.slice(1)}
                </Text>
              </View>
            </View>
            
            {/* Customer Details */}
            <View style={styles.receiptSection}>
              <Text style={styles.receiptSectionTitle}>Customer Details</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Name:</Text>
                <Text style={styles.receiptValue}>{bookingData.clientName}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Phone:</Text>
                <Text style={styles.receiptValue}>{bookingData.clientPhone}</Text>
              </View>
              {bookingData.communicationPhone && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Alt. Phone:</Text>
                  <Text style={styles.receiptValue}>{bookingData.communicationPhone}</Text>
                </View>
              )}
            </View>
            
            {/* Location Details */}
            <View style={styles.receiptSection}>
              <Text style={styles.receiptSectionTitle}>Service Location</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Area:</Text>
                <Text style={styles.receiptValue}>
                  {bookingData.location.ward}, {bookingData.location.constituency}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Address:</Text>
                <Text style={styles.receiptValue}>
                  {bookingData.location.road}, {bookingData.location.description}
                </Text>
              </View>
            </View>
            
            {/* Scheduling */}
            <View style={styles.receiptSection}>
              <Text style={styles.receiptSectionTitle}>Scheduled Time</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Date:</Text>
                <Text style={styles.receiptValue}>{bookingData.preferredDate}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Time:</Text>
                <Text style={styles.receiptValue}>
                  {TIME_SLOTS.find(slot => slot.value === bookingData.preferredTimeSlot)?.label || bookingData.preferredTimeSlot}
                </Text>
              </View>
            </View>
            
            {/* Next Steps */}
            <View style={styles.nextStepsSection}>
              <Text style={styles.nextStepsTitle}>What&apos;s Next?</Text>
              <Text style={styles.nextStepsText}>
                • We&apos;ll assign a qualified technician{'\n'}
                • You&apos;ll receive a confirmation call within 30 minutes{'\n'}
                • Track your booking progress in &quot;My Bookings&quot;
              </Text>
            </View>
            
            <Text style={styles.redirectNote}>
              Redirecting to My Bookings in a moment...
            </Text>
          </View>
        </View>
      )}

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
          <Text style={styles.label}>Different Communication Number (Optional)</Text>
          <TextInput
            style={[styles.input, errors.communicationPhone && styles.inputError]}
            value={bookingData.communicationPhone}
            onChangeText={(text) => {
              const formatted = formatPhoneNumber(text);
              setBookingData(prev => ({ ...prev, communicationPhone: formatted }));
            }}
            placeholder="Alternative phone for communication"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
          <Text style={styles.helpText}>Leave blank to use your main phone number</Text>
          {errors.communicationPhone && <Text style={styles.errorText}>{errors.communicationPhone}</Text>}
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
              onValueChange={(serviceType) => setBookingData(prev => ({ ...prev, serviceType }))}
              style={styles.picker}
            >
              <Picker.Item label="Select service type" value="" />
              {SERVICE_TYPES.map(type => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
          {errors.serviceType && <Text style={styles.errorText}>{errors.serviceType}</Text>}
          
          {/* Show selected service info if coming from service selection */}
          {activeServiceData && (
            <View style={styles.selectedServiceInfo}>
              <Text style={styles.selectedServiceTitle}>
                📋 Selected Service: {activeServiceData.name}
              </Text>
              <Text style={styles.selectedServiceDescription}>
                {activeServiceData.description}
              </Text>
              {activeServiceData.isEmergency && (
                <Text style={styles.emergencyServiceNote}>
                  🚨 Emergency Service - Priority Response: {activeServiceData.responseTime}
                </Text>
              )}
              <Text style={styles.customDescriptionNote}>
                💡 Please describe your specific issue below to help our technicians prepare:
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Service Description *</Text>
          <TextInput
            style={[styles.textArea, errors.serviceDescription && styles.inputError]}
            value={bookingData.serviceDescription}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, serviceDescription: text }))}
            placeholder={getServiceDescriptionPlaceholder(bookingData.serviceType)}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.serviceDescription && <Text style={styles.errorText}>{errors.serviceDescription}</Text>}
          
          {/* 💡 HELPFUL TIP FOR WRITING DESCRIPTIONS */}
          <View style={styles.tipContainer}>
            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
              <Text style={styles.tipIcon}>💡</Text>
              <View style={{flex: 1}}>
                <Text style={styles.tipText}>
                  <Text style={styles.tipBold}>Writing a good description helps:</Text>{'\n'}
                  • Technicians prepare the right tools{'\n'}
                  • Get accurate cost estimates{'\n'}
                  • Schedule appropriate time slots{'\n'}
                  • Avoid multiple trips
                </Text>
              </View>
            </View>
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
              {getAllConstituencies().map((constituency: string) => (
                <Picker.Item 
                  key={constituency} 
                  label={constituency} 
                  value={constituency} 
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
              {availableWards.map((ward: NairobiWard) => (
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
              onValueChange={(value) => setBookingData(prev => ({
                ...prev,
                location: { ...prev.location, road: value }
              }))}
              style={styles.picker}
              enabled={availableRoads.length > 0}
            >
              <Picker.Item label="Select road/street" value="" />
              {availableRoads.map((road: string) => (
                <Picker.Item key={road} label={road} value={road} />
              ))}
            </Picker>
          </View>
          {availableRoads.length === 0 && bookingData.location.ward && (
            <Text style={styles.helpText}>Please select a ward to see available roads</Text>
          )}
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
            onChangeText={(text) => {
              const urgency: 'normal' | 'urgent' | 'emergency' = determineUrgency(bookingData.preferredTimeSlot, text);
              setBookingData(prev => ({ 
                ...prev, 
                preferredDate: text,
                urgency: urgency
              }));
            }}
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
              onValueChange={(value) => {
                const urgency: 'normal' | 'urgent' | 'emergency' = determineUrgency(value, bookingData.preferredDate);
                setBookingData(prev => ({ 
                  ...prev, 
                  preferredTimeSlot: value,
                  urgency: urgency
                }));
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select time slot" value="" />
              {TIME_SLOTS.map(slot => (
                <Picker.Item key={slot.value} label={slot.label} value={slot.value} />
              ))}
            </Picker>
          </View>
          {errors.preferredTimeSlot && <Text style={styles.errorText}>{errors.preferredTimeSlot}</Text>}
          
          {/* Show urgency level indicator */}
          {bookingData.preferredTimeSlot && (
            <View style={styles.urgencyIndicator}>
              <View style={[
                styles.urgencyBadge, 
                bookingData.urgency === 'emergency' && styles.emergencyBadge,
                bookingData.urgency === 'normal' && styles.normalBadge
              ]}>
                <Text style={[
                  styles.urgencyText,
                  bookingData.urgency === 'emergency' && styles.emergencyText
                ]}>
                  {bookingData.urgency === 'emergency' && '🚨 '}
                  {bookingData.urgency === 'normal' && '📅 '}
                  {bookingData.urgency.charAt(0).toUpperCase() + bookingData.urgency.slice(1)} Booking
                </Text>
              </View>
              {bookingData.urgency === 'emergency' && (
                <Text style={styles.emergencyNote}>
                  Emergency bookings incur additional charges for immediate response
                </Text>
              )}
            </View>
          )}
          
          {/* Helpful note about auto-determined urgency */}
          <Text style={styles.helpText}>
            💡 Urgency level is automatically determined based on your selected time slot and date
          </Text>
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
        onPress={() => {
          console.log('🖱️ Submit button pressed!');
          handleSubmit();
        }}
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
  // SUCCESS OVERLAY STYLES - RECEIPT FORMAT
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  receiptCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 0,
    maxWidth: 400,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  receiptHeader: {
    backgroundColor: '#28a745',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  receiptSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  bookingIdSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  bookingIdLabel: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bookingIdValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  receiptSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  receiptSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  receiptValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  nextStepsSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  nextStepsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  redirectNote: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  // URGENCY INDICATOR STYLES
  urgencyIndicator: {
    marginTop: 10,
    alignItems: 'center',
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 5,
  },
  normalBadge: {
    backgroundColor: '#e7f3ff',
  },
  urgentBadge: {
    backgroundColor: '#fff3cd',
  },
  emergencyBadge: {
    backgroundColor: '#f8d7da',
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  urgentText: {
    color: '#856404',
  },
  emergencyText: {
    color: '#721c24',
  },
  emergencyNote: {
    fontSize: 12,
    color: '#721c24',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
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
  // TIP CONTAINER STYLES
  tipContainer: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  tipIcon: {
    marginRight: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#0066cc',
    lineHeight: 18,
  },
  tipBold: {
    fontWeight: '600',
  },
  // Selected Service Info Styles
  selectedServiceInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  selectedServiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  selectedServiceDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  emergencyServiceNote: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 8,
  },
  customDescriptionNote: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
