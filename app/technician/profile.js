/**
 * Enhanced Technician Profile Screen
 * 
 * Features:
 * - View and edit profile information
 * - Manage skills and certifications
 * - Update availability and working hours
 * - Configure payment settings
 * - Support and help center
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';
import apiClient, { API_ENDPOINTS } from '../../config/api';
import { createShadow } from '../../utils/shadows';

export default function TechnicianProfile() {
 const router = useRouter();
 const { tab } = useLocalSearchParams(); // Support tab parameter
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(tab || 'profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    profilePicture: user?.profilePicture || '',
    skills: user?.skills || [],
    rating: user?.rating?.average || 0,
    completedJobs: 0,
    yearsExperience: user?.yearsExperience || 0,
    certifications: user?.certifications || [],
    workRadius: user?.workRadius || 10,
    isAvailable: user?.availability?.isAvailable ?? true,
    workingHours: user?.availability?.workingHours || { start: '08:00', end: '18:00' },
    emergencyAvailable: user?.availability?.emergencyAvailable ?? false,
    vehicleType: user?.vehicleType || 'None'
  });

  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  const availableSkills = [
    'Plumbing', 'Electrical', 'Appliance Repair', 'HVAC', 
    'Carpentry', 'Painting', 'Tiling', 'Roofing', 
    'Welding', 'Solar Installation', 'Pest Control',
    'General Maintenance', 'Cleaning Services'
  ];

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    if (originalProfileData) {
      const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [profileData, originalProfileData]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.TECHNICIAN.PROFILE);
      if (response.data.success) {
        const data = response.data.data;
        const formattedData = {
          ...profileData,
          ...data,
          profilePicture: data.profilePicture || '',
          skills: data.skills || [],
          workRadius: data.workRadius || 10,
          isAvailable: data.availability?.isAvailable ?? true,
          emergencyAvailable: data.availability?.emergencyAvailable ?? false,
          workingHours: data.availability?.workingHours || { start: '08:00', end: '18:00' }
        };
        setProfileData(formattedData);
        setOriginalProfileData(formattedData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        await uploadProfilePicture(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfilePicture = async (imageUri) => {
    try {
      setIsUploadingImage(true);
      
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('profilePicture', {
        uri: imageUri,
        name: filename,
        type
      });

      const response = await apiClient.post(API_ENDPOINTS.AUTH.UPLOAD_PROFILE_PICTURE || '/auth/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setProfileData(prev => ({ ...prev, profilePicture: response.data.data.profilePicture }));
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Construct updates object based on what changed
      const updates = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        skills: profileData.skills,
        workRadius: profileData.workRadius,
        availability: {
          isAvailable: profileData.isAvailable,
          emergencyAvailable: profileData.emergencyAvailable,
          workingHours: profileData.workingHours
        }
      };

      const response = await apiClient.put(API_ENDPOINTS.TECHNICIAN.PROFILE, updates);
      
      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setOriginalProfileData(JSON.parse(JSON.stringify(profileData)));
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }; const handleSkillToggle = (skillName) => {
 const isCurrentlySelected = profileData.skills.some(s => 
 (typeof s === 'string' ? s : s.name) === skillName
 );
 
 let newSkills;
 if (isCurrentlySelected) {
 newSkills = profileData.skills.filter(s => 
 (typeof s === 'string' ? s : s.name) !== skillName
 );
 } else {
 newSkills = [...profileData.skills, { name: skillName, experience: 'intermediate' }];
 }
 
 setProfileData(prev => ({ ...prev, skills: newSkills }));
 };

 const handleAvailabilityToggle = () => {
 const newAvailability = !profileData.isAvailable;
 setProfileData(prev => ({ ...prev, isAvailable: newAvailability }));
 };

 const handleEmergencyToggle = () => {
 const newEmergency = !profileData.emergencyAvailable;
 setProfileData(prev => ({ ...prev, emergencyAvailable: newEmergency }));
 };

 const handleWorkRadius = () => {
 Alert.alert(
 'Work Radius',
 `Current radius: ${profileData.workRadius} km\n\nChoose your preferred work radius:`,
 [
 { text: 'Cancel', style: 'cancel' },
 { text: '5 km', onPress: () => updateWorkRadius(5) },
 { text: '10 km', onPress: () => updateWorkRadius(10) },
 { text: '15 km', onPress: () => updateWorkRadius(15) },
 { text: '20 km', onPress: () => updateWorkRadius(20) },
 { text: '30 km', onPress: () => updateWorkRadius(30) }
 ]
 );
 };

 const updateWorkRadius = (radius) => {
 setProfileData(prev => ({ ...prev, workRadius: radius }));
 };

 const handleEditField = (field, currentValue) => {
 setEditingField(field);
 setTempValue(currentValue || '');
 };

 const saveField = () => {
 if (!editingField) return;
 
 setProfileData(prev => ({ ...prev, [editingField]: tempValue }));
 setEditingField(null);
 setTempValue('');
 };

 const handleLogout = async () => {
 Alert.alert(
 'Logout',
 'Are you sure you want to logout?',
 [
 { text: 'Cancel', style: 'cancel' },
 { 
 text: 'Logout', 
 style: 'destructive',
 onPress: async () => {
 await logout();
 router.replace('/auth/login');
 }
 }
 ]
 );
 };

  const renderProfileTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleImagePick} disabled={isUploadingImage}>
            <View style={styles.avatarContainer}>
              {profileData.profilePicture ? (
                <Image 
                  source={{ uri: profileData.profilePicture }} 
                  style={{ width: 80, height: 80, borderRadius: 40 }} 
                />
              ) : (
                <Ionicons name="person" size={40} color="#fff" />
              )}
              {isUploadingImage && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', borderRadius: 40 }]}>
                  <ActivityIndicator color="#fff" size="small" />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
 <Text style={styles.profileName}>
 {profileData.firstName} {profileData.lastName}
 </Text>
 <Text style={styles.profileEmail}>{profileData.email}</Text>
 <View style={styles.ratingContainer}>
 <Ionicons name="star" size={16} color="#ffc107" />
 <Text style={styles.ratingText}>{profileData.rating.toFixed(1)}</Text>
 <Text style={styles.jobsText}>* {profileData.completedJobs} jobs</Text>
 </View>
 </View>
 </View>
 </View>

 {/* Contact Information */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Contact Information</Text>
 
 <View style={styles.infoRow}>
 <Ionicons name="mail-outline" size={20} color="#666" />
 <Text style={styles.infoLabel}>Email</Text>
 <Text style={styles.infoValue}>{profileData.email}</Text>
 </View>
 
 <View style={styles.infoRow}>
 <Ionicons name="call-outline" size={20} color="#666" />
 <Text style={styles.infoLabel}>Phone</Text>
 {editingField === 'phoneNumber' ? (
 <View style={styles.editContainer}>
 <TextInput
 style={styles.editInput}
 value={tempValue}
 onChangeText={setTempValue}
 keyboardType="phone-pad"
 />
 <TouchableOpacity onPress={saveField} style={styles.saveButton}>
 <Text style={styles.saveButtonText}>Save</Text>
 </TouchableOpacity>
 </View>
 ) : (
 <>
 <Text style={styles.infoValue}>{profileData.phoneNumber}</Text>
 <TouchableOpacity onPress={() => handleEditField('phoneNumber', profileData.phoneNumber)}>
 <Ionicons name="create-outline" size={20} color="#0d6efd" />
 </TouchableOpacity>
 </>
 )}
 </View>
 </View>

 {/* Skills & Services */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Skills & Services</Text>
 <Text style={styles.sectionSubtitle}>
 Select services you can provide ({profileData.skills.length} selected)
 </Text>
 <View style={styles.skillsGrid}>
 {availableSkills.map((skill) => {
 const isSelected = profileData.skills.some(s => 
 (typeof s === 'string' ? s : s.name) === skill
 );
 return (
 <TouchableOpacity
 key={skill}
 style={[styles.skillChip, isSelected && styles.skillChipSelected]}
 onPress={() => handleSkillToggle(skill)}
 disabled={isSaving}
 >
 <Text style={[styles.skillChipText, isSelected && styles.skillChipTextSelected]}>
 {skill}
 </Text>
 </TouchableOpacity>
 );
 })}
 </View>
 {profileData.skills.length === 0 && (
 <View style={styles.warningBox}>
 <Ionicons name="warning-outline" size={20} color="#ffc107" />
 <Text style={styles.warningText}>
 Add at least one skill to start receiving job requests
 </Text>
 </View>
 )}
 </View>

 {/* Work Preferences */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Work Preferences</Text>
 
 <TouchableOpacity style={styles.infoRow} onPress={handleWorkRadius}>
 <Ionicons name="location-outline" size={20} color="#666" />
 <Text style={styles.infoLabel}>Work Radius</Text>
 <Text style={styles.infoValue}>{profileData.workRadius} km</Text>
 <Ionicons name="chevron-forward" size={20} color="#666" />
 </TouchableOpacity>
 
 <View style={styles.infoRow}>
 <Ionicons name="calendar-outline" size={20} color="#666" />
 <Text style={styles.infoLabel}>Working Hours</Text>
 <Text style={styles.infoValue}>
 {profileData.workingHours.start} - {profileData.workingHours.end}
 </Text>
 <Ionicons name="chevron-forward" size={20} color="#666" />
 </View>
 </View>
 </ScrollView>
 );

 const renderAvailabilityTab = () => (
 <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Availability Settings</Text>
 
 <View style={styles.switchRow}>
 <View style={styles.switchLeft}>
 <Ionicons name="checkmark-circle-outline" size={24} color="#28a745" />
 <View style={styles.switchInfo}>
 <Text style={styles.switchLabel}>Available for Jobs</Text>
 <Text style={styles.switchDescription}>
 Accept new job requests
 </Text>
 </View>
 </View>
 <Switch
 value={profileData.isAvailable}
 onValueChange={handleAvailabilityToggle}
 trackColor={{ false: '#ccc', true: '#28a745' }}
 />
 </View>
 
 <View style={styles.switchRow}>
 <View style={styles.switchLeft}>
 <Ionicons name="flash-outline" size={24} color="#dc3545" />
 <View style={styles.switchInfo}>
 <Text style={styles.switchLabel}>Emergency Availability</Text>
 <Text style={styles.switchDescription}>
 Available for urgent 24/7 calls (+20% premium)
 </Text>
 </View>
 </View>
 <Switch
 value={profileData.emergencyAvailable}
 onValueChange={handleEmergencyToggle}
 trackColor={{ false: '#ccc', true: '#dc3545' }}
 />
 </View>
 </View>
 </ScrollView>
 );

 const renderPaymentTab = () => (
 <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Payment Settings</Text>
 
 <TouchableOpacity style={styles.menuItem}>
 <Ionicons name="card-outline" size={24} color="#0d6efd" />
 <View style={styles.menuItemContent}>
 <Text style={styles.menuItemTitle}>Bank Account</Text>
 <Text style={styles.menuItemSubtitle}>Manage withdrawal account</Text>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#666" />
 </TouchableOpacity>
 
 <TouchableOpacity style={styles.menuItem}>
 <Ionicons name="receipt-outline" size={24} color="#0d6efd" />
 <View style={styles.menuItemContent}>
 <Text style={styles.menuItemTitle}>Tax Information</Text>
 <Text style={styles.menuItemSubtitle}>Update tax details</Text>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#666" />
 </TouchableOpacity>
 
 <TouchableOpacity style={styles.menuItem}>
 <Ionicons name="document-text-outline" size={24} color="#0d6efd" />
 <View style={styles.menuItemContent}>
 <Text style={styles.menuItemTitle}>Payment History</Text>
 <Text style={styles.menuItemSubtitle}>View all transactions</Text>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#666" />
 </TouchableOpacity>
 </View>
 </ScrollView>
 );

 const renderSettingsTab = () => (
 <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>App Settings</Text>
 
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color="#0d6efd" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Notifications</Text>
            <Text style={styles.menuItemSubtitle}>View your notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>         <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Coming Soon', 'Privacy & Security settings will be available soon.')}>
          <Ionicons name="lock-closed-outline" size={24} color="#0d6efd" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Privacy & Security</Text>
            <Text style={styles.menuItemSubtitle}>Password, data settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/support')}>
          <Ionicons name="help-circle-outline" size={24} color="#0d6efd" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Help & Support</Text>
            <Text style={styles.menuItemSubtitle}>FAQ, contact support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Coming Soon', 'Terms & Privacy Policy will be available soon.')}>
          <Ionicons name="document-outline" size={24} color="#0d6efd" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Terms & Privacy Policy</Text>
            <Text style={styles.menuItemSubtitle}>Legal information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
 </View>
 
 <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
 <Ionicons name="log-out-outline" size={24} color="#dc3545" />
 <Text style={styles.logoutButtonText}>Logout</Text>
 </TouchableOpacity>
 </ScrollView>
 );

 if (isLoading) {
 return (
 <View style={[styles.container, styles.centered]}>
 <ActivityIndicator size="large" color="#0d6efd" />
 <Text style={styles.loadingText}>Loading profile...</Text>
 </View>
 );
 }

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
 <Ionicons name="arrow-back" size={24} color="#333" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Profile & Settings</Text>
 {isSaving && <ActivityIndicator size="small" color="#0d6efd" />}
 </View>

 {/* Tabs */}
 <View style={styles.tabContainer}>
 <TouchableOpacity 
 style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
 onPress={() => setActiveTab('profile')}
 >
 <Ionicons 
 name="person-outline" 
 size={20} 
 color={activeTab === 'profile' ? '#0d6efd' : '#666'} 
 />
 <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
 Profile
 </Text>
 </TouchableOpacity>
 
 <TouchableOpacity 
 style={[styles.tab, activeTab === 'availability' && styles.activeTab]}
 onPress={() => setActiveTab('availability')}
 >
 <Ionicons 
 name="time-outline" 
 size={20} 
 color={activeTab === 'availability' ? '#0d6efd' : '#666'} 
 />
 <Text style={[styles.tabText, activeTab === 'availability' && styles.activeTabText]}>
 Availability
 </Text>
 </TouchableOpacity>
 
 <TouchableOpacity 
 style={[styles.tab, activeTab === 'payment' && styles.activeTab]}
 onPress={() => setActiveTab('payment')}
 >
 <Ionicons 
 name="card-outline" 
 size={20} 
 color={activeTab === 'payment' ? '#0d6efd' : '#666'} 
 />
 <Text style={[styles.tabText, activeTab === 'payment' && styles.activeTabText]}>
 Payment
 </Text>
 </TouchableOpacity>
 
 <TouchableOpacity 
 style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
 onPress={() => setActiveTab('settings')}
 >
 <Ionicons 
 name="settings-outline" 
 size={20} 
 color={activeTab === 'settings' ? '#0d6efd' : '#666'} 
 />
 <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
 Settings
 </Text>
 </TouchableOpacity>
 </View>

 {/* Tab Content */}
 {activeTab === 'profile' && renderProfileTab()}
 {activeTab === 'availability' && renderAvailabilityTab()}
 {activeTab === 'payment' && renderPaymentTab()}
 {activeTab === 'settings' && renderSettingsTab()}

      {hasUnsavedChanges && (
        <View style={styles.saveContainer}>
          <TouchableOpacity 
            style={styles.saveChangesButton} 
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveChangesButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f7fa'
 },
 centered: {
 justifyContent: 'center',
 alignItems: 'center'
 },
 loadingText: {
 marginTop: 16,
 fontSize: 16,
 color: '#666'
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
 fontSize: 18,
 fontWeight: '600',
 color: '#333',
 flex: 1,
 textAlign: 'center',
 marginRight: 40
 },
 tabContainer: {
 flexDirection: 'row',
 backgroundColor: '#fff',
 borderBottomWidth: 1,
 borderBottomColor: '#eee'
 },
 tab: {
 flex: 1,
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center',
 paddingVertical: 12,
 gap: 6,
 borderBottomWidth: 2,
 borderBottomColor: 'transparent'
 },
 activeTab: {
 borderBottomColor: '#0d6efd'
 },
 tabText: {
 fontSize: 12,
 color: '#666',
 fontWeight: '500'
 },
 activeTabText: {
 color: '#0d6efd',
 fontWeight: '600'
 },
 tabContent: {
 flex: 1,
 marginBottom: 80
 },
 profileCard: {
 backgroundColor: '#fff',
 margin: 16,
 borderRadius: 12,
 padding: 20,
 ...createShadow({ radius: 8, opacity: 0.1, offset: { width: 0, height: 2 } })
 },
 profileHeader: {
 flexDirection: 'row',
 alignItems: 'center'
 },
 avatarContainer: {
 width: 70,
 height: 70,
 borderRadius: 35,
 backgroundColor: '#0d6efd',
 justifyContent: 'center',
 alignItems: 'center'
 },
 editIconContainer: {
 position: 'absolute',
 bottom: 0,
 right: 0,
 backgroundColor: '#0d6efd',
 width: 24,
 height: 24,
 borderRadius: 12,
 justifyContent: 'center',
 alignItems: 'center',
 borderWidth: 2,
 borderColor: '#fff'
 },
 profileInfo: {
 flex: 1,
 marginLeft: 16
 },
 profileName: {
 fontSize: 20,
 fontWeight: '600',
 color: '#333',
 marginBottom: 4
 },
 profileEmail: {
 fontSize: 14,
 color: '#666',
 marginBottom: 8
 },
 ratingContainer: {
 flexDirection: 'row',
 alignItems: 'center'
 },
 ratingText: {
 fontSize: 14,
 fontWeight: '600',
 color: '#333',
 marginLeft: 4
 },
 jobsText: {
 fontSize: 14,
 color: '#666',
 marginLeft: 4
 },
 section: {
 backgroundColor: '#fff',
 margin: 16,
 marginTop: 0,
 borderRadius: 12,
 padding: 16,
 ...createShadow({ radius: 8, opacity: 0.1, offset: { width: 0, height: 2 } })
 },
 sectionTitle: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginBottom: 4
 },
 sectionSubtitle: {
 fontSize: 14,
 color: '#666',
 marginBottom: 16
 },
 infoRow: {
 flexDirection: 'row',
 alignItems: 'center',
 paddingVertical: 12,
 borderBottomWidth: 1,
 borderBottomColor: '#f0f0f0'
 },
 infoLabel: {
 fontSize: 14,
 color: '#666',
 marginLeft: 12,
 flex: 1
 },
 infoValue: {
 fontSize: 14,
 fontWeight: '500',
 color: '#333',
 marginRight: 8
 },
 editContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 flex: 1
 },
 editInput: {
 flex: 1,
 borderWidth: 1,
 borderColor: '#ddd',
 borderRadius: 8,
 padding: 8,
 marginLeft: 8
 },
 saveButton: {
 backgroundColor: '#0d6efd',
 paddingHorizontal: 12,
 paddingVertical: 8,
 borderRadius: 8,
 marginLeft: 8
 },
 saveButtonText: {
 color: '#fff',
 fontWeight: '600',
 fontSize: 14
 },
 skillsGrid: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 gap: 8
 },
 skillChip: {
 paddingHorizontal: 16,
 paddingVertical: 8,
 borderRadius: 20,
 borderWidth: 1,
 borderColor: '#ddd',
 backgroundColor: '#fff'
 },
 skillChipSelected: {
 backgroundColor: '#0d6efd',
 borderColor: '#0d6efd'
 },
 skillChipText: {
 fontSize: 14,
 color: '#666'
 },
 skillChipTextSelected: {
 color: '#fff',
 fontWeight: '500'
 },
 warningBox: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#fff3cd',
 padding: 12,
 borderRadius: 8,
 marginTop: 12,
 gap: 8
 },
 warningText: {
 fontSize: 14,
 color: '#856404',
 flex: 1
 },
 switchRow: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingVertical: 12,
 borderBottomWidth: 1,
 borderBottomColor: '#f0f0f0'
 },
 switchLeft: {
 flexDirection: 'row',
 alignItems: 'center',
 flex: 1
 },
 switchInfo: {
 marginLeft: 12,
 flex: 1
 },
 switchLabel: {
 fontSize: 16,
 fontWeight: '500',
 color: '#333',
 marginBottom: 2
 },
 switchDescription: {
 fontSize: 12,
 color: '#666'
 },
 menuItem: {
 flexDirection: 'row',
 alignItems: 'center',
 paddingVertical: 16,
 borderBottomWidth: 1,
 borderBottomColor: '#f0f0f0'
 },
 menuItemContent: {
 flex: 1,
 marginLeft: 12
 },
 menuItemTitle: {
 fontSize: 16,
 fontWeight: '500',
 color: '#333',
 marginBottom: 2
 },
 menuItemSubtitle: {
 fontSize: 12,
 color: '#666'
 },
 logoutButton: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center',
 margin: 16,
 padding: 16,
 backgroundColor: '#fff',
 borderRadius: 12,
 borderWidth: 1,
 borderColor: '#dc3545',
 gap: 8
 },
 logoutButtonText: {
 fontSize: 16,
 fontWeight: '600',
 color: '#dc3545'
 },
 saveContainer: {
 padding: 16,
 backgroundColor: '#fff',
 borderTopWidth: 1,
 borderTopColor: '#eee',
 position: 'absolute',
 bottom: 0,
 left: 0,
 right: 0,
 elevation: 5,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: -2 },
 shadowOpacity: 0.1,
 shadowRadius: 4,
 },
 saveChangesButton: {
 backgroundColor: '#0d6efd',
 paddingVertical: 16,
 borderRadius: 12,
 alignItems: 'center',
 justifyContent: 'center',
 },
 saveChangesButtonText: {
 color: '#fff',
 fontSize: 16,
 fontWeight: '600',
 }
});
