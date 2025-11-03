# QuickFix Documentation - Annotated Draft Part 3
**Continuation from Parts 1 & 2**

**Sections 6-16: Database Design through Appendices**

---

## 6. Database Design

// Added: Complete database architecture documentation with schemas and optimization strategies

### 6.1 MongoDB Collections

The QuickFix platform utilizes MongoDB Atlas as its primary database, leveraging MongoDB's flexible document model for storing user profiles, bookings, financial transactions, and system data. The database architecture supports horizontal scaling and implements comprehensive indexing strategies for optimal query performance.

#### 6.1.1 Users Collection

**Collection Name:** `users`

**Purpose:** Stores all user accounts across three roles (client, technician, admin) with role-specific profile data and authentication information.

**Complete Schema:**

```javascript
// backend/models/User.js - Complete Mongoose Schema

const userSchema = new mongoose.Schema({
 // Authentication Fields
 email: {
 type: String,
 required: [true, 'Email is required'],
 unique: true,
 lowercase: true,
 trim: true,
 match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/, 'Invalid email format']
 },
 
 password: {
 type: String,
 required: [true, 'Password is required'],
 minlength: [6, 'Password must be at least 6 characters'],
 select: false // Exclude from queries by default
 },
 
 // Basic Profile Information
 firstName: {
 type: String,
 required: [true, 'First name is required'],
 trim: true,
 maxlength: [50, 'First name too long']
 },
 
 lastName: {
 type: String,
 required: [true, 'Last name is required'],
 trim: true,
 maxlength: [50, 'Last name too long']
 },
 
 phoneNumber: {
 type: String,
 required: [true, 'Phone number is required'],
 unique: true,
 trim: true,
 match: [/^(\+?254|0)[1-9]\d{8}$/, 'Invalid Kenyan phone number']
 },
 
 profileImage: {
 type: String,
 default: null
 },
 
 dateOfBirth: {
 type: Date,
 validate: {
 validator: function(v) {
 return !v || v < new Date();
 },
 message: 'Date of birth cannot be in future'
 }
 },
 
 gender: {
 type: String,
 enum: ['male', 'female', 'other', 'prefer_not_to_say'],
 default: 'prefer_not_to_say'
 },
 
 // Role-Based Access Control
 role: {
 type: String,
 enum: ['client', 'technician', 'admin'],
 default: 'client',
 required: true
 },
 
 // Account Status
 isVerified: {
 type: Boolean,
 default: false
 },
 
 isActive: {
 type: Boolean,
 default: true
 },
 
 status: {
 type: String,
 enum: ['active', 'suspended', 'deleted', 'pending'],
 default: 'active'
 },
 
 // Location Information
 address: {
 street: { type: String, trim: true },
 city: { type: String, trim: true },
 county: { type: String, trim: true },
 postalCode: { type: String, trim: true },
 country: { type: String, default: 'Kenya', trim: true }
 },
 
 location: {
 type: {
 type: String,
 enum: ['Point'],
 default: 'Point'
 },
 coordinates: {
 type: [Number], // [longitude, latitude]
 default: [36.8219, -1.2921] // Nairobi default
 }
 },
 
 // Technician-Specific Profile (null for clients/admins)
 technicianProfile: {
 skills: [{
 type: String,
 enum: [
 'plumbing', 'electrical', 'carpentry', 'painting',
 'cleaning', 'appliance_repair', 'air_conditioning',
 'roofing', 'masonry', 'landscaping', 'pest_control',
 'locksmith', 'general_maintenance'
 ]
 }],
 
 experience: {
 type: Number, // Years of experience
 min: [0, 'Experience cannot be negative']
 },
 
 certifications: [{
 name: String,
 issuedBy: String,
 issuedDate: Date,
 expiryDate: Date,
 documentUrl: String
 }],
 
 serviceAreas: [{
 type: String // e.g., "Westlands", "Kilimani", "Karen"
 }],
 
 availability: {
 isAvailable: {
 type: Boolean,
 default: true
 },
 schedule: {
 monday: { start: String, end: String, available: Boolean },
 tuesday: { start: String, end: String, available: Boolean },
 wednesday: { start: String, end: String, available: Boolean },
 thursday: { start: String, end: String, available: Boolean },
 friday: { start: String, end: String, available: Boolean },
 saturday: { start: String, end: String, available: Boolean },
 sunday: { start: String, end: String, available: Boolean }
 }
 },
 
 // Performance Metrics
 rating: {
 averageRating: {
 type: Number,
 default: 0,
 min: [0, 'Rating cannot be negative'],
 max: [5, 'Rating cannot exceed 5']
 },
 totalRatings: {
 type: Number,
 default: 0
 },
 ratingDistribution: {
 5: { type: Number, default: 0 },
 4: { type: Number, default: 0 },
 3: { type: Number, default: 0 },
 2: { type: Number, default: 0 },
 1: { type: Number, default: 0 }
 }
 },
 
 statistics: {
 totalJobsCompleted: { type: Number, default: 0 },
 totalJobsAccepted: { type: Number, default: 0 },
 totalJobsOffered: { type: Number, default: 0 },
 totalEarnings: { type: Number, default: 0 },
 completionRate: { type: Number, default: 0 },
 acceptanceRate: { type: Number, default: 0 },
 averageResponseTime: { type: Number, default: 0 } // minutes
 },
 
 // Verification Status
 verification: {
 status: {
 type: String,
 enum: ['pending', 'approved', 'rejected', 'suspended'],
 default: 'pending'
 },
 verifiedAt: Date,
 verifiedBy: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User'
 },
 documents: [{
 type: {
 type: String,
 enum: ['national_id', 'passport', 'certificate', 'license']
 },
 url: String,
 uploadedAt: Date,
 status: {
 type: String,
 enum: ['pending', 'approved', 'rejected'],
 default: 'pending'
 }
 }],
 notes: String
 }
 },
 
 // Notification Preferences
 notificationPreferences: {
 email: {
 bookingUpdates: { type: Boolean, default: true },
 paymentReceipts: { type: Boolean, default: true },
 marketingEmails: { type: Boolean, default: false },
 weeklyReports: { type: Boolean, default: true }
 },
 push: {
 bookingUpdates: { type: Boolean, default: true },
 messages: { type: Boolean, default: true },
 marketing: { type: Boolean, default: false },
 soundEnabled: { type: Boolean, default: true },
 vibrationEnabled: { type: Boolean, default: true }
 },
 sms: {
 bookingUpdates: { type: Boolean, default: false },
 paymentConfirmations: { type: Boolean, default: true }
 }
 },
 
 // Push Notification Token
 pushToken: {
 type: String,
 default: null
 },
 
 // Password Reset
 resetPasswordToken: {
 type: String,
 select: false
 },
 
 resetPasswordExpires: {
 type: Date,
 select: false
 },
 
 // Email Verification
 verificationToken: {
 type: String,
 select: false
 },
 
 verificationTokenExpires: {
 type: Date,
 select: false
 },
 
 // Security
 lastLogin: {
 type: Date,
 default: null
 },
 
 failedLoginAttempts: {
 type: Number,
 default: 0
 },
 
 accountLockedUntil: {
 type: Date,
 default: null
 },
 
 // Metadata
 createdAt: {
 type: Date,
 default: Date.now
 },
 
 updatedAt: {
 type: Date,
 default: Date.now
 }
}, {
 timestamps: true,
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'technicianProfile.skills': 1 });
userSchema.index({ 'technicianProfile.serviceAreas': 1 });
userSchema.index({ location: '2dsphere' }); // Geospatial index
userSchema.index({ 'technicianProfile.verification.status': 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
```

**Index Strategy:**

```javascript
// Create indexes for optimal query performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phoneNumber: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ "technicianProfile.skills": 1 });
db.users.createIndex({ "technicianProfile.serviceAreas": 1 });
db.users.createIndex({ location: "2dsphere" });
db.users.createIndex({ "technicianProfile.rating.averageRating": -1 });
db.users.createIndex({ "technicianProfile.verification.status": 1 });
db.users.createIndex({ createdAt: -1 });

// Compound indexes for complex queries
db.users.createIndex({ 
 role: 1, 
 "technicianProfile.skills": 1, 
 "technicianProfile.verification.status": 1 
});
```

#### 6.1.2 Bookings Collection

**Collection Name:** `bookings`

**Purpose:** Stores all service booking requests with complete workflow tracking from creation through completion and payment.

**Complete Schema:**

