# Nemo - Statistical & Visualization Libraries Mapping

## 📊 Overview

Nemo includes **119 Statistical Tests** and **100 Visualization Types** powered by a comprehensive set of Python libraries. This document maps each library to its specific functionalities.

---

## 🔢 Statistical Analysis Libraries (119 Tests)

### Core Statistical Libraries

#### **pandas (2.1.4)**
- **Purpose**: Data manipulation and analysis foundation
- **Statistical Functions**:
  - Descriptive statistics (mean, median, std, quartiles)
  - Frequency analysis and value counts
  - Data grouping and aggregation
  - Missing value handling
  - Cross-tabulation for contingency tables

#### **numpy (1.24.4)**  
- **Purpose**: Numerical computing foundation
- **Statistical Functions**:
  - Array operations for statistical calculations
  - Mathematical functions (logarithms, exponentials)
  - Percentile and quantile calculations
  - Linear algebra operations for advanced stats

#### **scipy (1.11.4)**
- **Purpose**: Core statistical testing framework
- **Statistical Tests**:
  1. **Parametric Tests**: t-tests (1-sample, 2-sample, paired)
  2. **Non-parametric Tests**: Mann-Whitney U, Wilcoxon signed-rank, Kruskal-Wallis
  3. **Normality Tests**: Shapiro-Wilk, Kolmogorov-Smirnov, Anderson-Darling
  4. **Correlation Tests**: Pearson, Spearman rank correlation
  5. **ANOVA**: One-way and two-way analysis of variance
  6. **Distribution Tests**: Chi-square goodness-of-fit
  7. **Other Tests**: Levene's test, Bartlett's test, F-test

#### **statsmodels (0.14.1)**
- **Purpose**: Advanced statistical modeling and regression
- **Statistical Tests & Models**:
  8. **Regression Analysis**: Linear, multiple linear, logistic regression
  9. **Time Series**: ARIMA, seasonal decomposition, stationarity tests
  10. **Diagnostic Tests**: Durbin-Watson, White's test for heteroscedasticity
  11. **Post-hoc Tests**: Multiple comparison procedures
  12. **ANOVA Extensions**: Repeated measures, mixed-effects models
  13. **Proportion Tests**: Z-test for proportions, chi-square for proportions
  14. **Residual Analysis**: Normality tests on residuals, leverage plots

#### **scikit-learn (1.3.2)**
- **Purpose**: Machine learning and predictive modeling
- **Statistical Applications**:
  15. **Classification Metrics**: ROC curves, AUC calculation, confusion matrices
  16. **Regression Metrics**: R-squared, RMSE, MAE
  17. **Model Validation**: Cross-validation, train-test splits
  18. **Preprocessing**: Scaling, normalization, encoding
  19. **Dimensionality Reduction**: PCA for exploratory analysis
  20. **Clustering**: K-means for exploratory data analysis

#### **pingouin (0.5.4)**
- **Purpose**: User-friendly statistical functions for medical research
- **Statistical Tests**:
  21. **Effect Size Calculations**: Cohen's d, eta-squared, Cramér's V
  22. **Power Analysis**: Statistical power calculations
  23. **Bayesian Statistics**: Bayesian t-tests and correlations
  24. **Robust Statistics**: Robust correlation, outlier detection
  25. **Medical Statistics**: Concordance correlation coefficient
  26. **Advanced ANOVA**: Mixed ANOVA, repeated measures ANOVA

#### **lifelines (0.29.0)**
- **Purpose**: Survival analysis for medical research
- **Statistical Methods**:
  27. **Kaplan-Meier Estimation**: Survival curves and median survival times
  28. **Cox Proportional Hazards**: Regression for time-to-event data
  29. **Log-rank Test**: Comparing survival curves between groups
  30. **Hazard Ratios**: Risk estimation with confidence intervals
  31. **Survival Regression**: Parametric survival models
  32. **Competing Risks**: Analysis of multiple competing events

### Specialized Statistical Libraries

