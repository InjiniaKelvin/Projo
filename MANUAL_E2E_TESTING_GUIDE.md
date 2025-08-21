# 📱 Manual E2E Testing Guide for Projo Booking System

## 🎯 Test Scenarios Overview
**Status**: Ready for Manual Testing ✅  
**Backend**: Online (Port 3000) ✅  
**Metro Bundler**: Running ✅  
**Service ID Generator**: Working ✅  

---

## 📋 Pre-Test Setup

### 1. Environment Check
- ✅ Backend server running on `http://localhost:3000`
- ✅ Metro bundler serving React Native app
- ✅ QR code available for device scanning
- ✅ Service ID generation validated

### 2. Required Test Devices
- **Option A**: Physical Android/iOS device with Expo Go app
- **Option B**: Android Studio emulator
- **Option C**: iOS Simulator (Mac only)
- **Option D**: Web browser (for web version testing)

---

## 🧪 E2E Test Scenarios

### **Test 1: Complete Booking Flow**
**Objective**: Validate end-to-end booking creation

**Steps**:
1. Open app via QR code or emulator
2. Navigate to booking section
3. Fill out booking form:
   - Customer Name: "John Doe"
   - Phone: "0712345678"
   - Service Type: "Plumbing"
   - Mark as Emergency: Yes
4. Submit booking
5. **Expected**: Service ID generated with format `E[NAME][PHONE][TIMESTAMP]Q`
6. **Verify**: Booking appears in bookings list

**Success Criteria**:
- ✅ Form validation works
- ✅ Emergency booking creates ID starting with "E"
- ✅ Booking saved and visible
- ✅ No console errors

---

### **Test 2: Service ID Validation**
**Objective**: Verify service ID generation patterns

**Test Cases**:
| Type | Name | Phone | Expected Pattern |
|------|------|-------|------------------|
| Emergency | Jane Smith | 0787654321 | E[JAS][7876][timestamp]Q |
| Regular | Bob Wilson | 0798765432 | R[BOW][9876][timestamp]Q |
| Emergency | Alice | 254712345678 | E[ALI][1234][timestamp]Q |

**Validation**:
1. Create each booking type
2. Check generated service IDs
3. Verify pattern matches expected format
4. Ensure uniqueness across multiple bookings

---

### **Test 3: Form Validation**
**Objective**: Test input validation and error handling

**Test Cases**:
1. **Empty Name**: Should show validation error
2. **Invalid Phone**: Test with "123" - should show error
3. **Missing Service Type**: Should prevent submission
4. **Valid Data**: Should allow submission

**Steps**:
1. Try submitting form with each invalid case
2. Verify error messages appear
3. Test that valid data submits successfully

---

### **Test 4: Real-time Booking Tracking**
**Objective**: Validate booking status updates

**Steps**:
1. Create a new booking
2. Navigate to "My Bookings" section
3. Check booking status display
4. Verify booking details are correct
5. Test any status update functionality

**Expected Behavior**:
- Booking appears immediately after creation
- Status shows correctly (Pending/Confirmed/In Progress)
- All booking details match form input

---

### **Test 5: Emergency vs Regular Booking**
**Objective**: Verify different booking types work correctly

**Emergency Booking**:
1. Toggle "Emergency" switch ON
2. Submit booking
3. Verify service ID starts with "E"
4. Check if emergency indicator shows in booking list

**Regular Booking**:
1. Keep "Emergency" switch OFF  
2. Submit booking
3. Verify service ID starts with "R"
4. Confirm regular priority display

---

### **Test 6: Navigation and UI Interaction**
**Objective**: Test app navigation and user interface

**Navigation Tests**:
1. **Tab Navigation**: Test all bottom tabs work
2. **Back Navigation**: Test back buttons function
3. **Form Navigation**: Test moving between form fields
4. **Screen Transitions**: Verify smooth transitions

**UI Interaction Tests**:
1. **Button Presses**: All buttons respond
2. **Form Inputs**: Text fields accept input
3. **Dropdowns**: Service type selector works
4. **Toggles**: Emergency switch functions

---

### **Test 7: Error Handling and Edge Cases**
**Objective**: Test app behavior under error conditions

**Network Tests**:
1. **Backend Offline**: Stop backend, try booking
2. **Slow Network**: Test with poor connection
3. **Network Recovery**: Restart backend, retry failed booking

**Data Tests**:
1. **Special Characters**: Test names with accents/symbols
2. **Long Names**: Test very long customer names
3. **International Numbers**: Test +254 format
4. **Edge Phone Numbers**: Test minimum/maximum length

---

## 📊 Test Results Template

```
## Test Execution Results

**Date**: [Test Date]
**Tester**: [Your Name]
**Device**: [Device/Emulator Used]
**App Version**: [Version Number]

### Test Results Summary
- [ ] Test 1: Complete Booking Flow
- [ ] Test 2: Service ID Validation  
- [ ] Test 3: Form Validation
- [ ] Test 4: Real-time Tracking
- [ ] Test 5: Emergency vs Regular
- [ ] Test 6: Navigation & UI
- [ ] Test 7: Error Handling

### Issues Found
1. [Issue description]
   - **Severity**: High/Medium/Low
   - **Steps to Reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]

### Performance Notes
- App startup time: [X seconds]
- Form submission time: [X seconds]
- Navigation responsiveness: [Good/Fair/Poor]

### Recommendations
- [Improvement suggestions]
```

---

## 🚀 Quick Test Commands

**Backend Health Check**:
```bash
curl http://localhost:3000/health
```

**Service ID Test**:
```bash
node test-booking-logic.js
```

**Start Development Environment**:
```bash
# Terminal 1: Backend
npm run start-backend

# Terminal 2: React Native
npx expo start
```

---

## 📝 Testing Notes

- **QR Code Ready**: Scan with Expo Go app for instant testing
- **Web Testing**: Available via browser if needed
- **Service ID**: Working perfectly with dual parameter support
- **Backend API**: All endpoints operational
- **Real-time Features**: WebSocket connections available

**Next Steps**: Choose your preferred testing method and run through the scenarios above to validate the complete booking system functionality!
