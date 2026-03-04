'use client'

import { useState } from 'react'
import { Lightbulb, Plus, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResultDisplay } from '@/components/ui/ResultDisplay'
import { LoadingState } from '@/components/ui/LoadingState'
import { buildStrategyPrompt } from '@/lib/prompts'
import type { StrategyInput } from '@/types'

const INDUSTRIES = [
  'Technology', 'Financial Services', 'Healthcare', 'Manufacturing',
  'Retail & E-commerce', 'Energy & Utilities', 'Real Estate', 'Professional Services',
  'Consumer Goods', 'Logistics & Supply Chain', 'Education', 'Government',
]

const ROLES = [
  'CFO', 'VP Finance', 'Financial Controller', 'Head of FP&A',
  'Treasury Manager', 'Finance Director', 'Chief Accounting Officer',
]

const USE_CASE_OPTIONS = [
  'Automated Financial Reporting',
  'Cash Flow Forecasting',
  'Variance Analysis',
  'Budget Planning & Scenario Modeling',
  'Accounts Payable Automation',
  'Accounts Receivable Optimization',
  'Fraud Detection',
  'Tax Compliance',
  'Revenue Intelligence',
  'Cost Optimization',
  'M&A Due Diligence',
  'ESG Reporting',
]

export default function StrategyPage() {
  const [form, setForm] = useState<StrategyInput>({
    industry: '',
    role: '',
    useCases: [],
    challenge: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ content: string; analysisId?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggleUseCase = (uc: string) => {
    setForm((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(uc)
        ? prev.useCases.filter((u) => u !== uc)
        : [...prev.useCases, uc],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.industry || !form.role || !form.challenge) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const prompt = buildStrategyPrompt(form)
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          module: 'strategy',
          input: form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate strategy')
    } finally {
      setLoading(false)
    }
  }

  const isValid = form.industry && form.role && form.challenge.trim().length > 10

  return (
    <div>
      <PageHeader
        icon={Lightbulb}
        title="CFO Strategy"
        description="Generate a comprehensive AI strategy blueprint tailored to your industry, role, and challenges"
        badge="Strategic AI"
      />

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Industry</label>
            <select
              value={form.industry}
              onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Select your industry…</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Your Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Select your role…</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">
            Primary Challenge
            <span className="text-cream/40 font-normal ml-1.5">— what's the biggest finance problem you want to solve with AI?</span>
          </label>
          <textarea
            value={form.challenge}
            onChange={(e) => setForm((p) => ({ ...p, challenge: e.target.value }))}
            className="input-field min-h-[110px] resize-y"
            placeholder="e.g. Our month-end close takes 10 days and we lack real-time visibility into cash positions across our 12 subsidiaries…"
            required
            minLength={10}
          />
          <p className="text-cream/30 text-xs mt-1.5">{form.challenge.length} characters</p>
        </div>

        <div>
          <label className="label">
            AI Use Cases of Interest
            <span className="text-cream/40 font-normal ml-1.5">— select all that apply</span>
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {USE_CASE_OPTIONS.map((uc) => {
              const selected = form.useCases.includes(uc)
              return (
                <button
                  key={uc}
                  type="button"
                  onClick={() => toggleUseCase(uc)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                    selected
                      ? 'bg-forestBright/20 border border-forestBright text-forestBright'
                      : 'bg-panel border border-panel text-cream/60 hover:border-forestMid hover:text-cream'
                  }`}
                >
                  {selected ? <X size={12} /> : <Plus size={12} />}
                  {uc}
                </button>
              )
            })}
          </div>
          {form.useCases.length > 0 && (
            <p className="text-cream/40 text-xs mt-2">{form.useCases.length} selected</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || loading}
          className="btn-primary"
        >
          <Lightbulb size={17} />
          Generate Strategy Blueprint
        </button>
      </form>

      {error && (
        <div className="card border-red-900/50 bg-red-950/30 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {loading && <LoadingState message="Building your CFO strategy blueprint…" />}

      {result && !loading && (
        <ResultDisplay content={result.content} analysisId={result.analysisId} />
      )}
    </div>
  )
}
