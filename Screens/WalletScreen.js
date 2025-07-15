/**
 * Wallet Screen
 * Manages user wallet, payments, and transactions
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import PaymentService from '../services/PaymentService';

export default function WalletScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [walletData, setWalletData] = useState({
    balance: 0,
    currency: 'KES'
  });
  
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopUpModalVisible, setIsTopUpModalVisible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('mpesa');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      
      // Load wallet info and transaction history in parallel
      const [walletResponse, transactionsResponse] = await Promise.all([
        PaymentService.getWallet(),
        PaymentService.getTransactions(1, 20)
      ]);

      if (walletResponse.success) {
        setWalletData(walletResponse.data);
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data.docs || []);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount < 50) {
      Alert.alert('Error', 'Minimum top-up amount is KES 50');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await PaymentService.topUpWallet(amount, selectedPaymentMethod);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Top-up request initiated successfully!',
          [{ text: 'OK', onPress: () => {
            setIsTopUpModalVisible(false);
            setTopUpAmount('');
            loadWalletData();
          }}]
        );
      } else {
        Alert.alert('Error', response.message || 'Top-up failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Top-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup': return 'add-circle';
      case 'payment': return 'remove-circle';
      case 'refund': return 'return-up-forward';
      case 'withdrawal': return 'remove-circle-outline';
      case 'escrow': return 'lock-closed';
      default: return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'topup':
      case 'refund': return '#28a745';
      case 'payment':
      case 'withdrawal': return '#dc3545';
      case 'escrow': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const formatAmount = (amount, type) => {
    const sign = ['topup', 'refund'].includes(type) ? '+' : '-';
    return `${sign}KES ${Math.abs(amount).toFixed(2)}`;
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <Ionicons 
          name={getTransactionIcon(item.type)} 
          size={24} 
          color={getTransactionColor(item.type)} 
        />
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {item.description || item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={styles.transactionDate}>
            {new Date(item.createdAt).toLocaleDateString()} • {item.status}
          </Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, { color: getTransactionColor(item.type) }]}>
        {formatAmount(item.amount, item.type)}
      </Text>
    </View>
  );

  if (isLoading && transactions.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>My Wallet</Text>
        <TouchableOpacity onPress={loadWalletData}>
          <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {walletData.currency} {walletData.balance.toFixed(2)}
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setIsTopUpModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Top Up</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <Ionicons name="card" size={20} color="#0d6efd" />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Payment Methods
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('SendMoney')}
          >
            <Ionicons name="send" size={24} color="#0d6efd" />
            <Text style={styles.quickActionText}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('RequestMoney')}
          >
            <Ionicons name="download" size={24} color="#0d6efd" />
            <Text style={styles.quickActionText}>Request</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('PayBills')}
          >
            <Ionicons name="receipt" size={24} color="#0d6efd" />
            <Text style={styles.quickActionText}>Pay Bills</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your transaction history will appear here
              </Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item._id}
              renderItem={renderTransaction}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
          
          {transactions.length > 0 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('TransactionHistory')}
            >
              <Text style={styles.viewAllText}>View All Transactions</Text>
              <Ionicons name="chevron-forward" size={16} color="#0d6efd" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Top Up Modal */}
      <Modal
        visible={isTopUpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTopUpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Top Up Wallet</Text>
              <TouchableOpacity onPress={() => setIsTopUpModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Amount (KES)</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter amount"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethod,
                    selectedPaymentMethod === 'mpesa' && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setSelectedPaymentMethod('mpesa')}
                >
                  <Text style={styles.paymentMethodText}>M-Pesa</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.paymentMethod,
                    selectedPaymentMethod === 'card' && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setSelectedPaymentMethod('card')}
                >
                  <Text style={styles.paymentMethodText}>Card</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.topUpButton, isLoading && styles.disabledButton]}
                onPress={handleTopUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.topUpButtonText}>Top Up</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  content: {
    flex: 1
  },
  balanceCard: {
    backgroundColor: '#0d6efd',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center'
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 8
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0d6efd'
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  secondaryButtonText: {
    color: '#0d6efd'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 8
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500'
  },
  transactionsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 12
  },
  emptyState: {
    alignItems: 'center',
    padding: 40
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  transactionDetails: {
    marginLeft: 12,
    flex: 1
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize'
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600'
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 4
  },
  viewAllText: {
    color: '#0d6efd',
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  modalBody: {
    padding: 20
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  paymentMethod: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  selectedPaymentMethod: {
    borderColor: '#0d6efd',
    backgroundColor: '#f0f8ff'
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  topUpButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  topUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
