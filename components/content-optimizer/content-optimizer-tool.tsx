'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Sparkles,
  Target,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Copy,
  ChevronRight,
  Filter,
  Award,
  TrendingUp,
  Search,
  FileText,
  BookOpen,
  Star,
  Layers,
  Hash,
  X,
  ArrowRight,
  Wand2,
  Cpu,
  ShieldCheck,
  Zap,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentOptimizerResult } from '@/app/api/content-optimizer/route'

type Stage = 'input' | 'loading' | 'results'
type Tab = 'overview' | 'eeat' | 'keywords' | 'structure' | 'on-page' | 'issues'

const LOADING_STEPS = [
  { label: 'Detecting search intent…',                  icon: Target },
  { label: 'Analyzing E-E-A-T signals…',                icon: ShieldCheck },
  { label: 'Checking Helpful Content quality…',         icon: Star },
  { label: 'Mapping keyword + LSI coverage…',           icon: Search },
  { label: 'Auditing structure & readability…',         icon: Layers },
  { label: 'Generating on-page recommendations…',       icon: Sparkles },
]

const CATEGORY_META: Record<string, { label: string; icon: typeof Search; color: string; bg: string }> = {
  'eeat':            { label: 'E-E-A-T',          icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
  'helpful-content': { label: 'Helpful Content',  icon: Star,        color: 'text-amber-600',  bg: 'bg-amber-100' },
  'keyword':         { label: 'Keyword',          icon: Search,      color: 'text-primary',    bg: 'bg-primary/10' },
  'structure':       { label: 'Structure',        icon: Layers,      color: 'text-blue-600',   bg: 'bg-blue-100' },
  'readability':     { label: 'Readability',      icon: BookOpen,    color: 'text-teal-600',   bg: 'bg-teal-100' },
  'intent':          { label: 'Search Intent',    icon: Target,      color: 'text-emerald-600', bg: 'bg-emerald-100' },
  'on-page':         { label: 'On-Page SEO',      icon: FileText,    color: 'text-rose-600',   bg: 'bg-rose-100' },
}

const SEVERITY_META: Record<string, { label: string; icon: typeof AlertCircle; color: string; bg: string }> = {
  critical: { label: 'Critical', icon: AlertCircle,   color: 'text-red-700',   bg: 'bg-red-50' },
  warning:  { label: 'Warning',  icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50' },
  info:     { label: 'Info',     icon: Info,          color: 'text-blue-700',  bg: 'bg-blue-50' },
}

function ScoreGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const dims = {
    sm: { box: 'h-16 w-16', r: 26, sw: 6, text: 'text-base' },
    md: { box: 'h-20 w-20', r: 32, sw: 6, text: 'text-lg' },
    lg: { box: 'h-36 w-36', r: 58, sw: 10, text: 'text-4xl' },
  }[size]
  const circumference = 2 * Math.PI * dims.r
  const [animated, setAnimated] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 80)
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
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={dims.r} fill="none" strokeWidth={dims.sw} className="stroke-muted" />
        <circle cx="65" cy="65" r={dims.r} fill="none" strokeWidth={dims.sw} stroke={color} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.4s ease-out' }} />
      </svg>
      <span className={cn('font-heading font-bold tabular-nums', dims.text)} style={{ color }}>{score}</span>
    </div>
  )
}

function ProgressBar({ value, color = 'bg-primary' }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn('h-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
    </div>
  )
}

