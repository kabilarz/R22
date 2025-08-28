'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Zap, 
  Cloud, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Download,
  Info,
  Cpu,
  HardDrive
} from 'lucide-react'
import { toast } from 'sonner'
import { ollamaClient, HardwareInfo } from '@/lib/ollama-client'
import { aiService } from '@/lib/ai-service'

interface AIStatusProps {
  selectedModel: string
  onModelChange: (model: string) => void
  className?: string
}

export function AIStatus({ selectedModel, onModelChange, className }: AIStatusProps) {
  const [isOllamaRunning, setIsOllamaRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hardware, setHardware] = useState<HardwareInfo | null>(null)
  const [installedModels, setInstalledModels] = useState<string[]>([])
  const [isStartingOllama, setIsStartingOllama] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    setIsLoading(true)
    try {
      // Check if we're in a Tauri environment
      if (!ollamaClient.isTauriAvailable()) {
        console.log('🌐 Running in browser mode - local AI features disabled')
        
        // Set browser-appropriate defaults
        const browserHardware: HardwareInfo = {
          total_memory_gb: 8.0,
          available_memory_gb: 6.0,
          cpu_count: 4,
          recommended_model: 'gemini-1.5-flash',
          can_run_7b: false,
          can_run_mini: false,
          os: 'Browser'
        }
        
        setHardware(browserHardware)
        setIsOllamaRunning(false)
        setInstalledModels([])
        return
      }

      // Setup bundled Ollama if available
      try {
        await ollamaClient.setupBundledOllama()
      } catch (error) {
        console.warn('Bundled Ollama setup failed:', error)
      }

      // Check hardware
      const hwInfo = await ollamaClient.getHardwareInfo()
      setHardware(hwInfo)

      // Check Ollama status
      const status = await ollamaClient.checkStatus()
      setIsOllamaRunning(status)

      if (status) {
        const models = await ollamaClient.listInstalledModels()
        setInstalledModels(models)
      }

    } catch (error) {
      console.error('Failed to check system status:', error)
      // Set fallback values in case of error
      setHardware({
        total_memory_gb: 4.0,
        available_memory_gb: 2.0,
        cpu_count: 2,
        recommended_model: 'gemini-1.5-flash',
        can_run_7b: false,
        can_run_mini: false,
        os: 'Unknown'
      })
      setIsOllamaRunning(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOllama = async () => {
    // Check if we're in a Tauri environment
    if (!ollamaClient.isTauriAvailable()) {
      toast.error('Ollama startup is only available in desktop mode. Please use npm run tauri dev or the built desktop application.')
      return
    }

    setIsStartingOllama(true)
    try {
      toast.info('Starting Ollama service...')
      await ollamaClient.startOllama()
      
      // Wait and check status
      setTimeout(async () => {
        await checkSystemStatus()
        if (await ollamaClient.checkStatus()) {
          toast.success('Ollama started successfully!')
        } else {
          toast.error('Failed to start Ollama. Please check installation.')
        }
      }, 3000)
      
    } catch (error) {
      toast.error(`Failed to start Ollama: ${error}`)
    } finally {
      setIsStartingOllama(false)
    }
  }

  const getModelType = (model: string) => {
    return model.includes('gemini') || model.includes('cloud') ? 'cloud' : 'local'
  }

  const getCurrentModelInfo = () => {
    const type = getModelType(selectedModel)
    if (type === 'cloud') {
      return {
        name: 'Google Gemini (Cloud)',
        type: 'cloud' as const,
        status: 'available',
        icon: <Cloud className="h-4 w-4" />,
        color: 'bg-blue-500'
      }
    } else {
      const isInstalled = installedModels.some(m => m.includes(selectedModel.split(':')[0]))
      return {
        name: selectedModel,
        type: 'local' as const,
        status: isOllamaRunning && isInstalled ? 'running' : 'unavailable',
        icon: <Zap className="h-4 w-4" />,
        color: isOllamaRunning && isInstalled ? 'bg-green-500' : 'bg-orange-500'
      }
    }
  }

  const getSystemRecommendation = () => {
    if (!hardware) return null

    if (hardware.total_memory_gb < 4) {
      return {
        type: 'warning',
        message: 'Limited RAM detected. Cloud AI recommended for best performance.',
        action: () => onModelChange('gemini-1.5-flash')
      }
    } else if (hardware.total_memory_gb >= 8 && !isOllamaRunning) {
      return {
        type: 'info',
        message: 'Your system can run advanced local AI models. Start Ollama for privacy-focused analysis.',
        action: handleStartOllama
      }
    } else if (!isOllamaRunning && installedModels.length === 0) {
      return {
        type: 'info',
        message: 'Set up local AI for offline medical data analysis.',
        action: handleStartOllama
      }
    }
    
    return null
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Checking AI status...</span>
      </div>
    )
  }

  const currentModel = getCurrentModelInfo()
  const recommendation = getSystemRecommendation()

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current Model Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${currentModel.color}`} />
          <span className="text-sm font-medium">{currentModel.name}</span>
          <Badge variant={currentModel.type === 'local' ? 'default' : 'outline'} className="text-xs">
            {currentModel.type === 'local' ? 'Local' : 'Cloud'}
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="h-8 px-2"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {/* System Recommendation */}
      {recommendation && (
        <Alert className={recommendation.type === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}>
          {recommendation.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">{recommendation.message}</span>
            <Button size="sm" onClick={recommendation.action} className="ml-2">
              {recommendation.type === 'warning' ? 'Use Cloud' : 'Setup Local'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Status */}
      {showDetails && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">System Status</CardTitle>
            <CardDescription className="text-xs">
              AI processing capabilities and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Hardware Info */}
            {hardware && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3 text-muted-foreground" />
                  <span>RAM: {hardware.total_memory_gb.toFixed(1)} GB</span>
                </div>
                <div className="flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-muted-foreground" />
                  <span>CPU: {hardware.cpu_count} cores</span>
                </div>
              </div>
            )}

            {/* Local AI Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOllamaRunning ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs">
                  Local AI: {isOllamaRunning ? 'Running' : 'Stopped'}
                </span>
              </div>
              {!isOllamaRunning && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartOllama}
                  disabled={isStartingOllama}
                  className="h-6 px-2 text-xs"
                >
                  {isStartingOllama ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                      Starting...
                    </>
                  ) : (
                    'Start'
                  )}
                </Button>
              )}
            </div>

            {/* Installed Models */}
            {isOllamaRunning && (
              <div>
                <div className="text-xs font-medium mb-1">Local Models</div>
                {installedModels.length > 0 ? (
                  <div className="space-y-1">
                    {installedModels.map(model => (
                      <div key={model} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {model}
                        </span>
                        {hardware?.recommended_model === model && (
                          <Badge variant="secondary" className="text-xs h-4">Recommended</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No models installed. Use setup dialog to download models.
                  </p>
                )}
              </div>
            )}

            {/* Hardware Recommendations */}
            {hardware && (
              <div>
                <div className="text-xs font-medium mb-1">Recommendations</div>
                <div className="space-y-1">
                  {hardware.can_run_7b ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Can run advanced models (BioMistral 7B)
                    </div>
                  ) : hardware.can_run_mini ? (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <CheckCircle className="h-3 w-3" />
                      Can run medium models (Phi-3 Mini)
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      Best suited for TinyLlama or cloud models
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}