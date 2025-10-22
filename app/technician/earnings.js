import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';
import apiClient, { API_ENDPOINTS } from '../../config/api';

export default function TechnicianEarnings() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'transactions', 'analytics'
  const [walletData, setWalletData] = useState({
    availableBalance: 0,
    pendingPayments: 0,
    totalEarned: 0,
    thisMonth: 0,
    lastWithdrawal: 0,
    withdrawalDate: null
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.TECHNICIAN.EARNINGS);
      
      if (response.data.success) {
        const data = response.data.data;
        setWalletData({
          availableBalance: data.totalEarnings || 0,
          pendingPayments: 0,
          totalEarned: data.totalEarnings || 0,
          thisMonth: data.thisMonth || 0,
          lastWithdrawal: 0,
          withdrawalDate: null
        });
        
        // Get transactions from jobs
        const jobsResponse = await apiClient.get(API_ENDPOINTS.TECHNICIAN.MY_JOBS);
        if (jobsResponse.data.success) {
          const completedJobs = jobsResponse.data.data.jobs
            .filter(job => job.status === 'completed')
            .map(job => ({
              _id: job._id,
              type: 'payment',
              description: `${job.serviceType} - ${job.location?.address || 'N/A'}`,
              amount: job.estimatedCost || 0,
              status: 'completed',
              date: job.updatedAt,
              clientName: job.client?.firstName || 'Client',
              jobId: job._id
            }));
          setTransactions(completedJobs);
        }
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      Alert.alert('Error', 'Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = () => {
    if (walletData.availableBalance < 1000) {
      Alert.alert('Insufficient Balance', 'Minimum withdrawal amount is KES 1,000');
      return;
    }

    Alert.alert(
      'Withdraw Funds',
      `Available balance: KES ${walletData.availableBalance.toLocaleString()}\n\nHow much would you like to withdraw?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'KES 5,000', 
          onPress: () => processWithdrawal(5000)
        },
        { 
          text: 'KES 10,000', 
          onPress: () => processWithdrawal(10000)
        },
        { 
          text: 'All Available', 
          onPress: () => processWithdrawal(walletData.availableBalance)
        }
      ]
    );
  };

  const processWithdrawal = (amount) => {
    if (amount > walletData.availableBalance) {
      Alert.alert('Error', 'Insufficient balance for this withdrawal');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw KES ${amount.toLocaleString()} to your registered bank account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await apiClient.post(API_ENDPOINTS.TECHNICIAN.WITHDRAW, {
                amount: amount
              });
              
              if (response.data.success) {
                Alert.alert('Success', 'Withdrawal request submitted! Funds will be transferred within 24 hours.');
                fetchEarningsData(); // Refresh data
              }
            } catch (error) {
              console.error('Withdrawal error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to process withdrawal');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const getTransactionIcon = (type, status) => {
    if (type === 'payment') {
      return status === 'pending' ? 'time-outline' : 'add-circle-outline';
    } else {
      return 'remove-circle-outline';
    }
  };

  const getTransactionColor = (type, status) => {
    if (type === 'payment') {
      return status === 'pending' ? '#ffc107' : '#28a745';
    } else {
      return '#dc3545';
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <Ionicons 
            name={getTransactionIcon(item.type, item.status)} 
            size={24} 
            color={getTransactionColor(item.type, item.status)} 
          />
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription}>{item.description}</Text>
            <Text style={styles.transactionDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
            {item.clientName && (
              <Text style={styles.clientName}>Client: {item.clientName}</Text>
            )}
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: getTransactionColor(item.type, item.status) }
          ]}>
            {item.amount > 0 ? '+' : ''}KES {Math.abs(item.amount).toLocaleString()}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getTransactionColor(item.type, item.status) }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Balance Cards */}
      <View style={styles.balanceCardsContainer}>
        <View style={[styles.balanceCard, styles.primaryCard]}>
          <Ionicons name="wallet-outline" size={32} color="#fff" />
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            KES {walletData.availableBalance.toLocaleString()}
          </Text>
          <TouchableOpacity 
            style={styles.withdrawButton}
            onPress={handleWithdraw}
          >
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Ionicons name="hourglass-outline" size={24} color="#ffc107" />
          <Text style={styles.balanceLabel}>Pending</Text>
          <Text style={[styles.balanceAmount, { fontSize: 20 }]}>
            KES {walletData.pendingPayments.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statAmount}>KES {walletData.thisMonth.toLocaleString()}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statAmount}>KES {walletData.totalEarned.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveTab('transactions')}
          >
            <Ionicons name="document-text-outline" size={24} color="#0d6efd" />
            <Text style={styles.actionText}>Payment History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Tax Documents',
                'Download your tax documents for the current year?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Download', 
                    onPress: () => Alert.alert('Success', 'Tax documents will be sent to your registered email within 24 hours.')
                  }
                ]
              );
            }}
          >
            <Ionicons name="download-outline" size={24} color="#0d6efd" />
            <Text style={styles.actionText}>Tax Documents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/technician/profile?tab=payment')}
          >
            <Ionicons name="card-outline" size={24} color="#0d6efd" />
            <Text style={styles.actionText}>Bank Details</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions Preview */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => setActiveTab('transactions')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {transactions.slice(0, 3).map(transaction => (
          <View key={transaction._id}>
            {renderTransaction({ item: transaction })}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            Alert.alert(
              'Earnings Settings',
              'Configure your payment preferences',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Bank Details', onPress: () => router.push('/technician/profile?tab=payment') },
                { text: 'Tax Information', onPress: () => Alert.alert('Tax Info', 'Tax settings coming soon!') },
                { text: 'Notification Preferences', onPress: () => Alert.alert('Notifications', 'Notification settings coming soon!') }
              ]
            );
          }}
        >
          <Ionicons name="settings-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d6efd" />
          <Text style={styles.loadingText}>Loading earnings data...</Text>
        </View>
      ) : activeTab === 'overview' ? (
        renderOverview()
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Complete jobs to start earning!</Text>
            </View>
          }
        />
      )}
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
  settingsButton: {
    padding: 8
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#0d6efd'
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666'
  },
  activeTabText: {
    color: '#0d6efd',
    fontWeight: '600'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  overviewContainer: {
    flex: 1
  },
  balanceCardsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  primaryCard: {
    backgroundColor: '#0d6efd'
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    opacity: 0.9
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4
  },
  withdrawButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  withdrawButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff'
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1
  },
  statAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  quickActions: {
    margin: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    textAlign: 'center'
  },
  recentSection: {
    margin: 20,
    marginTop: 0
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  viewAllText: {
    fontSize: 14,
    color: '#0d6efd',
    fontWeight: '500'
  },
  transactionsList: {
    padding: 20
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  transactionInfo: {
    marginLeft: 12,
    flex: 1
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  clientName: {
    fontSize: 12,
    color: '#0d6efd',
    marginTop: 2
  },
  transactionRight: {
    alignItems: 'flex-end'
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  }
});
