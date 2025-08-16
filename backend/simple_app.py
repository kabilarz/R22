"""
Simple FastAPI backend for testing basic functionality
"""

from fastapi import FastAPI

app = FastAPI(title="Nemo Statistical Analysis API", version="1.0.0")

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy", 
        "message": "Nemo Statistical Analysis API is running",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Nemo AI Statistical Analysis Backend"}

@app.get("/test")
async def test():
    """Test endpoint."""
    return {"test": "success", "backend": "working"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)