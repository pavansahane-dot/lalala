@echo off
echo ========================================
echo VPN APP - DATABASE SETUP
echo ========================================
echo.
echo This script will:
echo 1. Create the vpndb database
echo 2. Run Prisma migrations
echo 3. Generate Prisma client
echo 4. Seed default data
echo.
pause

echo.
echo [1/5] Checking PostgreSQL connection...
echo.

netstat -ano | findstr :5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not running on port 5432
    echo Please install and start PostgreSQL first
    echo Run: INSTALL_GUIDE.bat for instructions
    pause
    exit /b 1
)

echo ✅ PostgreSQL is running

echo.
echo [2/5] Creating database 'vpndb'...
echo.

cd /d c:\Users\PAVAN\vpn-app\backend

psql -U postgres -c "CREATE DATABASE vpndb;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Database created successfully
) else (
    echo ⚠️  Database may already exist (this is OK)
)

echo.
echo [3/5] Running Prisma migrations...
echo This will create all 17 tables
echo.

call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo ❌ Migration failed
    echo Check if PostgreSQL password is correct in .env file
    pause
    exit /b 1
)

echo ✅ Migrations completed

echo.
echo [4/5] Generating Prisma client...
echo.

call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma client generation failed
    pause
    exit /b 1
)

echo ✅ Prisma client generated

echo.
echo [5/5] Seeding default VPN credentials...
echo.

node seed.js
if %errorlevel% neq 0 (
    echo ❌ Seeding failed
    pause
    exit /b 1
)

echo ✅ Default credentials seeded
echo    Username: vpnbook
echo    Password: free2024

echo.
echo ========================================
echo DATABASE SETUP COMPLETE!
echo ========================================
echo.
echo Database: vpndb
echo Tables: 17 tables created
echo Default VPN credentials: vpnbook / free2024
echo.
echo Next step: Run start-simple.bat to start the app
echo.
pause
