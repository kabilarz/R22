'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, Play, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'

interface PythonExecutionDemoProps {
  selectedFile: any | null
  isBackendReady: boolean
}

export function PythonExecutionDemo({ selectedFile, isBackendReady }: PythonExecutionDemoProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<string | null>(null)
  const [executionError, setExecutionError] = useState<string | null>(null)

  const executeQuickAnalysis = async () => {
    if (!selectedFile || !isBackendReady) {
      toast.error('Please ensure a file is selected and backend is ready')
      return
    }

    setIsExecuting(true)
    setExecutionResult(null)
    setExecutionError(null)

    const quickAnalysisCode = `
# 🏥 QUICK MEDICAL DATA ANALYSIS
print("🏥 MEDICAL DATA ANALYSIS REPORT")
print("=" * 40)

# Dataset Overview
print(f"📊 Dataset: {len(df)} patients")
print(f"📊 Variables: {list(df.columns)}")

# Basic Statistics
numeric_cols = df.select_dtypes(include=['number']).columns
if len(numeric_cols) > 0:
    print("\\n📈 NUMERIC VARIABLES SUMMARY:")
    for col in numeric_cols:
        print(f"  {col}:")
        print(f"    Mean: {df[col].mean():.2f}")
        print(f"    Range: {df[col].min():.1f} - {df[col].max():.1f}")
        print(f"    Missing: {df[col].isnull().sum()} values")

# Gender Distribution (if available)
gender_cols = [col for col in df.columns if 'gender' in col.lower() or 'sex' in col.lower()]
if gender_cols:
    gender_col = gender_cols[0]
    print(f"\\n👥 GENDER DISTRIBUTION ({gender_col}):")
    gender_counts = df[gender_col].value_counts()
    for gender, count in gender_counts.items():
        percentage = (count / len(df)) * 100
        print(f"  {gender}: {count} ({percentage:.1f}%)")

# Age Analysis (if available)
age_cols = [col for col in df.columns if 'age' in col.lower()]
if age_cols:
    age_col = age_cols[0]
    print(f"\\n🎂 AGE ANALYSIS ({age_col}):")
    print(f"  Average age: {df[age_col].mean():.1f} years")
    print(f"  Age range: {df[age_col].min():.0f} - {df[age_col].max():.0f} years")

print("\\n✅ Quick analysis complete!")
`

    try {
      const result = await apiClient.executePythonCode(
        quickAnalysisCode,
        selectedFile.name,
        selectedFile.data
      )

      if (result.success) {
        setExecutionResult(result.output)
        toast.success('Python analysis executed successfully!')
      } else {
        setExecutionError(result.error || 'Unknown error occurred')
        toast.error('Python execution failed')
      }
    } catch (error) {
      setExecutionError(`Error: ${error}`)
      toast.error('Failed to execute Python code')
    } finally {
      setIsExecuting(false)
    }
  }

  const executeCorrelationAnalysis = async () => {
    if (!selectedFile || !isBackendReady) {
      toast.error('Please ensure a file is selected and backend is ready')
      return
    }

    setIsExecuting(true)
    setExecutionResult(null)
    setExecutionError(null)

    const correlationCode = `
# 🔗 CORRELATION ANALYSIS
import numpy as np
from scipy import stats

print("🔗 CORRELATION ANALYSIS")
print("=" * 30)

# Get numeric columns
numeric_cols = df.select_dtypes(include=['number']).columns
print(f"📊 Analyzing {len(numeric_cols)} numeric variables")
print(f"Variables: {list(numeric_cols)}")

if len(numeric_cols) >= 2:
    print("\\n📈 CORRELATION MATRIX:")
    corr_matrix = df[numeric_cols].corr()
    
    # Display correlation matrix
    print(corr_matrix.round(3))
    
    # Find strong correlations
    print("\\n🔍 STRONG CORRELATIONS (|r| > 0.5):")
    strong_corrs = []
    for i in range(len(corr_matrix.columns)):
        for j in range(i+1, len(corr_matrix.columns)):
            corr_val = corr_matrix.iloc[i, j]
            if abs(corr_val) > 0.5:
                var1, var2 = corr_matrix.columns[i], corr_matrix.columns[j]
                print(f"  {var1} ↔ {var2}: r = {corr_val:.3f}")
                strong_corrs.append((var1, var2, corr_val))
    
    if not strong_corrs:
        print("  No strong correlations found (all |r| ≤ 0.5)")
    
    print(f"\\n✅ Correlation analysis complete! Found {len(strong_corrs)} strong correlations.")
else:
    print("\\n⚠️  Need at least 2 numeric variables for correlation analysis")
`

    try {
      const result = await apiClient.executePythonCode(
        correlationCode,
        selectedFile.name,
        selectedFile.data
      )

      if (result.success) {
        setExecutionResult(result.output)
        toast.success('Correlation analysis completed!')
      } else {
        setExecutionError(result.error || 'Unknown error occurred')
        toast.error('Correlation analysis failed')
      }
    } catch (error) {
      setExecutionError(`Error: ${error}`)
      toast.error('Failed to execute correlation analysis')
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Python Statistical Analysis
          {isBackendReady ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-600 border-red-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Backend Not Ready
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={executeQuickAnalysis}
            disabled={!selectedFile || !isBackendReady || isExecuting}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {isExecuting ? 'Running...' : 'Quick Analysis'}
          </Button>
          
          <Button
            onClick={executeCorrelationAnalysis}
            disabled={!selectedFile || !isBackendReady || isExecuting}
            size="sm"
            variant="outline"
          >
            <Play className="h-4 w-4 mr-2" />
            Correlation Analysis
          </Button>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="text-sm text-muted-foreground">
            📄 Selected: {selectedFile.name} ({selectedFile.data.length} rows)
          </div>
        )}

        {/* Execution Result */}
        {executionResult && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <h4 className="font-medium text-green-800 mb-2">✅ Execution Results:</h4>
            <pre className="text-xs font-mono whitespace-pre-wrap text-green-900 overflow-x-auto">
              {executionResult}
            </pre>
          </div>
        )}

        {/* Execution Error */}
        {executionError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 className="font-medium text-red-800 mb-2">❌ Execution Error:</h4>
            <pre className="text-xs font-mono whitespace-pre-wrap text-red-900">
              {executionError}
            </pre>
          </div>
        )}

        {/* Instructions */}
        {!selectedFile && (
          <div className="text-center py-4 text-muted-foreground">
            <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Select a dataset to run Python statistical analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}