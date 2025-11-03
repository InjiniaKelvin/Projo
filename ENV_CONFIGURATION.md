# Environment Variables Configuration Guide

This file contains the structure and information for the `.env` file needed for the QuickFix application.

## IMPORTANT: Create `.env` file in project root

Copy the template below and create a `.env` file in the project root directory.

---

## .env Template

```env
# =============================================================================
# QUICKFIX ENVIRONMENT VARIABLES
# =============================================================================

# -----------------------------------------------------------------------------
# DATABASE CONFIGURATION
# -----------------------------------------------------------------------------
# MongoDB Atlas Connection String
# Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://ENG_Kelvin:QuickFix%402025@cluster0quickfix.p5exnhe.mongodb.net/quickfix?retryWrites=true&w=majority

# Database Name
DB_NAME=quickfix

# -----------------------------------------------------------------------------
# SERVER CONFIGURATION
# -----------------------------------------------------------------------------
# Port number for the backend server
PORT=5000

# Node environment (development, production, test)
NODE_ENV=development

# -----------------------------------------------------------------------------
# AUTHENTICATION & SECURITY
# -----------------------------------------------------------------------------
# JWT Secret for signing tokens (use a strong, random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# JWT Access Token Expiry (e.g., 1h, 24h, 7d)
JWT_EXPIRES_IN=24h

# JWT Refresh Token Expiry
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt Salt Rounds (6 for fast development, 10-12 for production)
BCRYPT_ROUNDS=6

# DEPRECATED: Old bcrypt variable (kept for backward compatibility)
BCRYPT_SALT_ROUNDS=10

# -----------------------------------------------------------------------------
# FRONTEND CONFIGURATION
# -----------------------------------------------------------------------------
# Frontend URL for CORS
CLIENT_URL=http://localhost:8081

# -----------------------------------------------------------------------------
# API KEYS & THIRD-PARTY SERVICES
# -----------------------------------------------------------------------------
# Add your API keys here as needed
# MPESA_CONSUMER_KEY=your_mpesa_consumer_key
# MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
# GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# -----------------------------------------------------------------------------
# EMAIL CONFIGURATION (if needed)
# -----------------------------------------------------------------------------
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_specific_password

# -----------------------------------------------------------------------------
# SMS CONFIGURATION (if needed)
# -----------------------------------------------------------------------------
# AFRICASTALKING_API_KEY=your_africastalking_api_key
# AFRICASTALKING_USERNAME=your_africastalking_username

```

---

## Setup Instructions

### 1. Create .env file
```bash
# In project root directory
touch .env
```

### 2. Copy template above into .env

### 3. Update values as needed
- Replace placeholder values with your actual credentials
- For production, use strong random strings for JWT_SECRET
- Increase BCRYPT_ROUNDS to 10-12 for production

### 4. Verify .env is in .gitignore
```bash
# Check if .env is ignored
cat .gitignore | grep .env
```

---

## Current Configuration Details

### Database
- **MongoDB Atlas Cluster**: cluster0quickfix.p5exnhe.mongodb.net
- **Database Name**: quickfix
- **Username**: ENG_Kelvin
- **Password**: QuickFix@2025 (URL encoded as QuickFix%402025)

### Server
- **Port**: 5000
- **Environment**: development
- **Base URL**: http://localhost:5000

### Authentication
- **JWT Secret**: Custom secret key (change in production)
- **Access Token Expiry**: 24 hours
- **Refresh Token Expiry**: 7 days
- **Bcrypt Rounds**: 6 (fast for development)

### Performance Optimization
- **BCRYPT_ROUNDS=6**: Fast password hashing for development
 - Registration: ~1-2 seconds
 - Login: <1 second
 - Note: Increase to 10-12 for production security

---

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
PORT=5000
BCRYPT_ROUNDS=6
JWT_EXPIRES_IN=24h
```

### Production
```env
NODE_ENV=production
PORT=5000
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=1h
# Use stronger JWT_SECRET
# Enable HTTPS
# Use secure MongoDB connection
```

### Testing
```env
NODE_ENV=test
PORT=5001
BCRYPT_ROUNDS=6
JWT_EXPIRES_IN=1h
# Use separate test database
```

---

## Security Best Practices

1. **Never commit .env to git**
 - Always keep .env in .gitignore
 - Use this template file instead

2. **Use strong secrets in production**
 - Generate random JWT_SECRET: `openssl rand -base64 64`
 - Use high BCRYPT_ROUNDS (10-12)

3. **Rotate credentials regularly**
 - Change JWT_SECRET periodically
 - Update database passwords

4. **Limit access**
 - Use environment-specific credentials
 - Restrict database IP whitelist

5. **Use environment variables management**
 - Consider using tools like dotenv-vault for team projects
 - Use AWS Secrets Manager or similar for production

---

## Troubleshooting

### Issue: "MONGO_URI is not defined"
**Solution**: Make sure .env file exists in project root and contains MONGO_URI

### Issue: "JWT_SECRET is not defined"
**Solution**: Add JWT_SECRET to .env file

### Issue: "Connection refused to MongoDB"
**Solution**: 
- Check MONGO_URI format
- Verify MongoDB Atlas IP whitelist
- Ensure database username/password are correct

### Issue: "Slow authentication"
**Solution**: 
- Reduce BCRYPT_ROUNDS to 6 for development
- Check if using latest bcrypt package

---

## Notes

- This is a reference file for setting up .env
- Actual .env file should never be committed to git
- Update this file when adding new environment variables
- Keep passwords and secrets secure

---

**Last Updated**: October 14, 2025 
**Branch**: critical-and-normal-booking 
**Status**: All environment variables documented
