// navigation/AppNavigator.js

import React from 'react';
// Navigation container and stack navigator
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import all existing screens
import SplashScreen           from '../screens/SplashScreen';
import LoginScreen            from '../screens/LoginScreen';
import RegisterScreen         from '../screens/RegisterScreen';
import ClientDashboard        from '../screens/ClientDashboard';
import TechnicianDashboard    from '../screens/TechnicianDashboard';
import AdminDashboard         from '../screens/AdminDashboard';

// ⬇️ NEW: Import the service request screen
import ServiceRequestScreen   from '../screens/ServiceRequestScreen';

const Stack = createNativeStackNavigator();

// Custom theme colors for consistency

const QuickFixTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f5f7fa',
    primary:    '#0d6efd',
    text:       '#212529',
  },
};

export default function AppNavigator() {
  return (
    // Wrap all screens in NavigationContainer with our theme
    <NavigationContainer theme={QuickFixTheme}>
      <Stack.Navigator
        initialRouteName="Splash"      // Start at splash on app launch
        screenOptions={{ headerShown: false }}
      >
        {/* Public entry screens */}
        <Stack.Screen name="Splash"    component={SplashScreen} />
        <Stack.Screen name="Login"     component={LoginScreen} />
        <Stack.Screen name="Register"  component={RegisterScreen} />

        {/* Role-based dashboards */}
        <Stack.Screen name="Client"      component={ClientDashboard} />
        <Stack.Screen name="Technician"  component={TechnicianDashboard} />
        <Stack.Screen name="Admin"       component={AdminDashboard} />

        {/* ⬇️ NEW: Service request flow */}
        <Stack.Screen
          name="RequestService"         // Route name you’ll use in navigate()
          component={ServiceRequestScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
