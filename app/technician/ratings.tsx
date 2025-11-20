import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TextInput } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import apiClient from '@/config/api';
import { useAuth } from '@/contexts/SimpleAuthContext';

export default function TechnicianRatingsScreen() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/ratings/technician/${user._id}`);
      if (response.data.success) {
        setRatings(response.data.data.ratings);
      } else {
        Alert.alert('Error', 'Failed to fetch ratings.');
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      Alert.alert('Error', 'An error occurred while fetching ratings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = (rating) => {
    setSelectedRating(rating);
    setIsModalVisible(true);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      Alert.alert('Invalid response', 'Please enter a response.');
      return;
    }

    try {
      const response = await apiClient.post(`/ratings/${selectedRating._id}/respond`, {
        response: responseText,
      });

      if (response.data.success) {
        Alert.alert('Response submitted', 'Your response has been submitted successfully.');
        setIsModalVisible(false);
        setResponseText('');
        fetchRatings();
      } else {
        Alert.alert('Submission failed', response.data.message);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      Alert.alert('Submission failed', 'An error occurred while submitting your response.');
    }
  };

  const renderRating = ({ item }) => (
    <Card style={styles.ratingCard}>
      <ThemedText style={styles.ratingText}>Overall: {item.ratings.overall}/5</ThemedText>
      <ThemedText style={styles.feedbackText}>{item.feedback}</ThemedText>
      {item.technicianResponse?.content ? (
        <ThemedText style={styles.responseText}>Your response: {item.technicianResponse.content}</ThemedText>
      ) : (
        <Button title="Respond" onPress={() => handleRespond(item)} />
      )}
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <Header title="Your Ratings" canGoBack />
      <FlatList
        data={ratings}
        renderItem={renderRating}
        keyExtractor={(item) => item._id}
        refreshing={isLoading}
        onRefresh={fetchRatings}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Respond to Rating</ThemedText>
            <TextInput
              style={styles.responseInput}
              placeholder="Enter your response"
              multiline
              numberOfLines={4}
              value={responseText}
              onChangeText={setResponseText}
            />
            <Button title="Submit Response" onPress={handleSubmitResponse} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} variant="secondary" />
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ratingCard: {
    margin: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackText: {
    fontSize: 14,
    marginTop: 8,
  },
  responseText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
