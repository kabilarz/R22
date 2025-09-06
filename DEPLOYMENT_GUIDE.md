# Nemo Desktop Application - Production Deployment Guide

**The First HIPAA-Compliant AI Medical Analysis Platform**

## 🎯 **Strategic Overview**

**Target Market**: Medical researchers at academic institutions and pharmaceutical companies
**Value Proposition**: First desktop AI platform combining statistical analysis with HIPAA compliance
**Competitive Advantage**: No cloud dependencies, integrated AI + medical statistics, natural language interface

---

## 🚀 **Simplified Deployment Process**

### **NEW: Single-Command Deployment**

We've streamlined deployment from 25+ scripts to **ONE master deployment script**:

```bash
# Run the master deployment script
deploy-nemo.bat
```

**What this accomplishes:**
1. ✅ **Prerequisites Check**: Verifies Node.js and Python 3.8-3.11 installation
2. ✅ **Dependency Installation**: Installs all Node.js and Python dependencies
3. ✅ **Frontend Build**: Builds the React/Next.js application
4. ✅ **Desktop Build**: Creates the Tauri desktop application
5. ✅ **Output Generation**: Creates both installer and portable executable

**Build Outputs:**
- **Desktop Installer**: `src-tauri/target/release/bundle/nsis/nemo_1.0.0_x64-setup.exe`
- **Portable Executable**: `src-tauri/target/release/nemo.exe`

---

## 📋 System Requirements

### Minimum System Requirements
- **Operating System**: Windows 10 (64-bit) or Windows 11
- **RAM**: 4GB minimum (8GB+ recommended for AI models)
- **Storage**: 2GB free space (additional 4-8GB for AI models)
- **Network**: Internet connection for initial setup and model downloads

### Software Prerequisites
- **Python**: Version 3.8 to 3.11 (Python 3.12 not yet supported)
- **Node.js**: Version 18.x or later (for development builds only)

## 📦 Production Installation (End Users)

### Step 1: Download the Application

1. Download `nemo-setup-windows-x64.exe` from the official releases
2. Verify the SHA256 hash to ensure file integrity
3. The installer includes:
   - Nemo desktop application
   - Ollama AI runtime (bundled)
   - Required system libraries

### Step 2: Install Python Dependencies

**Option A: Fresh Python Installation**
```cmd
# Download Python 3.11 from https://python.org
# During installation, check "Add Python to PATH"
# Verify installation:
python --version
pip --version
```

**Option B: Existing Python Installation**
```cmd
# Verify Python version (must be 3.8-3.11)
python --version

# Upgrade pip
pip install --upgrade pip
```

### Step 3: Run the Installer

1. **Run as Administrator**: Right-click `nemo-setup-windows-x64.exe` → "Run as administrator"
2. **Follow Installation Wizard**:
   - Accept license agreement
   - Choose installation directory (default: `C:\Program Files\Nemo`)
   - Select desktop and Start Menu shortcuts
   - Complete installation

### Step 4: First Launch Setup

1. **Launch Nemo** from Desktop shortcut or Start Menu
2. **Backend Initialization**: The application will automatically:
   - Start the Python backend server
   - Initialize the database
   - Check system compatibility

3. **AI Model Setup** (Optional but Recommended):
   - Click "Setup Local AI" button
   - Select models based on your system RAM:
     - **4GB RAM**: TinyLlama (1GB download)
     - **6GB+ RAM**: Phi-3 Mini (2GB download)
     - **8GB+ RAM**: BioMistral Medical (4GB download)
   - Models download automatically with progress tracking

### Step 5: Verify Installation

Test all components:
```
1. Upload a sample CSV file (drag-and-drop or browse)
2. Select the uploaded file
3. Ask a question: "What are the main statistics in this data?"
4. Verify you get an AI response
5. Test Python code execution from AI responses
```

## 🔧 Development Build Process

For developers building from source:

### Prerequisites
```bash
# Required tools
- Git
- Node.js 18+ with npm
- Python 3.8-3.11 with pip
- Rust toolchain (latest stable)
- Tauri CLI
```

### Build Steps

1. **Clone and Setup**:
```bash
git clone <repository-url>
cd nemo
npm install
npm install -g @tauri-apps/cli
```

2. **Install Python Backend**:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

3. **Download Ollama Binaries**:
```bash
# Create resources directory
mkdir -p src-tauri/resources/ollama

# Download Ollama for Windows
curl -L https://ollama.ai/download/ollama-windows-amd64.exe -o src-tauri/resources/ollama/ollama.exe
```

4. **Configure Environment**:
```bash
# Copy environment template
cp .env.example .env

# Optional: Add Google Gemini API key for cloud fallback
# NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

5. **Build for Production**:
```bash
# Build the desktop application
npm run tauri build
```

6. **Locate Built Files**:
```
# Installer (recommended for distribution):
src-tauri/target/release/bundle/nsis/nemo_1.0.0_x64-setup.exe

