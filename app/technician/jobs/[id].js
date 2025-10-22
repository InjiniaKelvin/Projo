import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../../contexts/SimpleAuthContext';
import API from '../../../config/api';

export default function JobDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [completionNotes, setCompletionNotes] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchJobDetails();
    requestLocationPermissions();
  }, [id]);

  const requestLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to track your job progress.');
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
    }
  };

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API.TECHNICIAN.MY_JOBS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        const foundJob = data.jobs?.find(j => j._id === id);
        if (foundJob) {
          setJob(foundJob);
        } else {
          throw new Error('Job not found');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch job details');
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      Alert.alert('Error', err.message || 'Failed to load job details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartJob = async () => {
    Alert.alert(
      'Start Job',
      'Mark this job as in progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Job',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              const response = await fetch(API.TECHNICIAN.START_JOB(id), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert('Success', 'Job marked as in progress!');
                fetchJobDetails();
              } else {
                throw new Error(data.message || 'Failed to start job');
              }
            } catch (err) {
              console.error('Error starting job:', err);
              Alert.alert('Error', err.message || 'Failed to start job');
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - photos.length
      });

      if (!result.canceled && result.assets) {
        setPhotos([...photos, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setPhotos([...photos, ...result.assets]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleCompleteJob = async () => {
    if (photos.length === 0) {
      Alert.alert('Photos Required', 'Please upload at least one photo of the completed work.');
      return;
    }

    Alert.alert(
      'Complete Job',
      'Mark this job as completed? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Job',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              setUploadProgress(0);

              // Upload photos first
              const formData = new FormData();
              
              photos.forEach((photo, index) => {
                const uri = photo.uri;
                const uriParts = uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                
                formData.append('photos', {
                  uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                  name: `job_${id}_photo_${index}.${fileType}`,
                  type: `image/${fileType}`
                });
              });

              // Upload photos
              const uploadResponse = await fetch(API.TECHNICIAN.UPLOAD_PHOTOS(id), {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
                },
                body: formData
              });

              const uploadData = await uploadResponse.json();

              if (!uploadResponse.ok) {
                throw new Error(uploadData.message || 'Failed to upload photos');
              }

              setUploadProgress(50);

              // Complete the job
              const completeResponse = await fetch(API.TECHNICIAN.COMPLETE_JOB(id), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  completionNotes: completionNotes || 'Job completed successfully'
                })
              });

              const completeData = await completeResponse.json();

              if (completeResponse.ok) {
                setUploadProgress(100);
                Alert.alert(
                  'Success',
                  'Job completed successfully! Payment will be processed.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/technician/jobs/my-jobs')
                    }
                  ]
                );
              } else {
                throw new Error(completeData.message || 'Failed to complete job');
              }
            } catch (err) {
              console.error('Error completing job:', err);
              Alert.alert('Error', err.message || 'Failed to complete job');
            } finally {
              setIsSubmitting(false);
              setUploadProgress(0);
            }
          }
        }
      ]
    );
  };

  const openMaps = () => {
    if (!job?.location) return;

    const { latitude, longitude, address, estate } = job.location;
    const label = address || estate || 'Job Location';

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`
    });

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open maps application');
    });
  };

  const callClient = () => {
    if (!job?.clientPhone && !job?.userId?.phone) {
      Alert.alert('Error', 'Client phone number not available');
      return;
    }

    const phoneNumber = job.clientPhone || job.userId?.phone;
    const url = `tel:${phoneNumber}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#dc3545" />
        <Text style={styles.errorText}>Job not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#0d6efd';
      case 'in_progress': return '#ffc107';
      case 'completed': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
      </View>

      {/* Job Info */}
      <View style={styles.card}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(job.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
            {job.status?.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        <Text style={styles.jobTitle}>{job.serviceName || job.serviceType}</Text>
        <Text style={styles.jobId}>Job ID: {job.bookingReference}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color="#666" />
          <Text style={styles.infoText}>
            {new Date(job.createdAt).toLocaleDateString()} at{' '}
            {job.preferredTimeSlot || 'Flexible'}
          </Text>
        </View>

        {job.urgency === 'emergency' && (
          <View style={[styles.infoRow, styles.urgentRow]}>
            <Ionicons name="alert-circle" size={20} color="#dc3545" />
            <Text style={styles.urgentText}>URGENT - Emergency Job</Text>
          </View>
        )}

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Payment Amount:</Text>
          <Text style={styles.priceValue}>KSh {job.price?.toLocaleString() || '0'}</Text>
        </View>
      </View>

      {/* Client Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Client Information</Text>
        
        <View style={styles.clientInfo}>
          <Ionicons name="person-circle" size={40} color="#0d6efd" />
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{job.clientName || job.userId?.name || 'Client'}</Text>
            <Text style={styles.clientPhone}>{job.clientPhone || job.userId?.phone || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.callButton} onPress={callClient}>
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.callButtonText}>Call Client</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location</Text>
        
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={24} color="#dc3545" />
          <View style={styles.locationDetails}>
            {job.location?.estate && (
              <Text style={styles.locationText}>{job.location.estate}</Text>
            )}
            {job.location?.address && (
              <Text style={styles.locationSubtext}>{job.location.address}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.navigationButton} onPress={openMaps}>
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={styles.navigationButtonText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Problem Description */}
      {job.problemDescription && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Problem Description</Text>
          <Text style={styles.descriptionText}>{job.problemDescription}</Text>
        </View>
      )}

      {/* Photo Upload Section */}
      {job.status === 'in_progress' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Job Completion Photos</Text>
          <Text style={styles.photoHint}>Upload photos of the completed work (Required)</Text>

          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#dc3545" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {photos.length < 5 && (
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Ionicons name="camera" size={24} color="#0d6efd" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoButton} onPress={pickImages}>
                <Ionicons name="images" size={24} color="#0d6efd" />
                <Text style={styles.photoButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={styles.notesInput}
            placeholder="Add completion notes (optional)"
            multiline
            numberOfLines={4}
            value={completionNotes}
            onChangeText={setCompletionNotes}
          />
        </View>
      )}

      {/* Progress Indicator */}
      {isSubmitting && uploadProgress > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {job.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={handleStartJob}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="play-circle" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Start Job</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {job.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleCompleteJob}
            disabled={isSubmitting || photos.length === 0}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Complete Job</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backIcon: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  jobId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  urgentRow: {
    backgroundColor: '#fff5f5',
    padding: 8,
    borderRadius: 8,
  },
  urgentText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clientPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d6efd',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  photoHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0d6efd',
    borderStyle: 'dashed',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  photoButtonText: {
    color: '#0d6efd',
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  progressContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  actionSection: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#ffc107',
  },
  completeButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
