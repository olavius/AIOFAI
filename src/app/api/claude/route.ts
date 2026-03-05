import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@clerk/nextjs/server'
import { saveAnalysis } from '@/lib/supabase'
import { SYSTEM_PROMPT } from '@/lib/prompts'
import type { Module } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      prompt,
      systemPrompt,
      maxTokens = 4096,
      module,
      input,
      saveToDb = true,
    }: {
      prompt: string
      systemPrompt?: string
      maxTokens?: number
      module?: Module
      input?: Record<string, unknown>
      saveToDb?: boolean
    } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: maxTokens,
      system: systemPrompt || SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    let analysisId: string | undefined
    if (saveToDb && module && input) {
      const analysis = await saveAnalysis(userId, module, input, content)
      analysisId = analysis?.id
    }

    return NextResponse.json({ content, analysisId })
  } catch (error) {
    console.error('Claude API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
