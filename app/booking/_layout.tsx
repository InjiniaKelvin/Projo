import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="details" />
      <Stack.Screen name="regular-services" />
      <Stack.Screen name="emergency-services" />
      <Stack.Screen name="service-selection" />
      <Stack.Screen name="tracking" />
    </Stack>
  );
}
