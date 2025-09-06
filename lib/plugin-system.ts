/**
 * Plugin System Architecture for Nemo Medical AI Platform
 * 
 * This system provides extensible statistical test and visualization capabilities
 * through a plugin-based architecture, allowing users to install only the
 * statistical tests they need for their medical research.
 */

export interface StatisticalTest {
  id: string
  name: string
  category: string
  description: string
  version: string
  isCore: boolean
  isInstalled: boolean
  dependencies: string[]
  pythonLibraries: string[]
  memoryRequirement: number // MB
  estimatedExecutionTime: number // seconds
  medicalApplications: string[]
  examples: TestExample[]
}

export interface TestExample {
  title: string
  description: string
  sampleQuery: string
  expectedOutput: string
}

export interface PluginCategory {
  id: string
  name: string
  description: string
  icon: string
  testCount: number
}

export interface Plugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  isCore: boolean
  isInstalled: boolean
  canUninstall: boolean
  size: number // MB
  tests: StatisticalTest[]
  lastUpdated: Date
  installationDate?: Date
}

// Core Statistical Tests (Always bundled with app - TOP 10 MOST ESSENTIAL)
export const CORE_STATISTICAL_TESTS: StatisticalTest[] = [
  {
    id: "descriptive_stats",
    name: "Descriptive Statistics",
    category: "descriptive",
    description: "Basic descriptive statistics including mean, median, mode, standard deviation",
    version: "1.0.0",
    isCore: true,
    isInstalled: true,
    dependencies: [],
    pythonLibraries: ["pandas", "numpy"],
    memoryRequirement: 10,
    estimatedExecutionTime: 1,
    medicalApplications: ["Patient demographics", "Baseline characteristics", "Summary statistics"],
    examples: [
      {
        title: "Patient Age Analysis",
        description: "Calculate descriptive statistics for patient ages",
        sampleQuery: "Show me descriptive statistics for patient ages",
        expectedOutput: "Mean: 65.4, Median: 67, SD: 12.3"
      }
    ]
  },
  {
    id: "independent_ttest",
    name: "Independent T-Test",
    category: "parametric",
    description: "Compare means between two independent groups",
    version: "1.0.0",
    isCore: true,
    isInstalled: true,
    dependencies: [],
    pythonLibraries: ["scipy"],
    memoryRequirement: 15,
    estimatedExecutionTime: 2,
    medicalApplications: ["Treatment vs Control", "Male vs Female outcomes", "Drug A vs Drug B"],
    examples: [
      {
        title: "Treatment Comparison",
        description: "Compare blood pressure reduction between treatment and control groups",
        sampleQuery: "Compare systolic BP between treatment and control groups",
        expectedOutput: "t-statistic: -3.45, p-value: 0.002"
      }
    ]
  },
  {
    id: "paired_ttest",
    name: "Paired T-Test",
    category: "parametric",
    description: "Compare before/after measurements in same subjects",
    version: "1.0.0",
    isCore: true,
    isInstalled: true,
    dependencies: [],
    pythonLibraries: ["scipy"],
    memoryRequirement: 15,
    estimatedExecutionTime: 2,
    medicalApplications: ["Before/After treatment", "Pre/Post intervention", "Baseline vs Follow-up"],
    examples: [
      {
        title: "Treatment Efficacy",
        description: "Analyze change in pain scores before and after treatment",
        sampleQuery: "Compare pain scores before and after treatment",
        expectedOutput: "t-statistic: 4.23, p-value: <0.001, Mean improvement: 2.3 points"
      }
    ]
  },
  {
    id: "chi_square",
    name: "Chi-Square Test",
    category: "categorical",
    description: "Test associations between categorical variables",
    version: "1.0.0",
    isCore: true,
    isInstalled: true,
    dependencies: [],
    pythonLibraries: ["scipy"],
    memoryRequirement: 20,
    estimatedExecutionTime: 3,
    medicalApplications: ["Gender vs Disease", "Treatment response rates", "Risk factor associations"],
    examples: [
      {
        title: "Gender Disease Association",
        description: "Test association between gender and disease occurrence",
        sampleQuery: "Test if disease occurrence differs by gender",
        expectedOutput: "χ²=8.45, df=1, p=0.004, Significant association found"
      }
    ]
  },
  {
    id: "correlation_pearson",
    name: "Pearson Correlation",
    category: "correlation",
    description: "Measure linear correlation between continuous variables",
    version: "1.0.0",
    isCore: true,
    isInstalled: true,
    dependencies: [],
    pythonLibraries: ["scipy", "pandas"],
    memoryRequirement: 12,
    estimatedExecutionTime: 1,
    medicalApplications: ["Age vs Blood pressure", "BMI vs Cholesterol", "Biomarker correlations"],
    examples: [
      {
        title: "Age-Blood Pressure Correlation",
        description: "Analyze correlation between patient age and systolic blood pressure",
        sampleQuery: "What's the correlation between age and systolic blood pressure?",
        expectedOutput: "r=0.67, p<0.001, Strong positive correlation"
      }
    ]
  },
  {
    id: "mann_whitney",
    name: "Mann-Whitney U Test",
    category: "nonparametric",
    description: "Non-parametric alternative to independent t-test",
    version: "1.0.0",
    isCore: true,
    isInstalled: true,
    dependencies: [],
    pythonLibraries: ["scipy"],
    memoryRequirement: 20,
    estimatedExecutionTime: 3,
    medicalApplications: ["Non-normal data", "Ordinal scales", "Small samples"],
    examples: [
      {
        title: "Pain Scale Analysis",
        description: "Compare pain ratings between groups (ordinal data)",
        sampleQuery: "Compare pain scale ratings between treatment groups",
        expectedOutput: "U=234, p=0.032, Treatment group has lower pain scores"
      }
    ]
  },
  {
    id: "wilcoxon_signed_rank",
    name: "Wilcoxon Signed-Rank Test",
    category: "nonparametric",
    description: "Non-parametric alternative to paired t-test",
    version: "1.0.0",
    isCore: true,
    isInstalled: true,
    dependencies: [],
    pythonLibraries: ["scipy"],
    memoryRequirement: 18,
    estimatedExecutionTime: 3,
    medicalApplications: ["Non-normal paired data", "Before/after comparisons", "Symptom severity changes"],
    examples: [
      {
        title: "Symptom Improvement",
        description: "Analyze symptom severity before and after treatment",
        sampleQuery: "Test if symptoms improved after treatment",
        expectedOutput: "W=89, p=0.007, Significant symptom improvement"
      }
    ]
  },
  {
    id: "anova_oneway",
    name: "One-Way ANOVA",
    category: "parametric",
    description: "Compare means across multiple groups",
    version: "1.0.0",
    isCore: true,
    isInstalled: true,
    dependencies: [],
    pythonLibraries: ["scipy", "statsmodels"],
    memoryRequirement: 25,
    estimatedExecutionTime: 4,
    medicalApplications: ["Multiple treatment groups", "Disease severity levels", "Age group comparisons"],
    examples: [
      {
        title: "Multi-Treatment Analysis",
        description: "Compare effectiveness across 3 treatment groups",
        sampleQuery: "Compare outcomes across treatment groups A, B, and C",
        expectedOutput: "F=12.34, p<0.001, Significant differences between groups"
      }
    ]
  },
  {
    id: "fisher_exact",
    name: "Fisher's Exact Test",
    category: "categorical",
    description: "Small sample categorical analysis",
    version: "1.0.0",
    isCore: true,
    isInstalled: true,
    dependencies: [],
    pythonLibraries: ["scipy"],
    memoryRequirement: 15,
    estimatedExecutionTime: 2,
    medicalApplications: ["Small sample sizes", "2x2 contingency tables", "Rare disease analysis"],
    examples: [
      {
        title: "Treatment Response Analysis",
        description: "Analyze treatment response in small patient groups",
        sampleQuery: "Test treatment response rates with small sample",
        expectedOutput: "OR=3.45, p=0.023, Significant association"
      }
    ]
  },
  {
    id: "shapiro_wilk",
    name: "Shapiro-Wilk Normality Test",
    category: "assumption_testing",
    description: "Test if data follows normal distribution",
    version: "1.0.0",
    isCore: true,
    isInstalled: true,
    dependencies: [],
    pythonLibraries: ["scipy"],
    memoryRequirement: 12,
    estimatedExecutionTime: 1,
    medicalApplications: ["Data validation", "Test assumptions", "Method selection guidance"],
    examples: [
      {
        title: "Data Distribution Check",
        description: "Test if patient ages follow normal distribution",
        sampleQuery: "Test if age data is normally distributed",
        expectedOutput: "W=0.95, p=0.23, Data is normally distributed"
      }
    ]
  }
]

