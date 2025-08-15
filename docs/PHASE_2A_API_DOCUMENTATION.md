# Nemo Phase 2A - Medical Statistics API Documentation

## Overview
This document describes the enhanced medical statistics API endpoints added in Phase 2A of the Nemo project. These endpoints provide 20+ advanced statistical tests commonly used in medical research and clinical studies.

## Base URL
- Development: `http://localhost:8001/api`
- Production: `{REACT_APP_BACKEND_URL}/api`

## Authentication
No authentication required for current implementation.

## Medical Statistics Endpoints

### 1. Paired t-test
**Endpoint:** `POST /analysis/paired-ttest`

Compares before and after measurements in the same patients (e.g., pre/post treatment).

**Request Body:**
```json
{
  "chat_id": "string",
  "dataset_id": "string", 
  "before_col": "string",
  "after_col": "string",
  "where_sql": "string (optional)"
}
```

**Response:**
```json
{
  "run_id": "string",
  "n_pairs": 45,
  "before_mean": 120.5,
  "after_mean": 115.2,
  "mean_difference": -5.3,
  "t_statistic": -2.45,
  "p_value": 0.018,
  "cohens_d": -0.52,
  "ci_95_lower": -9.8,
  "ci_95_upper": -0.8,
  "significant": true
}
```

### 2. Mann-Whitney U Test
**Endpoint:** `POST /analysis/mann-whitney`

Non-parametric test for comparing two independent groups.

**Request Body:**
```json
{
  "chat_id": "string",
  "dataset_id": "string",
  "group_col": "string", 
  "value_col": "string",
  "where_sql": "string (optional)"
}
```

**Response:**
```json
{
  "run_id": "string",
  "group1": "Male",
  "group2": "Female", 
  "n_group1": 23,
  "n_group2": 27,
  "median_group1": 85.0,
  "median_group2": 78.5,
  "u_statistic": 245.5,
  "p_value": 0.032,
  "effect_size_r": 0.31,
  "significant": true
}
```

### 3. Kaplan-Meier Survival Analysis
**Endpoint:** `POST /analysis/kaplan-meier`

Survival analysis with optional group comparison.

**Request Body:**
```json
{
  "chat_id": "string",
  "dataset_id": "string",
  "duration_col": "string",
  "event_col": "string",
  "group_col": "string (optional)",
  "where_sql": "string (optional)"
}
```

**Response:**
```json
{
  "run_id": "string",
  "n_observations": 150,
  "n_events": 45,
  "n_censored": 105,
  "median_survival": 24.5,
  "survival_curve": {
    "timeline": [0, 1, 2, 3, ...],
    "survival_prob": [1.0, 0.95, 0.89, ...]
  },
  "logrank_test": {
    "test_statistic": 4.52,
    "p_value": 0.034,
    "significant": true
  }
}
```

### 4. ROC Analysis
**Endpoint:** `POST /analysis/roc`

Receiver Operating Characteristic curve analysis for diagnostic tests.

**Request Body:**
```json
{
  "chat_id": "string", 
  "dataset_id": "string",
  "predictor_col": "string",
  "outcome_col": "string",
  "where_sql": "string (optional)"
}
```

**Response:**
```json
{
  "run_id": "string",
  "n_observations": 200,
  "auc": 0.847,
  "auc_interpretation": "Good discrimination",
  "optimal_threshold": 0.45,
  "optimal_sensitivity": 0.82,
  "optimal_specificity": 0.78,
  "optimal_accuracy": 0.80,
  "confusion_matrix": {
    "true_positive": 82,
    "false_positive": 22,
    "false_negative": 18,
    "true_negative": 78
  },
  "roc_curve": {
    "fpr": [0, 0.01, 0.02, ...],
    "tpr": [0, 0.05, 0.12, ...],
    "thresholds": [1.0, 0.99, 0.98, ...]
  }
}
```

### 5. Multiple Linear Regression
**Endpoint:** `POST /analysis/multiple-regression`

Multiple linear regression with diagnostics.

**Request Body:**
```json
{
  "chat_id": "string",
  "dataset_id": "string", 
  "dependent_col": "string",
  "independent_cols": ["age", "bmi", "bp"],
  "where_sql": "string (optional)"
}
```

**Response:**
```json
{
  "run_id": "string",
  "n_observations": 156,
  "r_squared": 0.675,
  "adj_r_squared": 0.659,
  "f_statistic": 42.3,
  "f_p_value": 0.000,
  "coefficients": {
    "intercept": {
      "coefficient": 45.2,
      "p_value": 0.001,
      "significant": true
    },
    "age": {
      "coefficient": 0.85,
      "p_value": 0.012,
      "significant": true
    }
  },
  "white_test": {
    "statistic": 12.4,
    "p_value": 0.087,
    "homoscedastic": true
  }
}
```

### 6. Logistic Regression
**Endpoint:** `POST /analysis/logistic-regression`

Binary outcome modeling with odds ratios.

**Request Body:**
```json
{
  "chat_id": "string",
  "dataset_id": "string",
  "x_col": "string",
  "y_col": "string", 
  "where_sql": "string (optional)"
}
```

