@echo off
title Nemo - AI Medical Data Analysis Platform

echo ===============================================
echo    Nemo - AI Medical Data Analysis Platform
echo ===============================================
echo.

REM Check if the built app exists
if not exist "src-tauri\target\release\app.exe" (
    echo ❌ Desktop application not found!
    echo Please build the application first with: npm run tauri:build
    pause
    exit /b 1
)

echo ✅ Desktop application found
echo.

REM Check Python availability
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python and add it to PATH.
    pause
    exit /b 1
)

echo ✅ Python is available
echo.

REM Start the backend server in background
echo 🚀 Starting Python backend server...
cd backend
start /B python app.py
cd ..

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Test if backend is responding
echo 🔍 Testing backend connection...
python -c "import requests; r=requests.get('http://localhost:8001/api/health', timeout=5); print('✅ Backend is ready:', r.json())" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Backend may not be fully ready yet, but starting the app...
) else (
    echo ✅ Backend is responding correctly
)

echo.
echo 🖥️  Starting Nemo Desktop Application...
echo    - Backend server is running on http://localhost:8001
echo    - Desktop app should connect automatically
echo    - Close this window to stop both backend and app
echo.

REM Start the desktop application
src-tauri\target\release\app.exe

echo.
echo 🛑 Desktop application closed
echo 🔄 Stopping backend server...

REM Kill the backend process
taskkill /f /im python.exe /fi "WINDOWTITLE eq C:\*app.py*" >nul 2>&1

echo ✅ All processes stopped
pause