'use client'

import { useState } from 'react'
import { Wand2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResultDisplay } from '@/components/ui/ResultDisplay'
import { LoadingState } from '@/components/ui/LoadingState'
import { buildWizardPrompt } from '@/lib/prompts'
import { cn } from '@/lib/utils'
import type { WizardState, MetricType, MetricFrequency, MetricAudience } from '@/types'

// Step data
const METRIC_TYPES: { value: MetricType; label: string; desc: string; icon: string }[] = [
  { value: 'financial', label: 'Financial', desc: 'Revenue, margins, cost, cash', icon: '💰' },
  { value: 'operational', label: 'Operational', desc: 'Efficiency, productivity, quality', icon: '⚙️' },
  { value: 'strategic', label: 'Strategic', desc: 'Growth, market share, innovation', icon: '🎯' },
  { value: 'customer', label: 'Customer', desc: 'NPS, retention, LTV, satisfaction', icon: '🤝' },
]

const DOMAINS: Record<MetricType, string[]> = {
  financial: [
    'Revenue & Growth', 'Cost Management', 'Cash Flow & Liquidity',
    'Profitability', 'Working Capital', 'Capital Structure',
  ],
  operational: [
    'Finance Operations', 'Order-to-Cash', 'Procure-to-Pay',
    'Record-to-Report', 'Manufacturing', 'Logistics',
  ],
  strategic: [
    'Market Position', 'Innovation Pipeline', 'M&A Activity',
    'ESG & Sustainability', 'Digital Transformation', 'Talent Strategy',
  ],
  customer: [
    'Customer Acquisition', 'Customer Retention', 'Customer Lifetime Value',
    'Service Quality', 'Net Promoter Score', 'Product Adoption',
  ],
}

const FREQUENCIES: { value: MetricFrequency; label: string; desc: string }[] = [
  { value: 'daily', label: 'Daily', desc: 'Real-time operational tracking' },
  { value: 'weekly', label: 'Weekly', desc: 'Management rhythm alignment' },
  { value: 'monthly', label: 'Monthly', desc: 'Period-end reporting cadence' },
  { value: 'quarterly', label: 'Quarterly', desc: 'Board and investor reporting' },
  { value: 'annual', label: 'Annual', desc: 'Strategic planning cycle' },
]

const AUDIENCES: { value: MetricAudience; label: string; desc: string }[] = [
  { value: 'board', label: 'Board', desc: 'Directors, non-executives, investors' },
  { value: 'executive', label: 'Executive', desc: 'CEO, CFO, C-suite leadership' },
  { value: 'management', label: 'Management', desc: 'VPs, directors, department heads' },
  { value: 'operational', label: 'Operational', desc: 'Analysts, managers, team leads' },
]

const STEP_LABELS = ['Metric Type', 'Domain', 'Frequency', 'Audience']

