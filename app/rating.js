import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';
import apiClient from '../services/apiClient';

export default function RatingScreen() {
 const { user } = useAuth();
 const router = useRouter();
 const [selectedRating, setSelectedRating] = useState(0);
 const [selectedService, setSelectedService] = useState('');
 const [comment, setComment] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
 const [recentServices, setRecentServices] = useState([]);
 const [error, setError] = useState(null);

 const ratingLabels = {
 1: 'Poor',
 2: 'Fair',
 3: 'Good',
 4: 'Very Good',
 5: 'Excellent'
 };

 const quickFeedback = [
 'Professional service',
 'On time arrival',
 'Quality work',
 'Fair pricing',
 'Clean work area',
 'Friendly technician',
 'Quick resolution',
 'Would recommend'
 ];

 const [selectedFeedback, setSelectedFeedback] = useState([]);

 // Fetch completed bookings that can be rated
 useEffect(() => {
 fetchCompletedBookings();
 }, []);

 const fetchCompletedBookings = async () => {
 try {
 setIsLoading(true);
 setError(null);
 
 // Fetch user's booking history
 const response = await apiClient.get('/api/bookings', {
 params: {
 status: 'completed',
 limit: 20
 }
 });
 
 if (response.data.success) {
 const bookings = response.data.data.bookings || response.data.data || [];
 
 // Check which bookings already have ratings
 const bookingsWithRatingStatus = await Promise.all(
 bookings.map(async (booking) => {
 try {
 const ratingResponse = await apiClient.get(`/api/ratings/booking/${booking._id}`);
 return {
 id: booking._id,
 bookingId: booking.bookingId,
 service: booking.serviceType || 'Service',
 technician: booking.technicianId ? 
 `${booking.technicianId.firstName || ''} ${booking.technicianId.lastName || ''}`.trim() || 'Technician' :
 'Technician',
 date: new Date(booking.completedAt || booking.createdAt).toLocaleDateString(),
 status: 'completed',
 canRate: true,
 rated: ratingResponse.data.success && ratingResponse.data.data.rating ? true : false,
 rating: ratingResponse.data.success && ratingResponse.data.data.rating ? 
 ratingResponse.data.data.rating.ratings.overall : null
 };
 } catch (err) {
 // If rating not found, it means booking hasn't been rated
 return {
 id: booking._id,
 bookingId: booking.bookingId,
 service: booking.serviceType || 'Service',
 technician: booking.technicianId ? 
 `${booking.technicianId.firstName || ''} ${booking.technicianId.lastName || ''}`.trim() || 'Technician' :
 'Technician',
 date: new Date(booking.completedAt || booking.createdAt).toLocaleDateString(),
 status: 'completed',
 canRate: true,
 rated: false,
 rating: null
 };
 }
 })
 );
 
 setRecentServices(bookingsWithRatingStatus);
 } else {
 setError('Failed to load completed bookings');
 }
 } catch (err) {
 console.error('Fetch bookings error:', err);
 setError(err.response?.data?.message || 'Failed to load bookings');
 } finally {
 setIsLoading(false);
 }
 };

 const handleRatingSelect = (rating) => {
 setSelectedRating(rating);
 };

 const handleServiceSelect = (serviceId) => {
 setSelectedService(serviceId);
 // Reset form when selecting a different service
 setSelectedRating(0);
 setComment('');
 setSelectedFeedback([]);
 };

 const toggleFeedback = (feedback) => {
 setSelectedFeedback(prev => 
 prev.includes(feedback) 
 ? prev.filter(f => f !== feedback)
 : [...prev, feedback]
 );
 };

 const handleSubmitRating = async () => {
 if (!selectedService) {
 Alert.alert('Error', 'Please select a service to rate.');
 return;
 }

 if (selectedRating === 0) {
 Alert.alert('Error', 'Please select a rating.');
 return;
 }

 setIsSubmitting(true);

 try {
 const ratingData = {
 bookingId: selectedService,
 ratings: {
 service: selectedRating,
 technician: selectedRating,
 overall: selectedRating
 },
 feedback: comment,
 quickFeedback: selectedFeedback
 };
 
 const response = await apiClient.post('/api/ratings', ratingData);
 
 if (response.data.success) {
 Alert.alert(
 'Rating Submitted',
 'Thank you for your feedback! Your rating helps us improve our services.',
 [
 { 
 text: 'OK', 
 onPress: () => {
 // Reset form
 setSelectedService('');
 setSelectedRating(0);
 setComment('');
 setSelectedFeedback([]);
 // Refresh the bookings list
 fetchCompletedBookings();
 }
 }
 ]
 );
 } else {
 Alert.alert('Error', response.data.message || 'Failed to submit rating');
 }
 } catch (error) {
 console.error('Submit rating error:', error);
 const errorMessage = error.response?.data?.message || 'Failed to submit rating. Please try again.';
 Alert.alert('Error', errorMessage);
 } finally {
 setIsSubmitting(false);
 }
 };

 const renderStars = (rating, interactive = false, size = 32) => {
 return Array.from({ length: 5 }, (_, index) => (
 <TouchableOpacity
 key={index}
 onPress={interactive ? () => handleRatingSelect(index + 1) : undefined}
 disabled={!interactive}
 >
 <Ionicons
 name={index < rating ? "star" : "star-outline"}
 size={size}
 color={index < rating ? "#ffc107" : "#ccc"}
 />
 </TouchableOpacity>
 ));
 };

 const selectedServiceData = recentServices.find(s => s.id === selectedService);

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
 <Ionicons name="arrow-back" size={24} color="#333" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Rate Service</Text>
 <View style={styles.placeholder} />
 </View>

 <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
 {/* Loading State */}
 {isLoading && (
 <View style={styles.loadingContainer}>
 <ActivityIndicator size="large" color="#0d6efd" />
 <Text style={styles.loadingText}>Loading your completed bookings...</Text>
 </View>
 )}
 
 {/* Error State */}
 {error && !isLoading && (
 <View style={styles.errorContainer}>
 <Ionicons name="alert-circle" size={48} color="#dc3545" />
 <Text style={styles.errorText}>{error}</Text>
 <TouchableOpacity style={styles.retryButton} onPress={fetchCompletedBookings}>
 <Text style={styles.retryButtonText}>Retry</Text>
 </TouchableOpacity>
 </View>
 )}
 
 {/* Recent Services */}
 {!isLoading && !error && (
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Recent Services</Text>
 <Text style={styles.sectionSubtitle}>
 Select a service to rate
 </Text>
 
 {recentServices.length === 0 ? (
 <View style={styles.emptyContainer}>
 <Ionicons name="document-text-outline" size={48} color="#999" />
 <Text style={styles.emptyText}>No completed bookings to rate</Text>
 </View>
 ) : (
 recentServices.map((service) => (
 <TouchableOpacity
 key={service.id}
 style={[
 styles.serviceCard,
 selectedService === service.id && styles.selectedServiceCard,
 service.rated && styles.ratedServiceCard
 ]}
 onPress={() => !service.rated && handleServiceSelect(service.id)}
 disabled={service.rated}
 >
 <View style={styles.serviceLeft}>
 <View style={styles.serviceIcon}>
 <Ionicons 
 name={service.rated ? "checkmark-circle" : "construct"} 
 size={24} 
 color={service.rated ? "#28a745" : "#0d6efd"} 
 />
 </View>
 <View style={styles.serviceInfo}>
 <Text style={styles.serviceTitle}>{service.service}</Text>
 <Text style={styles.serviceTechnician}>by {service.technician}</Text>
 <Text style={styles.serviceDate}>{service.date}</Text>
 </View>
 </View>
 <View style={styles.serviceRight}>
 {service.rated ? (
 <View style={styles.ratedBadge}>
 <View style={styles.ratedStars}>
 {renderStars(service.rating, false, 16)}
 </View>
 <Text style={styles.ratedText}>Rated</Text>
 </View>
 ) : (
 <Ionicons name="chevron-forward" size={20} color="#ccc" />
 )}
 </View>
 </TouchableOpacity>
 ))
 )}
 </View>
 )}

 {/* Rating Form */}
 {selectedService && (
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Rate Your Experience</Text>
 <Text style={styles.sectionSubtitle}>
 How was your experience with {selectedServiceData?.technician}?
 </Text>

 {/* Star Rating */}
 <View style={styles.ratingContainer}>
 <View style={styles.starsContainer}>
 {renderStars(selectedRating, true)}
 </View>
 {selectedRating > 0 && (
 <Text style={styles.ratingLabel}>
 {ratingLabels[selectedRating]}
 </Text>
 )}
 </View>

 {/* Quick Feedback */}
 {selectedRating > 0 && (
 <View style={styles.feedbackSection}>
 <Text style={styles.feedbackTitle}>Quick Feedback (Optional)</Text>
 <View style={styles.feedbackContainer}>
 {quickFeedback.map((feedback) => (
 <TouchableOpacity
 key={feedback}
 style={[
 styles.feedbackChip,
 selectedFeedback.includes(feedback) && styles.selectedFeedbackChip
 ]}
 onPress={() => toggleFeedback(feedback)}
 >
 <Text style={[
 styles.feedbackText,
 selectedFeedback.includes(feedback) && styles.selectedFeedbackText
 ]}>
 {feedback}
 </Text>
 </TouchableOpacity>
 ))}
 </View>
 </View>
 )}

 {/* Comment Section */}
 {selectedRating > 0 && (
 <View style={styles.commentSection}>
 <Text style={styles.commentTitle}>Additional Comments (Optional)</Text>
 <TextInput
 style={styles.commentInput}
 placeholder="Tell us more about your experience..."
 multiline
 numberOfLines={4}
 value={comment}
 onChangeText={setComment}
 textAlignVertical="top"
 />
 </View>
 )}

 {/* Submit Button */}
 {selectedRating > 0 && (
 <TouchableOpacity
 style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
 onPress={handleSubmitRating}
 disabled={isSubmitting}
 >
 <Text style={styles.submitButtonText}>
 {isSubmitting ? 'Submitting...' : 'Submit Rating'}
 </Text>
 </TouchableOpacity>
 )}
 </View>
 )}

 {/* Rating Guidelines */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Rating Guidelines</Text>
 
 <View style={styles.guidelineItem}>
 <View style={styles.guidelineStars}>
 {renderStars(5, false, 16)}
 </View>
 <Text style={styles.guidelineText}>Excellent - Exceeded expectations</Text>
 </View>
 
 <View style={styles.guidelineItem}>
 <View style={styles.guidelineStars}>
 {renderStars(4, false, 16)}
 </View>
 <Text style={styles.guidelineText}>Very Good - Met expectations well</Text>
 </View>
 
 <View style={styles.guidelineItem}>
 <View style={styles.guidelineStars}>
 {renderStars(3, false, 16)}
 </View>
 <Text style={styles.guidelineText}>Good - Satisfactory service</Text>
 </View>
 
 <View style={styles.guidelineItem}>
 <View style={styles.guidelineStars}>
 {renderStars(2, false, 16)}
 </View>
 <Text style={styles.guidelineText}>Fair - Below expectations</Text>
 </View>
 
 <View style={styles.guidelineItem}>
 <View style={styles.guidelineStars}>
 {renderStars(1, false, 16)}
 </View>
 <Text style={styles.guidelineText}>Poor - Unsatisfactory service</Text>
 </View>
 </View>

 <View style={styles.bottomPadding} />
 </ScrollView>
 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f7fa'
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 padding: 20,
 paddingTop: 60,
 backgroundColor: '#fff',
 borderBottomWidth: 1,
 borderBottomColor: '#eee'
 },
 backButton: {
 padding: 8
 },
 headerTitle: {
 fontSize: 20,
 fontWeight: 'bold',
 color: '#333',
 flex: 1,
 textAlign: 'center'
 },
 placeholder: {
 width: 40
 },
 content: {
 flex: 1
 },
 section: {
 backgroundColor: '#fff',
 marginHorizontal: 20,
 marginBottom: 16,
 borderRadius: 12,
 padding: 20,
 elevation: 1
 },
 sectionTitle: {
 fontSize: 18,
 fontWeight: 'bold',
 color: '#333',
 marginBottom: 8
 },
 sectionSubtitle: {
 fontSize: 14,
 color: '#666',
 marginBottom: 16
 },
 serviceCard: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 padding: 16,
 backgroundColor: '#f8f9fa',
 borderRadius: 12,
 marginBottom: 12,
 borderWidth: 2,
 borderColor: 'transparent'
 },
 selectedServiceCard: {
 borderColor: '#0d6efd',
 backgroundColor: '#f0f4ff'
 },
 ratedServiceCard: {
 backgroundColor: '#f8f9fa',
 opacity: 0.7
 },
 serviceLeft: {
 flexDirection: 'row',
 alignItems: 'center',
 flex: 1
 },
 serviceIcon: {
 width: 48,
 height: 48,
 borderRadius: 24,
 backgroundColor: '#e9ecef',
 alignItems: 'center',
 justifyContent: 'center',
 marginRight: 16
 },
 serviceInfo: {
 flex: 1
 },
 serviceTitle: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333'
 },
 serviceTechnician: {
 fontSize: 14,
 color: '#0d6efd',
 marginTop: 2
 },
 serviceDate: {
 fontSize: 12,
 color: '#666',
 marginTop: 2
 },
 serviceRight: {
 alignItems: 'center'
 },
 ratedBadge: {
 alignItems: 'center'
 },
 ratedStars: {
 flexDirection: 'row',
 marginBottom: 4
 },
 ratedText: {
 fontSize: 12,
 color: '#28a745',
 fontWeight: '600'
 },
 ratingContainer: {
 alignItems: 'center',
 marginBottom: 24
 },
 starsContainer: {
 flexDirection: 'row',
 gap: 8,
 marginBottom: 12
 },
 ratingLabel: {
 fontSize: 18,
 fontWeight: '600',
 color: '#333'
 },
 feedbackSection: {
 marginBottom: 24
 },
 feedbackTitle: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginBottom: 12
 },
 feedbackContainer: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 gap: 8
 },
 feedbackChip: {
 paddingHorizontal: 12,
 paddingVertical: 6,
 borderRadius: 16,
 borderWidth: 1,
 borderColor: '#0d6efd',
 backgroundColor: '#fff'
 },
 selectedFeedbackChip: {
 backgroundColor: '#0d6efd'
 },
 feedbackText: {
 fontSize: 14,
 color: '#0d6efd'
 },
 selectedFeedbackText: {
 color: '#fff'
 },
 commentSection: {
 marginBottom: 24
 },
 commentTitle: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginBottom: 12
 },
 commentInput: {
 borderWidth: 1,
 borderColor: '#ddd',
 borderRadius: 8,
 padding: 12,
 fontSize: 14,
 minHeight: 80,
 backgroundColor: '#fff'
 },
 submitButton: {
 backgroundColor: '#0d6efd',
 padding: 16,
 borderRadius: 8,
 alignItems: 'center'
 },
 submitButtonDisabled: {
 backgroundColor: '#ccc'
 },
 submitButtonText: {
 color: '#fff',
 fontSize: 16,
 fontWeight: '600'
 },
 guidelineItem: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 12
 },
 guidelineStars: {
 flexDirection: 'row',
 marginRight: 12,
 width: 100
 },
 guidelineText: {
 fontSize: 14,
 color: '#333',
 flex: 1
 },
 loadingContainer: {
 flex: 1,
 alignItems: 'center',
 justifyContent: 'center',
 padding: 40
 },
 loadingText: {
 marginTop: 16,
 fontSize: 16,
 color: '#666'
 },
 errorContainer: {
 flex: 1,
 alignItems: 'center',
 justifyContent: 'center',
 padding: 40
 },
 errorText: {
 marginTop: 16,
 fontSize: 16,
 color: '#dc3545',
 textAlign: 'center'
 },
 retryButton: {
 marginTop: 16,
 backgroundColor: '#0d6efd',
 paddingHorizontal: 24,
 paddingVertical: 12,
 borderRadius: 8
 },
 retryButtonText: {
 color: '#fff',
 fontSize: 16,
 fontWeight: '600'
 },
 emptyContainer: {
 alignItems: 'center',
 padding: 40
 },
 emptyText: {
 marginTop: 16,
 fontSize: 16,
 color: '#999',
 textAlign: 'center'
 },
 bottomPadding: {
 height: 40
 }
});
