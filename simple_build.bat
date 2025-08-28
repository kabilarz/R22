@echo off
title Building Nemo Desktop App

echo Building Nemo Desktop Application...
echo.

REM Build frontend
echo Step 1: Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

REM Build desktop app
echo.
echo Step 2: Building desktop application...
call npx tauri build
if %errorlevel% neq 0 (
    echo Desktop build failed!
    pause
    exit /b 1
)

echo.
echo Build completed!
if exist "src-tauri\target\release\app.exe" (
    echo SUCCESS: app.exe created
    dir "src-tauri\target\release\app.exe"
) else (
    echo ERROR: app.exe not found
)

pause