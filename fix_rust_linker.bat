@echo off
echo ===============================================
echo    🔧 Fixing Rust Linker Issue
echo ===============================================
echo.

echo The issue: Rust can't find Visual Studio's link.exe
echo Solution: Install Visual Studio Build Tools or configure Rust
echo.

echo Step 1: Checking current Rust installation...
rustc --version
cargo --version

echo.
echo Step 2: Installing Visual Studio Build Tools (if needed)...
echo.
echo Option A: Quick fix - Install Visual Studio Build Tools
echo 📥 Downloading Visual Studio Build Tools...

REM Download Visual Studio Build Tools
powershell -Command "& {Invoke-WebRequest -Uri 'https://aka.ms/vs/17/release/vs_buildtools.exe' -OutFile 'vs_buildtools.exe'}"

if exist "vs_buildtools.exe" (
    echo ✅ Downloaded vs_buildtools.exe
    echo.
    echo 🚀 Starting Visual Studio Build Tools installer...
    echo ⚠️  IMPORTANT: In the installer, make sure to select:
    echo    • C++ build tools
    echo    • Windows 10/11 SDK
    echo    • MSVC v143 compiler toolset
    echo.
    echo The installer will open now. Please install the C++ tools.
    pause
    start vs_buildtools.exe
    echo.
    echo ⏳ Waiting for installation to complete...
    echo Press any key when Visual Studio Build Tools installation is finished...
    pause
) else (
    echo ❌ Download failed. Please manually download from:
    echo https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
    pause
)

echo.
echo Step 3: Verifying Rust can now find the linker...
rustc --print cfg | findstr target_env

echo.
echo Step 4: Testing a simple Rust compilation...
echo fn main() { println!("Hello from Rust!"); } > test_rust.rs
rustc test_rust.rs
if exist "test_rust.exe" (
    echo ✅ Rust compilation works!
    test_rust.exe
    del test_rust.rs test_rust.exe
) else (
    echo ❌ Still having issues. Let's try alternative approach...
    goto :alternative
)

echo.
echo ✅ Linker issue fixed! Now let's build Nemo...
goto :build_nemo

:alternative
echo.
echo ===============================================
echo    🔧 Alternative: Use GNU toolchain
echo ===============================================
echo.
echo Installing Rust with GNU toolchain instead of MSVC...
rustup toolchain install stable-x86_64-pc-windows-gnu
rustup default stable-x86_64-pc-windows-gnu

echo Installing mingw-w64...
winget install -e --id mingw-w64.mingw-w64

echo Testing GNU compilation...
rustc --print cfg | findstr target_env

:build_nemo
echo.
echo ===============================================
echo    🚀 Building Nemo Desktop App
echo ===============================================
echo.

echo Now that Rust linker is fixed, let's build Nemo...
cd /d "%~dp0"

echo Starting backend...
start /B cmd /c "cd backend && python app.py"
timeout /t 3 /nobreak >nul

echo Building desktop app...
npm run tauri dev

pause