// Optional Statistical Test Plugins (Downloadable to avoid app bloat)
export const OPTIONAL_STATISTICAL_TESTS: StatisticalTest[] = [
  // Advanced Parametric Tests
  {
    id: "anova_twoway",
    name: "Two-Way ANOVA",
    category: "parametric",
    description: "Analyze effects of two factors simultaneously",
    version: "1.0.0",
    isCore: false,
    isInstalled: false,
    dependencies: ["anova_oneway"],
    pythonLibraries: ["statsmodels>=0.14.0", "scipy>=1.11.0"],
    memoryRequirement: 35,
    estimatedExecutionTime: 6,
    medicalApplications: ["Treatment × Gender interaction", "Drug × Dose effects", "Age × Disease severity"],
    examples: [
      {
        title: "Treatment-Gender Interaction",
        description: "Analyze treatment effectiveness by gender",
        sampleQuery: "Analyze treatment effects considering gender differences",
        expectedOutput: "Treatment effect: F=8.9, p=0.003; Gender effect: F=2.1, p=0.15"
      }
    ]
  },
  {
    id: "repeated_anova",
    name: "Repeated Measures ANOVA",
    category: "parametric",
    description: "Analyze repeated measurements over time",
    version: "1.0.0",
    isCore: false,
    isInstalled: false,
    dependencies: ["anova_oneway"],
    pythonLibraries: ["statsmodels>=0.14.0", "pingouin>=0.5.0"],
    memoryRequirement: 40,
    estimatedExecutionTime: 8,
    medicalApplications: ["Longitudinal studies", "Time-course analysis", "Treatment progression"],
    examples: [
      {
        title: "Longitudinal Treatment Analysis",
        description: "Analyze patient responses over multiple time points",
        sampleQuery: "Analyze blood pressure changes over 6 months of treatment",
        expectedOutput: "Time effect: F=15.2, p<0.001; Significant improvement over time"
      }
    ]
  },
  // Non-Parametric Tests (Downloadable)
  {
    id: "kruskal_wallis",
    name: "Kruskal-Wallis Test",
    category: "nonparametric",
    description: "Non-parametric alternative to one-way ANOVA",
    version: "1.0.0",
    isCore: false,
    isInstalled: false,
    dependencies: ["mann_whitney"],
    pythonLibraries: ["scipy>=1.11.0"],
    memoryRequirement: 25,
    estimatedExecutionTime: 4,
    medicalApplications: ["Multiple group comparison", "Non-normal data", "Ordinal outcomes"],
    examples: [
      {
        title: "Multi-Group Pain Analysis",
        description: "Compare pain scores across multiple treatment groups",
        sampleQuery: "Compare pain ratings across 4 treatment groups",
        expectedOutput: "H=15.6, p=0.001, Significant differences between groups"
      }
    ]
  },
  {
    id: "friedman_test",
    name: "Friedman Test",
    category: "nonparametric",
    description: "Non-parametric repeated measures test",
    version: "1.0.0",
    isCore: false,
    isInstalled: false,
    dependencies: ["wilcoxon_signed_rank"],
    pythonLibraries: ["scipy>=1.11.0"],
    memoryRequirement: 30,
    estimatedExecutionTime: 5,
    medicalApplications: ["Repeated measurements", "Non-normal longitudinal data", "Matched groups"],
    examples: [
      {
        title: "Repeated Pain Assessment",
        description: "Analyze pain changes across multiple time points",
        sampleQuery: "Test pain score changes at baseline, 1 month, 3 months, 6 months",
        expectedOutput: "χ²=18.4, p<0.001, Significant changes over time"
      }
    ]
  },
  // Survival Analysis (Downloadable)
  {
    id: "kaplan_meier",
    name: "Kaplan-Meier Survival Analysis",
    category: "survival",
    description: "Estimate survival probabilities over time",
    version: "1.0.0",
    isCore: false,
    isInstalled: false,
    dependencies: [],
    pythonLibraries: ["lifelines>=0.29.0", "matplotlib>=3.8.0"],
    memoryRequirement: 50,
    estimatedExecutionTime: 8,
    medicalApplications: ["Patient survival", "Time to event", "Treatment durability"],
    examples: [
      {
        title: "Patient Survival Analysis",
        description: "Analyze patient survival times by treatment group",
        sampleQuery: "Create survival curves for different treatment groups",
        expectedOutput: "Median survival: Group A: 24 months, Group B: 18 months"
      }
    ]
  },
  {
    id: "cox_regression",
    name: "Cox Proportional Hazards Regression",
    category: "survival",
    description: "Model survival time with covariates",
    version: "1.0.0",
    isCore: false,
    isInstalled: false,
    dependencies: ["kaplan_meier"],
    pythonLibraries: ["lifelines>=0.29.0"],
    memoryRequirement: 60,
    estimatedExecutionTime: 10,
    medicalApplications: ["Multivariate survival analysis", "Risk factor modeling", "Prognostic models"],
    examples: [
      {
        title: "Multivariate Survival Model",
        description: "Model survival considering age, treatment, and comorbidities",
        sampleQuery: "Build survival model with age, treatment, and comorbidity factors",
        expectedOutput: "Treatment HR=0.65, p=0.023; Age HR=1.03, p=0.001"
      }
    ]
  },
  {
    id: "log_rank_test",
    name: "Log-Rank Test",
    category: "survival",
    description: "Compare survival curves between groups",
    version: "1.0.0",
    isCore: false,
    isInstalled: false,
    dependencies: ["kaplan_meier"],
    pythonLibraries: ["lifelines>=0.29.0"],
    memoryRequirement: 45,
    estimatedExecutionTime: 6,
    medicalApplications: ["Treatment comparison", "Survival curve comparison", "Time-to-event analysis"],
    examples: [
      {
        title: "Treatment Survival Comparison",
        description: "Compare survival times between treatment and control",
        sampleQuery: "Compare survival between treatment and control groups",
        expectedOutput: "Log-rank χ²=8.9, p=0.003, Treatment improves survival"
      }
    ]
  },
  // Regression Analysis (Downloadable)
  {
    id: "linear_regression",
    name: "Linear Regression",
    category: "regression",
    description: "Model continuous outcomes with predictors",
    version: "1.0.0",
    isCore: false,
    isInstalled: false,
    dependencies: [],
    pythonLibraries: ["scikit-learn>=1.3.0", "statsmodels>=0.14.0"],
    memoryRequirement: 30,
    estimatedExecutionTime: 5,
    medicalApplications: ["Biomarker prediction", "Dose-response modeling", "Risk scoring"],
    examples: [
      {
        title: "Blood Pressure Prediction",
        description: "Predict blood pressure from age, BMI, and lifestyle factors",
        sampleQuery: "Model blood pressure using age, BMI, and exercise habits",
        expectedOutput: "R²=0.72, Age coeff=0.8 (p<0.001), BMI coeff=1.2 (p=0.003)"
      }
    ]
  },
  {
    id: "logistic_regression",
    name: "Logistic Regression",
    category: "regression",
    description: "Model binary outcomes with predictors",
    version: "1.0.0",
    isCore: false,
    isInstalled: false,
    dependencies: [],
    pythonLibraries: ["scikit-learn>=1.3.0", "statsmodels>=0.14.0"],
    memoryRequirement: 35,
    estimatedExecutionTime: 6,
    medicalApplications: ["Disease risk modeling", "Treatment response prediction", "Diagnostic models"],
    examples: [
      {
        title: "Disease Risk Model",
        description: "Model disease risk based on patient characteristics",
        sampleQuery: "Predict disease risk using age, BMI, and family history",
        expectedOutput: "Age OR=1.05 (p=0.001), BMI OR=1.08 (p=0.02), AUC=0.78"
      }
    ]
  },
  {
    id: "poisson_regression",
    name: "Poisson Regression",
    category: "regression",
    description: "Model count data and rates",
    version: "1.0.0",
    isCore: false,
    isInstalled: false,
    dependencies: [],
    pythonLibraries: ["statsmodels>=0.14.0"],
    memoryRequirement: 30,
    estimatedExecutionTime: 5,
    medicalApplications: ["Event count modeling", "Incidence rates", "Hospital admissions"],
    examples: [
      {
        title: "Hospital Admission Modeling",
        description: "Model number of hospital admissions by patient factors",
        sampleQuery: "Model admission counts by age, comorbidities, and treatment",
        expectedOutput: "Age RR=1.02, p=0.045; Comorbidity RR=1.85, p<0.001"
      }
    ]
  }
]

