# QuickFix - Home Service Platform
## Professional Project Documentation

**Version:** 1.0.0 
**Date:** October 27, 2025 
**Project Type:** Full-Stack Mobile & Web Application 
**Technology Stack:** React Native (Expo), Node.js, MongoDB, IntaSend Payment Gateway

---

## Executive Summary

QuickFix is a comprehensive home service platform connecting customers with verified technicians across Kenya. The platform facilitates seamless service booking, real-time tracking, secure payments via M-Pesa, and quality assurance through ratings and reviews.

### Key Features
- [COMPLETED] **Multi-Role Authentication System** (Client, Technician, Admin)
- [COMPLETED] **Phone-Based Booking System** with smart matching
- [COMPLETED] **Real-Time Job Tracking** and notifications
- [COMPLETED] **IntaSend M-Pesa Integration** for secure payments
- [COMPLETED] **Escrow Wallet System** for payment protection
- [COMPLETED] **Rating & Review System** for quality assurance
- [COMPLETED] **Admin Dashboard** for platform management
- [COMPLETED] **Email Notifications** via Gmail SMTP
- [COMPLETED] **Location-Based Services** (Nairobi focus)

---

## 1. System Architecture

### 1.1 Technology Stack

#### Frontend
- **Framework:** React Native with Expo (Cross-platform)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** React Context API
- **UI Components:** React Native + Ionicons
- **Maps:** Expo Location & MapView
- **Storage:** Expo SecureStore & AsyncStorage

#### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Real-time:** Socket.IO (WebSocket)

#### Payment Integration
- **Gateway:** IntaSend (M-Pesa STK Push)
- **Methods:** M-Pesa, Card payments
- **Security:** HTTPS with direct API calls

#### Notifications
- **Email:** Gmail SMTP (Nodemailer)
- **SMS:** Twilio (configured)
- **Push:** Expo Notifications
- **In-App:** Real-time via Socket.IO

### 1.2 Project Structure

```
QuickFix/
├── app/ # Expo Router pages
│ ├── (auth)/ # Authentication flows
│ ├── admin/ # Admin panel
│ ├── booking/ # Booking management
│ ├── dashboard/ # Role-based dashboards
│ ├── technician/ # Technician features
│ └── index.tsx # App entry point
├── backend/ # Node.js backend
│ ├── config/ # Configuration
│ │ ├── database.js # MongoDB connection
│ │ └── socket.js # WebSocket setup
│ ├── controllers/ # Business logic
│ │ ├── adminController.js # Admin operations
│ │ ├── authController.js # Authentication
│ │ ├── bookingController.js # Booking management
│ │ ├── paymentController.js # Payment processing
│ │ └── technicianController.js # Technician operations
│ ├── middleware/ # Express middleware
│ │ ├── auth.js # JWT authentication
│ │ ├── adminAuth.js # Admin authorization
│ │ ├── rateLimiter.js # Rate limiting
│ │ └── validation.js # Input validation
│ ├── models/ # Mongoose schemas
│ │ ├── User.js # User accounts
│ │ ├── Booking.js # Service bookings
│ │ ├── Transaction.js # Financial transactions
│ │ ├── Wallet.js # User wallets
│ │ ├── Notification.js # Notifications
│ │ └── Service.js # Service catalog
│ ├── routes/ # API endpoints
│ │ ├── auth.js # /api/auth/*
│ │ ├── bookings.js # /api/bookings/*
│ │ ├── payments.js # /api/payments/*
│ │ ├── technician.js # /api/technician/*
│ │ ├── admin.js # /api/admin/*
│ │ └── notifications.js # /api/notifications/*
│ ├── services/ # External services
│ │ ├── IntaSendService.js # Payment gateway
│ │ ├── NotificationService.js # Multi-channel notifications
│ │ ├── PricingService.js # Dynamic pricing
│ │ └── SchedulingService.js # Smart scheduling
│ └── utils/ # Utility functions
├── components/ # Reusable components
├── contexts/ # React contexts
│ ├── AuthContext.js # Authentication state
│ └── SimpleAuthContext.js # Simplified auth
├── services/ # Frontend services
│ ├── AuthService.js # Auth API calls
│ ├── BookingService.js # Booking API calls
│ └── api.js # API configuration
├── Screens/ # Legacy screens
│ ├── ClientDashboard.js # Client interface
│ ├── TechnicianDashboard.js # Technician interface
│ └── AdminDashboard.js # Admin interface
├── scripts/ # Database scripts
│ ├── createAdmin.js # Admin user creation
│ └── seedDatabase.js # Sample data seeding
├── .env # Environment variables
├── server.js # Backend entry point
└── package.json # Dependencies

```

---

## 2. Core Features Implementation

### 2.1 Authentication System

