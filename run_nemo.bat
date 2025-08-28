@echo off
title Nemo - Application Launcher

echo ===============================================
echo    Nemo - AI Medical Data Analysis Platform
echo ===============================================
echo.

REM Check if app exists
if not exist "src-tauri\target\release\app.exe" (
    echo ❌ Application not found!
    echo Please build first using: build_nemo.bat
    pause
    exit /b 1
)

echo ✅ Application found
echo.

REM Try PowerShell launcher first (better for newer builds)
echo 🚀 Starting Nemo...
powershell -ExecutionPolicy Bypass -File "launch_nemo.ps1" 2>nul

if %errorlevel% neq 0 (
    echo.
    echo PowerShell launcher had issues, trying direct launch...
    echo.
    
    REM Fallback: just run the app directly
    echo 🚀 Starting application directly...
    echo Note: You may need to start the backend manually if it doesn't auto-start
    echo.
    
    "src-tauri\target\release\app.exe"
)

echo.
echo Application closed.
pause