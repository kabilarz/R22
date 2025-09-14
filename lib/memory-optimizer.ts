/**
 * Memory Optimizer for AI Models - Nemo Platform
 * Optimizes memory usage, model selection, and resource management
 */

import { ollamaClient } from './ollama-client'
import { aiService } from './ai-service'

export interface MemoryProfile {
  availableMemory: number // MB
  totalMemory: number // MB
  memoryUsage: number // percentage
  recommendedModel: string
  maxContextLength: number
  batchSize: number
}

export interface ModelMemoryRequirements {
  name: string
  minMemory: number // MB
  recommendedMemory: number // MB
  contextLength: number
  tokens: number
}

export interface OptimizationSettings {
  enableGarbageCollection: boolean
  useMemoryMapping: boolean
  enableModelCaching: boolean
  contextTruncation: boolean
  batchOptimization: boolean
}

export class MemoryOptimizer {
  private static instance: MemoryOptimizer
  private memoryProfile: MemoryProfile | null = null
  private modelCache = new Map<string, any>()
  private lastMemoryCheck = 0
  private memoryCheckInterval = 30000 // 30 seconds
  private longTermCleanupInterval = 5 * 60 * 1000 // 5 minutes
  private lastLongTermCleanup = 0
  private optimizationSettings: OptimizationSettings = {
    enableGarbageCollection: true,
    useMemoryMapping: true,
    enableModelCaching: true,
    contextTruncation: true,
    batchOptimization: true
  }

