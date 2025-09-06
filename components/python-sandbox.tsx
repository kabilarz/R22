'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Code, BarChart3, Calculator, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  data: any[]
  uploadedAt: Date
}

interface PythonSandboxProps {
  selectedFile: UploadedFile | null
}

const STATISTICAL_TEMPLATES = {
  frequency: {
    name: "Frequency Analysis",
    icon: BarChart3,
    code: `# Frequency Analysis - Works with any uploaded data
import matplotlib.pyplot as plt
import seaborn as sns

print("=== FREQUENCY ANALYSIS ===\\n")

# Check if data is available
if 'df' not in locals():
    print("No data available. Please upload a file first.")
else:
    print(f"Dataset shape: {df.shape}")
    
    # Get categorical columns
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    print(f"Categorical columns found: {categorical_cols}\\n")
    
    if not categorical_cols:
        print("No categorical columns found in the dataset.")
        print("Available columns:", list(df.columns))
    else:
        for col in categorical_cols[:3]:  # Analyze first 3 categorical columns
            print(f"--- Frequency analysis for '{col}' ---")
            freq = df[col].value_counts()
            print(freq)
            print(f"\\nPercentages:")
            print((df[col].value_counts(normalize=True) * 100).round(2))
            print("\\n")
            
            # Create visualization if matplotlib is available
            try:
                plt.figure(figsize=(10, 6))
                freq.plot(kind='bar')
                plt.title(f'Frequency Distribution of {col}')
                plt.xlabel(col)
                plt.ylabel('Frequency')
                plt.xticks(rotation=45)
                plt.tight_layout()
                plt.show()
            except Exception as e:
                print(f"Could not create visualization: {e}")

print("Frequency analysis completed!")
`
  },
  descriptive: {
    name: "Descriptive Statistics",
    icon: Calculator,
    code: `# Descriptive Statistics Analysis - Works with any uploaded data
import numpy as np

print("=== DESCRIPTIVE STATISTICS ===\\n")

# Check if data is available
if 'df' not in locals():
    print("No data available. Please upload a file first.")
else:
    # Basic info about the dataset
    print("Dataset Info:")
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"Data types:\\n{df.dtypes}\\n")
    
    # Numerical columns analysis
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    print(f"Numerical columns: {numerical_cols}\\n")
    
    if not numerical_cols:
        print("No numerical columns found in the dataset.")
        print("Available columns:", list(df.columns))
    else:
        print("--- Descriptive Statistics for Numerical Columns ---")
        desc_stats = df[numerical_cols].describe()
        print(desc_stats)
        print("\\n")
        
        # Additional statistics
        print("--- Additional Statistics ---")
        for col in numerical_cols:
            print(f"{col}:")
            print(f"  Mode: {df[col].mode().iloc[0] if len(df[col].mode()) > 0 else 'No mode'}")
            print(f"  Variance: {df[col].var():.4f}")
            print(f"  Skewness: {df[col].skew():.4f}")
            print(f"  Kurtosis: {df[col].kurtosis():.4f}")
            print(f"  Missing values: {df[col].isnull().sum()}")
            print()
    
        # Correlation matrix for numerical data
        if len(numerical_cols) > 1:
            print("--- Correlation Matrix ---")
            correlation_matrix = df[numerical_cols].corr()
            print(correlation_matrix)
            
            # Visualize correlation matrix if matplotlib is available
            try:
                import matplotlib.pyplot as plt
                import seaborn as sns
                
                plt.figure(figsize=(10, 8))
                sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
                plt.title('Correlation Matrix')
                plt.tight_layout()
                plt.show()
            except Exception as e:
                print(f"Could not create visualization: {e}")

print("\\nDescriptive analysis completed!")
`
  },
  ttest: {
    name: "T-Test Analysis",
    icon: TrendingUp,
    code: `# T-Test Analysis - Works with any uploaded data
from scipy import stats
import numpy as np

print("=== T-TEST ANALYSIS ===\\n")

# Check if data is available
if 'df' not in locals():
    print("No data available. Please upload a file first.")
else:
    # Get numerical columns
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    if len(numerical_cols) == 0:
        print("No numerical columns found for t-test analysis.")
        print("Available columns:", list(df.columns))
    else:
        print(f"Numerical columns available: {numerical_cols}")
        print(f"Categorical columns available: {categorical_cols}\\n")
        
        # One-sample t-test (testing if mean is significantly different from 0)
        if numerical_cols:
            first_num_col = numerical_cols[0]
            print(f"--- One-sample t-test for '{first_num_col}' ---")
            print(f"Testing if mean of '{first_num_col}' is significantly different from 0")
            
            sample_data = df[first_num_col].dropna()
            if len(sample_data) > 1:
                t_stat, p_value = stats.ttest_1samp(sample_data, 0)
                
                print(f"Sample mean: {sample_data.mean():.4f}")
                print(f"Sample std: {sample_data.std():.4f}")
                print(f"T-statistic: {t_stat:.4f}")
                print(f"P-value: {p_value:.4f}")
                print(f"Significant at α=0.05: {'Yes' if p_value < 0.05 else 'No'}\\n")
            else:
                print("Not enough data points for t-test\\n")
        
        # Two-sample t-test (if we have categorical variable to group by)
        if len(numerical_cols) >= 1 and len(categorical_cols) >= 1:
            num_col = numerical_cols[0]
            cat_col = categorical_cols[0]
            
            unique_categories = df[cat_col].unique()
            if len(unique_categories) >= 2:
                print(f"--- Two-sample t-test: '{num_col}' by '{cat_col}' ---")
                
                # Take first two categories
                cat1, cat2 = unique_categories[0], unique_categories[1]
                group1 = df[df[cat_col] == cat1][num_col].dropna()
                group2 = df[df[cat_col] == cat2][num_col].dropna()
                
                if len(group1) > 1 and len(group2) > 1:
                    print(f"Group 1 ({cat1}): n={len(group1)}, mean={group1.mean():.4f}, std={group1.std():.4f}")
                    print(f"Group 2 ({cat2}): n={len(group2)}, mean={group2.mean():.4f}, std={group2.std():.4f}")
                    
                    # Perform independent t-test
                    t_stat, p_value = stats.ttest_ind(group1, group2)
                    
                    print(f"\\nT-statistic: {t_stat:.4f}")
                    print(f"P-value: {p_value:.4f}")
                    print(f"Significant difference at α=0.05: {'Yes' if p_value < 0.05 else 'No'}")
                    
                    # Effect size (Cohen's d)
                    pooled_std = np.sqrt(((len(group1)-1)*group1.var() + (len(group2)-1)*group2.var()) / (len(group1)+len(group2)-2))
                    cohens_d = (group1.mean() - group2.mean()) / pooled_std
                    print(f"Cohen's d (effect size): {cohens_d:.4f}")
                    
                    # Interpretation
                    if abs(cohens_d) < 0.2:
                        effect_size = "small"
                    elif abs(cohens_d) < 0.5:
                        effect_size = "small to medium"
                    elif abs(cohens_d) < 0.8:
                        effect_size = "medium to large"
                    else:
                        effect_size = "large"
                    print(f"Effect size interpretation: {effect_size}\\n")
                    
                    # Visualize the comparison if matplotlib is available
                    try:
                        import matplotlib.pyplot as plt
                        plt.figure(figsize=(10, 6))
                        plt.boxplot([group1, group2], labels=[cat1, cat2])
                        plt.title(f'{num_col} by {cat_col}')
                        plt.ylabel(num_col)
                        plt.grid(True, alpha=0.3)
                        plt.show()
                    except Exception as e:
                        print(f"Could not create visualization: {e}")
                else:
                    print("Not enough data points in groups for t-test")
            else:
                print("Not enough categories for two-sample t-test")

print("T-test analysis completed!")
`
  }
}

