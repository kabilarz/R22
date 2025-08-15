#!/usr/bin/env python3
"""
Simple frontend test to verify the application is working
"""

import requests
import time
import sys

def test_frontend():
    """Test if frontend is accessible and working"""
    try:
        # Test frontend health
        response = requests.get("http://localhost:3000", timeout=10)
        if response.status_code == 200:
            print("✅ Frontend is accessible on localhost:3000")
            
            # Check if it contains expected content
            content = response.text
            if "Nemo" in content and "Ready to Analyze Your Data" in content:
                print("✅ Frontend contains expected Nemo application content")
                return True
            else:
                print("❌ Frontend content doesn't match expected Nemo application")
                return False
        else:
            print(f"❌ Frontend returned status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to access frontend: {str(e)}")
        return False

def test_backend_from_frontend():
    """Test if backend is accessible from frontend's perspective"""
    try:
        # Test the backend URL that frontend would use
        backend_url = "https://medstats-hub.preview.emergentagent.com/api/health"
        response = requests.get(backend_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend accessible from frontend URL: {data}")
            return True
        else:
            print(f"❌ Backend not accessible from frontend URL: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Backend connection failed: {str(e)}")
        return False

def main():
    print("🚀 Testing Nemo Frontend Application")
    print("=" * 50)
    
    frontend_ok = test_frontend()
    backend_ok = test_backend_from_frontend()
    
    print("=" * 50)
    if frontend_ok and backend_ok:
        print("🎉 Frontend and backend integration test passed!")
        return 0
    else:
        print("⚠️ Some tests failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())