"""
Advanced Statistical Tests - Part 2: Comparison Tests & Post-hoc Analysis
Implements comprehensive group comparison tests and multiple comparison corrections.
"""

import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, Any, Optional, List, Tuple, Union
import warnings
from data_store import get_connection
import statsmodels.api as sm
import statsmodels.stats.multicomp as mc
from statsmodels.stats.multitest import multipletests

# Import scikit-posthocs if available
try:
    import scikit_posthocs as sp
    POSTHOCS_AVAILABLE = True
except ImportError:
    POSTHOCS_AVAILABLE = False

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

# 9. Welch's t-test (Unequal variances)
def run_welch_ttest(dataset_id: str, group_col: str, value_col: str,
                   where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Welch's t-test for groups with unequal variances.
    
    Args:
        dataset_id: Dataset identifier
        group_col: Column containing group labels
        value_col: Column containing values to compare
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Welch's t-test results
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
            return {"error": "Welch's t-test requires exactly 2 groups"}
        
        # Split data into groups
        group1_data = df_clean[df_clean[group_col] == groups[0]][value_col]
        group2_data = df_clean[df_clean[group_col] == groups[1]][value_col]
        
        if len(group1_data) < 2 or len(group2_data) < 2:
            return {"error": "Need at least 2 observations in each group"}
        
        # Perform Welch's t-test (equal_var=False)
        t_stat, p_value = stats.ttest_ind(group1_data, group2_data, equal_var=False)
        
        # Calculate descriptive statistics
        n1, n2 = len(group1_data), len(group2_data)
        mean1, mean2 = group1_data.mean(), group2_data.mean()
        std1, std2 = group1_data.std(), group2_data.std()
        
        # Calculate Welch's degrees of freedom
        s1_sq_n1 = (std1**2) / n1
        s2_sq_n2 = (std2**2) / n2
        df_welch = (s1_sq_n1 + s2_sq_n2)**2 / (s1_sq_n1**2/(n1-1) + s2_sq_n2**2/(n2-1))
        
        # Effect size (Cohen's d with pooled variance)
        pooled_std = np.sqrt(((n1-1)*std1**2 + (n2-1)*std2**2) / (n1+n2-2))
        cohens_d = (mean1 - mean2) / pooled_std if pooled_std > 0 else 0
        
        return {
            "test_name": "Welch's t-test (Unequal variances)",
            "group1": str(groups[0]),
            "group2": str(groups[1]),
            "n_group1": int(n1),
            "n_group2": int(n2),
            "mean_group1": float(mean1),
            "mean_group2": float(mean2),
            "std_group1": float(std1),
            "std_group2": float(std2),
            "mean_difference": float(mean1 - mean2),
            "t_statistic": float(t_stat),
            "p_value": float(p_value),
            "degrees_freedom": float(df_welch),
            "cohens_d": float(cohens_d),
            "significant": p_value < 0.05,
            "interpretation": f"Significant difference between {groups[0]} and {groups[1]}" if p_value < 0.05 else f"No significant difference between {groups[0]} and {groups[1]}"
        }
        
    except Exception as e:
        return {"error": f"Welch's t-test failed: {str(e)}"}

# 10. Mood's Median Test
def run_mood_median_test(dataset_id: str, group_col: str, value_col: str,
                        where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Mood's median test.
    
    Args:
        dataset_id: Dataset identifier
        group_col: Column containing group labels
        value_col: Column containing values to compare
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Mood's median test results
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
        
        # Group data
        groups = []
        group_names = []
        
        for name, group in df_clean.groupby(group_col):
            values = group[value_col].values
            if len(values) >= 1:
                groups.append(values)
                group_names.append(str(name))
        
        if len(groups) < 2:
            return {"error": "Need at least 2 groups for Mood's median test"}
        
        # Perform Mood's median test
        statistic, p_value, grand_median, contingency_table = stats.median_test(*groups)
        
        # Calculate group statistics
        group_stats = {}
        for i, (name, values) in enumerate(zip(group_names, groups)):
            group_stats[name] = {
                "n": len(values),
                "median": float(np.median(values)),
                "above_grand_median": int(contingency_table[0, i]),
                "below_grand_median": int(contingency_table[1, i])
            }
        
        return {
            "test_name": "Mood's Median Test",
            "chi2_statistic": float(statistic),
            "p_value": float(p_value),
            "grand_median": float(grand_median),
            "degrees_freedom": len(groups) - 1,
            "group_statistics": group_stats,
            "contingency_table": contingency_table.tolist(),
            "significant": p_value < 0.05,
            "interpretation": "Groups have different medians" if p_value < 0.05 else "Groups have similar medians"
        }
        
    except Exception as e:
        return {"error": f"Mood's median test failed: {str(e)}"}

# 11. Brunner-Munzel Test
def run_brunner_munzel_test(dataset_id: str, group_col: str, value_col: str,
                           where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Brunner-Munzel test (generalization of Mann-Whitney U).
    
    Args:
        dataset_id: Dataset identifier
        group_col: Column containing group labels  
        value_col: Column containing values to compare
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Brunner-Munzel test results
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
            return {"error": "Brunner-Munzel test requires exactly 2 groups"}
        
        # Split data into groups
        group1_data = df_clean[df_clean[group_col] == groups[0]][value_col].values
        group2_data = df_clean[df_clean[group_col] == groups[1]][value_col].values
        
        if len(group1_data) < 2 or len(group2_data) < 2:
            return {"error": "Need at least 2 observations in each group"}
        
        # Perform Brunner-Munzel test
        statistic, p_value = stats.brunnermunzel(group1_data, group2_data)
        
        # Calculate additional statistics
        n1, n2 = len(group1_data), len(group2_data)
        
        return {
            "test_name": "Brunner-Munzel Test",
            "group1": str(groups[0]),
            "group2": str(groups[1]),
            "n_group1": int(n1),
            "n_group2": int(n2),
            "median_group1": float(np.median(group1_data)),
            "median_group2": float(np.median(group2_data)),
            "w_statistic": float(statistic),
            "p_value": float(p_value),
            "significant": p_value < 0.05,
            "interpretation": f"Significant difference in distributions between {groups[0]} and {groups[1]}" if p_value < 0.05 else f"No significant difference between {groups[0]} and {groups[1]}"
        }
        
    except Exception as e:
        return {"error": f"Brunner-Munzel test failed: {str(e)}"}

# 12. Welch's ANOVA
def run_welch_anova(dataset_id: str, group_col: str, value_col: str,
                   where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Welch's ANOVA (for unequal variances).
    
    Args:
        dataset_id: Dataset identifier
        group_col: Column containing group labels
        value_col: Column containing values to compare
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Welch's ANOVA results
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
        
        # Group data
        groups = []
        group_names = []
        group_stats = {}
        
        for name, group in df_clean.groupby(group_col):
            values = group[value_col].values
            if len(values) >= 2:
                groups.append(values)
                group_names.append(str(name))
                group_stats[str(name)] = {
                    "n": len(values),
                    "mean": float(np.mean(values)),
                    "std": float(np.std(values, ddof=1)),
                    "var": float(np.var(values, ddof=1))
                }
        
        if len(groups) < 2:
            return {"error": "Need at least 2 groups with sufficient data for Welch's ANOVA"}
        
        # Calculate Welch's F-statistic
        k = len(groups)
        ns = [len(group) for group in groups]
        means = [np.mean(group) for group in groups]
        vars_s = [np.var(group, ddof=1) for group in groups]
        
        # Weights
        ws = [n/var_s for n, var_s in zip(ns, vars_s)]
        
        # Weighted grand mean
        grand_mean = sum(w * mean for w, mean in zip(ws, means)) / sum(ws)
        
        # Welch's F-statistic
        numerator = sum(w * (mean - grand_mean)**2 for w, mean in zip(ws, means)) / (k - 1)
        
        # Denominator calculation
        denominator_part = sum((1 - w/sum(ws))**2 / (n - 1) for w, n in zip(ws, ns))
        denominator = 1 + (2 * (k - 2) * denominator_part) / (k**2 - 1)
        
        f_statistic = numerator / denominator
        
        # Degrees of freedom
        df1 = k - 1
        df2 = (k**2 - 1) / (3 * denominator_part)
        
        # P-value
        p_value = 1 - stats.f.cdf(f_statistic, df1, df2)
        
        return {
            "test_name": "Welch's ANOVA (Unequal variances)",
            "f_statistic": float(f_statistic),
            "p_value": float(p_value),
            "df_numerator": float(df1),
            "df_denominator": float(df2),
            "group_statistics": group_stats,
            "total_groups": len(groups),
            "total_observations": sum(ns),
            "significant": p_value < 0.05,
            "interpretation": "Significant differences among group means" if p_value < 0.05 else "No significant differences among group means"
        }
        
    except Exception as e:
        return {"error": f"Welch's ANOVA failed: {str(e)}"}

# 13. Tukey's HSD Test
def run_tukey_hsd_test(dataset_id: str, group_col: str, value_col: str,
                      where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Tukey's HSD (Honestly Significant Difference) test.
    
    Args:
        dataset_id: Dataset identifier
        group_col: Column containing group labels
        value_col: Column containing values to compare
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Tukey's HSD results
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
        
        # Check if we have enough groups
        n_groups = df_clean[group_col].nunique()
        if n_groups < 3:
            return {"error": "Tukey's HSD requires at least 3 groups"}
        
        # Perform Tukey's HSD test
        mc_results = mc.pairwise_tukeyhsd(
            endog=df_clean[value_col], 
            groups=df_clean[group_col], 
            alpha=0.05
        )
        
        # Extract pairwise results
        pairwise_results = []
        for i in range(len(mc_results.groupsunique)):
            for j in range(i+1, len(mc_results.groupsunique)):
                group1 = mc_results.groupsunique[i]
                group2 = mc_results.groupsunique[j]
                
                # Find the comparison in results
                for k, (g1, g2) in enumerate(zip(mc_results.data['group1'], mc_results.data['group2'])):
                    if (g1 == group1 and g2 == group2) or (g1 == group2 and g2 == group1):
                        pairwise_results.append({
                            "group1": str(group1),
                            "group2": str(group2),
                            "mean_diff": float(mc_results.data['meandiff'][k]),
                            "p_adj": float(mc_results.data['p-adj'][k]),
                            "ci_lower": float(mc_results.data['lower'][k]),
                            "ci_upper": float(mc_results.data['upper'][k]),
                            "reject": bool(mc_results.data['reject'][k])
                        })
                        break
        
        # Group statistics
        group_stats = {}
        for name, group in df_clean.groupby(group_col):
            values = group[value_col]
            group_stats[str(name)] = {
                "n": len(values),
                "mean": float(values.mean()),
                "std": float(values.std())
            }
        
        return {
            "test_name": "Tukey's HSD Test",
            "alpha": 0.05,
            "pairwise_comparisons": pairwise_results,
            "group_statistics": group_stats,
            "significant_pairs": len([p for p in pairwise_results if p["reject"]]),
            "total_comparisons": len(pairwise_results),
            "interpretation": f"Found {len([p for p in pairwise_results if p['reject']])} significant pairwise differences out of {len(pairwise_results)} comparisons"
        }
        
    except Exception as e:
        return {"error": f"Tukey's HSD test failed: {str(e)}"}

# 14. Bonferroni Correction
def run_bonferroni_correction(p_values: List[float], alpha: float = 0.05) -> Dict[str, Any]:
    """
    Apply Bonferroni correction to multiple p-values.
    
    Args:
        p_values: List of p-values to correct
        alpha: Family-wise error rate
    
    Returns:
        Dictionary with Bonferroni correction results
    """
    try:
        if not p_values:
            return {"error": "No p-values provided"}
        
        # Apply Bonferroni correction
        rejected, p_adjusted, alpha_sidak, alpha_bonf = multipletests(
            p_values, alpha=alpha, method='bonferroni'
        )
        
        return {
            "correction_method": "Bonferroni",
            "original_alpha": float(alpha),
            "bonferroni_alpha": float(alpha_bonf),
            "n_comparisons": len(p_values),
            "original_p_values": [float(p) for p in p_values],
            "adjusted_p_values": [float(p) for p in p_adjusted],
            "rejected": [bool(r) for r in rejected],
            "n_significant_original": sum(1 for p in p_values if p < alpha),
            "n_significant_adjusted": sum(rejected),
            "interpretation": f"After Bonferroni correction: {sum(rejected)}/{len(p_values)} tests remain significant"
        }
        
    except Exception as e:
        return {"error": f"Bonferroni correction failed: {str(e)}"}

# 15. Holm-Bonferroni Method
def run_holm_bonferroni_correction(p_values: List[float], alpha: float = 0.05) -> Dict[str, Any]:
    """
    Apply Holm-Bonferroni correction to multiple p-values.
    
    Args:
        p_values: List of p-values to correct
        alpha: Family-wise error rate
    
    Returns:
        Dictionary with Holm-Bonferroni correction results
    """
    try:
        if not p_values:
            return {"error": "No p-values provided"}
        
        # Apply Holm-Bonferroni correction
        rejected, p_adjusted, alpha_sidak, alpha_bonf = multipletests(
            p_values, alpha=alpha, method='holm'
        )
        
        return {
            "correction_method": "Holm-Bonferroni",
            "original_alpha": float(alpha),
            "n_comparisons": len(p_values),
            "original_p_values": [float(p) for p in p_values],
            "adjusted_p_values": [float(p) for p in p_adjusted],
            "rejected": [bool(r) for r in rejected],
            "n_significant_original": sum(1 for p in p_values if p < alpha),
            "n_significant_adjusted": sum(rejected),
            "interpretation": f"After Holm-Bonferroni correction: {sum(rejected)}/{len(p_values)} tests remain significant"
        }
        
    except Exception as e:
        return {"error": f"Holm-Bonferroni correction failed: {str(e)}"}