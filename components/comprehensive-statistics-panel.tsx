'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  ChevronRight, 
  ChevronDown, 
  BarChart3, 
  TrendingUp, 
  Calculator,
  Stethoscope,
  Activity,
  Heart,
  Target,
  Microscope,
  ChartLine
} from 'lucide-react'

interface ComprehensiveStatisticsPanelProps {
  selectedFile: any
  onRunAnalysis: (analysisType: string, params: any) => void
}

// Statistical test categories with all 119 tests
const STATISTICAL_CATEGORIES = {
  "Descriptive & Summary": {
    icon: <Calculator className="h-4 w-4" />,
    tests: [
      { id: "descriptive", name: "Descriptive Statistics", description: "Mean, median, std, quartiles" },
      { id: "frequency", name: "Frequency Analysis", description: "Counts and percentages" },
      { id: "percentiles", name: "Percentiles & Quantiles", description: "Custom percentile calculations" }
    ]
  },
  "Normality & Distribution Tests": {
    icon: <TrendingUp className="h-4 w-4" />,
    tests: [
      { id: "shapiro-wilk", name: "Shapiro-Wilk Test", description: "Test for normality (n < 5000)" },
      { id: "kolmogorov-smirnov", name: "Kolmogorov-Smirnov Test", description: "One-sample distribution test" },
      { id: "anderson-darling", name: "Anderson-Darling Test", description: "Distribution goodness-of-fit" },
      { id: "dagostino-pearson", name: "D'Agostino-Pearson Test", description: "Omnibus normality test" },
      { id: "jarque-bera", name: "Jarque-Bera Test", description: "Normality for large samples" },
      { id: "chi-square-gof", name: "Chi-square Goodness-of-Fit", description: "Test expected distribution" },
      { id: "cramer-von-mises", name: "Cramér-von Mises Test", description: "Distribution comparison" },
      { id: "ks-two-sample", name: "Two-sample KS Test", description: "Compare two distributions" }
    ]
  },
  "Two-Group Comparisons": {
    icon: <BarChart3 className="h-4 w-4" />,
    tests: [
      { id: "ttest", name: "Student's t-test", description: "Compare two independent groups" },
      { id: "welch-ttest", name: "Welch's t-test", description: "Unequal variances t-test" },
      { id: "paired-ttest", name: "Paired t-test", description: "Before/after measurements" },
      { id: "mann-whitney", name: "Mann-Whitney U Test", description: "Non-parametric two groups" },
      { id: "wilcoxon", name: "Wilcoxon Signed-Rank", description: "Non-parametric paired test" },
      { id: "mood-median", name: "Mood's Median Test", description: "Compare medians" },
      { id: "brunner-munzel", name: "Brunner-Munzel Test", description: "Generalized Mann-Whitney" }
    ]
  },
  "Multi-Group Comparisons": {
    icon: <ChartLine className="h-4 w-4" />,
    tests: [
      { id: "anova", name: "One-way ANOVA", description: "Compare 3+ group means" },
      { id: "welch-anova", name: "Welch's ANOVA", description: "Unequal variances ANOVA" },
      { id: "two-way-anova", name: "Two-way ANOVA", description: "Two factors analysis" },
      { id: "repeated-anova", name: "Repeated Measures ANOVA", description: "Within-subjects design" },
      { id: "kruskal-wallis", name: "Kruskal-Wallis Test", description: "Non-parametric multi-group" },
      { id: "friedman", name: "Friedman Test", description: "Non-parametric repeated measures" },
      { id: "quade", name: "Quade Test", description: "Blocked non-parametric ANOVA" }
    ]
  },
  "Post-hoc & Multiple Comparisons": {
    icon: <Target className="h-4 w-4" />,
    tests: [
      { id: "tukey-hsd", name: "Tukey's HSD", description: "All pairwise comparisons" },
      { id: "bonferroni", name: "Bonferroni Correction", description: "Conservative adjustment" },
      { id: "holm-bonferroni", name: "Holm-Bonferroni", description: "Sequential Bonferroni" },
      { id: "scheffe", name: "Scheffé Test", description: "Conservative post-hoc" },
      { id: "dunnett", name: "Dunnett's Test", description: "Compare to control" },
      { id: "dunn", name: "Dunn's Test", description: "Non-parametric post-hoc" },
      { id: "games-howell", name: "Games-Howell Test", description: "Unequal variances post-hoc" }
    ]
  },
  "Correlation & Association": {
    icon: <Activity className="h-4 w-4" />,
    tests: [
      { id: "pearson", name: "Pearson Correlation", description: "Linear relationship" },
      { id: "spearman", name: "Spearman Correlation", description: "Rank-based correlation" },
      { id: "kendall-tau", name: "Kendall's Tau", description: "Rank correlation" },
      { id: "point-biserial", name: "Point-Biserial", description: "Binary-continuous correlation" },
      { id: "phi-coefficient", name: "Phi Coefficient", description: "Binary-binary correlation" },
      { id: "cramers-v", name: "Cramér's V", description: "Categorical association strength" }
    ]
  },
  "Categorical Data Analysis": {
    icon: <Microscope className="h-4 w-4" />,
    tests: [
      { id: "chisquare", name: "Chi-square Independence", description: "Test association" },
      { id: "fisher-exact", name: "Fisher's Exact Test", description: "Small sample categorical" },
      { id: "mantel-haenszel", name: "Mantel-Haenszel Test", description: "Stratified analysis" },
      { id: "mcnemar", name: "McNemar's Test", description: "Paired categorical data" },
      { id: "cochran-q", name: "Cochran's Q Test", description: "Multiple matched binary" },
      { id: "goodman-kruskal", name: "Goodman-Kruskal Gamma", description: "Ordinal association" }
    ]
  },
  "Regression Analysis": {
    icon: <TrendingUp className="h-4 w-4" />,
    tests: [
      { id: "linear-regression", name: "Linear Regression", description: "Continuous outcome" },
      { id: "multiple-regression", name: "Multiple Linear Regression", description: "Multiple predictors" },
      { id: "logistic-regression", name: "Logistic Regression", description: "Binary outcome" },
      { id: "ordinal-logistic", name: "Ordinal Logistic Regression", description: "Ordered categories" },
      { id: "multinomial-logistic", name: "Multinomial Logistic", description: "Multiple categories" },
      { id: "poisson-regression", name: "Poisson Regression", description: "Count data" },
      { id: "negative-binomial", name: "Negative Binomial Regression", description: "Over-dispersed counts" },
      { id: "zero-inflated", name: "Zero-Inflated Models", description: "Excess zeros in counts" }
    ]
  },
  "Advanced Regression": {
    icon: <ChartLine className="h-4 w-4" />,
    tests: [
      { id: "glm", name: "Generalized Linear Models", description: "Flexible regression framework" },
      { id: "gee", name: "Generalized Estimating Equations", description: "Correlated data" },
      { id: "mixed-effects", name: "Mixed Effects Models", description: "Random effects" },
      { id: "hierarchical", name: "Hierarchical Models", description: "Nested data structures" },
      { id: "pls-regression", name: "PLS Regression", description: "High-dimensional predictors" }
    ]
  },
  "Survival Analysis": {
    icon: <Heart className="h-4 w-4" />,
    tests: [
      { id: "kaplan-meier", name: "Kaplan-Meier Estimation", description: "Survival curves" },
      { id: "logrank-test", name: "Log-rank Test", description: "Compare survival curves" },
      { id: "breslow-test", name: "Breslow Test", description: "Early differences emphasis" },
      { id: "tarone-ware", name: "Tarone-Ware Test", description: "Balanced weight test" },
      { id: "cox-regression", name: "Cox Proportional Hazards", description: "Hazard ratios" },
      { id: "time-dependent-cox", name: "Time-Dependent Cox", description: "Time-varying covariates" },
      { id: "aft-model", name: "Accelerated Failure Time", description: "Parametric survival" },
      { id: "competing-risks", name: "Competing Risks Analysis", description: "Multiple endpoints" },
      { id: "nelson-aalen", name: "Nelson-Aalen Estimator", description: "Cumulative hazard" },
      { id: "life-table", name: "Life Table Method", description: "Actuarial approach" }
    ]
  },
  "Agreement & Reliability": {
    icon: <Target className="h-4 w-4" />,
    tests: [
      { id: "bland-altman", name: "Bland-Altman Analysis", description: "Method agreement" },
      { id: "cohens-kappa", name: "Cohen's Kappa", description: "Inter-rater agreement" },
      { id: "weighted-kappa", name: "Weighted Kappa", description: "Ordered categories agreement" },
      { id: "icc", name: "Intraclass Correlation", description: "Reliability measurement" },
      { id: "lins-concordance", name: "Lin's Concordance", description: "Agreement correlation" },
      { id: "passing-bablok", name: "Passing-Bablok Regression", description: "Method comparison" },
      { id: "deming-regression", name: "Deming Regression", description: "Errors in both variables" }
    ]
  },
  "Diagnostic Test Evaluation": {
    icon: <Stethoscope className="h-4 w-4" />,
    tests: [
      { id: "roc", name: "ROC Curve Analysis", description: "Diagnostic accuracy" },
      { id: "delong-test", name: "DeLong Test", description: "Compare ROC curves" },
      { id: "hosmer-lemeshow", name: "Hosmer-Lemeshow Test", description: "Calibration assessment" },
      { id: "nri", name: "Net Reclassification", description: "Improvement in classification" },
      { id: "idi", name: "Integrated Discrimination", description: "Discrimination improvement" },
      { id: "decision-curve", name: "Decision Curve Analysis", description: "Clinical utility" },
      { id: "youden-index", name: "Youden's Index", description: "Optimal cutoff" },
      { id: "diagnostic-test", name: "Sensitivity & Specificity", description: "Test performance metrics" }
    ]
  }
}