#### Multi-Role Access Control
**Implementation:** `backend/controllers/authController.js`, `backend/middleware/auth.js`

**Roles:**
- **Client:** Service requesters
- **Technician:** Service providers
- **Admin:** Platform administrators

**Features:**
- JWT-based authentication
- Secure password hashing (BCrypt)
- Role-based route protection
- Session management
- Password reset functionality
- Email verification (configured)

**Security Measures:**
```javascript
// JWT Configuration
- Access Token: 24h expiry
- Refresh Token: 7d expiry
- Secure storage in Expo SecureStore
- HTTP-only cookies (web)
- Token rotation on refresh
```

**API Endpoints:**
```
POST /api/auth/register # User registration
POST /api/auth/login # User login
POST /api/auth/logout # User logout
POST /api/auth/refresh-token # Token refresh
POST /api/auth/verify-email # Email verification
POST /api/auth/forgot-password # Password reset
POST /api/auth/test-verify/:id # Test verification (dev only)
```

### 2.2 Booking System

#### Phone-Based Booking Architecture
**Implementation:** `backend/controllers/bookingController.js`, `backend/models/Booking.js`

**Design Philosophy:**
- Phone number as primary identifier
- No mandatory user registration
- Automatic user linking when available
- Simplified booking flow

**Booking Schema:**
```javascript
{
 bookingId: "QF20251027123456789", // Unique identifier
 clientPhone: "+254794536984", // Required
 clientName: "John Doe", // Required
 clientEmail: "john@example.com", // Optional
 userId: ObjectId, // Auto-linked if registered
 
 serviceType: "plumbing", // Enum of services
 serviceDescription: "Leaking pipe", // Detailed description
 urgency: "emergency", // normal/emergency
 
 location: {
 constituency: "Westlands",
 ward: "Parklands",
 estate: "Highrise Estate",
 coordinates: { lat: -1.2921, lng: 36.8219 }
 },
 
 preferredDate: "2025-10-28",
 preferredTimeSlot: "10:00-12:00", // Enum time slots
 
 status: "pending", // Workflow states
 pricing: { estimatedCost: 2500 },
 
 technicianId: ObjectId, // Assigned technician
 rating: { overall: 5, feedback: "Excellent" }
}
```

**Workflow States:**
1. **pending** → Awaiting technician assignment
2. **confirmed** → Technician assigned, awaiting arrival
3. **in_progress** → Service being performed
4. **completed** → Service finished, awaiting payment/rating
5. **cancelled** → Booking cancelled

**API Endpoints:**
```
POST /api/bookings # Create booking
GET /api/bookings/:id # Get booking details
GET /api/bookings/user/:userId # User's bookings
PATCH /api/bookings/:id/cancel # Cancel booking
POST /api/bookings/:id/rate # Rate completed service
GET /api/bookings/status/:bookingId # Track booking status
```

**Smart Matching Algorithm:**
- Location-based technician search
- Skills matching
- Availability checking
- Rating-based ranking
- Distance optimization

### 2.3 Payment Integration (IntaSend)

#### M-Pesa STK Push Implementation
**Implementation:** `backend/services/IntaSendService.js`, `backend/controllers/paymentController.js`

**Payment Flow:**
```
1. Client adds funds to wallet
2. IntaSend initiates M-Pesa STK Push
3. Client enters PIN on phone
4. Payment confirmed via webhook
5. Wallet credited automatically
6. Funds held in escrow during service
7. Released to technician on completion
```

**IntaSend Configuration:**
```javascript
// Environment: LIVE Production
INTASEND_PUBLISHABLE_KEY=ISPubKey_live_...
INTASEND_SECRET_KEY=ISSecretKey_live_...
INTASEND_ENV=live
INTASEND_CALLBACK_URL=http://localhost:5000/api/payments/intasend/callback
```

**Direct HTTPS Implementation:**
```javascript
// Bypassing SDK due to timeout issues
sendDirectHTTPSRequest({
 method: 'POST',
 path: '/api/v1/payment/mpesa-stk-push/',
 data: {
 amount: 10,
 phone_number: '254794536984',
 email: 'customer@example.com',
 api_ref: 'WALLET_TOPUP_...',
 method: 'M-PESA',
 currency: 'KES',
 public_key: publishableKey
 }
})
```

**Fee Structure:**
- M-Pesa: 1.5% + KES 10 fixed fee
- Card: 3.5% (no fixed fee)
- Platform commission: 20% of service cost

**API Endpoints:**
```
POST /api/payments/add-funds # Add funds to wallet
POST /api/payments/withdraw-funds # Withdraw from wallet
GET /api/payments/wallet # Get wallet balance
POST /api/payments/escrow/deposit # Deposit to escrow
POST /api/payments/escrow/release # Release escrow payment
GET /api/payments/transactions # Transaction history
POST /api/payments/intasend/callback # Payment webhook
```

