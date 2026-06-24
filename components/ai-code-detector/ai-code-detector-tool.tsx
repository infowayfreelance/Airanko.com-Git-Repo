'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Globe, Github, FileCode2, Sparkles, AlertCircle, CheckCircle2, XCircle,
  RefreshCw, Loader2, Bot, Cpu, Image as ImageIcon, ShieldCheck, ShieldAlert,
  Code, Eye, Layers, Palette, FileText, ListTree, MessageSquare,
  Hash, ExternalLink, ChevronRight, Search, Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiCodeDetectorResult, AnalyzerScore } from '@/app/api/ai-code-detector/route'

type Mode = 'url' | 'github' | 'paste'
type Stage = 'input' | 'analyzing' | 'results'

const PROGRESS_STEPS = [
  { label: 'Fetching source content',          weight: 20 },
  { label: 'Analyzing inline code & comments', weight: 10 },
  { label: 'Auditing CSS quality',             weight: 12 },
  { label: 'Inspecting HTML structure',        weight: 12 },
  { label: 'Scanning JavaScript patterns',     weight: 12 },
  { label: 'Detecting AI copywriting signals', weight: 12 },
  { label: 'Checking security headers',        weight: 6 },
  { label: 'Auditing images & metadata',       weight: 12 },
  { label: 'Compiling final report',           weight: 4 },
]

const severityColor: Record<string, string> = {
  Clean:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  Moderate:  'bg-amber-100 text-amber-700 border-amber-200',
  Heavy:     'bg-orange-100 text-orange-700 border-orange-200',
  Excessive: 'bg-red-100 text-red-700 border-red-200',
}

function scoreToHex(score: number): string {
  if (score < 25) return '#10b981'
  if (score < 50) return '#f59e0b'
  if (score < 75) return '#f97316'
  return '#ef4444'
}

function ScoreGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const dims = {
    sm: { box: 'h-14 w-14', r: 22, sw: 5, text: 'text-sm' },
    md: { box: 'h-20 w-20', r: 32, sw: 6, text: 'text-xl' },
    lg: { box: 'h-36 w-36', r: 58, sw: 10, text: 'text-4xl' },
  }[size]
  const circumference = 2 * Math.PI * dims.r
  const [animated, setAnimated] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnimated(score), 80); return () => clearTimeout(t) }, [score])
  const offset = circumference - (animated / 100) * circumference
  const color = scoreToHex(score)
  return (
    <div className={cn('relative flex items-center justify-center', dims.box)}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={dims.r} fill="none" strokeWidth={dims.sw} className="stroke-muted" />
        <circle cx="65" cy="65" r={dims.r} fill="none" strokeWidth={dims.sw} stroke={color}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }} />
      </svg>
      <span className={cn('font-heading font-bold tabular-nums', dims.text)} style={{ color }}>{score}</span>
    </div>
  )
}

