# QuickFix Platform - Gemini Context

## Project Overview
QuickFix is a multi-platform service booking application connecting clients with technicians for home/office repairs and services.

## Tech Stack
- **Frontend**: React Native (Expo) - Web, Android, iOS
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **Payment**: IntaSend (M-PESA STK Push)
- **Auth**: JWT-based authentication

## Platform Roles
1. **Client**: Browse services, book technicians, make payments, track bookings
2. **Technician**: Accept jobs, manage availability, view earnings
3. **Admin**: Manage users, approve technicians, monitor platform

## Current Issue
**Wallet STK Push Not Working**
- Location: Client dashboard wallet feature
- Problem: Initiate payment does not trigger STK push when phone number is entered
- Need browser console logs to debug

## Recent Improvements
- **Client Dashboard**: Recently redesigned with improved UI/UX
- **Authentication**: Performance optimizations applied (see AUTH_PERFORMANCE_FIX.md)
- **Booking System**: Complete redesign implemented (see BOOKING_SYSTEM_REDESIGN_COMPLETE.md)

## Key Requirements for UI Consistency
1. Match all platform UIs (Technician & Admin dashboards) to the improved Client dashboard design
2. Ensure uniform styling, navigation patterns, and user flows across all roles
3. Maintain responsive design for web, mobile, and tablet
4. Implement smooth transitions and error handling
5. Use consistent color scheme, typography, and component library

## MongoDB Collections
- `users` - All user accounts (client, technician, admin)
- `bookings` - Service booking records
- `payments` - Payment transactions
- `services` - Available service categories
- `technicians` - Technician profiles and skills
- `wallets` - User wallet balances

## Development Commands
```bash
# Start web app
npx expo start --web

# View MongoDB data
mongosh "mongodb://localhost:27017/quickfix"

# Check backend health
node check-backend-health.js
```

## Areas to Analyze
1. **UI Consistency**: Compare Client vs Technician vs Admin dashboards
2. **Payment Flow**: STK push integration issues
3. **Error Handling**: Check for console errors (16 errors currently reported)
4. **Incomplete Features**: Review partially implemented features
5. **User Flow**: Ensure smooth navigation across all user journeys
6. **Mobile Responsiveness**: Verify all screens work on different devices

## Priority Tasks
1. Fix wallet STK push issue (CRITICAL)
2. Resolve 16 reported errors in codebase
3. Standardize UI across all dashboards
4. Implement missing features from requirements
5. Optimize performance across platforms
