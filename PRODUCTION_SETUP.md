# Nemo Desktop Application - Production Setup Guide

## 🎯 Overview

This guide covers the complete process of setting up Nemo for production deployment as a Windows desktop application with bundled Ollama AI support and Python backend integration.

## 🛠️ Prerequisites for Building

### Development Environment
- **Windows 10/11** (64-bit) for building Windows targets
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org)
- **Python 3.8-3.11** - [Download from python.org](https://python.org) 
- **Rust toolchain** - [Install from rustup.rs](https://rustup.rs)
- **Git** for version control
- **Visual Studio Build Tools** (for native module compilation)

### Verification Commands
```bash
# Verify all prerequisites
node --version          # Should show v18+ 
python --version        # Should show 3.8-3.11
rustc --version         # Should show stable Rust
git --version           # Should show Git
```

## 🚀 Quick Start Build Process

### 1. Clone and Setup Project
```bash
git clone <your-repository-url>
cd nemo

# Install Node.js dependencies  
npm install

# Install global tools
npm install -g @tauri-apps/cli
```

### 2. Setup Python Backend
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Return to project root
cd ..
```

### 3. Download and Bundle Ollama
```bash
# Run the automated setup script
scripts\setup-ollama.bat

# Or manually:
mkdir -p src-tauri\resources\ollama
curl -L https://ollama.ai/download/ollama-windows-amd64.exe -o src-tauri\resources\ollama\ollama.exe
```

### 4. Configure Environment (Optional)
```bash
# Copy environment template
cp .env.example .env

# Add Google Gemini API key for cloud fallback (optional)
# NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

### 5. Verify Installation
```bash
# Run comprehensive verification
python scripts\verify-installation.py
```

### 6. Build Production Application
```bash
# Automated production build
scripts\build-production.bat

# Or manual step-by-step:
npm run build           # Build Next.js frontend
npm run tauri:build     # Build Tauri desktop app
```

### 7. Locate Built Application
```
📦 Output Files:
├── src-tauri\target\release\bundle\nsis\nemo_1.0.0_x64-setup.exe  (Installer ~150MB)
└── src-tauri\target\release\nemo.exe                              (Portable ~100MB)
```

## 📋 Detailed Build Configuration

### Frontend Configuration (Next.js)
- **Static Export**: Configured for Tauri embedding
- **Asset Optimization**: Images and fonts optimized for desktop
- **Environment Variables**: Properly configured for desktop context

### Backend Configuration (FastAPI + Python)
- **Production Mode**: Optimized for desktop deployment
- **Database**: DuckDB for embedded analytics
- **Security**: Configured for local-only access
- **Dependencies**: All scientific computing packages included

### Tauri Configuration
- **Bundle Size**: Optimized with compression
- **Permissions**: Minimal required permissions for security
- **Auto-Updates**: Configured for future update support
- **Windows Integration**: Proper file associations and shortcuts

### Ollama Integration
- **Binary Bundling**: Complete Ollama runtime included
- **Model Management**: Automatic model download and management
- **Hardware Detection**: Smart model recommendations based on RAM
- **Privacy**: Complete offline operation capability

## 🎨 Customization Options

### Application Branding
```json
// src-tauri/tauri.conf.json
{
  "productName": "Your App Name",
  "bundle": {
    "shortDescription": "Your app description",
    "longDescription": "Detailed description...",
    "copyright": "© 2025 Your Company"
  }
}
```

### Window Configuration
```json
// Adjust default window size and behavior
{
  "app": {
    "windows": [{
      "title": "Your App Title",
      "width": 1400,
      "height": 900,
      "minWidth": 1000,
      "minHeight": 700
    }]
  }
}
```

### AI Model Selection
```javascript
// Customize default models in lib/ollama-client.ts
const DEFAULT_MODELS = [
  { name: "tinyllama", size: "1GB", minRam: "4GB" },
  { name: "phi3:mini", size: "2GB", minRam: "6GB" },
  { name: "your-custom-model", size: "XGB", minRam: "XGB" }
]
```

## 🔧 Advanced Configuration

### Custom Python Environment
If you need to bundle Python with the application:

```bash
# 1. Create portable Python environment
python -m venv portable_python --copies

# 2. Activate and install dependencies
portable_python\Scripts\activate
pip install -r backend\requirements.txt

# 3. Add to Tauri resources
# (Add portable_python/ to tauri.conf.json resources)
```

### Database Optimization
```python
# backend/data_store.py - Optimize for desktop usage
DATABASE_CONFIG = {
    "memory_limit": "2GB",
    "threads": 4,
    "temp_directory": os.path.expanduser("~/.nemo/temp")
}
```

### Performance Tuning
```json
// tauri.conf.json - Windows-specific optimizations
{
  "bundle": {
    "windows": {
      "nsis": {
        "compressionLevel": "high",
        "oneClick": false,
        "perMachine": false
      }
    }
  }
}
```

## 🧪 Testing and Quality Assurance

### Automated Testing
```bash
# Run comprehensive verification
python scripts\verify-installation.py

# Test development mode
npm run tauri:dev

# Test production build
npm run build:production
```

### Manual Testing Checklist
- [ ] Application starts without errors
- [ ] Python backend initializes correctly  
- [ ] File upload and processing works
- [ ] AI models download and respond
- [ ] Data editing interface functions
- [ ] Export and save operations work
- [ ] Application closes cleanly

### Cross-System Testing
- [ ] Test on Windows 10 (various versions)
- [ ] Test on Windows 11
- [ ] Test with 4GB, 8GB, 16GB+ RAM configurations
- [ ] Test with different antivirus software
- [ ] Test installation as non-admin user
- [ ] Test on corporate/domain-joined systems

## 📦 Distribution Strategies

### Direct Distribution
```bash
# Create distribution package
1. Build application: npm run build:production
2. Test installer on clean system
3. Create SHA256 hash for verification
4. Package with documentation
```

### Enterprise Distribution
```bash
# For corporate environments
1. Create MSI package (requires WiX Toolset)
2. Configure for silent installation
3. Add domain-specific configuration
4. Include corporate certificates if needed
```

### Update Management
```json
// Configure automatic updates (optional)
{
  "updater": {
    "active": true,
    "endpoints": ["https://your-update-server.com/updates"],
    "dialog": true,
    "pubkey": "your-public-key"
  }
}
```

## 🔐 Security Considerations

### Code Signing (Recommended)
```bash
# Windows code signing
1. Obtain code signing certificate
2. Configure in tauri.conf.json
3. Sign installer during build process
```

### Privacy and Data Protection
- All processing can be done offline
- No telemetry or usage tracking
- User data stays on local machine
- Optional cloud API usage is transparent

### Security Hardening
```json
// tauri.conf.json security settings
{
  "app": {
    "security": {
      "csp": "default-src 'self'; connect-src https: tauri:",
      "devCsp": "default-src 'self'"
    }
  }
}
```

## 🚨 Troubleshooting

### Common Build Issues
```bash
# Issue: Rust compilation errors
Solution: Update Rust toolchain: rustup update

# Issue: Python module not found
Solution: Ensure virtual environment activated

# Issue: Ollama binary not found
Solution: Re-run scripts\setup-ollama.bat

# Issue: Build timeout
Solution: Increase Node.js heap size: set NODE_OPTIONS=--max-old-space-size=8192
```

### Runtime Issues
```bash
# Issue: Application won't start
Check: Python installation, antivirus settings, user permissions

# Issue: AI models not downloading
Check: Internet connection, firewall settings, disk space

# Issue: Poor performance
Check: Available RAM, close other applications, use smaller datasets
```

## 📊 Performance Optimization

### Build Optimization
```bash
# Reduce bundle size
1. Remove unused dependencies
2. Optimize images and assets
3. Enable compression in Tauri config
4. Use production builds only
```

### Runtime Optimization
```python
# backend/app.py - Memory management
import gc
gc.set_threshold(700, 10, 10)  # Optimize garbage collection

# Use connection pooling for better performance
DATABASE_POOL_SIZE = 10
```

### User Experience Optimization
```javascript
// Preload critical components
// Add loading states for better UX
// Implement progress indicators for long operations
// Cache frequently accessed data
```

## 🎯 Deployment Best Practices

1. **Version Management**: Use semantic versioning
2. **Testing**: Test on multiple Windows versions
3. **Documentation**: Keep user guides updated  
4. **Support**: Provide clear troubleshooting guides
5. **Updates**: Plan for seamless update process
6. **Monitoring**: Consider usage analytics (opt-in)
7. **Backup**: Include data export/import features

## 📞 Support and Maintenance

### User Support Resources
- Built-in help system (`docs/` folder)
- Online documentation portal
- Video tutorials for complex features
- Community forum or support channel

### Maintenance Tasks
- Regular dependency updates
- Security patches
- AI model updates
- Performance optimization
- Bug fixes and feature enhancements

---

*This guide ensures a robust, professional desktop application deployment for Nemo with comprehensive AI capabilities and user-friendly installation process.*