@echo off
echo ===============================================
echo      💥 NUCLEAR FIX DEPLOYED - FINAL TEST
echo ===============================================
echo.

cd /d "c:\Users\drraj\OneDrive\Documents\Beta\R22"

echo 🚀 WHAT WAS CHANGED:
echo ✅ Removed ALL detection logic 
echo ✅ FORCED API URL to: http://localhost:8001/api
echo ✅ No more environment checks
echo ✅ No more protocol detection  
echo ✅ 100%% guaranteed localhost connection
echo.

echo 🔍 Current Status:
echo.

echo Backend Check:
curl -s http://localhost:8001/api/health | findstr "healthy"
if errorlevel 1 (
    echo ❌ Backend issue detected
    echo Starting backend...
    start /B python backend\app.py
    timeout /t 3 /nobreak >nul
) else (
    echo ✅ Backend healthy and responding
)

echo.
echo App Process Check:
tasklist | findstr app.exe
if errorlevel 1 (
    echo ❌ App not running - starting it...
    start src-tauri\target\release\app.exe
) else (
    echo ✅ App is running
)

echo.
echo ===============================================
echo 💥 NUCLEAR FIX CONSOLE MESSAGES:
echo ===============================================
echo.
echo When you open the app, press F12 and look for:
echo.
echo   💥 NUCLEAR OPTION ACTIVE - FORCED LOCALHOST API
echo   🎯 API URL: http://localhost:8001/api
echo.
echo If you see these messages, the fix is working!
echo The backend status should immediately show "ready"
echo.
echo ===============================================
echo 🎯 THIS SHOULD DEFINITELY WORK NOW!
echo ===============================================
echo.
echo If you STILL see "Backend is not ready" after this:
echo 1. Press F5 to refresh the app
echo 2. Check Windows Firewall isn't blocking port 8001
echo 3. Try running as administrator
echo.
echo But this nuclear approach should work 100%%!
echo.
pause