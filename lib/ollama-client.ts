/**
 * Ollama client for local LLM integration
 * Interfaces with Tauri commands for Ollama management
 * Includes fallback for browser/development mode
 */

// Tauri environment detection
let invoke: any = null
let isTauriEnvironment = false

if (typeof window !== 'undefined') {
  try {
    // Try to import Tauri API
    const tauriApi = require('@tauri-apps/api/core')
    invoke = tauriApi.invoke
    isTauriEnvironment = true
    console.log('🖥️ Tauri environment detected - Local AI available')
  } catch (error) {
    console.log('🌐 Browser environment detected - Cloud AI only')
    isTauriEnvironment = false
  }
}

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
   * Check if running in Tauri environment
   */
  isTauriAvailable(): boolean {
    return isTauriEnvironment && invoke !== null
  }

  /**
   * Get system hardware information
   */
  async getHardwareInfo(): Promise<HardwareInfo> {
    if (!this.isTauriAvailable()) {
      // Return mock hardware info for browser mode
      return {
        total_memory_gb: 8.0,
        available_memory_gb: 6.0,
        cpu_count: 4,
        recommended_model: 'gemini-1.5-flash',
        can_run_7b: false,
        can_run_mini: false,
        os: 'Browser'
      }
    }

    try {
      return await invoke('get_hardware_info')
    } catch (error) {
      throw new Error(`Failed to get hardware info: ${error}`)
    }
  }

  /**
   * Check if Ollama service is running
   */
  async checkStatus(): Promise<boolean> {
    if (!this.isTauriAvailable()) {
      console.log('Ollama status check: Browser mode - local AI not available')
      return false
    }

    try {
      return await invoke('check_ollama_status')
    } catch (error) {
      console.error('Failed to check Ollama status:', error)
      return false
    }
  }

  /**
   * Setup bundled Ollama
   */
  async setupBundledOllama(): Promise<string> {
    if (!this.isTauriAvailable()) {
      return 'Browser mode: Ollama not available - using cloud AI fallback'
    }

    try {
      return await invoke('setup_bundled_ollama')
    } catch (error) {
      throw new Error(`Failed to setup bundled Ollama: ${error}`)
    }
  }

  /**
   * Start Ollama service
   */
  async startOllama(): Promise<string> {
    if (!this.isTauriAvailable()) {
      throw new Error('Cannot start Ollama in browser mode. Please use the desktop application for local AI features.')
    }

    try {
      return await invoke('start_ollama')
    } catch (error) {
      throw new Error(`Failed to start Ollama: ${error}`)
    }
  }

  /**
   * Download a model with enhanced debugging
   */
  async downloadModel(modelName: string): Promise<string> {
    console.log(`🔄 [OllamaClient] Starting download for model: ${modelName}`)
    
    if (!this.isTauriAvailable()) {
      const error = 'Model download not available in browser mode. Please use the desktop application.'
      console.error(`❌ [OllamaClient] ${error}`)
      throw new Error(error)
    }

    try {
      console.log(`🚀 [OllamaClient] Invoking Tauri command 'download_model' with modelName: ${modelName}`)
      
      const result = await invoke('download_model', { modelName })
      
      console.log(`✅ [OllamaClient] Download successful:`, result)
      return result as string
      
    } catch (error) {
      console.error(`❌ [OllamaClient] Download failed for ${modelName}:`, error)
      throw new Error(`Failed to download model ${modelName}: ${error}`)
    }
  }

  /**
   * Check Ollama status with debugging
   */
  async checkStatus(): Promise<boolean> {
    console.log(`🔍 [OllamaClient] Checking Ollama status...`)
    
    if (!this.isTauriAvailable()) {
      console.log(`🌐 [OllamaClient] Browser mode - local AI not available`)
      return false
    }

    try {
      const status = await invoke('check_ollama_status')
      console.log(`📊 [OllamaClient] Ollama status:`, status)
      return status as boolean
    } catch (error) {
      console.error(`❌ [OllamaClient] Failed to check Ollama status:`, error)
      return false
    }
  }

  /**
   * List installed models with debugging
   */
  async listInstalledModels(): Promise<string[]> {
    console.log(`📋 [OllamaClient] Fetching installed models...`)
    
    if (!this.isTauriAvailable()) {
      console.log(`🌐 [OllamaClient] Browser mode - no local models available`)
      return []
    }

    try {
      const models = await invoke('list_installed_models')
      console.log(`📦 [OllamaClient] Installed models:`, models)
      return models as string[]
    } catch (error) {
      console.error(`❌ [OllamaClient] Failed to list models:`, error)
      return []
    }
  }

  /**
   * Query a local LLM with debugging
   */
  async query(model: string, prompt: string): Promise<string> {
    console.log(`🤖 [OllamaClient] Querying model: ${model} with prompt length: ${prompt.length}`)
    
    if (!this.isTauriAvailable()) {
      const error = 'Local model queries not available in browser mode. Please use cloud models or the desktop application.'
      console.error(`❌ [OllamaClient] ${error}`)
      throw new Error(error)
    }

    try {
      const result = await invoke('query_ollama', { model, prompt })
      console.log(`✅ [OllamaClient] Query successful, response length:`, (result as string).length)
      return result as string
    } catch (error) {
      console.error(`❌ [OllamaClient] Query failed for model ${model}:`, error)
      throw new Error(`Failed to query model ${model}: ${error}`)
    }
  }
  async getModelRecommendations(): Promise<ModelInfo[]> {
    if (!this.isTauriAvailable()) {
      // Return basic cloud model recommendations for browser mode
      return [
        {
          name: 'gemini-1.5-flash',
          size_gb: 0, // Cloud model
          description: 'Fast cloud AI model for quick analysis',
          recommended_ram_gb: 0,
          is_medical: false
        },
        {
          name: 'gemini-1.5-pro',
          size_gb: 0, // Cloud model
          description: 'Advanced cloud AI model for complex analysis',
          recommended_ram_gb: 0,
          is_medical: false
        }
      ]
    }

    try {
      return await invoke('get_model_recommendations')
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

IMPORTANT: The DataFrame 'df' is already loaded from DuckDB - DO NOT use pd.read_csv() or any file reading commands!

Dataset Context:
${dataContext}

User Question: ${userQuery}

Please provide:
1. Clean, executable pandas code
2. Brief explanation of the analysis
3. Any important medical insights

CRITICAL REQUIREMENTS:
- The variable 'df' is already available - DO NOT read files with pd.read_csv()
- Use 'pd' for pandas operations (pd.DataFrame, etc.) - 'pandas' and 'pd' are both imported
- Start directly with data analysis using 'df'
- Include error handling
- Provide clear variable names
- Add comments explaining medical significance
- For plots: ensure data length matches - use df.groupby() for summary data
- Avoid length mismatches in plotting by using aggregated data

EXAMPLE CORRECT CODE:
# df is already loaded - just use it!
print("Dataset shape:", df.shape)

# Always check for numeric columns first
numeric_cols = df.select_dtypes(include=['number']).columns
if len(numeric_cols) > 0:
    print("Numeric columns:", list(numeric_cols))
    print(df[numeric_cols].describe())
else:
    print("No numeric columns found")

# For T-tests, ensure columns are numeric
if 'age' in df.columns:
    df['age'] = pd.to_numeric(df['age'], errors='coerce')
    print(f"Age column type: {df['age'].dtype}")

# For plotting, use grouped/aggregated data to avoid length mismatches
import matplotlib.pyplot as plt
if 'treatment_group' in df.columns and 'age' in df.columns:
    # Correct: aggregate data first
    age_by_treatment = df.groupby('treatment_group')['age'].mean()
    plt.bar(age_by_treatment.index, age_by_treatment.values)
    plt.title('Mean Age by Treatment Group')
    plt.show()

# Show data types
print("\nData types:")
print(df.dtypes)

EXAMPLE WRONG CODE:
# ❌ NEVER DO THIS - df is already provided
df = pd.read_csv('file.csv')  # This will fail!

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