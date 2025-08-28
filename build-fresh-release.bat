@echo off
echo =====================================
echo   Building Fresh Nemo Release
echo =====================================
echo.

echo Step 1: Stopping development servers...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM "next.exe" 2>nul
echo Development servers stopped.

echo.
echo Step 2: Installing latest dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2.5: Ensuring environment configuration...
if not exist ".env.local" (
    echo Creating .env.local with default configuration...
    echo # Next.js Environment Variables for AI Statistical App > .env.local
    echo # Backend API Configuration >> .env.local
    echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8001/api >> .env.local
    echo. >> .env.local
    echo # External Backend URL ^(used for production^) >> .env.local
    echo NEXT_PUBLIC_BACKEND_URL=https://statwise-ai-2.preview.emergentagent.com >> .env.local
    echo. >> .env.local
    echo # Development vs Production API Selection >> .env.local
    echo NODE_ENV=development >> .env.local
    echo. >> .env.local
    echo # Gemini AI Configuration >> .env.local
    echo # Get your API key from: https://makersuite.google.com/app/apikey >> .env.local
    echo # Replace the placeholder with your actual API key >> .env.local
    echo NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy_YOUR_GEMINI_API_KEY_HERE >> .env.local
    echo GEMINI_API_KEY=AIzaSy_YOUR_GEMINI_API_KEY_HERE >> .env.local
)
echo Environment configuration ready.

echo.
echo Step 3: Building Next.js frontend with latest fixes...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)

echo.
echo Step 4: Building Tauri desktop application...
call npx tauri build --verbose
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to build desktop app
    pause
    exit /b 1
)

echo.
echo =====================================
echo        BUILD COMPLETED!
echo =====================================
echo.
echo Fresh app.exe is available at:
echo src-tauri\target\release\app.exe
echo.
for %%I in ("src-tauri\target\release\app.exe") do echo File size: %%~zI bytes
echo.
echo The application includes all latest fixes:
echo - Enhanced file dialog error handling
echo - AI setup button improvements
echo - Complete Gemini API configuration
echo - Fixed backend configuration (app.py instead of simple_app.py)
echo - Desktop environment detection for localhost API
echo - Proper environment variable configuration
echo.
echo To test the desktop app:
echo 1. Start backend: python backend\app.py
echo 2. Run desktop app: src-tauri\target\release\app.exe
echo.
echo Note: Desktop app will automatically use localhost:8001 for backend
echo.
pause