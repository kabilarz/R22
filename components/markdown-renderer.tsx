'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '@/components/ui/button'
import { Copy, Play } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

interface MarkdownRendererProps {
  content: string
  onRunCode?: (code: string, language: string) => void
}

export function MarkdownRenderer({ content, onRunCode }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const handleRunCode = (code: string, language: string) => {
    if (onRunCode) {
      onRunCode(code, language)
    } else {
      toast.info('Code execution not available in this context')
    }
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : 'text'
            const code = String(children).replace(/\n$/, '')
            
            if (inline) {
              return (
                <code 
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" 
                  {...props}
                >
                  {children}
                </code>
              )
            }

            return (
              <div className="relative my-4">
                <div className="absolute right-2 top-2 flex gap-1 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code)}
                    className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40"
                  >
                    <Copy className="h-3 w-3 text-white" />
                  </Button>
                  {(language === 'python' || language === 'py') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRunCode(code, language)}
                      className="h-8 w-8 p-0 bg-green-600/70 hover:bg-green-600/90"
                    >
                      <Play className="h-3 w-3 text-white" />
                    </Button>
                  )}
                </div>
                {React.createElement(SyntaxHighlighter as any, {
                  style: oneDark,
                  language: language,
                  PreTag: "div",
                  customStyle={{
                    margin: 0,
                    borderRadius: '6px',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            )
          },
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mb-3 mt-6">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mb-2 mt-5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium mb-2 mt-4">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/50 italic">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="border-collapse border border-border w-full text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted px-3 py-2 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}