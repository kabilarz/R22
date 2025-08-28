#!/usr/bin/env python3
"""
Quick backend connectivity test
"""
import requests
import time
import sys

def test_backend_connection():
    """Test backend connection"""
    url = "http://localhost:8001/api/health"
    
    print("=== Backend Connectivity Test ===")
    print(f"Testing: {url}")
    print()
    
    try:
        print("Attempting connection...")
        response = requests.get(url, timeout=10)
        
        print(f"✅ Response Status: {response.status_code}")
        print(f"✅ Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ Response Data: {data}")
                return True
            except:
                print(f"✅ Response Text: {response.text}")
                return True
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection Error: {e}")
        print("   - Backend server may not be running")
        print("   - Try: python backend/app.py")
        return False
        
    except requests.exceptions.Timeout as e:
        print(f"❌ Timeout Error: {e}")
        print("   - Backend is too slow to respond")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

def check_backend_process():
    """Check if backend process is running"""
    try:
        import psutil
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            if 'python' in proc.info['name'].lower():
                cmdline = ' '.join(proc.info['cmdline'] or [])
                if 'app.py' in cmdline:
                    print(f"✅ Found backend process: PID {proc.info['pid']}")
                    print(f"   Command: {cmdline}")
                    return True
        print("❌ No backend process found")
        return False
    except ImportError:
        print("⚠️  psutil not available, cannot check processes")
        return None
    except Exception as e:
        print(f"❌ Error checking processes: {e}")
        return False

if __name__ == "__main__":
    print("Checking backend process...")
    check_backend_process()
    print()
    
    print("Testing backend connectivity...")
    success = test_backend_connection()
    
    print()
    if success:
        print("🎉 Backend is working correctly!")
        sys.exit(0)
    else:
        print("❌ Backend connection failed!")
        print()
        print("Solutions:")
        print("1. Start backend: python backend/app.py")
        print("2. Wait for startup: Backend may take 10-30 seconds to start")
        print("3. Check port: Make sure nothing else is using port 8001")
        print("4. Restart everything: Use fix_and_start.bat")
        sys.exit(1)