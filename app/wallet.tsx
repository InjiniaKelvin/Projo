/**
 * Wallet Route - Role-Based Redirection
 * Redirects to appropriate wallet screen based on user role
 */
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/SimpleAuthContext';

export default function WalletRoute() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role) {
      // Redirect based on user role
      switch (user.role) {
        case 'client':
          router.replace('/wallet/client');
          break;
        case 'technician':
          router.replace('/wallet/technician');
          break;
        case 'admin':
          router.replace('/wallet/admin');
          break;
        default:
          // Fallback to client wallet
          router.replace('/wallet/client');
      }
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
