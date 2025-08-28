@echo off
echo ===============================================
echo      Nemo AI Medical Data Analytics
echo      Desktop Application Launcher
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

REM Check if backend is already running
for /f %%i in ('netstat -ano ^| findstr ":8001"') do (
    echo ✅ Backend already running on port 8001
    goto :start_app
)

echo.
echo 🚀 Starting Nemo Application...
echo.
echo Starting backend server...

REM Start the backend in the background
start /B python backend\app.py

REM Wait for backend to be ready with better feedback
set /A count=0
:wait_backend
set /A count+=1
echo Checking backend readiness... (%count%/30)

REM Check if backend is listening on port 8001
for /f %%i in ('netstat -ano ^| findstr ":8001" 2^>nul') do (
    echo ✅ Backend is ready!
    goto :start_app
)

if %count% GEQ 30 (
    echo ❌ Backend failed to start after 30 seconds
    echo Please check if there are any errors and try again
    pause
    exit /b 1
)

timeout /t 1 /nobreak >nul
goto :wait_backend

:start_app
echo.
echo ⚠️  Note: Gemini AI integration requires a valid API key in .env.local
echo    Current key status: Check NEXT_PUBLIC_GEMINI_API_KEY in .env.local
echo.
echo Starting desktop application...
echo.

REM Start the desktop app
%APP_PATH%

echo.
echo 🛑 Application closed
pause