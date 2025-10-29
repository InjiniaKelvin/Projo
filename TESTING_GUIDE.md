# QUICK MANUAL TESTING GUIDE - Technician Implementation

## Pre-requisites
[COMPLETED] Backend running on port 5000 (node server.js) 
[COMPLETED] MongoDB connected 

## Option 1: Run Automated Tests

```bash
# Run comprehensive test suite
node test-technician-implementation.js
```

This will test all 15 scenarios including:
- User registration (client + technician)
- Job creation, acceptance, rejection
- Job start, completion
- Location updates
- Availability updates 
- Earnings retrieval
- Withdrawal requests
- Auth & role validation

---

## Option 2: Manual API Testing with curl

### 1. Register Technician
```bash
curl -X POST http://localhost:5000/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{
 "name": "John Technician",
 "email": "tech@test.com",
 "password": "Test@1234",
 "phone": "+254700000001",
 "role": "technician",
 "skills": ["plumbing", "electrical"],
 "location": {
 "latitude": -1.2921,
 "longitude": 36.8219,
 "estate": "Westlands"
 }
 }'
```

**Save the token from response!**

### 2. Register Client
```bash
curl -X POST http://localhost:5000/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{
 "name": "Jane Client",
 "email": "client@test.com",
 "password": "Test@1234",
 "phone": "+254700000002",
 "role": "client"
 }'
```

**Save the client token!**

### 3. Create Booking (as Client)
```bash
curl -X POST http://localhost:5000/api/bookings \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
 -d '{
 "serviceType": "plumbing",
 "serviceName": "Pipe Repair",
 "problemDescription": "Leaking pipe",
 "urgency": "emergency",
 "location": {
 "latitude": -1.2921,
 "longitude": 36.8219,
 "estate": "Westlands"
 },
 "preferredDate": "2025-10-16",
 "preferredTimeSlot": "emergency-asap",
 "price": 2500
 }'
```

**Save the booking ID!**

### 4. Get Available Jobs (as Technician)
```bash
curl -X GET http://localhost:5000/api/technician/available-jobs \
 -H "Authorization: Bearer YOUR_TECH_TOKEN"
```

### 5. Accept Job (as Technician)
```bash
curl -X POST http://localhost:5000/api/technician/accept-job/BOOKING_ID \
 -H "Authorization: Bearer YOUR_TECH_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{}'
```

### 6. Get My Jobs (as Technician)
```bash
curl -X GET http://localhost:5000/api/technician/my-jobs \
 -H "Authorization: Bearer YOUR_TECH_TOKEN"
```

### 7. Start Job (as Technician)
```bash
curl -X POST http://localhost:5000/api/technician/start-job/BOOKING_ID \
 -H "Authorization: Bearer YOUR_TECH_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{}'
```

### 8. Update Location (as Technician)
```bash
curl -X POST http://localhost:5000/api/technician/location \
 -H "Authorization: Bearer YOUR_TECH_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
 "latitude": -1.2921,
 "longitude": 36.8219,
 "estate": "Westlands"
 }'
```

### 9. Update Availability (as Technician)
```bash
curl -X PUT http://localhost:5000/api/technician/availability \
 -H "Authorization: Bearer YOUR_TECH_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
 "available": true
 }'
```

### 10. Complete Job (as Technician)
```bash
curl -X POST http://localhost:5000/api/technician/complete-job/BOOKING_ID \
 -H "Authorization: Bearer YOUR_TECH_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
 "completionNotes": "Job completed successfully"
 }'
```

### 11. Get Earnings (as Technician)
```bash
curl -X GET http://localhost:5000/api/technician/earnings \
 -H "Authorization: Bearer YOUR_TECH_TOKEN"
```

### 12. Request Withdrawal (as Technician)
```bash
curl -X POST http://localhost:5000/api/technician/withdraw \
 -H "Authorization: Bearer YOUR_TECH_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
 "amount": 1000,
 "mpesaNumber": "254700000001",
 "method": "mpesa"
 }'
```

---

## Option 3: Test Frontend Integration

### Start Expo App
```bash
# In a new terminal
npx expo start
```

### Test Flow:
1. **Login as Technician**
 - Email: tech@test.com
 - Password: Test@1234

2. **Navigate to Browse Jobs**
 - Tap "Technician" tab
 - Tap "Browse Jobs"
 - Should see available jobs from API

3. **Accept a Job**
 - Tap "Accept Job" button
 - Confirm acceptance
 - Job should move to "My Jobs"

4. **View My Jobs**
 - Tap "My Jobs" tab
 - Should see accepted jobs

5. **View Job Details**
 - Tap on a job
 - Should see full job details
 - Test "Call Client" button
 - Test "Open in Maps" button

6. **Start Job**
 - Tap "Start Job" button
 - Confirm
 - Status should change to "In Progress"

7. **Upload Photos & Complete**
 - Tap "Take Photo" or "Choose from Gallery"
 - Add photos
 - Add completion notes
 - Tap "Complete Job"
 - Job should be marked as completed

---

## Expected Results

### [COMPLETED] Success Indicators:
- All API calls return 200/201 status
- Tokens are valid and work for authentication
- Jobs appear in available jobs list
- Accepted jobs move to "My Jobs"
- Job statuses update correctly (pending → accepted → in_progress → completed)
- Location and availability updates work
- Earnings are calculated correctly
- Frontend shows real data from backend

### [FAILED] Common Issues:
- 401 Unauthorized: Check token is valid and included in header
- 403 Forbidden: Check user role is 'technician'
- 404 Not Found: Check booking ID exists
- 500 Server Error: Check backend logs for details

---

## Quick Test Command

Run this to test everything automatically:
```bash
node test-technician-implementation.js
```

**Expected output:** 15/15 tests passed [COMPLETED]

---

## Verify Database Changes

```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/quickfix

# Or MongoDB Atlas
mongo "mongodb+srv://cluster0quickfix.p5exnhe.mongodb.net/quickfix" --username YOUR_USERNAME

# Check technician data
db.users.find({ role: 'technician' })

# Check bookings
db.bookings.find({ technicianId: { $exists: true } })

# Check transactions
db.transactions.find({ type: 'withdrawal' })
```

---

## Need Help?

1. **Check backend logs:** Look at server console output
2. **Check test output:** Run `node test-technician-implementation.js`
3. **Check MongoDB:** Verify data is being saved
4. **Check network:** Use browser DevTools to inspect API calls

---

## Next Steps After Testing

If all tests pass:
```bash
# Stage changes
git add -A

# Commit
git commit -m "feat: Implement complete technician dashboard with 11 API endpoints"

# Push to GitHub
git push origin technician-dashboard-implementation
```

---

**Happy Testing! [LAUNCH]**
