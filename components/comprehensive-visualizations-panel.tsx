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
  PieChart,
  LineChart,
  Scatter,
  Map,
  Activity,
  Heart,
  Target,
  Microscope,
  ImageIcon,
  Palette
} from 'lucide-react'

interface ComprehensiveVisualizationsPanelProps {
  selectedFile: any
  onGenerateVisualization: (vizType: string, params: any) => void
}

// All 100 visualization types organized by category
const VISUALIZATION_CATEGORIES = {
  "Descriptive Statistics & Distributions": {
    icon: <BarChart3 className="h-4 w-4" />,
    color: "bg-blue-50 border-blue-200",
    visualizations: [
      { id: "histogram", name: "Histogram", description: "Frequency distribution", icon: "📊" },
      { id: "density-plot", name: "Density Plot", description: "Probability density estimation", icon: "📈" },
      { id: "box-plot", name: "Box Plot", description: "Five-number summary with outliers", icon: "📦" },
      { id: "violin-plot", name: "Violin Plot", description: "Box plot + density", icon: "🎻" },
      { id: "boxen-plot", name: "Boxen Plot", description: "Enhanced box plot for large datasets", icon: "📊" },
      { id: "strip-plot", name: "Strip Plot", description: "Individual data points", icon: "📍" },
      { id: "swarm-plot", name: "Swarm Plot", description: "Non-overlapping points", icon: "🐝" },
      { id: "dot-plot", name: "Dot Plot", description: "Simple point display", icon: "⚫" },
      { id: "raincloud-plot", name: "Raincloud Plot", description: "Box + violin + raw data", icon: "🌧️" },
      { id: "ridgeline-plot", name: "Ridgeline Plot", description: "Multiple density plots", icon: "⛰️" },
      { id: "qq-plot", name: "Q-Q Plot", description: "Quantile comparison", icon: "📐" },
      { id: "pp-plot", name: "P-P Plot", description: "Probability comparison", icon: "📊" },
      { id: "ecdf-plot", name: "ECDF Plot", description: "Cumulative distribution", icon: "📈" },
      { id: "pareto-chart", name: "Pareto Chart", description: "80/20 principle visualization", icon: "📊" }
    ]
  },
  "Comparative & Categorical Data": {
    icon: <PieChart className="h-4 w-4" />,
    color: "bg-green-50 border-green-200",
    visualizations: [
      { id: "bar-chart", name: "Bar Chart", description: "Category comparisons", icon: "📊" },
      { id: "grouped-bar-chart", name: "Grouped Bar Chart", description: "Multiple series bars", icon: "📊" },
      { id: "stacked-bar-chart", name: "Stacked Bar Chart", description: "Part-to-whole bars", icon: "📚" },
      { id: "diverging-bar-chart", name: "Diverging Bar Chart", description: "Positive/negative bars", icon: "↔️" },
      { id: "lollipop-chart", name: "Lollipop Chart", description: "Line + point bars", icon: "🍭" },
      { id: "mosaic-plot", name: "Mosaic Plot", description: "Categorical relationships", icon: "🧩" },
      { id: "contingency-table-viz", name: "Contingency Table", description: "Cross-tabulation visual", icon: "📋" },
      { id: "spine-plot", name: "Spine Plot", description: "Conditional distributions", icon: "🌿" },
      { id: "venn-diagram", name: "Venn Diagram", description: "Set overlaps", icon: "⭕" },
      { id: "sunburst-chart", name: "Sunburst Chart", description: "Hierarchical pie chart", icon: "☀️" }
    ]
  },
  "Time Series & Longitudinal Data": {
    icon: <LineChart className="h-4 w-4" />,
    color: "bg-purple-50 border-purple-200",
    visualizations: [
      { id: "line-plot", name: "Line Plot", description: "Trend over time", icon: "📈" },
      { id: "multi-line-plot", name: "Multi-line Plot", description: "Multiple time series", icon: "📈" },
      { id: "area-chart", name: "Area Chart", description: "Filled line plot", icon: "🏔️" },
      { id: "stacked-area-chart", name: "Stacked Area Chart", description: "Multiple filled areas", icon: "🏔️" },
      { id: "streamgraph", name: "Streamgraph", description: "Flowing stacked areas", icon: "🌊" },
      { id: "time-series-ci", name: "Time Series with CI", description: "Confidence bands", icon: "📊" },
      { id: "spaghetti-plot", name: "Spaghetti Plot", description: "Individual trajectories", icon: "🍝" },
      { id: "lag-plot", name: "Lag Plot", description: "Time series autocorrelation", icon: "🔄" },
      { id: "autocorr-plot", name: "Autocorrelation Plot", description: "Serial correlation", icon: "🔗" },
      { id: "time-heatmap", name: "Time vs Value Heatmap", description: "Temporal intensity", icon: "🔥" }
    ]
  },
  "Correlation & Relationships": {
    icon: <Scatter className="h-4 w-4" />,
    color: "bg-orange-50 border-orange-200",
    visualizations: [
      { id: "scatter-plot", name: "Scatter Plot", description: "Bivariate relationships", icon: "⚫" },
      { id: "scatter-regression", name: "Scatter + Regression", description: "With fitted line", icon: "📈" },
      { id: "bubble-chart", name: "Bubble Chart", description: "Three-variable scatter", icon: "🫧" },
      { id: "pair-plot", name: "Pair Plot", description: "Multivariate scatter matrix", icon: "📊" },
      { id: "hexbin-plot", name: "Hexbin Plot", description: "Dense scatter alternative", icon: "⬡" },
      { id: "2d-density-heatmap", name: "2D Density Heatmap", description: "Bivariate density", icon: "🔥" },
      { id: "correlation-heatmap", name: "Correlation Heatmap", description: "Correlation matrix", icon: "🔥" },
      { id: "clustered-heatmap", name: "Clustered Heatmap", description: "Hierarchical clustering", icon: "🗂️" },
      { id: "parallel-coordinates", name: "Parallel Coordinates", description: "Multivariate patterns", icon: "📊" },
      { id: "chord-diagram", name: "Chord Diagram", description: "Circular relationships", icon: "⭕" },
      { id: "alluvial-plot", name: "Alluvial Plot", description: "Flow between categories", icon: "🌊" },
      { id: "sankey-diagram", name: "Sankey Diagram", description: "Flow diagram", icon: "🌊" }
    ]
  },
  "Survival & Event Analysis": {
    icon: <Heart className="h-4 w-4" />,
    color: "bg-red-50 border-red-200",
    visualizations: [
      { id: "kaplan-meier-curve", name: "Kaplan-Meier Curve", description: "Survival probability", icon: "📈" },
      { id: "survival-prob-table", name: "Survival Probability Table", description: "Tabular survival data", icon: "📋" },
      { id: "cumulative-incidence", name: "Cumulative Incidence Plot", description: "Event accumulation", icon: "📈" },
      { id: "hazard-function", name: "Hazard Function Plot", description: "Instantaneous risk", icon: "⚡" },
      { id: "cause-specific-hazard", name: "Cause-specific Hazard", description: "Competing risks", icon: "⚡" },
      { id: "stacked-survival", name: "Stacked Survival Curves", description: "Multiple group survival", icon: "📊" },
      { id: "nelson-aalen", name: "Nelson-Aalen Plot", description: "Cumulative hazard", icon: "📈" },
      { id: "schoenfeld-residual", name: "Schoenfeld Residual Plot", description: "PH assumption check", icon: "📊" },
      { id: "life-table-survival", name: "Life Table Plot", description: "Actuarial method", icon: "📋" }
    ]
  },
  "Diagnostic Accuracy & Model Validation": {
    icon: <Target className="h-4 w-4" />,
    color: "bg-teal-50 border-teal-200",
    visualizations: [
      { id: "roc-curve", name: "ROC Curve", description: "Sensitivity vs specificity", icon: "📈" },
      { id: "precision-recall", name: "Precision-Recall Curve", description: "Precision vs recall", icon: "📈" },
      { id: "roc-cutoff", name: "ROC with Cutoff", description: "Annotated ROC curve", icon: "📍" },
      { id: "calibration-plot", name: "Calibration Plot", description: "Predicted vs observed", icon: "📊" },
      { id: "calibration-belt", name: "Calibration Belt", description: "Calibration confidence", icon: "📊" },
      { id: "decision-curve", name: "Decision Curve Analysis", description: "Clinical utility", icon: "📈" },
      { id: "lift-curve", name: "Lift Curve", description: "Model performance gain", icon: "📈" },
      { id: "nri-plot", name: "NRI Plot", description: "Reclassification improvement", icon: "📊" }
    ]
  },
  "Clinical Trial & Meta-analysis": {
    icon: <Microscope className="h-4 w-4" />,
    color: "bg-indigo-50 border-indigo-200",
    visualizations: [
      { id: "forest-plot", name: "Forest Plot (Meta-analysis)", description: "Effect sizes with CI", icon: "🌲" },
      { id: "forest-subgroup", name: "Forest Plot (Subgroup)", description: "Subgroup analysis", icon: "🌲" },
      { id: "funnel-plot", name: "Funnel Plot", description: "Publication bias", icon: "📈" },
      { id: "consort-diagram", name: "CONSORT Diagram", description: "Trial flow diagram", icon: "🔄" },
      { id: "prisma-diagram", name: "PRISMA Diagram", description: "Review flow diagram", icon: "🔄" },
      { id: "cumulative-meta", name: "Cumulative Meta-analysis", description: "Sequential analysis", icon: "📈" },
      { id: "trial-timeline", name: "Trial Timeline", description: "Study timeline", icon: "📅" }
    ]
  },
  "Epidemiology & Public Health": {
    icon: <Map className="h-4 w-4" />,
    color: "bg-yellow-50 border-yellow-200",
    visualizations: [
      { id: "epidemic-curve", name: "Epidemic Curve", description: "Disease outbreak timeline", icon: "📈" },
      { id: "choropleth-map", name: "Choropleth Map", description: "Geographic prevalence", icon: "🗺️" },
      { id: "geospatial-heatmap", name: "Geospatial Heatmap", description: "Disease hotspots", icon: "🔥" },
      { id: "point-map", name: "Point Map", description: "Case locations", icon: "📍" },
      { id: "kernel-density-map", name: "Kernel Density Map", description: "Spatial intensity", icon: "🗺️" },
      { id: "time-animated-map", name: "Time-animated Map", description: "Outbreak progression", icon: "🎬" },
      { id: "lorenz-curve", name: "Lorenz Curve", description: "Healthcare inequality", icon: "📈" }
    ]
  },
  "Omics, Biomarkers & High-dimensional": {
    icon: <Activity className="h-4 w-4" />,
    color: "bg-pink-50 border-pink-200",
    visualizations: [
      { id: "volcano-plot", name: "Volcano Plot", description: "Significance vs effect size", icon: "🌋" },
      { id: "manhattan-plot", name: "Manhattan Plot", description: "GWAS results", icon: "🏢" },
      { id: "gene-heatmap", name: "Gene Expression Heatmap", description: "Expression patterns", icon: "🔥" },
      { id: "pca-biplot", name: "PCA Biplot", description: "Principal components", icon: "📊" },
      { id: "tsne-plot", name: "t-SNE Plot", description: "Non-linear dimension reduction", icon: "⚫" },
      { id: "umap-plot", name: "UMAP Plot", description: "Uniform manifold projection", icon: "⚫" },
      { id: "dendrogram", name: "Dendrogram", description: "Hierarchical clustering", icon: "🌳" }
    ]
  },
  "Risk Scores & Prediction Tools": {
    icon: <Target className="h-4 w-4" />,
    color: "bg-cyan-50 border-cyan-200",
    visualizations: [
      { id: "nomogram", name: "Nomogram", description: "Risk prediction chart", icon: "📏" },
      { id: "gauge-chart", name: "Gauge Chart", description: "Risk score display", icon: "⏱️" },
      { id: "bullet-chart", name: "Bullet Chart", description: "Performance vs target", icon: "🎯" }
    ]
  },
  "Change & Difference Visualization": {
    icon: <TrendingUp className="h-4 w-4" />,
    color: "bg-emerald-50 border-emerald-200",
    visualizations: [
      { id: "waterfall-plot", name: "Waterfall Plot", description: "Sequential changes", icon: "🌊" },
      { id: "slope-chart", name: "Slope Chart", description: "Before/after comparison", icon: "📈" },
      { id: "bland-altman", name: "Bland-Altman Plot", description: "Method agreement", icon: "📊" },
      { id: "transition-plot", name: "Transition Plot", description: "State changes over time", icon: "🔄" },
      { id: "interaction-plot", name: "Interaction Plot", description: "ANOVA interactions", icon: "⚡" }
    ]
  },
  "Text & Qualitative Data": {
    icon: <ImageIcon className="h-4 w-4" />,
    color: "bg-gray-50 border-gray-200",
    visualizations: [
      { id: "word-cloud", name: "Word Cloud", description: "Text frequency visualization", icon: "☁️" },
      { id: "term-frequency", name: "Term Frequency Plot", description: "Word usage bars", icon: "📊" },
      { id: "term-network", name: "Term Network Graph", description: "Word co-occurrence", icon: "🕸️" }
    ]
  },
  "Specialized Medical/Statistical": {
    icon: <Palette className="h-4 w-4" />,
    color: "bg-violet-50 border-violet-200",
    visualizations: [
      { id: "tornado-diagram", name: "Tornado Diagram", description: "Sensitivity analysis", icon: "🌪️" },
      { id: "hospital-funnel", name: "Hospital Funnel Plot", description: "Performance monitoring", icon: "📊" },
      { id: "risk-heatmap", name: "Risk Heatmap by Age/Sex", description: "Demographic risk", icon: "🔥" },
      { id: "probability-tree", name: "Probability Tree", description: "Decision analysis", icon: "🌳" },
      { id: "patient-timeline", name: "Patient Journey Timeline", description: "Care pathway", icon: "📅" }
    ]
  }
}

