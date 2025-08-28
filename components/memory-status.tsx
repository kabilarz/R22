/**
 * Memory Status Component - Real-time memory monitoring and optimization display
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Switch } from './ui/switch'
import { toast } from 'sonner'
import { 
  Monitor, 
  Zap, 
  Cloud, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Trash2,
  TrendingUp,
  Activity
} from 'lucide-react'
import { memoryOptimizer, MemoryProfile, OptimizationSettings } from '../lib/memory-optimizer'

interface MemoryStatusProps {
  selectedModel: string
  onModelRecommendation?: (model: string, reason: string) => void
}

export function MemoryStatus({ selectedModel, onModelRecommendation }: MemoryStatusProps) {
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile | null>(null)
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [cachedModels, setCachedModels] = useState<Array<{ name: string; memoryUsed: number }>>([])

  useEffect(() => {
    loadMemoryStatus()
    
    // Set up periodic monitoring
    const interval = setInterval(loadMemoryStatus, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const loadMemoryStatus = async () => {
    try {
      setIsLoading(true)
      const stats = await memoryOptimizer.getMemoryStats()
      setMemoryProfile(stats.system)
      setOptimizationSettings(stats.optimization)
      setCachedModels(stats.models)
    } catch (error) {
      console.error('Failed to load memory status:', error)
      toast.error('Failed to load memory status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptimizationToggle = (setting: keyof OptimizationSettings, enabled: boolean) => {
    if (optimizationSettings) {
      const newSettings = { ...optimizationSettings, [setting]: enabled }
      setOptimizationSettings(newSettings)
      memoryOptimizer.updateOptimizationSettings({ [setting]: enabled })
      toast.success(`${setting} ${enabled ? 'enabled' : 'disabled'}`)
    }
  }

  const handleClearCache = async () => {
    try {
      await memoryOptimizer.clearModelCache()
      setCachedModels([])
      await loadMemoryStatus() // Refresh
      toast.success('Model cache cleared')
    } catch (error) {
      toast.error('Failed to clear cache')
    }
  }

  const handleOptimizeModel = async () => {
    try {
      const recommendation = await memoryOptimizer.getOptimalModelForQuery(1000, 'medium')
      if (onModelRecommendation) {
        onModelRecommendation(recommendation.modelName, recommendation.reasoning)
      }
      toast.success(`Recommended: ${recommendation.modelName}`)
    } catch (error) {
      toast.error('Failed to get model recommendation')
    }
  }

  const getMemoryStatusColor = (usage: number) => {
    if (usage < 50) return 'text-green-600'
    if (usage < 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMemoryStatusIcon = (usage: number) => {
    if (usage < 50) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (usage < 75) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  const formatMemory = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`
    }
    return `${mb.toFixed(0)} MB`
  }

  if (isLoading || !memoryProfile) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 animate-pulse" />
            Loading memory status...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Memory Status
          </div>
          <div className="flex items-center gap-2">
            {getMemoryStatusIcon(memoryProfile.memoryUsage)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="h-6 w-6 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Memory Usage Overview */}
        <div className=\"space-y-2\">
          <div className=\"flex items-center justify-between text-xs\">
            <span>Memory Usage</span>
            <span className={getMemoryStatusColor(memoryProfile.memoryUsage)}>
              {memoryProfile.memoryUsage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={memoryProfile.memoryUsage} 
            className=\"h-2\"
          />
          <div className=\"flex justify-between text-xs text-muted-foreground\">
            <span>Available: {formatMemory(memoryProfile.availableMemory)}</span>
            <span>Total: {formatMemory(memoryProfile.totalMemory)}</span>
          </div>
        </div>

        {/* Current Model Status */}
        <div className=\"flex items-center justify-between p-2 bg-muted/50 rounded-lg\">
          <div className=\"flex items-center gap-2\">
            {selectedModel.includes('gemini') ? (
              <Cloud className=\"h-4 w-4 text-blue-500\" />
            ) : (
              <Zap className=\"h-4 w-4 text-green-500\" />
            )}
            <div>
              <div className=\"text-sm font-medium\">{selectedModel}</div>
              <div className=\"text-xs text-muted-foreground\">
                {selectedModel.includes('gemini') ? 'Cloud Model' : 'Local Model'}
              </div>
            </div>
          </div>
          <Badge variant={selectedModel === memoryProfile.recommendedModel ? 'default' : 'secondary'}>
            {selectedModel === memoryProfile.recommendedModel ? 'Optimal' : 'Active'}
          </Badge>
        </div>

        {/* Recommended Model */}
        {selectedModel !== memoryProfile.recommendedModel && (
          <div className=\"p-2 bg-blue-50 border border-blue-200 rounded-lg\">
            <div className=\"flex items-center justify-between\">
              <div>
                <div className=\"text-sm font-medium text-blue-900\">
                  Recommended: {memoryProfile.recommendedModel}
                </div>
                <div className=\"text-xs text-blue-700\">
                  Better performance for current memory
                </div>
              </div>
              <Button 
                size=\"sm\" 
                variant=\"outline\"
                onClick={handleOptimizeModel}
                className=\"text-blue-700 border-blue-300\"
              >
                Switch
              </Button>
            </div>
          </div>
        )}

        {/* Cached Models */}
        {cachedModels.length > 0 && (
          <div className=\"space-y-2\">
            <div className=\"flex items-center justify-between\">
              <span className=\"text-sm font-medium\">Cached Models</span>
              <Button
                variant=\"ghost\"
                size=\"sm\"
                onClick={handleClearCache}
                className=\"h-6 px-2 text-xs\"
              >
                <Trash2 className=\"h-3 w-3 mr-1\" />
                Clear
              </Button>
            </div>
            {cachedModels.map((model) => (
              <div key={model.name} className=\"flex items-center justify-between text-xs\">
                <span>{model.name}</span>
                <span className=\"text-muted-foreground\">{formatMemory(model.memoryUsed)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Optimization Settings */}
        {showSettings && optimizationSettings && (
          <div className=\"space-y-3 pt-2 border-t\">
            <div className=\"text-sm font-medium\">Optimization Settings</div>
            
            <div className=\"space-y-2\">
              <div className=\"flex items-center justify-between\">
                <span className=\"text-sm\">Garbage Collection</span>
                <Switch
                  checked={optimizationSettings.enableGarbageCollection}
                  onCheckedChange={(checked) => handleOptimizationToggle('enableGarbageCollection', checked)}
                />
              </div>
              
              <div className=\"flex items-center justify-between\">
                <span className=\"text-sm\">Model Caching</span>
                <Switch
                  checked={optimizationSettings.enableModelCaching}
                  onCheckedChange={(checked) => handleOptimizationToggle('enableModelCaching', checked)}
                />
              </div>
              
              <div className=\"flex items-center justify-between\">
                <span className=\"text-sm\">Context Truncation</span>
                <Switch
                  checked={optimizationSettings.contextTruncation}
                  onCheckedChange={(checked) => handleOptimizationToggle('contextTruncation', checked)}
                />
              </div>
              
              <div className=\"flex items-center justify-between\">
                <span className=\"text-sm\">Batch Optimization</span>
                <Switch
                  checked={optimizationSettings.batchOptimization}
                  onCheckedChange={(checked) => handleOptimizationToggle('batchOptimization', checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className=\"grid grid-cols-2 gap-2 text-xs\">
          <div className=\"p-2 bg-muted/30 rounded\">
            <div className=\"text-muted-foreground\">Max Context</div>
            <div className=\"font-medium\">{memoryProfile.maxContextLength}</div>
          </div>
          <div className=\"p-2 bg-muted/30 rounded\">
            <div className=\"text-muted-foreground\">Batch Size</div>
            <div className=\"font-medium\">{memoryProfile.batchSize}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className=\"flex gap-2 pt-2\">
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={loadMemoryStatus}
            className=\"flex-1 text-xs\"
          >
            <TrendingUp className=\"h-3 w-3 mr-1\" />
            Refresh
          </Button>
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={handleOptimizeModel}
            className=\"flex-1 text-xs\"
          >
            <Zap className=\"h-3 w-3 mr-1\" />
            Optimize
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}