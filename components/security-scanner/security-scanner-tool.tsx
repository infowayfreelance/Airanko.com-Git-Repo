'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Link2, FileText, ShieldCheck, AlertCircle, XCircle,
  RefreshCw, Download, ChevronDown, ExternalLink, Printer, ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScoreGauge, GradeBadge, AuditChecklist, IssuesAndFixes } from '@/components/mobile-checker/audit-ui'
import type { SecurityScannerResponse, SecurityScannerResult } from '@/app/api/security-scanner/route'
import type { Grade } from '@/lib/security-scanner/scan'

type Mode = 'single' | 'bulk'
type Stage = 'input' | 'analyzing' | 'results'
type SortKey = 'default' | 'score-asc' | 'score-desc'

const ANALYZING_MESSAGES = [
  'Fetching page and response headers…',
  'Scanning inline and linked scripts for exposed secrets…',
  'Checking for exposed .env, .git, and source map files…',
  'Checking JS library versions and information disclosure…',
]

const GRADE_ORDER: Grade[] = ['Excellent', 'Good', 'Needs Work', 'Poor']
const PDF_ROW_LIMIT = 25

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s.startsWith('http') ? s : `https://${s}`)
    return !!u.hostname && u.hostname.includes('.')
  } catch { return false }
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

export default function SecurityScannerTool() {
  const [mode, setMode] = useState<Mode>('single')
  const [singleInput, setSingleInput] = useState('')
  const [bulkInput, setBulkInput] = useState('')
  const [agreed, setAgreed] = useState(false)

  const [stage, setStage] = useState<Stage>('input')
  const [analyzingMsgIdx, setAnalyzingMsgIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<SecurityScannerResponse | null>(null)
  const [rows, setRows] = useState<SecurityScannerResult[]>([])

  const [gradeFilter, setGradeFilter] = useState<Grade | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const bulkUrls = useMemo(() => bulkInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean), [bulkInput])

  const canSubmit = useMemo(() => {
    if (!agreed) return false
    if (mode === 'single') return isValidUrl(singleInput.trim())
    return bulkUrls.length > 0
  }, [mode, singleInput, bulkUrls, agreed])

  const analyze = useCallback(async () => {
    if (!canSubmit) return
    setError(null)
    setStage('analyzing')
    setAnalyzingMsgIdx(0)
    const cycle = setInterval(() => setAnalyzingMsgIdx((i) => (i + 1) % ANALYZING_MESSAGES.length), 1600)

    const input = mode === 'single' ? singleInput : bulkInput

    try {
      const res = await fetch('/api/security-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Scan failed.')

      const response = data as SecurityScannerResponse
      clearInterval(cycle)
      setMeta(response)
      setRows(response.results)
      setExpanded(response.results.length <= 3 ? new Set(response.results.map((_, i) => i)) : new Set())
      setStage('results')
    } catch (err: unknown) {
      clearInterval(cycle)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStage('input')
    }
  }, [mode, singleInput, bulkInput, canSubmit])

  function reset() {
    setStage('input')
    setMeta(null)
    setRows([])
    setError(null)
    setExpanded(new Set())
  }

  function toggleExpand(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const visibleRows = useMemo(() => {
    let list = rows
    if (gradeFilter !== 'all') list = list.filter((r) => r.scan?.grade === gradeFilter)
    if (sortKey === 'score-asc') list = [...list].sort((a, b) => (a.scan?.score ?? -1) - (b.scan?.score ?? -1))
    if (sortKey === 'score-desc') list = [...list].sort((a, b) => (b.scan?.score ?? -1) - (a.scan?.score ?? -1))
    return list
  }, [rows, gradeFilter, sortKey])

  const summary = useMemo(() => {
    const successRows = rows.filter((r) => r.status === 'success' && r.scan)
    const avgScore = successRows.length === 0 ? 0 : Math.round(successRows.reduce((s, r) => s + (r.scan!.score), 0) / successRows.length)
    const byGrade: Record<Grade, number> = { Excellent: 0, Good: 0, 'Needs Work': 0, Poor: 0 }
    for (const r of successRows) byGrade[r.scan!.grade]++
    return { total: rows.length, errors: rows.filter((r) => r.status === 'error').length, avgScore, byGrade }
  }, [rows])

  function exportCsv() {
    const header = ['url', 'status', 'error', 'score', 'grade', 'passed', 'warnings', 'failed']
    const lines = [header.join(',')]
    for (const r of rows) {
      lines.push([
        csvEscape(r.url), r.status, csvEscape(r.error ?? ''),
        String(r.scan?.score ?? ''), r.scan?.grade ?? '',
        String(r.scan?.passCount ?? ''), String(r.scan?.warningCount ?? ''), String(r.scan?.failCount ?? ''),
      ].join(','))
    }
    downloadFile(lines.join('\n'), `security-scan-${Date.now()}.csv`, 'text/csv;charset=utf-8')
  }

  function exportJson() {
    downloadFile(JSON.stringify({ meta, rows }, null, 2), `security-scan-${Date.now()}.json`, 'application/json;charset=utf-8')
  }

  function downloadPdf() {
    if (visibleRows.length > 0 && visibleRows.length <= PDF_ROW_LIMIT) {
      const indices = visibleRows.map((r) => rows.indexOf(r))
      setExpanded((prev) => { const next = new Set(prev); for (const i of indices) next.add(i); return next })
      setTimeout(() => window.print(), 200)
    } else {
      window.print()
    }
  }

  // ── INPUT STAGE ────────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              Scan a site or a list of pages for the security issues that AI-generated ("vibe-coded") sites commonly ship with — hardcoded API keys, missing security headers, exposed .env/.git files, vulnerable JS libraries, and verbose error pages.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-2 shadow-sm sm:p-3">
            <div className="flex gap-1 rounded-2xl border border-border bg-muted/40 p-1">
              {([
                { id: 'single' as Mode, label: 'Single URL', icon: Link2 },
                { id: 'bulk' as Mode, label: 'Multiple URLs', icon: FileText },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all', mode === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              {mode === 'single' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Page URL</label>
                  <div className="relative mt-2">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url" value={singleInput} onChange={(e) => setSingleInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canSubmit && analyze()}
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {mode === 'bulk' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Page URLs</label>
                  <textarea
                    value={bulkInput} onChange={(e) => setBulkInput(e.target.value)}
                    placeholder={'https://example.com\nhttps://example.com/app\nhttps://example.com/dashboard'}
                    style={{ minHeight: '140px' }}
                    className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-[12px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-2 text-[11px] text-muted-foreground">{bulkUrls.length} URL{bulkUrls.length === 1 ? '' : 's'} detected · one per line, or comma-separated · up to 15 per scan</p>
                </div>
              )}

              <label className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-800">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 shrink-0" />
                <span>
                  I own this site, or have permission to test it. This scanner only performs passive, read-only checks (fetching public pages and a handful of well-known paths) — it never attempts to exploit, inject, or authenticate against anything.
                </span>
              </label>

              {error && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </p>
              )}

              <button
                onClick={analyze}
                disabled={!canSubmit}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShieldCheck className="h-4 w-4" /> Run Security Scan
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">Passive checks only — no exploitation, no injection, no authentication attempts.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── ANALYZING STAGE ────────────────────────────────────────────────────────
  if (stage === 'analyzing') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl py-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
              <ShieldAlert className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Running security scan…</h2>
          <p className="mt-2 text-sm text-muted-foreground">{ANALYZING_MESSAGES[analyzingMsgIdx]}</p>
          <p className="mt-1 text-xs text-muted-foreground">This can take up to a minute for multiple URLs.</p>
        </div>
      </section>
    )
  }

  // ── RESULTS STAGE ──────────────────────────────────────────────────────────
  if (!meta) return null

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 print:p-0">
      <div className="mx-auto max-w-6xl print:max-w-none">

        <div className="mb-6 hidden items-center gap-2 print:flex">
          <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-6 w-auto" />
          <span className="text-xs text-muted-foreground">Security Scan Report — generated {new Date().toLocaleString()}</span>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Security Scan Report</p>
            <h1 className="font-heading text-2xl font-bold text-foreground">{meta.totalReturned} page{meta.totalReturned === 1 ? '' : 's'} scanned</h1>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden" data-print-hide>
            <button onClick={downloadPdf} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Printer className="h-3.5 w-3.5" /> Download PDF
            </button>
            <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button onClick={exportJson} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> JSON
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <RefreshCw className="h-3.5 w-3.5" /> New Scan
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 print:break-inside-avoid">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="font-heading text-2xl font-bold tabular-nums text-foreground">{summary.total}</p>
            <p className="mt-0.5 text-xs font-semibold text-foreground">Pages</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="font-heading text-2xl font-bold tabular-nums text-foreground">{summary.avgScore}</p>
            <p className="mt-0.5 text-xs font-semibold text-foreground">Avg. score</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="font-heading text-2xl font-bold tabular-nums text-foreground">{summary.errors}</p>
            <p className="mt-0.5 text-xs font-semibold text-foreground">Fetch errors</p>
          </div>
          {GRADE_ORDER.map((g) => (
            <div key={g} className="rounded-2xl border border-border bg-card p-4 text-center">
              <p className="font-heading text-2xl font-bold tabular-nums text-foreground">{summary.byGrade[g]}</p>
              <p className="mt-0.5 text-xs font-semibold text-foreground">{g}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 print:hidden" data-print-hide>
          <label className="text-xs font-medium text-muted-foreground">Filter</label>
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value as Grade | 'all')} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none">
            <option value="all">All grades</option>
            {GRADE_ORDER.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">Sort by</label>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none">
              <option value="default">Default order</option>
              <option value="score-asc">Score (lowest first)</option>
              <option value="score-desc">Score (highest first)</option>
            </select>
          </div>
        </div>

        {/* Results list */}
        <div className="space-y-3">
          {visibleRows.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No rows match the current filter.</div>
          )}
          {visibleRows.map((r, i) => {
            const rowIndex = rows.indexOf(r)
            const isOpen = expanded.has(rowIndex)
            return (
              <div key={r.url + i} className="overflow-hidden rounded-2xl border border-border bg-card print:break-inside-avoid">
                <button onClick={() => toggleExpand(rowIndex)} className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/30 print:cursor-default">
                  {r.status === 'success' && r.scan ? (
                    <ScoreGauge score={r.scan.score} size="sm" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50">
                      <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-xs text-muted-foreground print:whitespace-normal print:break-all">{r.url}</span>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="shrink-0 text-muted-foreground hover:text-primary print:hidden">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {r.status === 'error' ? (
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-red-600"><XCircle className="h-3.5 w-3.5" /> {r.error}</p>
                    ) : r.scan ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <GradeBadge grade={r.scan.grade} />
                        <span className="text-xs text-muted-foreground">{r.scan.passCount} passed · {r.scan.warningCount} warnings · {r.scan.failCount} failed</span>
                      </div>
                    ) : null}
                  </div>
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform print:hidden', isOpen && 'rotate-180')} />
                </button>

                {isOpen && r.status === 'success' && r.scan && (
                  <div className="border-t border-border bg-muted/20 p-4">
                    <IssuesAndFixes checks={r.scan.checks} />
                    <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full checklist</p>
                    <AuditChecklist checks={r.scan.checks} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Every check is a passive, read-only inspection of what this site already serves publicly — response headers, page source, linked scripts, and a handful of well-known paths. No exploitation, no injection, no authentication attempts.
        </p>
      </div>
    </section>
  )
}
