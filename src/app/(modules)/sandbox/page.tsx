'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Trash2, BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PageHeader } from '@/components/layout/PageHeader'
import { buildSandboxSystemPrompt } from '@/lib/prompts'
import { formatDate } from '@/lib/utils'
import type { ChatMessage } from '@/types'

const QUICK_PROMPTS = [
  'Summarise the 3 most impactful AI use cases for a CFO in my industry',
  'What KPIs should I track to improve working capital?',
  'Help me write a business case for a finance AI initiative',
  'What are the top risks of AI adoption in a finance function?',
  'How do I structure a zero-based budgeting process?',
  'Compare direct and indirect cash flow statement approaches',
]

const CONTEXT_OPTIONS = [
  { value: '', label: 'No context' },
  { value: 'technology', label: 'Technology company, Series B, $50M ARR' },
  { value: 'manufacturing', label: 'Manufacturing, mid-market, multi-entity' },
  { value: 'professional-services', label: 'Professional services, PE-backed' },
  { value: 'retail', label: 'Retail, multi-channel, seasonal business' },
]

export default function SandboxPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState('')
  const [streamedContent, setStreamedContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamedContent])

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreamedContent('')

    try {
      const systemPrompt = buildSandboxSystemPrompt(
        CONTEXT_OPTIONS.find((c) => c.value === context)?.label ?? '',
      )

      const anthropicMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/claude/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages: anthropicMessages }),
      })

      if (!res.ok) throw new Error('Stream failed')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break
              try {
                const parsed = JSON.parse(data)
                fullContent += parsed.text
                setStreamedContent(fullContent)
              } catch {}
            }
          }
        }
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setStreamedContent('')

      // Save to DB in background
      if (fullContent) {
        fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: content.trim(),
            module: 'sandbox',
            input: { userMessage: content.trim(), context },
            saveToDb: true,
            maxTokens: 100,
          }),
        }).catch(() => {})
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
      setStreamedContent('')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
      <PageHeader
        icon={MessageSquare}
        title="AI Sandbox"
        description="Interactive CFO advisory session — ask anything, explore ideas, follow up on analyses"
        badge="Streaming"
      />

      {/* Context selector */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <BookOpen size={15} className="text-cream/40 shrink-0" />
        <span className="text-xs text-cream/40">Session context:</span>
        <div className="flex flex-wrap gap-2">
          {CONTEXT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setContext(opt.value)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                context === opt.value
                  ? 'bg-forest border-forestBright text-cream'
                  : 'bg-panel border-panel text-cream/50 hover:border-forestMid hover:text-cream'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setStreamedContent('') }}
            className="btn-ghost text-xs py-1 px-2 ml-auto"
          >
            <Trash2 size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto min-h-0 mb-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="space-y-6">
            <div className="card text-center py-10">
              <div className="w-12 h-12 rounded-xl bg-forest border border-forestMid flex items-center justify-center mx-auto mb-3">
                <span className="text-gold text-xl font-bold">◈</span>
              </div>
              <p className="text-cream font-medium">CFO Intelligence Sandbox</p>
              <p className="text-cream/50 text-sm mt-1">Ask any financial strategy, analytics, or automation question</p>
            </div>
            <div>
              <p className="text-xs text-cream/40 font-medium uppercase tracking-wider mb-3">Quick Prompts</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p)}
                    className="text-left px-4 py-3 rounded-xl bg-surface border border-panel hover:border-forestMid hover:bg-forest/20 text-cream/70 hover:text-cream text-sm transition-all duration-150"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}

        {loading && streamedContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-forest border border-forestMid flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-gold text-xs font-bold">◈</span>
            </div>
            <div className="flex-1 min-w-0 bg-surface border border-panel rounded-2xl rounded-tl-none px-4 py-3">
              <div className="prose-dark text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamedContent}</ReactMarkdown>
              </div>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-forestBright animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && !streamedContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-forest border border-forestMid flex items-center justify-center shrink-0">
              <span className="text-gold text-xs font-bold">◈</span>
            </div>
            <div className="bg-surface border border-panel rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-forestBright animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0">
        <div className="flex gap-3 items-end bg-surface border border-panel rounded-2xl p-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your CFO intelligence question… (Enter to send, Shift+Enter for new line)"
            className="flex-1 bg-transparent border-none outline-none text-cream placeholder:text-cream/30 resize-none text-sm leading-relaxed min-h-[44px] max-h-[140px]"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="btn-primary py-2 px-3 shrink-0 self-end"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-cream/20 text-xs mt-2">
          CFO Intelligence Platform · Ascando Partners · Responses are AI-generated
        </p>
      </div>
    </div>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[80%] bg-forestMid border border-forestBright/40 rounded-2xl rounded-tr-none px-4 py-3">
          <p className="text-cream text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <p className="text-cream/30 text-xs mt-1.5 text-right">{formatDate(message.timestamp)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-forest border border-forestMid flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-gold text-xs font-bold">◈</span>
      </div>
      <div className="flex-1 min-w-0 bg-surface border border-panel rounded-2xl rounded-tl-none px-4 py-3">
        <div className="prose-dark text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
        <p className="text-cream/30 text-xs mt-2">{formatDate(message.timestamp)}</p>
      </div>
    </div>
  )
}
