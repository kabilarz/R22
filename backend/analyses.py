"""
Statistical analysis functions for the app.
Implements comprehensive statistical analyses with DuckDB integration.
"""

import pandas as pd
from scipy import stats
import numpy as np
from typing import Dict, Any, Optional, List
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

def run_descriptive_stats(dataset_id: str, columns: Optional[List[str]] = None) -> Dict[str, Any]:
    """Generate descriptive statistics for specified columns or all numeric columns."""
    try:
        view_name = f"v_{dataset_id.replace('-', '_')}"
        
        if columns:
            col_list = ", ".join(columns)
            query = f"SELECT {col_list} FROM {view_name}"
        else:
            query = f"SELECT * FROM {view_name}"
        
        conn = get_connection()
        try:
            df = conn.execute(query).fetchdf()
        finally:
            conn.close()
            
        if df.empty:
            return {"error": "No data found"}
        
        # Get numeric columns only
        numeric_df = df.select_dtypes(include=[np.number])
        
        if numeric_df.empty:
            return {"error": "No numeric columns found"}
        
        # Calculate descriptive statistics
        desc_stats = numeric_df.describe()
        
        # Additional statistics
        stats_dict = {}
        for col in numeric_df.columns:
            col_data = numeric_df[col].dropna()
            if len(col_data) > 0:
                stats_dict[col] = {
                    "count": int(desc_stats.loc['count', col]),
                    "mean": float(desc_stats.loc['mean', col]),
                    "std": float(desc_stats.loc['std', col]),
                    "min": float(desc_stats.loc['min', col]),
                    "q25": float(desc_stats.loc['25%', col]),
                    "median": float(desc_stats.loc['50%', col]),
                    "q75": float(desc_stats.loc['75%', col]),
                    "max": float(desc_stats.loc['max', col]),
                    "skewness": float(stats.skew(col_data)),
                    "kurtosis": float(stats.kurtosis(col_data)),
                    "missing_count": int(df[col].isnull().sum()),
                    "missing_percent": float(df[col].isnull().sum() / len(df) * 100)
                }
        
        return {
            "statistics": stats_dict,
            "total_rows": len(df),
            "numeric_columns": len(numeric_df.columns)
        }
        
    except Exception as e:
        return {"error": f"Failed to generate descriptive statistics: {str(e)}"}

def run_chi_square_test(dataset_id: str, col1: str, col2: str, where_sql: Optional[str] = None) -> Dict[str, Any]:
    """Run chi-square test of independence between two categorical variables."""
    try:
        view_name = f"v_{dataset_id.replace('-', '_')}"
        base_query = f"SELECT {col1}, {col2} FROM {view_name}"
        
        if where_sql:
            query = f"{base_query} WHERE {where_sql}"
        else:
            query = base_query
            
        conn = get_connection()
        try:
            df = conn.execute(query).fetchdf()
        finally:
            conn.close()
            
        if df.empty:
            return {"error": "No data returned from query"}
        
        # Create contingency table
        contingency_table = pd.crosstab(df[col1], df[col2])
        
        if contingency_table.empty or contingency_table.shape[0] < 2 or contingency_table.shape[1] < 2:
            return {"error": "Insufficient data for chi-square test"}
        
        # Perform chi-square test
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
        
        # Calculate effect size (Cramér's V)
        n = contingency_table.sum().sum()
        cramers_v = np.sqrt(chi2 / (n * (min(contingency_table.shape) - 1)))
        
        return {
            "chi2_statistic": float(chi2),
            "p_value": float(p_value),
            "degrees_of_freedom": int(dof),
            "cramers_v": float(cramers_v),
            "contingency_table": contingency_table.to_dict(),
            "expected_frequencies": expected.tolist(),
            "sample_size": int(n)
        }
        
    except Exception as e:
        return {"error": f"Chi-square test failed: {str(e)}"}

