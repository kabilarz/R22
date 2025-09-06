# Bundled Python Setup Guide for Nemo Medical AI

## 🎯 Current Status
- ✅ **Detection Logic**: Ready in enhanced_python_executor.py
- ✅ **Directory Structure**: src-tauri/resources/python/ exists
- ❌ **Python Runtime**: Not bundled yet (uses system Python)

## 🐍 Options for Bundling Python

### Option 1: Embeddable Python (Recommended)
```bash
# Download Python Embeddable Package
# Windows x64: python-3.11.x-embed-amd64.zip
# Extract to: src-tauri/resources/python/

# Structure should be:
src-tauri/resources/python/
├── python.exe
├── python311.dll
├── python311.zip
├── Scripts/
│   └── pip.exe
└── Lib/
    └── site-packages/
```

### Option 2: Portable Python
- Download portable Python distribution
- Extract to resources/python/
- Install medical libraries locally

### Option 3: Python MSI + Silent Install
- Bundle Python installer
- Install during app setup
- More complex but full Python

## 📦 Required Medical Libraries
```
pandas>=2.1.4
numpy>=1.24.4
scipy>=1.11.4
matplotlib>=3.8.2
seaborn>=0.13.0
statsmodels>=0.14.1
scikit-learn>=1.3.2
pingouin>=0.5.4
lifelines>=0.29.0
plotly>=5.18.0
```

## 🛠️ Implementation Steps

### Step 1: Download Embeddable Python
```bash
# Windows 64-bit
wget https://www.python.org/ftp/python/3.11.7/python-3.11.7-embed-amd64.zip
```

### Step 2: Extract to Resources
```bash
# Extract to: src-tauri/resources/python/
unzip python-3.11.7-embed-amd64.zip -d src-tauri/resources/python/
```

### Step 3: Install pip (if not included)
```bash
# Download get-pip.py
cd src-tauri/resources/python/
python.exe get-pip.py
```

### Step 4: Install Medical Libraries
```bash
cd src-tauri/resources/python/
python.exe -m pip install pandas numpy scipy matplotlib seaborn statsmodels scikit-learn pingouin lifelines plotly
```

### Step 5: Update Tauri Config
```json
// tauri.conf.json - include resources
{
  "tauri": {
    "bundle": {
      "resources": [
        "resources/python/**/*"
      ]
    }
  }
}
```

## ✅ Verification
Your system already checks for bundled Python automatically:
1. Looks for bundled Python first
2. Falls back to system Python if not found
3. Reports which Python is being used

## 🎯 Benefits of Bundled Python
- 🔒 **Consistent environment** across all installations
- 📦 **No external dependencies** on user's Python
- 🏥 **Medical libraries pre-installed** and ready
- 🚀 **Portable desktop app** with all dependencies
- 🛡️ **HIPAA compliance** - completely offline capable

## 📊 Size Considerations
- **Base Python**: ~50MB
- **Medical Libraries**: ~200MB
- **Total Addition**: ~250MB to installer
- **Worth it for**: Professional medical software

## 🚀 Quick Setup Script
Create this as `scripts/setup-bundled-python.bat`:

```batch
@echo off
echo Setting up bundled Python for Nemo...
mkdir src-tauri\resources\python
cd src-tauri\resources\python

echo Downloading Python embeddable...
powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.7/python-3.11.7-embed-amd64.zip' -OutFile 'python-embed.zip'"

echo Extracting Python...
powershell -Command "Expand-Archive -Path 'python-embed.zip' -DestinationPath '.'"

echo Installing medical libraries...
python.exe -m pip install pandas numpy scipy matplotlib seaborn statsmodels scikit-learn pingouin lifelines plotly

echo Bundled Python setup complete!
pause
```