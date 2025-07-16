import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';

export default function EmergencyScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedEmergency, setSelectedEmergency] = useState('');

  const emergencyTypes = [
    {
      id: 'plumbing-burst',
      title: 'Burst Pipe Emergency',
      description: 'Water leak, burst pipes, major flooding',
      icon: 'water',
      color: '#dc3545',
      urgency: 'CRITICAL'
    },
    {
      id: 'electrical-emergency',
      title: 'Electrical Emergency',
      description: 'Power outage, sparking, electrical fires',
      icon: 'flash',
      color: '#dc3545',
      urgency: 'CRITICAL'
    },
    {
      id: 'gas-leak',
      title: 'Gas Leak',
      description: 'Suspected gas leak, gas appliance issues',
      icon: 'warning',
      color: '#dc3545',
      urgency: 'CRITICAL'
    },
    {
      id: 'heating-emergency',
      title: 'No Heating/Cooling',
      description: 'HVAC system failure, extreme temperature',
      icon: 'thermometer',
      color: '#fd7e14',
      urgency: 'HIGH'
    },
    {
      id: 'security',
      title: 'Security Emergency',
      description: 'Broken locks, security system failure',
      icon: 'shield-outline',
      color: '#fd7e14',
      urgency: 'HIGH'
    },
    {
      id: 'appliance-emergency',
      title: 'Appliance Emergency',
      description: 'Refrigerator failure, washing machine flooding',
      icon: 'home',
      color: '#ffc107',
      urgency: 'MEDIUM'
    }
  ];

  const handleEmergencySelect = (emergency) => {
    setSelectedEmergency(emergency.id);
    
    Alert.alert(
      'Emergency Service Request',
      `You selected: ${emergency.title}\n\nThis will connect you with available emergency technicians in your area.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Emergency Service', 
          style: 'destructive',
          onPress: () => requestEmergencyService(emergency)
        }
      ]
    );
  };

  const requestEmergencyService = (emergency) => {
    Alert.alert(
      'Emergency Request Sent',
      `Your ${emergency.title.toLowerCase()} request has been sent to nearby technicians.\n\nExpected response time: 15-30 minutes\n\nEmergency hotline: +254-700-000-000`,
      [
        { text: 'Call Emergency Hotline', onPress: () => callEmergencyHotline() },
        { text: 'Track Request', onPress: () => router.push('/bookings') }
      ]
    );
  };

  const callEmergencyHotline = () => {
    Alert.alert(
      'Calling Emergency Hotline',
      'Connecting you to our 24/7 emergency support...'
    );
  };

  const handleSafetyTips = () => {
    Alert.alert(
      'Emergency Safety Tips',
      '🚨 ELECTRICAL:\n- Turn off main power if safe\n- Don\'t touch electrical equipment with wet hands\n\n💧 PLUMBING:\n- Turn off main water valve\n- Move valuables away from water\n\n🔥 GAS:\n- Don\'t use electrical switches\n- Ventilate the area\n- Evacuate if smell is strong\n\n⚠️ Always prioritize your safety first!'
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Services</Text>
        <TouchableOpacity onPress={handleSafetyTips} style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#0d6efd" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Alert */}
        <View style={styles.alertCard}>
          <Ionicons name="alert-circle" size={32} color="#dc3545" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>24/7 Emergency Support</Text>
            <Text style={styles.alertText}>
              For life-threatening emergencies, call 911 immediately
            </Text>
            <Text style={styles.alertSubtext}>Emergency Hotline: +254-700-000-000</Text>
          </View>
        </View>

        {/* Emergency Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Emergency Type</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the type of emergency you're experiencing
          </Text>

          {emergencyTypes.map((emergency) => (
            <TouchableOpacity
              key={emergency.id}
              style={[
                styles.emergencyCard,
                selectedEmergency === emergency.id && styles.selectedCard
              ]}
              onPress={() => handleEmergencySelect(emergency)}
            >
              <View style={styles.emergencyLeft}>
                <View style={[styles.iconContainer, { backgroundColor: emergency.color }]}>
                  <Ionicons name={emergency.icon} size={24} color="#fff" />
                </View>
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyTitle}>{emergency.title}</Text>
                  <Text style={styles.emergencyDescription}>{emergency.description}</Text>
                </View>
              </View>
              <View style={styles.emergencyRight}>
                <View style={[styles.urgencyBadge, { backgroundColor: emergency.color }]}>
                  <Text style={styles.urgencyText}>{emergency.urgency}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety First</Text>
          
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#28a745" />
              <Text style={styles.safetyTitle}>Before Requesting Service</Text>
            </View>
            
            <View style={styles.safetyTips}>
              <View style={styles.safetyTip}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.safetyTipText}>Ensure your immediate safety</Text>
              </View>
              <View style={styles.safetyTip}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.safetyTipText}>Turn off utilities if safe to do so</Text>
              </View>
              <View style={styles.safetyTip}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.safetyTipText}>Document the emergency with photos</Text>
              </View>
              <View style={styles.safetyTip}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.safetyTipText}>Clear access path for technician</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          
          <TouchableOpacity style={styles.contactCard} onPress={callEmergencyHotline}>
            <Ionicons name="call" size={24} color="#dc3545" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Emergency Hotline</Text>
              <Text style={styles.contactNumber}>+254-700-000-000</Text>
              <Text style={styles.contactDescription}>24/7 Emergency Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#0d6efd" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Emergency Chat</Text>
              <Text style={styles.contactDescription}>Live chat with emergency dispatch</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center'
  },
  infoButton: {
    padding: 8
  },
  content: {
    flex: 1
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    elevation: 2
  },
  alertContent: {
    marginLeft: 16,
    flex: 1
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545'
  },
  alertText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4
  },
  alertSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedCard: {
    borderColor: '#0d6efd',
    backgroundColor: '#f0f4ff'
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  emergencyInfo: {
    flex: 1
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  emergencyRight: {
    alignItems: 'center'
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff'
  },
  safetyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12
  },
  safetyTips: {
    gap: 12
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  safetyTipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 4
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  bottomPadding: {
    height: 40
  }
});