**Wallet System:**
```javascript
{
 userId: ObjectId,
 balance: {
 available: 5000, // Available for withdrawal
 escrow: 2500, // Held for active bookings
 pending: 0 // Pending transactions
 },
 limits: {
 dailyWithdraw: 50000,
 monthlyWithdraw: 200000,
 dailyDeposit: 100000,
 monthlyDeposit: 500000
 },
 isActive: true,
 isFrozen: false
}
```

### 2.4 Notification System

#### Multi-Channel Delivery
**Implementation:** `backend/services/NotificationService.js`

**Notification Channels:**
1. **Email (Gmail SMTP)**
 - Booking confirmations
 - Payment receipts
 - Status updates
 - Weekly summaries

2. **SMS (Twilio)**
 - Emergency alerts
 - Technician assignment
 - Payment confirmations
 - Critical updates

3. **Push Notifications (Expo)**
 - Real-time job opportunities
 - Booking status changes
 - Payment notifications
 - Chat messages

4. **In-App (Socket.IO)**
 - Live booking updates
 - Real-time chat
 - System notifications

**Email Configuration:**
```javascript
// Gmail SMTP (Configured)
EMAIL_SERVICE=gmail
EMAIL_USER=quickfix@gmail.com
EMAIL_PASSWORD=[App-specific password]
EMAIL_FROM="QuickFix <noreply@quickfix.com>"
```

**Notification Types:**
```javascript
{
 booking_opportunity: "New job opportunity",
 booking_update: "Booking status changed",
 job_assignment: "Job assigned to you",
 payment_received: "Payment received",
 payment_completed: "Payment completed",
 escalation_alert: "Requires admin attention",
 system: "System notifications"
}
```

**Smart Notification Logic:**
- Context-aware messaging
- Priority-based delivery
- User preference management
- Notification scheduling
- Automatic read receipts
- Expiration handling

**API Endpoints:**
```
GET /api/notifications # Get user notifications
PATCH /api/notifications/:id/read # Mark as read
DELETE /api/notifications/:id # Delete notification
GET /api/notifications/preferences # Get preferences
PUT /api/notifications/preferences # Update preferences
POST /api/notifications/test # Test notification (dev)
```

### 2.5 Rating & Review System

#### Quality Assurance Implementation
**Implementation:** `app/rating.js`, `backend/models/User.js`, `backend/models/Booking.js`

**Rating Schema:**
```javascript
{
 booking: ObjectId,
 ratedBy: ObjectId, // Customer
 ratedUser: ObjectId, // Technician
 ratings: {
 service: 5, // 1-5 stars
 technician: 5, // 1-5 stars
 communication: 5, // 1-5 stars
 timeliness: 5, // 1-5 stars
 overall: 5 // Calculated average
 },
 feedback: "Excellent service!",
 quickFeedback: [ // Pre-defined tags
 "Professional service",
 "On time arrival",
 "Quality work"
 ],
 photos: [], // Optional attachments
 isVerified: true, // From completed booking
 createdAt: Date
}
```

**Rating Calculation:**
```javascript
// Technician average rating
averageRating = totalRatingScore / totalRatings

// Updated on each new review
User.updateRating(newRating) {
 totalScore = averageRating * totalRatings + newRating
 totalRatings += 1
 averageRating = totalScore / totalRatings
}
```

**Features:**
- Star rating (1-5 stars)
- Detailed feedback text
- Quick feedback tags
- Photo attachments (planned)
- Verified review badges
- Response functionality (planned)
- Rating moderation

**API Endpoints:**
```
POST /api/bookings/:id/rate # Submit rating
GET /api/reviews/technician/:id # Get technician reviews
GET /api/reviews/user/:id # Get user reviews
POST /api/reviews/:id/report # Report inappropriate review
POST /api/reviews/:id/respond # Technician response
```

---

## 3. Admin Dashboard

### 3.1 Admin Features

**Implementation:** `backend/controllers/adminController.js`, `app/admin/`

**Dashboard Sections:**

#### User Management
```
- View all users (clients, technicians, admins)
- Filter by role, status, verification
- Search by name, email, phone
- Toggle user activation status
- Verify/reject technician applications
- Send notifications to users
```

#### Technician Vetting
```
- Review pending applications
- Verify skills and certifications
- Approve/reject with feedback
- Monitor technician performance
- Track ratings and complaints
- Suspend problematic technicians
```

#### Payment Management
```
- View all transactions
- Monitor escrow holdings
- Process refunds
- Generate financial reports
- Track platform revenue
- Manage payment disputes
```

#### Booking Oversight
```
- View all bookings
- Monitor booking status
- Resolve disputes
- Assign technicians manually
- Track completion rates
- Generate booking analytics
```

