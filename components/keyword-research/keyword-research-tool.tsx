'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Copy,
  Download,
  Globe,
  Filter,
  CheckCircle2,
  TrendingUp,
  Target,
  Lightbulb,
  HelpCircle,
  FileText,
  Layers,
  ChevronDown,
  X,
  Zap,
  Flame,
  Award,
  ArrowUpRight,
  Users,
  BookOpen,
  ChevronRight,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KeywordResearchResult } from '@/app/api/keyword-research/route'

const COUNTRIES = [
  { code: 'us', label: 'United States' },
  { code: 'uk', label: 'United Kingdom' },
  { code: 'ca', label: 'Canada' },
  { code: 'au', label: 'Australia' },
  { code: 'in', label: 'India' },
  { code: 'de', label: 'Germany' },
  { code: 'fr', label: 'France' },
  { code: 'es', label: 'Spain' },
  { code: 'it', label: 'Italy' },
  { code: 'br', label: 'Brazil' },
  { code: 'mx', label: 'Mexico' },
  { code: 'pk', label: 'Pakistan' },
  { code: 'ae', label: 'UAE' },
  { code: 'sg', label: 'Singapore' },
]

const LOADING_STEPS = [
  { label: 'Querying Google Autocomplete (a–z expansion)…',    icon: Search },
  { label: 'Pulling YouTube + Wikipedia related topics…',      icon: Globe },
  { label: 'Filtering for relevance…',                         icon: Filter },
  { label: 'AI clustering by topic and intent…',               icon: Layers },
  { label: 'Generating content briefs and strategy…',          icon: Lightbulb },
]

type Stage = 'input' | 'loading' | 'results'
type IntentFilter = 'all' | 'informational' | 'commercial' | 'transactional' | 'navigational'
type DiffFilter   = 'all' | 'easy' | 'medium' | 'hard'
type OppFilter    = 'all' | 'high' | 'medium' | 'low'
type ViewTab      = 'overview' | 'clusters' | 'all-keywords' | 'content-ideas'

const intentColors: Record<string, string> = {
  informational: 'bg-blue-100 text-blue-700 border-blue-200',
  commercial:    'bg-amber-100 text-amber-700 border-amber-200',
  transactional: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  navigational:  'bg-purple-100 text-purple-700 border-purple-200',
}
const diffColors: Record<string, string> = {
  easy:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  hard:   'bg-red-100 text-red-700 border-red-200',
}
const oppColors: Record<string, string> = {
  high:   'bg-primary/15 text-primary border-primary/30',
  medium: 'bg-muted text-muted-foreground border-border',
  low:    'bg-muted/50 text-muted-foreground/70 border-border',
}

