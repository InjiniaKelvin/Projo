import React from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { StyleSheet } from 'react-native';

interface BookingMapProps {
  booking: any;
  technicianLocation: any;
  locationHistory: any[];
}

export default function BookingMap({ booking, technicianLocation, locationHistory }: BookingMapProps) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: booking.location.coordinates.lat,
        longitude: booking.location.coordinates.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {technicianLocation && (
        <Marker
          coordinate={{
            latitude: technicianLocation.latitude,
            longitude: technicianLocation.longitude,
          }}
          title="Technician"
          description="Technician's current location"
        />
      )}
      <Marker
        coordinate={{
          latitude: booking.location.coordinates.lat,
          longitude: booking.location.coordinates.lng,
        }}
        title="Your Location"
        pinColor="blue"
      />
      {locationHistory.length > 1 && (
        <Polyline
          coordinates={locationHistory.map((loc: any) => ({ latitude: loc.latitude, longitude: loc.longitude }))}
          strokeColor="#000"
          strokeWidth={3}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
