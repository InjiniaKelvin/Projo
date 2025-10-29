# QuickFix Documentation - Annotated Draft Part 4
**Continuation from Parts 1, 2 & 3**

**Sections 10-13: Deployment through Known Issues & Limitations**

---

## 10. Deployment Guide

// Added: Complete production deployment procedures and infrastructure setup

### 10.1 Infrastructure Overview

**Deployment Architecture:**

```mermaid
graph TB
 subgraph "Client Layer"
 A[Mobile App - Expo]
 B[Web Dashboard]
 end
 
 subgraph "CDN Layer"
 C[CloudFlare CDN]
 end
 
 subgraph "Application Layer"
 D[Node.js Backend - Render]
 E[Socket.IO Server]
 end
 
 subgraph "Data Layer"
 F[MongoDB Atlas]
 G[Redis Cache]
 end
 
 subgraph "External Services"
 H[IntaSend Payment]
 I[Gmail SMTP]
 J[Expo Push Notifications]
 end
 
 A --> C
 B --> C
 C --> D
 C --> E
 D --> F
 D --> G
 D --> H
 D --> I
 E --> J
 
 style D fill:#4CAF50
 style F fill:#4CAF50
 style H fill:#FF9800
```

**Caption**: QuickFix deployment architecture showing client applications, application servers, databases, and external service integrations.

### 10.2 Environment Setup

#### 10.2.1 Production Environment Variables

```bash
# .env.production

# =======================
# APPLICATION CONFIGURATION
# =======================
NODE_ENV=production
PORT=5000
BACKEND_URL=https://api.quickfix.co.ke
FRONTEND_URL=https://quickfix.co.ke
APP_NAME=QuickFix

# =======================
# DATABASE CONFIGURATION
# =======================
MONGODB_URI=mongodb+srv://quickfix_prod:SECURE_PASSWORD@cluster0.mongodb.net/quickfix_production?retryWrites=true&w=majority
MONGODB_DB_NAME=quickfix_production

# =======================
# JWT CONFIGURATION
# =======================
# Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=a7f8d9e6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8
JWT_REFRESH_SECRET=f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# =======================
# INTASEND PAYMENT GATEWAY (PRODUCTION)
# =======================
INTASEND_PUBLISHABLE_KEY=ISPubKey_live_a8e1266e-b13c-46f2-895c-7f06e2b52ff5
INTASEND_SECRET_KEY=ISSecretKey_live_9543caf6-ec49-4803-959e-f3ef89f97640
INTASEND_ENVIRONMENT=live
INTASEND_API_URL=https://payment.intasend.com/api/v1/

# =======================
# EMAIL CONFIGURATION
# =======================
GMAIL_USER=quickfix.notifications@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=QuickFix <quickfix.notifications@gmail.com>

# =======================
# EXPO PUSH NOTIFICATIONS
# =======================
EXPO_ACCESS_TOKEN=your_expo_access_token_here

# =======================
# REDIS CONFIGURATION (Optional - for caching)
# =======================
REDIS_URL=redis://default:password@redis-server.com:6379

# =======================
# CLOUDINARY (Image Upload - Optional)
# =======================
CLOUDINARY_CLOUD_NAME=quickfix-cloud
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# =======================
# SECURITY
# =======================
ENCRYPTION_KEY=your_32_character_encryption_key_here
SESSION_SECRET=your_session_secret_here

# =======================
# LOGGING & MONITORING
# =======================
LOG_LEVEL=info
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# =======================
# CORS ALLOWED ORIGINS
# =======================
CORS_ORIGINS=https://quickfix.co.ke,https://www.quickfix.co.ke,https://admin.quickfix.co.ke

# =======================
# RATE LIMITING
# =======================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 10.2.2 Backend Deployment (Render.com)

**Step 1: Prepare Repository**

```bash
# Ensure all dependencies are in package.json
npm install --save bcryptjs cors dotenv express express-mongo-sanitize
npm install --save express-rate-limit express-validator helmet jsonwebtoken
npm install --save mongoose nodemailer socket.io axios

# Create start script in package.json
{
 "scripts": {
 "start": "node index.js",
 "dev": "nodemon index.js",
 "test": "jest --coverage",
 "seed": "node scripts/seedDatabase.js"
 },
 "engines": {
 "node": "18.x",
 "npm": "9.x"
 }
}
```

**Step 2: Create Render Configuration**

```yaml
# render.yaml
services:
 - type: web
 name: quickfix-backend
 env: node
 plan: starter
 buildCommand: npm install
 startCommand: npm start
 envVars:
 - key: NODE_ENV
 value: production
 - key: MONGODB_URI
 sync: false
 - key: JWT_SECRET
 generateValue: true
 - key: PORT
 value: 5000
 healthCheckPath: /api/health
 autoDeploy: true
```

**Step 3: Deploy to Render**

```bash
# 1. Push code to GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main

# 2. Connect repository to Render
# - Go to https://dashboard.render.com
# - Click "New +" → "Web Service"
# - Connect GitHub repository
# - Select branch: main
# - Configure environment variables from .env.production
# - Click "Create Web Service"

# 3. Monitor deployment logs
# Deployment URL: https://quickfix-backend.onrender.com
```

**Step 4: Configure Custom Domain**

```bash
# In Render dashboard:
# 1. Go to Settings → Custom Domain
# 2. Add domain: api.quickfix.co.ke
# 3. Update DNS records:

