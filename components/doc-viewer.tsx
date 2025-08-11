'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, X } from 'lucide-react'

interface DocViewerProps {
  isOpen: boolean
  onClose: () => void
  docName: string
  title: string
}

export function DocViewer({ isOpen, onClose, docName, title }: DocViewerProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && docName) {
      fetchDoc()
    }
  }, [isOpen, docName])

  const fetchDoc = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/docs/${docName}`)
      if (!response.ok) {
        throw new Error('Document not found')
      }
      const text = await response.text()
      setContent(text)
    } catch (err) {
      setError('Failed to load document')
      console.error('Error fetching document:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatMarkdownToHTML = (markdown: string) => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-6">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([^`]*)```/g, '<pre class="bg-muted p-3 rounded-md overflow-x-auto my-4"><code>$1</code></pre>')
      .replace(/`([^`]*)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
      // Links
      .replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 mt-4">
          <div className="pr-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading documentation...</div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-red-500">{error}</div>
              </div>
            )}
            
            {content && !loading && (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ 
                  __html: formatMarkdownToHTML(content) 
                }}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}