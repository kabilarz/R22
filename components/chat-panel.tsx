'use client'

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Bot, User, FileText, Code, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { ModelSelector } from '@/components/model-selector'
import { ThreadComponent, ThreadControls } from '@/components/thread-component'
import { StatisticalSidebar } from '@/components/statistical-sidebar'
import { apiClient } from '@/lib/api'
import { aiService, AnalysisResponse } from '@/lib/ai-service'
import { TestSuggestion } from '@/lib/test-suggestion-engine'
import { threadManager, Thread } from '@/lib/thread-manager'
import { chatMemoryManager } from '@/lib/memory-manager'
import { longTermMemoryManager } from '@/lib/long-term-memory'

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
  threads?: Thread[]
  canHaveThreads?: boolean
}

interface ChatPanelProps {
  selectedFile: UploadedFile | null
  currentChatId: string
  isBackendReady: boolean
}

// Memoized Message Component for Performance
const MessageComponent = memo(({ message, onTestSelection, onRunCode, onThreadToggle, onThreadDelete, onCreateThread }: {
  message: Message
  onTestSelection: (test: TestSuggestion) => void
  onRunCode: (code: string, language: string) => void
  onThreadToggle: (threadId: string) => void
  onThreadDelete: (threadId: string, permanent: boolean) => void
  onCreateThread: (messageId: string, content: string) => void
}) => {
  return (
    <div
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
              <div className="w-full max-w-full overflow-hidden">
                <MarkdownRenderer 
                  content={message.content}
                  onRunCode={onRunCode}
                />
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
                          onClick={() => onTestSelection(suggestion)}
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
                onRunCode={onRunCode}
              />
              
              {/* Thread Controls for Assistant Messages */}
              {message.canHaveThreads && (
                <ThreadControls
                  messageId={message.id}
                  messageContent={message.content}
                  onCreateThread={onCreateThread}
                  hasThreads={(message.threads?.length || 0) > 0}
                />
              )}
              
              {/* Display Threads */}
              {message.threads && message.threads.map(thread => (
                <ThreadComponent
                  key={thread.id}
                  thread={thread}
                  onToggle={onThreadToggle}
                  onDelete={onThreadDelete}
                />
              ))}
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
  )
})

MessageComponent.displayName = 'MessageComponent'

