'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Globe, Link2, FileText, Ruler, Sparkles, AlertCircle, CheckCircle2,
  AlertTriangle, XCircle, RefreshCw, Loader2, Download, ChevronDown,
  Monitor, Smartphone, ExternalLink, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PIXEL_LIMITS, pixelStatus, type PixelStatus } from '@/lib/meta-pixel/limits'
import { measureTextWidth, truncateToPixelWidth } from '@/lib/meta-pixel/measure'
import type { MetaPixelCheckerResponse, MetaPixelResult, Mode } from '@/app/api/meta-pixel-checker/route'

type Stage = 'input' | 'analyzing' | 'results'
type SortKey = 'default' | 'title-desktop-desc' | 'description-desktop-desc'

interface RowMeasurements {
  titleDesktopPx: number
  titleMobilePx: number
  descDesktopPx: number
  descMobilePx: number
  titleDesktopStatus: PixelStatus
  titleMobileStatus: PixelStatus
  descDesktopStatus: PixelStatus
  descMobileStatus: PixelStatus
}

interface Row extends MetaPixelResult {
  m: RowMeasurements | null
}

const STATUS_STYLE: Record<PixelStatus, string> = {
  good: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  over: 'bg-red-100 text-red-700 border-red-200',
}
const STATUS_LABEL: Record<PixelStatus, string> = { good: 'Good', warning: 'Near limit', over: 'Too long' }
const STATUS_ICON: Record<PixelStatus, React.ComponentType<{ className?: string }>> = {
  good: CheckCircle2, warning: AlertTriangle, over: XCircle,
}

const ANALYZING_MESSAGES = [
  'Discovering sitemap…',
  'Fetching pages…',
  'Extracting meta titles & descriptions…',
  'Measuring pixel widths for desktop & mobile…',
]

function measureRow(title: string | null, description: string | null): RowMeasurements {
  const titleDesktopPx = title ? measureTextWidth(title, PIXEL_LIMITS.desktop.title.font) : 0
  const titleMobilePx = title ? measureTextWidth(title, PIXEL_LIMITS.mobile.title.font) : 0
  const descDesktopPx = description ? measureTextWidth(description, PIXEL_LIMITS.desktop.description.font) : 0
  const descMobilePx = description ? measureTextWidth(description, PIXEL_LIMITS.mobile.description.font) : 0
  return {
    titleDesktopPx, titleMobilePx, descDesktopPx, descMobilePx,
    titleDesktopStatus: pixelStatus(titleDesktopPx, PIXEL_LIMITS.desktop.title),
    titleMobileStatus: pixelStatus(titleMobilePx, PIXEL_LIMITS.mobile.title),
    descDesktopStatus: pixelStatus(descDesktopPx, PIXEL_LIMITS.desktop.description),
    descMobileStatus: pixelStatus(descMobilePx, PIXEL_LIMITS.mobile.description),
  }
}

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

// ── Sub-components ──────────────────────────────────────────────────────────

function PixelBadge({ px, limit, status }: { px: number; limit: number; status: PixelStatus }) {
  const Icon = STATUS_ICON[status]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold tabular-nums', STATUS_STYLE[status])}>
      <Icon className="h-3 w-3" />
      {Math.round(px)}px <span className="opacity-60">/ {limit}px</span>
    </span>
  )
}

