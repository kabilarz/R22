# Nemo

A modern, AI-powered data analysis platform that allows users to upload datasets and interact with them using natural language queries. Built with Next.js 14, TypeScript, and Google Gemini AI.

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

## 📚 Documentation

Comprehensive documentation is available to help you get the most out of Nemo:

### 📖 User Resources
- **[User Guide](docs/USER_GUIDE.md)** - Complete step-by-step instructions for all features
- **[FAQ](docs/FAQ.md)** - Frequently asked questions and troubleshooting
- **[Quick Help](help)** - Click the help icon (?) in the app for instant access

### 🔧 Developer Resources  
- **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)** - Architecture, data flow, and APIs
- **[Roadmap](docs/ROADMAP.md)** - Future features and local LLM integration plans

### 🚀 Getting Help
- **In-App Help**: Click the help icon (?) in the left panel for quick access to all documentation
- **Interactive Tooltips**: Hover over features for contextual help
- **Quick Start Tips**: Built-in guidance for new users

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