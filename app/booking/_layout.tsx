import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="details" />
      <Stack.Screen name="regular-services" />
      <Stack.Screen name="emergency-services" />
      <Stack.Screen name="emergency-services-new" />
      <Stack.Screen name="emergency-form" />
      <Stack.Screen name="service-selection" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="status" />
      <Stack.Screen name="tracking" />
      <Stack.Screen name="enhanced-tracking" />
      <Stack.Screen name="redesigned-form" />
    </Stack>
  );
}
