/**
 * Data Context Analyzer - Intelligent data understanding system
 * Analyzes datasets and provides context-aware responses
 */

export interface DataColumn {
  name: string
  type: 'numeric' | 'categorical' | 'datetime' | 'text'
  uniqueValues?: number
  nullCount?: number
  sampleValues?: any[]
  medicalContext?: string
  statisticalRole?: 'outcome' | 'predictor' | 'demographic' | 'temporal'
}

export interface DataContext {
  fileName: string
  rowCount: number
  columnCount: number
  columns: DataColumn[]
  datasetType: 'clinical_trial' | 'survey' | 'longitudinal' | 'cross_sectional' | 'unknown'
  medicalDomain?: string
  timePoints?: string[]
  primaryOutcomes?: string[]
  potentialAnalyses: string[]
  dataQualityIssues: string[]
}

export interface AnalysisSuggestion {
  name: string
  description: string
  complexity: 'basic' | 'intermediate' | 'advanced'
  requiredColumns: string[]
  medicalRelevance: string
  expectedOutput: string
}

export class DataContextAnalyzer {
  private medicalTerms = {
    bloodPressure: ['bp', 'blood_pressure', 'systolic', 'diastolic', 'hypertension'],
    demographics: ['age', 'gender', 'sex', 'ethnicity', 'race', 'height', 'weight', 'bmi'],
    cardiac: ['ecg', 'heart_rate', 'cardiac', 'cardiovascular', 'cholesterol'],
    clinical: ['treatment', 'drug', 'medication', 'dose', 'intervention'],
    outcomes: ['outcome', 'response', 'efficacy', 'adverse', 'side_effect'],
    temporal: ['baseline', 'week', 'month', 'follow_up', 'visit', 'day'],
    biomarkers: ['biomarker', 'lab', 'glucose', 'hba1c', 'creatinine', 'ldl', 'hdl'],
    quality: ['quality_of_life', 'qol', 'satisfaction', 'pain', 'function']
  }

  analyzeDataset(data: any[], fileName: string): DataContext {
    if (!data || data.length === 0) {
      throw new Error('No data provided for analysis')
    }

    const columns = this.analyzeColumns(data)
    const datasetType = this.inferDatasetType(columns, fileName)
    const medicalDomain = this.identifyMedicalDomain(columns)
    const timePoints = this.extractTimePoints(columns)
    const primaryOutcomes = this.identifyPrimaryOutcomes(columns)
    const potentialAnalyses = this.generateColumnBasedAnalysisSuggestions(columns, datasetType)
    const dataQualityIssues = this.assessDataQuality(data, columns)

    return {
      fileName,
      rowCount: data.length,
      columnCount: columns.length,
      columns,
      datasetType,
      medicalDomain,
      timePoints,
      primaryOutcomes,
      potentialAnalyses,
      dataQualityIssues
    }
  }

  private analyzeColumns(data: any[]): DataColumn[] {
    const firstRow = data[0]
    if (!firstRow) return []

    return Object.keys(firstRow).map(columnName => {
      const column: DataColumn = {
        name: columnName,
        type: this.inferColumnType(data, columnName),
        uniqueValues: this.countUniqueValues(data, columnName),
        nullCount: this.countNullValues(data, columnName),
        sampleValues: this.getSampleValues(data, columnName),
        medicalContext: this.identifyMedicalContext(columnName),
        statisticalRole: this.inferStatisticalRole(columnName)
      }
      
      return column
    })
  }

  private inferColumnType(data: any[], columnName: string): 'numeric' | 'categorical' | 'datetime' | 'text' {
    const values = data.map(row => row[columnName]).filter(v => v !== null && v !== undefined && v !== '')
    
    if (values.length === 0) return 'text'

    // Check for numeric
    const numericValues = values.filter(v => !isNaN(parseFloat(v)))
    if (numericValues.length > values.length * 0.8) return 'numeric'

    // Check for datetime
    const datePattern = /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/
    if (values.some(v => datePattern.test(String(v)))) return 'datetime'

    // Check for categorical (limited unique values)
    const uniqueCount = new Set(values).size
    if (uniqueCount <= Math.min(20, values.length * 0.1)) return 'categorical'

    return 'text'
  }

