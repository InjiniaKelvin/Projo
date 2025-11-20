import React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

type HeaderProps = {
  title: string;
  canGoBack?: boolean;
  showNotifications?: boolean;
  showLogout?: boolean;
};

export function Header({ title, canGoBack = false, showNotifications = true, showLogout = false }: HeaderProps) {
  const navigation = useNavigation();
  const router = useRouter();
  const { logout } = useAuth();
  const iconColor = useThemeColor({}, 'text');

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  const performLogout = async () => {
    try {
      console.log('Performing logout...');
      await logout();
      console.log('Logout successful, redirecting...');
      router.replace('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      router.replace('/auth');
    }
  };

  return (
    <ThemedView style={styles.header}>
      {canGoBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      )}
      <ThemedText style={styles.title}>{title}</ThemedText>
      {showNotifications && !showLogout && (
        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      )}
      {showLogout && (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.icon,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  notificationButton: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
