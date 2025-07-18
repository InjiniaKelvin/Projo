@echo off
echo Stopping current Expo server...
taskkill /F /IM node.exe /T >nul 2>&1
echo.
echo Starting fresh Expo server with updated Metro config...
npx expo start --clear --web
pause
