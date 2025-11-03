import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Support & Help Center
 * Customer support information and help resources
 */
export default function Support() {
  const router = useRouter();

  const handleCall = () => {
    Linking.openURL('tel:+254794536984');
  };
  
  const handleCallAlternate = () => {
    Linking.openURL('tel:+254117224394');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:engineerjuliusjr47@gmail.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/254117224394');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Support & Help</Text>
        <Text style={styles.subtitle}>We're here to help you</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        
        <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
          <Text style={styles.contactLabel}>Phone (Primary)</Text>
          <Text style={styles.contactValue}>0794536984</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactButton} onPress={handleCallAlternate}>
          <Text style={styles.contactLabel}>Phone (Alternate)</Text>
          <Text style={styles.contactValue}>0117224394</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>engineerjuliusjr47@gmail.com</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
          <Text style={styles.contactLabel}>WhatsApp</Text>
          <Text style={styles.contactValue}>0794536984</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I book a service?</Text>
          <Text style={styles.faqAnswer}>
            Navigate to the booking section, select your service type, fill in the details, 
            and confirm your booking. You'll receive a confirmation immediately.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How long does it take for a technician to arrive?</Text>
          <Text style={styles.faqAnswer}>
            Normal bookings: Within 2-4 hours. Emergency bookings: Within 30-60 minutes.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I pay for services?</Text>
          <Text style={styles.faqAnswer}>
            We accept M-Pesa, card payments via IntaSend, and cash on completion.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Can I cancel my booking?</Text>
          <Text style={styles.faqAnswer}>
            Yes, you can cancel before the technician is assigned. After assignment, 
            cancellation fees may apply.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I rate a technician?</Text>
          <Text style={styles.faqAnswer}>
            After service completion, you'll be prompted to rate and review the technician. 
            You can also access ratings from your booking history.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Operating Hours</Text>
        <Text style={styles.infoText}>Monday - Saturday: 8:00 AM - 8:00 PM</Text>
        <Text style={styles.infoText}>Sunday: Emergency services only</Text>
        <Text style={styles.infoText}>24/7 Support: engineerjuliusjr47@gmail.com</Text>
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0d6efd',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  contactButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  contactValue: {
    fontSize: 16,
    color: '#0d6efd',
    fontWeight: '600',
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  backButton: {
    backgroundColor: '#0d6efd',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
