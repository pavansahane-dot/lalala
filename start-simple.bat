@echo off
echo Starting VPN Application...
echo.

echo Starting Backend Server...
start "VPN Backend" cmd /k "cd /d c:\Users\PAVAN\vpn-app\backend && npm run dev"

timeout /t 2 >nul

echo Starting Frontend Server...
start "VPN Frontend" cmd /k "cd /d c:\Users\PAVAN\vpn-app\frontend && npm run dev"

echo.
echo Application servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
