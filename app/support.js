import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

export default function SupportScreen() {
 const { user } = useAuth();
 const router = useRouter();

 const supportOptions = [
 {
 id: 'call',
 title: 'Call Support',
 description: 'Speak directly with our support team',
 icon: 'call',
 color: '#28a745',
 action: () => handleCallSupport()
 },
 {
 id: 'chat',
 title: 'Live Chat',
 description: 'Chat with our support agents',
 icon: 'chatbubble-ellipses',
 color: '#0d6efd',
 action: () => handleLiveChat()
 },
 {
 id: 'email',
 title: 'Email Support',
 description: 'Send us a detailed message',
 icon: 'mail',
 color: '#fd7e14',
 action: () => handleEmailSupport()
 },
 {
 id: 'whatsapp',
 title: 'WhatsApp Support',
 description: 'Message us on WhatsApp',
 icon: 'logo-whatsapp',
 color: '#25d366',
 action: () => handleWhatsAppSupport()
 }
 ];

 const faqItems = [
 {
 question: 'How do I book a technician?',
 answer: 'Tap on "Find a Technician" from your dashboard, select the service type, fill in the details, and submit your request. Available technicians will be notified.'
 },
 {
 question: 'How are technicians verified?',
 answer: 'All technicians undergo background checks, skill assessments, and identity verification. They must provide valid certifications and licenses.'
 },
 {
 question: 'What payment methods are accepted?',
 answer: 'We accept M-Pesa, credit/debit cards, bank transfers, and cash payments. You can add funds to your wallet for faster transactions.'
 },
 {
 question: 'How do I track my service request?',
 answer: 'Go to "My Bookings" to see all your service requests. You can track status, contact technicians, and view updates in real-time.'
 },
 {
 question: 'What if I\'m not satisfied with the service?',
 answer: 'We offer a satisfaction guarantee. Contact our support team within 24 hours, and we\'ll work to resolve the issue or provide a refund.'
 },
 {
 question: 'How do I cancel a booking?',
 answer: 'You can cancel a booking from "My Bookings" up to 2 hours before the scheduled time. Cancellation fees may apply based on timing.'
 },
 {
 question: 'Are emergency services available 24/7?',
 answer: 'Yes, our emergency services are available 24/7 for critical issues like plumbing leaks, electrical problems, and security emergencies.'
 },
 {
 question: 'How do I add money to my wallet?',
 answer: 'Go to "My Wallet" and tap "Add Funds". You can add money via M-Pesa, bank transfer, or card payment.'
 }
 ];

 const [expandedFAQ, setExpandedFAQ] = useState(null);

 const handleCallSupport = () => {
 Alert.alert(
 'Call Support',
 'Would you like to call our support team?',
 [
 { text: 'Cancel', style: 'cancel' },
 { text: 'Call Now', onPress: () => Linking.openURL('tel:+254700000000') }
 ]
 );
 };

 const handleLiveChat = () => {
 Alert.alert(
 'Live Chat',
 'Connecting you to our live chat support...',
 [
 { text: 'OK', onPress: () => router.push('/messages') }
 ]
 );
 };

 const handleEmailSupport = () => {
 const email = 'support@quickfix.com';
 const subject = 'Support Request from QuickFix App';
 const body = `Hello QuickFix Support Team,

I need assistance with:

User: ${user?.firstName} ${user?.lastName}
Email: ${user?.email}
Account Type: Client

Please describe your issue below:


Best regards,
${user?.firstName}`;

 const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 
 Linking.openURL(mailto).catch(() => {
 Alert.alert(
 'Email Support',
 `Please send an email to: ${email}\n\nSubject: ${subject}`
 );
 });
 };

 const handleWhatsAppSupport = () => {
 const phoneNumber = '+254700000000';
 const message = `Hello QuickFix Support! I need assistance with my account. My name is ${user?.firstName} ${user?.lastName}.`;
 const whatsappURL = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
 
 Linking.openURL(whatsappURL).catch(() => {
 Alert.alert(
 'WhatsApp Support',
 `Please message us on WhatsApp: ${phoneNumber}`
 );
 });
 };

 const toggleFAQ = (index) => {
 setExpandedFAQ(expandedFAQ === index ? null : index);
 };

 const handleFeedback = () => {
 Alert.alert(
 'Send Feedback',
 'We\'d love to hear from you! How can we improve QuickFix?',
 [
 { text: 'Cancel', style: 'cancel' },
 { text: 'Rate App', onPress: () => Alert.alert('Rating', 'Feature coming soon!') },
 { text: 'Send Feedback', onPress: () => handleEmailSupport() }
 ]
 );
 };

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
 <Ionicons name="arrow-back" size={24} color="#333" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Help & Support</Text>
 <TouchableOpacity onPress={handleFeedback} style={styles.feedbackButton}>
 <Ionicons name="thumbs-up-outline" size={24} color="#0d6efd" />
 </TouchableOpacity>
 </View>

 <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
 {/* Support Options */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Contact Support</Text>
 <Text style={styles.sectionSubtitle}>
 Choose how you'd like to get help
 </Text>

 <View style={styles.supportGrid}>
 {supportOptions.map((option) => (
 <TouchableOpacity
 key={option.id}
 style={styles.supportCard}
 onPress={option.action}
 >
 <View style={[styles.supportIcon, { backgroundColor: option.color }]}>
 <Ionicons name={option.icon} size={24} color="#fff" />
 </View>
 <Text style={styles.supportTitle}>{option.title}</Text>
 <Text style={styles.supportDescription}>{option.description}</Text>
 </TouchableOpacity>
 ))}
 </View>
 </View>

 {/* Quick Help */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Quick Help</Text>
 
 <TouchableOpacity style={styles.quickHelpCard} onPress={() => router.push('/services/emergency')}>
 <Ionicons name="warning" size={24} color="#dc3545" />
 <View style={styles.quickHelpInfo}>
 <Text style={styles.quickHelpTitle}>Emergency Services</Text>
 <Text style={styles.quickHelpDescription}>24/7 emergency support</Text>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#ccc" />
 </TouchableOpacity>

 <TouchableOpacity style={styles.quickHelpCard} onPress={() => router.push('/bookings')}>
 <Ionicons name="list" size={24} color="#0d6efd" />
 <View style={styles.quickHelpInfo}>
 <Text style={styles.quickHelpTitle}>My Bookings</Text>
 <Text style={styles.quickHelpDescription}>Track your service requests</Text>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#ccc" />
 </TouchableOpacity>

 <TouchableOpacity style={styles.quickHelpCard} onPress={() => router.push('/wallet')}>
 <Ionicons name="wallet" size={24} color="#fd7e14" />
 <View style={styles.quickHelpInfo}>
 <Text style={styles.quickHelpTitle}>Payment Issues</Text>
 <Text style={styles.quickHelpDescription}>Wallet and payment help</Text>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#ccc" />
 </TouchableOpacity>
 </View>

 {/* FAQ Section */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
 
 {faqItems.map((faq, index) => (
 <TouchableOpacity
 key={index}
 style={styles.faqItem}
 onPress={() => toggleFAQ(index)}
 >
 <View style={styles.faqQuestion}>
 <Text style={styles.faqQuestionText}>{faq.question}</Text>
 <Ionicons 
 name={expandedFAQ === index ? "chevron-up" : "chevron-down"} 
 size={20} 
 color="#666" 
 />
 </View>
 {expandedFAQ === index && (
 <Text style={styles.faqAnswer}>{faq.answer}</Text>
 )}
 </TouchableOpacity>
 ))}
 </View>

 {/* App Information */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>App Information</Text>
 
 <View style={styles.appInfoCard}>
 <View style={styles.appInfoRow}>
 <Text style={styles.appInfoLabel}>Version</Text>
 <Text style={styles.appInfoValue}>1.0.0</Text>
 </View>
 <View style={styles.appInfoRow}>
 <Text style={styles.appInfoLabel}>Support Hours</Text>
 <Text style={styles.appInfoValue}>24/7</Text>
 </View>
 <View style={styles.appInfoRow}>
 <Text style={styles.appInfoLabel}>Email</Text>
 <Text style={styles.appInfoValue}>support@quickfix.com</Text>
 </View>
 <View style={styles.appInfoRow}>
 <Text style={styles.appInfoLabel}>Phone</Text>
 <Text style={styles.appInfoValue}>+254-700-000-000</Text>
 </View>
 </View>
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
 feedbackButton: {
 padding: 8
 },
 content: {
 flex: 1
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
 supportGrid: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 justifyContent: 'space-between'
 },
 supportCard: {
 width: '48%',
 alignItems: 'center',
 padding: 16,
 backgroundColor: '#f8f9fa',
 borderRadius: 12,
 marginBottom: 12
 },
 supportIcon: {
 width: 56,
 height: 56,
 borderRadius: 28,
 alignItems: 'center',
 justifyContent: 'center',
 marginBottom: 12
 },
 supportTitle: {
 fontSize: 14,
 fontWeight: '600',
 color: '#333',
 textAlign: 'center',
 marginBottom: 4
 },
 supportDescription: {
 fontSize: 12,
 color: '#666',
 textAlign: 'center'
 },
 quickHelpCard: {
 flexDirection: 'row',
 alignItems: 'center',
 padding: 16,
 backgroundColor: '#f8f9fa',
 borderRadius: 12,
 marginBottom: 12
 },
 quickHelpInfo: {
 marginLeft: 16,
 flex: 1
 },
 quickHelpTitle: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333'
 },
 quickHelpDescription: {
 fontSize: 14,
 color: '#666',
 marginTop: 4
 },
 faqItem: {
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 paddingVertical: 16
 },
 faqQuestion: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center'
 },
 faqQuestionText: {
 fontSize: 16,
 fontWeight: '500',
 color: '#333',
 flex: 1,
 marginRight: 16
 },
 faqAnswer: {
 fontSize: 14,
 color: '#666',
 marginTop: 12,
 lineHeight: 20
 },
 appInfoCard: {
 backgroundColor: '#f8f9fa',
 borderRadius: 12,
 padding: 16
 },
 appInfoRow: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 paddingVertical: 8
 },
 appInfoLabel: {
 fontSize: 14,
 color: '#666'
 },
 appInfoValue: {
 fontSize: 14,
 fontWeight: '600',
 color: '#333'
 },
 bottomPadding: {
 height: 40
 }
});
