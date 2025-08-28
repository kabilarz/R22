@echo off
echo ===============================================
echo      Nemo AI Medical Data Analytics  
echo      Reliable Launcher
echo ===============================================
echo.

REM Check if the built app exists
set APP_PATH="src-tauri\target\release\app.exe"
if not exist %APP_PATH% (
    echo ❌ Desktop app not found: %APP_PATH%
    echo Please run the build first: npx tauri build
    pause
    exit /b 1
)

echo ✅ Desktop app found: %APP_PATH%

REM Check if backend directory exists
if not exist "backend\app.py" (
    echo ❌ Backend not found at: backend\app.py
    echo Make sure you're running this from the project root directory.
    pause
    exit /b 1
)

echo ✅ Backend found

echo.
echo 🚀 Starting Nemo Application...
echo.

REM Kill any existing Python processes to start fresh
echo Stopping any existing backend processes...
taskkill /f /im python.exe >nul 2>&1

echo Starting backend server...
REM Start backend and wait fixed time
start /B python backend\app.py

echo Backend is starting... Please wait 8 seconds
timeout /t 8 /nobreak >nul

echo ✅ Backend startup period completed
echo.
echo ⚠️  If you see "Backend is not ready" in the app:
echo    • Wait 10-15 more seconds and try refreshing
echo    • The backend may still be initializing
echo.
echo ⚠️  For Gemini AI features:
echo    • Run: configure_gemini.bat to set up API key
echo.
echo Starting desktop application...

REM Start the desktop app
%APP_PATH%

echo.
echo 🛑 Application closed
echo.
echo Cleaning up backend processes...
taskkill /f /im python.exe >nul 2>&1
pause