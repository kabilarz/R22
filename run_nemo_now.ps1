# Nemo Desktop App - PowerShell Launcher
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "      NEMO - POWERSHELL LAUNCHER" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host

# Set location to project directory
Set-Location "c:\Users\drraj\OneDrive\Documents\Beta\R22"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray
Write-Host

# Stop existing backend processes
Write-Host "Step 1: Stopping existing backend processes..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Check if app exists
$appPath = "src-tauri\target\release\app.exe"
if (Test-Path $appPath) {
    $appInfo = Get-Item $appPath
    Write-Host "✅ Desktop app found!" -ForegroundColor Green
    Write-Host "   Size: $([math]::Round($appInfo.Length / 1MB, 1)) MB" -ForegroundColor Gray
    Write-Host "   Modified: $($appInfo.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Host "❌ Desktop app NOT found!" -ForegroundColor Red
    Write-Host "Expected location: $(Resolve-Path .)/$appPath" -ForegroundColor Red
    Write-Host
    Write-Host "Please build the app first with: npx tauri build" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host
Write-Host "Step 2: Starting backend server..." -ForegroundColor Yellow
Start-Process -FilePath "python" -ArgumentList "backend\app.py" -WindowStyle Hidden

Write-Host "Step 3: Waiting for backend initialization..." -ForegroundColor Yellow
for ($i = 1; $i -le 10; $i++) {
    Write-Host "   Waiting $i/10 seconds..." -ForegroundColor Gray
    Start-Sleep -Seconds 1
}

Write-Host
Write-Host "✅ Backend startup complete!" -ForegroundColor Green
Write-Host
Write-Host "Step 4: Launching Nemo Desktop App..." -ForegroundColor Cyan
Write-Host
Write-Host "🔍 Debug Info:" -ForegroundColor Magenta
Write-Host "   Backend URL: http://localhost:8001" -ForegroundColor Gray
Write-Host "   Health check: http://localhost:8001/api/health" -ForegroundColor Gray
Write-Host

# Launch the app and wait for it to close
Start-Process -FilePath $appPath -Wait

Write-Host
Write-Host "🛑 App has closed" -ForegroundColor Cyan
Write-Host
Write-Host "Cleaning up backend processes..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cleanup complete!" -ForegroundColor Green

Read-Host "Press Enter to exit"