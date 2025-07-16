// navigation/AppNavigator.js
// Enhanced navigation with authentication state management and route protection

// Navigation container and navigators
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// Import authentication context
import { useAuth } from '../contexts/AuthContext';

// Import all screens
import AdminDashboard from '../Screens/AdminDashboard';
import ClientDashboard from '../Screens/ClientDashboard';
import LoginScreen from '../Screens/LoginScreen';
import PlaceholderScreen from '../Screens/PlaceholderScreen';
import RegisterScreen from '../Screens/RegisterScreen';
import ServiceRequestScreen from '../Screens/ServiceRequestScreen';
import SplashScreen from '../Screens/SplashScreen';
import TechnicianDashboard from '../Screens/TechnicianDashboard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

// Client Tab Navigator
function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'RequestService') {
            iconName = focused ? 'build' : 'build-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0d6efd',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={ClientDashboard} />
      <Tab.Screen name="RequestService" component={ServiceRequestScreen} />
      <Tab.Screen 
        name="Messages" 
        children={() => <PlaceholderScreen title="Messages" />} 
      />
      <Tab.Screen 
        name="Profile" 
        children={() => <PlaceholderScreen title="Profile" />} 
      />
    </Tab.Navigator>
  );
}

// Technician Tab Navigator
function TechnicianTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0d6efd',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={TechnicianDashboard} />
      <Tab.Screen 
        name="Jobs" 
        children={() => <PlaceholderScreen title="Jobs" />} 
      />
      <Tab.Screen 
        name="Messages" 
        children={() => <PlaceholderScreen title="Messages" />} 
      />
      <Tab.Screen 
        name="Profile" 
        children={() => <PlaceholderScreen title="Profile" />} 
      />
    </Tab.Navigator>
  );
}

/**
 * Main App Navigator with Authentication State Management
 * Handles routing based on authentication state and user roles
 */
export default function AppNavigator() {
  // Get authentication state from context
  const { isLoading, isAuthenticated, user } = useAuth();

  // Show loading screen while checking authentication state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={QuickFixTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Authentication Flow - Show when user is not authenticated
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Authenticated Flow - Show based on user role
          <>
            {user?.userType === 'client' && (
              <Stack.Screen name="Client" component={ClientTabs} />
            )}
            {user?.userType === 'technician' && (
              <Stack.Screen name="Technician" component={TechnicianTabs} />
            )}
            {user?.userType === 'admin' && (
              <Stack.Screen name="Admin" component={AdminDashboard} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Loading screen styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
});
