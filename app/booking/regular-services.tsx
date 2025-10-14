import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface RegularService {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  estimatedDuration: string;
  priceRange: string;
  isAvailable: boolean;
  skills: string[];
  popularityScore: number;
}

// Comprehensive service data (moved outside component to avoid re-renders)
const comprehensiveRegularServices: RegularService[] = [
  // **HOME REPAIR & MAINTENANCE**
  {
    id: 'home-plumbing-repair',
    name: ' Residential Plumbing Repair',
    description: 'Leaky faucets, clogged drains, toilet repairs, pipe maintenance',
    icon: 'water-outline',
    category: 'plumbing',
    estimatedDuration: '1-3 hours',
    priceRange: 'KSh 800 - 5,000',
    isAvailable: true,
    skills: ['plumbing', 'pipe repair', 'drain cleaning'],
    popularityScore: 95
  },
    {
      id: 'home-electrical-repair',
      name: ' Home Electrical Services',
      description: 'Wiring, switches, outlets, lighting installation, electrical troubleshooting',
      icon: 'flash-outline',
      category: 'electrical',
      estimatedDuration: '1-4 hours',
      priceRange: 'KSh 1,000 - 8,000',
      isAvailable: true,
      skills: ['electrical wiring', 'lighting', 'outlets'],
      popularityScore: 92
    },
    {
      id: 'home-painting-services',
      name: ' Interior & Exterior Painting',
      description: 'Room painting, exterior walls, ceiling painting, wallpaper removal',
      icon: 'brush-outline',
      category: 'painting',
      estimatedDuration: '4-8 hours',
      priceRange: 'KSh 2,000 - 15,000',
      isAvailable: true,
      skills: ['painting', 'color mixing', 'surface preparation'],
      popularityScore: 88
    },
    {
      id: 'home-carpentry-repair',
      name: '🪚 Carpentry & Woodwork',
      description: 'Furniture repair, door fitting, window frames, custom shelving',
      icon: 'hammer-outline',
      category: 'carpentry',
      estimatedDuration: '2-6 hours',
      priceRange: 'KSh 1,500 - 12,000',
      isAvailable: true,
      skills: ['woodworking', 'furniture repair', 'door installation'],
      popularityScore: 85
    },
    {
      id: 'home-tile-flooring',
      name: ' Tiling & Flooring Services',
      description: 'Ceramic tiles, bathroom tiling, floor installation, tile repair',
      icon: 'grid-outline',
      category: 'general_maintenance',
      estimatedDuration: '4-8 hours',
      priceRange: 'KSh 3,000 - 20,000',
      isAvailable: true,
      skills: ['tiling', 'flooring', 'bathroom renovation'],
      popularityScore: 82
    },
    {
      id: 'home-roofing-repair',
      name: ' Roofing & Waterproofing',
      description: 'Leak repairs, gutter cleaning, roof maintenance, waterproofing',
      icon: 'home-outline',
      category: 'roofing',
      estimatedDuration: '3-8 hours',
      priceRange: 'KSh 2,500 - 18,000',
      isAvailable: true,
      skills: ['roofing', 'waterproofing', 'gutter maintenance'],
      popularityScore: 78
    },

    // **APPLIANCE REPAIR & INSTALLATION**
    {
      id: 'appliance-washing-machine',
      name: ' Washing Machine Repair',
      description: 'Not spinning, water issues, electrical problems, installation',
      icon: 'shirt-outline',
      category: 'appliance_repair',
      estimatedDuration: '1-3 hours',
      priceRange: 'KSh 1,200 - 6,000',
      isAvailable: true,
      skills: ['appliance repair', 'washing machine', 'electrical'],
      popularityScore: 90
    },
    {
      id: 'appliance-refrigerator',
      name: ' Refrigerator Repair',
      description: 'Not cooling, compressor issues, thermostat, gas refill',
      icon: 'snow-outline',
      category: 'appliance_repair',
      estimatedDuration: '1-4 hours',
      priceRange: 'KSh 1,500 - 8,000',
      isAvailable: true,
      skills: ['refrigeration', 'compressor repair', 'gas refill'],
      popularityScore: 87
    },
    {
      id: 'appliance-microwave',
      name: ' Microwave & Small Appliances',
      description: 'Microwave repair, blender, iron, kettle, toaster repair',
      icon: 'radio-outline',
      category: 'appliance_repair',
      estimatedDuration: '30min - 2 hours',
      priceRange: 'KSh 500 - 3,000',
      isAvailable: true,
      skills: ['small appliances', 'electronics', 'microwave repair'],
      popularityScore: 75
    },
    {
      id: 'appliance-tv-installation',
      name: ' TV Installation & Repair',
      description: 'TV mounting, screen repair, antenna installation, sound system setup',
      icon: 'tv-outline',
      category: 'other',
      estimatedDuration: '1-3 hours',
      priceRange: 'KSh 1,000 - 5,000',
      isAvailable: true,
      skills: ['TV installation', 'electronics', 'mounting'],
      popularityScore: 80
    },

    // **BUSINESS & OFFICE SERVICES**
    {
      id: 'office-furniture-assembly',
      name: ' Office Furniture Assembly',
      description: 'Desk assembly, chair repair, filing cabinets, office layout',
      icon: 'business-outline',
      category: 'other',
      estimatedDuration: '2-5 hours',
      priceRange: 'KSh 1,500 - 8,000',
      isAvailable: true,
      skills: ['furniture assembly', 'office setup', 'ergonomics'],
      popularityScore: 70
    },
    {
      id: 'office-network-setup',
      name: ' Network & Internet Setup',
      description: 'WiFi installation, router setup, ethernet cables, network troubleshooting',
      icon: 'wifi-outline',
      category: 'other',
      estimatedDuration: '2-4 hours',
      priceRange: 'KSh 2,000 - 10,000',
      isAvailable: true,
      skills: ['networking', 'wifi setup', 'cable management'],
      popularityScore: 85
    },
    {
      id: 'office-computer-repair',
      name: ' Computer & Laptop Repair',
      description: 'Hardware repair, software installation, virus removal, data recovery',
      icon: 'laptop-outline',
      category: 'other',
      estimatedDuration: '1-6 hours',
      priceRange: 'KSh 1,000 - 12,000',
      isAvailable: true,
      skills: ['computer repair', 'software', 'data recovery'],
      popularityScore: 88
    },
    {
      id: 'office-cctv-installation',
      name: ' CCTV & Security Systems',
      description: 'Security camera installation, access control, alarm systems',
      icon: 'camera-outline',
      category: 'security_systems',
      estimatedDuration: '3-8 hours',
      priceRange: 'KSh 5,000 - 25,000',
      isAvailable: true,
      skills: ['security systems', 'CCTV', 'access control'],
      popularityScore: 82
    },
    {
      id: 'office-aircon-service',
      name: ' Air Conditioning Service',
      description: 'AC installation, cleaning, gas refill, duct cleaning, maintenance',
      icon: 'snow-outline',
      category: 'air_conditioning',
      estimatedDuration: '2-6 hours',
      priceRange: 'KSh 2,500 - 15,000',
      isAvailable: true,
      skills: ['HVAC', 'air conditioning', 'refrigeration'],
      popularityScore: 83
    },

    // **SPECIALIZED URBAN SERVICES**
    {
      id: 'solar-installation',
      name: ' Solar Panel Installation',
      description: 'Solar panels, inverters, battery backup, grid-tie systems',
      icon: 'sunny-outline',
      category: 'solar_installation',
      estimatedDuration: '1-3 days',
      priceRange: 'KSh 15,000 - 200,000',
      isAvailable: true,
      skills: ['solar energy', 'electrical', 'inverters'],
      popularityScore: 78
    },
    {
      id: 'water-tank-installation',
      name: ' Water Tank & Pump Services',
      description: 'Water tank installation, pressure pumps, water filtration systems',
      icon: 'water-outline',
      category: 'plumbing',
      estimatedDuration: '3-8 hours',
      priceRange: 'KSh 3,000 - 25,000',
      isAvailable: true,
      skills: ['plumbing', 'water systems', 'pump installation'],
      popularityScore: 85
    },
    {
      id: 'generator-service',
      name: ' Generator Repair & Maintenance',
      description: 'Generator repair, maintenance, fuel system, electrical connections',
      icon: 'battery-charging-outline',
      category: 'other',
      estimatedDuration: '2-5 hours',
      priceRange: 'KSh 2,000 - 12,000',
      isAvailable: true,
      skills: ['generator repair', 'electrical', 'engines'],
      popularityScore: 76
    },
    {
      id: 'gate-automation',
      name: ' Gate Automation & Access Control',
      description: 'Automatic gates, remote controls, access cards, barrier systems',
      icon: 'key-outline',
      category: 'security_systems',
      estimatedDuration: '4-8 hours',
      priceRange: 'KSh 8,000 - 40,000',
      isAvailable: true,
      skills: ['automation', 'access control', 'electrical'],
      popularityScore: 72
    },

    // **SPECIALIZED REPAIR SERVICES**
    {
      id: 'phone-laptop-repair',
      name: ' Phone & Tablet Repair',
      description: 'Screen replacement, battery change, charging port, software issues',
      icon: 'phone-portrait-outline',
      category: 'other',
      estimatedDuration: '1-3 hours',
      priceRange: 'KSh 800 - 8,000',
      isAvailable: true,
      skills: ['mobile repair', 'screen replacement', 'electronics'],
      popularityScore: 92
    },
    {
      id: 'gardening-maintenance',
      name: ' Garden & Landscaping',
      description: 'Lawn mowing, tree trimming, garden design, irrigation systems',
      icon: 'leaf-outline',
      category: 'gardening',
      estimatedDuration: '2-8 hours',
      priceRange: 'KSh 1,500 - 12,000',
      isAvailable: true,
      skills: ['landscaping', 'gardening', 'irrigation'],
      popularityScore: 68
    },
    {
      id: 'pest-control',
      name: ' Pest Control Services',
      description: 'Termite control, cockroach treatment, rat control, fumigation',
      icon: 'bug-outline',
      category: 'pest_control',
      estimatedDuration: '2-4 hours',
      priceRange: 'KSh 2,000 - 10,000',
      isAvailable: true,
      skills: ['pest control', 'fumigation', 'safety protocols'],
      popularityScore: 74
    },
    {
      id: 'cleaning-services',
      name: ' Deep Cleaning Services',
      description: 'House cleaning, office cleaning, carpet cleaning, window washing',
      icon: 'sparkles-outline',
      category: 'Cleaning',
      estimatedDuration: '3-8 hours',
      priceRange: 'KSh 1,500 - 8,000',
      isAvailable: true,
      skills: ['cleaning', 'sanitation', 'carpet cleaning'],
      popularityScore: 79
    },

    // **TRANSPORT & VEHICLE SERVICES**
    {
      id: 'vehicle-diagnostics',
      name: ' Vehicle Diagnostics & Repair',
      description: 'Engine diagnostics, electrical systems, brake repair, oil change',
      icon: 'car-outline',
      category: 'Automotive',
      estimatedDuration: '1-4 hours',
      priceRange: 'KSh 1,500 - 15,000',
      isAvailable: true,
      skills: ['automotive repair', 'diagnostics', 'mechanical'],
      popularityScore: 86
    },
    {
      id: 'motorcycle-repair',
      name: ' Motorcycle Repair & Service',
      description: 'Engine repair, brake service, tire change, chain maintenance',
      icon: 'bicycle-outline',
      category: 'Automotive',
      estimatedDuration: '1-3 hours',
      priceRange: 'KSh 800 - 6,000',
      isAvailable: true,
      skills: ['motorcycle repair', 'engine service', 'tire replacement'],
      popularityScore: 81
  }
];

