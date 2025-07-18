// Screens/WithdrawFundsScreen.js
// Screen for withdrawing funds from wallet to external accounts

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

export default function WithdrawFundsScreen({ navigation }) {
  // Authentication context
  const { user } = useAuth();

  // Component state
  const [amount, setAmount] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [isLoading, setIsLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  
  // Withdrawal destination details
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    bankName: '',
  });

  const [paypalEmail, setPaypalEmail] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');

  // Withdrawal methods
  const withdrawalMethods = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: 'business',
      processingTime: '1-3 business days',
      fee: 'Free',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'logo-paypal',
      processingTime: 'Instant',
      fee: 'KES 25',
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: 'phone-portrait',
      processingTime: 'Instant',
      fee: 'KES 10',
    },
  ];

  // Load wallet balance on component mount
  useEffect(() => {
    loadWalletBalance();
  }, []);

  /**
   * Load available wallet balance
   */
  const loadWalletBalance = async () => {
    try {
      setWalletLoading(true);
      const result = await EscrowService.getWalletBalance(user.id);
      
      if (result.success) {
        setAvailableBalance(result.wallet.availableBalance);
      } else {
        Alert.alert('Error', 'Failed to load wallet balance');
      }
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      Alert.alert('Error', 'Failed to load wallet balance');
    } finally {
      setWalletLoading(false);
    }
  };

  /**
   * Validate withdrawal form
   */
  const validateForm = () => {
    // Validate amount
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }

    if (numAmount > availableBalance) {
      Alert.alert('Insufficient Funds', 'Amount exceeds available balance');
      return false;
    }

    // Minimum withdrawal amount
    if (numAmount < 1000) {
      Alert.alert('Minimum Amount', 'Minimum withdrawal amount is KES 1,000');
      return false;
    }

    // Validate destination details based on selected method
    switch (selectedMethod) {
      case 'bank_transfer':
        if (!bankDetails.accountNumber || !bankDetails.routingNumber || 
            !bankDetails.accountHolderName || !bankDetails.bankName) {
          Alert.alert('Bank Details Required', 'Please fill in all bank account details');
          return false;
        }
        break;

      case 'paypal':
        if (!paypalEmail) {
          Alert.alert('PayPal Email Required', 'Please enter your PayPal email address');
          return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(paypalEmail)) {
          Alert.alert('Invalid Email', 'Please enter a valid PayPal email address');
          return false;
        }
        break;

      case 'mpesa':
        if (!mpesaPhone) {
          Alert.alert('Phone Number Required', 'Please enter your M-Pesa phone number');
          return false;
        }
        const formattedPhone = PaymentService.formatPhoneNumberForMPesa(mpesaPhone);
        if (!PaymentService.validateKenyanPhoneNumber(formattedPhone)) {
          Alert.alert('Invalid Phone Number', 'Please enter a valid Kenyan phone number');
          return false;
        }
        break;
    }

    return true;
  };

  /**
   * Process withdrawal
   */
  const handleWithdraw = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      const numAmount = parseFloat(amount);
      
      // Prepare withdrawal data
      const withdrawalData = {
        amount: numAmount,
        currency: 'KES', // Always use KES for Kenyan market
        withdrawMethod: selectedMethod,
        userId: user.id,
      };

      // Add destination details based on method
      switch (selectedMethod) {
        case 'bank_transfer':
          withdrawalData.destination = {
            type: 'bank_account',
            ...bankDetails,
          };
          break;

        case 'paypal':
          withdrawalData.destination = {
            type: 'paypal',
            email: paypalEmail,
          };
          break;

        case 'mpesa':
          withdrawalData.destination = {
            type: 'mpesa',
            phoneNumber: PaymentService.formatPhoneNumberForMPesa(mpesaPhone),
          };
          break;
      }

      // Process the withdrawal
      const result = await EscrowService.withdrawFundsFromWallet(withdrawalData);

      if (result.success) {
        // Show success message
        const methodName = withdrawalMethods.find(m => m.id === selectedMethod)?.name;
        const processingTime = withdrawalMethods.find(m => m.id === selectedMethod)?.processingTime;
        
        Alert.alert(
          'Withdrawal Initiated',
          `Your withdrawal of ${PaymentService.formatCurrency(numAmount, withdrawalData.currency)} to ${methodName} has been initiated. Processing time: ${processingTime}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Withdrawal Failed', result.error || 'Failed to process withdrawal');
      }

    } catch (error) {
      console.error('Error processing withdrawal:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render destination input fields based on selected method
   */
  const renderDestinationFields = () => {
    switch (selectedMethod) {
      case 'bank_transfer':
        return (
          <View style={styles.destinationFields}>
            <Text style={styles.fieldLabel}>Bank Account Details</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Account Holder Name"
              value={bankDetails.accountHolderName}
              onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolderName: text }))}
            />
            
            <TextInput
              style={styles.textInput}
              placeholder="Bank Name"
              value={bankDetails.bankName}
              onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
            />
            
            <TextInput
              style={styles.textInput}
              placeholder="Account Number"
              value={bankDetails.accountNumber}
              onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountNumber: text }))}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.textInput}
              placeholder="Routing Number"
              value={bankDetails.routingNumber}
              onChangeText={(text) => setBankDetails(prev => ({ ...prev, routingNumber: text }))}
              keyboardType="numeric"
            />
          </View>
        );

      case 'paypal':
        return (
          <View style={styles.destinationFields}>
            <Text style={styles.fieldLabel}>PayPal Account</Text>
            <TextInput
              style={styles.textInput}
              placeholder="PayPal Email Address"
              value={paypalEmail}
              onChangeText={setPaypalEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        );

      case 'mpesa':
        return (
          <View style={styles.destinationFields}>
            <Text style={styles.fieldLabel}>M-Pesa Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="07XXXXXXXX or 254XXXXXXXXX"
              value={mpesaPhone}
              onChangeText={setMpesaPhone}
              keyboardType="phone-pad"
              maxLength={12}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const selectedMethodInfo = withdrawalMethods.find(m => m.id === selectedMethod);

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
          <Text style={styles.headerTitle}>Withdraw Funds</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Available Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          {walletLoading ? (
            <ActivityIndicator size="small" color="#0d6efd" />
          ) : (
            <Text style={styles.balanceAmount}>
              {PaymentService.formatCurrency(availableBalance)}
            </Text>
          )}
        </View>

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
          
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>KES</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              maxLength={10}
            />
            <TouchableOpacity
              style={styles.maxButton}
              onPress={() => setAmount(availableBalance.toString())}
            >
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.amountNote}>
            Minimum withdrawal: KES 1,000
          </Text>
        </View>

        {/* Withdrawal Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Method</Text>
          
          {withdrawalMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.selectedMethodCard,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <Ionicons
                name={method.icon}
                size={28}
                color={selectedMethod === method.id ? '#0d6efd' : '#6c757d'}
              />
              <View style={styles.methodInfo}>
                <Text
                  style={[
                    styles.methodName,
                    selectedMethod === method.id && styles.selectedMethodName,
                  ]}
                >
                  {method.name}
                </Text>
                <Text style={styles.methodDetails}>
                  {method.processingTime} • Fee: {method.fee}
                </Text>
              </View>
              {selectedMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color="#0d6efd" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Destination Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destination Details</Text>
          {renderDestinationFields()}
        </View>

        {/* Summary Section */}
        {amount && selectedMethodInfo && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Withdrawal Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>
                  {PaymentService.formatCurrency(parseFloat(amount) || 0)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Method</Text>
                <Text style={styles.summaryValue}>{selectedMethodInfo.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee</Text>
                <Text style={styles.summaryValue}>{selectedMethodInfo.fee}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Processing Time</Text>
                <Text style={styles.summaryValue}>{selectedMethodInfo.processingTime}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Withdraw Button */}
        <TouchableOpacity
          style={[styles.withdrawButton, isLoading && styles.disabledButton]}
          onPress={handleWithdraw}
          disabled={isLoading || !amount || walletLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          )}
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color="#28a745" />
          <Text style={styles.securityText}>
            Withdrawals are processed securely and cannot be reversed
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
  balanceCard: {
    backgroundColor: '#0d6efd',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
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
  maxButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  maxButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  amountNote: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedMethodCard: {
    borderColor: '#0d6efd',
    backgroundColor: '#e3f2fd',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  selectedMethodName: {
    color: '#0d6efd',
  },
  methodDetails: {
    fontSize: 14,
    color: '#6c757d',
  },
  destinationFields: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
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
  withdrawButton: {
    backgroundColor: '#dc3545',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  withdrawButtonText: {
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