```javascript
// backend/models/Booking.js - Complete Mongoose Schema

const bookingSchema = new mongoose.Schema({
 // Unified Booking Identifier
 bookingId: {
 type: String,
 required: true,
 unique: true,
 default: function() {
 const now = new Date();
 const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
 const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
 const phoneLast4 = this.clientPhone ? this.clientPhone.slice(-4) : '0000';
 const random = Math.random().toString(36).substr(2, 4).toUpperCase();
 return `QF${dateStr}${timeStr}${phoneLast4}${random}`;
 }
 },
 
 // Client Information (Phone-Based)
 clientPhone: {
 type: String,
 required: [true, 'Client phone number required'],
 validate: {
 validator: function(v) {
 const cleanPhone = v.replace(/[\s\-\+]/g, '');
 return /^(254|0)?[17][0-9]{8}$/.test(cleanPhone);
 },
 message: 'Invalid Kenyan phone number'
 },
 set: function(v) {
 if (!v) return v;
 const cleanPhone = v.replace(/[\s\-\+]/g, '');
 if (cleanPhone.startsWith('0')) {
 return '+254' + cleanPhone.slice(1);
 } else if (cleanPhone.startsWith('254')) {
 return '+' + cleanPhone;
 }
 return '+254' + cleanPhone;
 }
 },
 
 clientName: {
 type: String,
 required: [true, 'Client name required'],
 trim: true,
 maxlength: [100, 'Name too long']
 },
 
 clientEmail: {
 type: String,
 trim: true,
 lowercase: true,
 validate: {
 validator: function(v) {
 return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
 },
 message: 'Invalid email format'
 }
 },
 
 // Linked User ID (if registered)
 userId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 default: null
 },
 
 // Service Details
 serviceType: {
 type: String,
 required: [true, 'Service type required'],
 enum: [
 'plumbing', 'electrical', 'carpentry', 'painting',
 'cleaning', 'appliance_repair', 'air_conditioning',
 'roofing', 'masonry', 'landscaping', 'pest_control',
 'locksmith', 'general_maintenance'
 ]
 },
 
 serviceDescription: {
 type: String,
 required: [true, 'Service description required'],
 trim: true,
 maxlength: [1000, 'Description too long']
 },
 
 urgency: {
 type: String,
 enum: ['normal', 'urgent', 'emergency'],
 default: 'normal'
 },
 
 // Location Details
 location: {
 address: {
 type: String,
 required: [true, 'Address required']
 },
 constituency: String,
 ward: String,
 estate: String,
 coordinates: {
 latitude: {
 type: Number,
 required: true,
 min: [-90, 'Invalid latitude'],
 max: [90, 'Invalid latitude']
 },
 longitude: {
 type: Number,
 required: true,
 min: [-180, 'Invalid longitude'],
 max: [180, 'Invalid longitude']
 }
 },
 detailedAddress: String
 },
 
 // Scheduling
 preferredDate: {
 type: Date,
 required: true
 },
 
 preferredTime: {
 type: String,
 enum: ['morning', 'afternoon', 'evening', 'flexible'],
 default: 'flexible'
 },
 
 // Technician Assignment
 technicianId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 default: null
 },
 
 assignedAt: {
 type: Date,
 default: null
 },
 
 // Pricing
 pricing: {
 basePrice: {
 type: Number,
 required: true,
 min: [0, 'Price cannot be negative']
 },
 travelFee: {
 type: Number,
 default: 200
 },
 additionalCharges: [{
 description: String,
 amount: Number
 }],
 platformFee: {
 type: Number,
 default: function() {
 return this.pricing.basePrice * 0.20; // 20% platform fee
 }
 },
 totalAmount: {
 type: Number,
 required: true
 },
 technicianEarnings: {
 type: Number,
 required: true
 }
 },
 
 // Workflow Status
 status: {
 type: String,
 enum: [
 'submitted', 'assigned', 'in_progress', 'completed',
 'paid', 'rated', 'cancelled', 'disputed', 'resolved'
 ],
 default: 'submitted',
 required: true
 },
 
 // Status Timestamps
 timestamps: {
 created: {
 type: Date,
 default: Date.now
 },
 updated: {
 type: Date,
 default: Date.now
 },
 assigned: Date,
 started: Date,
 completed: Date,
 paid: Date,
 rated: Date,
 cancelled: Date
 },
 
 // Service Execution Details
 execution: {
 actualStartTime: Date,
 actualEndTime: Date,
 actualDuration: Number, // minutes
 completionNotes: String,
 completionPhotos: [String],
 customerConfirmed: {
 type: Boolean,
 default: false
 },
 confirmedAt: Date
 },
 
 // Cancellation Details
 cancellation: {
 cancelledBy: {
 type: String,
 enum: ['client', 'technician', 'admin'],
 default: null
 },
 reason: String,
 cancelledAt: Date,
 refundAmount: Number,
 refundStatus: {
 type: String,
 enum: ['pending', 'processed', 'failed'],
 default: null
 }
 },
 
 // Dispute Management
 dispute: {
 status: {
 type: String,
 enum: ['none', 'open', 'under_review', 'resolved'],
 default: 'none'
 },
 raisedBy: {
 type: String,
 enum: ['client', 'technician'],
 default: null
 },
 reason: String,
 description: String,
 evidence: [String], // URLs to uploaded evidence
 adminNotes: String,
 resolution: String,
 resolvedAt: Date,
 resolvedBy: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User'
 }
 },
 
 // Rating (populated after completion)
 rating: {
 overall: {
 type: Number,
 min: [1, 'Rating must be at least 1'],
 max: [5, 'Rating cannot exceed 5']
 },
 aspects: {
 punctuality: Number,
 professionalism: Number,
 quality: Number,
 communication: Number
 },
 review: {
 type: String,
 maxlength: [500, 'Review too long']
 },
 wouldRecommend: Boolean,
 submittedAt: Date
 },
 
 // Notes and Communication
 notes: {
 clientNotes: String,
 technicianNotes: String,
 adminNotes: String,
 internalNotes: String
 },
 
 // Metadata
 createdAt: {
 type: Date,
 default: Date.now
 },
 
 updatedAt: {
 type: Date,
 default: Date.now
 }
}, {
 timestamps: true,
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ bookingId: 1 }, { unique: true });
bookingSchema.index({ clientPhone: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ technicianId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ serviceType: 1 });
bookingSchema.index({ 'location.coordinates': '2dsphere' });
bookingSchema.index({ preferredDate: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ 'dispute.status': 1 });

// Compound indexes
bookingSchema.index({ technicianId: 1, status: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ serviceType: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
```

**Index Strategy:**

```javascript
// Booking collection indexes
db.bookings.createIndex({ bookingId: 1 }, { unique: true });
db.bookings.createIndex({ clientPhone: 1 });
db.bookings.createIndex({ userId: 1 });
db.bookings.createIndex({ technicianId: 1 });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ serviceType: 1 });
db.bookings.createIndex({ "location.coordinates": "2dsphere" });
db.bookings.createIndex({ preferredDate: 1 });
db.bookings.createIndex({ createdAt: -1 });

// Compound indexes for frequent queries
db.bookings.createIndex({ technicianId: 1, status: 1 });
db.bookings.createIndex({ userId: 1, status: 1, createdAt: -1 });
db.bookings.createIndex({ serviceType: 1, status: 1, preferredDate: 1 });
```

#### 6.1.3 Wallets Collection

**Collection Name:** `wallets`

**Purpose:** Manages user financial balances across three categories (available, escrow, pending) with comprehensive transaction tracking.

**Complete Schema:**