export function ComprehensiveVisualizationsPanel({ selectedFile, onGenerateVisualization }: ComprehensiveVisualizationsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedVisualization, setSelectedVisualization] = useState<string>("")
  const [vizParams, setVizParams] = useState<any>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [numericColumns, setNumericColumns] = useState<string[]>([])
  const [categoricalColumns, setCategoricalColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Get available columns from selected file
  useEffect(() => {
    if (selectedFile?.data && selectedFile.data.length > 0) {
      const columns = Object.keys(selectedFile.data[0])
      setAvailableColumns(columns)
      
      // Classify columns as numeric or categorical
      const numeric = columns.filter(col => {
        const values = selectedFile.data.slice(0, 100).map((row: any) => row[col])
        const numericValues = values.filter((val: any) => !isNaN(parseFloat(val)) && isFinite(val))
        return numericValues.length > values.length * 0.5
      })
      
      const categorical = columns.filter(col => !numeric.includes(col))
      
      setNumericColumns(numeric)
      setCategoricalColumns(categorical)
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

  const handleVisualizationSelection = (categoryName: string, vizId: string) => {
    setSelectedCategory(categoryName)
    setSelectedVisualization(vizId)
    setVizParams({}) // Reset parameters
  }

  const handleGenerateVisualization = async () => {
    if (!selectedVisualization || !selectedFile) return
    
    setLoading(true)
    try {
      await onGenerateVisualization(selectedVisualization, {
        dataset_id: selectedFile.id,
        chart_type: selectedVisualization,
        ...vizParams
      })
    } finally {
      setLoading(false)
    }
  }

  const renderParameterInputs = () => {
    if (!selectedVisualization) return null

    const renderColumnSelect = (label: string, paramKey: string, columnType: "all" | "numeric" | "categorical" = "all") => {
      let columns = availableColumns
      if (columnType === "numeric") columns = numericColumns
      if (columnType === "categorical") columns = categoricalColumns

      return (
        <div className="space-y-2">
          <Label htmlFor={paramKey}>{label}</Label>
          <Select
            value={vizParams[paramKey] || ""}
            onValueChange={(value) => setVizParams(prev => ({ ...prev, [paramKey]: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {columns.map(col => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }

    const renderSelectInput = (label: string, paramKey: string, options: string[]) => (
      <div className="space-y-2">
        <Label htmlFor={paramKey}>{label}</Label>
        <Select
          value={vizParams[paramKey] || ""}
          onValueChange={(value) => setVizParams(prev => ({ ...prev, [paramKey]: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )

    // Parameter inputs based on visualization type
    switch (selectedVisualization) {
      case "histogram":
      case "density-plot":
      case "dot-plot":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Numeric Variable", "column", "numeric")}
          </div>
        )

      case "box-plot":
      case "violin-plot":
      case "strip-plot":
      case "swarm-plot":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Numeric Variable", "column", "numeric")}
            {renderColumnSelect("Group By (Optional)", "group_by", "categorical")}
          </div>
        )

      case "bar-chart":
      case "pie-chart":
      case "pareto-chart":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Categorical Variable", "column", "categorical")}
          </div>
        )

      case "scatter-plot":
      case "scatter-regression":
        return (
          <div className="space-y-4">
            {renderColumnSelect("X-axis Variable", "x_column", "numeric")}
            {renderColumnSelect("Y-axis Variable", "y_column", "numeric")}
            {renderColumnSelect("Color By (Optional)", "color_by", "categorical")}
          </div>
        )

      case "line-plot":
      case "area-chart":
        return (
          <div className="space-y-4">
            {renderColumnSelect("X-axis Variable", "x_column")}
            {renderColumnSelect("Y-axis Variable", "y_column", "numeric")}
            {renderColumnSelect("Group By (Optional)", "group_by", "categorical")}
          </div>
        )

      case "correlation-heatmap":
        return (
          <div className="space-y-4">
            <Label>Correlation Method</Label>
            {renderSelectInput("Method", "method", ["pearson", "spearman", "kendall"])}
          </div>
        )

      case "qq-plot":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Numeric Variable", "column", "numeric")}
            {renderSelectInput("Distribution", "distribution", ["norm", "uniform", "expon"])}
          </div>
        )

      case "kaplan-meier-curve":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Duration Column", "duration_col", "numeric")}
            {renderColumnSelect("Event Column (0/1)", "event_col")}
            {renderColumnSelect("Group Column (Optional)", "group_col", "categorical")}
          </div>
        )

      case "roc-curve":
        return (
          <div className="space-y-4">
            {renderColumnSelect("Predictor Variable", "predictor_col", "numeric")}
            {renderColumnSelect("Binary Outcome", "outcome_col")}
          </div>
        )

      case "bubble-chart":
        return (
          <div className="space-y-4">
            {renderColumnSelect("X-axis Variable", "x_column", "numeric")}
            {renderColumnSelect("Y-axis Variable", "y_column", "numeric")}
            {renderColumnSelect("Size Variable", "size_column", "numeric")}
            {renderColumnSelect("Color By (Optional)", "color_by", "categorical")}
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

  // Filter visualizations based on search
  const filteredCategories = Object.entries(VISUALIZATION_CATEGORIES).reduce((acc, [categoryName, category]) => {
    if (!searchTerm) {
      acc[categoryName] = category
    } else {
      const filteredViz = category.visualizations.filter(viz => 
        viz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viz.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (filteredViz.length > 0) {
        acc[categoryName] = { ...category, visualizations: filteredViz }
      }
    }
    return acc
  }, {} as any)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Comprehensive Medical Visualizations
            <Badge variant="outline">100 Chart Types</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="categories" className="space-y-4">
            <TabsList>
              <TabsTrigger value="categories">By Category</TabsTrigger>
              <TabsTrigger value="search">Search Visualizations</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visualization Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Visualization Categories</h3>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {Object.entries(filteredCategories).map(([categoryName, category]) => (
                        <Collapsible
                          key={categoryName}
                          open={expandedCategories.has(categoryName)}
                          onOpenChange={() => toggleCategory(categoryName)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className={`w-full justify-between ${category.color}`}
                            >
                              <div className="flex items-center gap-2">
                                {category.icon}
                                <span className="text-sm font-medium">{categoryName}</span>
                                <Badge variant="secondary">{category.visualizations.length}</Badge>
                              </div>
                              {expandedCategories.has(categoryName) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-1 ml-6">
                            {category.visualizations.map((viz) => (
                              <Button
                                key={viz.id}
                                variant={selectedVisualization === viz.id ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-left"
                                onClick={() => handleVisualizationSelection(categoryName, viz.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{viz.icon}</span>
                                  <div>
                                    <div className="font-medium text-sm">{viz.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {viz.description}
                                    </div>
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

                {/* Visualization Configuration */}
                <div>
                  <h3 className="font-semibold mb-3">Visualization Configuration</h3>
                  {selectedVisualization ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="font-medium">Selected Visualization</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {filteredCategories[selectedCategory]?.visualizations.find(v => v.id === selectedVisualization)?.name}
                        </p>
                      </div>

                      {selectedFile ? (
                        <div>
                          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                            <div className="p-2 bg-blue-50 rounded">
                              <div className="font-medium">Numeric Columns</div>
                              <div>{numericColumns.length}</div>
                            </div>
                            <div className="p-2 bg-green-50 rounded">
                              <div className="font-medium">Categorical Columns</div>
                              <div>{categoricalColumns.length}</div>
                            </div>
                          </div>

                          {renderParameterInputs()}
                          <Button 
                            className="w-full mt-4" 
                            onClick={handleGenerateVisualization}
                            disabled={loading || !selectedVisualization}
                          >
                            {loading ? "Generating Visualization..." : "Generate Visualization"}
                          </Button>
                        </div>
                      ) : (
                        <div className="p-3 border border-dashed rounded-lg text-center text-muted-foreground">
                          Please select a dataset to configure visualization parameters
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 border border-dashed rounded-lg text-center text-muted-foreground">
                      Select a visualization type to configure parameters
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="search">
              <div className="space-y-4">
                <Input 
                  placeholder="Search visualizations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                
                {searchTerm && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Found {Object.values(filteredCategories).reduce((sum, cat) => sum + cat.visualizations.length, 0)} visualizations
                    </div>
                    
                    {Object.entries(filteredCategories).map(([categoryName, category]) => (
                      <div key={categoryName} className="space-y-1">
                        <h4 className="font-medium text-sm">{categoryName}</h4>
                        <div className="grid grid-cols-1 gap-1 ml-4">
                          {category.visualizations.map(viz => (
                            <Button
                              key={viz.id}
                              variant="ghost"
                              size="sm"
                              className="justify-start text-left"
                              onClick={() => handleVisualizationSelection(categoryName, viz.id)}
                            >
                              <span className="mr-2">{viz.icon}</span>
                              {viz.name} - {viz.description}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="gallery">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Visualization gallery with previews coming soon. Use categories to browse all 100 visualization types.
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.values(VISUALIZATION_CATEGORIES).slice(0, 8).map((category, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${category.color}`}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <span className="text-xs font-medium">{category.visualizations.length} types</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}