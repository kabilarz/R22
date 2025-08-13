'use client'

import { useState, useEffect } from 'react'
import { DataPanel } from '@/components/data-panel'
import { ChatPanel } from '@/components/chat-panel'
import { SPSSDataView } from '@/components/spss-data-view'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  data: any[]
  uploadedAt: Date
  dataset_id?: string  // Add backend dataset ID
}

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [showDataView, setShowDataView] = useState<UploadedFile | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string>('')
  const [isBackendReady, setIsBackendReady] = useState(false)

  // Initialize backend on component mount
  useEffect(() => {
    const initializeBackend = async () => {
      try {
        // Check if backend is healthy
        await apiClient.healthCheck()
        
        // Initialize database
        await apiClient.initializeDatabase()
        
        // Create a default chat session
        const chatResponse = await apiClient.createChat('Analysis Session')
        setCurrentChatId(chatResponse.chat_id)
        
        setIsBackendReady(true)
        toast.success('Backend initialized successfully')
      } catch (error) {
        console.error('Failed to initialize backend:', error)
        toast.error('Failed to connect to backend. Please ensure the Python server is running on localhost:8000')
      }
    }

    initializeBackend()
  }, [])

  const handleDataViewSave = async (updatedData: any[], variables: any) => {
    if (showDataView && showDataView.dataset_id) {
      try {
        // Convert variables to the format expected by the backend
        const variableList = Object.entries(variables).map(([name, info]: [string, any]) => ({
          name,
          type: info.type || '',
          label: info.label || '',
          measure: info.measure || '',
          role: info.role || '',
          missing: info.missing || ''
        }))

        // Update variables in the backend
        await apiClient.updateVariables(showDataView.dataset_id, variableList)
        
        // Update local file data
        const updatedFile = { ...showDataView, data: updatedData }
        setUploadedFiles(prev => prev.map(f => (f.id === updatedFile.id ? updatedFile : f)))
        if (selectedFile?.id === updatedFile.id) setSelectedFile(updatedFile)
        setShowDataView(null)
        
        toast.success('Variables saved successfully')
      } catch (error) {
        console.error('Failed to save variables:', error)
        toast.error('Failed to save variables to backend')
      }
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
      {/* Backend status indicator */}
      {!isBackendReady && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded">
          Connecting to backend...
        </div>
      )}
      
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
            currentChatId={currentChatId}
            isBackendReady={isBackendReady}
          />
        </div>

        {/* Right Panel */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatPanel 
            selectedFile={selectedFile} 
            currentChatId={currentChatId}
            isBackendReady={isBackendReady}
          />
        </div>
      </div>
    </div>
  )
}