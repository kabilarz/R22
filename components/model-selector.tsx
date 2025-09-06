'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, Download, CheckCircle, Cpu, HardDrive, Monitor, Zap, Info, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ollamaClient, HardwareInfo, ModelInfo } from '@/lib/ollama-client'
import { GeminiConfig } from '@/components/gemini-config'
import { ManualModelDownload } from '@/components/manual-model-download'
import { OllamaDiagnostic } from '@/components/ollama-diagnostic'

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
  onModelReady: (isReady: boolean) => void
}

type ModelType = 'local' | 'cloud'

interface ModelOption {
  id: string
  name: string
  type: ModelType
  description: string
  available: boolean
}

export function ModelSelector({ selectedModel, onModelChange, onModelReady }: ModelSelectorProps) {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null)
  const [modelRecommendations, setModelRecommendations] = useState<ModelInfo[]>([])
  const [installedModels, setInstalledModels] = useState<string[]>([])
  const [isOllamaRunning, setIsOllamaRunning] = useState(false)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Available model options including cloud fallback
  const getAvailableModels = (): ModelOption[] => {
    const localModels = installedModels.map(model => ({
      id: model,
      name: model,
      type: 'local' as ModelType,
      description: 'Local AI model',
      available: true
    }))

    const cloudModels: ModelOption[] = [
      {
        id: 'gemini-1.5-flash',
        name: 'Google Gemini (Cloud)',
        type: 'cloud' as ModelType,
        description: 'Cloud-based AI model with internet access',
        available: true
      }
    ]

    return [...localModels, ...cloudModels]
  }

  useEffect(() => {
    initializeOllama()
  }, [])

  const initializeOllama = async () => {
    try {
      setIsInitializing(true)
      
      // Check if we're in a Tauri environment
      if (!ollamaClient.isTauriAvailable()) {
        console.log('🌐 Browser mode: Local AI not available, using cloud models only')
        
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
        
        // Get cloud model recommendations
        const cloudRecommendations = await ollamaClient.getModelRecommendations()
        setModelRecommendations(cloudRecommendations)
        
        // Set cloud model as default
        if (!selectedModel) {
          onModelChange('gemini-1.5-flash')
        }
        
        setIsOllamaRunning(false)
        setInstalledModels([])
        onModelReady(true) // Cloud models are available
        return
      }
      
      // Tauri environment - proceed with full Ollama setup
      console.log('🖥️ Desktop mode: Setting up local AI integration')
      
      // Setup bundled Ollama first
      try {
        await ollamaClient.setupBundledOllama()
        console.log('Bundled Ollama setup completed')
      } catch (error) {
        console.warn('Bundled Ollama setup failed, will try system Ollama:', error)
      }
      
      // Get hardware info
      const hwInfo = await ollamaClient.getHardwareInfo()
      setHardware(hwInfo)
      
      // Get model recommendations
      const recommendations = await ollamaClient.getModelRecommendations()
      setModelRecommendations(recommendations)
      
      // Check Ollama status
      const status = await ollamaClient.checkStatus()
      setIsOllamaRunning(status)
      
      if (status) {
        // Get installed models
        const models = await ollamaClient.listInstalledModels()
        setInstalledModels(models)
        
        // Set default model if none selected
        if (!selectedModel && models.length > 0) {
          const recommendedModel = hwInfo.recommended_model
          const hasRecommended = models.some(m => m.includes(recommendedModel.split(':')[0]))
          onModelChange(hasRecommended ? recommendedModel : models[0])
        } else if (!selectedModel) {
          // Default to cloud model if no local models
          onModelChange('gemini-1.5-flash')
        }
        
        onModelReady(true) // Both local and cloud options available
      } else {
        // If Ollama is not running, default to cloud model
        if (!selectedModel) {
          onModelChange('gemini-1.5-flash')
        }
        onModelReady(true) // Cloud model is still available
      }
      
    } catch (error) {
      console.error('Failed to initialize Ollama:', error)
      // Fallback to cloud model
      if (!selectedModel) {
        onModelChange('gemini-1.5-flash')
      }
      onModelReady(true) // Cloud model is available as fallback
    } finally {
      setIsInitializing(false)
    }
  }

  const handleStartOllama = async () => {
    try {
      toast.info('Starting Ollama service...')
      await ollamaClient.startOllama()
      
      // Wait and check status
      setTimeout(async () => {
        const status = await ollamaClient.checkStatus()
        setIsOllamaRunning(status)
        
        if (status) {
          toast.success('Ollama started successfully!')
          await refreshModels()
          
          // Refresh hardware info after starting Ollama
          try {
            const updatedHwInfo = await ollamaClient.getHardwareInfo()
            setHardware(updatedHwInfo)
          } catch (error) {
            console.warn('Failed to refresh hardware info after Ollama start:', error)
          }
          
          onModelReady(true) // Both local and cloud options available
        } else {
          toast.error('Failed to start Ollama. Please install Ollama first.')
        }
      }, 3000)
      
    } catch (error) {
      console.error('Failed to start Ollama:', error)
      toast.error(`Failed to start Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const refreshModels = async () => {
    try {
      const models = await ollamaClient.listInstalledModels()
      setInstalledModels(models)
      console.log('Installed models refreshed:', models)
      return models
    } catch (error) {
      console.error('Failed to refresh models:', error)
      toast.error('Failed to refresh models list')
      return []
    }
  }

  const handleDownloadModel = async (modelName: string) => {
    try {
      setIsDownloading(modelName)
      setDownloadProgress(0)
      
      toast.info(`Downloading ${modelName}... This may take several minutes.`)
      
      // Check if Ollama is running first
      const isRunning = await ollamaClient.checkStatus()
      if (!isRunning) {
        toast.error('Ollama service is not running. Please start Ollama first.')
        return
      }
      
      // Simulate progress (real progress would require streaming)
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => Math.min(prev + 3, 85))
      }, 3000)
      
      // Attempt download
      const result = await ollamaClient.downloadModel(modelName)
      console.log('Download result:', result)
      
      clearInterval(progressInterval)
      setDownloadProgress(100)
      
      // Give a moment for the model to be registered
      setTimeout(async () => {
        try {
          // Update installed models
          const models = await ollamaClient.listInstalledModels()
          setInstalledModels(models)
          
          const isInstalled = models.some(m => m.includes(modelName.split(':')[0]))
          
          if (isInstalled) {
            toast.success(`✅ ${modelName} downloaded successfully!`)
            
            // Auto-select the downloaded model
            onModelChange(modelName)
            onModelReady(true)
          } else {
            toast.warning(`Download completed but ${modelName} may need a moment to appear. Try refreshing.`)
          }
        } catch (refreshError) {
          console.error('Failed to refresh models list:', refreshError)
          toast.warning('Download may have succeeded. Please refresh to see new models.')
        }
      }, 2000)
      
    } catch (error) {
      console.error('Download error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      if (errorMessage.includes('not running')) {
        toast.error('❌ Ollama service is not running. Please start Ollama first.')
      } else if (errorMessage.includes('timeout')) {
        toast.error('❌ Download timed out. Large models may take longer. Please try again.')
      } else if (errorMessage.includes('network')) {
        toast.error('❌ Network error. Please check your internet connection.')
      } else {
        toast.error(`❌ Failed to download ${modelName}: ${errorMessage}`)
      }
    } finally {
      setIsDownloading(null)
      setDownloadProgress(0)
    }
  }

  const getModelStatus = (modelName: string) => {
    if (isDownloading === modelName) return 'downloading'
    if (installedModels.some(m => m.includes(modelName.split(':')[0]))) return 'installed'
    return 'available'
  }

  const canRunModel = (model: ModelInfo) => {
    if (!hardware) return false
    return hardware.total_memory_gb >= model.recommended_ram_gb
  }

  if (isInitializing) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Initializing AI models...
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      {/* Model Selection */}
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full max-w-64 min-w-40">
          <SelectValue placeholder="Select AI model" />
        </SelectTrigger>
        <SelectContent>
          {/* Local Models Section */}
          {installedModels.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Local Models</div>
              {installedModels.map((model) => (
                <SelectItem key={model} value={model}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>{model}</span>
                    {hardware?.recommended_model === model && (
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
              <div className="border-t my-1" />
            </>
          )}
          
          {/* Cloud Models Section */}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Cloud Models</div>
          <SelectItem value="gemini-1.5-flash">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Google Gemini (Cloud)</span>
              <Badge variant="outline" className="text-xs">Fallback</Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Setup Button for Local Models - More compact */}
      <Button variant="outline" size="sm" onClick={() => setIsSetupOpen(true)} className="flex items-center gap-1 flex-shrink-0">
        <Info className="h-4 w-4" />
        <span className="hidden sm:inline">Setup</span>
      </Button>

      {/* Gemini API Configuration - Make compact */}
      <div className="flex-shrink-0">
        <GeminiConfig />
      </div>

      {/* Setup Dialog */}
      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Model Setup</DialogTitle>
            <DialogDescription>
              Configure local AI models for medical data analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Hardware Info */}
            {hardware && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span>RAM: {hardware.total_memory_gb.toFixed(1)} GB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span>CPU Cores: {hardware.cpu_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span>OS: {hardware.os}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Recommended: {hardware.recommended_model}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ollama Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ollama Service</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isOllamaRunning ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">
                      Status: {isOllamaRunning ? 'Running' : 'Not Running'}
                    </span>
                  </div>
                  {!isOllamaRunning && (
                    <Button size="sm" onClick={handleStartOllama}>
                      Start Ollama
                    </Button>
                  )}
                </div>
                {!isOllamaRunning && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Ollama is required for local AI models. Please install from{' '}
                    <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      ollama.ai
                    </a>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Model Selection */}
            {isOllamaRunning && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Available Models</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshModels}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </Button>
                </div>
                {modelRecommendations.map((model) => {
                  const status = getModelStatus(model.name)
                  const canRun = canRunModel(model)
                  
                  return (
                    <Card key={model.name} className={!canRun ? 'opacity-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{model.name}</h5>
                              {model.is_medical && (
                                <Badge variant="secondary" className="text-xs">Medical</Badge>
                              )}
                              {hardware?.recommended_model === model.name && (
                                <Badge variant="default" className="text-xs">Recommended</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{model.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Size: {model.size_gb} GB</span>
                              <span>RAM Required: {model.recommended_ram_gb} GB</span>
                            </div>
                            {!canRun && (
                              <p className="text-xs text-red-500">
                                Requires {model.recommended_ram_gb} GB RAM (you have {hardware?.total_memory_gb.toFixed(1)} GB)
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {status === 'installed' && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Installed
                              </Badge>
                            )}
                            
                            {status === 'downloading' && (
                              <div className="space-y-1">
                                <Badge variant="secondary" className="text-xs">Downloading...</Badge>
                                <Progress value={downloadProgress} className="w-20 h-2" />
                              </div>
                            )}
                            
                            {status === 'available' && canRun && (
                              <Button
                                size="sm"
                                onClick={() => handleDownloadModel(model.name)}
                                disabled={isDownloading !== null}
                                className="flex items-center gap-1"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
            
            {/* Manual Download Option */}
            <div className="flex gap-2 pt-4 border-t">
              <ManualModelDownload onModelDownloaded={refreshModels} />
              <OllamaDiagnostic />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://ollama.com', '_blank')}
                className="flex items-center gap-1"
              >
                <Info className="h-3 w-3" />
                Ollama Docs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}