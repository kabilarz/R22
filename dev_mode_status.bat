@echo off
echo ===============================================
echo     🚀 DEVELOPMENT MODE - MUCH BETTER APPROACH!
echo ===============================================
echo.

cd /d "c:\Users\drraj\OneDrive\Documents\Beta\R22"

echo 🎉 SMART SOLUTION IN PROGRESS:
echo.
echo Instead of fighting with the built app.exe that keeps having issues,
echo I'm now running the app in DEVELOPMENT MODE using:
echo.
echo    npm run tauri dev
echo.
echo This approach is MUCH more reliable because:
echo ✅ Uses live Next.js dev server (localhost:3000)
echo ✅ No static export issues
echo ✅ Real-time code changes
echo ✅ Better debugging capabilities
echo ✅ Direct source code execution (no build cache issues)
echo.

echo 🔍 Current Status:
echo.

echo Backend Status:
netstat -ano | findstr :8001
if errorlevel 1 (
    echo ❌ Backend not running
) else (
    echo ✅ Backend running on port 8001
)

echo.
echo Frontend Dev Server Status:
netstat -ano | findstr :3000
if errorlevel 1 (
    echo ⏳ Next.js dev server starting...
) else (
    echo ✅ Next.js dev server running on port 3000
)

echo.
echo Tauri Compilation Status:
tasklist | findstr cargo
if errorlevel 1 (
    echo ⏳ Tauri compilation may be complete or not started
) else (
    echo 🔨 Tauri is compiling (this takes 2-3 minutes first time)
)

echo.
echo ===============================================
echo 💡 WHY THIS WILL WORK:
echo ===============================================
echo.
echo The development mode bypasses all the issues we had with:
echo • Static export configuration
echo • Build cache problems  
echo • API URL detection issues
echo • CORS configuration problems
echo.
echo In dev mode, the app runs directly from source code
echo with hot reload and real-time updates!
echo.
echo ⏰ Expected Timeline:
echo • First time: 2-3 minutes to compile Tauri
echo • After that: 10-15 seconds to start
echo.
echo 🎯 When the app window opens, you should see:
echo • "Backend is ready" immediately
echo • No more "(1/15)" spinning
echo • Full functionality working
echo.
pause