const RegularServicesScreen = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [regularServices, setRegularServices] = useState<RegularService[]>([]);

  // Debug logging
  useEffect(() => {
    console.log(' RegularServicesScreen: Component mounted');
    console.log(' User context:', user ? 'Available' : 'Not available');
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    setRegularServices(comprehensiveRegularServices.sort((a, b) => b.popularityScore - a.popularityScore));
    setIsLoading(false);
  }, []);

  const handleServiceBooking = (service: RegularService) => {
    const serviceData = {
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      priceRange: { 
        min: parseInt(service.priceRange.split(' - ')[0].replace(/[^\d]/g, '')),
        max: parseInt(service.priceRange.split(' - ')[1].replace(/[^\d]/g, ''))
      },
      estimatedDuration: parseInt(service.estimatedDuration.replace(/[^\d]/g, '')),
      isEmergencyService: false
    };

    router.push({
      pathname: '/booking/details',
      params: {
        serviceId: service.id,
        serviceData: JSON.stringify(serviceData)
      }
    });
  };

  const categories = ['all', ...Array.from(new Set(regularServices.map(s => s.category)))];

  const filteredServices = regularServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Home Repair': 'home-outline',
      'Home Improvement': 'construct-outline',
      'Appliance Repair': 'cog-outline',
      'Electronics': 'phone-portrait-outline',
      'Business Services': 'business-outline',
      'Technology': 'laptop-outline',
      'Security': 'shield-outline',
      'HVAC': 'snow-outline',
      'Energy': 'sunny-outline',
      'Plumbing': 'water-outline',
      'Power Systems': 'battery-charging-outline',
      'Outdoor': 'leaf-outline',
      'Health & Safety': 'medical-outline',
      'Cleaning': 'sparkles-outline',
      'Automotive': 'car-outline'
    };
    return iconMap[category] || 'build-outline';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading Services...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> REPAIR SERVICES</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services, repairs, or skills..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category && styles.selectedCategoryChipText
              ]}>
                {category === 'all' ? 'All Services' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.servicesGrid}>
          {filteredServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => handleServiceBooking(service)}
              activeOpacity={0.8}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIconContainer}>
                  <Ionicons 
                    name={getCategoryIcon(service.category) as any} 
                    size={24} 
                    color="#0d6efd" 
                  />
                </View>
                <View style={styles.popularityBadge}>
                  <Text style={styles.popularityText}>{service.popularityScore}%</Text>
                </View>
              </View>

              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription} numberOfLines={2}>
                {service.description}
              </Text>

              <View style={styles.serviceDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>{service.estimatedDuration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>{service.priceRange}</Text>
                </View>
              </View>

              <View style={styles.skillsContainer}>
                {service.skills.slice(0, 2).map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
                {service.skills.length > 2 && (
                  <Text style={styles.moreSkills}>+{service.skills.length - 2}</Text>
                )}
              </View>

              <View style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Book Service</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredServices.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color="#9ca3af" />
            <Text style={styles.noResultsText}>No services found</Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your search or browse categories
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d6efd',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 45,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#111827',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedCategoryChip: {
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularityBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  serviceDetails: {
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 10,
    color: '#374151',
  },
  moreSkills: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d6efd',
    paddingVertical: 8,
    borderRadius: 6,
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 4,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default RegularServicesScreen;
