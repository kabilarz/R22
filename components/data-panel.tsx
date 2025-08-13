'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Upload,
  FileText,
  Database,
  Trash2,
  Menu,
  Sun,
  Moon,
  Settings,
  Bot,
  Table,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { DocViewer } from '@/components/doc-viewer'
import { apiClient } from '@/lib/api'

// Tauri imports - handle potential environment differences
let tauriApis: any = {}
if (typeof window !== 'undefined') {
  try {
    tauriApis = {
      open: require('@tauri-apps/plugin-dialog').open,
      readTextFile: require('@tauri-apps/plugin-fs').readTextFile,
    }
  } catch (error) {
    console.log('Tauri APIs not available, running in browser mode')
  }
}

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  data: any[]
  uploadedAt: Date
  dataset_id?: string  // Add backend dataset ID
}

interface DataPanelProps {
  uploadedFiles: UploadedFile[]
  setUploadedFiles: (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => void
  selectedFile: UploadedFile | null
  setSelectedFile: (file: UploadedFile | null) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  onShowDataView: (file: UploadedFile) => void
  currentChatId: string
  isBackendReady: boolean
}

/** Simple Help/Docs links for in-app pages */
function HelpLinks() {
  const links = [
    { label: 'Technical Documentation', href: '/docs/TECHNICAL_DOCUMENTATION', desc: 'Architecture, setup, and internals' },
    { label: 'FAQ', href: '/docs/FAQ', desc: 'Common questions and quick fixes' },
    { label: 'Roadmap', href: '/docs/ROADMAP', desc: 'What’s planned next' },
    { label: 'User Guide', href: '/docs/USER_GUIDE', desc: 'How to use Nemo step by step' },
  ]

  return (
    <div className="mt-3 space-y-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted"
        >
          <div className="flex flex-col">
            <span className="text-sm">{l.label}</span>
            {l.desc && <span className="text-xs text-muted-foreground">{l.desc}</span>}
          </div>
          <ExternalLink className="h-4 w-4 opacity-70" />
        </Link>
      ))}
    </div>
  )
}

