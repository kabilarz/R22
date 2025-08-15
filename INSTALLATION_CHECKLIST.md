# Nemo Installation Checklist

## Pre-Distribution Checklist

### 🏗️ Build Environment Setup
- [ ] Node.js 18+ installed and verified (`node --version`)
- [ ] Python 3.8-3.11 installed and in PATH (`python --version`) 
- [ ] Rust toolchain installed (`rustc --version`)
- [ ] Tauri CLI installed (`npm install -g @tauri-apps/cli`)
- [ ] All npm dependencies installed (`npm install`)
- [ ] Python backend dependencies installed (`pip install -r backend/requirements.txt`)

### 📦 Component Verification
- [ ] Ollama binary downloaded to `src-tauri/resources/ollama/ollama.exe`
- [ ] Ollama binary size > 100MB (verify it's complete)
- [ ] Tauri configuration includes Ollama in `externalBin` and `resources`
- [ ] Backend server starts without errors (`python backend/server.py`)
- [ ] Frontend builds successfully (`npm run build`)

### 🧪 Testing
- [ ] Run verification script: `python scripts/verify-installation.py`
- [ ] Test development mode: `npm run tauri dev`
- [ ] Test production build: `npm run tauri build`
- [ ] Upload sample CSV file and verify processing
- [ ] Test AI model downloads (at least TinyLlama)
- [ ] Test Python code execution functionality
- [ ] Test SPSS-style data editor
- [ ] Verify cloud fallback (if API key configured)

### 📋 Documentation
- [ ] `project-compass.json` includes all installation steps
- [ ] `DEPLOYMENT_GUIDE.md` is complete and accurate
- [ ] `README.md` has production installation section
- [ ] All example commands tested and working
- [ ] System requirements documented and verified

### 🎯 Build Outputs
- [ ] Windows installer created: `src-tauri/target/release/bundle/nsis/nemo_*_x64-setup.exe`
- [ ] Portable executable: `src-tauri/target/release/nemo.exe`
- [ ] Installer size reasonable (~150MB with Ollama)
- [ ] Test installer on clean Windows system
- [ ] Verify all bundled components work in installed version

---

## End User Installation Checklist

### ✅ System Requirements
- [ ] Windows 10/11 (64-bit)
- [ ] At least 4GB RAM (8GB+ recommended)
- [ ] 2GB free disk space + 4-8GB for AI models
- [ ] Internet connection for initial setup

### 📥 Installation Process
- [ ] Download `nemo-setup-windows-x64.exe`
- [ ] Run installer as Administrator
- [ ] Install Python 3.8-3.11 (if not already installed)
- [ ] Verify Python in PATH: `python --version`
- [ ] Launch Nemo from Start Menu/Desktop
- [ ] Complete initial setup wizard
- [ ] Download at least one AI model

### 🔧 Verification Steps
- [ ] Application starts without errors
- [ ] Backend connection successful (no red indicators)
- [ ] Upload test CSV file
- [ ] Ask simple question: "Show me basic statistics"
- [ ] Verify AI response received
- [ ] Test Python code execution
- [ ] Check data editing functionality

### 🤖 AI Model Setup
- [ ] Click "Setup Local AI" button
- [ ] System RAM detected correctly
- [ ] Recommended models shown
- [ ] Successfully download at least one model:
  - [ ] TinyLlama (1GB) - for 4GB+ RAM systems
  - [ ] Phi-3 Mini (2GB) - for 6GB+ RAM systems
  - [ ] BioMistral (4GB) - for 8GB+ RAM systems
- [ ] Model appears in dropdown after download
- [ ] Can query local model successfully

### 🔍 Troubleshooting Verification
- [ ] Python not found → Install Python, restart app
- [ ] Backend connection failed → Check antivirus/firewall
- [ ] AI models not downloading → Check internet connection
- [ ] Large file performance → Test with <100MB datasets
- [ ] Application logs accessible at: `%APPDATA%\Nemo\logs\`

---

## Quality Assurance Testing

### 🖥️ Cross-System Testing
- [ ] Test on Windows 10 (various versions)
- [ ] Test on Windows 11
- [ ] Test with different RAM configurations (4GB, 8GB, 16GB+)
- [ ] Test with and without antivirus software
- [ ] Test corporate/domain-joined systems
- [ ] Test with limited user accounts (non-admin)

### 📊 Dataset Testing
- [ ] Test with small datasets (<1MB)
- [ ] Test with medium datasets (1-50MB)
- [ ] Test with large datasets (50-100MB)
- [ ] Test various file formats (CSV, Excel, JSON)
- [ ] Test with international characters/encoding
- [ ] Test with missing data patterns
- [ ] Test with medical/healthcare datasets

### 🧠 AI Functionality Testing
- [ ] Local AI models work offline
- [ ] Cloud fallback when local models fail
- [ ] Appropriate model recommendations based on RAM
- [ ] Model switching works seamlessly
- [ ] Generated Python code executes correctly
- [ ] Medical data analysis examples work
- [ ] Performance acceptable on target hardware

### 🔒 Security Testing
- [ ] No sensitive data in logs
- [ ] API keys stored securely
- [ ] Application runs in user space
- [ ] No unnecessary network connections
- [ ] Temporary files cleaned up properly
- [ ] User data privacy maintained

---

## Distribution Checklist

### 📦 Package Preparation
- [ ] Create SHA256 hash of installer
- [ ] Test installer on fresh Windows systems
- [ ] Prepare release notes
- [ ] Update version numbers consistently
- [ ] Create user manual/quick start guide

### 🌐 Release Management
- [ ] Tag release in version control
- [ ] Upload installer to distribution platform
- [ ] Update download links in documentation
- [ ] Notify beta testers for validation
- [ ] Monitor initial user feedback

### 📞 Support Preparation
- [ ] FAQ updated with common issues
- [ ] Support team trained on new features
- [ ] Troubleshooting guides tested
- [ ] Log analysis procedures documented
- [ ] Escalation procedures defined

---

## Post-Release Monitoring

### 📈 Success Metrics
- [ ] Installation success rate > 95%
- [ ] Application launch success rate > 98%
- [ ] AI model download success rate > 90%
- [ ] User retention after first week > 80%
- [ ] Average time to first successful analysis < 10 minutes

### 🔧 Issue Tracking
- [ ] Monitor user-reported issues
- [ ] Track common installation problems
- [ ] Monitor performance metrics
- [ ] Track AI model usage patterns
- [ ] Collect user satisfaction feedback

### 🔄 Update Planning
- [ ] Plan patch releases for critical issues
- [ ] Schedule regular model updates
- [ ] Plan feature updates based on feedback
- [ ] Monitor security vulnerabilities
- [ ] Maintain backward compatibility

---

*Use this checklist to ensure consistent, high-quality deployments of Nemo desktop application.*