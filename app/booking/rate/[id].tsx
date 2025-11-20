import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import apiClient from '@/config/api';
import { API_ENDPOINTS } from '@/config/api';

export default function RateBookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [ratings, setRatings] = useState({ service: 0, technician: 0, overall: 0 });
  const [feedback, setFeedback] = useState('');
  const [media, setMedia] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      uploadMedia(result.assets[0]);
    }
  };

  const uploadMedia = async (asset) => {
    const formData = new FormData();
    formData.append('media', {
      uri: asset.uri,
      name: asset.fileName || 'upload.jpg',
      type: asset.type || 'image/jpeg',
    });

    try {
      const response = await apiClient.post(API_ENDPOINTS.UPLOADS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMedia([...media, { url: response.data.data.url, type: asset.type.startsWith('video') ? 'video' : 'photo' }]);
      } else {
        Alert.alert('Upload failed', response.data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload failed', 'An error occurred while uploading the media.');
    }
  };

  const handleSubmitRating = async () => {
    if (ratings.overall === 0) {
      Alert.alert('Invalid rating', 'Please provide an overall rating.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post(`/ratings`, {
        bookingId: id,
        ratings,
        feedback,
        media,
      });

      if (response.data.success) {
        Alert.alert('Rating submitted', 'Thank you for your feedback!');
        router.back();
      } else {
        Alert.alert('Submission failed', response.data.message);
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      Alert.alert('Submission failed', 'An error occurred while submitting your rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Rate Your Service" canGoBack />
      <ScrollView>
        <Card>
          <ThemedText style={styles.label}>Overall Rating</ThemedText>
          {/* Implement a star rating component here */}
          <Input
            placeholder="Overall rating (1-5)"
            keyboardType="numeric"
            onChangeText={(text) => setRatings({ ...ratings, overall: parseInt(text) || 0 })}
          />
        </Card>
        <Card>
          <ThemedText style={styles.label}>Feedback</ThemedText>
          <Input
            placeholder="Tell us about your experience"
            multiline
            numberOfLines={4}
            onChangeText={setFeedback}
          />
        </Card>
        <Card>
          <ThemedText style={styles.label}>Add Photos or Videos</ThemedText>
          <Button title="Pick Media" onPress={handlePickMedia} />
          <View style={styles.mediaContainer}>
            {media.map((item, index) => (
              <Image key={index} source={{ uri: `${API_ENDPOINTS.BASE_URL}${item.url}` }} style={styles.thumbnail} />
            ))}
          </View>
        </Card>
        <Button title="Submit Rating" onPress={handleSubmitRating} disabled={isSubmitting} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  thumbnail: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
  },
});
