@echo off
echo ===============================================
echo    🔧 Fixed Build - Retry Desktop Compilation
echo ===============================================
echo.

echo ✅ Fixed syntax errors in:
echo   - app/page.tsx (missing closing braces)
echo   - src-tauri/src/python_manager.rs (Unicode escapes)
echo.

echo 🚀 Starting clean build...
echo.

REM Kill any existing processes
taskkill /F /IM "node.exe" >nul 2>&1
taskkill /F /IM "cargo.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

echo Step 1: Clean build cache...
if exist ".next" rmdir /s /q ".next"
if exist "src-tauri\target\debug" rmdir /s /q "src-tauri\target\debug"

echo.
echo Step 2: Starting Tauri development build...
echo ⏰ Estimated time: 2-3 minutes for first build
echo 📱 Desktop window will open when ready
echo.

npm run tauri dev

echo.
echo Build attempt completed!
pause