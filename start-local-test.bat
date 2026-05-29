@echo off
echo ========================================
echo VPN App - Local Development Setup
echo ========================================
echo.

echo Step 1: Checking services...
call check-services.bat
if errorlevel 1 (
    echo.
    echo Services not running. Starting Docker containers...
    cd backend
    docker-compose up -d
    cd ..
    timeout /t 5 /nobreak >nul
)

echo.
echo Step 2: Running database migrations...
cd backend
call npx prisma migrate deploy
if errorlevel 1 (
    echo.
    echo Database migration failed. Run setup-database.bat first.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Step 3: Starting application...
call start-dev.bat

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Run tests: node test-local.js
echo.
pause
