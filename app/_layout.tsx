import { Stack } from 'expo-router';
import { useEffect } from 'react';
import WebStyleInjector from '../components/WebStyleInjector';
import { AuthProvider } from '../contexts/SimpleAuthContext';

export default function RootLayout() {
 // Suppress font loading warnings on web
 useEffect(() => {
   if (typeof window !== 'undefined') {
     // Override console.warn for font-related warnings
     const originalWarn = console.warn;
     console.warn = (...args: any[]) => {
       const message = args[0]?.toString() || '';
       // Suppress known font loading warnings
       if (message.includes('Slow network is detected') || 
           message.includes('timeout exceeded') ||
           message.includes('Fallback font')) {
         return; // Silently ignore
       }
       originalWarn.apply(console, args);
     };
     
     return () => {
       console.warn = originalWarn;
     };
   }
 }, []);

 return (
 <AuthProvider>
 <WebStyleInjector />
 <Stack>
 <Stack.Screen name="index" options={{ headerShown: false }} />
 <Stack.Screen name="auth" options={{ headerShown: false }} />
 <Stack.Screen name="booking" options={{ headerShown: false }} />
 <Stack.Screen name="bookings" options={{ headerShown: false }} />
 <Stack.Screen name="chat" options={{ headerShown: false }} />
 <Stack.Screen name="support" options={{ headerShown: false }} />
 <Stack.Screen name="tracking" options={{ headerShown: false }} />
 </Stack>
 </AuthProvider>
 );
}
