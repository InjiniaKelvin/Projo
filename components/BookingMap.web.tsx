import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface BookingMapProps {
  booking: any;
  technicianLocation: any;
  locationHistory: any[];
}

export default function BookingMap({ booking, technicianLocation, locationHistory }: BookingMapProps) {
  return (
    <View style={styles.webMapPlaceholder}>
      <ThemedText style={styles.webMapText}>Map view is available on mobile devices</ThemedText>
      <View style={styles.locationInfo}>
        <ThemedText>📍 Your Location:</ThemedText>
        <ThemedText style={styles.coordinates}>
          Lat: {booking.location.coordinates.lat.toFixed(6)}, Lng: {booking.location.coordinates.lng.toFixed(6)}
        </ThemedText>
        {technicianLocation && (
          <>
            <ThemedText style={{ marginTop: 16 }}>🔧 Technician Location:</ThemedText>
            <ThemedText style={styles.coordinates}>
              Lat: {technicianLocation.latitude.toFixed(6)}, Lng: {technicianLocation.longitude.toFixed(6)}
            </ThemedText>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  webMapText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  locationInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    maxWidth: 400,
  },
  coordinates: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 4,
  },
});
