/**
 * Statistical Test Suggestion Engine
 * Analyzes user queries and data to recommend appropriate statistical tests
 */

export interface StatisticalTest {
  id: string
  name: string
  description: string
  category: 'comparison' | 'association' | 'descriptive' | 'regression' | 'survival'
  dataRequirements: {
    minSampleSize: number
    groupTypes: ('continuous' | 'categorical' | 'binary')[]
    assumptions: string[]
  }
  useCases: string[]
  visualizations: string[]
  confidenceScore: number
}

export interface TestSuggestion {
  test: StatisticalTest
  reasoning: string
  codeTemplate: string
  visualizationCode: string
}

export interface SuggestionQuery {
  query: string
  dataContext: {
    columns: string[]
    sampleData: any[]
    rowCount: number
  }
}

export class TestSuggestionEngine {
  private staticTests: StatisticalTest[] = [
    {
      id: 'independent_ttest',
      name: 'Independent T-Test',
      description: 'Compare means between two independent groups',
      category: 'comparison',
      dataRequirements: {
        minSampleSize: 10,
        groupTypes: ['categorical', 'continuous'],
        assumptions: ['Normal distribution', 'Equal variances', 'Independent observations']
      },
      useCases: [
        'Compare treatment vs control groups',
        'Compare outcomes between genders',
        'Compare drug A vs drug B effectiveness'
      ],
      visualizations: ['Box plot', 'Violin plot', 'Mean comparison chart'],
      confidenceScore: 0.9
    },
    {
      id: 'chi_square',
      name: 'Chi-Square Test',
      description: 'Test independence between categorical variables',
      category: 'association',
      dataRequirements: {
        minSampleSize: 5,
        groupTypes: ['categorical', 'categorical'],
        assumptions: ['Expected frequencies ≥ 5', 'Independent observations']
      },
      useCases: [
        'Test vaccination status vs infection',
        'Analyze gender vs disease prevalence',
        'Study treatment response categories'
      ],
      visualizations: ['Contingency table heatmap', 'Grouped bar chart', 'Mosaic plot'],
      confidenceScore: 0.85
    },
    {
      id: 'mann_whitney',
      name: 'Mann-Whitney U Test',
      description: 'Non-parametric comparison of two groups',
      category: 'comparison',
      dataRequirements: {
        minSampleSize: 6,
        groupTypes: ['categorical', 'continuous'],
        assumptions: ['Independent observations', 'Ordinal or continuous data']
      },
      useCases: [
        'Compare groups with non-normal data',
        'Analyze ordinal scale responses',
        'Compare small sample groups'
      ],
      visualizations: ['Box plot', 'Rank comparison', 'Distribution overlay'],
      confidenceScore: 0.8
    },
    {
      id: 'anova',
      name: 'One-Way ANOVA',
      description: 'Compare means across three or more groups',
      category: 'comparison',
      dataRequirements: {
        minSampleSize: 15,
        groupTypes: ['categorical', 'continuous'],
        assumptions: ['Normal distribution', 'Equal variances', 'Independent observations']
      },
      useCases: [
        'Compare multiple treatment groups',
        'Analyze outcomes across age groups',
        'Compare effectiveness of 3+ interventions'
      ],
      visualizations: ['Box plot', 'Mean plot with CI', 'ANOVA table'],
      confidenceScore: 0.85
    },
    {
      id: 'correlation',
      name: 'Pearson Correlation',
      description: 'Measure linear relationship between continuous variables',
      category: 'association',
      dataRequirements: {
        minSampleSize: 20,
        groupTypes: ['continuous', 'continuous'],
        assumptions: ['Linear relationship', 'Normal distribution', 'No extreme outliers']
      },
      useCases: [
        'Analyze relationship between BMI and blood pressure',
        'Study age vs biomarker levels',
        'Correlate dose with response'
      ],
      visualizations: ['Scatter plot', 'Correlation matrix', 'Regression line'],
      confidenceScore: 0.9
    },
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      description: 'Model binary outcomes with predictors',
      category: 'regression',
      dataRequirements: {
        minSampleSize: 50,
        groupTypes: ['continuous', 'binary'],
        assumptions: ['Linear relationship with log-odds', 'Independent observations']
      },
      useCases: [
        'Predict disease presence/absence',
        'Model treatment success/failure',
        'Analyze risk factors for binary outcomes'
      ],
      visualizations: ['ROC curve', 'Predicted probability plot', 'Odds ratio forest plot'],
      confidenceScore: 0.8
    }
  ]

  /**
   * Analyze query and suggest appropriate statistical tests
   */
  async suggestTests(query: SuggestionQuery): Promise<TestSuggestion[]> {
    const queryText = query.query.toLowerCase()
    const dataInfo = this.analyzeDataStructure(query.dataContext)
    
    const suggestions: TestSuggestion[] = []
    
    for (const test of this.staticTests) {
      const relevanceScore = this.calculateRelevance(queryText, test, dataInfo)
      
      if (relevanceScore > 0.4) {
        const suggestion: TestSuggestion = {
          test: {
            ...test,
            confidenceScore: relevanceScore
          },
          reasoning: this.generateReasoning(test, queryText, dataInfo),
          codeTemplate: this.generateCodeTemplate(test, query.dataContext),
          visualizationCode: this.generateVisualizationCode(test, query.dataContext)
        }
        
        suggestions.push(suggestion)
      }
    }
    
    // Sort by confidence score
    return suggestions.sort((a, b) => b.test.confidenceScore - a.test.confidenceScore)
  }

  /**
   * Analyze data structure to determine variable types
   */
  private analyzeDataStructure(dataContext: any) {
    const { columns, sampleData, rowCount } = dataContext
    
    const variableTypes: { [key: string]: 'continuous' | 'categorical' | 'binary' } = {}
    
    if (sampleData && sampleData.length > 0) {
      for (const column of columns) {
        const values = sampleData.map(row => row[column]).filter(v => v != null)
        
        if (values.length === 0) continue
        
        // Check if all values are numbers
        const numericValues = values.filter(v => typeof v === 'number' || !isNaN(Number(v)))
        
        if (numericValues.length === values.length) {
          // Check if binary (only 0,1 or true/false)
          const uniqueValues = [...new Set(values)]
          if (uniqueValues.length === 2) {
            variableTypes[column] = 'binary'
          } else {
            variableTypes[column] = 'continuous'
          }
        } else {
          // Check if binary categorical
          const uniqueValues = [...new Set(values)]
          if (uniqueValues.length === 2) {
            variableTypes[column] = 'binary'
          } else {
            variableTypes[column] = 'categorical'
          }
        }
      }
    }
    
    return {
      variableTypes,
      sampleSize: rowCount,
      columnCount: columns.length
    }
  }

  /**
   * Calculate relevance score for a test given query and data
   */
  private calculateRelevance(queryText: string, test: StatisticalTest, dataInfo: any): number {
    let score = 0
    
    // Check query keywords
    const keywords = {
      comparison: ['compare', 'difference', 'vs', 'versus', 'between', 'groups'],
      association: ['relationship', 'correlation', 'associated', 'related', 'predict'],
      vaccination: ['vaccinated', 'unvaccinated', 'vaccine', 'immunization'],
      treatment: ['treatment', 'control', 'intervention', 'therapy', 'drug'],
      gender: ['male', 'female', 'gender', 'sex'],
      ttest: ['t-test', 'ttest', 'mean difference']
    }
    
    // Score based on query content
    if (test.category === 'comparison' && keywords.comparison.some(k => queryText.includes(k))) {
      score += 0.4
    }
    
    if (test.category === 'association' && keywords.association.some(k => queryText.includes(k))) {
      score += 0.4
    }
    
    // Specific test mentions
    if (test.id === 'independent_ttest' && 
        (keywords.vaccination.some(k => queryText.includes(k)) || 
         keywords.treatment.some(k => queryText.includes(k)) ||
         keywords.gender.some(k => queryText.includes(k)))) {
      score += 0.3
    }
    
    if (test.id === 'chi_square' && 
        queryText.includes('categorical') || 
        keywords.vaccination.some(k => queryText.includes(k))) {
      score += 0.3
    }
    
    // Check sample size requirements
    if (dataInfo.sampleSize >= test.dataRequirements.minSampleSize) {
      score += 0.2
    } else {
      score -= 0.3
    }
    
    // Check use case matches
    const useCaseMatch = test.useCases.some(useCase => 
      useCase.toLowerCase().split(' ').some(word => queryText.includes(word))
    )
    if (useCaseMatch) {
      score += 0.2
    }
    
    return Math.min(Math.max(score, 0), 1)
  }

  /**
   * Generate reasoning for why this test was suggested
   */
  private generateReasoning(test: StatisticalTest, queryText: string, dataInfo: any): string {
    const reasons = []
    
    if (queryText.includes('compare') || queryText.includes('vs') || queryText.includes('between')) {
      reasons.push(`Your query involves comparing groups, which ${test.name} is designed for`)
    }
    
    if (dataInfo.sampleSize >= test.dataRequirements.minSampleSize) {
      reasons.push(`Your sample size (${dataInfo.sampleSize}) meets the minimum requirement (${test.dataRequirements.minSampleSize})`)
    }
    
    if (test.useCases.some(useCase => queryText.includes(useCase.toLowerCase().split(' ')[0]))) {
      reasons.push(`This test is commonly used for similar analyses in medical research`)
    }
    
    return reasons.join('. ') + '.'
  }

  /**
   * Generate code template for the test with DuckDB integration
   */
  private generateCodeTemplate(test: StatisticalTest, dataContext: any): string {
    const { columns } = dataContext
    
    switch (test.id) {
      case 'independent_ttest':
        return `
# Independent T-Test Analysis with DuckDB
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
import duckdb

# Data is already loaded as 'df' from DuckDB
# Assuming group_column and value_column are identified
group_col = '${this.suggestGroupColumn(columns)}'  # Modify as needed
value_col = '${this.suggestValueColumn(columns)}'  # Modify as needed

# Perform t-test
group1 = df[df[group_col] == df[group_col].unique()[0]][value_col]
group2 = df[df[group_col] == df[group_col].unique()[1]][value_col]

t_stat, p_value = stats.ttest_ind(group1, group2)

print(f"T-Test Results:")
print(f"T-statistic: {t_stat:.4f}")
print(f"P-value: {p_value:.4f}")
print(f"Significant: {'Yes' if p_value < 0.05 else 'No'}")

# Group statistics
print(f"\\nGroup Statistics:")
print(f"Group 1 mean: {group1.mean():.2f} (n={len(group1)})")
print(f"Group 2 mean: {group2.mean():.2f} (n={len(group2)})")
`

      case 'chi_square':
        return `
# Chi-Square Test of Independence with DuckDB
import pandas as pd
from scipy.stats import chi2_contingency
import matplotlib.pyplot as plt
import seaborn as sns

# Data is already loaded as 'df' from DuckDB
# Create contingency table
var1 = '${this.suggestCategoricalColumn(columns, 0)}'  # Modify as needed
var2 = '${this.suggestCategoricalColumn(columns, 1)}'  # Modify as needed

contingency_table = pd.crosstab(df[var1], df[var2])
print("Contingency Table:")
print(contingency_table)

# Perform chi-square test
chi2, p_value, dof, expected = chi2_contingency(contingency_table)

print(f"\\nChi-Square Test Results:")
print(f"Chi-square statistic: {chi2:.4f}")
print(f"P-value: {p_value:.4f}")
print(f"Degrees of freedom: {dof}")
print(f"Significant: {'Yes' if p_value < 0.05 else 'No'}")
`

      case 'correlation':
        return `
# Pearson Correlation Analysis with DuckDB
import pandas as pd
import numpy as np
from scipy.stats import pearsonr
import matplotlib.pyplot as plt
import seaborn as sns

# Data is already loaded as 'df' from DuckDB
# Select numeric columns
var1 = '${this.suggestNumericColumn(columns, 0)}'  # Modify as needed
var2 = '${this.suggestNumericColumn(columns, 1)}'  # Modify as needed

# Calculate correlation
correlation, p_value = pearsonr(df[var1], df[var2])

print(f"Correlation Analysis:")
print(f"Pearson correlation: {correlation:.4f}")
print(f"P-value: {p_value:.4f}")
print(f"Significant: {'Yes' if p_value < 0.05 else 'No'}")

# Interpretation
if abs(correlation) > 0.7:
    strength = "strong"
elif abs(correlation) > 0.3:
    strength = "moderate"
else:
    strength = "weak"

print(f"Relationship strength: {strength}")
`

      default:
        return `
# ${test.name} Analysis
# 📊 Data is already loaded from DuckDB as 'df' - no need to read files!

print("🏥 ${test.name.toUpperCase()}")
print("=" * 40)

# df is automatically provided by DuckDB integration
print(f"Dataset: {df.shape[0]} patients, {df.shape[1]} variables")
print(f"Columns: {list(df.columns)}")

print("\n📈 ${test.description}")
print("\nBasic dataset info:")
print(df.info())

print("\n📉 Sample data:")
print(df.head())

print("\n✅ ANALYSIS TEMPLATE READY - Modify as needed!")
`
    }
  }

  /**
   * Generate visualization code for the test
   */
  private generateVisualizationCode(test: StatisticalTest, dataContext: any): string {
    const { columns } = dataContext
    
    switch (test.id) {
      case 'independent_ttest':
        return `
# Visualization for T-Test
plt.figure(figsize=(12, 8))

# Box plot comparison
plt.subplot(2, 2, 1)
sns.boxplot(data=df, x=group_col, y=value_col)
plt.title('Box Plot Comparison')
plt.ylabel(value_col)

# Violin plot
plt.subplot(2, 2, 2)
sns.violinplot(data=df, x=group_col, y=value_col)
plt.title('Distribution Comparison')

# Histogram overlay
plt.subplot(2, 2, 3)
for group in df[group_col].unique():
    subset = df[df[group_col] == group][value_col]
    plt.hist(subset, alpha=0.6, label=group, bins=15)
plt.legend()
plt.title('Histogram Overlay')
plt.xlabel(value_col)

# Mean comparison with error bars
plt.subplot(2, 2, 4)
means = df.groupby(group_col)[value_col].mean()
stds = df.groupby(group_col)[value_col].std()
plt.bar(means.index, means.values, yerr=stds.values, capsize=5)
plt.title('Mean Comparison with SD')
plt.ylabel(value_col)

plt.tight_layout()
plt.show()
`

      case 'chi_square':
        return `
# Visualization for Chi-Square Test
plt.figure(figsize=(12, 6))

# Contingency table heatmap
plt.subplot(1, 2, 1)
sns.heatmap(contingency_table, annot=True, fmt='d', cmap='Blues')
plt.title('Contingency Table Heatmap')

# Grouped bar chart
plt.subplot(1, 2, 2)
contingency_table.plot(kind='bar', ax=plt.gca())
plt.title('Grouped Bar Chart')
plt.xlabel(var1)
plt.ylabel('Count')
plt.legend(title=var2)
plt.xticks(rotation=45)

plt.tight_layout()
plt.show()
`

      case 'correlation':
        return `
# Visualization for Correlation
plt.figure(figsize=(12, 8))

# Scatter plot with regression line
plt.subplot(2, 2, 1)
sns.scatterplot(data=df, x=var1, y=var2)
sns.regplot(data=df, x=var1, y=var2, scatter=False, color='red')
plt.title(f'Scatter Plot (r={correlation:.3f})')

# Correlation matrix (if more variables)
numeric_cols = df.select_dtypes(include=[np.number]).columns
if len(numeric_cols) > 2:
    plt.subplot(2, 2, 2)
    corr_matrix = df[numeric_cols].corr()
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0)
    plt.title('Correlation Matrix')

# Distribution plots
plt.subplot(2, 2, 3)
plt.hist(df[var1], alpha=0.7, bins=20)
plt.title(f'Distribution of {var1}')
plt.xlabel(var1)

plt.subplot(2, 2, 4)
plt.hist(df[var2], alpha=0.7, bins=20)
plt.title(f'Distribution of {var2}')
plt.xlabel(var2)

plt.tight_layout()
plt.show()
`

      default:
        return `
# Basic visualization
plt.figure(figsize=(10, 6))
plt.subplot(1, 1, 1)
# Add appropriate visualization based on data types
plt.title('${test.name} Visualization')
plt.show()
`
    }
  }

  // Helper methods to suggest appropriate columns
  private suggestGroupColumn(columns: string[]): string {
    const groupKeywords = ['group', 'treatment', 'gender', 'sex', 'status', 'category', 'type']
    for (const col of columns) {
      if (groupKeywords.some(keyword => col.toLowerCase().includes(keyword))) {
        return col
      }
    }
    return columns[0] || 'group_column'
  }

  private suggestValueColumn(columns: string[]): string {
    const valueKeywords = ['score', 'value', 'measurement', 'level', 'count', 'age', 'weight', 'pressure']
    for (const col of columns) {
      if (valueKeywords.some(keyword => col.toLowerCase().includes(keyword))) {
        return col
      }
    }
    return columns[1] || 'value_column'
  }

  private suggestCategoricalColumn(columns: string[], index: number): string {
    const catKeywords = ['group', 'category', 'type', 'status', 'gender', 'treatment']
    const matching = columns.filter(col => 
      catKeywords.some(keyword => col.toLowerCase().includes(keyword))
    )
    return matching[index] || columns[index] || 'categorical_column'
  }

  private suggestNumericColumn(columns: string[], index: number): string {
    const numKeywords = ['age', 'score', 'value', 'count', 'level', 'measurement', 'pressure', 'weight']
    const matching = columns.filter(col => 
      numKeywords.some(keyword => col.toLowerCase().includes(keyword))
    )
    return matching[index] || columns[index] || 'numeric_column'
  }
}

export const testSuggestionEngine = new TestSuggestionEngine()