export default function ContentOptimizerTool() {
  const [content, setContent]               = useState('')
  const [targetKeyword, setTargetKeyword]   = useState('')
  const [contentType, setContentType]       = useState('blog post')
  const [stage, setStage]                   = useState<Stage>('input')
  const [loadingStep, setLoadingStep]       = useState(0)
  const [result, setResult]                 = useState<ContentOptimizerResult | null>(null)
  const [error, setError]                   = useState<string | null>(null)
  const [activeTab, setActiveTab]           = useState<Tab>('overview')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [expandedIssue, setExpandedIssue]   = useState<string | null>(null)
  const [copied, setCopied]                 = useState<string | null>(null)

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0

  async function optimize() {
    if (wordCount < 100 || targetKeyword.trim().length < 2) return
    setError(null)
    setStage('loading')
    setLoadingStep(0)
    const interval = setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1400)

    try {
      const res = await fetch('/api/content-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, targetKeyword, contentType }),
      })
      clearInterval(interval)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Optimization failed.')
      }
      const data: ContentOptimizerResult = await res.json()
      setResult(data)
      setStage('results')
      setActiveTab('overview')
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
    setLoadingStep(0)
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  const filteredIssues = useMemo(() => {
    if (!result) return []
    return result.issues
      .filter((i) => severityFilter === 'all' || i.severity === severityFilter)
      .filter((i) => categoryFilter === 'all' || i.category === categoryFilter)
  }, [result, severityFilter, categoryFilter])

  const issueCounts = useMemo(() => {
    if (!result) return { critical: 0, warning: 0, info: 0 }
    return {
      critical: result.issues.filter((i) => i.severity === 'critical').length,
      warning:  result.issues.filter((i) => i.severity === 'warning').length,
      info:     result.issues.filter((i) => i.severity === 'info').length,
    }
  }, [result])

  // ── INPUT ─────────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Cpu className="h-3 w-3" />
              Google Quality Rater rules · E-E-A-T scored · 100% Free
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              AI Content Optimizer
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              Paste your article + target keyword. Get a real-time audit against <strong>Google's 2024 Helpful Content + E-E-A-T guidelines</strong>, with concrete fixes for every issue.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: ShieldCheck, label: 'E-E-A-T audit' },
              { icon: Star,        label: 'Helpful Content' },
              { icon: Search,      label: 'Keyword + LSI' },
              { icon: Wand2,       label: 'Heading rewrites' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <f.icon className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Target keyword <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2">
                    <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={targetKeyword}
                      onChange={(e) => setTargetKeyword(e.target.value)}
                      placeholder="e.g. best running shoes for flat feet"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground">Content type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-background py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>blog post</option>
                    <option>landing page</option>
                    <option>product page</option>
                    <option>guide</option>
                    <option>review</option>
                    <option>comparison</option>
                    <option>listicle</option>
                    <option>tutorial</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <span className={cn(
                    'text-xs tabular-nums',
                    wordCount < 100   ? 'text-muted-foreground' :
                    wordCount > 3800  ? 'text-amber-600' :
                                        'text-emerald-600',
                  )}>
                    {wordCount} / 4,000 words
                  </span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your article, blog post, or page content here (min 100 words)…"
                  className="mt-2 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={12}
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              onClick={optimize}
              disabled={wordCount < 100 || targetKeyword.trim().length < 2}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              Optimize Content
            </button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              {wordCount < 100
                ? `Need at least ${100 - wordCount} more words to analyze`
                : '20–40 seconds · No sign-up · Powered by GPT-4o + Google guidelines'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  // ── LOADING ───────────────────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg py-16 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
              <Cpu className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Optimizing your content…</h2>
          <p className="mt-1 text-sm text-muted-foreground">{wordCount} words · Auditing against Google guidelines</p>
          <div className="mt-8 space-y-3 text-left">
            {LOADING_STEPS.map((step, i) => {
              const Icon = step.icon
              const done = i < loadingStep
              const active = i === loadingStep
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

        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Optimization Report</p>
            <h1 className="font-heading text-2xl font-bold text-foreground truncate">
              <span className="text-primary">{result.targetKeyword}</span>
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground capitalize">
              {result.contentType} · {result.structureAnalysis.wordCount} words · {result.issues.length} issues found
            </p>
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <RefreshCw className="h-3.5 w-3.5" />
            New Analysis
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1">
          {([
            { id: 'overview'  as Tab, label: 'Overview',     icon: Award },
            { id: 'eeat'      as Tab, label: 'E-E-A-T',      icon: ShieldCheck },
            { id: 'keywords'  as Tab, label: 'Keywords',     icon: Search },
            { id: 'structure' as Tab, label: 'Structure',    icon: Layers },
            { id: 'on-page'   as Tab, label: 'On-Page',      icon: FileText },
            { id: 'issues'    as Tab, label: 'Issues & Fixes', icon: AlertCircle, count: result.issues.length },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
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

        {/* ── OVERVIEW ───────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            <div className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:p-8">
              <div className="flex flex-col items-center gap-3 border-b border-border pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8">
                <ScoreGauge score={result.scores.overall} size="lg" />
                <div className="text-center">
                  <p className="font-heading text-sm font-bold text-foreground">Optimization Score</p>
                  <p className="text-xs text-muted-foreground">
                    {result.scores.overall >= 80 ? 'Ready to publish' :
                     result.scores.overall >= 60 ? 'Good — fixes needed' :
                     result.scores.overall >= 40 ? 'Needs major work' :
                                                   'Significant rewrite'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: 'E-E-A-T',          score: result.scores.eeat,                icon: ShieldCheck },
                  { label: 'Helpful Content',  score: result.scores.helpfulContent,      icon: Star },
                  { label: 'Keyword',          score: result.scores.keywordOptimization, icon: Search },
                  { label: 'Structure',        score: result.scores.structureReadability, icon: Layers },
                  { label: 'Intent Match',     score: result.scores.searchIntentMatch,   icon: Target },
                  { label: 'On-Page SEO',      score: result.scores.onPageSeo,            icon: FileText },
                ].map((c) => (
                  <div key={c.label} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4">
                    <ScoreGauge score={c.score} size="md" />
                    <div className="flex items-center gap-1.5">
                      <c.icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">{c.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive summary */}
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-primary">Executive Summary</h2>
              </div>
              <p className="text-base leading-relaxed text-foreground">{result.summary}</p>
            </div>

            {/* Search intent */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600" />
                <h2 className="font-heading text-base font-bold text-foreground">Search Intent Analysis</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Detected intent</p>
                  <p className="mt-1 font-heading text-sm font-bold capitalize text-foreground">{result.searchIntent.detectedIntent}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3 sm:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Content match</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">{result.searchIntent.contentMatch}</p>
                </div>
                <div className="rounded-xl bg-primary/5 p-3 sm:col-span-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Recommendation</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">{result.searchIntent.recommendation}</p>
                </div>
              </div>
            </div>

            {/* Top recommendations */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <h2 className="font-heading text-base font-bold text-foreground">Top Actions (Priority Order)</h2>
                </div>
                <button onClick={() => setActiveTab('issues')} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  All issues <ArrowRight className="h-3 w-3" />
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

            {/* Quick stats */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              {[
                { icon: AlertCircle,   label: 'Critical Issues', value: issueCounts.critical, color: 'text-red-600',    bg: 'bg-red-50' },
                { icon: AlertTriangle, label: 'Warnings',        value: issueCounts.warning,  color: 'text-amber-600',  bg: 'bg-amber-50' },
                { icon: Star,          label: 'Helpful Score',   value: `${result.helpfulContentSignals.peopleFirstScore}/100`, color: 'text-amber-600', bg: 'bg-amber-50' },
                { icon: TrendingUp,    label: 'Topics Missing',  value: result.missingTopics.length, color: 'text-blue-600', bg: 'bg-blue-50' },
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
          </div>
        )}

        {/* ── E-E-A-T ──────────────────────────────────────────────── */}
        {activeTab === 'eeat' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                <h2 className="font-heading text-base font-bold text-foreground">E-E-A-T Verdict</h2>
              </div>
              <p className="rounded-xl bg-purple-50 px-4 py-3 text-sm leading-relaxed text-foreground">
                {result.eeatAnalysis.overallVerdict}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Experience Signals Found
                </h3>
                {result.eeatAnalysis.experienceSignals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No first-hand experience signals detected.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.eeatAnalysis.experienceSignals.map((s, i) => (
                      <li key={i} className="rounded-lg bg-card px-3 py-2 text-xs text-foreground">{s}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <Award className="h-4 w-4 text-blue-600" />
                  Expertise Signals Found
                </h3>
                {result.eeatAnalysis.expertiseSignals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No clear expertise indicators detected.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.eeatAnalysis.expertiseSignals.map((s, i) => (
                      <li key={i} className="rounded-lg bg-card px-3 py-2 text-xs text-foreground">{s}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Authority Gaps
                </h3>
                {result.eeatAnalysis.authorityGaps.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No major authority gaps found.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.eeatAnalysis.authorityGaps.map((s, i) => (
                      <li key={i} className="rounded-lg bg-card px-3 py-2 text-xs text-foreground">{s}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Trust Issues
                </h3>
                {result.eeatAnalysis.trustIssues.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No trust issues detected.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.eeatAnalysis.trustIssues.map((s, i) => (
                      <li key={i} className="rounded-lg bg-card px-3 py-2 text-xs text-foreground">{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Helpful Content section */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
                  <Star className="h-4 w-4 text-amber-500" />
                  Helpful Content Analysis
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">People-first score</span>
                  <span className="font-heading text-lg font-bold text-amber-600 tabular-nums">{result.helpfulContentSignals.peopleFirstScore}/100</span>
                </div>
              </div>
              <ProgressBar value={result.helpfulContentSignals.peopleFirstScore} color="bg-amber-500" />

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                    Unique Value-Adds ({result.helpfulContentSignals.valueAdds.length})
                  </p>
                  {result.helpfulContentSignals.valueAdds.length === 0 ? (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">No unique value-adds found — content reads as generic.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {result.helpfulContentSignals.valueAdds.map((s, i) => (
                        <li key={i} className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground">{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                    Generic Claims to Replace
                  </p>
                  {result.helpfulContentSignals.genericClaims.length === 0 ? (
                    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">No generic filler claims detected.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {result.helpfulContentSignals.genericClaims.map((s, i) => (
                        <li key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-foreground">&ldquo;{s}&rdquo;</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── KEYWORDS ──────────────────────────────────────────────── */}
        {activeTab === 'keywords' && (
          <div className="space-y-6">

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Primary keyword usage</p>
                <p className="mt-2 font-heading text-3xl font-bold text-primary tabular-nums">{result.keywordAnalysis.primaryKeywordUsage.count}×</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{result.keywordAnalysis.primaryKeywordUsage.recommendation}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Keyword density</p>
                <p className="mt-2 font-heading text-3xl font-bold text-foreground tabular-nums">{result.keywordAnalysis.keywordDensityPercent}%</p>
                <p className={cn(
                  'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase capitalize',
                  result.keywordAnalysis.densityVerdict === 'optimal'   ? 'bg-emerald-100 text-emerald-700' :
                  result.keywordAnalysis.densityVerdict === 'too-low'   ? 'bg-amber-100 text-amber-700' :
                                                                         'bg-red-100 text-red-700',
                )}>
                  {result.keywordAnalysis.densityVerdict.replace('-', ' ')}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">LSI keywords present</p>
                <p className="mt-2 font-heading text-3xl font-bold text-foreground tabular-nums">{result.keywordAnalysis.presentLsiKeywords.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">{result.keywordAnalysis.missingLsiKeywords.length} missing</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <p className="mb-3 text-sm font-medium text-foreground">{result.keywordAnalysis.semanticCoverage}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Missing LSI Keywords ({result.keywordAnalysis.missingLsiKeywords.length})
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">Add these semantic terms to boost topical authority. Click to copy.</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordAnalysis.missingLsiKeywords.map((k) => (
                    <button
                      key={k}
                      onClick={() => copyText(k)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                        copied === k
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-border bg-card text-foreground hover:border-primary/40 hover:text-primary',
                      )}
                    >
                      <Hash className="mr-1 inline h-2.5 w-2.5" />
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  LSI Keywords Already Present
                </h3>
                {result.keywordAnalysis.presentLsiKeywords.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None found.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywordAnalysis.presentLsiKeywords.map((k) => (
                      <span key={k} className="rounded-full border border-emerald-200 bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Missing topics */}
            {result.missingTopics.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-foreground">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Missing Topics to Cover
                </h3>
                <div className="space-y-3">
                  {result.missingTopics.map((t, i) => (
                    <div key={i} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-heading text-sm font-bold text-foreground">{t.topic}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{t.whyImportant}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
                        <span className="text-[10px] font-bold text-primary">H2:</span>
                        <span className="flex-1 text-xs font-medium text-foreground">{t.suggestedH2}</span>
                        <button onClick={() => copyText(t.suggestedH2)} className={cn('shrink-0 rounded-lg border p-1.5', copied === t.suggestedH2 ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-border bg-background text-muted-foreground hover:text-primary')}>
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STRUCTURE ─────────────────────────────────────────────── */}
        {activeTab === 'structure' && (
          <div className="space-y-6">
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              {[
                { label: 'Word count',         value: result.structureAnalysis.wordCount },
                { label: 'Recommended',        value: result.structureAnalysis.recommendedWordCount },
                { label: 'Paragraphs',         value: result.structureAnalysis.paragraphCount },
                { label: 'Avg paragraph',      value: `${result.structureAnalysis.avgParagraphLength} words` },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="mt-2 font-heading text-xl font-bold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <BookOpen className="h-4 w-4 text-teal-600" />
                  Readability
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Flesch Reading Ease</span>
                  <span className="font-heading text-2xl font-bold text-foreground tabular-nums">{result.structureAnalysis.readabilityScore}</span>
                </div>
                <ProgressBar value={result.structureAnalysis.readabilityScore} color="bg-teal-500" />
                <p className="mt-2 text-xs text-muted-foreground">Reading level: <span className="font-semibold text-foreground">{result.structureAnalysis.readabilityGrade}</span></p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <Layers className="h-4 w-4 text-blue-600" />
                  Heading Hierarchy
                </h3>
                <div className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2',
                  result.structureAnalysis.headingHierarchyOk ? 'bg-emerald-50' : 'bg-red-50',
                )}>
                  {result.structureAnalysis.headingHierarchyOk
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    : <AlertCircle className="h-4 w-4 text-red-600" />}
                  <span className="text-xs font-semibold text-foreground">
                    {result.structureAnalysis.headingHierarchyOk ? 'Logical hierarchy' : 'Hierarchy issues detected'}
                  </span>
                </div>
              </div>
            </div>

            {result.structureAnalysis.structureIssues.length > 0 && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Structure Issues
                </h3>
                <ul className="space-y-1.5">
                  {result.structureAnalysis.structureIssues.map((s, i) => (
                    <li key={i} className="rounded-lg bg-card px-3 py-2 text-xs text-foreground">{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.rewrittenHeadings.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-foreground">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Heading Rewrites
                </h3>
                <div className="space-y-3">
                  {result.rewrittenHeadings.map((h, i) => (
                    <div key={i} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{h.level}</span>
                        <span className="text-xs italic text-muted-foreground line-through">{h.text}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
                        <ArrowRight className="h-3 w-3 shrink-0 text-primary" />
                        <p className="flex-1 text-sm font-semibold text-foreground">{h.rewritten}</p>
                        <button onClick={() => copyText(h.rewritten)} className={cn('shrink-0 rounded-lg border p-1.5', copied === h.rewritten ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-border bg-background text-muted-foreground hover:text-primary')}>
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">{h.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ON-PAGE ───────────────────────────────────────────────── */}
        {activeTab === 'on-page' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested title</p>
                <span className={cn(
                  'text-[10px] font-semibold tabular-nums',
                  result.onPageRecommendations.titleCharCount > 60 ? 'text-red-600' :
                  result.onPageRecommendations.titleCharCount < 30 ? 'text-amber-600' :
                                                                     'text-emerald-600',
                )}>
                  {result.onPageRecommendations.titleCharCount} chars
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-3">
                <p className="flex-1 font-heading text-base font-bold text-foreground">{result.onPageRecommendations.suggestedTitle}</p>
                <button onClick={() => copyText(result.onPageRecommendations.suggestedTitle)} className={cn('shrink-0 rounded-lg border p-2', copied === result.onPageRecommendations.suggestedTitle ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-border bg-background text-muted-foreground hover:text-primary')}>
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested meta description</p>
                <span className={cn(
                  'text-[10px] font-semibold tabular-nums',
                  result.onPageRecommendations.metaCharCount > 160 ? 'text-red-600' :
                  result.onPageRecommendations.metaCharCount < 120 ? 'text-amber-600' :
                                                                     'text-emerald-600',
                )}>
                  {result.onPageRecommendations.metaCharCount} chars
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-primary/5 px-4 py-3">
                <p className="flex-1 text-sm leading-relaxed text-foreground">{result.onPageRecommendations.suggestedMetaDescription}</p>
                <button onClick={() => copyText(result.onPageRecommendations.suggestedMetaDescription)} className={cn('shrink-0 rounded-lg border p-2', copied === result.onPageRecommendations.suggestedMetaDescription ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-border bg-background text-muted-foreground hover:text-primary')}>
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">URL slug</p>
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2">
                  <code className="flex-1 text-sm text-foreground">/{result.onPageRecommendations.suggestedSlug}</code>
                  <button onClick={() => copyText(result.onPageRecommendations.suggestedSlug)} className={cn('shrink-0 rounded-lg border p-1.5', copied === result.onPageRecommendations.suggestedSlug ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-border bg-background text-muted-foreground hover:text-primary')}>
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recommended schema</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{result.onPageRecommendations.suggestedSchema}</p>
              </div>
            </div>

            {result.internalLinkingSuggestions.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  Internal Linking Suggestions
                </h3>
                <ul className="space-y-2">
                  {result.internalLinkingSuggestions.map((s, i) => (
                    <li key={i} className="rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-foreground">{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── ISSUES & FIXES ───────────────────────────────────────── */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                Filters:
              </div>
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground">
                <option value="all">All severity</option>
                <option value="critical">Critical ({issueCounts.critical})</option>
                <option value="warning">Warning ({issueCounts.warning})</option>
                <option value="info">Info ({issueCounts.info})</option>
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground">
                <option value="all">All categories</option>
                {Object.keys(CATEGORY_META).map((k) => (
                  <option key={k} value={k}>{CATEGORY_META[k].label}</option>
                ))}
              </select>
              {(severityFilter !== 'all' || categoryFilter !== 'all') && (
                <button onClick={() => { setSeverityFilter('all'); setCategoryFilter('all') }} className="flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
              <p className="ml-auto text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredIssues.length}</span> of {result.issues.length}
              </p>
            </div>

            {filteredIssues.length === 0 ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-10 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <p className="mt-3 font-heading text-base font-semibold text-foreground">
                  {result.issues.length === 0 ? 'No issues found!' : 'No issues match your filters.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => {
                  const sevMeta = SEVERITY_META[issue.severity] ?? SEVERITY_META.info
                  const catMeta = CATEGORY_META[issue.category] ?? CATEGORY_META['on-page']
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
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                              issue.impact === 'high'   ? 'bg-red-100 text-red-700' :
                              issue.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                          'bg-muted text-muted-foreground',
                            )}>
                              {issue.impact} impact
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
                              <Sparkles className="h-3 w-3" /> How to fix
                            </p>
                            <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                              <p className="flex-1 text-sm leading-relaxed text-foreground">{issue.fix}</p>
                              <button onClick={() => copyText(issue.fix)} className={cn('shrink-0 rounded-lg border p-1.5', copied === issue.fix ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-border bg-background text-muted-foreground hover:text-primary')}>
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {issue.example && (
                            <div>
                              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Example</p>
                              <div className="rounded-xl border border-border bg-background p-3 text-xs italic leading-relaxed text-foreground">
                                {issue.example}
                              </div>
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

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Analysis based on Google Search Quality Rater Guidelines (2024) + Helpful Content System · Content is not stored
        </p>
      </div>
    </section>
  )
}
