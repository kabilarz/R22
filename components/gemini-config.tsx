'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Settings, Eye, EyeOff, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface GeminiConfigProps {
  className?: string
}

type ConnectionStatus = 'connected' | 'disconnected' | 'testing' | 'error'

export function GeminiConfig({ className }: GeminiConfigProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null)

  useEffect(() => {
    // Load existing API key from environment/storage
    loadExistingApiKey()
    // Test connection on component mount
    testConnection()
  }, [])

  const loadExistingApiKey = () => {
    // In browser environment, check for existing API key
    if (typeof window !== 'undefined') {
      // Check if API key is available (from env or localStorage)
      const existingKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || localStorage.getItem('gemini_api_key')
      if (existingKey && existingKey.trim() !== '') {
        setApiKey(existingKey)
        testConnection(existingKey)
      }
    }
  }

  const testConnection = async (testApiKey?: string) => {
    const keyToTest = testApiKey || apiKey
    if (!keyToTest || keyToTest.trim() === '') {
      setConnectionStatus('disconnected')
      return
    }

    setConnectionStatus('testing')
    
    try {
      // Test the API key by making a simple request
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + keyToTest)
      
      if (response.ok) {
        setConnectionStatus('connected')
        setLastTestTime(new Date())
        toast.success('Gemini API connection successful!')
      } else if (response.status === 403) {
        setConnectionStatus('error')
        toast.error('Invalid Gemini API key. Please check your key.')
      } else {
        setConnectionStatus('error')
        toast.error('Failed to connect to Gemini API. Please check your internet connection.')
      }
    } catch (error) {
      setConnectionStatus('error')
      console.error('Gemini API test failed:', error)
      toast.error('Failed to test Gemini API connection.')
    }
  }

  const handleSaveApiKey = () => {
    if (!apiKey || apiKey.trim() === '') {
      toast.error('Please enter a valid API key')
      return
    }

    // Save to localStorage (in production, you might want to use a more secure method)
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', apiKey.trim())
      
      // Refresh AI service to use new key
      try {
        // Import and refresh AI service
        import('@/lib/ai-service').then(({ aiService }) => {
          aiService.refreshApiClient()
        })
      } catch (error) {
        console.warn('Failed to refresh AI service:', error)
      }
    }

    // Test the connection
    testConnection(apiKey.trim())
    
    // Close dialog
    setIsConfigOpen(false)
    toast.success('Gemini API key saved successfully!')
  }

  const handleRemoveApiKey = () => {
    setApiKey('')
    setConnectionStatus('disconnected')
    setLastTestTime(null)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gemini_api_key')
    }
    
    toast.success('Gemini API key removed')
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500'
      case 'testing': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'testing': return <AlertCircle className="h-4 w-4 text-yellow-600 animate-pulse" />
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <XCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected'
      case 'testing': return 'Testing...'
      case 'error': return 'Error'
      default: return 'Not Connected'
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Connection Status Indicator */}
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Gemini: {getStatusText()}
        </span>
      </div>

      {/* Configuration Button */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Configure Gemini API">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getStatusIcon()}
              Google Gemini API Configuration
            </DialogTitle>
            <DialogDescription>
              Configure your Google Gemini AI API key for cloud-based analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Connection Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="text-sm">{getStatusText()}</span>
                    {lastTestTime && connectionStatus === 'connected' && (
                      <Badge variant="secondary" className="text-xs">
                        Last tested: {lastTestTime.toLocaleTimeString()}
                      </Badge>
                    )}
                  </div>
                  {apiKey && (
                    <Button size="sm" variant="outline" onClick={() => testConnection()}>
                      Test Connection
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* API Key Configuration */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Gemini API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Gemini API key"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and used only for Google Gemini API calls
                </p>
              </div>

              {/* How to get API key */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-2">How to get your API key:</h4>
                  <ol className="text-xs text-muted-foreground space-y-1">
                    <li>1. Visit Google AI Studio (click link below)</li>
                    <li>2. Sign in with your Google account</li>
                    <li>3. Click "Create API key"</li>
                    <li>4. Copy the generated key and paste it above</li>
                  </ol>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-8"
                    onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Get API Key
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              {apiKey && (
                <Button variant="outline" onClick={handleRemoveApiKey}>
                  Remove Key
                </Button>
              )}
              <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                Save & Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}