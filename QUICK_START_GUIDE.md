# 🚀 Nemo AI Statistical Analysis - Quick Start Guide

## 📋 Prerequisites

### Required Software
- **Node.js**: v18.0+ (LTS recommended)
- **Python**: v3.8-3.11 (v3.12 not yet supported)
- **Yarn**: Latest version (required, NOT npm)
- **Git**: Latest version

### System Requirements
- **RAM**: 4GB minimum (8GB+ recommended for local AI models)
- **Disk Space**: 10GB free (additional 1-4GB for AI models)
- **OS**: Windows 10+, macOS 10.15+, or Linux

---

## 🛠️ Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nemo-ai-analysis
```

### 2. Install Frontend Dependencies
```bash
# Install yarn if not already installed
npm install -g yarn

# Install frontend dependencies (from root directory)
yarn install
```

### 3. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Environment Setup
```bash
# Copy environment template (if exists)
cp .env.example .env

# Optional: Add your Google Gemini API key for cloud AI fallback
# Edit .env file and add:
# NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

---

## 🏃‍♂️ Running the Application

### Method 1: Development Mode (Web Application)

#### Start Backend Server
```bash
cd backend
python app.py
# Backend will run on http://localhost:8001
```

#### Start Frontend (in a new terminal)
```bash
# From root directory
yarn dev
# Frontend will run on http://localhost:3000
```

### Method 2: Production Mode (Supervisor - Current Setup)
```bash
# Check service status
sudo supervisorctl status

# Start all services
sudo supervisorctl start all

# Restart specific service if needed
sudo supervisorctl restart frontend
sudo supervisorctl restart backend

# View logs
sudo supervisorctl tail frontend
sudo supervisorctl tail backend
```

### Method 3: Desktop Application (Tauri)
```bash
# Install Tauri CLI (first time only)
npm install -g @tauri-apps/cli

# Build and run desktop app
yarn tauri dev
```

---

## 🧪 Testing the Setup

### 1. Backend Health Check
```bash
curl http://localhost:8001/api/health
# Should return: {"status": "healthy", "message": "Statistical Analysis API is running"}
```

### 2. Frontend Access
- Open browser to `http://localhost:3000`
- You should see the Nemo AI Analysis interface

### 3. File Upload Test
1. Upload a CSV file using the interface
2. Verify data appears in the data panel
3. Try asking the AI a simple question

---

## 🤖 AI Model Setup

### Cloud AI (Immediate - No Installation Required)
1. Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env` file: `NEXT_PUBLIC_GEMINI_API_KEY=your_key`
3. Select "Google Gemini (Cloud)" from the model dropdown

### Local AI (Ollama - Optional for Privacy)

#### Option 1: System Ollama Installation
```bash
# Install Ollama system-wide
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Download recommended models
ollama pull tinyllama
ollama pull phi3:mini
```

#### Option 2: Bundled Ollama (Desktop App Only)
1. Download Ollama binary for your platform
2. Place in `src-tauri/resources/ollama/` directory
3. Use "Setup Local AI" button in the application

---

## 🔧 Troubleshooting

### Common Issues

#### Frontend Won't Start
```bash
# Check if Next.js is installed
yarn list next

# If missing, install dependencies
yarn install

# Try clearing cache
yarn cache clean
rm -rf node_modules/.cache
```

#### Backend Won't Start
```bash
# Check Python version
python --version

# Check if all dependencies are installed
cd backend
pip list

# Install missing packages
pip install -r requirements.txt
```

#### Supervisor Issues
```bash
# Check supervisor configuration
sudo supervisorctl status

# Restart services
sudo supervisorctl restart all

# Check logs
tail -n 50 /var/log/supervisor/frontend.err.log
tail -n 50 /var/log/supervisor/backend.err.log
```

#### Port Conflicts
- Frontend: Default port 3000
- Backend: Default port 8001
- Check if ports are in use: `lsof -i :3000` and `lsof -i :8001`

### Performance Tips
- **RAM < 4GB**: Use cloud AI only (Google Gemini)
- **RAM 4-8GB**: Use TinyLlama for local AI
- **RAM 8GB+**: Use any local AI model (BioMistral recommended for medical data)

---

## 📚 Next Steps

### For Users
1. Upload your first dataset (CSV/Excel/JSON)
2. Try example queries in the chat interface
3. Explore statistical analysis tools
4. Use the SPSS-style data editor for data cleaning

### For Developers
1. Read [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
2. Check [Deployment Guide](DEPLOYMENT_GUIDE.md)
3. Review [Library Mapping](LIBRARY_MAPPING.md) for all 119+ statistical tests

---

## 🆘 Getting Help

1. **Documentation**: Check `/docs` folder for detailed guides
2. **Logs**: Check supervisor logs for error details
3. **Environment Check**: Visit `/env-check` route in your browser
4. **API Health**: Test backend health endpoint
5. **Issues**: Report bugs with full error logs and system info

---

**🎯 Success Criteria**: You should be able to upload a dataset, select an AI model, and get responses to questions about your data.