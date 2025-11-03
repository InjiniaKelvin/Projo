import { Stack } from 'expo-router';

export default function DashboardLayout() {
 return (
 <Stack>
 <Stack.Screen 
 name="client" 
 options={{ 
 title: 'Client Dashboard',
 headerShown: false 
 }} 
 />
 <Stack.Screen 
 name="technician" 
 options={{ 
 title: 'Technician Dashboard',
 headerShown: false 
 }} 
 />
 <Stack.Screen 
 name="admin" 
 options={{ 
 title: 'Admin Dashboard',
 headerShown: false 
 }} 
 />
 </Stack>
 );
}
