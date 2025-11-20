import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/ui/Header';
import apiClient from '@/config/api';
import { API_ENDPOINTS } from '@/config/api';
import io from 'socket.io-client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import BookingMap from '@/components/BookingMap';

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [booking, setBooking] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [technicianLocation, setTechnicianLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchBookingDetails();

    socketRef.current = io(API_ENDPOINTS.BASE_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
      socketRef.current.emit('get_location_history', { bookingId: id });
    });

    socketRef.current.on('location_history', (data) => {
      if (data.bookingId === id) {
        setLocationHistory(data.history);
        if (data.history.length > 0) {
          setTechnicianLocation(data.history[data.history.length - 1]);
        }
      }
    });

    socketRef.current.on('technician_location_updated', (data) => {
      if (data.bookingId === id) {
        setTechnicianLocation(data.location);
        setLocationHistory((prevHistory) => [...prevHistory, data.location]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, token]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/bookings/${id}`);
      if (response.data.success) {
        setBooking(response.data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch booking details.');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      Alert.alert('Error', 'An error occurred while fetching booking details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading booking details...</ThemedText>
      </ThemedView>
    );
  }

  if (!booking) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Booking not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header title={`Booking #${booking.bookingId}`} canGoBack />
      <BookingMap
        booking={booking}
        technicianLocation={technicianLocation}
        locationHistory={locationHistory}
      />
      <View style={styles.detailsContainer}>
        <ThemedText style={styles.serviceType}>{booking.serviceType}</ThemedText>
        <ThemedText style={styles.status}>Status: {booking.status}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 16,
  },
  serviceType: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    marginTop: 8,
  },
});
