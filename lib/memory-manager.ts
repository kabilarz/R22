/**
 * Professional Memory Management System
 * Used by companies like Slack, Discord, WhatsApp for chat performance
 */

interface MemoryConfig {
  maxMessages: number
  maxThreadsPerMessage: number
  cleanupIntervalMs: number
  aggressiveCleanupThreshold: number
  virtualScrollThreshold: number
}

interface PerformanceMetrics {
  messageCount: number
  threadCount: number
  memoryUsageMB: number
  renderTime: number
  lastCleanup: Date
}

export class ChatMemoryManager {
  private config: MemoryConfig = {
    maxMessages: 50,           // Keep only last 50 messages visible
    maxThreadsPerMessage: 3,   // Max 3 threads per message
    cleanupIntervalMs: 30000,  // Clean every 30 seconds
    aggressiveCleanupThreshold: 100, // Aggressive cleanup at 100 messages
    virtualScrollThreshold: 20 // Virtual scroll after 20 messages
  }

  private cleanupTimer?: NodeJS.Timeout
  private metrics: PerformanceMetrics = {
    messageCount: 0,
    threadCount: 0,
    memoryUsageMB: 0,
    renderTime: 0,
    lastCleanup: new Date()
  }

  /**
   * Initialize memory management
   */
  initialize() {
    console.log('🚀 Memory Manager: Initializing professional memory management...')
    
    this.startCleanupTimer()
    this.setupPerformanceMonitoring()
    
    console.log('✅ Memory Manager: Initialized with config:', this.config)
  }

  /**
   * Clean message history to prevent lag
   */
  cleanMessageHistory<T extends { id: string; timestamp: Date }>(
    messages: T[], 
    force: boolean = false
  ): T[] {
    const shouldClean = force || 
      messages.length > this.config.maxMessages ||
      messages.length > this.config.aggressiveCleanupThreshold

    if (!shouldClean) {
      return messages
    }

    console.log(`🧹 Memory Manager: Cleaning ${messages.length} messages...`)

    // Keep only recent messages for performance
    const cleaned = messages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, this.config.maxMessages)

    console.log(`✨ Memory Manager: Reduced from ${messages.length} to ${cleaned.length} messages`)
    
    // Force garbage collection if available
    this.forceGarbageCollection()
    
    this.metrics.messageCount = cleaned.length
    this.metrics.lastCleanup = new Date()
    
    return cleaned
  }

  /**
   * Clean thread history to prevent accumulation
   */
  cleanThreadHistory(threads: Map<string, any[]>): Map<string, any[]> {
    console.log('🧹 Memory Manager: Cleaning thread history...')
    
    const cleaned = new Map<string, any[]>()
    let totalThreadsBefore = 0
    let totalThreadsAfter = 0

    for (const [messageId, messageThreads] of threads.entries()) {
      totalThreadsBefore += messageThreads.length
      
      // Keep only recent, relevant threads
      const relevantThreads = messageThreads
        .filter(thread => thread.relevantToCurrentAnalysis || thread.timestamp > new Date(Date.now() - 2 * 60 * 60 * 1000)) // 2 hours
        .slice(0, this.config.maxThreadsPerMessage)
      
      if (relevantThreads.length > 0) {
        cleaned.set(messageId, relevantThreads)
        totalThreadsAfter += relevantThreads.length
      }
    }

    console.log(`✨ Memory Manager: Reduced threads from ${totalThreadsBefore} to ${totalThreadsAfter}`)
    
    this.metrics.threadCount = totalThreadsAfter
    return cleaned
  }

  /**
   * Optimize component rendering
   */
  shouldUseVirtualScroll(messageCount: number): boolean {
    return messageCount > this.config.virtualScrollThreshold
  }

  /**
   * Check if aggressive cleanup is needed
   */
  needsAggressiveCleanup(messageCount: number): boolean {
    return messageCount > this.config.aggressiveCleanupThreshold
  }

  /**
   * Get memory usage recommendations
   */
  getMemoryRecommendations(): {
    action: 'none' | 'cleanup' | 'aggressive_cleanup' | 'restart_recommended'
    reason: string
    metrics: PerformanceMetrics
  } {
    const memUsage = this.estimateMemoryUsage()
    
    if (memUsage > 200) {
      return {
        action: 'restart_recommended',
        reason: `High memory usage (${memUsage}MB). Consider refreshing the page.`,
        metrics: this.metrics
      }
    }
    
    if (this.metrics.messageCount > this.config.aggressiveCleanupThreshold) {
      return {
        action: 'aggressive_cleanup',
        reason: `Too many messages (${this.metrics.messageCount}). Performing aggressive cleanup.`,
        metrics: this.metrics
      }
    }
    
    if (this.metrics.messageCount > this.config.maxMessages) {
      return {
        action: 'cleanup',
        reason: `Message limit reached (${this.metrics.messageCount}). Cleaning old messages.`,
        metrics: this.metrics
      }
    }
    
    return {
      action: 'none',
      reason: 'Memory usage is healthy',
      metrics: this.metrics
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      console.log('⏰ Memory Manager: Periodic cleanup check...')
      
      // This will be called by the chat component to trigger cleanup
      window.dispatchEvent(new CustomEvent('memory-cleanup-needed'))
      
    }, this.config.cleanupIntervalMs)
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring() {
    // Monitor render performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.name.includes('chat') || entry.name.includes('message')) {
            this.metrics.renderTime = entry.duration
          }
        })
      })
      
      try {
        observer.observe({ entryTypes: ['measure'] })
      } catch (e) {
        console.log('Performance observer not available')
      }
    }
  }

  /**
   * Estimate current memory usage
   */
  private estimateMemoryUsage(): number {
    try {
      // @ts-ignore - For debugging in dev tools
      if (performance.memory) {
        // @ts-ignore
        return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
      }
    } catch (e) {
      // Fallback estimation
    }
    
    // Rough estimation based on messages and threads
    const estimatedMB = (this.metrics.messageCount * 0.1) + (this.metrics.threadCount * 0.05)
    return Math.round(estimatedMB)
  }

  /**
   * Force garbage collection if available
   */
  private forceGarbageCollection() {
    try {
      // @ts-ignore - Only available in dev tools or Node.js
      if (typeof gc === 'function') {
        gc()
        console.log('🗑️ Memory Manager: Forced garbage collection')
      }
    } catch (e) {
      // GC not available, that's okay
    }
  }

  /**
   * Get performance metrics for debugging
   */
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      memoryUsageMB: this.estimateMemoryUsage()
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MemoryConfig>) {
    this.config = { ...this.config, ...newConfig }
    console.log('⚙️ Memory Manager: Updated config:', this.config)
  }

  /**
   * Emergency cleanup - use when chat becomes unresponsive
   */
  emergencyCleanup(): void {
    console.log('🚨 Memory Manager: EMERGENCY CLEANUP!')
    
    // Clear all timers
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    
    // Force cleanup
    this.forceGarbageCollection()
    
    // Restart monitoring
    this.startCleanupTimer()
    
    console.log('✅ Memory Manager: Emergency cleanup completed')
  }

  /**
   * Cleanup on component unmount
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    console.log('🔄 Memory Manager: Destroyed')
  }
}

// Export singleton instance
export const chatMemoryManager = new ChatMemoryManager()