export function ComprehensiveStatisticsPanel({ selectedFile, onRunAnalysis }: ComprehensiveStatisticsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedTest, setSelectedTest] = useState<string>("")
  const [testParams, setTestParams] = useState<any>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Get available columns from selected file
  useEffect(() => {
    if (selectedFile?.data && selectedFile.data.length > 0) {
      const columns = Object.keys(selectedFile.data[0])
      setAvailableColumns(columns)
    }
  }, [selectedFile])

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleTestSelection = (categoryName: string, testId: string) => {
    setSelectedCategory(categoryName)
    setSelectedTest(testId)
    setTestParams({}) // Reset parameters
  }

  const handleRunAnalysis = async () => {
    if (!selectedTest || !selectedFile) return
    
    setLoading(true)
    try {
      await onRunAnalysis(selectedTest, {
        dataset_id: selectedFile.id,
        chat_id: "comprehensive-stats",
        ...testParams
      })
    } finally {
      setLoading(false)
    }
  }

  const renderParameterInputs = () => {
    if (!selectedTest) return null

    // Find the test definition
    let testDef = null
    for (const category of Object.values(STATISTICAL_CATEGORIES)) {
      testDef = category.tests.find(t => t.id === selectedTest)
      if (testDef) break
    }

    if (!testDef) return null

    // Render parameter inputs based on test type
    const renderColumnSelect = (label: string, paramKey: string, required: boolean = true) => (
      <div className="space-y-2">
        <Label htmlFor={paramKey}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={testParams[paramKey] || ""}
          onValueChange={(value) => setTestParams(prev => ({ ...prev, [paramKey]: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {availableColumns.map(col => (
              <SelectItem key={col} value={col}>{col}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )

    const renderTextInput = (label: string, paramKey: string, type: string = "text") => (
      <div className="space-y-2">
        <Label htmlFor={paramKey}>{label}</Label>
        <Input
          id={paramKey}
          type={type}
          value={testParams[paramKey] || ""}
          onChange={(e) => setTestParams(prev => ({ ...prev, [paramKey]: e.target.value }))}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    )

    // Parameter inputs based on test type
    switch (selectedTest) {
      case "ttest":
      case "welch-ttest":
      case "mann-whitney":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Group Column", "group_col")}
            {renderColumnSelect("Value Column", "value_col")}
          </div>
        )

      case "paired-ttest":
      case "wilcoxon":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Before Column", "before_col")}
            {renderColumnSelect("After Column", "after_col")}
          </div>
        )

      case "one-sample-ttest":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Value Column", "column")}
            {renderTextInput("Test Value", "test_value", "number")}
          </div>
        )

      case "anova":
      case "welch-anova":
      case "kruskal-wallis":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Group Column", "group_col")}
            {renderColumnSelect("Value Column", "value_col")}
          </div>
        )

      case "chisquare":
      case "fisher-exact":
      case "phi-coefficient":
      case "cramers-v":
        return (
          <div className="space-y-4">
            {renderColumnSelect("First Variable", "col1")}
            {renderColumnSelect("Second Variable", "col2")}
          </div>
        )

      case "pearson":
      case "spearman":
      case "kendall-tau":
        return (
          <div className="space-y-4">
            {renderColumnSelect("First Variable", "col1")}
            {renderColumnSelect("Second Variable", "col2")}
          </div>
        )

      case "linear-regression":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Independent Variable (X)", "x_col")}
            {renderColumnSelect("Dependent Variable (Y)", "y_col")}
          </div>
        )

      case "logistic-regression":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Predictor Variable", "x_col")}
            {renderColumnSelect("Binary Outcome", "y_col")}
          </div>
        )

      case "shapiro-wilk":
      case "kolmogorov-smirnov":
      case "anderson-darling":
      case "jarque-bera":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Variable to Test", "column")}
          </div>
        )

      case "kaplan-meier":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Duration Column", "duration_col")}
            {renderColumnSelect("Event Column (0/1)", "event_col")}
            {renderColumnSelect("Group Column (Optional)", "group_col", false)}
          </div>
        )

      case "roc":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Predictor Variable", "predictor_col")}
            {renderColumnSelect("Binary Outcome", "outcome_col")}
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            {renderColumnSelect("Primary Variable", "column")}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Comprehensive Statistical Analysis
            <Badge variant="outline">119 Tests Available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="categories" className="space-y-4">
            <TabsList>
              <TabsTrigger value="categories">By Category</TabsTrigger>
              <TabsTrigger value="search">Search Tests</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Statistical Test Categories</h3>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {Object.entries(STATISTICAL_CATEGORIES).map(([categoryName, category]) => (
                        <Collapsible
                          key={categoryName}
                          open={expandedCategories.has(categoryName)}
                          onOpenChange={() => toggleCategory(categoryName)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {category.icon}
                                <span>{categoryName}</span>
                                <Badge variant="secondary">{category.tests.length}</Badge>
                              </div>
                              {expandedCategories.has(categoryName) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-1 ml-6">
                            {category.tests.map((test) => (
                              <Button
                                key={test.id}
                                variant={selectedTest === test.id ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-left"
                                onClick={() => handleTestSelection(categoryName, test.id)}
                              >
                                <div>
                                  <div className="font-medium">{test.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {test.description}
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Test Configuration */}
                <div>
                  <h3 className="font-semibold mb-3">Test Configuration</h3>
                  {selectedTest ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="font-medium">Selected Test</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {STATISTICAL_CATEGORIES[selectedCategory]?.tests.find(t => t.id === selectedTest)?.name}
                        </p>
                      </div>

                      {selectedFile ? (
                        <div>
                          {renderParameterInputs()}
                          <Button 
                            className="w-full mt-4" 
                            onClick={handleRunAnalysis}
                            disabled={loading || !selectedTest}
                          >
                            {loading ? "Running Analysis..." : "Run Statistical Test"}
                          </Button>
                        </div>
                      ) : (
                        <div className="p-3 border border-dashed rounded-lg text-center text-muted-foreground">
                          Please select a dataset to configure test parameters
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 border border-dashed rounded-lg text-center text-muted-foreground">
                      Select a statistical test to configure parameters
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="search">
              <div className="space-y-4">
                <Input 
                  placeholder="Search statistical tests..." 
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">
                  Search feature coming soon. Use categories to browse all 119 tests.
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Recent tests will appear here after you run analyses.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}