# How to Build the Desktop Installer from Codebase

## 🎯 Current Situation

You have the **Nemo codebase** and need to **CREATE** the `nemo-setup-windows-x64.exe` installer file that users will download.
  
## 🏗️ Step-by-Step Build Process
  

### Step 1: Prepare Your Build Environment

```bash

# Ensure you're in the project root directory

cd /app

  

# Verify all prerequisites are installed

node --version    # Should show v18+

python --version  # Should show 3.8-3.11

rustc --version   # Should show Rust installed

```

  

### Step 2: Install All Dependencies

```bash

# Install Node.js dependencies (if not already done)

npm install

  

# Install Tauri CLI globally

npm install -g @tauri-apps/cli

  

# Install Python backend dependencies

cd backend

pip install -r requirements.txt

cd ..

```

  

### Step 3: Download Ollama Binary for Bundling

```bash

# Run the setup script to download Ollama

scripts\\setup-ollama.bat

  

# Or manually create the directory and download:

mkdir -p src-tauri\

esources\\ollama

# Download Ollama (this will be bundled in the installer)

curl -L https://ollama.ai/download/ollama-windows-amd64.exe -o src-tauri\

esources\\ollama\\ollama.exe

```

  

### Step 4: Build the Desktop Application

```bash

# Option A: Use our automated build script

scripts\\build-production.bat

  

# Option B: Manual build commands

npm run build              # Build the Next.js frontend

npm run tauri:build        # Build the Tauri desktop app

```

  

### Step 5: Locate Your Built Installer

After the build completes, you'll find:

  

```

📦 Built Files Location:

├── src-tauri\  arget\

elease\\bundle\

sis\\

│   └── nemo_1.0.0_x64-setup.exe     ← THIS IS YOUR INSTALLER!

└── src-tauri\  arget\

elease\\

    └── nemo.exe                      ← Portable version

```

  

## 🎉 What Just Happened?

  

1. **Tauri compiled your app** - Combined your Next.js frontend with Rust backend

2. **Created Windows installer** - Professional NSIS installer with shortcuts

3. **Bundled Ollama** - AI runtime is included in the installer

4. **Made it distributable** - Users can now install your app

  

## 📤 Distributing to Users

  

### For End Users Installation:

1. **Give them the file**: `src-tauri\  arget\

elease\\bundle\

sis\

emo_1.0.0_x64-setup.exe`

2. **They run it as Administrator**

3. **They install Python** (if not already installed)

4. **They launch Nemo** and download AI models

  

### For Distribution:

```bash

# 1. Test the installer on a clean Windows machine

# 2. Create SHA256 hash for security

certutil -hashfile "src-tauri\  arget\

elease\\bundle\

sis\

emo_1.0.0_x64-setup.exe" SHA256

  

# 3. Upload to your website/GitHub releases/distribution platform

# 4. Provide users with download link and the project-compass.json instructions

```

  

## 🔧 Build Troubleshooting

  

### Common Issues:

  

**"Ollama binary not found"**

```bash

# Solution: Download Ollama manually

mkdir -p src-tauri\

esources\\ollama

curl -L https://ollama.ai/download/ollama-windows-amd64.exe -o src-tauri\

esources\\ollama\\ollama.exe

```

  

**"Build fails with Rust errors"**

```bash

# Solution: Update Rust

rustup update

```

  

**"Next.js build fails"**

```bash

# Solution: Clean and rebuild

rm -rf .next node_modules

npm install

npm run build

```

  

**"Large bundle size"**

- The installer will be ~150MB because it includes Ollama (~100MB)

- This is expected and necessary for offline AI functionality

  

## ✅ Verification

  

Test your built installer:

```bash

# 1. Copy the installer to a different Windows machine (clean install recommended)

# 2. Run: nemo_1.0.0_x64-setup.exe

# 3. Follow installation steps

# 4. Launch Nemo and verify it works

# 5. Test uploading a CSV file and asking AI questions

```

  

## 🚀 Quick Build Command Summary

  

```bash

# Complete build in one command:

scripts\\build-production.bat

  

# Manual build:

npm install

cd backend && pip install -r requirements.txt && cd ..

scripts\\setup-ollama.bat

npm run build

npm run tauri:build

  

# Your installer will be at:

# src-tauri\    arget\

elease\\bundle\

sis\

emo_1.0.0_x64-setup.exe

```

  

## 📋 Next Steps

  

1. ✅ Build the installer using steps above

2. ✅ Test installer on clean Windows system

3. ✅ Upload installer to your distribution platform (website/GitHub)

4. ✅ Share download link with users along with installation guide

5. ✅ Users follow the project-compass.json instructions

  

**The installer you create IS the file users will download and install!**
