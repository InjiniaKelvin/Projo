@echo off
echo ==========================================
echo QuickFix Backend Server Startup
echo ==========================================
echo.

echo Setting up environment...
cd /d "%~dp0"

echo [PACKAGE] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
 echo [FAIL] Node.js not found! Please install Node.js first.
 pause
 exit /b 1
)

echo [OK] Node.js found!
echo.

echo [LAUNCH] Starting Backend Server on port 3000...
echo.
echo Server will be available at: http://localhost:3000
echo API documentation: http://localhost:3000/api
echo Health check: http://localhost:3000/health
echo.
echo Press Ctrl+C to stop the server
echo ==========================================
echo.

node server.js

echo.
echo Server stopped.
pause
