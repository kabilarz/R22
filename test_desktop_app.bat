@echo off
echo === Testing Nemo Desktop App with Backend Auto-Startup ===
echo.

REM Check if the built app exists
set APP_PATH="src-tauri\target\release\app.exe"
if not exist %APP_PATH% (
    echo ❌ Built application not found at: %APP_PATH%
    echo Please run: npm run tauri:build
    pause
    exit /b 1
)

echo ✅ Found built application: %APP_PATH%

REM Check if backend files exist in the expected location
set BACKEND_PATH="src-tauri\target\release\backend\app.py"
if not exist %BACKEND_PATH% (
    echo ⚠️  Backend not found at expected location: %BACKEND_PATH%
    echo The app will need to find the backend in the current directory
)

echo.
echo 🚀 Starting Nemo Desktop Application...
echo    - The app should automatically start the Python backend
echo    - Look for backend startup messages in the console
echo    - The app should show "Backend is ready" when successful
echo.
echo Press Ctrl+C to stop the application
echo.

REM Start the application
%APP_PATH%

echo.
echo 🛑 Application closed
pause