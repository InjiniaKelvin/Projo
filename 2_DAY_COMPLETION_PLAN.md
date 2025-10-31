# QUICKFIX - 2 DAY COMPLETION PLAN
Date: October 31 - November 1, 2025
Goal: Complete ALL essential features for production launch

==================================================================
## STRATEGY: COMBINED TASK EXECUTION
==================================================================

Combine related tasks into 8 major sprints across 2 days.
Each sprint = 3-4 hours of focused work.
Total: 16 working hours per day = 32 hours.

==================================================================
## DAY 1 (October 31) - BACKEND + INTEGRATIONS
==================================================================

### SPRINT 1: PAYMENT SYSTEM [3 hours] - 8:00 AM - 11:00 AM
**Combines:** P0-4 (IntaSend Test) + P0-5 (Payment Frontend) + P0-1 (Admin Settings Payment Config)

**Tasks:**
1. Test IntaSend payment integration
   - Start backend: `node server.js`
   - Run: `node test-stk-working.js`
   - Verify STK push on +254794536984
   - Check database updates
   - Test webhook callbacks

2. Connect payment frontend screens
   - Fix `app/components/PaymentScreen.tsx` API calls
   - Fix `app/booking/payment.tsx` flow
   - Test M-Pesa end-to-end
   - Handle payment failures
   - Show payment receipts

3. Connect admin payment settings
   - Fix `app/admin/settings.tsx` lines 81, 100
   - Connect to `/api/admin/pricing/update`
   - Test pricing updates

**Acceptance:** Full payment flow works from booking → STK → confirmation → receipt

**Files:**
- `backend/services/IntaSendService.js`
- `app/components/PaymentScreen.tsx`
- `app/components/PaymentScreen.web.tsx`
- `app/booking/payment.tsx`
- `app/admin/settings.tsx`

---

### SPRINT 2: ADMIN DASHBOARD INTEGRATION [2.5 hours] - 11:00 AM - 1:30 PM
**Combines:** P0-1 (Admin APIs) + P2-12 (Analytics)

**Tasks:**
1. Connect admin analytics
   - Fix `app/admin/analytics.tsx` lines 133, 164
   - Connect to `/api/admin/dashboard`
   - Add export functionality
   - Add basic charts (revenue, bookings, users)

2. Connect admin technician management
   - Fix `app/admin/technicians.tsx` lines 76, 108, 131
   - Connect approve/reject to `/api/admin/users/:id/verify`
   - Test technician verification workflow

3. Connect admin inventory
   - Fix `app/admin/inventory.tsx` line 110
   - Connect to `/api/services` CRUD
   - Test service creation/editing/deletion

**Acceptance:** All admin screens functional, no mock data

**Files:**
- `app/admin/analytics.tsx`
- `app/admin/technicians.tsx`
- `app/admin/inventory.tsx`
- `backend/routes/admin.js`

---

### SPRINT 3: REAL-TIME NOTIFICATIONS [3 hours] - 2:00 PM - 5:00 PM
**Combines:** P1-6 (In-App Notifications) + P2-11 (Email Notifications)

**Tasks:**
1. Test notification backend routes
   - Verify all `/api/notifications` endpoints work
   - Test notification creation on events

2. Connect NotificationCenter to WebSocket
   - Real-time notification delivery
   - Add notification badge to dashboards
   - Mark as read functionality

3. Implement notification triggers
   - Booking created → notify technician
   - Technician assigned → notify client
   - Job started → notify client
   - Job completed → notify both
   - Payment received → notify both
   - Rating submitted → notify technician

4. Add Expo push notifications
   - Configure push tokens
   - Send push on critical events
   - Handle notification tap navigation

5. Set up email notifications (basic)
   - Create Gmail account: quickfix.notifications@gmail.com
   - Generate app password
   - Update .env
   - Send booking confirmations
   - Send payment receipts

**Acceptance:** Real-time notifications work, email confirmations sent

