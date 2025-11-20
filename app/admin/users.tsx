import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import apiClient, { API_ENDPOINTS } from '@/config/api';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createShadow } from '@/utils/shadows';

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
};

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}?page=${pageNum}&limit=15`);
      if (response.data.users) {
        setUsers(pageNum === 1 ? response.data.users : [...users, ...response.data.users]);
        setTotalPages(response.data.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to fetch users.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(1);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      fetchUsers(page + 1);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => router.push(`/admin/user/${item._id}`)}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</ThemedText>
        </View>
        <View>
          <ThemedText style={styles.userName}>{item.firstName} {item.lastName}</ThemedText>
          <ThemedText style={styles.userEmail}>{item.email}</ThemedText>
        </View>
      </View>
      <View style={styles.userDetails}>
        <ThemedText style={styles.userRole}>{item.role}</ThemedText>
        <View style={[styles.statusIndicator, { backgroundColor: item.isActive ? '#4CAF50' : '#F44336' }]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>User Management</ThemedText>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => (
          !loading && <ThemedText style={styles.emptyText}>No users found.</ThemedText>
        )}
        ListFooterComponent={() => (
          loading && page > 1 && <ActivityIndicator size="small" color="#007AFF" />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 40, // For status bar
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    padding: 10,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    // ...createShadow(2),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#333',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    color: '#666',
    fontSize: 12,
  },
  userDetails: {
    alignItems: 'flex-end',
  },
  userRole: {
    textTransform: 'capitalize',
    fontWeight: '500',
    marginBottom: 5,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
