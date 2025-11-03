# QUICKFIX 2-HOUR IMPLEMENTATION SPRINT
**Date:** November 3, 2025 - 04:45 UTC  
**Goal:** Fix ALL critical issues and complete partially implemented features

---

## EXISTING CODE DISCOVERED ✅
1. **Rating System**: COMPLETE backend (routes, controller) - just needs frontend connection
2. **Wallet System**: COMPLETE Screens (WalletScreen.js, EscrowWalletScreen.js) - needs Expo Router integration
3. **Support Contacts**: Needs update to your real details

---

## HOUR 1: CRITICAL FIXES (00:00-60:00)

### Sprint 1A: Connect Existing Features (0-20 mins)
**Objective**: Stop redirects, use existing screens

#### Task 1: Replace Rating Redirect with Real Screen (5 mins)
**File**: `app/rating.tsx`
```typescript
// INSTEAD OF: router.replace('/dashboard/client')
// USE: Import and render existing RatingScreen component
import RatingScreen from '../Screens/RatingScreen'; // Create wrapper if needed
export default RatingScreen;
```
**Test**: Navigate to /rating → Should show rating interface

#### Task 2: Replace Wallet Redirect with Real Screen (5 mins)
**File**: `app/wallet.tsx`
```typescript
// INSTEAD OF: router.replace('/dashboard/client')
// USE: Import existing WalletScreen
import WalletScreen from '../Screens/WalletScreen';
export default WalletScreen;
```
**Test**: Navigate to /wallet → Should show wallet balance

#### Task 3: Update Support Contacts (5 mins)
**File**: `app/support.tsx` (find and update)
```typescript
const SUPPORT = {
  phones: ['0794536984', '0117224394'],
  email: 'engineerjuliusjr47@gmail.com',
  hours: 'Mon-Sat: 8AM-8PM'
};
```
**Test**: Open support → Verify your numbers/email appear

#### Task 4: Deploy Updated Routes (5 mins)
```bash
rm -rf .expo dist-web && npx expo export --platform web --output-dir dist-web --clear
cd dist-web && vercel --prod --yes
```

---

### Sprint 1B: Dashboard Greetings + Terminology (20-40 mins)
**Objective**: Personalize user experience

#### Task 5: Create Greeting Utility (10 mins)
**File**: Create `utils/greetings.ts`
```typescript
export const getGreeting = (user) => {
  const hour = new Date().getHours();
  const createdAt = new Date(user?.createdAt);
  const now = new Date();
  const isNewUser = (now - createdAt) < 300000; // 5 minutes
  
  if (isNewUser) {
    return {
      greeting: `Welcome to QuickFix, ${user.firstName}!`,
      quote: getNewUserQuote(user.role)
    };
  }
  
  let time = '';
  if (hour >= 0 && hour < 12) time = 'Good Morning';
  else if (hour >= 12 && hour < 16) time = 'Good Afternoon';
  else if (hour >= 16 && hour < 22) time = 'Good Evening';
  else time = 'Good Night';
  
  return {
    greeting: `${time}, ${user.firstName}`,
    quote: getQuote(user.role, hour)
  };
};

const getNewUserQuote = (role) => {
  const quotes = {
    client: "Let's find the perfect technician for your needs",
    technician: "Welcome to the QuickFix technician community!",
    admin: "Welcome to QuickFix Admin Dashboard"
  };
  return quotes[role] || '';
};

const getQuote = (role, hour) => {
  const quotes = {
    client: [
      "Find trusted technicians for all your repair needs",
      "Quality service, every time",
      "Your satisfaction is our priority"
    ],
    technician: [
      "Help customers and grow your business today",
      "New job opportunities await",
      "Build your reputation, one job at a time"
    ],
    admin: [
      "Monitor and optimize QuickFix operations",
      "Keep QuickFix running smoothly",
      "Empowering technicians, delighting clients"
    ]
  };
  
  const roleQuotes = quotes[role] || quotes.client;
  return roleQuotes[Math.floor(hour / 8) % roleQuotes.length];
};
```

#### Task 6: Update Client Dashboard (5 mins)
**File**: Find `Screens/ClientDashboard.js` or `app/dashboard/client.tsx`
```typescript
import { getGreeting } from '../utils/greetings';

// Replace "Welcome back!" with:
const { greeting, quote } = getGreeting(user);

// Replace "Active Jobs" with "Active Bookings"
```