export function DataPanel({
  uploadedFiles,
  setUploadedFiles,
  selectedFile,
  setSelectedFile,
  isCollapsed,
  onToggleCollapse,
  onShowDataView,
  currentChatId,
  isBackendReady,
}: DataPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [currentDoc, setCurrentDoc] = useState<{ name: string; title: string } | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
      )
    }
    return false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Listen once for "open-doc" custom events (if you still use DocViewer buttons anywhere)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { name: string; title: string }
      if (detail?.name) openDoc(detail.name, detail.title || detail.name)
    }
    window.addEventListener('open-doc', handler)
    return () => window.removeEventListener('open-doc', handler)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileSelect = async () => {
    // Check if we're running in Tauri
    if (tauriApis.open) {
      try {
        const selected = await tauriApis.open({
          filters: [
            {
              name: 'Data Files',
              extensions: ['csv', 'json', 'xlsx', 'xls']
            }
          ],
          multiple: true
        })
        
        if (selected) {
          const filePaths = Array.isArray(selected) ? selected : [selected]
          await processFilePaths(filePaths)
        }
      } catch (error) {
        toast.error('Failed to open file dialog')
        console.error('File dialog error:', error)
      }
    } else {
      // Fallback to browser file input for development
      fileInputRef.current?.click()
    }
  }

  const handleBrowserFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const processFilePaths = async (filePaths: string[]) => {
    if (!isBackendReady) {
      toast.error('Backend is not ready. Please wait for initialization.')
      return
    }

    for (const filePath of filePaths) {
      const fileName = filePath.split(/[\/\\]/).pop() || 'unknown'
      
      if (!fileName.match(/\.(csv|json|xlsx|xls)$/i)) {
        toast.error(`Unsupported file type: ${fileName}`)
        continue
      }

      try {
        // Read file content using Tauri
        let fileContent: string
        let fileSize = 0
        
        if (tauriApis.readTextFile) {
          fileContent = await tauriApis.readTextFile(filePath)
          fileSize = fileContent.length
        } else {
          throw new Error('Tauri file system not available')
        }

        // Create a File-like object for the backend
        const blob = new Blob([fileContent], { type: getFileTypeFromExtension(fileName) })
        const file = new File([blob], fileName, { type: getFileTypeFromExtension(fileName) })

        // Upload to backend
        const backendResult = await apiClient.uploadDataset(file)
        
        // Parse locally for immediate display
        const data = await parseFileContent(fileContent, fileName)
        
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random(),
          name: fileName,
          type: getFileTypeFromExtension(fileName),
          size: fileSize,
          data,
          uploadedAt: new Date(),
          dataset_id: backendResult.dataset_id,
        }

        setUploadedFiles((prev: UploadedFile[]) => [...prev, uploadedFile])
        toast.success(`File ${fileName} uploaded successfully`)
      } catch (error) {
        toast.error(
          `Failed to process ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }
  }

  const processFiles = async (files: File[]) => {
    if (!isBackendReady) {
      toast.error('Backend is not ready. Please wait for initialization.')
      return
    }

    for (const file of files) {
      if (!file.name.match(/\.(csv|json|xlsx|xls)$/i)) {
        toast.error(`Unsupported file type: ${file.name}`)
        continue
      }

      try {
        // Upload to backend first
        const backendResult = await apiClient.uploadDataset(file)
        
        // Also parse locally for immediate display
        const data = await parseFile(file)
        
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type || getFileTypeFromExtension(file.name),
          size: file.size,
          data,
          uploadedAt: new Date(),
          dataset_id: backendResult.dataset_id, // Store backend dataset ID
        }

        setUploadedFiles((prev: UploadedFile[]) => [...prev, uploadedFile])
        toast.success(`File ${file.name} uploaded successfully`)
      } catch (error) {
        toast.error(
          `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }
  }

  const parseFileContent = (content: string, fileName: string): any[] => {
    try {
      if (fileName.endsWith('.json')) {
        const jsonData = JSON.parse(content)
        return Array.isArray(jsonData) ? jsonData : [jsonData]
      } else if (fileName.endsWith('.csv')) {
        return parseCSV(content)
      } else {
        throw new Error('Unsupported file format for content parsing')
      }
    } catch (err) {
      throw new Error(`Failed to parse ${fileName}: ${err}`)
    }
  }

  const parseFile = (file: File): Promise<any[]> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          resolve(parseFileContent(content, file.name))
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n').filter((l) => l.trim())
    if (lines.length === 0) return []
    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))
    const data: any[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''))
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] ?? ''
      })
      data.push(row)
    }
    return data
  }

  const getFileTypeFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'csv':
        return 'text/csv'
      case 'json':
        return 'application/json'
      case 'xlsx':
      case 'xls':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      default:
        return 'application/octet-stream'
    }
  }

  const deleteFile = (fileId: string) => {
    setUploadedFiles((prev: UploadedFile[]) => prev.filter((f) => f.id !== fileId))
    if (selectedFile?.id === fileId) setSelectedFile(null)
    toast.success('File deleted')
  }

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    setIsDarkMode(!isDarkMode)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', !isDarkMode)
  }

  const openDoc = (docName: string, title: string) => {
    setCurrentDoc({ name: docName, title })
    setIsHelpOpen(false)
  }

  if (isCollapsed) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-3 border-b">
          <div className="flex flex-col items-center space-y-3">
            <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="w-8 h-8 p-0" title="Expand panel">
              <Menu className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-8 h-8 p-0" title="Toggle theme">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" title="Gemini model settings">
              <Bot className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>

            {/* Collapsed Help */}
            <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" title="Help & Documentation">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px] pointer-events-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Help & Documentation
                  </DialogTitle>
                  <DialogDescription>Open full-width docs in a new tab.</DialogDescription>
                </DialogHeader>
                <HelpLinks />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col relative">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Nemo</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-8 h-8 p-0" title="Toggle theme">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" title="Gemini model settings">
              <Bot className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>

            {/* Expanded Help */}
            <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" title="Help & Documentation">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px] pointer-events-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Help & Documentation
                  </DialogTitle>
                  <DialogDescription>Open full-width docs in a new tab.</DialogDescription>
                </DialogHeader>
                <HelpLinks />
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="w-8 h-8 p-0" title="Collapse panel">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Uploader (smaller, centered, no icon) */}
        <div className="flex justify-center">
          <div
            className={`w-[240px] h-[80px] rounded-lg border-2 border-dashed p-3 transition-colors flex flex-col justify-center ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1"></p>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                Browse Files
              </Button>
              <p className="text-[11px] text-muted-foreground mt-1">
                Supports CSV, JSON, Excel files
              </p>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.json,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Tabs (only Files visible here) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Tabs defaultValue="files" className="flex-1 min-h-0 flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Files ({uploadedFiles.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Files Tab */}
          <TabsContent value="files" className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full px-6">
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <Card
                    key={file.id}
                    className={`cursor-pointer transition-colors ${
                      selectedFile?.id === file.id ? 'bg-primary/5 border-primary' : ''
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <CardContent className="p-3 pr-2">
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                          </div>

                          {/* rows + inline actions */}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {file.data.length} rows
                            </Badge>

                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-1"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onShowDataView(file)
                                }}
                                title="SPSS Data View"
                              >
                                <Table className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-1"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteFile(file.id)
                                }}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground">{file.uploadedAt.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {uploadedFiles.length === 0 && (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No files uploaded yet</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Docs modal (kept for your internal DocViewer flow if you use it elsewhere) */}
      <DocViewer
        isOpen={!!currentDoc}
        onClose={() => setCurrentDoc(null)}
        docName={currentDoc?.name || ''}
        title={currentDoc?.title || ''}
      />
    </div>
  )
}
