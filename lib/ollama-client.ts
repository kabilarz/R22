/**
 * Ollama client for local LLM integration
 * Interfaces with Tauri commands for Ollama management
 */

import { invoke } from '@tauri-apps/api/core'

export interface HardwareInfo {
  total_memory_gb: number
  available_memory_gb: number
  cpu_count: number
  recommended_model: string
  can_run_7b: boolean
  can_run_mini: boolean
  os: string
}

export interface ModelInfo {
  name: string
  size_gb: number
  description: string
  recommended_ram_gb: number
  is_medical: boolean
}

export class OllamaClient {
  /**
   * Get system hardware information
   */
  async getHardwareInfo(): Promise<HardwareInfo> {
    try {
      return await invoke<HardwareInfo>('get_hardware_info')
    } catch (error) {
      throw new Error(`Failed to get hardware info: ${error}`)
    }
  }

  /**
   * Check if Ollama service is running
   */
  async checkStatus(): Promise<boolean> {
    try {
      return await invoke<boolean>('check_ollama_status')
    } catch (error) {
      console.error('Failed to check Ollama status:', error)
      return false
    }
  }

  /**
   * Setup bundled Ollama
   */
  async setupBundledOllama(): Promise<string> {
    try {
      return await invoke<string>('setup_bundled_ollama')
    } catch (error) {
      throw new Error(`Failed to setup bundled Ollama: ${error}`)
    }
  }

  /**
   * Start Ollama service
   */
  async startOllama(): Promise<string> {
    try {
      return await invoke<string>('start_ollama')
    } catch (error) {
      throw new Error(`Failed to start Ollama: ${error}`)
    }
  }

  /**
   * Download a model
   */
  async downloadModel(modelName: string): Promise<string> {
    try {
      return await invoke<string>('download_model', { modelName })
    } catch (error) {
      throw new Error(`Failed to download model ${modelName}: ${error}`)
    }
  }

  /**
   * Query a local LLM
   */
  async query(model: string, prompt: string): Promise<string> {
    try {
      return await invoke<string>('query_ollama', { model, prompt })
    } catch (error) {
      throw new Error(`Failed to query model ${model}: ${error}`)
    }
  }

  /**
   * Get list of installed models
   */
  async listInstalledModels(): Promise<string[]> {
    try {
      return await invoke<string[]>('list_installed_models')
    } catch (error) {
      console.error('Failed to list models:', error)
      return []
    }
  }

  /**
   * Get model recommendations based on hardware
   */
  async getModelRecommendations(): Promise<ModelInfo[]> {
    try {
      return await invoke<ModelInfo[]>('get_model_recommendations')
    } catch (error) {
      console.error('Failed to get model recommendations:', error)
      return []
    }
  }

  /**
   * Generate medical data analysis query
   */
  async generateAnalysisCode(query: string, dataContext: string): Promise<string> {
    const prompt = this.buildAnalysisPrompt(query, dataContext)
    
    // Try to determine best available model
    const hardware = await this.getHardwareInfo()
    const installedModels = await this.listInstalledModels()
    
    // Prefer medical model if available and hardware supports it
    let selectedModel = 'tinyllama'
    if (installedModels.includes('biomistral:7b') && hardware.can_run_7b) {
      selectedModel = 'biomistral:7b'
    } else if (installedModels.includes('phi3:mini') && hardware.can_run_mini) {
      selectedModel = 'phi3:mini'
    } else if (installedModels.includes('tinyllama')) {
      selectedModel = 'tinyllama'
    }

    return await this.query(selectedModel, prompt)
  }

  /**
   * Build analysis prompt for medical data
   */
  private buildAnalysisPrompt(userQuery: string, dataContext: string): string {
    return `You are a medical data analysis assistant. Generate Python pandas code to analyze the given dataset.

Dataset Context:
${dataContext}

User Question: ${userQuery}

Please provide:
1. Clean, executable pandas code
2. Brief explanation of the analysis
3. Any important medical insights

Requirements:
- Use 'df' as the DataFrame variable name
- Include error handling
- Provide clear variable names
- Add comments explaining medical significance

Python Code:`
  }

  /**
   * Create example queries for medical data
   */
  getExampleQueries(): Array<{ label: string; query: string }> {
    return [
      {
        label: "Descriptive Statistics",
        query: "Show me basic statistics for all numeric variables"
      },
      {
        label: "Age Distribution",
        query: "What is the age distribution in this dataset?"
      },
      {
        label: "Gender Analysis",
        query: "Compare key metrics between male and female patients"
      },
      {
        label: "BMI Categories",
        query: "Categorize patients by BMI and show distribution"
      },
      {
        label: "Correlation Analysis",
        query: "Find correlations between numeric health variables"
      },
      {
        label: "Blood Pressure Analysis",
        query: "Analyze blood pressure patterns by age group"
      },
      {
        label: "Risk Factors",
        query: "Identify patients with multiple risk factors"
      },
      {
        label: "Missing Data",
        query: "Show missing data patterns in the dataset"
      }
    ]
  }
}

// Export singleton instance
export const ollamaClient = new OllamaClient()