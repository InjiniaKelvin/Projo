/**
 * Mock Mode Indicator
 * Shows when the app is running with mock authentication
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MockModeIndicator = () => {
 return (
 <View style={styles.container}>
 <Text style={styles.text}> DEMO MODE - Backend Offline</Text>
 </View>
 );
};

const styles = StyleSheet.create({
 container: {
 position: 'absolute',
 top: 0,
 left: 0,
 right: 0,
 backgroundColor: '#ff9800',
 paddingVertical: 8,
 paddingHorizontal: 16,
 zIndex: 1000,
 alignItems: 'center',
 justifyContent: 'center'
 },
 text: {
 color: 'white',
 fontSize: 12,
 fontWeight: '600',
 textAlign: 'center'
 }
});

export default MockModeIndicator;
