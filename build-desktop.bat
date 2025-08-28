@echo off
echo Building Nemo Desktop Application with Latest Fixes...
echo.

echo Step 1: Building Next.js frontend...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: Frontend build failed
    pause
    exit /b 1
)

echo.
echo Step 2: Building Tauri desktop app...
call npx tauri build --verbose
if %ERRORLEVEL% neq 0 (
    echo Error: Desktop build failed
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.
echo Output files:
echo - Executable: src-tauri\target\release\app.exe
if exist "src-tauri\target\release\bundle\nsis\*.exe" (
    echo - Installer: src-tauri\target\release\bundle\nsis\*.exe
) else (
    echo - Note: Installer creation may have been skipped
)

echo.
echo You can test the desktop app by running:
echo   src-tauri\target\release\app.exe
echo.
pause