```javascript
// backend/models/Wallet.js - Complete Mongoose Schema

const walletSchema = new mongoose.Schema({
 // Wallet Owner
 userId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 required: true,
 unique: true
 },
 
 // Balance Categories
 balance: {
 available: {
 type: Number,
 default: 0,
 min: [0, 'Available balance cannot be negative']
 },
 escrow: {
 type: Number,
 default: 0,
 min: [0, 'Escrow balance cannot be negative']
 },
 pending: {
 type: Number,
 default: 0,
 min: [0, 'Pending balance cannot be negative']
 }
 },
 
 // Currency
 currency: {
 type: String,
 default: 'KES',
 enum: ['KES', 'USD', 'EUR', 'GBP']
 },
 
 // Wallet Status
 isActive: {
 type: Boolean,
 default: true
 },
 
 isFrozen: {
 type: Boolean,
 default: false
 },
 
 freezeReason: {
 type: String,
 default: null
 },
 
 frozenAt: {
 type: Date,
 default: null
 },
 
 frozenBy: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 default: null
 },
 
 // Payment Methods
 paymentMethods: [{
 type: {
 type: String,
 enum: ['mpesa', 'bank', 'card'],
 required: true
 },
 details: {
 // M-Pesa
 phoneNumber: String,
 accountName: String,
 
 // Bank
 accountNumber: String,
 bankName: String,
 bankCode: String,
 branchName: String,
 
 // Card
 cardLast4: String,
 cardBrand: String,
 expiryMonth: String,
 expiryYear: String,
 stripePaymentMethodId: String
 },
 isDefault: {
 type: Boolean,
 default: false
 },
 isVerified: {
 type: Boolean,
 default: false
 },
 verifiedAt: Date,
 createdAt: {
 type: Date,
 default: Date.now
 }
 }],
 
 // Transaction References
 transactions: [{
 type: mongoose.Schema.Types.ObjectId,
 ref: 'Transaction'
 }],
 
 // Withdrawal Limits
 limits: {
 dailyWithdraw: {
 type: Number,
 default: 50000 // KES
 },
 monthlyWithdraw: {
 type: Number,
 default: 200000 // KES
 },
 dailyDeposit: {
 type: Number,
 default: 100000 // KES
 },
 monthlyDeposit: {
 type: Number,
 default: 500000 // KES
 },
 minimumWithdraw: {
 type: Number,
 default: 100 // KES
 }
 },
 
 // Usage Tracking
 usage: {
 dailyWithdrawn: {
 amount: { type: Number, default: 0 },
 lastReset: { type: Date, default: Date.now }
 },
 monthlyWithdrawn: {
 amount: { type: Number, default: 0 },
 lastReset: { type: Date, default: Date.now }
 },
 dailyDeposited: {
 amount: { type: Number, default: 0 },
 lastReset: { type: Date, default: Date.now }
 },
 monthlyDeposited: {
 amount: { type: Number, default: 0 },
 lastReset: { type: Date, default: Date.now }
 }
 },
 
 // KYC Verification
 isKYCVerified: {
 type: Boolean,
 default: false
 },
 
 verificationLevel: {
 type: String,
 enum: ['basic', 'intermediate', 'advanced'],
 default: 'basic'
 },
 
 kycDocuments: [{
 type: {
 type: String,
 enum: ['national_id', 'passport', 'utility_bill', 'bank_statement']
 },
 documentUrl: String,
 uploadedAt: Date,
 verifiedAt: Date,
 status: {
 type: String,
 enum: ['pending', 'approved', 'rejected'],
 default: 'pending'
 }
 }],
 
 // Metadata
 createdAt: {
 type: Date,
 default: Date.now
 },
 
 updatedAt: {
 type: Date,
 default: Date.now
 }
}, {
 timestamps: true,
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

// Virtual for total balance
walletSchema.virtual('totalBalance').get(function() {
 return this.balance.available + this.balance.escrow + this.balance.pending;
});

// Indexes
walletSchema.index({ userId: 1 }, { unique: true });
walletSchema.index({ isActive: 1 });
walletSchema.index({ isFrozen: 1 });
walletSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Wallet', walletSchema);
```

#### 6.1.4 Transactions Collection

**Collection Name:** `transactions`

**Purpose:** Records all financial transactions including deposits, withdrawals, payments, escrow movements, and platform fees.

**Complete Schema:**

```javascript
// backend/models/Transaction.js - Complete Mongoose Schema

const transactionSchema = new mongoose.Schema({
 // Transaction Identification
 transactionId: {
 type: String,
 required: true,
 unique: true,
 default: function() {
 return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
 }
 },
 
 // Related Entities
 userId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 required: true
 },
 
 walletId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'Wallet',
 required: true
 },
 
 bookingId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'Booking',
 default: null
 },
 
 // Transaction Type
 type: {
 type: String,
 enum: [
 'deposit',
 'withdrawal',
 'payment',
 'refund',
 'escrow_hold',
 'escrow_release',
 'commission',
 'bonus',
 'transfer_in',
 'transfer_out',
 'reversal'
 ],
 required: true
 },
 
 // Amount Details
 amount: {
 gross: {
 type: Number,
 required: true,
 min: [0, 'Gross amount cannot be negative']
 },
 fees: {
 type: Number,
 default: 0,
 min: [0, 'Fees cannot be negative']
 },
 net: {
 type: Number,
 required: true
 }
 },
 
 currency: {
 type: String,
 default: 'KES',
 enum: ['KES', 'USD', 'EUR', 'GBP']
 },
 
 // Transaction Status
 status: {
 type: String,
 enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
 default: 'pending',
 required: true
 },
 
 // Payment Method
 paymentMethod: {
 type: {
 type: String,
 enum: ['mpesa', 'bank', 'card', 'wallet'],
 required: true
 },
 details: {
 phoneNumber: String,
 transactionCode: String,
 accountNumber: String,
 cardLast4: String,
 reference: String
 }
 },
 
 // External Gateway References
 gateway: {
 provider: {
 type: String,
 enum: ['intasend', 'stripe', 'paypal', 'internal'],
 default: 'internal'
 },
 transactionId: String,
 invoiceId: String,
 checkoutId: String,
 status: String,
 rawResponse: mongoose.Schema.Types.Mixed
 },
 
 // Description and Notes
 description: {
 type: String,
 required: true,
 trim: true
 },
 
 notes: {
 type: String,
 trim: true
 },
 
 internalNotes: {
 type: String,
 trim: true
 },
 
 // Balance Snapshots
 balanceBefore: {
 available: Number,
 escrow: Number,
 pending: Number
 },
 
 balanceAfter: {
 available: Number,
 escrow: Number,
 pending: Number
 },
 
 // Related Transactions
 relatedTransactions: [{
 transactionId: String,
 type: String,
 relationship: {
 type: String,
 enum: ['parent', 'child', 'reversal', 'refund']
 }
 }],
 
 // Timestamps
 initiatedAt: {
 type: Date,
 default: Date.now
 },
 
 processedAt: Date,
 
 completedAt: Date,
 
 failedAt: Date,
 
 // Metadata
 metadata: {
 ipAddress: String,
 userAgent: String,
 deviceType: String,
 location: {
 latitude: Number,
 longitude: Number
 }
 },
 
 // Audit Trail
 auditLog: [{
 action: String,
 performedBy: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User'
 },
 timestamp: {
 type: Date,
 default: Date.now
 },
 details: mongoose.Schema.Types.Mixed
 }],
 
 // Timestamps
 createdAt: {
 type: Date,
 default: Date.now
 },
 
 updatedAt: {
 type: Date,
 default: Date.now
 }
}, {
 timestamps: true
});

// Indexes
transactionSchema.index({ transactionId: 1 }, { unique: true });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ walletId: 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ 'gateway.provider': 1, 'gateway.transactionId': 1 });
transactionSchema.index({ createdAt: -1 });

// Compound indexes
transactionSchema.index({ userId: 1, type: 1, status: 1 });
transactionSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
```

#### 6.1.5 Notifications Collection

**Collection Name:** `notifications`

**Purpose:** Stores all platform notifications sent to users through email, push, and in-app channels.

**Complete Schema:**

```javascript
// backend/models/Notification.js - Complete Mongoose Schema

const notificationSchema = new mongoose.Schema({
 // Recipient
 userId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 required: true
 },
 
 // Notification Content
 title: {
 type: String,
 required: [true, 'Title is required'],
 trim: true,
 maxlength: [100, 'Title too long']
 },
 
 message: {
 type: String,
 required: [true, 'Message is required'],
 trim: true,
 maxlength: [500, 'Message too long']
 },
 
 // Notification Type
 type: {
 type: String,
 enum: [
 'booking_update',
 'payment',
 'system',
 'urgent',
 'marketing',
 'reminder',
 'alert'
 ],
 required: true
 },
 
 // Priority Level
 priority: {
 type: String,
 enum: ['low', 'normal', 'high', 'urgent'],
 default: 'normal'
 },
 
 // Read Status
 isRead: {
 type: Boolean,
 default: false
 },
 
 readAt: {
 type: Date,
 default: null
 },
 
 // Delivery Channels
 channels: [{
 type: String,
 enum: ['email', 'push', 'in_app', 'sms']
 }],
 
 // Delivery Status
 deliveryStatus: {
 email: {
 sent: { type: Boolean, default: false },
 sentAt: Date,
 error: String
 },
 push: {
 sent: { type: Boolean, default: false },
 sentAt: Date,
 ticket: String,
 error: String
 },
 sms: {
 sent: { type: Boolean, default: false },
 sentAt: Date,
 messageId: String,
 error: String
 }
 },
 
 // Related Data
 data: {
 bookingId: String,
 transactionId: String,
 actionUrl: String,
 additionalInfo: mongoose.Schema.Types.Mixed
 },
 
 // Action Button
 action: {
 label: String,
 url: String,
 type: {
 type: String,
 enum: ['link', 'button', 'deep_link']
 }
 },
 
 // Expiry
 expiresAt: {
 type: Date,
 default: null
 },
 
 // Metadata
 createdAt: {
 type: Date,
 default: Date.now
 },
 
 updatedAt: {
 type: Date,
 default: Date.now
 }
}, {
 timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
```

#### 6.1.6 Support Tickets Collection

// Added: Support and customer service tracking

**Collection Name:** `supportTickets`