#### **scikit-posthocs (≥0.7.0)**
- **Purpose**: Post-hoc analysis after ANOVA
- **Statistical Tests**:
  33. **Pairwise Comparisons**: Tukey HSD, Bonferroni correction
  34. **Non-parametric Post-hocs**: Dunn's test, Conover test
  35. **Multiple Comparisons**: Games-Howell test for unequal variances

#### **factor-analyzer (≥0.4.0)**
- **Purpose**: Factor analysis and dimensionality reduction
- **Statistical Methods**:
  36. **Exploratory Factor Analysis (EFA)**: Factor extraction and rotation
  37. **Confirmatory Factor Analysis (CFA)**: Model testing
  38. **Factor Loadings**: Variable importance in factors
  39. **Scree Plots**: Determining optimal number of factors

#### **prince (≥0.7.1)**
- **Purpose**: Correspondence analysis and multivariate methods
- **Statistical Methods**:
  40. **Correspondence Analysis (CA)**: Categorical variable relationships
  41. **Multiple Correspondence Analysis (MCA)**: Multiple categorical variables
  42. **Principal Component Analysis (PCA)**: Continuous variable reduction
  43. **Factor Analysis of Mixed Data (FAMD)**: Mixed data types

#### **umap-learn (≥0.5.0)**
- **Purpose**: Non-linear dimensionality reduction
- **Statistical Applications**:
  44. **UMAP Projection**: Non-linear embedding for visualization
  45. **Cluster Analysis**: Identifying data patterns
  46. **Outlier Detection**: Identifying anomalous observations

#### **imbalanced-learn (≥0.11.0)**
- **Purpose**: Handling imbalanced datasets
- **Statistical Methods**:
  47. **Sampling Techniques**: SMOTE, under-sampling, over-sampling
  48. **Evaluation Metrics**: Balanced accuracy, precision-recall curves

---

## 📈 Visualization Libraries (100 Charts)

### Core Visualization Libraries

#### **matplotlib (3.8.2)**
- **Purpose**: Fundamental plotting library
- **Chart Types**:
  1. **Basic Plots**: Line plots, scatter plots, bar charts
  2. **Statistical Plots**: Histograms, box plots, error bars
  3. **Distribution Plots**: Probability density functions, Q-Q plots
  4. **Subplots**: Multi-panel figures for comprehensive analysis
  5. **Annotations**: Statistical significance markers, confidence intervals

#### **seaborn (0.13.0)**
- **Purpose**: Statistical data visualization
- **Chart Types**:
  6. **Distribution Plots**: Violin plots, strip plots, swarm plots, kde plots
  7. **Categorical Plots**: Box plots by category, categorical scatter
  8. **Regression Plots**: Scatter with regression lines, residual plots
  9. **Matrix Plots**: Correlation heatmaps, clustermap
  10. **Multi-variable Plots**: Pair plots, facet grids for subgroup analysis

#### **plotly (≥5.18.0)**
- **Purpose**: Interactive web-based visualizations
- **Chart Types**:
  11. **Interactive Plots**: Zoom, pan, hover tooltips
  12. **3D Visualizations**: 3D scatter, surface plots
  13. **Statistical Charts**: Box plots, violin plots with interactions
  14. **Time Series**: Interactive line plots with range selectors
  15. **Subplots**: Interactive multi-panel dashboards
  16. **Medical Charts**: Survival curves, ROC curves with interactions

#### **kaleido (≥0.2.1)**
- **Purpose**: Static image export for Plotly figures
- **Functionality**:
  - PNG, JPEG, SVG, PDF export from interactive plots
  - High-resolution images for publications
  - Batch export capabilities

### Specialized Visualization Libraries

#### **matplotlib-venn (≥0.11.0)** *(Optional)*
- **Purpose**: Set relationship visualization
- **Chart Types**:
  17. **Venn Diagrams**: 2-set and 3-set overlaps
  18. **Euler Diagrams**: Proportional set representations
