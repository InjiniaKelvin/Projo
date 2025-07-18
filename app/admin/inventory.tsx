import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface SparePart {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minStockLevel: number;
  price: number;
  supplier: string;
  lastRestocked: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export default function SparePartsInventoryScreen() {
  const router = useRouter();
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for demonstration
  const mockSpareParts: SparePart[] = [
    {
      id: '1',
      name: 'Air Filter',
      category: 'HVAC',
      sku: 'AF-001',
      quantity: 25,
      minStockLevel: 10,
      price: 15.99,
      supplier: 'HVAC Supply Co.',
      lastRestocked: '2025-07-10',
      status: 'in-stock'
    },
    {
      id: '2',
      name: 'Circuit Breaker 20A',
      category: 'Electrical',
      sku: 'CB-20A',
      quantity: 5,
      minStockLevel: 10,
      price: 25.50,
      supplier: 'Electric Parts Ltd.',
      lastRestocked: '2025-07-05',
      status: 'low-stock'
    },
    {
      id: '3',
      name: 'PVC Pipe Connector',
      category: 'Plumbing',
      sku: 'PVC-001',
      quantity: 0,
      minStockLevel: 15,
      price: 3.99,
      supplier: 'Plumbing Solutions',
      lastRestocked: '2025-06-28',
      status: 'out-of-stock'
    },
    {
      id: '4',
      name: 'Thermal Fuse',
      category: 'Appliances',
      sku: 'TF-001',
      quantity: 18,
      minStockLevel: 8,
      price: 8.75,
      supplier: 'Appliance Parts Direct',
      lastRestocked: '2025-07-12',
      status: 'in-stock'
    },
    {
      id: '5',
      name: 'LED Bulb 60W Equivalent',
      category: 'Electrical',
      sku: 'LED-60W',
      quantity: 7,
      minStockLevel: 20,
      price: 12.99,
      supplier: 'Electric Parts Ltd.',
      lastRestocked: '2025-07-08',
      status: 'low-stock'
    }
  ];

  const categories = ['all', 'HVAC', 'Electrical', 'Plumbing', 'Appliances'];

  useEffect(() => {
    loadSpareParts();
  }, []);

  const loadSpareParts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/spare-parts');
      // const data = await response.json();
      
      // Simulate API delay
      setTimeout(() => {
        setSpareParts(mockSpareParts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading spare parts:', error);
      Alert.alert('Error', 'Failed to load spare parts');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSpareParts();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return '#28a745';
      case 'low-stock': return '#ffc107';
      case 'out-of-stock': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleRestock = (part: SparePart) => {
    Alert.prompt(
      'Restock Item',
      `Enter quantity to add to ${part.name}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Stock',
          onPress: (quantity) => {
            if (quantity && !isNaN(Number(quantity))) {
              const newQuantity = part.quantity + Number(quantity);
              setSpareParts(prev =>
                prev.map(p =>
                  p.id === part.id 
                    ? { 
                        ...p, 
                        quantity: newQuantity,
                        status: newQuantity > p.minStockLevel ? 'in-stock' : 'low-stock',
                        lastRestocked: new Date().toISOString().split('T')[0]
                      }
                    : p
                )
              );
              Alert.alert('Success', `Added ${quantity} units to ${part.name}`);
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const filteredParts = spareParts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || part.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = spareParts.filter(p => p.status === 'low-stock').length;
  const outOfStockCount = spareParts.filter(p => p.status === 'out-of-stock').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/dashboard/admin')}
        >
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spare Parts Inventory</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Low Stock: {lowStockCount} | Out of Stock: {outOfStockCount}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search parts by name or SKU..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  filterCategory === category && styles.activeFilterButton
                ]}
                onPress={() => setFilterCategory(category)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterCategory === category && styles.activeFilterButtonText
                ]}>
                  {category === 'all' ? 'All' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Add New Part Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Add New Part', 'Add new part feature coming soon!')}
        >
          <Text style={styles.addButtonText}>+ Add New Part</Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.partsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredParts.map((part) => (
            <View key={part.id} style={styles.partCard}>
              <View style={styles.cardHeader}>
                <View style={styles.partInfo}>
                  <Text style={styles.partName}>{part.name}</Text>
                  <Text style={styles.partSku}>SKU: {part.sku}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(part.status) }]}>
                  <Text style={styles.statusText}>{part.status.replace('-', ' ').toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.partDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>{part.category}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: part.quantity <= part.minStockLevel ? '#dc3545' : '#333' }
                  ]}>
                    {part.quantity} units
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Min Stock Level:</Text>
                  <Text style={styles.detailValue}>{part.minStockLevel} units</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>${part.price.toFixed(2)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Supplier:</Text>
                  <Text style={styles.detailValue}>{part.supplier}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Restocked:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(part.lastRestocked).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.restockButton}
                  onPress={() => handleRestock(part)}
                >
                  <Text style={styles.restockButtonText}>Restock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => Alert.alert('Edit Part', 'Edit part feature coming soon!')}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredParts.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No spare parts found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#0d6efd',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 1,
  },
  activeFilterButton: {
    backgroundColor: '#0d6efd',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  partsContainer: {
    flex: 1,
  },
  partCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  partSku: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  partDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  restockButton: {
    backgroundColor: '#0d6efd',
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  restockButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#6c757d',
    flex: 1,
    padding: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
