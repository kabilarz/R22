'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Bot, User, FileText, BarChart3, Lightbulb, Code } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { ModelSelector } from '@/components/model-selector'
import { apiClient } from '@/lib/api'
import { ollamaClient } from '@/lib/ollama-client'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  data: any[]
  uploadedAt: Date
  dataset_id?: string  // Add backend dataset ID
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  fileContext?: string
}

interface ChatPanelProps {
  selectedFile: UploadedFile | null
  currentChatId: string
  isBackendReady: boolean
}

export function ChatPanel({ selectedFile, currentChatId, isBackendReady }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [isModelReady, setIsModelReady] = useState(false)
  const [pythonOutput, setPythonOutput] = useState<string | null>(null)
  const [isExecutingCode, setIsExecutingCode] = useState(false)
  const [showTTestDialog, setShowTTestDialog] = useState(false)
  const [tTestParams, setTTestParams] = useState({
    groupCol: '',
    valueCol: '',
    whereSql: ''
  })
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Load saved API key and model from localStorage
    const savedApiKey = localStorage.getItem('gemini-api-key') || ''
    const savedModel = localStorage.getItem('gemini-model') || 'gemini-1.5-flash'
    setApiKey(savedApiKey)
    setSelectedModel(savedModel)
  }, [])

  useEffect(() => {
    if (selectedFile) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I can help you analyze the data from "${selectedFile.name}". This file contains ${selectedFile.data.length} rows of data. You can ask me questions like:

• "What are the main trends in this data?"
• "Can you summarize the key statistics?"
• "Show me a breakdown by category"
• "What insights can you find?"

**Statistical Analysis Tools:**
• Click the "Run t-test" button below to perform statistical comparisons
• Use the Python sandbox for custom analysis

What would you like to know about your data?`,
        timestamp: new Date(),
        fileContext: selectedFile.name
      }
      setMessages([welcomeMessage])
    }
  }, [selectedFile])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    if (!selectedFile) {
      toast.error('Please select a file to analyze first')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      fileContext: selectedFile.name
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          fileData: selectedFile.data,
          fileName: selectedFile.name,
          model: selectedModel,
          apiKey: apiKey
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        fileContext: selectedFile.name
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    localStorage.setItem('gemini-model', value)
    toast.success(`Model changed to ${value}`)
  }

  const handleApiKeySubmit = () => {
    setApiKey(tempApiKey)
    localStorage.setItem('gemini-api-key', tempApiKey)
    setIsConfigOpen(false)
    setTempApiKey('')
    toast.success('API key updated successfully!')
  }

  const handleConfigOpen = () => {
    setTempApiKey(apiKey)
    setIsConfigOpen(true)
  }

  const handleRunPythonCode = async (code: string, language: string) => {
    if (language !== 'python' && language !== 'py') {
      toast.error('Only Python code execution is supported')
      return
    }

    setIsExecutingCode(true)
    setPythonOutput(null)

    try {
      const response = await fetch('/api/execute-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          fileName: selectedFile?.name || 'user_data',
          fileData: selectedFile?.data || []
        })
      })

      if (!response.ok) {
        throw new Error('Failed to execute Python code')
      }

      const result = await response.json()
      
      const outputMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `**Code Execution Result:**\n\n\`\`\`\n${result.output}\n\`\`\`\n\n${result.error ? `**Error:**\n\`\`\`\n${result.error}\n\`\`\`` : ''}`,
        timestamp: new Date(),
        fileContext: selectedFile?.name
      }

      setMessages(prev => [...prev, outputMessage])
      toast.success('Code executed successfully!')
    } catch (error) {
      toast.error('Failed to execute Python code')
      console.error('Python execution error:', error)
    } finally {
      setIsExecutingCode(false)
    }
  }

  const handleRunTTest = async () => {
    if (!selectedFile || !selectedFile.dataset_id || !currentChatId || !isBackendReady) {
      toast.error('Backend is not ready or file not properly uploaded')
      return
    }

    if (!tTestParams.groupCol || !tTestParams.valueCol) {
      toast.error('Please select both group and value columns')
      return
    }

    try {
      setIsLoading(true)
      
      const result = await apiClient.runTTest(
        currentChatId,
        selectedFile.dataset_id,
        tTestParams.groupCol,
        tTestParams.valueCol,
        tTestParams.whereSql || undefined
      )

      // Format the results as a message
      let resultContent = `## T-Test Results\n\n`
      
      if (result.error) {
        resultContent += `**Error:** ${result.error}\n\n`
      }
      
      resultContent += `**Analysis Details:**\n`
      resultContent += `- Group Column: ${tTestParams.groupCol}\n`
      resultContent += `- Value Column: ${tTestParams.valueCol}\n\n`
      
      resultContent += `**Sample Sizes:**\n`
      resultContent += `- Group 1 (Male): ${result.n_male}\n`
      resultContent += `- Group 2 (Female): ${result.n_female}\n\n`
      
      if (result.mean_male !== null && result.mean_female !== null) {
        resultContent += `**Group Means:**\n`
        resultContent += `- Male Mean: ${result.mean_male.toFixed(4)}\n`
        resultContent += `- Female Mean: ${result.mean_female.toFixed(4)}\n\n`
      }
      
      if (result.levene_p !== null && result.t_stat !== null && result.p_value !== null) {
        resultContent += `**Statistical Test Results:**\n`
        resultContent += `- Levene's Test p-value: ${result.levene_p.toFixed(6)}\n`
        resultContent += `- Equal variances assumed: ${result.equal_var_assumed ? 'Yes' : 'No'}\n`
        resultContent += `- t-statistic: ${result.t_stat.toFixed(4)}\n`
        resultContent += `- p-value: ${result.p_value.toFixed(6)}\n\n`
        
        resultContent += `**Interpretation:**\n`
        if (result.p_value < 0.05) {
          resultContent += `- The difference between groups is **statistically significant** (p < 0.05)\n`
        } else {
          resultContent += `- The difference between groups is **not statistically significant** (p ≥ 0.05)\n`
        }
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: resultContent,
        timestamp: new Date(),
        fileContext: selectedFile.name
      }

      setMessages(prev => [...prev, assistantMessage])
      setShowTTestDialog(false)
      toast.success('T-test completed successfully')
      
    } catch (error) {
      toast.error(`Failed to run t-test: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getAvailableColumns = () => {
    if (!selectedFile || selectedFile.data.length === 0) return []
    return Object.keys(selectedFile.data[0])
  }

  const getDataPreview = () => {
    if (!selectedFile || selectedFile.data.length === 0) return null

    const sampleData = selectedFile.data.slice(0, 3)
    const columns = Object.keys(sampleData[0] || {})

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Data Preview: {selectedFile.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs text-muted-foreground mb-2">
            {selectedFile.data.length} rows × {columns.length} columns
          </div>
          <div className="border rounded-md p-2 bg-muted/50">
            <div className="grid gap-1 text-xs">
              <div className="font-mono">
                <strong>Columns:</strong> {columns.join(', ')}
              </div>
              <div className="font-mono">
                <strong>Sample:</strong> {JSON.stringify(sampleData[0], null, 2).substring(0, 100)}...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleConfigOpen}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <Key className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Configure Gemini AI</DialogTitle>
                    <DialogDescription>
                      Add your Google Gemini API key to enable AI-powered data analysis. 
                      You can get an API key from{' '}
                      <a 
                        href="https://makersuite.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="api-key" className="text-right">
                        API Key
                      </Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="Enter your Gemini API key"
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-sm text-muted-foreground">
                        Status
                      </Label>
                      <div className="col-span-3">
                        <Badge variant={apiKey ? "default" : "secondary"}>
                          {apiKey ? "Configured" : "Not configured"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleApiKeySubmit}
                      disabled={!tempApiKey.trim()}
                    >
                      Save Configuration
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-2">
          {!selectedFile && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">Ready to Analyze Your Data</h3>
                <p className="text-muted-foreground">
                  Select a file from the left panel to start asking questions about your data
                </p>
              </div>
            </div>
          )}

          {selectedFile && (
            <>
              {getDataPreview()}
              
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        {message.type === 'assistant' ? (
                          <MarkdownRenderer 
                            content={message.content} 
                            onRunCode={handleRunPythonCode}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        )}
                        <div className={`text-xs mt-2 opacity-70 ${
                          message.type === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className={`${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' ? 'bg-primary' : 'bg-muted'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isLoading && (
                <div className="flex gap-3 justify-start mt-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </ScrollArea>

        {selectedFile && (
          <div className="p-2 border-t">
            <div className="flex gap-2 mb-2">
              <Dialog open={showTTestDialog} onOpenChange={setShowTTestDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={!isBackendReady || !selectedFile?.dataset_id}
                    className="text-xs"
                  >
                    Run t-test
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Configure t-test Analysis</DialogTitle>
                    <DialogDescription>
                      Select columns to compare groups in your dataset.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="group-col" className="text-right">
                        Group Column
                      </Label>
                      <Select 
                        value={tTestParams.groupCol} 
                        onValueChange={(value) => setTTestParams(prev => ({ ...prev, groupCol: value }))}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select grouping column (e.g., gender)" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableColumns().map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="value-col" className="text-right">
                        Value Column
                      </Label>
                      <Select 
                        value={tTestParams.valueCol} 
                        onValueChange={(value) => setTTestParams(prev => ({ ...prev, valueCol: value }))}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select value column (e.g., BMI)" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableColumns().map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="where-sql" className="text-right">
                        Filter (SQL)
                      </Label>
                      <Input
                        id="where-sql"
                        placeholder="Optional WHERE clause"
                        value={tTestParams.whereSql}
                        onChange={(e) => setTTestParams(prev => ({ ...prev, whereSql: e.target.value }))}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleRunTTest}
                      disabled={!tTestParams.groupCol || !tTestParams.valueCol || isLoading}
                    >
                      {isLoading ? 'Running...' : 'Run t-test'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                placeholder="Ask me anything about your data..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div></div>
        )}
      </div>
    </div>
  )
}