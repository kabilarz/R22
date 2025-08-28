# Nemo Desktop Application - Build & Run Guide

## 🚀 Quick Start

### Option 1: Use the Build Script (Recommended)
```bash
# Double-click or run:
build_nemo.bat
```

### Option 2: Use PowerShell (If batch has issues)
```powershell
# Run in PowerShell:
.\build_fresh_nemo.ps1
```

### Option 3: Manual Build
```bash
npm run build
npm run tauri:build
```

## 📦 Running the Application

### After Building, Choose One:

1. **Simple Launcher** (Works with any build):
   ```bash
   run_nemo.bat
   ```

2. **Smart Launcher** (Detects build type):
   ```powershell
   .\launch_nemo.ps1
   ```

3. **Direct Launch** (New builds only):
   ```bash
   src-tauri\target\release\app.exe
   ```

## 🔧 What's Fixed

### Backend Auto-Startup Features
- **New builds** (created with the scripts above) automatically start the Python backend
- **No manual backend startup needed** for new builds
- **Fallback support** for older builds that need manual backend startup

### Build Process Improvements
- **Clean build process** - removes old files before building
- **Dependency verification** - checks Python and packages before building
- **Error handling** - provides clear messages if something goes wrong
- **Build verification** - tests the app after building

### Terminal Reliability
- **Multiple launcher options** to handle terminal issues
- **PowerShell and Batch alternatives** for different environments
- **Fallback mechanisms** if one method doesn't work

## 🐛 Troubleshooting

### If Backend Still Says "Not Ready":

1. **Build Date Check**: Run `build_nemo.bat` to create a fresh build with auto-startup
2. **Manual Backend**: If needed, run `python backend/app.py` in a separate terminal
3. **Python Check**: Ensure Python is installed and `pip install -r backend/requirements.txt` is run

### If Terminal Gets Stuck:

1. **Use Batch Files**: Try `build_nemo.bat` and `run_nemo.bat`
2. **PowerShell Alternative**: Use PowerShell scripts if batch files have issues
3. **Direct Commands**: Run commands directly in a fresh terminal

### Build Issues:

1. **Clean First**: Delete `src-tauri\target\release\app.exe` and `.next` folder
2. **Fresh Terminal**: Open a new terminal window
3. **Check Dependencies**: Ensure Node.js, Python, and Rust are installed

## 📋 File Overview

| File | Purpose |
|------|---------|
| `build_nemo.bat` | Main build launcher (tries PowerShell, falls back to batch) |
| `build_fresh_nemo.ps1` | PowerShell build script (most reliable) |
| `build_fresh_nemo.bat` | Batch build script (fallback) |
| `run_nemo.bat` | Simple app launcher |
| `launch_nemo.ps1` | Smart launcher (detects build type) |
| `launch_nemo.bat` | Original launcher (manual backend) |

## ✅ Expected Results

After building with the new scripts:

1. **app.exe** will be created in `src-tauri\target\release\`
2. **Backend files** will be bundled with the app
3. **Auto-startup** will work when you launch the app
4. **"Backend is ready"** message should appear automatically
5. **No manual backend startup** needed

## 🎯 Key Features in New Build

- ✅ **Automatic backend startup** when app launches
- ✅ **Backend bundling** - Python files included with app
- ✅ **Health checks** - app verifies backend is working
- ✅ **Error handling** - clear messages if backend fails
- ✅ **Fallback support** - works even if auto-startup fails

---

**Need help?** If you still have issues after using these scripts, the problem might be with Python installation or missing dependencies. Run `python backend/test_startup.py` to diagnose backend issues.