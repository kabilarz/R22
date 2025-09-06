@echo off
echo ===============================================
echo    🏗️ Nemo Production Desktop Build
echo ===============================================
echo.

REM This creates a standalone .exe file for distribution

echo Step 1: Installing dependencies...
cmd /c "npm install"
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo Step 2: Building frontend for production...
cmd /c "npm run build"
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo Step 3: Creating production desktop build...
echo ⏰ This will take 5-10 minutes to create the .exe file
echo.
cmd /c "npm run tauri build"
if %errorlevel% neq 0 (
    echo ❌ Production build failed
    pause
    exit /b 1
)

echo.
echo ===============================================
echo    🎉 Production Build Complete!
echo ===============================================
echo.
echo Your standalone Nemo desktop app is ready at:
echo 📁 src-tauri\target\release\
echo.
echo Files created:
if exist "src-tauri\target\release\app.exe" (
    echo ✅ app.exe - Standalone desktop application
    dir "src-tauri\target\release\app.exe"
)
if exist "src-tauri\target\release\nemo.exe" (
    echo ✅ nemo.exe - Standalone desktop application  
    dir "src-tauri\target\release\nemo.exe"
)
if exist "src-tauri\target\release\bundle\nsis" (
    echo ✅ Windows installer available in bundle\nsis\
    dir "src-tauri\target\release\bundle\nsis\*.exe"
)

echo.
echo 🚀 You can now distribute the .exe file to other computers!
echo 📋 The file includes everything needed to run Nemo.
echo.
pause