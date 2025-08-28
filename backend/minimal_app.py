"""
Simplified FastAPI backend to isolate startup issues
"""

from fastapi import FastAPI, HTTPException, APIRouter, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import traceback
import pandas as pd
import io
import numpy as np
from scipy import stats
from scipy.stats import shapiro, normaltest
import json
import subprocess
import sys
import tempfile
import os
from typing import List, Dict, Any

# Create FastAPI app
app = FastAPI(title="Nemo Statistical Analysis API", version="1.0.0")

# Create API router
api_router = APIRouter(prefix="/api")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple response models
class HealthResponse(BaseModel):
    status: str
    message: str
    version: str

class InitResponse(BaseModel):
    ok: bool
    message: str

class UploadResponse(BaseModel):
    success: bool
    filename: str
    rows: int
    columns: int
    message: str

class StatTestRequest(BaseModel):
    data: list
    test_type: str
    group_col: str = None
    value_col: str = None

class StatTestResponse(BaseModel):
    success: bool
    test_name: str
    statistic: float = None
    p_value: float = None
    result: dict
    message: str

class PythonExecutionRequest(BaseModel):
    code: str
    fileName: str
    fileData: List[Dict[str, Any]]

class PythonExecutionResponse(BaseModel):
    output: str
    error: str = None
    success: bool

# Basic endpoints
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Nemo AI Statistical Analysis Backend", "status": "running"}

@api_router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        message="Nemo Statistical Analysis API is running",
        version="1.0.0"
    )

@api_router.post("/init", response_model=InitResponse)
async def initialize():
    """Initialize the system."""
    try:
        # Try to import key modules to check for import issues
        import pandas as pd
        import numpy as np
        
        return InitResponse(
            ok=True,
            message="System initialized successfully"
        )
    except Exception as e:
        return InitResponse(
            ok=False,
            message=f"Initialization failed: {str(e)}"
        )

@api_router.get("/test")
async def test_endpoint():
    """Test endpoint to verify API is working."""
    return {
        "test": "success",
        "backend": "working",
        "endpoints": ["GET /", "GET /api/health", "POST /api/init", "GET /api/test", "POST /api/upload"]
    }