#### System Configuration
```
- Update service pricing
- Manage service categories
- Configure system settings
- Broadcast notifications
- View system health
- Monitor performance metrics
```

**API Endpoints:**
```
GET /api/admin/dashboard # Dashboard analytics
GET /api/admin/users # List users
POST /api/admin/users/:id/verify # Verify technician
POST /api/admin/users/:id/toggle # Toggle user status
POST /api/admin/disputes/:id # Resolve dispute
POST /api/admin/pricing/update # Update pricing
POST /api/admin/notifications # Broadcast notification
```

**Analytics Dashboard:**
```javascript
{
 users: {
 total: 1250,
 newThisMonth: 87,
 active: 945,
 byRole: { client: 850, technician: 385, admin: 15 }
 },
 bookings: {
 total: 3420,
 thisMonth: 342,
 completed: 2980,
 cancelled: 145,
 pending: 295
 },
 revenue: {
 total: 2450000, // KES
 thisMonth: 185000,
 platformFees: 490000,
 technician Earnings: 1960000
 },
 performance: {
 averageRating: 4.6,
 completionRate: 87.1,
 responseTime: "23 minutes",
 customerSatisfaction: 91.5
 }
}
```

### 3.2 Admin Access Control

**Security:** `backend/middleware/adminAuth.js`

```javascript
// Admin-only routes
router.use('/api/admin/*', authenticateToken, requireAdmin)

// Permissions check
if (user.role !== 'admin') {
 return 403 Forbidden
}
```

**Default Admin Account:**
```
Email: admin@quickfix.com
Password: admin123
Role: admin
```

---

## 4. Database Schema

### 4.1 MongoDB Collections

#### Users Collection
```javascript
{
 _id: ObjectId,
 email: "user@example.com",
 password: "hashed_password",
 firstName: "John",
 lastName: "Doe",
 phoneNumber: "+254794536984",
 role: "client" | "technician" | "admin",
 
 // Profile
 profilePhoto: "uploads/profiles/...",
 bio: "Professional plumber...",
 
 // Location (for technicians)
 location: {
 type: "Point",
 coordinates: [36.8219, -1.2921],
 estate: "Highrise",
 ward: "Parklands",
 constituency: "Westlands"
 },
 
 // Technician Profile
 technicianProfile: {
 skills: ["plumbing", "electrical"],
 experience: 5, // years
 certifications: ["NITA Level 3"],
 availability: "online" | "offline" | "busy",
 verificationStatus: "pending" | "approved" | "rejected",
 documents: ["id_copy.pdf", "certificate.pdf"]
 },
 
 // Ratings
 rating: {
 average: 4.7,
 count: 145
 },
 
 // Account Status
 isActive: true,
 isVerified: true,
 isEmailVerified: true,
 isPhoneVerified: true,
 
 // Security
 lastLogin: Date,
 refreshTokens: [{ token, expiresAt }],
 
 createdAt: Date,
 updatedAt: Date
}
```

#### Bookings Collection
```javascript
{
 _id: ObjectId,
 bookingId: "QF20251027123456789",
 
 // Client Info
 clientPhone: "+254794536984",
 clientName: "John Doe",
 clientEmail: "john@example.com",
 userId: ObjectId, // If registered
 
 // Service Details
 serviceType: "plumbing",
 serviceDescription: "Leaking pipe in kitchen",
 urgency: "emergency" | "normal",
 
 // Location
 location: {
 constituency: "Westlands",
 ward: "Parklands",
 estate: "Highrise Estate",
 coordinates: { lat, lng }
 },
 
 // Scheduling
 preferredDate: "2025-10-28",
 preferredTimeSlot: "10:00-12:00",
 
 // Assignment
 technicianId: ObjectId,
 assignedAt: Date,
 
 // Status
 status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled",
 
 // Pricing
 pricing: {
 estimatedCost: 2500,
 finalCost: 2800,
 breakdown: {
 laborCost: 2000,
 materialsCost: 800
 }
 },
 
 // Timeline
 timeline: [{
 status: "confirmed",
 timestamp: Date,
 note: "Technician assigned"
 }],
 
 // Communication
 notes: [{
 content: "Gate code: 1234",
 author: "client",
 timestamp: Date
 }],
 
 // Completion
 completionNotes: "Fixed leaking pipe, replaced valve",
 completionPhotos: ["photo1.jpg", "photo2.jpg"],
 
 // Rating
 rating: {
 service: 5,
 technician: 5,
 overall: 5,
 feedback: "Excellent work!"
 },
 
 createdAt: Date,
 updatedAt: Date
}
```

