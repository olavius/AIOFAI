import { createClient } from '@supabase/supabase-js'
import type { Analysis, Module } from '@/types'

// Lazy client creation — avoids crashing at build time when env vars aren't set
function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key)
}

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role env vars not configured')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function saveAnalysis(
  userId: string,
  module: Module,
  input: Record<string, unknown>,
  output: string,
): Promise<Analysis | null> {
  const client = getServiceClient()
  const { data, error } = await client
    .from('analyses')
    .insert({ user_id: userId, module, input, output })
    .select()
    .single()

  if (error) {
    console.error('Failed to save analysis:', error)
    return null
  }
  return data as Analysis
}

export async function getUserAnalyses(userId: string, module?: Module): Promise<Analysis[]> {
  const client = getServiceClient()
  let query = client
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (module) {
    query = query.eq('module', module)
  }

  const { data, error } = await query.limit(50)
  if (error) {
    console.error('Failed to fetch analyses:', error)
    return []
  }
  return data as Analysis[]
}
