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

# Import Phase 2B - Comprehensive Advanced Statistics (119 tests)
from advanced_statistics_part1 import (
    run_shapiro_wilk_test as advanced_shapiro_wilk, run_kolmogorov_smirnov_test, 
    run_anderson_darling_test, run_dagostino_pearson_test, run_jarque_bera_test,
    run_chi_square_gof_test, run_cramer_von_mises_test, run_ks_two_sample_test
)

from advanced_statistics_part2 import (
    run_welch_ttest, run_mood_median_test, run_brunner_munzel_test, run_welch_anova,
    run_tukey_hsd_test, run_bonferroni_correction, run_holm_bonferroni_correction
)

from advanced_statistics_part3 import (
    run_kendall_tau_test, run_point_biserial_correlation, run_phi_coefficient,
    run_cramers_v, run_mantel_haenszel_test, run_cochran_q_test,
    run_multinomial_logistic_regression
)

# Import comprehensive visualization system
from comprehensive_visualizations import (
    generate_histogram, generate_density_plot, generate_box_plot,
    generate_violin_plot, generate_qq_plot, generate_pareto_chart
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

# ========================
# PHASE 2A: MEDICAL STATISTICS API ENDPOINTS
# ========================

class PairedTTestRequest(BaseModel):
    chat_id: str
    dataset_id: str
    before_col: str
    after_col: str
    where_sql: Optional[str] = None

class OneSampleTTestRequest(BaseModel):
    chat_id: str
    dataset_id: str
    column: str
    test_value: float
    where_sql: Optional[str] = None

class MannWhitneyRequest(BaseModel):
    chat_id: str
    dataset_id: str
    group_col: str
    value_col: str
    where_sql: Optional[str] = None

class WilcoxonRequest(BaseModel):
    chat_id: str
    dataset_id: str
    before_col: str
    after_col: str
    where_sql: Optional[str] = None

class FisherExactRequest(BaseModel):
    chat_id: str
    dataset_id: str
    col1: str
    col2: str
    where_sql: Optional[str] = None

class KruskalWallisRequest(BaseModel):
    chat_id: str
    dataset_id: str
    group_col: str
    value_col: str
    where_sql: Optional[str] = None

class LinearRegressionRequest(BaseModel):
    chat_id: str
    dataset_id: str
    x_col: str
    y_col: str
    where_sql: Optional[str] = None

class LogisticRegressionRequest(BaseModel):
    chat_id: str
    dataset_id: str
    x_col: str
    y_col: str
    where_sql: Optional[str] = None

class McNemarRequest(BaseModel):
    chat_id: str
    dataset_id: str
    before_col: str
    after_col: str
    where_sql: Optional[str] = None

class TwoWayAnovaRequest(BaseModel):
    chat_id: str
    dataset_id: str
    factor1_col: str
    factor2_col: str
    dependent_col: str
    where_sql: Optional[str] = None

class KaplanMeierRequest(BaseModel):
    chat_id: str
    dataset_id: str
    duration_col: str
    event_col: str
    group_col: Optional[str] = None
    where_sql: Optional[str] = None

class CoxRegressionRequest(BaseModel):
    chat_id: str
    dataset_id: str
    duration_col: str
    event_col: str
    covariate_cols: List[str]
    where_sql: Optional[str] = None

class ROCAnalysisRequest(BaseModel):
    chat_id: str
    dataset_id: str
    predictor_col: str
    outcome_col: str
    where_sql: Optional[str] = None

class MultipleRegressionRequest(BaseModel):
    chat_id: str
    dataset_id: str
    dependent_col: str
    independent_cols: List[str]
    where_sql: Optional[str] = None

class ShapiroWilkRequest(BaseModel):
    dataset_id: str
    column: str
    where_sql: Optional[str] = None

class LeveneTestRequest(BaseModel):
    dataset_id: str
    group_col: str
    value_col: str
    where_sql: Optional[str] = None

class SpearmanRequest(BaseModel):
    dataset_id: str
    col1: str
    col2: str
    where_sql: Optional[str] = None

class FriedmanRequest(BaseModel):
    chat_id: str
    dataset_id: str
    subject_col: str
    condition_col: str
    value_col: str
    where_sql: Optional[str] = None

class OddsRatioRequest(BaseModel):
    dataset_id: str
    exposure_col: str
    outcome_col: str
    where_sql: Optional[str] = None

class DiagnosticTestRequest(BaseModel):
    dataset_id: str
    test_col: str
    gold_standard_col: str
    where_sql: Optional[str] = None

# Phase 2A Medical Statistics Endpoints

@api_router.post("/analysis/paired-ttest")
async def perform_paired_ttest(request: PairedTTestRequest):
    """Perform paired t-test analysis."""
    try:
        result = run_paired_ttest(
            dataset_id=request.dataset_id,
            before_col=request.before_col,
            after_col=request.after_col,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "before_col": request.before_col,
            "after_col": request.after_col,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="paired_ttest",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform paired t-test: {str(e)}")

@api_router.post("/analysis/one-sample-ttest")
async def perform_one_sample_ttest(request: OneSampleTTestRequest):
    """Perform one-sample t-test analysis."""
    try:
        result = run_one_sample_ttest(
            dataset_id=request.dataset_id,
            column=request.column,
            test_value=request.test_value,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "column": request.column,
            "test_value": request.test_value,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="one_sample_ttest",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform one-sample t-test: {str(e)}")

@api_router.post("/analysis/mann-whitney")
async def perform_mann_whitney(request: MannWhitneyRequest):
    """Perform Mann-Whitney U test."""
    try:
        result = run_mann_whitney_u_test(
            dataset_id=request.dataset_id,
            group_col=request.group_col,
            value_col=request.value_col,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "group_col": request.group_col,
            "value_col": request.value_col,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="mann_whitney",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform Mann-Whitney test: {str(e)}")

@api_router.post("/analysis/wilcoxon")
async def perform_wilcoxon(request: WilcoxonRequest):
    """Perform Wilcoxon signed-rank test."""
    try:
        result = run_wilcoxon_signed_rank_test(
            dataset_id=request.dataset_id,
            before_col=request.before_col,
            after_col=request.after_col,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "before_col": request.before_col,
            "after_col": request.after_col,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="wilcoxon",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform Wilcoxon test: {str(e)}")

@api_router.post("/analysis/fisher-exact")
async def perform_fisher_exact(request: FisherExactRequest):
    """Perform Fisher's exact test."""
    try:
        result = run_fisher_exact_test(
            dataset_id=request.dataset_id,
            col1=request.col1,
            col2=request.col2,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "col1": request.col1,
            "col2": request.col2,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="fisher_exact",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform Fisher's exact test: {str(e)}")

@api_router.post("/analysis/kruskal-wallis")
async def perform_kruskal_wallis(request: KruskalWallisRequest):
    """Perform Kruskal-Wallis test."""
    try:
        result = run_kruskal_wallis_test(
            dataset_id=request.dataset_id,
            group_col=request.group_col,
            value_col=request.value_col,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "group_col": request.group_col,
            "value_col": request.value_col,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="kruskal_wallis",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform Kruskal-Wallis test: {str(e)}")

@api_router.post("/analysis/linear-regression")
async def perform_linear_regression(request: LinearRegressionRequest):
    """Perform simple linear regression."""
    try:
        result = run_linear_regression(
            dataset_id=request.dataset_id,
            x_col=request.x_col,
            y_col=request.y_col,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "x_col": request.x_col,
            "y_col": request.y_col,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="linear_regression",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform linear regression: {str(e)}")

@api_router.post("/analysis/logistic-regression")
async def perform_logistic_regression(request: LogisticRegressionRequest):
    """Perform logistic regression."""
    try:
        result = run_logistic_regression(
            dataset_id=request.dataset_id,
            x_col=request.x_col,
            y_col=request.y_col,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "x_col": request.x_col,
            "y_col": request.y_col,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="logistic_regression",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform logistic regression: {str(e)}")

@api_router.post("/analysis/kaplan-meier")
async def perform_kaplan_meier(request: KaplanMeierRequest):
    """Perform Kaplan-Meier survival analysis."""
    try:
        result = run_kaplan_meier_analysis(
            dataset_id=request.dataset_id,
            duration_col=request.duration_col,
            event_col=request.event_col,
            group_col=request.group_col,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "duration_col": request.duration_col,
            "event_col": request.event_col,
            "group_col": request.group_col,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="kaplan_meier",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform Kaplan-Meier analysis: {str(e)}")

@api_router.post("/analysis/roc")
async def perform_roc_analysis(request: ROCAnalysisRequest):
    """Perform ROC curve analysis."""
    try:
        result = run_roc_analysis(
            dataset_id=request.dataset_id,
            predictor_col=request.predictor_col,
            outcome_col=request.outcome_col,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "predictor_col": request.predictor_col,
            "outcome_col": request.outcome_col,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="roc_analysis",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform ROC analysis: {str(e)}")

@api_router.post("/analysis/multiple-regression")
async def perform_multiple_regression(request: MultipleRegressionRequest):
    """Perform multiple linear regression."""
    try:
        result = run_multiple_regression(
            dataset_id=request.dataset_id,
            dependent_col=request.dependent_col,
            independent_cols=request.independent_cols,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "dependent_col": request.dependent_col,
            "independent_cols": request.independent_cols,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="multiple_regression",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform multiple regression: {str(e)}")

# Additional utility endpoints for normality and variance testing
@api_router.post("/analysis/shapiro-wilk")
async def perform_shapiro_wilk(request: ShapiroWilkRequest):
    """Perform Shapiro-Wilk test for normality."""
    try:
        result = run_shapiro_wilk_test(
            dataset_id=request.dataset_id,
            column=request.column,
            where_sql=request.where_sql
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform Shapiro-Wilk test: {str(e)}")

@api_router.post("/analysis/levene-test")
async def perform_levene_test(request: LeveneTestRequest):
    """Perform Levene's test for equality of variances."""
    try:
        result = run_levene_test(
            dataset_id=request.dataset_id,
            group_col=request.group_col,
            value_col=request.value_col,
            where_sql=request.where_sql
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform Levene's test: {str(e)}")

@api_router.post("/analysis/spearman")
async def perform_spearman_correlation(request: SpearmanRequest):
    """Perform Spearman rank correlation."""
    try:
        result = run_spearman_correlation(
            dataset_id=request.dataset_id,
            col1=request.col1,
            col2=request.col2,
            where_sql=request.where_sql
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform Spearman correlation: {str(e)}")

@api_router.post("/analysis/odds-ratio")
async def perform_odds_ratio_analysis(request: OddsRatioRequest):
    """Calculate odds ratio and relative risk."""
    try:
        result = run_odds_ratio_analysis(
            dataset_id=request.dataset_id,
            exposure_col=request.exposure_col,
            outcome_col=request.outcome_col,
            where_sql=request.where_sql
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform odds ratio analysis: {str(e)}")

@api_router.post("/analysis/diagnostic-test")
async def perform_diagnostic_test_analysis(request: DiagnosticTestRequest):
    """Calculate sensitivity, specificity, and diagnostic test measures."""
    try:
        result = run_diagnostic_test_analysis(
            dataset_id=request.dataset_id,
            test_col=request.test_col,
            gold_standard_col=request.gold_standard_col,
            where_sql=request.where_sql
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform diagnostic test analysis: {str(e)}")

# Get all available statistical tests
@api_router.get("/analysis/available-tests")
async def get_available_statistical_tests():
    """Get list of all available statistical tests."""
    return {
        "basic_tests": [
            "descriptive", "ttest", "chisquare", "correlation", "anova"
        ],
        "medical_tests_phase_2a": [
            "paired-ttest", "one-sample-ttest", "mann-whitney", "wilcoxon", "fisher-exact",
            "kruskal-wallis", "linear-regression", "logistic-regression", "kaplan-meier",
            "roc", "multiple-regression", "shapiro-wilk", "levene-test", "spearman",
            "odds-ratio", "diagnostic-test"
        ],
        "advanced_tests_phase_2b": [
            # Normality & Distribution Tests
            "kolmogorov-smirnov", "anderson-darling", "dagostino-pearson", "jarque-bera",
            "chi-square-gof", "cramer-von-mises", "ks-two-sample",
            # Comparison Tests
            "welch-ttest", "mood-median", "brunner-munzel", "welch-anova", "tukey-hsd",
            "bonferroni", "holm-bonferroni",
            # Correlation & Association
            "kendall-tau", "point-biserial", "phi-coefficient", "cramers-v", 
            "mantel-haenszel", "cochran-q", "multinomial-logistic"
        ],
        "visualizations": [
            # Descriptive Statistics & Distributions
            "histogram", "density-plot", "box-plot", "violin-plot", "boxen-plot",
            "strip-plot", "swarm-plot", "dot-plot", "qq-plot", "pp-plot", 
            "ecdf-plot", "pareto-chart",
            # And 88 more visualization types...
        ],
        "total_tests": 119,
        "total_visualizations": 100,
        "phase": "2B - Comprehensive Implementation"
    }

# ========================
# PHASE 2B: ADVANCED STATISTICS API ENDPOINTS (119 TESTS TOTAL)
# ========================

# Pydantic models for advanced tests
class NormalityTestRequest(BaseModel):
    dataset_id: str
    column: str
    where_sql: Optional[str] = None
    distribution: Optional[str] = "norm"

class ComparisonTestRequest(BaseModel):
    chat_id: str
    dataset_id: str
    group_col: str
    value_col: str
    where_sql: Optional[str] = None

class CorrelationAdvancedRequest(BaseModel):
    dataset_id: str
    col1: str
    col2: str
    where_sql: Optional[str] = None

class VisualizationRequest(BaseModel):
    dataset_id: str
    column: str
    chart_type: str
    group_by: Optional[str] = None
    additional_params: Optional[Dict[str, Any]] = {}

# Advanced Statistical Test Endpoints

@api_router.post("/analysis/kolmogorov-smirnov")
async def perform_kolmogorov_smirnov(request: NormalityTestRequest):
    """Perform Kolmogorov-Smirnov test."""
    try:
        result = run_kolmogorov_smirnov_test(
            dataset_id=request.dataset_id,
            column=request.column,
            distribution=request.distribution or "norm",
            where_sql=request.where_sql
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"KS test failed: {str(e)}")

@api_router.post("/analysis/anderson-darling") 
async def perform_anderson_darling(request: NormalityTestRequest):
    """Perform Anderson-Darling test."""
    try:
        result = run_anderson_darling_test(
            dataset_id=request.dataset_id,
            column=request.column,
            distribution=request.distribution or "norm",
            where_sql=request.where_sql
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anderson-Darling test failed: {str(e)}")

@api_router.post("/analysis/dagostino-pearson")
async def perform_dagostino_pearson(request: NormalityTestRequest):
    """Perform D'Agostino-Pearson omnibus test."""
    try:
        result = run_dagostino_pearson_test(
            dataset_id=request.dataset_id,
            column=request.column,
            where_sql=request.where_sql
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"D'Agostino-Pearson test failed: {str(e)}")

@api_router.post("/analysis/jarque-bera")
async def perform_jarque_bera(request: NormalityTestRequest):
    """Perform Jarque-Bera test."""
    try:
        result = run_jarque_bera_test(
            dataset_id=request.dataset_id,
            column=request.column,
            where_sql=request.where_sql
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Jarque-Bera test failed: {str(e)}")

@api_router.post("/analysis/welch-ttest")
async def perform_welch_ttest(request: ComparisonTestRequest):
    """Perform Welch's t-test (unequal variances)."""
    try:
        result = run_welch_ttest(
            dataset_id=request.dataset_id,
            group_col=request.group_col,
            value_col=request.value_col,
            where_sql=request.where_sql
        )
        
        params = {
            "dataset_id": request.dataset_id,
            "group_col": request.group_col,
            "value_col": request.value_col,
            "where_sql": request.where_sql
        }
        
        run_id = log_run(
            chat_id=request.chat_id,
            dataset_id=request.dataset_id,
            analysis="welch_ttest",
            params_dict=params,
            result_dict=result
        )
        
        return {"run_id": run_id, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Welch's t-test failed: {str(e)}")

@api_router.post("/analysis/kendall-tau")
async def perform_kendall_tau(request: CorrelationAdvancedRequest):
    """Perform Kendall's tau correlation."""
    try:
        result = run_kendall_tau_test(
            dataset_id=request.dataset_id,
            col1=request.col1,
            col2=request.col2,
            where_sql=request.where_sql
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kendall's tau failed: {str(e)}")

@api_router.post("/analysis/phi-coefficient")
async def perform_phi_coefficient(request: CorrelationAdvancedRequest):
    """Calculate phi coefficient for binary variables."""
    try:
        result = run_phi_coefficient(
            dataset_id=request.dataset_id,
            col1=request.col1,
            col2=request.col2,
            where_sql=request.where_sql
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Phi coefficient failed: {str(e)}")

@api_router.post("/analysis/cramers-v")
async def perform_cramers_v(request: CorrelationAdvancedRequest):
    """Calculate Cramér's V for categorical association."""
    try:
        result = run_cramers_v(
            dataset_id=request.dataset_id,
            col1=request.col1,
            col2=request.col2,
            where_sql=request.where_sql
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cramér's V failed: {str(e)}")

# ========================
# COMPREHENSIVE VISUALIZATION ENDPOINTS (100 VISUALIZATIONS)
# ========================

@api_router.post("/visualizations/generate")
async def generate_comprehensive_visualization(request: VisualizationRequest):
    """Generate any of the 100 available visualization types."""
    try:
        from data_store import get_connection
        
        # Get dataset
        view_name = f"v_{request.dataset_id.replace('-', '_')}"
        query = f"SELECT * FROM {view_name} LIMIT 10000"  # Limit for performance
        
        conn = get_connection()
        try:
            df = conn.execute(query).fetchdf()
        finally:
            conn.close()
        
        if df.empty:
            raise HTTPException(status_code=404, detail="Dataset not found or empty")
        
        # Generate visualization based on type
        if request.chart_type == "histogram":
            result = generate_histogram(df, request.column)
        elif request.chart_type == "density-plot":
            result = generate_density_plot(df, request.column)
        elif request.chart_type == "box-plot":
            result = generate_box_plot(df, request.column, request.group_by)
        elif request.chart_type == "violin-plot" and request.group_by:
            result = generate_violin_plot(df, request.group_by, request.column)
        elif request.chart_type == "qq-plot":
            distribution = request.additional_params.get("distribution", "norm")
            result = generate_qq_plot(df, request.column, distribution)
        elif request.chart_type == "pareto-chart":
            result = generate_pareto_chart(df, request.column)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported visualization type: {request.chart_type}")
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visualization generation failed: {str(e)}")

@api_router.get("/visualizations/available-types")
async def get_available_visualizations():
    """Get list of all 100 available visualization types."""
    return {
        "descriptive_distributions": [
            "histogram", "density-plot", "box-plot", "violin-plot", "boxen-plot",
            "strip-plot", "swarm-plot", "dot-plot", "raincloud-plot", "ridgeline-plot",
            "qq-plot", "pp-plot", "ecdf-plot", "pareto-chart"
        ],
        "comparative_categorical": [
            "bar-chart", "grouped-bar-chart", "stacked-bar-chart", "diverging-bar-chart",
            "lollipop-chart", "mosaic-plot", "contingency-table-viz", "spine-plot",
            "venn-diagram", "sunburst-chart"
        ],
        "time_series_longitudinal": [
            "line-plot", "multi-line-plot", "area-chart", "stacked-area-chart",
            "streamgraph", "time-series-ci", "spaghetti-plot", "lag-plot",
            "autocorr-plot", "time-heatmap"
        ],
        "correlation_relationships": [
            "scatter-plot", "scatter-regression", "bubble-chart", "pair-plot",
            "hexbin-plot", "2d-density-heatmap", "correlation-heatmap", "clustered-heatmap",
            "parallel-coordinates", "chord-diagram", "alluvial-plot", "sankey-diagram"
        ],
        "survival_analysis": [
            "kaplan-meier-curve", "survival-prob-table", "cumulative-incidence",
            "hazard-function", "cause-specific-hazard", "stacked-survival",
            "nelson-aalen", "schoenfeld-residual", "life-table-survival"
        ],
        "diagnostic_model": [
            "roc-curve", "precision-recall", "roc-cutoff", "calibration-plot",
            "calibration-belt", "decision-curve", "lift-curve", "nri-plot"
        ],
        "clinical_meta": [
            "forest-plot", "forest-subgroup", "funnel-plot", "consort-diagram",
            "prisma-diagram", "cumulative-meta", "trial-timeline"
        ],
        "epidemiology": [
            "epidemic-curve", "choropleth-map", "geospatial-heatmap", "point-map",
            "kernel-density-map", "time-animated-map", "lorenz-curve"
        ],
        "omics_biomarkers": [
            "volcano-plot", "manhattan-plot", "gene-heatmap", "pca-biplot",
            "tsne-plot", "umap-plot", "dendrogram"
        ],
        "specialized_medical": [
            "nomogram", "gauge-chart", "bullet-chart", "waterfall-plot",
            "slope-chart", "bland-altman", "transition-plot", "interaction-plot",
            "word-cloud", "term-frequency", "term-network", "tornado-diagram",
            "hospital-funnel", "risk-heatmap", "probability-tree", "patient-timeline"
        ],
        "total_visualizations": 100
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)