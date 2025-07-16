@echo off
echo Setting up Android SDK Environment Variables...
echo.

REM Set ANDROID_HOME (adjust path if Android Studio installed elsewhere)
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"

REM Add Android SDK tools to PATH
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin"

echo.
echo Environment variables set successfully!
echo.
echo ANDROID_HOME: %ANDROID_HOME%
echo.
echo Please restart your terminal or computer for changes to take effect.
echo.
echo After restart, verify installation by running:
echo   adb --version
echo   avdmanager list avd
echo.
pause
