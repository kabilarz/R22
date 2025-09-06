@echo off
echo =============================================
echo NEMO Medical AI - Single Deployment Script
echo =============================================

REM Check prerequisites
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js/npm not found. Please install Node.js first.
    pause
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found. Please install Python 3.8-3.11.
    pause
    exit /b 1
)

echo [1/5] Installing dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo [2/5] Installing Python dependencies...
pip install -r backend/requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo [3/5] Building frontend...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)

echo [4/5] Building desktop application...
npm run tauri:build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Desktop build failed
    pause
    exit /b 1
)

echo [5/5] Build complete!
echo.
echo Desktop installer: src-tauri\target\release\bundle\nsis\nemo_1.0.0_x64-setup.exe
echo Portable executable: src-tauri\target\release\nemo.exe
echo.
echo Build completed successfully!
pause