**Purpose:** Manages customer support requests, disputes, and issue resolution tracking.

**Schema:**

```javascript
const supportTicketSchema = new mongoose.Schema({
 ticketId: {
 type: String,
 unique: true,
 default: () => 'TKT' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
 },
 
 userId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 required: true
 },
 
 bookingId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'Booking',
 default: null
 },
 
 category: {
 type: String,
 enum: ['payment', 'booking', 'technical', 'account', 'general', 'complaint'],
 required: true
 },
 
 subject: {
 type: String,
 required: true,
 maxlength: 200
 },
 
 description: {
 type: String,
 required: true,
 maxlength: 2000
 },
 
 status: {
 type: String,
 enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'],
 default: 'open'
 },
 
 priority: {
 type: String,
 enum: ['low', 'medium', 'high', 'urgent'],
 default: 'medium'
 },
 
 assignedTo: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 default: null
 },
 
 messages: [{
 sender: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User'
 },
 senderType: {
 type: String,
 enum: ['customer', 'support', 'system']
 },
 message: String,
 attachments: [String],
 timestamp: {
 type: Date,
 default: Date.now
 }
 }],
 
 resolution: {
 resolvedBy: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User'
 },
 resolution: String,
 resolvedAt: Date
 },
 
 createdAt: {
 type: Date,
 default: Date.now
 },
 
 updatedAt: {
 type: Date,
 default: Date.now
 }
}, {
 timestamps: true
});

supportTicketSchema.index({ ticketId: 1 }, { unique: true });
supportTicketSchema.index({ userId: 1, status: 1 });
supportTicketSchema.index({ status: 1, priority: 1 });
supportTicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
```

### 6.2 Entity Relationship Diagram

// Added: Complete ER diagram showing all relationships

**Mermaid ER Diagram:**

```mermaid
erDiagram
 USER ||--o{ BOOKING : creates
 USER ||--o{ BOOKING : accepts_as_technician
 USER ||--|| WALLET : has
 USER ||--o{ TRANSACTION : performs
 USER ||--o{ NOTIFICATION : receives
 USER ||--o{ SUPPORT_TICKET : raises
 
 BOOKING ||--o{ TRANSACTION : generates
 BOOKING ||--o| RATING : has
 BOOKING ||--o{ NOTIFICATION : triggers
 
 WALLET ||--o{ TRANSACTION : contains
 
 TRANSACTION }o--|| BOOKING : references
 TRANSACTION }o--|| WALLET : affects
 
 USER {
 ObjectId _id PK
 string email UK
 string phoneNumber UK
 string password
 string role
 object technicianProfile
 object notificationPreferences
 date createdAt
 }
 
 BOOKING {
 ObjectId _id PK
 string bookingId UK
 string clientPhone
 ObjectId userId FK
 ObjectId technicianId FK
 string serviceType
 string status
 object location
 object pricing
 date createdAt
 }
 
 WALLET {
 ObjectId _id PK
 ObjectId userId FK-UK
 object balance
 array paymentMethods
 object limits
 boolean isActive
 }
 
 TRANSACTION {
 ObjectId _id PK
 string transactionId UK
 ObjectId userId FK
 ObjectId walletId FK
 ObjectId bookingId FK
 string type
 object amount
 string status
 date createdAt
 }
 
 NOTIFICATION {
 ObjectId _id PK
 ObjectId userId FK
 string title
 string message
 string type
 boolean isRead
 date createdAt
 }
 
 RATING {
 ObjectId _id PK
 ObjectId bookingId FK-UK
 ObjectId customerId FK
 ObjectId technicianId FK
 number overall
 object aspects
 string review
 date createdAt
 }
 
 SUPPORT_TICKET {
 ObjectId _id PK
 string ticketId UK
 ObjectId userId FK
 ObjectId bookingId FK
 string category
 string status
 array messages
 date createdAt
 }
```

