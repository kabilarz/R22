'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface BackendStatusProps {
  onStatusChange?: (isReady: boolean) => void
}

export function BackendStatus({ onStatusChange }: BackendStatusProps) {
  const [status, setStatus] = useState<'checking' | 'ready' | 'starting' | 'error'>('checking')
  const [message, setMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const checkBackend = async () => {
    try {
      console.log('Checking backend health at:', `${apiClient['baseUrl']}/health`)
      const result = await apiClient.healthCheck()
      console.log('Backend health check successful:', result)
      setStatus('ready')
      setMessage('Backend is ready')
      onStatusChange?.(true)
    } catch (error) {
      console.error('Backend health check failed:', error)
      
      // Log more debugging info
      console.log('Current API base URL:', apiClient['baseUrl'])
      console.log('Retry count:', retryCount)
      
      if (retryCount < 15) { // Increased from 10 to 15
        setStatus('starting')
        setMessage(`Starting backend server... (${retryCount + 1}/15)`)
        setRetryCount(prev => prev + 1)
        
        // Try to start backend if running in Tauri environment
        if (typeof window !== 'undefined' && (window as any).__TAURI__) {
          try {
            const { invoke } = await import('@tauri-apps/api/core')
            await invoke('start_backend')
          } catch (invokeError) {
            console.warn('Failed to invoke backend start:', invokeError)
          }
        }
        
        // Retry after delay - increased delay for slower systems
        setTimeout(checkBackend, 4000) // Increased from 3000 to 4000ms
      } else {
        setStatus('error')
        setMessage('Backend failed to start after 15 attempts. Please check the backend process manually.')
        onStatusChange?.(false)
      }
    }
  }

  useEffect(() => {
    checkBackend()
  }, [])

  const handleRetry = () => {
    setRetryCount(0)
    setStatus('checking')
    checkBackend()
  }

  if (status === 'ready') {
    return null // Don't show anything when backend is ready
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className={`
        ${status === 'error' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}
      `}>
        <div className="flex items-center gap-2">
          {status === 'checking' || status === 'starting' ? (
            <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
          ) : status === 'error' ? (
            <XCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          
          <div className="flex-1">
            <AlertDescription className={`
              ${status === 'error' ? 'text-red-800' : 'text-yellow-800'}
            `}>
              {message}
            </AlertDescription>
            
            {status === 'error' && (
              <div className="mt-2 space-y-2">
                <Button 
                  onClick={handleRetry}
                  variant="outline" 
                  size="sm"
                  className="text-red-800 border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Connection
                </Button>
                <div className="text-xs text-red-700">
                  <p><strong>Troubleshooting:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Run <code className="bg-red-100 px-1 rounded">fix_and_start.bat</code> to restart everything</li>
                    <li>Manually start: <code className="bg-red-100 px-1 rounded">python backend/app.py</code></li>
                    <li>Check if port 8001 is available</li>
                    <li>Verify Python is installed and in PATH</li>
                    <li>Try waiting 30 seconds for slow startup</li>
                  </ul>
                  <p className="mt-2"><strong>Debug info:</strong> Trying to connect to http://localhost:8001/api/health</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Alert>
    </div>
  )
}