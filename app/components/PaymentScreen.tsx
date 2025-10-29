/**
 * Multi-Provider Payment Component (Native)
 * 
 * This component handles payment processing with multiple providers:
 * - Basic card input for demonstration
 * - PayPal for global coverage
 * - M-Pesa for Kenyan mobile payments
 */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
 ActivityIndicator,
 Alert,
 Modal,
 Platform,
 SafeAreaView,
 ScrollView,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View
} from 'react-native';

type PaymentModalProps = {
 visible: boolean;
 onClose: () => void;
 booking: any;
 amount: number;
 onPaymentSuccess: (result: { method: string; transactionId: string; status: string }) => void;
};

import type { IconProps } from '@expo/vector-icons/build/createIconSet';
type IoniconName = IconProps<keyof typeof Ionicons.glyphMap>['name'];

type PaymentMethod = {
 id: string;
 name: string;
 description: string;
 icon: IoniconName;
 region?: string;
};

const PaymentModal = ({ visible, onClose, booking, amount, onPaymentSuccess }: PaymentModalProps) => {
 const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
 const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
 const [loading, setLoading] = useState(false);
 const [phoneNumber, setPhoneNumber] = useState('');
 const [userLocation, setUserLocation] = useState<{ country?: string } | null>(null);

 // Stripe instance placeholder - will be implemented properly for native
 // Type as any to avoid TS errors until Stripe is integrated
 const stripe: any = null;

 useEffect(() => {
 if (visible) {
 fetchPaymentMethods();
 getUserLocation();
 }
 }, [visible]);

 const fetchPaymentMethods = async () => {
 try {
 const response = await fetch(
 `${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/payments/enhanced/methods`
 );
 
 if (response.ok) {
 const data = await response.json();
 setPaymentMethods(data.methods || []);
 }
 } catch (error) {
 console.error('Failed to fetch payment methods:', error);
 }
 };

 const getUserLocation = async () => {
 try {
 const userString = await AsyncStorage.getItem('user');
 if (userString) {
 const user = JSON.parse(userString);
 setUserLocation(user.location);
 if (user.phoneNumber) {
 setPhoneNumber(user.phoneNumber);
 }
 }
 } catch (error) {
 console.error('Failed to get user data:', error);
 }
 };

 const handlePaymentMethodSelect = (method: any) => {
 setSelectedMethod(method);
 };

 const processPayment = async () => {
 if (!selectedMethod) {
 Alert.alert('Error', 'Please select a payment method');
 return;
 }

 setLoading(true);

 try {
 switch (selectedMethod.id) {
 case 'stripe':
 await processStripePayment();
 break;
 case 'paypal':
 await processPayPalPayment();
 break;
 case 'mpesa':
 await processMpesaPayment();
 break;
 default:
 throw new Error('Unknown payment method');
 }
 } catch (error) {
 console.error('Payment processing error:', error);
 const errorMessage = (error instanceof Error && error.message) ? error.message : 'Please try again';
 Alert.alert('Payment Failed', errorMessage);
 } finally {
 setLoading(false);
 }
 };

 const processStripePayment = async () => {
 try {
 const token = await AsyncStorage.getItem('authToken');
 
 // Create payment intent
 const intentResponse = await fetch(
 `${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/payments/enhanced/intent`,
 {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 bookingId: booking._id,
 amount,
 paymentMethod: 'stripe',
 currency: 'USD'
 })
 }
 );

 if (!intentResponse.ok) {
 throw new Error('Failed to create payment intent');
 }

 const intentData = await intentResponse.json();
 const { clientSecret } = intentData.paymentData;

 // Present payment sheet
 if (!stripe) {
 throw new Error('Stripe is not initialized');
 }
 const { error } = await stripe.presentPaymentSheet({
 paymentIntentClientSecret: clientSecret,
 });

 if (error) {
 throw new Error(error.message);
 }

 // Confirm payment
 await confirmPayment(intentData.transaction, clientSecret);

 } catch (error) {
 throw error;
 }
 };

 const processPayPalPayment = async () => {
 try {
 const token = await AsyncStorage.getItem('authToken');
 
 // Create PayPal payment
 const response = await fetch(
 `${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/payments/enhanced/intent`,
 {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 bookingId: booking._id,
 amount,
 paymentMethod: 'paypal',
 currency: 'USD'
 })
 }
 );

 if (!response.ok) {
 throw new Error('Failed to create PayPal payment');
 }

 const data = await response.json();
 
 // In a real app, you would open the PayPal approval URL
 // For now, we'll simulate success
 Alert.alert(
 'PayPal Payment',
 'This would open PayPal for payment approval',
 [
 { text: 'Cancel', style: 'cancel' },
 { 
 text: 'Simulate Success', 
 onPress: () => confirmPayment(data.transaction, data.paymentData.id)
 }
 ]
 );

 } catch (error) {
 throw error;
 }
 };

 const processMpesaPayment = async () => {
 if (!phoneNumber) {
 throw new Error('Phone number is required for M-Pesa payment');
 }

 // Validate Kenyan phone number
 const kenyanPhoneRegex = /^(?:\+254|254|0)?([7][0-9]{8})$/;
 if (!kenyanPhoneRegex.test(phoneNumber)) {
 throw new Error('Please enter a valid Kenyan phone number');
 }

 try {
 const token = await AsyncStorage.getItem('authToken');
 
 const response = await fetch(
 `${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/payments/enhanced/intent`,
 {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 bookingId: booking._id,
 amount,
 paymentMethod: 'mpesa',
 currency: 'KES',
 phoneNumber
 })
 }
 );

 if (!response.ok) {
 throw new Error('Failed to initiate M-Pesa payment');
 }

 const data = await response.json();
 
 Alert.alert(
 'M-Pesa Payment',
 'Please check your phone for the M-Pesa payment prompt and enter your PIN to complete the transaction.',
 [{ text: 'OK' }]
 );

 // Payment will be confirmed via callback
 onPaymentSuccess({
 method: 'mpesa',
 transactionId: data.transaction,
 status: 'pending'
 });
 onClose();

 } catch (error) {
 throw error;
 }
 };

 const confirmPayment = async (transactionId: string, paymentIntentId: string) => {
 try {
 const token = await AsyncStorage.getItem('authToken');
 
 const response = await fetch(
 `${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/payments/enhanced/confirm`,
 {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 transactionId,
 paymentIntentId
 })
 }
 );

 if (!response.ok) {
 throw new Error('Failed to confirm payment');
 }

 const data = await response.json();
 
 Alert.alert(
 'Payment Successful',
 'Your payment has been processed and transferred to escrow. Funds will be released to the technician upon job completion.',
 [{ text: 'OK' }]
 );

 onPaymentSuccess({
 method: selectedMethod?.id ?? '',
 transactionId,
 status: 'completed'
 });
 onClose();

 } catch (error) {
 throw error;
 }
 };

 const renderPaymentMethod = (method: PaymentMethod) => {
 const isSelected = selectedMethod?.id === method.id;
 const isAvailable = !method.region || 
 (method.region === 'Kenya' && userLocation?.country === 'Kenya');

 return (
 <TouchableOpacity
 key={method.id}
 style={[
 styles.paymentMethod,
 isSelected && styles.selectedPaymentMethod,
 !isAvailable && styles.disabledPaymentMethod
 ]}
 onPress={() => isAvailable && handlePaymentMethodSelect(method)}
 disabled={!isAvailable}
 >
 <View style={styles.methodHeader}>
 <Ionicons
 name={method.icon}
 size={24}
 color={isSelected ? '#0d6efd' : '#666'}
 />
 <View style={styles.methodInfo}>
 <Text style={[
 styles.methodName,
 isSelected && styles.selectedMethodText,
 !isAvailable && styles.disabledMethodText
 ]}>
 {method.name}
 </Text>
 <Text style={[
 styles.methodDescription,
 !isAvailable && styles.disabledMethodText
 ]}>
 {method.description}
 </Text>
 {method.region && (
 <Text style={styles.methodRegion}>
 Available in: {method.region}
 </Text>
 )}
 </View>
 {isSelected && (
 <Ionicons name="checkmark-circle" size={24} color="#0d6efd" />
 )}
 </View>
 </TouchableOpacity>
 );
 };

 return (
 <Modal
 visible={visible}
 animationType="slide"
 presentationStyle="pageSheet"
 >
 <SafeAreaView style={styles.container}>
 <View style={styles.header}>
 <TouchableOpacity onPress={onClose} style={styles.closeButton}>
 <Ionicons name="close" size={24} color="#333" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Payment</Text>
 <View style={styles.placeholder} />
 </View>

 <ScrollView style={styles.content}>
 <View style={styles.paymentSummary}>
 <Text style={styles.summaryTitle}>Payment Summary</Text>
 <View style={styles.summaryRow}>
 <Text style={styles.summaryLabel}>Service:</Text>
 <Text style={styles.summaryValue}>{booking.serviceType}</Text>
 </View>
 <View style={styles.summaryRow}>
 <Text style={styles.summaryLabel}>Amount:</Text>
 <Text style={styles.summaryValue}>${amount}</Text>
 </View>
 <View style={styles.summaryRow}>
 <Text style={styles.summaryLabel}>Escrow Fee:</Text>
 <Text style={styles.summaryValue}>Included</Text>
 </View>
 <View style={[styles.summaryRow, styles.totalRow]}>
 <Text style={styles.totalLabel}>Total:</Text>
 <Text style={styles.totalValue}>${amount}</Text>
 </View>
 </View>

 <View style={styles.paymentMethods}>
 <Text style={styles.sectionTitle}>Select Payment Method</Text>
 {paymentMethods.map(renderPaymentMethod)}
 </View>

 {selectedMethod?.id === 'mpesa' && (
 <View style={styles.mpesaForm}>
 <Text style={styles.inputLabel}>Phone Number</Text>
 <TextInput
 style={styles.phoneInput}
 value={phoneNumber}
 onChangeText={setPhoneNumber}
 placeholder="254712345678"
 keyboardType="phone-pad"
 maxLength={13}
 />
 <Text style={styles.inputHelp}>
 Enter your M-Pesa registered phone number
 </Text>
 </View>
 )}

 <View style={styles.securityInfo}>
 <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
 <Text style={styles.securityText}>
 Your payment is secured by industry-standard encryption. 
 Funds are held in escrow until service completion.
 </Text>
 </View>
 </ScrollView>

 <View style={styles.footer}>
 <TouchableOpacity
 style={[
 styles.payButton,
 (!selectedMethod || loading) && styles.payButtonDisabled
 ]}
 onPress={processPayment}
 disabled={!selectedMethod || loading}
 >
 {loading ? (
 <ActivityIndicator color="white" />
 ) : (
 <Text style={styles.payButtonText}>
 Pay ${amount}
 </Text>
 )}
 </TouchableOpacity>
 </View>
 </SafeAreaView>
 </Modal>
 );
};

