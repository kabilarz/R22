@echo off
echo ===============================================
echo      Nemo AI Medical Data Analytics
echo      Simple Launcher
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

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python and add it to PATH.
    pause
    exit /b 1
)

echo ✅ Python is available

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

REM Simple approach - start backend and wait a fixed time
echo Starting backend server...
start /B python backend\app.py

REM Fixed wait time instead of complex loop
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo ✅ Backend startup time completed
echo.
echo ⚠️  Note: If you see "Backend is not ready" in the app:
echo    - Wait a few more seconds and refresh
echo    - Or restart this launcher
echo.
echo ⚠️  Gemini API: Check .env.local for API key configuration
echo.
echo Starting desktop application...

REM Start the desktop app
%APP_PATH%

echo.
echo 🛑 Application closed
pause