**Caption**: Entity Relationship Diagram showing the seven core MongoDB collections and their relationships. Lines indicate foreign key references, with cardinality notation (||--o{) representing one-to-many relationships.

![ER Diagram Placeholder](./diagrams/quickfix-er-diagram.png) 
*Note: Generate formal ER diagram from Mermaid code or using MongoDB Compass schema visualization*

### 6.3 Database Indexes

// Added: Comprehensive indexing strategy for query optimization

**Index Creation Script:**

```javascript
// scripts/create-indexes.js
// Run: node scripts/create-indexes.js

const mongoose = require('mongoose');
require('dotenv').config();

async function createIndexes() {
 try {
 await mongoose.connect(process.env.MONGODB_URI);
 
 const db = mongoose.connection.db;
 
 // Users Collection Indexes
 await db.collection('users').createIndex({ email: 1 }, { unique: true });
 await db.collection('users').createIndex({ phoneNumber: 1 }, { unique: true });
 await db.collection('users').createIndex({ role: 1 });
 await db.collection('users').createIndex({ 'technicianProfile.skills': 1 });
 await db.collection('users').createIndex({ 'technicianProfile.serviceAreas': 1 });
 await db.collection('users').createIndex({ location: '2dsphere' });
 await db.collection('users').createIndex({ 
 role: 1, 
 'technicianProfile.skills': 1, 
 'technicianProfile.verification.status': 1 
 });
 console.log('[SUCCESS] Users indexes created');
 
 // Bookings Collection Indexes
 await db.collection('bookings').createIndex({ bookingId: 1 }, { unique: true });
 await db.collection('bookings').createIndex({ clientPhone: 1 });
 await db.collection('bookings').createIndex({ userId: 1 });
 await db.collection('bookings').createIndex({ technicianId: 1 });
 await db.collection('bookings').createIndex({ status: 1 });
 await db.collection('bookings').createIndex({ serviceType: 1 });
 await db.collection('bookings').createIndex({ 'location.coordinates': '2dsphere' });
 await db.collection('bookings').createIndex({ technicianId: 1, status: 1 });
 await db.collection('bookings').createIndex({ userId: 1, status: 1, createdAt: -1 });
 console.log('[SUCCESS] Bookings indexes created');
 
 // Wallets Collection Indexes
 await db.collection('wallets').createIndex({ userId: 1 }, { unique: true });
 await db.collection('wallets').createIndex({ isActive: 1 });
 await db.collection('wallets').createIndex({ isFrozen: 1 });
 console.log('[SUCCESS] Wallets indexes created');
 
 // Transactions Collection Indexes
 await db.collection('transactions').createIndex({ transactionId: 1 }, { unique: true });
 await db.collection('transactions').createIndex({ userId: 1, createdAt: -1 });
 await db.collection('transactions').createIndex({ walletId: 1 });
 await db.collection('transactions').createIndex({ bookingId: 1 });
 await db.collection('transactions').createIndex({ type: 1 });
 await db.collection('transactions').createIndex({ status: 1 });
 await db.collection('transactions').createIndex({ userId: 1, type: 1, status: 1 });
 console.log('[SUCCESS] Transactions indexes created');
 
 // Notifications Collection Indexes
 await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
 await db.collection('notifications').createIndex({ userId: 1, isRead: 1 });
 await db.collection('notifications').createIndex({ type: 1 });
 await db.collection('notifications').createIndex({ 
 expiresAt: 1 
 }, { 
 expireAfterSeconds: 0 
 }); // TTL index
 console.log('[SUCCESS] Notifications indexes created');
 
 // Support Tickets Collection Indexes
 await db.collection('supporttickets').createIndex({ ticketId: 1 }, { unique: true });
 await db.collection('supporttickets').createIndex({ userId: 1, status: 1 });
 await db.collection('supporttickets').createIndex({ status: 1, priority: 1 });
 console.log('[SUCCESS] Support tickets indexes created');
 
 console.log('\n[COMPLETED] All indexes created successfully');
 await mongoose.connection.close();
 process.exit(0);
 
 } catch (error) {
 console.error('[ERROR] Index creation failed:', error);
 process.exit(1);
 }
}

createIndexes();
```

**Index Performance Considerations:**

1. **Geospatial Indexes**: 
 - `2dsphere` indexes on `location` fields enable efficient proximity queries
 - Used for technician matching within radius
 - Query example: `db.users.find({ location: { $near: { $geometry: { type: "Point", coordinates: [36.8219, -1.2921] }, $maxDistance: 15000 } } })`

2. **Compound Indexes**: 
 - Optimize multi-field queries
 - Order matters: most selective fields first
 - Example: `{ userId: 1, status: 1, createdAt: -1 }` supports queries filtering by user and status, sorted by date

3. **Text Indexes** (future):
 - For full-text search on descriptions and reviews
 - `db.bookings.createIndex({ serviceDescription: "text" })`

4. **TTL Indexes**:
 - Automatic document expiration for notifications
 - Reduces database size by removing old data

### 6.4 Data Migration & Seeding

// Added: Database initialization and migration scripts

**Seed Script:**

```javascript
// scripts/seedDatabase.js
// Run: node scripts/seedDatabase.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../backend/models/User');
const Booking = require('../backend/models/Booking');
const Wallet = require('../backend/models/Wallet');

async function seedDatabase() {
 try {
 await mongoose.connect(process.env.MONGODB_URI);
 console.log('[INFO] Connected to MongoDB');
 
 // Clear existing data (DEVELOPMENT ONLY)
 if (process.env.NODE_ENV === 'development') {
 await User.deleteMany({});
 await Booking.deleteMany({});
 await Wallet.deleteMany({});
 console.log('[INFO] Cleared existing data');
 }
 
 // Create Admin User
 const hashedPassword = await bcrypt.hash('Admin@123', 10);
 const admin = await User.create({
 email: 'admin@quickfix.co.ke',
 password: hashedPassword,
 firstName: 'System',
 lastName: 'Administrator',
 phoneNumber: '+254700000000',
 role: 'admin',
 isVerified: true,
 isActive: true
 });
 console.log('[SUCCESS] Admin user created');
 
 // Create Sample Clients
 const clients = await User.create([
 {
 email: 'john.doe@example.com',
 password: await bcrypt.hash('Password123', 10),
 firstName: 'John',
 lastName: 'Doe',
 phoneNumber: '+254712345678',
 role: 'client',
 isVerified: true,
 location: {
 type: 'Point',
 coordinates: [36.8219, -1.2921] // Nairobi
 }
 },
 {
 email: 'jane.smith@example.com',
 password: await bcrypt.hash('Password123', 10),
 firstName: 'Jane',
 lastName: 'Smith',
 phoneNumber: '+254723456789',
 role: 'client',
 isVerified: true,
 location: {
 type: 'Point',
 coordinates: [36.7833, -1.2864] // Westlands
 }
 }
 ]);
 console.log(`[SUCCESS] Created ${clients.length} sample clients`);
 
 // Create Sample Technicians
 const technicians = await User.create([
 {
 email: 'tech.plumber@quickfix.co.ke',
 password: await bcrypt.hash('Password123', 10),
 firstName: 'David',
 lastName: 'Mwangi',
 phoneNumber: '+254734567890',
 role: 'technician',
 isVerified: true,
 location: {
 type: 'Point',
 coordinates: [36.8219, -1.2921]
 },
 technicianProfile: {
 skills: ['plumbing', 'general_maintenance'],
 experience: 5,
 serviceAreas: ['Nairobi', 'Westlands', 'Kilimani'],
 availability: {
 isAvailable: true
 },
 rating: {
 averageRating: 4.5,
 totalRatings: 23
 },
 verification: {
 status: 'approved',
 verifiedAt: new Date()
 }
 }
 },
 {
 email: 'tech.electrician@quickfix.co.ke',
 password: await bcrypt.hash('Password123', 10),
 firstName: 'Mary',
 lastName: 'Wanjiku',
 phoneNumber: '+254745678901',
 role: 'technician',
 isVerified: true,
 location: {
 type: 'Point',
 coordinates: [36.7833, -1.2864]
 },
 technicianProfile: {
 skills: ['electrical', 'appliance_repair'],
 experience: 7,
 serviceAreas: ['Nairobi', 'Westlands', 'Karen'],
 availability: {
 isAvailable: true
 },
 rating: {
 averageRating: 4.8,
 totalRatings: 45
 },
 verification: {
 status: 'approved',
 verifiedAt: new Date()
 }
 }
 }
 ]);
 console.log(`[SUCCESS] Created ${technicians.length} sample technicians`);
 
 // Create Wallets for all users
 const allUsers = [...clients, ...technicians, admin];
 for (const user of allUsers) {
 await Wallet.create({
 userId: user._id,
 balance: {
 available: user.role === 'client' ? 5000 : 0,
 escrow: 0,
 pending: 0
 },
 currency: 'KES',
 isActive: true
 });
 }
 console.log('[SUCCESS] Created wallets for all users');
 
 // Create Sample Bookings
 const sampleBookings = await Booking.create([
 {
 clientPhone: clients[0].phoneNumber,
 clientName: `${clients[0].firstName} ${clients[0].lastName}`,
 clientEmail: clients[0].email,
 userId: clients[0]._id,
 serviceType: 'plumbing',
 serviceDescription: 'Leaking kitchen sink needs repair',
 urgency: 'normal',
 location: {
 address: 'Westlands, Nairobi',
 coordinates: {
 latitude: -1.2652,
 longitude: 36.8097
 },
 detailedAddress: '123 Muthithi Road, Westlands'
 },
 preferredDate: new Date(Date.now() + 86400000), // Tomorrow
 preferredTime: 'morning',
 pricing: {
 basePrice: 1500,
 travelFee: 200,
 platformFee: 300,
 totalAmount: 1700,
 technicianEarnings: 1400
 },
 status: 'submitted'
 }
 ]);
 console.log(`[SUCCESS] Created ${sampleBookings.length} sample bookings`);
 
 console.log('\n[COMPLETED] Database seeding completed successfully');
 console.log('\nTest Credentials:');
 console.log('Admin: admin@quickfix.co.ke / Admin@123');
 console.log('Client: john.doe@example.com / Password123');
 console.log('Technician: tech.plumber@quickfix.co.ke / Password123');
 
 await mongoose.connection.close();
 process.exit(0);
 
 } catch (error) {
 console.error('[ERROR] Seeding failed:', error);
 process.exit(1);
 }
}

seedDatabase();
```

---

## 7. API Documentation

// Added: Complete REST API endpoint documentation with examples

### 7.1 API Architecture

**Base URL:**
- Production: `https://api.quickfix.co.ke/api`
- Development: `http://localhost:5000/api`

**API Version:** v1

**Authentication:** JWT Bearer Token (except public endpoints)

**Request Format:** JSON

**Response Format:** Standardized JSON structure:

```json
{
 "success": true/false,
 "message": "Human-readable message",
 "data": {...}, // Response payload
 "error": {...}, // Error details (only if success=false)
 "meta": {...} // Pagination, timestamps (optional)
}
```

### 7.2 Authentication Endpoints

#### 7.2.1 User Registration

```http
POST /api/auth/register
Content-Type: application/json

Request Body:
{
 "email": "user@example.com",
 "password": "SecurePass123",
 "firstName": "John",
 "lastName": "Doe",
 "phoneNumber": "0712345678",
 "role": "client" // "client" | "technician"
}

Success Response (201):
{
 "success": true,
 "message": "Registration successful. Please verify your email.",
 "data": {
 "userId": "507f1f77bcf86cd799439011",
 "email": "user@example.com",
 "verificationEmailSent": true
 }
}

Error Response (400):
{
 "success": false,
 "message": "Email already registered",
 "error": {
 "code": "EMAIL_EXISTS",
 "field": "email"
 }
}
```

#### 7.2.2 User Login

```http
POST /api/auth/login
Content-Type: application/json

Request Body:
{
 "emailOrPhone": "user@example.com",
 "password": "SecurePass123"
}

Success Response (200):
{
 "success": true,
 "message": "Login successful",
 "data": {
 "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 "user": {
 "id": "507f1f77bcf86cd799439011",
 "email": "user@example.com",
 "role": "client",
 "firstName": "John",
 "lastName": "Doe"
 }
 }
}
```

#### 7.2.3 Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

Request Body:
{
 "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Success Response (200):
{
 "success": true,
 "data": {
 "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 "expiresIn": 86400
 }
}
```

### 7.3 Booking Endpoints

#### 7.3.1 Create Booking

```http
POST /api/bookings/create
Authorization: Bearer {token} // Optional for guest bookings
Content-Type: application/json

Request Body:
{
 "serviceType": "plumbing",
 "serviceDescription": "Leaking kitchen sink",
 "location": {
 "address": "Westlands, Nairobi",
 "coordinates": {
 "latitude": -1.2652,
 "longitude": 36.8097
 }
 },
 "preferredDate": "2025-10-30T10:00:00Z",
 "urgency": "normal",
 "clientPhone": "0712345678",
 "clientName": "John Doe",
 "clientEmail": "john@example.com"
}

Success Response (201):
{
 "success": true,
 "message": "Booking created successfully",
 "data": {
 "bookingId": "QF202510291430ABC123",
 "_id": "507f1f77bcf86cd799439011",
 "status": "submitted",
 "estimatedPrice": 1700,
 "estimatedCompletionTime": "2-4 hours"
 }
}
```

#### 7.3.2 Get Booking Details

```http
GET /api/bookings/:bookingId
Authorization: Bearer {token}

Success Response (200):
{
 "success": true,
 "data": {
 "bookingId": "QF202510291430ABC123",
 "serviceType": "plumbing",
 "status": "assigned",
 "technician": {
 "name": "David Mwangi",
 "phone": "+254734567890",
 "rating": 4.5,
 "profileImage": "https://..."
 },
 "location": {...},
 "pricing": {...},
 "timeline": {
 "created": "2025-10-29T14:30:00Z",
 "assigned": "2025-10-29T14:45:00Z",
 "estimated_completion": "2025-10-30T12:00:00Z"
 }
 }
}
```

#### 7.3.3 Get User Bookings

```http
GET /api/bookings/my-bookings?page=1&limit=10&status=completed
Authorization: Bearer {token}

Success Response (200):
{
 "success": true,
 "data": {
 "bookings": [
 {
 "bookingId": "QF202510291430ABC123",
 "serviceType": "plumbing",
 "status": "completed",
 "totalAmount": 1700,
 "createdAt": "2025-10-29T14:30:00Z"
 }
 ],
 "pagination": {
 "currentPage": 1,
 "totalPages": 3,
 "totalBookings": 25,
 "limit": 10
 }
 }
}
```

#### 7.3.4 Cancel Booking

```http
POST /api/bookings/:bookingId/cancel
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
 "reason": "No longer need service",
 "cancelledBy": "client"
}

Success Response (200):
{
 "success": true,
 "message": "Booking cancelled successfully",
 "data": {
 "bookingId": "QF202510291430ABC123",
 "status": "cancelled",
 "refundAmount": 1700,
 "refundProcessingTime": "3-5 business days"
 }
}
```

### 7.4 Technician Endpoints

#### 7.4.1 Get Available Jobs

```http
GET /api/technician/available-jobs?page=1&limit=20
Authorization: Bearer {technicianToken}

Success Response (200):
{
 "success": true,
 "data": {
 "jobs": [
 {
 "bookingId": "QF202510291430ABC123",
 "serviceType": "plumbing",
 "description": "Leaking kitchen sink",
 "location": {
 "address": "Westlands, Nairobi",
 "distance": 3.5 // km from technician
 },
 "scheduledDate": "2025-10-30T10:00:00Z",
 "estimatedEarnings": 1400,
 "urgency": "normal"
 }
 ],
 "total": 5
 }
}
```

#### 7.4.2 Accept Job

```http
POST /api/technician/accept-job/:bookingId
Authorization: Bearer {technicianToken}
Content-Type: application/json

Request Body:
{
 "estimatedArrival": "2025-10-30T10:30:00Z",
 "notes": "I'll bring necessary tools"
}

Success Response (200):
{
 "success": true,
 "message": "Job accepted successfully",
 "data": {
 "bookingId": "QF202510291430ABC123",
 "customerContact": "+254712345678",
 "customerName": "John Doe",
 "earnings": 1400
 }
}
```

#### 7.4.3 Start Job

```http
POST /api/technician/start-job/:bookingId
Authorization: Bearer {technicianToken}

Success Response (200):
{
 "success": true,
 "message": "Job started",
 "data": {
 "bookingId": "QF202510291430ABC123",
 "status": "in_progress",
 "startedAt": "2025-10-30T10:15:00Z"
 }
}
```

#### 7.4.4 Complete Job

```http
POST /api/technician/complete-job/:bookingId
Authorization: Bearer {technicianToken}
Content-Type: multipart/form-data

Request Body:
{
 "completionNotes": "Fixed leak, replaced valve",
 "actualDuration": 120, // minutes
 "additionalCharges": [
 {
 "description": "Replacement parts",
 "amount": 500
 }
 ],
 "completionPhotos": [File, File]
}

Success Response (200):
{
 "success": true,
 "message": "Job marked as completed",
 "data": {
 "bookingId": "QF202510291430ABC123",
 "status": "completed",
 "finalAmount": 2200,
 "earnings": 1900,
 "awaitingCustomerApproval": true
 }
}
```

### 7.5 Payment Endpoints

#### 7.5.1 Get Wallet Balance

```http
GET /api/payments/wallet/balance
Authorization: Bearer {token}

Success Response (200):
{
 "success": true,
 "data": {
 "available": 5000,
 "escrow": 1500,
 "pending": 0,
 "total": 6500,
 "currency": "KES"
 }
}
```

#### 7.5.2 Add Funds (Deposit)

```http
POST /api/payments/wallet/deposit
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
 "amount": 2000,
 "phoneNumber": "0712345678",
 "method": "mpesa"
}

