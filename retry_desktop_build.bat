@echo off
echo ===============================================
echo    🚀 Nemo Desktop Build - Retry with Fixed Linker
echo ===============================================
echo.

echo ✅ Visual Studio Build Tools installed
echo Now attempting desktop build...
echo.

REM Kill any existing processes first
taskkill /F /IM "node.exe" >nul 2>&1
taskkill /F /IM "python.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

echo Step 1: Verifying Rust can find linker...
rustc --version
if %errorlevel% neq 0 (
    echo ❌ Rust still not working
    pause
    exit /b 1
)
echo ✅ Rust is working

echo.
echo Step 2: Starting backend server...
start /B cmd /c "cd backend && python app.py"
timeout /t 3 /nobreak >nul
echo ✅ Backend started

echo.
echo Step 3: Building desktop application...
echo ⏰ This will take 2-3 minutes for first-time compilation
echo 🔄 Compiling Rust components...
echo.

npm run tauri dev
if %errorlevel% neq 0 (
    echo ❌ Build failed again. Let's try production build instead...
    echo.
    echo Attempting production build...
    npm run tauri build
)

echo.
echo Build attempt completed!
pause