**Files:**
- `backend/routes/notifications.js`
- `backend/models/Notification.js`
- `app/components/NotificationCenter.tsx`
- `backend/services/NotificationService.js`
- `.env`

---

### SPRINT 4: CHAT SYSTEM [2.5 hours] - 5:00 PM - 7:30 PM
**Combines:** P1-8 (Chat) + Related WebSocket

**Tasks:**
1. Test chat backend routes
   - Verify `/api/chat` endpoints
   - Test message creation/retrieval

2. Connect ChatScreen to backend
   - Replace mock data with API calls
   - Implement real-time messaging via WebSocket
   - Add typing indicators
   - Show unread count

3. Add message notifications
   - Notify when new message arrives
   - Update badge count
   - Handle notification tap → open chat

4. Image sharing support
   - Upload images via chat
   - Display images in conversation

**Acceptance:** Full chat works between client and technician

**Files:**
- `backend/routes/chat.js`
- `backend/models/Message.js`
- `app/components/ChatScreen.tsx`
- `app/chat.tsx`

---

==================================================================
## DAY 2 (November 1) - FEATURES + POLISH
==================================================================

### SPRINT 5: GPS TRACKING [3 hours] - 8:00 AM - 11:00 AM
**Combines:** P1-7 (GPS) + Related WebSocket

**Tasks:**
1. Add GPS permissions
   - Request location permission (Expo Location)
   - Handle permission denial

2. Implement technician location tracking
   - Update location every 30 seconds when job active
   - Send location via WebSocket
   - Store in database

3. Show tracking on map
   - Display technician location on `app/booking/tracking.tsx`
   - Show route from technician to client
   - Calculate and display ETA
   - Update in real-time

4. Geofencing
   - Detect when technician arrives (within 50m)
   - Auto-notify client "Technician has arrived"

5. Share client location
   - Allow client to share location with technician
   - Show on technician's map

**Acceptance:** Real-time GPS tracking works, ETA displayed

**Files:**
- `app/booking/tracking.tsx`
- `app/booking/enhanced-tracking.tsx`
- `backend/services/LocationService.js`
- `backend/models/LocationHistory.js` (create)

---

### SPRINT 6: SCHEDULING + TECHNICIAN FEATURES [3 hours] - 11:00 AM - 2:00 PM
**Combines:** P1-9 (Scheduled Bookings) + P1-10 (Technician Dashboard)

**Tasks:**
1. Implement booking scheduling
   - Add calendar UI (react-native-calendars)
   - Select date/time for future booking
   - Check technician availability
   - Create scheduled booking

2. Booking reminders
   - Send notification 24h before
   - Send notification 2h before
   - Allow rescheduling

3. Enhance technician dashboard
   - Show available jobs with filters
   - Distance filter
   - Pay range filter
   - Skill match filter
   - Sort by urgency/pay/distance

4. Job management workflow
   - Accept/reject jobs
   - Start job (updates status + GPS tracking)
   - Complete job (upload photos)
   - Show earnings summary

5. Availability toggle
   - Technician can go online/offline
   - Only show jobs when online

6. Withdrawal system
   - Request withdrawal from earnings
   - Admin approves withdrawals

**Acceptance:** Scheduled bookings work, technician features complete

**Files:**
- `app/booking/service-selection.tsx` (add calendar)
- `app/dashboard/technician.tsx`
- `backend/routes/technician.js`
- `backend/services/SchedulingService.js`

---

### SPRINT 7: ENHANCEMENTS [2.5 hours] - 2:00 PM - 4:30 PM
**Combines:** P2-13 (Filtering) + P2-14 (Photo Upload) + P2-15 (Packages)

**Tasks:**
1. Advanced job filtering (technician side)
   - Multi-select filters
   - Save search preferences
   - Job recommendations

2. Photo upload for reviews
   - Add image picker to rating screen
   - Compress images
   - Upload to Cloudinary/S3
   - Display in review gallery