- **Medical Applications**: Treatment overlap analysis, comorbidity visualization

#### **joypy (≥0.2.6)**
- **Purpose**: Ridgeline plots for distribution comparison
- **Chart Types**:
  19. **Ridgeline Plots**: Multiple density curves stacked vertically
- **Medical Applications**: Age distribution by treatment group, biomarker distributions

#### **wordcloud (≥1.9.0)** *(Optional)*
- **Purpose**: Text analysis visualization
- **Chart Types**:
  20. **Word Clouds**: Frequency-based text visualization
  21. **Colored Word Clouds**: Categorical text analysis
- **Medical Applications**: Symptom frequency, diagnosis text analysis

#### **folium (≥0.15.0)** *(Optional)*
- **Purpose**: Geographic data visualization
- **Chart Types**:
  22. **Choropleth Maps**: Geographic prevalence mapping
  23. **Point Maps**: Case location visualization
  24. **Heat Maps**: Disease hotspot identification
- **Medical Applications**: Epidemiological mapping, outbreak tracking

#### **networkx (≥3.0)** *(Optional)*
- **Purpose**: Network analysis and visualization
- **Chart Types**:
  25. **Network Graphs**: Relationship networks
  26. **Tree Structures**: Hierarchical data visualization
- **Medical Applications**: Patient referral networks, treatment pathways

### Frontend Visualization Libraries

#### **recharts (2.13.3)**
- **Purpose**: React-based chart library
- **Chart Types**:
  27. **Interactive Web Charts**: Line, bar, area, pie charts
  28. **Real-time Updates**: Dynamic data visualization
  29. **Responsive Design**: Mobile-friendly medical dashboards
- **Integration**: Seamless with Next.js frontend for real-time analysis display

---

## 🎯 Statistical Test Categories Mapping

### **Descriptive & Summary Statistics (3 tests)**
- **Libraries**: pandas, numpy, scipy
- **Tests**: Descriptive statistics, Frequency analysis, Percentiles & Quantiles

### **Normality & Distribution Tests (8 tests)**
- **Libraries**: scipy, statsmodels
- **Tests**: Shapiro-Wilk, Kolmogorov-Smirnov, Anderson-Darling, D'Agostino-Pearson, Jarque-Bera, Chi-square GOF, Cramér-von Mises, Two-sample KS

### **Parametric Tests (12 tests)**
- **Libraries**: scipy, statsmodels, pingouin
- **Tests**: One-sample t-test, Independent t-test, Paired t-test, Welch's t-test, One-way ANOVA, Two-way ANOVA, Repeated measures ANOVA, Mixed ANOVA, ANCOVA, MANOVA, Factorial ANOVA, Nested ANOVA

### **Non-Parametric Tests (13 tests)**
- **Libraries**: scipy, statsmodels
- **Tests**: Mann-Whitney U, Wilcoxon signed-rank, Kruskal-Wallis, Friedman test, Sign test, Median test, Mood's test, Ansari-Bradley, Bartlett test, Fligner-Killeen, Brown-Forsythe, Page test, Quade test

### **Post-Hoc & Multiple Comparisons (8 tests)**
- **Libraries**: statsmodels, scikit-posthocs, pingouin
- **Tests**: Tukey HSD, Bonferroni, Holm-Bonferroni, Dunn's test, Games-Howell, Scheffé test, Newman-Keuls, Duncan's test

### **Correlation & Association (9 tests)**
- **Libraries**: scipy, statsmodels, pingouin
- **Tests**: Pearson correlation, Spearman correlation, Kendall's tau, Point-biserial, Phi coefficient, Cramér's V, Concordance correlation, Partial correlation, Semi-partial correlation

### **Regression Analysis (15 tests)**
- **Libraries**: statsmodels, scikit-learn
- **Tests**: Simple linear, Multiple linear, Polynomial, Stepwise, Ridge, Lasso, Logistic, Multinomial logistic, Ordinal logistic, Poisson, Negative binomial, Cox regression, Robust regression, Quantile regression, Non-linear regression

