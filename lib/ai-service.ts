/**
 * AI Service that handles both local (Ollama) and cloud (Gemini) models
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { ollamaClient } from './ollama-client'

export type ModelType = 'local' | 'cloud'

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export class AIService {
  private geminiClient?: GoogleGenerativeAI
  
  constructor() {
    // Initialize Gemini if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    if (apiKey) {
      this.geminiClient = new GoogleGenerativeAI(apiKey)
    }
  }

  /**
   * Determine model type from model name
   */
  private getModelType(modelName: string): ModelType {
    return modelName.includes('gemini') || modelName.includes('cloud') ? 'cloud' : 'local'
  }

  /**
   * Generate analysis using the selected model
   */
  async generateAnalysisCode(modelName: string, query: string, dataContext: string): Promise<string> {
    const modelType = this.getModelType(modelName)
    
    if (modelType === 'local') {
      return this.generateWithLocalModel(modelName, query, dataContext)
    } else {
      return this.generateWithGemini(query, dataContext)
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
   * Chat with the AI model using conversation history
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
    
    if (modelType === 'local') {
      return await ollamaClient.query(modelName, contextualPrompt)
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
   * Get available models
   */
  async getAvailableModels(): Promise<Array<{id: string, name: string, type: ModelType, available: boolean}>> {
    const models = []
    
    // Add local models
    try {
      const installedModels = await ollamaClient.listInstalledModels()
      for (const model of installedModels) {
        models.push({
          id: model,
          name: model,
          type: 'local' as ModelType,
          available: true
        })
      }
    } catch (error) {
      console.warn('Failed to get local models:', error)
    }
    
    // Add cloud models
    models.push({
      id: 'gemini-1.5-flash',
      name: 'Google Gemini (Cloud)',
      type: 'cloud' as ModelType,
      available: !!this.geminiClient
    })
    
    return models
  }
}

// Export singleton instance
export const aiService = new AIService()