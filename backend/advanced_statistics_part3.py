"""
Advanced Statistical Tests - Part 3: Correlation, Association & Regression Models
Implements comprehensive correlation analysis and advanced regression methods.
"""

import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, Any, Optional, List, Tuple, Union
import warnings
from data_store import get_connection
import statsmodels.api as sm
import statsmodels.formula.api as smf
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix

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

# 16. Kendall's Tau
def run_kendall_tau_test(dataset_id: str, col1: str, col2: str,
                        where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Kendall's tau correlation test.
    
    Args:
        dataset_id: Dataset identifier
        col1: First variable column
        col2: Second variable column  
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Kendall's tau results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[col1, col2]].dropna()
        x = pd.to_numeric(df_clean[col1], errors='coerce')
        y = pd.to_numeric(df_clean[col2], errors='coerce')
        
        # Remove any remaining NaN values
        mask = ~(np.isnan(x) | np.isnan(y))
        x = x[mask]
        y = y[mask]
        
        if len(x) < 3:
            return {"error": "Need at least 3 complete pairs for Kendall's tau"}
        
        # Perform Kendall's tau test
        tau, p_value = stats.kendalltau(x, y)
        
        # Calculate sample size
        n = len(x)
        
        # Calculate z-score for large samples
        z_score = tau * np.sqrt(9 * n * (n - 1) / (2 * (2 * n + 5))) if n > 10 else None
        
        return {
            "test_name": "Kendall's Tau Correlation",
            "variable1": col1,
            "variable2": col2,
            "n_observations": int(n),
            "tau": float(tau),
            "p_value": float(p_value),
            "z_score": float(z_score) if z_score is not None else None,
            "significant": p_value < 0.05,
            "correlation_strength": (
                "Very strong" if abs(tau) >= 0.8 else
                "Strong" if abs(tau) >= 0.6 else
                "Moderate" if abs(tau) >= 0.4 else
                "Weak" if abs(tau) >= 0.2 else
                "Very weak"
            ),
            "interpretation": f"{'Significant' if p_value < 0.05 else 'Non-significant'} correlation (τ = {tau:.3f})"
        }
        
    except Exception as e:
        return {"error": f"Kendall's tau test failed: {str(e)}"}

# 17. Point-Biserial Correlation
def run_point_biserial_correlation(dataset_id: str, binary_col: str, continuous_col: str,
                                 where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform point-biserial correlation analysis.
    
    Args:
        dataset_id: Dataset identifier
        binary_col: Binary variable column
        continuous_col: Continuous variable column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with point-biserial correlation results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[binary_col, continuous_col]].dropna()
        continuous_data = pd.to_numeric(df_clean[continuous_col], errors='coerce')
        df_clean = df_clean[~np.isnan(continuous_data)]
        continuous_data = continuous_data[~np.isnan(continuous_data)]
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        # Check if binary variable is actually binary
        binary_data = df_clean[binary_col]
        unique_vals = binary_data.unique()
        
        if len(unique_vals) != 2:
            return {"error": f"Binary variable must have exactly 2 unique values, found {len(unique_vals)}"}
        
        # Convert binary to 0/1 if needed
        le = LabelEncoder()
        binary_encoded = le.fit_transform(binary_data)
        
        # Calculate point-biserial correlation
        correlation, p_value = stats.pointbiserialr(binary_encoded, continuous_data)
        
        # Calculate group statistics
        group_stats = {}
        for val in unique_vals:
            mask = binary_data == val
            group_data = continuous_data[mask]
            group_stats[str(val)] = {
                "n": int(len(group_data)),
                "mean": float(group_data.mean()),
                "std": float(group_data.std())
            }
        
        return {
            "test_name": "Point-Biserial Correlation",
            "binary_variable": binary_col,
            "continuous_variable": continuous_col,
            "n_observations": int(len(df_clean)),
            "correlation": float(correlation),
            "p_value": float(p_value),
            "binary_categories": [str(val) for val in unique_vals],
            "group_statistics": group_stats,
            "significant": p_value < 0.05,
            "interpretation": f"{'Significant' if p_value < 0.05 else 'Non-significant'} point-biserial correlation (r = {correlation:.3f})"
        }
        
    except Exception as e:
        return {"error": f"Point-biserial correlation failed: {str(e)}"}

# 18. Phi Coefficient
def run_phi_coefficient(dataset_id: str, col1: str, col2: str,
                       where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Calculate phi coefficient for two binary variables.
    
    Args:
        dataset_id: Dataset identifier
        col1: First binary variable column
        col2: Second binary variable column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with phi coefficient results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[col1, col2]].dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        # Check if both variables are binary
        unique_vals1 = df_clean[col1].unique()
        unique_vals2 = df_clean[col2].unique()
        
        if len(unique_vals1) != 2 or len(unique_vals2) != 2:
            return {"error": "Both variables must be binary (exactly 2 unique values each)"}
        
        # Create contingency table
        contingency_table = pd.crosstab(df_clean[col1], df_clean[col2])
        
        # Calculate phi coefficient
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
        n = contingency_table.sum().sum()
        phi = np.sqrt(chi2 / n)
        
        # Determine sign of phi coefficient
        if contingency_table.shape == (2, 2):
            # For 2x2 table, phi can be negative
            a, b, c, d = contingency_table.iloc[0,0], contingency_table.iloc[0,1], contingency_table.iloc[1,0], contingency_table.iloc[1,1]
            phi_signed = (a*d - b*c) / np.sqrt((a+b)*(c+d)*(a+c)*(b+d))
            phi = phi_signed
        
        return {
            "test_name": "Phi Coefficient",
            "variable1": col1,
            "variable2": col2,
            "n_observations": int(n),
            "phi_coefficient": float(phi),
            "chi2_statistic": float(chi2),
            "p_value": float(p_value),
            "contingency_table": contingency_table.to_dict(),
            "significant": p_value < 0.05,
            "association_strength": (
                "Strong" if abs(phi) >= 0.5 else
                "Moderate" if abs(phi) >= 0.3 else
                "Weak" if abs(phi) >= 0.1 else
                "Very weak"
            ),
            "interpretation": f"{'Significant' if p_value < 0.05 else 'Non-significant'} association (φ = {phi:.3f})"
        }
        
    except Exception as e:
        return {"error": f"Phi coefficient calculation failed: {str(e)}"}

# 19. Cramér's V
def run_cramers_v(dataset_id: str, col1: str, col2: str,
                 where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Calculate Cramér's V for association between categorical variables.
    
    Args:
        dataset_id: Dataset identifier
        col1: First categorical variable column
        col2: Second categorical variable column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Cramér's V results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[col1, col2]].dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        # Create contingency table
        contingency_table = pd.crosstab(df_clean[col1], df_clean[col2])
        
        # Calculate Cramér's V
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
        n = contingency_table.sum().sum()
        r, k = contingency_table.shape
        
        # Cramér's V formula
        cramers_v = np.sqrt(chi2 / (n * (min(r, k) - 1)))
        
        # Bias-corrected Cramér's V (for small samples)
        cramers_v_corrected = max(0, cramers_v**2 - ((r-1)*(k-1))/(n-1))
        cramers_v_corrected = np.sqrt(cramers_v_corrected / min((r-1)/(r-1), (k-1)/(k-1)))
        
        return {
            "test_name": "Cramér's V",
            "variable1": col1,
            "variable2": col2,
            "n_observations": int(n),
            "contingency_table_shape": f"{r} x {k}",
            "cramers_v": float(cramers_v),
            "cramers_v_corrected": float(cramers_v_corrected),
            "chi2_statistic": float(chi2),
            "p_value": float(p_value),
            "degrees_freedom": int(dof),
            "contingency_table": contingency_table.to_dict(),
            "significant": p_value < 0.05,
            "association_strength": (
                "Very strong" if cramers_v >= 0.8 else
                "Strong" if cramers_v >= 0.6 else
                "Moderate" if cramers_v >= 0.4 else
                "Weak" if cramers_v >= 0.2 else
                "Very weak"
            ),
            "interpretation": f"{'Significant' if p_value < 0.05 else 'Non-significant'} association (V = {cramers_v:.3f})"
        }
        
    except Exception as e:
        return {"error": f"Cramér's V calculation failed: {str(e)}"}

# 20. Mantel-Haenszel Test
def run_mantel_haenszel_test(dataset_id: str, outcome_col: str, exposure_col: str, 
                           stratum_col: str, where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Mantel-Haenszel test for stratified 2x2 tables.
    
    Args:
        dataset_id: Dataset identifier
        outcome_col: Binary outcome variable column
        exposure_col: Binary exposure variable column
        stratum_col: Stratification variable column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Mantel-Haenszel test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[outcome_col, exposure_col, stratum_col]].dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        # Check if outcome and exposure are binary
        if df_clean[outcome_col].nunique() != 2 or df_clean[exposure_col].nunique() != 2:
            return {"error": "Outcome and exposure variables must be binary"}
        
        # Encode binary variables
        le_outcome = LabelEncoder()
        le_exposure = LabelEncoder()
        
        outcome_encoded = le_outcome.fit_transform(df_clean[outcome_col])
        exposure_encoded = le_exposure.fit_transform(df_clean[exposure_col])
        
        # Calculate Mantel-Haenszel statistics
        strata = df_clean[stratum_col].unique()
        
        # Initialize accumulators
        numerator_mh = 0
        denominator_mh = 0
        var_ln_or = 0
        
        stratum_results = {}
        
        for stratum in strata:
            mask = df_clean[stratum_col] == stratum
            stratum_outcome = outcome_encoded[mask]
            stratum_exposure = exposure_encoded[mask]
            
            if len(stratum_outcome) < 4:  # Need at least 4 observations per stratum
                continue
                
            # Create 2x2 table for this stratum
            table = pd.crosstab(stratum_exposure, stratum_outcome)
            
            if table.shape != (2, 2):
                continue
                
            a, b = table.iloc[1, 1], table.iloc[1, 0]  # exposed cases, exposed controls
            c, d = table.iloc[0, 1], table.iloc[0, 0]  # unexposed cases, unexposed controls
            n = a + b + c + d
            
            if n == 0 or (a + c) == 0 or (b + d) == 0 or (a + b) == 0 or (c + d) == 0:
                continue
                
            # Mantel-Haenszel calculations
            expected_a = (a + b) * (a + c) / n
            var_a = (a + b) * (c + d) * (a + c) * (b + d) / (n**2 * (n - 1))
            
            numerator_mh += a - expected_a
            denominator_mh += var_a
            
            # For odds ratio calculation
            if a > 0 and d > 0:
                var_ln_or += 1/a + 1/b + 1/c + 1/d
            
            stratum_results[str(stratum)] = {
                "a": int(a), "b": int(b), "c": int(c), "d": int(d),
                "odds_ratio": float((a * d) / (b * c)) if b > 0 and c > 0 else None,
                "n": int(n)
            }
        
        if denominator_mh == 0:
            return {"error": "Cannot calculate Mantel-Haenszel test - insufficient valid strata"}
        
        # Mantel-Haenszel chi-square statistic
        mh_chi2 = (numerator_mh**2) / denominator_mh
        p_value = 1 - stats.chi2.cdf(mh_chi2, 1)
        
        return {
            "test_name": "Mantel-Haenszel Test",
            "outcome_variable": outcome_col,
            "exposure_variable": exposure_col,
            "stratification_variable": stratum_col,
            "n_strata": len(stratum_results),
            "mh_chi2_statistic": float(mh_chi2),
            "p_value": float(p_value),
            "significant": p_value < 0.05,
            "stratum_results": stratum_results,
            "interpretation": f"{'Significant' if p_value < 0.05 else 'Non-significant'} association after controlling for {stratum_col}"
        }
        
    except Exception as e:
        return {"error": f"Mantel-Haenszel test failed: {str(e)}"}

# 21. Cochran's Q Test
def run_cochran_q_test(dataset_id: str, columns: List[str], subject_col: Optional[str] = None,
                      where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Cochran's Q test for multiple related binary variables.
    
    Args:
        dataset_id: Dataset identifier
        columns: List of binary variable columns to compare
        subject_col: Optional subject identifier column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Cochran's Q test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Select columns
        if subject_col:
            all_cols = [subject_col] + columns
        else:
            all_cols = columns
            
        df_clean = df[all_cols].dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        if len(columns) < 3:
            return {"error": "Cochran's Q test requires at least 3 binary variables"}
        
        # Extract binary data
        binary_data = df_clean[columns]
        
        # Check if all variables are binary
        for col in columns:
            if binary_data[col].nunique() != 2:
                return {"error": f"Variable {col} is not binary"}
        
        # Convert to 0/1 if needed
        for col in columns:
            le = LabelEncoder()
            binary_data[col] = le.fit_transform(binary_data[col])
        
        # Calculate Cochran's Q statistic
        k = len(columns)  # number of treatments
        n = len(binary_data)  # number of subjects
        
        # Row sums (subject totals)
        R_i = binary_data.sum(axis=1)
        
        # Column sums (treatment totals)  
        C_j = binary_data.sum(axis=0)
        
        # Calculate Q statistic
        sum_C_j_squared = (C_j**2).sum()
        sum_R_i_squared = (R_i**2).sum()
        grand_total = binary_data.values.sum()
        
        Q = (k - 1) * (k * sum_C_j_squared - grand_total**2) / (k * grand_total - sum_R_i_squared)
        
        # Degrees of freedom
        df_val = k - 1
        
        # P-value
        p_value = 1 - stats.chi2.cdf(Q, df_val)
        
        # Treatment proportions
        treatment_stats = {}
        for col in columns:
            treatment_stats[col] = {
                "n_positive": int(C_j[col]),
                "proportion": float(C_j[col] / n),
                "n_total": int(n)
            }
        
        return {
            "test_name": "Cochran's Q Test",
            "variables": columns,
            "n_subjects": int(n),
            "n_treatments": int(k),
            "q_statistic": float(Q),
            "p_value": float(p_value),
            "degrees_freedom": int(df_val),
            "treatment_statistics": treatment_stats,
            "significant": p_value < 0.05,
            "interpretation": f"{'Significant' if p_value < 0.05 else 'Non-significant'} differences among treatments"
        }
        
    except Exception as e:
        return {"error": f"Cochran's Q test failed: {str(e)}"}

# 22. Multinomial Logistic Regression
def run_multinomial_logistic_regression(dataset_id: str, outcome_col: str, predictor_cols: List[str],
                                      where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform multinomial logistic regression.
    
    Args:
        dataset_id: Dataset identifier
        outcome_col: Multinomial outcome variable column
        predictor_cols: List of predictor variable columns
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with multinomial logistic regression results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        all_cols = [outcome_col] + predictor_cols
        df_clean = df[all_cols].dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        if len(df_clean) < 20:
            return {"error": "Need at least 20 observations for multinomial logistic regression"}
        
        # Check outcome variable
        unique_outcomes = df_clean[outcome_col].nunique()
        if unique_outcomes < 3:
            return {"error": "Multinomial regression requires outcome variable with 3+ categories"}
        
        # Prepare predictors
        X = df_clean[predictor_cols]
        
        # Convert categorical predictors to dummy variables
        X_processed = pd.get_dummies(X, drop_first=True)
        
        # Add constant
        X_with_const = sm.add_constant(X_processed)
        
        # Fit multinomial logit model
        model = sm.MNLogit(df_clean[outcome_col], X_with_const).fit(disp=0)
        
        # Extract results
        results = {
            "test_name": "Multinomial Logistic Regression",
            "outcome_variable": outcome_col,
            "predictor_variables": predictor_cols,
            "n_observations": int(len(df_clean)),
            "n_categories": int(unique_outcomes),
            "log_likelihood": float(model.llf),
            "aic": float(model.aic),
            "bic": float(model.bic),
            "pseudo_r_squared": float(model.prsquared),
            "coefficients": model.params.to_dict(),
            "p_values": model.pvalues.to_dict(),
            "confidence_intervals": model.conf_int().to_dict(),
            "significant_predictors": [var for var, p in model.pvalues.items() if p < 0.05],
            "outcome_categories": df_clean[outcome_col].unique().tolist()
        }
        
        return results
        
    except Exception as e:
        return {"error": f"Multinomial logistic regression failed: {str(e)}"}