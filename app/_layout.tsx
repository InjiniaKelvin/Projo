import { Stack } from 'expo-router';
import WebStyleInjector from '../components/WebStyleInjector';
import { AuthProvider } from '../contexts/SimpleAuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <WebStyleInjector />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
