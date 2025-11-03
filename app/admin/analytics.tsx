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
 View
} from 'react-native';

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
 overview: {
 totalRevenue: number;
 totalServices: number;
 activeTechnicians: number;
 customerSatisfaction: number;
 };
 revenueData: {
 period: string;
 amount: number;
 }[];
 serviceData: {
 category: string;
 count: number;
 revenue: number;
 }[];
 technicianPerformance: {
 name: string;
 completedJobs: number;
 rating: number;
 revenue: number;
 }[];
 customerMetrics: {
 newCustomers: number;
 returningCustomers: number;
 averageJobValue: number;
 };
}

export default function AnalyticsReportsScreen() {
 const router = useRouter();
 const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);
 const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

 // Mock analytics data with Kenyan Shilling amounts
 const mockAnalyticsData: AnalyticsData = {
 overview: {
 totalRevenue: 12548050, // KES 12.5M
 totalServices: 1248,
 activeTechnicians: 42,
 customerSatisfaction: 4.7,
 },
 revenueData: [
 { period: 'Jan', amount: 1850000 }, // KES 1.85M
 { period: 'Feb', amount: 2230000 }, // KES 2.23M
 { period: 'Mar', amount: 1980000 }, // KES 1.98M
 { period: 'Apr', amount: 2560000 }, // KES 2.56M
 { period: 'May', amount: 2120000 }, // KES 2.12M
 { period: 'Jun', amount: 1808000 }, // KES 1.81M
 ],
 serviceData: [
 { category: 'HVAC', count: 324, revenue: 4568000 }, // KES 4.57M
 { category: 'Electrical', count: 298, revenue: 3842000 }, // KES 3.84M
 { category: 'Plumbing', count: 256, revenue: 2894000 }, // KES 2.89M
 { category: 'Appliances', count: 198, revenue: 2238000 }, // KES 2.24M
 { category: 'General Repair', count: 172, revenue: 1526000 }, // KES 1.53M
 ],
 technicianPerformance: [
 { name: 'John Smith', completedJobs: 78, rating: 4.9, revenue: 842000 }, // KES 842K
 { name: 'Sarah Johnson', completedJobs: 72, rating: 4.8, revenue: 789000 }, // KES 789K
 { name: 'Mike Davis', completedJobs: 65, rating: 4.7, revenue: 720000 }, // KES 720K
 { name: 'Emma Wilson', completedJobs: 59, rating: 4.6, revenue: 654000 }, // KES 654K
 { name: 'David Brown', completedJobs: 54, rating: 4.5, revenue: 598000 }, // KES 598K
 ],
 customerMetrics: {
 newCustomers: 156,
 returningCustomers: 89,
 averageJobValue: 18550, // KES 18,550
 },
 };

 const periods = [
 { key: 'week', label: 'This Week' },
 { key: 'month', label: 'This Month' },
 { key: 'quarter', label: 'This Quarter' },
 { key: 'year', label: 'This Year' },
 ];

 useEffect(() => {
 loadAnalyticsData();
 }, [selectedPeriod]);

 const loadAnalyticsData = async () => {
 try {
 setLoading(true);
 // TODO: Replace with actual API call
 // const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`);
 // const data = await response.json();
 
 // Simulate API delay
 setTimeout(() => {
 setAnalyticsData(mockAnalyticsData);
 setLoading(false);
 }, 1000);
 } catch (error) {
 console.error('Error loading analytics data:', error);
 Alert.alert('Error', 'Failed to load analytics data');
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
 {formatKES(analyticsData.overview.totalRevenue)}
 </Text>
 <Text style={styles.overviewLabel}>Total Revenue</Text>
 </View>
 
 <View style={styles.overviewCard}>
 <Text style={styles.overviewValue}>
 {analyticsData.overview.totalServices.toLocaleString()}
 </Text>
 <Text style={styles.overviewLabel}>Total Services</Text>
 </View>
 
 <View style={styles.overviewCard}>
 <Text style={styles.overviewValue}>
 {analyticsData.overview.activeTechnicians}
 </Text>
 <Text style={styles.overviewLabel}>Active Technicians</Text>
 </View>
 
 <View style={styles.overviewCard}>
 <Text style={styles.overviewValue}>
 {analyticsData.overview.customerSatisfaction}/5
 </Text>
 <Text style={styles.overviewLabel}>Customer Rating</Text>
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
 {analyticsData.revenueData.map((item, index) => (
 <View key={index} style={styles.chartBar}>
 <View style={styles.barContainer}>
 <View 
 style={[
 styles.bar, 
 { height: (item.amount / 30000) * 100 }
 ]} 
 />
 </View>
 <Text style={styles.barLabel}>{item.period}</Text>
 <Text style={styles.barValue}>{formatKESAbbreviated(item.amount)}</Text>
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
 
 {analyticsData.serviceData.map((service, index) => (
 <View key={index} style={styles.serviceItem}>
 <View style={styles.serviceInfo}>
 <Text style={styles.serviceName}>{service.category}</Text>
 <Text style={styles.serviceCount}>{service.count} services</Text>
 </View>
 <Text style={styles.serviceRevenue}>
 <Text style={styles.serviceRevenue}>
 {formatKES(service.revenue)}
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
 
 {analyticsData.technicianPerformance.map((tech, index) => (
 <View key={index} style={styles.technicianItem}>
 <View style={styles.technicianRank}>
 <Text style={styles.rankNumber}>{index + 1}</Text>
 </View>
 <View style={styles.technicianInfo}>
 <Text style={styles.technicianName}>{tech.name}</Text>
 <Text style={styles.technicianStats}>
 {tech.completedJobs} jobs * {tech.rating}⭐
 </Text>
 </View>
 <Text style={styles.technicianRevenue}>
 {formatKES(tech.revenue)}
 </Text>
 </View>
 ))}
 </View>

 {/* Customer Metrics */}
 <View style={styles.section}>
 <View style={styles.sectionHeader}>
 <Text style={styles.sectionTitle}>Customer Metrics</Text>
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
 {analyticsData.customerMetrics.newCustomers}
 </Text>
 <Text style={styles.metricLabel}>New Customers</Text>
 </View>
 
 <View style={styles.metricItem}>
 <Text style={styles.metricValue}>
 {analyticsData.customerMetrics.returningCustomers}
 </Text>
 <Text style={styles.metricLabel}>Returning Customers</Text>
 </View>
 
 <View style={styles.metricItem}>
 <Text style={styles.metricValue}>
 {formatKES(analyticsData.customerMetrics.averageJobValue)}
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
