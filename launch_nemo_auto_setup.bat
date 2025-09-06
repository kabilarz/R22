@echo off
echo.
echo ========================================
echo   NEMO MEDICAL AI - SMART LAUNCHER
echo ========================================
echo.

:: Check if bundled Python exists
if not exist "src-tauri\resources\python\python.exe" (
    echo 🔍 Bundled Python not detected...
    echo.
    echo For the best user experience, Nemo Medical AI should run
    echo with its own bundled Python to ensure:
    echo   🔒 Complete offline operation
    echo   📦 All medical libraries included
    echo   🏥 HIPAA-compliant data processing
    echo.
    set /p "SETUP=Would you like to set up bundled Python now? (Y/N): "
    if /i "!SETUP!"=="Y" (
        echo.
        echo 🚀 Running automatic setup...
        call setup-nemo-complete.bat
        if !ERRORLEVEL! NEQ 0 (
            echo ❌ Setup failed. Falling back to system Python...
            pause
        ) else (
            echo ✅ Setup complete! Launching Nemo...
        )
    ) else (
        echo.
        echo ⚠️  Continuing with system Python (requires user's Python installation)
        echo    Note: Some features may not work if medical libraries are missing.
    )
    echo.
)

:: Start the application
echo 🚀 Starting Nemo Medical AI...
echo.

:: Start backend
echo 📊 Starting Python backend...
start "Nemo Backend" cmd /k "cd backend && python app.py"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend
echo 🖥️  Starting frontend interface...
start "Nemo Frontend" cmd /k "npm run dev"

echo.
echo ✅ Nemo Medical AI is starting...
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:8001
echo.
echo Close this window to keep both services running.
echo Or press any key to open the application...
pause >nul

:: Open the application in default browser
start http://localhost:3000

echo.
echo 🏥 Nemo Medical AI is now running!
echo    Upload your medical data and start analyzing!
echo.