Success Response (200):
{
 "success": true,
 "message": "STK push sent to your phone",
 "data": {
 "transactionId": "TXN202510291500XYZ789",
 "amount": 2000,
 "status": "pending",
 "invoiceId": "INV123456"
 }
}
```

#### 7.5.3 Withdraw Funds

```http
POST /api/payments/wallet/withdraw
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
 "amount": 3000,
 "phoneNumber": "0712345678",
 "method": "mpesa"
}

Success Response (200):
{
 "success": true,
 "message": "Withdrawal initiated. Funds will be sent shortly.",
 "data": {
 "transactionId": "TXN202510291600ABC456",
 "amount": 3000,
 "fee": 50,
 "netAmount": 2950,
 "status": "processing"
 }
}
```

#### 7.5.4 Get Transaction History

```http
GET /api/payments/wallet/transactions?page=1&limit=20&type=deposit
Authorization: Bearer {token}

Success Response (200):
{
 "success": true,
 "data": {
 "transactions": [
 {
 "transactionId": "TXN202510291500XYZ789",
 "type": "deposit",
 "amount": 2000,
 "status": "completed",
 "description": "M-Pesa deposit",
 "timestamp": "2025-10-29T15:00:00Z"
 }
 ],
 "pagination": {
 "currentPage": 1,
 "totalPages": 5,
 "totalTransactions": 87
 }
 }
}
```

### 7.6 Admin Endpoints

#### 7.6.1 Get Dashboard Stats

```http
GET /api/admin/dashboard/stats
Authorization: Bearer {adminToken}

Success Response (200):
{
 "success": true,
 "data": {
 "users": {
 "total": 1547,
 "clients": 1235,
 "technicians": 310,
 "admins": 2
 },
 "bookings": {
 "today": 45,
 "thisWeek": 312,
 "thisMonth": 1205
 },
 "revenue": {
 "today": 12500,
 "thisWeek": 89400,
 "thisMonth": 345600
 },
 "averageRating": 4.6
 }
}
```

#### 7.6.2 Get All Users

```http
GET /api/admin/users?role=technician&status=active&page=1&limit=50
Authorization: Bearer {adminToken}

Success Response (200):
{
 "success": true,
 "data": {
 "users": [...],
 "pagination": {...}
 }
}
```

#### 7.6.3 Verify Technician

```http
POST /api/admin/technicians/:technicianId/verify
Authorization: Bearer {adminToken}
Content-Type: application/json

Request Body:
{
 "status": "approved", // "approved" | "rejected"
 "notes": "All documents verified"
}

Success Response (200):
{
 "success": true,
 "message": "Technician verified successfully",
 "data": {
 "technicianId": "507f1f77bcf86cd799439011",
 "verificationStatus": "approved"
 }
}
```

### 7.7 Error Codes

**Standard HTTP Status Codes:**

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST request creating resource |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid request data or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource or state conflict |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Server maintenance or overload |

**Custom Error Codes:**

```javascript
{
 "success": false,
 "message": "Email already registered",
 "error": {
 "code": "EMAIL_EXISTS",
 "field": "email",
 "details": "An account with this email already exists"
 }
}
```

---

## 8. Security Implementation

// Added: Comprehensive security measures and best practices

### 8.1 Authentication Security

#### 8.1.1 Password Security

**Hashing Strategy:**

```javascript
// Using bcrypt with salt rounds = 10
const bcrypt = require('bcryptjs');

// Hash password during registration
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password during login
const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (optional, recommended)

**Password Reset Security:**
- Reset tokens expire after 1 hour
- Tokens are single-use only
- Old passwords cannot be reused (last 5 passwords tracked)
- All active sessions invalidated after password change

#### 8.1.2 JWT Token Management

**Token Structure:**

```javascript
// Access Token (24-hour expiry)
const accessToken = jwt.sign(
 {
 userId: user._id,
 email: user.email,
 role: user.role
 },
 process.env.JWT_SECRET,
 { expiresIn: '24h' }
);

// Refresh Token (7-day expiry)
const refreshToken = jwt.sign(
 {
 userId: user._id,
 tokenVersion: user.tokenVersion // Incremented on logout
 },
 process.env.JWT_REFRESH_SECRET,
 { expiresIn: '7d' }
);
```

**Token Storage:**
- Mobile: Expo SecureStore (encrypted)
- Web: HttpOnly cookies (not accessible via JavaScript)
- Never stored in localStorage or sessionStorage

**Token Validation Middleware:**

