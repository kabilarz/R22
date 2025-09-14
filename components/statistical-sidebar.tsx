'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  TrendingUp,
  Brain,
  HelpCircle,
  BarChart3,
  Activity
} from 'lucide-react'
import { MarkdownRenderer } from '@/components/markdown-renderer'

interface StatisticalMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface StatisticalSidebarProps {
  isOpen: boolean
  onClose: () => void
  contextData: {
    analysisType: string
    results: string
    originalQuery: string
  }
}

export function StatisticalSidebar({ isOpen, onClose, contextData }: StatisticalSidebarProps) {
  const [messages, setMessages] = useState<StatisticalMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Enhanced scroll function for the statistical sidebar
  const scrollToBottom = useCallback(() => {
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

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages.length, scrollToBottom])

  // Scroll when loading state changes
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => scrollToBottom(), 100)
    }
  }, [isLoading, scrollToBottom])

  // Initialize with contextual welcome message
  React.useEffect(() => {
    if (isOpen) {
      // Clear existing messages and create fresh welcome message
      const welcomeMessage: StatisticalMessage = {
        id: `welcome_${Date.now()}`,
        type: 'assistant',
        content: getContextualWelcomeMessage(contextData),
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      // Scroll to bottom after welcome message
      setTimeout(() => scrollToBottom(), 100)
    }
  }, [isOpen, contextData, scrollToBottom])

  const getContextualWelcomeMessage = (context: typeof contextData): string => {
    const { analysisType, results } = context
    
    // Debug: Log the actual results
    console.log('📊 StatisticalSidebar: Analysis results received:', results.substring(0, 200))
    
    let message = `## 📊 Statistical Context Assistant\n\n`
    
    // Extract statistical values from results for better context detection
    const pValueMatch = results.match(/P-value:\s*([\d\.]+)/i)
    const tStatisticMatch = results.match(/T-statistic:\s*([\d\.\-]+)/i)
    const group1MeanMatch = results.match(/Group 1 mean:\s*([\d\.]+)/i)
    const group2MeanMatch = results.match(/Group 2 mean:\s*([\d\.]+)/i)
    const significantMatch = results.match(/Significant:\s*(Yes|No)/i)
    
    const pValue = pValueMatch ? parseFloat(pValueMatch[1]) : null
    const tStatistic = tStatisticMatch ? parseFloat(tStatisticMatch[1]) : null
    const group1Mean = group1MeanMatch ? parseFloat(group1MeanMatch[1]) : null
    const group2Mean = group2MeanMatch ? parseFloat(group2MeanMatch[1]) : null
    const isSignificant = significantMatch ? significantMatch[1].toLowerCase() === 'yes' : false
    
    // Detect analysis type from actual results
    if (results.includes('t-test') || results.includes('t-statistic') || tStatistic !== null) {
      message += `**Analysis Detected:** T-Test Analysis\n\n`
      message += `I can help you understand:\n`
      message += `• **Interpretation**: What do these t-test results mean?\n`
      message += `• **Assumptions**: Are the test assumptions met?\n`
      message += `• **Clinical Significance**: What does this mean for patients?\n`
      message += `• **Next Steps**: What analyses should you do next?\n\n`
      
      // Add specific insights based on actual values
      if (pValue !== null) {
        message += `**📊 Key Insight:** ${isSignificant ? '**Significant result detected!**' : 'Non-significant result'} (p = ${pValue})\n\n`
      }
    } else if (results.includes('correlation') || results.includes('Correlation')) {
      message += `**Analysis Detected:** Correlation Analysis\n\n`
      message += `I can help you understand:\n`
      message += `• **Correlation Strength**: How strong is this relationship?\n`
      message += `• **Clinical Meaning**: What does this correlation suggest?\n`
      message += `• **Causation vs Correlation**: Important considerations\n`
      message += `• **Follow-up Analyses**: Regression or stratified analysis\n\n`
    } else if (results.includes('ANOVA') || results.includes('F-statistic')) {
      message += `**Analysis Detected:** ANOVA Analysis\n\n`
      message += `I can help you understand:\n`
      message += `• **F-statistic Meaning**: What does the F-value tell us?\n`
      message += `• **Post-hoc Tests**: Which groups are different?\n`
      message += `• **Effect Sizes**: How large are the differences?\n`
      message += `• **Clinical Implications**: Treatment recommendations\n\n`
    } else {
      message += `**Analysis Results Available**\n\n`
      message += `I can help you understand:\n`
      message += `• **Results Interpretation**: What do these numbers mean?\n`
      message += `• **Statistical Significance**: Is this meaningful?\n`
      message += `• **Clinical Relevance**: How does this apply to patients?\n`
      message += `• **Research Implications**: What should you conclude?\n\n`
    }
    
    message += `**Quick Questions You Can Ask:**\n`
    message += `• "What does p=${pValue !== null ? pValue : '0.892'} mean in practical terms?"\n`
    message += `• "Is this result clinically significant?"\n`
    message += `• "How should I report these findings?"\n`
    message += `• "What are the next steps for analysis?"\n\n`
    message += `**Ask me anything about your results!** 👇`
    
    return message
  }

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: StatisticalMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Enhanced context with actual statistical values
    const enhancedContext = {
      ...contextData,
      pValue: contextData.results.match(/P-value:\s*([\d\.]+)/i)?.[1] || null,
      tStatistic: contextData.results.match(/T-statistic:\s*([\d\.\-]+)/i)?.[1] || null,
      group1Mean: contextData.results.match(/Group 1 mean:\s*([\d\.]+)/i)?.[1] || null,
      group2Mean: contextData.results.match(/Group 2 mean:\s*([\d\.]+)/i)?.[1] || null,
      isSignificant: contextData.results.match(/Significant:\s*(Yes|No)/i)?.[1].toLowerCase() === 'yes' || false
    }

    // Simulate AI response for statistical help with enhanced context
    setTimeout(() => {
      const assistantMessage: StatisticalMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateStatisticalResponse(inputMessage, enhancedContext),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }, [inputMessage, isLoading, contextData])

  const generateStatisticalResponse = (query: string, context: any): string => {
    const lowerQuery = query.toLowerCase()
    const { results, pValue, tStatistic, group1Mean, group2Mean, isSignificant } = context
    
    // Debug: Log the actual context and query
    console.log('💬 StatisticalSidebar: Processing query with context:', { query, context })
    
    // Parse numerical values
    const parsedPValue = pValue ? parseFloat(pValue) : null
    const parsedTStatistic = tStatistic ? parseFloat(tStatistic) : null
    const parsedGroup1Mean = group1Mean ? parseFloat(group1Mean) : null
    const parsedGroup2Mean = group2Mean ? parseFloat(group2Mean) : null
    
    // Extract standard deviation information with more flexible patterns
    let parsedGroup1StdDev = null
    let parsedGroup2StdDev = null
    
    // Try different patterns for standard deviation extraction
    const stdDevPatterns = [
      /Group 1.*std(?:ev| dev|deviation).*:\s*([\d\.]+)/i,
      /Group 1.*:\s*[\d\.]+\s*\((?:std|sd|stdev):\s*([\d\.]+)\)/i,
      /Group 1.*std.*:\s*([\d\.]+)/i,
      /std.*1.*:\s*([\d\.]+)/i
    ]
    
    for (const pattern of stdDevPatterns) {
      const match = results.match(pattern)
      if (match) {
        parsedGroup1StdDev = parseFloat(match[1])
        break
      }
    }
    
    const stdDevPatterns2 = [
      /Group 2.*std(?:ev| dev|deviation).*:\s*([\d\.]+)/i,
      /Group 2.*:\s*[\d\.]+\s*\((?:std|sd|stdev):\s*([\d\.]+)\)/i,
      /Group 2.*std.*:\s*([\d\.]+)/i,
      /std.*2.*:\s*([\d\.]+)/i
    ]
    
    for (const pattern of stdDevPatterns2) {
      const match = results.match(pattern)
      if (match) {
        parsedGroup2StdDev = parseFloat(match[1])
        break
      }
    }
    
    // Log extracted values
    console.log('📊 Parsed statistical values:', { 
      pValue: parsedPValue, 
      tStatistic: parsedTStatistic, 
      group1Mean: parsedGroup1Mean, 
      group2Mean: parsedGroup2Mean, 
      group1StdDev: parsedGroup1StdDev,
      group2StdDev: parsedGroup2StdDev,
      isSignificant 
    })
    
    // Handle queries about graphical representations and visualizations
    if (lowerQuery.includes('graphical') || lowerQuery.includes('visualization') || 
        lowerQuery.includes('chart') || lowerQuery.includes('plot') ||
        (lowerQuery.includes('what') && lowerQuery.includes('create') && lowerQuery.includes('data')) ||
        lowerQuery.includes('graph') || lowerQuery.includes('diagram')) {
      
      // Detect analysis type from results
      let analysisType = 'general statistical analysis'
      let suggestedVisualizations = []
      
      if (results.includes('t-test') || results.includes('t-statistic') || parsedTStatistic !== null) {
        analysisType = 't-test comparison'
        suggestedVisualizations = [
          'Box plots to compare distributions between groups',
          'Bar charts with error bars showing group means and confidence intervals',
          'Scatter plots to visualize individual data points',
          'Histograms to show the distribution of each group',
          'Q-Q plots to check normality assumptions'
        ]
      } else if (results.includes('correlation') || results.includes('Correlation')) {
        analysisType = 'correlation analysis'
        suggestedVisualizations = [
          'Scatter plots with trend lines to show relationships',
          'Heatmaps for correlation matrices',
          'Pair plots for multiple variable relationships',
          'Bubble charts for three-variable correlations'
        ]
      } else if (results.includes('ANOVA') || results.includes('F-statistic')) {
        analysisType = 'ANOVA analysis'
        suggestedVisualizations = [
          'Box plots to compare multiple groups',
          'Bar charts with error bars for group means',
          'Interaction plots for factorial ANOVA',
          'Residual plots to check assumptions'
        ]
      } else if (results.includes('regression')) {
        analysisType = 'regression analysis'
        suggestedVisualizations = [
          'Scatter plots with regression lines',
          'Residual plots to assess model fit',
          'Partial regression plots',
          'Coefficient plots for multiple regression'
        ]
      } else {
        // Default visualizations for general data
        suggestedVisualizations = [
          'Histograms to show data distributions',
          'Box plots to display data spread and outliers',
          'Scatter plots to explore relationships between variables',
          'Bar charts for categorical data',
          'Line plots for time series or ordered data'
        ]
      }
      
      let explanation = `## 📊 Graphical Representations for Your Data\n\n`
      explanation += `Based on your ${analysisType}, here are the most appropriate visualizations you can create:\n\n`
      
      suggestedVisualizations.forEach((viz, index) => {
        explanation += `${index + 1}. **${viz}**\n`
      })
      
      explanation += `\n**Medical Insights:**\n`
      explanation += `• Visualizations help communicate statistical findings effectively\n`
      explanation += `• They reveal patterns that might not be obvious from numbers alone\n`
      explanation += `• They're essential for presenting results in clinical publications\n\n`
      
      explanation += `**Getting Started:**\n`
      explanation += `• Use the "Comprehensive Visualizations" panel to create these charts\n`
      explanation += `• Select your variables based on the statistical test you performed\n`
      explanation += `• Consider your audience when choosing visualization types\n\n`
      
      return explanation
    }
    
    // Handle queries about means and standard deviations
    if (lowerQuery.includes('mean') && (lowerQuery.includes('standard deviation') || lowerQuery.includes('std dev')) || 
        lowerQuery.includes('explain in simple words') ||
        (lowerQuery.includes('what does it mean') && lowerQuery.includes('me'))) {
      
      let explanation = `## 📊 Understanding Means and Standard Deviations\n\n`
      
      if (parsedGroup1Mean !== null && parsedGroup2Mean !== null) {
        explanation += `**What do the means tell us?**\n`
        explanation += `• Group 1 mean: **${parsedGroup1Mean}** - This is the average value for Group 1\n`
        explanation += `• Group 2 mean: **${parsedGroup2Mean}** - This is the average value for Group 2\n`
        explanation += `• Mean difference: **${Math.abs(parsedGroup1Mean - parsedGroup2Mean).toFixed(2)}** points\n\n`
        
        if (parsedGroup1StdDev !== null && parsedGroup2StdDev !== null) {
          explanation += `**What do the standard deviations tell us?**\n`
          explanation += `• Group 1 standard deviation: **${parsedGroup1StdDev.toFixed(2)}** - This measures how spread out the values are in Group 1\n`
          explanation += `• Group 2 standard deviation: **${parsedGroup2StdDev.toFixed(2)}** - This measures how spread out the values are in Group 2\n\n`
          
          explanation += `**In Simple Terms:**\n`
          explanation += `• The **mean** is just the average - add up all values and divide by the number of values\n`
          explanation += `• The **standard deviation** measures variability - a small SD means values are close to the mean, a large SD means values are spread out\n`
          explanation += `• In your case, Group 1 has an average of ${parsedGroup1Mean} with values typically varying by ${parsedGroup1StdDev.toFixed(2)}\n`
          explanation += `• Group 2 has an average of ${parsedGroup2Mean} with values typically varying by ${parsedGroup2StdDev.toFixed(2)}\n\n`
        } else {
          explanation += `**In Simple Terms:**\n`
          explanation += `• The **mean** is just the average - add up all values and divide by the number of values\n`
          explanation += `• Group 1 has an average of ${parsedGroup1Mean}\n`
          explanation += `• Group 2 has an average of ${parsedGroup2Mean}\n`
          explanation += `• The difference between groups is ${Math.abs(parsedGroup1Mean - parsedGroup2Mean).toFixed(2)} points\n\n`
        }
      } else {
        // Fallback if means are not available
        explanation += `**In Simple Terms:**\n`
        explanation += `• The **mean** is just the average - add up all values and divide by the number of values\n`
        explanation += `• The **standard deviation** measures variability - a small SD means values are close to the mean, a large SD means values are spread out\n\n`
      }
      
      explanation += `**Clinical Significance:**\n`
      explanation += `• Consider whether the mean difference is meaningful in real-world terms\n`
      explanation += `• A small standard deviation suggests consistent results, while a large one suggests more variability\n`
      explanation += `• Both means and standard deviations help you understand your data better\n\n`
      
      return explanation
    }
    
    // P-value interpretation with actual values
    if (lowerQuery.includes('p=') || lowerQuery.includes('p-value') || lowerQuery.includes('significant') || lowerQuery.includes('correlation')) {
      if (parsedPValue !== null) {
        const isStatisticallySignificant = parsedPValue < 0.05
        
        let interpretation = `## 🎯 P-Value Interpretation\n\n**Your p-value: ${parsedPValue}**\n\n**What this means:**\n`
        
        if (isStatisticallySignificant) {
          interpretation += `• There's only a **${(parsedPValue * 100).toFixed(2)}%** chance of seeing this result (or more extreme) if there's actually no real difference\n`
          interpretation += `• This **IS statistically significant** (p < 0.05)\n`
          interpretation += `• The difference you found is **unlikely to be due to random chance**\n\n`
          
          if (parsedGroup1Mean !== null && parsedGroup2Mean !== null) {
            const difference = Math.abs(parsedGroup1Mean - parsedGroup2Mean).toFixed(2)
            interpretation += `**In Plain English:**\n"There is a statistically significant difference of ${difference} between the two groups. This suggests a real treatment effect."\n\n`
        
            interpretation += `**Clinical Implications:**\n`
            if (parsedGroup1Mean > parsedGroup2Mean) {
              interpretation += `• Group 1 (mean: ${parsedGroup1Mean}) shows better outcomes than Group 2 (mean: ${parsedGroup2Mean})\n`
            } else {
              interpretation += `• Group 2 (mean: ${parsedGroup2Mean}) shows better outcomes than Group 1 (mean: ${parsedGroup1Mean})\n`
            }
            interpretation += `• This treatment difference may be clinically meaningful\n`
            interpretation += `• Consider the practical significance of this ${difference} point difference\n\n`
          }
        } else {
          interpretation += `• There's a **${(parsedPValue * 100).toFixed(2)}%** chance of seeing this result (or more extreme) if there's actually no real difference\n`
          interpretation += `• This is **NOT statistically significant** (p ≥ 0.05)\n`
          interpretation += `• The difference you found could easily be due to random chance\n\n`
          
          interpretation += `**In Plain English:**\n"We cannot conclude there's a meaningful difference between the groups. The observed difference is likely just random variation."\n\n`
          
          interpretation += `**Clinical Implications:**\n• No strong evidence for treatment difference\n• Consider larger sample sizes or different approaches\n• Focus on other potential predictors\n\n`
        }
      
      interpretation += `**Reporting Suggestion:**\n"A t-test revealed a ${isStatisticallySignificant ? 'significant' : 'non-significant'} difference between groups (t = ${parsedTStatistic?.toFixed(4) || 'N/A'}, p = ${parsedPValue}), with Group 1 mean = ${parsedGroup1Mean || 'N/A'} and Group 2 mean = ${parsedGroup2Mean || 'N/A'}."`
      
      return interpretation
      }
    }
  
  // T-test specific interpretation
  if ((lowerQuery.includes('t-test') || lowerQuery.includes('t test') || lowerQuery.includes('t-statistic')) && parsedTStatistic !== null) {
    return `## 📊 T-Test Analysis\n\n**Your Results:**\n• T-statistic: **${parsedTStatistic}**\n• P-value: **${parsedPValue}**\n• Significant: **${isSignificant ? 'YES' : 'NO'}**\n${parsedGroup1Mean !== null && parsedGroup2Mean !== null ? `• Group 1 mean: ${parsedGroup1Mean}\n• Group 2 mean: ${parsedGroup2Mean}\n• Mean difference: ${Math.abs(parsedGroup1Mean - parsedGroup2Mean).toFixed(2)}` : ''}\n\n**What the T-statistic tells us:**\n• Measures the **size of the difference** relative to the variation in your sample\n• Larger absolute values = stronger evidence for a real difference\n• Your t-statistic of ${parsedTStatistic} suggests ${Math.abs(parsedTStatistic) > 2 ? 'strong' : 'moderate'} evidence ${parsedTStatistic > 0 ? 'for' : 'against'} a difference\n\n**Clinical Interpretation:**\n${isSignificant ? 
  `• **Statistically significant difference** found between groups\n• The ${Math.abs(parsedGroup1Mean - parsedGroup2Mean).toFixed(2)} point difference is unlikely due to chance\n• This suggests a real treatment effect` : 
  `• **No statistically significant difference** found between groups\n• The observed difference may be due to random variation\n• Consider other factors or larger samples`}`
  }
  
  // Mean difference interpretation
  if ((lowerQuery.includes('mean') || lowerQuery.includes('difference') || lowerQuery.includes('group')) && 
      parsedGroup1Mean !== null && parsedGroup2Mean !== null) {
    const difference = Math.abs(parsedGroup1Mean - parsedGroup2Mean)
    const percentChange = ((difference / ((parsedGroup1Mean + parsedGroup2Mean) / 2)) * 100).toFixed(1)
    
    return `## 📈 Group Comparison\n\n**Your Results:**\n• Group 1 mean: **${parsedGroup1Mean}**\n• Group 2 mean: **${parsedGroup2Mean}**\n• Absolute difference: **${difference.toFixed(2)}**\n• Relative difference: **${percentChange}%**\n\n**What this means:**\n• Group ${parsedGroup1Mean > parsedGroup2Mean ? '1' : '2'} shows better outcomes by ${difference.toFixed(2)} points\n• This represents a ${percentChange}% difference between groups\n• ${parsedPValue !== null && parsedPValue < 0.05 ? 
  `**This difference is statistically significant** (p = ${parsedPValue})` : 
  `This difference ${parsedPValue !== null ? `is not statistically significant (p = ${parsedPValue})` : 'may not be meaningful'}`}
\n**Clinical Significance:**\n• Consider whether a ${difference.toFixed(2)} point difference is meaningful for patients\n• Evaluate the practical importance alongside statistical significance\n• Think about the measurement scale and what this difference means in real-world terms`
  }
  
  // Generic response with actual context
  return `## 🤔 Statistical Interpretation Help\n\nI'd be happy to help you understand your results better!\n\n**Based on your analysis:**\n\n**Key Findings:**\n${parsedPValue !== null ? `• P-value: ${parsedPValue} (${parsedPValue < 0.05 ? 'Significant' : 'Not significant'})\n` : ''}${parsedTStatistic !== null ? `• T-statistic: ${parsedTStatistic}\n` : ''}${parsedGroup1Mean !== null && parsedGroup2Mean !== null ? `• Group difference: ${Math.abs(parsedGroup1Mean - parsedGroup2Mean).toFixed(2)} points\n` : ''}\n**What would you like to explore further?**\n• Detailed interpretation of specific statistics\n• Clinical implications of these findings\n• Suggestions for follow-up analyses\n• Help with reporting these results\n\nFeel free to ask specific questions about any part of your analysis!`
}

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex">
      {/* Main content area (70%) */}
      <div className="flex-1" onClick={onClose} />
      
      {/* Sidebar (30%) */}
      <div className="w-[30%] min-w-[400px] bg-white border-l shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Brain className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Statistical Assistant</h3>
                <p className="text-xs text-blue-600">Contextual Help & Analysis</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Context Badge */}
          <div className="mt-3 flex gap-2">
            <Badge variant="outline" className="text-xs bg-white">
              <BarChart3 className="h-3 w-3 mr-1" />
              {contextData.analysisType || 'Statistical Analysis'}
            </Badge>
            <Badge variant="outline" className="text-xs bg-white">
              <Activity className="h-3 w-3 mr-1" />
              Interactive Help
            </Badge>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="overflow-hidden">
                    {message.type === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        <MarkdownRenderer content={message.content} />
                      </div>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user'
                      ? 'bg-blue-600 order-first'
                      : 'bg-gray-200'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="h-3 w-3 text-white" />
                  ) : (
                    <Bot className="h-3 w-3 text-gray-600" />
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="h-3 w-3 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about your statistical results..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[60px] resize-none flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInputMessage("What does this p-value mean?")}
              className="text-xs"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              P-value Help
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInputMessage("How should I report these results?")}
              className="text-xs"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Reporting
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}