import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

export async function POST(request: NextRequest) {
  try {
    const { code, fileName, fileData } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    // Create a temporary directory for execution
    const tempDir = path.join(os.tmpdir(), `python_exec_${Date.now()}`)
    fs.mkdirSync(tempDir, { recursive: true })

    // Create the Python script file
    const scriptPath = path.join(tempDir, 'script.py')
    
    // Prepare the data file if provided
    let dataSetupCode = ''
    if (fileData && Array.isArray(fileData) && fileData.length > 0) {
      const dataPath = path.join(tempDir, 'data.json')
      fs.writeFileSync(dataPath, JSON.stringify(fileData, null, 2))
      
      dataSetupCode = `
import json
import pandas as pd
import numpy as np

# Load the uploaded data
with open('data.json', 'r') as f:
    data_json = json.load(f)

# Convert to pandas DataFrame for easier analysis
df = pd.DataFrame(data_json)
print(f"Data loaded: {df.shape[0]} rows, {df.shape[1]} columns")
print(f"Columns: {list(df.columns)}")
print("\\n" + "="*50 + "\\n")

`
    }

    // Combine setup code with user code
    const fullCode = dataSetupCode + code

    fs.writeFileSync(scriptPath, fullCode)

    // Execute Python code
    const result = await new Promise<{ output: string; error: string }>((resolve) => {
      let output = ''
      let error = ''

      // Try python3 first, then python
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3'
      
      const pythonProcess = spawn(pythonCommand, [scriptPath], {
        cwd: tempDir,
        timeout: 30000, // 30 second timeout
      })

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString()
      })

      pythonProcess.on('close', (code) => {
        resolve({ 
          output: output.trim(), 
          error: error.trim() || (code !== 0 ? `Process exited with code ${code}` : '')
        })
      })

      pythonProcess.on('error', (err) => {
        resolve({ 
          output: '', 
          error: `Failed to start Python process: ${err.message}. Please ensure Python is installed and available in PATH.`
        })
      })

      // Handle timeout
      setTimeout(() => {
        pythonProcess.kill()
        resolve({ 
          output: output.trim(), 
          error: 'Execution timeout (30 seconds exceeded)'
        })
      }, 30000)
    })

    // Clean up temporary files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch (cleanupError) {
      console.error('Failed to clean up temporary files:', cleanupError)
    }

    return NextResponse.json({
      output: result.output || 'No output generated',
      error: result.error || null,
      success: !result.error
    })

  } catch (error) {
    console.error('Python execution error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to execute Python code',
        output: '',
        success: false
      },
      { status: 500 }
    )
  }
}