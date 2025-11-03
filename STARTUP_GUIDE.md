# [LAUNCH] QuickFix Server Startup Guide

## [COMPLETED] Current Status
Your frontend is correctly configured and running! The API calls are now pointing to the right port (3000).

## Backend Server Setup

### Quick Start (Recommended)
1. **Double-click** `start-backend-improved.bat` in your project folder
2. **Wait** for the server to start (you'll see "[LAUNCH] Server running on port 3000")
3. **Return to your web browser** and try logging in

### Manual Start (Alternative)
If the batch file doesn't work:
1. Open **Command Prompt** or **PowerShell**
2. Navigate to your project:
 ```cmd
 cd "c:\Users\COMPUTER LAB\Desktop\Projo\Projo"
 ```
3. Start the server:
 ```cmd
 node server.js
 ```

### Test Login Credentials
Once the backend is running, use these credentials:

**Admin Login:**
- Email: `admin@quickfix.com`
- Password: `admin123`

**Client Login:**
- Email: `client@quickfix.com` 
- Password: `client123`

**Technician Login:**
- Email: `tech@quickfix.com`
- Password: `tech123`

## [SEARCH] Troubleshooting

### If MongoDB is Required:
Some features might need MongoDB. If you see database connection errors:
1. Install MongoDB Community Server
2. Start MongoDB service
3. Restart the backend server

### If Port 3000 is Busy:
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Verify Backend is Running:
Open in browser: http://localhost:3000/health

## [TARGET] Next Steps
1. Start backend server
2. Test login with admin credentials
3. Access admin dashboard
4. Explore all the features we built!

## [METRICS] Development Servers Status
- [COMPLETED] **Frontend (Expo)**: Running on web
- [IN PROGRESS] **Backend (Node.js)**: Ready to start
- **Database**: Optional for basic testing

Your app is ready to go! [SUCCESS]