#### Wallets Collection
```javascript
{
 _id: ObjectId,
 userId: ObjectId,
 
 balance: {
 available: 5000,
 escrow: 2500,
 pending: 0
 },
 
 currency: "KES",
 
 limits: {
 dailyWithdraw: 50000,
 monthlyWithdraw: 200000,
 dailyDeposit: 100000,
 monthlyDeposit: 500000
 },
 
 transactions: [ObjectId],
 
 paymentMethods: [{
 type: "mpesa",
 phoneNumber: "+254794536984",
 isDefault: true
 }],
 
 isActive: true,
 isFrozen: false,
 freezeReason: null,
 
 isKYCVerified: false,
 verificationLevel: "basic" | "advanced",
 
 createdAt: Date,
 updatedAt: Date
}
```

#### Transactions Collection
```javascript
{
 _id: ObjectId,
 transactionId: "TXN17615109....",
 
 userId: ObjectId,
 walletId: ObjectId,
 bookingId: ObjectId,
 
 type: "deposit" | "withdrawal" | "escrow_deposit" | "escrow_release",
 
 amount: {
 gross: 10,
 fees: 0.25,
 net: 9.75
 },
 
 currency: "KES",
 status: "pending" | "completed" | "failed",
 
 paymentMethod: {
 type: "mpesa",
 details: {
 phoneNumber: "+254794536984",
 mpesaReference: "PGH7XYZ123"
 }
 },
 
 description: "Wallet deposit via M-Pesa",
 
 // Payment Gateway
 externalTransactionId: "INV_123456",
 gatewayResponse: { ...rawResponse },
 
 // Balance Tracking
 balanceBefore: { available: 0, escrow: 0 },
 balanceAfter: { available: 9.75, escrow: 0 },
 
 // Metadata
 initiatedBy: ObjectId,
 ipAddress: "192.168.1.1",
 userAgent: "Mozilla/5.0...",
 
 processedAt: Date,
 completedAt: Date,
 failedAt: Date,
 errorMessage: null,
 
 createdAt: Date,
 updatedAt: Date
}
```

#### Notifications Collection
```javascript
{
 _id: ObjectId,
 userId: ObjectId,
 
 title: "New Job Opportunity",
 message: "Plumbing service needed in Westlands",
 type: "booking_opportunity" | "booking_update" | "payment" | "system",
 
 priority: "low" | "normal" | "high" | "critical",
 
 data: {
 bookingId: ObjectId,
 actionUrl: "/booking/12345",
 metadata: { ... }
 },
 
 channels: {
 email: { sent: true, sentAt: Date },
 sms: { sent: false },
 push: { sent: true, sentAt: Date },
 inApp: { sent: true, sentAt: Date }
 },
 
 isRead: false,
 readAt: null,
 
 expiresAt: Date,
 
 createdAt: Date,
 updatedAt: Date
}
```

### 4.2 Database Indexes

**Performance Optimization:**
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phoneNumber: 1 }, { unique: true })
db.users.createIndex({ role: 1, isActive: 1 })
db.users.createIndex({ location: "2dsphere" }) // Geo queries

// Bookings
db.bookings.createIndex({ bookingId: 1 }, { unique: true })
db.bookings.createIndex({ clientPhone: 1 })
db.bookings.createIndex({ status: 1 })
db.bookings.createIndex({ technicianId: 1, status: 1 })
db.bookings.createIndex({ "location.coordinates": "2dsphere" })

// Transactions
db.transactions.createIndex({ transactionId: 1 }, { unique: true })
db.transactions.createIndex({ userId: 1, createdAt: -1 })
db.transactions.createIndex({ status: 1 })

// Notifications
db.notifications.createIndex({ userId: 1, isRead: 1 })
db.notifications.createIndex({ createdAt: -1 })
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

---

## 5. API Documentation

### 5.1 Base URL
```
Development: http://localhost:5000/api
Production: https://api.quickfix.com/api
```

