import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
 ActivityIndicator,
 Alert,
 RefreshControl,
 ScrollView,
 StyleSheet,
 Text,
 TouchableOpacity,
 View,
} from 'react-native';
import apiClient, { API_ENDPOINTS } from '@/config/api';

// Currency formatting utilities for Kenyan Shillings - inline implementation
const formatKES = (amount: number, showCurrency: boolean = true): string => {
 if (typeof amount !== 'number' || isNaN(amount)) {
 return showCurrency ? 'KES 0' : '0';
 }
 
 // Format with commas for thousands
 const formatted = amount.toLocaleString('en-KE', {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2,
 });
 
 return showCurrency ? `KES ${formatted}` : formatted;
};

const formatKESAbbreviated = (amount: number, showCurrency: boolean = true): string => {
 if (typeof amount !== 'number' || isNaN(amount)) {
 return showCurrency ? 'KES 0' : '0';
 }
 
 let formatted;
 if (amount >= 1000000) {
 formatted = (amount / 1000000).toFixed(1) + 'M';
 } else if (amount >= 1000) {
 formatted = (amount / 1000).toFixed(1) + 'K';
 } else {
 formatted = amount.toFixed(0);
 }
 
 return showCurrency ? `KES ${formatted}` : formatted;
};

interface AnalyticsData {
  userStats: {
    totalUsers: number;
    activeUsers: number;
  };
  bookingStats: {
    totalBookings: number;
    completionRate: number;
  };
  transactionStats: {
    totalRevenue: number;
  };
  topTechnicians: {
    firstName: string;
    lastName: string;
    recentJobCount: number;
    technicianProfile: { rating: number };
    recentRevenue: number;
  }[];
  serviceTypeStats: {
    _id: string;
    count: number;
    totalRevenue: number;
  }[];
  revenueAnalytics: {
    dailyRevenue: {
      _id: { year: number; month: number; day: number };
      revenue: number;
    }[];
  };
}

