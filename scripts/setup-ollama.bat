@echo off
REM Setup script for Ollama in production deployment
REM This script downloads and configures Ollama for Windows

echo.
echo ===================================
echo    Nemo - Ollama Setup Script
echo ===================================
echo.

set "OLLAMA_DIR=%~dp0..\src-tauri\resources\ollama"
set "OLLAMA_EXE=%OLLAMA_DIR%\ollama.exe"

REM Create ollama directory if it doesn't exist
if not exist "%OLLAMA_DIR%" (
    echo Creating Ollama directory...
    mkdir "%OLLAMA_DIR%"
)

REM Check if Ollama is already downloaded
if exist "%OLLAMA_EXE%" (
    echo Ollama is already downloaded at: %OLLAMA_EXE%
    echo File size: 
    for %%I in ("%OLLAMA_EXE%") do echo %%~zI bytes
    echo.
    goto :check_models
)

REM Download Ollama
echo Downloading Ollama for Windows...
echo This may take a few minutes depending on your internet connection.
echo.

powershell -Command "Invoke-WebRequest -Uri 'https://ollama.ai/download/ollama-windows-amd64.exe' -OutFile '%OLLAMA_EXE%'"

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to download Ollama
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo Ollama downloaded successfully!
echo.

:check_models
echo Checking for AI models...
echo.
echo The following models are recommended:
echo - TinyLlama (1GB) - For systems with 4GB+ RAM
echo - Phi-3 Mini (2GB) - For systems with 6GB+ RAM  
echo - BioMistral 7B (4GB) - For systems with 8GB+ RAM
echo.
echo AI models will be downloaded automatically when you first run Nemo.
echo You can also download them manually using the application interface.
echo.

echo Setup complete!
echo.
echo Next steps:
echo 1. Build the desktop application: npm run tauri build
echo 2. The installer will be created in: src-tauri\target\release\bundle\nsis\
echo 3. Distribute the installer to end users
echo.
pause