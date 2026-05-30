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
  { label: 'Fetching real Google Autocomplete suggestions…', icon: Search },
  { label: 'Expanding with question prefixes & modifiers…',  icon: Layers },
  { label: 'Classifying intent for each keyword…',           icon: Target },
  { label: 'Grouping into thematic clusters…',               icon: Layers },
  { label: 'Generating content ideas…',                      icon: Lightbulb },
]

type Stage = 'input' | 'loading' | 'results'
type IntentFilter = 'all' | 'informational' | 'commercial' | 'transactional' | 'navigational'
type DiffFilter   = 'all' | 'easy' | 'medium' | 'hard'

const intentColors: Record<string, string> = {
  informational: 'bg-blue-100 text-blue-700',
  commercial:    'bg-amber-100 text-amber-700',
  transactional: 'bg-emerald-100 text-emerald-700',
  navigational:  'bg-purple-100 text-purple-700',
}
const diffColors: Record<string, string> = {
  easy:   'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-700',
}

export default function KeywordResearchTool() {
  const [seed, setSeed]           = useState('')
  const [country, setCountry]     = useState('us')
  const [niche, setNiche]         = useState('')
  const [stage, setStage]         = useState<Stage>('input')
  const [loadingStep, setLoadingStep] = useState(0)
  const [result, setResult]       = useState<KeywordResearchResult | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [copied, setCopied]       = useState<string | null>(null)
  const [intentFilter, setIntentFilter] = useState<IntentFilter>('all')
  const [diffFilter, setDiffFilter]     = useState<DiffFilter>('all')
  const [activeCluster, setActiveCluster] = useState<string | null>(null)

  async function runResearch() {
    if (seed.trim().length < 2) return
    setError(null)
    setStage('loading')
    setLoadingStep(0)

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1))
    }, 1100)

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
    setIntentFilter('all')
    setDiffFilter('all')
    setActiveCluster(null)
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  function copyAllVisible() {
    const text = filteredKeywords.map((k) => k.keyword).join('\n')
    copyText(text)
  }

  function downloadCsv() {
    if (!result) return
    const rows = [
      ['Keyword', 'Cluster', 'Intent', 'Difficulty', 'Content Type'],
      ...result.clusters.flatMap((c) =>
        c.keywords.map((k) => [k.keyword, c.name, k.intent, k.difficulty, k.contentType]),
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

  // Filter all keywords across clusters
  const filteredKeywords = useMemo(() => {
    if (!result) return [] as Array<{ keyword: string; intent: string; difficulty: string; contentType: string; cluster: string }>
    return result.clusters.flatMap((c) =>
      c.keywords
        .filter((k) => intentFilter === 'all' || k.intent === intentFilter)
        .filter((k) => diffFilter === 'all' || k.difficulty === diffFilter)
        .filter(() => activeCluster === null || c.name === activeCluster)
        .map((k) => ({ ...k, cluster: c.name })),
    )
  }, [result, intentFilter, diffFilter, activeCluster])

  // ── INPUT STAGE ────────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Search className="h-3 w-3" />
              Real Google data · AI clustering · 100% Free
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Free Keyword Research Tool
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              Pull real keyword ideas straight from Google Autocomplete, then let AI cluster them by intent, difficulty, and content opportunity — instantly.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Search,     label: 'Real Google data' },
              { icon: Target,     label: 'Intent classified' },
              { icon: Layers,     label: 'Smart clusters' },
              { icon: Lightbulb,  label: 'Content ideas' },
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
                    Niche / Industry <span className="text-muted-foreground font-normal">(optional)</span>
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
              No sign-up required · Powered by Google Autocomplete + GPT-4o
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
          <p className="mt-1 text-sm text-muted-foreground">Pulling real Google data · 10–20 seconds</p>
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

  const totalKeywords = result.clusters.reduce((s, c) => s + c.keywords.length, 0)

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Keyword Research: <span className="text-primary">{result.seed}</span>
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {totalKeywords} keywords · {result.clusters.length} clusters · {result.questions.length} questions
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              New
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
        </div>

        {/* Stats cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Search,     label: 'Real Keywords',  value: totalKeywords },
            { icon: Layers,     label: 'Clusters',       value: result.clusters.length },
            { icon: HelpCircle, label: 'Questions',      value: result.questions.length },
            { icon: Lightbulb,  label: 'Content Ideas',  value: result.contentIdeas.length },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              </div>
              <p className="mt-2 font-heading text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Cluster pills */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Clusters
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCluster(null)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                activeCluster === null
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              All ({totalKeywords})
            </button>
            {result.clusters.map((c) => (
              <button
                key={c.name}
                onClick={() => setActiveCluster(c.name === activeCluster ? null : c.name)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                  activeCluster === c.name
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {c.name} ({c.keywords.length})
              </button>
            ))}
          </div>
        </div>

        {/* Filters + actions */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Filters:
          </div>

          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value as IntentFilter)}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="all">All intents</option>
            <option value="informational">Informational</option>
            <option value="commercial">Commercial</option>
            <option value="transactional">Transactional</option>
            <option value="navigational">Navigational</option>
          </select>

          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value as DiffFilter)}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="all">All difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {(intentFilter !== 'all' || diffFilter !== 'all') && (
            <button
              onClick={() => { setIntentFilter('all'); setDiffFilter('all') }}
              className="flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}

          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredKeywords.length}</span> keywords
          </p>

          <button
            onClick={copyAllVisible}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Copy className="h-3 w-3" />
            Copy all visible
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* ── Keywords table ── */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="max-h-[640px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keyword</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Intent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Content</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeywords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <p className="text-sm text-muted-foreground">No keywords match the current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredKeywords.map((k, i) => (
                      <tr key={`${k.keyword}-${i}`} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium text-foreground">{k.keyword}</td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', intentColors[k.intent] ?? 'bg-muted text-muted-foreground')}>
                            {k.intent}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', diffColors[k.difficulty] ?? 'bg-muted text-muted-foreground')}>
                            {k.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground capitalize hidden md:table-cell">{k.contentType}</td>
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

          {/* ── Right column ── */}
          <div className="space-y-5">

            {/* Questions */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                <HelpCircle className="h-4 w-4 text-primary" />
                People Also Ask
              </h3>
              {result.questions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No question-style keywords found.</p>
              ) : (
                <ul className="space-y-2">
                  {result.questions.map((q, i) => (
                    <li key={i} className="group flex items-start gap-2 rounded-xl bg-background p-2.5 text-xs">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-foreground">{q}</span>
                      <button
                        onClick={() => copyText(q)}
                        className="opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                      >
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Content Ideas */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Content Ideas
              </h3>
              <div className="space-y-3">
                {result.contentIdeas.map((idea, i) => (
                  <div key={i} className="rounded-xl border border-border bg-background p-3">
                    <p className="font-heading text-xs font-semibold text-foreground">{idea.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{idea.angle}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {idea.targetKeyword}
                      </span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                        {idea.contentType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Honest disclaimer */}
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Keywords are pulled directly from Google Autocomplete (real, live). Intent and difficulty are AI-classified estimates — for exact search volume and competition scores, validate top picks in Google Keyword Planner.
          </span>
        </div>
      </div>
    </section>
  )
}
