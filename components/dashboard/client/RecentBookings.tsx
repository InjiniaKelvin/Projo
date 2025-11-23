import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'expo-router';

type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'submitted' | 'technician_assigned';

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
    submitted: '#2196F3',
    confirmed: '#2196F3',
    technician_assigned: '#9C27B0',
    'in-progress': '#9C27B0',
    in_progress: '#9C27B0',
    completed: '#4CAF50',
    cancelled: '#F44336'
  };
  return colors[status] || '#757575';
};

const getStatusBackgroundColor = (status: BookingStatus) => {
  const colors = {
    pending: '#FFF3E0',
    submitted: '#E3F2FD',
    confirmed: '#E3F2FD',
    technician_assigned: '#F3E5F5',
    'in-progress': '#F3E5F5',
    in_progress: '#F3E5F5',
    completed: '#E8F5E9',
    cancelled: '#FFEBEE'
  };
  return colors[status] || '#F5F5F5';
};

const getStatusIcon = (status: BookingStatus) => {
  const icons = {
    pending: 'time',
    submitted: 'checkmark-circle',
    confirmed: 'checkmark-circle',
    technician_assigned: 'person',
    'in-progress': 'construct',
    in_progress: 'construct',
    completed: 'checkmark-done-circle',
    cancelled: 'close-circle'
  };
  return icons[status] || 'help-circle';
};

const formatCurrency = (amount: number) => {
  return `KES ${(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const formatStatusText = (status: string) => {
  return status.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase();
};

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const router = useRouter();

  return (
    <Card style={styles.card}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Recent Bookings</ThemedText>
        <TouchableOpacity onPress={() => router.push('/bookings')} style={styles.seeAllButton}>
          <ThemedText style={styles.seeAllText}>See All</ThemedText>
          <Ionicons name="arrow-forward" size={14} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="calendar-outline" size={48} color="#2196F3" />
          </View>
          <ThemedText style={styles.emptyStateTitle}>No bookings yet</ThemedText>
          <ThemedText style={styles.emptyStateText}>Book a service to get started</ThemedText>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => router.push('/booking/redesigned-form')}
          >
            <ThemedText style={styles.emptyStateButtonText}>Book Now</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        bookings.map((booking) => (
          <TouchableOpacity
            key={booking._id}
            style={styles.bookingCard}
            onPress={() => router.push(`/booking/${booking._id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.bookingContent}>
              <View style={styles.bookingLeft}>
                <View style={[styles.bookingIcon, { backgroundColor: getStatusBackgroundColor(booking.status) }]}>
                  <Ionicons
                    name={getStatusIcon(booking.status) as any}
                    size={24}
                    color={getStatusColor(booking.status)}
                  />
                </View>
                <View style={styles.bookingDetails}>
                  <ThemedText style={styles.bookingService}>{booking.serviceType}</ThemedText>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#666" />
                    <ThemedText style={styles.bookingLocation} numberOfLines={1}>
                      {booking.location?.ward}, {booking.location?.constituency}
                    </ThemedText>
                  </View>
                  <View style={styles.bookingFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor(booking.status) }]}>
                      <ThemedText style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                        {formatStatusText(booking.status)}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.bookingDate}>{formatDate(booking.createdAt)}</ThemedText>
                  </View>
                </View>
              </View>
              <View style={styles.bookingRight}>
                {booking.estimatedCost ? (
                  <ThemedText style={styles.bookingCost}>{formatCurrency(booking.estimatedCost)}</ThemedText>
                ) : null}
                <Ionicons name="chevron-forward" size={20} color="#CCC" style={styles.chevron} />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  bookingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
  },
  bookingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingDetails: {
    flex: 1,
  },
  bookingService: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  bookingLocation: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bookingDate: {
    fontSize: 11,
    color: '#999',
  },
  bookingRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bookingCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  chevron: {
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
