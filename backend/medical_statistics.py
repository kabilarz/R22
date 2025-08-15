"""
Enhanced Medical Statistics Module - Phase 2A
Implements 20 core statistical tests commonly used in medical research.

This module extends the basic analyses.py with comprehensive medical statistics
including parametric/non-parametric tests, regression analysis, and survival analysis.
"""

import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, Any, Optional, List, Tuple, Union
import warnings
from data_store import get_connection

# Advanced statistics libraries
import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.stats.contingency_tables import mcnemar
from statsmodels.stats.proportion import proportions_ztest, proportions_chisquare
from statsmodels.stats.diagnostic import het_white
from statsmodels.stats.outliers_influence import variance_inflation_factor
import pingouin as pg
from lifelines import KaplanMeierFitter, CoxPHFitter
from lifelines.statistics import logrank_test
from sklearn.metrics import roc_curve, auc, confusion_matrix, classification_report
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import cross_val_score

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

# 1. Paired t-test
def run_paired_ttest(dataset_id: str, before_col: str, after_col: str, 
                    where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform paired t-test (e.g., pre- and post-treatment measurements).
    
    Args:
        dataset_id: Dataset identifier
        before_col: Column with before measurements
        after_col: Column with after measurements
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with paired t-test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get paired data
        before_data = pd.to_numeric(df[before_col], errors='coerce').dropna()
        after_data = pd.to_numeric(df[after_col], errors='coerce').dropna()
        
        # Align the data (only keep pairs where both values exist)
        paired_df = df[[before_col, after_col]].dropna()
        if len(paired_df) < 3:
            return {"error": "Insufficient paired data (need at least 3 complete pairs)"}
        
        before_paired = pd.to_numeric(paired_df[before_col])
        after_paired = pd.to_numeric(paired_df[after_col])
        
        # Calculate differences
        differences = after_paired - before_paired
        
        # Perform paired t-test
        t_stat, p_value = stats.ttest_rel(before_paired, after_paired)
        
        # Effect size (Cohen's d for paired data)
        mean_diff = differences.mean()
        std_diff = differences.std()
        cohens_d = mean_diff / std_diff if std_diff > 0 else 0
        
        # Confidence interval for mean difference
        n = len(differences)
        t_critical = stats.t.ppf(0.975, n-1)
        se_diff = std_diff / np.sqrt(n)
        ci_lower = mean_diff - t_critical * se_diff
        ci_upper = mean_diff + t_critical * se_diff
        
        return {
            "n_pairs": int(n),
            "before_mean": float(before_paired.mean()),
            "after_mean": float(after_paired.mean()),
            "before_std": float(before_paired.std()),
            "after_std": float(after_paired.std()),
            "mean_difference": float(mean_diff),
            "std_difference": float(std_diff),
            "t_statistic": float(t_stat),
            "p_value": float(p_value),
            "degrees_freedom": int(n-1),
            "cohens_d": float(cohens_d),
            "ci_95_lower": float(ci_lower),
            "ci_95_upper": float(ci_upper),
            "significant": p_value < 0.05
        }
        
    except Exception as e:
        return {"error": f"Paired t-test failed: {str(e)}"}

# 2. One-sample t-test
def run_one_sample_ttest(dataset_id: str, column: str, test_value: float,
                        where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform one-sample t-test against a known population value.
    
    Args:
        dataset_id: Dataset identifier
        column: Column to test
        test_value: Population value to test against
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with one-sample t-test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get numeric data
        data = pd.to_numeric(df[column], errors='coerce').dropna()
        
        if len(data) < 2:
            return {"error": "Insufficient data (need at least 2 observations)"}
        
        # Perform one-sample t-test
        t_stat, p_value = stats.ttest_1samp(data, test_value)
        
        # Calculate statistics
        sample_mean = data.mean()
        sample_std = data.std()
        n = len(data)
        se = sample_std / np.sqrt(n)
        
        # Confidence interval for mean
        t_critical = stats.t.ppf(0.975, n-1)
        ci_lower = sample_mean - t_critical * se
        ci_upper = sample_mean + t_critical * se
        
        # Effect size (Cohen's d)
        cohens_d = (sample_mean - test_value) / sample_std if sample_std > 0 else 0
        
        return {
            "n_observations": int(n),
            "sample_mean": float(sample_mean),
            "sample_std": float(sample_std),
            "test_value": float(test_value),
            "mean_difference": float(sample_mean - test_value),
            "t_statistic": float(t_stat),
            "p_value": float(p_value),
            "degrees_freedom": int(n-1),
            "cohens_d": float(cohens_d),
            "ci_95_lower": float(ci_lower),
            "ci_95_upper": float(ci_upper),
            "significant": p_value < 0.05
        }
        
    except Exception as e:
        return {"error": f"One-sample t-test failed: {str(e)}"}

# 3. Mann-Whitney U test (Wilcoxon rank-sum test)
def run_mann_whitney_u_test(dataset_id: str, group_col: str, value_col: str,
                           where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Mann-Whitney U test (non-parametric alternative to independent t-test).
    
    Args:
        dataset_id: Dataset identifier
        group_col: Column containing group labels
        value_col: Column containing values to compare
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Mann-Whitney U test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean and prepare data
        df_clean = df[[group_col, value_col]].dropna()
        df_clean[value_col] = pd.to_numeric(df_clean[value_col], errors='coerce')
        df_clean = df_clean.dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        # Get unique groups
        groups = df_clean[group_col].unique()
        if len(groups) != 2:
            return {"error": "Mann-Whitney U test requires exactly 2 groups"}
        
        # Split data into groups
        group1_data = df_clean[df_clean[group_col] == groups[0]][value_col]
        group2_data = df_clean[df_clean[group_col] == groups[1]][value_col]
        
        if len(group1_data) == 0 or len(group2_data) == 0:
            return {"error": "One or both groups have no data"}
        
        # Perform Mann-Whitney U test
        statistic, p_value = stats.mannwhitneyu(group1_data, group2_data, 
                                               alternative='two-sided')
        
        # Calculate effect size (rank biserial correlation)
        n1, n2 = len(group1_data), len(group2_data)
        effect_size = 1 - (2 * statistic) / (n1 * n2)
        
        # Additional statistics
        median1 = group1_data.median()
        median2 = group2_data.median()
        
        return {
            "group1": str(groups[0]),
            "group2": str(groups[1]),
            "n_group1": int(n1),
            "n_group2": int(n2),
            "median_group1": float(median1),
            "median_group2": float(median2),
            "u_statistic": float(statistic),
            "p_value": float(p_value),
            "effect_size_r": float(effect_size),
            "significant": p_value < 0.05
        }
        
    except Exception as e:
        return {"error": f"Mann-Whitney U test failed: {str(e)}"}

# 4. Wilcoxon signed-rank test
def run_wilcoxon_signed_rank_test(dataset_id: str, before_col: str, after_col: str,
                                 where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Wilcoxon signed-rank test (non-parametric paired test).
    
    Args:
        dataset_id: Dataset identifier
        before_col: Column with before measurements
        after_col: Column with after measurements
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Wilcoxon signed-rank test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get paired data
        paired_df = df[[before_col, after_col]].dropna()
        if len(paired_df) < 3:
            return {"error": "Insufficient paired data (need at least 3 complete pairs)"}
        
        before_data = pd.to_numeric(paired_df[before_col])
        after_data = pd.to_numeric(paired_df[after_col])
        
        # Perform Wilcoxon signed-rank test
        statistic, p_value = stats.wilcoxon(before_data, after_data)
        
        # Calculate additional statistics
        differences = after_data - before_data
        n_pairs = len(differences)
        n_positive = (differences > 0).sum()
        n_negative = (differences < 0).sum()
        n_zero = (differences == 0).sum()
        
        median_diff = differences.median()
        
        # Effect size (r = Z / sqrt(N))
        z_score = stats.norm.ppf(1 - p_value/2) if p_value > 0 else 0
        effect_size = abs(z_score) / np.sqrt(n_pairs) if n_pairs > 0 else 0
        
        return {
            "n_pairs": int(n_pairs),
            "n_positive_ranks": int(n_positive),
            "n_negative_ranks": int(n_negative),
            "n_zero_differences": int(n_zero),
            "median_before": float(before_data.median()),
            "median_after": float(after_data.median()),
            "median_difference": float(median_diff),
            "w_statistic": float(statistic),
            "p_value": float(p_value),
            "effect_size_r": float(effect_size),
            "significant": p_value < 0.05
        }
        
    except Exception as e:
        return {"error": f"Wilcoxon signed-rank test failed: {str(e)}"}

# 5. Fisher's Exact Test
def run_fisher_exact_test(dataset_id: str, col1: str, col2: str,
                         where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Fisher's exact test for small sample categorical data.
    
    Args:
        dataset_id: Dataset identifier
        col1: First categorical column
        col2: Second categorical column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Fisher's exact test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Create contingency table
        contingency_table = pd.crosstab(df[col1], df[col2])
        
        if contingency_table.shape != (2, 2):
            return {"error": "Fisher's exact test requires a 2x2 contingency table"}
        
        # Convert to numpy array for scipy
        table_array = contingency_table.values
        
        # Perform Fisher's exact test
        odds_ratio, p_value = stats.fisher_exact(table_array)
        
        # Calculate confidence interval for odds ratio
        log_or = np.log(odds_ratio) if odds_ratio > 0 else 0
        se_log_or = np.sqrt(np.sum(1.0 / table_array)) if np.all(table_array > 0) else 0
        
        ci_lower = np.exp(log_or - 1.96 * se_log_or) if se_log_or > 0 else 0
        ci_upper = np.exp(log_or + 1.96 * se_log_or) if se_log_or > 0 else 0
        
        return {
            "contingency_table": contingency_table.to_dict(),
            "odds_ratio": float(odds_ratio),
            "p_value": float(p_value),
            "or_ci_95_lower": float(ci_lower),
            "or_ci_95_upper": float(ci_upper),
            "significant": p_value < 0.05,
            "sample_size": int(contingency_table.sum().sum())
        }
        
    except Exception as e:
        return {"error": f"Fisher's exact test failed: {str(e)}"}

# 6. Kruskal-Wallis Test
def run_kruskal_wallis_test(dataset_id: str, group_col: str, value_col: str,
                           where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Kruskal-Wallis test (non-parametric alternative to one-way ANOVA).
    
    Args:
        dataset_id: Dataset identifier
        group_col: Column containing group labels
        value_col: Column containing values to compare
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Kruskal-Wallis test results
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
            values = group[value_col]
            if len(values) >= 1:  # Need at least 1 observation per group
                groups.append(values)
                group_names.append(str(name))
                group_stats[str(name)] = {
                    "n": len(values),
                    "median": float(values.median()),
                    "q25": float(values.quantile(0.25)),
                    "q75": float(values.quantile(0.75)),
                    "min": float(values.min()),
                    "max": float(values.max())
                }
        
        if len(groups) < 2:
            return {"error": "Need at least 2 groups for Kruskal-Wallis test"}
        
        # Perform Kruskal-Wallis test
        h_statistic, p_value = stats.kruskal(*groups)
        
        # Calculate effect size (eta-squared equivalent for Kruskal-Wallis)
        n_total = sum(len(g) for g in groups)
        eta_squared = (h_statistic - len(groups) + 1) / (n_total - len(groups))
        eta_squared = max(0, eta_squared)  # Ensure non-negative
        
        return {
            "h_statistic": float(h_statistic),
            "p_value": float(p_value),
            "degrees_freedom": int(len(groups) - 1),
            "eta_squared": float(eta_squared),
            "group_statistics": group_stats,
            "total_groups": len(groups),
            "total_observations": int(n_total),
            "significant": p_value < 0.05
        }
        
    except Exception as e:
        return {"error": f"Kruskal-Wallis test failed: {str(e)}"}

# 7. Simple Linear Regression
def run_linear_regression(dataset_id: str, x_col: str, y_col: str,
                         where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform simple linear regression analysis.
    
    Args:
        dataset_id: Dataset identifier
        x_col: Independent variable column
        y_col: Dependent variable column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with linear regression results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[x_col, y_col]].dropna()
        df_clean[x_col] = pd.to_numeric(df_clean[x_col], errors='coerce')
        df_clean[y_col] = pd.to_numeric(df_clean[y_col], errors='coerce')
        df_clean = df_clean.dropna()
        
        if len(df_clean) < 3:
            return {"error": "Insufficient data for regression (need at least 3 observations)"}
        
        # Prepare data
        X = df_clean[x_col]
        y = df_clean[y_col]
        X_with_const = sm.add_constant(X)
        
        # Fit regression model
        model = sm.OLS(y, X_with_const).fit()
        
        # Extract results
        results = {
            "n_observations": int(len(df_clean)),
            "r_squared": float(model.rsquared),
            "adj_r_squared": float(model.rsquared_adj),
            "f_statistic": float(model.fvalue),
            "f_p_value": float(model.f_pvalue),
            "intercept": float(model.params[0]),
            "slope": float(model.params[1]),
            "intercept_p_value": float(model.pvalues[0]),
            "slope_p_value": float(model.pvalues[1]),
            "intercept_ci_lower": float(model.conf_int().iloc[0, 0]),
            "intercept_ci_upper": float(model.conf_int().iloc[0, 1]),
            "slope_ci_lower": float(model.conf_int().iloc[1, 0]),
            "slope_ci_upper": float(model.conf_int().iloc[1, 1]),
            "residual_std_error": float(np.sqrt(model.scale)),
            "significant": model.f_pvalue < 0.05
        }
        
        # Add correlation coefficient
        correlation = stats.pearsonr(X, y)
        results["correlation_coefficient"] = float(correlation[0])
        results["correlation_p_value"] = float(correlation[1])
        
        return results
        
    except Exception as e:
        return {"error": f"Linear regression failed: {str(e)}"}

# 8. Logistic Regression (Simple)
def run_logistic_regression(dataset_id: str, x_col: str, y_col: str,
                           where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform simple logistic regression analysis.
    
    Args:
        dataset_id: Dataset identifier
        x_col: Independent variable column
        y_col: Dependent binary variable column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with logistic regression results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[x_col, y_col]].dropna()
        df_clean[x_col] = pd.to_numeric(df_clean[x_col], errors='coerce')
        df_clean = df_clean.dropna()
        
        if len(df_clean) < 10:
            return {"error": "Insufficient data for logistic regression (need at least 10 observations)"}
        
        # Prepare dependent variable (ensure binary)
        y = df_clean[y_col]
        unique_y = y.unique()
        
        if len(unique_y) != 2:
            return {"error": "Dependent variable must be binary for logistic regression"}
        
        # Convert to 0/1 if needed
        le = LabelEncoder()
        y_encoded = le.fit_transform(y)
        
        X = df_clean[x_col].values.reshape(-1, 1)
        
        # Fit logistic regression
        model = LogisticRegression(random_state=42)
        model.fit(X, y_encoded)
        
        # Calculate additional statistics using statsmodels for p-values
        X_sm = sm.add_constant(df_clean[x_col])
        logit_model = sm.Logit(y_encoded, X_sm).fit(disp=0)
        
        # Predictions and accuracy
        y_pred = model.predict(X)
        y_pred_proba = model.predict_proba(X)[:, 1]
        
        from sklearn.metrics import accuracy_score, roc_auc_score
        accuracy = accuracy_score(y_encoded, y_pred)
        try:
            auc_score = roc_auc_score(y_encoded, y_pred_proba)
        except:
            auc_score = 0.5
        
        return {
            "n_observations": int(len(df_clean)),
            "intercept": float(logit_model.params[0]),
            "coefficient": float(logit_model.params[1]),
            "intercept_p_value": float(logit_model.pvalues[0]),
            "coefficient_p_value": float(logit_model.pvalues[1]),
            "odds_ratio": float(np.exp(logit_model.params[1])),
            "or_ci_lower": float(np.exp(logit_model.conf_int().iloc[1, 0])),
            "or_ci_upper": float(np.exp(logit_model.conf_int().iloc[1, 1])),
            "pseudo_r_squared": float(logit_model.prsquared),
            "log_likelihood": float(logit_model.llf),
            "aic": float(logit_model.aic),
            "accuracy": float(accuracy),
            "auc": float(auc_score),
            "dependent_variable_classes": [str(cls) for cls in le.classes_],
            "significant": logit_model.pvalues[1] < 0.05
        }
        
    except Exception as e:
        return {"error": f"Logistic regression failed: {str(e)}"}

# 9. McNemar's Test
def run_mcnemar_test(dataset_id: str, before_col: str, after_col: str,
                    where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform McNemar's test for paired nominal data.
    
    Args:
        dataset_id: Dataset identifier
        before_col: Before measurement column (binary)
        after_col: After measurement column (binary)
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with McNemar's test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Get paired data
        paired_df = df[[before_col, after_col]].dropna()
        if len(paired_df) < 3:
            return {"error": "Insufficient paired data"}
        
        # Create 2x2 contingency table
        contingency_table = pd.crosstab(paired_df[before_col], paired_df[after_col])
        
        if contingency_table.shape != (2, 2):
            return {"error": "McNemar's test requires 2x2 table (both variables must be binary)"}
        
        # Perform McNemar's test
        result = mcnemar(contingency_table.values, exact=True)
        
        # Calculate effect size (odds ratio for discordant pairs)
        table = contingency_table.values
        b = table[0, 1]  # changed from 0 to 1
        c = table[1, 0]  # changed from 1 to 0
        
        odds_ratio = b / c if c > 0 else float('inf')
        
        return {
            "contingency_table": contingency_table.to_dict(),
            "mcnemar_statistic": float(result.statistic),
            "p_value": float(result.pvalue),
            "discordant_pairs_b": int(b),
            "discordant_pairs_c": int(c),
            "odds_ratio_discordant": float(odds_ratio) if odds_ratio != float('inf') else None,
            "sample_size": int(contingency_table.sum().sum()),
            "significant": result.pvalue < 0.05
        }
        
    except Exception as e:
        return {"error": f"McNemar's test failed: {str(e)}"}

# 10. Two-way ANOVA
def run_two_way_anova(dataset_id: str, factor1_col: str, factor2_col: str, 
                     dependent_col: str, where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform two-way ANOVA analysis.
    
    Args:
        dataset_id: Dataset identifier
        factor1_col: First factor column
        factor2_col: Second factor column
        dependent_col: Dependent variable column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with two-way ANOVA results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[factor1_col, factor2_col, dependent_col]].dropna()
        df_clean[dependent_col] = pd.to_numeric(df_clean[dependent_col], errors='coerce')
        df_clean = df_clean.dropna()
        
        if len(df_clean) < 6:  # Need at least 6 observations for 2-way ANOVA
            return {"error": "Insufficient data for two-way ANOVA"}
        
        # Convert factors to strings to ensure proper grouping
        df_clean[factor1_col] = df_clean[factor1_col].astype(str)
        df_clean[factor2_col] = df_clean[factor2_col].astype(str)
        
        # Create formula for statsmodels
        formula = f"{dependent_col} ~ C({factor1_col}) + C({factor2_col}) + C({factor1_col}):C({factor2_col})"
        
        # Fit the model
        model = smf.ols(formula, data=df_clean).fit()
        anova_table = sm.stats.anova_lm(model, typ=2)
        
        # Extract results
        results = {
            "n_observations": int(len(df_clean)),
            "r_squared": float(model.rsquared),
            "adj_r_squared": float(model.rsquared_adj),
            "overall_f_statistic": float(model.fvalue),
            "overall_p_value": float(model.f_pvalue)
        }
        
        # Add individual factor results
        if len(anova_table) >= 3:
            results.update({
                f"{factor1_col}_f_statistic": float(anova_table.iloc[0]['F']),
                f"{factor1_col}_p_value": float(anova_table.iloc[0]['PR(>F)']),
                f"{factor2_col}_f_statistic": float(anova_table.iloc[1]['F']),
                f"{factor2_col}_p_value": float(anova_table.iloc[1]['PR(>F)']),
                "interaction_f_statistic": float(anova_table.iloc[2]['F']),
                "interaction_p_value": float(anova_table.iloc[2]['PR(>F)']),
                f"{factor1_col}_significant": anova_table.iloc[0]['PR(>F)'] < 0.05,
                f"{factor2_col}_significant": anova_table.iloc[1]['PR(>F)'] < 0.05,
                "interaction_significant": anova_table.iloc[2]['PR(>F)'] < 0.05
            })
        
        # Add group means
        group_means = df_clean.groupby([factor1_col, factor2_col])[dependent_col].agg(['mean', 'std', 'count']).round(4)
        results["group_statistics"] = group_means.to_dict()
        
        return results
        
    except Exception as e:
        return {"error": f"Two-way ANOVA failed: {str(e)}"}