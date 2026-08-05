'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Globe, Link2, FileText, Sparkles, AlertCircle, XCircle,
  RefreshCw, Download, ChevronDown, ExternalLink, Search, Printer,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScoreGauge, GradeBadge, AuditChecklist } from './audit-ui'
import type { MobileCheckerResponse, MobileCheckerResult, Mode } from '@/app/api/mobile-checker/route'
import type { Grade } from '@/lib/mobile-checker/audit'

type Stage = 'input' | 'analyzing' | 'results'
type SortKey = 'default' | 'score-asc' | 'score-desc'

const ANALYZING_MESSAGES = [
  'Discovering sitemap…',
  'Fetching pages (desktop + mobile user agents)…',
  'Running viewport, legibility & compatibility checks…',
  'Compiling mobile-friendliness scores…',
]

const PDF_ROW_LIMIT = 40

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

const GRADE_ORDER: Grade[] = ['Excellent', 'Good', 'Needs Work', 'Poor']

export default function MobileCheckerBulkAudit() {
  const [mode, setMode] = useState<Mode>('sitemap')
  const [siteInput, setSiteInput] = useState('')
  const [singleInput, setSingleInput] = useState('')
  const [bulkInput, setBulkInput] = useState('')
  const [limit, setLimit] = useState(50)

  const [stage, setStage] = useState<Stage>('input')
  const [analyzingMsgIdx, setAnalyzingMsgIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<MobileCheckerResponse | null>(null)
  const [rows, setRows] = useState<MobileCheckerResult[]>([])

  const [gradeFilter, setGradeFilter] = useState<Grade | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const bulkUrls = useMemo(() => bulkInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean), [bulkInput])

  const canSubmit = useMemo(() => {
    if (mode === 'sitemap') return isValidUrl(siteInput.trim())
    if (mode === 'single') return isValidUrl(singleInput.trim())
    return bulkUrls.length > 0
  }, [mode, siteInput, singleInput, bulkUrls])

  const analyze = useCallback(async () => {
    if (!canSubmit) return
    setError(null)
    setStage('analyzing')
    setAnalyzingMsgIdx(0)
    const cycle = setInterval(() => setAnalyzingMsgIdx((i) => (i + 1) % ANALYZING_MESSAGES.length), 1600)

    const input = mode === 'sitemap' ? siteInput : mode === 'single' ? singleInput : bulkInput

    try {
      const res = await fetch('/api/mobile-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input, limit }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed.')

      const response = data as MobileCheckerResponse
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
  }, [mode, siteInput, singleInput, bulkInput, limit, canSubmit])

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
    if (gradeFilter !== 'all') list = list.filter((r) => r.audit?.grade === gradeFilter)
    if (sortKey === 'score-asc') list = [...list].sort((a, b) => (a.audit?.score ?? -1) - (b.audit?.score ?? -1))
    if (sortKey === 'score-desc') list = [...list].sort((a, b) => (b.audit?.score ?? -1) - (a.audit?.score ?? -1))
    return list
  }, [rows, gradeFilter, sortKey])

  const summary = useMemo(() => {
    const successRows = rows.filter((r) => r.status === 'success' && r.audit)
    const avgScore = successRows.length === 0 ? 0 : Math.round(successRows.reduce((s, r) => s + (r.audit!.score), 0) / successRows.length)
    const byGrade: Record<Grade, number> = { Excellent: 0, Good: 0, 'Needs Work': 0, Poor: 0 }
    for (const r of successRows) byGrade[r.audit!.grade]++
    return { total: rows.length, errors: rows.filter((r) => r.status === 'error').length, avgScore, byGrade }
  }, [rows])

  function exportCsv() {
    const header = ['url', 'status', 'error', 'score', 'grade', 'passed', 'warnings', 'failed']
    const lines = [header.join(',')]
    for (const r of rows) {
      lines.push([
        csvEscape(r.url), r.status, csvEscape(r.error ?? ''),
        String(r.audit?.score ?? ''), r.audit?.grade ?? '',
        String(r.audit?.passCount ?? ''), String(r.audit?.warningCount ?? ''), String(r.audit?.failCount ?? ''),
      ].join(','))
    }
    downloadFile(lines.join('\n'), `mobile-audit-${Date.now()}.csv`, 'text/csv;charset=utf-8')
  }

  function exportJson() {
    downloadFile(JSON.stringify({ meta, rows }, null, 2), `mobile-audit-${Date.now()}.json`, 'application/json;charset=utf-8')
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

  // ── INPUT STAGE ───────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              Crawl a sitemap or paste a list of URLs to audit mobile-friendliness across your whole site at once — viewport configuration, font legibility, Flash/plugin detection, responsive images, and mobile-redirect consistency, scored and ranked.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-2 shadow-sm sm:p-3">
            <div className="flex gap-1 rounded-2xl border border-border bg-muted/40 p-1">
              {([
                { id: 'sitemap' as Mode, label: 'Website (Sitemap)', icon: Globe },
                { id: 'single' as Mode, label: 'Single URL', icon: Link2 },
                { id: 'bulk' as Mode, label: 'Multiple URLs', icon: FileText },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all', mode === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              {mode === 'sitemap' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Website URL</label>
                  <div className="relative mt-2">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url" value={siteInput} onChange={(e) => setSiteInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canSubmit && analyze()}
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">Max pages</label>
                    <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))} className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none">
                      {[25, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">We check robots.txt, then /sitemap.xml and /sitemap_index.xml (including nested sitemap indexes).</p>
                </div>
              )}

              {mode === 'single' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Page URL</label>
                  <div className="relative mt-2">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url" value={singleInput} onChange={(e) => setSingleInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canSubmit && analyze()}
                      placeholder="https://example.com/some-page"
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
                    placeholder={'https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3'}
                    style={{ minHeight: '160px' }}
                    className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-[12px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-2 text-[11px] text-muted-foreground">{bulkUrls.length} URL{bulkUrls.length === 1 ? '' : 's'} detected · one per line, or comma-separated</p>
                </div>
              )}

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
                <Sparkles className="h-4 w-4" /> Run Mobile Audit
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">Every check is measured from real fetched HTML — no external APIs, no fake scores.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── ANALYZING STAGE ───────────────────────────────────────────────────────
  if (stage === 'analyzing') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl py-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
              <Search className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Running mobile audit…</h2>
          <p className="mt-2 text-sm text-muted-foreground">{ANALYZING_MESSAGES[analyzingMsgIdx]}</p>
          <p className="mt-1 text-xs text-muted-foreground">Larger sitemaps can take up to a minute.</p>
        </div>
      </section>
    )
  }

  // ── RESULTS STAGE ─────────────────────────────────────────────────────────
  if (!meta) return null

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 print:p-0">
      <div className="mx-auto max-w-6xl print:max-w-none">

        <div className="mb-6 hidden items-center gap-2 print:flex">
          <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-6 w-auto" />
          <span className="text-xs text-muted-foreground">Mobile-Friendliness Audit Report — generated {new Date().toLocaleString()}</span>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mobile Audit Report</p>
            <h1 className="font-heading text-2xl font-bold text-foreground">{meta.totalReturned} page{meta.totalReturned === 1 ? '' : 's'} audited</h1>
            {meta.source && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Source: <span className="font-mono">{meta.source}</span>
                {meta.truncated && ` · showing ${meta.totalReturned} of ${meta.totalDiscovered} discovered URLs`}
              </p>
            )}
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
                  {r.status === 'success' && r.audit ? (
                    <ScoreGauge score={r.audit.score} size="sm" />
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
                    ) : r.audit ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <GradeBadge grade={r.audit.grade} />
                        <span className="text-xs text-muted-foreground">{r.audit.passCount} passed · {r.audit.warningCount} warnings · {r.audit.failCount} failed</span>
                      </div>
                    ) : null}
                  </div>
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform print:hidden', isOpen && 'rotate-180')} />
                </button>

                {isOpen && r.status === 'success' && r.audit && (
                  <div className="border-t border-border bg-muted/20 p-4">
                    <AuditChecklist checks={r.audit.checks} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Every check is measured directly from the fetched page&rsquo;s HTML, CSS, and response headers. Checks labeled &ldquo;estimated&rdquo; approximate something a full browser would need to render exactly — treat them as directional, not exact.
        </p>
      </div>
    </section>
  )
}
