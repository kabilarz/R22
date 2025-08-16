# Nemo - Ollama Integration Implementation Plan

## 🎯 **Integration Overview**

This document outlines the complete implementation plan for integrating Ollama local LLM functionality into the Nemo medical data analysis platform, providing offline AI capabilities with graceful fallback to Google Gemini.

---

## 📋 **Implementation Phases**

### **Phase 1: Foundation & Process Management**
**Status**: 🔄 **Next**

#### **Ollama Binary Setup**
- **Location**: `/src-tauri/resources/ollama/ollama.exe` (Windows)
- **Manual Download**: User downloads Ollama binary and places in designated folder
- **Documentation**: Technical docs updated with binary placement instructions
- **Verification**: System checks if binary exists before attempting local inference

#### **Process Lifecycle Management**
```rust
// Tauri Commands to Implement
#[tauri::command]
async fn start_ollama() -> Result<String, String>

#[tauri::command] 
async fn stop_ollama() -> Result<String, String>

#[tauri::command]
async fn check_ollama_status() -> Result<OllamaStatus, String>

#[tauri::command]
async fn get_hardware_info() -> Result<HardwareInfo, String>
```

#### **Hardware Detection**
- **RAM Detection**: Recommend appropriate models based on available memory
- **CPU Information**: Performance optimization suggestions
- **Model Recommendations**: 
  - <4GB RAM: TinyLlama only
  - 4-8GB RAM: TinyLlama + Phi-3 Mini
  - >8GB RAM: All models including BioMistral

---

### **Phase 2: API Integration & Communication**
**Status**: 📋 **Planned**

#### **Ollama HTTP Client**
```typescript
// Frontend API Client
interface OllamaClient {
  generateResponse(model: string, prompt: string): Promise<string>
  listModels(): Promise<OllamaModel[]}
  downloadModel(modelId: string): Promise<DownloadProgress>
  checkConnection(): Promise<boolean>
}
```

#### **Model Management**
- **Supported Models**:
  1. **TinyLlama-1.1B** (Default) - 1.1GB, fastest inference
  2. **Phi-3 Mini** (Future) - 2.3GB, balanced performance  
  3. **BioMistral-7B** (Future) - 4.1GB, medical-specialized

#### **API Endpoints**
```bash
# Ollama Local API Calls
POST http://localhost:11434/api/generate
POST http://localhost:11434/api/chat
GET  http://localhost:11434/api/tags
POST http://localhost:11434/api/pull
```

---

### **Phase 3: Frontend Integration**
**Status**: 📋 **Planned**

#### **Model Selection UI**
- **Toggle Switch**: Local (Ollama) vs Cloud (Gemini)
- **Model Dropdown**: TinyLlama selection when local mode active
- **Status Indicators**: Connection status, processing indicators
- **Fallback Messages**: Clear user feedback when switching modes

#### **Chat Panel Updates**
```typescript
// Component Updates Required
/components/chat-panel.tsx - Add model selection logic
/components/model-selector.tsx - New component for model management
/components/hardware-checker.tsx - System requirements display
/lib/ollama-client.ts - API client implementation
```

#### **User Experience Flow**
1. **Auto-Detection**: Check if Ollama binary exists on startup
2. **Hardware Check**: Recommend models based on system specs
3. **Model Selection**: User chooses local vs cloud processing
4. **Graceful Fallback**: Auto-switch to Gemini if local fails
5. **Status Feedback**: Clear indicators of processing location

---

### **Phase 4: Error Handling & Fallback Logic**
**Status**: 📋 **Planned**

#### **Fallback Scenarios**
1. **Ollama Binary Missing**: Graceful message, Cloud-only mode
2. **Process Start Failure**: Retry logic, then Cloud fallback
3. **API Connection Timeout**: Switch to Gemini with user notification
4. **Model Download Failure**: Provide manual download instructions
5. **Inference Timeout**: Fallback to Cloud API automatically

#### **Error Messages**
```typescript
const ERROR_MESSAGES = {
  OLLAMA_NOT_FOUND: "Ollama binary not found. Using cloud AI mode.",
  CONNECTION_FAILED: "Local AI unavailable. Switching to cloud processing.",
  MODEL_MISSING: "TinyLlama model not downloaded. Use cloud mode or download model.",
  INFERENCE_TIMEOUT: "Local processing timeout. Retrying with cloud AI.",
  INSUFFICIENT_MEMORY: "Insufficient RAM for local model. Using cloud processing."
}
```

---

## 🏗️ **Technical Architecture**

### **Current Architecture (Gemini Only)**
```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   API Route     │
│   /api/chat     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Google Gemini  │
│     API         │
└─────────────────┘
```

### **Target Architecture (Hybrid)**
```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   Model Toggle  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  AI Router      │
│  Smart Fallback │
└─────────────────┘
    │           │
    ▼           ▼
┌─────────┐ ┌─────────────┐
│ Ollama  │ │   Gemini    │
│ Local   │ │   Cloud     │
│ API     │ │    API      │
└─────────┘ └─────────────┘
    │
    ▼
┌─────────────────┐
│   TinyLlama     │
│   1.1B Model    │
└─────────────────┘
```

---

## 📁 **File Structure Changes**

### **New Files to Create**
```
/src-tauri/src/
├── ollama.rs           # Ollama process management
├── hardware.rs         # System hardware detection
└── models.rs           # Model information and management

/components/
├── model-selector.tsx   # Model selection UI component
├── hardware-checker.tsx # System requirements display
└── ai-status.tsx       # Connection status indicator

/lib/
├── ollama-client.ts    # Ollama API client
├── ai-router.ts        # Intelligent routing logic
└── hardware-utils.ts   # Hardware detection utilities

/docs/
└── OLLAMA_SETUP.md     # Manual installation instructions
```

