/**
 * Thread Management System for Medical Statistical Learning
 * Provides collapsible, one-level threading with statistical context
 */

export interface StatisticalContext {
  testType?: string
  assumptions?: string[]
  interpretation?: string
  medicalRelevance?: string
  nextSteps?: string[]
}

export interface Thread {
  id: string
  parentMessageId: string
  type: 'statistical_help' | 'code_explanation' | 'medical_context' | 'general'
  title: string
  content: string
  isCollapsed: boolean
  isDeleted: boolean
  statisticalContext?: StatisticalContext
  timestamp: Date
  relevantToCurrentAnalysis: boolean
}

export interface Message {
  id: string
  type: 'user' | 'assistant' | 'suggestions'
  content: string
  timestamp: Date
  fileContext?: string
  suggestions?: any[]
  threads?: Thread[]
  canHaveThreads?: boolean
}

export class ThreadManager {
  private threads: Map<string, Thread[]> = new Map()
  private maxThreadsPerMessage = 3 // Prevent overwhelming the user

  /**
   * Create a new thread attached to a message
   */
  createThread(
    messageId: string,
    type: Thread['type'],
    title: string,
    content: string,
    statisticalContext?: StatisticalContext
  ): Thread {
    const thread: Thread = {
      id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parentMessageId: messageId,
      type,
      title,
      content,
      isCollapsed: false, // Start expanded for immediate learning
      isDeleted: false,
      statisticalContext,
      timestamp: new Date(),
      relevantToCurrentAnalysis: true
    }

    const existingThreads = this.threads.get(messageId) || []
    
    // Limit threads per message to prevent UI clutter
    if (existingThreads.length >= this.maxThreadsPerMessage) {
      console.warn(`Maximum threads (${this.maxThreadsPerMessage}) reached for message ${messageId}`)
      return thread
    }
    
    existingThreads.push(thread)
    this.threads.set(messageId, existingThreads)
    
    return thread
  }

  /**
   * Toggle thread collapsed state
   */
  toggleThread(threadId: string): void {
    for (const [messageId, threads] of this.threads.entries()) {
      const thread = threads.find(t => t.id === threadId)
      if (thread) {
        thread.isCollapsed = !thread.isCollapsed
        break
      }
    }
  }

  /**
   * Mark thread as deleted (soft delete to preserve AI context temporarily)
   */
  markThreadDeleted(threadId: string, permanent: boolean = false): void {
    for (const [messageId, threads] of this.threads.entries()) {
      const threadIndex = threads.findIndex(t => t.id === threadId)
      if (threadIndex !== -1) {
        if (permanent) {
          // Permanent deletion - remove from memory
          threads.splice(threadIndex, 1)
          if (threads.length === 0) {
            this.threads.delete(messageId)
          }
        } else {
          // Soft delete - hide but keep for AI context
          threads[threadIndex].isDeleted = true
          threads[threadIndex].relevantToCurrentAnalysis = false
        }
        break
      }
    }
  }

  /**
   * Get threads for a specific message
   */
  getThreadsForMessage(messageId: string): Thread[] {
    return (this.threads.get(messageId) || []).filter(t => !t.isDeleted)
  }

  /**
   * Get all active threads (for AI context)
   */
  getActiveThreadsForAI(): Thread[] {
    const allThreads: Thread[] = []
    for (const threads of this.threads.values()) {
      allThreads.push(...threads.filter(t => !t.isDeleted && t.relevantToCurrentAnalysis))
    }
    return allThreads
  }

