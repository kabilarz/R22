#!/usr/bin/env python3
"""
Test script to verify if the backend can be started and is working properly
"""

import subprocess
import sys
import time
import requests
import os
from pathlib import Path

def test_python_availability():
    """Test if Python is available"""
    try:
        result = subprocess.run([sys.executable, '--version'], capture_output=True, text=True)
        print(f"✅ Python available: {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"❌ Python not available: {e}")
        return False

def test_backend_dependencies():
    """Test if backend dependencies are available"""
    try:
        import fastapi
        import uvicorn
        import pandas
        import numpy
        import scipy
        print("✅ All backend dependencies available")
        return True
    except ImportError as e:
        print(f"❌ Missing backend dependency: {e}")
        return False

def start_backend_server():
    """Start the backend server"""
    backend_dir = Path(__file__).parent / "backend"
    app_py = backend_dir / "app.py"
    
    if not app_py.exists():
        print(f"❌ Backend app.py not found at: {app_py}")
        return None
    
    print(f"🚀 Starting backend server from: {app_py}")
    
    process = subprocess.Popen(
        [sys.executable, str(app_py)],
        cwd=str(backend_dir),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    return process

def test_backend_connection():
    """Test if backend is responding"""
    url = "http://localhost:8001/api/health"
    
    for attempt in range(10):
        try:
            response = requests.get(url, timeout=2)
            if response.status_code == 200:
                print(f"✅ Backend is responding: {response.json()}")
                return True
        except requests.exceptions.RequestException:
            pass
        
        print(f"⏳ Attempt {attempt + 1}/10 - Backend not ready yet...")
        time.sleep(2)
    
    print("❌ Backend failed to respond after 20 seconds")
    return False

def main():
    print("=== Nemo Backend Test ===")
    
    # Test 1: Python availability
    if not test_python_availability():
        return False
    
    # Test 2: Dependencies
    if not test_backend_dependencies():
        print("Install dependencies with: pip install -r backend/requirements.txt")
        return False
    
    # Test 3: Start backend
    process = start_backend_server()
    if not process:
        return False
    
    try:
        # Test 4: Connection
        success = test_backend_connection()
        
        if success:
            print("🎉 All tests passed! Backend is working correctly.")
            
            # Test a simple API call
            try:
                response = requests.post("http://localhost:8001/api/init")
                if response.status_code == 200:
                    print("✅ Database initialization successful")
                else:
                    print(f"⚠️  Database initialization returned: {response.status_code}")
            except Exception as e:
                print(f"⚠️  Database initialization failed: {e}")
            
            return True
        else:
            return False
            
    finally:
        # Clean up: terminate the backend process
        if process:
            process.terminate()
            try:
                process.wait(timeout=5)
                print("🛑 Backend server stopped")
            except subprocess.TimeoutExpired:
                process.kill()
                print("🔪 Backend server force killed")

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Backend is ready for desktop deployment!")
        sys.exit(0)
    else:
        print("\n❌ Backend issues detected. Please fix before building desktop app.")
        sys.exit(1)