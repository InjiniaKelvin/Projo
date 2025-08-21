/**
 * Payment Integration Screen
 * 
 * Modern payment UI with M-Pesa, card payments, and wallet integration
 * Features real-time payment status and receipt generation
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Type definitions
interface Booking {
  id: string;
  serviceName: string;
  technician: {
    name: string;
    phoneNumber: string;
  };
  pricing: {
    basePrice: number;
    urgencyFee: number;
    platformFee: number;
    totalAmount: number;
  };
  paymentDeadline: Date;
  escrowProtected: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  fees: string;
  popular?: boolean;
  balance?: number;
}

interface PaymentData {
  phoneNumber?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  bankAccount?: string;
}

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending'); // pending, processing, success, failed
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [animatedValue] = useState(new Animated.Value(0));

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: 'phone-portrait',
      color: '#00a651',
      description: 'Pay with your M-Pesa mobile money',
      fees: '0% transaction fee',
      popular: true
    },
    {
      id: 'wallet',
      name: 'QuickFix Wallet',
      icon: 'wallet',
      color: '#0d6efd',
      description: 'Use your wallet balance',
      fees: 'No fees',
      balance: walletBalance
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'card',
      color: '#6366f1',
      description: 'Visa, Mastercard, or American Express',
      fees: '2.9% processing fee'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: 'business',
      color: '#059669',
      description: 'Direct bank transfer',
      fees: '1.5% processing fee'
    }
  ];

  const loadBookingData = useCallback(() => {
    // Mock booking data - in real app, get from API
    const mockBooking: Booking = {
      id: (params.bookingId as string) || 'QF1234567890',
      serviceName: (params.serviceName as string) || 'Pipe Repair & Replacement',
      technician: {
        name: 'John Mwangi',
        phoneNumber: '+254712345678'
      },
      pricing: {
        basePrice: 3000,
        urgencyFee: 500,
        platformFee: 300,
        totalAmount: 3800
      },
      paymentDeadline: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      escrowProtected: true
    };
    setBooking(mockBooking);
  }, [params.bookingId, params.serviceName]);

  const loadWalletBalance = useCallback(async () => {
    try {
      // In real app, fetch from API
      setWalletBalance(5000);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  }, []);

  const startAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  useEffect(() => {
    loadBookingData();
    loadWalletBalance();
    startAnimation();
  }, [loadBookingData, loadWalletBalance, startAnimation]);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setPaymentData({});
  };

  const updatePaymentData = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePaymentData = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return false;
    }

    switch (selectedPaymentMethod.id) {
      case 'mpesa':
        if (!paymentData.phoneNumber) {
          Alert.alert('Error', 'Please enter your M-Pesa phone number');
          return false;
        }
        if (!/^254\d{9}$/.test(paymentData.phoneNumber.replace(/[^0-9]/g, ''))) {
          Alert.alert('Error', 'Please enter a valid M-Pesa phone number');
          return false;
        }
        break;
      case 'wallet':
        if (walletBalance < (booking?.pricing.totalAmount || 0)) {
          Alert.alert('Error', 'Insufficient wallet balance');
          return false;
        }
        break;
      case 'card':
        if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
          Alert.alert('Error', 'Please fill in all card details');
          return false;
        }
        break;
      case 'bank':
        if (!paymentData.bankAccount) {
          Alert.alert('Error', 'Please select your bank account');
          return false;
        }
        break;
    }

    return true;
  };

  const processPayment = async () => {
    if (!validatePaymentData()) return;

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock payment request based on method
      let paymentRequest = {
        bookingId: booking?.id || '',
        amount: booking?.pricing.totalAmount || 0,
        paymentMethod: selectedPaymentMethod?.id || '',
        ...paymentData
      };

      console.log('Processing payment:', paymentRequest);

      // Simulate success (in real app, call payment API)
      setPaymentStatus('success');
      
      // Navigate to booking status after payment
      setTimeout(() => {
        router.replace({
          pathname: '/booking/status',
          params: {
            bookingId: booking?.id || '',
            serviceName: booking?.serviceName || '',
            paymentConfirmed: 'true'
          }
        });
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethodCard = (method: PaymentMethod) => {
    const isSelected = selectedPaymentMethod?.id === method.id;
    const isInsufficientFunds = method.id === 'wallet' && (method.balance || 0) < (booking?.pricing.totalAmount || 0);
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentMethodCard,
          isSelected && styles.selectedPaymentMethod,
          isInsufficientFunds && styles.disabledPaymentMethod
        ]}
        onPress={() => !isInsufficientFunds && handlePaymentMethodSelect(method)}
        disabled={isInsufficientFunds}
      >
        <View style={styles.paymentMethodHeader}>
          <View style={[styles.paymentMethodIcon, { backgroundColor: method.color + '20' }]}>
            <Ionicons name="card" size={20} color="#fff" />
          </View>
          <View style={styles.paymentMethodInfo}>
            <View style={styles.paymentMethodTitleRow}>
              <Text style={styles.paymentMethodName}>{method.name}</Text>
              {method.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
            </View>
            <Text style={styles.paymentMethodDescription}>{method.description}</Text>
            {method.id === 'wallet' && (
              <Text style={[
                styles.walletBalance,
                { color: isInsufficientFunds ? '#ef4444' : '#10b981' }
              ]}>
                Balance: KSh {(method.balance || 0).toLocaleString()}
                {isInsufficientFunds && ' (Insufficient)'}
              </Text>
            )}
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={method.color} />
          )}
        </View>
        <Text style={styles.paymentMethodFees}>{method.fees}</Text>
      </TouchableOpacity>
    );
  };

  const renderPaymentForm = () => {
    if (!selectedPaymentMethod) return null;

    switch (selectedPaymentMethod.id) {
      case 'mpesa':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formTitle}>M-Pesa Payment</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="254712345678"
                value={paymentData.phoneNumber}
                onChangeText={(value) => updatePaymentData('phoneNumber', value)}
                keyboardType="phone-pad"
                maxLength={12}
              />
            </View>
            <Text style={styles.paymentNote}>
              You will receive an M-Pesa prompt on your phone to complete the payment.
            </Text>
          </View>
        );

      case 'wallet':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formTitle}>Wallet Payment</Text>
            <Text style={styles.paymentNote}>
              Payment will be deducted from your QuickFix wallet balance.
            </Text>
          </View>
        );

      case 'card':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formTitle}>Card Payment</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber}
                onChangeText={(value) => updatePaymentData('cardNumber', value)}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            <View style={styles.cardRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChangeText={(value) => updatePaymentData('expiryDate', value)}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="123"
                  value={paymentData.cvv}
                  onChangeText={(value) => updatePaymentData('cvv', value)}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        );

      case 'bank':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formTitle}>Bank Transfer</Text>
            <Text style={styles.paymentNote}>
              You will be redirected to your bank&apos;s secure payment page.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const renderPricingBreakdown = () => (
    booking ? (
    <View style={styles.pricingContainer}>
      <Text style={styles.sectionTitle}>Payment Summary</Text>
      <View style={styles.pricingCard}>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Service Fee</Text>
          <Text style={styles.pricingValue}>KSh {booking.pricing.basePrice.toLocaleString()}</Text>
        </View>
        
        {booking.pricing.urgencyFee > 0 && (
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Urgency Fee</Text>
            <Text style={styles.pricingValue}>KSh {booking.pricing.urgencyFee.toLocaleString()}</Text>
          </View>
        )}
        
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Platform Fee</Text>
          <Text style={styles.pricingValue}>KSh {booking.pricing.platformFee.toLocaleString()}</Text>
        </View>
        
        <View style={[styles.pricingRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>KSh {booking.pricing.totalAmount.toLocaleString()}</Text>
        </View>
      </View>
      
      {booking.escrowProtected && (
        <View style={styles.escrowNotice}>
          <Ionicons name="shield-checkmark" size={16} color="#10b981" />
          <Text style={styles.escrowText}>
            Payment is protected by QuickFix Escrow. Funds will only be released when work is completed.
          </Text>
        </View>
      )}
    </View>
    ) : null
  );

  const renderPaymentStatus = () => {
    if (paymentStatus === 'pending') return null;

    const statusConfig = {
      processing: {
        icon: 'hourglass',
        color: '#f59e0b',
        title: 'Processing Payment...',
        message: 'Please wait while we process your payment.'
      },
      success: {
        icon: 'checkmark-circle',
        color: '#10b981',
        title: 'Payment Successful!',
        message: 'Your payment has been processed successfully.'
      },
      failed: {
        icon: 'close-circle',
        color: '#ef4444',
        title: 'Payment Failed',
        message: 'There was an error processing your payment.'
      }
    };

    const config = (statusConfig as any)[paymentStatus];

    return (
      <Modal visible={true} transparent animationType="fade">
        <View style={styles.statusOverlay}>
          <View style={styles.statusContainer}>
            <Animated.View style={{
              transform: [{
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1]
                })
              }]
            }}>
              <Ionicons name={config.icon} size={64} color={config.color} />
            </Animated.View>
            <Text style={styles.statusTitle}>{config.title}</Text>
            <Text style={styles.statusMessage}>{config.message}</Text>
            {isProcessing && <ActivityIndicator size="large" color={config.color} />}
          </View>
        </View>
      </Modal>
    );
  };

  if (!booking) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Summary */}
        {booking && (
        <View style={styles.serviceContainer}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.serviceCard}>
            <Text style={styles.serviceName}>{booking.serviceName}</Text>
            <Text style={styles.technicianName}>Technician: {booking.technician.name}</Text>
            <Text style={styles.bookingId}>Booking ID: {booking.id}</Text>
          </View>
        </View>
        )}

        {/* Pricing Breakdown */}
        {renderPricingBreakdown()}

        {/* Payment Methods */}
        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          {paymentMethods.map(renderPaymentMethodCard)}
        </View>

        {/* Payment Form */}
        {renderPaymentForm()}
      </ScrollView>

      {/* Pay Button */}
      {selectedPaymentMethod && (
        <View style={styles.payButtonContainer}>
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.disabledButton]}
            onPress={processPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="card" size={20} color="#fff" />
                <Text style={styles.payButtonText}>
                  Pay KSh {booking?.pricing.totalAmount.toLocaleString() || '0'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Status Modal */}
      {renderPaymentStatus()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d6efd',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  placeholder: {
    width: 39,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  serviceContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 15,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  technicianName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 12,
    color: '#9ca3af',
  },
  pricingContainer: {
    padding: 15,
  },
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pricingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0d6efd',
  },
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
  },
  escrowText: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 8,
    flex: 1,
  },
  paymentMethodsContainer: {
    padding: 15,
  },
  paymentMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPaymentMethod: {
    borderColor: '#0d6efd',
  },
  disabledPaymentMethod: {
    opacity: 0.5,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  popularBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  walletBalance: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  paymentMethodFees: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  paymentForm: {
    padding: 15,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 15,
  },
  paymentNote: {
    fontSize: 14,
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  payButtonContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  payButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    margin: 40,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
});
