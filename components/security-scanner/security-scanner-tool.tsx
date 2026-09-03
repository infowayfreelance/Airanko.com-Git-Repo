'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Link2, FileText, ShieldCheck, AlertCircle, XCircle,
  RefreshCw, Download, ChevronDown, ExternalLink, Printer, ShieldAlert,
  Files, Gauge, WifiOff, CheckCircle2, ThumbsUp, AlertTriangle, ShieldX,
  PartyPopper, Copy, Check, X, Wand2, FileDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScoreGauge, GradeBadge, AuditChecklist, IssuesAndFixes, scoreToHex } from '@/components/mobile-checker/audit-ui'
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

const GRADE_META: Record<Grade, { icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  Excellent: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Good: { icon: ThumbsUp, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  'Needs Work': { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  Poor: { icon: ShieldX, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
}

function StatTile({
  icon: Icon, value, label, color = 'text-foreground', colorHex, bg = 'bg-primary/10', border,
}: { icon: typeof CheckCircle2; value: string | number; label: string; color?: string; colorHex?: string; bg?: string; border?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-md', border ?? 'border-border')}>
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', bg)}>
        <Icon className={cn('h-4.5 w-4.5', colorHex ? undefined : color)} style={colorHex ? { color: colorHex } : undefined} />
      </div>
      <div>
        <p className={cn('font-heading text-2xl font-bold tabular-nums leading-none', colorHex ? undefined : color)} style={colorHex ? { color: colorHex } : undefined}>{value}</p>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
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

function severityLabel(weight: number): string {
  if (weight >= 20) return 'CRITICAL'
  if (weight >= 12) return 'HIGH'
  if (weight >= 6) return 'MEDIUM'
  return 'LOW'
}

interface AggregatedIssue {
  id: string
  name: string
  weight: number
  detail: string
  solution: string
  solutionCode?: string
  urls: string[]
}

/**
 * Builds a copy-pasteable prompt (for Cursor, Claude, ChatGPT, v0, etc.) that
 * fixes exactly the issues this scan found — not a generic "harden my site"
 * prompt. Issues that repeat across multiple scanned pages (e.g. a missing
 * CSP header) are deduplicated into one entry listing every affected URL,
 * so a 10-page scan with the same 3 issues everywhere produces a 3-item
 * prompt, not 30 near-duplicate entries.
 */
function buildFixPrompt(rows: SecurityScannerResult[]): { prompt: string; issueCount: number } {
  const map = new Map<string, AggregatedIssue>()
  for (const row of rows) {
    if (row.status !== 'success' || !row.scan) continue
    for (const check of row.scan.checks) {
      if ((check.status !== 'fail' && check.status !== 'warning') || !check.solution) continue
      const existing = map.get(check.id)
      if (existing) {
        if (!existing.urls.includes(row.url)) existing.urls.push(row.url)
      } else {
        map.set(check.id, { id: check.id, name: check.name, weight: check.weight, detail: check.detail, solution: check.solution, solutionCode: check.solutionCode, urls: [row.url] })
      }
    }
  }
  const issues = Array.from(map.values()).sort((a, b) => b.weight - a.weight)
  if (issues.length === 0) return { prompt: '', issueCount: 0 }

  const lines: string[] = []
  lines.push(`I run a website that was just scanned by Ai Ranko's Vibe Code Security Scanner. Please fix the following ${issues.length} security issue${issues.length === 1 ? '' : 's'} it found — nothing more, nothing less. This site may have been built quickly with an AI page builder, so read the actual code first rather than applying generic boilerplate fixes.`)
  lines.push('')
  lines.push('CRITICAL — do not break the site while fixing these:')
  lines.push('- Before changing or adding ANY security header, especially Content-Security-Policy, first inventory every external resource this site actually loads in production: embedded maps (Google Maps, Mapbox, etc.), analytics/tracking scripts, chat widgets, payment widgets, web fonts, video embeds, and any other third-party embeds or tracking "tags" — then explicitly allow-list each of their required origins in the policy.')
  lines.push('- A Content-Security-Policy that is too strict is one of the most common ways to silently break a working site: embedded maps stop loading, third-party widgets and analytics tags stop firing, and inline scripts/styles the site actually depends on get blocked — usually with no visible error to a normal visitor, only a warning in the browser devtools console.')
  lines.push('- After making each change below, reload every affected page yourself and check the browser devtools console for CSP violations, CORS errors, or blocked-resource warnings. Manually confirm that maps, embeds, forms, and any third-party widgets still load and function exactly as before.')
  lines.push('- Prefer the least disruptive fix that still resolves the issue (e.g. a scoped allow-list, or a nonce/hash-based CSP for inline scripts) over a blanket restrictive policy that disables functionality.')
  lines.push('- If fixing an issue would require removing or disabling a feature the site currently relies on, stop and ask me first instead of silently breaking it.')
  lines.push('')
  lines.push(`ISSUES TO FIX (${issues.length}):`)
  lines.push('')
  issues.forEach((issue, i) => {
    lines.push(`${i + 1}. [${severityLabel(issue.weight)}] ${issue.name}`)
    lines.push(`   Found on: ${issue.urls.join(', ')}`)
    lines.push(`   Problem: ${issue.detail}`)
    lines.push(`   Fix: ${issue.solution}`)
    if (issue.solutionCode) {
      lines.push('   Example:')
      for (const codeLine of issue.solutionCode.split('\n')) lines.push(`   ${codeLine}`)
    }
    lines.push('')
  })
  lines.push('After applying these fixes:')
  lines.push('- Re-test the site end-to-end (every affected page, not just the homepage) to confirm nothing broke.')
  lines.push('- Specifically re-check any embedded maps, third-party widgets, analytics, forms, and inline scripts/styles still load and work correctly.')
  lines.push('- Tell me exactly which issues you resolved, and flag anything you could not fix without more context from me.')

  return { prompt: lines.join('\n'), issueCount: issues.length }
}

function CopyPromptButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) }) }}
      className={cn('inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90', className)}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied!' : 'Copy Fix Prompt'}
    </button>
  )
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

  const [showPostScanModal, setShowPostScanModal] = useState(false)
  const modalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current)
    setStage('input')
    setMeta(null)
    setRows([])
    setError(null)
    setExpanded(new Set())
    setShowPostScanModal(false)
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

  const { prompt: fixPrompt, issueCount } = useMemo(() => buildFixPrompt(rows), [rows])

  useEffect(() => {
    if (stage !== 'results') return
    modalTimerRef.current = setTimeout(() => setShowPostScanModal(true), 2500)
    return () => { if (modalTimerRef.current) clearTimeout(modalTimerRef.current) }
  }, [stage, meta])

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
        <div className="mb-3 grid grid-cols-3 gap-3 print:break-inside-avoid">
          <StatTile icon={Files} value={summary.total} label="Pages" bg="bg-primary/10" color="text-primary" />
          <StatTile
            icon={Gauge} value={summary.avgScore} label="Avg. score"
            bg="bg-primary/10" colorHex={scoreToHex(summary.avgScore)}
          />
          <StatTile
            icon={WifiOff} value={summary.errors} label="Fetch errors"
            bg={summary.errors > 0 ? 'bg-red-50' : 'bg-muted'} color={summary.errors > 0 ? 'text-red-600' : 'text-muted-foreground'}
          />
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 print:break-inside-avoid">
          {GRADE_ORDER.map((g) => {
            const meta = GRADE_META[g]
            return (
              <StatTile key={g} icon={meta.icon} value={summary.byGrade[g]} label={g} color={meta.color} bg={meta.bg} border={meta.border} />
            )
          })}
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

      {showPostScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 print:hidden" data-print-hide onClick={() => setShowPostScanModal(false)}>
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                  issueCount > 0 ? 'bg-primary/10' : summary.errors > 0 ? 'bg-amber-100' : 'bg-emerald-100',
                )}>
                  {issueCount > 0
                    ? <Wand2 className="h-5 w-5 text-primary" />
                    : summary.errors > 0
                      ? <AlertTriangle className="h-5 w-5 text-amber-600" />
                      : <PartyPopper className="h-5 w-5 text-emerald-600" />}
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Scan complete</h2>
                  <p className="text-xs text-muted-foreground">
                    {issueCount > 0
                      ? `${issueCount} issue${issueCount === 1 ? '' : 's'} found across ${summary.total} page${summary.total === 1 ? '' : 's'} scanned.`
                      : summary.errors > 0
                        ? `No issues found on the ${summary.total - summary.errors} page${summary.total - summary.errors === 1 ? '' : 's'} we could check — but ${summary.errors} page${summary.errors === 1 ? '' : 's'} failed to load and ${summary.errors === 1 ? "wasn't" : "weren't"} actually scanned. Try again or check ${summary.errors === 1 ? 'that URL' : 'those URLs'} individually.`
                        : `No issues found across ${summary.total} page${summary.total === 1 ? '' : 's'} — nice work.`}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPostScanModal(false)} className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Download report</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={downloadPdf} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  <Printer className="h-3.5 w-3.5" /> PDF
                </button>
                <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  <FileDown className="h-3.5 w-3.5" /> CSV
                </button>
                <button onClick={exportJson} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  <FileDown className="h-3.5 w-3.5" /> JSON
                </button>
              </div>
            </div>

            {issueCount > 0 && (
              <div className="mt-6 border-t border-border pt-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Fix prompt — paste into Cursor, Claude, ChatGPT, or v0
                  </p>
                  <CopyPromptButton text={fixPrompt} />
                </div>
                <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
                  A ready-to-use prompt covering exactly the {issueCount} issue{issueCount === 1 ? '' : 's'} found above — including an explicit warning to your AI assistant not to break embedded maps, third-party widgets, or other functionality while applying security fixes like CSP headers.
                </p>
                <textarea
                  readOnly
                  value={fixPrompt}
                  rows={10}
                  className="w-full resize-y rounded-xl border border-border bg-muted/30 px-3.5 py-3 font-mono text-[11px] leading-relaxed text-foreground focus:border-primary focus:outline-none"
                  onFocus={(e) => e.target.select()}
                />
              </div>
            )}

            <button onClick={() => setShowPostScanModal(false)} className="mt-6 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Continue to full report
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