### **Files to Modify**
```
/components/chat-panel.tsx      # Add model selection logic
/app/api/chat/route.ts          # Add Ollama routing (or remove if using Tauri commands)
/src-tauri/src/lib.rs           # Register new Tauri commands
/src-tauri/Cargo.toml           # Add dependencies (reqwest, sysinfo, tokio)
/package.json                   # Update scripts if needed
```

---

## 🔧 **Implementation Details**

### **Rust Dependencies (Cargo.toml)**
```toml
[dependencies]
tauri = { version = "2.0", features = ["shell-open"] }
reqwest = { version = "0.11", features = ["json"] }
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
sysinfo = "0.30"
uuid = { version = "1.0", features = ["v4"] }
```

### **Frontend Dependencies (package.json)**
```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.7.0",
    "@tauri-apps/plugin-shell": "^2.3.0"
  }
}
```

### **Model Information**
```typescript
interface OllamaModel {
  id: string
  name: string
  size: string
  requirements: {
    minRAM: string
    recommended: string
  }
  description: string
  medicalFocus: boolean
}

const SUPPORTED_MODELS = {
  "tinyllama": {
    id: "tinyllama:1.1b",
    name: "TinyLlama 1.1B",
    size: "1.1GB",
    requirements: { minRAM: "2GB", recommended: "4GB" },
    description: "Fast, lightweight model for basic medical data analysis",
    medicalFocus: false
  }
  // Future models: phi3-mini, biomistral-7b
}
```

---

## 🎯 **Phase 1 Implementation Tasks**

### **1. Ollama Binary Management**
- [ ] Update technical documentation with binary placement instructions
- [ ] Create system check for Ollama binary existence
- [ ] Implement binary verification (file exists, executable permissions)

### **2. Rust Process Management**
```rust
// /src-tauri/src/ollama.rs
use std::process::{Command, Stdio};
use sysinfo::{System, SystemExt};
use tauri::Result;

#[tauri::command]
pub async fn start_ollama() -> Result<String, String> {
    // Check if binary exists
    // Start Ollama server process
    // Return status
}

#[tauri::command] 
pub async fn get_hardware_info() -> Result<HardwareInfo, String> {
    // Detect RAM, CPU
    // Recommend appropriate models
    // Return hardware capabilities
}
```

### **3. Frontend Model Toggle**
```typescript
// /components/model-selector.tsx
export function ModelSelector() {
  const [useLocal, setUseLocal] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState('checking')
  
  // Check Ollama availability on mount
  // Provide toggle between Local/Cloud
  // Show appropriate model options
}
```

### **4. API Integration**
- [ ] Create Ollama HTTP client for local inference
- [ ] Implement intelligent routing (local first, cloud fallback)
- [ ] Add timeout handling and error recovery

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- [ ] Rust process management functions
- [ ] Frontend component rendering with different states
- [ ] API client success/failure scenarios

### **Integration Tests**  
- [ ] Ollama startup and communication flow
- [ ] Fallback logic when local AI fails
- [ ] Model switching and state management

### **Manual Testing Scenarios**
1. **Binary Missing**: Test graceful degradation to cloud mode
2. **Network Issues**: Test local-only functionality  
3. **Memory Constraints**: Test model recommendations
4. **Process Failures**: Test recovery and fallback

---

## 🚀 **Success Criteria**

### **Phase 1 Completion**
- [ ] Ollama binary can be started/stopped via Tauri commands
- [ ] Hardware detection works correctly
- [ ] Frontend shows local/cloud toggle
- [ ] Binary missing scenario handled gracefully

### **Full Integration Success**
- [ ] TinyLlama model provides medical data analysis locally
- [ ] Response time <10 seconds for typical queries
- [ ] Graceful fallback to Gemini when needed
- [ ] User always gets feedback on processing location
- [ ] No crashes when Ollama unavailable

---

## 📝 **User Documentation Updates**

### **Installation Instructions**
1. Download Nemo desktop application
2. **OPTIONAL**: Download Ollama binary for offline AI
3. Place `ollama.exe` in `[app-folder]/resources/ollama/`
4. Restart application to enable local AI mode

### **Model Management**
- Local AI uses TinyLlama (1.1GB model download)
- Cloud AI uses Google Gemini (requires API key)  
- Automatic fallback ensures analysis always works
- Toggle between modes in chat interface

---

## 🔄 **Future Enhancements (Post-Phase 1)**

### **Additional Models**
- **Phi-3 Mini**: Better performance, 2.3GB
- **BioMistral-7B**: Medical-specialized, 4.1GB
- **Custom Fine-tuning**: User-trained models for specific medical domains

### **Advanced Features**
- **Model Performance Analytics**: Response time, accuracy metrics
- **Hybrid Processing**: Use both local and cloud simultaneously
- **Batch Processing**: Analyze multiple datasets locally
- **Model Marketplace**: Download additional medical AI models

---

## ⚠️ **Known Limitations & Risks**

### **Current Limitations**
- Windows-only Ollama integration initially
- TinyLlama less capable than GPT/Gemini models
- Local inference requires significant RAM/CPU
- Model downloads are large (1+ GB)

### **Risk Mitigation**
- Always provide cloud fallback option
- Clear hardware requirement communication  
- Graceful error handling for all failure modes
- Comprehensive user documentation

---

This implementation plan provides a roadmap for complete Ollama integration while maintaining system reliability through intelligent fallbacks. The phased approach ensures each component is thoroughly tested before moving to the next level of complexity.