  /**
   * Clean up old threads to prevent memory issues
   */
  cleanupOldThreads(maxAgeHours: number = 2): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000)
    
    for (const [messageId, threads] of this.threads.entries()) {
      const activeThreads = threads.filter(t => 
        t.timestamp > cutoffTime || t.relevantToCurrentAnalysis
      )
      
      if (activeThreads.length === 0) {
        this.threads.delete(messageId)
      } else {
        this.threads.set(messageId, activeThreads)
      }
    }
  }

  /**
   * Create statistical help threads based on analysis content
   */
  createStatisticalHelpThreads(messageId: string, analysisContent: string): Thread[] {
    const createdThreads: Thread[] = []
    
    // Detect statistical tests in the content
    const statisticalPatterns = [
      {
        pattern: /t[- ]?test|ttest/i,
        type: 'statistical_help' as const,
        title: '📊 Understanding T-Tests',
        getContent: () => this.getTTestExplanation(),
        getContext: () => this.getTTestStatisticalContext()
      },
      {
        pattern: /anova|analysis of variance/i,
        type: 'statistical_help' as const,
        title: '📈 Understanding ANOVA',
        getContent: () => this.getANOVAExplanation(),
        getContext: () => this.getANOVAStatisticalContext()
      },
      {
        pattern: /correlation|corr\(/i,
        type: 'statistical_help' as const,
        title: '🔗 Understanding Correlations',
        getContent: () => this.getCorrelationExplanation(),
        getContext: () => this.getCorrelationStatisticalContext()
      },
      {
        pattern: /blood pressure|bp|hypertension/i,
        type: 'medical_context' as const,
        title: '💓 Blood Pressure Clinical Context',
        getContent: () => this.getBloodPressureContext(),
        getContext: () => this.getBloodPressureStatisticalContext()
      }
    ]

    for (const pattern of statisticalPatterns) {
      if (pattern.pattern.test(analysisContent)) {
        const thread = this.createThread(
          messageId,
          pattern.type,
          pattern.title,
          pattern.getContent(),
          pattern.getContext()
        )
        createdThreads.push(thread)
      }
    }

    return createdThreads
  }

  // Statistical explanations for medical professionals
  private getTTestExplanation(): string {
    return `## What is a T-Test?

A t-test compares the **average values** between groups to see if differences are **statistically significant** (not due to chance).

### When to Use:
- **One-sample t-test**: Compare your data to a known value (e.g., "Is average BP different from 120?")
- **Two-sample t-test**: Compare two groups (e.g., "Treatment A vs Treatment B")
- **Paired t-test**: Compare before/after measurements (e.g., "Pre-treatment vs Post-treatment")

### What the Results Mean:
- **p-value < 0.05**: Significant difference (reject null hypothesis)
- **p-value ≥ 0.05**: No significant difference (fail to reject null hypothesis)
- **Effect size**: How large the difference is (clinical significance)

### Medical Example:
If p=0.03 when comparing BP reduction between drugs, there's only a 3% chance this difference occurred by luck.`
  }

  private getTTestStatisticalContext(): StatisticalContext {
    return {
      testType: 'T-Test (Parametric)',
      assumptions: [
        'Data should be approximately normally distributed',
        'Independent observations',
        'Equal variances (for two-sample tests)',
        'Continuous data'
      ],
      interpretation: 'Compare means between groups or against a reference value',
      medicalRelevance: 'Essential for comparing treatment effectiveness, before/after studies, and clinical trial outcomes',
      nextSteps: [
        'Check assumptions with normality tests',
        'Consider non-parametric alternatives if assumptions violated',
        'Calculate effect sizes for clinical significance',
        'Perform post-hoc analyses if needed'
      ]
    }
  }

  private getANOVAExplanation(): string {
    return `## What is ANOVA?

ANOVA (Analysis of Variance) compares **three or more groups** simultaneously to detect if any groups have significantly different means.

### When to Use:
- **One-way ANOVA**: Compare multiple treatment groups (e.g., "Drug A vs Drug B vs Placebo")
- **Two-way ANOVA**: Consider two factors (e.g., "Treatment × Gender interaction")
- **Repeated measures ANOVA**: Multiple time points (e.g., "Baseline, Month 1, Month 3")

### What the Results Mean:
- **F-statistic**: Ratio of between-group to within-group variance
- **p-value < 0.05**: At least one group is significantly different
- **Post-hoc tests**: Determine which specific groups differ

### Medical Example:
Comparing BP reduction across 4 different medications to find the most effective treatment.`
  }

  private getANOVAStatisticalContext(): StatisticalContext {
    return {
      testType: 'ANOVA (Analysis of Variance)',
      assumptions: [
        'Normal distribution within each group',
        'Independent observations',
        'Equal variances (homoscedasticity)',
        'Continuous dependent variable'
      ],
      interpretation: 'Detect differences among three or more group means',
      medicalRelevance: 'Critical for multi-arm clinical trials, dose-response studies, and comparing multiple treatments',
      nextSteps: [
        'Perform post-hoc tests if significant (Tukey, Bonferroni)',
        'Check assumption violations',
        'Consider effect sizes (eta-squared)',
        'Plan follow-up pairwise comparisons'
      ]
    }
  }

  private getCorrelationExplanation(): string {
    return `## What is Correlation?

Correlation measures how **strongly two variables are related** and whether they move together.

### Correlation Types:
- **Pearson**: Linear relationships (most common)
- **Spearman**: Non-linear or ranked data
- **Kendall**: Small sample sizes or many tied values

### Interpreting Values:
- **r = +1.0**: Perfect positive correlation
- **r = 0.0**: No linear relationship
- **r = -1.0**: Perfect negative correlation
- **|r| > 0.7**: Strong correlation
- **|r| = 0.3-0.7**: Moderate correlation
- **|r| < 0.3**: Weak correlation

### Medical Example:
r = -0.65 between medication adherence and blood pressure means better adherence strongly predicts lower BP.`
  }

  private getCorrelationStatisticalContext(): StatisticalContext {
    return {
      testType: 'Correlation Analysis',
      assumptions: [
        'Linear relationship (for Pearson)',
        'Continuous variables',
        'Independent observations',
        'Normal distribution (for significance testing)'
      ],
      interpretation: 'Measure strength and direction of relationship between variables',
      medicalRelevance: 'Identify risk factors, validate biomarkers, understand disease relationships',
      nextSteps: [
        'Test for statistical significance',
        'Consider causation vs correlation',
        'Check for confounding variables',
        'Perform regression analysis if appropriate'
      ]
    }
  }

  private getBloodPressureContext(): string {
    return `## Blood Pressure Clinical Context

### Normal Ranges:
- **Normal**: <120/80 mmHg
- **Elevated**: 120-129/<80 mmHg
- **Stage 1 HTN**: 130-139/80-89 mmHg
- **Stage 2 HTN**: ≥140/90 mmHg
- **Crisis**: >180/120 mmHg

### Clinical Significance:
- **10 mmHg reduction**: ~20% lower cardiovascular risk
- **Target for most patients**: <130/80 mmHg
- **High-risk patients**: <130/80 mmHg
- **Elderly (>65)**: <130/80 mmHg (if tolerated)

### Research Considerations:
- **Baseline characteristics**: Age, comorbidities, medications
- **White coat effect**: Clinic vs home measurements
- **Circadian variation**: Time of day effects
- **Medication adherence**: Major confounding factor`
  }

  private getBloodPressureStatisticalContext(): StatisticalContext {
    return {
      testType: 'Blood Pressure Analysis',
      assumptions: [
        'Standardized measurement conditions',
        'Appropriate cuff size',
        'Consistent measurement timing',
        'Account for baseline differences'
      ],
      interpretation: 'Assess treatment effectiveness and cardiovascular risk reduction',
      medicalRelevance: 'Primary endpoint in hypertension trials, cardiovascular risk assessment',
      nextSteps: [
        'Calculate mean arterial pressure if needed',
        'Assess both systolic and diastolic changes',
        'Consider pulse pressure (systolic - diastolic)',
        'Evaluate clinical significance vs statistical significance'
      ]
    }
  }
}

// Export singleton instance
export const threadManager = new ThreadManager()
