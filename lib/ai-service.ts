/**
 * AI Service that handles both local (Ollama) and cloud (Gemini) models
 * Now includes memory optimization and intelligent model selection
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { ollamaClient } from './ollama-client'
import { memoryOptimizer } from './memory-optimizer'
import { dataContextAnalyzer, DataContext, AnalysisSuggestion } from './data-context-analyzer'
import { testSuggestionEngine, TestSuggestion, SuggestionQuery } from './test-suggestion-engine'

export type ModelType = 'local' | 'cloud'

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AnalysisResponse {
  type: 'explanation' | 'suggestions' | 'code'
  suggestions?: TestSuggestion[]
  analysisSuggestions?: AnalysisSuggestion[]
  code?: string
  explanation?: string
  dataContext?: DataContext
}

export class AIService {
  private geminiClient?: GoogleGenerativeAI
  
  constructor() {
    this.initializeGeminiClient()
  }

  /**
   * Initialize or refresh Gemini client with current API key
   */
  private initializeGeminiClient() {
    // Check for API key in localStorage first, then environment
    let apiKey: string | undefined
    
    if (typeof window !== 'undefined') {
      apiKey = localStorage.getItem('gemini_api_key') || undefined
    }
    
    if (!apiKey) {
      apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    }
    
    if (apiKey) {
      this.geminiClient = new GoogleGenerativeAI(apiKey)
    } else {
      this.geminiClient = undefined
    }
  }

  /**
   * Refresh API client with new key (called when key is updated)
   */
  public refreshApiClient() {
    this.initializeGeminiClient()
  }

  /**
   * Determine model type from model name
   */
  private getModelType(modelName: string): ModelType {
    return modelName.includes('gemini') || modelName.includes('cloud') ? 'cloud' : 'local'
  }

  /**
   * Enhanced analysis response with intelligent data understanding
   */
  async generateAnalysisResponse(modelName: string, query: string, dataContext: string, selectedFile?: any): Promise<AnalysisResponse> {
    console.log('🔍 AI Service: Processing query:', query)
    console.log('📁 AI Service: Selected file:', selectedFile?.name)
    console.log('📊 AI Service: File data length:', selectedFile?.data?.length)
    
    // First-time data analysis: explain the dataset
    const isExplorationQuery = selectedFile && this.isDataExplorationQuery(query)
    console.log('🤔 AI Service: Is data exploration query?', isExplorationQuery)
    
    if (isExplorationQuery) {
      console.log('✅ AI Service: Detected data exploration query, analyzing dataset...')
      try {
        console.log('🔬 AI Service: Starting data context analysis...')
        const context = dataContextAnalyzer.analyzeDataset(selectedFile.data, selectedFile.name)
        console.log('📋 AI Service: Data context generated:', context)
        
        console.log('📝 AI Service: Generating explanation...')
        const explanation = dataContextAnalyzer.generateDataExplanation(context)
        console.log('💡 AI Service: Generating suggestions...')
        const suggestions = dataContextAnalyzer.generateAnalysisSuggestions(context)
        
        console.log('✨ AI Service: Generated data explanation successfully')
        console.log('📄 AI Service: Explanation length:', explanation.length)
        console.log('💭 AI Service: Number of suggestions:', suggestions.length)
        
        return {
          type: 'explanation',
          explanation: explanation + "\n\n**What would you like to analyze?** Please let me know your specific research question, and I'll help you choose the appropriate analysis method.",
          dataContext: context,
          analysisSuggestions: suggestions
        }
      } catch (error) {
        console.error('❌ AI Service: Data context analysis failed:', error)
        console.error('❌ AI Service: Error details:', error.stack)
        // Still try to provide a basic explanation
        const basicExplanation = `## 📊 Dataset Overview: ${selectedFile.name}\n\nThis dataset contains **${selectedFile.data.length} records** with **${Object.keys(selectedFile.data[0] || {}).length} variables**.\n\nColumns: ${Object.keys(selectedFile.data[0] || {}).join(', ')}\n\n**What would you like to analyze?**`
        console.log('🔄 AI Service: Using fallback explanation')
        return {
          type: 'explanation',
          explanation: basicExplanation
        }
      }
    }
    
    // Try to suggest appropriate statistical tests
    if (selectedFile && this.shouldSuggestTests(query)) {
      try {
        const suggestionQuery: SuggestionQuery = {
          query: query,
          dataContext: {
            columns: selectedFile.data.length > 0 ? Object.keys(selectedFile.data[0]) : [],
            sampleData: selectedFile.data.slice(0, 5),
            rowCount: selectedFile.data.length
          }
        }
        
        const suggestions = await testSuggestionEngine.suggestTests(suggestionQuery)
        
        if (suggestions.length > 0) {
          return {
            type: 'suggestions',
            suggestions: suggestions.slice(0, 3), // Show top 3 suggestions
            explanation: `I found ${suggestions.length} statistical tests that might help with your analysis. Please select the one that best fits your research question.`
          }
        }
      } catch (error) {
        console.warn('Test suggestion failed, falling back to code generation:', error)
      }
    }
    
    // Fallback to direct code generation
    const code = await this.generateAnalysisCode(modelName, query, dataContext)
    return {
      type: 'code',
      code: code,
      explanation: 'Here\'s the analysis code for your query:'
    }
  }

  /**
   * Generate specific code for a selected test
   */
  async generateTestCode(selectedTest: TestSuggestion, modelName: string, query: string, dataContext: string): Promise<string> {
    // Use the pre-generated template with some AI enhancement
    const baseCode = selectedTest.codeTemplate + '\n\n' + selectedTest.visualizationCode
    
    // Optional: enhance with AI if needed
    const enhancementPrompt = `Enhance this statistical analysis code for the query "${query}":\n\n${baseCode}\n\nMake it more specific to the user's request while keeping the core analysis intact.`
    
    try {
      const modelType = this.getModelType(modelName)
      if (modelType === 'local') {
        return await this.generateWithLocalModel(modelName, enhancementPrompt, dataContext)
      } else {
        return await this.generateWithGemini(enhancementPrompt, dataContext)
      }
    } catch (error) {
      // Fallback to template if AI enhancement fails
      console.warn('AI enhancement failed, using template:', error)
      return baseCode
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async generateAnalysisCode(modelName: string, query: string, dataContext: string): Promise<string> {
    const modelType = this.getModelType(modelName)
    
    // Optimize prompt based on memory constraints
    const optimizedDataContext = await memoryOptimizer.optimizePrompt(dataContext, modelName)
    
    // Preload model if memory allows
    if (modelType === 'local') {
      await memoryOptimizer.preloadModel(modelName)
    }
    
    if (modelType === 'local') {
      return this.generateWithLocalModel(modelName, query, optimizedDataContext)
    } else {
      return this.generateWithGemini(query, optimizedDataContext)
    }
  }

  /**
   * Generate response using local Ollama model
   */
  private async generateWithLocalModel(modelName: string, query: string, dataContext: string): Promise<string> {
    try {
      const prompt = this.buildAnalysisPrompt(query, dataContext)
      return await ollamaClient.query(modelName, prompt)
    } catch (error) {
      throw new Error(`Local model error: ${error}`)
    }
  }

  /**
   * Generate response using Google Gemini
   */
  private async generateWithGemini(query: string, dataContext: string): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment.')
    }

    try {
      const model = this.geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const prompt = this.buildAnalysisPrompt(query, dataContext)
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      if (!text) {
        throw new Error('Empty response from Gemini')
      }
      
      return text
    } catch (error) {
      throw new Error(`Gemini API error: ${error}`)
    }
  }

  /**
   * Build analysis prompt for medical data
   */
  private buildAnalysisPrompt(userQuery: string, dataContext: string): string {
    return `You are a medical data analysis assistant. Before generating any code, FIRST provide a clear explanation of what analysis you will perform and why.

Start your response with a brief explanation section like this:
## 📊 Analysis Plan

**What we're going to do:**
[Explain the specific analysis in 2-3 sentences]

**Why this analysis matters:**
[Explain the medical/clinical significance]

**Statistical tests we'll use:**
[List the specific statistical methods]

Then provide the Python code.

IMPORTANT: The DataFrame 'df' is already loaded from DuckDB - DO NOT use pd.read_csv() or any file reading commands!

Dataset Context:
${dataContext}

User Question: ${userQuery}

Please provide:
1. Clear explanation of the analysis plan (as described above)
2. Clean, executable pandas code
3. Brief interpretation of expected results
4. Medical insights and clinical relevance

CRITICAL REQUIREMENTS:
- The variable 'df' is already available - DO NOT read files with pd.read_csv()
- Use 'pd' for pandas operations (pd.DataFrame, etc.) - 'pandas' and 'pd' are both imported
- Start directly with data analysis using 'df'
- Include error handling
- Provide clear variable names
- Add comments explaining medical significance
- Use appropriate statistical methods
- Include visualizations when relevant
- For plots: ensure data length matches - use df.groupby() for summary data
- Avoid length mismatches in plotting by using aggregated data

EXAMPLE CORRECT RESPONSE FORMAT:
## 📊 Analysis Plan

**What we're going to do:**
We'll compare blood pressure changes between treatment groups using t-tests and visualizations to assess treatment effectiveness.

**Why this analysis matters:**
This helps determine if the new treatment significantly reduces blood pressure compared to standard care, which is crucial for regulatory approval.

**Statistical tests we'll use:**
- Independent samples t-test for group comparisons
- Descriptive statistics for baseline characteristics
- Box plots for visual comparison

## 🐍 Python Code

\`\`\`python
# df is already loaded - just use it!
print("Dataset shape:", df.shape)
# ... rest of analysis code
\`\`\`

Python Code:`
  }

  /**
   * Chat with the AI model using conversation history with memory optimization
   */
  async chat(modelName: string, messages: AIMessage[], dataContext?: string): Promise<string> {
    const modelType = this.getModelType(modelName)
    
    // Build conversation context
    const conversationText = messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n')
    
    const contextualPrompt = dataContext 
      ? `${dataContext}\n\nConversation:\n${conversationText}\n\nASSISTANT:`
      : `${conversationText}\n\nASSISTANT:`
    
    // Optimize prompt for memory efficiency
    const optimizedPrompt = await memoryOptimizer.optimizePrompt(contextualPrompt, modelName)
    
    // Preload model if local and memory allows
    if (modelType === 'local') {
      await memoryOptimizer.preloadModel(modelName)
    }
    
    if (modelType === 'local') {
      return await ollamaClient.query(modelName, optimizedPrompt)
    } else {
      return this.generateWithGemini(conversationText, dataContext || '')
    }
  }

  /**
   * Check if a model is available
   */
  async isModelAvailable(modelName: string): Promise<boolean> {
    const modelType = this.getModelType(modelName)
    
    if (modelType === 'local') {
      try {
        const installedModels = await ollamaClient.listInstalledModels()
        return installedModels.some(m => m.includes(modelName.split(':')[0]))
      } catch {
        return false
      }
    } else {
      // For cloud models, check if API key is configured
      return !!this.geminiClient
    }
  }

  /**
   * Get available models with memory optimization recommendations
   */
  async getAvailableModels(): Promise<Array<{id: string, name: string, type: ModelType, available: boolean, recommended?: boolean, memoryOptimal?: boolean}>> {
    const models = []
    
    // Get memory profile for optimization
    const memoryProfile = await memoryOptimizer.getMemoryProfile()
    
    // Add local models
    try {
      const installedModels = await ollamaClient.listInstalledModels()
      for (const model of installedModels) {
        const isRecommended = model === memoryProfile.recommendedModel
        const isMemoryOptimal = await this.isModelMemoryOptimal(model)
        
        models.push({
          id: model,
          name: model,
          type: 'local' as ModelType,
          available: true,
          recommended: isRecommended,
          memoryOptimal: isMemoryOptimal
        })
      }
    } catch (error) {
      console.warn('Failed to get local models:', error)
    }
    
    // Add cloud models
    const isGeminiOptimal = memoryProfile.recommendedModel === 'gemini-1.5-flash'
    models.push({
      id: 'gemini-1.5-flash',
      name: 'Google Gemini (Cloud)',
      type: 'cloud' as ModelType,
      available: !!this.geminiClient,
      recommended: isGeminiOptimal,
      memoryOptimal: true // Cloud models don't use local memory
    })
    
    return models
  }

  /**
   * Check if a model is memory optimal for current system
   */
  private async isModelMemoryOptimal(modelName: string): Promise<boolean> {
    try {
      const memoryProfile = await memoryOptimizer.getMemoryProfile()
      return memoryProfile.recommendedModel === modelName
    } catch {
      return false
    }
  }

  /**
   * Get intelligent model recommendation based on query complexity
   */
  async getModelRecommendation(query: string, complexity?: 'low' | 'medium' | 'high'): Promise<{
    modelName: string
    reasoning: string
    fallback?: string
    memoryEfficient: boolean
  }> {
    // Determine complexity if not provided
    if (!complexity) {
      complexity = this.determineQueryComplexity(query)
    }
    
    const recommendation = await memoryOptimizer.getOptimalModelForQuery(query.length, complexity)
    
    return {
      modelName: recommendation.modelName,
      reasoning: recommendation.reasoning,
      fallback: recommendation.fallback,
      memoryEfficient: recommendation.modelName !== 'biomistral:7b' // 7B models use more memory
    }
  }

  /**
   * Determine query complexity based on content
   */
  private determineQueryComplexity(query: string): 'low' | 'medium' | 'high' {
    const lowerQuery = query.toLowerCase()
    
    // High complexity indicators
    if (lowerQuery.includes('machine learning') ||
        lowerQuery.includes('deep analysis') ||
        lowerQuery.includes('regression') ||
        lowerQuery.includes('correlation matrix') ||
        lowerQuery.includes('statistical modeling')) {
      return 'high'
    }
    
    // Medium complexity indicators
    if (lowerQuery.includes('analysis') ||
        lowerQuery.includes('compare') ||
        lowerQuery.includes('visualization') ||
        lowerQuery.includes('statistics')) {
      return 'medium'
    }
    
    // Default to low complexity
    return 'low'
  }

  /**
   * Determine if query should trigger test suggestions
   */
  /**
   * Check if user is asking for data exploration/explanation
   */
  private isDataExplorationQuery(query: string): boolean {
    const explorationKeywords = [
      'explain the data', 'describe the data', 'what is this data',
      'data overview', 'dataset summary', 'show me the data',
      'what do we have', 'data exploration', 'understand the data',
      'tell me about', 'overview of', 'summary of', 'explain data',
      'can you explain', 'what does this', 'describe this',
      'what kind of data', 'analyze the data', 'look at the data',
      'suggest me what i can analyze', 'what can i analyze',
      'suggest analysis', 'analysis suggestions', 'what should i analyze',
      'analysis options', 'what analyses', 'analysis recommendations'
    ]
    
    const lowerQuery = query.toLowerCase().trim()
    console.log('🔍 Query Detection: Input query:', `"${query}"`)
    console.log('🔍 Query Detection: Normalized query:', `"${lowerQuery}"`)
    
    let matchedKeyword = null
    const isExploration = explorationKeywords.some(keyword => {
      const matches = lowerQuery.includes(keyword)
      if (matches) {
        matchedKeyword = keyword
      }
      return matches
    })
    
    console.log('🔍 Query Detection: Matched keyword:', matchedKeyword)
    console.log('🔍 Query Detection: Is data exploration query:', isExploration)
    
    // Additional exact phrase matching for debugging
    if (!isExploration) {
      console.log('🔍 Query Detection: Testing exact phrases...')
      const exactPhrases = ['explain the data', 'describe the data', 'can you explain', 'suggest me what i can analyze']
      exactPhrases.forEach(phrase => {
        const exactMatch = lowerQuery === phrase
        console.log(`🔍 Query Detection: "${lowerQuery}" === "${phrase}"?`, exactMatch)
      })
    }
    
    return isExploration
  }

  /**
   * Check if query should trigger test suggestions
   */
  private shouldSuggestTests(query: string): boolean {
    const lowerQuery = query.toLowerCase()
    const suggestionTriggers = [
      'compare', 'vs', 'versus', 'between', 'difference',
      'relationship', 'correlation', 'associated', 'related',
      'analyze', 'analysis', 'test', 'statistical',
      'vaccinated', 'unvaccinated', 'treatment', 'control',
      'male', 'female', 'gender', 'group'
    ]
    
    return suggestionTriggers.some(trigger => lowerQuery.includes(trigger))
  }
}

// Export singleton instance
export const aiService = new AIService()