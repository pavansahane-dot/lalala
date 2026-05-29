@echo off
echo ========================================
echo Render.com Deployment - Quick Start
echo ========================================
echo.

echo This script will help you prepare for Render deployment.
echo.

echo Step 1: Check if Git is installed...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo Then run this script again.
    pause
    exit /b 1
) else (
    echo ✅ Git is installed
)

echo.
echo Step 2: Initialize Git repository...
if not exist .git (
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

echo.
echo Step 3: Add all files to Git...
git add .
echo ✅ Files added

echo.
echo Step 4: Commit files...
git commit -m "Prepare for Render deployment" >nul 2>&1
echo ✅ Files committed

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Create a GitHub repository:
echo    - Go to https://github.com/new
echo    - Name: vpn-app
echo    - Click "Create repository"
echo.
echo 2. Push your code:
echo    git remote add origin https://github.com/YOUR_USERNAME/vpn-app.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Deploy to Render:
echo    - Go to https://render.com
echo    - Sign up with GitHub
echo    - Follow RENDER_DEPLOYMENT.md guide
echo.
echo ========================================
echo.
pause