// Plugin Categories
export const PLUGIN_CATEGORIES: PluginCategory[] = [
  {
    id: "core",
    name: "Core Statistical Tests",
    description: "10 essential tests bundled with every installation (always available)",
    icon: "star",
    testCount: CORE_STATISTICAL_TESTS.length
  },
  {
    id: "parametric",
    name: "Advanced Parametric Tests",
    description: "Downloadable parametric tests for normally distributed data",
    icon: "trending-up",
    testCount: OPTIONAL_STATISTICAL_TESTS.filter(t => t.category === "parametric").length
  },
  {
    id: "nonparametric",
    name: "Advanced Non-Parametric Tests",
    description: "Downloadable distribution-free statistical tests",
    icon: "shuffle",
    testCount: OPTIONAL_STATISTICAL_TESTS.filter(t => t.category === "nonparametric").length
  },
  {
    id: "survival",
    name: "Survival Analysis Suite",
    description: "Downloadable time-to-event analysis for medical research",
    icon: "clock",
    testCount: OPTIONAL_STATISTICAL_TESTS.filter(t => t.category === "survival").length
  },
  {
    id: "regression",
    name: "Regression Analysis Suite",
    description: "Downloadable predictive modeling and relationship analysis",
    icon: "target",
    testCount: OPTIONAL_STATISTICAL_TESTS.filter(t => t.category === "regression").length
  },
  {
    id: "categorical",
    name: "Advanced Categorical Analysis",
    description: "Downloadable tests for categorical and count data",
    icon: "grid-3x3",
    testCount: OPTIONAL_STATISTICAL_TESTS.filter(t => t.category === "categorical").length
  },
  {
    id: "correlation",
    name: "Advanced Correlation Analysis",
    description: "Downloadable tests to measure relationships between variables",
    icon: "link",
    testCount: OPTIONAL_STATISTICAL_TESTS.filter(t => t.category === "correlation").length
  },
  {
    id: "diagnostic",
    name: "Diagnostic & Agreement Tests",
    description: "Downloadable tools for diagnostic accuracy and method agreement",
    icon: "stethoscope",
    testCount: OPTIONAL_STATISTICAL_TESTS.filter(t => t.category === "diagnostic").length
  }
]

