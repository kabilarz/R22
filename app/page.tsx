'use client'

import { useState, useEffect } from 'react'
import { DataPanel } from '@/components/data-panel'
import { ChatPanel } from '@/components/chat-panel'
import { SPSSDataView } from '@/components/spss-data-view'
import { BackendStatus } from '@/components/backend-status'
import { MenuBar } from '@/components/menu-bar'
import { PluginManager } from '@/components/plugin-manager'
import { AboutDialog } from '@/components/about-dialog'
import { PythonSetupDialog } from '@/components/python-setup-dialog'
import { apiClient } from '@/lib/api'
import { initializePython, isTauriApp, PythonStatus } from '@/lib/python-setup'
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
  const [showPluginManager, setShowPluginManager] = useState(false)
  const [showAboutDialog, setShowAboutDialog] = useState(false)
  const [pythonStatus, setPythonStatus] = useState<PythonStatus | null>(null)
  const [showPythonSetup, setShowPythonSetup] = useState(false)
  const [isPythonReady, setIsPythonReady] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Initialize Python and backend on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Step 1: Initialize Python if in Tauri app
        if (isTauriApp()) {
          console.log('🚀 Initializing Python for medical analysis...')
          const pythonResult = await initializePython((progress) => {
            console.log(`Python setup: ${progress.step} - ${progress.message} (${progress.progress}%)`)
          })
          
          if (pythonResult) {
            setPythonStatus(pythonResult)
            setIsPythonReady(pythonResult.is_available && pythonResult.medical_libraries_available)
            
            if (!pythonResult.is_available || !pythonResult.medical_libraries_available) {
              setShowPythonSetup(true)
              setIsInitializing(false)
              return // Wait for user to complete Python setup
            }
          } else {
            // Web mode or Python setup not available
            setIsPythonReady(true)
          }
        } else {
          // Web mode
          setIsPythonReady(true)
        }
        
        // Step 2: Initialize backend
        console.log('🔗 Initializing backend...')
        await apiClient.healthCheck()
        await apiClient.initializeDatabase()
        
        const chatResponse = await apiClient.createChat('Analysis Session')
        setCurrentChatId(chatResponse.chat_id)
        
        setIsBackendReady(true)
        setIsInitializing(false)
        
        const mode = isTauriApp() ? 'Desktop' : 'Web'
        toast.success(`${mode} application initialized successfully`)
        
      } catch (error) {
        console.error('Failed to initialize application:', error)
        setIsBackendReady(false)
        setIsInitializing(false)
        // BackendStatus component will handle backend error display
      }
    }

    initializeApp()
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

  const handlePythonSetupComplete = (status: PythonStatus | null) => {
    setPythonStatus(status)
    setShowPythonSetup(false)
    setIsPythonReady(true)
    setIsInitializing(false)
    
    if (status?.is_available) {
      toast.success('🐍 Python ready for medical analysis!')
    }
  }

  const handlePythonSetupSkip = () => {
    setShowPythonSetup(false)
    setIsPythonReady(false) // Python not ready but user chose to skip
    setIsInitializing(false)
    toast.warning('Python setup skipped - some analysis features may be limited')
  }

  // Show Python setup dialog if needed
  if (showPythonSetup) {
    return (
      <div className="h-screen w-screen bg-muted/20 flex items-center justify-center">
        <PythonSetupDialog 
          onComplete={handlePythonSetupComplete}
          onSkip={handlePythonSetupSkip}
          autoStart={true}
        />
      </div>
    )
  }

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-semibold">🏥 Nemo Medical AI</div>
          <div className="text-muted-foreground">Initializing medical analysis environment...</div>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  // Full-screen SPSS Data View (keep borderless)
  if (showDataView) {
    return (
      <SPSSDataView 
        file={showDataView} 
        onSave={handleDataViewSave}
        onClose={() => setShowDataView(null)}
      />
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <MenuBar 
        onPluginManagerOpen={() => setShowPluginManager(true)}
        onAboutOpen={() => setShowAboutDialog(true)}
      />
      
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className={`transition-all duration-300 ${isPanelCollapsed ? 'w-12' : 'w-80'} border-r flex-shrink-0`}>
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
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <ChatPanel 
            selectedFile={selectedFile}
            currentChatId={currentChatId}
            isBackendReady={isBackendReady}
          />
        </div>
      </div>
      
      <BackendStatus onStatusChange={setIsBackendReady} />
      
      {showPluginManager && (
        <PluginManager open={showPluginManager} onOpenChange={setShowPluginManager} />
      )}
      
      {showAboutDialog && (
        <AboutDialog open={showAboutDialog} onOpenChange={setShowAboutDialog} />
      )}
    </div>
  )
}