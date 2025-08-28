#!/usr/bin/env python3
"""
Nemo Project Status Check Script
Tests all critical components and provides a completion status
"""

import requests
import json
import sys
import traceback
from datetime import datetime

def test_backend():
    """Test if backend is running and responding"""
    print("🔧 Testing Backend...")
    
    endpoints = [
        "http://localhost:8001/",
        "http://localhost:8001/api/health", 
        "http://localhost:8001/api/test"
    ]
    
    backend_working = True
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint} - OK")
            else:
                print(f"❌ {endpoint} - HTTP {response.status_code}")
                backend_working = False
        except Exception as e:
            print(f"❌ {endpoint} - {str(e)}")
            backend_working = False
    
    return backend_working

def test_frontend():
    """Test if frontend is accessible"""
    print("\n🎨 Testing Frontend...")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend (http://localhost:3000) - OK")
            return True
        else:
            print(f"❌ Frontend - HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend - {str(e)}")
        return False

def test_python_dependencies():
    """Test critical Python dependencies"""
    print("\n📦 Testing Python Dependencies...")
    
    deps = [
        "fastapi",
        "uvicorn", 
        "pandas",
        "numpy",
        "scipy",
        "matplotlib",
        "seaborn"
    ]
    
    all_deps_ok = True
    
    for dep in deps:
        try:
            __import__(dep)
            print(f"✅ {dep} - OK")
        except ImportError:
            print(f"❌ {dep} - Missing")
            all_deps_ok = False
    
    return all_deps_ok

def check_file_structure():
    """Check if critical files exist"""
    print("\n📁 Checking File Structure...")
    
    import os
    
    critical_files = [
        "backend/minimal_app.py",
        "backend/simple_app.py", 
        "backend/app.py",
        "backend/requirements.txt",
        "package.json",
        "components/model-selector.tsx",
        "components/chat-panel.tsx",
        "lib/ollama-client.ts",
        "src-tauri/tauri.conf.json"
    ]
    
    all_files_ok = True
    base_path = "c:/Users/drraj/OneDrive/Documents/Beta/R22"
    
    for file_path in critical_files:
        full_path = f"{base_path}/{file_path}"
        if os.path.exists(full_path):
            print(f"✅ {file_path} - Exists")
        else:
            print(f"❌ {file_path} - Missing")
            all_files_ok = False
    
    return all_files_ok

def generate_status_report():
    """Generate comprehensive status report"""
    print("\n" + "="*50)
    print("🚀 NEMO PROJECT STATUS REPORT")
    print("="*50)
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test all components
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    deps_ok = test_python_dependencies()
    files_ok = check_file_structure()
    
    # Calculate completion percentage
    total_checks = 4
    passed_checks = sum([backend_ok, frontend_ok, deps_ok, files_ok])
    completion_percent = (passed_checks / total_checks) * 100
    
    print("\n" + "="*50)
    print("📊 OVERALL STATUS")
    print("="*50)
    print(f"✅ Backend Server: {'WORKING' if backend_ok else 'FAILED'}")
    print(f"✅ Frontend Server: {'WORKING' if frontend_ok else 'FAILED'}")
    print(f"✅ Python Dependencies: {'OK' if deps_ok else 'MISSING'}")
    print(f"✅ File Structure: {'COMPLETE' if files_ok else 'INCOMPLETE'}")
    print()
    print(f"🎯 COMPLETION STATUS: {completion_percent:.0f}%")
    
    if completion_percent >= 75:
        print("🎉 Project is in good shape for continued development!")
    elif completion_percent >= 50:
        print("⚠️  Project has basic functionality but needs work")
    else:
        print("❌ Project needs significant fixes before proceeding")
    
    print("\n" + "="*50)
    print("📋 NEXT STEPS")
    print("="*50)
    
    if not backend_ok:
        print("1. Fix backend server startup issues")
    if not frontend_ok:
        print("2. Fix frontend server startup issues")
    if not deps_ok:
        print("3. Install missing Python dependencies")
    if not files_ok:
        print("4. Ensure all critical files are present")
    
    if all([backend_ok, frontend_ok, deps_ok, files_ok]):
        print("✅ All basic infrastructure working!")
        print("📋 Ready to proceed with:")
        print("   - Frontend-Backend integration testing")
        print("   - File upload functionality")
        print("   - Statistical analysis pipeline")
        print("   - AI model integration")
        print("   - Tauri desktop build")
    
    return completion_percent

if __name__ == "__main__":
    try:
        completion = generate_status_report()
        sys.exit(0 if completion >= 75 else 1)
    except Exception as e:
        print(f"\n❌ Status check failed: {e}")
        print(traceback.format_exc())
        sys.exit(1)