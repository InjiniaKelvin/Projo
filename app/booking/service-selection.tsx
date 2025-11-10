/**
 * Service Selection Screen
 * 
 * Beautiful, modern UI for browsing and selecting services
 * Features categories, search, filters, and service cards
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
 ActivityIndicator,
 FlatList,
 RefreshControl,
 ScrollView,
 StyleSheet,
 Text,
 TextInput,
 TouchableOpacity,
 View
} from 'react-native';

// Type definitions
interface Category {
 id: string;
 name: string;
 icon: string;
 color: string;
 description: string;
 serviceCount?: number;
}

interface Service {
 id: string;
 name: string;
 description: string;
 category: string;
 priceRange: { min: number; max: number };
 estimatedDuration: number;
 averageRating: number;
 totalRatings: number;
 isEmergencyService: boolean;
 icon?: string;
 color?: string;
}

interface PriceRange {
 min: number;
 max: number;
}

export default function ServiceSelectionScreen() {
 const router = useRouter();
 const params = useLocalSearchParams();
 const isEmergency = params.emergency === 'true';
 
 const [categories, setCategories] = useState<Category[]>([]);
 const [services, setServices] = useState<Service[]>([]);
 const [popularServices, setPopularServices] = useState<Service[]>([]);
 const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [isLoading, setIsLoading] = useState<boolean>(true);
 const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
 const [isSearching, setIsSearching] = useState<boolean>(false);

 const loadCategories = useCallback(async () => {
 try {
 // Call the real API
 const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/services/categories`);
 
 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 setCategories(data.data.categories);
 return;
 }
 }
 } catch (error) {
 console.error('Error loading categories:', error);
 }
 
 // Fallback to mock data
 const mockCategories: Category[] = [
 { id: '1', name: 'Plumbing', icon: 'water', color: '#3b82f6', description: 'Water pipes and fixtures', serviceCount: 15 },
 { id: '2', name: 'Electrical', icon: 'flash', color: '#f59e0b', description: 'Electrical installations and repairs', serviceCount: 12 },
 { id: '3', name: 'Appliance Repair', icon: 'construct', color: '#10b981', description: 'Home appliance services', serviceCount: 18 },
 { id: '4', name: 'Automotive', icon: 'car', color: '#dc2626', description: 'Car, motorcycle & vehicle repairs', serviceCount: 22 },
 { id: '5', name: 'Cleaning', icon: 'sparkles', color: '#8b5cf6', description: 'Home and office cleaning', serviceCount: 8 },
 { id: '6', name: 'HVAC', icon: 'thermometer', color: '#ef4444', description: 'Heating and cooling systems', serviceCount: 10 },
 { id: '7', name: 'Carpentry', icon: 'hammer', color: '#f97316', description: 'Wood work and furniture', serviceCount: 14 }
 ];
 setCategories(mockCategories);
 }, []);

 const loadPopularServices = useCallback(async () => {
 try {
 // Call the real API for popular services
 const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/services/popular`);
 
 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 setPopularServices(data.data.services);
 return;
 }
 }
 } catch (error) {
 console.error('Error loading popular services:', error);
 }
 
 // Fallback to mock data
 const mockServices: Service[] = [
 {
 id: '1',
 name: 'Emergency Roadside Assistance',
 category: 'automotive',
 description: '24/7 emergency help - jump start, tire change, towing',
 priceRange: { min: 1500, max: 8000 },
 estimatedDuration: 45,
 averageRating: 4.9,
 totalRatings: 156,
 isEmergencyService: true
 },
 {
 id: '2',
 name: 'Emergency Pipe Repair',
 category: 'plumbing',
 description: 'Quick fix for burst or leaking pipes',
 priceRange: { min: 2000, max: 5000 },
 estimatedDuration: 60,
 averageRating: 4.8,
 totalRatings: 23,
 isEmergencyService: true
 },
 {
 id: '3',
 name: 'Car Engine Diagnostic',
 category: 'automotive',
 description: 'Professional car engine diagnosis and repair',
 priceRange: { min: 2500, max: 8000 },
 estimatedDuration: 90,
 averageRating: 4.7,
 totalRatings: 89,
 isEmergencyService: false
 },
 {
 id: '4',
 name: 'Motorcycle Repair',
 category: 'automotive',
 description: 'Complete motorcycle service and repairs',
 priceRange: { min: 1000, max: 5000 },
 estimatedDuration: 90,
 averageRating: 4.6,
 totalRatings: 45,
 isEmergencyService: false
 },
 {
 id: '5',
 name: 'Power Outlet Installation',
 category: 'electrical',
 description: 'Install new electrical outlets safely',
 priceRange: { min: 1500, max: 3000 },
 estimatedDuration: 45,
 averageRating: 4.7,
 totalRatings: 18,
 isEmergencyService: false
 },
 {
 id: '6',
 name: 'Appliance Diagnostic',
 category: 'appliance-repair',
 description: 'Diagnose issues with home appliances',
 priceRange: { min: 1000, max: 2500 },
 estimatedDuration: 30,
 averageRating: 4.6,
 totalRatings: 15,
 isEmergencyService: false
 }
 ];
 setPopularServices(mockServices);
 }, []);

 const loadInitialData = useCallback(async () => {
 try {
 await Promise.all([
 loadCategories(),
 loadPopularServices()
 ]);
 } catch (error) {
 console.error('Error loading initial data:', error);
 } finally {
 setIsLoading(false);
 }
 }, [loadCategories, loadPopularServices]);

 // Initialize data on component mount
 useEffect(() => {
 loadInitialData();
 }, [loadInitialData]);

 const loadServicesByCategory = async (categoryId: string) => {
 setIsLoading(true);
 try {
 // Mock services by category
 const mockServices: Service[] = [
 {
 id: '1',
 name: 'Pipe Repair & Replacement',
 description: 'Professional pipe repair and replacement services for all types of plumbing issues',
 category: 'plumbing',
 priceRange: { min: 1500, max: 8000 },
 estimatedDuration: 120,
 averageRating: 4.8,
 totalRatings: 124,
 isEmergencyService: true
 },
 {
 id: '2',
 name: 'Toilet Installation & Repair',
 description: 'Complete toilet installation, repair, and maintenance services',
 category: 'plumbing',
 priceRange: { min: 2000, max: 12000 },
 estimatedDuration: 90,
 averageRating: 4.7,
 totalRatings: 87,
 isEmergencyService: false
 }
 ];
 setServices(mockServices);
 } catch (error) {
 console.error('Error loading services:', error);
 } finally {
 setIsLoading(false);
 }
 };

 const handleCategorySelect = (category: Category) => {
 setSelectedCategory(category);
 loadServicesByCategory(category.id);
 };

 const handleServiceSelect = (service: Service) => {
 router.push({
 pathname: '/booking/details',
 params: { 
 serviceId: service.id,
 serviceName: service.name,
 serviceData: JSON.stringify(service),
 isEmergency: isEmergency ? 'true' : 'false'
 }
 });
 };

 const handleSearch = async (query: string) => {
 setSearchQuery(query);
 if (query.length < 2) {
 setServices([]);
 setSelectedCategory(null);
 return;
 }

 setIsSearching(true);
 try {
 // Mock search results
 const searchResults = popularServices.filter(service => 
 service.name.toLowerCase().includes(query.toLowerCase())
 );
 setServices(searchResults);
 setSelectedCategory(null);
 } catch (error) {
 console.error('Error searching services:', error);
 } finally {
 setIsSearching(false);
 }
 };

 const onRefresh = async () => {
 setIsRefreshing(true);
 await loadInitialData();
 setIsRefreshing(false);
 };

 const formatPrice = (priceRange: PriceRange): string => {
 if (priceRange.min === priceRange.max) {
 return `KSh ${priceRange.min.toLocaleString()}`;
 }
 return `KSh ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}`;
 };

 const formatDuration = (minutes: number): string => {
 const hours = Math.floor(minutes / 60);
 const mins = minutes % 60;
 
 if (hours === 0) {
 return `${mins} mins`;
 } else if (mins === 0) {
 return `${hours} hour${hours > 1 ? 's' : ''}`;
 } else {
 return `${hours}h ${mins}m`;
 }
 };

 const renderCategoryCard = ({ item }: { item: Category }) => (
 <TouchableOpacity
 style={[styles.categoryCard, selectedCategory?.id === item.id && styles.selectedCategoryCard]}
 onPress={() => handleCategorySelect(item)}
 >
 <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
 <Ionicons name={(item.icon as any) || 'business'} size={24} color={item.color} />
 </View>
 <Text style={styles.categoryName}>{item.name}</Text>
 <Text style={styles.categoryCount}>{item.serviceCount} services</Text>
 </TouchableOpacity>
 );

 const renderServiceCard = ({ item }: { item: Service }) => (
 <TouchableOpacity
 style={styles.serviceCard}
 onPress={() => handleServiceSelect(item)}
 >
 <View style={styles.serviceHeader}>
 <View style={[styles.serviceIcon, { backgroundColor: item.color + '20' }]}>
 <Ionicons name={(item.icon as any) || 'construct'} size={20} color={item.color} />
 </View>
 <View style={styles.serviceInfo}>
 <Text style={styles.serviceName}>{item.name}</Text>
 <Text style={styles.serviceDescription} numberOfLines={2}>
 {item.description}
 </Text>
 </View>
 {item.isEmergencyService && (
 <View style={styles.emergencyBadge}>
 <Ionicons name="flash" size={12} color="#fff" />
 <Text style={styles.emergencyText}>24/7</Text>
 </View>
 )}
 </View>
 
 <View style={styles.serviceFooter}>
 <View style={styles.serviceStats}>
 <View style={styles.statItem}>
 <Ionicons name="star" size={14} color="#fbbf24" />
 <Text style={styles.statText}>{item.averageRating}</Text>
 <Text style={styles.statSubtext}>({item.totalRatings})</Text>
 </View>
 <View style={styles.statItem}>
 <Ionicons name="time-outline" size={14} color="#6b7280" />
 <Text style={styles.statText}>{formatDuration(item.estimatedDuration)}</Text>
 </View>
 </View>
 <Text style={styles.servicePrice}>{formatPrice(item.priceRange)}</Text>
 </View>
 </TouchableOpacity>
 );

 const renderCriticalBookingBanner = () => {
 return (
 <TouchableOpacity 
 style={styles.criticalBanner}
 onPress={() => router.push('/booking/details?isEmergency=true')}
 >
 <View style={styles.criticalBannerLeft}>
 <View style={styles.criticalIconContainer}>
 <Ionicons name="flash" size={28} color="#fff" />
 </View>
 <View style={styles.criticalTextContainer}>
 <View style={styles.criticalTitleRow}>
 <Text style={styles.criticalTitle}>Critical Emergency Booking</Text>
 <View style={styles.liveBadge}>
 <View style={styles.liveIndicator} />
 <Text style={styles.liveText}>24/7</Text>
 </View>
 </View>
 <Text style={styles.criticalSubtext}>
 Need immediate assistance? Get urgent help now
 </Text>
 </View>
 </View>
 <Ionicons name="chevron-forward" size={24} color="#dc3545" />
 </TouchableOpacity>
 );
 };

 if (isLoading && !isRefreshing) {
 return (
 <View style={[styles.container, styles.centered]}>
 <ActivityIndicator size="large" color="#0d6efd" />
 <Text style={styles.loadingText}>Loading services...</Text>
 </View>
 );
 }

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
 <Ionicons name="arrow-back" size={24} color="#fff" />
 </TouchableOpacity>
 <Text style={styles.headerTitle}>QuickFix Services</Text>
 <TouchableOpacity style={styles.notificationButton}>
 <Ionicons name="notifications-outline" size={24} color="#fff" />
 </TouchableOpacity>
 </View>

 <ScrollView 
 style={styles.content}
 showsVerticalScrollIndicator={false}
 refreshControl={
 <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
 }
 >
 {/* Emergency Mode Banner */}
 {isEmergency && (
 <View style={styles.emergencyBanner}>
 <Ionicons name="alert-circle" size={24} color="#EF5350" />
 <View style={styles.emergencyBannerText}>
 <Text style={styles.emergencyBannerTitle}>Emergency Mode</Text>
 <Text style={styles.emergencyBannerSubtitle}>Select a service for immediate assistance</Text>
 </View>
 </View>
 )}

 {/* Search Bar */}
 <View style={styles.searchContainer}>
 <View style={styles.searchBar}>
 <Ionicons name="search-outline" size={20} color="#6b7280" />
 <TextInput
 style={styles.searchInput}
 placeholder="Search for services..."
 value={searchQuery}
 onChangeText={handleSearch}
 placeholderTextColor="#6b7280"
 />
 {isSearching && <ActivityIndicator size="small" color="#0d6efd" />}
 </View>
 </View>

 {/* Critical Booking Banner */}
 {!selectedCategory && !searchQuery && renderCriticalBookingBanner()}

 {/* Service Categories */}
 {!selectedCategory && !searchQuery && (
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Browse Categories</Text>
 <FlatList
 data={categories}
 renderItem={renderCategoryCard}
 keyExtractor={item => item.id}
 numColumns={3}
 scrollEnabled={false}
 columnWrapperStyle={styles.categoryRow}
 />
 </View>
 )}

 {/* Popular Services */}
 {!selectedCategory && !searchQuery && (
 <View style={styles.section}>
 <Text style={styles.sectionTitle}>Popular Services</Text>
 <FlatList
 data={popularServices}
 renderItem={renderServiceCard}
 keyExtractor={item => item.id}
 scrollEnabled={false}
 />
 </View>
 )}

 {/* Category Services or Search Results */}
 {(selectedCategory || searchQuery) && (
 <View style={styles.section}>
 <View style={styles.resultsHeader}>
 {selectedCategory && (
 <TouchableOpacity
 style={styles.backToCategories}
 onPress={() => {
 setSelectedCategory(null);
 setServices([]);
 }}
 >
 <Ionicons name="arrow-back" size={16} color="#0d6efd" />
 <Text style={styles.backText}>All Categories</Text>
 </TouchableOpacity>
 )}
 <Text style={styles.resultsTitle}>
 {selectedCategory ? selectedCategory.name : `Search Results for "${searchQuery}"`}
 </Text>
 <Text style={styles.resultsCount}>
 {services.length} service{services.length !== 1 ? 's' : ''} found
 </Text>
 </View>
 <FlatList
 data={services}
 renderItem={renderServiceCard}
 keyExtractor={item => item.id}
 scrollEnabled={false}
 ListEmptyComponent={
 <View style={styles.emptyState}>
 <Ionicons name="search-outline" size={48} color="#6b7280" />
 <Text style={styles.emptyTitle}>No services found</Text>
 <Text style={styles.emptySubtitle}>
 Try a different search term or browse categories
 </Text>
 </View>
 }
 />
 </View>
 )}
 </ScrollView>
 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f8f9fa',
 },
 centered: {
 justifyContent: 'center',
 alignItems: 'center',
 },
 header: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#0d6efd',
 paddingTop: 50,
 paddingBottom: 15,
 paddingHorizontal: 15,
 },
 backButton: {
 marginRight: 15,
 },
 headerTitle: {
 flex: 1,
 fontSize: 20,
 fontWeight: 'bold',
 color: '#fff',
 textAlign: 'center',
 },
 notificationButton: {
 padding: 5,
 },
 content: {
 flex: 1,
 },
 loadingText: {
 marginTop: 10,
 fontSize: 16,
 color: '#6b7280',
 },
 searchContainer: {
 padding: 15,
 backgroundColor: '#fff',
 borderBottomWidth: 1,
 borderBottomColor: '#e5e7eb',
 },
 searchBar: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#f3f4f6',
 borderRadius: 12,
 paddingHorizontal: 15,
 paddingVertical: 12,
 },
 emergencyBanner: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#FFEBEE',
 borderRadius: 12,
 padding: 16,
 marginHorizontal: 16,
 marginBottom: 12,
 borderLeftWidth: 4,
 borderLeftColor: '#EF5350',
 },
 emergencyBannerText: {
 flex: 1,
 marginLeft: 12,
 },
 emergencyBannerTitle: {
 fontSize: 16,
 fontWeight: '600',
 color: '#C62828',
 marginBottom: 4,
 },
 emergencyBannerSubtitle: {
 fontSize: 13,
 color: '#D32F2F',
 },
 searchInput: {
 flex: 1,
 fontSize: 16,
 marginLeft: 10,
 color: '#111827',
 },
 section: {
 padding: 15,
 },
 sectionHeader: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 15,
 },
 sectionTitle: {
 fontSize: 18,
 fontWeight: '600',
 color: '#111827',
 marginLeft: 8,
 flex: 1,
 },
 liveBadge: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#ef4444',
 paddingHorizontal: 8,
 paddingVertical: 4,
 borderRadius: 12,
 },
 liveIndicator: {
 width: 6,
 height: 6,
 borderRadius: 3,
 backgroundColor: '#fff',
 marginRight: 4,
 },
 liveText: {
 fontSize: 12,
 fontWeight: '600',
 color: '#fff',
 },
 categoryRow: {
 justifyContent: 'space-between',
 marginBottom: 10,
 },
 categoryCard: {
 flex: 1,
 alignItems: 'center',
 backgroundColor: '#fff',
 borderRadius: 12,
 padding: 15,
 marginHorizontal: 5,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4,
 elevation: 3,
 },
 selectedCategoryCard: {
 borderWidth: 2,
 borderColor: '#0d6efd',
 },
 categoryIcon: {
 width: 48,
 height: 48,
 borderRadius: 24,
 alignItems: 'center',
 justifyContent: 'center',
 marginBottom: 8,
 },
 categoryName: {
 fontSize: 14,
 fontWeight: '600',
 color: '#111827',
 textAlign: 'center',
 marginBottom: 4,
 },
 categoryCount: {
 fontSize: 12,
 color: '#6b7280',
 textAlign: 'center',
 },
 criticalBanner: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'space-between',
 backgroundColor: '#fff5f5',
 borderWidth: 2,
 borderColor: '#dc3545',
 borderRadius: 12,
 padding: 16,
 marginHorizontal: 20,
 marginBottom: 20,
 shadowColor: '#dc3545',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.2,
 shadowRadius: 4,
 elevation: 3,
 },
 criticalBannerLeft: {
 flexDirection: 'row',
 alignItems: 'center',
 flex: 1,
 },
 criticalIconContainer: {
 width: 48,
 height: 48,
 borderRadius: 24,
 backgroundColor: '#dc3545',
 alignItems: 'center',
 justifyContent: 'center',
 marginRight: 12,
 },
 criticalTextContainer: {
 flex: 1,
 },
 criticalTitleRow: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 4,
 },
 criticalTitle: {
 fontSize: 16,
 fontWeight: '700',
 color: '#dc3545',
 marginRight: 8,
 },
 criticalSubtext: {
 fontSize: 13,
 color: '#666',
 },
 serviceCard: {
 backgroundColor: '#fff',
 borderRadius: 12,
 padding: 15,
 marginBottom: 15,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4,
 elevation: 3,
 },
 serviceHeader: {
 flexDirection: 'row',
 alignItems: 'flex-start',
 marginBottom: 12,
 },
 serviceIcon: {
 width: 40,
 height: 40,
 borderRadius: 20,
 alignItems: 'center',
 justifyContent: 'center',
 marginRight: 12,
 },
 serviceInfo: {
 flex: 1,
 },
 serviceName: {
 fontSize: 16,
 fontWeight: '600',
 color: '#111827',
 marginBottom: 4,
 },
 serviceDescription: {
 fontSize: 14,
 color: '#6b7280',
 lineHeight: 20,
 },
 emergencyBadge: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#ef4444',
 paddingHorizontal: 6,
 paddingVertical: 3,
 borderRadius: 8,
 },
 emergencyText: {
 fontSize: 10,
 fontWeight: '600',
 color: '#fff',
 marginLeft: 2,
 },
 serviceFooter: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 },
 serviceStats: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 statItem: {
 flexDirection: 'row',
 alignItems: 'center',
 marginRight: 15,
 },
 statText: {
 fontSize: 14,
 fontWeight: '500',
 color: '#374151',
 marginLeft: 4,
 },
 statSubtext: {
 fontSize: 12,
 color: '#6b7280',
 marginLeft: 2,
 },
 servicePrice: {
 fontSize: 16,
 fontWeight: '600',
 color: '#0d6efd',
 },
 resultsHeader: {
 marginBottom: 15,
 },
 backToCategories: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 8,
 },
 backText: {
 fontSize: 14,
 color: '#0d6efd',
 marginLeft: 4,
 },
 resultsTitle: {
 fontSize: 18,
 fontWeight: '600',
 color: '#111827',
 marginBottom: 4,
 },
 resultsCount: {
 fontSize: 14,
 color: '#6b7280',
 },
 emptyState: {
 alignItems: 'center',
 justifyContent: 'center',
 paddingVertical: 60,
 },
 emptyTitle: {
 fontSize: 18,
 fontWeight: '600',
 color: '#374151',
 marginTop: 15,
 marginBottom: 8,
 },
 emptySubtitle: {
 fontSize: 14,
 color: '#6b7280',
 textAlign: 'center',
 },
});
