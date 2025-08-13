"""
Statistical analysis functions for the app.
Currently implements t-test analysis with DuckDB integration.
"""

import pandas as pd
from scipy import stats
import numpy as np
from typing import Dict, Any, Optional
from data_store import get_connection, query_dataset

def run_ttest(dataset_id: str, group_col: str, value_col: str, where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Run t-test analysis comparing two groups from DuckDB data.
    
    Args:
        dataset_id: Dataset identifier
        group_col: Column containing group labels (e.g., gender/sex)
        value_col: Column containing values to compare (e.g., BMI)
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with t-test results
    """
    try:
        # Build query to fetch data from DuckDB view
        view_name = f"v_{dataset_id.replace('-', '_')}"
        base_query = f"SELECT {group_col} AS g, {value_col} AS v FROM {view_name}"
        
        if where_sql:
            query = f"{base_query} WHERE {where_sql}"
        else:
            query = base_query
            
        # Execute query
        conn = get_connection()
        try:
            result_df = conn.execute(query).fetchdf()
        finally:
            conn.close()
            
        if result_df.empty:
            return {
                "error": "No data returned from query",
                "n_male": 0,
                "n_female": 0,
                "mean_male": None,
                "mean_female": None,
                "levene_p": None,
                "equal_var_assumed": None,
                "t_stat": None,
                "p_value": None
            }
        
        # Clean and categorize data
        df_clean = result_df.dropna()
        
        if df_clean.empty:
            return {
                "error": "No valid data after removing null values",
                "n_male": 0,
                "n_female": 0,
                "mean_male": None,
                "mean_female": None,
                "levene_p": None,
                "equal_var_assumed": None,
                "t_stat": None,
                "p_value": None
            }
        
        # Convert group column to string for comparison
        df_clean['g'] = df_clean['g'].astype(str).str.lower().str.strip()
        
        # Identify male and female groups (case-insensitive)
        male_patterns = ['male', 'm', '1']
        female_patterns = ['female', 'f', '0']
        
        # Create boolean masks
        male_mask = df_clean['g'].isin(male_patterns)
        female_mask = df_clean['g'].isin(female_patterns)
        
        # Extract groups
        male_data = df_clean[male_mask]['v'].astype(float)
        female_data = df_clean[female_mask]['v'].astype(float)
        
        # Check if we have valid groups
        if len(male_data) == 0 or len(female_data) == 0:
            # Try to identify groups by unique values
            unique_groups = df_clean['g'].unique()
            if len(unique_groups) >= 2:
                # Take the first two groups
                group1_data = df_clean[df_clean['g'] == unique_groups[0]]['v'].astype(float)
                group2_data = df_clean[df_clean['g'] == unique_groups[1]]['v'].astype(float)
                
                return {
                    "error": f"Could not identify male/female groups. Comparing '{unique_groups[0]}' vs '{unique_groups[1]}'",
                    "n_male": len(group1_data),
                    "n_female": len(group2_data),
                    "mean_male": float(group1_data.mean()) if len(group1_data) > 0 else None,
                    "mean_female": float(group2_data.mean()) if len(group2_data) > 0 else None,
                    "levene_p": None,
                    "equal_var_assumed": None,
                    "t_stat": None,
                    "p_value": None
                }
            else:
                return {
                    "error": "Could not identify male/female groups or find at least 2 groups",
                    "n_male": 0,
                    "n_female": 0,
                    "mean_male": None,
                    "mean_female": None,
                    "levene_p": None,
                    "equal_var_assumed": None,
                    "t_stat": None,
                    "p_value": None
                }
        
        # Remove any remaining NaN values
        male_data = male_data.dropna()
        female_data = female_data.dropna()
        
        if len(male_data) < 2 or len(female_data) < 2:
            return {
                "error": "Need at least 2 observations in each group for t-test",
                "n_male": len(male_data),
                "n_female": len(female_data),
                "mean_male": float(male_data.mean()) if len(male_data) > 0 else None,
                "mean_female": float(female_data.mean()) if len(female_data) > 0 else None,
                "levene_p": None,
                "equal_var_assumed": None,
                "t_stat": None,
                "p_value": None
            }
        
        # Calculate basic statistics
        n_male = len(male_data)
        n_female = len(female_data)
        mean_male = float(male_data.mean())
        mean_female = float(female_data.mean())
        
        # Perform Levene's test for equal variances
        levene_stat, levene_p = stats.levene(male_data, female_data)
        equal_var_assumed = levene_p > 0.05  # If p > 0.05, assume equal variances
        
        # Perform independent t-test
        t_stat, p_value = stats.ttest_ind(male_data, female_data, equal_var=equal_var_assumed)
        
        return {
            "n_male": int(n_male),
            "n_female": int(n_female),
            "mean_male": float(mean_male),
            "mean_female": float(mean_female),
            "levene_p": float(levene_p),
            "equal_var_assumed": bool(equal_var_assumed),
            "t_stat": float(t_stat),
            "p_value": float(p_value)
        }
        
    except Exception as e:
        return {
            "error": f"Analysis failed: {str(e)}",
            "n_male": 0,
            "n_female": 0,
            "mean_male": None,
            "mean_female": None,
            "levene_p": None,
            "equal_var_assumed": None,
            "t_stat": None,
            "p_value": None
        }

def get_dataset_summary(dataset_id: str) -> Dict[str, Any]:
    """Get basic summary statistics for a dataset."""
    try:
        view_name = f"v_{dataset_id.replace('-', '_')}"
        query = f"SELECT * FROM {view_name} LIMIT 1000"  # Sample for summary
        
        conn = get_connection()
        try:
            df = conn.execute(query).fetchdf()
        finally:
            conn.close()
            
        if df.empty:
            return {"error": "No data found"}
        
        summary = {
            "n_rows": len(df),
            "n_columns": len(df.columns),
            "columns": list(df.columns),
            "numeric_columns": list(df.select_dtypes(include=[np.number]).columns),
            "categorical_columns": list(df.select_dtypes(include=['object', 'category']).columns),
            "missing_values": df.isnull().sum().to_dict()
        }
        
        return summary
        
    except Exception as e:
        return {"error": f"Failed to generate summary: {str(e)}"}