  private countUniqueValues(data: any[], columnName: string): number {
    const values = data.map(row => row[columnName]).filter(v => v !== null && v !== undefined)
    return new Set(values).size
  }

  private countNullValues(data: any[], columnName: string): number {
    return data.filter(row => {
      const value = row[columnName]
      return value === null || value === undefined || value === ''
    }).length
  }

  private getSampleValues(data: any[], columnName: string): any[] {
    const values = data.map(row => row[columnName])
      .filter(v => v !== null && v !== undefined && v !== '')
      .slice(0, 5)
    return values
  }

  private identifyMedicalContext(columnName: string): string {
    const lowerName = columnName.toLowerCase()
    
    for (const [category, terms] of Object.entries(this.medicalTerms)) {
      if (terms.some(term => lowerName.includes(term))) {
        return category
      }
    }
    
    return 'general'
  }

  private inferStatisticalRole(columnName: string): 'outcome' | 'predictor' | 'demographic' | 'temporal' {
    const lowerName = columnName.toLowerCase()
    
    if (lowerName.includes('outcome') || lowerName.includes('response') || 
        lowerName.includes('change') || lowerName.includes('final')) {
      return 'outcome'
    }
    
    if (lowerName.includes('baseline') || lowerName.includes('week') || 
        lowerName.includes('visit') || lowerName.includes('time')) {
      return 'temporal'
    }
    
    if (['age', 'gender', 'sex', 'ethnicity', 'height', 'weight', 'bmi'].some(demo => 
        lowerName.includes(demo))) {
      return 'demographic'
    }
    
    return 'predictor'
  }

  private inferDatasetType(columns: DataColumn[], fileName: string): DataContext['datasetType'] {
    const columnNames = columns.map(c => c.name.toLowerCase()).join(' ')
    const fileNameLower = fileName.toLowerCase()
    
    if (fileNameLower.includes('clinical_trial') || 
        columnNames.includes('treatment') || 
        columnNames.includes('intervention')) {
      return 'clinical_trial'
    }
    
    if (columnNames.includes('baseline') && 
        (columnNames.includes('week') || columnNames.includes('follow'))) {
      return 'longitudinal'
    }
    
    if (fileNameLower.includes('survey') || 
        columnNames.includes('satisfaction') || 
        columnNames.includes('rating')) {
      return 'survey'
    }
    
    return 'cross_sectional'
  }