const PaymentScreen = (props: any) => {
 // For web compatibility, we'll handle Stripe differently
 if (Platform.OS === 'web') {
 return <PaymentModal {...props} />;
 }
 
 // For native platforms, we could conditionally load Stripe
 return <PaymentModal {...props} />;
};

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#fff',
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingHorizontal: 16,
 paddingVertical: 12,
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 },
 closeButton: {
 padding: 8,
 },
 headerTitle: {
 fontSize: 18,
 fontWeight: '600',
 color: '#333',
 },
 placeholder: {
 width: 40,
 },
 content: {
 flex: 1,
 paddingHorizontal: 16,
 },
 paymentSummary: {
 backgroundColor: '#f8f9fa',
 borderRadius: 12,
 padding: 16,
 marginVertical: 16,
 },
 summaryTitle: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginBottom: 12,
 },
 summaryRow: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: 8,
 },
 summaryLabel: {
 fontSize: 14,
 color: '#666',
 },
 summaryValue: {
 fontSize: 14,
 color: '#333',
 fontWeight: '500',
 },
 totalRow: {
 borderTopWidth: 1,
 borderTopColor: '#dee2e6',
 paddingTop: 8,
 marginTop: 8,
 },
 totalLabel: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 },
 totalValue: {
 fontSize: 16,
 fontWeight: '600',
 color: '#0d6efd',
 },
 paymentMethods: {
 marginVertical: 16,
 },
 sectionTitle: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginBottom: 12,
 },
 paymentMethod: {
 borderWidth: 1,
 borderColor: '#dee2e6',
 borderRadius: 12,
 padding: 16,
 marginBottom: 12,
 },
 selectedPaymentMethod: {
 borderColor: '#0d6efd',
 backgroundColor: '#f8f9ff',
 },
 disabledPaymentMethod: {
 opacity: 0.5,
 },
 methodHeader: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 methodInfo: {
 flex: 1,
 marginLeft: 12,
 },
 methodName: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginBottom: 2,
 },
 selectedMethodText: {
 color: '#0d6efd',
 },
 disabledMethodText: {
 color: '#999',
 },
 methodDescription: {
 fontSize: 14,
 color: '#666',
 },
 methodRegion: {
 fontSize: 12,
 color: '#999',
 marginTop: 2,
 },
 mpesaForm: {
 marginVertical: 16,
 },
 inputLabel: {
 fontSize: 14,
 fontWeight: '500',
 color: '#333',
 marginBottom: 8,
 },
 phoneInput: {
 borderWidth: 1,
 borderColor: '#dee2e6',
 borderRadius: 8,
 padding: 12,
 fontSize: 16,
 backgroundColor: '#fff',
 },
 inputHelp: {
 fontSize: 12,
 color: '#666',
 marginTop: 4,
 },
 securityInfo: {
 flexDirection: 'row',
 alignItems: 'flex-start',
 backgroundColor: '#f0f9ff',
 padding: 12,
 borderRadius: 8,
 marginVertical: 16,
 },
 securityText: {
 flex: 1,
 fontSize: 12,
 color: '#666',
 marginLeft: 8,
 lineHeight: 16,
 },
 footer: {
 padding: 16,
 borderTopWidth: 1,
 borderTopColor: '#eee',
 },
 payButton: {
 backgroundColor: '#0d6efd',
 borderRadius: 12,
 padding: 16,
 alignItems: 'center',
 },
 payButtonDisabled: {
 backgroundColor: '#ccc',
 },
 payButtonText: {
 color: 'white',
 fontSize: 16,
 fontWeight: '600',
 },
});

export default PaymentScreen;
