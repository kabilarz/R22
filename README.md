# Nemo - AI-Powered Medical Data Analysis Platform

A comprehensive, AI-powered desktop application designed specifically for medical researchers and healthcare professionals to analyze datasets using natural language queries and advanced statistical methods. Built with privacy-first principles for secure offline data analysis.

## 🚀 **Phase 2A Complete - Enhanced Medical Statistics**

### **New Statistical Capabilities** 
Nemo now includes **20 advanced medical statistical tests** commonly used in clinical research and epidemiology:

#### **Core Statistical Tests** ✅
1. **Descriptive Statistics** - Comprehensive summary statistics with medical interpretations
2. **Independent t-test** - Compare means between two groups (e.g., treatment vs control)  
3. **Paired t-test** - Compare before/after measurements in same patients
4. **One-sample t-test** - Compare sample mean to known population value
5. **Chi-square test** - Test associations between categorical variables
6. **Fisher's exact test** - Small sample categorical analysis
7. **ANOVA (One-way)** - Compare means across multiple treatment groups
8. **Two-way ANOVA** - Analyze effects of two factors simultaneously

#### **Non-Parametric Tests** ✅  
9. **Mann-Whitney U test** - Non-parametric alternative to independent t-test
10. **Wilcoxon signed-rank test** - Non-parametric paired test
11. **Kruskal-Wallis test** - Non-parametric alternative to one-way ANOVA
12. **Friedman test** - Non-parametric repeated measures ANOVA

#### **Regression Analysis** ✅
13. **Linear regression** - Model continuous outcomes
14. **Multiple linear regression** - Multiple predictors with diagnostics
15. **Logistic regression** - Model binary outcomes with odds ratios

#### **Survival Analysis** ✅
16. **Kaplan-Meier survival analysis** - Survival curves with group comparisons
17. **Cox proportional hazards regression** - Model time-to-event with covariates

#### **Diagnostic & Epidemiological Tests** ✅
18. **ROC curve analysis** - Evaluate diagnostic test performance
19. **Sensitivity & Specificity analysis** - Comprehensive diagnostic metrics
20. **Odds ratio & Relative risk analysis** - Case-control and cohort study analysis

#### **Additional Tests** ✅
21. **McNemar's test** - Paired nominal data analysis
22. **Spearman rank correlation** - Non-parametric correlation
23. **Shapiro-Wilk test** - Test for normality
24. **Levene's test** - Test equality of variances

### **Enhanced Medical Visualizations** 🎨
- **Medical Overview Dashboard** - Patient demographics and vital signs summary
- **Vital Signs Charts** - Interactive charts with clinical reference ranges
- **Box Plot Visualizations** - Distribution analysis by medical categories  
- **Demographic Analysis** - Age, gender, race, insurance distributions
- **Outcomes Analysis** - Treatment success rates with color-coded results
- **Survival Curves** - Kaplan-Meier plots with group comparisons
- **ROC Curves** - Diagnostic test evaluation with AUC scores

### **Statistical & Visualization Library Stack** 📚

#### **Core Statistical Libraries**
- **pandas** (2.1.4) - Data manipulation foundation (descriptive stats, frequency analysis)
- **numpy** (1.24.4) - Numerical computing (percentiles, mathematical operations)
- **scipy** (1.11.4) - Core statistical tests (t-tests, ANOVA, non-parametric tests, normality tests)
- **statsmodels** (0.14.1) - Advanced regression analysis, time series, diagnostic tests
- **scikit-learn** (1.3.2) - ML models, ROC analysis, cross-validation, classification metrics
- **pingouin** (0.5.4) - Medical research functions (effect sizes, power analysis, Bayesian tests)
- **lifelines** (0.29.0) - Survival analysis (Kaplan-Meier, Cox regression, log-rank tests)

