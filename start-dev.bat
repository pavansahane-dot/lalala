@echo off
echo ========================================
echo Starting VPN Application Locally
echo ========================================
echo.

REM Check if services are running
echo Checking PostgreSQL and Redis...
call check-services.bat
if errorlevel 1 (
    echo.
    echo ERROR: PostgreSQL or Redis not running!
    echo Please run install-docker.bat or install-manual.bat first
    pause
    exit /b 1
)

echo.
echo Starting Backend Server...
start "VPN Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "VPN Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Application Starting...
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq VPN Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq VPN Frontend*" /T /F >nul 2>&1

echo Servers stopped.
pause
