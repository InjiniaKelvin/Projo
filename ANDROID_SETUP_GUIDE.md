# Android SDK Installation Guide for QuickFix Project

## Quick Setup Instructions

### Step 1: Download and Install Android Studio
1. Visit: https://developer.android.com/studio
2. Download Android Studio for Windows
3. Run the installer with these options:
   - Choose "Custom" installation
   - Select all Android SDK components
   - Accept all licenses

### Step 2: Run Environment Setup Script
After Android Studio installation completes:
```bash
# Run this script as Administrator
.\setup-android-sdk.bat
```

### Step 3: Restart Terminal
Close and reopen your PowerShell/Command Prompt

### Step 4: Verify Installation
```bash
adb --version
avdmanager list avd
```

### Step 5: Create Android Virtual Device (AVD)
1. Open Android Studio
2. Go to Tools > AVD Manager
3. Click "Create Virtual Device"
4. Select a device (e.g., Pixel 4)
5. Download and select an Android version (API 30+ recommended)
6. Click "Finish"

### Step 6: Start Your Project
```bash
cd "C:\Users\COMPUTER LAB\Desktop\Projo\Projo"
npx expo start --android
```

## Alternative: Quick SDK-Only Installation

If you only want the SDK without Android Studio:

### Option A: Command Line Tools Only
1. Download: https://developer.android.com/studio#command-tools
2. Extract to: `C:\Users\%USERNAME%\AppData\Local\Android\Sdk\cmdline-tools\latest`
3. Run the setup script: `.\setup-android-sdk.bat`
4. Install platform and build tools:
```bash
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
```

### Option B: Using Scoop (if available)
```bash
scoop bucket add extras
scoop install android-sdk
```

## Troubleshooting

### Common Issues:
1. **"adb not recognized"**: Environment variables not set correctly
2. **"No AVD found"**: Create a virtual device in Android Studio
3. **"SDK not found"**: Check ANDROID_HOME path

### Environment Variables Check:
```bash
echo $env:ANDROID_HOME
echo $env:PATH
```

### Manual Environment Setup:
If the script doesn't work, manually add these to Windows Environment Variables:
- Variable: `ANDROID_HOME`
- Value: `C:\Users\%USERNAME%\AppData\Local\Android\Sdk`
- Add to PATH: `%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools`

## Testing Your Setup

After installation, test with:
```bash
# Check ADB
adb devices

# List available AVDs
avdmanager list avd

# Start an AVD
emulator -avd [AVD_NAME]
```

## Running QuickFix App

Once Android SDK is set up:
```bash
cd "C:\Users\COMPUTER LAB\Desktop\Projo\Projo"
npx expo start --android
```

Your QuickFix authentication system will be ready to test!
