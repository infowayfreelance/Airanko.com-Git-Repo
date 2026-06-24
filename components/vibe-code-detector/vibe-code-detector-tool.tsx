'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Globe, Github, FileCode2, Sparkles, AlertCircle, CheckCircle2, XCircle,
  RefreshCw, Loader2, Cpu, Image as ImageIcon, ShieldCheck,
  Code, Layers, Palette, FileText, ListTree, MessageSquare,
  ExternalLink, ChevronRight, Download, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VibeCodeDetectorResult, AnalyzerScore } from '@/app/api/vibe-code-detector/route'

type Mode = 'url' | 'github' | 'paste'
type Stage = 'input' | 'analyzing' | 'results'

// 9 steps — each advances at a timed interval giving ~12-15s minimum feel
const PROGRESS_STEPS = [
  { label: 'Fetching source content…',             weight: 15 },
  { label: 'Scanning inline code & comments…',     weight: 12 },
  { label: 'Auditing CSS class density…',          weight: 12 },
  { label: 'Inspecting HTML structure & depth…',   weight: 12 },
  { label: 'Detecting AI JavaScript patterns…',    weight: 12 },
  { label: 'Analyzing copywriting signals…',       weight: 12 },
  { label: 'Checking security headers…',           weight: 7  },
  { label: 'Auditing images & metadata…',          weight: 12 },
  { label: 'Compiling vibe score…',                weight: 6  },
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

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s.startsWith('http') ? s : `https://${s}`)
    return !!u.hostname && u.hostname.includes('.')
  } catch { return false }
}
function isValidGithubUrl(s: string): boolean {
  return /^https?:\/\/(?:www\.)?github\.com\/[^/]+\/[^/]+/i.test(s.trim())
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatBox({ label, value, hint, positive }: { label: string; value: number | string; hint?: string; positive?: boolean }) {
  const num = typeof value === 'number' ? value : null
  const isHighBad = !positive && num !== null && num > 0
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-background p-3 text-center">
      <span className={cn('font-heading text-2xl font-bold tabular-nums', isHighBad ? 'text-amber-600' : 'text-foreground')}>{value}</span>
      <span className="text-[10px] font-semibold text-foreground">{label}</span>
      {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
    </div>
  )
}

function AnalyzerCard({
  id, title, subtitle, icon: Icon, data, children,
}: {
  id: string; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>;
  data: AnalyzerScore | null; children?: React.ReactNode
}) {
  if (!data) {
    return (
      <div id={`analyzer-${id}`} className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">Only available in URL mode</p>
          </div>
          <span className="ml-auto rounded-lg border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">N/A</span>
        </div>
      </div>
    )
  }
  return (
    <div id={`analyzer-${id}`} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <ScoreGauge score={data.score} size="md" />
          <span className={cn('rounded-lg border px-2.5 py-1 text-xs font-semibold', severityColor[data.severity])}>{data.severity}</span>
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function VibeCodeDetectorTool() {
  const [mode, setMode] = useState<Mode>('url')
  const [urlInput, setUrlInput] = useState('')
  const [ghInput, setGhInput] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<Stage>('input')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<VibeCodeDetectorResult | null>(null)
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

    // Advance progress at ~500ms per tick — ensures minimum ~12-15s visual duration
    // regardless of how fast the API returns
    let p = 0
    let step = 0
    progressTimer.current = setInterval(() => {
      if (step < PROGRESS_STEPS.length - 1) {
        p = Math.min(p + 2, PROGRESS_STEPS.slice(0, step + 1).reduce((s, x) => s + x.weight, 0))
        setProgress(p)
        const cumulative = PROGRESS_STEPS.slice(0, step + 1).reduce((s, x) => s + x.weight, 0)
        if (p >= cumulative) { step = Math.min(step + 1, PROGRESS_STEPS.length - 1); setCurrentStep(step) }
      }
    }, 500)

    try {
      const input = mode === 'url' ? urlInput : mode === 'github' ? ghInput : code

      // Minimum 10 seconds so progress bar has time to animate all steps realistically
      const [res] = await Promise.all([
        fetch('/api/vibe-code-detector', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, input }),
        }),
        new Promise<void>((resolve) => setTimeout(resolve, 10000)),
      ])

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Analysis failed.')
      }
      const data: VibeCodeDetectorResult = await res.json()
      if (progressTimer.current) clearInterval(progressTimer.current)
      setProgress(100)
      setCurrentStep(PROGRESS_STEPS.length - 1)
      setTimeout(() => { setResult(data); setStage('results') }, 300)
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
    a.download = `vibe-code-report-${result.inputDisplay.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── INPUT STAGE ───────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3 w-3" />
              8 real analyzers · Zero fake scores · Instant export
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Vibe Code Detector
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              Find out if a website, GitHub repo, or code snippet was <strong>vibe-coded with AI</strong>. We fetch your source, then run 8 real audits — CSS density, HTML structure, JS patterns, copywriting signals, security headers, and more. Every score is measured, never guessed.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Code,       label: '8 real audits' },
              { icon: Cpu,        label: 'No fake scores' },
              { icon: ShieldCheck,label: 'Security check' },
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
                    Public URL only. We fetch via our server (no CORS), follow redirects, and parse raw HTML + response headers.
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
                    Public repos only. Fetches up to 30 source files (.html, .jsx, .tsx, .js, .ts, .css, .scss, .vue, .py) — root + src/ + app/ + components/ prioritized.
                  </p>
                </div>
              )}

              {mode === 'paste' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Source code</label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your HTML, CSS, JavaScript, JSX, React component, or any web code here…"
                    style={{ minHeight: '220px' }}
                    className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-[12px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className={cn(
                    'mt-2 text-[11px] tabular-nums',
                    charCount < 100 ? 'text-muted-foreground' : 'text-emerald-600',
                  )}>
                    {charCount.toLocaleString()} chars · {wordCount.toLocaleString()} words {charCount < 100 ? `· ${100 - charCount} more chars needed` : '· ready to scan'}
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
                Detect Vibe Code
              </button>

              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Analysis takes 10–60 seconds. 8 real audits — no AI guesswork, no fake scores.
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
              <Zap className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Scanning for vibe code…</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'github' ? 'Fetching repository source files…' : mode === 'url' ? 'Fetching HTML and security headers…' : 'Running 8 real audits on your code…'}
          </p>

          <div className="mt-8 overflow-hidden rounded-full bg-muted">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-foreground tabular-nums">{progress}%</p>

          <div className="mt-8 space-y-2 text-left">
            {PROGRESS_STEPS.map((step, i) => {
              const done   = i < currentStep
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
                  {done   ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> :
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

  // ── RESULTS STAGE ─────────────────────────────────────────────────────────
  if (!result) return null

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Vibe Code Analysis</p>
            <h1 className="font-heading text-2xl font-bold text-foreground truncate">{result.inputDisplay}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {result.fetchInfo.sourceCount} {result.fetchInfo.sourceCount === 1 ? 'source' : 'files'} · {(result.fetchInfo.totalBytes / 1024).toFixed(1)} KB · {new Date(result.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadJson} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <RefreshCw className="h-3.5 w-3.5" />
              New Scan
            </button>
          </div>
        </div>

        {/* Overall score + 8 mini gauges */}
        <div className="mb-6 grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:p-8">
          <div className="flex flex-col items-center gap-3 border-b border-border pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8">
            <ScoreGauge score={result.overall.score} size="lg" />
            <div className="text-center">
              <p className="font-heading text-sm font-bold text-foreground">Vibe Score</p>
              <p className="text-xs font-medium" style={{ color: scoreToHex(result.overall.score) }}>
                {result.overall.confidence}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">0 = human-written · 100 = fully vibe-coded</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([
              { key: 'inlineCode',      label: 'Inline Code',  icon: Code,          data: result.analyzers.inlineCode },
              { key: 'cssQuality',      label: 'CSS',          icon: Palette,       data: result.analyzers.cssQuality },
              { key: 'htmlStructure',   label: 'HTML',         icon: ListTree,      data: result.analyzers.htmlStructure },
              { key: 'jsPatterns',      label: 'JavaScript',   icon: Cpu,           data: result.analyzers.jsPatterns },
              { key: 'content',         label: 'Copywriting',  icon: MessageSquare, data: result.analyzers.content },
              { key: 'securityHeaders', label: 'Security',     icon: ShieldCheck,   data: result.analyzers.securityHeaders },
              { key: 'images',          label: 'Images',       icon: ImageIcon,     data: result.analyzers.images },
              { key: 'metadata',        label: 'Metadata',     icon: FileText,      data: result.analyzers.metadata },
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

        {/* GitHub files panel */}
        {result.mode === 'github' && result.fetchInfo.files && result.fetchInfo.files.length > 0 && (
          <div className="mb-6 rounded-3xl border border-border bg-card p-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <Github className="h-4 w-4" />
              {result.fetchInfo.files.length} files analyzed
            </p>
            <div className="grid gap-1 sm:grid-cols-2">
              {result.fetchInfo.files.map((f) => (
                <div key={f.path} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
                  <FileCode2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate font-mono text-[11px] text-foreground">{f.path}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{(f.bytes / 1024).toFixed(1)}KB</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* URL external link */}
        {result.mode === 'url' && result.fetchInfo.finalUrl && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm">
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Analyzed:</span>
            <a href={result.fetchInfo.finalUrl} target="_blank" rel="noopener noreferrer" className="truncate font-mono text-xs text-primary hover:underline">
              {result.fetchInfo.finalUrl}
            </a>
          </div>
        )}

        {/* Detailed cards */}
        <div className="space-y-6">

          {/* 1. Inline Code */}
          <AnalyzerCard id="inlineCode" title="Inline Code Quality" subtitle="Inline scripts, style attributes, event handlers, HTML comments, data-testid" icon={Code} data={result.analyzers.inlineCode}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Inline scripts"    value={result.analyzers.inlineCode.details.inline_scripts as number}      hint="<script> without src=" />
              <StatBox label="Inline styles"     value={result.analyzers.inlineCode.details.inline_styles as number}       hint="style= attributes" />
              <StatBox label="Event handlers"    value={result.analyzers.inlineCode.details.inline_events as number}       hint="onclick=, onload=, …" />
              <StatBox label="data-testid"       value={result.analyzers.inlineCode.details.data_testid as number}         hint="AI test scaffolding" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatBox label="AI comments"       value={result.analyzers.inlineCode.details.ai_comments_in_inline as number} hint='"This function…", "Here we…"' />
              <StatBox label="console.log"       value={result.analyzers.inlineCode.details.console_logs_inline as number}   hint="Debug left in prod" />
            </div>
          </AnalyzerCard>

          {/* 2. CSS Quality */}
          <AnalyzerCard id="cssQuality" title="CSS Quality" subtitle="Tailwind utility density, !important overrides, font count, duplicate declarations" icon={Palette} data={result.analyzers.cssQuality}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Heavy utility els" value={result.analyzers.cssQuality.details.heavy_utility_elements as number} hint="≥8 classes on one element" />
              <StatBox label="Long class names"  value={result.analyzers.cssQuality.details.long_class_count as number}       hint="> 30 chars" />
              <StatBox label="!important count"  value={result.analyzers.cssQuality.details.important_count as number}        hint="Lazy override signal" />
              <StatBox label="Font count"        value={result.analyzers.cssQuality.details.font_count as number}             hint="@font-face + imports" />
            </div>
            {(result.analyzers.cssQuality.details.all_colors as string[]).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Color palette ({(result.analyzers.cssQuality.details.all_colors as string[]).length} unique — informational)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.analyzers.cssQuality.details.all_colors as string[]).slice(0, 60).map((c, i) => (
                    <div key={`${c}-${i}`} title={c}>
                      <div className="h-6 w-6 rounded border border-border" style={{ background: c }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(result.analyzers.cssQuality.details.font_list as string[]).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fonts detected</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.analyzers.cssQuality.details.font_list as string[]).map((f) => (
                    <span key={f} className="rounded border border-border bg-muted px-2 py-0.5 text-[11px] text-foreground">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </AnalyzerCard>

          {/* 3. HTML Structure */}
          <AnalyzerCard id="htmlStructure" title="HTML Structure" subtitle="Semantic tags, div nesting depth, empty elements, landmark elements" icon={ListTree} data={result.analyzers.htmlStructure}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Semantic usage" value={`${result.analyzers.htmlStructure.details.semantic_percentage}%`}  hint="nav, main, article, …" />
              <StatBox label="Max div depth"  value={result.analyzers.htmlStructure.details.max_div_depth as number}    hint=">6 = vibe signal" />
              <StatBox label="Empty elements" value={result.analyzers.htmlStructure.details.empty_elements as number}   hint="Unfilled scaffolding" />
              <StatBox label="ARIA attrs"     value={result.analyzers.htmlStructure.details.aria_attributes as number}  hint="Positive signal" positive />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Landmark elements</p>
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
                  {result.analyzers.htmlStructure.details.heading_levels_skipped && (
                    <p className="mt-2 text-[10px] text-amber-600">⚠ Heading levels are skipped</p>
                  )}
                </div>
              </div>
            </div>
          </AnalyzerCard>

          {/* 4. JavaScript */}
          <AnalyzerCard id="jsPatterns" title="JavaScript Patterns" subtitle="Generic names, AI-style comments, console.log, TODOs, async over-use" icon={Cpu} data={result.analyzers.jsPatterns}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Generic names"   value={result.analyzers.jsPatterns.details.generic_names as number}        hint="data, result, response…" />
              <StatBox label="AI comments"     value={result.analyzers.jsPatterns.details.ai_comment_patterns as number}  hint='"Here we…", "This function…"' />
              <StatBox label="console.log"     value={result.analyzers.jsPatterns.details.console_logs as number}         hint="Debug left in prod" />
              <StatBox label="TODO / FIXME"    value={result.analyzers.jsPatterns.details.todo_comments as number}        hint="Unfinished scaffolding" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatBox label="try/catch blocks" value={result.analyzers.jsPatterns.details.try_catch_count as number} hint="Positive — good practice" positive />
              <StatBox label="Async funcs"      value={result.analyzers.jsPatterns.details.async_funcs as number}     hint="High = AI over-wrapping" />
            </div>
            {(result.analyzers.jsPatterns.details.generic_names_list as string[]).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Generic variable names</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.analyzers.jsPatterns.details.generic_names_list as string[]).map((n) => (
                    <code key={n} className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">{n}</code>
                  ))}
                </div>
              </div>
            )}
            {(result.analyzers.jsPatterns.details.ai_comment_list as string[]).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI-style comments found</p>
                <ul className="space-y-1">
                  {(result.analyzers.jsPatterns.details.ai_comment_list as string[]).map((c, i) => (
                    <li key={i} className="rounded border border-border bg-background p-2 font-mono text-[10px] text-muted-foreground">{c}</li>
                  ))}
                </ul>
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
          <AnalyzerCard id="content" title="Copywriting Signals" subtitle="AI buzzwords, filler phrases, vague CTAs, sentence uniformity" icon={MessageSquare} data={result.analyzers.content}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Words"          value={result.analyzers.content.details.word_count as number}     hint="Visible text" />
              <StatBox label="Buzzwords"      value={result.analyzers.content.details.buzzword_total as number} hint="seamless, scalable, …" />
              <StatBox label="Filler phrases" value={result.analyzers.content.details.filler_total as number}   hint="Generic marketing-speak" />
              <StatBox label="Vague CTAs"     value={result.analyzers.content.details.vague_ctas as number}     hint="'Learn more', 'Explore'" />
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
                  Avg {result.analyzers.content.details.avg_sentence_length as number}w · σ {result.analyzers.content.details.sentence_variance as number} {(result.analyzers.content.details.sentence_variance as number) > 8 ? '(natural variance)' : '(low — AI signal)'}
                </p>
              </div>
              <div>
                {(result.analyzers.content.details.buzzword_hits as { word: string; count: number }[]).length > 0 && (
                  <>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI buzzwords found</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.analyzers.content.details.buzzword_hits as { word: string; count: number }[]).map((b) => (
                        <span key={b.word} className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">
                          {b.word} <span className="font-mono">×{b.count}</span>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </AnalyzerCard>

          {/* 6. Security */}
          <AnalyzerCard id="securityHeaders" title="Security Headers" subtitle="CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy" icon={ShieldCheck} data={result.analyzers.securityHeaders}>
            {result.analyzers.securityHeaders && (
              <div className="space-y-2">
                {(result.analyzers.securityHeaders.details.checks as { name: string; present: boolean; value: string | null; risk: string }[]).map((c) => (
                  <div key={c.name} className={cn('flex items-start gap-3 rounded-xl border p-3', c.present ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50')}>
                    {c.present ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                    <div className="min-w-0 flex-1">
                      <p className={cn('font-mono text-xs font-semibold', c.present ? 'text-emerald-800' : 'text-red-800')}>{c.name}</p>
                      {c.present && c.value ? (
                        <p className="mt-0.5 truncate font-mono text-[10px] text-emerald-700">{c.value}</p>
                      ) : (
                        <p className="mt-0.5 text-[10px] text-red-700">{c.risk}</p>
                      )}
                    </div>
                    <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold', c.present ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800')}>
                      {c.present ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AnalyzerCard>

          {/* 7. Images */}
          <AnalyzerCard id="images" title="Image Audit" subtitle="Alt text coverage, missing dimensions, generic filenames" icon={ImageIcon} data={result.analyzers.images}>
            {result.analyzers.images.details.total as number === 0 ? (
              <p className="text-sm text-muted-foreground">No &lt;img&gt; elements found in this source.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatBox label="Total images"     value={result.analyzers.images.details.total as number}            hint="<img> + <Image>" />
                  <StatBox label="Missing alt"      value={result.analyzers.images.details.missing_alt as number}      hint="Accessibility failure" />
                  <StatBox label="Generic alt"      value={result.analyzers.images.details.generic_alt as number}      hint='"image", "photo", …' />
                  <StatBox label="AI filenames"     value={result.analyzers.images.details.ai_filename_count as number} hint="placeholder, stock-photo, …" />
                </div>
                {(result.analyzers.images.details.records as { src: string; alt: string | null; hasAlt: boolean; genericAlt: boolean }[]).length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[400px] text-xs">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source</th>
                          <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Alt text</th>
                          <th className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(result.analyzers.images.details.records as { src: string; alt: string | null; hasAlt: boolean; genericAlt: boolean; emptyAlt: boolean }[]).slice(0, 15).map((r, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-2 pr-4">
                              <span className="truncate font-mono text-[10px] text-foreground" style={{ maxWidth: '200px', display: 'block' }}>{r.src || '—'}</span>
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">{r.alt ?? <em>none</em>}</td>
                            <td className="py-2 text-center">
                              {!r.hasAlt ? <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">Missing</span>
                               : r.emptyAlt ? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Empty</span>
                               : r.genericAlt ? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Generic</span>
                               : <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">Good</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </AnalyzerCard>

          {/* 8. Metadata */}
          <AnalyzerCard id="metadata" title="Metadata & SEO" subtitle="Title, description, Open Graph, generator tag, JSON-LD" icon={FileText} data={result.analyzers.metadata}>
            <div className="space-y-2">
              {([
                { label: 'Title tag', value: (result.analyzers.metadata.details.title as { value: string | null; length: number; ideal_range: boolean }).value, length: (result.analyzers.metadata.details.title as { value: string | null; length: number; ideal_range: boolean }).length, ideal: (result.analyzers.metadata.details.title as { value: string | null; length: number; ideal_range: boolean }).ideal_range },
                { label: 'Meta description', value: (result.analyzers.metadata.details.description as { value: string | null; length: number; ideal_range: boolean }).value, length: (result.analyzers.metadata.details.description as { value: string | null; length: number; ideal_range: boolean }).length, ideal: (result.analyzers.metadata.details.description as { value: string | null; length: number; ideal_range: boolean }).ideal_range },
              ]).map((row) => (
                <div key={row.label} className={cn('rounded-xl border p-3', row.value ? 'border-border bg-background' : 'border-red-200 bg-red-50')}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">{row.label}</span>
                    <span className={cn('text-[10px] font-mono', row.ideal ? 'text-emerald-600' : 'text-amber-600')}>{row.length} chars {row.ideal ? '✓' : '(not ideal)'}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground truncate">{row.value ?? 'Not found'}</p>
                </div>
              ))}

              {/* Generator tag highlight */}
              {(result.analyzers.metadata.details.generator as { present: boolean; value: string | null; is_ai_generator: boolean }).present && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Generator tag detected</p>
                    <p className="mt-0.5 font-mono text-[11px] text-amber-700">
                      {(result.analyzers.metadata.details.generator as { value: string | null }).value}
                      {(result.analyzers.metadata.details.generator as { is_ai_generator: boolean }).is_ai_generator && ' — known vibe-code tool'}
                    </p>
                  </div>
                </div>
              )}

              {/* OG & JSON-LD quick view */}
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Open Graph</p>
                  {(['og:title', 'og:description', 'og:image'] as const).map((tag) => {
                    const key = tag.replace('og:', '') as 'title' | 'description' | 'image'
                    const val = (result.analyzers.metadata.details.open_graph as Record<string, string | null>)[key]
                    return (
                      <div key={tag} className="flex items-center gap-2 py-0.5">
                        {val ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-red-400" />}
                        <span className="font-mono text-[10px] text-muted-foreground">{tag}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Technical</p>
                  {[
                    { label: 'Canonical', val: (result.analyzers.metadata.details.canonical as string | null) },
                    { label: 'Viewport', val: (result.analyzers.metadata.details.viewport as string | null) },
                    { label: 'Favicon', val: (result.analyzers.metadata.details.favicon as boolean) ? 'present' : null },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2 py-0.5">
                      {row.val ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-red-400" />}
                      <span className="font-mono text-[10px] text-muted-foreground">{row.label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 py-0.5">
                    <ChevronRight className="h-3 w-3 text-primary" />
                    <span className="font-mono text-[10px] text-muted-foreground">JSON-LD: {(result.analyzers.metadata.details.json_ld_count as number)} block{(result.analyzers.metadata.details.json_ld_count as number) !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </AnalyzerCard>

        </div>
      </div>
    </section>
  )
}
