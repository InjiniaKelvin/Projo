import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

export default function RatingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock recent services that can be rated
  const recentServices = [
    {
      id: '1',
      service: 'Plumbing Repair',
      technician: 'John Doe',
      date: '2024-01-15',
      status: 'completed',
      canRate: true
    },
    {
      id: '2',
      service: 'AC Installation',
      technician: 'Jane Smith',
      date: '2024-01-10',
      status: 'completed',
      canRate: true,
      rated: true,
      rating: 5
    },
    {
      id: '3',
      service: 'Electrical Wiring',
      technician: 'Mike Johnson',
      date: '2024-01-05',
      status: 'completed',
      canRate: true,
      rated: true,
      rating: 4
    }
  ];

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Rating Submitted',
        'Thank you for your feedback! Your rating helps us improve our services.',
        [
          { text: 'OK', onPress: () => {
            // Reset form
            setSelectedService('');
            setSelectedRating(0);
            setComment('');
            setSelectedFeedback([]);
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
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
        {/* Recent Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Services</Text>
          <Text style={styles.sectionSubtitle}>
            Select a service to rate
          </Text>

          {recentServices.map((service) => (
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
          ))}
        </View>

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
  bottomPadding: {
    height: 40
  }
});
