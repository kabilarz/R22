@echo off
echo ===============================================
echo      TESTING FIXED NEMO APP
echo ===============================================
echo.

cd /d "c:\Users\drraj\OneDrive\Documents\Beta\R22"

echo Step 1: Clean up any existing processes...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im app.exe >nul 2>&1

echo Step 2: Starting backend server...
start /B python backend\app.py

echo Step 3: Waiting 10 seconds for backend startup...
timeout /t 10 /nobreak >nul

echo Step 4: Verify backend is responding...
curl -s http://localhost:8001/api/health

echo.
echo Step 5: Starting FIXED desktop app...
echo.
echo 🔍 What to look for:
echo   • Console should show API detection debug info
echo   • Backend status should be "ready" within 15 seconds
echo   • No more endless "(1/10)" messages
echo.

start src-tauri\target\release\app.exe

echo.
echo ✅ App started. Check console for debug information.
echo.
pause