/**
 * Client Wallet Screen - QuickFix
 * Full wallet management with M-Pesa integration, transaction history, and top-up/withdraw
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';
import apiClient from '../../config/api';

interface Transaction {
  _id: string;
  type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  bookingId?: string;
  mpesaCode?: string;
}

interface WalletData {
  balance: number;
  escrowBalance: number;
  totalSpent: number;
  lifetimeSpent: number;
}

export default function ClientWalletScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    escrowBalance: 0,
    totalSpent: 0,
    lifetimeSpent: 0,
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Form data
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpPhone, setTopUpPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (token) {
      loadWalletData();
    }
  }, [token]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [walletRes, transactionsRes] = await Promise.all([
        apiClient.get('/payments/wallet'),
        apiClient.get('/payments/transactions?limit=50')
      ]);

      if (walletRes.data.success) {
        setWalletData(walletRes.data.data);
      }
      
      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.data.transactions || []);
      }
    } catch (error: any) {
      console.error('Error loading wallet:', error);
      setError(error.message || 'Failed to load wallet');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadWalletData();
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) < 10) {
      Alert.alert('Error', 'Minimum top-up amount is KES 10');
      return;
    }

    if (!topUpPhone || topUpPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid M-Pesa phone number');
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await apiClient.post('/payments/add-funds', {
        amount: parseFloat(topUpAmount),
        paymentMethod: 'mpesa',
        paymentDetails: {
          phoneNumber: topUpPhone.startsWith('254') ? topUpPhone : `254${topUpPhone.replace(/^0/, '')}`,
        }
      });

      if (response.data.success) {
        Alert.alert(
          'Top-Up Initiated',
          'Please check your phone and enter your M-Pesa PIN to complete the transaction.',
          [{ text: 'OK', onPress: () => {
            setShowTopUpModal(false);
            setTopUpAmount('');
            setTopUpPhone('');
            loadWalletData();
          }}]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to initiate top-up');
      }
    } catch (error: any) {
      console.error('Top-up error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to process top-up');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return 'KES 0.00';
    return `KES ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return 'arrow-down-circle';
      case 'debit':
        return 'arrow-up-circle';
      case 'escrow_hold':
        return 'lock-closed';
      case 'escrow_release':
        return 'lock-open';
      default:
        return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return '#10B981';
      case 'debit':
        return '#EF4444';
      case 'escrow_hold':
        return '#F59E0B';
      case 'escrow_release':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => {
        setSelectedTransaction(item);
        setShowTransactionModal(true);
      }}
    >
      <View style={[styles.transactionIcon, { backgroundColor: `${getTransactionColor(item.type)}20` }]}>
        <Ionicons name={getTransactionIcon(item.type) as any} size={24} color={getTransactionColor(item.type)} />
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionAmountText,
          { color: item.type === 'credit' ? '#10B981' : '#EF4444' }
        ]}>
          {item.type === 'credit' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'completed' ? '#10B98120' : item.status === 'pending' ? '#F59E0B20' : '#EF444420' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'completed' ? '#10B981' : item.status === 'pending' ? '#F59E0B' : '#EF4444' }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(walletData.balance)}</Text>
          
          {walletData.escrowBalance > 0 && (
            <View style={styles.escrowInfo}>
              <Ionicons name="lock-closed" size={16} color="#F59E0B" />
              <Text style={styles.escrowText}>
                {formatCurrency(walletData.escrowBalance)} in escrow
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>{formatCurrency(walletData.totalSpent)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Lifetime</Text>
            <Text style={styles.statValue}>{formatCurrency(walletData.lifetimeSpent)}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={() => setShowTopUpModal(true)}
        >
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>Top Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6366F1' }]}
          onPress={() => router.push('/booking/service-request')}
        >
          <Ionicons name="hammer" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>Book Service</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>Your transaction history will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366F1']} />
            }
            contentContainerStyle={styles.transactionsList}
          />
        )}
      </View>

      {/* Top-Up Modal */}
      <Modal
        visible={showTopUpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTopUpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Top Up Wallet</Text>
              <TouchableOpacity onPress={() => setShowTopUpModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Amount (KES)</Text>
              <TextInput
                style={styles.input}
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
                placeholder="Enter amount (min. 10)"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
              <TextInput
                style={styles.input}
                value={topUpPhone}
                onChangeText={setTopUpPhone}
                keyboardType="phone-pad"
                placeholder="0712345678 or 254712345678"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#6366F1" />
                <Text style={styles.infoText}>
                  You'll receive an M-Pesa prompt on your phone to complete the payment
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isProcessing && styles.submitButtonDisabled]}
                onPress={handleTopUp}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="card" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>Initiate Payment</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Transaction Details Modal */}
      <Modal
        visible={showTransactionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTransactionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <TouchableOpacity onPress={() => setShowTransactionModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedTransaction && (
              <View style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.type.replace('_', ' ').toUpperCase()}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={[styles.detailValue, { color: getTransactionColor(selectedTransaction.type) }]}>
                    {formatCurrency(selectedTransaction.amount)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: selectedTransaction.status === 'completed' ? '#10B98120' : '#F59E0B20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: selectedTransaction.status === 'completed' ? '#10B981' : '#F59E0B' }
                    ]}>
                      {selectedTransaction.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedTransaction.createdAt)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.description}</Text>
                </View>

                {selectedTransaction.mpesaCode && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>M-Pesa Code</Text>
                    <Text style={styles.detailValue}>{selectedTransaction.mpesaCode}</Text>
                  </View>
                )}

                {selectedTransaction.bookingId && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Booking ID</Text>
                    <Text style={styles.detailValue}>{selectedTransaction.bookingId}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  escrowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  escrowText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#4338CA',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
