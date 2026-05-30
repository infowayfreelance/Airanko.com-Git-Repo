'use client'

import { useState, useRef } from 'react'
import {
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  BookOpen,
  Wand2,
  BarChart3,
  User,
  Bot,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentAnalysis } from '@/app/api/content-analyzer/route'

// ─── Types ───────────────────────────────────────────────────────────────────

type Segment =
  | { type: 'plain'; text: string }
  | { type: 'grammar'; text: string; issueIndex: number }
  | { type: 'word'; text: string; issueIndex: number }

type ActiveTab = 'grammar' | 'words' | 'signals' | 'tips'
type Stage = 'input' | 'loading' | 'results'

// ─── Highlight builder ────────────────────────────────────────────────────────

function buildSegments(
  text: string,
  grammarIssues: ContentAnalysis['grammarIssues'],
  wordSuggestions: ContentAnalysis['wordSuggestions'],
): Segment[] {
  interface Range {
    start: number
    end: number
    type: 'grammar' | 'word'
    issueIndex: number
  }

  const ranges: Range[] = []
  const lower = text.toLowerCase()

  grammarIssues.forEach((issue, i) => {
    const search = issue.original.toLowerCase()
    let pos = 0
    while ((pos = lower.indexOf(search, pos)) !== -1) {
      ranges.push({ start: pos, end: pos + issue.original.length, type: 'grammar', issueIndex: i })
      pos += Math.max(1, issue.original.length)
    }
  })

  wordSuggestions.forEach((suggestion, i) => {
    const search = suggestion.original.toLowerCase()
    let pos = 0
    while ((pos = lower.indexOf(search, pos)) !== -1) {
      ranges.push({
        start: pos,
        end: pos + suggestion.original.length,
        type: 'word',
        issueIndex: i,
      })
      pos += Math.max(1, suggestion.original.length)
    }
  })

  // Sort: position first, then grammar > word for same position
  ranges.sort((a, b) => a.start - b.start || (a.type === 'grammar' ? -1 : 1))

  // Remove overlapping ranges (keep first / higher priority)
  const clean: Range[] = []
  let cursor = 0
  for (const r of ranges) {
    if (r.start >= cursor) {
      clean.push(r)
      cursor = r.end
    }
  }

  // Build flat segment array
  const segments: Segment[] = []
  let pos = 0
  for (const r of clean) {
    if (pos < r.start) segments.push({ type: 'plain', text: text.slice(pos, r.start) })
    segments.push({ type: r.type, text: text.slice(r.start, r.end), issueIndex: r.issueIndex })
    pos = r.end
  }
  if (pos < text.length) segments.push({ type: 'plain', text: text.slice(pos) })

  return segments
}

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreColor(score: number, invert = false) {
  const val = invert ? 100 - score : score
  if (val >= 70) return { text: 'text-emerald-600', bg: 'bg-emerald-100', stroke: '#10b981' }
  if (val >= 45) return { text: 'text-amber-600',   bg: 'bg-amber-100',   stroke: '#f59e0b' }
  return                { text: 'text-red-600',      bg: 'bg-red-100',     stroke: '#ef4444' }
}

