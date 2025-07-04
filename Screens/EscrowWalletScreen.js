// Screens/EscrowWalletScreen.js
// Main escrow wallet screen with balance, transactions, and quick actions

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import EscrowService from '../services/EscrowService';
import PaymentService from '../services/PaymentService';

export default function EscrowWalletScreen({ navigation }) {
  // Authentication context
  const { user } = useAuth();

  // Component state
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load wallet data on component mount
  useEffect(() => {
    loadWalletData();
    loadTransactionHistory();
  }, []);

  /**
   * Load wallet balance and escrow information
   */
  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const result = await EscrowService.getWalletBalance(user.id);
      
      if (result.success) {
        setWallet(result.wallet);
      } else {
        Alert.alert('Error', result.error || 'Failed to load wallet data');
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load recent transaction history
   */
  const loadTransactionHistory = async () => {
    try {
      const result = await EscrowService.getTransactionHistory(user.id, {
        limit: 10, // Show recent 10 transactions
      });
      
      if (result.success) {
        setTransactions(result.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  /**
   * Handle refresh action
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadWalletData(), loadTransactionHistory()]);
    setIsRefreshing(false);
  };

  /**
   * Navigate to add funds screen
   */
  const handleAddFunds = () => {
    navigation.navigate('AddFunds');
  };

  /**
   * Navigate to withdraw funds screen
   */
  const handleWithdrawFunds = () => {
    navigation.navigate('WithdrawFunds');
  };

  /**
   * Navigate to full transaction history
   */
  const handleViewAllTransactions = () => {
    navigation.navigate('TransactionHistory');
  };

  /**
   * Navigate to payment methods management
   */
  const handlePaymentMethods = () => {
    navigation.navigate('PaymentMethods');
  };

  /**
   * Format currency for display
   */
  const formatCurrency = (amount, currency = 'USD') => {
    return PaymentService.formatCurrency(amount, currency);
  };

  /**
   * Get transaction icon based on type
   */
  const getTransactionIcon = (type) => {
    const iconMap = {
      'wallet_credit': 'add-circle',
      'wallet_debit': 'remove-circle',
      'escrow_created': 'lock-closed',
      'escrow_released': 'checkmark-circle',
      'escrow_refunded': 'arrow-back-circle',
    };
    return iconMap[type] || 'swap-horizontal';
  };

  /**
   * Get transaction color based on type
   */
  const getTransactionColor = (type) => {
    const colorMap = {
      'wallet_credit': '#28a745',
      'wallet_debit': '#dc3545',
      'escrow_created': '#ffc107',
      'escrow_released': '#28a745',
      'escrow_refunded': '#17a2b8',
    };
    return colorMap[type] || '#6c757d';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handlePaymentMethods}
        >
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Wallet Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet" size={32} color="#fff" />
          <Text style={styles.balanceTitle}>Total Balance</Text>
        </View>
        <Text style={styles.totalBalance}>
          {wallet ? formatCurrency(wallet.totalBalance, wallet.currency) : '$0.00'}
        </Text>
        
        {/* Balance Breakdown */}
        <View style={styles.balanceBreakdown}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Available</Text>
            <Text style={styles.balanceAmount}>
              {wallet ? formatCurrency(wallet.availableBalance, wallet.currency) : '$0.00'}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>In Escrow</Text>
            <Text style={styles.balanceAmount}>
              {wallet ? formatCurrency(wallet.escrowBalance, wallet.currency) : '$0.00'}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddFunds}>
          <Ionicons name="add-circle" size={28} color="#28a745" />
          <Text style={styles.actionText}>Add Funds</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleWithdrawFunds}>
          <Ionicons name="remove-circle" size={28} color="#dc3545" />
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handlePaymentMethods}>
          <Ionicons name="card" size={28} color="#0d6efd" />
          <Text style={styles.actionText}>Payment Methods</Text>
        </TouchableOpacity>
      </View>

      {/* Active Escrow Transactions */}
      {wallet && wallet.escrowTransactions && wallet.escrowTransactions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Escrow</Text>
          {wallet.escrowTransactions.map((escrow) => (
            <View key={escrow.id} style={styles.escrowCard}>
              <View style={styles.escrowHeader}>
                <Ionicons name="lock-closed" size={20} color="#ffc107" />
                <Text style={styles.escrowAmount}>
                  {formatCurrency(escrow.amount, wallet.currency)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: '#ffc107' }]}>
                  <Text style={styles.statusText}>{escrow.status}</Text>
                </View>
              </View>
              <Text style={styles.escrowService}>Service ID: {escrow.serviceId}</Text>
              <Text style={styles.escrowDate}>
                Release Date: {new Date(escrow.releaseDate).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={handleViewAllTransactions}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {transactions.length > 0 ? (
          transactions.slice(0, 5).map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <Ionicons
                name={getTransactionIcon(transaction.type)}
                size={24}
                color={getTransactionColor(transaction.type)}
              />
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: getTransactionColor(transaction.type) }
                ]}
              >
                {transaction.type.includes('credit') || transaction.type.includes('released') ? '+' : '-'}
                {formatCurrency(transaction.amount, transaction.currency)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#6c757d" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start by adding funds to your wallet
            </Text>
          </View>
        )}
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          Your funds are securely protected with bank-level encryption. 
          Escrow ensures safe transactions for all services.
        </Text>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d6efd',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  balanceCard: {
    backgroundColor: '#0d6efd',
    margin: 20,
    marginTop: -10,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 12,
    opacity: 0.9,
  },
  totalBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 100,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  viewAllText: {
    fontSize: 16,
    color: '#0d6efd',
    fontWeight: '600',
  },
  escrowCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  escrowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  escrowAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  escrowService: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  escrowDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  helpSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
