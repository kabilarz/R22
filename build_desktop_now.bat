@echo off
setlocal EnableDelayedExpansion

title Building Nemo Desktop Application

echo ===============================================
echo    Nemo Desktop Application Builder
echo ===============================================
echo.

REM Step 1: Check Prerequisites
echo 🔍 Step 1: Checking Prerequisites...
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm not found!
    pause
    exit /b 1
)
echo ✅ npm found

echo.
echo Checking Rust...
rustc --version
if %errorlevel% neq 0 (
    echo ❌ Rust not found! Please install Rust from https://rustup.rs/
    pause
    exit /b 1
)
echo ✅ Rust found

echo.
echo Checking Python...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python 3.8-3.11
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo ===============================================
echo 🛠️  Step 2: Installing Dependencies
echo ===============================================
echo.

echo Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo ✅ Node.js dependencies installed

echo.
echo Installing Tauri CLI...
npm install -g @tauri-apps/cli
if %errorlevel% neq 0 (
    echo ⚠️  Global install failed, trying local install...
    npm install @tauri-apps/cli
)

echo.
echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Python dependencies installed

echo.
echo ===============================================
echo 🏗️  Step 3: Building Frontend
echo ===============================================
echo.

echo Building Next.js frontend...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build completed

echo.
echo ===============================================
echo 🚀 Step 4: Building Desktop Application
echo ===============================================
echo.

echo This will take 3-5 minutes for first build...
echo.

REM Clean any previous builds
if exist "src-tauri\target\release" (
    echo Cleaning previous release build...
    rmdir /s /q "src-tauri\target\release"
)

echo Building Tauri desktop application...
npm run tauri:build
if %errorlevel% neq 0 (
    echo ❌ Desktop build failed!
    echo.
    echo Possible issues:
    echo - Missing Rust dependencies
    echo - WebView2 not installed
    echo - Antivirus blocking compilation
    echo.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo 🎉 Build Completed Successfully!
echo ===============================================
echo.

REM Check build outputs
set "RELEASE_EXE=src-tauri\target\release\app.exe"
set "NEMO_EXE=src-tauri\target\release\nemo.exe"

if exist "%RELEASE_EXE%" (
    echo ✅ Desktop executable created: %RELEASE_EXE%
    dir "%RELEASE_EXE%"
    set "MAIN_EXE=%RELEASE_EXE%"
) else if exist "%NEMO_EXE%" (
    echo ✅ Desktop executable created: %NEMO_EXE%
    dir "%NEMO_EXE%"
    set "MAIN_EXE=%NEMO_EXE%"
) else (
    echo ❌ No executable found in expected locations
    echo Checking target/release directory:
    dir "src-tauri\target\release" /b
    goto :end
)

REM Check for installer
if exist "src-tauri\target\release\bundle\nsis" (
    echo.
    echo ✅ Windows installer created:
    dir "src-tauri\target\release\bundle\nsis\*.exe"
)

if exist "src-tauri\target\release\bundle\msi" (
    echo.
    echo ✅ MSI installer created:
    dir "src-tauri\target\release\bundle\msi\*.msi"
)

echo.
echo ===============================================
echo 🎯 Your Nemo Desktop App is Ready!
echo ===============================================
echo.
echo 📁 Executable Location: !MAIN_EXE!
echo 📦 Bundle Location: src-tauri\target\release\bundle\
echo.
echo 🚀 To run the app:
echo    1. Double-click: !MAIN_EXE!
echo    2. Or use: launch_nemo_simple.bat
echo.
echo The app includes:
echo ✅ Python backend (auto-starts)
echo ✅ Medical statistics engine
echo ✅ AI analysis capabilities
echo ✅ SPSS-style data editor
echo ✅ 119+ statistical tests
echo.

:end
echo Build process completed.
pause