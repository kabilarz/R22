/**
 * AI Router - Intelligent routing between local and cloud AI models
 * Handles automatic fallback and model selection
 */

import { ollamaClient } from './ollama-client'
import { aiService } from './ai-service'

export interface AIRoute {
  model: string
  type: 'local' | 'cloud'
  available: boolean
  preferred: boolean
  fallback?: string
}

export class AIRouter {
  private static instance: AIRouter
  private routes: AIRoute[] = []
  private lastHealthCheck = 0
  private healthCheckInterval = 30000 // 30 seconds

  private constructor() {}

  static getInstance(): AIRouter {
    if (!AIRouter.instance) {
      AIRouter.instance = new AIRouter()
    }
    return AIRouter.instance
  }

  /**
   * Update available routes by checking system status
   */
  async updateRoutes(): Promise<void> {
    const now = Date.now()
    
    // Skip if we checked recently
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return
    }
    
    this.lastHealthCheck = now
    this.routes = []

    try {
      // Check local models
      const isOllamaRunning = await ollamaClient.checkStatus()
      if (isOllamaRunning) {
        const installedModels = await ollamaClient.listInstalledModels()
        const hardware = await ollamaClient.getHardwareInfo()
        
        for (const model of installedModels) {
          this.routes.push({
            model,
            type: 'local',
            available: true,
            preferred: model === hardware.recommended_model,
            fallback: 'gemini-1.5-flash'
          })
        }
      }
    } catch (error) {
      console.warn('Failed to check local AI status:', error)
    }

    // Add cloud model as fallback
    this.routes.push({
      model: 'gemini-1.5-flash',
      type: 'cloud',
      available: await aiService.isModelAvailable('gemini-1.5-flash'),
      preferred: this.routes.length === 0, // Preferred if no local models
    })
  }

  /**
   * Get the best available route for a given preference
   */
  async getBestRoute(preferLocal: boolean = true): Promise<AIRoute | null> {
    await this.updateRoutes()
    
    if (preferLocal) {
      // First try preferred local model
      const preferredLocal = this.routes.find(r => r.type === 'local' && r.preferred && r.available)
      if (preferredLocal) return preferredLocal
      
      // Then try any local model
      const anyLocal = this.routes.find(r => r.type === 'local' && r.available)
      if (anyLocal) return anyLocal
    }
    
    // Fall back to cloud
    const cloudRoute = this.routes.find(r => r.type === 'cloud' && r.available)
    return cloudRoute || null
  }

  /**
   * Intelligent query with automatic fallback
   */
  async query(prompt: string, dataContext: string, preferredModel?: string): Promise<{
    response: string
    model: string
    type: 'local' | 'cloud'
    fallbackUsed: boolean
  }> {
    await this.updateRoutes()
    
    let primaryRoute: AIRoute | null = null
    
    // Use specific model if requested
    if (preferredModel) {
      primaryRoute = this.routes.find(r => r.model === preferredModel && r.available) || null
    } else {
      // Use intelligent routing
      primaryRoute = await this.getBestRoute(true) // Prefer local by default
    }
    
    if (!primaryRoute) {
      throw new Error('No AI models available. Please check your setup.')
    }

    // Try primary route
    try {
      const response = await aiService.generateAnalysisCode(primaryRoute.model, prompt, dataContext)
      
      return {
        response,
        model: primaryRoute.model,
        type: primaryRoute.type,
        fallbackUsed: false
      }
    } catch (error) {
      console.warn(`Primary AI route (${primaryRoute.model}) failed:`, error)
      
      // Try fallback if available
      if (primaryRoute.fallback && primaryRoute.type === 'local') {
        const fallbackRoute = this.routes.find(r => r.model === primaryRoute.fallback && r.available)
        
        if (fallbackRoute) {
          try {
            const response = await aiService.generateAnalysisCode(fallbackRoute.model, prompt, dataContext)
            
            return {
              response,
              model: fallbackRoute.model,
              type: fallbackRoute.type,
              fallbackUsed: true
            }
          } catch (fallbackError) {
            console.error('Fallback AI route also failed:', fallbackError)
          }
        }
      }
      
      // If all else fails, throw the original error
      throw error
    }
  }

  /**
   * Get current route status for UI display
   */
  async getRouteStatus(): Promise<{
    hasLocal: boolean
    hasCloud: boolean
    preferredLocal?: string
    totalRoutes: number
    healthyRoutes: number
  }> {
    await this.updateRoutes()
    
    const localRoutes = this.routes.filter(r => r.type === 'local')
    const cloudRoutes = this.routes.filter(r => r.type === 'cloud')
    const healthyRoutes = this.routes.filter(r => r.available)
    
    return {
      hasLocal: localRoutes.length > 0,
      hasCloud: cloudRoutes.length > 0,
      preferredLocal: localRoutes.find(r => r.preferred)?.model,
      totalRoutes: this.routes.length,
      healthyRoutes: healthyRoutes.length
    }
  }

  /**
   * Force refresh routes (useful after model downloads or system changes)
   */
  async forceRefresh(): Promise<void> {
    this.lastHealthCheck = 0
    await this.updateRoutes()
  }

  /**
   * Get user-friendly recommendations
   */
  async getRecommendations(): Promise<string[]> {
    const status = await this.getRouteStatus()
    const recommendations: string[] = []
    
    if (!status.hasLocal && !status.hasCloud) {
      recommendations.push('⚠️ No AI models available. Please set up Ollama or configure Gemini API key.')
    } else if (!status.hasLocal && status.hasCloud) {
      recommendations.push('☁️ Currently using cloud AI. Install Ollama for offline analysis.')
    } else if (status.hasLocal && !status.hasCloud) {
      recommendations.push('🔒 Using local AI only. Configure Gemini API key for cloud fallback.')
    } else {
      recommendations.push('✅ Both local and cloud AI available. Automatic intelligent routing enabled.')
    }
    
    if (status.preferredLocal) {
      recommendations.push(`🎯 Recommended model: ${status.preferredLocal}`)
    }
    
    return recommendations
  }
}

// Export singleton instance
export const aiRouter = AIRouter.getInstance()