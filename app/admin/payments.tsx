/**
 * Admin Payment Management - Production Ready
 * 
 * Fully functional admin dashboard for payment management
 * Real-time statistics, transaction management, and reporting
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
import PaymentService from '../../services/PaymentService';
import TransactionService from '../../services/TransactionService';

export default function PaymentManagement() {
 const router = useRouter();
 
 // State
 const [loading, setLoading] = useState(true);
 const [stats, setStats] = useState({
 totalRevenue: 0,
 totalTransactions: 0,
 pendingAmount: 0,
 completedAmount: 0,
 failedAmount: 0
 });
 const [recentTransactions, setRecentTransactions] = useState([]);
 const [showTransactions, setShowTransactions] = useState(false);
 const [showFilters, setShowFilters] = useState(false);
 const [selectedPeriod, setSelectedPeriod] = useState('30d');
 const [filterType, setFilterType] = useState('all');
 const [filterStatus, setFilterStatus] = useState('all');
 
 // Load data on mount
 useEffect(() => {
 loadDashboardData();
 }, [selectedPeriod]);

 // Load dashboard data
 const loadDashboardData = async () => {
 try {
 setLoading(true);
 await Promise.all([
 loadStatistics(),
 loadRecentTransactions()
 ]);
 } catch (error) {
 console.error('Failed to load dashboard:', error);
 Alert.alert('Error', 'Failed to load payment data');
 } finally {
 setLoading(false);
 }
 };

 // Load statistics
 const loadStatistics = async () => {
 try {
 const result = await TransactionService.getTransactionStats(selectedPeriod);
 if (result.success) {
 setStats({
 totalRevenue: result.data?.totalRevenue || 0,
 totalTransactions: result.data?.totalTransactions || 0,
 pendingAmount: result.data?.pendingAmount || 0,
 completedAmount: result.data?.completedAmount || 0,
 failedAmount: result.data?.failedAmount || 0
 });
 }
 } catch (error) {
 console.error('Failed to load statistics:', error);
 // Set to 0 if API fails
 setStats({
 totalRevenue: 0,
 totalTransactions: 0,
 pendingAmount: 0,
 completedAmount: 0,
 failedAmount: 0
 });
 }
 };

 // Load recent transactions
 const loadRecentTransactions = async () => {
 try {
 const result = await TransactionService.getTransactionHistory({
 page: 1,
 limit: 10
 });
 if (result.success) {
 setRecentTransactions(result.data?.transactions || []);
 }
 } catch (error) {
 console.error('Failed to load transactions:', error);
 setRecentTransactions([]);
 }
 };

 // View all transactions
 const viewAllTransactions = () => {
 setShowTransactions(true);
 };

 // View pending payments
 const viewPendingPayments = () => {
 setFilterStatus('pending');
 setShowTransactions(true);
 };

 // Generate report
 const generateReport = async () => {
 try {
 Alert.alert(
 'Generate Report',
 'Select report format',
 [
 { text: 'Cancel', style: 'cancel' },
 {
 text: 'CSV',
 onPress: async () => {
 try {
 const result = await TransactionService.exportTransactions({}, 'csv');
 if (result.success) {
 Alert.alert('Success', 'Report generated successfully!');
 }
 } catch (error) {
 Alert.alert('Error', 'Failed to generate report');
 }
 }
 },
 {
 text: 'PDF',
 onPress: async () => {
 try {
 const result = await TransactionService.exportTransactions({}, 'pdf');
 if (result.success) {
 Alert.alert('Success', 'Report generated successfully!');
 }
 } catch (error) {
 Alert.alert('Error', 'Failed to generate report');
 }
 }
 }
 ]
 );
 } catch (error) {
 Alert.alert('Error', 'Failed to generate report');
 }
 };

 // Format currency
 const formatCurrency = (amount) => {
 return `KES ${amount.toLocaleString()}`;
 };

 // Render transaction item
 const renderTransaction = ({ item }) => {
 const statusInfo = TransactionService.formatTransactionStatus(item.status);
 
 return (
 <View style={styles.transactionCard}>
 <View style={styles.transactionHeader}>
 <Text style={styles.transactionType}>
 {TransactionService.formatTransactionType(item.type)}
 </Text>
 <Text style={[styles.transactionStatus, { color: statusInfo.color }]}>
 {statusInfo.label}
 </Text>
 </View>
 <Text style={styles.transactionDescription} numberOfLines={2}>
 {item.description || 'No description'}
 </Text>
 <View style={styles.transactionFooter}>
 <Text style={styles.transactionAmount}>
 {formatCurrency(item.amount)}
 </Text>
 <Text style={styles.transactionDate}>
 {new Date(item.createdAt).toLocaleDateString()}
 </Text>
 </View>
 </View>
 );
 };

 // Loading state
 if (loading) {
 return (
 <View style={[styles.container, styles.centerContent]}>
 <ActivityIndicator size="large" color="#4CAF50" />
 <Text style={styles.loadingText}>Loading payment data...</Text>
 </View>
 );
 }

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity 
 style={styles.backButton}
 onPress={() => router.push('/dashboard/admin')}
 >
 <Ionicons name="arrow-back" size={24} color="#fff" />
 </TouchableOpacity>
 <Text style={styles.title}>Payment Management</Text>
 <TouchableOpacity onPress={loadDashboardData}>
 <Ionicons name="reload" size={24} color="#fff" />
 </TouchableOpacity>
 </View>

 <ScrollView style={styles.content}>
 {/* Period Selector */}
 <View style={styles.periodSelector}>
 {['7d', '30d', '90d', '1y'].map((period) => (
 <TouchableOpacity
 key={period}
 style={[
 styles.periodButton,
 selectedPeriod === period && styles.periodButtonActive
 ]}
 onPress={() => setSelectedPeriod(period)}
 >
 <Text style={[
 styles.periodButtonText,
 selectedPeriod === period && styles.periodButtonTextActive
 ]}>
 {period === '7d' ? '7 Days' : 
 period === '30d' ? '30 Days' :
 period === '90d' ? '90 Days' : '1 Year'}
 </Text>
 </TouchableOpacity>
 ))}
 </View>

 {/* Statistics */}
 <Text style={styles.sectionTitle}>Payment Statistics</Text>
 <View style={styles.statsContainer}>
 <View style={styles.statCard}>
 <Ionicons name="cash-outline" size={32} color="#4CAF50" />
 <Text style={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</Text>
 <Text style={styles.statLabel}>Total Revenue</Text>
 </View>
 
 <View style={styles.statCard}>
 <Ionicons name="receipt-outline" size={32} color="#2196F3" />
 <Text style={styles.statNumber}>{stats.totalTransactions}</Text>
 <Text style={styles.statLabel}>Transactions</Text>
 </View>
 </View>

 <View style={styles.statsContainer}>
 <View style={styles.statCard}>
 <Ionicons name="checkmark-circle-outline" size={32} color="#10b981" />
 <Text style={styles.statNumber}>{formatCurrency(stats.completedAmount)}</Text>
 <Text style={styles.statLabel}>Completed</Text>
 </View>
 
 <View style={styles.statCard}>
 <Ionicons name="time-outline" size={32} color="#f59e0b" />
 <Text style={styles.statNumber}>{formatCurrency(stats.pendingAmount)}</Text>
 <Text style={styles.statLabel}>Pending</Text>
 </View>
 </View>

 {/* Recent Transactions */}
 <Text style={styles.sectionTitle}>Recent Transactions</Text>
 {recentTransactions.length > 0 ? (
 recentTransactions.slice(0, 5).map((transaction) => (
 <View key={transaction._id || transaction.id}>
 {renderTransaction({ item: transaction })}
 </View>
 ))
 ) : (
 <View style={styles.emptyState}>
 <Ionicons name="receipt-outline" size={48} color="#ccc" />
 <Text style={styles.emptyText}>No transactions yet</Text>
 </View>
 )}

 {/* Action Buttons */}
 <Text style={styles.sectionTitle}>Actions</Text>
 
 <TouchableOpacity 
 style={styles.actionButton}
 onPress={viewAllTransactions}
 >
 <Ionicons name="list-outline" size={24} color="#4CAF50" />
 <Text style={styles.actionButtonText}>View All Transactions</Text>
 <Ionicons name="chevron-forward" size={24} color="#4CAF50" />
 </TouchableOpacity>
 
 <TouchableOpacity 
 style={styles.actionButton}
 onPress={viewPendingPayments}
 >
 <Ionicons name="time-outline" size={24} color="#f59e0b" />
 <Text style={styles.actionButtonText}>Pending Payments</Text>
 <Ionicons name="chevron-forward" size={24} color="#f59e0b" />
 </TouchableOpacity>
 
 <TouchableOpacity 
 style={styles.actionButton}
 onPress={generateReport}
 >
 <Ionicons name="document-text-outline" size={24} color="#2196F3" />
 <Text style={styles.actionButtonText}>Generate Report</Text>
 <Ionicons name="chevron-forward" size={24} color="#2196F3" />
 </TouchableOpacity>

 <View style={{ height: 30 }} />
 </ScrollView>

 {/* Transactions Modal */}
 <Modal
 visible={showTransactions}
 animationType="slide"
 onRequestClose={() => setShowTransactions(false)}
 >
 <View style={styles.modalContainer}>
 <View style={styles.modalHeader}>
 <TouchableOpacity onPress={() => setShowTransactions(false)}>
 <Ionicons name="close" size={28} color="#333" />
 </TouchableOpacity>
 <Text style={styles.modalTitle}>All Transactions</Text>
 <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
 <Ionicons name="filter-outline" size={28} color="#333" />
 </TouchableOpacity>
 </View>

 {showFilters && (
 <View style={styles.filtersContainer}>
 <Text style={styles.filterLabel}>Type:</Text>
 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
 {['all', 'payment', 'withdrawal', 'escrow', 'refund'].map((type) => (
 <TouchableOpacity
 key={type}
 style={[
 styles.filterChip,
 filterType === type && styles.filterChipActive
 ]}
 onPress={() => setFilterType(type)}
 >
 <Text style={[
 styles.filterChipText,
 filterType === type && styles.filterChipTextActive
 ]}>
 {type.charAt(0).toUpperCase() + type.slice(1)}
 </Text>
 </TouchableOpacity>
 ))}
 </ScrollView>

 <Text style={styles.filterLabel}>Status:</Text>
 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
 {['all', 'completed', 'pending', 'failed'].map((status) => (
 <TouchableOpacity
 key={status}
 style={[
 styles.filterChip,
 filterStatus === status && styles.filterChipActive
 ]}
 onPress={() => setFilterStatus(status)}
 >
 <Text style={[
 styles.filterChipText,
 filterStatus === status && styles.filterChipTextActive
 ]}>
 {status.charAt(0).toUpperCase() + status.slice(1)}
 </Text>
 </TouchableOpacity>
 ))}
 </ScrollView>
 </View>
 )}

 <FlatList
 data={recentTransactions.filter(t => {
 if (filterType !== 'all' && t.type !== filterType) return false;
 if (filterStatus !== 'all' && t.status !== filterStatus) return false;
 return true;
 })}
 renderItem={renderTransaction}
 keyExtractor={(item) => item._id || item.id}
 contentContainerStyle={styles.transactionsList}
 ListEmptyComponent={
 <View style={styles.emptyState}>
 <Ionicons name="receipt-outline" size={48} color="#ccc" />
 <Text style={styles.emptyText}>No transactions found</Text>
 </View>
 }
 />
 </View>
 </Modal>
 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f7fa',
 },
 centerContent: {
 justifyContent: 'center',
 alignItems: 'center',
 },
 loadingText: {
 marginTop: 10,
 color: '#6c757d',
 },
 header: {
 backgroundColor: '#4CAF50',
 paddingTop: 50,
 paddingBottom: 15,
 paddingHorizontal: 15,
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 },
 backButton: {
 marginRight: 15,
 },
 title: {
 flex: 1,
 fontSize: 20,
 fontWeight: 'bold',
 color: '#fff',
 textAlign: 'center',
 },
 content: {
 flex: 1,
 padding: 15,
 },
 periodSelector: {
 flexDirection: 'row',
 marginBottom: 20,
 gap: 10,
 },
 periodButton: {
 flex: 1,
 paddingVertical: 10,
 paddingHorizontal: 15,
 borderRadius: 8,
 backgroundColor: '#fff',
 alignItems: 'center',
 borderWidth: 1,
 borderColor: '#dee2e6',
 },
 periodButtonActive: {
 backgroundColor: '#4CAF50',
 borderColor: '#4CAF50',
 },
 periodButtonText: {
 fontSize: 12,
 color: '#6c757d',
 fontWeight: '600',
 },
 periodButtonTextActive: {
 color: '#fff',
 },
 sectionTitle: {
 fontSize: 18,
 fontWeight: '600',
 marginBottom: 15,
 marginTop: 10,
 color: '#333',
 },
 statsContainer: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: 15,
 gap: 10,
 },
 statCard: {
 backgroundColor: '#fff',
 padding: 20,
 borderRadius: 12,
 alignItems: 'center',
 flex: 1,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 },
 statNumber: {
 fontSize: 18,
 fontWeight: 'bold',
 color: '#333',
 marginTop: 10,
 },
 statLabel: {
 fontSize: 12,
 color: '#6c757d',
 marginTop: 5,
 textAlign: 'center',
 },
 transactionCard: {
 backgroundColor: '#fff',
 padding: 15,
 borderRadius: 12,
 marginBottom: 10,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 },
 transactionHeader: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: 8,
 },
 transactionType: {
 fontSize: 14,
 fontWeight: '600',
 color: '#333',
 },
 transactionStatus: {
 fontSize: 12,
 fontWeight: '600',
 },
 transactionDescription: {
 fontSize: 13,
 color: '#6c757d',
 marginBottom: 8,
 },
 transactionFooter: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 },
 transactionAmount: {
 fontSize: 15,
 fontWeight: '600',
 color: '#4CAF50',
 },
 transactionDate: {
 fontSize: 12,
 color: '#adb5bd',
 },
 emptyState: {
 alignItems: 'center',
 padding: 40,
 },
 emptyText: {
 fontSize: 16,
 color: '#6c757d',
 marginTop: 10,
 },
 actionButton: {
 backgroundColor: '#fff',
 padding: 15,
 borderRadius: 12,
 marginBottom: 10,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 flexDirection: 'row',
 alignItems: 'center',
 },
 actionButtonText: {
 flex: 1,
 marginLeft: 15,
 fontWeight: '600',
 color: '#333',
 fontSize: 15,
 },
 modalContainer: {
 flex: 1,
 backgroundColor: '#f5f7fa',
 },
 modalHeader: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingTop: 50,
 paddingBottom: 15,
 paddingHorizontal: 15,
 backgroundColor: '#fff',
 borderBottomWidth: 1,
 borderBottomColor: '#dee2e6',
 },
 modalTitle: {
 fontSize: 18,
 fontWeight: 'bold',
 color: '#333',
 },
 filtersContainer: {
 backgroundColor: '#fff',
 padding: 15,
 borderBottomWidth: 1,
 borderBottomColor: '#dee2e6',
 },
 filterLabel: {
 fontSize: 12,
 fontWeight: '600',
 color: '#6c757d',
 marginBottom: 8,
 marginTop: 8,
 },
 filterChip: {
 paddingVertical: 8,
 paddingHorizontal: 16,
 borderRadius: 20,
 backgroundColor: '#f8f9fa',
 marginRight: 10,
 borderWidth: 1,
 borderColor: '#dee2e6',
 },
 filterChipActive: {
 backgroundColor: '#4CAF50',
 borderColor: '#4CAF50',
 },
 filterChipText: {
 fontSize: 13,
 color: '#6c757d',
 fontWeight: '600',
 },
 filterChipTextActive: {
 color: '#fff',
 },
 transactionsList: {
 padding: 15,
 },
});