#### **Specialized Statistical Libraries**
- **scikit-posthocs** (≥0.7.0) - Post-hoc tests (Tukey HSD, Dunn's test, Games-Howell)
- **factor-analyzer** (≥0.4.0) - Factor analysis and dimensionality reduction
- **prince** (≥0.7.1) - Correspondence analysis, PCA, MCA for categorical data
- **umap-learn** (≥0.5.0) - Non-linear dimensionality reduction and clustering
- **imbalanced-learn** (≥0.11.0) - Sampling techniques for unbalanced datasets

#### **Visualization Libraries**
- **matplotlib** (3.8.2) - Foundation plotting (histograms, scatter, line plots, statistical annotations)
- **seaborn** (0.13.0) - Statistical visualization (violin plots, heatmaps, regression plots)
- **plotly** (≥5.18.0) - Interactive charts (3D plots, survival curves, ROC curves with zoom/hover)
- **kaleido** (≥0.2.1) - High-resolution static exports (PNG, SVG, PDF for publications)

#### **Specialized Visualization Libraries** *(Optional)*
- **matplotlib-venn** (≥0.11.0) - Venn diagrams for treatment overlap analysis
- **joypy** (≥0.2.6) - Ridgeline plots for distribution comparison
- **wordcloud** (≥1.9.0) - Text analysis visualization for symptom frequency
- **folium** (≥0.15.0) - Geographic mapping for epidemiological studies
- **networkx** (≥3.0) - Network graphs for patient referral pathways

#### **Frontend Integration**
- **recharts** (2.13.3) - React-based interactive charts for real-time dashboard updates

📖 **[Complete Library Mapping](LIBRARY_MAPPING.md)** - Detailed breakdown of 119 statistical tests and 100 visualizations by library

## 🔥 **Key Features**

### **🧬 Medical Data Intelligence**
- **Automatic Medical Data Detection** - Identifies medical datasets and switches to clinical analysis mode
- **Clinical Reference Ranges** - Vital signs analysis with normal/abnormal flagging
- **Medical Terminology** - Recognizes common medical variables (BP, HR, BMI, lab values)
- **HIPAA-Compatible Privacy** - All data processing can be done completely offline

### **📊 Comprehensive Analysis Suite**
- **119 Statistical Tests** - From basic descriptives to advanced survival analysis ✅
- **100 Visualization Types** - Medical-specific charts with clinical interpretations ✅  
- **Natural Language Queries** - Ask questions in plain English about your data
- **Python Code Generation** - AI generates and executes statistical analysis code
- **Professional Reporting** - Publication-ready results with confidence intervals

📚 **[→ Complete Library & Test Mapping](LIBRARY_MAPPING.md)** - Detailed breakdown of all 119 statistical tests and 100 visualizations by library

### **🔬 Clinical Research Ready**
- **Survival Analysis** - Kaplan-Meier curves, Cox regression, log-rank tests
- **Diagnostic Evaluation** - ROC analysis, sensitivity, specificity, predictive values
- **Epidemiological Studies** - Odds ratios, relative risk, case-control analysis
- **Clinical Trials** - Randomized controlled trial analysis with effect sizes

## 🚀 Features

### Core Functionality
- **Two-Panel Interface**: Clean, intuitive layout with file management on the left and chat interface on the right
- **File Upload Support**: Drag-and-drop or browse to upload CSV, JSON, and Excel files
- **AI-Powered Analysis**: Natural language querying powered by Google Gemini AI
- **Interactive Chat**: Contextual conversations about your data with AI assistance
- **Data Visualizations**: Automatic generation of charts, graphs, and statistical summaries
- **Real-time Processing**: Instant file parsing and preview capabilities

### Data Processing
- **Multi-format Support**: CSV, JSON, XLSX, XLS file formats
- **Automatic Data Parsing**: Smart detection of data types and structure
- **Statistical Analysis**: Automatic generation of summary statistics
- **Data Preview**: Quick overview of dataset structure and sample data
- **SPSS-Style Data Editor**: Professional data and variable view for editing incomplete data and labeling variables

### Visualizations
- **Interactive Charts**: Bar charts, pie charts, line graphs using Recharts
- **Statistical Summaries**: Numeric and categorical data analysis
- **Time Series Analysis**: Automatic detection and visualization of temporal data
- **Data Tables**: Responsive, paginated data viewing

### AI Capabilities
- **Natural Language Queries**: Ask questions about your data in plain English
- **Contextual Responses**: AI understands your dataset structure and content
- **Statistical Insights**: Automatic generation of trends, patterns, and recommendations
- **Smart Analysis**: Handles both numeric and categorical data analysis
- **Markdown Rendering**: Properly formatted AI responses with syntax highlighting
- **Code Execution**: Run Python code directly from AI responses with visual output

### Python Code Sandbox
- **Interactive Python Environment**: Execute Python code with your uploaded data
- **Statistical Templates**: Pre-built templates for frequency analysis, descriptive statistics, and t-tests  
- **Code Syntax Highlighting**: Professional code editor with Python syntax highlighting
- **Real-time Execution**: Run code using your local Python installation
- **Data Integration**: Uploaded data automatically available as pandas DataFrame ('df')
- **Copy & Run**: Copy code from AI responses and execute with one click

## 🚀 Desktop Deployment Features

### 🔧 Bundled Components
- **Ollama AI Runtime**: Local AI models bundled with the application
- **Python Backend**: FastAPI server for data analysis
- **Modern Desktop UI**: Native Windows application with Tauri
- **Offline Capability**: Full functionality without internet connection

### 🤖 AI Model Support
- **TinyLlama** (1GB) - Fast, lightweight for basic analysis
- **Phi-3 Mini** (2GB) - Balanced performance for most tasks  
- **BioMistral 7B** (4GB) - Medical-specialized analysis
- **Cloud Fallback** - Google Gemini when local models unavailable

### 📊 Production Features
- **Privacy First**: All data processing can be done locally
- **Professional Data Editor**: SPSS-style interface for data cleaning
- **Automatic Backup**: Cloud processing available as fallback
- **Enterprise Ready**: MSI installer support for corporate deployment

### 🔐 Security & Privacy
- **Local Processing**: Data never leaves your device with local AI
- **Encrypted Storage**: User preferences and API keys securely stored
- **No Telemetry**: Privacy-focused design with no usage tracking
- **Medical Compliance**: Suitable for HIPAA-compliant data analysis

## 📋 System Requirements

### Minimum Requirements
- Windows 10 (64-bit) or Windows 11
- 4GB RAM (8GB+ recommended for AI models)
- 2GB free disk space (additional 4-8GB for AI models)
- Python 3.8-3.11 (bundled in installer or separate installation)

### Recommended Configuration
- Windows 11 with 16GB RAM
- SSD storage for optimal performance
- Internet connection for initial AI model downloads
- Dedicated graphics card (optional, for enhanced visualization)

---

## 🚀 Getting Started

### 🖥️ Production Installation (Windows Desktop App)

**For end users who want to install and use Nemo:**

1. **Download the Desktop App**
   - Download `nemo-setup-windows-x64.exe` from releases
   - Run installer as Administrator
   - Follow installation wizard

2. **Install Python** (Required for data analysis)
   ```bash
   # Download Python 3.8-3.11 from https://python.org
   # Verify installation:
   python --version
   pip --version
   ```

3. **Launch and Setup**
   - Open Nemo from Start Menu or Desktop
   - Click "Setup Local AI" to download AI models
   - Upload your first dataset and start analyzing!

📖 **[Complete Installation Guide](DEPLOYMENT_GUIDE.md)** | 📋 **[project-compass.json](project-compass.json)** - Detailed setup instructions

### 🛠️ Development Setup

**For developers who want to build from source:**

#### Prerequisites
- Node.js 18+ installed
- Python 3.8-3.11 installed (Python 3.12 not yet supported)
- Rust toolchain (latest stable)
- Google Gemini AI API key (optional but recommended for full functionality)

#### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nemo
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   npm install -g @tauri-apps/cli
   ```

3. **Install Python backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Download Ollama binaries** (for desktop app bundling)
   ```bash
   mkdir -p src-tauri/resources/ollama
   curl -L https://ollama.ai/download/ollama-windows-amd64.exe -o src-tauri/resources/ollama/ollama.exe
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Optional: Add your Google Gemini AI API key for cloud fallback
   # NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```
   
   To get a Gemini API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

6. **Run the development server**
   ```bash
   # For web development:
   npm run dev
   
   # For desktop app development:
   npm run tauri dev
   ```

7. **Open the application**
   - Web: Navigate to [http://localhost:3000](http://localhost:3000)
   - Desktop: The Tauri app window will open automatically

#### Building for Production

**Web Application:**
```bash
npm run build
npm start
```

**Desktop Application:**
```bash
# Build desktop installer
npm run tauri build

# Outputs:
# - Installer: src-tauri/target/release/bundle/nsis/nemo_1.0.0_x64-setup.exe
# - Portable: src-tauri/target/release/nemo.exe
```

## 📖 How to Use

### 1. Upload Your Data
- **Drag and Drop**: Simply drag your CSV, JSON, or Excel file into the upload area
- **Browse Files**: Click "Browse Files" to select files from your computer
- **Supported Formats**: CSV, JSON, XLSX, XLS

### 2. Explore Your Data
- **Files Tab**: View all uploaded files with metadata (rows, size, upload time)
- **SPSS Data View**: Click the table icon on any file to open full-page professional data editor with:
  - **Data View**: Edit cells directly, add/delete rows and variables with full horizontal and vertical scrolling
  - **Variable View**: Configure data types, labels, missing values, and measurement scales with scrollable interface  
  - **Find & Replace**: Ctrl+F to search data, Ctrl+H for find and replace with case sensitivity options
  - **Keyboard Shortcuts**: Navigate between search matches and perform bulk replacements
  - **Full-Width Layout**: Complete page takeover for distraction-free data editing and viewing
  - **Export**: Save edited data as CSV files
- **Charts Tab**: Automatic visualizations including:
  - Statistical summaries
  - Data preview tables
  - Bar charts for numeric data
  - Pie charts for categorical data
  - Time series analysis (if date columns detected)

### 3. Chat with Your Data
- **Select a File**: Click on any uploaded file to activate the chat interface
- **Ask Questions**: Use natural language to query your data:
  - "What are the main trends in this data?"
  - "Can you summarize the key statistics?"
  - "Show me a breakdown by category"
  - "What insights can you find in the sales data?"
- **Get AI Insights**: Receive detailed analysis, patterns, and recommendations

### 4. Python Code Sandbox
- **Access Python Tab**: Click the "Python" tab in the left panel
- **Load Templates**: Choose from pre-built statistical analysis templates:
  - **Frequency Analysis**: Analyze categorical data distributions
  - **Descriptive Statistics**: Generate comprehensive statistical summaries  
  - **T-Test Analysis**: Perform statistical hypothesis testing
- **Write Custom Code**: Use the code editor to write your own Python analysis
- **Execute Code**: Click "Run Code" to execute using your local Python installation
- **View Results**: See output, charts, and any errors in the results panel

### Example Queries
- "What's the average value in the price column?"
- "How many unique categories are there?"
- "What are the top 5 performers in this dataset?"
- "Can you identify any outliers or anomalies?"
- "What trends do you see over time?"
- "Can you provide Python code for frequency analysis?"
- "Generate descriptive statistics code for this data"

## 🎨 UI Components

The application uses a modern, responsive design with:
- **Dark/Light Mode**: Automatic theme detection
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Interactive Elements**: Smooth animations and transitions
- **Accessible Design**: WCAG compliant interface
- **Toast Notifications**: Real-time feedback for user actions

## 🔧 Configuration

### Environment Variables
Check the current environment configuration at `/env-check` route.

Required for AI functionality:
- `GEMINI_API_KEY`: Google Gemini AI API key

### File Size Limits
- Maximum file size: Browser-dependent (typically 2GB for modern browsers)
- Recommended: Files under 100MB for optimal performance

## 🤝 Contributing

This project is built with modern best practices:
- **TypeScript**: Full type safety
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit checks

## 📄 License

This project is licensed under the MIT License.

## 📚 Complete Documentation Suite

Comprehensive documentation is available to help you get the most out of Nemo:

### 🎯 Production Deployment
- **[project-compass.json](project-compass.json)** - Complete installation and configuration guide in JSON format
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Step-by-step production deployment instructions
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Advanced setup and customization guide
- **[INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)** - Quality assurance and testing checklist

### 📖 User Resources
- **[User Guide](docs/USER_GUIDE.md)** - Complete step-by-step instructions for all features
- **[FAQ](docs/FAQ.md)** - Frequently asked questions and troubleshooting
- **[Quick Help](help)** - Click the help icon (?) in the app for instant access

### 🔧 Developer Resources  
- **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)** - Architecture, data flow, and APIs
- **[Ollama Setup Guide](OLLAMA_SETUP.md)** - Local AI integration instructions
- **[Roadmap](docs/ROADMAP.md)** - Future features and local LLM integration plans

### 🚀 Getting Started Scripts
- **[Development Setup](scripts/setup-development.bat)** - Automated development environment setup
- **[Production Build](scripts/build-production.bat)** - Automated production build process
- **[Ollama Setup](scripts/setup-ollama.bat)** - Download and configure Ollama binaries
- **[Installation Verification](scripts/verify-installation.py)** - System verification and testing

### 🛠️ Configuration Files
- **[Environment Template](.env.example)** - Environment variable configuration template
- **[Tauri Configuration](src-tauri/tauri.conf.json)** - Desktop application configuration
- **[Python Dependencies](backend/requirements.txt)** - Backend dependencies list

## 🚀 Quick Start Guide

### For End Users (Production Installation)
1. **Download** the installer: `nemo-setup-windows-x64.exe`
2. **Install Python** 3.8-3.11 from [python.org](https://python.org)
3. **Run installer** as Administrator
4. **Launch Nemo** and follow the setup wizard
5. **Download AI models** via the "Setup Local AI" button

📖 **[Complete Installation Guide](project-compass.json)**

### For Developers  
1. **Run setup script**: `scripts\setup-development.bat`
2. **Configure API key**: Edit `.env` file (optional)
3. **Start development**: `npm run tauri:dev`

📖 **[Development Setup Guide](PRODUCTION_SETUP.md)**

## 🎯 Desktop Application Features

### 🏗️ Production Ready
- **Windows Installer**: Professional NSIS installer with shortcuts
- **Bundled Dependencies**: Ollama AI runtime and Python backend included
- **Offline Capability**: Complete functionality without internet connection
- **Auto-Updates**: Built-in update system for seamless upgrades
- **Enterprise Support**: MSI packages and silent installation options

### 🤖 AI Integration
- **Local AI Models**: TinyLlama, Phi-3, BioMistral bundled and ready
- **Hardware Optimization**: Smart model recommendations based on system RAM
- **Cloud Fallback**: Google Gemini integration for enhanced capabilities
- **Privacy First**: All data processing can be done completely offline

### 📊 Professional Data Analysis
- **SPSS-Style Editor**: Professional data editing and variable management
- **Multiple Formats**: CSV, Excel, JSON file support with drag-and-drop
- **Python Integration**: Execute generated code directly in the interface
- **Advanced Visualizations**: Interactive charts and statistical summaries

### 🔐 Security & Privacy
- **Local Processing**: Medical data never leaves your device
- **Encrypted Storage**: Secure configuration and credential management
- **No Telemetry**: Privacy-focused design with no usage tracking
- **HIPAA Compatible**: Suitable for medical and healthcare data analysis

## 🎉 What's New in Production Version

### ✅ Desktop Application
- Native Windows application built with Tauri
- Professional installer with proper file associations
- System tray integration and desktop shortcuts
- Optimized performance for desktop usage

### ✅ Bundled AI Runtime
- Complete Ollama installation included in installer
- No separate AI software installation required
- Automatic model management and updates
- Hardware-based performance optimization

### ✅ Enhanced Documentation
- Comprehensive installation guides for all user types
- Step-by-step troubleshooting procedures
- Quality assurance checklists for deployment
- Professional support documentation

### ✅ Production Scripts
- Automated development environment setup
- One-click production build process
- System verification and testing tools
- Deployment quality assurance scripts

## 🆘 Support

If you encounter any issues:
1. **Check Documentation**: Start with the [FAQ](docs/FAQ.md) and [User Guide](docs/USER_GUIDE.md)
2. **Use In-App Help**: Click the help icon (?) for instant access to guides
3. **Configuration Issues**: Check the `/env-check` route for environment problems
4. **API Problems**: Ensure your Gemini API key is correctly configured
5. **Performance Issues**: Try with a smaller dataset first
6. **Browser Console**: Check for error messages (F12 key)

## 🔮 Future Enhancements

Nemo has an exciting roadmap ahead! Key upcoming features include:

### Near-Term (v1.1-1.3)
- **Enhanced Help System**: Interactive tutorials and contextual guidance
- **Advanced Search & Filtering**: Global search and complex filters
- **Collaboration Features**: Session sharing and real-time collaboration
- **Professional Analytics**: Advanced statistical testing and business intelligence

### Medium-Term (v2.0-2.5)
- **Database Integration**: Persistent storage with PostgreSQL/Supabase
- **User Authentication**: Multi-user workspaces and role-based access
- **Local LLM Integration**: Privacy-focused offline AI analysis with Ollama
- **Enterprise Features**: SSO, RBAC, and advanced security

### Long-Term Vision (v3.0+)
- **AI-Native Platform**: Autonomous analysis and intelligent insights
- **Advanced Privacy**: Homomorphic encryption and federated learning
- **Immersive Analytics**: AR/VR data visualization and exploration
- **Global Ecosystem**: Marketplace, integrations, and community platform

📋 **[View Complete Roadmap](docs/ROADMAP.md)** - Detailed timeline, local LLM plans, and technical architecture evolution

---

Built with ❤️ using Next.js, TypeScript, and Google Gemini AI