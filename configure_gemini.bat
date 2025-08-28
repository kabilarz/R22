@echo off
echo ===============================================
echo      Gemini API Key Configuration
echo ===============================================
echo.
echo Current Gemini API configuration:
echo.

REM Check current API key status
findstr "NEXT_PUBLIC_GEMINI_API_KEY" .env.local
echo.

echo To configure Gemini AI integration:
echo.
echo 1. Get your API key from: https://makersuite.google.com/app/apikey
echo 2. Open .env.local in a text editor
echo 3. Replace both instances of "AIzaSy_YOUR_GEMINI_API_KEY_HERE" with your actual API key
echo.
echo Example:
echo   NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDhT6nQ8Wv9XrC2kP7sM4aE1bF3gH5jR8x
echo   GEMINI_API_KEY=AIzaSyDhT6nQ8Wv9XrC2kP7sM4aE1bF3gH5jR8x
echo.
echo Note: The app will work without Gemini API (using local analysis only)
echo       but AI-powered insights will not be available.
echo.

set /p choice="Would you like to open .env.local for editing? (y/n): "
if /i "%choice%"=="y" (
    notepad .env.local
)

echo.
echo After updating the API key:
echo 1. Save the .env.local file
echo 2. Restart the application for changes to take effect
echo.
pause