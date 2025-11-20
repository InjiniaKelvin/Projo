import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'expo-router';
import { SHADOWS } from '@/utils/shadows';

type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

type Booking = {
  _id: string;
  status: BookingStatus;
  createdAt: string;
  serviceType: string;
  location: {
    ward: string;
    constituency: string;
  };
  estimatedCost: number;
};

type RecentBookingsProps = {
  bookings: Booking[];
};

const getStatusColor = (status: BookingStatus) => {
  const colors = {
    pending: '#FF9800',
    confirmed: '#2196F3',
    'in-progress': '#9C27B0',
    completed: '#4CAF50',
    cancelled: '#FF5252'
  };
  return colors[status] || '#757575';
};

const getStatusBackgroundColor = (status: BookingStatus) => {
  const colors = {
    pending: 'rgba(255, 152, 0, 0.15)',
    confirmed: 'rgba(33, 150, 243, 0.15)',
    'in-progress': 'rgba(156, 39, 176, 0.15)',
    completed: 'rgba(76, 175, 80, 0.15)',
    cancelled: 'rgba(255, 82, 82, 0.15)'
  };
  return colors[status] || 'rgba(117, 117, 117, 0.15)';
};

const getStatusIcon = (status: BookingStatus) => {
  const icons = {
    pending: 'time-outline',
    confirmed: 'checkmark-circle-outline',
    'in-progress': 'construct-outline',
    completed: 'checkmark-done-circle',
    cancelled: 'close-circle-outline'
  };
  return icons[status] || 'help-circle-outline';
};

const formatCurrency = (amount: number) => {
  return `KES ${(amount || 0).toLocaleString('en-KE')}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const router = useRouter();

  return (
    <Card>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Recent Bookings</ThemedText>
        <TouchableOpacity onPress={() => router.push('/bookings')}>
          <ThemedText style={styles.seeAllText}>See All</ThemedText>
        </TouchableOpacity>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#CCC" />
          <ThemedText style={styles.emptyStateText}>No bookings yet</ThemedText>
        </View>
      ) : (
        bookings.map((booking) => (
          <TouchableOpacity
            key={booking._id}
            style={styles.bookingCard}
            onPress={() => router.push(`/booking/${booking._id}`)}
          >
            <View style={styles.bookingHeader}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor(booking.status) }]}>
                <Ionicons
                  name={getStatusIcon(booking.status) as any}
                  size={14}
                  color={getStatusColor(booking.status)}
                />
                <ThemedText style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                  {booking.status.toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText style={styles.bookingDate}>{formatDate(booking.createdAt)}</ThemedText>
            </View>

            <ThemedText style={styles.bookingService}>{booking.serviceType}</ThemedText>
            <ThemedText style={styles.bookingLocation} numberOfLines={1}>
              <Ionicons name="location" size={12} color="#666" />
              {' '}{booking.location?.ward}, {booking.location?.constituency}
            </ThemedText>

            {booking.estimatedCost && (
              <ThemedText style={styles.bookingCost}>{formatCurrency(booking.estimatedCost)}</ThemedText>
            )}
          </TouchableOpacity>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bookingDate: {
    fontSize: 11,
    color: '#999',
  },
  bookingService: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  bookingLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  bookingCost: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
});