```javascript
// middleware/auth.js
const authMiddleware = async (req, res, next) => {
 try {
 const token = req.headers.authorization?.split(' ')[1];
 
 if (!token) {
 return res.status(401).json({ 
 success: false, 
 message: 'Authentication required' 
 });
 }
 
 const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
 // Check if user still exists and is active
 const user = await User.findById(decoded.userId);
 if (!user || !user.isActive) {
 return res.status(401).json({ 
 success: false, 
 message: 'User not found or inactive' 
 });
 }
 
 req.user = decoded;
 next();
 
 } catch (error) {
 return res.status(401).json({ 
 success: false, 
 message: 'Invalid or expired token' 
 });
 }
};
```

### 8.2 API Security

#### 8.2.1 Rate Limiting

**Implementation:**

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 100, // Max 100 requests per window
 message: {
 success: false,
 message: 'Too many requests, please try again later'
 },
 standardHeaders: true,
 legacyHeaders: false
});

// Auth-specific rate limiter (stricter)
const authLimiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 5, // Max 5 login attempts per 15 minutes
 skipSuccessfulRequests: true,
 message: {
 success: false,
 message: 'Too many login attempts, please try again in 15 minutes'
 }
});

// Apply limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

#### 8.2.2 Input Validation & Sanitization

**Using express-validator:**

```javascript
// validators/booking.js
const { body, validationResult } = require('express-validator');

const validateBookingCreation = [
 body('serviceType')
 .isIn(['plumbing', 'electrical', 'carpentry', ...])
 .withMessage('Invalid service type'),
 
 body('serviceDescription')
 .trim()
 .isLength({ min: 10, max: 1000 })
 .withMessage('Description must be 10-1000 characters')
 .escape(), // Prevent XSS
 
 body('clientPhone')
 .matches(/^(\+?254|0)[1-9]\d{8}$/)
 .withMessage('Invalid Kenyan phone number'),
 
 body('location.coordinates.latitude')
 .isFloat({ min: -90, max: 90 })
 .withMessage('Invalid latitude'),
 
 body('location.coordinates.longitude')
 .isFloat({ min: -180, max: 180 })
 .withMessage('Invalid longitude'),
 
 // Validation result handler
 (req, res, next) => {
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
 return res.status(422).json({ 
 success: false, 
 message: 'Validation failed',
 errors: errors.array() 
 });
 }
 next();
 }
];

module.exports = { validateBookingCreation };
```

#### 8.2.3 SQL/NoSQL Injection Prevention

**MongoDB Injection Prevention:**

```javascript
// Using Mongoose parameterized queries (built-in protection)
const user = await User.findOne({ email: userEmail }); // Safe

// Avoid using $where or direct eval
// BAD: User.find({ $where: `this.email == '${email}'` }) // Vulnerable!

// Sanitize input
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize()); // Removes $ and . from user input
```

#### 8.2.4 CORS Configuration

```javascript
// backend/server.js
const cors = require('cors');

const corsOptions = {
 origin: function (origin, callback) {
 const allowedOrigins = [
 'https://quickfix.co.ke',
 'https://www.quickfix.co.ke',
 'https://admin.quickfix.co.ke',
 'http://localhost:3000', // Development only
 'exp://192.168.1.100:8081' // React Native dev
 ];
 
 if (!origin || allowedOrigins.indexOf(origin) !== -1) {
 callback(null, true);
 } else {
 callback(new Error('Not allowed by CORS'));
 }
 },
 credentials: true,
 optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 8.3 Data Protection

#### 8.3.1 Environment Variables

```bash
# .env (NEVER commit to version control)
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quickfix?retryWrites=true&w=majority

# JWT Secrets (Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=a7f8d9e6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8
JWT_REFRESH_SECRET=f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7

# IntaSend
INTASEND_PUBLISHABLE_KEY=ISPubKey_live_a8e1266e-b13c-46f2-895c-7f06e2b52ff5
INTASEND_SECRET_KEY=ISSecretKey_live_9543caf6-ec49-4803-959e-f3ef89f97640

# Email
GMAIL_USER=quickfix.notifications@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# App
BACKEND_URL=https://api.quickfix.co.ke
FRONTEND_URL=https://quickfix.co.ke
```

**Environment Variable Loading:**

```javascript
// Load environment variables
require('dotenv').config();

// Validate required env vars
const requiredEnvVars = [
 'MONGODB_URI',
 'JWT_SECRET',
 'INTASEND_SECRET_KEY',
 'GMAIL_USER'
];

requiredEnvVars.forEach(envVar => {
 if (!process.env[envVar]) {
 console.error(`ERROR: Missing required environment variable: ${envVar}`);
 process.exit(1);
 }
});
```

#### 8.3.2 Sensitive Data Encryption

**Encrypting Sensitive Fields:**

```javascript
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

function encrypt(text) {
 const iv = crypto.randomBytes(16);
 const cipher = crypto.createCipheriv(algorithm, key, iv);
 let encrypted = cipher.update(text, 'utf8', 'hex');
 encrypted += cipher.final('hex');
 return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
 const parts = text.split(':');
 const iv = Buffer.from(parts[0], 'hex');
 const encryptedText = parts[1];
 const decipher = crypto.createDecipheriv(algorithm, key, iv);
 let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
 decrypted += decipher.final('utf8');
 return decrypted;
}

// Usage: Encrypt payment method details
user.paymentMethods[0].accountNumber = encrypt(accountNumber);
```

### 8.4 Payment Security

#### 8.4.1 PCI Compliance

**Best Practices:**
1. **Never store full card numbers** - Use tokenization (IntaSend handles this)
2. **Secure transmission** - All payment data sent over HTTPS only
3. **Minimal data retention** - Only store last 4 digits and expiry
4. **Access logging** - Track all access to payment data

#### 8.4.2 Transaction Verification

```javascript
// Verify IntaSend webhook signature
function verifyWebhookSignature(payload, signature, secret) {
 const crypto = require('crypto');
 const hmac = crypto.createHmac('sha256', secret);
 const computedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
 return crypto.timingSafeEqual(
 Buffer.from(signature),
 Buffer.from(computedSignature)
 );
}

// In webhook handler
const signature = req.headers['x-intasend-signature'];
const isValid = verifyWebhookSignature(req.body, signature, process.env.INTASEND_SECRET_KEY);

if (!isValid) {
 return res.status(401).json({ error: 'Invalid signature' });
}
```

### 8.5 Infrastructure Security

#### 8.5.1 HTTPS/TLS

**Certificate Management:**
- Use Let's Encrypt for free SSL certificates
- Auto-renewal configured via Certbot
- Force HTTPS redirect in production

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
 app.use((req, res, next) => {
 if (req.header('x-forwarded-proto') !== 'https') {
 return res.redirect(`https://${req.header('host')}${req.url}`);
 }
 next();
 });
}
```

#### 8.5.2 Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
 contentSecurityPolicy: {
 directives: {
 defaultSrc: ["'self'"],
 styleSrc: ["'self'", "'unsafe-inline'"],
 scriptSrc: ["'self'"],
 imgSrc: ["'self'", 'data:', 'https:']
 }
 },
 hsts: {
 maxAge: 31536000,
 includeSubDomains: true,
 preload: true
 }
}));

// Additional headers
app.use((req, res, next) => {
 res.setHeader('X-Content-Type-Options', 'nosniff');
 res.setHeader('X-Frame-Options', 'DENY');
 res.setHeader('X-XSS-Protection', '1; mode=block');
 next();
});
```

---

## 9. Testing Strategy

// Added: Comprehensive testing approach across all layers

### 9.1 Testing Pyramid

```
 /\
 / \ E2E Tests (10%)
 /----\
 / \ Integration Tests (30%)
 /--------\
 / \ Unit Tests (60%)
 /____________\
```

### 9.2 Unit Testing

**Framework:** Jest + Supertest

**Coverage Target:** >80% for critical functions

**Example: User Service Unit Test**

