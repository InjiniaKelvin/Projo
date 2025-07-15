# MongoDB Setup Guide for QuickFix App

This guide will help you set up MongoDB for the QuickFix application with all the necessary configurations for development and production.

## Quick Start

### 1. Install MongoDB

#### Windows
1. Download MongoDB Community Server from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service
5. Install MongoDB Compass (GUI tool) when prompted

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongo --version

# Connect to MongoDB shell
mongosh
```

### 3. Environment Setup

1. Copy the `.env` file and update the MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/quickfix
```

2. For production, use MongoDB Atlas (cloud) or configure authentication:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quickfix
```

### 4. Install Dependencies and Start Backend

```bash
# Install all dependencies
npm install

# Seed the database with sample data
npm run db:seed

# Start the development server
npm run server:dev
```

## Database Structure

### Collections

#### Users
- **Purpose**: Store user accounts (clients, technicians, admins)
- **Key Features**: 
  - Role-based access control
  - Authentication and security
  - Location data for technicians
  - Skills and availability for technicians
  - Wallet integration

#### Wallets
- **Purpose**: Manage user financial accounts
- **Key Features**:
  - Available, escrow, and pending balances
  - Payment method storage
  - Transaction limits and verification

#### Transactions
- **Purpose**: Track all financial transactions
- **Key Features**:
  - Multiple payment gateways (M-Pesa, Stripe, PayPal, Bank)
  - Escrow management
  - Audit trail and reconciliation

#### Bookings
- **Purpose**: Manage service requests and assignments
- **Key Features**:
  - Location-based matching
  - Status tracking workflow
  - Payment integration
  - Communication and ratings

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Token refresh
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Reset password with token

### Payments (`/api/payments`)
- `GET /wallet` - Get wallet information
- `POST /add-funds` - Add money to wallet
- `POST /withdraw-funds` - Withdraw money from wallet
- `POST /escrow/deposit` - Move funds to escrow
- `POST /escrow/release` - Release funds from escrow
- `GET /transactions` - Get transaction history
- `POST /payment-methods` - Add payment method

### Bookings (`/api/bookings`)
- `POST /` - Create new booking
- `GET /` - Get user's bookings
- `GET /available` - Get available bookings (technicians)
- `GET /:bookingId` - Get booking details
- `POST /:bookingId/assign` - Assign technician
- `POST /:bookingId/confirm` - Confirm booking
- `POST /:bookingId/start` - Start work
- `POST /:bookingId/complete` - Complete work
- `POST /:bookingId/cancel` - Cancel booking
- `POST /:bookingId/rating` - Add rating/review

## Development Commands

```bash
# Start development server with auto-restart
npm run server:dev

# Start production server
npm run server:prod

# Reset database (DELETE ALL DATA)
npm run db:reset

# Seed database with sample data
npm run db:seed

# Start Expo client
npm start

# Start Android
npm run android

# Start iOS
npm run ios

# Start web
npm run web
```

## Sample Test Accounts

After running `npm run db:seed`, you can use these test accounts:

### Clients
- **Email**: john.client@test.com
- **Password**: Password123
- **Role**: Client

- **Email**: jane.client@test.com
- **Password**: Password123
- **Role**: Client

### Technicians
- **Email**: mike.technician@test.com
- **Password**: Password123
- **Role**: Technician (Plumbing, Electrical)

- **Email**: sarah.technician@test.com
- **Password**: Password123
- **Role**: Technician (Electrical, AC, Appliances)

### Admin
- **Email**: admin@quickfix.com
- **Password**: AdminPassword123
- **Role**: Admin

## MongoDB Configuration

### Development Configuration
```javascript
// Default local MongoDB
MONGODB_URI=mongodb://localhost:27017/quickfix
```

### Production Configuration (MongoDB Atlas)
```javascript
// MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/quickfix?retryWrites=true&w=majority
```

### Security Settings
```javascript
// Enable authentication
use admin
db.createUser({
  user: "quickfix_admin",
  pwd: "secure_password_here",
  roles: ["readWriteAnyDatabase", "dbAdminAnyDatabase"]
})

// Connection with authentication
MONGODB_URI=mongodb://quickfix_admin:secure_password_here@localhost:27017/quickfix?authSource=admin
```

## Monitoring and Maintenance

### MongoDB Compass
- GUI tool for database management
- View collections, documents, and indexes
- Query builder and aggregation pipeline
- Performance monitoring

### Useful MongoDB Commands
```javascript
// Show databases
show dbs

// Use quickfix database
use quickfix

// Show collections
show collections

// Count documents
db.users.countDocuments()
db.bookings.countDocuments()
db.transactions.countDocuments()

// Find documents
db.users.find({role: "technician"})
db.bookings.find({status: "pending"})

// Create indexes for better performance
db.users.createIndex({email: 1})
db.users.createIndex({location: "2dsphere"})
db.bookings.createIndex({clientId: 1, createdAt: -1})
db.transactions.createIndex({userId: 1, createdAt: -1})
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if MongoDB service is running
   - Verify connection string in `.env`
   - Check firewall settings

2. **Authentication Errors**
   - Verify username/password in connection string
   - Check user permissions
   - Ensure authSource is correct

3. **Performance Issues**
   - Add appropriate indexes
   - Monitor query performance
   - Use MongoDB Compass profiler

4. **Memory Issues**
   - Configure MongoDB memory limits
   - Optimize queries and indexes
   - Monitor database size

### Logs and Debugging
```bash
# MongoDB logs (Windows)
type "C:\Program Files\MongoDB\Server\6.0\log\mongod.log"

# MongoDB logs (Linux/macOS)
tail -f /var/log/mongodb/mongod.log

# Application logs
npm run server:dev  # Shows detailed logs in development
```

## Backup and Restore

### Backup Database
```bash
# Backup entire database
mongodump --db quickfix --out ./backup

# Backup specific collection
mongodump --db quickfix --collection users --out ./backup
```

### Restore Database
```bash
# Restore entire database
mongorestore --db quickfix ./backup/quickfix

# Restore specific collection
mongorestore --db quickfix --collection users ./backup/quickfix/users.bson
```

## Next Steps

1. Set up MongoDB Atlas for production
2. Configure automated backups
3. Set up monitoring and alerts
4. Implement data encryption at rest
5. Configure replica sets for high availability
6. Set up sharding for horizontal scaling

For more information, visit the [MongoDB Documentation](https://docs.mongodb.com/).
