@echo off
echo ========================================
echo Azure CLI Installation Verification
echo ========================================
echo.

echo Checking if Azure CLI is installed...
where az >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Azure CLI is installed!
    echo.
    az --version
    echo.
    echo ========================================
    echo Next Step: Login to Azure
    echo ========================================
    echo.
    echo Run: az login
    echo.
    pause
    exit /b 0
) else (
    echo ❌ Azure CLI not found in PATH
    echo.
    echo This usually means you need to:
    echo 1. Close this terminal window
    echo 2. Open a NEW terminal window
    echo 3. Run this script again
    echo.
    echo If still not working:
    echo - Restart your computer
    echo - Or manually add to PATH: C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin
    echo.
    pause
    exit /b 1
)
