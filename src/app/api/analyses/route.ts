import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserAnalyses } from '@/lib/supabase'
import type { Module } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const module = searchParams.get('module') as Module | null

    const analyses = await getUserAnalyses(userId, module ?? undefined)
    return NextResponse.json({ analyses })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
