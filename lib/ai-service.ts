/**
 * AI Service that handles both local (Ollama) and cloud (Gemini) models
 * Now includes memory optimization and intelligent model selection
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { ollamaClient } from './ollama-client'
import { memoryOptimizer } from './memory-optimizer'

export type ModelType = 'local' | 'cloud'

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
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
   * Generate analysis using the selected model with memory optimization
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
    return `You are a medical data analysis assistant. Generate Python pandas code to analyze the given dataset.

Dataset Context:
${dataContext}

User Question: ${userQuery}

Please provide:
1. Clean, executable pandas code
2. Brief explanation of the analysis
3. Any important medical insights

Requirements:
- Use 'df' as the DataFrame variable name
- Include error handling
- Provide clear variable names
- Add comments explaining medical significance
- Use appropriate statistical methods
- Include visualizations when relevant

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
}

// Export singleton instance
export const aiService = new AIService()