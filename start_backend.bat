@echo off
echo === Nemo Backend Server ===
cd /d "c:\Users\drraj\OneDrive\Documents\Beta\R22\backend"

echo Testing Python availability...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo Installing/checking FastAPI...
python -m pip install fastapi uvicorn --quiet

echo Starting backend server on http://localhost:8001...
echo Press Ctrl+C to stop the server
python simple_app.py

pause