  private identifyMedicalDomain(columns: DataColumn[]): string {
    const contexts = columns.map(c => c.medicalContext || 'general')
    
    const contextCounts = contexts.reduce((acc, context) => {
      acc[context] = (acc[context] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantContext = Object.entries(contextCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
    
    const domainMap: Record<string, string> = {
      bloodPressure: 'Cardiology/Hypertension',
      cardiac: 'Cardiology',
      biomarkers: 'Laboratory Medicine',
      quality: 'Patient-Reported Outcomes',
      clinical: 'Clinical Research',
      demographics: 'Population Health'
    }
    
    return domainMap[dominantContext] || 'General Medicine'
  }

  private extractTimePoints(columns: DataColumn[]): string[] {
    const timePoints = new Set<string>()
    
    columns.forEach(column => {
      const name = column.name.toLowerCase()
      
      // Extract time points like "baseline", "week_4", "month_3"
      const timePatterns = [
        /baseline/,
        /week[_\s]*(\d+)/,
        /month[_\s]*(\d+)/,
        /day[_\s]*(\d+)/,
        /visit[_\s]*(\d+)/,
        /follow[_\s]*up/
      ]
      
      timePatterns.forEach(pattern => {
        const match = name.match(pattern)
        if (match) {
          timePoints.add(match[0])
        }
      })
    })
    
    return Array.from(timePoints).sort()
  }

  private identifyPrimaryOutcomes(columns: DataColumn[]): string[] {
    return columns
      .filter(col => 
        col.statisticalRole === 'outcome' || 
        col.name.toLowerCase().includes('change') ||
        col.name.toLowerCase().includes('final')
      )
      .map(col => col.name)
  }

  private generateColumnBasedAnalysisSuggestions(columns: DataColumn[], datasetType: DataContext['datasetType']): string[] {
    const suggestions: string[] = []
    
    // Basic descriptive analyses
    suggestions.push('Descriptive statistics and data summary')
    suggestions.push('Data quality assessment and missing value analysis')
    
    // Based on dataset type
    if (datasetType === 'clinical_trial') {
      suggestions.push('Treatment group comparison')
      suggestions.push('Efficacy analysis')
      suggestions.push('Safety profile assessment')
    }
    
    if (datasetType === 'longitudinal') {
      suggestions.push('Change over time analysis')
      suggestions.push('Trajectory modeling')
    }
    
    // Based on available columns
    const hasOutcomes = columns.some(c => c.statisticalRole === 'outcome')
    const hasDemographics = columns.some(c => c.statisticalRole === 'demographic')
    const hasTreatment = columns.some(c => c.name.toLowerCase().includes('treatment'))
    
    if (hasOutcomes && hasTreatment) {
      suggestions.push('Treatment effect analysis')
    }
    
    if (hasDemographics) {
      suggestions.push('Subgroup analysis by demographics')
    }
    
    // Medical domain specific
    const medicalContexts = columns.map(c => c.medicalContext)
    if (medicalContexts.includes('bloodPressure')) {
      suggestions.push('Blood pressure control analysis')
      suggestions.push('Hypertension management assessment')
    }
    
    return suggestions
  }

  private assessDataQuality(data: any[], columns: DataColumn[]): string[] {
    const issues: string[] = []
    
    // Check for high missing data
    columns.forEach(column => {
      const missingPercentage = (column.nullCount! / data.length) * 100
      if (missingPercentage > 20) {
        issues.push(`High missing data in ${column.name} (${missingPercentage.toFixed(1)}%)`)
      }
    })
    
    // Check for potential data entry errors
    const numericColumns = columns.filter(c => c.type === 'numeric')
    numericColumns.forEach(column => {
      // This would need actual data analysis, simplified here
      if (column.name.toLowerCase().includes('age')) {
        // Check for unrealistic age values
        const ages = data.map(row => row[column.name]).filter(age => !isNaN(age))
        if (ages.some(age => age < 0 || age > 120)) {
          issues.push(`Potential data entry errors in ${column.name} (unrealistic values)`)
        }
      }
    })
    
    return issues
  }

  generateDataExplanation(context: DataContext): string {
    let explanation = `## 📊 Dataset Overview: ${context.fileName}\n\n`
    
    // Enhanced introduction with specific dataset information
    explanation += `### What's the data about?\n\n`
    
    // Determine study type and participant count
    const participantDescription = context.rowCount === 1 ? 'participant' : 'participants';
    const studyType = context.datasetType === 'clinical_trial' ? 'clinical trial' : 
                     context.datasetType === 'longitudinal' ? 'longitudinal study' :
                     context.datasetType === 'survey' ? 'survey' : 'study';
    
    explanation += `This dataset contains data from **${context.rowCount} ${participantDescription}** who participated in a ${studyType} in the field of **${context.medicalDomain}**.\n\n`
    
    // Add specific information based on dataset characteristics
    if (context.datasetType === 'clinical_trial') {
      explanation += `The study investigates treatment effects and outcomes for participants, with data collected at multiple time points to assess changes over time.\n\n`
    }
    
    if (context.datasetType === 'longitudinal') {
      explanation += `The study follows participants over time to observe changes and trends in their health outcomes.\n\n`
    }
    
    explanation += `### Dataset Summary\n`
    explanation += `- **${context.rowCount} participants/records**\n`
    explanation += `- **${context.columnCount} variables/columns**\n\n`
    
    if (context.timePoints && context.timePoints.length > 0) {
      explanation += `### ⏱️ Study Timeline\n`
      explanation += `Time points: ${context.timePoints.join(', ')}\n\n`
    }
    
    if (context.primaryOutcomes && context.primaryOutcomes.length > 0) {
      explanation += `### 🎯 Primary Outcomes\n`
      explanation += context.primaryOutcomes.map(outcome => `- ${outcome}`).join('\n') + '\n\n'
    }
    
    // Group columns by medical context
    const groupedColumns = this.groupColumnsByContext(context.columns)
    
    explanation += `### 📋 Data Categories\n\n`
    Object.entries(groupedColumns).forEach(([category, cols]) => {
      if (cols.length > 0) {
        explanation += `**${this.formatCategoryName(category)}** (${cols.length} variables):\n`
        explanation += cols.slice(0, 5).map(col => `- ${col.name}`).join('\n')
        if (cols.length > 5) {
          explanation += `\n- ... and ${cols.length - 5} more\n`
        }
        explanation += '\n\n'
      }
    })
    
    if (context.dataQualityIssues.length > 0) {
      explanation += `### ⚠️ Data Quality Notes\n`
      explanation += context.dataQualityIssues.map(issue => `- ${issue}`).join('\n') + '\n\n'
    }
    
    explanation += `### 🔍 What You Can Analyze\n\n`
    explanation += `Based on your data, here are the **key research questions** you can explore:\n\n`
    
    // Add specific analysis suggestions with explanations
    if (context.datasetType === 'clinical_trial') {
      explanation += `**🏥 Clinical Trial Analyses:**\n`
      explanation += `- **Treatment Effectiveness**: Compare outcomes between treatment groups to assess drug efficacy\n`
      explanation += `- **Safety Profile**: Analyze adverse events and side effects across different treatments\n`
      explanation += `- **Dose-Response Relationship**: Examine if higher doses lead to better outcomes\n`
      explanation += `- **Time-to-Effect**: Track how quickly treatments show measurable improvements\n\n`
    }
    
    // Blood pressure specific analyses
    const bpColumns = context.columns.filter(c => c.medicalContext === 'bloodPressure')
    if (bpColumns.length >= 2) {
      explanation += `**💓 Blood Pressure & Cardiovascular:**\n`
      explanation += `- **BP Control Analysis**: Measure how many patients achieved target blood pressure (<140/90)\n`
      explanation += `- **Treatment Response**: Calculate average BP reduction for each treatment group\n`
      explanation += `- **Risk Stratification**: Identify high-risk patients who need intensive management\n`
      explanation += `- **Cardiovascular Outcomes**: Link BP changes to heart health improvements\n\n`
    }
    
    // Demographics analyses
    const demographics = context.columns.filter(c => c.medicalContext === 'demographics')
    if (demographics.length > 0) {
      explanation += `**👥 Population & Demographics:**\n`
      explanation += `- **Subgroup Analysis**: Compare treatment effects across age groups, gender, and ethnicity\n`
      explanation += `- **Baseline Characteristics**: Describe your study population\n`
      explanation += `- **Health Disparities**: Identify if certain groups respond differently to treatment\n\n`
    }
    
    // Statistical tests suggestions
    explanation += `**📈 Statistical Tests You Can Run:**\n`
    explanation += `- **T-tests**: Compare means between two groups (e.g., treatment vs placebo)\n`
    explanation += `- **ANOVA**: Compare multiple treatment groups simultaneously\n`
    explanation += `- **Chi-square tests**: Analyze categorical outcomes (e.g., success rates)\n`
    explanation += `- **Correlation analysis**: Find relationships between variables\n`
    explanation += `- **Regression modeling**: Predict outcomes based on multiple factors\n\n`
    
    explanation += `**💡 Getting Started:**\n`
    explanation += `Simply ask me natural language questions like:\n`
    explanation += `- "Compare blood pressure between treatment groups"\n`
    explanation += `- "Show me the demographics of study participants"\n`
    explanation += `- "Which treatment works best for older patients?"\n`
    explanation += `- "Are there any safety concerns with the new drug?"\n`
    
    return explanation
  }

  private groupColumnsByContext(columns: DataColumn[]): Record<string, DataColumn[]> {
    return columns.reduce((groups, column) => {
      const context = column.medicalContext || 'general'
      if (!groups[context]) groups[context] = []
      groups[context].push(column)
      return groups
    }, {} as Record<string, DataColumn[]>)
  }

  private formatCategoryName(category: string): string {
    const nameMap: Record<string, string> = {
      bloodPressure: 'Blood Pressure & Cardiovascular',
      demographics: 'Demographics & Baseline Characteristics',
      cardiac: 'Cardiac Measurements',
      clinical: 'Clinical Interventions',
      outcomes: 'Clinical Outcomes',
      temporal: 'Time-based Measurements',
      biomarkers: 'Laboratory Biomarkers',
      quality: 'Quality of Life & Patient-Reported Outcomes',
      general: 'General Variables'
    }
    
    return nameMap[category] || category
  }

  generateDetailedAnalysisSuggestions(context: DataContext): AnalysisSuggestion[] {
    const suggestions: AnalysisSuggestion[] = []
    
    // Always include basic exploration
    suggestions.push({
      name: 'Data Exploration & Summary',
      description: 'Get an overview of your data with descriptive statistics, distributions, and data quality assessment',
      complexity: 'basic',
      requiredColumns: [],
      medicalRelevance: 'Essential first step to understand your dataset before any analysis',
      expectedOutput: 'Summary tables, histograms, missing data patterns'
    })
    
    // Treatment comparison (for clinical trials)
    if (context.datasetType === 'clinical_trial') {
      const treatmentCol = context.columns.find(c => c.name.toLowerCase().includes('treatment'))
      const outcomeCol = context.primaryOutcomes[0]
      
      if (treatmentCol && outcomeCol) {
        suggestions.push({
          name: 'Treatment Group Comparison',
          description: `Compare outcomes between treatment groups using statistical tests`,
          complexity: 'intermediate',
          requiredColumns: [treatmentCol.name, outcomeCol],
          medicalRelevance: 'Assess treatment efficacy and statistical significance',
          expectedOutput: 'Statistical test results, group comparison charts, effect sizes'
        })
      }
    }
    
    // Longitudinal analysis
    if (context.timePoints && context.timePoints.length > 1) {
      suggestions.push({
        name: 'Change Over Time Analysis',
        description: 'Analyze how variables change across different time points',
        complexity: 'intermediate',
        requiredColumns: context.timePoints,
        medicalRelevance: 'Track treatment response and disease progression over time',
        expectedOutput: 'Time series plots, change calculations, trend analysis'
      })
    }
    
    // Blood pressure specific analysis
    const bpColumns = context.columns.filter(c => c.medicalContext === 'bloodPressure')
    if (bpColumns.length >= 2) {
      suggestions.push({
        name: 'Blood Pressure Control Analysis',
        description: 'Analyze blood pressure control, target achievement, and cardiovascular risk',
        complexity: 'advanced',
        requiredColumns: bpColumns.map(c => c.name),
        medicalRelevance: 'Assess hypertension management and cardiovascular outcomes',
        expectedOutput: 'BP control rates, risk stratification, clinical target achievement'
      })
    }
    
    return suggestions
  }
}

// Export singleton instance
export const dataContextAnalyzer = new DataContextAnalyzer()