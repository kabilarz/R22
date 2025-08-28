@echo off
setlocal EnableDelayedExpansion

title Nemo - Fresh Desktop Build

echo ===============================================
echo    Nemo - Fresh Desktop Build Script
echo ===============================================
echo.

REM Clean old builds first
echo 🧹 Cleaning old builds...
if exist "src-tauri\target\release\app.exe" (
    echo   - Removing old app.exe
    del "src-tauri\target\release\app.exe" /q
)

if exist "src-tauri\target\release\bundle" (
    echo   - Removing old bundle directory
    rmdir /s /q "src-tauri\target\release\bundle"
)

if exist "out" (
    echo   - Cleaning frontend build cache
    rmdir /s /q "out"
)

if exist ".next" (
    echo   - Cleaning Next.js cache
    rmdir /s /q ".next"
)

echo ✅ Cleanup completed
echo.

REM Verify Python and dependencies
echo 🔍 Verifying Python backend...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python.
    pause
    exit /b 1
)

cd backend
python -c "import fastapi, uvicorn, pandas, scipy; print('✅ All Python dependencies available')"
if %errorlevel% neq 0 (
    echo ❌ Missing Python dependencies. Installing...
    pip install -r requirements.txt
)
cd ..

echo.
echo 🏗️  Building fresh desktop application...
echo    This may take 2-5 minutes...
echo.

REM Build the frontend first
echo ⚙️  Step 1/2: Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo ✅ Frontend build completed
echo.

REM Build the desktop application
echo ⚙️  Step 2/2: Building desktop application...
call npm run tauri:build
if %errorlevel% neq 0 (
    echo ❌ Desktop build failed!
    pause
    exit /b 1
)

echo.
echo 🎉 Build completed successfully!
echo.

REM Verify the new build
if exist "src-tauri\target\release\app.exe" (
    echo ✅ New app.exe created:
    dir "src-tauri\target\release\app.exe" | findstr "app.exe"
    echo.
    
    echo 🧪 Testing the new build...
    echo.
    
    REM Test if the app can start
    echo 🚀 Starting the application for verification...
    echo    - This will test if the backend auto-startup works
    echo    - Close the app after you see it loads successfully
    echo    - Press Ctrl+C here if you want to skip the test
    echo.
    pause
    
    REM Run the app
    "src-tauri\target\release\app.exe"
    
    echo.
    echo ✅ Application test completed
) else (
    echo ❌ Build appears to have failed - app.exe not found
    pause
    exit /b 1
)

echo.
echo ===============================================
echo           🎉 BUILD SUCCESSFUL! 🎉
echo ===============================================
echo.
echo Your Nemo desktop application is ready:
echo 📁 Location: src-tauri\target\release\app.exe
echo 🚀 Features: Backend auto-startup enabled
echo 📋 To run: Double-click app.exe or use launch_nemo.bat
echo.
echo ℹ️  The app will automatically start the Python backend
echo    when launched. No manual backend startup needed!
echo.

pause