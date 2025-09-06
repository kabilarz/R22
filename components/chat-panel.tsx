'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Bot, User, FileText, Code } from 'lucide-react'
import { toast } from 'sonner'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { ModelSelector } from '@/components/model-selector'
import { apiClient } from '@/lib/api'
import { aiService, AnalysisResponse } from '@/lib/ai-service'
import { TestSuggestion } from '@/lib/test-suggestion-engine'

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
  type: 'user' | 'assistant' | 'suggestions'
  content: string
  timestamp: Date
  fileContext?: string
  suggestions?: TestSuggestion[]
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
  const [pendingSuggestions, setPendingSuggestions] = useState<TestSuggestion[] | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Enhanced auto-scroll function with forced scroll
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      // Force scroll to bottom immediately
      scrollArea.scrollTop = scrollArea.scrollHeight
      // Also try scrollIntoView as backup
      const lastMessage = scrollArea.lastElementChild
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }
  }, [])

  // Auto-scroll when messages change with better timing
  useEffect(() => {
    // Use both requestAnimationFrame and setTimeout for better reliability
    requestAnimationFrame(() => {
      setTimeout(scrollToBottom, 50)
    })
  }, [messages, scrollToBottom])

  // Also scroll when Python output changes
  useEffect(() => {
    if (pythonOutput) {
      setTimeout(scrollToBottom, 100)
    }
  }, [pythonOutput, scrollToBottom])

  // Also scroll when loading state changes (for immediate feedback)
  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure content is rendered
      setTimeout(scrollToBottom, 100)
    }
  }, [isLoading, scrollToBottom])

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
• Use natural language to generate analysis code
• Click the "Run" button on any Python code blocks

**Example Queries:**
• "Calculate average age by gender"
• "Show correlation between BMI and blood pressure"
• "Find patients with high risk factors"
• "Perform a t-test comparing groups"
• "Generate descriptive statistics"

What would you like to know about your data?`,
        timestamp: new Date(),
        fileContext: selectedFile.name
      }
      setMessages([welcomeMessage])
      // Scroll to show welcome message
      setTimeout(scrollToBottom, 200)
    }
  }, [selectedFile])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    if (!selectedFile) {
      toast.error('Please select a file to analyze first')
      return
    }

    if (!isModelReady) {
      toast.error('AI model is not ready. Please setup and select a model first.')
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
    
    // Force immediate scroll to show user message
    requestAnimationFrame(() => {
      scrollToBottom()
    })
    
    setIsLoading(true)

    try {
      // Create data context for the AI
      const columns = selectedFile.data.length > 0 ? Object.keys(selectedFile.data[0]) : []
      const sampleData = selectedFile.data.slice(0, 3)
      const dataContext = `
