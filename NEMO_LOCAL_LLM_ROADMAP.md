# Nemo Desktop App - Local LLM Implementation Roadmap

## 🎯 Project Overview

**Goal**: Convert the existing Nemo web application (Next.js + Google Gemini) into a desktop application with local LLM inference for medical data analysis.

**Target**: 20-30MB installer, offline operation, privacy-focused medical research tool.

---

## 📋 Implementation Phases

### ✅ Phase 1: Tauri Setup & Integration (COMPLETED)

**Status**: ✅ **COMPLETED**

**Achievements**:
- ✅ Rust environment setup (v1.89.0)
- ✅ Tauri CLI installation (v2.7.1) 
- ✅ Tauri initialization with proper configuration
- ✅ Next.js static export configuration (`output: 'export'`)
- ✅ File system API integration (replaced browser file input with Tauri dialog)
- ✅ Frontend packages added (`@tauri-apps/api`, plugins)
- ✅ Rust dependencies configured (376 crates)
- ✅ Development server successfully started

**Key Files Modified**:
- `/src-tauri/tauri.conf.json` - Main Tauri configuration
- `/src-tauri/Cargo.toml` - Rust dependencies
- `/src-tauri/src/lib.rs` - Plugin initialization
- `/next.config.js` - Static export configuration
- `/components/data-panel.tsx` - File handling with Tauri APIs
- `/package.json` - Tauri scripts added

**Technical Notes**:
- App identifier: `com.nemo.app`
- Window size: 1200x800 (min: 800x600)
- Permissions: file system, dialog, shell access
- Static export works correctly

---

### 🔄 Phase 2: Local LLM Integration (IN PROGRESS)

**Status**: 🔄 **NEXT**

**Objectives**:
- Replace Google Gemini API with local Ollama integration
- Add model selection UI (TinyLlama, BioMistral, Phi-3 Mini)
- Implement hardware detection and recommendations
- Ensure offline functionality

#### 2.1 Ollama Integration
**Files to Modify**:
- Create `/src-tauri/src/ollama.rs` - Ollama management
- Update `/src-tauri/src/lib.rs` - Add Ollama commands
- Create `/lib/ollama-client.ts` - Frontend Ollama client

**Implementation Steps**:
```rust
// Add to Cargo.toml
[dependencies]
reqwest = { version = "0.11", features = ["json"] }
tokio = { version = "1.0", features = ["full"] }
sysinfo = "0.30"

// Tauri commands to add
#[tauri::command]
async fn start_ollama() -> Result<String, String>

#[tauri::command] 
async fn download_model(model_id: String) -> Result<String, String>

#[tauri::command]
async fn query_ollama(model: String, prompt: String) -> Result<String, String>

#[tauri::command]
async fn get_hardware_info() -> Result<HardwareInfo, String>
```

#### 2.2 Model Management UI
**Files to Create/Modify**:
- `/components/model-selector.tsx` - Model selection interface
- `/components/hardware-checker.tsx` - Hardware detection component
- `/components/model-download.tsx` - Download progress UI

**Models to Support**:
- **TinyLlama 1.1B** (1GB) - Default for <8GB RAM
- **BioMistral 7B** (4GB) - Medical-focused model  
- **Phi-3 Mini** (2GB) - Balanced performance

#### 2.3 Replace Gemini API Calls
**Files to Modify**:
- Remove `/app/api/chat/route.ts` (no longer needed)
- Update `/components/chat-panel.tsx` - Replace Gemini calls
- Update `/lib/api.ts` - Add local LLM methods

---

### 🔧 Phase 3: Enhanced Statistical Analysis (FUTURE)

**Status**: 📋 **PLANNED**

**Objectives**:
- Enhance existing statistical analysis capabilities
- Add more statistical templates
- Improve Python code generation
- Add data visualization export

#### 3.1 Statistical Templates
- ANOVA analysis
- Regression analysis  
- Survival analysis (Kaplan-Meier)
- ROC curve analysis

#### 3.2 Enhanced Code Generation
- Better prompt engineering for statistical code
- Code validation and error handling
- Interactive parameter selection

---

### 🎨 Phase 4: Desktop Optimization (FUTURE)

**Status**: 📋 **PLANNED**

**Objectives**:
- Optimize bundle size (target: 20-30MB)
- Add desktop-specific features
- Implement proper installer
- Add auto-update mechanism

#### 4.1 Bundle Optimization
- Remove unused dependencies
- Optimize Tauri bundle configuration
- Compress resources

#### 4.2 Desktop Features  
- System tray integration
- Keyboard shortcuts
- Native notifications
- File associations

---

## 🏗️ Architecture Overview

### Current Stack
```
┌─────────────────┐
│   Frontend      │
│   Next.js 14   │ → Static Export
│   TypeScript    │
│   Tailwind CSS │
└─────────────────┘
         ↕️
┌─────────────────┐
│     Tauri       │
│   Rust Layer    │ → Desktop APIs
│   File System  │
└─────────────────┘
         ↕️
┌─────────────────┐
│    Backend      │
│   FastAPI       │ → Statistical Analysis
│   Python        │
│   DuckDB        │
└─────────────────┘
```

### Target Architecture (After Local LLM)
```
┌─────────────────┐
│   Frontend      │
│   Next.js 14   │ → Desktop UI
└─────────────────┘
         ↕️
┌─────────────────┐
│     Tauri       │
│   + Ollama      │ → Local LLM
│   + Hardware    │ → System Info
└─────────────────┘
         ↕️
┌─────────────────┐
│    Backend      │
│   FastAPI       │ → Stats + LLM
│   Python        │
└─────────────────┘
```

