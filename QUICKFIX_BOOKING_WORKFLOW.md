# QUICKFIX BOOKING WORKFLOW - COMPLETE PROCESS

**Date:** October 13, 2025 
**System:** QuickFix Service Booking Platform

---

## OVERVIEW

This document outlines the complete workflow from when a client submits a booking through to service completion in the QuickFix system.

---

## BOOKING WORKFLOW STAGES

### STAGE 1: BOOKING SUBMISSION
**Status:** `submitted` 
**Actor:** Client 
**Duration:** Immediate

**What Happens:**
1. Client fills out booking form with:
 - Personal details (name, phone, email)
 - Service type and description
 - Location (constituency, ward, road, description)
 - Preferred date and time slot
 - Special requirements (optional)

2. Frontend validates all required fields

3. Booking is submitted to backend with authentication token

4. Backend creates booking with:
 - Unique Booking ID (format: `QF[YYYYMMDD][HHMM][PHONE_LAST4][RANDOM]`)
 - Status: `submitted`
 - Normalized phone number (+254 format)
 - Timestamp: `submittedAt`

5. Client sees success screen with:
 - Booking ID
 - Confirmation details
 - Next steps information

**Database State:**
```javascript
{
 bookingId: "QF20251013201485670JKA",
 status: "submitted",
 clientPhone: "+254712345678",
 clientName: "John Doe",
 submittedAt: "2025-10-13T19:14:38.567Z",
 technicianId: null,
 assignedAt: null,
 quotedAmount: 0
}
```

**User Message:**
```
OK Booking Confirmed!
Booking Reference: QF20251013201485670JKA

What's Next?
- We'll assign a qualified technician
- You'll receive a confirmation call within 30 minutes
- Track your booking progress in "My Bookings"
```

---

### STAGE 2: ADMIN CONFIRMATION
**Status:** `confirmed` 
**Actor:** Admin/System 
**Duration:** 5-15 minutes

**What Happens:**
1. Admin reviews booking in admin dashboard
2. Verifies:
 - Service type is clear
 - Location is valid
 - Date/time is available
 - Special requirements are feasible

3. Admin confirms booking

4. System updates booking:
 ```javascript
 {
 status: "confirmed",
 confirmedAt: "2025-10-13T19:20:00.000Z"
 }
 ```

5. Client receives notification:
 - SMS to phone number
 - Email (if provided)
 - Push notification (if app installed)
 - WebSocket real-time update

**API Endpoint:**
```
PATCH /api/bookings-redesigned/:bookingId/status
Body: { status: "confirmed" }
```

**Notification Content:**
```
QuickFix Booking Confirmed!
Your booking QF20251013201485670JKA has been confirmed.
We're finding you the best technician for your plumbing service.
```

---

### STAGE 3: TECHNICIAN ASSIGNMENT
**Status:** `technician_assigned` 
**Actor:** Admin 
**Duration:** 10-30 minutes

**What Happens:**
1. Admin searches for available technicians with:
 - Matching service expertise (plumbing, electrical, etc.)
 - Available on preferred date/time
 - Located near service area
 - Good rating history

2. Admin assigns technician to booking

3. System updates booking:
 ```javascript
 {
 status: "technician_assigned",
 technicianId: ObjectId("..."),
 technicianPhone: "+254798765432",
 assignedAt: "2025-10-13T19:35:00.000Z"
 }
 ```

4. Notifications sent to:
 - **Client:** "Technician assigned!"
 - **Technician:** "New job assigned!"

5. Client can now see technician details:
 - Name
 - Phone number
 - Rating
 - Photo
 - Estimated arrival time

**API Endpoint:**
```
PATCH /api/bookings-redesigned/:bookingId/assign
Body: { technicianId: "..." }
```

**Client Notification:**
```
Technician Assigned!
James Mwangi has been assigned to your booking.
Service: Plumbing
Date: Oct 16, 2025 at 10:00 AM - 12:00 PM
Phone: +254798765432

Track technician location in real-time.
```

**Technician Notification:**
```
New Job Assigned!
Service: Plumbing
Location: Kitisuru, Westlands
Client: John Doe (+254712345678)
Date: Oct 16, 2025 at 10:00 AM - 12:00 PM
Description: Kitchen sink is leaking badly...

View Job Details
```

---

### STAGE 4: WORK IN PROGRESS
**Status:** `in_progress` 
**Actor:** Technician 
**Duration:** Varies (30 min - several hours)

**What Happens:**
1. Technician arrives at location

2. Technician marks job as started in mobile app

