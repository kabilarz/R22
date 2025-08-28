# Nemo Desktop App Launcher (PowerShell)
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "      Nemo AI Medical Data Analytics" -ForegroundColor Cyan  
Write-Host "      PowerShell Launcher" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host

# Check if the built app exists
$appPath = "src-tauri\target\release\app.exe"
if (-not (Test-Path $appPath)) {
    Write-Host "❌ Desktop app not found: $appPath" -ForegroundColor Red
    Write-Host "Please run the build first: npx tauri build" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Desktop app found: $appPath" -ForegroundColor Green

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python is available: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python and add it to PATH." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if backend directory exists
if (-not (Test-Path "backend\app.py")) {
    Write-Host "❌ Backend not found at: backend\app.py" -ForegroundColor Red
    Write-Host "Make sure you're running this from the project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Backend found" -ForegroundColor Green

Write-Host
Write-Host "🚀 Starting Nemo Application..." -ForegroundColor Cyan
Write-Host

# Check if backend is already running
$existingBackend = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue
if ($existingBackend) {
    Write-Host "✅ Backend already running on port 8001" -ForegroundColor Green
} else {
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    
    # Start backend in background
    Start-Process -FilePath "python" -ArgumentList "backend\app.py" -WindowStyle Hidden
    
    # Wait for backend to be ready
    $maxAttempts = 15
    $attempt = 0
    $backendReady = $false
    
    Write-Host "Checking backend readiness..." -ForegroundColor Yellow
    
    while ($attempt -lt $maxAttempts -and -not $backendReady) {
        $attempt++
        Write-Host "Attempt $attempt/$maxAttempts" -ForegroundColor Gray
        
        Start-Sleep -Seconds 2
        
        try {
            $connection = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue
            if ($connection) {
                Write-Host "✅ Backend is ready!" -ForegroundColor Green
                $backendReady = $true
            }
        } catch {
            # Continue waiting
        }
    }
    
    if (-not $backendReady) {
        Write-Host "⚠️  Backend may still be starting. Continuing anyway..." -ForegroundColor Yellow
    }
}

Write-Host
Write-Host "⚠️  Note: Gemini AI requires API key configuration in .env.local" -ForegroundColor Yellow
Write-Host
Write-Host "Starting desktop application..." -ForegroundColor Cyan

# Start the desktop app
Start-Process -FilePath $appPath -Wait

Write-Host
Write-Host "🛑 Application closed" -ForegroundColor Cyan
Read-Host "Press Enter to exit"