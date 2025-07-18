/**
 * Service Request Screen
 * Allows clients to request services from technicians
 */

import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ServiceRequestScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    address: '',
    urgency: 'normal',
    preferredDate: '',
    preferredTime: '',
    estimatedBudget: ''
  });
  
  const [serviceCategories, setServiceCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // 1. Initialize client location on mount
  useEffect(() => {
    (async () => {
      try {
        const loc = await getCurrentLocation();
        setClientLoc(loc);
      } catch (err) {
        Alert.alert('Location Error', err.message);
      }
    })();
  }, []);

  // Handle date/time picker change
  function onChangePicker(event, selected) {
    setShowPicker(Platform.OS === 'ios');
    if (selected) setDate(selected);
  }

  // Show date or time picker
  function showMode(curMode) {
    setMode(curMode);
    setShowPicker(true);
  }

  // Main handler: find & book technician
  async function handleRequest() {
    if (!clientLoc) return Alert.alert('Waiting for GPS…');

    setLoading(true);
    try {
      // 2. Fetch technicians
      const resp = await axios.get('http://10.0.0.1:3000/api/technicians');
      const techs = resp.data;

      // 3. Match technician (responsible for availability now or future)
      const urgency = 'high';           // can be dynamic
      const skill   = 'plumbing';       // can be a form input
      const best    = matchTechnician(clientLoc, techs, skill, urgency);

      if (!best) {
        Alert.alert('No Technician', 'Try again later.');
        return;
      }

      // 4. Book with backend
      const bookingResp = await axios.post('http://10.0.0.1:3000/api/bookings', {
        clientId:    123,              // replace with auth user ID
        techId:      best.id,
        skill,
        urgency,
        timeRequested: date.toISOString(),
        clientLoc,
        techLoc:       best.location
      });

      if (bookingResp.data.success) {
        Alert.alert('Booked!', `Booking #${bookingResp.data.bookingId}`);
      }

      // 5. Show technician on map
      setTechLoc(best.location);
      setTechName(best.name);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Request Repair Service</Text>

      {/* Date & Time Picker Triggers */}
      <View style={styles.pickerRow}>
        <Button title="Pick Date" onPress={() => showMode('date')} />
        <Button title="Pick Time" onPress={() => showMode('time')} />
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChangePicker}
        />
      )}

      {/* Request Button */}
      {loading ? (
        <ActivityIndicator size="large" color="#0d6efd" />
      ) : (
        <Button title="Find & Book Technician" onPress={handleRequest} />
      )}

      {/* Location Display */}
      {techLoc && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>📍 Technician Located</Text>
          <Text style={styles.locationDetails}>
            Your location: {clientLoc.latitude.toFixed(4)}, {clientLoc.longitude.toFixed(4)}
          </Text>
          <Text style={styles.locationDetails}>
            Technician: {techLoc.latitude.toFixed(4)}, {techLoc.longitude.toFixed(4)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f5f7fa' },
  header:    { fontSize:22, fontWeight:'600', marginBottom:15, textAlign:'center' },
  pickerRow: { flexDirection:'row', justifyContent:'space-around', marginBottom:15 },
  locationInfo: { 
    backgroundColor: '#e3f2fd', 
    padding: 15, 
    marginTop: 20, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#90caf9' 
  },
  locationText: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 8, 
    color: '#1976d2' 
  },
  locationDetails: { 
    fontSize: 14, 
    color: '#424242', 
    marginBottom: 4 
  }
});