function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="font-heading text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-foreground">{label}</p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function SerpPreview({ url, title, description, device }: { url: string; title: string | null; description: string | null; device: 'desktop' | 'mobile' }) {
  const titleLimit = PIXEL_LIMITS[device].title
  const descLimit = PIXEL_LIMITS[device].description
  const displayTitle = title ? truncateToPixelWidth(title, titleLimit.font, titleLimit.maxPx) : '(missing title)'
  const displayDesc = description ? truncateToPixelWidth(description, descLimit.font, descLimit.maxPx) : '(missing description)'
  let breadcrumb = url
  try {
    const u = new URL(url)
    breadcrumb = `${u.hostname}${u.pathname !== '/' ? ' › ' + u.pathname.split('/').filter(Boolean).join(' › ') : ''}`
  } catch { /* keep raw url */ }

  return (
    <div className={cn('rounded-xl border border-border bg-white p-4', device === 'mobile' && 'max-w-[380px]')}>
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {device === 'desktop' ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
        {device === 'desktop' ? 'Desktop' : 'Mobile'} preview
      </p>
      <p className="truncate text-xs text-[#4d5156]">{breadcrumb}</p>
      <p className="mt-0.5 truncate text-[#1a0dab]" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: device === 'desktop' ? '20px' : '18px', lineHeight: 1.3 }}>
        {displayTitle}
      </p>
      <p className="mt-1 text-[#4d5156]" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: 1.4 }}>
        {displayDesc}
      </p>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function MetaPixelCheckerTool() {
  const [mode, setMode] = useState<Mode>('sitemap')
  const [siteInput, setSiteInput] = useState('')
  const [singleInput, setSingleInput] = useState('')
  const [bulkInput, setBulkInput] = useState('')
  const [limit, setLimit] = useState(50)

  const [stage, setStage] = useState<Stage>('input')
  const [analyzingMsgIdx, setAnalyzingMsgIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<MetaPixelCheckerResponse | null>(null)
  const [rows, setRows] = useState<Row[]>([])

  const [showIssuesOnly, setShowIssuesOnly] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const bulkUrls = useMemo(
    () => bulkInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean),
    [bulkInput],
  )

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
    const cycle = setInterval(() => setAnalyzingMsgIdx((i) => (i + 1) % ANALYZING_MESSAGES.length), 1400)

    const input = mode === 'sitemap' ? siteInput : mode === 'single' ? singleInput : bulkInput

    try {
      const res = await fetch('/api/meta-pixel-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input, limit }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed.')

      const response = data as MetaPixelCheckerResponse
      const measuredRows: Row[] = response.results.map((r) => ({
        ...r,
        m: r.status === 'success' ? measureRow(r.title, r.description) : null,
      }))

      clearInterval(cycle)
      setMeta(response)
      setRows(measuredRows)
      setExpanded(new Set())
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

  const visibleRows = useMemo(() => {
    let list = rows
    if (showIssuesOnly) {
      list = list.filter((r) => r.status === 'error' || (r.m && (
        r.m.titleDesktopStatus !== 'good' || r.m.titleMobileStatus !== 'good' ||
        r.m.descDesktopStatus !== 'good' || r.m.descMobileStatus !== 'good'
      )))
    }
    if (sortKey === 'title-desktop-desc') list = [...list].sort((a, b) => (b.m?.titleDesktopPx ?? -1) - (a.m?.titleDesktopPx ?? -1))
    if (sortKey === 'description-desktop-desc') list = [...list].sort((a, b) => (b.m?.descDesktopPx ?? -1) - (a.m?.descDesktopPx ?? -1))
    return list
  }, [rows, showIssuesOnly, sortKey])

  const summary = useMemo(() => {
    const successRows = rows.filter((r) => r.status === 'success' && r.m)
    const count = (pick: (m: RowMeasurements) => PixelStatus) =>
      successRows.filter((r) => pick(r.m!) !== 'good').length
    return {
      total: rows.length,
      errors: rows.filter((r) => r.status === 'error').length,
      titleDesktopIssues: count((m) => m.titleDesktopStatus),
      titleMobileIssues: count((m) => m.titleMobileStatus),
      descDesktopIssues: count((m) => m.descDesktopStatus),
      descMobileIssues: count((m) => m.descMobileStatus),
      missingTitle: rows.filter((r) => r.status === 'success' && !r.title).length,
      missingDescription: rows.filter((r) => r.status === 'success' && !r.description).length,
    }
  }, [rows])

  function exportCsv() {
    const header = ['url', 'status', 'error', 'title', 'title_chars', 'title_px_desktop', 'title_px_mobile', 'description', 'description_chars', 'description_px_desktop', 'description_px_mobile']
    const lines = [header.join(',')]
    for (const r of rows) {
      lines.push([
        csvEscape(r.url),
        r.status,
        csvEscape(r.error ?? ''),
        csvEscape(r.title ?? ''),
        String(r.title?.length ?? 0),
        String(Math.round(r.m?.titleDesktopPx ?? 0)),
        String(Math.round(r.m?.titleMobilePx ?? 0)),
        csvEscape(r.description ?? ''),
        String(r.description?.length ?? 0),
        String(Math.round(r.m?.descDesktopPx ?? 0)),
        String(Math.round(r.m?.descMobilePx ?? 0)),
      ].join(','))
    }
    downloadFile(lines.join('\n'), `meta-pixel-checker-${Date.now()}.csv`, 'text/csv;charset=utf-8')
  }

  function exportJson() {
    downloadFile(JSON.stringify({ meta, rows }, null, 2), `meta-pixel-checker-${Date.now()}.json`, 'application/json;charset=utf-8')
  }

  function toggleExpand(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  // ── INPUT STAGE ───────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Ruler className="h-3 w-3" />
              Bulk pixel-width checker · Desktop &amp; mobile · Sitemap-aware
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Meta Title &amp; Description Pixel Checker
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              Give us a website and we&rsquo;ll crawl its sitemap.xml, fetch every page, and measure the real rendered pixel width of every title and meta description for both Google desktop and mobile SERPs — in bulk. Or check a single URL or a pasted list.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Globe, label: 'Sitemap crawl' },
              { icon: Monitor, label: 'Desktop pixels' },
              { icon: Smartphone, label: 'Mobile pixels' },
              { icon: Download, label: 'CSV / JSON export' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <f.icon className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-card p-2 shadow-sm sm:p-3">
            <div className="flex gap-1 rounded-2xl border border-border bg-muted/40 p-1">
              {([
                { id: 'sitemap' as Mode, label: 'Website (Sitemap)', icon: Globe },
                { id: 'single' as Mode,  label: 'Single URL',        icon: Link2 },
                { id: 'bulk' as Mode,    label: 'Multiple URLs',     icon: FileText },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                    mode === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
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
                      type="url"
                      value={siteInput}
                      onChange={(e) => setSiteInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canSubmit && analyze()}
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">Max pages</label>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      {[25, 50, 100, 200, 300].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    We check robots.txt, then /sitemap.xml and /sitemap_index.xml (including nested sitemap indexes).
                  </p>
                </div>
              )}

              {mode === 'single' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Page URL</label>
                  <div className="relative mt-2">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url"
                      value={singleInput}
                      onChange={(e) => setSingleInput(e.target.value)}
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
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder={'https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3'}
                    style={{ minHeight: '180px' }}
                    className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-[12px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {bulkUrls.length} URL{bulkUrls.length === 1 ? '' : 's'} detected · one per line, or comma-separated
                  </p>
                </div>
              )}

              {error && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <button
                onClick={analyze}
                disabled={!canSubmit}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                Check Pixel Widths
              </button>

              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Pixel limits are industry-standard estimates (Google publishes no official spec) — treat them as directional guidance.
              </p>
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
              <Ruler className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Measuring pixel widths…</h2>
          <p className="mt-2 text-sm text-muted-foreground">{ANALYZING_MESSAGES[analyzingMsgIdx]}</p>
          <p className="mt-1 text-xs text-muted-foreground">Larger sitemaps can take up to a minute.</p>
        </div>
      </section>
    )
  }

  // ── RESULTS STAGE ─────────────────────────────────────────────────────────
  if (!meta) return null

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pixel Width Report</p>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {meta.totalReturned} page{meta.totalReturned === 1 ? '' : 's'} analyzed
            </h1>
            {meta.source && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Source: <span className="font-mono">{meta.source}</span>
                {meta.truncated && ` · showing ${meta.totalReturned} of ${meta.totalDiscovered} discovered URLs`}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
            <button onClick={exportJson} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" />
              JSON
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <RefreshCw className="h-3.5 w-3.5" />
              New Scan
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <StatTile label="Pages" value={summary.total} />
          <StatTile label="Fetch errors" value={summary.errors} />
          <StatTile label="Title too long (desktop)" value={summary.titleDesktopIssues} />
          <StatTile label="Title too long (mobile)" value={summary.titleMobileIssues} />
          <StatTile label="Desc. too long (desktop)" value={summary.descDesktopIssues} />
          <StatTile label="Desc. too long (mobile)" value={summary.descMobileIssues} />
          <StatTile label="Missing title / desc." value={`${summary.missingTitle} / ${summary.missingDescription}`} />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" checked={showIssuesOnly} onChange={(e) => setShowIssuesOnly(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
            Show only issues
          </label>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">Sort by</label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="default">Default order</option>
              <option value="title-desktop-desc">Title width (desktop, longest first)</option>
              <option value="description-desktop-desc">Description width (desktop, longest first)</option>
            </select>
          </div>
        </div>

        {/* Results list */}
        <div className="space-y-3">
          {visibleRows.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No rows match the current filter.
            </div>
          )}
          {visibleRows.map((r, i) => {
            const rowIndex = rows.indexOf(r)
            const isOpen = expanded.has(rowIndex)
            return (
              <div key={r.url + i} className="overflow-hidden rounded-2xl border border-border bg-card">
                <button onClick={() => toggleExpand(rowIndex)} className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/30">
                  <Search className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-xs text-muted-foreground">{r.url}</span>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="shrink-0 text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {r.status === 'error' ? (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-600">
                        <XCircle className="h-3.5 w-3.5" /> {r.error}
                      </p>
                    ) : (
                      <>
                        <p className="mt-1.5 truncate text-sm font-semibold text-foreground">{r.title || <em className="text-muted-foreground">Missing title</em>}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {r.m && <PixelBadge px={r.m.titleDesktopPx} limit={PIXEL_LIMITS.desktop.title.maxPx} status={r.m.titleDesktopStatus} />}
                          {r.m && <PixelBadge px={r.m.titleMobilePx} limit={PIXEL_LIMITS.mobile.title.maxPx} status={r.m.titleMobileStatus} />}
                        </div>
                        <p className="mt-2 truncate text-xs text-muted-foreground">{r.description || <em>Missing description</em>}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {r.m && <PixelBadge px={r.m.descDesktopPx} limit={PIXEL_LIMITS.desktop.description.maxPx} status={r.m.descDesktopStatus} />}
                          {r.m && <PixelBadge px={r.m.descMobilePx} limit={PIXEL_LIMITS.mobile.description.maxPx} status={r.m.descMobileStatus} />}
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronDown className={cn('mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                </button>

                {isOpen && r.status === 'success' && (
                  <div className="grid gap-3 border-t border-border bg-muted/20 p-4 sm:grid-cols-2">
                    <SerpPreview url={r.url} title={r.title} description={r.description} device="desktop" />
                    <SerpPreview url={r.url} title={r.title} description={r.description} device="mobile" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Pixel limits: desktop title {PIXEL_LIMITS.desktop.title.maxPx}px · desktop description {PIXEL_LIMITS.desktop.description.maxPx}px · mobile title {PIXEL_LIMITS.mobile.title.maxPx}px · mobile description {PIXEL_LIMITS.mobile.description.maxPx}px. Estimated industry-standard values — Google does not publish an official spec and actual truncation can vary by query and device.
        </p>
      </div>
    </section>
  )
}