#### Task 7: Update All Dashboards (5 mins)
- Client: "Active Jobs" → "Active Bookings"
- Technician: Keep "Active Jobs" (correct)
- Admin: Keep "Active Jobs" (correct)

---

### Sprint 1C: My Bookings Fix (40-60 mins)
**Objective**: Fix loading issue, add post-booking redirect

#### Task 8: Debug My Bookings Loading (10 mins)
**Find**: `Screens/ClientDashboard.js` or equivalent
**Check**:
```typescript
// Look for fetch('/api/bookings') or similar
// Add error handling:
useEffect(() => {
  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/bookings/client');
      if (response.data.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (error) {
      console.error('Load bookings error:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };
  loadBookings();
}, []);
```

#### Task 9: Add Post-Booking Redirect (5 mins)
**File**: `app/booking/redesigned-form.tsx`
```typescript
// After successful booking submission:
if (response.data.success) {
  // CHANGE FROM: router.replace('/dashboard/client')
  // TO: router.replace('/dashboard/client?tab=bookings')
  
  Alert.alert(
    'Booking Submitted!',
    'View your booking in My Bookings',
    [{ text: 'View', onPress: () => router.replace('/dashboard/client?tab=bookings') }]
  );
}
```

#### Task 10: Add Empty State for Bookings (5 mins)
```typescript
{bookings.length === 0 && !loading && (
  <View style={styles.emptyState}>
    <Ionicons name="calendar-outline" size={64} color="#ccc" />
    <Text style={styles.emptyText}>No bookings yet</Text>
    <Button title="Book a Service" onPress={() => router.push('/booking')} />
  </View>
)}
```

---

## HOUR 2: FEATURE IMPLEMENTATIONS (60:00-120:00)

### Sprint 2A: Profile Settings Page (60-80 mins)
**Objective**: Create client profile edit screen

#### Task 11: Create Profile Settings Screen (15 mins)
**File**: Create `app/dashboard/client-settings.tsx`
```typescript
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { useRouter } from 'expo-router';
import apiClient from '../../config/api';

export default function ClientSettings() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await apiClient.put('/auth/profile', formData);
      if (response.data.success) {
        updateUser(response.data.data.user);
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={(text) => setFormData({...formData, firstName: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={(text) => setFormData({...formData, lastName: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        editable={false}
        style={[styles.input, styles.disabled]}
      />
      
      <Pressable 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  disabled: { backgroundColor: '#f5f5f5', color: '#999' },
  button: { backgroundColor: '#0d6efd', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

#### Task 12: Add Settings Link to Client Dashboard (5 mins)
**File**: `Screens/ClientDashboard.js` or `app/dashboard/client.tsx`
```typescript
<Pressable 
  style={styles.settingsButton}
  onPress={() => router.push('/dashboard/client-settings')}
>
  <Ionicons name="settings-outline" size={24} />
  <Text>Settings</Text>
</Pressable>
```

---

### Sprint 2B: Technician Service Selection (80-100 mins)
**Objective**: Add predefined service dropdown to tech registration

#### Task 13: Create Services Constant (5 mins)
**File**: Create `constants/services.ts`
```typescript
export const QUICKFIX_SERVICES = [
  { id: 'plumbing', name: 'Plumbing', icon: 'water' },
  { id: 'electrical', name: 'Electrical', icon: 'flash' },
  { id: 'appliance', name: 'Appliance Repair', icon: 'construct' },
  { id: 'automotive', name: 'Automotive', icon: 'car' },
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles' },
  { id: 'hvac', name: 'HVAC', icon: 'thermometer' },
  { id: 'carpentry', name: 'Carpentry', icon: 'hammer' },
  { id: 'painting', name: 'Painting', icon: 'color-palette' },
  { id: 'masonry', name: 'Masonry', icon: 'cube' },
  { id: 'welding', name: 'Welding', icon: 'flame' },
  { id: 'landscaping', name: 'Landscaping', icon: 'leaf' },
  { id: 'pest-control', name: 'Pest Control', icon: 'bug' },
];
```

#### Task 14: Add Multi-Select to Registration (10 mins)
**File**: `app/auth/register.tsx` (find technician section)
```typescript
import { QUICKFIX_SERVICES } from '../../constants/services';

// Add state:
const [selectedServices, setSelectedServices] = useState([]);

