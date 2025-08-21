/**
 * WebSocket Context
 * 
 * Provides real-time communication capabilities for the QuickFix app
 * Handles booking updates, technician tracking, and chat messaging
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './SimpleAuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [bookingUpdates, setBookingUpdates] = useState({});
  const [technicianLocations, setTechnicianLocations] = useState({});
  const [notifications, setNotifications] = useState([]);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only last 50 notifications
  }, []);

  const connectSocket = useCallback(() => {
    const handleReconnect = () => {
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
        setTimeout(() => {
          console.log(`🔄 Attempting to reconnect... (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          reconnectAttempts.current++;
          connectSocket();
        }, delay);
      } else {
        console.log('❌ Max reconnection attempts reached');
      }
    };

    try {
      const socketInstance = io(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000', {
        auth: {
          token: token
        },
        transports: ['websocket'],
        timeout: 20000,
      });

      socketInstance.on('connect', () => {
        console.log('✅ WebSocket connected');
        setConnected(true);
        setSocket(socketInstance);
        reconnectAttempts.current = 0;

        // Join user room
        socketInstance.emit('join-user-room', {
          userId: user._id,
          userType: user.role
        });
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        setConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, reconnect manually
          handleReconnect();
        }
      });

      socketInstance.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
        handleReconnect();
      });

      // Booking update events
      socketInstance.on('booking-updated', (data) => {
        console.log('📦 Booking updated:', data);
        setBookingUpdates(prev => ({
          ...prev,
          [data.bookingId]: data
        }));
        
        // Add to notifications
        addNotification({
          id: Date.now().toString(),
          type: 'booking_update',
          title: 'Booking Updated',
          message: data.message || 'Your booking status has been updated',
          timestamp: new Date().toISOString(),
          data: data
        });
      });

      // Technician assignment events
      socketInstance.on('technician-assigned', (data) => {
        console.log('👨‍🔧 Technician assigned:', data);
        setBookingUpdates(prev => ({
          ...prev,
          [data.bookingId]: {
            ...prev[data.bookingId],
            technician: data.technician,
            status: 'assigned'
          }
        }));

        addNotification({
          id: Date.now().toString(),
          type: 'technician_assigned',
          title: 'Technician Assigned',
          message: `${data.technician.name} has been assigned to your booking`,
          timestamp: new Date().toISOString(),
          data: data
        });
      });

      // Location updates
      socketInstance.on('technician-location-update', (data) => {
        console.log('📍 Technician location updated:', data);
        setTechnicianLocations(prev => ({
          ...prev,
          [data.technicianId]: data.location
        }));
      });

      // Chat message events
      socketInstance.on('new-message', (data) => {
        console.log('💬 New message:', data);
        addNotification({
          id: Date.now().toString(),
          type: 'new_message',
          title: 'New Message',
          message: `${data.senderName}: ${data.message}`,
          timestamp: new Date().toISOString(),
          data: data
        });
      });

      // Payment events
      socketInstance.on('payment-status-updated', (data) => {
        console.log('💳 Payment status updated:', data);
        addNotification({
          id: Date.now().toString(),
          type: 'payment_update',
          title: 'Payment Update',
          message: data.message,
          timestamp: new Date().toISOString(),
          data: data
        });
      });

      // Emergency alerts
      socketInstance.on('emergency-alert', (data) => {
        console.log('🚨 Emergency alert:', data);
        addNotification({
          id: Date.now().toString(),
          type: 'emergency_alert',
          title: 'Emergency Alert',
          message: data.message,
          timestamp: new Date().toISOString(),
          data: data,
          priority: 'high'
        });
      });

    } catch (error) {
      console.error('Error creating socket connection:', error);
    }
  }, [token, user, addNotification]);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  }, [socket]);

  useEffect(() => {
    if (user && token) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token, connectSocket, disconnectSocket]);

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Booking-related functions
  const joinBookingRoom = (bookingId) => {
    if (socket && connected) {
      socket.emit('join-booking-room', { bookingId });
    }
  };

  const leaveBookingRoom = (bookingId) => {
    if (socket && connected) {
      socket.emit('leave-booking-room', { bookingId });
    }
  };

  const sendBookingUpdate = (bookingId, update) => {
    if (socket && connected) {
      socket.emit('booking-update', { bookingId, ...update });
    }
  };

  // Chat-related functions
  const joinChatRoom = (chatRoomId) => {
    if (socket && connected) {
      socket.emit('join-chat-room', { chatRoomId });
    }
  };

  const leaveChatRoom = (chatRoomId) => {
    if (socket && connected) {
      socket.emit('leave-chat-room', { chatRoomId });
    }
  };

  const sendMessage = (chatRoomId, message) => {
    if (socket && connected) {
      socket.emit('send-message', {
        chatRoomId,
        message,
        timestamp: new Date().toISOString()
      });
    }
  };

  const sendTypingIndicator = (chatRoomId, isTyping) => {
    if (socket && connected) {
      socket.emit('typing-indicator', { chatRoomId, isTyping });
    }
  };

  // Location-related functions
  const updateTechnicianLocation = (location) => {
    if (socket && connected && user?.role === 'technician') {
      socket.emit('update-technician-location', {
        technicianId: user._id,
        location,
        timestamp: new Date().toISOString()
      });
    }
  };

  const requestTechnicianLocation = (technicianId) => {
    if (socket && connected) {
      socket.emit('request-technician-location', { technicianId });
    }
  };

  // Payment-related functions
  const subscribeToPaymentUpdates = (transactionId) => {
    if (socket && connected) {
      socket.emit('subscribe-payment-updates', { transactionId });
    }
  };

  const unsubscribeFromPaymentUpdates = (transactionId) => {
    if (socket && connected) {
      socket.emit('unsubscribe-payment-updates', { transactionId });
    }
  };

  const value = {
    // Connection state
    socket,
    connected,
    
    // Data
    bookingUpdates,
    technicianLocations,
    notifications,
    
    // Notification functions
    clearNotification,
    clearAllNotifications,
    
    // Booking functions
    joinBookingRoom,
    leaveBookingRoom,
    sendBookingUpdate,
    
    // Chat functions
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    sendTypingIndicator,
    
    // Location functions
    updateTechnicianLocation,
    requestTechnicianLocation,
    
    // Payment functions
    subscribeToPaymentUpdates,
    unsubscribeFromPaymentUpdates,
    
    // Connection management
    reconnect: connectSocket,
    disconnect: disconnectSocket
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
