@echo off
REM Development setup script for Nemo
REM Sets up the complete development environment

echo.
echo ======================================
echo    Nemo - Development Setup Script
echo ======================================
echo.

echo This script will set up your development environment for Nemo.
echo.
echo Requirements that must be pre-installed:
echo - Node.js 18+ from https://nodejs.org
echo - Python 3.8-3.11 from https://python.org  
echo - Rust from https://rustup.rs
echo - Git from https://git-scm.com
echo.
pause

REM Verify prerequisites
echo Step 1: Verifying prerequisites...
echo.

node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found

python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python not found. Please install Python 3.8-3.11 from https://python.org
    pause
    exit /b 1
)
echo ✓ Python found

rustc --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Rust not found. Please install Rust from https://rustup.rs
    pause
    exit /b 1
)
echo ✓ Rust found

git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Git not found. Please install Git from https://git-scm.com
    pause
    exit /b 1
)
echo ✓ Git found

echo.
echo Step 2: Installing Node.js dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo ✓ Node.js dependencies installed

echo.
echo Step 3: Installing Tauri CLI...
call npm install -g @tauri-apps/cli
if %ERRORLEVEL% neq 0 (
    echo WARNING: Failed to install Tauri CLI globally, trying locally...
    call npm install @tauri-apps/cli
)
echo ✓ Tauri CLI installed

echo.
echo Step 4: Setting up Python backend...
cd backend
call pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install Python backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Python backend dependencies installed

echo.
echo Step 5: Setting up environment configuration...
if not exist .env (
    copy .env.example .env
    echo ✓ Created .env file from template
    echo.
    echo IMPORTANT: Edit .env file to add your Google Gemini API key:
    echo NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
    echo.
    echo Get your API key from: https://makersuite.google.com/app/apikey
    echo.
) else (
    echo ✓ .env file already exists
)

echo.
echo Step 6: Setting up Ollama for local AI...
call scripts\setup-ollama.bat
if %ERRORLEVEL% neq 0 (
    echo WARNING: Ollama setup failed, but you can continue with cloud AI
)

echo.
echo Step 7: Running verification script...
python scripts\verify-installation.py
if %ERRORLEVEL% neq 0 (
    echo WARNING: Some verification checks failed
    echo Please review the output above and fix any issues
    echo.
)

echo.
echo ======================================
echo       DEVELOPMENT SETUP COMPLETE!
echo ======================================
echo.
echo Your Nemo development environment is ready!
echo.
echo Next steps:
echo 1. Edit .env file to add your Gemini API key (optional but recommended)
echo 2. Start development server: npm run tauri:dev
echo 3. Or start web development: npm run dev
echo.
echo Useful commands:
echo - npm run tauri:dev     - Start desktop app in development mode
echo - npm run dev           - Start web version for development  
echo - npm run build         - Build web version
echo - npm run tauri:build   - Build desktop application
echo - npm run verify        - Run system verification
echo.
echo Documentation:
echo - project-compass.json  - Complete installation guide
echo - DEPLOYMENT_GUIDE.md   - Production deployment guide
echo - PRODUCTION_SETUP.md   - Advanced setup instructions
echo - README.md             - Project overview and usage
echo.
echo Happy coding! 🚀
echo.
pause