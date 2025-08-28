@echo off
echo ===============================================
echo      🚀 NEMO LAUNCHER - FRESH BUILD
echo ===============================================
echo.

cd /d "c:\Users\drraj\OneDrive\Documents\Beta\R22"

echo Starting Nemo AI-Powered Medical Data Analysis Platform...
echo.

echo 1. Checking if backend is running...
netstat -ano | findstr :8001 >nul
if errorlevel 1 (
    echo 2. Starting backend server...
    start /B python backend\app.py
    timeout /t 5 /nobreak >nul
    echo ✅ Backend started successfully
) else (
    echo ✅ Backend already running
)

echo.
echo 3. Starting fresh desktop application...
echo.
echo 🎯 Fresh Build Information:
echo    • Built: 29-08-2025 02:20:56
echo    • Size: ~15.5 MB
echo    • Includes all backend connection fixes
echo.

start src-tauri\target\release\app.exe

echo 🚀 Nemo app started successfully!
echo.
echo 💡 Tips:
echo    • Press F12 in app to see console messages
echo    • Look for "Nemo API Client Initialized"
echo    • Backend status should show "ready" quickly
echo.
echo 📋 For development mode: npm run tauri dev
echo.
echo Have a great experience with Nemo! 🎉
echo.
pause