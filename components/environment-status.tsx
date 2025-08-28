'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Globe,
  Monitor,
  Info,
  ExternalLink,
  Download,
  Terminal,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface EnvironmentStatusProps {
  className?: string
}

export function EnvironmentStatus({ className = '' }: EnvironmentStatusProps) {
  const [isTauriEnvironment, setIsTauriEnvironment] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Check if we're in Tauri environment
    if (typeof window !== 'undefined') {
      try {
        require('@tauri-apps/api/core')
        setIsTauriEnvironment(true)
      } catch {
        setIsTauriEnvironment(false)
      }
    }
  }, [])

  const getEnvironmentInfo = () => {
    if (isTauriEnvironment) {
      return {
        type: 'desktop',
        title: 'Desktop Application',
        icon: <Monitor className="h-4 w-4" />,
        description: 'Full desktop features available',
        color: 'bg-green-500',
        features: [
          { name: 'Local AI Models', available: true, description: 'Ollama integration for privacy-focused analysis' },
          { name: 'File System Access', available: true, description: 'Direct file dialog and reading' },
          { name: 'Cloud AI Fallback', available: true, description: 'Google Gemini when local AI unavailable' },
          { name: 'Desktop Integration', available: true, description: 'Native OS features and performance' }
        ]
      }
    } else {
      return {
        type: 'browser',
        title: 'Browser Application',
        icon: <Globe className="h-4 w-4" />,
        description: 'Web development mode active',
        color: 'bg-blue-500',
        features: [
          { name: 'Local AI Models', available: false, description: 'Requires desktop application for local processing' },
          { name: 'File System Access', available: true, description: 'Browser file picker available' },
          { name: 'Cloud AI', available: true, description: 'Google Gemini fully functional' },
          { name: 'Web Compatibility', available: true, description: 'Works in any modern browser' }
        ]
      }
    }
  }

  const envInfo = getEnvironmentInfo()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Environment Badge */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${envInfo.color}`} />
        <Badge variant="outline" className="text-xs">
          {envInfo.icon}
          <span className="ml-1">{envInfo.title}</span>
        </Badge>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <Info className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {envInfo.icon}
              Environment Status
            </DialogTitle>
            <DialogDescription>
              {envInfo.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Current Status */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Currently running in <strong>{envInfo.type}</strong> mode.
                {envInfo.type === 'browser' && (
                  <span> For full local AI features, use the desktop application.</span>
                )}
              </AlertDescription>
            </Alert>

            {/* Feature Availability */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Available Features</h4>
              <div className="space-y-2">
                {envInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {feature.available ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{feature.name}</div>
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mode-Specific Instructions */}
            {envInfo.type === 'browser' && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Get Full Features</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Terminal className="h-3 w-3" />
                    <span>Development: <code>npm run tauri dev</code></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Download className="h-3 w-3" />
                    <span>Production: Build desktop installer</span>
                  </div>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-xs"
              >
                <a
                  href="/docs/USER_GUIDE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  User Guide
                </a>
              </Button>
              {envInfo.type === 'browser' && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs"
                >
                  <a
                    href="/docs/DEPLOYMENT_GUIDE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Desktop Setup
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}