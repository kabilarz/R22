'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  X, 
  Trash2,
  BookOpen,
  Activity,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Thread, StatisticalContext } from '@/lib/thread-manager'

interface ThreadComponentProps {
  thread: Thread
  onToggle: (threadId: string) => void
  onDelete: (threadId: string, permanent: boolean) => void
}

const getThreadIcon = (type: Thread['type']) => {
  switch (type) {
    case 'statistical_help':
      return <BookOpen className="h-4 w-4 text-blue-600" />
    case 'medical_context':
      return <Activity className="h-4 w-4 text-red-600" />
    case 'code_explanation':
      return <Lightbulb className="h-4 w-4 text-yellow-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

const getThreadBadgeColor = (type: Thread['type']) => {
  switch (type) {
    case 'statistical_help':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'medical_context':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'code_explanation':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function StatisticalContextDisplay({ context }: { context: StatisticalContext }) {
  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border text-sm">
      <div className="space-y-2">
        {context.testType && (
          <div>
            <span className="font-medium text-gray-700">Test Type:</span>
            <span className="ml-2 text-gray-600">{context.testType}</span>
          </div>
        )}
        
        {context.assumptions && context.assumptions.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Key Assumptions:</span>
            <ul className="ml-4 mt-1 list-disc list-inside text-gray-600">
              {context.assumptions.map((assumption, index) => (
                <li key={index}>{assumption}</li>
              ))}
            </ul>
          </div>
        )}
        
        {context.medicalRelevance && (
          <div>
            <span className="font-medium text-gray-700">Clinical Relevance:</span>
            <p className="ml-2 text-gray-600">{context.medicalRelevance}</p>
          </div>
        )}
        
        {context.nextSteps && context.nextSteps.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Next Steps:</span>
            <ul className="ml-4 mt-1 list-disc list-inside text-gray-600">
              {context.nextSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export function ThreadComponent({ thread, onToggle, onDelete }: ThreadComponentProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = (permanent: boolean) => {
    onDelete(thread.id, permanent)
    setShowDeleteConfirm(false)
  }

  return (
    <Card className="mt-2 ml-4 border-l-4 border-l-blue-200 bg-blue-50/30">
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(thread.id)}
              className="h-6 w-6 p-0"
            >
              {thread.isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            
            {getThreadIcon(thread.type)}
            
            <CardTitle className="text-sm font-medium">
              {thread.title}
            </CardTitle>
            
            <Badge 
              variant="outline" 
              className={`text-xs ${getThreadBadgeColor(thread.type)}`}
            >
              {thread.type.replace('_', ' ')}
            </Badge>
          </div>
          
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Thread</DialogTitle>
                <DialogDescription>
                  How would you like to handle this statistical help thread?
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleDelete(false)}
                  className="justify-start"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hide for now (AI can still reference it)
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(true)}
                  className="justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete permanently (clean up AI context)
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      {!thread.isCollapsed && (
        <CardContent className="pt-0">
          <div className="prose prose-sm max-w-none">
            <MarkdownRenderer content={thread.content} />
            
            {thread.statisticalContext && (
              <StatisticalContextDisplay context={thread.statisticalContext} />
            )}
          </div>
          
          <div className="flex justify-between items-center mt-3 pt-2 border-t text-xs text-gray-500">
            <span>
              {thread.timestamp.toLocaleTimeString()}
            </span>
            <span>
              {thread.relevantToCurrentAnalysis ? 'Relevant to current analysis' : 'Background context'}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

interface ThreadControlsProps {
  messageId: string
  messageContent: string
  onCreateThread: (messageId: string, content: string) => void
  hasThreads: boolean
}

export function ThreadControls({ 
  messageId, 
  messageContent, 
  onCreateThread, 
  hasThreads 
}: ThreadControlsProps) {
  const handleCreateStatisticalHelp = () => {
    onCreateThread(messageId, messageContent)
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCreateStatisticalHelp}
        className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        title="Add statistical explanations and context"
      >
        <Plus className="h-3 w-3 mr-1" />
        Statistical Help
      </Button>
      
      {hasThreads && (
        <span className="text-xs text-gray-500">
          Threads available below
        </span>
      )}
    </div>
  )
}