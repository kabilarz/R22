# PowerShell script to start Nemo backend server
Write-Host "=== Nemo Backend Startup Script ===" -ForegroundColor Green

# Change to backend directory
$backendPath = "c:\Users\drraj\OneDrive\Documents\Beta\R22\backend"
Set-Location $backendPath
Write-Host "Changed to directory: $backendPath" -ForegroundColor Yellow

# Check if Python is available
try {
    $pythonVersion = python --version
    Write-Host "Python version: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python not found!" -ForegroundColor Red
    exit 1
}

# Check if FastAPI is available
try {
    python -c "import fastapi; print('FastAPI imported successfully')"
    Write-Host "FastAPI dependency: OK" -ForegroundColor Green
} catch {
    Write-Host "ERROR: FastAPI not available. Installing..." -ForegroundColor Red
    python -m pip install fastapi uvicorn
}

# Start the simple backend server
Write-Host "Starting backend server on http://localhost:8001..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

try {
    python app.py
} catch {
    Write-Host "ERROR: Failed to start server" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
}