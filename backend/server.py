"""
Server entry point for supervisor.
Imports the FastAPI app from simple_app.py for testing
"""
from simple_app import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)