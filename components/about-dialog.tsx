'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Shield, 
  Brain, 
  Users, 
  ExternalLink,
  Github,
  Globe
} from 'lucide-react'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const handleExternalLink = (url: string) => {
    // In Tauri, use the shell plugin to open external links
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-blue-600" />
            About Nemo AI Medical Platform
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Version Info */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Nemo</h2>
            <p className="text-lg text-muted-foreground">
              AI-Powered Medical Data Analysis Platform
            </p>
            <Badge variant="default" className="text-sm">
              Version 1.0.0
            </Badge>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              Our Mission
            </h3>
            <p className="text-sm text-muted-foreground">
              Accelerating medical breakthroughs by making advanced statistical analysis 
              accessible to medical researchers through natural language AI, while maintaining 
              the highest standards of data privacy and HIPAA compliance.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                AI-Powered Analysis
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Natural language statistical queries</li>
                <li>• 119 specialized medical statistical tests</li>
                <li>• Automated Python code generation</li>
                <li>• Intelligent result interpretation</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Privacy & Compliance
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HIPAA-compliant data processing</li>
                <li>• Local-first architecture</li>
                <li>• No cloud data transmission</li>
                <li>• Offline AI capability</li>
              </ul>
            </div>
          </div>

          {/* Target Users */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              Built for Medical Researchers
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Medical Researchers</Badge>
              <Badge variant="outline">Clinical Trial Analysts</Badge>
              <Badge variant="outline">Epidemiologists</Badge>
              <Badge variant="outline">Biostatisticians</Badge>
              <Badge variant="outline">Healthcare Data Scientists</Badge>
            </div>
          </div>

          {/* Technology Stack */}
          <div>
            <h3 className="font-semibold mb-2">Technology Stack</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Frontend:</strong> React, Next.js, TypeScript, Tailwind CSS</p>
              <p><strong>Desktop:</strong> Tauri (Rust-based)</p>
              <p><strong>Backend:</strong> Python, FastAPI, pandas, scipy, statsmodels</p>
              <p><strong>AI:</strong> Local Ollama models + Google Gemini fallback</p>
              <p><strong>Statistics:</strong> 119 tests across 7+ specialized libraries</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExternalLink('https://github.com/nemo-ai/medical-platform')}
            >
              <Github className="w-4 h-4 mr-2" />
              Documentation
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExternalLink('https://nemo-ai.com')}
            >
              <Globe className="w-4 h-4 mr-2" />
              Website
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>© 2024 Nemo AI Medical Platform. Built with ❤️ for medical researchers worldwide.</p>
            <p className="mt-1">Accelerating medical discovery through accessible AI-powered analytics.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}