# Redesigned Booking System - Quick Start

## 🚀 Getting Started

### 1. Start the Backend
```bash
node server.js
```

### 2. Test the Redesigned System
```bash
# Quick test
npm run test:redesigned

# Comprehensive validation
npm run validate:booking

# Quality assurance
npm run qa:check
```

### 3. Use the New Booking Form
Navigate to: `/booking/redesigned-form`

### 4. API Endpoints
- `POST /api/bookings/redesigned` - Create booking
- `GET /api/bookings/phone/:phone` - Get bookings by phone
- `GET /api/bookings/:bookingId` - Get booking by ID

## 📋 Key Differences

### Phone as Primary ID
- Use phone number instead of userId
- Phone automatically normalized to +254XXXXXXXXX
- Direct phone-based lookups

### Unified Booking ID
- Single bookingId (no separate serviceId)
- Format: QF[DATE][TIME][PHONE][RANDOM]

### Field Consistency
- Exact matching between frontend and backend
- Comprehensive validation at all levels

## 🛠️ Troubleshooting

### Common Issues
1. **Server not running**: Start with `node server.js`
2. **Database not connected**: Start MongoDB
3. **Validation errors**: Check field requirements
4. **Phone format**: Use Kenyan format (0712... or +254712...)

### Need Help?
Run the quality assurance script: `npm run qa:check`