# Portable executable:
src-tauri/target/release/nemo.exe
```

## 📁 Application Structure

### Installation Directory
```
C:\Program Files\Nemo\
├── nemo.exe                    # Main application executable
├── resources\                  # Bundled resources
│   └── ollama\                # Ollama AI runtime
│       └── ollama.exe         # Local AI server
├── backend\                   # Python backend (if bundled)
│   ├── app.py                 # FastAPI server
│   ├── requirements.txt       # Python dependencies
│   └── ...
└── _up_\                      # Frontend assets
    ├── index.html
    └── static\
```

### User Data Directory
```
%APPDATA%\Nemo\
├── config\                    # Application configuration
├── models\                    # Downloaded AI models
│   ├── tinyllama\
│   ├── phi3-mini\
│   └── biomistral-7b\
├── data\                      # User datasets (temporary)
└── logs\                      # Application logs
```

## 🤖 AI Model Configuration

### Automatic Model Recommendations

The application automatically recommends models based on system RAM:

| System RAM | Recommended Model | Download Size | Description |
|------------|------------------|---------------|-------------|
| 4GB        | TinyLlama       | 1GB          | Fast, lightweight analysis |
| 6GB+       | Phi-3 Mini      | 2GB          | Balanced performance |
| 8GB+       | BioMistral 7B   | 4GB          | Medical-specialized |

### Manual Model Management

```bash
# List available models (via application UI)
# Download specific model (via application UI)
# Remove unused models (via application UI)
```

### Cloud Fallback Configuration

Add Google Gemini API key for cloud processing:

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to application settings or `.env` file:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

## 🔍 Troubleshooting

### Common Issues

**1. "Python not found" Error**
```bash
# Solution:
1. Install Python 3.8-3.11 from python.org
2. Ensure "Add Python to PATH" is checked during installation
3. Restart Nemo application
4. Verify: python --version
```

**2. AI Models Not Loading**
```bash
# Solutions:
1. Check available RAM vs model requirements
2. Ensure internet connection for downloads
3. Try smaller model first (TinyLlama)
4. Restart application
5. Use cloud fallback if configured
```

**3. Backend Connection Error**
```bash
# Solutions:
1. Verify Python installation: python --version
2. Check if antivirus is blocking the application
3. Ensure port 8001 is not blocked by firewall
4. Restart application as Administrator
```

**4. Large Dataset Performance Issues**
```bash
# Solutions:
1. Use datasets under 100MB for optimal performance
2. Close other applications to free RAM
3. Use data sampling for initial exploration
4. Consider cloud processing for large analyses
```

### Log Locations

- **Application Logs**: `%APPDATA%\Nemo\logs\`
- **Python Backend**: Check application console
- **Developer Console**: Press `Ctrl+Shift+I` in application

## 🔐 Security and Privacy

### Local Processing
- All data analysis can be performed completely offline
- No data sent to external servers when using local AI models
- User datasets stored temporarily and can be cleared

### Cloud Processing
- When using Google Gemini API, data is sent to Google AI
- API key stored locally in encrypted configuration
- Can be disabled by not configuring cloud API key

## 📊 Performance Optimization

### System Optimization
```bash
# Recommended settings for best performance:
1. Close unnecessary applications
2. Ensure sufficient RAM for selected AI model
3. Use SSD storage for better I/O performance
4. Regular system maintenance (disk cleanup, etc.)
```

### Dataset Optimization
```bash
# Best practices:
1. Use CSV format for fastest loading
2. Keep datasets under 100MB for optimal performance
3. Clean data before upload (remove empty rows/columns)
4. Use appropriate data types
```

## 🚀 Distribution and Updates

### Creating Distribution Package

1. **Build Application**: `npm run tauri build`
2. **Test Installer**: Verify on clean Windows system
3. **Create SHA256 Hash**: For integrity verification
4. **Package Documentation**: Include this guide and user manual

### Update Strategy

- **Automatic Updates**: Tauri supports automatic updates (configure updater)
- **Manual Updates**: Download new installer and run
- **Model Updates**: AI models update independently through the application

## 📞 Support

### Documentation Resources
- **User Guide**: `docs/USER_GUIDE.md`
- **Technical Documentation**: `docs/TECHNICAL_DOCUMENTATION.md`
- **FAQ**: `docs/FAQ.md`
- **Development Roadmap**: `docs/ROADMAP.md`

### Getting Help
1. Check the built-in help system (click "?" in application)
2. Review FAQ and troubleshooting sections
3. Check application logs for error details
4. Verify system requirements are met

---

## 📋 Deployment Checklist

Before releasing:

- [ ] Test installer on clean Windows 10/11 systems
- [ ] Verify all AI models download and work correctly
- [ ] Test Python code execution with sample datasets
- [ ] Confirm cloud fallback works (if configured)
- [ ] Validate file associations and shortcuts
- [ ] Test uninstaller and cleanup
- [ ] Verify antivirus compatibility
- [ ] Document known limitations and workarounds
- [ ] Create user training materials
- [ ] Prepare support documentation

---

*Built with ❤️ using Tauri, Next.js, Python FastAPI, and Ollama*