@api_router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload and parse a CSV file."""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Read file content
        content = await file.read()
        
        # Parse CSV file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        else:
            raise HTTPException(status_code=400, detail="Only CSV files are supported in this test")
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        # Store data in a simple global variable for testing (in production, use proper storage)
        global uploaded_data
        uploaded_data = df
        
        return UploadResponse(
            success=True,
            filename=file.filename,
            rows=len(df),
            columns=len(df.columns),
            message=f"Successfully uploaded {file.filename} with {len(df)} rows and {len(df.columns)} columns"
        )
        
    except Exception as e:
        return UploadResponse(
            success=False,
            filename=file.filename or "unknown",
            rows=0,
            columns=0,
            message=f"Upload failed: {str(e)}"
        )

@api_router.post("/stats/descriptive")
async def descriptive_stats():
    """Calculate descriptive statistics for uploaded data."""
    try:
        global uploaded_data
        if uploaded_data is None:
            raise HTTPException(status_code=400, detail="No data uploaded yet")
        
        # Calculate descriptive statistics for numeric columns
        numeric_cols = uploaded_data.select_dtypes(include=[np.number]).columns
        desc_stats = uploaded_data[numeric_cols].describe().to_dict()
        
        return {
            "success": True,
            "test_name": "Descriptive Statistics",
            "result": desc_stats,
            "message": f"Calculated descriptive statistics for {len(numeric_cols)} numeric columns"
        }
        
    except Exception as e:
        return {
            "success": False,
            "test_name": "Descriptive Statistics",
            "result": {},
            "message": f"Failed: {str(e)}"
        }

@api_router.post("/stats/ttest")
async def independent_ttest(request: dict):
    """Perform independent t-test."""
    try:
        global uploaded_data
        if uploaded_data is None:
            raise HTTPException(status_code=400, detail="No data uploaded yet")
        
        group_col = request.get('group_col')
        value_col = request.get('value_col')
        
        if not group_col or not value_col:
            raise HTTPException(status_code=400, detail="group_col and value_col are required")
        
        # Get unique groups
        groups = uploaded_data[group_col].unique()
        if len(groups) != 2:
            raise HTTPException(status_code=400, detail="T-test requires exactly 2 groups")
        
        # Split data by groups
        group1_data = uploaded_data[uploaded_data[group_col] == groups[0]][value_col].dropna()
        group2_data = uploaded_data[uploaded_data[group_col] == groups[1]][value_col].dropna()
        
        # Perform t-test
        statistic, p_value = stats.ttest_ind(group1_data, group2_data)
        
        result = {
            "groups": [str(groups[0]), str(groups[1])],
            "group1_mean": float(group1_data.mean()),
            "group2_mean": float(group2_data.mean()),
            "group1_n": len(group1_data),
            "group2_n": len(group2_data),
            "statistic": float(statistic),
            "p_value": float(p_value),
            "significant": p_value < 0.05
        }
        
        return {
            "success": True,
            "test_name": "Independent T-Test",
            "result": result,
            "message": f"T-test completed. p-value: {p_value:.6f}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "test_name": "Independent T-Test",
            "result": {},
            "message": f"Failed: {str(e)}"
        }

@api_router.post("/stats/normality")
async def normality_test(request: dict):
    """Perform Shapiro-Wilk normality test."""
    try:
        global uploaded_data
        if uploaded_data is None:
            raise HTTPException(status_code=400, detail="No data uploaded yet")
        
        column = request.get('column')
        if not column:
            raise HTTPException(status_code=400, detail="column is required")
        
        data = uploaded_data[column].dropna()
        
        if len(data) < 3:
            raise HTTPException(status_code=400, detail="Need at least 3 data points for normality test")
        
        # Perform Shapiro-Wilk test
        statistic, p_value = shapiro(data)
        
        result = {
            "column": column,
            "n_observations": len(data),
            "statistic": float(statistic),
            "p_value": float(p_value),
            "is_normal": p_value > 0.05,
            "interpretation": "Data appears normally distributed" if p_value > 0.05 else "Data does not appear normally distributed"
        }
        
        return {
            "success": True,
            "test_name": "Shapiro-Wilk Normality Test",
            "result": result,
            "message": f"Normality test completed. p-value: {p_value:.6f}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "test_name": "Shapiro-Wilk Normality Test",
            "result": {},
            "message": f"Failed: {str(e)}"
        }

@api_router.post("/execute-python", response_model=PythonExecutionResponse)
async def execute_python_code(request: PythonExecutionRequest):
    """Execute Python code with the provided dataset."""
    try:
        # Create a temporary file for the dataset
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
            json.dump(request.fileData, temp_file)
            temp_file_path = temp_file.name

        # Prepare Python code with data loading
        python_code = f"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

# Load the dataset
with open('{temp_file_path}', 'r') as f:
    data = json.load(f)

df = pd.DataFrame(data)

# Capture output
output_buffer = io.StringIO()
error_buffer = io.StringIO()

try:
    with redirect_stdout(output_buffer), redirect_stderr(error_buffer):
        # User code starts here
{request.code}
        # User code ends here
        
    # Get the output
    output = output_buffer.getvalue()
    errors = error_buffer.getvalue()
    
    if errors:
        print("STDERR:", errors)
    
    print("EXECUTION_COMPLETE")
    
except Exception as e:
    print(f"EXECUTION_ERROR: {{str(e)}}")
    import traceback
    traceback.print_exc()
"""

        # Execute the Python code
        result = subprocess.run(
            [sys.executable, '-c', python_code],
            capture_output=True,
            text=True,
            timeout=30  # 30 second timeout
        )

        # Clean up temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass

        # Parse the output
        output = result.stdout
        error_output = result.stderr
        
        success = result.returncode == 0 and "EXECUTION_ERROR:" not in output
        
        if not success and error_output:
            error_output = f"Process error: {error_output}"
        elif "EXECUTION_ERROR:" in output:
            # Extract the error from output
            error_lines = [line for line in output.split('\n') if 'EXECUTION_ERROR:' in line]
            if error_lines:
                error_output = error_lines[0].replace('EXECUTION_ERROR: ', '')
        
        # Clean the output
        if "EXECUTION_COMPLETE" in output:
            output = output.replace("EXECUTION_COMPLETE", "").strip()
        
        return PythonExecutionResponse(
            output=output,
            error=error_output if error_output else None,
            success=success
        )

    except subprocess.TimeoutExpired:
        return PythonExecutionResponse(
            output="",
            error="Code execution timed out (30 seconds limit)",
            success=False
        )
    except Exception as e:
        return PythonExecutionResponse(
            output="",
            error=f"Failed to execute Python code: {str(e)}",
            success=False
        )

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return {
        "error": "Internal server error",
        "message": str(exc),
        "traceback": traceback.format_exc()
    }

# Global variable to store uploaded data (for testing purposes)
uploaded_data = None

# Include the API router
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    print("Starting simplified Nemo backend...")
    print("Available endpoints:")
    print("  GET  /")
    print("  GET  /api/health")
    print("  POST /api/init")
    print("  GET  /api/test")
    print()
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)