export default function KeywordResearchTool() {
  const [seed, setSeed]                 = useState('')
  const [country, setCountry]           = useState('us')
  const [niche, setNiche]               = useState('')
  const [stage, setStage]               = useState<Stage>('input')
  const [loadingStep, setLoadingStep]   = useState(0)
  const [result, setResult]             = useState<KeywordResearchResult | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [copied, setCopied]             = useState<string | null>(null)
  const [viewTab, setViewTab]           = useState<ViewTab>('overview')
  const [search, setSearch]             = useState('')
  const [intentFilter, setIntentFilter] = useState<IntentFilter>('all')
  const [diffFilter, setDiffFilter]     = useState<DiffFilter>('all')
  const [oppFilter, setOppFilter]       = useState<OppFilter>('all')
  const [activeCluster, setActiveCluster] = useState<string | null>(null)
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null)

  async function runResearch() {
    if (seed.trim().length < 2) return
    setError(null)
    setStage('loading')
    setLoadingStep(0)

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1))
    }, 1400)

    try {
      const res = await fetch('/api/keyword-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed, country, niche }),
      })
      clearInterval(stepInterval)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Keyword research failed.')
      }

      const data: KeywordResearchResult = await res.json()
      setResult(data)
      setStage('results')
      setViewTab('overview')
      setActiveCluster(null)
    } catch (err: unknown) {
      clearInterval(stepInterval)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStage('input')
    }
  }

  function reset() {
    setStage('input')
    setResult(null)
    setError(null)
    setLoadingStep(0)
    setSearch('')
    setIntentFilter('all')
    setDiffFilter('all')
    setOppFilter('all')
    setActiveCluster(null)
    setViewTab('overview')
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  function downloadCsv() {
    if (!result) return
    const rows = [
      ['Keyword', 'Cluster', 'Intent', 'Difficulty', 'Opportunity', 'Content Type', 'Words'],
      ...result.clusters.flatMap((c) =>
        c.keywords.map((k) => [k.keyword, c.name, k.intent, k.difficulty, k.opportunity, k.contentType, String(k.wordCount)]),
      ),
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `keywords-${result.seed.replace(/\s+/g, '-')}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Flatten all keywords with cluster name ────────────────────────────────
  const allKeywords = useMemo(() => {
    if (!result) return []
    return result.clusters.flatMap((c) =>
      c.keywords.map((k) => ({ ...k, cluster: c.name })),
    )
  }, [result])

  // ── Filtered keyword list ─────────────────────────────────────────────────
  const filteredKeywords = useMemo(() => {
    const s = search.trim().toLowerCase()
    return allKeywords
      .filter((k) => intentFilter === 'all' || k.intent === intentFilter)
      .filter((k) => diffFilter === 'all' || k.difficulty === diffFilter)
      .filter((k) => oppFilter === 'all' || k.opportunity === oppFilter)
      .filter(() => activeCluster === null || true)
      .filter((k) => activeCluster === null || k.cluster === activeCluster)
      .filter((k) => !s || k.keyword.toLowerCase().includes(s))
  }, [allKeywords, search, intentFilter, diffFilter, oppFilter, activeCluster])

  // ── Distribution stats for charts ─────────────────────────────────────────
  const distribution = useMemo(() => {
    if (!result || allKeywords.length === 0) {
      return { intent: {} as Record<string, number>, difficulty: {} as Record<string, number>, opportunity: {} as Record<string, number> }
    }
    const intent: Record<string, number> = { informational: 0, commercial: 0, transactional: 0, navigational: 0 }
    const difficulty: Record<string, number> = { easy: 0, medium: 0, hard: 0 }
    const opportunity: Record<string, number> = { high: 0, medium: 0, low: 0 }
    for (const k of allKeywords) {
      if (intent[k.intent] !== undefined) intent[k.intent]++
      if (difficulty[k.difficulty] !== undefined) difficulty[k.difficulty]++
      if (opportunity[k.opportunity] !== undefined) opportunity[k.opportunity]++
    }
    return { intent, difficulty, opportunity }
  }, [result, allKeywords])

  // ── INPUT STAGE ────────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Search className="h-3 w-3" />
              Real Google + YouTube + Wikipedia data · AI strategy · 100% Free
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Professional Keyword Research
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              Pull <strong>150+ real keywords</strong> from Google Autocomplete (a–z expansion), YouTube, and Wikipedia. AI clusters them by intent, finds quick wins, and writes full content briefs.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Search,    label: '150+ real keywords' },
              { icon: Target,    label: 'Intent + difficulty' },
              { icon: Layers,    label: '5–8 smart clusters' },
              { icon: Lightbulb, label: 'Full content briefs' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <f.icon className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground">
                  Seed keyword <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runResearch()}
                    placeholder="e.g. ai content writing"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-foreground">Country</label>
                  <div className="relative mt-2">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-background py-3 pl-10 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Niche / Industry <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. SaaS, fitness, fintech"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              onClick={runResearch}
              disabled={seed.trim().length < 2}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              Research Keywords
            </button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Typically 30–60 seconds · No sign-up · Powered by GPT-4o
            </p>
          </div>
        </div>
      </section>
    )
  }

  // ── LOADING STAGE ──────────────────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg py-16 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
              <Search className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Researching keywords…</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pulling 100+ Google queries · 30–60 seconds</p>
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

  // ── RESULTS STAGE ──────────────────────────────────────────────────────────
  if (!result) return null

  const totalKeywords = allKeywords.length

  // ── Sub: Distribution bar ─────────────────────────────────────────────────
  const DistributionBar = ({ data, colorMap, title }: {
    data: Record<string, number>
    colorMap: Record<string, string>
    title: string
  }) => {
    const total = Object.values(data).reduce((s, v) => s + v, 0) || 1
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {Object.entries(data).map(([key, value]) => {
            const pct = (value / total) * 100
            if (pct === 0) return null
            return (
              <div
                key={key}
                className={cn('h-full transition-all', colorMap[key])}
                style={{ width: `${pct}%` }}
                title={`${key}: ${value}`}
              />
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px]">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', colorMap[key])} />
              <span className="font-medium capitalize text-foreground">{key}</span>
              <span className="text-muted-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Sub: Top bar (always visible) ─────────────────────────────────────────
  const TopBar = () => (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            <span className="text-primary">{result.seed}</span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalKeywords} keywords · {result.clusters.length} clusters · {result.contentIdeas.length} content briefs
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <RefreshCw className="h-3.5 w-3.5" />
            New Search
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1">
        {([
          { id: 'overview'      as ViewTab, label: 'Overview',      icon: BarChart3 },
          { id: 'clusters'      as ViewTab, label: 'Clusters',      icon: Layers     },
          { id: 'all-keywords'  as ViewTab, label: 'All Keywords',  icon: Search     },
          { id: 'content-ideas' as ViewTab, label: 'Content Briefs', icon: Lightbulb },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewTab(tab.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              viewTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
    </>
  )

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <TopBar />

        {/* ── OVERVIEW TAB ───────────────────────────────────────── */}
        {viewTab === 'overview' && (
          <div className="space-y-6">

            {/* Executive summary */}
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-primary">Executive Summary</h2>
              </div>
              <p className="text-base leading-relaxed text-foreground">{result.summary}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Search,     label: 'Real Keywords',  value: totalKeywords,                color: 'text-primary' },
                { icon: Layers,     label: 'Clusters',       value: result.clusters.length,       color: 'text-blue-600' },
                { icon: Zap,        label: 'Quick Wins',     value: result.quickWins.length,      color: 'text-emerald-600' },
                { icon: Lightbulb,  label: 'Content Briefs', value: result.contentIdeas.length,   color: 'text-amber-600' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-muted', s.color)}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  </div>
                  <p className={cn('mt-2 font-heading text-3xl font-bold tabular-nums', s.color)}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Distribution charts */}
            <div className="grid gap-3 sm:grid-cols-3">
              <DistributionBar
                title="Search Intent"
                data={distribution.intent}
                colorMap={{ informational: 'bg-blue-500', commercial: 'bg-amber-500', transactional: 'bg-emerald-500', navigational: 'bg-purple-500' }}
              />
              <DistributionBar
                title="Difficulty"
                data={distribution.difficulty}
                colorMap={{ easy: 'bg-emerald-500', medium: 'bg-amber-500', hard: 'bg-red-500' }}
              />
              <DistributionBar
                title="Opportunity"
                data={distribution.opportunity}
                colorMap={{ high: 'bg-primary', medium: 'bg-muted-foreground/50', low: 'bg-muted' }}
              />
            </div>

            {/* Strategy tips */}
            {result.strategyTips.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <h2 className="font-heading text-base font-bold text-foreground">Strategic Recommendations</h2>
                </div>
                <ol className="space-y-2.5">
                  {result.strategyTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                      <span className="text-sm leading-relaxed text-foreground">{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Three-column highlights */}
            <div className="grid gap-4 lg:grid-cols-3">

              {/* Quick wins */}
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-heading text-sm font-bold text-foreground">Quick Wins</h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">Easy difficulty + buying intent</p>
                <ul className="space-y-1.5">
                  {result.quickWins.length === 0 ? (
                    <li className="text-xs text-muted-foreground">No quick wins identified.</li>
                  ) : (
                    result.quickWins.map((kw, i) => (
                      <li key={i} className="group flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 text-xs">
                        <span className="flex-1 truncate font-medium text-foreground">{kw}</span>
                        <button onClick={() => copyText(kw)} className="opacity-0 transition-opacity group-hover:opacity-100">
                          <Copy className="h-3 w-3 text-muted-foreground hover:text-primary" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Trending */}
              <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-600" />
                  <h3 className="font-heading text-sm font-bold text-foreground">Trending Topics</h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">Timely / 2025 / fresh angles</p>
                <ul className="space-y-1.5">
                  {result.trendingTopics.length === 0 ? (
                    <li className="text-xs text-muted-foreground">No trending angles found.</li>
                  ) : (
                    result.trendingTopics.map((kw, i) => (
                      <li key={i} className="group flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 text-xs">
                        <span className="flex-1 truncate font-medium text-foreground">{kw}</span>
                        <button onClick={() => copyText(kw)} className="opacity-0 transition-opacity group-hover:opacity-100">
                          <Copy className="h-3 w-3 text-muted-foreground hover:text-primary" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* PAA */}
              <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <h3 className="font-heading text-sm font-bold text-foreground">People Also Ask</h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">Question-style targets</p>
                <ul className="space-y-1.5">
                  {result.questions.length === 0 ? (
                    <li className="text-xs text-muted-foreground">No questions identified.</li>
                  ) : (
                    result.questions.slice(0, 12).map((q, i) => (
                      <li key={i} className="group flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 text-xs">
                        <span className="flex-1 truncate font-medium text-foreground">{q}</span>
                        <button onClick={() => copyText(q)} className="opacity-0 transition-opacity group-hover:opacity-100">
                          <Copy className="h-3 w-3 text-muted-foreground hover:text-primary" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* ── CLUSTERS TAB ───────────────────────────────────────── */}
        {viewTab === 'clusters' && (
          <div className="grid gap-4 md:grid-cols-2">
            {result.clusters.map((c) => {
              const trafficColor =
                c.estimatedTrafficPotential === 'high'   ? 'bg-emerald-100 text-emerald-700' :
                c.estimatedTrafficPotential === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                          'bg-muted text-muted-foreground'
              return (
                <div key={c.name} className="rounded-3xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-bold text-foreground">{c.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                    </div>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', trafficColor)}>
                      {c.estimatedTrafficPotential} traffic
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Primary keyword</p>
                      <p className="mt-0.5 truncate text-sm font-bold text-primary">{c.primaryKeyword}</p>
                    </div>
                    <button onClick={() => copyText(c.primaryKeyword)} className="ml-2 shrink-0 rounded-lg border border-primary/20 bg-background p-1.5 text-primary hover:bg-primary/10">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {c.keywords.length} keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.keywords.slice(0, 12).map((k) => (
                        <button
                          key={k.keyword}
                          onClick={() => copyText(k.keyword)}
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all',
                            copied === k.keyword
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-border bg-background text-foreground hover:border-primary/40 hover:text-primary',
                          )}
                        >
                          {k.keyword}
                        </button>
                      ))}
                      {c.keywords.length > 12 && (
                        <button
                          onClick={() => { setActiveCluster(c.name); setViewTab('all-keywords') }}
                          className="rounded-full border border-dashed border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-primary"
                        >
                          +{c.keywords.length - 12} more →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── ALL KEYWORDS TAB ───────────────────────────────────── */}
        {viewTab === 'all-keywords' && (
          <div className="space-y-4">
            {/* Cluster pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveCluster(null)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                  activeCluster === null ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                All ({totalKeywords})
              </button>
              {result.clusters.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setActiveCluster(c.name === activeCluster ? null : c.name)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                    activeCluster === c.name ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c.name} ({c.keywords.length})
                </button>
              ))}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search keywords…"
                  className="w-full rounded-lg border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value as IntentFilter)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground">
                <option value="all">All intents</option>
                <option value="informational">Informational</option>
                <option value="commercial">Commercial</option>
                <option value="transactional">Transactional</option>
                <option value="navigational">Navigational</option>
              </select>
              <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value as DiffFilter)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground">
                <option value="all">All difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select value={oppFilter} onChange={(e) => setOppFilter(e.target.value as OppFilter)} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground">
                <option value="all">All opportunity</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {(intentFilter !== 'all' || diffFilter !== 'all' || oppFilter !== 'all' || search) && (
                <button
                  onClick={() => { setIntentFilter('all'); setDiffFilter('all'); setOppFilter('all'); setSearch('') }}
                  className="flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
              <p className="ml-auto text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredKeywords.length}</span> of {totalKeywords}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="max-h-[640px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-card">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keyword</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Intent</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Opportunity</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Content</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeywords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <p className="text-sm text-muted-foreground">No keywords match the current filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredKeywords.map((k, i) => (
                        <tr key={`${k.keyword}-${i}`} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium text-foreground">{k.keyword}</td>
                          <td className="px-4 py-3">
                            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', intentColors[k.intent] ?? 'border-border bg-muted text-muted-foreground')}>
                              {k.intent}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', diffColors[k.difficulty] ?? 'border-border bg-muted text-muted-foreground')}>
                              {k.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', oppColors[k.opportunity] ?? 'border-border bg-muted text-muted-foreground')}>
                              {k.opportunity}
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 text-xs capitalize text-muted-foreground md:table-cell">{k.contentType}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => copyText(k.keyword)}
                              className={cn(
                                'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors',
                                copied === k.keyword
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                  : 'border-border bg-background text-muted-foreground hover:text-primary',
                              )}
                            >
                              <Copy className="h-3 w-3" />
                              {copied === k.keyword ? 'Copied!' : 'Copy'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENT IDEAS TAB ──────────────────────────────────── */}
        {viewTab === 'content-ideas' && (
          <div className="grid gap-4 md:grid-cols-2">
            {result.contentIdeas.map((idea, i) => {
              const expanded = expandedIdea === i
              return (
                <div key={i} className="overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-md">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-base font-bold leading-tight text-foreground">{idea.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          /{idea.slug}
                        </p>
                      </div>
                    </div>

                    {/* Hook */}
                    <p className="mt-4 text-sm leading-relaxed text-foreground">{idea.hook}</p>

                    {/* Meta row */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', intentColors[idea.intent] ?? 'border-border bg-muted text-muted-foreground')}>
                        {idea.intent}
                      </span>
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', diffColors[idea.difficulty] ?? 'border-border bg-muted text-muted-foreground')}>
                        {idea.difficulty}
                      </span>
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground">
                        {idea.contentType}
                      </span>
                      <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        ~{idea.estimatedWordCount.toLocaleString()} words
                      </span>
                    </div>

                    {/* Target keyword */}
                    <div className="mt-4 rounded-xl bg-primary/5 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Target keyword</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-primary">{idea.targetKeyword}</p>
                        <button onClick={() => copyText(idea.targetKeyword)} className="shrink-0 rounded-lg border border-primary/20 bg-background p-1.5 text-primary hover:bg-primary/10">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Audience */}
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-background p-2.5">
                      <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Audience</p>
                        <p className="text-xs text-foreground">{idea.audience}</p>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedIdea(expanded ? null : i)}
                      className="mt-4 flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50"
                    >
                      <span>{expanded ? 'Hide outline & supporting keywords' : 'Show outline & supporting keywords'}</span>
                      <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')} />
                    </button>
                  </div>

                  {/* Expanded body */}
                  {expanded && (
                    <div className="space-y-4 border-t border-border bg-muted/20 p-5">
                      {/* Outline */}
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <BookOpen className="h-3 w-3" /> Article outline (H2s)
                        </p>
                        <ol className="space-y-1.5">
                          {idea.outline.map((h, j) => (
                            <li key={j} className="flex items-start gap-2 rounded-lg bg-card px-3 py-2 text-xs">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">{j + 1}</span>
                              <span className="font-medium text-foreground">{h}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Supporting keywords */}
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supporting / LSI keywords</p>
                        <div className="flex flex-wrap gap-1.5">
                          {idea.supportingKeywords.map((sk) => (
                            <button
                              key={sk}
                              onClick={() => copyText(sk)}
                              className={cn(
                                'rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all',
                                copied === sk
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                  : 'border-border bg-card text-foreground hover:border-primary/40 hover:text-primary',
                              )}
                            >
                              {sk}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Copy full brief */}
                      <button
                        onClick={() => copyText(
                          `Title: ${idea.title}\nSlug: /${idea.slug}\nTarget keyword: ${idea.targetKeyword}\nSupporting keywords: ${idea.supportingKeywords.join(', ')}\nIntent: ${idea.intent}\nContent type: ${idea.contentType}\nWord count: ~${idea.estimatedWordCount}\nDifficulty: ${idea.difficulty}\nAudience: ${idea.audience}\nHook: ${idea.hook}\nOutline:\n${idea.outline.map((h, j) => `  ${j + 1}. ${h}`).join('\n')}`
                        )}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        <Copy className="h-3 w-3" />
                        Copy full brief
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Honest disclaimer */}
        <div className="mt-8 flex items-start gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Keywords sourced from real Google + YouTube + Wikipedia Autocomplete. Intent, difficulty, and opportunity are AI-classified estimates — for exact search volumes, validate top picks in Google Keyword Planner.
          </span>
        </div>
      </div>
    </section>
  )
}
