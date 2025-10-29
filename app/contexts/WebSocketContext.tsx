/**
 * WebSocket Context for Real-time Features
 * 
 * This context provides WebSocket functionality throughout the app including:
 * - Real-time booking updates
 * - Live chat functionality
 * - Technician location tracking
 * - Push notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';

import type { DefaultEventsMap } from '@socket.io/component-emitter';

type Notification = {
 id: number;
 type: string;
 title: string;
 message: string;
 data?: any;
 timestamp: Date;
 read?: boolean;
 priority?: string;
};

const WebSocketContext = createContext<any>(undefined);

export const useWebSocket = () => {
 const context = useContext(WebSocketContext);
 if (!context) {
 throw new Error('useWebSocket must be used within a WebSocketProvider');
 }
 return context;
};

export const WebSocketProvider = ({ children }: PropsWithChildren<{}>) => {
 const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
 const [connected, setConnected] = useState(false);
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const reconnectAttempts = useRef(0);
 const maxReconnectAttempts = 5;

 const connectSocket = async () => {
 try {
 const token = await AsyncStorage.getItem('authToken');
 if (!token) {
 console.log('No auth token found, cannot connect to WebSocket');
 return;
 }

 const serverUrl = __DEV__ 
 ? 'http://localhost:3000' 
 : 'https://your-production-server.com';

 const newSocket = io(serverUrl, {
 auth: {
 token
 },
 transports: ['websocket', 'polling'],
 timeout: 20000,
 });

 newSocket.on('connect', () => {
 console.log(' WebSocket connected');
 setConnected(true);
 setSocket(newSocket);
 reconnectAttempts.current = 0;
 });

 newSocket.on('disconnect', (reason) => {
 console.log(' WebSocket disconnected:', reason);
 setConnected(false);
 
 // Attempt to reconnect if not manually disconnected
 if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
 setTimeout(() => {
 reconnectAttempts.current += 1;
 console.log(` Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
 connectSocket();
 }, Math.pow(2, reconnectAttempts.current) * 1000); // Exponential backoff
 }
 });

 newSocket.on('connect_error', (error) => {
 console.error('WebSocket connection error:', error);
 setConnected(false);
 });

 // Real-time notification handlers
 newSocket.on('notification', (data) => {
 console.log(' New notification:', data);
 addNotification(data);
 });

 newSocket.on('booking_status_updated', (data) => {
 console.log(' Booking status updated:', data);
 addNotification({
 id: Date.now(),
 type: 'booking_update',
 title: 'Booking Update',
 message: `Your booking status has been updated to ${data.status}`,
 data: data.booking,
 timestamp: new Date()
 });
 });

 newSocket.on('new_booking', (data) => {
 console.log(' New booking assigned:', data);
 addNotification({
 id: Date.now(),
 type: 'new_booking',
 title: 'New Job Assigned',
 message: data.message,
 data: data.booking,
 timestamp: new Date()
 });
 });

 newSocket.on('booking_assigned', (data) => {
 console.log(' Technician assigned:', data);
 addNotification({
 id: Date.now(),
 type: 'technician_assigned',
 title: 'Technician Assigned',
 message: `${data.technician.firstName} has been assigned to your job`,
 data,
 timestamp: new Date()
 });
 });

 newSocket.on('payment_received', (data) => {
 console.log(' Payment received:', data);
 addNotification({
 id: Date.now(),
 type: 'payment',
 title: 'Payment Received',
 message: `You received $${data.amount}`,
 data,
 timestamp: new Date()
 });
 });

 newSocket.on('emergency_alert', (data) => {
 console.log(' Emergency alert:', data);
 Alert.alert(
 'Emergency Alert',
 data.message,
 [{ text: 'OK', style: 'default' }]
 );
 addNotification({
 id: Date.now(),
 type: 'emergency',
 title: 'Emergency Alert',
 message: data.message,
 data,
 timestamp: new Date(),
 priority: 'high'
 });
 });

 // Chat message handlers
 newSocket.on('new_message', (data) => {
 console.log(' New chat message:', data);
 addNotification({
 id: Date.now(),
 type: 'chat',
 title: 'New Message',
 message: `${data.sender.firstName}: ${data.message}`,
 data,
 timestamp: new Date()
 });
 });

 newSocket.on('technician_location_update', (data) => {
 console.log(' Technician location updated:', data);
 // Handle location updates in booking screens
 });

 } catch (error) {
 console.error('Failed to connect WebSocket:', error);
 }
 };

 const disconnectSocket = () => {
 if (socket) {
 socket.disconnect();
 setSocket(null);
 setConnected(false);
 }
 };

 const addNotification = (notification: Notification) => {
 setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
 setUnreadCount(prev => prev + 1);
 };

 const markNotificationAsRead = (notificationId: number) => {
 setNotifications(prev => 
 prev.map(notif => 
 notif.id === notificationId 
 ? { ...notif, read: true }
 : notif
 )
 );
 setUnreadCount(prev => Math.max(0, prev - 1));
 };

 const clearAllNotifications = () => {
 setNotifications([]);
 setUnreadCount(0);
 };

 // WebSocket event emitters
 const joinRoom = (roomId: string) => {
 if (socket && connected) {
 socket.emit('join_room', roomId);
 }
 };

 const leaveRoom = (roomId: string) => {
 if (socket && connected) {
 socket.emit('leave_room', roomId);
 }
 };

 const sendMessage = (roomId: string, message: any, messageType: string = 'text') => {
 if (socket && connected) {
 socket.emit('send_message', {
 roomId,
 message,
 messageType,
 timestamp: new Date()
 });
 }
 };

 const updateLocation = (location: { latitude: number; longitude: number; [key: string]: any }) => {
 if (socket && connected) {
 socket.emit('location_update', location);
 }
 };

 const updateAvailability = (isAvailable: boolean) => {
 if (socket && connected) {
 socket.emit('availability_update', { isAvailable });
 }
 };

 const reportEmergency = (
 bookingId: string | number,
 emergencyType: string,
 description: string
 ) => {
 if (socket && connected) {
 socket.emit('emergency_report', {
 bookingId,
 emergencyType,
 description,
 timestamp: new Date()
 });
 }
 };

 useEffect(() => {
 connectSocket();

 return () => {
 disconnectSocket();
 };
 }, []);

 const value = {
 socket,
 connected,
 notifications,
 unreadCount,
 connectSocket,
 disconnectSocket,
 addNotification,
 markNotificationAsRead,
 clearAllNotifications,
 joinRoom,
 leaveRoom,
 sendMessage,
 updateLocation,
 updateAvailability,
 reportEmergency
 };

 return (
 <WebSocketContext.Provider value={value}>
 {children}
 </WebSocketContext.Provider>
 );
};

export default WebSocketContext;
