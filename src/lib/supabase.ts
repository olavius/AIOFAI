import { createClient } from '@supabase/supabase-js'
import type { Analysis, Module } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getServiceClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
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
