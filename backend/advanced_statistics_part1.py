"""
Advanced Statistical Tests - Part 1: Normality & Distribution Tests
Implements comprehensive normality testing and distribution shape analysis.
"""

import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, Any, Optional, List, Tuple, Union
import warnings
from data_store import get_connection

warnings.filterwarnings('ignore', category=FutureWarning)

# Helper function to get dataset from DuckDB
def get_dataset_df(dataset_id: str, where_sql: Optional[str] = None) -> pd.DataFrame:
    """Get dataset as pandas DataFrame from DuckDB view."""
    try:
        view_name = f"v_{dataset_id.replace('-', '_')}"
        base_query = f"SELECT * FROM {view_name}"
        
        if where_sql:
            query = f"{base_query} WHERE {where_sql}"
        else:
            query = base_query
            
        conn = get_connection()
        try:
            return conn.execute(query).fetchdf()
        finally:
            conn.close()
            
    except Exception as e:
        raise Exception(f"Failed to retrieve dataset: {str(e)}")

# 1. Shapiro-Wilk Test
def run_shapiro_wilk_test(dataset_id: str, column: str, where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Shapiro-Wilk test for normality.
    
    Args:
        dataset_id: Dataset identifier
        column: Column to test for normality
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Shapiro-Wilk test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get numeric data
        data = pd.to_numeric(df[column], errors='coerce').dropna()
        
        if len(data) < 3:
            return {"error": "Need at least 3 observations for Shapiro-Wilk test"}
        
        if len(data) > 5000:
            return {"error": "Shapiro-Wilk test is recommended for samples < 5000"}
        
        # Perform Shapiro-Wilk test
        statistic, p_value = stats.shapiro(data)
        
        # Additional descriptive statistics
        mean_val = float(data.mean())
        std_val = float(data.std())
        skewness = float(stats.skew(data))
        kurtosis = float(stats.kurtosis(data))
        
        return {
            "test_name": "Shapiro-Wilk Test for Normality",
            "n_observations": int(len(data)),
            "w_statistic": float(statistic),
            "p_value": float(p_value),
            "is_normal": p_value > 0.05,
            "mean": mean_val,
            "std_deviation": std_val,
            "skewness": skewness,
            "kurtosis": kurtosis,
            "interpretation": "Data appears normally distributed" if p_value > 0.05 else "Data deviates from normality"
        }
        
    except Exception as e:
        return {"error": f"Shapiro-Wilk test failed: {str(e)}"}

# 2. Kolmogorov-Smirnov Test (one-sample)
def run_kolmogorov_smirnov_test(dataset_id: str, column: str, distribution: str = 'norm',
                               where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform one-sample Kolmogorov-Smirnov test.
    
    Args:
        dataset_id: Dataset identifier
        column: Column to test
        distribution: Distribution to test against ('norm', 'uniform', 'expon')
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with KS test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get numeric data
        data = pd.to_numeric(df[column], errors='coerce').dropna()
        
        if len(data) < 2:
            return {"error": "Need at least 2 observations for KS test"}
        
        # Standardize data for normal distribution test
        if distribution == 'norm':
            standardized_data = (data - data.mean()) / data.std()
            statistic, p_value = stats.kstest(standardized_data, 'norm')
        elif distribution == 'uniform':
            # Scale to [0,1] for uniform test
            scaled_data = (data - data.min()) / (data.max() - data.min())
            statistic, p_value = stats.kstest(scaled_data, 'uniform')
        elif distribution == 'expon':
            # Use rate parameter
            statistic, p_value = stats.kstest(data, 'expon', args=(0, 1/data.mean()))
        else:
            return {"error": f"Unsupported distribution: {distribution}"}
        
        return {
            "test_name": f"Kolmogorov-Smirnov Test ({distribution} distribution)",
            "n_observations": int(len(data)),
            "d_statistic": float(statistic),
            "p_value": float(p_value),
            "fits_distribution": p_value > 0.05,
            "distribution_tested": distribution,
            "interpretation": f"Data fits {distribution} distribution" if p_value > 0.05 else f"Data does not fit {distribution} distribution"
        }
        
    except Exception as e:
        return {"error": f"Kolmogorov-Smirnov test failed: {str(e)}"}

# 3. Anderson-Darling Test
def run_anderson_darling_test(dataset_id: str, column: str, distribution: str = 'norm',
                             where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Anderson-Darling test for distribution fit.
    
    Args:
        dataset_id: Dataset identifier
        column: Column to test
        distribution: Distribution to test against
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Anderson-Darling test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get numeric data
        data = pd.to_numeric(df[column], errors='coerce').dropna()
        
        if len(data) < 8:
            return {"error": "Need at least 8 observations for Anderson-Darling test"}
        
        # Perform Anderson-Darling test
        result = stats.anderson(data, dist=distribution)
        
        # Determine significance at common levels
        significance_levels = [15, 10, 5, 2.5, 1]  # percentages
        critical_values = result.critical_values
        statistic = result.statistic
        
        significant_at = None
        for i, level in enumerate(significance_levels):
            if statistic > critical_values[i]:
                significant_at = level
                break
        
        return {
            "test_name": f"Anderson-Darling Test ({distribution} distribution)",
            "n_observations": int(len(data)),
            "ad_statistic": float(statistic),
            "critical_values": critical_values.tolist(),
            "significance_levels": significance_levels,
            "significant_at_percent": significant_at,
            "fits_distribution": significant_at is None,
            "distribution_tested": distribution,
            "interpretation": f"Data fits {distribution} distribution" if significant_at is None else f"Data significantly deviates from {distribution} distribution (p < {significant_at/100})"
        }
        
    except Exception as e:
        return {"error": f"Anderson-Darling test failed: {str(e)}"}

# 4. D'Agostino-Pearson Omnibus Test
def run_dagostino_pearson_test(dataset_id: str, column: str, where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform D'Agostino-Pearson omnibus test for normality.
    
    Args:
        dataset_id: Dataset identifier
        column: Column to test
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with D'Agostino-Pearson test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get numeric data
        data = pd.to_numeric(df[column], errors='coerce').dropna()
        
        if len(data) < 20:
            return {"error": "Need at least 20 observations for D'Agostino-Pearson test"}
        
        # Perform D'Agostino-Pearson test
        statistic, p_value = stats.normaltest(data)
        
        # Get individual components
        skewness_stat, skewness_p = stats.skewtest(data)
        kurtosis_stat, kurtosis_p = stats.kurtosistest(data)
        
        return {
            "test_name": "D'Agostino-Pearson Omnibus Test for Normality",
            "n_observations": int(len(data)),
            "chi2_statistic": float(statistic),
            "p_value": float(p_value),
            "is_normal": p_value > 0.05,
            "skewness_statistic": float(skewness_stat),
            "skewness_p_value": float(skewness_p),
            "kurtosis_statistic": float(kurtosis_stat),
            "kurtosis_p_value": float(kurtosis_p),
            "interpretation": "Data appears normally distributed" if p_value > 0.05 else "Data significantly deviates from normality"
        }
        
    except Exception as e:
        return {"error": f"D'Agostino-Pearson test failed: {str(e)}"}

# 5. Jarque-Bera Test
def run_jarque_bera_test(dataset_id: str, column: str, where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Jarque-Bera test for normality.
    
    Args:
        dataset_id: Dataset identifier
        column: Column to test
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Jarque-Bera test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get numeric data
        data = pd.to_numeric(df[column], errors='coerce').dropna()
        
        if len(data) < 2000:
            return {"warning": "Jarque-Bera test is most reliable with large samples (n >= 2000)"}
        
        # Perform Jarque-Bera test
        statistic, p_value = stats.jarque_bera(data)
        
        # Calculate components
        n = len(data)
        skewness = stats.skew(data)
        kurtosis = stats.kurtosis(data, fisher=True)
        
        # JB statistic components
        skew_component = (n/6) * (skewness**2)
        kurt_component = (n/24) * (kurtosis**2)
        
        return {
            "test_name": "Jarque-Bera Test for Normality",
            "n_observations": int(n),
            "jb_statistic": float(statistic),
            "p_value": float(p_value),
            "is_normal": p_value > 0.05,
            "skewness": float(skewness),
            "excess_kurtosis": float(kurtosis),
            "skewness_component": float(skew_component),
            "kurtosis_component": float(kurt_component),
            "interpretation": "Data appears normally distributed" if p_value > 0.05 else "Data significantly deviates from normality"
        }
        
    except Exception as e:
        return {"error": f"Jarque-Bera test failed: {str(e)}"}

# 6. Chi-square Goodness-of-Fit Test
def run_chi_square_gof_test(dataset_id: str, column: str, expected_probs: Optional[List[float]] = None,
                           where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform chi-square goodness-of-fit test.
    
    Args:
        dataset_id: Dataset identifier
        column: Categorical column to test
        expected_probs: Expected probabilities for each category
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with chi-square goodness-of-fit test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get frequency counts
        observed_counts = df[column].value_counts().sort_index()
        n_total = len(df[column].dropna())
        
        if len(observed_counts) < 2:
            return {"error": "Need at least 2 categories for chi-square goodness-of-fit test"}
        
        if expected_probs is None:
            # Assume equal probabilities
            expected_probs = [1/len(observed_counts)] * len(observed_counts)
        
        if len(expected_probs) != len(observed_counts):
            return {"error": "Number of expected probabilities must match number of categories"}
        
        if abs(sum(expected_probs) - 1.0) > 1e-6:
            return {"error": "Expected probabilities must sum to 1"}
        
        # Calculate expected counts
        expected_counts = [prob * n_total for prob in expected_probs]
        
        # Check minimum expected frequency requirement
        if min(expected_counts) < 5:
            return {"warning": "Some expected frequencies < 5. Results may be unreliable."}
        
        # Perform chi-square test
        statistic, p_value = stats.chisquare(observed_counts, expected_counts)
        
        # Degrees of freedom
        df_val = len(observed_counts) - 1
        
        return {
            "test_name": "Chi-square Goodness-of-Fit Test",
            "n_observations": int(n_total),
            "categories": observed_counts.index.tolist(),
            "observed_counts": observed_counts.values.tolist(),
            "expected_counts": expected_counts,
            "expected_probabilities": expected_probs,
            "chi2_statistic": float(statistic),
            "p_value": float(p_value),
            "degrees_freedom": int(df_val),
            "fits_expected": p_value > 0.05,
            "interpretation": "Data fits expected distribution" if p_value > 0.05 else "Data significantly deviates from expected distribution"
        }
        
    except Exception as e:
        return {"error": f"Chi-square goodness-of-fit test failed: {str(e)}"}

# 7. Cramer-von Mises Test
def run_cramer_von_mises_test(dataset_id: str, column: str, distribution: str = 'norm',
                             where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Cramer-von Mises test for distribution fit.
    
    Args:
        dataset_id: Dataset identifier
        column: Column to test
        distribution: Distribution to test against
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Cramer-von Mises test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get numeric data
        data = pd.to_numeric(df[column], errors='coerce').dropna()
        
        if len(data) < 8:
            return {"error": "Need at least 8 observations for Cramer-von Mises test"}
        
        # Perform Cramer-von Mises test
        result = stats.cramervonmises(data, cdf=distribution)
        
        return {
            "test_name": f"Cramer-von Mises Test ({distribution} distribution)",
            "n_observations": int(len(data)),
            "cvm_statistic": float(result.statistic),
            "p_value": float(result.pvalue),
            "fits_distribution": result.pvalue > 0.05,
            "distribution_tested": distribution,
            "interpretation": f"Data fits {distribution} distribution" if result.pvalue > 0.05 else f"Data does not fit {distribution} distribution"
        }
        
    except Exception as e:
        return {"error": f"Cramer-von Mises test failed: {str(e)}"}

# 8. Two-sample Kolmogorov-Smirnov Test
def run_ks_two_sample_test(dataset_id: str, group_col: str, value_col: str,
                          where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform two-sample Kolmogorov-Smirnov test.
    
    Args:
        dataset_id: Dataset identifier
        group_col: Column containing group labels
        value_col: Column containing values to compare
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with two-sample KS test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[group_col, value_col]].dropna()
        df_clean[value_col] = pd.to_numeric(df_clean[value_col], errors='coerce')
        df_clean = df_clean.dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        # Get unique groups
        groups = df_clean[group_col].unique()
        if len(groups) != 2:
            return {"error": "Two-sample KS test requires exactly 2 groups"}
        
        # Split data into groups
        group1_data = df_clean[df_clean[group_col] == groups[0]][value_col]
        group2_data = df_clean[df_clean[group_col] == groups[1]][value_col]
        
        if len(group1_data) == 0 or len(group2_data) == 0:
            return {"error": "One or both groups have no data"}
        
        # Perform two-sample KS test
        statistic, p_value = stats.ks_2samp(group1_data, group2_data)
        
        return {
            "test_name": "Two-sample Kolmogorov-Smirnov Test",
            "group1": str(groups[0]),
            "group2": str(groups[1]),
            "n_group1": int(len(group1_data)),
            "n_group2": int(len(group2_data)),
            "d_statistic": float(statistic),
            "p_value": float(p_value),
            "distributions_different": p_value < 0.05,
            "interpretation": "Groups have different distributions" if p_value < 0.05 else "Groups have similar distributions"
        }
        
    except Exception as e:
        return {"error": f"Two-sample KS test failed: {str(e)}"}