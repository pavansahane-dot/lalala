@echo off
echo ========================================
echo Settings Implementation Verification
echo ========================================
echo.

echo Checking Frontend Files...
if exist "frontend\src\pages\Settings.tsx" (echo [OK] Settings.tsx) else (echo [MISSING] Settings.tsx)
if exist "frontend\src\components\settings\ProfileTab.tsx" (echo [OK] ProfileTab.tsx) else (echo [MISSING] ProfileTab.tsx)
if exist "frontend\src\components\settings\SecurityTab.tsx" (echo [OK] SecurityTab.tsx) else (echo [MISSING] SecurityTab.tsx)
if exist "frontend\src\components\settings\VpnPreferencesTab.tsx" (echo [OK] VpnPreferencesTab.tsx) else (echo [MISSING] VpnPreferencesTab.tsx)
if exist "frontend\src\components\settings\DevicesTab.tsx" (echo [OK] DevicesTab.tsx) else (echo [MISSING] DevicesTab.tsx)
if exist "frontend\src\components\settings\NotificationsTab.tsx" (echo [OK] NotificationsTab.tsx) else (echo [MISSING] NotificationsTab.tsx)
if exist "frontend\src\components\settings\PrivacyTab.tsx" (echo [OK] PrivacyTab.tsx) else (echo [MISSING] PrivacyTab.tsx)
if exist "frontend\src\components\settings\BillingTab.tsx" (echo [OK] BillingTab.tsx) else (echo [MISSING] BillingTab.tsx)
if exist "frontend\src\components\settings\DangerZoneTab.tsx" (echo [OK] DangerZoneTab.tsx) else (echo [MISSING] DangerZoneTab.tsx)
echo.

echo Checking Backend Files...
if exist "backend\routes\userSettings.js" (echo [OK] userSettings.js) else (echo [MISSING] userSettings.js)
if exist "backend\routes\adminSettings.js" (echo [OK] adminSettings.js) else (echo [MISSING] adminSettings.js)
echo.

echo Checking Documentation...
if exist "QUICK_START.md" (echo [OK] QUICK_START.md) else (echo [MISSING] QUICK_START.md)
if exist "SETTINGS_IMPLEMENTATION.md" (echo [OK] SETTINGS_IMPLEMENTATION.md) else (echo [MISSING] SETTINGS_IMPLEMENTATION.md)
if exist "INTEGRATION_GUIDE.md" (echo [OK] INTEGRATION_GUIDE.md) else (echo [MISSING] INTEGRATION_GUIDE.md)
if exist "API_REFERENCE.md" (echo [OK] API_REFERENCE.md) else (echo [MISSING] API_REFERENCE.md)
if exist "IMPLEMENTATION_COMPLETE.md" (echo [OK] IMPLEMENTATION_COMPLETE.md) else (echo [MISSING] IMPLEMENTATION_COMPLETE.md)
echo.

echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Start backend: cd backend ^&^& npm run dev
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo 3. Navigate to: http://localhost:5173/settings
echo.
echo Read QUICK_START.md for detailed instructions.
echo.
pause