### **Categorical Data Analysis (9 tests)**
- **Libraries**: scipy, statsmodels
- **Tests**: Chi-square independence, Fisher's exact, McNemar's, Cochran's Q, Chi-square GOF, G-test, Log-linear analysis, Exact multinomial, Bowker's test

### **Time Series Analysis (8 tests)**
- **Libraries**: statsmodels
- **Tests**: Augmented Dickey-Fuller, KPSS, Phillips-Perron, ARIMA, Seasonal decomposition, Ljung-Box, Durbin-Watson, Granger causality

### **Survival Analysis (9 tests)**
- **Libraries**: lifelines
- **Tests**: Kaplan-Meier, Cox proportional hazards, Log-rank test, Wilcoxon rank-sum, Logrank trend, Stratified logrank, Accelerated failure time, Competing risks, Parametric survival

### **Advanced Multivariate (12 tests)**
- **Libraries**: statsmodels, scikit-learn, factor-analyzer, prince
- **Tests**: MANOVA, Canonical correlation, Factor analysis, Principal component analysis, Discriminant analysis, Cluster analysis, Correspondence analysis, Multiple correspondence analysis, Hotelling's T², Pillai's trace, Wilks' lambda, Roy's largest root

### **Diagnostic & Model Validation (13 tests)**
- **Libraries**: scikit-learn, statsmodels
- **Tests**: ROC curve analysis, Sensitivity/Specificity, Cross-validation, Bootstrap, Jackknife, Permutation test, Goodness-of-fit tests, Residual analysis, Leverage plots, Cook's distance, DFBETAS, Outlier detection, Influence measures

### **Bayesian & Advanced Methods (10 tests)**
- **Libraries**: pingouin, scipy
- **Tests**: Bayesian t-test, Bayesian correlation, Bayesian ANOVA, Monte Carlo methods, Markov Chain Monte Carlo, Credible intervals, Bayes factor, Prior/Posterior analysis, Hierarchical models, Bayesian regression

### **Power Analysis & Effect Size (10 tests)**
- **Libraries**: pingouin, statsmodels
- **Tests**: Statistical power calculation, Effect size estimation, Sample size calculation, Cohen's d, Eta-squared, Omega-squared, Partial eta-squared, Cohen's f, Glass's delta, Hedges' g

---

## 🎨 Visualization Categories Mapping

### **Descriptive Statistics & Distributions (14 charts)**
- **Libraries**: matplotlib, seaborn, plotly
- **Charts**: Histogram, Density plot, Box plot, Violin plot, Boxen plot, Strip plot, Swarm plot, Dot plot, Raincloud plot, Ridgeline plot, Q-Q plot, P-P plot, ECDF plot, Pareto chart

### **Comparative & Categorical Data (10 charts)**  
- **Libraries**: matplotlib, seaborn, matplotlib-venn
- **Charts**: Bar chart, Grouped bar chart, Stacked bar chart, Diverging bar chart, Lollipop chart, Mosaic plot, Contingency table viz, Spine plot, Venn diagram, Sunburst chart

### **Time Series & Longitudinal Data (10 charts)**
- **Libraries**: matplotlib, seaborn, plotly  
- **Charts**: Line plot, Multi-line plot, Area chart, Stacked area chart, Streamgraph, Time series with CI, Spaghetti plot, Lag plot, Autocorr plot, Time heatmap

### **Correlation & Relationships (12 charts)**
- **Libraries**: seaborn, plotly, networkx
- **Charts**: Scatter plot, Scatter + regression, Bubble chart, Pair plot, Hexbin plot, 2D density heatmap, Correlation heatmap, Clustered heatmap, Parallel coordinates, Chord diagram, Alluvial plot, Sankey diagram

### **Survival & Event Analysis (9 charts)**
- **Libraries**: matplotlib, lifelines
- **Charts**: Kaplan-Meier curve, Survival probability table, Cumulative incidence plot, Hazard function plot, Cause-specific hazard, Stacked survival curves, Nelson-Aalen plot, Schoenfeld residual plot, Life table plot

