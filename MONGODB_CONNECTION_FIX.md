# MongoDB Atlas Connection Fix Guide

## **Problem Identified**
Your MongoDB Atlas connection is timing out due to:
1. **High network latency** (237-320ms response time)
2. **33% packet loss** to Atlas servers
3. **Possible IP whitelist restriction**

## **Your Current Public IP**
```
62.24.120.159
```

---

## **Solution 1: Whitelist Your IP in MongoDB Atlas** [COMPLETED] RECOMMENDED

### **Steps:**

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com
2. **Login** with your credentials (ENG_Kelvin account)
3. **Navigate to**: Network Access (left sidebar under Security)
4. **Click**: "Add IP Address"
5. **Choose ONE option**:
 - **Option A (Recommended for Development)**: Click "Allow Access from Anywhere" → Adds `0.0.0.0/0`
 - **Option B (More Secure)**: Enter your specific IP: `62.24.120.159`
6. **Click**: "Confirm"
7. **Wait**: 1-2 minutes for changes to propagate

---

## **Solution 2: Use Local MongoDB (Backup Option)**

If Atlas continues to have issues, switch to local MongoDB:

### **Using Docker (EASY):**

```bash
# Pull MongoDB image
docker pull mongo:7.0

# Run MongoDB container
docker run -d \
 --name quickfix-mongo \
 -p 27017:27017 \
 -e MONGO_INITDB_ROOT_USERNAME=admin \
 -e MONGO_INITDB_ROOT_PASSWORD=QuickFix2025 \
 -e MONGO_INITDB_DATABASE=quickfix \
 mongo:7.0

# Update .env file
# Change from:
# MONGO_URI=mongodb+srv://ENG_Kelvin:QuickFix%402025@cluster0quickfix.p5exnhe.mongodb.net/quickfix?retryWrites=true&w=majority

# To:
MONGO_URI=mongodb://admin:QuickFix2025@localhost:27017/quickfix?authSource=admin
```

### **Without Docker (Manual Install):**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Update .env
MONGO_URI=mongodb://localhost:27017/quickfix
```

---

## **Solution 3: Database Configuration Already Updated** [COMPLETED] DONE

I've already increased the timeout settings in `backend/config/database.js`:
- `serverSelectionTimeoutMS`: 5000ms → **30000ms** (30 seconds)
- `socketTimeoutMS`: 45000ms → **75000ms** (75 seconds)
- Added `connectTimeoutMS`: **30000ms**
- Added `family: 4` (force IPv4, prevents IPv6 delays)

---

## **Testing the Fix**

### **After whitelisting your IP, restart the server:**

```bash
# Stop current server (Ctrl+C)
# Then restart:
node server.js
```

### **Expected Success Output:**
```
[COMPLETED] Mongoose connected to MongoDB
[COMPLETED] MongoDB connected successfully to: mongodb+srv://...
[COMPLETED] Database: quickfix
[COMPLETED] Host: ac-68mr6hf-shard-00-01.p5exnhe.mongodb.net:27017
[COMPLETED] Database connected successfully
```

### **Test Login:**
```bash
# In browser, try logging in with:
# Email: juju1@gmail.com
# Password: Kelvin@123
```

---

## **Troubleshooting**

### **Still getting errors?**

1. **Check MongoDB Atlas Status**: https://status.cloud.mongodb.com/
2. **Verify Cluster is Running**: 
 - Go to Atlas → Clusters
 - Ensure cluster shows "Active" (not Paused)
3. **Check Database User**:
 - Atlas → Database Access
 - Verify user `ENG_Kelvin` exists with password `QuickFix@2025`
4. **Network Issues**:
 - Try different WiFi network
 - Disable VPN if using one
 - Check firewall settings

### **Quick Test Connection Script:**

Create `test-mongo-connection.js`:
```javascript
const mongoose = require('mongoose');

const uri = 'mongodb+srv://ENG_Kelvin:QuickFix%402025@cluster0quickfix.p5exnhe.mongodb.net/quickfix?retryWrites=true&w=majority';

mongoose.connect(uri, {
 serverSelectionTimeoutMS: 30000,
 socketTimeoutMS: 75000,
 connectTimeoutMS: 30000,
 family: 4
})
.then(() => {
 console.log('[COMPLETED] Connection successful!');
 console.log('Database:', mongoose.connection.name);
 mongoose.disconnect();
})
.catch(err => {
 console.error('[FAILED] Connection failed:', err.message);
 process.exit(1);
});
```

Run: `node test-mongo-connection.js`

---

## **Next Steps**

1. [COMPLETED] **Whitelist IP** in Atlas (takes 1 minute)
2. [COMPLETED] **Restart server**: `node server.js`
3. [COMPLETED] **Test login** in browser
4. [COMPLETED] **Commit changes** once working

**Current branch**: `technician-dashboard-implementation`
