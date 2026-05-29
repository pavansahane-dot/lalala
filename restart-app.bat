@echo off
echo ========================================
echo COMPLETE RESET - FIX PRISMA
echo ========================================
echo.
echo This will:
echo 1. Stop all Node.js processes
echo 2. Clean Prisma cache
echo 3. Regenerate Prisma client
echo 4. Restart the app
echo.
pause

echo.
echo Step 1: Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo ✅ All Node processes stopped

echo.
echo Step 2: Cleaning Prisma cache...
cd /d c:\Users\PAVAN\vpn-app\backend
rmdir /s /q node_modules\.prisma 2>nul
rmdir /s /q node_modules\@prisma\client 2>nul
echo ✅ Cache cleaned

echo.
echo Step 3: Regenerating Prisma client...
call npx prisma generate
if %errorlevel% equ 0 (
    echo ✅ Prisma client regenerated
) else (
    echo ❌ Failed to regenerate
    pause
    exit /b 1
)

echo.
echo Step 4: Restarting application...
timeout /t 2 >nul
cd /d c:\Users\PAVAN\vpn-app
start cmd /k "cd backend && npm run dev"
timeout /t 3 >nul
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo COMPLETE! APP IS RESTARTING
echo ========================================
echo.
echo Wait 30 seconds, then:
echo 1. Open: http://localhost:5173
echo 2. For database: npx prisma studio
echo.
pause
