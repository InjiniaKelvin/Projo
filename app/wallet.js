/**
 * Wallet Screen - Production Ready
 * Fully integrated with PaymentService, WalletService, TransactionService
 * No mock data - all real API calls
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import {
 ActivityIndicator,
 Alert,
 FlatList,
 Modal,
 RefreshControl,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View
} from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';
import PaymentService from '../services/PaymentService';
import WalletService from '../services/WalletService';
import TransactionService from '../services/TransactionService';

export default function WalletScreen() {
 const { user } = useAuth();
 const router = useRouter();
 
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);
 const [walletBalance, setWalletBalance] = useState(0);
 const [escrowBalance, setEscrowBalance] = useState(0);
 const [pendingBalance, setPendingBalance] = useState(0);
 const [transactions, setTransactions] = useState([]);
 const [page, setPage] = useState(1);
 const [hasMore, setHasMore] = useState(true);
 
 const [showAddFunds, setShowAddFunds] = useState(false);
 const [showWithdraw, setShowWithdraw] = useState(false);
 const [amount, setAmount] = useState('');
 const [phoneNumber, setPhoneNumber] = useState('');
 const [selectedMethod, setSelectedMethod] = useState('mpesa');
 const [processing, setProcessing] = useState(false);

 useEffect(() => {
 loadWalletData();
 }, []);

 const loadWalletData = async () => {
 try {
 setLoading(true);
 await Promise.all([loadBalance(), loadTransactions(1)]);
 } catch (error) {
 console.error('Failed to load wallet data:', error);
 Alert.alert('Error', 'Failed to load wallet data. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 const loadBalance = async () => {
 try {
 const result = await WalletService.getWalletBalance();
 if (result.success) {
 setWalletBalance(result.data?.balance || 0);
 setEscrowBalance(result.data?.escrowBalance || 0);
 setPendingBalance(result.data?.pendingBalance || 0);
 }
 } catch (error) {
 console.error('Failed to load balance:', error);
 throw error;
 }
 };

 const loadTransactions = async (pageNum = 1) => {
 try {
 const result = await WalletService.getWalletTransactions(pageNum, 20);
 if (result.success) {
 if (pageNum === 1) {
 setTransactions(result.data?.transactions || []);
 } else {
 setTransactions(prev => [...prev, ...(result.data?.transactions || [])]);
 }
 setHasMore(result.data?.hasMore || false);
 setPage(pageNum);
 }
 } catch (error) {
 console.error('Failed to load transactions:', error);
 throw error;
 }
 };

 const onRefresh = useCallback(async () => {
 setRefreshing(true);
 try {
 await loadWalletData();
 } finally {
 setRefreshing(false);
 }
 }, []);

 const loadMoreTransactions = () => {
 if (!loading && hasMore) {
 loadTransactions(page + 1);
 }
 };

 const handleAddFunds = () => {
 setAmount('');
 setPhoneNumber(user?.phoneNumber || '');
 setSelectedMethod('mpesa');
 setShowAddFunds(true);
 };

 const processAddFunds = async () => {
 const numAmount = parseFloat(amount);
 const validation = WalletService.validateTopup(numAmount);
 
 if (!validation.valid) {
 Alert.alert('Invalid Amount', validation.errors.join('\n'));
 return;
 }

 if (selectedMethod === 'mpesa') {
 if (!PaymentService.validatePhoneNumber(phoneNumber)) {
 Alert.alert('Invalid Phone', 'Please enter a valid Kenyan phone number');
 return;
 }
 }

 try {
 setProcessing(true);
 
 const result = await WalletService.addFunds({
 amount: numAmount,
 paymentMethod: selectedMethod,
 phoneNumber: PaymentService.formatPhoneNumber(phoneNumber),
 email: user?.email
 });

 if (result.success) {
 if (selectedMethod === 'mpesa') {
 Alert.alert(
 'Payment Initiated',
 'Please check your phone for the M-Pesa payment prompt',
 [{
 text: 'OK',
 onPress: () => {
 setShowAddFunds(false);
 pollPaymentStatus(result.data.transactionId);
 }
 }]
 );
 } else if (selectedMethod === 'card') {
 const checkoutUrl = result.data?.checkoutUrl;
 if (checkoutUrl) {
 Alert.alert(
 'Card Payment',
 'You will be redirected to complete your payment',
 [{
 text: 'Continue',
 onPress: () => setShowAddFunds(false)
 }]
 );
 }
 }
 } else {
 throw new Error(result.message || 'Payment failed');
 }
 } catch (error) {
 console.error('Add funds error:', error);
 Alert.alert('Payment Failed', error.message || 'Failed to process payment');
 } finally {
 setProcessing(false);
 }
 };

 const pollPaymentStatus = async (transactionId) => {
 try {
 const result = await PaymentService.pollPaymentStatus(
 transactionId,
 (status) => console.log('Payment status:', status)
 );

 if (result.success) {
 Alert.alert('Success', 'Payment completed successfully!');
 await loadWalletData();
 } else {
 Alert.alert('Payment Failed', result.message || 'Payment was not completed');
 }
 } catch (error) {
 console.error('Poll error:', error);
 Alert.alert('Error', 'Failed to verify payment status');
 }
 };

 const handleWithdraw = async () => {
 if (walletBalance <= 0) {
 Alert.alert('Insufficient Balance', 'You don\'t have any funds to withdraw');
 return;
 }
 setAmount('');
 setPhoneNumber(user?.phoneNumber || '');
 setShowWithdraw(true);
 };

 const processWithdraw = async () => {
 const numAmount = parseFloat(amount);
 const validation = WalletService.validateWithdrawal(numAmount, walletBalance);
 
 if (!validation.valid) {
 Alert.alert('Invalid Withdrawal', validation.errors.join('\n'));
 return;
 }

 if (!PaymentService.validatePhoneNumber(phoneNumber)) {
 Alert.alert('Invalid Phone', 'Please enter a valid Kenyan phone number');
 return;
 }

 try {
 setProcessing(true);
 
 const result = await WalletService.withdrawFunds({
 amount: numAmount,
 phoneNumber: PaymentService.formatPhoneNumber(phoneNumber)
 });

 if (result.success) {
 Alert.alert(
 'Withdrawal Initiated',
 `KES ${numAmount} will be sent to ${phoneNumber} via M-Pesa shortly`,
 [{
 text: 'OK',
 onPress: () => {
 setShowWithdraw(false);
 loadWalletData();
 }
 }]
 );
 } else {
 throw new Error(result.message || 'Withdrawal failed');
 }
 } catch (error) {
 console.error('Withdraw error:', error);
 Alert.alert('Withdrawal Failed', error.message || 'Failed to process withdrawal');
 } finally {
 setProcessing(false);
 }
 };

 const getTransactionIcon = (type) => {
 const icons = {
 topup: 'arrow-down-outline',
 withdrawal: 'arrow-up-outline',
 payment: 'arrow-forward-outline',
 escrow_deposit: 'lock-closed-outline',
 escrow_release: 'unlock-outline',
 refund: 'return-down-back-outline'
 };
 return icons[type] || 'cash-outline';
 };

 const getTransactionColor = (type) => {
 if (type === 'topup' || type === 'refund' || type === 'escrow_release') {
 return '#10b981';
 }
 return '#ef4444';
 };

 const formatDate = (dateString) => {
 const date = new Date(dateString);
 const now = new Date();
 const diff = now - date;
 const days = Math.floor(diff / (1000 * 60 * 60 * 24));
 
 if (days === 0) return 'Today';
 if (days === 1) return 'Yesterday';
 if (days < 7) return `${days} days ago`;
 
 return date.toLocaleDateString();
 };

 const renderTransaction = ({ item }) => {
 const isCredit = item.type === 'topup' || item.type === 'refund' || item.type === 'escrow_release';
 const color = getTransactionColor(item.type);
 
 return (
 <View style={styles.transactionCard}>
 <View style={[styles.transactionIcon, { backgroundColor: `${color}20` }]}>
 <Ionicons name={getTransactionIcon(item.type)} size={24} color={color} />
 </View>
 <View style={styles.transactionDetails}>
 <Text style={styles.transactionDescription}>
 {TransactionService.formatTransactionType(item.type)}
 </Text>
 <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
 {item.description && (
 <Text style={styles.transactionNote} numberOfLines={1}>{item.description}</Text>
 )}
 </View>
 <View style={styles.transactionAmount}>
 <Text style={[styles.amountText, { color }]}>
 {isCredit ? '+' : '-'}KES {Math.abs(item.amount).toLocaleString()}
 </Text>
 <Text style={[
 styles.statusText,
 { color: TransactionService.formatTransactionStatus(item.status).color }
 ]}>
 {TransactionService.formatTransactionStatus(item.status).label}
 </Text>
 </View>
 </View>
 );
 };

 if (loading && !refreshing) {
 return (
 <View style={[styles.container, styles.centerContent]}>
 <ActivityIndicator size="large" color="#0d6efd" />
 <Text style={styles.loadingText}>Loading wallet...</Text>
 </View>
 );
 }

 return (
 <View style={styles.container}>
 <View style={styles.header}>
 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
 <Ionicons name="arrow-back" size={24} color="#fff" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>My Wallet</Text>
 <TouchableOpacity onPress={loadWalletData}>
 <Ionicons name="reload" size={24} color="#fff" />
 </TouchableOpacity>
 </View>

 <View style={styles.balanceCard}>
 <Text style={styles.balanceLabel}>Available Balance</Text>
 <Text style={styles.balanceAmount}>KES {walletBalance.toLocaleString()}</Text>
 
 {(escrowBalance > 0 || pendingBalance > 0) && (
 <View style={styles.balanceBreakdown}>
 {escrowBalance > 0 && (
 <Text style={styles.balanceSubtext}>
 In Escrow: KES {escrowBalance.toLocaleString()}
 </Text>
 )}
 {pendingBalance > 0 && (
 <Text style={styles.balanceSubtext}>
 Pending: KES {pendingBalance.toLocaleString()}
 </Text>
 )}
 </View>
 )}
 
 <View style={styles.balanceActions}>
 <TouchableOpacity 
 style={styles.balanceButton} 
 onPress={handleAddFunds}
 disabled={processing}
 >
 <Ionicons name="add" size={20} color="#fff" />
 <Text style={styles.balanceButtonText}>Add Funds</Text>
 </TouchableOpacity>
 <TouchableOpacity 
 style={[styles.balanceButton, styles.withdrawButton]} 
 onPress={handleWithdraw}
 disabled={processing || walletBalance <= 0}
 >
 <Ionicons name="download-outline" size={20} color="#0d6efd" />
 <Text style={[styles.balanceButtonText, styles.withdrawButtonText]}>Withdraw</Text>
 </TouchableOpacity>
 </View>
 </View>

 <View style={styles.transactionsContainer}>
 <Text style={styles.sectionTitle}>Recent Transactions</Text>
 {transactions.length === 0 ? (
 <View style={styles.emptyState}>
 <Ionicons name="receipt-outline" size={64} color="#ccc" />
 <Text style={styles.emptyText}>No transactions yet</Text>
 <Text style={styles.emptySubtext}>Your transactions will appear here</Text>
 </View>
 ) : (
 <FlatList
 data={transactions}
 renderItem={renderTransaction}
 keyExtractor={item => item._id || item.id}
 style={styles.transactionsList}
 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
 onEndReached={loadMoreTransactions}
 onEndReachedThreshold={0.5}
 showsVerticalScrollIndicator={false}
 />
 )}
 </View>

 <Modal visible={showAddFunds} transparent animationType="slide" onRequestClose={() => setShowAddFunds(false)}>
 <View style={styles.modalOverlay}>
 <View style={styles.modalContent}>
 <View style={styles.modalHeader}>
 <Text style={styles.modalTitle}>Add Funds</Text>
 <TouchableOpacity onPress={() => setShowAddFunds(false)}>
 <Ionicons name="close" size={24} color="#333" />
 </TouchableOpacity>
 </View>

 <Text style={styles.inputLabel}>Amount (KES)</Text>
 <TextInput
 style={styles.input}
 value={amount}
 onChangeText={setAmount}
 placeholder="Enter amount"
 keyboardType="numeric"
 />

 <Text style={styles.inputLabel}>Payment Method</Text>
 <View style={styles.methodButtons}>
 <TouchableOpacity
 style={[styles.methodButton, selectedMethod === 'mpesa' && styles.methodButtonActive]}
 onPress={() => setSelectedMethod('mpesa')}
 >
 <Text style={[styles.methodButtonText, selectedMethod === 'mpesa' && styles.methodButtonTextActive]}>
 M-Pesa
 </Text>
 </TouchableOpacity>
 <TouchableOpacity
 style={[styles.methodButton, selectedMethod === 'card' && styles.methodButtonActive]}
 onPress={() => setSelectedMethod('card')}
 >
 <Text style={[styles.methodButtonText, selectedMethod === 'card' && styles.methodButtonTextActive]}>
 Card
 </Text>
 </TouchableOpacity>
 </View>

 {selectedMethod === 'mpesa' && (
 <>
 <Text style={styles.inputLabel}>Phone Number</Text>
 <TextInput
 style={styles.input}
 value={phoneNumber}
 onChangeText={setPhoneNumber}
 placeholder="0712345678"
 keyboardType="phone-pad"
 />
 </>
 )}

 <TouchableOpacity
 style={[styles.submitButton, processing && styles.submitButtonDisabled]}
 onPress={processAddFunds}
 disabled={processing}
 >
 {processing ? (
 <ActivityIndicator color="#fff" />
 ) : (
 <Text style={styles.submitButtonText}>Continue</Text>
 )}
 </TouchableOpacity>
 </View>
 </View>
 </Modal>

 <Modal visible={showWithdraw} transparent animationType="slide" onRequestClose={() => setShowWithdraw(false)}>
 <View style={styles.modalOverlay}>
 <View style={styles.modalContent}>
 <View style={styles.modalHeader}>
 <Text style={styles.modalTitle}>Withdraw to M-Pesa</Text>
 <TouchableOpacity onPress={() => setShowWithdraw(false)}>
 <Ionicons name="close" size={24} color="#333" />
 </TouchableOpacity>
 </View>

 <Text style={styles.availableBalance}>
 Available: KES {walletBalance.toLocaleString()}
 </Text>

 <Text style={styles.inputLabel}>Amount (KES)</Text>
 <TextInput
 style={styles.input}
 value={amount}
 onChangeText={setAmount}
 placeholder="Enter amount"
 keyboardType="numeric"
 />

 <Text style={styles.inputLabel}>Phone Number</Text>
 <TextInput
 style={styles.input}
 value={phoneNumber}
 onChangeText={setPhoneNumber}
 placeholder="0712345678"
 keyboardType="phone-pad"
 />

 <Text style={styles.helpText}>
 Minimum: KES 10 * Maximum: KES 150,000
 </Text>

 <TouchableOpacity
 style={[styles.submitButton, processing && styles.submitButtonDisabled]}
 onPress={processWithdraw}
 disabled={processing}
 >
 {processing ? (
 <ActivityIndicator color="#fff" />
 ) : (
 <Text style={styles.submitButtonText}>Withdraw</Text>
 )}
 </TouchableOpacity>
 </View>
 </View>
 </Modal>
 </View>
 );
}

const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: '#f8f9fa' },
 centerContent: { justifyContent: 'center', alignItems: 'center' },
 loadingText: { marginTop: 10, color: '#6c757d' },
 header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d6efd', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15 },
 backButton: { marginRight: 15 },
 headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
 balanceCard: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, alignItems: 'center' },
 balanceLabel: { fontSize: 16, color: '#6c757d', marginBottom: 8 },
 balanceAmount: { fontSize: 36, fontWeight: 'bold', color: '#333', marginBottom: 10 },
 balanceBreakdown: { marginBottom: 15 },
 balanceSubtext: { fontSize: 14, color: '#6c757d', textAlign: 'center' },
 balanceActions: { flexDirection: 'row', width: '100%', marginTop: 10 },
 balanceButton: { flex: 1, flexDirection: 'row', backgroundColor: '#0d6efd', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
 withdrawButton: { backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#0d6efd' },
 balanceButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
 withdrawButtonText: { color: '#0d6efd' },
 transactionsContainer: { flex: 1, marginHorizontal: 15 },
 sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 15 },
 emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
 emptyText: { fontSize: 18, fontWeight: '600', color: '#6c757d', marginTop: 15 },
 emptySubtext: { fontSize: 14, color: '#adb5bd', marginTop: 5 },
 transactionsList: { flex: 1 },
 transactionCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
 transactionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
 transactionDetails: { flex: 1 },
 transactionDescription: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 4 },
 transactionDate: { fontSize: 12, color: '#6c757d' },
 transactionNote: { fontSize: 11, color: '#adb5bd', marginTop: 2 },
 transactionAmount: { alignItems: 'flex-end' },
 amountText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
 statusText: { fontSize: 11, textTransform: 'capitalize' },
 modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
 modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 400 },
 modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
 modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
 availableBalance: { fontSize: 14, color: '#0d6efd', marginBottom: 15, fontWeight: '600' },
 inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 15 },
 input: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, padding: 12, fontSize: 16 },
 methodButtons: { flexDirection: 'row', gap: 10 },
 methodButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', alignItems: 'center' },
 methodButtonActive: { backgroundColor: '#0d6efd', borderColor: '#0d6efd' },
 methodButtonText: { color: '#6c757d', fontWeight: '600' },
 methodButtonTextActive: { color: '#fff' },
 helpText: { fontSize: 12, color: '#6c757d', marginTop: 8 },
 submitButton: { backgroundColor: '#0d6efd', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 25 },
 submitButtonDisabled: { opacity: 0.6 },
 submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
