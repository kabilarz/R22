'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle, RefreshCw, Bug, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { ollamaClient } from '@/lib/ollama-client'

interface DiagnosticInfo {
  ollamaStatus: boolean
  installedModels: string[]
  hardwareInfo: any
  tauriAvailable: boolean
  lastError?: string
}

export function OllamaDiagnostic() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [diagnostic, setDiagnostic] = useState<DiagnosticInfo | null>(null)

  const runDiagnostic = async () => {
    setIsLoading(true)
    console.log('🔍 [Diagnostic] Starting comprehensive Ollama diagnostic...')
    
    try {
      const diagInfo: DiagnosticInfo = {
        tauriAvailable: ollamaClient.isTauriAvailable(),
        ollamaStatus: false,
        installedModels: [],
        hardwareInfo: null
      }

      console.log('🖥️ [Diagnostic] Tauri available:', diagInfo.tauriAvailable)

      if (diagInfo.tauriAvailable) {
        try {
          console.log('🔍 [Diagnostic] Checking Ollama status...')
          diagInfo.ollamaStatus = await ollamaClient.checkStatus()
          console.log('📊 [Diagnostic] Ollama status:', diagInfo.ollamaStatus)
        } catch (error) {
          console.error('❌ [Diagnostic] Error checking Ollama status:', error)
          diagInfo.lastError = `Status check failed: ${error}`
        }

        try {
          console.log('🖥️ [Diagnostic] Getting hardware info...')
          diagInfo.hardwareInfo = await ollamaClient.getHardwareInfo()
          console.log('💻 [Diagnostic] Hardware info:', diagInfo.hardwareInfo)
        } catch (error) {
          console.error('❌ [Diagnostic] Error getting hardware info:', error)
        }

        try {
          console.log('📦 [Diagnostic] Listing installed models...')
          diagInfo.installedModels = await ollamaClient.listInstalledModels()
          console.log('📋 [Diagnostic] Installed models:', diagInfo.installedModels)
        } catch (error) {
          console.error('❌ [Diagnostic] Error listing models:', error)
        }
      }

      setDiagnostic(diagInfo)
      toast.success('Diagnostic completed')
      
    } catch (error) {
      console.error('❌ [Diagnostic] Diagnostic failed:', error)
      toast.error('Diagnostic failed')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && !diagnostic) {
      runDiagnostic()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Diagnostic
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ollama Diagnostic</DialogTitle>
          <DialogDescription>
            Comprehensive system diagnostic for Ollama integration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">System Status</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={runDiagnostic}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Running diagnostic...</span>
              </div>
            </div>
          ) : diagnostic ? (
            <div className="space-y-4">
              {/* Environment */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Environment</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tauri Available</span>
                    <Badge variant={diagnostic.tauriAvailable ? 'default' : 'destructive'}>
                      {diagnostic.tauriAvailable ? 'Yes' : 'No (Browser Mode)'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ollama Service</span>
                    <Badge variant={diagnostic.ollamaStatus ? 'default' : 'destructive'}>
                      {diagnostic.ollamaStatus ? 'Running' : 'Not Running'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Hardware */}
              {diagnostic.hardwareInfo && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Hardware</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>RAM: {diagnostic.hardwareInfo.total_memory_gb?.toFixed(1)} GB</div>
                      <div>CPU Cores: {diagnostic.hardwareInfo.cpu_count}</div>
                      <div>OS: {diagnostic.hardwareInfo.os}</div>
                      <div>Recommended: {diagnostic.hardwareInfo.recommended_model}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Models */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Installed Models ({diagnostic.installedModels.length})</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {diagnostic.installedModels.length > 0 ? (
                    <div className="space-y-1">
                      {diagnostic.installedModels.map((model, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-sm">{model}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      <span className="text-sm">No models installed</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Errors */}
              {diagnostic.lastError && (
                <Card className="border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-600">Last Error</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">
                      {diagnostic.lastError}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Troubleshooting */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Fixes</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {!diagnostic.tauriAvailable && (
                    <div className="text-sm text-amber-600">
                      • Use desktop app for local AI features
                    </div>
                  )}
                  {!diagnostic.ollamaStatus && diagnostic.tauriAvailable && (
                    <div className="text-sm text-amber-600">
                      • Install Ollama from ollama.com
                      • Or run: ollama serve
                    </div>
                  )}
                  {diagnostic.installedModels.length === 0 && diagnostic.ollamaStatus && (
                    <div className="text-sm text-amber-600">
                      • Download a model: ollama pull tinyllama
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}