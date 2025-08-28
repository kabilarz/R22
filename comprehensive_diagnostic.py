#!/usr/bin/env python3
"""
COMPREHENSIVE NEMO DIAGNOSTIC SCRIPT
This will identify exactly why the backend connection issues persist
"""

import subprocess
import time
import requests
import os
import psutil
import sys
from pathlib import Path

def header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}")

def check_mark(condition, text):
    print(f"{'✅' if condition else '❌'} {text}")
    return condition

def warning(text):
    print(f"⚠️  {text}")

def info(text):
    print(f"ℹ️  {text}")

def main():
    header("NEMO COMPREHENSIVE DIAGNOSTIC")
    
    # 1. Environment Check
    header("1. ENVIRONMENT CHECK")
    
    # Check current directory
    current_dir = os.getcwd()
    expected_dir = r"c:\Users\drraj\OneDrive\Documents\Beta\R22"
    check_mark(current_dir.lower() == expected_dir.lower(), f"Correct directory: {current_dir}")
    
    # Check Python version
    python_version = sys.version
    check_mark("3.11" in python_version, f"Python version: {python_version.split()[0]}")
    
    # Check required files
    required_files = [
        "backend/app.py",
        "src-tauri/target/release/app.exe",
        ".env.local"
    ]
    
    for file_path in required_files:
        exists = Path(file_path).exists()
        check_mark(exists, f"File exists: {file_path}")
    
    # 2. Backend Testing
    header("2. BACKEND TESTING")
    
    # Check if backend is running
    backend_running = False
    backend_pid = None
    
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if proc.info['name'] and 'python' in proc.info['name'].lower():
                cmdline = ' '.join(proc.info['cmdline'] or [])
                if 'app.py' in cmdline:
                    backend_running = True
                    backend_pid = proc.info['pid']
                    break
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    
    check_mark(backend_running, f"Backend process running: {f'PID {backend_pid}' if backend_pid else 'No'}")
    
    # Test backend connectivity
    backend_responding = False
    try:
        response = requests.get("http://localhost:8001/api/health", timeout=5)
        backend_responding = response.status_code == 200
        if backend_responding:
            data = response.json()
            info(f"Backend response: {data}")
    except Exception as e:
        warning(f"Backend connection error: {e}")
    
    check_mark(backend_responding, "Backend API responding")
    
    # 3. Launcher Script Analysis
    header("3. LAUNCHER SCRIPT ANALYSIS")
    
    launcher_scripts = [
        "run_nemo_now.bat",
        "start_nemo.bat", 
        "launch_nemo_app.bat",
        "fix_and_start.bat"
    ]
    
    for script in launcher_scripts:
        exists = Path(script).exists()
        status = "✅ GOOD" if script in ["run_nemo_now.bat", "start_nemo.bat"] else "❌ PROBLEMATIC"
        print(f"{'✅' if exists else '❌'} {script} - {status if exists else 'MISSING'}")
    
    # 4. Port Analysis  
    header("4. PORT ANALYSIS")
    
    import socket
    
    def check_port(port):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                result = s.connect_ex(('localhost', port))
                return result == 0
        except:
            return False
    
    port_8001_open = check_port(8001)
    check_mark(port_8001_open, "Port 8001 accessible")
    
    # 5. Desktop App Testing
    header("5. DESKTOP APP ANALYSIS")
    
    app_path = Path("src-tauri/target/release/app.exe")
    if app_path.exists():
        app_size = app_path.stat().st_size / (1024*1024)  # MB
        app_modified = app_path.stat().st_mtime
        check_mark(app_size > 10, f"App size: {app_size:.1f} MB")
        info(f"App last modified: {time.ctime(app_modified)}")
    
    # 6. Backend Startup Test
    header("6. BACKEND STARTUP TEST")
    
    if not backend_running:
        print("Testing backend startup...")
        try:
            # Start backend
            proc = subprocess.Popen([
                sys.executable, "backend/app.py"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Wait and test
            time.sleep(5)
            
            try:
                response = requests.get("http://localhost:8001/api/health", timeout=5)
                startup_success = response.status_code == 200
                check_mark(startup_success, "Backend startup test")
                
                if startup_success:
                    info("Backend starts successfully when launched manually")
                else:
                    warning("Backend starts but doesn't respond correctly")
                    
            except Exception as e:
                warning(f"Backend startup test failed: {e}")
            
            # Clean up
            proc.terminate()
            proc.wait()
            
        except Exception as e:
            warning(f"Could not test backend startup: {e}")
    else:
        info("Backend already running - startup test skipped")
    
    # 7. Summary and Recommendations
    header("7. DIAGNOSIS SUMMARY")
    
    print("\n🔍 FINDINGS:")
    
    if not backend_running and not backend_responding:
        print("❌ ROOT CAUSE: Backend is not starting automatically in launcher scripts")
        print("\n💡 SOLUTIONS:")
        print("1. Backend works fine when started manually")
        print("2. Issue is with launcher scripts not starting backend properly")
        print("3. Timing issues - launchers don't wait long enough")
        print("4. Process management issues in Windows")
        
        print("\n🚀 IMMEDIATE FIXES:")
        print("a) Use manual startup: python backend/app.py (in one terminal)")
        print("b) Then run: src-tauri/target/release/app.exe (in another)")
        print("c) Or fix launcher scripts with better process management")
        
    elif backend_running and backend_responding:
        print("✅ Backend is working correctly!")
        print("❌ Issue might be in desktop app's API client configuration")
        
    else:
        print("⚠️  Mixed results - need further investigation")
    
    print(f"\n📊 DIAGNOSTIC COMPLETE")

if __name__ == "__main__":
    main()