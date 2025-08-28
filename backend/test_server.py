#!/usr/bin/env python3
"""
Minimal FastAPI server test
"""

try:
    from fastapi import FastAPI
    import uvicorn
    print("✅ Imports successful")
    
    app = FastAPI()
    
    @app.get("/")
    def root():
        return {"message": "Server is working!"}
    
    @app.get("/health")  
    def health():
        return {"status": "healthy"}
    
    print("🚀 Starting server on http://localhost:8001")
    print("Press Ctrl+C to stop")
    
    uvicorn.run(
        app, 
        host="127.0.0.1", 
        port=8001, 
        log_level="info",
        reload=False
    )
    
except Exception as e:
    print(f"❌ Server failed to start: {e}")
    import traceback
    print(traceback.format_exc())
    input("Press Enter to exit...")