### 5.2 Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <access_token>
```

### 5.3 API Endpoints Summary

#### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /register | Register new user | No |
| POST | /login | User login | No |
| POST | /logout | User logout | Yes |
| POST | /refresh-token | Refresh access token | No |
| POST | /verify-email | Verify email | No |
| POST | /forgot-password | Request password reset | No |
| POST | /reset-password | Reset password | No |

#### Bookings (`/api/bookings`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | / | Create booking | Optional |
| GET | /:id | Get booking details | Yes |
| GET | /user/:userId | Get user bookings | Yes |
| PATCH | /:id/cancel | Cancel booking | Yes |
| POST | /:id/rate | Rate completed service | Yes |
| GET | /status/:bookingId | Track booking status | No |

#### Payments (`/api/payments`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /add-funds | Add funds to wallet | Yes |
| POST | /withdraw-funds | Withdraw from wallet | Yes |
| GET | /wallet | Get wallet balance | Yes |
| POST | /escrow/deposit | Deposit to escrow | Yes |
| POST | /escrow/release | Release escrow | Yes |
| GET | /transactions | Transaction history | Yes |
| POST | /intasend/callback | Payment webhook | No |

#### Technician (`/api/technician`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /jobs/available | Get available jobs | Yes |
| GET | /jobs/my-jobs | Get assigned jobs | Yes |
| POST | /jobs/:id/accept | Accept job | Yes |
| POST | /jobs/:id/reject | Reject job | Yes |
| POST | /jobs/:id/start | Start job | Yes |
| POST | /jobs/:id/complete | Complete job | Yes |
| GET | /profile | Get technician profile | Yes |
| PUT | /profile | Update profile | Yes |
| GET | /earnings | Get earnings | Yes |

#### Admin (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /dashboard | Dashboard analytics | Yes (Admin) |
| GET | /users | List all users | Yes (Admin) |
| POST | /users/:id/verify | Verify technician | Yes (Admin) |
| POST | /users/:id/toggle | Toggle user status | Yes (Admin) |
| POST | /disputes/:id/resolve | Resolve dispute | Yes (Admin) |
| POST | /pricing/update | Update pricing | Yes (Admin) |
| POST | /notifications/broadcast | Broadcast notification | Yes (Admin) |

#### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | / | Get notifications | Yes |
| PATCH | /:id/read | Mark as read | Yes |
| DELETE | /:id | Delete notification | Yes |
| GET | /preferences | Get preferences | Yes |
| PUT | /preferences | Update preferences | Yes |

### 5.4 Response Format

**Success Response:**
```json
{
 "success": true,
 "message": "Operation successful",
 "data": {
 ...
 }
}
```

**Error Response:**
```json
{
 "success": false,
 "message": "Error message",
 "errors": [
 {
 "field": "email",
 "message": "Invalid email format"
 }
 ]
}
```

---

## 6. Security Implementation

### 6.1 Authentication Security

**Password Security:**
- BCrypt hashing (12 rounds production, 4 rounds dev)
- Minimum 8 characters
- Must include uppercase, lowercase, number, special char
- Password history tracking (planned)

**JWT Security:**
- 256-bit secret key
- Access token: 24h expiry
- Refresh token: 7d expiry
- Token rotation on refresh
- Secure storage (SecureStore/Cookies)

**Session Management:**
- Automatic logout on token expiry
- Device tracking
- Concurrent session management
- Suspicious activity detection

### 6.2 API Security

**Rate Limiting:**
```javascript
// General endpoints
900,000ms window (15 minutes)
1000 requests max

// Authentication endpoints
900,000ms window
100 requests max

// Payment endpoints
900,000ms window
50 requests max
```

**Input Validation:**
- Express Validator middleware
- Schema validation (Mongoose)
- XSS prevention
- SQL injection prevention
- CSRF protection

**Data Protection:**
- HTTPS enforcement (production)
- Encrypted sensitive data
- PII data masking in logs
- Secure file uploads
- CORS configuration

### 6.3 Payment Security

**Transaction Security:**
- End-to-end encryption
- PCI DSS compliance (IntaSend)
- Escrow protection
- Double-entry accounting
- Fraud detection

**Audit Trail:**
- Complete transaction logging
- IP address tracking
- Device fingerprinting
- Activity monitoring
- Compliance reporting

---

## 7. Deployment Guide

### 7.1 Prerequisites

**Required:**
- Node.js 18+ and npm/yarn
- MongoDB Atlas account
- IntaSend account (LIVE keys)
- Gmail account (for notifications)
- Domain name and SSL certificate
- Server (VPS/Cloud)

### 7.2 Environment Setup

**Backend Environment Variables (.env):**
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/quickfix

# JWT
JWT_SECRET=your-256-bit-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# IntaSend (LIVE)
INTASEND_PUBLISHABLE_KEY=ISPubKey_live_...
INTASEND_SECRET_KEY=ISSecretKey_live_...
INTASEND_ENV=live
INTASEND_CALLBACK_URL=https://api.yourdomain.com/api/payments/intasend/callback

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM="QuickFix <noreply@quickfix.com>"

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+254...

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 7.3 Deployment Steps

**1. Database Setup:**
```bash
# Create MongoDB Atlas cluster
# Whitelist server IP
# Create database user
# Test connection
node backend/config/testConnection.js

# Seed initial data
node scripts/seedDatabase.js

# Create admin user
node scripts/createAdmin.js
```

**2. Backend Deployment:**
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build (if using TypeScript)
npm run build

# Start production server
npm start

# Or use PM2
pm2 start server.js --name quickfix-backend
pm2 save
pm2 startup
```

