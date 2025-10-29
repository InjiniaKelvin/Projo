/**
 * Real-time Notifications Component
 * 
 * This component displays and manages real-time notifications including:
 * - Booking updates
 * - Payment notifications
 * - Chat messages
 * - Emergency alerts
 */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
 Alert,
 FlatList,
 Modal,
 RefreshControl,
 SafeAreaView,
 StyleSheet,
 Text,
 TouchableOpacity,
 View
} from 'react-native';
import { useWebSocket } from '../contexts/WebSocketContext';

type NotificationCenterProps = {
 visible: boolean;
 onClose: () => void;
};

type Notification = {
 id?: string | number;
 _id?: string | number;
 title: string;
 message: string;
 type: string;
 priority?: string;
 read?: boolean;
 isRead?: boolean;
 timestamp?: string | number | Date;
 createdAt?: string | number | Date;
 data?: any;
};

const NotificationCenter = ({ visible, onClose }: NotificationCenterProps) => {
 const { notifications, markNotificationAsRead, clearAllNotifications } = useWebSocket();
 const [refreshing, setRefreshing] = useState(false);
 const [serverNotifications, setServerNotifications] = useState<Notification[]>([]);

 // Fetch notifications from server
 const fetchServerNotifications = async () => {
 try {
 setRefreshing(true);
 const token = await AsyncStorage.getItem('authToken');
 
 const response = await fetch(`${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/notifications`, {
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 }
 });

 if (response.ok) {
 const data = await response.json();
 setServerNotifications(data.data.notifications || []);
 }
 } catch (error) {
 console.error('Failed to fetch notifications:', error);
 } finally {
 setRefreshing(false);
 }
 };

 useEffect(() => {
 if (visible) {
 fetchServerNotifications();
 }
 }, [visible]);

 // Combine real-time and server notifications
 const allNotifications = [
 ...notifications,
 ...serverNotifications.filter((serverNotif) => 
 !notifications.find((realtimeNotif: any) => realtimeNotif.id === serverNotif.id)
 )
 ].sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime());

 const handleNotificationPress = async (notification: Notification) => {
 // Mark as read
 if (!notification.read && !notification.isRead) {
 markNotificationAsRead(notification.id);
 
 // Mark on server if it's a server notification
 if (notification._id) {
 try {
 const token = await AsyncStorage.getItem('authToken');
 await fetch(`${__DEV__ ? 'http://localhost:3000' : 'https://your-server.com'}/api/notifications/${notification._id}/read`, {
 method: 'PUT',
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 }
 });
 } catch (error) {
 console.error('Failed to mark notification as read:', error);
 }
 }
 }

 // Handle notification action based on type
 switch (notification.type) {
 case 'booking_update':
 case 'new_booking':
 case 'technician_assigned':
 // Navigate to booking details
 if (notification.data?.booking) {
 // Navigation logic here
 console.log('Navigate to booking:', notification.data.booking._id);
 }
 break;
 case 'payment':
 // Navigate to payment/earnings screen
 console.log('Navigate to payments');
 break;
 case 'chat':
 // Navigate to chat screen
 if (notification.data?.roomId) {
 console.log('Navigate to chat:', notification.data.roomId);
 }
 break;
 case 'emergency':
 // Handle emergency notification
 Alert.alert(
 'Emergency Alert',
 notification.message,
 [{ text: 'OK' }]
 );
 break;
 }
 };

 const handleClearAll = () => {
 Alert.alert(
 'Clear All Notifications',
 'Are you sure you want to clear all notifications?',
 [
 { text: 'Cancel', style: 'cancel' },
 { 
 text: 'Clear All', 
 style: 'destructive',
 onPress: clearAllNotifications
 }
 ]
 );
 };

 const getNotificationIcon = (type: string) => {
 switch (type) {
 case 'booking_update':
 case 'new_booking':
 return 'calendar-outline';
 case 'technician_assigned':
 return 'person-add-outline';
 case 'payment':
 return 'wallet-outline';
 case 'chat':
 return 'chatbubble-outline';
 case 'emergency':
 return 'warning-outline';
 case 'system':
 return 'information-circle-outline';
 default:
 return 'notifications-outline';
 }
 };

 const getNotificationColor = (type: string, priority?: string) => {
 if (priority === 'high' || priority === 'critical' || type === 'emergency') {
 return '#FF4444';
 }
 switch (type) {
 case 'payment':
 return '#4CAF50';
 case 'booking_update':
 case 'new_booking':
 return '#2196F3';
 case 'chat':
 return '#FF9800';
 default:
 return '#757575';
 }
 };

 const renderNotification = ({ item }: { item: Notification }) => {
 const isRead = item.read || item.isRead;
 const timestamp = new Date(item.timestamp || item.createdAt || Date.now());
 const timeAgo = getTimeAgo(timestamp);

 return (
 <TouchableOpacity
 style={[
 styles.notificationItem,
 !isRead && styles.unreadNotification
 ]}
 onPress={() => handleNotificationPress(item)}
 >
 <View style={styles.notificationHeader}>
 <View style={[
 styles.iconContainer,
 { backgroundColor: getNotificationColor(item.type, item.priority) }
 ]}>
 <Ionicons
 name={getNotificationIcon(item.type)}
 size={20}
 color="white"
 />
 </View>
 <View style={styles.notificationContent}>
 <Text style={[styles.notificationTitle, !isRead && styles.unreadText]}>
 {item.title}
 </Text>
 <Text style={styles.notificationMessage} numberOfLines={2}>
 {item.message}
 </Text>
 <Text style={styles.notificationTime}>
 {timeAgo}
 </Text>
 </View>
 {!isRead && <View style={styles.unreadDot} />}
 </View>
 </TouchableOpacity>
 );
 };

 const getTimeAgo = (date: Date) => {
 const now = new Date();
 const diff = now.getTime() - date.getTime();
 const minutes = Math.floor(diff / 60000);
 const hours = Math.floor(minutes / 60);
 const days = Math.floor(hours / 24);

 if (days > 0) return `${days}d ago`;
 if (hours > 0) return `${hours}h ago`;
 if (minutes > 0) return `${minutes}m ago`;
 return 'Just now';
 };

 return (
 <Modal
 visible={visible}
 animationType="slide"
 presentationStyle="pageSheet"
 >
 <SafeAreaView style={styles.container}>
 <View style={styles.header}>
 <TouchableOpacity onPress={onClose} style={styles.closeButton}>
 <Ionicons name="close" size={24} color="#333" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Notifications</Text>
 <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
 <Text style={styles.clearButtonText}>Clear All</Text>
 </TouchableOpacity>
 </View>

 {allNotifications.length === 0 ? (
 <View style={styles.emptyState}>
 <Ionicons name="notifications-outline" size={64} color="#ccc" />
 <Text style={styles.emptyText}>No notifications yet</Text>
 <Text style={styles.emptySubtext}>
 You'll see booking updates, messages, and other important notifications here
 </Text>
 </View>
 ) : (
 <FlatList
 data={allNotifications}
 renderItem={renderNotification}
 keyExtractor={(item) => item.id?.toString() || item._id?.toString() || Math.random().toString()}
 refreshControl={
 <RefreshControl
 refreshing={refreshing}
 onRefresh={fetchServerNotifications}
 tintColor="#0d6efd"
 />
 }
 contentContainerStyle={styles.listContainer}
 />
 )}
 </SafeAreaView>
 </Modal>
 );
};

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#fff',
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingHorizontal: 16,
 paddingVertical: 12,
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 },
 closeButton: {
 padding: 8,
 },
 headerTitle: {
 fontSize: 18,
 fontWeight: '600',
 color: '#333',
 },
 clearButton: {
 padding: 8,
 },
 clearButtonText: {
 color: '#0d6efd',
 fontSize: 16,
 fontWeight: '500',
 },
 listContainer: {
 padding: 16,
 },
 notificationItem: {
 backgroundColor: '#fff',
 borderRadius: 12,
 padding: 16,
 marginBottom: 12,
 borderWidth: 1,
 borderColor: '#eee',
 shadowColor: '#000',
 shadowOffset: {
 width: 0,
 height: 1,
 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 elevation: 2,
 },
 unreadNotification: {
 backgroundColor: '#f8f9ff',
 borderColor: '#0d6efd',
 borderWidth: 1,
 },
 notificationHeader: {
 flexDirection: 'row',
 alignItems: 'flex-start',
 },
 iconContainer: {
 width: 40,
 height: 40,
 borderRadius: 20,
 justifyContent: 'center',
 alignItems: 'center',
 marginRight: 12,
 },
 notificationContent: {
 flex: 1,
 },
 notificationTitle: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginBottom: 4,
 },
 unreadText: {
 color: '#0d6efd',
 },
 notificationMessage: {
 fontSize: 14,
 color: '#666',
 lineHeight: 20,
 marginBottom: 4,
 },
 notificationTime: {
 fontSize: 12,
 color: '#999',
 },
 unreadDot: {
 width: 8,
 height: 8,
 borderRadius: 4,
 backgroundColor: '#0d6efd',
 marginLeft: 8,
 marginTop: 4,
 },
 emptyState: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 paddingHorizontal: 32,
 },
 emptyText: {
 fontSize: 18,
 fontWeight: '600',
 color: '#666',
 marginTop: 16,
 marginBottom: 8,
 },
 emptySubtext: {
 fontSize: 14,
 color: '#999',
 textAlign: 'center',
 lineHeight: 20,
 },
});

export default NotificationCenter;