### **Diagnostic Accuracy & Model Validation (8 charts)**
- **Libraries**: matplotlib, scikit-learn, plotly
- **Charts**: ROC curve, Precision-recall curve, ROC with cutoff, Calibration plot, Calibration belt, Decision curve analysis, Lift curve, NRI plot

### **Clinical Trial & Meta-analysis (7 charts)**  
- **Libraries**: matplotlib, plotly
- **Charts**: Forest plot (meta-analysis), Forest plot (subgroup), Funnel plot, CONSORT diagram, PRISMA diagram, Cumulative meta-analysis, Trial timeline

### **Epidemiology & Public Health (7 charts)**
- **Libraries**: matplotlib, folium, plotly  
- **Charts**: Epidemic curve, Choropleth map, Geospatial heatmap, Point map, Kernel density map, Time-animated map, Lorenz curve

### **Omics, Biomarkers & High-dimensional (7 charts)**
- **Libraries**: matplotlib, seaborn, umap-learn
- **Charts**: Volcano plot, Manhattan plot, Gene expression heatmap, PCA biplot, t-SNE plot, UMAP plot, Dendrogram

### **Risk Scores & Prediction Tools (3 charts)**
- **Libraries**: matplotlib, plotly
- **Charts**: Nomogram, Gauge chart, Bullet chart

### **Change & Difference Visualization (5 charts)**
- **Libraries**: matplotlib, seaborn
- **Charts**: Waterfall plot, Slope chart, Bland-Altman plot, Transition plot, Interaction plot

### **Text & Qualitative Data (3 charts)**
- **Libraries**: wordcloud, networkx
- **Charts**: Word cloud, Term frequency plot, Term network graph

### **Specialized Medical/Statistical (5 charts)**
- **Libraries**: matplotlib, plotly
- **Charts**: Tornado diagram, Hospital funnel plot, Risk heatmap by age/sex, Probability tree, Patient journey timeline

---

## 🚀 Performance & Integration

### **Data Processing Pipeline**
- **DuckDB**: High-performance analytical database for large medical datasets
- **pandas**: Data manipulation and cleaning before analysis
- **numpy**: Optimized numerical operations for statistical calculations

### **Export & Interoperability**
- **Base64 encoding**: All charts exported as embeddable images
- **Multiple formats**: PNG, JPEG, SVG, PDF support via kaleido
- **Interactive exports**: HTML exports for plotly visualizations

### **Memory Management**
- **Lazy loading**: Statistical libraries imported only when needed
- **Chunked processing**: Large datasets processed in manageable chunks
- **Garbage collection**: Automatic cleanup of temporary visualization objects

---

## 📋 Installation Status

### **Required Libraries (Always Installed)**
All core libraries listed in `requirements.txt` are mandatory for Nemo's functionality.

### **Optional Libraries (Conditional Import)**
Some specialized libraries are imported with try/except blocks:
- `matplotlib-venn`: For set relationship diagrams
- `wordcloud`: For text analysis visualization  
- `networkx`: For network graph analysis
- `folium`: For geographic mapping

If these libraries are not installed, the corresponding visualization types will be unavailable, but core functionality remains intact.

---

## 🎯 Medical Research Focus

This comprehensive library stack makes Nemo particularly powerful for:

- **Clinical Trials**: Complete statistical analysis from descriptive stats to survival analysis
- **Epidemiological Studies**: Geographic mapping, outbreak analysis, population health metrics  
- **Biomarker Research**: High-dimensional analysis, omics visualization, diagnostic accuracy
- **Public Health**: Policy analysis, health disparities, intervention effectiveness
- **Academic Research**: Publication-ready visualizations, comprehensive statistical reporting

The combination of 119 statistical tests and 100 visualization types provides researchers with professional-grade analytical capabilities while maintaining the privacy and control of local processing.