3. Service packages (basic)
   - Create ServicePackage model
   - Define 3 packages (Basic, Standard, Premium)
   - Purchase package flow
   - Track package usage

**Acceptance:** Filtering works, photos upload, packages available

**Files:**
- `app/dashboard/technician.tsx`
- `app/rating.tsx`
- `backend/models/ServicePackage.js` (create)
- `backend/routes/packages.js` (create)

---

### SPRINT 8: BUG FIXES + TESTING [3 hours] - 4:30 PM - 7:30 PM
**Combines:** P1-22 (Bug Fixes) + Testing + Optimization

**Tasks:**
1. Fix critical bugs
   - [ ] Booking status real-time updates (WebSocket)
   - [ ] Wallet balance refresh after payment
   - [ ] Push tokens update on login
   - [ ] Image upload size limit to 5MB
   - [ ] Location picker Android crash fix
   - [ ] Admin dashboard pagination for large data
   - [ ] Notification preferences persistence
   - [ ] WebSocket reconnection on poor network

2. Comprehensive testing
   - Test all navigation paths
   - Test all API endpoints
   - Test WebSocket connections
   - Test payment flow 3x
   - Test chat in both directions
   - Test GPS tracking
   - Test notifications
   - Test on web and mobile

3. Performance optimization
   - Add loading states everywhere
   - Implement error boundaries
   - Optimize image loading
   - Add retry logic for failed requests
   - Implement offline queue for critical actions

4. Documentation
   - Update .env.example
   - Create API documentation
   - Create user manual (basic)
   - Create admin manual

**Acceptance:** All bugs fixed, app tested end-to-end

**Files:**
- All booking/payment/notification files
- Add error boundaries
- Add loading states

---

==================================================================
## DEPLOYMENT PREPARATION [Evening - 2 hours]
==================================================================

### SPRINT 9: PRODUCTION READY [2 hours] - 8:00 PM - 10:00 PM
**Combines:** P1-21 (Deployment)

**Tasks:**
1. Server setup
   - Deploy backend to DigitalOcean/Heroku
   - Configure SSL certificate
   - Set up domain name
   - Update IntaSend callback URL

2. Database
   - MongoDB Atlas production cluster
   - Backup strategy
   - Indexes optimization

3. Environment configuration
   - Production .env file
   - API keys secured
   - CORS properly configured

4. Monitoring
   - Set up PM2 for process management
   - Configure Sentry for error tracking
   - Set up uptime monitoring

5. Mobile build
   - Build Android APK (expo build:android)
   - Test APK installation
   - Prepare for Play Store

**Acceptance:** App deployed and accessible, APK ready

---

==================================================================
## WORK DISTRIBUTION STRATEGY
==================================================================

### Solo Development:
**Day 1:**
- Morning: Payment (3h) → Admin (2.5h)
- Afternoon: Notifications (3h) → Chat (2.5h)
- Evening: Review day 1 work (1h)

**Day 2:**
- Morning: GPS (3h) → Scheduling/Technician (3h)
- Afternoon: Enhancements (2.5h) → Bug Fixes (3h)
- Evening: Deployment (2h)

### With Helper:
**Person A (Backend focused):**
- Day 1: Payment backend → Admin APIs → Notifications backend → Chat backend
- Day 2: GPS backend → Scheduling backend → Bug fixes backend → Deployment

**Person B (Frontend focused):**
- Day 1: Payment UI → Admin screens → Notifications UI → Chat UI
- Day 2: GPS UI → Scheduling UI → Enhancements → Testing

---

==================================================================
## CRITICAL SUCCESS FACTORS
==================================================================

### Must Have Working:
1. [CRITICAL] Payment flow (booking → payment → confirmation)
2. [CRITICAL] Admin dashboard (manage users, services, bookings)
3. [CRITICAL] Real-time notifications (replace SMS)
4. [CRITICAL] Chat system (client ↔ technician)
5. [CRITICAL] GPS tracking (technician location)
6. [CRITICAL] Technician job management
7. [CRITICAL] Scheduled bookings