**Response:**
```json
{
  "run_id": "string",
  "n_observations": 245,
  "coefficient": 0.042,
  "coefficient_p_value": 0.018,
  "odds_ratio": 1.043,
  "or_ci_lower": 1.007,
  "or_ci_upper": 1.081,
  "pseudo_r_squared": 0.125,
  "accuracy": 0.738,
  "auc": 0.781,
  "significant": true
}
```

### 7. Fisher's Exact Test
**Endpoint:** `POST /analysis/fisher-exact`

Exact test for small sample 2x2 contingency tables.

**Request Body:**
```json
{
  "chat_id": "string",
  "dataset_id": "string",
  "col1": "string",
  "col2": "string",
  "where_sql": "string (optional)"
}
```

### 8. Diagnostic Test Analysis
**Endpoint:** `POST /analysis/diagnostic-test`

Comprehensive diagnostic test evaluation.

**Request Body:**
```json
{
  "dataset_id": "string",
  "test_col": "string", 
  "gold_standard_col": "string",
  "where_sql": "string (optional)"
}
```

**Response:**
```json
{
  "sample_size": 150,
  "sensitivity": 0.85,
  "specificity": 0.78,
  "positive_predictive_value": 0.73,
  "negative_predictive_value": 0.88,
  "accuracy": 0.81,
  "likelihood_ratio_positive": 3.86,
  "likelihood_ratio_negative": 0.19,
  "diagnostic_odds_ratio": 20.3
}
```

### 9. Additional Endpoints

- `POST /analysis/one-sample-ttest` - One sample t-test
- `POST /analysis/wilcoxon` - Wilcoxon signed-rank test  
- `POST /analysis/kruskal-wallis` - Kruskal-Wallis test
- `POST /analysis/linear-regression` - Simple linear regression
- `POST /analysis/shapiro-wilk` - Normality testing
- `POST /analysis/levene-test` - Variance equality testing
- `POST /analysis/spearman` - Spearman correlation
- `POST /analysis/odds-ratio` - Odds ratio calculation

### 10. List Available Tests
**Endpoint:** `GET /analysis/available-tests`

Returns all available statistical tests.

**Response:**
```json
{
  "basic_tests": ["descriptive", "ttest", "chisquare", "correlation", "anova"],
  "medical_tests_phase_2a": [
    "paired-ttest", "one-sample-ttest", "mann-whitney", "wilcoxon",
    "fisher-exact", "kruskal-wallis", "linear-regression", 
    "logistic-regression", "kaplan-meier", "roc", "multiple-regression",
    "shapiro-wilk", "levene-test", "spearman", "odds-ratio", "diagnostic-test"
  ],
  "total_tests": 21,
  "phase": "2A Complete"
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Descriptive error message",
  "n_male": 0,
  "n_female": 0, 
  "p_value": null
}
```

Common error scenarios:
- Insufficient data (< required sample size)
- Wrong data types (non-numeric where numeric expected)
- Missing required columns
- Invalid SQL in where_sql parameter

## Data Requirements

### General Requirements
- Dataset must be uploaded and have a valid `dataset_id`
- Numeric columns must contain parseable numbers
- Binary columns should contain 0/1 or boolean values
- Categorical columns for grouping should have 2-10 unique values

### Specific Test Requirements
- **t-tests**: Need at least 3 observations per group
- **Survival analysis**: Event column must be 0/1, duration must be positive
- **ROC analysis**: Binary outcome variable required
- **Regression**: At least 10 observations recommended
- **Chi-square/Fisher's**: Categorical variables with sufficient cell counts

## Usage Examples

### Example 1: Comparing Blood Pressure Before/After Treatment
```javascript
const response = await fetch('/api/analysis/paired-ttest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: 'session123',
    dataset_id: 'bp_study_001', 
    before_col: 'bp_baseline',
    after_col: 'bp_3months'
  })
});
```

### Example 2: Survival Analysis by Treatment Group  
```javascript
const response = await fetch('/api/analysis/kaplan-meier', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: 'session123',
    dataset_id: 'cancer_study_001',
    duration_col: 'survival_days',
    event_col: 'death_event',
    group_col: 'treatment_arm'
  })
});
```

### Example 3: Diagnostic Test Evaluation
```javascript
const response = await fetch('/api/analysis/diagnostic-test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dataset_id: 'diagnostic_study',
    test_col: 'rapid_test_result', 
    gold_standard_col: 'pcr_result'
  })
});
```

## Statistical Interpretation Guide

### Effect Sizes
- **Cohen's d**: 0.2 (small), 0.5 (medium), 0.8 (large)
- **Correlation**: 0.3 (weak), 0.5 (moderate), 0.7 (strong)  
- **AUC**: 0.7 (fair), 0.8 (good), 0.9 (excellent)

### P-value Interpretation
- p < 0.05: Statistically significant
- p < 0.01: Highly significant  
- p < 0.001: Very highly significant

### Confidence Intervals
- 95% CI not including null hypothesis value indicates significance
- Wider CI indicates more uncertainty
- CI provides effect size magnitude information

## Next Steps - Phase 2B

Planned enhancements for Phase 2B include:
- Advanced survival analysis (competing risks, time-varying covariates)
- Machine learning integration (random forests, SVM)
- Bayesian statistical methods
- Meta-analysis capabilities
- Advanced visualization (forest plots, survival curves)
- Automated report generation

---

*This documentation covers Phase 2A implementation completed in December 2024. For questions or support, please refer to the technical documentation or user guide.*