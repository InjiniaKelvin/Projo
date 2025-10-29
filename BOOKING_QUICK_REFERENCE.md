# BOOKING SYSTEM - QUICK REFERENCE

## TESTING THE BOOKING FLOW

### Option 1: Automated Test
```bash
node test-complete-booking-flow.js
```

This will:
1. Register a new user with unique credentials
2. Login and get JWT token
3. Create a booking with authentication
4. Verify booking was saved to database

### Option 2: Manual Test via Web App

1. **Start Backend**
 ```bash
 npm run server
 ```
 Backend should be running on: http://localhost:5000

2. **Start Frontend**
 ```bash
 npm run web
 ```
 Frontend should be running on: http://localhost:8081

3. **Register/Login**
 - Navigate to login/register page
 - Create account or login with existing credentials
 - Ensure you see the dashboard

4. **Create Booking**
 - Navigate to Services → Select a service
 - Click "Book Now"
 - Fill out all required fields:
 * Your Details (auto-populated from profile)
 * Service Type & Description
 * Location (Constituency, Ward, Road)
 * Preferred Date & Time
 - Click "Submit Booking"
 - You should see success message with Booking ID

### Option 3: API Testing with curl

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{
 "firstName": "Test",
 "lastName": "User",
 "email": "test@example.com",
 "phoneNumber": "0712345678",
 "password": "Test123!",
 "userType": "client"
 }'

# 2. Login (save the token from response)
curl -X POST http://localhost:5000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{
 "email": "test@example.com",
 "password": "Test123!"
 }'

# 3. Create Booking (replace YOUR_TOKEN with actual token)
curl -X POST http://localhost:5000/api/bookings-redesigned/redesigned \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_TOKEN" \
 -d '{
 "clientName": "Test User",
 "clientPhone": "0712345678",
 "clientEmail": "test@example.com",
 "serviceType": "plumbing",
 "serviceDescription": "Fix leaking pipe",
 "urgency": "normal",
 "location": {
 "constituency": "Westlands",
 "ward": "Kitisuru",
 "road": "Spring Valley Road",
 "description": "Green building, Unit 5B",
 "landmarks": "Near Village Market"
 },
 "preferredDate": "2025-10-15",
 "preferredTimeSlot": "10:00-12:00",
 "specialRequirements": ""
 }'
```

---

## KEY FILES MODIFIED

### Frontend
- `app/booking/details.tsx` - Main booking form component
 * Fixed API endpoint URL (port 5000)
 * Added authentication token
 * Fixed useEffect dependencies
 * Removed text nodes outside Text components

### Backend (No changes needed)
- `backend/routes/bookingRedesigned.js` - Booking routes
- `backend/controllers/bookingController.js` - Booking logic
- Running on port 5000

---

## COMMON ISSUES & SOLUTIONS

### Issue: "401 Unauthorized"
**Solution:** Ensure token is being sent in Authorization header
```typescript
headers: {
 'Authorization': `Bearer ${token}`
}
```

### Issue: "Maximum update depth exceeded"
**Solution:** Use primitive dependencies in useEffect
```typescript
// WRONG
useEffect(() => { ... }, [user, serviceData]);

// CORRECT
useEffect(() => { ... }, [user?.firstName, user?.phoneNumber]);
```

### Issue: "Unexpected text node in View"
**Solution:** Wrap all text/emojis in Text component
```tsx
<!-- WRONG -->
<View>
 Some text
</View>

<!-- CORRECT -->
<View>
 <Text>Some text</Text>
</View>
```

### Issue: "Connection refused"
**Solution:** Check backend is running on correct port
```bash
# Check backend status
curl http://localhost:5000/health

# Should return:
# {"success":true,"message":"QuickFix API is running",...}
```

---

## API ENDPOINTS

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login and get token

### Bookings
- POST `/api/bookings-redesigned/redesigned` - Create booking (requires auth)
- GET `/api/bookings-redesigned/:bookingId` - Get single booking
- GET `/api/bookings-redesigned/phone/:phoneNumber` - Get user bookings

### Health Check
- GET `/health` - Check server status
- GET `/api/health` - Check API status

---

## ENVIRONMENT

### Required Services
1. **Backend Server** - Port 5000
2. **MongoDB Atlas** - Cloud database
3. **Frontend (Expo Web)** - Port 8081

### Environment Variables
```env
PORT=5000
MONGO_URI=mongodb+srv://ENG_Kelvin:QuickFix%402025@cluster0quickfix...
JWT_SECRET=your-secret-key
NODE_ENV=development
```

---

## SUCCESS INDICATORS

When booking works correctly, you should see:

1. **Frontend Console:**
 - "Starting booking submission..."
 - "Form validation passed"
 - "Booking submitted successfully!"
 - "Booking ID: QF..."

2. **Backend Console:**
 - "POST /api/bookings-redesigned/redesigned 200"
 - No 401 or 500 errors

3. **User Experience:**
 - Success overlay with booking receipt
 - Booking ID displayed
 - Redirect to "My Bookings" page after 3 seconds

4. **Database:**
 - New booking document created
 - Status: "submitted"
 - All fields populated correctly

---

## NEXT STEPS

1. **Test all service types** (plumbing, electrical, etc.)
2. **Test with different locations** (various constituencies/wards)
3. **Test emergency bookings** (emergency time slots)
4. **Test validation** (try submitting with missing fields)
5. **Monitor for errors** (check console for any warnings)

---

## SUPPORT

If issues persist:
1. Check `BOOKING_SUBMISSION_FIX_COMPLETE.md` for detailed documentation
2. Run `node test-complete-booking-flow.js` to verify system
3. Check backend logs for specific error messages
4. Verify MongoDB Atlas connection is active

**Last Updated:** October 13, 2025 
**Status:** Fully Operational
