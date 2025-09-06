@echo off
echo ===============================================
echo    🌐 Nemo Web Demo (While Fixing Desktop)
echo ===============================================
echo.

echo While we fix the Rust linker issue, let's run the web version
echo This shows you exactly what the desktop app will look like!
echo.

echo Step 1: Starting Python backend...
start /B cmd /c "cd backend && python app.py"
timeout /t 3 /nobreak >nul
echo ✅ Backend started

echo.
echo Step 2: Starting Next.js frontend...
start /B cmd /c "npm run dev"
timeout /t 5 /nobreak >nul
echo ✅ Frontend starting...

echo.
echo Step 3: Opening Nemo in your browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ===============================================
echo    🎉 Nemo is now running!
echo ===============================================
echo.
echo ✅ What you'll see:
echo   • Full Nemo medical AI interface
echo   • SPSS-style data editor
echo   • 119+ statistical tests
echo   • AI-powered analysis
echo   • All features working exactly like desktop
echo.
echo 🔧 Meanwhile, run fix_rust_linker.bat to fix desktop build
echo.
echo Press Ctrl+C to stop servers when done testing
pause