"""
FastAPI backend for the statistical analysis app.
Provides endpoints for dataset management, analysis, and chat history.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, APIRouter, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import io
import json
import subprocess
import tempfile
import os
import sys

from data_store import (
    init_store, start_chat, save_dataset, upsert_variables, 
    get_variables, get_dataset_info, log_run, get_chat_history,
    get_all_datasets
)
from analyses import (
    run_ttest, get_dataset_summary, run_descriptive_stats, 
    run_chi_square_test, run_correlation_analysis, run_anova
)

# Import Phase 2A medical statistics functions
from medical_statistics import (
    run_paired_ttest, run_one_sample_ttest, run_mann_whitney_u_test, 
    run_wilcoxon_signed_rank_test, run_fisher_exact_test, run_kruskal_wallis_test,
    run_linear_regression, run_logistic_regression, run_mcnemar_test, run_two_way_anova
)

from medical_statistics_part2 import (
    run_kaplan_meier_analysis, run_cox_regression, run_roc_analysis,
    run_multiple_regression, run_shapiro_wilk_test, run_levene_test,
    run_spearman_correlation, run_friedman_test, run_odds_ratio_analysis,
    run_diagnostic_test_analysis
)

app = FastAPI(title="Statistical Analysis API", version="1.0.0")

# Create API router
api_router = APIRouter(prefix="/api")

# Create API router
api_router = APIRouter(prefix="/api")

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class InitResponse(BaseModel):
    ok: bool

class ChatRequest(BaseModel):
    title: str

class ChatResponse(BaseModel):
    chat_id: str

class DatasetUploadResponse(BaseModel):
    dataset_id: str
    name: str
    n_rows: int

class VariableInfo(BaseModel):
    name: str
    type: Optional[str] = ""
    label: Optional[str] = ""
    measure: Optional[str] = ""
    role: Optional[str] = ""
    missing: Optional[str] = ""

class VariablesUpdateRequest(BaseModel):
    variables: List[VariableInfo]

class TTestRequest(BaseModel):
    chat_id: str
    dataset_id: str
    group_col: str
    value_col: str
    where_sql: Optional[str] = None

class TTestResponse(BaseModel):
    run_id: str
    n_male: int
    n_female: int
    mean_male: Optional[float]
    mean_female: Optional[float]
    levene_p: Optional[float]
    equal_var_assumed: Optional[bool]
    t_stat: Optional[float]
    p_value: Optional[float]
    error: Optional[str] = None

class SuccessResponse(BaseModel):
    ok: bool

class DescriptiveStatsRequest(BaseModel):
    dataset_id: str
    columns: Optional[List[str]] = None

class ChiSquareRequest(BaseModel):
    chat_id: str
    dataset_id: str
    col1: str
    col2: str
    where_sql: Optional[str] = None

class CorrelationRequest(BaseModel):
    dataset_id: str
    columns: Optional[List[str]] = None
    method: str = 'pearson'

class ANOVARequest(BaseModel):
    chat_id: str
    dataset_id: str
    group_col: str
    value_col: str
    where_sql: Optional[str] = None

class PythonExecutionRequest(BaseModel):
    code: str
    fileName: str
    fileData: List[Dict[str, Any]]

class PythonExecutionResponse(BaseModel):
    output: str
    error: Optional[str] = None
    success: bool

@api_router.post("/init", response_model=InitResponse)
async def initialize_database():
    """Initialize the DuckDB database with required tables."""
    try:
        init_store()
        return InitResponse(ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize database: {str(e)}")

@api_router.post("/chats", response_model=ChatResponse)
async def create_chat(request: ChatRequest):
    """Create a new chat session."""
    try:
        chat_id = start_chat(request.title)
        return ChatResponse(chat_id=chat_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create chat: {str(e)}")

@api_router.post("/datasets/upload", response_model=DatasetUploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """Upload and save a dataset as Parquet with DuckDB view."""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Read file content
        content = await file.read()
        
        # Determine file type and parse accordingly
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        elif file.filename.endswith('.json'):
            df = pd.read_json(io.StringIO(content.decode('utf-8')))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV, JSON, or Excel files.")
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        # Save dataset
        dataset_id = save_dataset(df, file.filename)
        
        return DatasetUploadResponse(
            dataset_id=dataset_id,
            name=file.filename,
            n_rows=len(df)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload dataset: {str(e)}")

@api_router.put("/variables/{dataset_id}", response_model=SuccessResponse)
async def update_variables(dataset_id: str, request: VariablesUpdateRequest):
    """Update variable metadata for a dataset."""
    try:
        variables_list = [var.dict() for var in request.variables]
        upsert_variables(dataset_id, variables_list)
        return SuccessResponse(ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update variables: {str(e)}")

@api_router.get("/variables/{dataset_id}")
async def get_dataset_variables(dataset_id: str):
    """Get variable metadata for a dataset."""
    try:
        variables = get_variables(dataset_id)
        return {"variables": variables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get variables: {str(e)}")

@api_router.post("/analysis/ttest", response_model=TTestResponse)
async def perform_ttest(request: TTestRequest):
    """Perform t-test analysis and log the results."""
    try:
        # Run the t-test analysis
        result = run_ttest(
            dataset_id=request.dataset_id,
            group_col=request.group_col,
            value_col=request.value_col,
            where_sql=request.where_sql
        )
        
        # Prepare parameters for logging
        params = {
            "dataset_id": request.dataset_id,
            "group_col": request.group_col,
            "value_col": request.value_col,
            "where_sql": request.where_sql
        }
        
        # Log the analysis run
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="ttest",
            params_dict=params,
            result_dict=result
        )
        
        # Return results with run_id
        response_data = result.copy()
        response_data["run_id"] = run_id
        
        return TTestResponse(**response_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform t-test: {str(e)}")

@api_router.get("/history/{chat_id}")
async def get_chat_analysis_history(chat_id: str):
    """Get analysis history for a specific chat."""
    try:
        history = get_chat_history(chat_id)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat history: {str(e)}")

@api_router.get("/datasets")
async def list_datasets():
    """Get all available datasets."""
    try:
        datasets = get_all_datasets()
        return {"datasets": datasets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list datasets: {str(e)}")

@api_router.get("/datasets/{dataset_id}")
async def get_dataset_details(dataset_id: str):
    """Get detailed information about a specific dataset."""
    try:
        dataset_info = get_dataset_info(dataset_id)
        if not dataset_info:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Get summary statistics
        summary = get_dataset_summary(dataset_id)
        
        return {
            "dataset": dataset_info,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dataset details: {str(e)}")

@api_router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Statistical Analysis API is running"}

@api_router.post("/analysis/descriptive")
async def get_descriptive_statistics(request: DescriptiveStatsRequest):
    """Get descriptive statistics for specified columns."""
    try:
        result = run_descriptive_stats(request.dataset_id, request.columns)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate descriptive statistics: {str(e)}")

@api_router.post("/analysis/chisquare")
async def perform_chi_square_test(request: ChiSquareRequest):
    """Perform chi-square test of independence."""
    try:
        result = run_chi_square_test(
            dataset_id=request.dataset_id,
            col1=request.col1,
            col2=request.col2,
            where_sql=request.where_sql
        )
        
        # Log the analysis run
        params = {
            "dataset_id": request.dataset_id,
            "col1": request.col1,
            "col2": request.col2,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="chisquare",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform chi-square test: {str(e)}")

@api_router.post("/analysis/correlation")
async def perform_correlation_analysis(request: CorrelationRequest):
    """Perform correlation analysis."""
    try:
        result = run_correlation_analysis(
            dataset_id=request.dataset_id,
            columns=request.columns,
            method=request.method
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform correlation analysis: {str(e)}")

@api_router.post("/analysis/anova")
async def perform_anova(request: ANOVARequest):
    """Perform one-way ANOVA."""
    try:
        result = run_anova(
            dataset_id=request.dataset_id,
            group_col=request.group_col,
            value_col=request.value_col,
            where_sql=request.where_sql
        )
        
        # Log the analysis run
        params = {
            "dataset_id": request.dataset_id,
            "group_col": request.group_col,
            "value_col": request.value_col,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="anova",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform ANOVA: {str(e)}")

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

# Include the API router in the main app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)