# DNS Configuration (Namecheap/Cloudflare):
Type: CNAME
Host: api
Value: quickfix-backend.onrender.com
TTL: Auto
```

**Step 5: Health Check Endpoint**

```javascript
// backend/routes/health.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', async (req, res) => {
 const healthCheck = {
 status: 'OK',
 timestamp: new Date().toISOString(),
 uptime: process.uptime(),
 environment: process.env.NODE_ENV,
 checks: {
 database: 'unknown',
 memory: process.memoryUsage(),
 cpu: process.cpuUsage()
 }
 };
 
 try {
 // Check database connection
 const dbState = mongoose.connection.readyState;
 healthCheck.checks.database = dbState === 1 ? 'connected' : 'disconnected';
 
 if (dbState === 1) {
 res.status(200).json(healthCheck);
 } else {
 res.status(503).json({ ...healthCheck, status: 'ERROR' });
 }
 } catch (error) {
 healthCheck.status = 'ERROR';
 healthCheck.error = error.message;
 res.status(503).json(healthCheck);
 }
});

module.exports = router;
```

#### 10.2.3 MongoDB Atlas Production Setup

**Step 1: Create Production Cluster**

```bash
# 1. Login to MongoDB Atlas: https://cloud.mongodb.com
# 2. Create new cluster:
# - Provider: AWS
# - Region: eu-west-1 (Ireland) or us-east-1 (N. Virginia)
# - Cluster Tier: M10 (Dedicated) or higher
# - Cluster Name: QuickFix-Production

# 3. Configure network access:
# - Add IP: 0.0.0.0/0 (Allow from anywhere - for Render)
# - Or specific Render IP ranges

# 4. Create database user:
# - Username: quickfix_prod
# - Password: [Generate strong password]
# - Role: readWrite on quickfix_production database
```

**Step 2: Configure Database**

```javascript
// backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
 try {
 const options = {
 useNewUrlParser: true,
 useUnifiedTopology: true,
 maxPoolSize: 10,
 serverSelectionTimeoutMS: 5000,
 socketTimeoutMS: 45000,
 retryWrites: true,
 w: 'majority'
 };
 
 await mongoose.connect(process.env.MONGODB_URI, options);
 
 console.log(`[SUCCESS] MongoDB Connected: ${mongoose.connection.host}`);
 console.log(`[INFO] Database: ${mongoose.connection.name}`);
 
 // Handle connection events
 mongoose.connection.on('error', (err) => {
 console.error('[ERROR] MongoDB connection error:', err);
 });
 
 mongoose.connection.on('disconnected', () => {
 console.warn('[WARNING] MongoDB disconnected. Attempting to reconnect...');
 });
 
 mongoose.connection.on('reconnected', () => {
 console.log('[SUCCESS] MongoDB reconnected');
 });
 
 } catch (error) {
 console.error('[ERROR] MongoDB connection failed:', error.message);
 process.exit(1);
 }
};

module.exports = connectDB;
```

**Step 3: Create Indexes**

```bash
# Run index creation script after deployment
node scripts/create-indexes.js

# Or manually in MongoDB Atlas:
# 1. Go to Collections → Create Index
# 2. Add indexes as documented in Section 6.3
```

**Step 4: Backup Configuration**

```bash
# MongoDB Atlas automatic backups (enabled by default on M10+)
# - Continuous backups every 12 hours
# - Point-in-time recovery
# - Retention: 7 days (configurable)

# Manual backup script:
mongodump --uri="mongodb+srv://quickfix_prod:PASSWORD@cluster0.mongodb.net/quickfix_production" --out=./backup-$(date +%Y%m%d)
```

#### 10.2.4 Mobile App Deployment (Expo)

**Step 1: Configure app.json**

```json
{
 "expo": {
 "name": "QuickFix",
 "slug": "quickfix",
 "version": "1.0.0",
 "orientation": "portrait",
 "icon": "./assets/icon.png",
 "userInterfaceStyle": "light",
 "splash": {
 "image": "./assets/splash.png",
 "resizeMode": "contain",
 "backgroundColor": "#ffffff"
 },
 "updates": {
 "fallbackToCacheTimeout": 0,
 "url": "https://u.expo.dev/your-project-id"
 },
 "assetBundlePatterns": [
 "**/*"
 ],
 "ios": {
 "supportsTablet": true,
 "bundleIdentifier": "com.quickfix.app",
 "buildNumber": "1.0.0",
 "infoPlist": {
 "NSLocationWhenInUseUsageDescription": "QuickFix needs your location to find nearby technicians",
 "NSCameraUsageDescription": "QuickFix needs camera access to upload service photos"
 }
 },
 "android": {
 "adaptiveIcon": {
 "foregroundImage": "./assets/adaptive-icon.png",
 "backgroundColor": "#FFFFFF"
 },
 "package": "com.quickfix.app",
 "versionCode": 1,
 "permissions": [
 "ACCESS_FINE_LOCATION",
 "CAMERA",
 "READ_EXTERNAL_STORAGE",
 "WRITE_EXTERNAL_STORAGE"
 ]
 },
 "web": {
 "favicon": "./assets/favicon.png"
 },
 "extra": {
 "apiUrl": "https://api.quickfix.co.ke/api",
 "eas": {
 "projectId": "your-eas-project-id"
 }
 }
 }
}
```

**Step 2: Build and Submit**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios

# Monitor build status
eas build:list
```