export function ChatPanel({ selectedFile, currentChatId, isBackendReady }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [isModelReady, setIsModelReady] = useState(false)
  const [pythonOutput, setPythonOutput] = useState<string | null>(null)
  const [isExecutingCode, setIsExecutingCode] = useState(false)
  const [pendingSuggestions, setPendingSuggestions] = useState<TestSuggestion[] | null>(null)
  const [statisticalSidebarOpen, setStatisticalSidebarOpen] = useState(false)
  const [sidebarContext, setSidebarContext] = useState<{
    analysisType: string
    results: string
    originalQuery: string
  } | null>(null)
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false)
  const [showEasterEgg, setShowEasterEgg] = useState(false) // Easter egg state
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const longTermCleanupRef = useRef<NodeJS.Timeout | null>(null)
  const easterEggTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Easter egg timeout ref

  // Immediate scroll function for message sending (no delay)
  const scrollToBottomImmediate = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      // Immediate scroll without any delay
      requestAnimationFrame(() => {
        scrollArea.scrollTop = scrollArea.scrollHeight
      })
    }
  }, [])

  // Debounced auto-scroll function for other scenarios
  const scrollToBottom = useCallback(() => {
    // Clear any pending scroll operations
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollArea = scrollAreaRef.current
        // Use requestAnimationFrame for smooth performance
        requestAnimationFrame(() => {
          scrollArea.scrollTop = scrollArea.scrollHeight
        })
      }
    }, 50)
  }, [])

  // Enhanced scroll function that ensures scrolling works in all scenarios
  const scrollToBottomEnhanced = useCallback(() => {
    // Clear any pending scroll operations
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    // Try immediate scroll first
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
    
    // Also schedule a delayed scroll to ensure it works
    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollArea = scrollAreaRef.current
        scrollArea.scrollTop = scrollArea.scrollHeight
      }
    }, 100)
  }, [])

  // Optimized scroll handling with cleanup
  useEffect(() => {
    scrollToBottomEnhanced()
  }, [messages.length, scrollToBottomEnhanced]) // Only scroll when message count changes

  useEffect(() => {
    if (pythonOutput) {
      // Immediate scroll when Python output appears
      setTimeout(() => scrollToBottomEnhanced(), 100)
    }
  }, [pythonOutput, scrollToBottomEnhanced])

  useEffect(() => {
    if (!isLoading) {
      // Immediate scroll when loading completes
      setTimeout(() => scrollToBottomEnhanced(), 100)
    }
  }, [isLoading, scrollToBottomEnhanced])

  // Initialize professional memory management
  useEffect(() => {
    chatMemoryManager.initialize()
    
    // Listen for memory cleanup events
    const handleMemoryCleanup = () => {
      console.log('🧹 Chat: Performing scheduled memory cleanup...')
      
      setMessages(prev => {
        const cleaned = chatMemoryManager.cleanMessageHistory(prev)
        return cleaned
      })
      
      // Clean thread manager
      threadManager.cleanupOldThreads(2) // 2 hours
      
      const metrics = chatMemoryManager.getMetrics()
      console.log('📊 Chat Performance Metrics:', metrics)
      
      // Show user-friendly notification if needed
      const recommendation = chatMemoryManager.getMemoryRecommendations()
      if (recommendation.action === 'restart_recommended') {
        toast.info('Chat history is getting large. Consider refreshing for optimal performance.')
      }
    }
    
    window.addEventListener('memory-cleanup-needed', handleMemoryCleanup)
    
    return () => {
      window.removeEventListener('memory-cleanup-needed', handleMemoryCleanup)
      chatMemoryManager.destroy()
    }
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
      }
      if (longTermCleanupRef.current) {
        clearInterval(longTermCleanupRef.current)
      }
      if (easterEggTimeoutRef.current) {
        clearTimeout(easterEggTimeoutRef.current)
      }
    }
  }, [])

  // Long-term memory management for extended sessions
  useEffect(() => {
    // Set up periodic cleanup every 10 minutes
    const performLongTermCleanup = () => {
      console.log('🧹 Chat: Performing long-term cleanup...')
      
      // Clean up old threads to prevent memory issues
      threadManager.cleanupOldThreads(2) // Keep threads for 2 hours
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      // Log memory usage for monitoring
      if (messages.length > 100) {
        console.warn(`Chat has ${messages.length} messages - consider clearing old conversations`)
      }
    }

    longTermCleanupRef.current = setInterval(performLongTermCleanup, 10 * 60 * 1000) // 10 minutes
    
    return () => {
      if (longTermCleanupRef.current) {
        clearInterval(longTermCleanupRef.current)
      }
    }
  }, [messages.length])

  // Optimized message batching for better performance with memory management
  const batchedMessages = useMemo(() => {
    // Use professional memory management
    const shouldUseVirtualScroll = chatMemoryManager.shouldUseVirtualScroll(messages.length)
    const needsCleanup = chatMemoryManager.needsAggressiveCleanup(messages.length)
    
    if (needsCleanup) {
      console.log('⚠️ Chat: Aggressive cleanup needed, reducing message history...')
      const cleaned = chatMemoryManager.cleanMessageHistory(messages, true)
      
      // Update state asynchronously to prevent infinite loops
      setTimeout(() => {
        setMessages(cleaned)
      }, 0)
      
      return cleaned
    }
    
    // For very large message counts, use virtual scrolling
    if (shouldUseVirtualScroll) {
      console.log('📺 Chat: Using virtual scrolling for performance')
      // Show only recent messages in viewport
      return messages.slice(-30) // Last 30 messages for smooth scrolling
    }
    
    // Normal operation - limit visible messages
    const maxVisible = 50
    return messages.slice(-maxVisible)
  }, [messages])

  // Memoized data preview to prevent unnecessary re-renders
  const dataPreview = useMemo(() => {
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
  }, [selectedFile?.name, selectedFile?.data.length])

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
      // Optimized scroll with immediate scroll for file selection
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
      }
      renderTimeoutRef.current = setTimeout(scrollToBottomImmediate, 100)
    }
  }, [selectedFile, scrollToBottomImmediate])

  const sendMessage = useCallback(async () => {
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

    // Batch state updates for better performance
    const currentInput = inputMessage
    setInputMessage('')
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    
    // Track message for long-term memory management
    longTermMemoryManager.trackMessage()
    
    // IMMEDIATE scroll to bottom when user sends message - no delay!
    scrollToBottomImmediate()

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
      const response = await aiService.generateAnalysisResponse(selectedModel, currentInput, dataContext, selectedFile)
      
      if (response.type === 'explanation') {
        // Show data explanation and analysis suggestions
        const explanationMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.explanation || 'Here\'s what I found about your data:',
          timestamp: new Date(),
          fileContext: selectedFile.name,
          canHaveThreads: true,
          threads: []
        }
        
        setMessages(prev => [...prev, explanationMessage])
        longTermMemoryManager.trackMessage()
        
        // Immediate scroll after adding response
        setTimeout(() => scrollToBottomImmediate(), 100)
        
        // If there are analysis suggestions, show them as a follow-up
        if (response.analysisSuggestions && response.analysisSuggestions.length > 0) {
          setTimeout(() => {
            const suggestionsText = `\n\n## 💡 Suggested Analyses\n\n` +
              response.analysisSuggestions!.map(suggestion => 
                `**${suggestion.name}** (${suggestion.complexity})\n` +
                `${suggestion.description}\n` +
                `*Medical relevance: ${suggestion.medicalRelevance}*\n`
              ).join('\n')
            
            const suggestionMessage: Message = {
              id: (Date.now() + 2).toString(),
              type: 'assistant',
              content: suggestionsText + '\n\n**What specific analysis would you like to perform?** You can ask me questions like:\n- "Compare treatment groups"\n- "Show blood pressure changes over time"\n- "Analyze patient demographics"',
              timestamp: new Date(),
              fileContext: selectedFile.name
            }
            
            setMessages(prev => [...prev, suggestionMessage])
            longTermMemoryManager.trackMessage()
            
            // Immediate scroll after adding suggestions
            setTimeout(() => scrollToBottomImmediate(), 100)
          }, 1000)
        }
      } else if (response.type === 'suggestions') {
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
        // Track assistant message
        longTermMemoryManager.trackMessage()
        
        // Immediate scroll after adding suggestions
        setTimeout(() => scrollToBottomImmediate(), 100)
      } else {
        // Show generated code
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.code || '',
          timestamp: new Date(),
          fileContext: selectedFile.name,
          canHaveThreads: true,
          threads: []
        }
        
        setMessages(prev => [...prev, assistantMessage])
        // Track assistant message
        longTermMemoryManager.trackMessage()
        
        // Immediate scroll after adding response
        setTimeout(() => scrollToBottomImmediate(), 100)
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
      
      // Immediate scroll after adding error message
      setTimeout(() => scrollToBottomImmediate(), 100)
    } finally {
      setIsLoading(false)
    }
  }, [inputMessage, isLoading, selectedFile, isModelReady, selectedModel, scrollToBottomImmediate])

  const handleThreadToggle = useCallback((threadId: string) => {
    threadManager.toggleThread(threadId)
    
    // Update the message with the updated thread state
    setMessages(prev => prev.map(msg => {
      const updatedThreads = threadManager.getThreadsForMessage(msg.id)
      return {
        ...msg,
        threads: updatedThreads
      }
    }))
  }, [])

  const handleThreadDelete = useCallback((threadId: string, permanent: boolean) => {
    threadManager.markThreadDeleted(threadId, permanent)
    
    // Update the message with the updated thread state
    setMessages(prev => prev.map(msg => {
      const updatedThreads = threadManager.getThreadsForMessage(msg.id)
      return {
        ...msg,
        threads: updatedThreads
      }
    }))
    
    // Clean up AI context if permanent deletion
    if (permanent) {
      console.log('🧹 Thread permanently deleted, AI context cleaned')
    } else {
      console.log('👁️ Thread hidden, AI can still reference it')
    }
  }, [])

  const handleOpenStatisticalSidebar = useCallback((results: string, query: string = '') => {
    // Detect analysis type from results
    let analysisType = 'Statistical Analysis'
    if (results.includes('t-test') || results.includes('t-statistic')) {
      analysisType = 'T-Test Analysis'
    } else if (results.includes('correlation') || results.includes('Correlation')) {
      analysisType = 'Correlation Analysis'
    } else if (results.includes('ANOVA') || results.includes('F-statistic')) {
      analysisType = 'ANOVA Analysis'
    } else if (results.includes('regression')) {
      analysisType = 'Regression Analysis'
    }
    
    setSidebarContext({
      analysisType,
      results,
      originalQuery: query
    })
    setStatisticalSidebarOpen(true)
  }, [])

  const handleCloseStatisticalSidebar = useCallback(() => {
    setStatisticalSidebarOpen(false)
    setSidebarContext(null)
  }, [])

  const handleCreateThread = useCallback((messageId: string, content: string) => {
    // Create statistical help threads based on content analysis
    const createdThreads = threadManager.createStatisticalHelpThreads(messageId, content)
    
    if (createdThreads.length === 0) {
      // Create a general help thread if no specific patterns detected
      const generalThread = threadManager.createThread(
        messageId,
        'general',
        '💡 General Analysis Help',
        `This analysis contains several statistical concepts that might benefit from additional explanation. Feel free to ask specific questions about:\n\n- Statistical test selection and interpretation\n- Medical significance of results\n- Next steps for analysis\n- Clinical implications of findings`,
        {
          testType: 'Multiple Statistical Methods',
          interpretation: 'Various statistical analyses were performed',
          medicalRelevance: 'Results may have clinical implications for patient care and treatment decisions',
          nextSteps: ['Review statistical assumptions', 'Consider clinical significance', 'Plan follow-up analyses']
        }
      )
      createdThreads.push(generalThread)
    }
    
    // Update the specific message with new threads
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const allThreads = threadManager.getThreadsForMessage(messageId)
        return {
          ...msg,
          threads: allThreads,
          canHaveThreads: true
        }
      }
      return msg
    }))
    
    console.log(`✨ Created ${createdThreads.length} statistical help threads`)
  }, [])

  // Optimized input handling with debouncing and Easter egg detection
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    
    // Easter egg detection for "mom" or "amma"
    const trimmedValue = value.trim().toLowerCase();
    if (trimmedValue === 'mom' || trimmedValue === 'amma') {
      setShowEasterEgg(true);
      
      // Clear any existing timeout
      if (easterEggTimeoutRef.current) {
        clearTimeout(easterEggTimeoutRef.current);
      }
      
      // Hide the Easter egg after 3 seconds
      easterEggTimeoutRef.current = setTimeout(() => {
        setShowEasterEgg(false);
      }, 3000);
    }
  }, [])

  // Optimized key press handler
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      
      // Check for Easter egg before sending message
      const trimmedValue = inputMessage.trim().toLowerCase();
      if (trimmedValue === 'mom' || trimmedValue === 'amma') {
        setShowEasterEgg(true);
        
        // Clear any existing timeout
        if (easterEggTimeoutRef.current) {
          clearTimeout(easterEggTimeoutRef.current);
        }
        
        // Hide the Easter egg after 3 seconds
        easterEggTimeoutRef.current = setTimeout(() => {
          setShowEasterEgg(false);
        }, 3000);
        
        // Clear the input but don't send the message
        setInputMessage('');
        return;
      }
      
      sendMessage()
    }
  }, [sendMessage, inputMessage])

  const handleTestSelection = async (selectedTest: TestSuggestion) => {
    if (!selectedFile || !isModelReady) return
    
    // Batch state updates
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
      
      // Immediate scroll after adding code message
      setTimeout(() => scrollToBottomImmediate(), 100)
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

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden w-full max-w-full">
        {/* Easter Egg Display */}
        {showEasterEgg && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
            <div className="text-6xl flex flex-col items-center bg-white rounded-full p-6 shadow-xl border-2 border-pink-200">
              <span className="animate-pulse">❤️</span>
              <span className="text-2xl mt-2 text-pink-500 font-semibold">Mother</span>
            </div>
          </div>
        )}
        
        <div className="p-2 border-b flex-shrink-0 overflow-hidden w-full max-w-full">
          <div className="flex items-center justify-between min-w-0 w-full max-w-full">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-1">
              {/* Reduced width model selector */}
              <div className="flex items-center gap-1 min-w-0 flex-1 max-w-48">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  onModelReady={setIsModelReady}
                />
              </div>
              
              {/* Python Engine Status Indicator */}
              <div className="flex items-center gap-1 text-xs">
                <div className={`w-2 h-2 rounded-full ${isBackendReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-muted-foreground">
                  Python: {isBackendReady ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {/* Performance Metrics Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
                className="text-xs h-8 px-2"
                title="Show performance metrics"
              >
                📈 Performance
              </Button>
            </div>
            
            {/* Performance Metrics Display */}
            {showPerformanceMetrics && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg border text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="font-medium">Messages:</span> {messages.length}
                  </div>
                  <div>
                    <span className="font-medium">Visible:</span> {batchedMessages.length}
                  </div>
                  <div>
                    <span className="font-medium">Memory:</span> {chatMemoryManager.getMetrics().memoryUsageMB}MB
                  </div>
                </div>
                <div className="mt-1 text-gray-600">
                  {messages.length > 50 && (
                    <span className="text-orange-600">⚠️ Large history - auto-cleanup active</span>
                  )}
                  {messages.length > 100 && (
                    <span className="text-red-600">🚨 Very large history - consider refresh</span>
                  )}
                </div>
              </div>
            )}
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
              {dataPreview}
              
              <div className="space-y-4 w-full max-w-full overflow-hidden">
                {batchedMessages.map((message) => (
                  <MessageComponent
                    key={message.id}
                    message={message}
                    onTestSelection={handleTestSelection}
                    onRunCode={handleRunPythonCode}
                    onThreadToggle={handleThreadToggle}
                    onThreadDelete={handleThreadDelete}
                    onCreateThread={handleCreateThread}
                  />
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
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                        <Code className="h-4 w-4" />
                        Python Execution Results
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenStatisticalSidebar(pythonOutput, inputMessage)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
                        title="Open Statistical Analysis Helper"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
                onChange={handleInputChange}
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
    
    {/* Statistical Sidebar */}
    {statisticalSidebarOpen && sidebarContext && (
      <StatisticalSidebar
        isOpen={statisticalSidebarOpen}
        onClose={handleCloseStatisticalSidebar}
        contextData={sidebarContext}
      />
    )}
  </>
  )
}