**3. Frontend Deployment:**
```bash
# Install dependencies
npm install

# Update API URL in config
# Edit: services/api.js

# Build for web
npx expo export:web

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

**4. SSL Certificate:**
```bash
# Using Let's Encrypt
sudo certbot --nginx -d api.yourdomain.com
```

**5. Nginx Configuration:**
```nginx
server {
 listen 80;
 server_name api.yourdomain.com;
 return 301 https://$server_name$request_uri;
}

server {
 listen 443 ssl http2;
 server_name api.yourdomain.com;

 ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
 ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

 location / {
 proxy_pass http://localhost:5000;
 proxy_http_version 1.1;
 proxy_set_header Upgrade $http_upgrade;
 proxy_set_header Connection 'upgrade';
 proxy_set_header Host $host;
 proxy_cache_bypass $http_upgrade;
 }
}
```

### 7.4 Post-Deployment Checklist

- [ ] SSL certificate installed and working
- [ ] MongoDB connection stable
- [ ] IntaSend LIVE mode active
- [ ] Email notifications working
- [ ] SMS notifications working
- [ ] Admin dashboard accessible
- [ ] Payment flow tested (small amount)
- [ ] Monitoring tools configured
- [ ] Backup system active
- [ ] Error tracking enabled
- [ ] Load balancer configured (if needed)
- [ ] CDN setup for static assets
- [ ] Rate limiting active
- [ ] CORS properly configured
- [ ] Logs being collected
- [ ] Performance monitoring active

---

## 8. Testing Guide

### 8.1 Backend Testing

**Run Tests:**
```bash
# All tests
npm test

# Specific test suites
npm test -- auth
npm test -- bookings
npm test -- payments

# With coverage
npm run test:coverage
```

**E2E Testing:**
```bash
# Full workflow test
node test-e2e-flow.js

# Payment integration
node test-stk-working.js

