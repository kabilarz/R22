@echo off
title Nemo Desktop App Launcher
echo ===============================================
echo      NEMO - BULLETPROOF LAUNCHER
echo ===============================================
echo.

REM Change to the correct directory
cd /d "c:\Users\drraj\OneDrive\Documents\Beta\R22"

echo Current directory: %CD%
echo.

REM Stop any existing backend processes
echo Step 1: Cleaning up existing processes...
taskkill /f /im python.exe >nul 2>&1

REM Check if app file exists (simple check)
if exist src-tauri\target\release\app.exe (
    echo ✅ Desktop app found!
) else (
    echo ❌ Desktop app NOT found!
    echo Expected location: %CD%\src-tauri\target\release\app.exe
    echo.
    echo Please build the app first with: npx tauri build
    pause
    exit /b 1
)

echo.
echo Step 2: Starting backend server...
start /B python backend\app.py

echo Step 3: Waiting 10 seconds for backend startup...
for /L %%i in (1,1,10) do (
    echo   Waiting %%i/10...
    timeout /t 1 /nobreak >nul
)

echo.
echo ✅ Backend startup complete!
echo.
echo Step 4: Launching Nemo Desktop App...
echo.

REM Launch the app with full path
src-tauri\target\release\app.exe

echo.
echo 🛑 App has closed
echo.
echo Cleaning up backend processes...
taskkill /f /im python.exe >nul 2>&1
echo ✅ Cleanup complete!

pause