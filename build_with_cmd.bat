@echo off
echo =============================================
echo    Building Nemo Desktop App with CMD
echo =============================================
echo.

echo Step 1: Installing npm dependencies...
cmd /c "npm install"
if %errorlevel% neq 0 (
    echo ❌ npm install failed!
    pause
    exit /b 1
)
echo ✅ npm dependencies installed

echo.
echo Step 2: Installing Tauri CLI...
cmd /c "npm install -g @tauri-apps/cli"
if %errorlevel% neq 0 (
    echo Warning: Global install failed, trying local...
    cmd /c "npm install @tauri-apps/cli"
)

echo.
echo Step 3: Building Next.js frontend...
cmd /c "npm run build"
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend built

echo.
echo Step 4: Building desktop app (this will take 3-5 minutes)...
cmd /c "npm run tauri:build"
if %errorlevel% neq 0 (
    echo ❌ Desktop build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build completed! Checking outputs...
if exist "src-tauri\target\release\*.exe" (
    echo ✅ Desktop executable created:
    dir "src-tauri\target\release\*.exe"
) else (
    echo ❌ No executable found
)

echo.
echo Build process finished.
pause