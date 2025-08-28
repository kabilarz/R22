@echo off
echo ===============================================
echo        NEMO BACKEND CONNECTION DIAGNOSTIC
echo ===============================================
echo.

cd /d "c:\Users\drraj\OneDrive\Documents\Beta\R22"

echo 🔍 Current Status Check:
echo.

echo 1. Backend Status:
netstat -ano | findstr :8001
if errorlevel 1 (
    echo ❌ No process listening on port 8001
    echo Starting backend...
    start /B python backend\app.py
    timeout /t 5 /nobreak >nul
) else (
    echo ✅ Backend process found on port 8001
)

echo.
echo 2. Testing Backend API:
curl -s http://localhost:8001/api/health
echo.

echo 3. App.exe Build Info:
dir src-tauri\target\release\app.exe | findstr "app.exe"

echo.
echo 4. Frontend Build Info:
dir out | findstr "<DIR>"
if errorlevel 1 (
    echo ❌ No 'out' directory found - frontend may not be built for Tauri
) else (
    echo ✅ Frontend 'out' directory exists
)

echo.
echo ===============================================
echo 🎯 EXPECTED BEHAVIOR IN APP:
echo   • Console should show: "API Client Debug Info"
echo   • API Base URL should be: http://localhost:8001/api
echo   • Backend status should change to "ready" quickly
echo   • No CORS errors in console
echo ===============================================
echo.

echo 🚨 IF STILL SHOWING "Backend is not ready":
echo.
echo A) Check browser console (F12) for:
echo    - API Client Debug Info messages
echo    - Any red error messages
echo    - Network requests to localhost:8001
echo.
echo B) Try these steps:
echo    1. Press F5 to refresh the app
echo    2. Clear browser cache (Ctrl+Shift+Delete)
echo    3. Close app completely and restart
echo.
echo C) Check these values in console:
echo    - isTauriEnvironment: should be true
echo    - Final API Base URL: should be http://localhost:8001/api
echo.
pause