  private constructor() {}

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer()
    }
    return MemoryOptimizer.instance
  }

  /**
   * Model memory requirements database
   */
  private getModelMemoryRequirements(): ModelMemoryRequirements[] {
    return [
      {
        name: 'tinyllama',
        minMemory: 1024, // 1GB
        recommendedMemory: 2048, // 2GB
        contextLength: 2048,
        tokens: 1100000000 // 1.1B parameters
      },
      {
        name: 'phi3:mini',
        minMemory: 2048, // 2GB
        recommendedMemory: 4096, // 4GB
        contextLength: 4096,
        tokens: 3800000000 // 3.8B parameters
      },
      {
        name: 'biomistral:7b',
        minMemory: 4096, // 4GB
        recommendedMemory: 8192, // 8GB
        contextLength: 8192,
        tokens: 7000000000 // 7B parameters
      },
      {
        name: 'gemini-1.5-flash',
        minMemory: 0, // Cloud model
        recommendedMemory: 0,
        contextLength: 32768,
        tokens: 0 // Cloud-based
      }
    ]
  }

  /**
   * Get current memory profile with long-term cleanup
   */
  async getMemoryProfile(): Promise<MemoryProfile> {
    const now = Date.now()
    
    // Perform long-term cleanup every 5 minutes
    if (now - this.lastLongTermCleanup > this.longTermCleanupInterval) {
      await this.performLongTermCleanup()
      this.lastLongTermCleanup = now
    }
    
    // Return cached profile if recent
    if (this.memoryProfile && (now - this.lastMemoryCheck) < this.memoryCheckInterval) {
      return this.memoryProfile
    }

    try {
      const hardware = await ollamaClient.getHardwareInfo()
      const availableMemory = hardware.available_memory_gb * 1024 // Convert to MB
      const totalMemory = hardware.total_memory_gb * 1024
      const memoryUsage = ((totalMemory - availableMemory) / totalMemory) * 100
      
      // Determine optimal model based on available memory
      const recommendedModel = this.selectOptimalModel(availableMemory)
      
      // Calculate optimal context length and batch size
      const { maxContextLength, batchSize } = this.calculateOptimalSettings(availableMemory, recommendedModel)

      this.memoryProfile = {
        availableMemory,
        totalMemory,
        memoryUsage,
        recommendedModel,
        maxContextLength,
        batchSize
      }

      this.lastMemoryCheck = now
      return this.memoryProfile

    } catch (error) {
      console.error('Failed to get memory profile:', error)
      
      // Return conservative defaults
      return {
        availableMemory: 2048, // 2GB default
        totalMemory: 4096, // 4GB default
        memoryUsage: 50,
        recommendedModel: 'gemini-1.5-flash', // Cloud fallback
        maxContextLength: 2048,
        batchSize: 1
      }
    }
  }

  /**
   * Select optimal model based on available memory
   */
  private selectOptimalModel(availableMemoryMB: number): string {
    const models = this.getModelMemoryRequirements()
    
    // Sort by memory requirements (ascending)
    const sortedModels = models
      .filter(m => m.minMemory <= availableMemoryMB)
      .sort((a, b) => b.recommendedMemory - a.recommendedMemory)

    // Return the most capable model that fits in memory
    if (sortedModels.length > 0) {
      return sortedModels[0].name
    }

    // Fallback to cloud if insufficient memory
    return 'gemini-1.5-flash'
  }

  /**
   * Calculate optimal context length and batch size
   */
  private calculateOptimalSettings(availableMemoryMB: number, modelName: string): {
    maxContextLength: number
    batchSize: number
  } {
    const modelReqs = this.getModelMemoryRequirements().find(m => m.name === modelName)
    
    if (!modelReqs || modelName === 'gemini-1.5-flash') {
      return {
        maxContextLength: 32768, // Cloud model can handle large contexts
        batchSize: 10
      }
    }

    // Calculate based on available memory
    const memoryHeadroom = availableMemoryMB - modelReqs.minMemory
    const contextMultiplier = Math.max(0.5, Math.min(2.0, memoryHeadroom / modelReqs.minMemory))
    
    const maxContextLength = Math.floor(modelReqs.contextLength * contextMultiplier)
    const batchSize = Math.max(1, Math.floor(memoryHeadroom / 512)) // 512MB per batch item

    return {
      maxContextLength: Math.min(maxContextLength, 8192), // Cap at 8K
      batchSize: Math.min(batchSize, 5) // Cap at 5 items
    }
  }

  /**
   * Optimize prompt based on memory constraints
   */
  async optimizePrompt(prompt: string, modelName: string): Promise<string> {
    if (!this.optimizationSettings.contextTruncation) {
      return prompt
    }

    const profile = await this.getMemoryProfile()
    const maxLength = profile.maxContextLength

    // If prompt is too long, truncate intelligently
    if (prompt.length > maxLength) {
      console.warn(`Prompt length (${prompt.length}) exceeds optimal context length (${maxLength}). Truncating.`)
      
      // Keep the beginning and end, truncate the middle
      const keepLength = Math.floor(maxLength * 0.4)
      const beginning = prompt.substring(0, keepLength)
      const ending = prompt.substring(prompt.length - keepLength)
      
      return `${beginning}\n\n[... content truncated for memory optimization ...]\n\n${ending}`
    }

    return prompt
  }

  /**
   * Pre-load and cache model if memory allows
   */
  async preloadModel(modelName: string): Promise<boolean> {
    if (!this.optimizationSettings.enableModelCaching) {
      return false
    }

    try {
      const profile = await this.getMemoryProfile()
      const modelReqs = this.getModelMemoryRequirements().find(m => m.name === modelName)
      
      if (!modelReqs || modelReqs.recommendedMemory > profile.availableMemory) {
        console.warn(`Insufficient memory to preload model ${modelName}`)
        return false
      }

      // Check if already cached
      if (this.modelCache.has(modelName)) {
        return true
      }

      // For local models, ensure they're downloaded and ready
      if (modelName !== 'gemini-1.5-flash') {
        const isRunning = await ollamaClient.checkStatus()
        if (!isRunning) {
          console.warn('Ollama service not running, cannot preload model')
          return false
        }

        const installedModels = await ollamaClient.listInstalledModels()
        if (!installedModels.some(m => m.includes(modelName.split(':')[0]))) {
          console.warn(`Model ${modelName} not installed`)
          return false
        }
      }

      // Mark as cached (actual caching would be handled by Ollama)
      this.modelCache.set(modelName, {
        loadedAt: Date.now(),
        memoryUsed: modelReqs.recommendedMemory
      })

      console.log(`Model ${modelName} preloaded successfully`)
      return true

    } catch (error) {
      console.error(`Failed to preload model ${modelName}:`, error)
      return false
    }
  }

  /**
   * Clear model cache to free memory
   */
  async clearModelCache(): Promise<void> {
    this.modelCache.clear()
    
    // Force garbage collection if available
    if (this.optimizationSettings.enableGarbageCollection && global.gc) {
      global.gc()
    }
    
    console.log('Model cache cleared')
  }

  /**
   * Perform comprehensive long-term memory cleanup
   */
  private async performLongTermCleanup(): Promise<void> {
    console.log('🧹 Performing long-term memory cleanup...')
    
    // 1. Clear old cached models (older than 10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000)
    for (const [modelName, info] of this.modelCache.entries()) {
      if (info.loadedAt < tenMinutesAgo) {
        this.modelCache.delete(modelName)
        console.log(`Cleaned up old cached model: ${modelName}`)
      }
    }
    
    // 2. Reset memory profile to force fresh check
    this.memoryProfile = null
    
    // 3. Force garbage collection if enabled
    if (this.optimizationSettings.enableGarbageCollection && global.gc) {
      global.gc()
      console.log('Forced garbage collection')
    }
    
    // 4. Clear any accumulated optimization overhead
    this.lastMemoryCheck = 0
    
    console.log('✅ Long-term memory cleanup completed')
  }

  /**
   * Get memory usage statistics
   */
  async getMemoryStats(): Promise<{
    system: MemoryProfile
    models: Array<{ name: string; memoryUsed: number; loadedAt: number }>
    optimization: OptimizationSettings
  }> {
    const system = await this.getMemoryProfile()
    
    const models = Array.from(this.modelCache.entries()).map(([name, info]) => ({
      name,
      memoryUsed: info.memoryUsed,
      loadedAt: info.loadedAt
    }))

    return {
      system,
      models,
      optimization: this.optimizationSettings
    }
  }

  /**
   * Update optimization settings
   */
  updateOptimizationSettings(settings: Partial<OptimizationSettings>): void {
    this.optimizationSettings = {
      ...this.optimizationSettings,
      ...settings
    }
    console.log('Optimization settings updated:', this.optimizationSettings)
  }

  /**
   * Get model recommendation with memory considerations
   */
  async getOptimalModelForQuery(queryLength: number, complexity: 'low' | 'medium' | 'high'): Promise<{
    modelName: string
    reasoning: string
    fallback?: string
  }> {
    const profile = await this.getMemoryProfile()
    const models = this.getModelMemoryRequirements()
    
    // Filter models that can fit in memory
    const availableModels = models.filter(m => 
      m.name === 'gemini-1.5-flash' || m.recommendedMemory <= profile.availableMemory
    )

    // Select based on complexity and memory
    if (complexity === 'high' && profile.availableMemory >= 4096) {
      const preferred = availableModels.find(m => m.name === 'biomistral:7b')
      if (preferred) {
        return {
          modelName: preferred.name,
          reasoning: 'High complexity query with sufficient memory for medical-focused 7B model',
          fallback: 'gemini-1.5-flash'
        }
      }
    }

    if (complexity === 'medium' && profile.availableMemory >= 2048) {
      const preferred = availableModels.find(m => m.name === 'phi3:mini')
      if (preferred) {
        return {
          modelName: preferred.name,
          reasoning: 'Medium complexity query with sufficient memory for balanced 3.8B model',
          fallback: 'tinyllama'
        }
      }
    }

    // For low complexity or limited memory
    const preferred = availableModels.find(m => m.name === 'tinyllama')
    if (preferred && profile.availableMemory >= 1024) {
      return {
        modelName: preferred.name,
        reasoning: 'Lightweight local model for efficient processing',
        fallback: 'gemini-1.5-flash'
      }
    }

    // Final fallback to cloud
    return {
      modelName: 'gemini-1.5-flash',
      reasoning: 'Insufficient local memory, using cloud model for reliability',
    }
  }

  /**
   * Monitor memory usage during inference
   */
  async monitorInferenceMemory(callback: (usage: number) => void): Promise<() => void> {
    const monitorInterval = setInterval(async () => {
      try {
        const profile = await this.getMemoryProfile()
        callback(profile.memoryUsage)
      } catch (error) {
        console.error('Memory monitoring error:', error)
      }
    }, 5000) // Check every 5 seconds

    // Return cleanup function
    return () => clearInterval(monitorInterval)
  }
}

// Export singleton instance
export const memoryOptimizer = MemoryOptimizer.getInstance()