---

## 💻 Development Environment

### Prerequisites
```bash
# Required versions
Node.js: v20.19.4+
Rust: v1.89.0+
Python: 3.10+

# System dependencies (Linux)
sudo apt install pkg-config libgtk-3-dev libwebkit2gtk-4.0-dev \
  libappindicator3-dev librsvg2-dev libx11-dev libxrandr-dev \
  libxss-dev libasound2-dev

# Install Tauri CLI
npm install -g @tauri-apps/cli
```

### Development Commands
```bash
# Start development (both Next.js + Tauri)
yarn tauri dev

# Build Next.js only
yarn build

# Build Tauri app
yarn tauri build

# Backend server (separate terminal)
cd backend && python app.py
```

---

## 🔧 Key Configuration Files

### `/src-tauri/tauri.conf.json`
```json
{
  "productName": "Nemo",
  "version": "0.1.0", 
  "identifier": "com.nemo.app",
  "build": {
    "frontendDist": "out",
    "beforeBuildCommand": "npm run build"
  },
  "bundle": {
    "category": "Productivity",
    "shortDescription": "AI-powered medical data analysis"
  }
}
```

### `/next.config.js`
```javascript
module.exports = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: { unoptimized: true }
}
```

---

## 🚨 Known Issues & Solutions

### Issue 1: TypeScript Build Errors
**Problem**: Regex unicode flags not supported
**Solution**: Update `tsconfig.json` target to `"es2020"`

### Issue 2: API Routes in Static Export
**Problem**: Next.js API routes can't be exported statically
**Solution**: Remove API routes, use Tauri commands instead

### Issue 3: System Dependencies Missing
**Problem**: GTK/WebKit libraries missing for Tauri
**Solution**: Install system packages (see Prerequisites)

### Issue 4: File Upload in Desktop Mode
**Problem**: Browser file input doesn't work in Tauri
**Solution**: Use Tauri's dialog API (`@tauri-apps/plugin-dialog`)

---

## 📝 Implementation Notes

### LLM Integration Strategy
1. **Bundled vs Download**: Download models on first run (smaller installer)
2. **Model Storage**: `~/.nemo/models/` directory
3. **Ollama Management**: Embed Ollama binary or use system installation
4. **Hardware Detection**: Use `sysinfo` crate for RAM/CPU detection

### Performance Requirements
- **RAM Usage**: <4GB for TinyLlama, <8GB for BioMistral
- **Query Speed**: <5 seconds on 4GB RAM systems
- **Installer Size**: 20-30MB (excluding models)
- **Model Download**: 1-4GB one-time download

### Privacy & Security
- **Fully Offline**: No data leaves device after setup
- **PHI Handling**: Basic regex masking for demo
- **Data Storage**: Local DuckDB, no cloud sync
- **Code Execution**: Restricted Python environment

---

## 🎯 Success Criteria

### Phase 2 Completion
- [ ] Ollama successfully integrated and managed by Tauri
- [ ] Model selection UI with download progress
- [ ] Hardware detection working correctly
- [ ] Local LLM queries replace all Gemini API calls
- [ ] Statistical analysis works with local LLM generated code
- [ ] All existing features preserved (SPSS editor, visualizations)

### Final Product
- [ ] 20-30MB installer for Windows/Mac/Linux
- [ ] One-time model download (1-4GB)
- [ ] <5 second query responses on 4GB RAM
- [ ] 80%+ accuracy compared to cloud LLM
- [ ] Professional medical research tool UI
- [ ] Complete offline operation

---

## 🤝 Development Guidelines

### Code Organization
```
/src-tauri/
  ├── src/
  │   ├── main.rs          # Entry point
  │   ├── lib.rs           # Plugin setup
  │   ├── ollama.rs        # LLM management
  │   └── hardware.rs      # System detection
  ├── Cargo.toml          # Rust dependencies
  └── tauri.conf.json     # App config

/components/
  ├── model-selector.tsx   # Model management
  ├── hardware-checker.tsx # System info
  └── chat-panel.tsx      # Updated for local LLM

/lib/
  ├── ollama-client.ts    # Frontend LLM client
  └── api.ts             # Updated API client
```

### Testing Strategy
- **Unit Tests**: Tauri commands
- **Integration Tests**: LLM query accuracy
- **Performance Tests**: Query speed benchmarks
- **Manual Testing**: Medical data analysis workflows

---

## 📚 Resources

### Documentation
- [Tauri Documentation](https://tauri.app/)
- [Ollama API Reference](https://ollama.ai/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

### Model Information
- [TinyLlama Models](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0)
- [BioMistral 7B](https://huggingface.co/BioMistral/BioMistral-7B)
- [Phi-3 Mini](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct)

### Medical Research Context
- Target users: Medical researchers, especially in Africa
- Use case: Replace SPSS with privacy-focused local analysis
- Data types: CSV/Excel medical datasets
- Analysis needs: Descriptive stats, t-tests, correlations

---

## 🔄 Status Updates

**Last Updated**: Current Session
**Current Phase**: Phase 1 ✅ Complete, Phase 2 🔄 Ready to Start
**Next Action**: Install system dependencies and continue with Ollama integration

---

*This roadmap should be updated as development progresses. Each phase completion should include lessons learned and any architectural changes.*