@echo off
echo ============================================
echo    Nemo Desktop Build Status Check
echo ============================================
echo.

echo Checking if Node.js is available...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    goto :end
) else (
    echo ✅ Node.js is available
)

echo.
echo Checking if npm dependencies are installed...
if exist "node_modules" (
    echo ✅ node_modules directory exists
) else (
    echo ❌ node_modules not found, installing dependencies...
    npm install
)

echo.
echo Checking if Tauri CLI is available...
tauri --version
if %errorlevel% neq 0 (
    echo ❌ Tauri CLI not found, installing...
    npm install -g @tauri-apps/cli
) else (
    echo ✅ Tauri CLI is available
)

echo.
echo Checking if Rust is available...
rustc --version
if %errorlevel% neq 0 (
    echo ❌ Rust not found! Please install Rust from https://rustup.rs/
    goto :end
) else (
    echo ✅ Rust is available
)

echo.
echo Checking Python backend...
cd backend
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found!
    cd ..
    goto :end
) else (
    echo ✅ Python is available
)

echo Checking Python dependencies...
python -c "import fastapi, uvicorn, pandas, scipy; print('✅ Core dependencies available')"
if %errorlevel% neq 0 (
    echo ❌ Missing Python dependencies, installing...
    pip install -r requirements.txt
)
cd ..

echo.
echo ============================================
echo    Starting Build Process
echo ============================================

echo.
echo Step 1: Building Next.js frontend...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    goto :end
)
echo ✅ Frontend build completed

echo.
echo Step 2: Building Tauri desktop app...
npm run tauri:build
if %errorlevel% neq 0 (
    echo ❌ Tauri build failed!
    goto :end
)

echo.
echo ============================================
echo           🎉 BUILD COMPLETED! 🎉
echo ============================================

echo.
echo Checking build outputs...
if exist "src-tauri\target\release\app.exe" (
    echo ✅ Desktop app created: src-tauri\target\release\app.exe
    dir "src-tauri\target\release\app.exe"
) else (
    echo ❌ Desktop app not found
)

if exist "src-tauri\target\release\bundle" (
    echo ✅ Installer bundle created in: src-tauri\target\release\bundle\
    dir "src-tauri\target\release\bundle" /s *.exe
) else (
    echo ❌ Installer bundle not found
)

:end
echo.
echo Build status check completed.
pause