export default function AnalyticsReportsScreen() {
 const router = useRouter();
 const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);
 const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

 const periods = [
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
  { key: '1y', label: 'Last Year' },
 ];

 useEffect(() => {
 loadAnalyticsData();
 }, [selectedPeriod]);

 const loadAnalyticsData = async () => {
 try {
 setLoading(true);
      const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.ANALYTICS}?timeframe=${selectedPeriod}`);
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to load analytics data');
      }
 } catch (error) {
 console.error('Error loading analytics data:', error);
 Alert.alert('Error', 'Failed to load analytics data');
 } finally {
 setLoading(false);
 }
 };

 const onRefresh = async () => {
 setRefreshing(true);
 await loadAnalyticsData();
 setRefreshing(false);
 };

 const exportReport = (type: 'revenue' | 'services' | 'technicians' | 'customers') => {
 Alert.alert(
 'Export Report',
 `Export ${type} report for ${selectedPeriod}?`,
 [
 { text: 'Cancel', style: 'cancel' },
 {
 text: 'Export',
 onPress: () => {
 // TODO: Implement actual export functionality
 Alert.alert('Success', `${type} report exported successfully!`);
 }
 }
 ]
 );
 };

 if (loading || !analyticsData) {
 return (
 <View style={styles.loadingContainer}>
 <ActivityIndicator size="large" color="#0d6efd" />
 <Text style={styles.loadingText}>Loading analytics...</Text>
 </View>
 );
 }

 return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.header}>
 <TouchableOpacity 
 style={styles.backButton}
 onPress={() => router.push('/dashboard/admin')}
 >
 <Text style={styles.backButtonText}>← Back to Dashboard</Text>
 </TouchableOpacity>
 <Text style={styles.headerTitle}>Analytics & Reports</Text>
 </View>

 <View style={styles.content}>
 {/* Period Selector */}
 <ScrollView 
 horizontal 
 showsHorizontalScrollIndicator={false}
 style={styles.periodSelector}
 >
 {periods.map(period => (
 <TouchableOpacity
 key={period.key}
 style={[
 styles.periodButton,
 selectedPeriod === period.key && styles.activePeriodButton
 ]}
 onPress={() => setSelectedPeriod(period.key as any)}
 >
 <Text style={[
 styles.periodButtonText,
 selectedPeriod === period.key && styles.activePeriodButtonText
 ]}>
 {period.label}
 </Text>
 </TouchableOpacity>
 ))}
 </ScrollView>

 <ScrollView
 style={styles.analyticsContainer}
 refreshControl={
 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
 }
 >
 {/* Overview Cards */}
 <View style={styles.overviewSection}>
 <Text style={styles.sectionTitle}>Overview</Text>
 <View style={styles.overviewGrid}>
 <View style={styles.overviewCard}>
 <Text style={styles.overviewValue}>
              {formatKES(analyticsData.transactionStats.totalRevenue)}
 </Text>
 <Text style={styles.overviewLabel}>Total Revenue</Text>
 </View>
 
 <View style={styles.overviewCard}>
 <Text style={styles.overviewValue}>
              {analyticsData.bookingStats.totalBookings.toLocaleString()}
 </Text>
 <Text style={styles.overviewLabel}>Total Services</Text>
 </View>
 
 <View style={styles.overviewCard}>
 <Text style={styles.overviewValue}>
              {analyticsData.userStats.activeUsers}
 </Text>
 <Text style={styles.overviewLabel}>Active Users</Text>
 </View>
 
 <View style={styles.overviewCard}>
 <Text style={styles.overviewValue}>
              {analyticsData.bookingStats.completionRate.toFixed(1)}%
 </Text>
 <Text style={styles.overviewLabel}>Completion Rate</Text>
 </View>
 </View>
 </View>

 {/* Revenue Chart Section */}
 <View style={styles.section}>
 <View style={styles.sectionHeader}>
 <Text style={styles.sectionTitle}>Revenue Trends</Text>
 <TouchableOpacity
 style={styles.exportButton}
 onPress={() => exportReport('revenue')}
 >
 <Text style={styles.exportButtonText}>Export</Text>
 </TouchableOpacity>
 </View>
 
 <View style={styles.chartContainer}>
            {analyticsData.revenueAnalytics.dailyRevenue.map((item, index) => (
 <View key={index} style={styles.chartBar}>
 <View style={styles.barContainer}>
 <View 
 style={[
 styles.bar, 
                      { height: (item.revenue / 100000) * 100 }
 ]} 
 />
 </View>
                  <Text style={styles.barLabel}>{`${item._id.day}/${item._id.month}`}</Text>
                  <Text style={styles.barValue}>{formatKESAbbreviated(item.revenue)}</Text>
 </View>
 ))}
 </View>
 </View>

 {/* Service Categories */}
 <View style={styles.section}>
 <View style={styles.sectionHeader}>
 <Text style={styles.sectionTitle}>Service Categories</Text>
 <TouchableOpacity
 style={styles.exportButton}
 onPress={() => exportReport('services')}
 >
 <Text style={styles.exportButtonText}>Export</Text>
 </TouchableOpacity>
 </View>
 
            {analyticsData.serviceTypeStats.map((service, index) => (
 <View key={index} style={styles.serviceItem}>
 <View style={styles.serviceInfo}>
 <Text style={styles.serviceName}>{service._id}</Text>
 <Text style={styles.serviceCount}>{service.count} services</Text>
 </View>
 <Text style={styles.serviceRevenue}>
 <Text style={styles.serviceRevenue}>
                    {formatKES(service.totalRevenue)}
 </Text>
 </Text>
 </View>
 ))}
 </View>

 {/* Top Technicians */}
 <View style={styles.section}>
 <View style={styles.sectionHeader}>
 <Text style={styles.sectionTitle}>Top Technicians</Text>
 <TouchableOpacity
 style={styles.exportButton}
 onPress={() => exportReport('technicians')}
 >
 <Text style={styles.exportButtonText}>Export</Text>
 </TouchableOpacity>
 </View>
 
            {analyticsData.topTechnicians.map((tech, index) => (
 <View key={index} style={styles.technicianItem}>
 <View style={styles.technicianRank}>
 <Text style={styles.rankNumber}>{index + 1}</Text>
 </View>
 <View style={styles.technicianInfo}>
                  <Text style={styles.technicianName}>{tech.firstName} {tech.lastName}</Text>
 <Text style={styles.technicianStats}>
                    {tech.recentJobCount} jobs * {tech.technicianProfile.rating}⭐
 </Text>
 </View>
 <Text style={styles.technicianRevenue}>
                  {formatKES(tech.recentRevenue)}
 </Text>
 </View>
 ))}
 </View>

 {/* Customer Metrics */}
 <View style={styles.section}>
 <View style={styles.sectionHeader}>
 <Text style={styles.sectionTitle}>User Metrics</Text>
 <TouchableOpacity
 style={styles.exportButton}
 onPress={() => exportReport('customers')}
 >
 <Text style={styles.exportButtonText}>Export</Text>
 </TouchableOpacity>
 </View>
 
 <View style={styles.customerMetrics}>
 <View style={styles.metricItem}>
 <Text style={styles.metricValue}>
                  {analyticsData.userStats.totalUsers}
 </Text>
 <Text style={styles.metricLabel}>Total Users</Text>
 </View>
 
 <View style={styles.metricItem}>
 <Text style={styles.metricValue}>
                  {analyticsData.userStats.activeUsers}
 </Text>
 <Text style={styles.metricLabel}>Active Users</Text>
 </View>
 
 <View style={styles.metricItem}>
 <Text style={styles.metricValue}>
                  {formatKES(analyticsData.transactionStats.totalRevenue / analyticsData.bookingStats.totalBookings)}
 </Text>
 <Text style={styles.metricLabel}>Avg Job Value</Text>
 </View>
 </View>
 </View>
 </ScrollView>
 </View>
 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#f5f7fa',
 },
 loadingContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: '#f5f7fa',
 },
 loadingText: {
 marginTop: 10,
 fontSize: 16,
 color: '#666',
 },
 header: {
 backgroundColor: '#0d6efd',
 padding: 20,
 paddingTop: 50,
 },
 backButton: {
 marginBottom: 10,
 },
 backButtonText: {
 color: '#fff',
 fontSize: 16,
 },
 headerTitle: {
 fontSize: 24,
 fontWeight: 'bold',
 color: '#fff',
 textAlign: 'center',
 },
 content: {
 flex: 1,
 },
 periodSelector: {
 padding: 20,
 paddingBottom: 10,
 },
 periodButton: {
 backgroundColor: '#fff',
 paddingHorizontal: 20,
 paddingVertical: 10,
 borderRadius: 20,
 marginRight: 10,
 elevation: 1,
 },
 activePeriodButton: {
 backgroundColor: '#0d6efd',
 },
 periodButtonText: {
 fontSize: 14,
 color: '#666',
 fontWeight: '600',
 },
 activePeriodButtonText: {
 color: '#fff',
 },
 analyticsContainer: {
 flex: 1,
 paddingHorizontal: 20,
 },
 overviewSection: {
 marginBottom: 20,
 },
 sectionTitle: {
 fontSize: 18,
 fontWeight: 'bold',
 color: '#333',
 marginBottom: 15,
 },
 overviewGrid: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 justifyContent: 'space-between',
 },
 overviewCard: {
 backgroundColor: '#fff',
 borderRadius: 10,
 padding: 20,
 width: '48%',
 marginBottom: 10,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 },
 overviewValue: {
 fontSize: 24,
 fontWeight: 'bold',
 color: '#0d6efd',
 marginBottom: 5,
 },
 overviewLabel: {
 fontSize: 14,
 color: '#666',
 },
 section: {
 backgroundColor: '#fff',
 borderRadius: 10,
 padding: 20,
 marginBottom: 20,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 },
 sectionHeader: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 marginBottom: 15,
 },
 exportButton: {
 backgroundColor: '#28a745',
 paddingHorizontal: 12,
 paddingVertical: 6,
 borderRadius: 5,
 },
 exportButtonText: {
 color: '#fff',
 fontSize: 12,
 fontWeight: '600',
 },
 chartContainer: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'flex-end',
 height: 150,
 paddingTop: 20,
 },
 chartBar: {
 alignItems: 'center',
 flex: 1,
 },
 barContainer: {
 height: 100,
 justifyContent: 'flex-end',
 width: 20,
 },
 bar: {
 backgroundColor: '#0d6efd',
 width: 20,
 borderRadius: 2,
 },
 barLabel: {
 fontSize: 12,
 color: '#666',
 marginTop: 8,
 },
 barValue: {
 fontSize: 11,
 color: '#999',
 marginTop: 2,
 },
 serviceItem: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 paddingVertical: 12,
 borderBottomWidth: 1,
 borderBottomColor: '#f0f0f0',
 },
 serviceInfo: {
 flex: 1,
 },
 serviceName: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginBottom: 4,
 },
 serviceCount: {
 fontSize: 14,
 color: '#666',
 },
 serviceRevenue: {
 fontSize: 16,
 fontWeight: 'bold',
 color: '#28a745',
 },
 technicianItem: {
 flexDirection: 'row',
 alignItems: 'center',
 paddingVertical: 12,
 borderBottomWidth: 1,
 borderBottomColor: '#f0f0f0',
 },
 technicianRank: {
 width: 30,
 height: 30,
 borderRadius: 15,
 backgroundColor: '#0d6efd',
 justifyContent: 'center',
 alignItems: 'center',
 marginRight: 15,
 },
 rankNumber: {
 color: '#fff',
 fontWeight: 'bold',
 fontSize: 14,
 },
 technicianInfo: {
 flex: 1,
 },
 technicianName: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginBottom: 4,
 },
 technicianStats: {
 fontSize: 14,
 color: '#666',
 },
 technicianRevenue: {
 fontSize: 16,
 fontWeight: 'bold',
 color: '#28a745',
 },
 customerMetrics: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 },
 metricItem: {
 alignItems: 'center',
 flex: 1,
 },
 metricValue: {
 fontSize: 24,
 fontWeight: 'bold',
 color: '#0d6efd',
 marginBottom: 5,
 },
 metricLabel: {
 fontSize: 14,
 color: '#666',
 textAlign: 'center',
 },
});