Dataset: ${selectedFile.name}
Rows: ${selectedFile.data.length}
Columns: ${columns.join(', ')}
Sample data: ${JSON.stringify(sampleData, null, 2)}`

      // Use the enhanced AI service that can suggest tests
      const response = await aiService.generateAnalysisResponse(selectedModel, inputMessage, dataContext, selectedFile)
      
      if (response.type === 'suggestions') {
        // Show test suggestions
        const suggestionsMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'suggestions',
          content: response.explanation || 'Here are some statistical tests that might help:',
          timestamp: new Date(),
          fileContext: selectedFile.name,
          suggestions: response.suggestions
        }
        
        setMessages(prev => [...prev, suggestionsMessage])
        setPendingSuggestions(response.suggestions || null)
        // Ensure scroll to new suggestions
        setTimeout(scrollToBottom, 100)
      } else {
        // Show generated code
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.code || '',
          timestamp: new Date(),
          fileContext: selectedFile.name
        }
        
        setMessages(prev => [...prev, assistantMessage])
        // Ensure scroll to new assistant message
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
      console.error('Chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I apologize, but I encountered an error: ${error}. Please check your model setup and try again. You can switch to the cloud model (Google Gemini) as a fallback.`,
        timestamp: new Date(),
        fileContext: selectedFile.name
      }
      
      setMessages(prev => [...prev, errorMessage])
      // Ensure scroll to error message
      setTimeout(scrollToBottom, 100)
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

  const handleTestSelection = async (selectedTest: TestSuggestion) => {
    if (!selectedFile || !isModelReady) return
    
    setIsLoading(true)
    setPendingSuggestions(null)
    
    try {
      // Create data context for the AI
      const columns = selectedFile.data.length > 0 ? Object.keys(selectedFile.data[0]) : []
      const sampleData = selectedFile.data.slice(0, 3)
      const dataContext = `
Dataset: ${selectedFile.name}
Rows: ${selectedFile.data.length}
Columns: ${columns.join(', ')}
Sample data: ${JSON.stringify(sampleData, null, 2)}`

      // Generate specific code for the selected test
      const code = await aiService.generateTestCode(selectedTest, selectedModel, inputMessage, dataContext)
      
      const codeMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `## ${selectedTest.test.name}\n\n**Why this test:** ${selectedTest.reasoning}\n\n\`\`\`python\n${code}\n\`\`\``,
        timestamp: new Date(),
        fileContext: selectedFile.name
      }
      
      setMessages(prev => [...prev, codeMessage])
      // Ensure scroll to new code message
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      toast.error('Failed to generate test code. Please try again.')
      console.error('Test code generation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunPythonCode = async (code: string, language: string) => {
    if (language !== 'python' && language !== 'py') {
      toast.error('Only Python code execution is supported')
      return
    }

    if (!selectedFile || !isBackendReady) {
      toast.error('Please ensure a file is selected and backend is ready')
      return
    }

    setIsExecutingCode(true)
    setPythonOutput(null)

    try {
      const result = await apiClient.executePythonCode(
        code,
        selectedFile.name,
        selectedFile.data
      )

      if (result.success) {
        setPythonOutput(result.output || 'Code executed successfully (no output)')
        toast.success('Python code executed successfully')
      } else {
        setPythonOutput(`Error: ${result.error || 'Unknown error occurred'}`)
        toast.error('Python code execution failed')
      }
    } catch (error) {
      setPythonOutput(`Error: ${error}`)
      toast.error('Failed to execute Python code')
    } finally {
      setIsExecutingCode(false)
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
    <div className="h-full flex flex-col overflow-hidden w-full max-w-full">
      <div className="p-2 border-b flex-shrink-0 overflow-hidden w-full max-w-full">
        <div className="flex items-center justify-between min-w-0 w-full max-w-full">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden flex-1">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              onModelReady={setIsModelReady}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-h-0 w-full max-w-full">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-2 w-full max-w-full overflow-hidden">
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
              
              <div className="space-y-4 w-full max-w-full overflow-hidden">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 w-full max-w-full overflow-hidden ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`w-full max-w-[80%] min-w-0 overflow-hidden ${message.type === 'user' ? 'order-2' : ''}`}>
                      <div
                        className={`rounded-lg p-3 w-full max-w-full overflow-hidden ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : message.type === 'suggestions'
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-muted'
                        }`}
                      >
                        {message.type === 'suggestions' ? (
                          <div className="space-y-3 w-full max-w-full overflow-hidden">
                            <div className="text-sm font-medium text-blue-800 break-words">
                              {message.content}
                            </div>
                            
                            {message.suggestions && (
                              <div className="space-y-2 w-full max-w-full overflow-hidden">
                                {message.suggestions.map((suggestion, index) => (
                                  <div key={index} className="border border-blue-300 rounded-lg p-3 bg-white w-full max-w-full overflow-hidden">
                                    <div className="flex items-start justify-between w-full max-w-full overflow-hidden">
                                      <div className="flex-1 min-w-0 overflow-hidden">
                                        <div className="font-medium text-sm text-gray-900 break-words">
                                          {suggestion.test.name}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1 break-words">
                                          {suggestion.test.description}
                                        </div>
                                        <div className="text-xs text-blue-600 mt-2 break-words">
                                          {suggestion.reasoning}
                                        </div>
                                        <div className="flex gap-1 mt-2 flex-wrap">
                                          <Badge variant="outline" className="text-xs">
                                            {suggestion.test.category}
                                          </Badge>
                                          <Badge variant="secondary" className="text-xs">
                                            {Math.round(suggestion.test.confidenceScore * 100)}% match
                                          </Badge>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => handleTestSelection(suggestion)}
                                        disabled={isLoading}
                                        className="ml-3 flex-shrink-0"
                                      >
                                        Select
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : message.type === 'assistant' ? (
                          <div className="w-full max-w-full overflow-hidden">
                            <MarkdownRenderer 
                              content={message.content} 
                              onRunCode={handleRunPythonCode}
                            />
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm break-words overflow-wrap-anywhere max-w-full overflow-hidden">{message.content}</div>
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

              {/* Python Output Display */}
              {pythonOutput && (
                <Card className="mt-4 border-green-200 bg-green-50 w-full max-w-full overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                      <Code className="h-4 w-4" />
                      Python Execution Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-white border border-green-200 rounded-md p-3 w-full max-w-full overflow-hidden">
                      <pre className="text-xs font-mono whitespace-pre-wrap text-green-900 break-all word-break-all max-w-full overflow-hidden">
                        {pythonOutput}
                      </pre>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPythonOutput(null)}
                        className="text-xs"
                      >
                        Clear Output
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </ScrollArea>

        {selectedFile && (
          <div className="p-2 border-t flex-shrink-0">
            <div className="flex gap-2 min-w-0">
              <Textarea
                ref={textareaRef}
                placeholder="Ask me anything about your data..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] resize-none flex-1 min-w-0"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="self-end flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}