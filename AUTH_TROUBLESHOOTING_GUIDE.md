# [CRITICAL] Authentication Context Troubleshooting Guide

## [COMPLETED] **FIXES APPLIED**

### **1. Context Import Fix**
- [FAILED] **Was using**: `import { useAuth } from '../../contexts/AuthContext';`
- [COMPLETED] **Now using**: `import { useAuth } from '../../contexts/SimpleAuthContext';`

### **2. Navigation Structure Fix**
- [COMPLETED] **Added**: `/app/booking/_layout.tsx` for proper route handling
- [COMPLETED] **Updated**: Root layout to include booking routes
- [COMPLETED] **Added**: Debug logging for auth context

### **3. Error Prevention**
- [COMPLETED] **Added**: Component error boundaries
- [COMPLETED] **Fixed**: useEffect dependency arrays
- [COMPLETED] **Cleaned**: Unused imports

---

## **TESTING STEPS**

### **Test 1: Emergency Services**
1. Navigate to Dashboard
2. Click "Emergency Services" button
3. **Expected**: Emergency services screen loads
4. **Check console**: Should see "[CRITICAL] EmergencyServicesScreen: Component mounted"

### **Test 2: Regular Services**
1. Navigate to Dashboard 
2. Click "Regular Services" button
3. **Expected**: Regular services screen loads
4. **Check console**: Should see " RegularServicesScreen: Component mounted"

### **Test 3: Authentication Context**
1. Open browser developer tools
2. Check console for auth logs
3. **Expected**: "User context: Available" (if logged in)

---

## **IF STILL HAVING ISSUES**

### **Error: "useAuth must be used within an AuthProvider"**

**Possible Causes:**
1. **Route not wrapped**: Booking routes not properly nested
2. **Context mismatch**: Using wrong auth context
3. **Navigation timing**: Context not ready during route transition

**Solutions:**
```bash
# 1. Clear browser cache and reload
Ctrl+Shift+R (or Cmd+Shift+R on Mac)

# 2. Restart Expo dev server
npm start -- --clear

# 3. Check console for detailed error info
F12 → Console tab → Look for auth-related errors
```

### **Error: "Cannot read properties of undefined"**

**Solution:**
```tsx
// Add null checks in components
const { user } = useAuth() || {};
if (!user) {
 return <LoadingScreen />;
}
```

### **Navigation Issues**

**Check these files:**
- `/app/_layout.tsx` - Should include booking routes
- `/app/booking/_layout.tsx` - Should exist and be properly configured
- Browser network tab - Check for failed route requests

---

## [MOBILE] **COMPONENT STATUS**

### [COMPLETED] **WORKING COMPONENTS**
- `emergency-services.tsx` - Emergency service selection
- `regular-services.tsx` - Regular service browsing 
- `emergency-booking-details.tsx` - Emergency booking form
- `smart-details.tsx` - Regular booking form
- `tracking.tsx` - Booking status tracking

### **AUTHENTICATION FLOW**
```
App Startup
├── RootLayout (AuthProvider wraps all)
├── Dashboard (useAuth works)
├── Booking Routes (useAuth works)
└── Service Screens (useAuth works)
```

---

## [TARGET] **EXPECTED BEHAVIOR**

### **When Working Correctly:**
1. **Dashboard loads** - No auth errors
2. **Service buttons work** - Navigate to service screens
3. **Service screens load** - Show service listings
4. **Booking forms work** - Can fill and submit
5. **Console shows** - Auth debug messages

### **Success Indicators:**
- [COMPLETED] No "useAuth must be used within AuthProvider" errors
- [COMPLETED] Service screens display properly
- [COMPLETED] User context is available in all components
- [COMPLETED] Console shows component mount messages
- [COMPLETED] Booking submission works

---

## [LAUNCH] **NEXT STEPS AFTER FIXING AUTH**

1. **Test Emergency Booking Flow**
2. **Test Regular Booking Flow** 
3. **Verify Backend Submission**
4. **Check Booking Tracking**
5. **Test User Authentication**

**[SUCCESS] Once auth context is working, all booking features should be fully functional!**
