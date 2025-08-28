@echo off
echo ===============================================
echo      TESTING REBUILT NEMO APP WITH FIXES
echo ===============================================
echo.

cd /d "c:\Users\drraj\OneDrive\Documents\Beta\R22"

echo 🎉 REBUILD COMPLETE!
echo.
echo ✅ Applied Fixes:
echo   1. CORS configuration fixed in backend/app.py
echo   2. API client improved with Tauri detection
echo   3. Backend status component enhanced (15 retries)
echo   4. Static export enabled for Tauri compatibility
echo   5. Frontend rebuilt with all improvements
echo.

echo Step 1: Verify backend is running...
curl -s http://localhost:8001/api/health
if errorlevel 1 (
    echo ❌ Backend not running! Please start it first.
    echo Run: python backend\app.py
    pause
    exit /b 1
)

echo.
echo Step 2: Check app.exe timestamp...
dir src-tauri\target\release\app.exe

echo.
echo Step 3: Starting rebuilt desktop app...
echo.
echo 🔍 What to expect:
echo   ✅ Backend status should show "ready" immediately
echo   ✅ NO MORE "(1/15)" endless spinning
echo   ✅ Console should show API detection debug info
echo   ✅ All API calls should work without CORS errors
echo.

start src-tauri\target\release\app.exe

echo.
echo 🎯 SUCCESS INDICATORS:
echo   • Opens without errors
echo   • Backend status: "Backend is ready" 
echo   • No CORS errors in browser console
echo   • Can upload datasets and run analysis
echo.
echo 🚨 If you still see issues:
echo   1. Check browser console for errors
echo   2. Verify API Base URL is http://localhost:8001/api
echo   3. Ensure backend is running on port 8001
echo.
pause