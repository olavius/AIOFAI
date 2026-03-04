'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResultDisplay } from '@/components/ui/ResultDisplay'
import { LoadingState } from '@/components/ui/LoadingState'
import { buildAutomatePrompt } from '@/lib/prompts'
import type { AutomateInput, AutomateMode } from '@/types'
import { cn } from '@/lib/utils'

const MODES: { value: AutomateMode; label: string; desc: string; icon: string }[] = [
  {
    value: 'executive',
    label: 'Executive',
    desc: 'ROI-focused summary with strategic implications',
    icon: '◈',
  },
  {
    value: 'operational',
    label: 'Operational',
    desc: 'Step-by-step workflow and system integrations',
    icon: '⟳',
  },
  {
    value: 'technical',
    label: 'Technical',
    desc: 'Code patterns, APIs, and pipeline architecture',
    icon: '</>',
  },
]

const EXAMPLES = [
  'Monthly management accounts consolidation across 8 entities in different currencies',
  'Weekly cash flow forecast pulling from ERP, banking APIs, and AR aging reports',
  'Automated Board pack assembly from Power BI, Excel models, and commentary templates',
  'Daily P&L flash report distributed to regional controllers at 7am',
]

export default function AutomatePage() {
  const [form, setForm] = useState<AutomateInput>({
    reportDescription: '',
    mode: 'operational',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ content: string; analysisId?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.reportDescription.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const prompt = buildAutomatePrompt(form)
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          module: 'automate',
          input: form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blueprint')
    } finally {
      setLoading(false)
    }
  }

  const isValid = form.reportDescription.trim().length > 15

  return (
    <div>
      <PageHeader
        icon={Zap}
        title="Automate"
        description="Describe any financial report or process and get a detailed automation blueprint"
        badge="3 Output Modes"
      />

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        {/* Output mode selector */}
        <div>
          <label className="label">Blueprint Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, mode: mode.value }))}
                className={cn(
                  'flex flex-col gap-2 p-4 rounded-xl border text-left transition-all duration-150',
                  form.mode === mode.value
                    ? 'bg-forest border-forestBright shadow-lg shadow-forest/30'
                    : 'bg-surface border-panel hover:border-forestMid',
                )}
              >
                <span className={cn('font-mono text-lg', form.mode === mode.value ? 'text-gold' : 'text-cream/40')}>
                  {mode.icon}
                </span>
                <div>
                  <p className={cn('font-semibold text-sm', form.mode === mode.value ? 'text-cream' : 'text-cream/70')}>
                    {mode.label}
                  </p>
                  <p className="text-cream/40 text-xs mt-0.5">{mode.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">
            Report / Process Description
          </label>
          <textarea
            value={form.reportDescription}
            onChange={(e) => setForm((p) => ({ ...p, reportDescription: e.target.value }))}
            className="input-field min-h-[130px] resize-y"
            placeholder="Describe the report or process you want to automate…"
            required
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-cream/30 text-xs">{form.reportDescription.length} chars</p>
            <p className="text-cream/30 text-xs">Try an example →</p>
          </div>
        </div>

        {/* Example prompts */}
        <div>
          <p className="text-xs text-cream/40 mb-2 font-medium uppercase tracking-wider">Quick Examples</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setForm((p) => ({ ...p, reportDescription: ex }))}
                className="text-left px-3 py-2.5 rounded-lg bg-panel hover:bg-forest/40 border border-panel hover:border-forestMid text-cream/60 hover:text-cream text-xs transition-all duration-150"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || loading}
          className="btn-primary"
        >
          <Zap size={17} />
          Generate Automation Blueprint
        </button>
      </form>

      {error && (
        <div className="card border-red-900/50 bg-red-950/30 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {loading && <LoadingState message="Designing your automation blueprint…" />}

      {result && !loading && (
        <ResultDisplay content={result.content} analysisId={result.analysisId} />
      )}
    </div>
  )
}