export function PythonSandbox({ selectedFile }: PythonSandboxProps) {
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const executeCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter some Python code to execute')
      return
    }

    setIsExecuting(true)
    setOutput('')

    try {
      // Show immediate feedback
      toast.info('Executing Python code...')
      
      const result = await apiClient.executePythonCode(
        code,
        selectedFile?.name || 'user_data',
        selectedFile?.data || []
      )

      if (result.success) {
        const outputText = result.output || 'Code executed successfully (no output)'
        setOutput(outputText)
        toast.success('✅ Code executed successfully!')
        
        // Log execution stats if available
        if (result.execution_time) {
          console.log(`Execution time: ${result.execution_time.toFixed(3)}s`)
        }
        if (result.memory_used_mb) {
          console.log(`Memory used: ${result.memory_used_mb.toFixed(1)}MB`)
        }
      } else {
        const errorText = `Error: ${result.error || 'Unknown error occurred'}`
        setOutput(errorText)
        toast.error('❌ Code execution failed')
      }
    } catch (error) {
      const errorMessage = `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      setOutput(errorMessage)
      toast.error('❌ Failed to execute Python code')
      console.error('Python execution error:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  const loadTemplate = (templateKey: string) => {
    if (templateKey && STATISTICAL_TEMPLATES[templateKey as keyof typeof STATISTICAL_TEMPLATES]) {
      const template = STATISTICAL_TEMPLATES[templateKey as keyof typeof STATISTICAL_TEMPLATES]
      setCode(template.code)
      setSelectedTemplate(templateKey)
      toast.success(`Loaded ${template.name} template`)
    }
  }

  const clearCode = () => {
    setCode('')
    setOutput('')
    setSelectedTemplate('')
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Python Code Sandbox
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedFile && (
              <Badge variant="outline" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {selectedFile.name}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Select value={selectedTemplate} onValueChange={loadTemplate}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Load statistical template..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATISTICAL_TEMPLATES).map(([key, template]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <template.icon className="h-4 w-4" />
                    {template.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={executeCode}
            disabled={!code.trim() || isExecuting}
            size="sm"
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isExecuting ? 'Executing...' : 'Run Code'}
          </Button>
          
          <Button
            onClick={clearCode}
            variant="outline"
            size="sm"
          >
            Clear
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-hidden">
          {/* Code Editor */}
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-medium mb-2">Python Code</h3>
            <Textarea
              placeholder="Enter your Python code here... 
              
# The uploaded data is available as 'df' (pandas DataFrame)
# Example:
print(df.head())
print(df.describe())
"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 font-mono text-sm resize-none"
              style={{ minHeight: '300px' }}
            />
          </div>

          {/* Output */}
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-medium mb-2">Output</h3>
            <ScrollArea className="flex-1 border rounded-md p-3 bg-muted/50">
              {isExecuting ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Executing Python code...
                </div>
              ) : (
                <pre className="text-sm whitespace-pre-wrap font-mono break-words">
                  {output || 'No output yet. Run some code to see results here.'}
                </pre>
              )}
            </ScrollArea>
          </div>
        </div>

        {!selectedFile && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Upload a data file from the left panel to access it as 'df' in your Python code. 
              The sandbox includes pandas, numpy, matplotlib, seaborn, and scipy for data analysis.
            </p>
          </div>
        )}
      </CardContent>
    </div>
  )
}