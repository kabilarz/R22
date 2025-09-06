import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export interface PythonStatus {
  is_available: boolean
  python_path?: string
  version?: string
  source: 'bundled' | 'system' | 'none'
  medical_libraries_available: boolean
  setup_required: boolean
}

export interface PythonSetupProgress {
  step: string
  progress: number
  message: string
  completed: boolean
  error?: string
}

export class PythonSetupManager {
  private progressCallback?: (progress: PythonSetupProgress) => void
  private unlisten?: () => void

  /**
   * Check the current Python status
   */
  async checkPythonStatus(): Promise<PythonStatus> {
    try {
      return await invoke<PythonStatus>('check_python_status')
    } catch (error) {
      console.error('Failed to check Python status:', error)
      throw new Error(`Python status check failed: ${error}`)
    }
  }

  /**
   * Get the current Python executable path
   */
  async getPythonPath(): Promise<string> {
    try {
      return await invoke<string>('get_python_path')
    } catch (error) {
      console.error('Failed to get Python path:', error)
      throw new Error(`Python path retrieval failed: ${error}`)
    }
  }

  /**
   * Setup embedded Python with progress tracking
   */
  async setupEmbeddedPython(
    onProgress?: (progress: PythonSetupProgress) => void
  ): Promise<PythonStatus> {
    this.progressCallback = onProgress

    // Listen for progress events
    if (this.unlisten) {
      this.unlisten()
    }

    this.unlisten = await listen<PythonSetupProgress>(
      'python_setup_progress',
      (event) => {
        if (this.progressCallback) {
          this.progressCallback(event.payload)
        }
      }
    )

    try {
      const result = await invoke<PythonStatus>('setup_embedded_python')
      
      // Clean up listener
      if (this.unlisten) {
        this.unlisten()
        this.unlisten = undefined
      }

      return result
    } catch (error) {
      // Clean up listener on error
      if (this.unlisten) {
        this.unlisten()
        this.unlisten = undefined
      }

      console.error('Python setup failed:', error)
      throw new Error(`Python setup failed: ${error}`)
    }
  }

  /**
   * Ensure Python is ready for medical analysis
   * This is the main function to call during app startup
   */
  async ensurePythonReady(
    onProgress?: (progress: PythonSetupProgress) => void
  ): Promise<PythonStatus> {
    console.log('🔍 Ensuring Python is ready for medical analysis...')

    // First check current status
    const status = await this.checkPythonStatus()

    if (status.is_available && status.medical_libraries_available) {
      console.log('✅ Python is already ready for medical analysis')
      return status
    }

    if (status.is_available && !status.medical_libraries_available && status.source === 'system') {
      console.log('📦 System Python found, but medical libraries missing. Setting up bundled Python...')
      return await this.setupEmbeddedPython(onProgress)
    }

    if (!status.is_available) {
      console.log('🚀 No Python found. Setting up embedded Python...')
      return await this.setupEmbeddedPython(onProgress)
    }

    // If bundled Python exists but libraries are missing, reinstall
    if (status.source === 'bundled' && !status.medical_libraries_available) {
      console.log('🔧 Bundled Python found but libraries missing. Reinstalling...')
      return await this.setupEmbeddedPython(onProgress)
    }

    return status
  }

  /**
   * Get user-friendly status message
   */
  getStatusMessage(status: PythonStatus): string {
    if (!status.is_available) {
      return '❌ Python not available - setup required'
    }

    if (status.medical_libraries_available) {
      return `✅ Python ready for medical analysis (${status.source})`
    }

    if (status.source === 'system') {
      return '⚠️ System Python found - medical libraries will be installed separately'
    }

    return '🔧 Python found but medical libraries missing'
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.unlisten) {
      this.unlisten()
      this.unlisten = undefined
    }
    this.progressCallback = undefined
  }
}

// Singleton instance for the app
export const pythonSetupManager = new PythonSetupManager()

// Helper function to check if we're in Tauri environment
export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

// Auto-setup function for app initialization
export async function initializePython(
  onProgress?: (progress: PythonSetupProgress) => void
): Promise<PythonStatus | null> {
  if (!isTauriApp()) {
    console.log('🌐 Running in web mode - Python setup not available')
    return null
  }

  try {
    return await pythonSetupManager.ensurePythonReady(onProgress)
  } catch (error) {
    console.error('Failed to initialize Python:', error)
    return null
  }
}