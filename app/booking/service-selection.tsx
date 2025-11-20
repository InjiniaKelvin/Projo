/**
 * Service Selection Screen
 * 
 * Beautiful, modern UI for browsing and selecting services
 * Features categories, search, filters, and service cards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../config/api';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';

// Define interfaces for the data structures from the API
interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  // Assuming an optional imageUrl from the API
  imageUrl?: string;
}

interface Category {
  _id: string;
  name: string;
}

const ServiceSelectionScreen = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all data in parallel
        const [categoriesRes, popularServicesRes, allServicesRes] = await Promise.all([
          apiClient.get('/services/categories'),
          apiClient.get('/services/popular'),
          apiClient.get('/services'),
        ]);

        const activeCategories = categoriesRes.data || [];
        setCategories(activeCategories);
        setPopularServices(popularServicesRes.data || []);
        setAllServices(allServicesRes.data || []);
        
        // Set initial state after data is fetched
        if (activeCategories.length > 0) {
          setSelectedCategory(activeCategories[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch service data:", err);
        
        // Fallback to mock data if API fails
        const mockCategories = [
          { _id: 'plumbing', name: 'Plumbing' },
          { _id: 'electrical', name: 'Electrical' },
          { _id: 'carpentry', name: 'Carpentry' },
          { _id: 'painting', name: 'Painting' },
          { _id: 'cleaning', name: 'Cleaning' },
        ];
        
        const mockServices = [
          { _id: '1', name: 'Pipe Repair', description: 'Fix leaking or burst pipes', price: 1500, category: 'plumbing', subCategory: 'repair' },
          { _id: '2', name: 'Drain Cleaning', description: 'Clear blocked drains and sinks', price: 1200, category: 'plumbing', subCategory: 'maintenance' },
          { _id: '3', name: 'Electrical Wiring', description: 'Install or repair electrical wiring', price: 2000, category: 'electrical', subCategory: 'installation' },
          { _id: '4', name: 'Light Fixture Installation', description: 'Install ceiling or wall lights', price: 800, category: 'electrical', subCategory: 'installation' },
          { _id: '5', name: 'Furniture Assembly', description: 'Assemble furniture and fixtures', price: 1000, category: 'carpentry', subCategory: 'assembly' },
          { _id: '6', name: 'Door Repair', description: 'Fix or replace doors', price: 1500, category: 'carpentry', subCategory: 'repair' },
          { _id: '7', name: 'Interior Painting', description: 'Paint walls and ceilings', price: 3000, category: 'painting', subCategory: 'interior' },
          { _id: '8', name: 'Deep Cleaning', description: 'Thorough house cleaning', price: 2500, category: 'cleaning', subCategory: 'residential' },
        ];
        
        setCategories(mockCategories);
        setAllServices(mockServices);
        setPopularServices(mockServices.slice(0, 4));
        
        if (mockCategories.length > 0) {
          setSelectedCategory(mockCategories[0]._id);
        }
        
        console.log('Using mock data for services');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoized filtering logic for performance
  useEffect(() => {
    let result = allServices;

    if (selectedCategory) {
      result = result.filter(service => service.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      result = result.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredServices(result);
  }, [searchTerm, selectedCategory, allServices]);

  const handleSelectService = (service: Service) => {
    router.push({
      pathname: '/booking/date-time-selection',
      params: { 
        serviceId: service._id, 
        serviceName: service.name, 
        servicePrice: service.price.toString() // Ensure params are strings
      },
    });
  };

  const renderServiceItem = (service: Service) => (
    <TouchableOpacity key={service._id} style={styles.serviceItem} onPress={() => handleSelectService(service)}>
      <View style={styles.serviceInfo}>
        <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
        <ThemedText style={styles.serviceDescription} numberOfLines={2}>{service.description}</ThemedText>
        <ThemedText style={styles.servicePrice}>From KES {service.price}</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={24} color={Colors.light.tint} />
    </TouchableOpacity>
  );

  // Loading State Component
  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText style={{ marginTop: 10 }}>Loading services...</ThemedText>
      </ThemedView>
    );
  }

  // Error State Component
  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="red" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  // Main Component Render
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Select a Service</ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.light.icon} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a service..."
          placeholderTextColor={Colors.light.icon}
          value={searchTerm}
          onChangeText={setSearchTerm}
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {popularServices.length > 0 && (
          <>
            <ThemedText style={styles.sectionTitle}>Popular Services</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
              {popularServices.map(service => (
                <TouchableOpacity key={service._id} style={styles.popularServiceItem} onPress={() => handleSelectService(service)}>
                  <Image 
                    source={{ uri: service.imageUrl || 'https://via.placeholder.com/100' }} 
                    style={styles.popularServiceImage} 
                  />
                  <ThemedText style={styles.popularServiceName} numberOfLines={2}>{service.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <ThemedText style={styles.sectionTitle}>All Services</ThemedText>
        {categories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
            {categories.map(category => (
                <TouchableOpacity
                key={category._id}
                style={[
                    styles.categoryTab,
                    selectedCategory === category._id && styles.selectedCategoryTab,
                ]}
                onPress={() => setSelectedCategory(category._id)}>
                <ThemedText
                    style={[
                    styles.categoryText,
                    selectedCategory === category._id && styles.selectedCategoryText,
                    ]}>
                    {category.name}
                </ThemedText>
                </TouchableOpacity>
            ))}
            </ScrollView>
        )}

        <View style={styles.serviceList}>
            {filteredServices.length > 0 ? (
            filteredServices.map(renderServiceItem)
            ) : (
            <ThemedText style={styles.noServicesText}>No services found. Try a different search or category.</ThemedText>
            )}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.light.text,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
  },
  horizontalScrollView: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  popularServiceItem: {
    width: 120,
    marginRight: 16,
    alignItems: 'center',
  },
  popularServiceImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  popularServiceName: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryTab: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  categoryText: {
    color: Colors.light.text,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  serviceList: {
    marginTop: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: Colors.light.background,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginTop: 8,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  noServicesText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: Colors.light.icon,
  },
});

export default ServiceSelectionScreen;
