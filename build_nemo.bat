@echo off
title Nemo - Build Script Launcher

echo Starting Nemo Fresh Build...
echo.

REM Run the PowerShell build script
powershell -ExecutionPolicy Bypass -File "build_fresh_nemo.ps1"

if %errorlevel% neq 0 (
    echo.
    echo Build script encountered an error.
    echo Trying alternative batch build method...
    echo.
    call build_fresh_nemo.bat
)

echo.
echo Build process completed.
pause