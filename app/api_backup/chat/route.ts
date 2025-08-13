import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, fileData, fileName, model: selectedModel = 'gemini-1.5-flash', apiKey } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Use client-provided API key or fallback to environment variable
    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY
    
    if (!effectiveApiKey) {
      return NextResponse.json(
        { 
          response: "I'm not configured yet! Please add your GEMINI_API_KEY using the configuration dialog (gear icon) or set the GEMINI_API_KEY environment variable. You can get an API key from Google AI Studio (https://makersuite.google.com/app/apikey)." 
        },
        { status: 200 }
      )
    }

    const genAI = new GoogleGenerativeAI(effectiveApiKey)
    const model = genAI.getGenerativeModel({ model: selectedModel })

    // Prepare context about the data
    let dataContext = ''
    if (fileData && Array.isArray(fileData) && fileData.length > 0) {
      const sampleData = fileData.slice(0, 5) // Use first 5 rows as sample
      const columns = Object.keys(fileData[0])
      const totalRows = fileData.length
      
      dataContext = `
Data Context:
- File: ${fileName}
- Total Rows: ${totalRows}
- Columns: ${columns.join(', ')}
- Sample Data (first 5 rows):
${JSON.stringify(sampleData, null, 2)}

Statistical Summary:
${generateStatisticalSummary(fileData, columns)}
`
    }

    const prompt = `You are a data analyst assistant. I have uploaded a dataset and need help analyzing it.

${dataContext}

User Question: ${message}

Please provide a helpful, insightful analysis of the data based on the user's question. If the question asks for specific insights, calculations, or trends, analyze the provided data sample and give relevant findings. Be concise but thorough in your response. If you need to make assumptions about the full dataset based on the sample, mention that clearly.

Focus on:
1. Direct answers to the user's question
2. Relevant insights from the data
3. Statistical observations where appropriate
4. Actionable recommendations if applicable

Keep responses conversational and easy to understand.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ response: text })
    
  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof Error && error.message.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { 
          response: "The GEMINI_API_KEY appears to be invalid. Please check your API key and make sure it's correctly set in your environment variables." 
        },
        { status: 200 }
      )
    }
    
    return NextResponse.json(
      { response: 'I apologize, but I encountered an error while processing your request. Please try again.' },
      { status: 200 }
    )
  }
}

function generateStatisticalSummary(data: any[], columns: string[]): string {
  const summary: string[] = []
  
  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '')
    
    if (values.length === 0) return
    
    // Check if numeric
    const numericValues = values.map(val => parseFloat(val)).filter(val => !isNaN(val))
    
    if (numericValues.length > values.length * 0.7) { // If most values are numeric
      const min = Math.min(...numericValues)
      const max = Math.max(...numericValues)
      const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
      summary.push(`${column}: Min=${min.toFixed(2)}, Max=${max.toFixed(2)}, Avg=${avg.toFixed(2)}`)
    } else {
      // Categorical data
      const uniqueSet = new Set(values)
      const unique = Array.from(uniqueSet)
      summary.push(`${column}: ${unique.length} unique values (${unique.slice(0, 3).join(', ')}${unique.length > 3 ? ', ...' : ''})`)
    }
  })
  
  return summary.join('\n')
}