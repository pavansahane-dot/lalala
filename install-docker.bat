@echo off
echo ========================================
echo DOCKER INSTALLATION (FASTEST METHOD)
echo ========================================
echo.
echo This method uses Docker to install PostgreSQL and Redis.
echo Much faster and easier than manual installation!
echo.
echo Requirements: Docker Desktop must be installed
echo Download from: https://www.docker.com/products/docker-desktop
echo.
pause

echo.
echo Checking if Docker is installed...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed
    echo.
    echo Please install Docker Desktop first:
    echo https://www.docker.com/products/docker-desktop
    echo.
    echo After installing Docker, run this script again.
    pause
    exit /b 1
)

echo ✅ Docker is installed
echo.

echo ========================================
echo Installing PostgreSQL via Docker...
echo ========================================
echo.

docker run -d --name vpn-postgres -e POSTGRES_PASSWORD=secure_password_here -e POSTGRES_DB=vpndb -p 5432:5432 postgres:14

if %errorlevel% equ 0 (
    echo ✅ PostgreSQL container created
) else (
    echo ⚠️  Container may already exist, trying to start it...
    docker start vpn-postgres
)

echo.
echo ========================================
echo Installing Redis via Docker...
echo ========================================
echo.

docker run -d --name vpn-redis -p 6379:6379 redis:latest

if %errorlevel% equ 0 (
    echo ✅ Redis container created
) else (
    echo ⚠️  Container may already exist, trying to start it...
    docker start vpn-redis
)

echo.
echo Waiting 10 seconds for services to start...
timeout /t 10 >nul

echo.
echo ========================================
echo Verifying Installation...
echo ========================================
echo.

echo Checking PostgreSQL...
netstat -ano | findstr :5432 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is running on port 5432
) else (
    echo ⚠️  PostgreSQL not detected yet, wait a bit longer
)

echo.
echo Checking Redis...
netstat -ano | findstr :6379 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis is running on port 6379
) else (
    echo ⚠️  Redis not detected yet, wait a bit longer
)

echo.
echo ========================================
echo Docker Installation Complete!
echo ========================================
echo.
echo PostgreSQL: Running in Docker container 'vpn-postgres'
echo Redis: Running in Docker container 'vpn-redis'
echo.
echo Next steps:
echo 1. Run: setup-database.bat
echo 2. Run: start-simple.bat
echo.
echo To stop containers: docker stop vpn-postgres vpn-redis
echo To start containers: docker start vpn-postgres vpn-redis
echo.
pause