function CircleGauge({
  score,
  label,
  sub,
  invert = false,
}: {
  score: number
  label: string
  sub: string
  invert?: boolean
}) {
  const c = scoreColor(score, invert)
  const r = 32
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-muted" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            strokeWidth="7"
            stroke={c.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <span className={cn('text-lg font-bold tabular-nums', c.text)}>{score}%</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

function ScoreBar({
  score,
  label,
  sub,
  invert = false,
}: {
  score: number
  label: string
  sub: string
  invert?: boolean
}) {
  const c = scoreColor(score, invert)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <span className={cn('text-sm font-bold tabular-nums', c.text)}>{score}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${score}%`, backgroundColor: c.stroke }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

// ─── Badge for grammar issue type ────────────────────────────────────────────

const issueTypeBadge: Record<string, string> = {
  grammar:     'bg-red-100 text-red-700',
  spelling:    'bg-orange-100 text-orange-700',
  punctuation: 'bg-purple-100 text-purple-700',
  style:       'bg-blue-100 text-blue-700',
}

// ─── Loading steps ────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  { label: 'Scanning for AI patterns…',       icon: Bot },
  { label: 'Checking grammar & spelling…',    icon: BookOpen },
  { label: 'Calculating readability score…',  icon: BarChart3 },
  { label: 'Finding word improvements…',      icon: Wand2 },
  { label: 'Generating your full report…',    icon: Sparkles },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlagiarismCheckerTool() {
  const [inputText, setInputText]       = useState('')
  const [stage, setStage]               = useState<Stage>('input')
  const [loadingStep, setLoadingStep]   = useState(0)
  const [result, setResult]             = useState<ContentAnalysis | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [activeTab, setActiveTab]       = useState<ActiveTab>('grammar')
  const [activeIssue, setActiveIssue]   = useState<{ type: 'grammar' | 'word'; index: number } | null>(null)
  const [showHighlights, setShowHighlights] = useState(true)
  const [copiedAlt, setCopiedAlt]       = useState<string | null>(null)
  const issueRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0

  // ── Run analysis ──────────────────────────────────────────────────────────

  async function analyze() {
    if (wordCount < 30) return
    setError(null)
    setStage('loading')
    setLoadingStep(0)

    // Animate steps while waiting
    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1))
    }, 900)

    try {
      const res = await fetch('/api/content-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      })

      clearInterval(interval)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Analysis failed.')
      }

      const data: ContentAnalysis = await res.json()
      setResult(data)
      setActiveTab('grammar')
      setActiveIssue(null)
      setStage('results')
    } catch (err: unknown) {
      clearInterval(interval)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStage('input')
    }
  }

  function reset() {
    setStage('input')
    setResult(null)
    setError(null)
    setActiveIssue(null)
    setLoadingStep(0)
  }

  function handleSegmentClick(type: 'grammar' | 'word', index: number) {
    setActiveIssue({ type, index })
    setActiveTab(type === 'grammar' ? 'grammar' : 'words')
    const key = `${type}-${index}`
    setTimeout(() => {
      issueRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text)
    setCopiedAlt(text)
    setTimeout(() => setCopiedAlt(null), 1500)
  }

  // ── Segments ──────────────────────────────────────────────────────────────

  const segments =
    result && showHighlights
      ? buildSegments(inputText, result.grammarIssues, result.wordSuggestions)
      : result
      ? [{ type: 'plain' as const, text: inputText }]
      : []

  // ── Input stage ───────────────────────────────────────────────────────────

  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3 w-3" />
              AI Content Detector + Grammar + Readability · Powered by GPT-4o
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              AI Content Detector & Grammar Checker
            </h1>
            <p className="mt-3 text-muted-foreground text-pretty leading-relaxed">
              Detect AI-written text, fix grammar mistakes, measure readability, and get precise word replacement suggestions — all in one analysis.
            </p>
          </div>

          {/* Feature badges */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {[
              { icon: Bot,       label: 'AI vs Human Detection' },
              { icon: BookOpen,  label: 'Grammar & Spelling' },
              { icon: BarChart3, label: 'Readability Score' },
              { icon: Wand2,     label: 'Word Replacements' },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <f.icon className="h-3.5 w-3.5 text-primary" />
                {f.label}
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Paste your content</label>
              <span
                className={cn(
                  'text-xs tabular-nums',
                  wordCount < 30
                    ? 'text-muted-foreground'
                    : wordCount > 2800
                    ? 'text-amber-600'
                    : 'text-emerald-600',
                )}
              >
                {wordCount} / 3,000 words
              </span>
            </div>

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your article, blog post, email, or any text here (minimum 30 words)…"
              className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={14}
            />

            {error && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                {wordCount < 30
                  ? `Need ${30 - wordCount} more words to analyze`
                  : 'Ready to analyze'}
              </p>
              <button
                onClick={analyze}
                disabled={wordCount < 30}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                Analyze Content
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Loading stage ─────────────────────────────────────────────────────────

  if (stage === 'loading') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg py-16 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
              <Sparkles className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Analyzing your content…</h2>
          <p className="mt-1 text-sm text-muted-foreground">{wordCount} words · may take 10–20 seconds</p>
          <div className="mt-8 space-y-3">
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
                    active ? 'border-primary/30 bg-primary/5 text-primary'      :
                             'border-transparent text-muted-foreground',
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <Icon className={cn('h-4 w-4 shrink-0', active && 'animate-pulse')} />
                  )}
                  {step.label}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // ── Results stage ─────────────────────────────────────────────────────────

  if (!result) return null

  const grammarCount = result.grammarIssues.length
  const wordsCount   = result.wordSuggestions.length

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Content Analysis Report</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {result.wordCount} words · {result.sentenceCount} sentences · avg {result.avgWordsPerSentence} words/sentence
            </p>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            New Analysis
          </button>
        </div>

        {/* Score row */}
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:grid-cols-4">
          <CircleGauge
            score={result.aiScore}
            label="AI Detected"
            sub={result.aiScore > 70 ? 'Likely AI-written' : result.aiScore > 40 ? 'Mixed signals' : 'Looks human'}
            invert
          />
          <CircleGauge
            score={result.humanScore}
            label="Human Score"
            sub={result.humanScore > 70 ? 'Authentic voice' : result.humanScore > 40 ? 'Some AI markers' : 'Heavily AI-like'}
          />
          <div className="col-span-2 flex flex-col justify-center gap-4 border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <ScoreBar
              score={result.readabilityScore}
              label={`Readability — ${result.readabilityLabel}`}
              sub={`${result.readabilityGrade} · ${result.readabilityScore >= 70 ? 'Easy to read' : result.readabilityScore >= 50 ? 'Standard' : 'Consider simplifying'}`}
            />
            <ScoreBar
              score={result.overallQuality}
              label="Overall Quality"
              sub={result.overallQuality >= 70 ? 'Well-written content' : result.overallQuality >= 50 ? 'Needs some polish' : 'Significant improvements needed'}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
        </div>

        {/* Main content area */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* ── Annotated text panel ── */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold text-foreground">Annotated Text</h2>
              <div className="flex items-center gap-3">
                {/* Legend */}
                <div className="hidden items-center gap-3 sm:flex">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-block h-2 w-6 rounded bg-red-200" />
                    Grammar
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-block h-2 w-6 rounded bg-amber-200" />
                    Word choice
                  </span>
                </div>
                <button
                  onClick={() => setShowHighlights((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  {showHighlights ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showHighlights ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-8">
              {segments.map((seg, i) => {
                if (seg.type === 'plain') {
                  return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{seg.text}</span>
                }
                const isActive =
                  activeIssue?.type === seg.type && activeIssue?.index === seg.issueIndex
                return (
                  <button
                    key={i}
                    onClick={() => handleSegmentClick(seg.type, seg.issueIndex)}
                    className={cn(
                      'cursor-pointer rounded-sm px-0.5 font-medium transition-all',
                      seg.type === 'grammar'
                        ? isActive
                          ? 'bg-red-300 text-red-900'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                        : isActive
                        ? 'bg-amber-300 text-amber-900'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200',
                    )}
                    title={
                      seg.type === 'grammar'
                        ? result.grammarIssues[seg.issueIndex]?.correction
                        : result.wordSuggestions[seg.issueIndex]?.alternatives.join(' / ')
                    }
                  >
                    {seg.text}
                  </button>
                )
              })}
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Click any highlighted word to see the suggestion in the panel →
            </p>
          </div>

          {/* ── Issues panel ── */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">

            {/* Tabs */}
            <div className="mb-5 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
              {([
                { id: 'grammar' as ActiveTab, label: 'Grammar',  count: grammarCount },
                { id: 'words'   as ActiveTab, label: 'Words',    count: wordsCount   },
                { id: 'signals' as ActiveTab, label: 'Signals',  count: null         },
                { id: 'tips'    as ActiveTab, label: 'Tips',     count: null         },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-xs font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                        tab.count > 0 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="max-h-[480px] overflow-y-auto pr-1 space-y-3">

              {/* Grammar tab */}
              {activeTab === 'grammar' && (
                <>
                  {result.grammarIssues.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      <p className="font-medium text-foreground">No grammar issues found!</p>
                      <p className="text-xs text-muted-foreground">Your content passes grammar checks.</p>
                    </div>
                  ) : (
                    result.grammarIssues.map((issue, i) => {
                      const key = `grammar-${i}`
                      const isActive = activeIssue?.type === 'grammar' && activeIssue?.index === i
                      return (
                        <div
                          key={i}
                          ref={(el) => { issueRefs.current[key] = el }}
                          className={cn(
                            'rounded-2xl border p-4 transition-all',
                            isActive ? 'border-red-300 bg-red-50' : 'border-border bg-background',
                          )}
                          onClick={() => setActiveIssue({ type: 'grammar', index: i })}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                                issueTypeBadge[issue.type] ?? 'bg-muted text-muted-foreground',
                              )}
                            >
                              {issue.type}
                            </span>
                            <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs">
                              <span className="text-muted-foreground line-through">{issue.original}</span>
                              {' → '}
                              <span className="font-semibold text-emerald-700">{issue.correction}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{issue.explanation}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </>
              )}

              {/* Words tab */}
              {activeTab === 'words' && (
                <>
                  {result.wordSuggestions.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      <p className="font-medium text-foreground">Word choices look great!</p>
                      <p className="text-xs text-muted-foreground">No weak words detected.</p>
                    </div>
                  ) : (
                    result.wordSuggestions.map((suggestion, i) => {
                      const key = `word-${i}`
                      const isActive = activeIssue?.type === 'word' && activeIssue?.index === i
                      return (
                        <div
                          key={i}
                          ref={(el) => { issueRefs.current[key] = el }}
                          className={cn(
                            'rounded-2xl border p-4 transition-all',
                            isActive ? 'border-amber-300 bg-amber-50' : 'border-border bg-background',
                          )}
                          onClick={() => setActiveIssue({ type: 'word', index: i })}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                              &ldquo;{suggestion.original}&rdquo;
                            </span>
                            <Wand2 className="h-3.5 w-3.5 text-amber-600" />
                          </div>
                          <p className="mb-2 text-xs text-muted-foreground">{suggestion.reason}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {suggestion.alternatives.map((alt) => (
                              <button
                                key={alt}
                                onClick={(e) => { e.stopPropagation(); copyText(alt) }}
                                className={cn(
                                  'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                                  copiedAlt === alt
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    : 'border-border bg-card text-foreground hover:border-primary/40 hover:text-primary',
                                )}
                              >
                                <Copy className="h-2.5 w-2.5" />
                                {copiedAlt === alt ? 'Copied!' : alt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  )}
                </>
              )}

              {/* Signals tab */}
              {activeTab === 'signals' && (
                <div className="space-y-4">
                  {result.aiSignals.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-amber-600" />
                        <h3 className="text-sm font-semibold text-foreground">AI Writing Signals</h3>
                      </div>
                      <ul className="space-y-2">
                        {result.aiSignals.map((signal, i) => (
                          <li key={i} className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            {signal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.humanSignals.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-semibold text-foreground">Human Writing Signals</h3>
                      </div>
                      <ul className="space-y-2">
                        {result.humanSignals.map((signal, i) => (
                          <li key={i} className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            {signal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tips tab */}
              {activeTab === 'tips' && (
                <ul className="space-y-2">
                  {result.improvementTips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 text-xs leading-relaxed"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-foreground">{tip}</span>
                    </li>
                  ))}
                  {result.improvementTips.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <Lightbulb className="h-8 w-8 text-amber-500" />
                      <p className="font-medium text-foreground">Content looks solid!</p>
                    </div>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