```javascript
// tests/unit/services/userService.test.js

const UserService = require('../../backend/services/UserService');
const User = require('../../backend/models/User');
const bcrypt = require('bcryptjs');

// Mock dependencies
jest.mock('../../backend/models/User');
jest.mock('bcryptjs');

describe('UserService', () => {
 
 describe('registerUser', () => {
 
 it('should successfully register a new user', async () => {
 // Arrange
 const userData = {
 email: 'test@example.com',
 password: 'Password123',
 firstName: 'Test',
 lastName: 'User',
 phoneNumber: '0712345678',
 role: 'client'
 };
 
 User.findOne.mockResolvedValue(null); // User doesn't exist
 bcrypt.hash.mockResolvedValue('hashedPassword123');
 User.create.mockResolvedValue({
 _id: 'user123',
 ...userData,
 password: 'hashedPassword123'
 });
 
 // Act
 const result = await UserService.registerUser(userData);
 
 // Assert
 expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
 expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
 expect(User.create).toHaveBeenCalled();
 expect(result.email).toBe(userData.email);
 expect(result.password).toBe('hashedPassword123');
 });
 
 it('should throw error if email already exists', async () => {
 // Arrange
 const userData = {
 email: 'existing@example.com',
 password: 'Password123',
 phoneNumber: '0712345678'
 };
 
 User.findOne.mockResolvedValue({ email: userData.email });
 
 // Act & Assert
 await expect(UserService.registerUser(userData))
 .rejects
 .toThrow('Email already registered');
 });
 
 it('should validate phone number format', async () => {
 // Arrange
 const userData = {
 email: 'test@example.com',
 password: 'Password123',
 phoneNumber: '12345' // Invalid format
 };
 
 // Act & Assert
 await expect(UserService.registerUser(userData))
 .rejects
 .toThrow('Invalid phone number format');
 });
 });
 
 describe('loginUser', () => {
 
 it('should successfully login with correct credentials', async () => {
 // Arrange
 const credentials = {
 email: 'test@example.com',
 password: 'Password123'
 };
 
 const mockUser = {
 _id: 'user123',
 email: credentials.email,
 password: 'hashedPassword123',
 role: 'client',
 isActive: true
 };
 
 User.findOne.mockResolvedValue(mockUser);
 bcrypt.compare.mockResolvedValue(true);
 
 // Act
 const result = await UserService.loginUser(credentials.email, credentials.password);
 
 // Assert
 expect(User.findOne).toHaveBeenCalledWith({ email: credentials.email });
 expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
 expect(result.accessToken).toBeDefined();
 expect(result.user.email).toBe(credentials.email);
 });
 
 it('should fail login with incorrect password', async () => {
 // Arrange
 const credentials = {
 email: 'test@example.com',
 password: 'WrongPassword'
 };
 
 User.findOne.mockResolvedValue({
 _id: 'user123',
 email: credentials.email,
 password: 'hashedPassword123'
 });
 bcrypt.compare.mockResolvedValue(false);
 
 // Act & Assert
 await expect(UserService.loginUser(credentials.email, credentials.password))
 .rejects
 .toThrow('Invalid credentials');
 });
 });
});
```

### 9.3 Integration Testing

**Framework:** Jest + Supertest + MongoDB Memory Server

**Example: Booking API Integration Test**

```javascript
// tests/integration/bookings.test.js

const request = require('supertest');
const app = require('../../backend/server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../backend/models/User');
const Booking = require('../../backend/models/Booking');

let mongoServer;
let authToken;
let userId;

beforeAll(async () => {
 // Start in-memory MongoDB
 mongoServer = await MongoMemoryServer.create();
 const mongoUri = mongoServer.getUri();
 await mongoose.connect(mongoUri);
 
 // Create test user and get auth token
 const user = await User.create({
 email: 'test@example.com',
 password: await bcrypt.hash('Password123', 10),
 firstName: 'Test',
 lastName: 'User',
 phoneNumber: '0712345678',
 role: 'client',
 isVerified: true
 });
 
 userId = user._id;
 
 const loginResponse = await request(app)
 .post('/api/auth/login')
 .send({
 emailOrPhone: 'test@example.com',
 password: 'Password123'
 });
 
 authToken = loginResponse.body.data.accessToken;
});

afterAll(async () => {
 await mongoose.disconnect();
 await mongoServer.stop();
});

describe('POST /api/bookings/create', () => {
 
 it('should create booking with valid data', async () => {
 // Arrange
 const bookingData = {
 serviceType: 'plumbing',
 serviceDescription: 'Leaking kitchen sink',
 location: {
 address: 'Westlands, Nairobi',
 coordinates: {
 latitude: -1.2652,
 longitude: 36.8097
 }
 },
 preferredDate: new Date(Date.now() + 86400000).toISOString(),
 urgency: 'normal',
 clientPhone: '0712345678',
 clientName: 'Test User'
 };
 
 // Act
 const response = await request(app)
 .post('/api/bookings/create')
 .set('Authorization', `Bearer ${authToken}`)
 .send(bookingData)
 .expect(201);
 
 // Assert
 expect(response.body.success).toBe(true);
 expect(response.body.data.bookingId).toBeDefined();
 expect(response.body.data.status).toBe('submitted');
 
 // Verify database
 const booking = await Booking.findOne({ bookingId: response.body.data.bookingId });
 expect(booking).toBeDefined();
 expect(booking.serviceType).toBe('plumbing');
 expect(booking.userId.toString()).toBe(userId.toString());
 });
 
 it('should reject booking with invalid service type', async () => {
 // Arrange
 const bookingData = {
 serviceType: 'invalid_service',
 serviceDescription: 'Test description',
 location: {
 address: 'Nairobi',
 coordinates: { latitude: -1.2921, longitude: 36.8219 }
 },
 preferredDate: new Date(Date.now() + 86400000).toISOString(),
 clientPhone: '0712345678'
 };
 
 // Act
 const response = await request(app)
 .post('/api/bookings/create')
 .set('Authorization', `Bearer ${authToken}`)
 .send(bookingData)
 .expect(422);
 
 // Assert
 expect(response.body.success).toBe(false);
 expect(response.body.message).toContain('Invalid service type');
 });
 
 it('should require authentication', async () => {
 // Act
 const response = await request(app)
 .post('/api/bookings/create')
 .send({})
 .expect(401);
 
 // Assert
 expect(response.body.success).toBe(false);
 expect(response.body.message).toContain('Authentication required');
 });
});
```

### 9.4 End-to-End Testing

**Framework:** Playwright (for web) / Detox (for mobile)

**Example: Complete Booking Flow E2E Test**

```javascript
// tests/e2e/booking-flow.spec.js

const { test, expect } = require('@playwright/test');

test.describe('Complete Booking Flow', () => {
 
 test.beforeEach(async ({ page }) => {
 // Login
 await page.goto('https://quickfix.co.ke/login');
 await page.fill('input[name="email"]', 'test@example.com');
 await page.fill('input[name="password"]', 'Password123');
 await page.click('button[type="submit"]');
 await expect(page).toHaveURL(/.*dashboard/);
 });
 
 test('should complete full booking workflow', async ({ page }) => {
 // 1. Navigate to create booking
 await page.click('text=New Booking');
 await expect(page).toHaveURL(/.*bookings\/create/);
 
 // 2. Select service type
 await page.click('[data-testid="service-plumbing"]');
 await page.click('text=Next');
 
 // 3. Enter service description
 await page.fill('textarea[name="description"]', 'Kitchen sink is leaking badly');
 await page.click('text=Next');
 
 // 4. Set location
 await page.click('[data-testid="use-current-location"]');
 await page.waitForTimeout(2000); // Wait for geolocation
 await page.click('text=Next');
 
 // 5. Schedule service
 await page.click('[data-testid="date-picker"]');
 await page.click('text=Tomorrow');
 await page.click('[data-testid="time-morning"]');
 await page.click('text=Next');
 
 // 6. Review and confirm
 await expect(page.locator('[data-testid="service-type"]')).toHaveText('Plumbing');
 await expect(page.locator('[data-testid="estimated-price"]')).toContainText('KES 1,700');
 await page.click('button:has-text("Confirm Booking")');
 
 // 7. Verify success
 await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
 await expect(page.locator('[data-testid="booking-id"]')).toBeVisible();
 
 // 8. Navigate to booking details
 const bookingId = await page.locator('[data-testid="booking-id"]').textContent();
 await page.click('text=View Details');
 await expect(page).toHaveURL(new RegExp(`.*bookings/${bookingId}`));
 
 // 9. Verify booking details
 await expect(page.locator('[data-testid="status"]')).toHaveText('Submitted');
 await expect(page.locator('[data-testid="service-description"]')).toContainText('Kitchen sink');
 });
});
```

### 9.5 Test Coverage

**Jest Configuration:**

```javascript
// jest.config.js

module.exports = {
 testEnvironment: 'node',
 coverageDirectory: 'coverage',
 collectCoverageFrom: [
 'backend/**/*.js',
 '!backend/node_modules/**',
 '!backend/tests/**',
 '!backend/server.js'
 ],
 coverageThreshold: {
 global: {
 branches: 80,
 functions: 80,
 lines: 80,
 statements: 80
 }
 },
 testMatch: [
 '**/tests/unit/**/*.test.js',
 '**/tests/integration/**/*.test.js'
 ],
 setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

**Running Tests:**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- tests/unit/services/userService.test.js

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

---

**[End of Annotated Draft Part 3 (Sections 6-9) — Continued in Part 3B]**

**End of Annotated Draft Part 3 — Edited by Copilot on 2025-10-29**
