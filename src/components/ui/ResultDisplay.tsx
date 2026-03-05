'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ResultDisplayProps {
  content: string
  analysisId?: string
}

export function ResultDisplay({ content, analysisId }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="result-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-forestBright animate-pulse-slow" />
          <span className="text-xs text-cream/60 font-medium">AI Analysis Complete</span>
          {analysisId && (
            <span className="text-xs text-cream/30">· Saved</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="btn-ghost text-xs py-1.5 px-3"
          title="Copy to clipboard"
        >
          {copied ? <Check size={13} className="text-forestBright" /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="prose-dark">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
