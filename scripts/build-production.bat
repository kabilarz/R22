@echo off
REM Production build script for Nemo desktop application
REM This script builds the complete desktop app with all dependencies

echo.
echo =====================================
echo    Nemo - Production Build Script
echo =====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check if Rust is installed
rustc --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Rust is not installed
    echo Please install Rust from https://rustup.rs/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8-3.11 from https://python.org
    pause
    exit /b 1
)

echo Step 1: Installing Node.js dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Installing Tauri CLI...
call npm install -g @tauri-apps/cli
if %ERRORLEVEL% neq 0 (
    echo WARNING: Failed to install Tauri CLI globally, trying locally...
    call npm install @tauri-apps/cli
)

echo.
echo Step 3: Installing Python backend dependencies...
cd backend
call pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install Python dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Step 4: Setting up Ollama...
call scripts\setup-ollama.bat
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to setup Ollama
    pause
    exit /b 1
)

echo.
echo Step 5: Building Next.js application...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to build Next.js application
    pause
    exit /b 1
)

echo.
echo Step 6: Building Tauri desktop application...
call npm run tauri build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to build Tauri application
    pause
    exit /b 1
)

echo.
echo =====================================
echo         BUILD SUCCESSFUL!
echo =====================================
echo.
echo Your Nemo desktop application has been built successfully!
echo.
echo Output files:
echo - Installer: src-tauri\target\release\bundle\nsis\nemo_1.0.0_x64-setup.exe
echo - Portable: src-tauri\target\release\nemo.exe
echo.
echo The installer includes:
echo - Nemo desktop application
echo - Bundled Ollama AI runtime
echo - All required dependencies
echo.
echo File sizes (approximate):
for %%I in ("src-tauri\target\release\bundle\nsis\nemo_1.0.0_x64-setup.exe") do echo - Installer: %%~zI bytes (~150MB)
for %%I in ("src-tauri\target\release\nemo.exe") do echo - Portable: %%~zI bytes (~100MB)
echo.
echo Ready for distribution!
echo.
pause