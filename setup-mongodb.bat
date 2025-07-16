@echo off
echo ========================================
echo       QuickFix MongoDB Setup Script
echo ========================================
echo.

echo 🚀 Setting up MongoDB for QuickFix App...
echo.

:: Check if MongoDB is already installed
echo 📋 Checking MongoDB installation...
where mongod >nul 2>nul
if %errorlevel% == 0 (
    echo ✅ MongoDB is already installed!
    mongod --version
    echo.
) else (
    echo ❌ MongoDB not found. Please install MongoDB Community Server.
    echo 💡 Download from: https://www.mongodb.com/try/download/community
    echo.
    pause
    exit /b 1
)

:: Check if MongoDB service is running
echo 🔍 Checking MongoDB service status...
sc query MongoDB >nul 2>nul
if %errorlevel% == 0 (
    echo ✅ MongoDB service is installed
    
    :: Check if service is running
    sc query MongoDB | find "RUNNING" >nul
    if %errorlevel% == 0 (
        echo ✅ MongoDB service is running
    ) else (
        echo 🔄 Starting MongoDB service...
        net start MongoDB
    )
) else (
    echo ⚠️  MongoDB service not found. Starting MongoDB manually...
    start /b mongod --dbpath "%cd%\data\db"
    timeout /t 3 >nul
)
echo.

:: Create data directory if it doesn't exist
if not exist "data\db" (
    echo 📁 Creating MongoDB data directory...
    mkdir data\db
    echo ✅ Data directory created: %cd%\data\db
    echo.
)

:: Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

:: Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    copy ".env.example" ".env" >nul 2>nul
    if not exist ".env.example" (
        echo 📝 Creating .env file with default settings...
        (
            echo # MongoDB Configuration
            echo MONGODB_URI=mongodb://localhost:27017/quickfix
            echo MONGODB_TEST_URI=mongodb://localhost:27017/quickfix_test
            echo.
            echo # JWT Configuration
            echo JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
            echo JWT_EXPIRES_IN=24h
            echo JWT_REFRESH_EXPIRES_IN=7d
            echo.
            echo # Server Configuration
            echo PORT=3000
            echo NODE_ENV=development
            echo.
            echo # Payment Gateway Configuration
            echo STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
            echo PAYPAL_CLIENT_ID=your_paypal_client_id_here
            echo MPESA_CONSUMER_KEY=your_mpesa_consumer_key_here
        ) > .env
    ) else (
        copy ".env.example" ".env"
    )
    echo ✅ .env file created
    echo.
)

:: Test MongoDB connection
echo 🔗 Testing MongoDB connection...
echo db.runCommand("ping") | mongosh --quiet quickfix >nul 2>nul
if %errorlevel% == 0 (
    echo ✅ MongoDB connection successful
) else (
    echo ❌ MongoDB connection failed
    echo 💡 Make sure MongoDB is running and accessible
    pause
    exit /b 1
)
echo.

:: Ask user if they want to seed the database
echo 🌱 Do you want to seed the database with sample data?
echo    This will create test users, bookings, and transactions.
echo.
set /p seed_choice="Seed database? (y/n): "
if /i "%seed_choice%"=="y" (
    echo 🌱 Seeding database...
    call npm run db:seed
    if %errorlevel% == 0 (
        echo ✅ Database seeded successfully
    ) else (
        echo ❌ Database seeding failed
    )
    echo.
)

:: Display test accounts if seeded
if /i "%seed_choice%"=="y" (
    echo 🔐 Test Accounts Created:
    echo.
    echo Clients:
    echo   📧 john.client@test.com / Password123
    echo   📧 jane.client@test.com / Password123
    echo.
    echo Technicians:
    echo   🔧 mike.technician@test.com / Password123
    echo   🔧 sarah.technician@test.com / Password123
    echo.
    echo Admin:
    echo   👑 admin@quickfix.com / AdminPassword123
    echo.
)

:: Start the server
echo 🚀 Do you want to start the development server now?
set /p start_choice="Start server? (y/n): "
if /i "%start_choice%"=="y" (
    echo.
    echo 🌐 Starting QuickFix development server...
    echo 📍 API will be available at: http://localhost:3000
    echo 📖 API documentation: http://localhost:3000/api
    echo 🏥 Health check: http://localhost:3000/health
    echo.
    echo 💡 Press Ctrl+C to stop the server
    echo.
    call npm run server:dev
) else (
    echo.
    echo ✅ MongoDB setup completed successfully!
    echo.
    echo 🚀 To start the server manually, run:
    echo    npm run server:dev
    echo.
    echo 📚 Useful commands:
    echo    npm run db:seed    - Seed database with sample data
    echo    npm run db:reset   - Reset database (delete all data)
    echo    npm start          - Start Expo client
    echo    npm run android    - Start Android app
    echo    npm run web        - Start web app
    echo.
)

pause
