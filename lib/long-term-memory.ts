/**
 * Long-term Memory Management System
 * Prevents performance degradation during extended sessions
 */

export interface LongTermSession {
  startTime: number
  messageCount: number
  fileCount: number
  lastCleanup: number
  memoryWarnings: number
}

export class LongTermMemoryManager {
  private static instance: LongTermMemoryManager
  private session: LongTermSession
  private cleanupInterval: NodeJS.Timeout | null = null
  private warningThresholds = {
    messages: 100,
    files: 20,
    sessionHours: 4,
    memoryUsage: 80
  }

  private constructor() {
    this.session = {
      startTime: Date.now(),
      messageCount: 0,
      fileCount: 0,
      lastCleanup: Date.now(),
      memoryWarnings: 0
    }
    this.startMonitoring()
  }

  static getInstance(): LongTermMemoryManager {
    if (!LongTermMemoryManager.instance) {
      LongTermMemoryManager.instance = new LongTermMemoryManager()
    }
    return LongTermMemoryManager.instance
  }

  private startMonitoring() {
    // Monitor every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.performSessionAnalysis()
    }, 10 * 60 * 1000)
  }

  private performSessionAnalysis() {
    const sessionHours = (Date.now() - this.session.startTime) / (1000 * 60 * 60)
    
    console.log('📊 Long-term session analysis:', {
      sessionHours: sessionHours.toFixed(1),
      messageCount: this.session.messageCount,
      fileCount: this.session.fileCount,
      lastCleanup: new Date(this.session.lastCleanup).toLocaleTimeString()
    })

    // Trigger cleanup if needed
    if (this.shouldPerformCleanup(sessionHours)) {
      this.performDeepCleanup()
    }

    // Issue warnings for long sessions
    if (sessionHours > this.warningThresholds.sessionHours && this.session.memoryWarnings < 3) {
      this.issueSessionWarning(sessionHours)
    }
  }

  private shouldPerformCleanup(sessionHours: number): boolean {
    const timeSinceLastCleanup = Date.now() - this.session.lastCleanup
    const cleanupInterval = 30 * 60 * 1000 // 30 minutes

    return (
      timeSinceLastCleanup > cleanupInterval ||
      this.session.messageCount > this.warningThresholds.messages ||
      this.session.fileCount > this.warningThresholds.files ||
      sessionHours > 2
    )
  }

  private async performDeepCleanup() {
    console.log('🧹 Performing deep memory cleanup...')

    try {
      // 1. Force garbage collection
      if (global.gc) {
        global.gc()
        console.log('✅ Forced garbage collection')
      }

      // 2. Clear browser caches if available
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
          if (cacheName.includes('temp') || cacheName.includes('data')) {
            await caches.delete(cacheName)
            console.log(`✅ Cleared cache: ${cacheName}`)
          }
        }
      }

      // 3. Clear localStorage of temporary data
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key && (key.includes('temp') || key.includes('cache'))) {
            localStorage.removeItem(key)
            console.log(`✅ Cleared localStorage: ${key}`)
          }
        }
      }

      // 4. Reset session counters for next cycle
      this.session.lastCleanup = Date.now()
      
      console.log('✅ Deep cleanup completed successfully')
    } catch (error) {
      console.error('❌ Deep cleanup failed:', error)
    }
  }

  private issueSessionWarning(sessionHours: number) {
    this.session.memoryWarnings++
    
    const message = `Long session detected (${sessionHours.toFixed(1)} hours). Consider refreshing the application to maintain optimal performance.`
    
    console.warn('⚠️ ' + message)
    
    // You can integrate with your toast system here
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast({
        type: 'warning',
        title: 'Long Session Warning',
        message,
        duration: 10000
      })
    }
  }

  // Public methods for session tracking
  trackMessage() {
    this.session.messageCount++
  }

  trackFile() {
    this.session.fileCount++
  }

  removeFile() {
    this.session.fileCount = Math.max(0, this.session.fileCount - 1)
  }

  getSessionInfo(): LongTermSession {
    return { ...this.session }
  }

  forceCleanup() {
    return this.performDeepCleanup()
  }

  getRecommendations(): string[] {
    const sessionHours = (Date.now() - this.session.startTime) / (1000 * 60 * 60)
    const recommendations: string[] = []

    if (sessionHours > 4) {
      recommendations.push('Consider refreshing the application after 4+ hours of use')
    }

    if (this.session.messageCount > 100) {
      recommendations.push('Clear old chat messages to improve performance')
    }

    if (this.session.fileCount > 15) {
      recommendations.push('Remove unused uploaded files to free memory')
    }

    return recommendations
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Export singleton instance
export const longTermMemoryManager = LongTermMemoryManager.getInstance()