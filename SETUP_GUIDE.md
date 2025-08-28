# Nemo Desktop App - Setup & Troubleshooting Guide

## 🎉 Build Status: SUCCESS
- ✅ Desktop app built successfully (15.8 MB)
- ✅ Backend server working
- ✅ Frontend static export ready
- ⚠️ Gemini API key needs configuration

## 🚀 Quick Start

### Option 1: Reliable Launcher (Recommended)
```bash
start_nemo.bat
```
This script:
- Kills any existing backend processes
- Starts fresh backend process
- Waits 8 seconds for initialization
- Launches the desktop app
- Cleans up on exit

### Option 2: PowerShell Launcher (Advanced)
```bash
launch_nemo.ps1
```
This script:
- Uses PowerShell for better process detection
- Checks if backend is already running
- Smart waiting with network verification
- More detailed status messages

### Option 3: Simple Launcher
```bash
launch_nemo_simple.bat
```
Basic launcher with fixed 5-second wait.

### Option 4: Manual Start
1. **Start Backend:** `python backend\app.py`
2. **Launch App:** `src-tauri\target\release\app.exe`

## 🔧 Troubleshooting

### Issue: "Failed to connect to Gemini API"
**Cause:** Placeholder API key in .env.local
**Solution:** 
1. Run: `configure_gemini.bat`
2. Get API key from: https://makersuite.google.com/app/apikey
3. Edit .env.local and replace `AIzaSy_YOUR_GEMINI_API_KEY_HERE` with your real API key

### Issue: "Starting backend server... (1/10) and stuck"
**Cause:** Complex network detection in batch script causing infinite loop
**Solutions:** 
1. **Use reliable launcher:** `start_nemo.bat` (kills existing processes and uses fixed wait)
2. **Use PowerShell launcher:** `launch_nemo.ps1` (better process detection)
3. **Manual approach:** Start backend separately with `python backend\app.py`, then run app

### Issue: Backend connection problems
**Check backend status:** `check_backend.bat`
**Verify health endpoint:** http://localhost:8001/api/health

## 📁 Launcher Scripts Available

- `start_nemo.bat` - **Reliable launcher** (kills existing processes, fixed wait) - **RECOMMENDED**
- `launch_nemo.ps1` - **PowerShell launcher** (advanced network detection)
- `launch_nemo_simple.bat` - **Simple launcher** (5-second fixed wait)
- `launch_nemo_app.bat` - **Original launcher** (may have network detection issues)
- `configure_gemini.bat` - Gemini API key configuration helper
- `check_backend.bat` - Backend health verification
- `verify_build.bat` - Build status verification

## 📋 Current Configuration

### Backend
- **Port:** 8001 (to avoid conflicts)
- **Health Check:** http://localhost:8001/api/health
- **API Base:** http://localhost:8001/api

### Frontend
- **Mode:** Static export for Tauri
- **Environment:** Development (.env.local)

### Desktop App
- **Location:** src-tauri\target\release\app.exe
- **Size:** ~15.8 MB
- **Dependencies:** Requires backend running on localhost:8001

## 🔑 Gemini API Setup

1. Visit: https://makersuite.google.com/app/apikey
2. Create/get your API key
3. Edit `.env.local`:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_API_KEY=your_actual_api_key_here
   ```

## 🎯 What's Working Now

✅ Desktop application builds and starts
✅ Backend server runs and responds
✅ Frontend-backend communication
✅ Improved launcher with backend detection
✅ Better error messages and user feedback
✅ Health check and verification tools

The main issues have been resolved:
1. **Build crash** - Fixed by cleaning up Rust code
2. **Backend detection** - Fixed with improved launcher script
3. **Gemini API** - Clear configuration instructions provided

Your Nemo desktop app is now ready to use! 🎉