**Step 3: Over-the-Air (OTA) Updates**

```bash
# Configure EAS Update
eas update:configure

# Publish update
eas update --branch production --message "Bug fixes and performance improvements"

# View update history
eas update:list
```

### 10.3 CI/CD Pipeline

// Added: Automated deployment pipeline using GitHub Actions

#### 10.3.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
 push:
 branches:
 - main
 pull_request:
 branches:
 - main

jobs:
 test:
 name: Run Tests
 runs-on: ubuntu-latest
 
 steps:
 - name: Checkout code
 uses: actions/checkout@v3
 
 - name: Setup Node.js
 uses: actions/setup-node@v3
 with:
 node-version: '18'
 cache: 'npm'
 
 - name: Install dependencies
 run: npm ci
 
 - name: Run linter
 run: npm run lint
 
 - name: Run unit tests
 run: npm run test:unit
 
 - name: Run integration tests
 run: npm run test:integration
 
 - name: Upload coverage
 uses: codecov/codecov-action@v3
 with:
 files: ./coverage/coverage-final.json
 flags: unittests
 name: codecov-umbrella

 deploy-backend:
 name: Deploy Backend to Render
 needs: test
 runs-on: ubuntu-latest
 if: github.ref == 'refs/heads/main'
 
 steps:
 - name: Checkout code
 uses: actions/checkout@v3
 
 - name: Trigger Render deployment
 run: |
 curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
 
 - name: Wait for deployment
 run: sleep 60
 
 - name: Health check
 run: |
 response=$(curl -s -o /dev/null -w "%{http_code}" https://api.quickfix.co.ke/api/health)
 if [ $response -eq 200 ]; then
 echo "[COMPLETED] Deployment successful"
 else
 echo "[FAILED] Deployment failed - Health check returned $response"
 exit 1
 fi

 deploy-mobile:
 name: Build and Deploy Mobile App
 needs: test
 runs-on: ubuntu-latest
 if: github.ref == 'refs/heads/main'
 
 steps:
 - name: Checkout code
 uses: actions/checkout@v3
 
 - name: Setup Node.js
 uses: actions/setup-node@v3
 with:
 node-version: '18'
 
 - name: Setup Expo
 uses: expo/expo-github-action@v8
 with:
 expo-version: latest
 eas-version: latest
 token: ${{ secrets.EXPO_TOKEN }}
 
 - name: Install dependencies
 run: npm ci
 
 - name: Publish OTA update
 run: eas update --branch production --message "${{ github.event.head_commit.message }}" --non-interactive

 notify:
 name: Send Deployment Notification
 needs: [deploy-backend, deploy-mobile]
 runs-on: ubuntu-latest
 if: always()
 
 steps:
 - name: Send Slack notification
 uses: 8398a7/action-slack@v3
 with:
 status: ${{ job.status }}
 text: |
 Deployment Status: ${{ job.status }}
 Commit: ${{ github.event.head_commit.message }}
 Author: ${{ github.actor }}
 webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

#### 10.3.2 Pre-deployment Checklist

```markdown
# Pre-Deployment Checklist

## Code Quality
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage above 80%
- [ ] No linting errors
- [ ] No security vulnerabilities (npm audit)
- [ ] Code reviewed and approved

## Configuration
- [ ] Environment variables configured
- [ ] Secrets stored securely (not in code)
- [ ] Database connection strings updated
- [ ] API keys verified (IntaSend, Gmail, Expo)
- [ ] CORS origins configured correctly

## Database
- [ ] Database indexes created
- [ ] Migrations executed successfully
- [ ] Backup created before deployment
- [ ] Seeding data prepared (if needed)

## Security
- [ ] SSL certificates configured
- [ ] Security headers enabled (helmet.js)
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Authentication/authorization tested

## Monitoring
- [ ] Logging configured
- [ ] Error tracking enabled (Sentry)
- [ ] Performance monitoring setup
- [ ] Health check endpoint working
- [ ] Alerts configured

## Documentation
- [ ] API documentation updated
- [ ] README updated with deployment instructions
- [ ] Changelog updated
- [ ] Known issues documented

## Communication
- [ ] Team notified of deployment window
- [ ] Maintenance page ready (if needed)
- [ ] Rollback plan documented
- [ ] Support team briefed on changes
```

### 10.4 Post-Deployment Verification

```bash
# 1. Verify API health
curl https://api.quickfix.co.ke/api/health

# 2. Test authentication
curl -X POST https://api.quickfix.co.ke/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"emailOrPhone":"test@example.com","password":"Password123"}'

# 3. Verify database connection
curl https://api.quickfix.co.ke/api/admin/dashboard/stats \
 -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 4. Test payment gateway
# (Manual test through mobile app)

# 5. Check logs
# Render Dashboard → Logs → Filter by severity

# 6. Monitor error rates
# Sentry Dashboard → Check for new errors

# 7. Test push notifications
# Send test notification through admin panel

# 8. Verify email delivery
# Test registration flow to receive verification email
```

---

## 11. Maintenance & Monitoring

// Added: Operational procedures for system health and performance tracking

### 11.1 Logging Strategy

#### 11.1.1 Winston Logger Configuration

```javascript
// backend/config/logger.js
const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
 winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
 winston.format.errors({ stack: true }),
 winston.format.splat(),
 winston.format.json()
);

const logger = winston.createLogger({
 level: process.env.LOG_LEVEL || 'info',
 format: logFormat,
 defaultMeta: { service: 'quickfix-backend' },
 transports: [
 // Write all logs to combined.log
 new winston.transports.File({
 filename: path.join(__dirname, '../logs/combined.log'),
 maxsize: 5242880, // 5MB
 maxFiles: 5
 }),
 
 // Write errors to error.log
 new winston.transports.File({
 filename: path.join(__dirname, '../logs/error.log'),
 level: 'error',
 maxsize: 5242880,
 maxFiles: 5
 }),
 
 // Console output for development
 new winston.transports.Console({
 format: winston.format.combine(
 winston.format.colorize(),
 winston.format.simple()
 )
 })
 ]
});

// Production: Send logs to external service (Logtail, DataDog, etc.)
if (process.env.NODE_ENV === 'production') {
 logger.add(new winston.transports.Http({
 host: 'logs.example.com',
 port: 443,
 path: '/log',
 ssl: true
 }));
}

module.exports = logger;
```

**Usage in Application:**

```javascript
// backend/routes/bookings.js
const logger = require('../config/logger');

router.post('/create', authMiddleware, async (req, res) => {
 try {
 logger.info('Booking creation initiated', {
 userId: req.user.userId,
 serviceType: req.body.serviceType,
 location: req.body.location.address
 });
 
 const booking = await BookingService.createBooking(req.body);
 
 logger.info('Booking created successfully', {
 bookingId: booking.bookingId,
 userId: req.user.userId
 });
 
 return res.status(201).json({
 success: true,
 data: booking
 });
 
 } catch (error) {
 logger.error('Booking creation failed', {
 userId: req.user.userId,
 error: error.message,
 stack: error.stack
 });
 
 return res.status(500).json({
 success: false,
 message: 'Failed to create booking'
 });
 }
});
```

#### 11.1.2 Log Levels and Categories

| Level | Description | Usage | Examples |
|-------|-------------|-------|----------|
| `error` | System errors requiring immediate attention | Failed operations, crashes | Database connection lost, payment gateway timeout |
| `warn` | Warning conditions that should be reviewed | Non-critical issues | High memory usage, slow query detected |
| `info` | General informational messages | Key system events | User registration, booking created, payment completed |
| `http` | HTTP request logging | All API requests | `POST /api/bookings/create - 201 - 245ms` |
| `debug` | Detailed debugging information | Development troubleshooting | Function parameters, intermediate values |

### 11.2 Error Tracking

#### 11.2.1 Sentry Integration

```javascript
// backend/config/sentry.js
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

const initSentry = (app) => {
 if (process.env.NODE_ENV === 'production') {
 Sentry.init({
 dsn: process.env.SENTRY_DSN,
 environment: process.env.NODE_ENV,
 integrations: [
 new Sentry.Integrations.Http({ tracing: true }),
 new Tracing.Integrations.Express({ app }),
 new Tracing.Integrations.Mongo()
 ],
 tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
 
 // Filter sensitive data
 beforeSend(event, hint) {
 // Remove sensitive headers
 if (event.request && event.request.headers) {
 delete event.request.headers.authorization;
 delete event.request.headers.cookie;
 }
 
 // Remove sensitive body data
 if (event.request && event.request.data) {
 if (event.request.data.password) {
 event.request.data.password = '[Filtered]';
 }
 }
 
 return event;
 }
 });
 
 // Request handler must be first middleware
 app.use(Sentry.Handlers.requestHandler());
 app.use(Sentry.Handlers.tracingHandler());
 }
};

// Error handler must be before other error middleware
const sentryErrorHandler = () => {
 if (process.env.NODE_ENV === 'production') {
 return Sentry.Handlers.errorHandler();
 }
 return (err, req, res, next) => next(err);
};

module.exports = { initSentry, sentryErrorHandler };
```

**Usage in Express App:**

```javascript
// backend/server.js
const { initSentry, sentryErrorHandler } = require('./config/sentry');

// Initialize Sentry
initSentry(app);

// ... your routes ...

// Sentry error handler (before other error handlers)
app.use(sentryErrorHandler());

// Global error handler
app.use((err, req, res, next) => {
 logger.error('Unhandled error', {
 error: err.message,
 stack: err.stack,
 url: req.originalUrl
 });
 
 res.status(500).json({
 success: false,
 message: 'An unexpected error occurred'
 });
});
```

### 11.3 Performance Monitoring

#### 11.3.1 Application Performance Metrics

```javascript
// backend/middleware/performanceMonitor.js
const logger = require('../config/logger');

const performanceMonitor = (req, res, next) => {
 const startTime = Date.now();
 
 // Capture response
 const originalSend = res.send;
 res.send = function(data) {
 const duration = Date.now() - startTime;
 
 // Log slow requests (>1000ms)
 if (duration > 1000) {
 logger.warn('Slow request detected', {
 method: req.method,
 url: req.originalUrl,
 duration: `${duration}ms`,
 statusCode: res.statusCode
 });
 }
 
 // Log all requests in production
 logger.http(`${req.method} ${req.originalUrl}`, {
 statusCode: res.statusCode,
 duration: `${duration}ms`,
 ip: req.ip,
 userAgent: req.get('user-agent')
 });
 
 originalSend.call(this, data);
 };
 
 next();
};

module.exports = performanceMonitor;
```

#### 11.3.2 Database Query Performance

```javascript
// Enable Mongoose query logging
mongoose.set('debug', (collectionName, method, query, doc) => {
 const startTime = Date.now();
 logger.debug('MongoDB Query', {
 collection: collectionName,
 method: method,
 query: JSON.stringify(query),
 duration: `${Date.now() - startTime}ms`
 });
});

// Slow query detection
const slowQueryThreshold = 100; // ms

mongoose.connection.on('slow', (event) => {
 logger.warn('Slow MongoDB query detected', {
 collection: event.collection,
 operation: event.operation,
 duration: `${event.duration}ms`,
 query: event.query
 });
});
```

#### 11.3.3 System Resource Monitoring

```javascript
// backend/utils/systemMonitor.js
const os = require('os');
const logger = require('../config/logger');

const monitorSystemResources = () => {
 setInterval(() => {
 const memoryUsage = process.memoryUsage();
 const cpuUsage = process.cpuUsage();
 const systemMemory = {
 total: os.totalmem(),
 free: os.freemem(),
 used: os.totalmem() - os.freemem()
 };
 
 const metrics = {
 memory: {
 rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
 heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
 heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
 external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
 },
 cpu: {
 user: `${(cpuUsage.user / 1000000).toFixed(2)} seconds`,
 system: `${(cpuUsage.system / 1000000).toFixed(2)} seconds`
 },
 system: {
 totalMemory: `${(systemMemory.total / 1024 / 1024 / 1024).toFixed(2)} GB`,
 freeMemory: `${(systemMemory.free / 1024 / 1024 / 1024).toFixed(2)} GB`,
 usedMemory: `${(systemMemory.used / 1024 / 1024 / 1024).toFixed(2)} GB`,
 memoryUsagePercent: `${((systemMemory.used / systemMemory.total) * 100).toFixed(2)}%`
 },
 uptime: `${(process.uptime() / 60 / 60).toFixed(2)} hours`
 };
 
 // Alert if memory usage exceeds 80%
 const memoryPercent = (systemMemory.used / systemMemory.total) * 100;
 if (memoryPercent > 80) {
 logger.warn('High memory usage detected', metrics);
 }
 
 logger.info('System metrics', metrics);
 
 }, 60000); // Every 60 seconds
};

module.exports = monitorSystemResources;
```

### 11.4 Alerting System

#### 11.4.1 Alert Configuration

```javascript
// backend/services/AlertService.js
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class AlertService {
 constructor() {
 this.transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
 user: process.env.GMAIL_USER,
 pass: process.env.GMAIL_APP_PASSWORD
 }
 });
 
 this.adminEmails = [
 'admin@quickfix.co.ke',
 'tech@quickfix.co.ke'
 ];
 }
 
 async sendAlert(level, title, message, details = {}) {
 const alertLevels = {
 critical: '[CRITICAL]',
 high: '[WARNING]',
 medium: '[INFO]',
 low: '[NOTE]'
 };
 
 const emailBody = `
 ${alertLevels[level]} ${title}
 
 Time: ${new Date().toISOString()}
 Severity: ${level.toUpperCase()}
 
 Message:
 ${message}
 
 Details:
 ${JSON.stringify(details, null, 2)}
 
 ---
 QuickFix Alert System
 `;
 
 try {
 await this.transporter.sendMail({
 from: process.env.GMAIL_USER,
 to: this.adminEmails.join(','),
 subject: `[${level.toUpperCase()}] ${title}`,
 text: emailBody
 });
 
 logger.info('Alert sent successfully', { level, title });
 } catch (error) {
 logger.error('Failed to send alert', { error: error.message });
 }
 }
 
 // Specific alert methods
 async databaseConnectionLost() {
 await this.sendAlert(
 'critical',
 'Database Connection Lost',
 'MongoDB connection has been lost. System functionality severely impacted.',
 {
 timestamp: new Date().toISOString(),
 action: 'Check MongoDB Atlas status and network connectivity'
 }
 );
 }
 
 async paymentGatewayError(error) {
 await this.sendAlert(
 'high',
 'Payment Gateway Error',
 'IntaSend payment processing failed',
 {
 error: error.message,
 timestamp: new Date().toISOString(),
 action: 'Check IntaSend dashboard for system status'
 }
 );
 }
 
 async highErrorRate(errorCount, timeWindow) {
 await this.sendAlert(
 'high',
 'High Error Rate Detected',
 `${errorCount} errors detected in the last ${timeWindow} minutes`,
 {
 errorCount,
 timeWindow,
 action: 'Review error logs and Sentry dashboard'
 }
 );
 }
 
 async lowDiskSpace(percentUsed) {
 await this.sendAlert(
 'medium',
 'Low Disk Space Warning',
 `Disk usage at ${percentUsed}%`,
 {
 percentUsed,
 action: 'Clear logs or increase storage capacity'
 }
 );
 }
}

module.exports = new AlertService();
```

### 11.5 Backup and Recovery

#### 11.5.1 Automated Backup Script

```bash
#!/bin/bash
# scripts/backup-database.sh

# Configuration
BACKUP_DIR="/var/backups/quickfix"
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/quickfix_production"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
echo "[$(date)] Starting database backup..."
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Compress backup
echo "[$(date)] Compressing backup..."
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"
rm -rf "$BACKUP_DIR/backup_$DATE"

# Upload to cloud storage (AWS S3 example)
if command -v aws &> /dev/null; then
 echo "[$(date)] Uploading to S3..."
 aws s3 cp "$BACKUP_DIR/backup_$DATE.tar.gz" "s3://quickfix-backups/database/"
fi

# Remove old backups
echo "[$(date)] Cleaning old backups..."
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Backup completed: backup_$DATE.tar.gz"
```

**Cron Job Configuration:**

```bash
# Run daily at 2 AM
0 2 * * * /opt/quickfix/scripts/backup-database.sh >> /var/log/quickfix-backup.log 2>&1
```

#### 11.5.2 Disaster Recovery Procedure

```markdown
# Disaster Recovery Plan

## Scenario 1: Complete Database Loss

1. **Stop application server**
 ```bash
 # In Render dashboard: Suspend service
 ```

2. **Restore from latest backup**
 ```bash
 # Download from S3
 aws s3 cp s3://quickfix-backups/database/backup_latest.tar.gz ./
 
 # Extract
 tar -xzf backup_latest.tar.gz
 
 # Restore to MongoDB Atlas
 mongorestore --uri="mongodb+srv://..." ./backup_latest/
 ```

3. **Verify data integrity**
 ```bash
 # Check user count
 mongo --eval "db.users.countDocuments()"
 
 # Check latest bookings
 mongo --eval "db.bookings.find().sort({createdAt:-1}).limit(5)"
 ```

4. **Restart application**
 ```bash
 # In Render dashboard: Resume service
 ```

5. **Monitor for issues**
 - Check error logs
 - Verify user login functionality
 - Test booking creation
 - Confirm payment processing

## Scenario 2: Application Server Failure

1. **Deploy to backup server**
 - Use Render's auto-deployment from GitHub
 - Or deploy to alternative provider (Heroku, Railway)

2. **Update DNS records**
 ```bash
 # Point api.quickfix.co.ke to new server IP
 ```

3. **Verify all services**
 - Health check endpoint
 - Database connectivity
 - External service integrations

## Recovery Time Objectives (RTO)

- Database restore: 15-30 minutes
- Application redeployment: 10-15 minutes
- DNS propagation: 5-60 minutes
- Total downtime target: < 2 hours

## Recovery Point Objectives (RPO)

- Maximum data loss: 24 hours (last backup)
- Continuous backups (Atlas): < 1 hour data loss
```

---

## 12. Future Enhancements (Q1-Q3 2026 Roadmap)

// Added: Strategic development roadmap for platform evolution

### 12.1 Q1 2026 (January - March)

#### 12.1.1 Advanced Booking Features

**Recurring Services**
- Schedule weekly/monthly recurring bookings
- Automatic booking creation and technician assignment
- Recurring payment automation
- Customer subscription packages

**Service Packages**
- Bundle multiple services at discounted rates
- Home maintenance packages (monthly, quarterly, annual)
- Business service contracts
- Seasonal packages (spring cleaning, winter preparation)

**Smart Scheduling**
- AI-powered optimal scheduling recommendations
- Dynamic pricing based on demand
- Automatic rescheduling for cancelled bookings
- Time slot booking with technician calendars

#### 12.1.2 Enhanced Technician Tools

**Mobile Technician App**
- Dedicated technician mobile application
- Route optimization for multiple jobs
- Offline mode for job details and updates
- Digital invoice generation
- Service history and customer notes

**Skills Assessment & Certification**
- Online skills testing platform
- Certification tracking and renewal reminders
- Continuing education courses
- Performance-based skill level badges

**Technician Analytics Dashboard**
- Earnings reports and forecasts
- Performance metrics and trends
- Customer feedback analysis
- Service area heat maps

### 12.2 Q2 2026 (April - June)

#### 12.2.1 Customer Experience Improvements

**AI Chatbot Support**
- 24/7 automated customer support
- Booking assistance and recommendations
- FAQ and troubleshooting help
- Multilingual support (English, Swahili)

**Voice Booking**
- Voice-activated booking via mobile app
- Integration with Google Assistant / Siri
- Natural language processing for service descriptions
- Voice status updates

**Augmented Reality (AR) Features**
- AR room measurement for painting/flooring estimates
- Visualize furniture placement for carpentry
- Remote technician assistance via AR
- Before/after photo comparisons

#### 12.2.2 Advanced Payment Features

**Multiple Payment Methods**
- Bank card payments (Visa, Mastercard)
- Bank transfers (direct EFT)
- Buy Now Pay Later (BNPL) integration
- Cryptocurrency payments (future exploration)

**Loyalty Program**
- Points earned per booking
- Tier-based benefits (Silver, Gold, Platinum)
- Referral rewards and bonuses
- Birthday/anniversary discounts

**Financial Services**
- Technician invoice financing
- Customer service loans
- Insurance partnerships
- Tax documentation generation

### 12.3 Q3 2026 (July - September)

#### 12.3.1 Platform Expansion

**Geographic Expansion**
- Expand beyond Nairobi to:
 - Mombasa
 - Kisumu
 - Nakuru
 - Eldoret
- Regional technician recruitment campaigns
- Localized marketing strategies

**New Service Categories**
- Pool maintenance
- Solar panel installation
- Home security systems
- Smart home installation
- Auto repairs (mobile mechanic)
- Pet care services

**Business Accounts**
- Corporate service packages
- Facility management contracts
- Property management integrations
- Bulk booking discounts
- Dedicated account managers

#### 12.3.2 Advanced Analytics & Reporting

**Business Intelligence Dashboard**
- Real-time revenue tracking
- Service demand forecasting
- Technician utilization rates
- Customer lifetime value analysis
- Market penetration metrics

**Predictive Analytics**
- Demand prediction for resource allocation
- Churn prediction and prevention
- Dynamic pricing optimization
- Maintenance need prediction

**API for Third-Party Integrations**
- Public API for partners
- Property management system integrations
- Real estate platform partnerships
- Smart home device integrations

### 12.4 Technical Improvements

#### 12.4.1 Performance Optimization

```javascript
// Planned technical enhancements

// 1. Database Optimization
- Implement MongoDB sharding for horizontal scaling
- Add read replicas for geographic distribution
- Implement advanced caching with Redis
- Query optimization and index tuning

// 2. Microservices Architecture
- Split monolithic backend into microservices:
 * Auth Service
 * Booking Service
 * Payment Service
 * Notification Service
 * Analytics Service
- Implement API Gateway (Kong, AWS API Gateway)
- Service mesh for inter-service communication

// 3. Real-time Features
- WebSocket optimization for live updates
- Server-Sent Events (SSE) for notifications
- Real-time technician location tracking
- Live chat between customers and technicians

// 4. Mobile App Optimization
- Implement code splitting and lazy loading
- Optimize image loading and caching
- Reduce app bundle size
- Implement progressive web app (PWA) version
```

#### 12.4.2 Security Enhancements

- Two-factor authentication (2FA)
- Biometric authentication (fingerprint, face ID)
- Advanced fraud detection algorithms
- Regular security audits and penetration testing
- GDPR compliance implementation
- Data encryption at rest and in transit

#### 12.4.3 Infrastructure Scaling

- Kubernetes deployment for better orchestration
- Auto-scaling based on traffic patterns
- Multi-region deployment for disaster recovery
- CDN implementation for static assets
- Load balancing across multiple servers

### 12.5 Feature Priority Matrix

| Feature | Impact | Effort | Priority | Target Quarter |
|---------|--------|--------|----------|----------------|
| Recurring Services | High | Medium | High | Q1 2026 |
| AI Chatbot | High | High | Medium | Q2 2026 |
| Loyalty Program | Medium | Low | High | Q2 2026 |
| Geographic Expansion | High | High | High | Q3 2026 |
| Microservices | High | High | Medium | Q3 2026 |
| AR Features | Low | High | Low | Q2 2026 |
| Voice Booking | Medium | Medium | Medium | Q2 2026 |
| API Platform | Medium | High | Medium | Q3 2026 |

---

## 13. Known Issues & Limitations

// Added: Documented limitations and planned resolutions

### 13.1 Current Known Issues

#### 13.1.1 Backend Issues

**Issue #1: Payment Webhook Occasional Delays**
- **Description**: IntaSend webhook callbacks sometimes delayed by 1-2 minutes
- **Impact**: Customer wallet balance updates delayed, causing confusion
- **Workaround**: Implement polling mechanism to check payment status every 30 seconds
- **Status**: Under investigation with IntaSend support
- **Target Resolution**: Q1 2026
- **Tracking**: GitHub Issue #42

**Issue #2: High Memory Usage During Peak Hours**
- **Description**: Node.js process memory usage exceeds 80% during peak traffic
- **Impact**: Potential server slowdowns, increased response times
- **Workaround**: Implement horizontal scaling with load balancer
- **Status**: Monitoring with increased server resources
- **Target Resolution**: Q1 2026 (migrate to microservices)
- **Tracking**: GitHub Issue #38

**Issue #3: Geolocation Accuracy on Some Android Devices**
- **Description**: Location coordinates sometimes inaccurate on older Android devices
- **Impact**: Incorrect technician matching distance calculations
- **Workaround**: Manual address entry, manual location adjustment
- **Status**: Investigating Expo Location API alternatives
- **Target Resolution**: Q2 2026
- **Tracking**: GitHub Issue #51

#### 13.1.2 Mobile App Issues

**Issue #4: Push Notifications Not Delivered on iOS Background**
- **Description**: Push notifications sometimes not received when app in background
- **Impact**: Users miss booking updates and assignment notifications
- **Workaround**: Encourage users to keep app open, add email notifications
- **Status**: Reviewing Expo Push Notification configuration
- **Target Resolution**: Q1 2026
- **Tracking**: GitHub Issue #47

**Issue #5: Image Upload Timeout on Slow Networks**
- **Description**: Completion photo uploads fail on slow/unstable connections
- **Impact**: Technicians cannot complete jobs without photos
- **Workaround**: Implement retry logic, compress images before upload
- **Status**: In development
- **Target Resolution**: December 2025
- **Tracking**: GitHub Issue #55

**Issue #6: App Crashes on Low-End Devices**
- **Description**: Occasional crashes on devices with <2GB RAM
- **Impact**: Poor user experience for budget device users
- **Workaround**: Optimize memory usage, lazy load components
- **Status**: Performance optimization in progress
- **Target Resolution**: Q1 2026
- **Tracking**: GitHub Issue #49

#### 13.1.3 Database Issues

**Issue #7: Slow Queries on Large Booking Collections**
- **Description**: Booking list queries slow when retrieving >1000 records
- **Impact**: Admin dashboard slow to load booking history
- **Workaround**: Implement pagination, limit default query results
- **Status**: Index optimization completed, monitoring performance
- **Target Resolution**: Resolved (monitoring for regression)
- **Tracking**: GitHub Issue #33 (Closed)

### 13.2 Platform Limitations

#### 13.2.1 Geographic Limitations

**Nairobi-Only Coverage**
- Currently operational only within Nairobi metropolitan area
- Technician availability limited to select neighborhoods
- Expansion to other cities planned for Q3 2026

**Location-Based Services**
- Requires device GPS/location permissions
- Indoor location accuracy may be limited
- No offline map support (requires internet connection)

#### 13.2.2 Payment Limitations

**M-Pesa Only**
- Currently supports only M-Pesa payments
- No international payment methods
- Minimum transaction: KES 100
- Maximum transaction: KES 150,000 (M-Pesa limit)
- Withdrawal processing time: Up to 1 hour

**Payment Fees**
- Platform fee: 20% of service cost (non-negotiable)
- M-Pesa charges apply (customer/technician responsibility)
- No refund processing for completed services

#### 13.2.3 Booking Limitations

**Service Hours**
- Bookings accepted 24/7 but technician availability varies
- ASAP bookings may take 1-2 hours for assignment
- No guaranteed response time for urgent requests
- Peak hours (weekends) may have longer wait times

**Service Coverage**
- Not all service types available in all areas
- Specialized services may have limited technician availability
- Emergency services (24-hour) not yet implemented
- No same-day booking guarantee

#### 13.2.4 Technical Limitations

**Mobile App**
- Requires Android 8.0+ or iOS 12.0+
- Minimum 2GB RAM recommended
- Requires persistent internet connection
- No offline functionality (except cached data)
- App size: ~50MB download

**Backend**
- API rate limit: 100 requests per 15 minutes per IP
- Maximum file upload size: 10MB per file
- Maximum concurrent connections: 1000
- Session timeout: 24 hours (re-login required)

**Data Retention**
- Booking data retained: 2 years
- Transaction records retained: 7 years (regulatory requirement)
- Notification history retained: 90 days
- Log files retained: 30 days

### 13.3 Browser Compatibility

**Supported Browsers (Web Dashboard):**
- [COMPLETED] Chrome 90+
- [COMPLETED] Firefox 88+
- [COMPLETED] Safari 14+
- [COMPLETED] Edge 90+
- [FAILED] Internet Explorer (not supported)

**Mobile Browser Support:**
- [COMPLETED] Chrome Mobile
- [COMPLETED] Safari Mobile
- [WARNING] Samsung Internet (partial support)
- [WARNING] Opera Mobile (partial support)

### 13.4 Dependency Vulnerabilities

**Monitoring Approach:**
```bash
# Regular security audits
npm audit

# Automated dependency updates (Dependabot configured)
# GitHub automatically creates PRs for security updates

# Current status:
# - 0 critical vulnerabilities
# - 0 high vulnerabilities
# - 2 moderate vulnerabilities (under review)
# - 5 low vulnerabilities (acceptable risk)
```

**Critical Dependencies:**
- `express`: ^4.18.2 (stable)
- `mongoose`: ^7.5.0 (stable)
- `jsonwebtoken`: ^9.0.2 (stable)
- `bcryptjs`: ^2.4.3 (stable)
- `expo`: ^49.0.0 (regular updates)

### 13.5 Scalability Constraints

**Current Capacity:**
- Concurrent users: ~1,000
- Daily bookings: ~500
- Database size: ~50GB limit (current tier)
- API throughput: ~100 requests/second

**Scaling Plans:**
- Horizontal scaling via load balancer (Q2 2026)
- Database sharding (Q3 2026)
- CDN for static assets (Q1 2026)
- Microservices architecture (Q3 2026)

### 13.6 Issue Reporting

**How to Report Issues:**

1. **For Users:**
 - In-app: Help → Report Issue
 - Email: support@quickfix.co.ke
 - Phone: +254 700 000 000

2. **For Developers:**
 - GitHub Issues: https://github.com/quickfix/platform/issues
 - Include: Steps to reproduce, expected vs actual behavior, screenshots/logs
 - Label appropriately: `bug`, `enhancement`, `security`, `performance`

3. **Security Vulnerabilities:**
 - Email: security@quickfix.co.ke
 - PGP Key: Available on website
 - Do NOT report publicly until patched

**Issue Response SLAs:**
- Critical (system down): 1 hour
- High (major feature broken): 4 hours
- Medium (minor issue): 24 hours
- Low (enhancement request): 72 hours

---

**[End of Annotated Draft Part 4 (Sections 10-13)]**

**[Sections 14-16 to be continued in Part 5]**

**End of Annotated Draft Part 4 — Edited by Copilot on 2025-10-29**
