'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileSpreadsheet, Upload, X, Table, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResultDisplay } from '@/components/ui/ResultDisplay'
import { LoadingState } from '@/components/ui/LoadingState'
import { buildExcelAnalysisPrompt } from '@/lib/prompts'
import type { ParsedFile, SheetData } from '@/types'

export default function ExcelIntakePage() {
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<{ content: string; analysisId?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setParsedFile(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setParsedFile(data)
      if (data.sheets.length > 0) {
        setExpandedSheet(data.sheets[0].name)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleAnalyze = async () => {
    if (!parsedFile) return
    setAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const prompt = buildExcelAnalysisPrompt(parsedFile.sheets, parsedFile.fileName)
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          module: 'excel-intake',
          input: { fileName: parsedFile.fileName, sheets: parsedFile.sheets.map((s) => s.name) },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const totalRows = parsedFile?.sheets.reduce((sum, s) => sum + s.rowCount, 0) ?? 0

  return (
    <div>
      <PageHeader
        icon={FileSpreadsheet}
        title="Excel Intake"
        description="Upload financial spreadsheets for AI-powered structural analysis and CFO insights"
        badge="SheetJS + Claude"
      />

      {/* Upload zone */}
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-forestBright bg-forest/30'
              : parsedFile
                ? 'border-forestMid bg-forest/10'
                : 'border-panel hover:border-forestMid hover:bg-panel/50'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 spinner" />
              <p className="text-cream/60">Parsing file…</p>
            </div>
          ) : parsedFile ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-forest border border-forestMid flex items-center justify-center">
                <FileSpreadsheet size={22} className="text-forestBright" />
              </div>
              <div>
                <p className="text-cream font-medium">{parsedFile.fileName}</p>
                <p className="text-cream/50 text-sm mt-0.5">
                  {parsedFile.sheets.length} sheet{parsedFile.sheets.length !== 1 ? 's' : ''} · {totalRows.toLocaleString()} rows
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setParsedFile(null); setResult(null) }}
                className="flex items-center gap-1.5 text-cream/40 hover:text-cream/70 text-xs mt-1"
              >
                <X size={13} /> Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-panel flex items-center justify-center">
                <Upload size={22} className="text-cream/40" />
              </div>
              <div>
                <p className="text-cream/80 font-medium">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-cream/40 text-sm mt-1">Excel (.xlsx, .xls) or CSV · Max 10MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sheet preview */}
      {parsedFile && parsedFile.sheets.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-medium text-cream/60 uppercase tracking-wider">Sheet Preview</h2>
          {parsedFile.sheets.map((sheet) => (
            <SheetPreview
              key={sheet.name}
              sheet={sheet}
              expanded={expandedSheet === sheet.name}
              onToggle={() => setExpandedSheet(expandedSheet === sheet.name ? null : sheet.name)}
            />
          ))}
        </div>
      )}

      {/* Analyze button */}
      {parsedFile && !analyzing && (
        <button onClick={handleAnalyze} className="btn-primary mb-6">
          <FileSpreadsheet size={17} />
          Analyze with Claude AI
        </button>
      )}

      {error && (
        <div className="card border-red-900/50 bg-red-950/30 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {analyzing && <LoadingState message="Claude is analyzing your spreadsheet structure…" />}

      {result && !analyzing && (
        <ResultDisplay content={result.content} analysisId={result.analysisId} />
      )}
    </div>
  )
}

function SheetPreview({ sheet, expanded, onToggle }: { sheet: SheetData; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-panel/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Table size={16} className="text-forestBright shrink-0" />
          <div className="text-left">
            <span className="text-cream font-medium text-sm">{sheet.name}</span>
            <span className="text-cream/40 text-xs ml-3">{sheet.rowCount.toLocaleString()} rows · {sheet.headers.length} columns</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-cream/40" /> : <ChevronDown size={16} className="text-cream/40" />}
      </button>

      {expanded && sheet.headers.length > 0 && (
        <div className="border-t border-panel overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-forest/40">
                {sheet.headers.slice(0, 8).map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left text-gold/80 font-medium whitespace-nowrap">
                    {h || `Col ${i + 1}`}
                  </th>
                ))}
                {sheet.headers.length > 8 && (
                  <th className="px-3 py-2 text-left text-cream/30">+{sheet.headers.length - 8} more</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sheet.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-panel/60 hover:bg-panel/30">
                  {sheet.headers.slice(0, 8).map((h, ci) => (
                    <td key={ci} className="px-3 py-2 text-cream/70 whitespace-nowrap max-w-32 truncate">
                      {row[h] != null ? String(row[h]) : <span className="text-cream/20">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