3. System updates:
 ```javascript
 {
 status: "in_progress",
 startedAt: "2025-10-16T10:05:00.000Z"
 }
 ```

4. Client can track:
 - Real-time status
 - Elapsed time
 - Live chat with technician

5. Technician may:
 - Take photos (before/after)
 - Update job notes
 - Request additional materials
 - Provide time estimates

6. If pricing wasn't set, technician provides quote:
 ```javascript
 {
 quotedAmount: 2500, // KES
 quotedAt: "2025-10-16T10:15:00.000Z"
 }
 ```

**Client View:**
```
Job In Progress
Technician: James Mwangi
Started: 10:05 AM
Duration: 1 hour 15 minutes

Status Updates:
- 10:05 AM: Technician arrived
- 10:15 AM: Diagnosis complete - Need to replace U-bend pipe
- 10:18 AM: Quote provided: KES 2,500
- 11:00 AM: Repair in progress

[Live Chat] [Call Technician] [Report Issue]
```

---

### STAGE 5: WORK COMPLETED
**Status:** `completed` 
**Actor:** Technician → Client Confirmation 
**Duration:** Immediate

**What Happens:**
1. Technician finishes work

2. Technician marks job as complete

3. System updates:
 ```javascript
 {
 status: "completed",
 completedAt: "2025-10-16T11:20:00.000Z",
 finalAmount: 2500
 }
 ```

4. Client receives notification to:
 - Confirm work completion
 - Verify quality
 - Rate service
 - Make payment

5. Client reviews and approves

6. Payment is processed (if not already paid):
 - M-Pesa
 - Bank transfer
 - Card payment
 - Escrow release

7. Client rates technician (1-5 stars)

8. Client can leave review/feedback

**Completion Notification:**
```
Job Completed!
Your plumbing service is complete.

Service: Kitchen sink repair
Technician: James Mwangi
Final Amount: KES 2,500

Please confirm work completion and rate the service.

[Confirm & Pay] [Report Issue]
```

**Rating Screen:**
```
Rate Your Experience

Service Quality: ⭐⭐⭐⭐⭐
Timeliness: ⭐⭐⭐⭐⭐
Communication: ⭐⭐⭐⭐⭐
Overall: ⭐⭐⭐⭐⭐

Comments (optional):
[Text area for feedback]

[Submit Rating]
```

---

### ALTERNATIVE PATHS

#### CANCELLATION PATH
**Status:** `cancelled` 
**Can be triggered at:** Any stage before `in_progress`

**Who Can Cancel:**
- Client: Before technician starts work
- Technician: Due to emergency, illness, etc.
- Admin: For various reasons

**Process:**
1. Cancellation request submitted
2. Reason recorded
3. Status updated to `cancelled`
4. Notifications sent to all parties
5. If paid, refund process initiated

**Cancellation Notification:**
```
Booking Cancelled
Your booking QF20251013201485670JKA has been cancelled.
Reason: [Cancellation reason]
Refund (if applicable): KES 2,500 will be processed within 3-5 days.
```

#### ON HOLD PATH
**Status:** `on_hold` 
**Triggered when:** Temporary pause needed

**Reasons:**
- Waiting for parts/materials
- Client request (postpone)
- Weather conditions
- Access issues

**Process:**
1. Technician/Admin marks as on-hold
2. Reason and expected resume date recorded
3. Client notified
4. Auto-reminder before resume date

---

## COMMUNICATION CHANNELS

### 1. SMS Notifications
- Booking confirmation
- Technician assignment
- Job started
- Job completed
- Payment confirmation

### 2. Email Notifications (if provided)
- Detailed booking confirmation
- Receipt with booking ID
- Invoice after completion
- Receipt after payment

### 3. Push Notifications (Mobile App)
- Real-time status updates
- Technician location updates
- Chat messages
- Emergency alerts

### 4. WebSocket (Real-time Web)
- Live status changes
- Chat messages
- Location tracking
- Instant notifications

### 5. In-App Chat
- Client ↔ Technician
- Client ↔ Support
- File sharing (photos)
- Voice messages

---

## TRACKING & TRANSPARENCY

### Client Can Track:
1. **Booking Status**
 - Current stage in workflow
 - Time at each stage
 - Next expected action

2. **Technician Details** (after assignment)
 - Name, photo, rating
 - Contact information
 - Location (real-time)
 - Estimated arrival time

3. **Financial Information**
 - Quoted amount
 - Final amount
 - Payment status
 - Invoice/receipt

4. **History**
 - All status changes
 - Communication history
 - Photos (before/after)
 - Notes and updates

