import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

export default function WalletScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance] = useState(2450); // Mock balance
  
  // Mock transaction data
  const [transactions] = useState([
    {
      id: '1',
      type: 'payment',
      description: 'Payment to John Doe - Plumbing',
      amount: -1500,
      date: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      type: 'deposit',
      description: 'Wallet Top-up via M-Pesa',
      amount: 5000,
      date: '2024-01-12T14:20:00Z',
      status: 'completed'
    },
    {
      id: '3',
      type: 'refund',
      description: 'Refund - Cancelled Service',
      amount: 800,
      date: '2024-01-10T09:15:00Z',
      status: 'completed'
    },
    {
      id: '4',
      type: 'payment',
      description: 'Payment to Jane Smith - AC Service',
      amount: -3200,
      date: '2024-01-08T16:45:00Z',
      status: 'completed'
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleAddFunds = () => {
    Alert.alert(
      'Add Funds',
      'Add money to your wallet using M-Pesa, bank transfer, or card.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'M-Pesa', onPress: () => Alert.alert('M-Pesa', 'M-Pesa integration coming soon') },
        { text: 'Bank Transfer', onPress: () => Alert.alert('Bank Transfer', 'Bank transfer integration coming soon') },
      ]
    );
  };

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw Funds',
      'Withdraw money from your wallet to M-Pesa or bank account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'To M-Pesa', onPress: () => Alert.alert('M-Pesa Withdrawal', 'M-Pesa withdrawal coming soon') },
        { text: 'To Bank', onPress: () => Alert.alert('Bank Withdrawal', 'Bank withdrawal coming soon') },
      ]
    );
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'payment': return 'arrow-up-outline';
      case 'deposit': return 'arrow-down-outline';
      case 'refund': return 'return-down-back-outline';
      default: return 'help-outline';
    }
  };

  const getTransactionColor = (amount) => {
    return amount > 0 ? '#198754' : '#dc3545';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={getTransactionIcon(item.type)} 
          size={24} 
          color={getTransactionColor(item.amount)} 
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: getTransactionColor(item.amount) }
        ]}>
          {item.amount > 0 ? '+' : ''}KSh {Math.abs(item.amount).toLocaleString()}
        </Text>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>KSh {walletBalance.toLocaleString()}</Text>
        <View style={styles.balanceActions}>
          <TouchableOpacity style={styles.balanceButton} onPress={handleAddFunds}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.balanceButtonText}>Add Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.balanceButton, styles.withdrawButton]} 
            onPress={handleWithdraw}
          >
            <Ionicons name="download-outline" size={20} color="#0d6efd" />
            <Text style={[styles.balanceButtonText, styles.withdrawButtonText]}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="send-outline" size={24} color="#0d6efd" />
            <Text style={styles.quickActionText}>Send Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="card-outline" size={24} color="#0d6efd" />
            <Text style={styles.quickActionText}>Pay Bills</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="receipt-outline" size={24} color="#0d6efd" />
            <Text style={styles.quickActionText}>Buy Airtime</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          style={styles.transactionsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  balanceCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    width: '100%',
  },
  balanceButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0d6efd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  withdrawButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#0d6efd',
  },
  balanceButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  withdrawButtonText: {
    color: '#0d6efd',
  },
  quickActionsContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  transactionsContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  transactionsList: {
    flex: 1,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
});
