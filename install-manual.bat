@echo off
color 0B
echo ========================================
echo MANUAL INSTALLATION - DIRECT DOWNLOADS
echo ========================================
echo.
echo Chocolatey has issues. Let's install manually.
echo.
echo This will open download pages in your browser.
echo Download and install each one.
echo.
pause

echo.
echo ========================================
echo Step 1: Installing PostgreSQL
echo ========================================
echo.
echo Opening PostgreSQL download page...
start https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
echo.
echo INSTRUCTIONS:
echo 1. Download: PostgreSQL 14.x or higher (Windows x86-64)
echo 2. Run the installer
echo 3. Password: secure_password_here
echo 4. Port: 5432 (default)
echo 5. Install all components
echo 6. Wait for installation to complete
echo.
echo Press any key after PostgreSQL is installed...
pause

echo.
echo ========================================
echo Step 2: Installing Memurai (Redis)
echo ========================================
echo.
echo Opening Memurai download page...
start https://www.memurai.com/get-memurai
echo.
echo INSTRUCTIONS:
echo 1. Click "Download Memurai Developer"
echo 2. Run the installer
echo 3. Use default settings
echo 4. Memurai will start automatically
echo.
echo Press any key after Memurai is installed...
pause

echo.
echo ========================================
echo Step 3: Verifying Installation
echo ========================================
echo.

echo Checking PostgreSQL...
netstat -ano | findstr :5432 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is running on port 5432
) else (
    echo ⚠️  PostgreSQL not detected
    echo Try starting it: net start postgresql-x64-14
)

echo.
echo Checking Memurai/Redis...
netstat -ano | findstr :6379 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Memurai is running on port 6379
) else (
    echo ⚠️  Memurai not detected
    echo Try starting it: net start Memurai
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: setup-database.bat
echo 2. Run: start-simple.bat
echo.
pause
