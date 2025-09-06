@echo off
echo ===============================================
echo    🚀 Quick Nemo Desktop Launch
echo ===============================================
echo.

REM Step 1: Start the backend
echo Step 1: Starting Python backend...
start /B cmd /c "cd backend && python app.py"
timeout /t 3 /nobreak >nul
echo ✅ Backend starting...

REM Step 2: Start development mode (this will build and run the desktop app)
echo Step 2: Launching Nemo in development mode...
echo ⏰ First launch takes 2-3 minutes to compile Rust code
echo ⚡ Future launches will be much faster (~15 seconds)
echo.
echo The desktop application will open automatically when ready!
echo.

cmd /c "npm run tauri dev"

echo.
echo 🎉 Nemo desktop app session completed!
pause