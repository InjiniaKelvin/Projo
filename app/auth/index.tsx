import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AuthIndex() {
 const router = useRouter();

 return (
 <View style={styles.container}>
 <View style={styles.header}>
 <Text style={styles.title}>QuickFix</Text>
 <Text style={styles.subtitle}>Your trusted repair service</Text>
 </View>

 <View style={styles.content}>
 <TouchableOpacity 
 style={styles.button}
 onPress={() => router.push('/auth/login')}
 >
 <Text style={styles.buttonText}>Sign In</Text>
 </TouchableOpacity>

 <TouchableOpacity 
 style={[styles.button, styles.secondaryButton]}
 onPress={() => router.push('/auth/register')}
 >
 <Text style={[styles.buttonText, styles.secondaryButtonText]}>Create Account</Text>
 </TouchableOpacity>
 </View>
 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#fff',
 padding: 20,
 },
 header: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 },
 title: {
 fontSize: 48,
 fontWeight: 'bold',
 color: '#0096FF',
 marginBottom: 10,
 },
 subtitle: {
 fontSize: 18,
 color: '#666',
 textAlign: 'center',
 },
 content: {
 flex: 1,
 justifyContent: 'center',
 gap: 16,
 },
 button: {
 backgroundColor: '#0096FF',
 paddingVertical: 16,
 paddingHorizontal: 32,
 borderRadius: 8,
 alignItems: 'center',
 },
 secondaryButton: {
 backgroundColor: 'transparent',
 borderWidth: 2,
 borderColor: '#0096FF',
 },
 buttonText: {
 color: '#fff',
 fontSize: 16,
 fontWeight: '600',
 },
 secondaryButtonText: {
 color: '#0096FF',
 },
});
