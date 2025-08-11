'use client'

import { useState } from 'react'
import { DataPanel } from '@/components/data-panel'
import { ChatPanel } from '@/components/chat-panel'
import { SPSSDataView } from '@/components/spss-data-view'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  data: any[]
  uploadedAt: Date
}

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [showDataView, setShowDataView] = useState<UploadedFile | null>(null)

  const handleDataViewSave = (updatedData: any[], variables: any) => {
    if (showDataView) {
      const updatedFile = { ...showDataView, data: updatedData }
      setUploadedFiles(prev => prev.map(f => (f.id === updatedFile.id ? updatedFile : f)))
      if (selectedFile?.id === updatedFile.id) setSelectedFile(updatedFile)
      setShowDataView(null)
    }
  }

  // Full-screen SPSS Data View (keep borderless)
  if (showDataView) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-background">
        <SPSSDataView
          file={showDataView}
          onClose={() => setShowDataView(null)}
          onSave={handleDataViewSave}
        />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-muted/20 p-4">
      {/* Outer bordered shell */}
      <div className="h-full w-full flex bg-background border border-gray-200 rounded-2xl shadow-sm">
        {/* Left Panel */}
        <div
          className={`h-full flex flex-col transition-all duration-300 border-r border-border 
                      box-border pr-3 ${isPanelCollapsed ? 'w-12' : 'w-[300px]'}`}
        >
          <DataPanel
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isCollapsed={isPanelCollapsed}
            onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
            onShowDataView={setShowDataView}
          />
        </div>

        {/* Right Panel */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatPanel selectedFile={selectedFile} />
        </div>
      </div>
    </div>
  )
}
