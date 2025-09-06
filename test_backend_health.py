#!/usr/bin/env python3
"""
Quick test to verify backend is responding
"""

import requests

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8001/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running and healthy")
            return True
        else:
            print(f"❌ Backend unhealthy: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not responding: {e}")
        return False

if __name__ == "__main__":
    if test_backend_health():
        print("Backend is ready for testing")
    else:
        print("Please start the backend first: python backend/app.py")