// Plugin Management Functions
export class PluginManager {
  private installedTests: Set<string>
  private apiBaseUrl: string

  constructor() {
    // Load core tests as always installed
    this.installedTests = new Set(CORE_STATISTICAL_TESTS.map(test => test.id))
    this.apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://statwise-ai-2.preview.emergentagent.com/api'
      : 'http://localhost:8001/api'
  }

  getAllTests(): StatisticalTest[] {
    return [...CORE_STATISTICAL_TESTS, ...OPTIONAL_STATISTICAL_TESTS]
  }

  getInstalledTests(): StatisticalTest[] {
    return this.getAllTests().filter(test => this.isTestInstalled(test.id))
  }

  getAvailableTests(): StatisticalTest[] {
    return OPTIONAL_STATISTICAL_TESTS.filter(test => !this.isTestInstalled(test.id))
  }

  isTestInstalled(testId: string): boolean {
    return this.installedTests.has(testId)
  }

  canUninstallTest(testId: string): boolean {
    const test = this.getAllTests().find(t => t.id === testId)
    return test ? !test.isCore : false
  }

  async loadPluginStatus(): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/plugins/status`)
      if (response.ok) {
        const data = await response.json()
        // Update installed tests from backend
        this.installedTests = new Set()
        Object.entries(data.plugins).forEach(([pluginId, info]: [string, any]) => {
          if (info.is_installed) {
            this.installedTests.add(pluginId)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load plugin status:', error)
    }
  }

  async installTest(testId: string): Promise<boolean> {
    const test = OPTIONAL_STATISTICAL_TESTS.find(t => t.id === testId)
    if (!test) return false

    // Check dependencies
    for (const dep of test.dependencies) {
      if (!this.isTestInstalled(dep)) {
        throw new Error(`Missing dependency: ${dep}. Please install it first.`)
      }
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/plugins/install`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plugin_id: testId })
      })

      if (response.ok) {
        this.installedTests.add(testId)
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Installation failed')
      }
    } catch (error) {
      throw new Error(`Installation failed: ${error}`)
    }
  }

  async uninstallTest(testId: string): Promise<boolean> {
    if (!this.canUninstallTest(testId)) return false

    // Check if other tests depend on this one
    const dependentTests = this.getInstalledTests().filter(test => 
      test.dependencies.includes(testId)
    )

    if (dependentTests.length > 0) {
      throw new Error(`Cannot uninstall: ${dependentTests.map(t => t.name).join(', ')} depend on this test.`)
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/plugins/uninstall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plugin_id: testId })
      })

      if (response.ok) {
        this.installedTests.delete(testId)
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Uninstall failed')
      }
    } catch (error) {
      throw new Error(`Uninstall failed: ${error}`)
    }
  }

  getTestsByCategory(categoryId: string): StatisticalTest[] {
    return this.getAllTests().filter(test => test.category === categoryId)
  }

  searchTests(query: string): StatisticalTest[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getAllTests().filter(test =>
      test.name.toLowerCase().includes(lowercaseQuery) ||
      test.description.toLowerCase().includes(lowercaseQuery) ||
      test.medicalApplications.some(app => app.toLowerCase().includes(lowercaseQuery))
    )
  }
}

// Global plugin manager instance
export const pluginManager = new PluginManager()