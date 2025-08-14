"""
FastAPI backend for the statistical analysis app.
Provides endpoints for dataset management, analysis, and chat history.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import io
import json

from data_store import (
    init_store, start_chat, save_dataset, upsert_variables, 
    get_variables, get_dataset_info, log_run, get_chat_history,
    get_all_datasets
)
from analyses import (
    run_ttest, get_dataset_summary, run_descriptive_stats, 
    run_chi_square_test, run_correlation_analysis, run_anova
)

app = FastAPI(title="Statistical Analysis API", version="1.0.0", root_path="/api")

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

@app.post("/init", response_model=InitResponse)
async def initialize_database():
    """Initialize the DuckDB database with required tables."""
    try:
        init_store()
        return InitResponse(ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize database: {str(e)}")

@app.post("/chats", response_model=ChatResponse)
async def create_chat(request: ChatRequest):
    """Create a new chat session."""
    try:
        chat_id = start_chat(request.title)
        return ChatResponse(chat_id=chat_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create chat: {str(e)}")

@app.post("/datasets/upload", response_model=DatasetUploadResponse)
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

@app.put("/variables/{dataset_id}", response_model=SuccessResponse)
async def update_variables(dataset_id: str, request: VariablesUpdateRequest):
    """Update variable metadata for a dataset."""
    try:
        variables_list = [var.dict() for var in request.variables]
        upsert_variables(dataset_id, variables_list)
        return SuccessResponse(ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update variables: {str(e)}")

@app.get("/variables/{dataset_id}")
async def get_dataset_variables(dataset_id: str):
    """Get variable metadata for a dataset."""
    try:
        variables = get_variables(dataset_id)
        return {"variables": variables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get variables: {str(e)}")

@app.post("/analysis/ttest", response_model=TTestResponse)
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

@app.get("/history/{chat_id}")
async def get_chat_analysis_history(chat_id: str):
    """Get analysis history for a specific chat."""
    try:
        history = get_chat_history(chat_id)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat history: {str(e)}")

@app.get("/datasets")
async def list_datasets():
    """Get all available datasets."""
    try:
        datasets = get_all_datasets()
        return {"datasets": datasets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list datasets: {str(e)}")

@app.get("/datasets/{dataset_id}")
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

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Statistical Analysis API is running"}

@app.post("/analysis/descriptive")
async def get_descriptive_statistics(request: DescriptiveStatsRequest):
    """Get descriptive statistics for specified columns."""
    try:
        result = run_descriptive_stats(request.dataset_id, request.columns)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate descriptive statistics: {str(e)}")

@app.post("/analysis/chisquare")
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

@app.post("/analysis/correlation")
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

@app.post("/analysis/anova")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)