@echo off
echo ========================================
echo VPN APP - SERVICE CHECKER
echo ========================================
echo.

echo [1/2] Checking PostgreSQL...
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is running
) else (
    echo ❌ PostgreSQL is NOT running
    echo.
    echo Attempting to start PostgreSQL...
    net start postgresql-x64-14 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL started successfully
    ) else (
        net start postgresql-x64-15 >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ PostgreSQL started successfully
        ) else (
            net start postgresql-x64-16 >nul 2>&1
            if %errorlevel% equ 0 (
                echo ✅ PostgreSQL started successfully
            ) else (
                echo ⚠️  Could not start PostgreSQL automatically
                echo Please start it manually from Windows Services
            )
        )
    )
)

echo.
echo [2/2] Checking Redis...
redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis is running
) else (
    echo ❌ Redis is NOT running
    echo.
    echo Attempting to start Redis...
    net start Redis >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Redis started successfully
    ) else (
        net start Memurai >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ Memurai started successfully
        ) else (
            echo ⚠️  Could not start Redis automatically
            echo.
            echo Redis is not installed or not configured as a service.
            echo.
            echo OPTIONS:
            echo 1. Install Redis: https://github.com/microsoftarchive/redis/releases
            echo 2. Install Memurai: https://www.memurai.com/get-memurai
            echo 3. Start Redis manually: redis-server
            echo 4. Use Docker: docker run -d -p 6379:6379 redis
        )
    )
)

echo.
echo ========================================
echo SERVICE CHECK COMPLETE
echo ========================================
echo.
pause
