# Force stop all Node.js processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Change to project directory
Set-Location "C:\Users\drraj\OneDrive\Documents\Beta\R22"

# Ensure environment configuration exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local with default configuration..." -ForegroundColor Yellow
    @"
# Next.js Environment Variables for AI Statistical App
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001/api

# External Backend URL (used for production)
NEXT_PUBLIC_BACKEND_URL=https://statwise-ai-2.preview.emergentagent.com

# Development vs Production API Selection
NODE_ENV=development

# Gemini AI Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
# Replace the placeholder with your actual API key
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy_YOUR_GEMINI_API_KEY_HERE
GEMINI_API_KEY=AIzaSy_YOUR_GEMINI_API_KEY_HERE
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
}

Write-Host "Building Next.js frontend..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend build successful. Building Tauri app..." -ForegroundColor Green
    npx tauri build --verbose
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build completed successfully!" -ForegroundColor Green
        Write-Host "app.exe location: src-tauri\target\release\app.exe" -ForegroundColor Cyan
        $fileInfo = Get-Item "src-tauri\target\release\app.exe" -ErrorAction SilentlyContinue
        if ($fileInfo) {
            Write-Host "File size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Cyan
            Write-Host "Last modified: $($fileInfo.LastWriteTime)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "Tauri build failed!" -ForegroundColor Red
    }
} else {
    Write-Host "Frontend build failed!" -ForegroundColor Red
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")