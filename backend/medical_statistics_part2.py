"""
Enhanced Medical Statistics Module - Phase 2A (Part 2)
Implements remaining 10 core statistical tests for medical research.

Continues from medical_statistics.py with survival analysis, advanced regression,
and specialized medical tests.
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
from statsmodels.stats.proportion import proportions_ztest
from statsmodels.stats.contingency_tables import StratifiedTable
from statsmodels.stats.diagnostic import het_white, acorr_ljungbox
from statsmodels.stats.stattools import durbin_watson
from statsmodels.stats.outliers_influence import variance_inflation_factor
import pingouin as pg
from lifelines import KaplanMeierFitter, CoxPHFitter
from lifelines.statistics import logrank_test
from sklearn.metrics import roc_curve, auc, confusion_matrix, classification_report
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
from io import BytesIO
import base64

warnings.filterwarnings('ignore', category=FutureWarning)

# Helper function (shared from medical_statistics.py)
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

# 11. Kaplan-Meier Survival Analysis
def run_kaplan_meier_analysis(dataset_id: str, duration_col: str, event_col: str,
                             group_col: Optional[str] = None,
                             where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Kaplan-Meier survival analysis.
    
    Args:
        dataset_id: Dataset identifier
        duration_col: Time to event column
        event_col: Event indicator column (1=event, 0=censored)
        group_col: Optional grouping variable for comparison
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Kaplan-Meier results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Prepare columns for analysis
        required_cols = [duration_col, event_col]
        if group_col:
            required_cols.append(group_col)
        
        df_clean = df[required_cols].dropna()
        df_clean[duration_col] = pd.to_numeric(df_clean[duration_col], errors='coerce')
        df_clean[event_col] = pd.to_numeric(df_clean[event_col], errors='coerce')
        df_clean = df_clean.dropna()
        
        if len(df_clean) < 5:
            return {"error": "Insufficient data for survival analysis (need at least 5 observations)"}
        
        # Validate event column (should be 0/1)
        unique_events = df_clean[event_col].unique()
        if not all(x in [0, 1] for x in unique_events):
            return {"error": "Event column must contain only 0 (censored) and 1 (event)"}
        
        results = {
            "n_observations": int(len(df_clean)),
            "n_events": int(df_clean[event_col].sum()),
            "n_censored": int((df_clean[event_col] == 0).sum()),
            "median_followup": float(df_clean[duration_col].median())
        }
        
        if group_col is None:
            # Single group Kaplan-Meier
            kmf = KaplanMeierFitter()
            kmf.fit(df_clean[duration_col], df_clean[event_col])
            
            results.update({
                "median_survival": float(kmf.median_survival_time_) if kmf.median_survival_time_ is not None else None,
                "survival_at_median": float(kmf.survival_function_at_times(df_clean[duration_col].median()).iloc[0])
            })
            
            # Survival function data points for plotting
            survival_df = kmf.survival_function_.reset_index()
            results["survival_curve"] = {
                "timeline": survival_df['timeline'].tolist(),
                "survival_prob": survival_df.iloc[:, 1].tolist()
            }
            
        else:
            # Group comparison
            groups = df_clean[group_col].unique()
            if len(groups) > 5:
                return {"error": "Too many groups for comparison (maximum 5)"}
            
            group_results = {}
            survival_curves = {}
            
            for group in groups:
                group_data = df_clean[df_clean[group_col] == group]
                if len(group_data) < 3:
                    continue
                    
                kmf = KaplanMeierFitter()
                kmf.fit(group_data[duration_col], group_data[event_col], label=str(group))
                
                group_results[str(group)] = {
                    "n": int(len(group_data)),
                    "events": int(group_data[event_col].sum()),
                    "median_survival": float(kmf.median_survival_time_) if kmf.median_survival_time_ is not None else None
                }
                
                # Store survival curve
                survival_df = kmf.survival_function_.reset_index()
                survival_curves[str(group)] = {
                    "timeline": survival_df['timeline'].tolist(),
                    "survival_prob": survival_df.iloc[:, 1].tolist()
                }
            
            results["group_results"] = group_results
            results["survival_curves"] = survival_curves
            
            # Log-rank test if exactly 2 groups
            if len([g for g in groups if str(g) in group_results]) == 2:
                group_names = list(group_results.keys())
                group1_data = df_clean[df_clean[group_col] == group_names[0]]
                group2_data = df_clean[df_clean[group_col] == group_names[1]]
                
                logrank_result = logrank_test(
                    group1_data[duration_col], group2_data[duration_col],
                    group1_data[event_col], group2_data[event_col]
                )
                
                results["logrank_test"] = {
                    "test_statistic": float(logrank_result.test_statistic),
                    "p_value": float(logrank_result.p_value),
                    "significant": logrank_result.p_value < 0.05
                }
        
        return results
        
    except Exception as e:
        return {"error": f"Kaplan-Meier analysis failed: {str(e)}"}

# 12. Cox Proportional Hazards Model
def run_cox_regression(dataset_id: str, duration_col: str, event_col: str,
                      covariate_cols: List[str], where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Cox proportional hazards regression.
    
    Args:
        dataset_id: Dataset identifier
        duration_col: Time to event column
        event_col: Event indicator column
        covariate_cols: List of covariate columns
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Cox regression results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Prepare data
        all_cols = [duration_col, event_col] + covariate_cols
        df_clean = df[all_cols].dropna()
        
        # Convert duration and event to numeric
        df_clean[duration_col] = pd.to_numeric(df_clean[duration_col], errors='coerce')
        df_clean[event_col] = pd.to_numeric(df_clean[event_col], errors='coerce')
        
        # Convert categorical variables to dummy variables
        for col in covariate_cols:
            if df_clean[col].dtype == 'object':
                dummies = pd.get_dummies(df_clean[col], prefix=col)
                df_clean = pd.concat([df_clean, dummies], axis=1)
                df_clean.drop(col, axis=1, inplace=True)
        
        df_clean = df_clean.dropna()
        
        if len(df_clean) < 10:
            return {"error": "Insufficient data for Cox regression (need at least 10 observations)"}
        
        # Fit Cox model
        cph = CoxPHFitter()
        cph.fit(df_clean, duration_col=duration_col, event_col=event_col)
        
        # Extract results
        results = {
            "n_observations": int(len(df_clean)),
            "n_events": int(df_clean[event_col].sum()),
            "concordance_index": float(cph.concordance_index_),
            "log_likelihood": float(cph.log_likelihood_),
            "aic": float(cph.AIC_partial_),
            "partial_aic": float(cph.AIC_partial_)
        }
        
        # Coefficient results
        summary = cph.summary
        coefficients = {}
        for covar in summary.index:
            coefficients[covar] = {
                "coefficient": float(summary.loc[covar, 'coef']),
                "hazard_ratio": float(summary.loc[covar, 'exp(coef)']),
                "p_value": float(summary.loc[covar, 'p']),
                "ci_lower": float(summary.loc[covar, 'exp(coef) lower 95%']),
                "ci_upper": float(summary.loc[covar, 'exp(coef) upper 95%']),
                "significant": summary.loc[covar, 'p'] < 0.05
            }
        
        results["coefficients"] = coefficients
        
        return results
        
    except Exception as e:
        return {"error": f"Cox regression failed: {str(e)}"}

# 13. ROC Curve Analysis
def run_roc_analysis(dataset_id: str, predictor_col: str, outcome_col: str,
                    where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform ROC curve analysis for diagnostic test evaluation.
    
    Args:
        dataset_id: Dataset identifier
        predictor_col: Predictor/test variable column
        outcome_col: Binary outcome column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with ROC analysis results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[predictor_col, outcome_col]].dropna()
        df_clean[predictor_col] = pd.to_numeric(df_clean[predictor_col], errors='coerce')
        df_clean = df_clean.dropna()
        
        if len(df_clean) < 10:
            return {"error": "Insufficient data for ROC analysis"}
        
        # Prepare outcome variable (ensure binary)
        y_true = df_clean[outcome_col]
        unique_outcomes = y_true.unique()
        
        if len(unique_outcomes) != 2:
            return {"error": "Outcome variable must be binary for ROC analysis"}
        
        # Encode outcome as 0/1
        le = LabelEncoder()
        y_binary = le.fit_transform(y_true)
        
        # Predictor scores
        y_scores = df_clean[predictor_col]
        
        # Calculate ROC curve
        fpr, tpr, thresholds = roc_curve(y_binary, y_scores)
        roc_auc = auc(fpr, tpr)
        
        # Find optimal threshold (Youden's J statistic)
        j_scores = tpr - fpr
        optimal_idx = np.argmax(j_scores)
        optimal_threshold = thresholds[optimal_idx]
        optimal_sensitivity = tpr[optimal_idx]
        optimal_specificity = 1 - fpr[optimal_idx]
        
        # Calculate sensitivity and specificity at different thresholds
        y_pred_optimal = (y_scores >= optimal_threshold).astype(int)
        cm = confusion_matrix(y_binary, y_pred_optimal)
        
        tn, fp, fn, tp = cm.ravel()
        
        results = {
            "n_observations": int(len(df_clean)),
            "n_positive": int(np.sum(y_binary == 1)),
            "n_negative": int(np.sum(y_binary == 0)),
            "auc": float(roc_auc),
            "optimal_threshold": float(optimal_threshold),
            "optimal_sensitivity": float(optimal_sensitivity),
            "optimal_specificity": float(optimal_specificity),
            "optimal_ppv": float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0,
            "optimal_npv": float(tn / (tn + fn)) if (tn + fn) > 0 else 0.0,
            "optimal_accuracy": float((tp + tn) / (tp + tn + fp + fn)),
            "optimal_f1_score": float(2 * tp / (2 * tp + fp + fn)) if (2 * tp + fp + fn) > 0 else 0.0,
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp)
            },
            "roc_curve": {
                "fpr": fpr.tolist(),
                "tpr": tpr.tolist(),
                "thresholds": thresholds.tolist()
            },
            "outcome_classes": [str(cls) for cls in le.classes_]
        }
        
        # AUC interpretation
        if roc_auc >= 0.9:
            interpretation = "Excellent discrimination"
        elif roc_auc >= 0.8:
            interpretation = "Good discrimination"
        elif roc_auc >= 0.7:
            interpretation = "Fair discrimination"
        elif roc_auc >= 0.6:
            interpretation = "Poor discrimination"
        else:
            interpretation = "No discrimination"
            
        results["auc_interpretation"] = interpretation
        
        return results
        
    except Exception as e:
        return {"error": f"ROC analysis failed: {str(e)}"}

# 14. Multiple Linear Regression
def run_multiple_regression(dataset_id: str, dependent_col: str, independent_cols: List[str],
                           where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform multiple linear regression analysis.
    
    Args:
        dataset_id: Dataset identifier
        dependent_col: Dependent variable column
        independent_cols: List of independent variable columns
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with multiple regression results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Prepare data
        all_cols = [dependent_col] + independent_cols
        df_clean = df[all_cols].dropna()
        
        # Convert to numeric where possible
        for col in all_cols:
            df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
        
        df_clean = df_clean.dropna()
        
        if len(df_clean) < len(independent_cols) + 5:
            return {"error": f"Insufficient data for regression (need at least {len(independent_cols) + 5} observations)"}
        
        # Prepare variables
        y = df_clean[dependent_col]
        X = df_clean[independent_cols]
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
            "aic": float(model.aic),
            "bic": float(model.bic),
            "residual_std_error": float(np.sqrt(model.scale)),
            "durbin_watson": float(durbin_watson(model.resid)),
            "significant_model": model.f_pvalue < 0.05
        }
        
        # Individual coefficient results
        coefficients = {}
        for i, var in enumerate(['intercept'] + independent_cols):
            coefficients[var] = {
                "coefficient": float(model.params.iloc[i]),
                "std_error": float(model.bse.iloc[i]),
                "t_statistic": float(model.tvalues.iloc[i]),
                "p_value": float(model.pvalues.iloc[i]),
                "ci_lower": float(model.conf_int().iloc[i, 0]),
                "ci_upper": float(model.conf_int().iloc[i, 1]),
                "significant": model.pvalues.iloc[i] < 0.05
            }
        
        results["coefficients"] = coefficients
        
        # Model diagnostics
        try:
            # Heteroscedasticity test (White test)
            white_test = het_white(model.resid, model.model.exog)
            results["white_test"] = {
                "statistic": float(white_test[0]),
                "p_value": float(white_test[1]),
                "homoscedastic": white_test[1] > 0.05
            }
        except:
            results["white_test"] = {"error": "Could not perform White test"}
        
        # Variance Inflation Factors (multicollinearity)
        if len(independent_cols) > 1:
            try:
                vif_data = pd.DataFrame()
                vif_data["Variable"] = independent_cols
                vif_data["VIF"] = [variance_inflation_factor(X.values, i) 
                                 for i in range(len(independent_cols))]
                results["vif"] = vif_data.to_dict('records')
            except:
                results["vif"] = {"error": "Could not calculate VIF"}
        
        return results
        
    except Exception as e:
        return {"error": f"Multiple regression failed: {str(e)}"}

# 15. Shapiro-Wilk Test for Normality
def run_shapiro_wilk_test(dataset_id: str, column: str, 
                         where_sql: Optional[str] = None) -> Dict[str, Any]:
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
        
        # Clean data
        data = pd.to_numeric(df[column], errors='coerce').dropna()
        
        if len(data) < 3:
            return {"error": "Insufficient data (need at least 3 observations)"}
        
        if len(data) > 5000:
            # Shapiro-Wilk is not reliable for very large samples
            return {"error": "Sample size too large for Shapiro-Wilk test (max 5000)"}
        
        # Perform Shapiro-Wilk test
        statistic, p_value = stats.shapiro(data)
        
        # Additional descriptive statistics
        mean_val = data.mean()
        std_val = data.std()
        skewness = stats.skew(data)
        kurtosis = stats.kurtosis(data)
        
        return {
            "n_observations": int(len(data)),
            "mean": float(mean_val),
            "std": float(std_val),
            "skewness": float(skewness),
            "kurtosis": float(kurtosis),
            "shapiro_statistic": float(statistic),
            "p_value": float(p_value),
            "is_normal": p_value > 0.05,
            "significance_level": 0.05
        }
        
    except Exception as e:
        return {"error": f"Shapiro-Wilk test failed: {str(e)}"}

# 16. Levene's Test for Equality of Variances
def run_levene_test(dataset_id: str, group_col: str, value_col: str,
                   where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Levene's test for equality of variances.
    
    Args:
        dataset_id: Dataset identifier
        group_col: Column containing group labels
        value_col: Column containing values to test
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Levene's test results
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
            if len(values) >= 2:  # Need at least 2 observations per group
                groups.append(values)
                group_names.append(str(name))
                group_stats[str(name)] = {
                    "n": len(values),
                    "mean": float(values.mean()),
                    "std": float(values.std()),
                    "variance": float(values.var())
                }
        
        if len(groups) < 2:
            return {"error": "Need at least 2 groups with sufficient data"}
        
        # Perform Levene's test
        statistic, p_value = stats.levene(*groups)
        
        return {
            "levene_statistic": float(statistic),
            "p_value": float(p_value),
            "degrees_freedom": int(len(groups) - 1),
            "equal_variances": p_value > 0.05,
            "group_statistics": group_stats,
            "total_groups": len(groups),
            "total_observations": sum(len(g) for g in groups),
            "significance_level": 0.05
        }
        
    except Exception as e:
        return {"error": f"Levene's test failed: {str(e)}"}

# 17. Spearman Rank Correlation
def run_spearman_correlation(dataset_id: str, col1: str, col2: str,
                            where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Spearman rank correlation analysis.
    
    Args:
        dataset_id: Dataset identifier
        col1: First variable column
        col2: Second variable column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Spearman correlation results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[col1, col2]].dropna()
        df_clean[col1] = pd.to_numeric(df_clean[col1], errors='coerce')
        df_clean[col2] = pd.to_numeric(df_clean[col2], errors='coerce')
        df_clean = df_clean.dropna()
        
        if len(df_clean) < 3:
            return {"error": "Insufficient data (need at least 3 observations)"}
        
        # Extract variables
        x = df_clean[col1]
        y = df_clean[col2]
        
        # Perform Spearman correlation
        correlation, p_value = stats.spearmanr(x, y)
        
        # Also calculate Pearson for comparison
        pearson_corr, pearson_p = stats.pearsonr(x, y)
        
        # Interpret correlation strength
        abs_corr = abs(correlation)
        if abs_corr >= 0.8:
            strength = "Very strong"
        elif abs_corr >= 0.6:
            strength = "Strong"
        elif abs_corr >= 0.4:
            strength = "Moderate"
        elif abs_corr >= 0.2:
            strength = "Weak"
        else:
            strength = "Very weak"
        
        return {
            "n_observations": int(len(df_clean)),
            "spearman_correlation": float(correlation),
            "p_value": float(p_value),
            "pearson_correlation": float(pearson_corr),
            "pearson_p_value": float(pearson_p),
            "correlation_strength": strength,
            "significant": p_value < 0.05,
            "variable1_mean": float(x.mean()),
            "variable2_mean": float(y.mean()),
            "variable1_median": float(x.median()),
            "variable2_median": float(y.median()),
            "significance_level": 0.05
        }
        
    except Exception as e:
        return {"error": f"Spearman correlation failed: {str(e)}"}

# 18. Friedman Test
def run_friedman_test(dataset_id: str, subject_col: str, condition_col: str, 
                     value_col: str, where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform Friedman test (non-parametric repeated measures ANOVA).
    
    Args:
        dataset_id: Dataset identifier
        subject_col: Subject/participant identifier column
        condition_col: Condition/treatment column
        value_col: Dependent variable column
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with Friedman test results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[subject_col, condition_col, value_col]].dropna()
        df_clean[value_col] = pd.to_numeric(df_clean[value_col], errors='coerce')
        df_clean = df_clean.dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        # Pivot data to wide format (subjects as rows, conditions as columns)
        pivot_df = df_clean.pivot(index=subject_col, columns=condition_col, values=value_col)
        pivot_df = pivot_df.dropna()  # Only keep complete cases
        
        if len(pivot_df) < 3:
            return {"error": "Insufficient complete cases (need at least 3 subjects with all conditions)"}
        
        if len(pivot_df.columns) < 3:
            return {"error": "Need at least 3 conditions for Friedman test"}
        
        # Perform Friedman test
        statistic, p_value = stats.friedmanchisquare(*[pivot_df[col] for col in pivot_df.columns])
        
        # Calculate effect size (Kendall's W)
        n_subjects = len(pivot_df)
        k_conditions = len(pivot_df.columns)
        kendalls_w = statistic / (n_subjects * (k_conditions - 1))
        
        # Condition statistics
        condition_stats = {}
        for condition in pivot_df.columns:
            values = pivot_df[condition]
            condition_stats[str(condition)] = {
                "n": len(values),
                "median": float(values.median()),
                "mean_rank": float(values.rank().mean()),
                "q25": float(values.quantile(0.25)),
                "q75": float(values.quantile(0.75))
            }
        
        return {
            "n_subjects": int(n_subjects),
            "n_conditions": int(k_conditions),
            "friedman_statistic": float(statistic),
            "p_value": float(p_value),
            "degrees_freedom": int(k_conditions - 1),
            "kendalls_w": float(kendalls_w),
            "condition_statistics": condition_stats,
            "significant": p_value < 0.05,
            "effect_size_interpretation": "Large" if kendalls_w >= 0.5 else "Medium" if kendalls_w >= 0.3 else "Small"
        }
        
    except Exception as e:
        return {"error": f"Friedman test failed: {str(e)}"}

# 19. Odds Ratio and Relative Risk Analysis
def run_odds_ratio_analysis(dataset_id: str, exposure_col: str, outcome_col: str,
                           where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Calculate odds ratio and relative risk for case-control and cohort studies.
    
    Args:
        dataset_id: Dataset identifier
        exposure_col: Exposure variable column (binary)
        outcome_col: Outcome variable column (binary)
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with odds ratio and relative risk results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[exposure_col, outcome_col]].dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        # Create 2x2 contingency table
        contingency_table = pd.crosstab(df_clean[exposure_col], df_clean[outcome_col])
        
        if contingency_table.shape != (2, 2):
            return {"error": "Both exposure and outcome variables must be binary (2x2 table required)"}
        
        # Extract cell counts
        # Standard epidemiologic notation:
        # |        | Outcome+ | Outcome- |
        # |Exposed |    a     |    b     |
        # |Not Exp |    c     |    d     |
        
        table_values = contingency_table.values
        a = table_values[1, 1]  # exposed, outcome present
        b = table_values[1, 0]  # exposed, outcome absent
        c = table_values[0, 1]  # not exposed, outcome present
        d = table_values[0, 0]  # not exposed, outcome absent
        
        # Calculate odds ratio
        if b == 0 or c == 0:
            odds_ratio = float('inf') if (a * d) > 0 else 0
        else:
            odds_ratio = (a * d) / (b * c)
        
        # Calculate relative risk
        risk_exposed = a / (a + b) if (a + b) > 0 else 0
        risk_not_exposed = c / (c + d) if (c + d) > 0 else 0
        
        if risk_not_exposed == 0:
            relative_risk = float('inf') if risk_exposed > 0 else 1
        else:
            relative_risk = risk_exposed / risk_not_exposed
        
        # Calculate confidence intervals
        # OR confidence interval
        if a > 0 and b > 0 and c > 0 and d > 0:
            log_or = np.log(odds_ratio)
            se_log_or = np.sqrt(1/a + 1/b + 1/c + 1/d)
            or_ci_lower = np.exp(log_or - 1.96 * se_log_or)
            or_ci_upper = np.exp(log_or + 1.96 * se_log_or)
        else:
            or_ci_lower = or_ci_upper = None
        
        # RR confidence interval
        if risk_exposed > 0 and risk_not_exposed > 0 and a > 0 and c > 0:
            log_rr = np.log(relative_risk)
            se_log_rr = np.sqrt(1/a - 1/(a+b) + 1/c - 1/(c+d))
            rr_ci_lower = np.exp(log_rr - 1.96 * se_log_rr)
            rr_ci_upper = np.exp(log_rr + 1.96 * se_log_rr)
        else:
            rr_ci_lower = rr_ci_upper = None
        
        # Additional measures
        attributable_risk = risk_exposed - risk_not_exposed
        attributable_risk_percent = (attributable_risk / risk_exposed * 100) if risk_exposed > 0 else 0
        
        # Number needed to treat/harm
        if attributable_risk != 0:
            nnt = abs(1 / attributable_risk)
        else:
            nnt = float('inf')
        
        return {
            "contingency_table": {
                "exposed_outcome_pos": int(a),
                "exposed_outcome_neg": int(b),
                "not_exposed_outcome_pos": int(c),
                "not_exposed_outcome_neg": int(d)
            },
            "sample_size": int(a + b + c + d),
            "odds_ratio": float(odds_ratio) if odds_ratio != float('inf') else None,
            "or_ci_95_lower": float(or_ci_lower) if or_ci_lower is not None else None,
            "or_ci_95_upper": float(or_ci_upper) if or_ci_upper is not None else None,
            "relative_risk": float(relative_risk) if relative_risk != float('inf') else None,
            "rr_ci_95_lower": float(rr_ci_lower) if rr_ci_lower is not None else None,
            "rr_ci_95_upper": float(rr_ci_upper) if rr_ci_upper is not None else None,
            "risk_exposed": float(risk_exposed),
            "risk_not_exposed": float(risk_not_exposed),
            "attributable_risk": float(attributable_risk),
            "attributable_risk_percent": float(attributable_risk_percent),
            "number_needed_to_treat": float(nnt) if nnt != float('inf') else None
        }
        
    except Exception as e:
        return {"error": f"Odds ratio analysis failed: {str(e)}"}

# 20. Sensitivity and Specificity Analysis
def run_diagnostic_test_analysis(dataset_id: str, test_col: str, gold_standard_col: str,
                               where_sql: Optional[str] = None) -> Dict[str, Any]:
    """
    Calculate sensitivity, specificity, and other diagnostic test measures.
    
    Args:
        dataset_id: Dataset identifier
        test_col: Diagnostic test result column (binary)
        gold_standard_col: Gold standard/true diagnosis column (binary)
        where_sql: Optional WHERE clause for filtering
    
    Returns:
        Dictionary with diagnostic test analysis results
    """
    try:
        df = get_dataset_df(dataset_id, where_sql)
        
        if df.empty:
            return {"error": "No data available"}
        
        # Clean data
        df_clean = df[[test_col, gold_standard_col]].dropna()
        
        if df_clean.empty:
            return {"error": "No valid data after cleaning"}
        
        # Create confusion matrix
        # Confusion matrix format:
        # |           | Disease+ | Disease- |
        # |Test+      |   TP     |   FP     |
        # |Test-      |   FN     |   TN     |
        
        contingency_table = pd.crosstab(df_clean[test_col], df_clean[gold_standard_col])
        
        if contingency_table.shape != (2, 2):
            return {"error": "Both test and gold standard variables must be binary"}
        
        # Extract confusion matrix values
        table_values = contingency_table.values
        tn = table_values[0, 0]  # Test-, Disease-
        fp = table_values[1, 0]  # Test+, Disease-
        fn = table_values[0, 1]  # Test-, Disease+
        tp = table_values[1, 1]  # Test+, Disease+
        
        # Calculate diagnostic measures
        sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
        ppv = tp / (tp + fp) if (tp + fp) > 0 else 0  # Positive Predictive Value
        npv = tn / (tn + fn) if (tn + fn) > 0 else 0  # Negative Predictive Value
        accuracy = (tp + tn) / (tp + tn + fp + fn)
        
        # Likelihood ratios
        lr_positive = sensitivity / (1 - specificity) if specificity < 1 else float('inf')
        lr_negative = (1 - sensitivity) / specificity if specificity > 0 else float('inf')
        
        # Disease prevalence
        prevalence = (tp + fn) / (tp + tn + fp + fn)
        
        # F1 score
        f1_score = 2 * tp / (2 * tp + fp + fn) if (2 * tp + fp + fn) > 0 else 0
        
        # Youden's J statistic
        youden_j = sensitivity + specificity - 1
        
        # Diagnostic odds ratio
        if fn > 0 and fp > 0:
            diagnostic_or = (tp * tn) / (fp * fn)
        else:
            diagnostic_or = float('inf') if (tp * tn) > 0 else 0
        
        return {
            "confusion_matrix": {
                "true_positive": int(tp),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_negative": int(tn)
            },
            "sample_size": int(tp + tn + fp + fn),
            "disease_prevalence": float(prevalence),
            "sensitivity": float(sensitivity),
            "specificity": float(specificity),
            "positive_predictive_value": float(ppv),
            "negative_predictive_value": float(npv),
            "accuracy": float(accuracy),
            "f1_score": float(f1_score),
            "likelihood_ratio_positive": float(lr_positive) if lr_positive != float('inf') else None,
            "likelihood_ratio_negative": float(lr_negative) if lr_negative != float('inf') else None,
            "youden_j_statistic": float(youden_j),
            "diagnostic_odds_ratio": float(diagnostic_or) if diagnostic_or != float('inf') else None,
            "sensitivity_percent": float(sensitivity * 100),
            "specificity_percent": float(specificity * 100),
            "accuracy_percent": float(accuracy * 100)
        }
        
    except Exception as e:
        return {"error": f"Diagnostic test analysis failed: {str(e)}"}