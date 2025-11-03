// Screens/AddFundsScreen.js
// Screen for adding funds to wallet using multiple payment methods

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
 ActivityIndicator,
 Alert,
 KeyboardAvoidingView,
 Platform,
 ScrollView,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import EscrowService from '../services/EscrowService';
import PaymentService from '../services/PaymentService';

export default function AddFundsScreen({ navigation }) {
 // Authentication context
 const { user } = useAuth();

 // Component state
 const [amount, setAmount] = useState('');
 const [selectedMethod, setSelectedMethod] = useState(null);
 const [paymentMethods, setPaymentMethods] = useState([]);
 const [isLoading, setIsLoading] = useState(false);
 const [phoneNumber, setPhoneNumber] = useState('');
 const [bankAccount, setBankAccount] = useState({
 accountNumber: '',
 routingNumber: '',
 accountHolderName: '',
 bankName: '',
 });

 // Quick amount presets
 const quickAmounts = [50, 100, 200, 500];

 // Load available payment methods on component mount
 useEffect(() => {
 loadPaymentMethods();
 }, []);

 /**
 * Load available payment methods based on user location
 */
 const loadPaymentMethods = () => {
 // Get supported payment methods (mock user location as US for demo)
 const methods = PaymentService.getSupportedPaymentMethods('US');
 setPaymentMethods(methods);
 
 // Set default payment method
 if (methods.length > 0) {
 setSelectedMethod(methods[0]);
 }
 };

 /**
 * Handle quick amount selection
 */
 const handleQuickAmount = (quickAmount) => {
 setAmount(quickAmount.toString());
 };

 /**
 * Validate form input
 */
 const validateForm = () => {
 // Validate amount
 const numAmount = parseFloat(amount);
 if (!amount || isNaN(numAmount) || numAmount <= 0) {
 Alert.alert('Invalid Amount', 'Please enter a valid amount');
 return false;
 }

 // Validate payment method selection
 if (!selectedMethod) {
 Alert.alert('Payment Method Required', 'Please select a payment method');
 return false;
 }

 // Validate MPesa phone number if selected
 if (selectedMethod.id === 'mpesa') {
 if (!phoneNumber) {
 Alert.alert('Phone Number Required', 'Please enter your MPesa phone number');
 return false;
 }
 
 const formattedPhone = PaymentService.formatPhoneNumberForMPesa(phoneNumber);
 if (!PaymentService.validateKenyanPhoneNumber(formattedPhone)) {
 Alert.alert('Invalid Phone Number', 'Please enter a valid Kenyan phone number (07XXXXXXXX or 254XXXXXXXXX)');
 return false;
 }
 }

 // Validate bank account details if selected
 if (selectedMethod.id === 'bank_transfer') {
 if (!bankAccount.accountNumber || !bankAccount.routingNumber || !bankAccount.accountHolderName) {
 Alert.alert('Bank Details Required', 'Please fill in all bank account details');
 return false;
 }
 }

 return true;
 };

 /**
 * Process fund addition
 */
 const handleAddFunds = async () => {
 if (!validateForm()) {
 return;
 }

 try {
 setIsLoading(true);
 
 const numAmount = parseFloat(amount);
 
 // Prepare funding data based on selected method
 const fundingData = {
 amount: numAmount,
 currency: 'USD', // Default currency
 paymentMethod: selectedMethod.id,
 userId: user.id,
 };

 // Add method-specific data
 switch (selectedMethod.id) {
 case 'mpesa':
 fundingData.phoneNumber = PaymentService.formatPhoneNumberForMPesa(phoneNumber);
 fundingData.currency = 'KES'; // MPesa uses KES
 break;
 
 case 'bank_transfer':
 fundingData.bankAccount = bankAccount;
 break;
 }

 // Process the funding
 const result = await EscrowService.addFundsToWallet(fundingData);

 if (result.success) {
 // Show success message
 Alert.alert(
 'Funds Added Successfully',
 `${PaymentService.formatCurrency(numAmount, fundingData.currency)} has been added to your wallet.`,
 [
 {
 text: 'OK',
 onPress: () => navigation.goBack(),
 },
 ]
 );
 } else {
 Alert.alert('Payment Failed', result.error || 'Failed to add funds to wallet');
 }

 } catch (error) {
 console.error('Error adding funds:', error);
 Alert.alert('Error', 'An unexpected error occurred. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 /**
 * Render payment method option
 */
 const renderPaymentMethod = (method) => (
 <TouchableOpacity
 key={method.id}
 style={[
 styles.paymentMethodCard,
 selectedMethod?.id === method.id && styles.selectedPaymentMethod,
 ]}
 onPress={() => setSelectedMethod(method)}
 >
 <Ionicons
 name={method.icon}
 size={28}
 color={selectedMethod?.id === method.id ? '#0d6efd' : '#6c757d'}
 />
 <Text
 style={[
 styles.paymentMethodText,
 selectedMethod?.id === method.id && styles.selectedPaymentMethodText,
 ]}
 >
 {method.name}
 </Text>
 {selectedMethod?.id === method.id && (
 <Ionicons name="checkmark-circle" size={24} color="#0d6efd" />
 )}
 </TouchableOpacity>
 );

 /**
 * Render method-specific input fields
 */
 const renderMethodSpecificFields = () => {
 if (!selectedMethod) return null;

 switch (selectedMethod.id) {
 case 'mpesa':
 return (
 <View style={styles.methodFields}>
 <Text style={styles.fieldLabel}>MPesa Phone Number</Text>
 <TextInput
 style={styles.textInput}
 placeholder="07XXXXXXXX or 254XXXXXXXXX"
 value={phoneNumber}
 onChangeText={setPhoneNumber}
 keyboardType="phone-pad"
 maxLength={12}
 />
 <Text style={styles.fieldNote}>
 You will receive an STK push notification to complete the payment
 </Text>
 </View>
 );

 case 'bank_transfer':
 return (
 <View style={styles.methodFields}>
 <Text style={styles.fieldLabel}>Bank Account Details</Text>
 
 <TextInput
 style={styles.textInput}
 placeholder="Account Holder Name"
 value={bankAccount.accountHolderName}
 onChangeText={(text) => setBankAccount(prev => ({ ...prev, accountHolderName: text }))}
 />
 
 <TextInput
 style={styles.textInput}
 placeholder="Bank Name"
 value={bankAccount.bankName}
 onChangeText={(text) => setBankAccount(prev => ({ ...prev, bankName: text }))}
 />
 
 <TextInput
 style={styles.textInput}
 placeholder="Account Number"
 value={bankAccount.accountNumber}
 onChangeText={(text) => setBankAccount(prev => ({ ...prev, accountNumber: text }))}
 keyboardType="numeric"
 />
 
 <TextInput
 style={styles.textInput}
 placeholder="Routing Number"
 value={bankAccount.routingNumber}
 onChangeText={(text) => setBankAccount(prev => ({ ...prev, routingNumber: text }))}
 keyboardType="numeric"
 />
 
 <Text style={styles.fieldNote}>
 Bank transfers may take 1-3 business days to process
 </Text>
 </View>
 );

 default:
 return null;
 }
 };

 return (
 <KeyboardAvoidingView
 style={styles.container}
 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
 >
 <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity
 style={styles.backButton}
 onPress={() => navigation.goBack()}
 >
 <Ionicons name="arrow-back" size={24} color="#212529" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Add Funds</Text>
 <View style={styles.placeholder} />
 </View>

 {/* Amount Section */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Amount</Text>
 
 {/* Quick Amount Buttons */}
 <View style={styles.quickAmounts}>
 {quickAmounts.map((quickAmount) => (
 <TouchableOpacity
 key={quickAmount}
 style={[
 styles.quickAmountButton,
 amount === quickAmount.toString() && styles.selectedQuickAmount,
 ]}
 onPress={() => handleQuickAmount(quickAmount)}
 >
 <Text
 style={[
 styles.quickAmountText,
 amount === quickAmount.toString() && styles.selectedQuickAmountText,
 ]}
 >
 ${quickAmount}
 </Text>
 </TouchableOpacity>
 ))}
 </View>

 {/* Custom Amount Input */}
 <View style={styles.amountInputContainer}>
 <Text style={styles.currencySymbol}>$</Text>
 <TextInput
 style={styles.amountInput}
 placeholder="Enter amount"
 value={amount}
 onChangeText={setAmount}
 keyboardType="decimal-pad"
 maxLength={10}
 />
 </View>
 </View>

 {/* Payment Methods Section */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Payment Method</Text>
 
 {paymentMethods.map(renderPaymentMethod)}
 
 {/* Method-specific fields */}
 {renderMethodSpecificFields()}
 </View>

 {/* Summary Section */}
 {amount && selectedMethod && (
 <View style={styles.summarySection}>
 <Text style={styles.sectionTitle}>Summary</Text>
 <View style={styles.summaryCard}>
 <View style={styles.summaryRow}>
 <Text style={styles.summaryLabel}>Amount</Text>
 <Text style={styles.summaryValue}>
 {PaymentService.formatCurrency(
 parseFloat(amount) || 0,
 selectedMethod.id === 'mpesa' ? 'KES' : 'USD'
 )}
 </Text>
 </View>
 <View style={styles.summaryRow}>
 <Text style={styles.summaryLabel}>Payment Method</Text>
 <Text style={styles.summaryValue}>{selectedMethod.name}</Text>
 </View>
 <View style={styles.summaryRow}>
 <Text style={styles.summaryLabel}>Processing Fee</Text>
 <Text style={styles.summaryValue}>Free</Text>
 </View>
 <View style={[styles.summaryRow, styles.totalRow]}>
 <Text style={styles.totalLabel}>Total</Text>
 <Text style={styles.totalValue}>
 {PaymentService.formatCurrency(
 parseFloat(amount) || 0,
 selectedMethod.id === 'mpesa' ? 'KES' : 'USD'
 )}
 </Text>
 </View>
 </View>
 </View>
 )}

 {/* Add Funds Button */}
 <TouchableOpacity
 style={[styles.addFundsButton, isLoading && styles.disabledButton]}
 onPress={handleAddFunds}
 disabled={isLoading || !amount || !selectedMethod}
 >
 {isLoading ? (
 <ActivityIndicator color="#fff" size="small" />
 ) : (
 <Text style={styles.addFundsButtonText}>Add Funds</Text>
 )}
 </TouchableOpacity>

 {/* Security Note */}
 <View style={styles.securityNote}>
 <Ionicons name="shield-checkmark" size={20} color="#28a745" />
 <Text style={styles.securityText}>
 Your payment is secured with bank-level encryption
 </Text>
 </View>
 </ScrollView>
 </KeyboardAvoidingView>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f7fa',
 },
 scrollView: {
 flex: 1,
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingTop: 50,
 paddingBottom: 20,
 paddingHorizontal: 20,
 backgroundColor: '#fff',
 borderBottomWidth: 1,
 borderBottomColor: '#e9ecef',
 },
 backButton: {
 padding: 8,
 },
 headerTitle: {
 fontSize: 20,
 fontWeight: 'bold',
 color: '#212529',
 },
 placeholder: {
 width: 40,
 },
 section: {
 margin: 20,
 },
 sectionTitle: {
 fontSize: 18,
 fontWeight: 'bold',
 color: '#212529',
 marginBottom: 16,
 },
 quickAmounts: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: 20,
 },
 quickAmountButton: {
 flex: 1,
 backgroundColor: '#fff',
 paddingVertical: 12,
 paddingHorizontal: 8,
 borderRadius: 8,
 borderWidth: 2,
 borderColor: '#e9ecef',
 marginHorizontal: 4,
 alignItems: 'center',
 },
 selectedQuickAmount: {
 borderColor: '#0d6efd',
 backgroundColor: '#e3f2fd',
 },
 quickAmountText: {
 fontSize: 16,
 fontWeight: '600',
 color: '#6c757d',
 },
 selectedQuickAmountText: {
 color: '#0d6efd',
 },
 amountInputContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#fff',
 borderRadius: 8,
 borderWidth: 2,
 borderColor: '#e9ecef',
 paddingHorizontal: 16,
 },
 currencySymbol: {
 fontSize: 20,
 fontWeight: 'bold',
 color: '#212529',
 marginRight: 8,
 },
 amountInput: {
 flex: 1,
 fontSize: 20,
 fontWeight: '600',
 color: '#212529',
 paddingVertical: 16,
 },
 paymentMethodCard: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#fff',
 padding: 16,
 borderRadius: 12,
 marginBottom: 12,
 borderWidth: 2,
 borderColor: '#e9ecef',
 },
 selectedPaymentMethod: {
 borderColor: '#0d6efd',
 backgroundColor: '#e3f2fd',
 },
 paymentMethodText: {
 flex: 1,
 fontSize: 16,
 fontWeight: '600',
 color: '#6c757d',
 marginLeft: 12,
 },
 selectedPaymentMethodText: {
 color: '#0d6efd',
 },
 methodFields: {
 backgroundColor: '#fff',
 padding: 16,
 borderRadius: 12,
 marginTop: 12,
 },
 fieldLabel: {
 fontSize: 16,
 fontWeight: '600',
 color: '#212529',
 marginBottom: 12,
 },
 textInput: {
 backgroundColor: '#f8f9fa',
 borderWidth: 1,
 borderColor: '#dee2e6',
 borderRadius: 8,
 paddingHorizontal: 12,
 paddingVertical: 12,
 fontSize: 16,
 color: '#212529',
 marginBottom: 12,
 },
 fieldNote: {
 fontSize: 14,
 color: '#6c757d',
 fontStyle: 'italic',
 marginTop: 8,
 },
 summarySection: {
 margin: 20,
 marginTop: 0,
 },
 summaryCard: {
 backgroundColor: '#fff',
 padding: 16,
 borderRadius: 12,
 borderWidth: 1,
 borderColor: '#e9ecef',
 },
 summaryRow: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 paddingVertical: 8,
 },
 summaryLabel: {
 fontSize: 16,
 color: '#6c757d',
 },
 summaryValue: {
 fontSize: 16,
 fontWeight: '600',
 color: '#212529',
 },
 totalRow: {
 borderTopWidth: 1,
 borderTopColor: '#e9ecef',
 marginTop: 8,
 paddingTop: 16,
 },
 totalLabel: {
 fontSize: 18,
 fontWeight: 'bold',
 color: '#212529',
 },
 totalValue: {
 fontSize: 18,
 fontWeight: 'bold',
 color: '#0d6efd',
 },
 addFundsButton: {
 backgroundColor: '#0d6efd',
 marginHorizontal: 20,
 marginBottom: 20,
 paddingVertical: 16,
 borderRadius: 12,
 alignItems: 'center',
 },
 disabledButton: {
 backgroundColor: '#6c757d',
 },
 addFundsButtonText: {
 color: '#fff',
 fontSize: 18,
 fontWeight: 'bold',
 },
 securityNote: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center',
 marginHorizontal: 20,
 marginBottom: 30,
 padding: 12,
 backgroundColor: '#d4edda',
 borderRadius: 8,
 },
 securityText: {
 fontSize: 14,
 color: '#155724',
 marginLeft: 8,
 fontWeight: '500',
 },
});
