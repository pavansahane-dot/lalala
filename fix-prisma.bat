@echo off
echo ========================================
echo FIXING PRISMA CLIENT ERROR
echo ========================================
echo.
echo This will fix the Prisma client error
echo.
pause

cd /d c:\Users\PAVAN\vpn-app\backend

echo Step 1: Stopping backend server...
echo Please close the backend terminal window if it's running
echo.
pause

echo Step 2: Cleaning Prisma cache...
rmdir /s /q node_modules\.prisma 2>nul
rmdir /s /q node_modules\@prisma\client 2>nul

echo Step 3: Regenerating Prisma client...
call npx prisma generate

if %errorlevel% equ 0 (
    echo ✅ Prisma client regenerated successfully
) else (
    echo ❌ Failed to regenerate
    echo.
    echo Try this manually:
    echo 1. Close ALL terminal windows
    echo 2. Run: npx prisma generate
    pause
    exit /b 1
)

echo.
echo ========================================
echo PRISMA CLIENT FIXED!
echo ========================================
echo.
echo Now you can:
echo 1. Restart backend: start-simple.bat
echo 2. Open Prisma Studio: npx prisma studio
echo.
pause