// Add to form (only for technician role):
{role === 'technician' && (
  <View style={styles.servicesSection}>
    <Text style={styles.label}>Select Your Services (at least 1)</Text>
    {QUICKFIX_SERVICES.map(service => (
      <Pressable
        key={service.id}
        style={[
          styles.serviceItem,
          selectedServices.includes(service.id) && styles.serviceSelected
        ]}
        onPress={() => {
          setSelectedServices(prev => 
            prev.includes(service.id)
              ? prev.filter(s => s !== service.id)
              : [...prev, service.id]
          );
        }}
      >
        <Ionicons name={service.icon} size={20} />
        <Text>{service.name}</Text>
        {selectedServices.includes(service.id) && (
          <Ionicons name="checkmark-circle" size={20} color="green" />
        )}
      </Pressable>
    ))}
  </View>
)}

// Validation:
if (role === 'technician' && selectedServices.length === 0) {
  Alert.alert('Error', 'Please select at least one service');
  return;
}

// Send with registration:
const registrationData = {
  ...formData,
  skills: role === 'technician' ? selectedServices : undefined
};
```

---

### Sprint 2C: Performance + Cleanup (100-120 mins)
**Objective**: Remove emojis, optimize loading

#### Task 15: Find and Remove Emojis (10 mins)
```bash
# Search for common emojis:
grep -r "🔧\|⚡\|📱\|✅\|⚠️\|🚀\|💡" app/ Screens/ --include="*.{js,jsx,ts,tsx}"

# Replace with:
# 🔧 → <Ionicons name="construct" />
# ⚡ → <Ionicons name="flash" />
# 📱 → <Ionicons name="phone-portrait" />
# ✅ → <Ionicons name="checkmark-circle" />
# ⚠️ → <Ionicons name="warning" />
```

#### Task 16: Add Loading Optimizations (10 mins)
**Files**: All dashboard screens
```typescript
// Add skeleton loader instead of spinner:
{loading ? (
  <View style={styles.skeleton}>
    <View style={styles.skeletonLine} />
    <View style={styles.skeletonLine} />
    <View style={styles.skeletonLine} />
  </View>
) : (
  // actual content
)}

// Cache API responses:
const [cache, setCache] = useState({});
const cacheTime = 5 * 60 * 1000; // 5 minutes

// Before API call:
if (cache.bookings && (Date.now() - cache.bookingsTime) < cacheTime) {
  setBookings(cache.bookings);
  return;
}
```

---

## FINAL DEPLOYMENT (120:00+)

### Task 17: Rebuild & Deploy Everything
```bash
cd /home/injinia47/Desktop/PROJO/Projo

# Clean build
rm -rf .expo dist-web node_modules/.cache

# Rebuild web
npx expo export --platform web --output-dir dist-web --clear

# Deploy
cd dist-web && vercel --prod --yes
```

### Task 18: Test Critical Flows
1. ✅ Register as client → Check greeting
2. ✅ Register as technician → Select services
3. ✅ Create booking → Verify redirect to My Bookings
4. ✅ Navigate to /rating → See rating interface
5. ✅ Navigate to /wallet → See wallet balance
6. ✅ Open support → Verify your contact info
7. ✅ Check technician dashboard → No CORS errors

---

## FILES TO MODIFY (Summary)

### New Files to Create:
1. `utils/greetings.ts` - Greeting logic
2. `constants/services.ts` - Service list
3. `app/dashboard/client-settings.tsx` - Profile settings

### Files to Modify:
1. `app/rating.tsx` - Use existing RatingScreen
2. `app/wallet.tsx` - Use existing WalletScreen
3. `app/support.tsx` - Update contacts
4. `Screens/ClientDashboard.js` - Greetings, terminology, settings link
5. `app/dashboard/technician.tsx` - Verify greeting
6. `app/booking/redesigned-form.tsx` - Post-booking redirect
7. `app/auth/register.tsx` - Service selection for technicians
8. All screens - Remove emojis, add loading optimizations

---

## PRIORITY ORDER (If Time Constrained)

### Must Do (30 mins):
1. ✅ Connect wallet & rating screens
2. ✅ Update support contacts
3. ✅ Deploy

### Should Do (30 mins):
4. Add greetings to dashboards
5. Fix "Active Jobs" → "Active Bookings"
6. Fix My Bookings loading

### Nice to Have (60 mins):
7. Profile settings page
8. Technician service selection
9. Remove emojis
10. Performance optimizations

---

**Last Updated:** November 3, 2025 - 04:50 UTC  
**Status:** Ready for implementation  
**Estimated Time:** 2 hours (can be parallelized)
