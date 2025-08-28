#!/usr/bin/env python3
"""
Test script to verify backend startup and dependencies
"""

import sys
import traceback

def test_imports():
    """Test if all required imports work"""
    try:
        import fastapi
        print("✅ FastAPI available")
    except ImportError as e:
        print(f"❌ FastAPI not available: {e}")
        return False
    
    try:
        import uvicorn
        print("✅ Uvicorn available")
    except ImportError as e:
        print(f"❌ Uvicorn not available: {e}")
        return False
    
    try:
        import pandas
        print("✅ Pandas available")
    except ImportError as e:
        print(f"❌ Pandas not available: {e}")
        return False
    
    return True

def test_simple_server():
    """Test if we can create a simple FastAPI app"""
    try:
        from fastapi import FastAPI
        app = FastAPI()
        
        @app.get("/test")
        async def test():
            return {"status": "working"}
        
        print("✅ FastAPI app creation successful")
        return True
    except Exception as e:
        print(f"❌ FastAPI app creation failed: {e}")
        print(traceback.format_exc())
        return False

def main():
    print("=== Nemo Backend Startup Test ===")
    print(f"Python version: {sys.version}")
    print()
    
    # Test imports
    print("Testing imports...")
    if not test_imports():
        print("❌ Import test failed. Install requirements: pip install -r requirements.txt")
        return False
    
    print()
    
    # Test simple server creation
    print("Testing FastAPI app creation...")
    if not test_simple_server():
        print("❌ FastAPI app test failed")
        return False
    
    print()
    print("✅ All tests passed! Backend dependencies are ready.")
    
    # Now try to start the actual server
    print("\n=== Starting Simple Backend Server ===")
    try:
        import uvicorn
        from simple_app import app
        print("Starting server on http://localhost:8001...")
        uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)
    except Exception as e:
        print(f"❌ Server startup failed: {e}")
        print(traceback.format_exc())

if __name__ == "__main__":
    main()