def run_correlation_analysis(dataset_id: str, columns: Optional[List[str]] = None, method: str = 'pearson') -> Dict[str, Any]:
    """Calculate correlation matrix for numeric variables."""
    try:
        view_name = f"v_{dataset_id.replace('-', '_')}"
        
        if columns:
            col_list = ", ".join(columns)
            query = f"SELECT {col_list} FROM {view_name}"
        else:
            query = f"SELECT * FROM {view_name}"
        
        conn = get_connection()
        try:
            df = conn.execute(query).fetchdf()
        finally:
            conn.close()
            
        if df.empty:
            return {"error": "No data found"}
        
        # Get numeric columns only
        numeric_df = df.select_dtypes(include=[np.number])
        
        if numeric_df.empty or len(numeric_df.columns) < 2:
            return {"error": "Need at least 2 numeric columns for correlation analysis"}
        
        # Calculate correlation matrix
        if method == 'pearson':
            corr_matrix = numeric_df.corr(method='pearson')
        elif method == 'spearman':
            corr_matrix = numeric_df.corr(method='spearman')
        else:
            return {"error": f"Unsupported correlation method: {method}"}
        
        # Find significant correlations (excluding diagonal)
        significant_pairs = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                col1 = corr_matrix.columns[i]
                col2 = corr_matrix.columns[j]
                corr_value = corr_matrix.iloc[i, j]
                
                if not np.isnan(corr_value) and abs(corr_value) > 0.3:  # Threshold for "significant"
                    significant_pairs.append({
                        "variable1": col1,
                        "variable2": col2,
                        "correlation": float(corr_value),
                        "strength": "strong" if abs(corr_value) > 0.7 else "moderate" if abs(corr_value) > 0.5 else "weak"
                    })
        
        return {
            "correlation_matrix": corr_matrix.to_dict(),
            "method": method,
            "significant_correlations": significant_pairs,
            "variables_analyzed": list(numeric_df.columns)
        }
        
    except Exception as e:
        return {"error": f"Correlation analysis failed: {str(e)}"}

def run_anova(dataset_id: str, group_col: str, value_col: str, where_sql: Optional[str] = None) -> Dict[str, Any]:
    """Run one-way ANOVA to compare means across multiple groups."""
    try:
        view_name = f"v_{dataset_id.replace('-', '_')}"
        base_query = f"SELECT {group_col} AS g, {value_col} AS v FROM {view_name}"
        
        if where_sql:
            query = f"{base_query} WHERE {where_sql}"
        else:
            query = base_query
            
        conn = get_connection()
        try:
            df = conn.execute(query).fetchdf()
        finally:
            conn.close()
            
        if df.empty:
            return {"error": "No data returned from query"}
        
        # Clean data
        df_clean = df.dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after removing null values"}
        
        # Group data
        groups = []
        group_names = []
        group_stats = {}
        
        for name, group in df_clean.groupby('g'):
            values = group['v'].astype(float).dropna()
            if len(values) >= 2:  # Need at least 2 observations per group
                groups.append(values)
                group_names.append(str(name))
                group_stats[str(name)] = {
                    "n": len(values),
                    "mean": float(values.mean()),
                    "std": float(values.std()),
                    "min": float(values.min()),
                    "max": float(values.max())
                }
        
        if len(groups) < 2:
            return {"error": "Need at least 2 groups with sufficient data for ANOVA"}
        
        # Perform one-way ANOVA
        f_stat, p_value = stats.f_oneway(*groups)
        
        # Calculate effect size (eta-squared)
        total_mean = np.concatenate(groups).mean()
        ss_between = sum(len(g) * (g.mean() - total_mean)**2 for g in groups)
        ss_total = sum((np.concatenate(groups) - total_mean)**2)
        eta_squared = ss_between / ss_total if ss_total > 0 else 0
        
        return {
            "f_statistic": float(f_stat),
            "p_value": float(p_value),
            "eta_squared": float(eta_squared),
            "group_statistics": group_stats,
            "total_groups": len(groups),
            "total_observations": sum(len(g) for g in groups)
        }
        
    except Exception as e:
        return {"error": f"ANOVA failed: {str(e)}"}