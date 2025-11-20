/**
 * Admin Wallet Screen - QuickFix
 * Platform financial overview, transaction monitoring, and system analytics
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
  Dimensions,
} from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';
import apiClient from '../../config/api';

const { width } = Dimensions.get('window');

interface Transaction {
  _id: string;
  userId: string;
  userName: string;
  userType: 'client' | 'technician';
  type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'withdrawal' | 'deposit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  bookingId?: string;
  mpesaCode?: string;
}

interface PlatformMetrics {
  totalRevenue: number;
  platformFees: number;
  activeWallets: number;
  totalTransactions: number;
  pendingWithdrawals: number;
  escrowTotal: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  averageTransactionValue: number;
}

export default function AdminWalletScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalRevenue: 0,
    platformFees: 0,
    activeWallets: 0,
    totalTransactions: 0,
    pendingWithdrawals: 0,
    escrowTotal: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    averageTransactionValue: 0,
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'client' | 'technician'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (token) {
      loadPlatformData();
    }
  }, [token, filterStatus, filterType]);

  const loadPlatformData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [metricsRes, transactionsRes] = await Promise.all([
        apiClient.get('/admin/wallet/metrics'),
        apiClient.get(`/admin/transactions?limit=100&status=${filterStatus !== 'all' ? filterStatus : ''}&userType=${filterType !== 'all' ? filterType : ''}`)
      ]);

      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data);
      }
      
      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.data.transactions || []);
      }
    } catch (error: any) {
      console.error('Error loading platform data:', error);
      setError(error.message || 'Failed to load platform data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadPlatformData();
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      case 'deposit':
      case 'credit':
        return 'arrow-down-circle';
      case 'withdrawal':
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
      case 'deposit':
      case 'credit':
      case 'escrow_release':
        return '#10B981';
      case 'withdrawal':
      case 'debit':
        return '#EF4444';
      case 'escrow_hold':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getUserTypeColor = (type: string) => {
    return type === 'client' ? '#6366F1' : '#10B981';
  };

  const filteredTransactions = transactions.filter(t => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.userName?.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t._id.toLowerCase().includes(query) ||
        t.mpesaCode?.toLowerCase().includes(query)
      );
    }
    return true;
  });

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
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <View style={[styles.userTypeBadge, { backgroundColor: `${getUserTypeColor(item.userType)}20` }]}>
            <Text style={[styles.userTypeText, { color: getUserTypeColor(item.userType) }]}>
              {item.userType}
            </Text>
          </View>
        </View>
        <Text style={styles.transactionUser}>{item.userName || 'Unknown User'}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionAmountText,
          { color: item.type === 'withdrawal' || item.type === 'debit' ? '#EF4444' : '#10B981' }
        ]}>
          {item.type === 'withdrawal' || item.type === 'debit' ? '-' : '+'}{formatCurrency(item.amount)}
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
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading platform metrics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Platform Wallet</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Revenue Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Platform Revenue</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(metrics.totalRevenue)}</Text>
          
          <View style={styles.feeInfo}>
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text style={styles.feeText}>
              {formatCurrency(metrics.platformFees)} in fees collected
            </Text>
          </View>
        </View>

        {/* Quick Metrics */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
          <View style={styles.metricCard}>
            <Ionicons name="calendar" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.metricValue}>{formatCurrency(metrics.monthlyRevenue)}</Text>
            <Text style={styles.metricLabel}>This Month</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.metricValue}>{formatCurrency(metrics.weeklyRevenue)}</Text>
            <Text style={styles.metricLabel}>This Week</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.metricValue}>{formatCurrency(metrics.escrowTotal)}</Text>
            <Text style={styles.metricLabel}>In Escrow</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Ionicons name="wallet" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.metricValue}>{metrics.activeWallets}</Text>
            <Text style={styles.metricLabel}>Active Wallets</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search transactions..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFiltersModal(true)}
        >
          <Ionicons name="options" size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {(filterStatus !== 'all' || filterType !== 'all') && (
        <View style={styles.activeFilters}>
          {filterStatus !== 'all' && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Status: {filterStatus}</Text>
              <TouchableOpacity onPress={() => setFilterStatus('all')}>
                <Ionicons name="close-circle" size={16} color="#6366F1" />
              </TouchableOpacity>
            </View>
          )}
          {filterType !== 'all' && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Type: {filterType}</Text>
              <TouchableOpacity onPress={() => setFilterType('all')}>
                <Ionicons name="close-circle" size={16} color="#6366F1" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Transactions */}
      <View style={styles.transactionsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Transactions</Text>
          <Text style={styles.sectionCount}>{filteredTransactions.length} total</Text>
        </View>
        
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No transactions found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try a different search term' : 'Platform transactions will appear here'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
            }
            contentContainerStyle={styles.transactionsList}
          />
        )}
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {(['all', 'pending', 'completed', 'failed'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      filterStatus === status && styles.filterOptionActive
                    ]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filterStatus === status && styles.filterOptionTextActive
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>User Type</Text>
              <View style={styles.filterOptions}>
                {(['all', 'client', 'technician'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      filterType === type && styles.filterOptionActive
                    ]}
                    onPress={() => setFilterType(type)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filterType === type && styles.filterOptionTextActive
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFiltersModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction ID</Text>
                  <Text style={styles.detailValue}>{selectedTransaction._id}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>User</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.userName || 'Unknown'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>User Type</Text>
                  <View style={[styles.userTypeBadge, { backgroundColor: `${getUserTypeColor(selectedTransaction.userType)}20` }]}>
                    <Text style={[styles.userTypeText, { color: getUserTypeColor(selectedTransaction.userType) }]}>
                      {selectedTransaction.userType.toUpperCase()}
                    </Text>
                  </View>
                </View>

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
              </ScrollView>
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
    paddingBottom: 16,
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
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  feeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feeText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  metricsScroll: {
    flexGrow: 0,
  },
  metricCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 14,
    color: '#6B7280',
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  transactionUser: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  userTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  userTypeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 14,
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
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    marginTop: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  filterOptionActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#FFF',
  },
  applyButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
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
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
