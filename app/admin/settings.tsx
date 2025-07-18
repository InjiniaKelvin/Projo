import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface SystemSettings {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  business: {
    businessName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    operatingHours: string;
  };
  pricing: {
    baseServiceFee: number;
    emergencyMultiplier: number;
    taxRate: number;
  };
  platform: {
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
    autoApproveTechnicians: boolean;
    maxServiceRadius: number;
  };
}

export default function SystemSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mock settings data
  const mockSettings: SystemSettings = {
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    },
    business: {
      businessName: 'QuickFix Services',
      contactEmail: 'contact@quickfix.com',
      contactPhone: '+1-800-QUICKFIX',
      address: '123 Service Street, Repair City, RC 12345',
      operatingHours: '8:00 AM - 8:00 PM (Mon-Fri), 9:00 AM - 5:00 PM (Sat-Sun)',
    },
    pricing: {
      baseServiceFee: 50.00,
      emergencyMultiplier: 1.5,
      taxRate: 8.5,
    },
    platform: {
      maintenanceMode: false,
      allowNewRegistrations: true,
      autoApproveTechnicians: false,
      maxServiceRadius: 50,
    },
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/settings');
      // const data = await response.json();
      
      // Simulate API delay
      setTimeout(() => {
        setSettings(mockSettings);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // TODO: Replace with actual API call
      // await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      // Simulate API delay
      setTimeout(() => {
        setSaving(false);
        Alert.alert('Success', 'Settings saved successfully!');
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
      setSaving(false);
    }
  };

  const updateNotificationSetting = (key: keyof SystemSettings['notifications'], value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const updateBusinessSetting = (key: keyof SystemSettings['business'], value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      business: {
        ...settings.business,
        [key]: value,
      },
    });
  };

  const updatePricingSetting = (key: keyof SystemSettings['pricing'], value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      pricing: {
        ...settings.pricing,
        [key]: value,
      },
    });
  };

  const updatePlatformSetting = (key: keyof SystemSettings['platform'], value: boolean | number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      platform: {
        ...settings.platform,
        [key]: value,
      },
    });
  };

  if (loading || !settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading settings...</Text>
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
        <Text style={styles.headerTitle}>System Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Switch
              value={settings.notifications.emailNotifications}
              onValueChange={(value) => updateNotificationSetting('emailNotifications', value)}
              trackColor={{ false: '#ddd', true: '#0d6efd' }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={settings.notifications.pushNotifications}
              onValueChange={(value) => updateNotificationSetting('pushNotifications', value)}
              trackColor={{ false: '#ddd', true: '#0d6efd' }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>SMS Notifications</Text>
            <Switch
              value={settings.notifications.smsNotifications}
              onValueChange={(value) => updateNotificationSetting('smsNotifications', value)}
              trackColor={{ false: '#ddd', true: '#0d6efd' }}
            />
          </View>
        </View>

        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Name</Text>
            <TextInput
              style={styles.textInput}
              value={settings.business.businessName}
              onChangeText={(value) => updateBusinessSetting('businessName', value)}
              placeholder="Enter business name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Email</Text>
            <TextInput
              style={styles.textInput}
              value={settings.business.contactEmail}
              onChangeText={(value) => updateBusinessSetting('contactEmail', value)}
              placeholder="Enter contact email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Phone</Text>
            <TextInput
              style={styles.textInput}
              value={settings.business.contactPhone}
              onChangeText={(value) => updateBusinessSetting('contactPhone', value)}
              placeholder="Enter contact phone"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={settings.business.address}
              onChangeText={(value) => updateBusinessSetting('address', value)}
              placeholder="Enter business address"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Operating Hours</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={settings.business.operatingHours}
              onChangeText={(value) => updateBusinessSetting('operatingHours', value)}
              placeholder="Enter operating hours"
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Pricing Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Base Service Fee ($)</Text>
            <TextInput
              style={styles.textInput}
              value={settings.pricing.baseServiceFee.toString()}
              onChangeText={(value) => updatePricingSetting('baseServiceFee', parseFloat(value) || 0)}
              placeholder="Enter base service fee"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Emergency Multiplier</Text>
            <TextInput
              style={styles.textInput}
              value={settings.pricing.emergencyMultiplier.toString()}
              onChangeText={(value) => updatePricingSetting('emergencyMultiplier', parseFloat(value) || 1)}
              placeholder="Enter emergency multiplier"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tax Rate (%)</Text>
            <TextInput
              style={styles.textInput}
              value={settings.pricing.taxRate.toString()}
              onChangeText={(value) => updatePricingSetting('taxRate', parseFloat(value) || 0)}
              placeholder="Enter tax rate"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Platform Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Maintenance Mode</Text>
            <Switch
              value={settings.platform.maintenanceMode}
              onValueChange={(value) => updatePlatformSetting('maintenanceMode', value)}
              trackColor={{ false: '#ddd', true: '#dc3545' }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Allow New Registrations</Text>
            <Switch
              value={settings.platform.allowNewRegistrations}
              onValueChange={(value) => updatePlatformSetting('allowNewRegistrations', value)}
              trackColor={{ false: '#ddd', true: '#0d6efd' }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-Approve Technicians</Text>
            <Switch
              value={settings.platform.autoApproveTechnicians}
              onValueChange={(value) => updatePlatformSetting('autoApproveTechnicians', value)}
              trackColor={{ false: '#ddd', true: '#0d6efd' }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Max Service Radius (miles)</Text>
            <TextInput
              style={styles.textInput}
              value={settings.platform.maxServiceRadius.toString()}
              onChangeText={(value) => updatePlatformSetting('maxServiceRadius', parseInt(value) || 0)}
              placeholder="Enter max service radius"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Settings</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              Alert.alert(
                'Reset Settings',
                'Are you sure you want to reset all settings to default values?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                      setSettings(mockSettings);
                      Alert.alert('Success', 'Settings reset to default values');
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    padding: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    paddingBottom: 20,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  resetButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
