@echo off
echo ===============================================
echo      Backend Health Check
echo ===============================================
echo.

echo Checking if backend is running on port 8001...
netstat -ano | findstr :8001
if errorlevel 1 (
    echo ❌ Backend not running on port 8001
    echo.
    echo To start the backend:
    echo   python backend\app.py
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Backend process found on port 8001
)

echo.
echo Testing backend health endpoint...

REM Try to test the health endpoint using curl or PowerShell
curl --version >nul 2>&1
if not errorlevel 1 (
    echo Using curl to test backend...
    curl -s http://localhost:8001/api/health
) else (
    echo Using PowerShell to test backend...
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8001/api/health' -UseBasicParsing; Write-Host 'Status:' $response.StatusCode; Write-Host 'Response:' $response.Content } catch { Write-Host 'Error:' $_.Exception.Message }"
)

echo.
echo ===============================================
echo.
pause