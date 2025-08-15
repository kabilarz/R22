/**
 * API client for the statistical analysis backend
 */

// Determine API base URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://install-guide-5.preview.emergentagent.com') + '/api'
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001')

export interface DatasetInfo {
  dataset_id: string
  name: string
  n_rows: number
  created_at: string
}

export interface VariableInfo {
  name: string
  type?: string
  label?: string
  measure?: string
  role?: string
  // UI might send either a string or an array; backend expects a SINGLE string.
  missing?: string | string[]
}

export interface TTestResult {
  run_id: string
  n_male: number
  n_female: number
  mean_male: number | null
  mean_female: number | null
  levene_p: number | null
  equal_var_assumed: boolean | null
  t_stat: number | null
  p_value: number | null
  error?: string | null
}

export interface AnalysisRun {
  run_id: string
  analysis: string
  params: Record<string, any>
  result: Record<string, any>
  created_at: string
}

type BackendVarType = 'numeric' | 'string' | 'date'

function normalizeType(t?: string): BackendVarType | undefined {
  if (!t) return undefined
  const v = t.toLowerCase()
  if (v === 'number' || v === 'float' || v === 'int' || v === 'integer' || v === 'numeric') return 'numeric'
  if (v === 'categorical' || v === 'bool' || v === 'boolean' || v === 'factor' || v === 'string') return 'string'
  if (v === 'date' || v === 'datetime') return 'date'
  // if unknown, leave undefined and let backend default/validate
  return undefined
}

function coerceMissing(m?: string | string[] | null): string | null {
  if (Array.isArray(m)) {
    // Your UI sends ["", "NULL", "null", "N/A", "NA"]; backend wants ONE string.
    // Safest default is empty string ""; change if your backend prefers something else.
    return ""
  }
  if (typeof m === 'string') return m
  return null
}

function sanitizeJSON<T>(obj: T): T {
  // Remove/convert values JSON can't represent (NaN/Infinity/undefined)
  return JSON.parse(JSON.stringify(obj, (_k, v) => {
    if (typeof v === 'number' && !Number.isFinite(v)) return null
    if (v === undefined) return null
    return v
  }))
}

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return JSON.stringify(data)
  } catch {
    try { return await res.text() } catch { return '' }
  }
}

export class APIClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async initializeDatabase(): Promise<{ ok: boolean }> {
    const response = await fetch(`${this.baseUrl}/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error(`Failed to initialize database: ${response.statusText}`)
    return await response.json()
  }

  async createChat(title: string): Promise<{ chat_id: string }> {
    const response = await fetch(`${this.baseUrl}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })
    if (!response.ok) throw new Error(`Failed to create chat: ${response.statusText}`)
    return await response.json()
  }

  async uploadDataset(file: File): Promise<DatasetInfo> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${this.baseUrl}/datasets/upload`, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) throw new Error(`Failed to upload dataset: ${response.statusText}`)
    return await response.json()
  }

  /**
   * Variables updater:
   * - drops empty-name entries
   * - normalizes "type" to backend enum ('numeric' | 'string' | 'date')
   * - coerces missing from string[] -> string (backend expects a single string)
   * - sanitizes JSON payload (no NaN/Infinity/undefined)
   * - sends wrapped body: { variables: [...] }
   */
  async updateVariables(datasetId: string, variables: VariableInfo[]): Promise<{ ok: boolean }> {
    const cleaned = variables
      // 1) skip any rows with empty/blank names
      .filter(v => v?.name && v.name.trim().length > 0)
      // 2) normalize fields
      .map(v => {
        const out = {
          name: v.name,
          type: normalizeType(v.type),
          label: v.label ?? null,
          measure: v.measure ?? null,
          role: v.role ?? null,
          missing: coerceMissing(v.missing), // <- critical fix
        }
        // 3) sanitize to strip undefined / non-finite numbers
        return sanitizeJSON(out)
      })

    const res = await fetch(`${this.baseUrl}/variables/${datasetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variables: cleaned }), // backend expects wrapped body
    })

    if (!res.ok) {
      const detail = await parseErrorDetail(res)
      console.error('Update variables failed:', detail)
      throw new Error(`Failed to update variables: ${res.status} ${res.statusText} ${detail}`)
    }

    // some backends return {ok:true}, some return updated vars; normalize to { ok: true }
    try { await res.json() } catch { /* ignore if empty */ }
    return { ok: true }
  }

  async getVariables(datasetId: string): Promise<{ variables: VariableInfo[] }> {
    const response = await fetch(`${this.baseUrl}/variables/${datasetId}`)
    if (!response.ok) throw new Error(`Failed to get variables: ${response.statusText}`)
    return await response.json()
  }

  async runTTest(
    chatId: string,
    datasetId: string,
    groupCol: string,
    valueCol: string,
    whereSql?: string
  ): Promise<TTestResult> {
    const response = await fetch(`${this.baseUrl}/analysis/ttest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        dataset_id: datasetId,
        group_col: groupCol,
        value_col: valueCol,
        where_sql: whereSql
      })
    })
    if (!response.ok) throw new Error(`Failed to run t-test: ${response.statusText}`)
    return await response.json()
  }

  async getChatHistory(chatId: string): Promise<{ history: AnalysisRun[] }> {
    const response = await fetch(`${this.baseUrl}/history/${chatId}`)
    if (!response.ok) throw new Error(`Failed to get chat history: ${response.statusText}`)
    return await response.json()
  }

  async getDatasets(): Promise<{ datasets: DatasetInfo[] }> {
    const response = await fetch(`${this.baseUrl}/datasets`)
    if (!response.ok) throw new Error(`Failed to get datasets: ${response.statusText}`)
    return await response.json()
  }

  async getDatasetDetails(datasetId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/datasets/${datasetId}`)
    if (!response.ok) throw new Error(`Failed to get dataset details: ${response.statusText}`)
    return await response.json()
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/health`)
    if (!response.ok) throw new Error(`Health check failed: ${response.statusText}`)
    return await response.json()
  }

  async executePythonCode(code: string, fileName: string, fileData: any[]): Promise<{
    output: string;
    error?: string;
    success: boolean;
  }> {
    const response = await fetch(`${this.baseUrl}/execute-python`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        fileName,
        fileData
      })
    })
    if (!response.ok) throw new Error(`Failed to execute Python code: ${response.statusText}`)
    return await response.json()
  }
}

// Export a default instance
export const apiClient = new APIClient()
