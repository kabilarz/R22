# Nemo - Fresh Desktop Build Script (PowerShell)
# This script creates a clean build with backend auto-startup

$Host.UI.RawUI.WindowTitle = "Nemo - Fresh Desktop Build"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    Nemo - Fresh Desktop Build Script" -ForegroundColor Cyan  
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Function to handle errors gracefully
function Handle-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}

# Clean old builds
Write-Host "🧹 Cleaning old builds..." -ForegroundColor Yellow

if (Test-Path "src-tauri\target\release\app.exe") {
    Write-Host "   - Removing old app.exe" -ForegroundColor Gray
    Remove-Item "src-tauri\target\release\app.exe" -Force -ErrorAction SilentlyContinue
}

if (Test-Path "src-tauri\target\release\bundle") {
    Write-Host "   - Removing old bundle directory" -ForegroundColor Gray
    Remove-Item "src-tauri\target\release\bundle" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path "out") {
    Write-Host "   - Cleaning frontend build cache" -ForegroundColor Gray
    Remove-Item "out" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path ".next") {
    Write-Host "   - Cleaning Next.js cache" -ForegroundColor Gray
    Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "✅ Cleanup completed" -ForegroundColor Green
Write-Host ""

# Verify Python and dependencies
Write-Host "🔍 Verifying Python backend..." -ForegroundColor Yellow

try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python available: $pythonVersion" -ForegroundColor Green
} catch {
    Handle-Error "Python not found! Please install Python and add to PATH."
}

Set-Location "backend"
try {
    python -c "import fastapi, uvicorn, pandas, scipy; print('✅ All Python dependencies available')" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Missing Python dependencies. Installing..." -ForegroundColor Yellow
        pip install -r requirements.txt
        if ($LASTEXITCODE -ne 0) {
            Handle-Error "Failed to install Python dependencies"
        }
    }
} catch {
    Handle-Error "Python dependency check failed"
}
Set-Location ".."

Write-Host ""
Write-Host "🏗️ Building fresh desktop application..." -ForegroundColor Cyan
Write-Host "   This may take 2-5 minutes..." -ForegroundColor Gray
Write-Host ""

# Build frontend
Write-Host "⚙️ Step 1/2: Building frontend..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Frontend build failed!"
    }
    Write-Host "✅ Frontend build completed" -ForegroundColor Green
} catch {
    Handle-Error "Frontend build process failed"
}

Write-Host ""

# Build desktop application
Write-Host "⚙️ Step 2/2: Building desktop application..." -ForegroundColor Yellow
Write-Host "   - Compiling Rust code with backend auto-startup" -ForegroundColor Gray
Write-Host "   - Bundling Python backend files" -ForegroundColor Gray
Write-Host "   - Creating executable..." -ForegroundColor Gray

try {
    npm run tauri:build
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Desktop build failed!"
    }
} catch {
    Handle-Error "Desktop build process failed"
}

Write-Host ""
Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
Write-Host ""

# Verify the new build
if (Test-Path "src-tauri\target\release\app.exe") {
    $appInfo = Get-Item "src-tauri\target\release\app.exe"
    Write-Host "✅ New app.exe created:" -ForegroundColor Green
    Write-Host "   📁 Size: $([math]::Round($appInfo.Length/1MB, 2)) MB" -ForegroundColor Gray
    Write-Host "   📅 Created: $($appInfo.LastWriteTime)" -ForegroundColor Gray
    Write-Host ""
    
    # Ask if user wants to test the app
    $testApp = Read-Host "🧪 Would you like to test the new build now? (y/n)"
    if ($testApp -eq 'y' -or $testApp -eq 'Y') {
        Write-Host ""
        Write-Host "🚀 Starting the application for verification..." -ForegroundColor Cyan
        Write-Host "   - This will test if the backend auto-startup works" -ForegroundColor Gray
        Write-Host "   - Look for backend startup messages in console" -ForegroundColor Gray
        Write-Host "   - The app should show 'Backend is ready' when successful" -ForegroundColor Gray
        Write-Host "   - Close the app to return here" -ForegroundColor Gray
        Write-Host ""
        
        try {
            Start-Process "src-tauri\target\release\app.exe" -Wait
            Write-Host "✅ Application test completed" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Could not start application: $_" -ForegroundColor Yellow
        }
    }
} else {
    Handle-Error "Build appears to have failed - app.exe not found"
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "           🎉 BUILD SUCCESSFUL! 🎉" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Nemo desktop application is ready:" -ForegroundColor White
Write-Host "📁 Location: src-tauri\target\release\app.exe" -ForegroundColor Gray
Write-Host "🚀 Features: Backend auto-startup enabled" -ForegroundColor Gray
Write-Host "📋 To run: Double-click app.exe or use launch_nemo.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "ℹ️  The app will automatically start the Python backend" -ForegroundColor Cyan
Write-Host "   when launched. No manual backend startup needed!" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"