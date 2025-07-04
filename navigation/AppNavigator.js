// navigation/AppNavigator.js

// Navigation container and navigators
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

export default function AppNavigator() {
  return (
    // Wrap all screens in NavigationContainer with our theme
    <NavigationContainer theme={QuickFixTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        {/* Authentication Flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Role-based Tab Navigators */}
        <Stack.Screen name="Client" component={ClientTabs} />
        <Stack.Screen name="Technician" component={TechnicianTabs} />
        <Stack.Screen name="Admin" component={AdminDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
