@echo off
echo ===============================================
echo      NEMO - IMMEDIATE FIX AND START
echo ===============================================
echo.
echo This script will:
echo 1. Stop all existing backend processes
echo 2. Start fresh backend process  
echo 3. Wait for backend to be ready
echo 4. Launch the desktop app
echo.

REM Kill all Python processes to start clean
echo Step 1: Stopping all existing backend processes...
taskkill /f /im python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Check if app exists
if not exist src-tauri\target\release\app.exe (
    echo ❌ Desktop app not found!
    echo Please build first with: npx tauri build
    pause
    exit /b 1
)

echo ✅ Desktop app found

REM Start backend fresh
echo.
echo Step 2: Starting fresh backend process...
start /B python backend\app.py

echo Step 3: Waiting for backend to initialize...
echo.

REM Wait with progress indication
for /L %%i in (1,1,10) do (
    echo Waiting... %%i/10 seconds
    timeout /t 1 /nobreak >nul
)

echo.
echo ✅ Backend should now be ready!
echo.
echo Step 4: Launching desktop application...
echo.
echo 🔍 DEBUGGING INFO:
echo - Backend should be running on: http://localhost:8001
echo - Health check endpoint: http://localhost:8001/api/health
echo - If you still see "Backend not ready" in the app, wait 10 more seconds
echo.

REM Start the app
src-tauri\target\release\app.exe

echo.
echo 🛑 App closed. Cleaning up...
taskkill /f /im python.exe >nul 2>&1
echo ✅ Cleanup complete
pause