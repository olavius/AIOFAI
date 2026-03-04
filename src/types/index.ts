export type Module =
  | 'excel-intake'
  | 'strategy'
  | 'automate'
  | 'powerbi'
  | 'sandbox'
  | 'wizard'

export interface Analysis {
  id: string
  user_id: string
  module: Module
  input: Record<string, unknown>
  output: string
  created_at: string
}

export interface SheetData {
  name: string
  headers: string[]
  rows: Record<string, unknown>[]
  rowCount: number
}

export interface ParsedFile {
  fileName: string
  sheets: SheetData[]
}

export interface ClaudeRequest {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
}

export interface ClaudeResponse {
  content: string
  analysisId?: string
}

// Strategy module
export interface StrategyInput {
  industry: string
  role: string
  useCases: string[]
  challenge: string
}

// Automate module
export type AutomateMode = 'executive' | 'operational' | 'technical'

export interface AutomateInput {
  reportDescription: string
  mode: AutomateMode
}

// PowerBI module
export interface PowerBIInput {
  sourceSystem: string
  domain: string
  businessQuestions: string
}

// Wizard module
export type MetricType = 'financial' | 'operational' | 'strategic' | 'customer'
export type MetricFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
export type MetricAudience = 'board' | 'executive' | 'management' | 'operational'

export interface WizardState {
  step: 1 | 2 | 3 | 4
  metricType: MetricType | ''
  domain: string
  frequency: MetricFrequency | ''
  audience: MetricAudience | ''
}

// Sandbox module
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
