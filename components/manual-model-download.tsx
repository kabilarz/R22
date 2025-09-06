'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Download, Terminal, Copy, ExternalLink, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ManualDownloadProps {
  onModelDownloaded?: (modelName: string) => void
}

export function ManualModelDownload({ onModelDownloaded }: ManualDownloadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customModel, setCustomModel] = useState('')

  const popularModels = [
    { name: 'tinyllama', size: '1.1GB', description: 'Fastest, basic analysis' },
    { name: 'phi3:mini', size: '2.3GB', description: 'Balanced performance' },
    { name: 'llama3.2:1b', size: '1.3GB', description: 'Modern compact model' },
    { name: 'biomistral:7b', size: '4.1GB', description: 'Medical specialized' },
  ]

  const copyCommand = (modelName: string) => {
    const command = `ollama pull ${modelName}`
    navigator.clipboard.writeText(command)
    toast.success('Command copied to clipboard!')
  }

  const openOllamaLibrary = () => {
    window.open('https://ollama.com/library', '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          Manual Download
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manual Model Download</DialogTitle>
          <DialogDescription>
            Download models manually using command line or browse the Ollama library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Popular Models */}
          <div>
            <h4 className="text-sm font-medium mb-3">Popular Models</h4>
            <div className="grid gap-3">
              {popularModels.map((model) => (
                <Card key={model.name} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                      <div className="text-xs text-muted-foreground">Size: {model.size}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyCommand(model.name)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Model */}
          <div>
            <h4 className="text-sm font-medium mb-3">Custom Model</h4>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="custom-model" className="text-xs">Model Name</Label>
                <Input
                  id="custom-model"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="e.g., llama3.2:3b"
                  className="text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  size="sm"
                  onClick={() => copyCommand(customModel)}
                  disabled={!customModel.trim()}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <div><strong>Step 1:</strong> Copy the command for your desired model</div>
                <div><strong>Step 2:</strong> Open Command Prompt or PowerShell</div>
                <div><strong>Step 3:</strong> Paste and run the command</div>
                <div><strong>Step 4:</strong> Refresh the models list in the app</div>
              </div>
            </AlertDescription>
          </Alert>

          {/* External Links */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openOllamaLibrary}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Browse All Models
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://ollama.com/download', '_blank')}
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Install Ollama
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}