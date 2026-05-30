'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Globe,
  Shield,
  Zap,
  FileText,
  Smartphone,
  Eye,
  Code,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Copy,
  ChevronRight,
  Filter,
  Sparkles,
  Activity,
  Award,
  ArrowRight,
  ExternalLink,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SiteAuditResult, IssueSeverity, IssueCategory } from '@/app/api/site-audit/route'

type Stage = 'input' | 'scanning' | 'results'

const SCAN_STEPS = [
  { label: 'Fetching homepage…',                  icon: Globe },
  { label: 'Checking robots.txt & sitemap…',      icon: Shield },
  { label: 'Discovering internal pages…',         icon: Search },
  { label: 'Crawling pages in parallel…',         icon: Zap },
  { label: 'Analyzing SEO + accessibility…',      icon: Eye },
  { label: 'Detecting performance issues…',       icon: Activity },
  { label: 'Generating fix recommendations…',     icon: Sparkles },
]

const CATEGORY_META: Record<IssueCategory, { label: string; icon: typeof Search; color: string; bg: string }> = {
  seo:           { label: 'SEO',           icon: Search,     color: 'text-primary',     bg: 'bg-primary/10' },
  performance:   { label: 'Performance',   icon: Zap,        color: 'text-amber-600',   bg: 'bg-amber-100' },
  accessibility: { label: 'Accessibility', icon: Eye,        color: 'text-purple-600',  bg: 'bg-purple-100' },
  technical:     { label: 'Technical',     icon: Code,       color: 'text-blue-600',    bg: 'bg-blue-100' },
  content:       { label: 'Content',       icon: FileText,   color: 'text-teal-600',    bg: 'bg-teal-100' },
  mobile:        { label: 'Mobile',        icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-100' },
}

const SEVERITY_META: Record<IssueSeverity, { label: string; icon: typeof AlertCircle; color: string; bg: string }> = {
  critical: { label: 'Critical', icon: AlertCircle,   color: 'text-red-700',   bg: 'bg-red-50' },
  warning:  { label: 'Warning',  icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50' },
  info:     { label: 'Info',     icon: Info,          color: 'text-blue-700',  bg: 'bg-blue-50' },
}

function ScoreGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const dims = {
    sm: { box: 'h-16 w-16', r: 26, sw: 6, text: 'text-base' },
    md: { box: 'h-20 w-20', r: 32, sw: 6, text: 'text-lg' },
    lg: { box: 'h-32 w-32', r: 54, sw: 9, text: 'text-3xl' },
  }[size]
  const circumference = 2 * Math.PI * dims.r
  const [animated, setAnimated] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 50)
    return () => clearTimeout(t)
  }, [score])
  const offset = circumference - (animated / 100) * circumference
  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#f59e0b' :
    score >= 40 ? '#f97316' :
                  '#ef4444'
  return (
    <div className={cn('relative flex items-center justify-center', dims.box)}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={dims.r} fill="none" strokeWidth={dims.sw} className="stroke-muted" />
        <circle cx="60" cy="60" r={dims.r} fill="none" strokeWidth={dims.sw} stroke={color} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.2s ease-out' }} />
      </svg>
      <span className={cn('font-heading font-bold tabular-nums', dims.text)} style={{ color }}>{score}</span>
    </div>
  )
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(2)} MB`
}

export default function SiteAuditTool() {
  const [url, setUrl]             = useState('')
  const [stage, setStage]         = useState<Stage>('input')
  const [scanStep, setScanStep]   = useState(0)
  const [result, setResult]       = useState<SiteAuditResult | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'pages'>('overview')
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all')
  const [expandedIssue, setExpandedIssue]   = useState<string | null>(null)
  const [copied, setCopied]                 = useState<string | null>(null)

  async function runAudit() {
    if (url.trim().length < 4) return
    setError(null)
    setStage('scanning')
    setScanStep(0)
    const interval = setInterval(() => setScanStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1)), 1800)

    try {
      const res = await fetch('/api/site-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      clearInterval(interval)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Audit failed.')
      }
      const data: SiteAuditResult = await res.json()
      setResult(data)
      setStage('results')
      setActiveTab('overview')
      setSeverityFilter('all')
      setCategoryFilter('all')
    } catch (err: unknown) {
      clearInterval(interval)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStage('input')
    }
  }

  function reset() {
    setStage('input')
    setResult(null)
    setError(null)
    setScanStep(0)
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  function downloadJson() {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = `site-audit-${result.domain}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(objectUrl)
  }

  const filteredIssues = useMemo(() => {
    if (!result) return []
    return result.issues
      .filter((i) => severityFilter === 'all' || i.severity === severityFilter)
      .filter((i) => categoryFilter === 'all' || i.category === categoryFilter)
  }, [result, severityFilter, categoryFilter])

  const issueCountsBySeverity = useMemo(() => {
    if (!result) return { critical: 0, warning: 0, info: 0 }
    return {
      critical: result.issues.filter((i) => i.severity === 'critical').length,
      warning:  result.issues.filter((i) => i.severity === 'warning').length,
      info:     result.issues.filter((i) => i.severity === 'info').length,
    }
  }, [result])

  const issueCountsByCategory = useMemo(() => {
    if (!result) return {} as Record<string, number>
    const m: Record<string, number> = {}
    for (const i of result.issues) m[i.category] = (m[i.category] ?? 0) + 1
    return m
  }, [result])

  // ── INPUT ─────────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Real crawl · Real metrics · AI fix suggestions · 100% Free
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Professional Site Audit Tool
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              We <strong>actually crawl up to 15 pages</strong> of your site, run 25+ real SEO, performance, accessibility, mobile, and technical checks, then GPT-4o writes step-by-step fixes for every issue.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Search,     label: '25+ real checks' },
              { icon: Activity,   label: 'Live page metrics' },
              { icon: Sparkles,   label: 'AI fix guides' },
              { icon: Download,   label: 'JSON export' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <f.icon className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <label className="block text-sm font-semibold text-foreground">
              Website URL <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-2">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runAudit()}
                placeholder="https://yourwebsite.com"
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              onClick={runAudit}
              disabled={url.trim().length < 4}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Search className="h-4 w-4" />
              Audit Site
            </button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              30–60 seconds · We respect robots.txt · No data stored
            </p>
          </div>
        </div>
      </section>
    )
  }

  // ── SCANNING ──────────────────────────────────────────────────────────
  if (stage === 'scanning') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg py-16 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
              <Search className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Auditing your site…</h2>
          <p className="mt-1 text-sm text-muted-foreground">Crawling pages and running real checks · 30–60 seconds</p>
          <div className="mt-8 space-y-3 text-left">
            {SCAN_STEPS.map((step, i) => {
              const Icon = step.icon
              const done = i < scanStep
              const active = i === scanStep
              return (
                <div
                  key={step.label}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all',
                    done   ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                    active ? 'border-primary/30 bg-primary/5 text-primary' :
                             'border-transparent text-muted-foreground',
                  )}
                >
                  {done ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Icon className={cn('h-4 w-4 shrink-0', active && 'animate-pulse')} />}
                  {step.label}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // ── RESULTS ───────────────────────────────────────────────────────────
  if (!result) return null

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Audit Report</p>
            <h1 className="font-heading text-2xl font-bold text-foreground truncate">{result.domain}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {result.pagesCrawled} pages crawled · {result.issues.length} issues found · {new Date(result.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadJson} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <RefreshCw className="h-3.5 w-3.5" />
              New Audit
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
          {([
            { id: 'overview' as const, label: 'Overview',  icon: Award },
            { id: 'issues'   as const, label: 'Issues',    icon: AlertCircle, count: result.issues.length },
            { id: 'pages'    as const, label: 'Pages',     icon: FileText, count: result.pages.length },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                activeTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {'count' in tab && tab.count !== undefined && tab.count > 0 && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            <div className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:p-8">
              <div className="flex flex-col items-center gap-3 border-b border-border pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8">
                <ScoreGauge score={result.scores.overall} size="lg" />
                <div className="text-center">
                  <p className="font-heading text-sm font-bold text-foreground">Overall Health</p>
                  <p className="text-xs text-muted-foreground">
                    {result.scores.overall >= 80 ? 'Excellent' : result.scores.overall >= 60 ? 'Good — fixes needed' : result.scores.overall >= 40 ? 'Needs attention' : 'Critical issues'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {([
                  { key: 'seo' as const,           label: 'SEO',           score: result.scores.seo,           icon: Search },
                  { key: 'performance' as const,   label: 'Performance',   score: result.scores.performance,   icon: Zap },
                  { key: 'accessibility' as const, label: 'Accessibility', score: result.scores.accessibility, icon: Eye },
                  { key: 'technical' as const,     label: 'Technical',     score: result.scores.technical,     icon: Code },
                  { key: 'mobile' as const,        label: 'Mobile',        score: result.scores.mobile,        icon: Smartphone },
                  { key: 'content' as const,       label: 'Content',       score: result.scores.content,       icon: FileText },
                ]).map((c) => {
                  const meta = CATEGORY_META[c.key]
                  return (
                    <button
                      key={c.key}
                      onClick={() => { setActiveTab('issues'); setCategoryFilter(c.key); setSeverityFilter('all') }}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/40 hover:bg-card"
                    >
                      <ScoreGauge score={c.score} size="md" />
                      <div className="flex items-center gap-1.5">
                        <meta.icon className={cn('h-3.5 w-3.5', meta.color)} />
                        <span className="text-xs font-semibold text-foreground">{c.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-primary">Executive Summary</h2>
              </div>
              <p className="text-base leading-relaxed text-foreground">{result.summary}</p>
            </div>

            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              {[
                { icon: AlertCircle,   label: 'Critical Issues', value: issueCountsBySeverity.critical, color: 'text-red-600',     bg: 'bg-red-50' },
                { icon: AlertTriangle, label: 'Warnings',        value: issueCountsBySeverity.warning,  color: 'text-amber-600',   bg: 'bg-amber-50' },
                { icon: Activity,      label: 'Avg Load Time',   value: `${result.averageLoadTimeMs}ms`, color: 'text-blue-600',    bg: 'bg-blue-50' },
                { icon: FileText,      label: 'Total Page Size', value: formatBytes(result.totalPageWeight), color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', s.bg)}>
                      <s.icon className={cn('h-4 w-4', s.color)} />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  </div>
                  <p className="mt-2 font-heading text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <h2 className="font-heading text-base font-bold text-foreground">Top Recommended Actions</h2>
                </div>
                <button onClick={() => setActiveTab('issues')} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  View all issues <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <ol className="space-y-2.5">
                {result.topRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                    <span className="text-sm leading-relaxed text-foreground">{rec}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { ok: result.isHttps,      label: 'HTTPS Enabled',     icon: Shield },
                { ok: result.hasRobotsTxt, label: 'robots.txt Present', icon: FileText },
                { ok: result.hasSitemap,   label: 'XML Sitemap Found',  icon: FileText },
              ].map((c) => (
                <div key={c.label} className={cn(
                  'flex items-center gap-3 rounded-2xl border p-4',
                  c.ok ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50',
                )}>
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', c.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}>
                    {c.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.ok ? 'Pass' : 'Missing — fix recommended'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ISSUES */}
        {activeTab === 'issues' && (
          <div className="space-y-4">

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                Filters:
              </div>
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as IssueSeverity | 'all')} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground">
                <option value="all">All severity ({result.issues.length})</option>
                <option value="critical">Critical ({issueCountsBySeverity.critical})</option>
                <option value="warning">Warning ({issueCountsBySeverity.warning})</option>
                <option value="info">Info ({issueCountsBySeverity.info})</option>
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | 'all')} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground">
                <option value="all">All categories</option>
                {(Object.keys(CATEGORY_META) as IssueCategory[]).map((k) => (
                  <option key={k} value={k}>{CATEGORY_META[k].label} ({issueCountsByCategory[k] ?? 0})</option>
                ))}
              </select>
              {(severityFilter !== 'all' || categoryFilter !== 'all') && (
                <button onClick={() => { setSeverityFilter('all'); setCategoryFilter('all') }} className="flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
              <p className="ml-auto text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredIssues.length}</span> of {result.issues.length}
              </p>
            </div>

            {filteredIssues.length === 0 ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-10 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <p className="mt-3 font-heading text-base font-semibold text-foreground">
                  {result.issues.length === 0 ? 'No issues found!' : 'No issues match your filters.'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.issues.length === 0 ? 'Your site passes all checks.' : 'Try clearing the filters above.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => {
                  const sevMeta = SEVERITY_META[issue.severity]
                  const catMeta = CATEGORY_META[issue.category]
                  const expanded = expandedIssue === issue.id
                  return (
                    <div key={issue.id} className={cn(
                      'overflow-hidden rounded-2xl border transition-all',
                      expanded ? 'border-primary/40 bg-card shadow-sm' : 'border-border bg-card hover:border-border/80',
                    )}>
                      <button onClick={() => setExpandedIssue(expanded ? null : issue.id)} className="flex w-full items-start gap-3 p-4 text-left">
                        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', sevMeta.bg)}>
                          <sevMeta.icon className={cn('h-4 w-4', sevMeta.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', sevMeta.bg, sevMeta.color)}>
                              {sevMeta.label}
                            </span>
                            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', catMeta.bg, catMeta.color)}>
                              <catMeta.icon className="h-2.5 w-2.5" />
                              {catMeta.label}
                            </span>
                            {issue.affectedCount > 0 && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {issue.affectedCount} page{issue.affectedCount === 1 ? '' : 's'}
                              </span>
                            )}
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                              issue.estimatedImpact === 'high'   ? 'bg-red-100 text-red-700' :
                              issue.estimatedImpact === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                                  'bg-muted text-muted-foreground',
                            )}>
                              {issue.estimatedImpact} impact
                            </span>
                          </div>
                          <h3 className="mt-1.5 font-heading text-sm font-bold text-foreground">{issue.title}</h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{issue.description}</p>
                        </div>
                        <ChevronRight className={cn('mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-90')} />
                      </button>

                      {expanded && (
                        <div className="space-y-4 border-t border-border bg-muted/20 p-5">
                          <div>
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Why this matters</p>
                            <p className="text-sm leading-relaxed text-foreground">{issue.description}</p>
                          </div>
                          <div>
                            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                              <Sparkles className="h-3 w-3" />
                              How to fix
                            </p>
                            <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                              <p className="flex-1 text-sm leading-relaxed text-foreground">{issue.howToFix}</p>
                              <button
                                onClick={() => copyText(issue.howToFix)}
                                className={cn(
                                  'shrink-0 rounded-lg border p-1.5 transition-colors',
                                  copied === issue.howToFix ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-border bg-background text-muted-foreground hover:text-primary',
                                )}
                                title="Copy fix"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {issue.affectedUrls.length > 0 && (
                            <div>
                              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Affected pages ({issue.affectedUrls.length})
                              </p>
                              <ul className="space-y-1">
                                {issue.affectedUrls.slice(0, 10).map((u) => (
                                  <li key={u} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
                                    <span className="flex-1 truncate font-mono text-[11px] text-foreground" title={u}>{u}</span>
                                    <a href={u} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </li>
                                ))}
                                {issue.affectedUrls.length > 10 && (
                                  <li className="text-center text-[11px] text-muted-foreground">
                                    +{issue.affectedUrls.length - 10} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PAGES */}
        {activeTab === 'pages' && (
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="max-h-[640px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">URL</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Load</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Size</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Title</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">H1</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Words</th>
                    <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">No-alt imgs</th>
                  </tr>
                </thead>
                <tbody>
                  {result.pages.map((p) => {
                    const slow = p.loadTimeMs > 3000
                    const ok = p.status >= 200 && p.status < 400
                    return (
                      <tr key={p.url} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="max-w-[280px] px-4 py-3 truncate">
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-[11px] text-foreground hover:text-primary">
                            <span className="truncate">{p.url.replace(/^https?:\/\/[^/]+/, '') || '/'}</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-50" />
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                            ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
                          )}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs font-medium tabular-nums', slow ? 'text-amber-700' : 'text-foreground')}>
                            {p.loadTimeMs}ms
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-xs tabular-nums text-muted-foreground md:table-cell">{formatBytes(p.byteSize)}</td>
                        <td className="hidden max-w-[200px] px-4 py-3 truncate text-xs text-foreground md:table-cell" title={p.title ?? ''}>
                          {p.title ?? <span className="italic text-red-600">missing</span>}
                        </td>
                        <td className="hidden px-4 py-3 text-center lg:table-cell">
                          <span className={cn(
                            'rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                            p.h1Count === 1 ? 'bg-emerald-100 text-emerald-700' :
                            p.h1Count === 0 ? 'bg-red-100 text-red-700' :
                                              'bg-amber-100 text-amber-700',
                          )}>
                            {p.h1Count}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-center text-xs tabular-nums text-muted-foreground lg:table-cell">{p.wordCount}</td>
                        <td className="hidden px-4 py-3 text-center lg:table-cell">
                          {p.imagesWithoutAlt > 0 ? (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-700">
                              {p.imagesWithoutAlt}/{p.imageCount}
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-600">✓</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Crawled {result.pagesCrawled} pages · Audit completed in real time · Data is not stored on our servers
        </p>
      </div>
    </section>
  )
}
