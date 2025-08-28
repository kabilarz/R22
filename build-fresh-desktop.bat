@echo off
echo ========================================
echo    Building Nemo Desktop Application
echo    Including All Latest Fixes
echo ========================================
echo.

echo Stopping any running development servers...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo Step 1: Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Building Next.js frontend...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: Frontend build failed
    pause
    exit /b 1
)

echo.
echo Step 3: Building Tauri desktop application...
call npx tauri build --verbose
if %ERRORLEVEL% neq 0 (
    echo Error: Desktop build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo         BUILD COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Output files:
echo - Executable: src-tauri\target\release\app.exe
for %%I in ("src-tauri\target\release\app.exe") do echo   Size: %%~zI bytes (~%%~zI MB)

if exist "src-tauri\target\release\bundle\nsis\*.exe" (
    echo - Installer: src-tauri\target\release\bundle\nsis\*.exe
    for %%I in ("src-tauri\target\release\bundle\nsis\*.exe") do echo   Size: %%~zI bytes
) else (
    echo - Note: Installer not created (portable app only)
)

echo.
echo Latest fixes included:
echo ✓ Enhanced file dialog error handling
echo ✓ AI setup button hardware configuration preservation  
echo ✓ Complete Gemini API configuration with status indicators
echo.
echo To test the desktop app:
echo 1. Run: src-tauri\target\release\app.exe
echo 2. Start backend: python backend\app.py
echo.
pause