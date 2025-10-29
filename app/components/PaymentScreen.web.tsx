/**
 * Simple Payment Screen Mock for Web
 * 
 * This is a simplified version of the payment screen for web compatibility
 * without native Stripe dependencies
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
 Alert,
 Modal,
 SafeAreaView,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View
} from 'react-native';

type PaymentModalProps = {
 visible: boolean;
 onClose: () => void;
 booking?: any;
 amount: number;
 onPaymentSuccess?: (result: { transactionId: string; method: string; amount: number }) => void;
};

const PaymentModal: React.FC<PaymentModalProps> = ({ visible, onClose, booking, amount, onPaymentSuccess }) => {
 const [selectedMethod, setSelectedMethod] = useState('card');
 const [loading, setLoading] = useState(false);
 const [phoneNumber, setPhoneNumber] = useState('');

 const paymentMethods = [
 {
 id: 'card',
 name: 'Credit/Debit Card',
 icon: 'card',
 description: 'Visa, MasterCard, etc.',
 enabled: true
 },
 {
 id: 'paypal',
 name: 'PayPal',
 icon: 'logo-paypal',
 description: 'Pay with PayPal account',
 enabled: true
 },
 {
 id: 'mpesa',
 name: 'M-Pesa',
 icon: 'phone-portrait',
 description: 'Mobile money (Kenya)',
 enabled: true
 }
 ];

 const handlePayment = async () => {
 if (!selectedMethod) {
 Alert.alert('Error', 'Please select a payment method');
 return;
 }

 setLoading(true);
 
 try {
 // Simulate payment processing
 await new Promise(resolve => setTimeout(resolve, 2000));
 
 Alert.alert(
 'Payment Successful',
 `Payment of $${amount} processed successfully via ${paymentMethods.find(m => m.id === selectedMethod)?.name}`,
 [
 {
 text: 'OK',
 onPress: () => {
 onPaymentSuccess?.({
 transactionId: `txn_${Date.now()}`,
 method: selectedMethod,
 amount
 });
 onClose();
 }
 }
 ]
 );
 } catch (error) {
 Alert.alert('Payment Failed', 'Please try again');
 } finally {
 setLoading(false);
 }
 };

 type PaymentMethod = {
 id: string;
 name: string;
 icon: string;
 description: string;
 enabled: boolean;
 };

 const renderPaymentMethod = (method: PaymentMethod) => {
 const isSelected = selectedMethod === method.id;
 
 return (
 <TouchableOpacity
 key={method.id}
 style={[
 styles.paymentMethod,
 isSelected && styles.paymentMethodSelected
 ]}
 onPress={() => setSelectedMethod(method.id)}
 disabled={!method.enabled}
 >
 <View style={styles.paymentMethodContent}>
 <Ionicons
 name={method.icon as any}
 size={24}
 color={isSelected ? '#007AFF' : '#666'}
 />
 <View style={styles.paymentMethodText}>
 <Text style={[
 styles.paymentMethodName,
 isSelected && styles.paymentMethodNameSelected
 ]}>
 {method.name}
 </Text>
 <Text style={styles.paymentMethodDescription}>
 {method.description}
 </Text>
 </View>
 {isSelected && (
 <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
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
 onRequestClose={onClose}
 >
 <SafeAreaView style={styles.container}>
 <View style={styles.header}>
 <TouchableOpacity onPress={onClose} style={styles.closeButton}>
 <Ionicons name="close" size={24} color="#333" />
 </TouchableOpacity>
 <Text style={styles.title}>Payment</Text>
 <View style={styles.placeholder} />
 </View>

 <View style={styles.content}>
 <View style={styles.amountSection}>
 <Text style={styles.amountLabel}>Amount to Pay</Text>
 <Text style={styles.amount}>${amount}</Text>
 </View>

 <View style={styles.methodsSection}>
 <Text style={styles.sectionTitle}>Select Payment Method</Text>
 {paymentMethods.map(renderPaymentMethod)}
 </View>

 {selectedMethod === 'mpesa' && (
 <View style={styles.mpesaSection}>
 <Text style={styles.inputLabel}>Phone Number</Text>
 <TextInput
 style={styles.textInput}
 value={phoneNumber}
 onChangeText={setPhoneNumber}
 placeholder="254XXXXXXXXX"
 keyboardType="phone-pad"
 maxLength={12}
 />
 </View>
 )}

 <TouchableOpacity
 style={[
 styles.payButton,
 loading && styles.payButtonDisabled
 ]}
 onPress={handlePayment}
 disabled={loading}
 >
 {loading ? (
 <Text style={styles.payButtonText}>Processing...</Text>
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

const PaymentScreen: React.FC<PaymentModalProps> = (props) => {
 return <PaymentModal {...props} />;
};

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f8f9fa'
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingHorizontal: 20,
 paddingVertical: 15,
 borderBottomWidth: 1,
 borderBottomColor: '#e0e0e0',
 backgroundColor: '#fff'
 },
 closeButton: {
 padding: 8
 },
 title: {
 fontSize: 18,
 fontWeight: '600',
 color: '#333'
 },
 placeholder: {
 width: 40
 },
 content: {
 flex: 1,
 padding: 20
 },
 amountSection: {
 backgroundColor: '#fff',
 padding: 20,
 borderRadius: 12,
 marginBottom: 20,
 alignItems: 'center'
 },
 amountLabel: {
 fontSize: 16,
 color: '#666',
 marginBottom: 8
 },
 amount: {
 fontSize: 32,
 fontWeight: 'bold',
 color: '#333'
 },
 methodsSection: {
 marginBottom: 20
 },
 sectionTitle: {
 fontSize: 18,
 fontWeight: '600',
 color: '#333',
 marginBottom: 15
 },
 paymentMethod: {
 backgroundColor: '#fff',
 padding: 16,
 borderRadius: 12,
 marginBottom: 12,
 borderWidth: 2,
 borderColor: '#e0e0e0'
 },
 paymentMethodSelected: {
 borderColor: '#007AFF'
 },
 paymentMethodContent: {
 flexDirection: 'row',
 alignItems: 'center'
 },
 paymentMethodText: {
 flex: 1,
 marginLeft: 15
 },
 paymentMethodName: {
 fontSize: 16,
 fontWeight: '500',
 color: '#333'
 },
 paymentMethodNameSelected: {
 color: '#007AFF'
 },
 paymentMethodDescription: {
 fontSize: 14,
 color: '#666',
 marginTop: 2
 },
 mpesaSection: {
 backgroundColor: '#fff',
 padding: 20,
 borderRadius: 12,
 marginBottom: 20
 },
 inputLabel: {
 fontSize: 16,
 fontWeight: '500',
 color: '#333',
 marginBottom: 8
 },
 textInput: {
 borderWidth: 1,
 borderColor: '#ddd',
 borderRadius: 8,
 padding: 12,
 fontSize: 16
 },
 payButton: {
 backgroundColor: '#007AFF',
 paddingVertical: 16,
 borderRadius: 12,
 alignItems: 'center',
 marginTop: 'auto'
 },
 payButtonDisabled: {
 backgroundColor: '#ccc'
 },
 payButtonText: {
 color: '#fff',
 fontSize: 18,
 fontWeight: '600'
 }
});

export default PaymentScreen;