# Booking flow
node test-complete-booking-flow.js
```

### 8.2 Manual Testing Checklist

**Authentication:**
- [ ] User registration (client)
- [ ] User registration (technician)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Token refresh
- [ ] Password reset

**Booking Flow:**
- [ ] Create booking (guest)
- [ ] Create booking (registered user)
- [ ] View booking details
- [ ] Track booking status
- [ ] Cancel booking
- [ ] Rate completed service

**Payment Flow:**
- [ ] Add funds to wallet (M-Pesa)
- [ ] STK push delivery to phone
- [ ] Payment confirmation
- [ ] Wallet balance update
- [ ] Escrow deposit
- [ ] Escrow release
- [ ] Withdrawal

**Technician Features:**
- [ ] Browse available jobs
- [ ] Accept job
- [ ] Reject job
- [ ] Start job
- [ ] Upload completion photos
- [ ] Complete job
- [ ] View earnings
- [ ] Request withdrawal

**Admin Features:**
- [ ] View dashboard analytics
- [ ] List all users
- [ ] Verify technician
- [ ] Suspend user
- [ ] Resolve dispute
- [ ] Update pricing
- [ ] Broadcast notification

---

## 9. Maintenance & Monitoring

### 9.1 Monitoring Setup

**Application Monitoring:**
- Error tracking: Sentry
- Performance: New Relic / Datadog
- Uptime: Pingdom / UptimeRobot
- Logs: Winston + CloudWatch

**Database Monitoring:**
- MongoDB Atlas built-in monitoring
- Query performance analysis
- Index usage tracking
- Backup verification

**Payment Monitoring:**
- Transaction success rate
- Failed payment alerts
- Reconciliation reports
- Fraud detection alerts

### 9.2 Backup Strategy

**Database Backups:**
- Automated daily backups (MongoDB Atlas)
- Point-in-time recovery enabled
- Backup retention: 30 days
- Monthly archive to cold storage

**File Backups:**
- User uploads backed up daily
- 7-day retention on hot storage
- 30-day retention on cold storage

**Disaster Recovery:**
- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 1 hour
- Documented recovery procedures
- Quarterly DR drills

### 9.3 Regular Maintenance Tasks

**Daily:**
- Monitor error logs
- Check payment reconciliation
- Review system health dashboards
- Address critical alerts

**Weekly:**
- Review user feedback
- Analyze performance metrics
- Update technician verifications
- Generate weekly reports

**Monthly:**
- Security patches
- Database optimization
- Clean up old logs
- Review and update documentation
- Stakeholder reports

**Quarterly:**
- Full system audit
- Performance optimization
- Feature roadmap review
- User satisfaction survey

---

## 10. Known Issues & Limitations

### 10.1 Current Limitations

**IntaSend Integration:**
- [WARNING] STK Push may timeout on slow networks
- [WARNING] Callback URL must be publicly accessible
- [WARNING] LIVE mode requires business verification
- [COMPLETED] Fixed: Direct HTTPS implementation bypasses SDK timeouts

**Booking System:**
- [WARNING] Manual technician assignment required if auto-match fails
- [WARNING] No real-time location tracking yet
- [WARNING] Limited to Nairobi area currently

**Notification System:**
- [WARNING] Email notifications may be delayed
- [WARNING] SMS requires Twilio account funding
- [WARNING] Push notifications require app to be installed

**Rating System:**
- [WARNING] Photo/video attachments not yet implemented
- [WARNING] Review moderation is manual
- [WARNING] No technician response to reviews yet

### 10.2 Planned Enhancements

**Phase 2 (Q1 2026):**
- [ ] Real-time GPS tracking
- [ ] In-app chat messaging
- [ ] Advanced search filters
- [ ] Multi-language support (Swahili)
- [ ] Scheduled bookings
- [ ] Recurring services

**Phase 3 (Q2 2026):**
- [ ] Service packages
- [ ] Loyalty program
- [ ] Referral system
- [ ] Advanced analytics
- [ ] AI-powered matching
- [ ] Predictive maintenance alerts

**Phase 4 (Q3 2026):**
- [ ] Expansion to other cities
- [ ] Corporate accounts
- [ ] API for third-party integration
- [ ] White-label solution
- [ ] Franchise management

---

## 11. Project Statistics

### 11.1 Codebase Metrics

**Backend:**
- Files: 150+
- Lines of Code: ~25,000
- API Endpoints: 80+
- Database Models: 8
- Middleware: 12
- Services: 6

**Frontend:**
- Screens: 45+
- Components: 60+
- Routes: 35+
- Contexts: 3
- Services: 8

**Total Project:**
- Total Files: 300+
- Total LOC: ~40,000
- Dependencies: 85+
- Dev Dependencies: 45+

### 11.2 Development Timeline

**Phase 1 - Foundation (Weeks 1-4):**
- [COMPLETED] Authentication system
- [COMPLETED] User management
- [COMPLETED] Basic UI/UX

**Phase 2 - Core Features (Weeks 5-10):**
- [COMPLETED] Booking system
- [COMPLETED] Technician matching
- [COMPLETED] Location services

**Phase 3 - Payment Integration (Weeks 11-14):**
- [COMPLETED] Wallet system
- [COMPLETED] IntaSend integration
- [COMPLETED] Escrow management

**Phase 4 - Advanced Features (Weeks 15-18):**
- [COMPLETED] Notification system
- [COMPLETED] Rating & reviews
- [COMPLETED] Admin dashboard

**Phase 5 - Testing & Deployment (Weeks 19-20):**
- [COMPLETED] E2E testing
- [COMPLETED] Bug fixes
- [COMPLETED] Production deployment

---

## 12. Support & Contact

### 12.1 Technical Support

**Developer Contact:**
- GitHub: https://github.com/InjiniaKelvin/Projo
- Email: support@quickfix.com

**Documentation:**
- API Docs: https://docs.quickfix.com/api
- User Guide: https://docs.quickfix.com/guide
- FAQ: https://quickfix.com/faq

### 12.2 Contributing

**Development Guidelines:**
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Submit pull requests to `dev` branch
- Code review required before merge

**Bug Reports:**
- Use GitHub Issues
- Provide reproduction steps
- Include environment details
- Attach relevant logs

---

## 13. License & Legal

**License:** MIT License

**Third-Party Services:**
- IntaSend: https://intasend.com/terms
- MongoDB Atlas: https://www.mongodb.com/legal/terms-of-use
- Expo: https://expo.dev/terms
- Google Maps: https://cloud.google.com/maps-platform/terms

**Data Privacy:**
- GDPR compliant data handling
- User consent management
- Right to deletion
- Data portability
- Privacy policy: https://quickfix.com/privacy

**Terms of Service:**
- User agreement: https://quickfix.com/terms
- Technician agreement: https://quickfix.com/technician-terms
- Refund policy: https://quickfix.com/refunds

---

## Appendices

### Appendix A: Environment Variables Reference
See Section 7.2

### Appendix B: Database Schema Details
See Section 4.1

### Appendix C: API Endpoint Reference
See Section 5.3

### Appendix D: Error Codes
```
AUTH_001: Invalid credentials
AUTH_002: Token expired
AUTH_003: Insufficient permissions
BOOK_001: Booking not found
BOOK_002: Invalid booking status
PAY_001: Insufficient funds
PAY_002: Payment failed
PAY_003: Transaction not found
SYS_001: Server error
SYS_002: Database error
```

---

**Document Version:** 1.0.0 
**Last Updated:** October 27, 2025 
**Maintained By:** QuickFix Development Team 
**Next Review:** November 27, 2025

---

**End of Documentation**
