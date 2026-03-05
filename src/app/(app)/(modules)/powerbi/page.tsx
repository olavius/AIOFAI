'use client'

import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResultDisplay } from '@/components/ui/ResultDisplay'
import { LoadingState } from '@/components/ui/LoadingState'
import { buildPowerBIPrompt } from '@/lib/prompts'
import type { PowerBIInput } from '@/types'

const SOURCE_SYSTEMS = [
  'SAP S/4HANA', 'SAP ECC', 'Oracle Fusion', 'Oracle EBS',
  'Microsoft Dynamics 365', 'NetSuite', 'Sage Intacct',
  'QuickBooks Enterprise', 'Xero', 'Workday Financials',
  'Salesforce', 'HubSpot', 'Snowflake', 'Azure Synapse',
  'SQL Server', 'PostgreSQL', 'MySQL', 'Databricks', 'Other',
]

const DOMAINS = [
  { value: 'Financial Reporting', desc: 'P&L, Balance Sheet, Cash Flow' },
  { value: 'FP&A', desc: 'Budgets, forecasts, variance analysis' },
  { value: 'Treasury', desc: 'Cash management, liquidity, FX' },
  { value: 'Procurement', desc: 'Spend analysis, supplier performance' },
  { value: 'Revenue', desc: 'Sales analytics, pipeline, ARR/MRR' },
  { value: 'HR & Workforce', desc: 'Headcount, compensation, turnover' },
  { value: 'Operations', desc: 'KPIs, productivity, capacity' },
  { value: 'Supply Chain', desc: 'Inventory, fulfilment, logistics' },
]

const EXAMPLE_QUESTIONS = [
  'What is our actual vs budget variance by cost centre and category?',
  'Which customers drive 80% of revenue and what is their trend?',
  'How is our working capital changing month over month?',
  'What is our headcount cost as a % of revenue by department?',
]

export default function PowerBIPage() {
  const [form, setForm] = useState<PowerBIInput>({
    sourceSystem: '',
    domain: '',
    businessQuestions: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ content: string; analysisId?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.sourceSystem || !form.domain || !form.businessQuestions.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const prompt = buildPowerBIPrompt(form)
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          module: 'powerbi',
          input: form,
          maxTokens: 6000,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate Power BI spec')
    } finally {
      setLoading(false)
    }
  }

  const isValid = form.sourceSystem && form.domain && form.businessQuestions.trim().length > 10

  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title="Power BI Designer"
        description="Generate production-ready DAX measures, star schema designs, and report specifications"
        badge="DAX + Star Schema"
      />

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        {/* Source system */}
        <div>
          <label className="label">Source System</label>
          <select
            value={form.sourceSystem}
            onChange={(e) => setForm((p) => ({ ...p, sourceSystem: e.target.value }))}
            className="input-field"
            required
          >
            <option value="">Select source system…</option>
            {SOURCE_SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Domain selector */}
        <div>
          <label className="label">Business Domain</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DOMAINS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, domain: d.value }))}
                className={`p-3 rounded-xl border text-left transition-all duration-150 ${
                  form.domain === d.value
                    ? 'bg-forest border-forestBright'
                    : 'bg-surface border-panel hover:border-forestMid'
                }`}
              >
                <p className={`text-sm font-medium ${form.domain === d.value ? 'text-cream' : 'text-cream/70'}`}>
                  {d.value}
                </p>
                <p className="text-xs text-cream/40 mt-0.5 leading-tight">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Business questions */}
        <div>
          <label className="label">
            Business Questions to Answer
            <span className="text-cream/40 font-normal ml-1.5">— what should the dashboard answer?</span>
          </label>
          <textarea
            value={form.businessQuestions}
            onChange={(e) => setForm((p) => ({ ...p, businessQuestions: e.target.value }))}
            className="input-field min-h-[120px] resize-y"
            placeholder="List the key questions your Power BI dashboard should answer…"
            required
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {EXAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setForm((p) => ({ ...p, businessQuestions: p.businessQuestions ? p.businessQuestions + '\n' + q : q }))}
                className="text-xs px-2.5 py-1 bg-panel hover:bg-forestMid/30 border border-panel hover:border-forestMid text-cream/50 hover:text-cream rounded-lg transition-all"
              >
                + {q.slice(0, 40)}…
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || loading}
          className="btn-primary"
        >
          <BarChart3 size={17} />
          Generate Power BI Specification
        </button>
      </form>

      {error && (
        <div className="card border-red-900/50 bg-red-950/30 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {loading && <LoadingState message="Designing your star schema and DAX library…" />}

      {result && !loading && (
        <ResultDisplay content={result.content} analysisId={result.analysisId} />
      )}
    </div>
  )
}
