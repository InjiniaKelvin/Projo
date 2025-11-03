// utils/locationHelper.js

import * as Location from 'expo-location';

/**
 * Request permission and get the device's current GPS coordinates.
 * @returns {Promise<{latitude: number, longitude: number}>}
 * @throws {Error} If permission is denied or location fetch fails.
 */
export async function getCurrentLocation() {
 // 1. Ask user for location permission
 const { status } = await Location.requestForegroundPermissionsAsync();
 if (status !== 'granted') {
 // Halt if user denies permission
 throw new Error('Location permission denied. Cannot match technicians.');
 }

 // 2. Get current position
 const { coords } = await Location.getCurrentPositionAsync({});

 // 3. Return only latitude & longitude
 return {
 latitude: coords.latitude,
 longitude: coords.longitude,
 };
}
