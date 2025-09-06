import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { pythonSetupManager, PythonStatus, PythonSetupProgress, isTauriApp } from '@/lib/python-setup'

interface PythonSetupDialogProps {
  onComplete?: (status: PythonStatus | null) => void
  onSkip?: () => void
  autoStart?: boolean
}

export function PythonSetupDialog({ onComplete, onSkip, autoStart = false }: PythonSetupDialogProps) {
  const [status, setStatus] = useState<PythonStatus | null>(null)
  const [progress, setProgress] = useState<PythonSetupProgress | null>(null)
  const [isSetupRunning, setIsSetupRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkComplete, setCheckComplete] = useState(false)

  // Check Python status on mount
  useEffect(() => {
    if (!isTauriApp()) {
      setCheckComplete(true)
      onComplete?.(null)
      return
    }

    checkPythonStatus()
  }, [])

  // Auto-start setup if requested and Python is not ready
  useEffect(() => {
    if (autoStart && status && !status.is_available && !isSetupRunning) {
      handleSetupPython()
    }
  }, [autoStart, status, isSetupRunning])

  const checkPythonStatus = async () => {
    try {
      const currentStatus = await pythonSetupManager.checkPythonStatus()
      setStatus(currentStatus)
      setCheckComplete(true)

      // If Python is ready, auto-complete
      if (currentStatus.is_available && currentStatus.medical_libraries_available) {
        setTimeout(() => onComplete?.(currentStatus), 1000)
      }
    } catch (err) {
      setError(`Failed to check Python status: ${err}`)
      setCheckComplete(true)
    }
  }

  const handleSetupPython = async () => {
    setIsSetupRunning(true)
    setError(null)
    setProgress(null)

    try {
      const result = await pythonSetupManager.setupEmbeddedPython((prog) => {
        setProgress(prog)
      })

      setStatus(result)
      
      if (result.is_available && result.medical_libraries_available) {
        setTimeout(() => {
          onComplete?.(result)
        }, 2000) // Give user time to see success message
      }
    } catch (err) {
      setError(`Setup failed: ${err}`)
    } finally {
      setIsSetupRunning(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    setCheckComplete(false)
    checkPythonStatus()
  }

  if (!checkComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking Python Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Detecting Python installation for medical analysis...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!isTauriApp()) {
    return null // Don't show in web mode
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🐍 Python Setup for Medical Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        {status && (
          <Alert className={status.is_available && status.medical_libraries_available ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            <div className="flex items-center gap-2">
              {status.is_available && status.medical_libraries_available ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription className="text-sm">
                {pythonSetupManager.getStatusMessage(status)}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Progress */}
        {isSetupRunning && progress && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">Setting up Python...</span>
            </div>
            
            <Progress value={progress.progress} className="w-full" />
            
            <div className="text-xs text-muted-foreground">
              <div className="font-medium">{progress.step}</div>
              <div>{progress.message}</div>
            </div>

            {progress.completed && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-700">
                  Python setup completed successfully! Medical analysis libraries are ready.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Setup Information */}
        {status && !status.is_available && !isSetupRunning && (
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>What will be installed:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Python 3.11.7 embedded runtime</li>
              <li>Medical analysis libraries (pandas, numpy, scipy, etc.)</li>
              <li>Statistical computing packages</li>
              <li>Data visualization tools</li>
            </ul>
            <p className="text-xs mt-2">
              Size: ~150MB | No internet required after installation
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {status?.is_available && status.medical_libraries_available ? (
            <Button onClick={() => onComplete?.(status)} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Continue to Medical Analysis
            </Button>
          ) : (
            <>
              {!isSetupRunning && (
                <>
                  <Button 
                    onClick={handleSetupPython} 
                    className="flex-1"
                    disabled={isSetupRunning}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Setup Python for Medical Analysis
                  </Button>
                  
                  {onSkip && (
                    <Button variant="outline" onClick={onSkip}>
                      Skip for Now
                    </Button>
                  )}
                </>
              )}
              
              {error && (
                <Button variant="outline" onClick={handleRetry} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </>
          )}
        </div>

        {/* Technical Details Toggle */}
        {status && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Technical Details</summary>
            <div className="mt-2 space-y-1">
              <div>Source: {status.source}</div>
              {status.python_path && <div>Path: {status.python_path}</div>}
              {status.version && <div>Version: {status.version}</div>}
              <div>Medical Libraries: {status.medical_libraries_available ? '✅' : '❌'}</div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for easy Python setup integration
export function usePythonSetup() {
  const [pythonStatus, setPythonStatus] = useState<PythonStatus | null>(null)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isTauriApp()) {
      setIsLoading(false)
      setIsSetupComplete(true)
      return
    }

    const checkStatus = async () => {
      try {
        const status = await pythonSetupManager.checkPythonStatus()
        setPythonStatus(status)
        setIsSetupComplete(status.is_available && status.medical_libraries_available)
      } catch (error) {
        console.error('Failed to check Python status:', error)
        setIsSetupComplete(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
  }, [])

  const setupPython = async (onProgress?: (progress: PythonSetupProgress) => void) => {
    try {
      const result = await pythonSetupManager.setupEmbeddedPython(onProgress)
      setPythonStatus(result)
      setIsSetupComplete(result.is_available && result.medical_libraries_available)
      return result
    } catch (error) {
      console.error('Python setup failed:', error)
      throw error
    }
  }

  return {
    pythonStatus,
    isSetupComplete,
    isLoading,
    setupPython,
    isPythonAvailable: pythonStatus?.is_available ?? false,
    hasMedicalLibraries: pythonStatus?.medical_libraries_available ?? false,
  }
}