### Available in "My Bookings":
```
My Bookings

Active (1)
━━━━━━━━━━━━━━━━━━━
[QF20251013201485670JKA]
Plumbing Service
Status: Technician Assigned
Date: Oct 16, 10:00 AM
Technician: James Mwangi
[View Details] [Chat] [Track]

Past (5)
━━━━━━━━━━━━━━━━━━━
[Previous bookings...]
```

---

## TIMING EXPECTATIONS

| Stage | Expected Duration | SLA Target |
|-------|------------------|------------|
| Submission → Confirmation | 5-15 minutes | < 20 min |
| Confirmation → Assignment | 10-30 minutes | < 1 hour |
| Assignment → Contact | 15-30 minutes | < 1 hour |
| Scheduled Date Arrival | On time ±15 min | ±30 min |
| Service Completion | Varies by service | As quoted |
| Payment → Receipt | Immediate | < 5 min |

---

## PAYMENT WORKFLOW

### Payment Methods:
1. **M-Pesa** (Primary)
 - STK Push prompt
 - Manual Paybill
 - Instant confirmation

2. **Escrow** (For large jobs)
 - Client pays upfront
 - Held in escrow
 - Released after completion

3. **Bank Transfer**
 - Offline payment
 - Manual confirmation

4. **Card Payment**
 - Visa/Mastercard
 - 3D Secure

### Payment Timing:
- **Small Jobs (<5000 KES):** Pay after completion
- **Medium Jobs (5000-20000 KES):** 50% deposit, 50% completion
- **Large Jobs (>20000 KES):** Full escrow

---

## ADMIN DASHBOARD ACTIONS

Admins can:
1. **View All Bookings**
 - Filter by status
 - Search by booking ID, phone, name
 - Sort by date, urgency, location

2. **Manage Status**
 - Confirm bookings
 - Assign technicians
 - Update status manually
 - Cancel bookings

3. **Technician Management**
 - View available technicians
 - Check technician workload
 - Reassign if needed
 - Block problematic technicians

4. **Communication**
 - Send notifications
 - Chat with clients/technicians
 - Broadcast announcements

5. **Financial**
 - Approve quotes
 - Process refunds
 - Generate invoices
 - View payment history

---

## API ENDPOINTS SUMMARY

```
POST /api/bookings-redesigned/redesigned Create booking
GET /api/bookings-redesigned/:bookingId Get booking details
GET /api/bookings-redesigned/phone/:phone Get user bookings
GET /api/bookings-redesigned/email/:email Get bookings by email
PATCH /api/bookings-redesigned/:bookingId/status Update status
PATCH /api/bookings-redesigned/:bookingId/assign Assign technician
```

---

## NEXT STEPS AFTER SUBMISSION

### Immediate (0-5 minutes):
1. Client receives booking confirmation on screen
2. Booking ID generated and displayed
3. Confirmation email sent (if email provided)
4. Booking appears in "My Bookings"

### Short Term (5-30 minutes):
1. Admin reviews and confirms booking
2. Admin searches for suitable technician
3. Technician is assigned
4. Client receives technician details
5. Technician contacts client (call/SMS)

### Medium Term (30 min - 2 hours):
1. Technician and client coordinate
2. Final details confirmed
3. Technician prepares tools/materials
4. Reminder sent day before service

### Service Day:
1. Morning reminder (if service is later)
2. Technician en-route notification
3. Real-time location tracking
4. Service performed
5. Client confirms completion
6. Payment processed
7. Rating submitted

### Follow-up:
1. Receipt emailed
2. Feedback request (if not rated)
3. Warranty information provided
4. Future service reminders
5. Loyalty points credited

---

## SUCCESS METRICS

- **Booking Completion Rate:** 95%+
- **Average Confirmation Time:** 12 minutes
- **Average Assignment Time:** 25 minutes
- **Technician Acceptance Rate:** 90%+
- **Client Satisfaction:** 4.5+ stars
- **On-Time Arrival:** 85%+
- **Payment Success Rate:** 98%+

---

## CONCLUSION

The QuickFix booking workflow is designed to be:
- **Simple:** Easy for clients to submit bookings
- **Fast:** Quick confirmation and assignment
- **Transparent:** Real-time tracking at every stage
- **Reliable:** Multiple communication channels
- **Flexible:** Handles various scenarios (cancellation, on-hold, etc.)

**Next Step After Client Submission:** Admin reviews and confirms the booking within 5-15 minutes, then assigns a qualified technician within the next 10-30 minutes.