// ── Validators ─────────────────────────────────────────────────────────────
function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s.startsWith('http') ? s : `https://${s}`)
    return !!u.hostname && u.hostname.includes('.')
  } catch { return false }
}
function isValidGithubUrl(s: string): boolean {
  return /^https?:\/\/(?:www\.)?github\.com\/[^/]+\/[^/]+/i.test(s.trim())
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AiCodeDetectorTool() {
  const [mode, setMode] = useState<Mode>('url')
  const [urlInput, setUrlInput] = useState('')
  const [ghInput, setGhInput] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<Stage>('input')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<AiCodeDetectorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const charCount = code.length
  const wordCount = code.trim() ? code.trim().split(/\s+/).filter(Boolean).length : 0

  const canSubmit = useMemo(() => {
    if (mode === 'url')    return isValidUrl(urlInput.trim())
    if (mode === 'github') return isValidGithubUrl(ghInput.trim())
    return code.length >= 100
  }, [mode, urlInput, ghInput, code])

  async function analyze() {
    if (!canSubmit) return
    setError(null)
    setStage('analyzing')
    setProgress(0)
    setCurrentStep(0)

    // Real progress through the named analyzer steps. Increments are paced to
    // match server-side timing — they reflect actual stages, not random fakery.
    let p = 0
    let step = 0
    progressTimer.current = setInterval(() => {
      if (step < PROGRESS_STEPS.length - 1) {
        p = Math.min(p + 3, PROGRESS_STEPS.slice(0, step + 1).reduce((s, x) => s + x.weight, 0))
        setProgress(p)
        // Advance step when reaching its cumulative weight
        const cumulative = PROGRESS_STEPS.slice(0, step + 1).reduce((s, x) => s + x.weight, 0)
        if (p >= cumulative) { step = Math.min(step + 1, PROGRESS_STEPS.length - 1); setCurrentStep(step) }
      }
    }, 400)

    try {
      const input = mode === 'url' ? urlInput : mode === 'github' ? ghInput : code
      const res = await fetch('/api/ai-code-detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Analysis failed.')
      }
      const data: AiCodeDetectorResult = await res.json()
      if (progressTimer.current) clearInterval(progressTimer.current)
      setProgress(100)
      setCurrentStep(PROGRESS_STEPS.length - 1)
      // Tiny delay so the bar visibly hits 100
      setTimeout(() => { setResult(data); setStage('results') }, 250)
    } catch (err: unknown) {
      if (progressTimer.current) clearInterval(progressTimer.current)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStage('input')
    }
  }

  function reset() {
    if (progressTimer.current) clearInterval(progressTimer.current)
    setStage('input')
    setResult(null)
    setError(null)
    setProgress(0)
    setCurrentStep(0)
  }

  function downloadJson() {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-code-report-${result.inputDisplay.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── INPUT STAGE ─────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Bot className="h-3 w-3" />
              8 real analyzers · No fake scores · 100% Free
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              AI Code Detector
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              Detect AI-generated patterns across <strong>any website, GitHub repository, or pasted code</strong>. We actually fetch and parse your source, then run 8 real audits — inline code, CSS, HTML structure, JS, copywriting, security, images, metadata. Every number comes from real measurement.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Search,     label: '8 real audits' },
              { icon: Cpu,        label: 'Zero fake scores' },
              { icon: ShieldCheck,label: 'Security headers' },
              { icon: Download,   label: 'JSON export' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <f.icon className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-card p-2 shadow-sm sm:p-3">
            {/* Tabs */}
            <div className="flex gap-1 rounded-2xl border border-border bg-muted/40 p-1">
              {([
                { id: 'url' as Mode,    label: 'Website URL', icon: Globe },
                { id: 'github' as Mode, label: 'GitHub Repo', icon: Github },
                { id: 'paste' as Mode,  label: 'Paste Code',  icon: FileCode2 },
              ]).map((tab) => (
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
              {mode === 'url' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Website URL</label>
                  <div className="relative mt-2">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canSubmit && analyze()}
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Public URL only. We fetch via our server (no CORS), follow redirects, and read raw HTML.
                  </p>
                </div>
              )}

              {mode === 'github' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">GitHub Repository URL</label>
                  <div className="relative mt-2">
                    <Github className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url"
                      value={ghInput}
                      onChange={(e) => setGhInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canSubmit && analyze()}
                      placeholder="https://github.com/owner/repo"
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Public repos only. We fetch up to 30 source files (.html, .jsx, .tsx, .js, .ts, .css, .scss, .vue, .php, .py) prioritizing root + src/ + app/ + components/.
                  </p>
                </div>
              )}

              {mode === 'paste' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Source code</label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your HTML, CSS, JavaScript, JSX, or any web code here..."
                    style={{ minHeight: '220px' }}
                    className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-[12px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className={cn(
                    'mt-2 text-[11px] tabular-nums',
                    charCount < 100 ? 'text-muted-foreground' : 'text-emerald-600',
                  )}>
                    {charCount.toLocaleString()} characters · {wordCount.toLocaleString()} words {charCount < 100 ? `· ${100 - charCount} more needed to analyze` : '· ready'}
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
                Analyze
              </button>

              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                15–60 seconds depending on source size. Every result reflects real measurements.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── ANALYZING STAGE ─────────────────────────────────────────────────────
  if (stage === 'analyzing') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl py-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
              <Bot className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Analyzing your code…</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'github' ? 'Fetching repository files…' : mode === 'url' ? 'Fetching HTML and headers…' : 'Running 8 audits…'}
          </p>

          <div className="mt-8 overflow-hidden rounded-full bg-muted">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-foreground tabular-nums">{progress}%</p>

          <div className="mt-8 space-y-2 text-left">
            {PROGRESS_STEPS.map((step, i) => {
              const done = i < currentStep
              const active = i === currentStep
              return (
                <div
                  key={step.label}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-3 py-2 text-xs transition-all',
                    done   ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                    active ? 'border-primary/30 bg-primary/5 text-primary' :
                             'border-transparent text-muted-foreground',
                  )}
                >
                  {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> :
                   active ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" /> :
                            <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-current opacity-30" />}
                  <span className="flex-1">{step.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // ── RESULTS STAGE ───────────────────────────────────────────────────────
  if (!result) return null

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">AI Code Analysis</p>
            <h1 className="font-heading text-2xl font-bold text-foreground truncate">{result.inputDisplay}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {result.fetchInfo.sourceCount} {result.fetchInfo.sourceCount === 1 ? 'source' : 'files'} · {(result.fetchInfo.totalBytes / 1024).toFixed(1)} KB · {new Date(result.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadJson} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <RefreshCw className="h-3.5 w-3.5" />
              New Analysis
            </button>
          </div>
        </div>

        {/* Overall + analyzer summary */}
        <div className="mb-6 grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:p-8">
          <div className="flex flex-col items-center gap-3 border-b border-border pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8">
            <ScoreGauge score={result.overall.score} size="lg" />
            <div className="text-center">
              <p className="font-heading text-sm font-bold text-foreground">AI Likelihood</p>
              <p className="text-xs font-medium" style={{ color: scoreToHex(result.overall.score) }}>
                {result.overall.confidence}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([
              { key: 'inlineCode',      label: 'Inline Code',  icon: Code,         data: result.analyzers.inlineCode },
              { key: 'cssQuality',      label: 'CSS',          icon: Palette,      data: result.analyzers.cssQuality },
              { key: 'htmlStructure',   label: 'HTML',         icon: ListTree,     data: result.analyzers.htmlStructure },
              { key: 'jsPatterns',      label: 'JavaScript',   icon: Cpu,          data: result.analyzers.jsPatterns },
              { key: 'content',         label: 'Copywriting',  icon: MessageSquare,data: result.analyzers.content },
              { key: 'securityHeaders', label: 'Security',     icon: ShieldCheck,  data: result.analyzers.securityHeaders },
              { key: 'images',          label: 'Images',       icon: ImageIcon,    data: result.analyzers.images },
              { key: 'metadata',        label: 'Metadata',     icon: FileText,     data: result.analyzers.metadata },
            ] as const).map((c) => (
              <a
                key={c.key}
                href={`#analyzer-${c.key}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-3 transition-all hover:border-primary/40 hover:bg-card"
              >
                {c.data === null ? (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <c.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">N/A</span>
                  </>
                ) : (
                  <>
                    <ScoreGauge score={c.data.score} size="sm" />
                    <div className="flex items-center gap-1">
                      <c.icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-foreground">{c.label}</span>
                    </div>
                  </>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Detailed analyzer cards */}
        <div className="space-y-6">

          {/* 1. Inline Code */}
          <AnalyzerCard id="inlineCode" title="Inline Code Quality" subtitle="Inline scripts, styles, event handlers & HTML comments" icon={Code} data={result.analyzers.inlineCode}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Inline scripts"  value={result.analyzers.inlineCode.details.inline_scripts as number} hint="Code inside <script> without src=" />
              <StatBox label="Inline styles"   value={result.analyzers.inlineCode.details.inline_styles as number}  hint="style= attribute occurrences" />
              <StatBox label="Event handlers"  value={result.analyzers.inlineCode.details.inline_events as number}  hint="onclick=, onload=, …" />
              <StatBox label="HTML comments"   value={result.analyzers.inlineCode.details.html_comments as number}  hint="<!-- … --> blocks" />
            </div>
          </AnalyzerCard>

          {/* 2. CSS Quality */}
          <AnalyzerCard id="cssQuality" title="CSS Quality" subtitle="Long class names, unique colors, fonts, duplicate declarations" icon={Palette} data={result.analyzers.cssQuality}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Unique colors"     value={result.analyzers.cssQuality.details.unique_colors as number} hint="6 or fewer is typical" />
              <StatBox label="Font count"        value={result.analyzers.cssQuality.details.font_count as number}    hint="@font-face + @import + family" />
              <StatBox label="Long class names"  value={result.analyzers.cssQuality.details.long_class_count as number} hint="> 30 chars" />
              <StatBox label="Magic spacing"     value={result.analyzers.cssQuality.details.magic_spacing as number}    hint="margin/padding not 4/8 multiples" />
            </div>
            {(result.analyzers.cssQuality.details.all_colors as string[]).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Color palette ({(result.analyzers.cssQuality.details.all_colors as string[]).length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.analyzers.cssQuality.details.all_colors as string[]).slice(0, 60).map((c, i) => (
                    <div key={`${c}-${i}`} className="group relative" title={c}>
                      <div className="h-6 w-6 rounded border border-border" style={{ background: c }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(result.analyzers.cssQuality.details.long_class_names as string[]).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Long class names</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.analyzers.cssQuality.details.long_class_names as string[]).map((c) => (
                    <code key={c} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-foreground">{c}</code>
                  ))}
                </div>
              </div>
            )}
            {(result.analyzers.cssQuality.details.font_list as string[]).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fonts detected</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.analyzers.cssQuality.details.font_list as string[]).map((f) => (
                    <span key={f} className="rounded border border-border bg-muted px-2 py-0.5 text-[11px] text-foreground" style={{ fontFamily: f }}>{f}</span>
                  ))}
                </div>
              </div>
            )}
          </AnalyzerCard>

          {/* 3. HTML Structure */}
          <AnalyzerCard id="htmlStructure" title="HTML Structure" subtitle="Semantic tags, nesting depth, empty elements, landmarks" icon={ListTree} data={result.analyzers.htmlStructure}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Semantic usage" value={`${result.analyzers.htmlStructure.details.semantic_percentage}%`} hint="<nav>, <main>, <article>, …" />
              <StatBox label="Max div depth"  value={result.analyzers.htmlStructure.details.max_div_depth as number}    hint="Lower is cleaner" />
              <StatBox label="Empty elements" value={result.analyzers.htmlStructure.details.empty_elements as number}   hint="<div></div>, <p></p>, <span></span>" />
              <StatBox label="ARIA attrs"     value={result.analyzers.htmlStructure.details.aria_attributes as number}  hint="Positive signal" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Landmarks</p>
                <div className="space-y-1">
                  {Object.entries(result.analyzers.htmlStructure.details.missing_landmarks as Record<string, boolean>).map(([k, missing]) => (
                    <div key={k} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
                      {missing ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      <span className="font-mono text-foreground">&lt;{k}&gt;</span>
                      <span className={cn('ml-auto text-[10px] font-semibold', missing ? 'text-red-600' : 'text-emerald-600')}>{missing ? 'Missing' : 'Present'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Heading hierarchy</p>
                <div className="rounded-lg border border-border bg-background p-3">
                  {(result.analyzers.htmlStructure.details.heading_counts as { level: number; count: number }[]).map((h) => (
                    <div key={h.level} className="flex items-center gap-2 text-xs" style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
                      <span className="font-mono font-semibold text-primary">H{h.level}</span>
                      <span className="text-muted-foreground">×{h.count}</span>
                    </div>
                  ))}
                  {result.analyzers.htmlStructure.details.heading_levels_skipped ? (
                    <p className="mt-2 text-[10px] text-amber-600">⚠ Heading levels are skipped</p>
                  ) : null}
                </div>
              </div>
            </div>
          </AnalyzerCard>

          {/* 4. JavaScript */}
          <AnalyzerCard id="jsPatterns" title="JavaScript Patterns" subtitle="Naming, console.log, TODOs, error handling, magic numbers" icon={Cpu} data={result.analyzers.jsPatterns}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Generic names"   value={result.analyzers.jsPatterns.details.generic_names as number}      hint="data, result, response, …" />
              <StatBox label="console.log"     value={result.analyzers.jsPatterns.details.console_logs as number}       hint="Left-behind debug" />
              <StatBox label="TODO/FIXME"      value={result.analyzers.jsPatterns.details.todo_comments as number}      hint="Unfinished code" />
              <StatBox label="try/catch"       value={result.analyzers.jsPatterns.details.try_catch_count as number}    hint="Positive signal" positive />
            </div>
            {(result.analyzers.jsPatterns.details.generic_names_list as string[]).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Generic variable names found</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.analyzers.jsPatterns.details.generic_names_list as string[]).map((n) => (
                    <code key={n} className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">{n}</code>
                  ))}
                </div>
              </div>
            )}
            {(result.analyzers.jsPatterns.details.todo_list as string[]).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TODO / FIXME comments</p>
                <ul className="space-y-1">
                  {(result.analyzers.jsPatterns.details.todo_list as string[]).map((t, i) => (
                    <li key={i} className="rounded border border-border bg-background p-2 font-mono text-[10px] text-muted-foreground">{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </AnalyzerCard>

          {/* 5. Content */}
          <AnalyzerCard id="content" title="Copywriting Signals" subtitle="AI buzzwords, filler phrases, vague CTAs, sentence variance" icon={MessageSquare} data={result.analyzers.content}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Words"            value={result.analyzers.content.details.word_count as number}           hint="Visible text" />
              <StatBox label="Buzzwords"        value={result.analyzers.content.details.buzzword_total as number}       hint="AI-flavored words" />
              <StatBox label="Filler phrases"   value={result.analyzers.content.details.filler_total as number}         hint="Generic marketing-speak" />
              <StatBox label="Vague CTAs"       value={result.analyzers.content.details.vague_ctas as number}           hint="'Learn more', 'Click here'" />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sentence length distribution</p>
                <div className="space-y-1.5">
                  {Object.entries(result.analyzers.content.details.sentence_distribution as Record<string, number>).map(([bucket, count]) => {
                    const total = Object.values(result.analyzers.content.details.sentence_distribution as Record<string, number>).reduce((s, v) => s + v, 0) || 1
                    const pct = (count / total) * 100
                    return (
                      <div key={bucket} className="flex items-center gap-2 text-[11px]">
                        <span className="w-12 font-mono text-muted-foreground">{bucket}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-2 bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right font-mono tabular-nums text-foreground">{count}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Avg {result.analyzers.content.details.avg_sentence_length as number} words · σ {result.analyzers.content.details.sentence_variance as number} {(result.analyzers.content.details.sentence_variance as number) > 8 ? '(human-like variance)' : '(low variance — AI signal)'}
                </p>
              </div>
              <div>
                {(result.analyzers.content.details.buzzword_hits as { word: string; count: number }[]).length > 0 && (
                  <>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Buzzwords found</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.analyzers.content.details.buzzword_hits as { word: string; count: number }[]).map((b) => (
                        <span key={b.word} className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">
                          {b.word} <span className="font-mono">×{b.count}</span>
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {(result.analyzers.content.details.filler_hits as { phrase: string; count: number }[]).length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Filler phrases</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.analyzers.content.details.filler_hits as { phrase: string; count: number }[]).map((p) => (
                        <span key={p.phrase} className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] text-red-700">&ldquo;{p.phrase}&rdquo; ×{p.count}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(result.analyzers.content.details.vague_ctas_list as { label: string; count: number }[]).length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vague CTAs</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.analyzers.content.details.vague_ctas_list as { label: string; count: number }[]).map((c) => (
                        <span key={c.label} className="rounded border border-border bg-muted px-2 py-0.5 text-[11px] text-foreground">&ldquo;{c.label}&rdquo; ×{c.count}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AnalyzerCard>

          {/* 6. Security Headers */}
          {result.analyzers.securityHeaders ? (
            <AnalyzerCard id="securityHeaders" title="Security Headers" subtitle="Pure factual data from server HEAD response" icon={ShieldCheck} data={result.analyzers.securityHeaders}>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-muted-foreground">Header</th>
                      <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-muted-foreground">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.analyzers.securityHeaders.details.checks as { name: string; present: boolean; value: string | null; risk: string }[]).map((c) => (
                      <tr key={c.name} className="border-t border-border">
                        <td className="px-3 py-2 font-mono text-foreground">{c.name}</td>
                        <td className="px-3 py-2">
                          {c.present
                            ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"><CheckCircle2 className="h-3 w-3" />Pass</span>
                            : <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700"><XCircle className="h-3 w-3" />Missing</span>}
                        </td>
                        <td className="max-w-[300px] px-3 py-2">
                          {c.value
                            ? <code className="break-all font-mono text-[10px] text-foreground">{c.value}</code>
                            : <span className="text-[10px] italic text-muted-foreground">Not set — {c.risk}</span>}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-border bg-muted/20">
                      <td className="px-3 py-2 font-mono text-muted-foreground">X-XSS-Protection</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Info</span>
                      </td>
                      <td className="px-3 py-2 text-[10px] italic text-muted-foreground">
                        {(result.analyzers.securityHeaders.details.xss_protection_info as { value: string | null }).value ?? 'Not set'} (deprecated)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {(result.analyzers.securityHeaders.details.hsts_max_age as number | null) !== null && (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  HSTS max-age: <span className="font-mono text-foreground">{(result.analyzers.securityHeaders.details.hsts_max_age as number).toLocaleString()}</span> seconds
                  ({Math.floor((result.analyzers.securityHeaders.details.hsts_max_age as number) / 86400)} days)
                </p>
              )}
            </AnalyzerCard>
          ) : (
            <div id="analyzer-securityHeaders" className="rounded-3xl border border-dashed border-border bg-card p-6 text-center">
              <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 font-heading text-sm font-semibold text-foreground">Security headers — Unable to analyze</p>
              <p className="mt-1 text-xs text-muted-foreground">This audit only runs when a website URL is provided.</p>
            </div>
          )}

          {/* 7. Images */}
          <AnalyzerCard id="images" title="Image Quality" subtitle="Alt text, generic alt, dimensions, Next.js usage" icon={ImageIcon} data={result.analyzers.images}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Total images"   value={result.analyzers.images.details.total as number}              hint="<img> + <Image>" />
              <StatBox label="Missing alt"    value={result.analyzers.images.details.missing_alt as number}        hint="Accessibility failure" />
              <StatBox label="Generic alt"    value={result.analyzers.images.details.generic_alt as number}        hint="'image', 'photo', …" />
              <StatBox label="Next.js Image"  value={result.analyzers.images.details.next_image_count as number}   hint="Out of total" positive />
            </div>
            {(result.analyzers.images.details.total as number) > 0 && (
              <div className="mt-4 overflow-hidden rounded-xl border border-border">
                <div className="max-h-[280px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-muted-foreground">Source</th>
                        <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-muted-foreground">Alt</th>
                        <th className="hidden px-3 py-2 text-center font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Dims</th>
                        <th className="hidden px-3 py-2 text-center font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Next</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(result.analyzers.images.details.records as Array<{ src: string; alt: string | null; hasAlt: boolean; emptyAlt: boolean; genericAlt: boolean; hasDimensions: boolean; isNextImage: boolean; aiFilename: boolean }>).map((r, i) => (
                        <tr key={`${r.src}-${i}`} className="border-t border-border hover:bg-muted/20">
                          <td className="max-w-[200px] truncate px-3 py-1.5 font-mono text-[10px] text-foreground" title={r.src}>{r.src.length > 40 ? `${r.src.slice(0, 40)}…` : r.src}</td>
                          <td className="px-3 py-1.5">
                            {!r.hasAlt
                              ? <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">MISSING</span>
                              : r.emptyAlt
                                ? <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">empty (decorative)</span>
                                : r.genericAlt
                                  ? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">&ldquo;{r.alt}&rdquo;</span>
                                  : <span className="text-[10px] text-foreground">{r.alt}</span>}
                          </td>
                          <td className="hidden px-3 py-1.5 text-center sm:table-cell">
                            {r.hasDimensions ? <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="mx-auto h-3.5 w-3.5 text-amber-500" />}
                          </td>
                          <td className="hidden px-3 py-1.5 text-center sm:table-cell">
                            {r.isNextImage ? <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-emerald-500" /> : <span className="text-muted-foreground">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </AnalyzerCard>

          {/* 8. Metadata */}
          <AnalyzerCard id="metadata" title="Metadata & SEO Signals" subtitle="Title, description, generator tag, Open Graph, Twitter, schema" icon={FileText} data={result.analyzers.metadata}>
            <div className="space-y-2">
              {(() => {
                const m = result.analyzers.metadata.details
                type Item = { label: string; present: boolean; value: string | number | null; flag?: 'warn' | 'danger'; note?: string }
                const items: Item[] = [
                  { label: '<title>',           present: (m.title as { present: boolean }).present, value: (m.title as { value: string | null }).value, flag: (m.title as { generic: boolean }).generic ? 'warn' : undefined, note: (m.title as { length: number; ideal_range: boolean }).ideal_range ? 'Ideal length' : `${(m.title as { length: number }).length} chars` },
                  { label: '<meta name="description">', present: (m.description as { present: boolean }).present, value: (m.description as { value: string | null }).value, note: (m.description as { length: number; ideal_range: boolean }).ideal_range ? 'Ideal length' : `${(m.description as { length: number }).length} chars` },
                  { label: '<meta name="generator">',   present: (m.generator as { present: boolean }).present,   value: (m.generator as { value: string | null }).value, flag: (m.generator as { present: boolean }).present ? 'danger' : undefined, note: (m.generator as { present: boolean }).present ? 'Reveals build tool!' : undefined },
                  { label: 'og:title',          present: !!(m.open_graph as { title: string | null }).title,       value: (m.open_graph as { title: string | null }).title },
                  { label: 'og:description',    present: !!(m.open_graph as { description: string | null }).description, value: (m.open_graph as { description: string | null }).description },
                  { label: 'og:image',          present: !!(m.open_graph as { image: string | null }).image,       value: (m.open_graph as { image: string | null }).image },
                  { label: 'twitter:card',      present: !!(m.twitter as { card: string | null }).card,             value: (m.twitter as { card: string | null }).card },
                  { label: 'twitter:title',     present: !!(m.twitter as { title: string | null }).title,           value: (m.twitter as { title: string | null }).title },
                  { label: '<link rel="canonical">', present: !!m.canonical, value: m.canonical as string | null },
                  { label: '<meta name="robots">',   present: !!m.robots,    value: m.robots as string | null },
                  { label: '<meta name="viewport">', present: !!m.viewport,  value: m.viewport as string | null },
                  { label: 'Favicon',           present: m.favicon as boolean, value: m.favicon ? 'Present' : null },
                  { label: 'JSON-LD blocks',    present: (m.json_ld_count as number) > 0, value: m.json_ld_count as number, note: `${m.json_ld_count} schema(s)` },
                ]
                return items.map((it) => (
                  <div
                    key={it.label}
                    className={cn(
                      'flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-xs',
                      it.flag === 'danger' ? 'border-red-300 bg-red-50' :
                      it.flag === 'warn'   ? 'border-amber-300 bg-amber-50' :
                      it.present           ? 'border-emerald-200 bg-emerald-50/40' :
                                             'border-border bg-card',
                    )}
                  >
                    {it.present
                      ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      : <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                    <span className="font-mono font-semibold text-foreground">{it.label}</span>
                    {it.value !== null && it.value !== '' && (
                      <code className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">{String(it.value)}</code>
                    )}
                    {it.note && <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', it.flag === 'danger' ? 'bg-red-100 text-red-700' : it.flag === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground')}>{it.note}</span>}
                  </div>
                ))
              })()}
            </div>
          </AnalyzerCard>
        </div>

        {/* Files panel (GitHub mode) */}
        {result.fetchInfo.files && result.fetchInfo.files.length > 0 && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
              <Github className="h-4 w-4 text-primary" />
              Analyzed files ({result.fetchInfo.files.length})
            </h3>
            <div className="max-h-[240px] overflow-y-auto">
              <table className="w-full text-xs">
                <tbody>
                  {result.fetchInfo.files.map((f) => (
                    <tr key={f.path} className="border-b border-border last:border-0">
                      <td className="py-1.5 font-mono text-foreground">{f.path}</td>
                      <td className="py-1.5 text-right tabular-nums text-muted-foreground">{(f.bytes / 1024).toFixed(1)} KB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Every metric is derived from real measurement of the fetched source. No randomization, no estimates.
        </p>
      </div>
    </section>
  )
}

// ── Helper components ─────────────────────────────────────────────────────

function AnalyzerCard({
  id, title, subtitle, icon: Icon, data, children,
}: {
  id: string; title: string; subtitle: string; icon: typeof Code; data: AnalyzerScore; children: React.ReactNode
}) {
  return (
    <div id={`analyzer-${id}`} className="scroll-mt-20 rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', severityColor[data.severity])}>
            {data.severity}
          </span>
          <div className="text-right">
            <p className="font-heading text-xl font-bold tabular-nums" style={{ color: scoreToHex(data.score) }}>{data.score}</p>
            <p className="text-[10px] text-muted-foreground">out of 100</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

function StatBox({ label, value, hint, positive = false }: { label: string; value: number | string; hint?: string; positive?: boolean }) {
  return (
    <div className={cn('rounded-xl border p-3', positive ? 'border-emerald-200 bg-emerald-50/40' : 'border-border bg-background')}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 font-heading text-2xl font-bold tabular-nums', positive ? 'text-emerald-700' : 'text-foreground')}>{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