### Can Be Basic:
- Analytics (show simple counts)
- Email notifications (just confirmations)
- Photo uploads (basic implementation)
- Service packages (3 packages only)
- Filters (basic filters only)

### Can Skip If Time Runs Out:
- Multi-language support
- Loyalty program
- Advanced analytics charts
- Referral system

---

==================================================================
## TESTING CHECKLIST (End of Day 2)
==================================================================

### Critical Flows:
- [ ] New user registration → login
- [ ] Create booking → assign technician → complete → payment → rating
- [ ] Schedule future booking → receive reminders
- [ ] Technician: accept job → navigate → start → complete → earnings
- [ ] Admin: verify technician → manage services → view analytics
- [ ] Payment: M-Pesa STK push → callback → confirmation
- [ ] Chat: send message → receive → reply
- [ ] GPS: track technician → see ETA → arrival notification
- [ ] Notifications: real-time delivery → mark read → badge update

### Technical Validation:
- [ ] WebSocket stays connected
- [ ] Database transactions atomic
- [ ] Error handling works
- [ ] Loading states show
- [ ] No crashes on Android/iOS
- [ ] Works on web browser
- [ ] API response times < 2s
- [ ] No memory leaks

---

==================================================================
## BRANCH STRATEGY (RAPID)
==================================================================

**Single Dev Branch Approach:**
```
main (stable)
  |
  +-- dev-sprint (working branch)
       |
       +-- Commit after each sprint
       +-- Merge to main at end of Day 2
```

**No feature branches** - too slow for 2 days
**Commit frequently** - after each completed task
**Test before committing** - don't break the build

---

==================================================================
## EMERGENCY SHORTCUTS (If Running Late)
==================================================================

### If Behind Schedule on Day 1:
1. Skip email notifications (use in-app only)
2. Skip image sharing in chat (text only)
3. Simplify analytics (just counts, no charts)

### If Behind Schedule on Day 2:
1. Skip service packages entirely
2. Basic filtering only (distance + pay)
3. Skip photo uploads for reviews
4. Deploy with known minor bugs (document them)

### Non-Negotiable:
- Payment MUST work
- Notifications MUST work
- Chat MUST work
- GPS tracking MUST work
- Admin dashboard MUST work

---

==================================================================
## MOTIVATION & TRACKING
==================================================================

### Hourly Goals:
- Hour 1-3: Payment system ✓
- Hour 4-6: Admin dashboard ✓
- Hour 7-9: Notifications ✓
- Hour 10-12: Chat ✓
- Hour 13-15: GPS ✓
- Hour 16-18: Scheduling ✓
- Hour 19-21: Enhancements ✓
- Hour 22-24: Bug fixes ✓
- Hour 25-26: Deployment ✓

### Progress Tracking:
After each sprint, update this file:
- [ ] SPRINT 1: Payment System
- [ ] SPRINT 2: Admin Dashboard
- [ ] SPRINT 3: Notifications
- [ ] SPRINT 4: Chat
- [ ] SPRINT 5: GPS Tracking
- [ ] SPRINT 6: Scheduling
- [ ] SPRINT 7: Enhancements
- [ ] SPRINT 8: Bug Fixes
- [ ] SPRINT 9: Deployment

---

==================================================================
## SUCCESS DEFINITION
==================================================================

**By End of Day 2:**
1. App deployed and accessible online
2. Android APK installable and functional
3. All critical flows tested and working
4. Zero blocking bugs
5. Admin can manage the platform
6. Clients can book and pay
7. Technicians can accept and complete jobs
8. Real-time features working (chat, tracking, notifications)

**Result:** Production-ready QuickFix platform

---

**LET'S GO! START WITH SPRINT 1 NOW!**