export default function WizardPage() {
  const [state, setState] = useState<WizardState>({
    step: 1,
    metricType: '',
    domain: '',
    frequency: '',
    audience: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ content: string; analysisId?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canNext = () => {
    if (state.step === 1) return !!state.metricType
    if (state.step === 2) return !!state.domain
    if (state.step === 3) return !!state.frequency
    if (state.step === 4) return !!state.audience
    return false
  }

  const handleNext = () => {
    if (state.step < 4) setState((p) => ({ ...p, step: (p.step + 1) as WizardState['step'] }))
  }

  const handleBack = () => {
    if (state.step > 1) setState((p) => ({ ...p, step: (p.step - 1) as WizardState['step'] }))
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const prompt = buildWizardPrompt(state)
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          module: 'wizard',
          input: state,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate specification')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setState({ step: 1, metricType: '', domain: '', frequency: '', audience: '' })
    setResult(null)
    setError(null)
  }

  return (
    <div>
      <PageHeader
        icon={Wand2}
        title="Metric Wizard"
        description="Define any KPI in 4 steps and get a complete, production-ready metric specification"
        badge="4-Step Wizard"
      />

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1
            const isComplete = state.step > stepNum
            const isActive = state.step === stepNum
            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
                    isComplete ? 'bg-forestBright border-forestBright text-cream' :
                    isActive ? 'bg-forest border-forestBright text-cream' :
                    'bg-surface border-panel text-cream/30',
                  )}>
                    {isComplete ? <Check size={14} /> : stepNum}
                  </div>
                  <span className={cn('text-xs mt-1.5 hidden sm:block', isActive ? 'text-cream' : 'text-cream/40')}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={cn(
                    'h-0.5 flex-1 mx-1 -mt-4 sm:-mt-5 transition-all',
                    state.step > stepNum ? 'bg-forestBright' : 'bg-panel',
                  )} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      {!result && !loading && (
        <div className="card mb-6 animate-fade-in">
          {state.step === 1 && (
            <StepContent title="What type of metric do you need?">
              <div className="grid grid-cols-2 gap-3">
                {METRIC_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setState((p) => ({ ...p, metricType: t.value }))}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all',
                      state.metricType === t.value ? 'bg-forest border-forestBright' : 'bg-panel border-panel hover:border-forestMid',
                    )}
                  >
                    <span className="text-2xl mb-2 block">{t.icon}</span>
                    <p className={cn('font-semibold text-sm', state.metricType === t.value ? 'text-cream' : 'text-cream/80')}>
                      {t.label}
                    </p>
                    <p className="text-cream/40 text-xs mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </StepContent>
          )}

          {state.step === 2 && state.metricType && (
            <StepContent title="Which business domain?">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DOMAINS[state.metricType].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setState((p) => ({ ...p, domain: d }))}
                    className={cn(
                      'px-4 py-3 rounded-xl border text-left transition-all text-sm',
                      state.domain === d ? 'bg-forest border-forestBright text-cream' : 'bg-panel border-panel hover:border-forestMid text-cream/70 hover:text-cream',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </StepContent>
          )}

          {state.step === 3 && (
            <StepContent title="Reporting frequency?">
              <div className="space-y-2.5">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setState((p) => ({ ...p, frequency: f.value }))}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all',
                      state.frequency === f.value ? 'bg-forest border-forestBright' : 'bg-panel border-panel hover:border-forestMid',
                    )}
                  >
                    <div>
                      <p className={cn('font-medium text-sm', state.frequency === f.value ? 'text-cream' : 'text-cream/80')}>
                        {f.label}
                      </p>
                      <p className="text-cream/40 text-xs mt-0.5">{f.desc}</p>
                    </div>
                    {state.frequency === f.value && <Check size={16} className="text-forestBright" />}
                  </button>
                ))}
              </div>
            </StepContent>
          )}

          {state.step === 4 && (
            <StepContent title="Primary audience?">
              <div className="grid grid-cols-2 gap-3">
                {AUDIENCES.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setState((p) => ({ ...p, audience: a.value }))}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all',
                      state.audience === a.value ? 'bg-forest border-forestBright' : 'bg-panel border-panel hover:border-forestMid',
                    )}
                  >
                    <p className={cn('font-semibold text-sm', state.audience === a.value ? 'text-cream' : 'text-cream/80')}>
                      {a.label}
                    </p>
                    <p className="text-cream/40 text-xs mt-0.5">{a.desc}</p>
                  </button>
                ))}
              </div>
            </StepContent>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-panel">
            <button
              onClick={handleBack}
              disabled={state.step === 1}
              className="btn-ghost disabled:opacity-30"
            >
              <ChevronLeft size={17} />
              Back
            </button>

            {state.step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canNext()}
                className="btn-primary"
              >
                Next
                <ChevronRight size={17} />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!canNext()}
                className="btn-primary"
              >
                <Wand2 size={17} />
                Generate Metric Spec
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary before generate */}
      {state.step === 4 && !result && !loading && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: 'Type', value: state.metricType },
            { label: 'Domain', value: state.domain },
            { label: 'Frequency', value: state.frequency },
          ].filter((s) => s.value).map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 bg-forest border border-forestMid rounded-lg px-3 py-1.5">
              <span className="text-cream/40 text-xs">{s.label}:</span>
              <span className="text-cream text-xs font-medium capitalize">{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="card border-red-900/50 bg-red-950/30 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {loading && <LoadingState message="Generating your metric specification…" />}

      {result && !loading && (
        <div>
          <ResultDisplay content={result.content} analysisId={result.analysisId} />
          <button onClick={reset} className="btn-secondary mt-6">
            <Wand2 size={16} />
            Create Another Metric
          </button>
        </div>
      )}
    </div>
  )
}

function StepContent({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-cream mb-4">{title}</h2>
      {children}
    </div>
  )
}
