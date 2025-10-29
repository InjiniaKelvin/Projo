import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';

export default function TechnicianProfile() {
 const router = useRouter();
 const { user } = useAuth();
 const [profileData, setProfileData] = useState({
 firstName: user?.firstName || 'John',
 lastName: user?.lastName || 'Doe',
 email: user?.email || 'john.doe@example.com',
 phone: user?.phone || '+254712345678',
 skills: ['Plumbing', 'Electrical', 'Appliance Repair'],
 rating: 4.8,
 completedJobs: 127,
 yearsExperience: 5,
 certifications: ['Licensed Plumber', 'Electrical Certification'],
 workRadius: 10, // km
 isAvailable: true,
 workingHours: {
 start: '08:00',
 end: '18:00'
 },
 emergencyAvailable: false,
 vehicleType: 'Motorcycle'
 });

 const skills = [
 'Plumbing', 'Electrical', 'Appliance Repair', 'HVAC', 
 'Carpentry', 'Painting', 'Tiling', 'Roofing', 
 'Welding', 'Solar Installation'
 ];

 const handleSkillToggle = (skill) => {
 setProfileData(prev => ({
 ...prev,
 skills: prev.skills.includes(skill)
 ? prev.skills.filter(s => s !== skill)
 : [...prev.skills, skill]
 }));
 };

 const handleAvailabilityToggle = () => {
 setProfileData(prev => ({
 ...prev,
 isAvailable: !prev.isAvailable
 }));
 
 Alert.alert(
 'Availability Updated',
 `You are now ${!profileData.isAvailable ? 'available' : 'unavailable'} for new jobs.`
 );
 };

 const handleEmergencyToggle = () => {
 setProfileData(prev => ({
 ...prev,
 emergencyAvailable: !prev.emergencyAvailable
 }));
 };

 const handleEditProfile = () => {
 Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
 };

 const handleViewCertifications = () => {
 Alert.alert(
 'Certifications',
 profileData.certifications.join('\n') + '\n\nTap to add more certifications...'
 );
 };

 const handleWorkingHours = () => {
 Alert.alert(
 'Working Hours',
 `Current: ${profileData.workingHours.start} - ${profileData.workingHours.end}\n\nTap to modify your working hours...`
 );
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
 { text: '20 km', onPress: () => updateWorkRadius(20) }
 ]
 );
 };

 const updateWorkRadius = (radius) => {
 setProfileData(prev => ({
 ...prev,
 workRadius: radius
 }));
 Alert.alert('Success', `Work radius updated to ${radius} km`);
 };

 const handleSupport = () => {
 Alert.alert(
 'Technician Support',
 'Need help with your account?',
 [
 { text: 'Cancel', style: 'cancel' },
 { text: 'Call Support', onPress: () => Alert.alert('Calling', 'Connecting to support...') },
 { text: 'Send Email', onPress: () => Alert.alert('Email', 'Opening email client...') },
 { text: 'FAQ', onPress: () => Alert.alert('FAQ', 'Opening frequently asked questions...') }
 ]
 );
 };

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
 <Ionicons name="arrow-back" size={24} color="#333" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Profile & Settings</Text>
 <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
 <Ionicons name="create-outline" size={24} color="#0d6efd" />
 </TouchableOpacity>
 </View>

 <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
 {/* Profile Card */}
 <View style={styles.profileCard}>
 <View style={styles.profileHeader}>
 <View style={styles.avatarContainer}>
 <Ionicons name="person" size={40} color="#fff" />
 </View>
 <View style={styles.profileInfo}>
 <Text style={styles.profileName}>
 {profileData.firstName} {profileData.lastName}
 </Text>
 <Text style={styles.profileEmail}>{profileData.email}</Text>
 <View style={styles.ratingContainer}>
 <Ionicons name="star" size={16} color="#ffc107" />
 <Text style={styles.ratingText}>{profileData.rating}</Text>
 <Text style={styles.jobsText}>* {profileData.completedJobs} jobs completed</Text>
 </View>
 </View>
 </View>
 
 <View style={styles.experienceContainer}>
 <Text style={styles.experienceText}>
 {profileData.yearsExperience} years experience
 </Text>
 <View style={[styles.availabilityIndicator, { 
 backgroundColor: profileData.isAvailable ? '#28a745' : '#dc3545' 
 }]}>
 <Text style={styles.availabilityText}>
 {profileData.isAvailable ? 'Available' : 'Unavailable'}
 </Text>
 </View>
 </View>
 </View>

 {/* Skills Section */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Skills & Expertise</Text>
 <View style={styles.skillsContainer}>
 {skills.map((skill) => (
 <TouchableOpacity
 key={skill}
 style={[
 styles.skillChip,
 profileData.skills.includes(skill) && styles.skillChipSelected
 ]}
 onPress={() => handleSkillToggle(skill)}
 >
 <Text style={[
 styles.skillText,
 profileData.skills.includes(skill) && styles.skillTextSelected
 ]}>
 {skill}
 </Text>
 {profileData.skills.includes(skill) && (
 <Ionicons name="checkmark" size={16} color="#fff" />
 )}
 </TouchableOpacity>
 ))}
 </View>
 </View>

 {/* Availability Settings */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Availability Settings</Text>
 
 <View style={styles.settingItem}>
 <View style={styles.settingLeft}>
 <Ionicons name="time-outline" size={24} color="#0d6efd" />
 <View style={styles.settingInfo}>
 <Text style={styles.settingTitle}>Available for Work</Text>
 <Text style={styles.settingSubtitle}>
 Toggle to receive new job requests
 </Text>
 </View>
 </View>
 <Switch
 value={profileData.isAvailable}
 onValueChange={handleAvailabilityToggle}
 trackColor={{ false: '#ccc', true: '#0d6efd' }}
 />
 </View>

 <TouchableOpacity style={styles.settingItem} onPress={handleWorkingHours}>
 <View style={styles.settingLeft}>
 <Ionicons name="calendar-outline" size={24} color="#0d6efd" />
 <View style={styles.settingInfo}>
 <Text style={styles.settingTitle}>Working Hours</Text>
 <Text style={styles.settingSubtitle}>
 {profileData.workingHours.start} - {profileData.workingHours.end}
 </Text>
 </View>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#ccc" />
 </TouchableOpacity>

 <TouchableOpacity style={styles.settingItem} onPress={handleWorkRadius}>
 <View style={styles.settingLeft}>
 <Ionicons name="location-outline" size={24} color="#0d6efd" />
 <View style={styles.settingInfo}>
 <Text style={styles.settingTitle}>Work Radius</Text>
 <Text style={styles.settingSubtitle}>
 {profileData.workRadius} km from your location
 </Text>
 </View>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#ccc" />
 </TouchableOpacity>

 <View style={styles.settingItem}>
 <View style={styles.settingLeft}>
 <Ionicons name="alert-circle-outline" size={24} color="#dc3545" />
 <View style={styles.settingInfo}>
 <Text style={styles.settingTitle}>Emergency Jobs</Text>
 <Text style={styles.settingSubtitle}>
 Accept urgent/emergency requests
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

 {/* Professional Info */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Professional Information</Text>
 
 <TouchableOpacity style={styles.settingItem} onPress={handleViewCertifications}>
 <View style={styles.settingLeft}>
 <Ionicons name="ribbon-outline" size={24} color="#0d6efd" />
 <View style={styles.settingInfo}>
 <Text style={styles.settingTitle}>Certifications</Text>
 <Text style={styles.settingSubtitle}>
 {profileData.certifications.length} certificates
 </Text>
 </View>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#ccc" />
 </TouchableOpacity>

 <TouchableOpacity style={styles.settingItem}>
 <View style={styles.settingLeft}>
 <Ionicons name="car-outline" size={24} color="#0d6efd" />
 <View style={styles.settingInfo}>
 <Text style={styles.settingTitle}>Vehicle Type</Text>
 <Text style={styles.settingSubtitle}>{profileData.vehicleType}</Text>
 </View>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#ccc" />
 </TouchableOpacity>
 </View>

 {/* Support & Help */}
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Support & Help</Text>
 
 <TouchableOpacity style={styles.settingItem} onPress={handleSupport}>
 <View style={styles.settingLeft}>
 <Ionicons name="help-circle-outline" size={24} color="#0d6efd" />
 <View style={styles.settingInfo}>
 <Text style={styles.settingTitle}>Get Help</Text>
 <Text style={styles.settingSubtitle}>Contact support team</Text>
 </View>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#ccc" />
 </TouchableOpacity>

 <TouchableOpacity style={styles.settingItem}>
 <View style={styles.settingLeft}>
 <Ionicons name="document-text-outline" size={24} color="#0d6efd" />
 <View style={styles.settingInfo}>
 <Text style={styles.settingTitle}>Terms & Conditions</Text>
 <Text style={styles.settingSubtitle}>Read our terms</Text>
 </View>
 </View>
 <Ionicons name="chevron-forward" size={20} color="#ccc" />
 </TouchableOpacity>
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
 editButton: {
 padding: 8
 },
 content: {
 flex: 1
 },
 profileCard: {
 backgroundColor: '#fff',
 margin: 20,
 borderRadius: 16,
 padding: 20,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4
 },
 profileHeader: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 16
 },
 avatarContainer: {
 width: 80,
 height: 80,
 borderRadius: 40,
 backgroundColor: '#0d6efd',
 alignItems: 'center',
 justifyContent: 'center',
 marginRight: 16
 },
 profileInfo: {
 flex: 1
 },
 profileName: {
 fontSize: 22,
 fontWeight: 'bold',
 color: '#333'
 },
 profileEmail: {
 fontSize: 14,
 color: '#666',
 marginTop: 4
 },
 ratingContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 marginTop: 8
 },
 ratingText: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginLeft: 4
 },
 jobsText: {
 fontSize: 14,
 color: '#666',
 marginLeft: 4
 },
 experienceContainer: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center'
 },
 experienceText: {
 fontSize: 14,
 color: '#666'
 },
 availabilityIndicator: {
 paddingHorizontal: 12,
 paddingVertical: 6,
 borderRadius: 16
 },
 availabilityText: {
 fontSize: 12,
 fontWeight: '600',
 color: '#fff'
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
 marginBottom: 16
 },
 skillsContainer: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 gap: 8
 },
 skillChip: {
 flexDirection: 'row',
 alignItems: 'center',
 paddingHorizontal: 12,
 paddingVertical: 6,
 borderRadius: 16,
 borderWidth: 1,
 borderColor: '#0d6efd',
 backgroundColor: '#fff'
 },
 skillChipSelected: {
 backgroundColor: '#0d6efd'
 },
 skillText: {
 fontSize: 14,
 color: '#0d6efd',
 marginRight: 4
 },
 skillTextSelected: {
 color: '#fff'
 },
 settingItem: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 paddingVertical: 12,
 borderBottomWidth: 1,
 borderBottomColor: '#f0f0f0'
 },
 settingLeft: {
 flexDirection: 'row',
 alignItems: 'center',
 flex: 1
 },
 settingInfo: {
 marginLeft: 12,
 flex: 1
 },
 settingTitle: {
 fontSize: 16,
 fontWeight: '500',
 color: '#333'
 },
 settingSubtitle: {
 fontSize: 14,
 color: '#666',
 marginTop: 2
 },
 bottomPadding: {
 height: 40
 }
});
