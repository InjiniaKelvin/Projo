@echo off
echo ===================================
echo      STARTING BOTH SERVERS
echo ===================================
echo.
echo Starting Backend Server (Express/MongoDB)...
start "Backend Server" cmd /k "node Server.js"
echo.
echo Waiting 3 seconds for backend to initialize...
timeout /t 3 >nul
echo.
echo Starting Frontend Server (Expo)...
start "Frontend Server" cmd /k "npx expo start --clear --web"
echo.
echo ===================================
echo    BOTH SERVERS ARE NOW STARTING
echo ===================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8081 (or next available port)
echo.
echo Both servers are running in separate windows.
echo Close this window when done.
pause
