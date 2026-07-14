'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Globe, Github, FileCode2, Sparkles, AlertCircle, CheckCircle2, XCircle,
  RefreshCw, Loader2, Cpu, Image as ImageIcon, ShieldCheck,
  Code, Palette, FileText, ListTree, MessageSquare,
  ExternalLink, Download, Zap, Fingerprint, Layers, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VibeCodeDetectorResult, AnalyzerScore, FingerprintSignal, DetectedTool } from '@/app/api/vibe-code-detector/route'

type Mode = 'url' | 'github' | 'paste'
type Stage = 'input' | 'analyzing' | 'results'

// Each step runs for its own duration — total ≈ 17s so every step is visibly processed.
const PROGRESS_STEPS = [
  { label: 'Fetching source content…',                  ms: 2600 },
  { label: 'Detecting CMS & site-builder fingerprints…', ms: 2200 },
  { label: 'Scanning for AI-tool signatures…',           ms: 2200 },
  { label: 'Scanning inline code & comments…',           ms: 1700 },
  { label: 'Auditing CSS & utility class density…',      ms: 1700 },
  { label: 'Inspecting HTML structure & depth…',         ms: 1600 },
  { label: 'Analyzing JavaScript patterns…',             ms: 1600 },
  { label: 'Analyzing copywriting signals…',             ms: 1400 },
  { label: 'Compiling final verdict…',                   ms: 1600 },
]
const TOTAL_MS = PROGRESS_STEPS.reduce((s, x) => s + x.ms, 0)

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

const TOOL_TYPE_STYLE: Record<DetectedTool['type'], string> = {
  'ai-tool':      'border-red-200 bg-red-50 text-red-700',
  'cms':          'border-blue-200 bg-blue-50 text-blue-700',
  'site-builder': 'border-violet-200 bg-violet-50 text-violet-700',
  'framework':    'border-border bg-muted text-muted-foreground',
  'library':      'border-border bg-muted text-muted-foreground',
}
const TOOL_TYPE_LABEL: Record<DetectedTool['type'], string> = {
  'ai-tool':      'AI tool',
  'cms':          'CMS',
  'site-builder': 'Site builder',
  'framework':    'Framework',
  'library':      'Library',
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

function SignalRow({ signal, foundMeans }: { signal: FingerprintSignal; foundMeans: 'ai' | 'cms' }) {
  const found = signal.found
  const accent = foundMeans === 'ai'
    ? (found ? 'border-red-200 bg-red-50' : 'border-border bg-background')
    : (found ? 'border-blue-200 bg-blue-50' : 'border-border bg-background')
  const iconColor = foundMeans === 'ai' ? 'text-red-500' : 'text-blue-600'
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-3', accent)}>
      {found
        ? <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', iconColor)} />
        : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />}
      <div className="min-w-0 flex-1">
        <p className={cn('text-xs font-semibold', found ? 'text-foreground' : 'text-muted-foreground')}>{signal.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground break-words">{signal.detail}</p>
      </div>
      <span className={cn(
        'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold',
        found
          ? (foundMeans === 'ai' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')
          : 'bg-muted text-muted-foreground',
      )}>
        {found ? 'FOUND' : '—'}
      </span>
    </div>
  )
}

function AnalyzerCard({
  id, title, subtitle, icon: Icon, data, informational, children,
}: {
  id: string; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>;
  data: AnalyzerScore | null; informational?: boolean; children?: React.ReactNode
}) {
  if (!data) {
    return (
      <div id={`analyzer-${id}`} className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">{title}</h3>
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
            <h3 className="font-heading text-base font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {informational && (
            <span className="rounded-lg border border-border bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">Info only — not in vibe score</span>
          )}
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
  const [showAudits, setShowAudits] = useState(false)

  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const apiDone = useRef(false)
  const apiResult = useRef<VibeCodeDetectorResult | null>(null)
  const finishing = useRef(false)

  const charCount = code.length
  const wordCount = code.trim() ? code.trim().split(/\s+/).filter(Boolean).length : 0

  const canSubmit = useMemo(() => {
    if (mode === 'url')    return isValidUrl(urlInput.trim())
    if (mode === 'github') return isValidGithubUrl(ghInput.trim())
    return code.length >= 100
  }, [mode, urlInput, ghInput, code])

  useEffect(() => () => { if (progressTimer.current) clearInterval(progressTimer.current) }, [])

  function stepIndexForElapsed(elapsed: number): number {
    let acc = 0
    for (let i = 0; i < PROGRESS_STEPS.length; i++) {
      acc += PROGRESS_STEPS[i].ms
      if (elapsed < acc) return i
    }
    return PROGRESS_STEPS.length - 1
  }

  async function analyze() {
    if (!canSubmit) return
    setError(null)
    setResult(null)
    setShowAudits(false)
    setStage('analyzing')
    setProgress(0)
    setCurrentStep(0)
    apiDone.current = false
    apiResult.current = null
    finishing.current = false

    const start = Date.now()

    // Elapsed-time-driven animation: every step runs its full duration so the
    // scan reads as a deliberate, step-by-step audit. If the API is slower than
    // the animation, we hold at 97% on the last step until it returns.
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - start
      const idx = stepIndexForElapsed(elapsed)
      setCurrentStep(idx)

      const rawPct = (elapsed / TOTAL_MS) * 100
      const cappedPct = Math.min(rawPct, apiDone.current ? 100 : 97)
      setProgress(Math.min(Math.round(cappedPct), apiDone.current ? 100 : 97))

      if (elapsed >= TOTAL_MS && apiDone.current && !finishing.current) {
        finishing.current = true
        if (progressTimer.current) clearInterval(progressTimer.current)
        setProgress(100)
        setCurrentStep(PROGRESS_STEPS.length - 1)
        setTimeout(() => {
          setResult(apiResult.current)
          setStage('results')
        }, 450)
      }
    }, 120)

    try {
      const input = mode === 'url' ? urlInput : mode === 'github' ? ghInput : code
      const res = await fetch('/api/vibe-code-detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Analysis failed.')
      }
      const data: VibeCodeDetectorResult = await res.json()
      apiResult.current = data
      apiDone.current = true
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
    setShowAudits(false)
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
              <Fingerprint className="h-3 w-3" />
              Platform fingerprinting · CMS-aware · Zero fake scores
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Vibe Code Detector
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              Find out if a website was <strong>vibe-coded with AI tools</strong> like v0, Lovable, Bolt, ChatGPT, or Claude. We fingerprint the actual platform first — WordPress, Elementor, Wix, Shopify and other CMS builds are recognized and never misflagged — then verify with real code-pattern audits.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Fingerprint, label: 'Tool fingerprints' },
              { icon: Layers,      label: 'CMS-aware' },
              { icon: Cpu,         label: 'No fake scores' },
              { icon: Download,    label: 'JSON export' },
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
                Analysis takes 15–30 seconds. Platform fingerprinting + 8 code audits — no guesswork.
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
              <Fingerprint className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">Scanning for vibe code…</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'github' ? 'Fetching repository source files…' : mode === 'url' ? 'Fetching HTML and fingerprinting the platform…' : 'Fingerprinting the platform and auditing your code…'}
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
              const done   = i < currentStep || progress === 100
              const active = i === currentStep && progress < 100
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

  const verdictColor = scoreToHex(result.overall.score)
  const aiTools = result.platform.detected.filter((d) => d.type === 'ai-tool')
  const foundAiSignals = result.platform.aiSignals.filter((s) => s.found).length
  const foundCmsSignals = result.platform.cmsSignals.filter((s) => s.found).length

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

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

        {/* ── Verdict hero ── */}
        <div className="mb-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex flex-col items-center gap-2">
              <ScoreGauge score={result.overall.score} size="lg" />
              <p className="text-[10px] text-muted-foreground">0 = not vibe-coded · 100 = vibe-coded</p>
            </div>
            <div>
              <span
                className="inline-block rounded-full border px-3 py-1 text-sm font-bold"
                style={{ color: verdictColor, borderColor: `${verdictColor}55`, background: `${verdictColor}14` }}
              >
                {result.overall.confidence}
              </span>
              <p className="mt-3 leading-relaxed text-foreground text-pretty">
                {result.overall.verdictText}
              </p>

              {/* Detected platform badges */}
              {result.platform.detected.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Detected stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.platform.detected.map((t) => (
                      <span
                        key={t.name}
                        title={t.evidence.join(' · ')}
                        className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium', TOOL_TYPE_STYLE[t.type])}
                      >
                        {t.name}
                        <span className="rounded bg-black/5 px-1 py-px text-[9px] font-semibold uppercase tracking-wide opacity-70">{TOOL_TYPE_LABEL[t.type]}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Evidence panels ── */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <Fingerprint className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-heading text-sm font-bold text-foreground">AI-tool fingerprints</h2>
                  <p className="text-[11px] text-muted-foreground">Direct evidence of vibe coding</p>
                </div>
              </div>
              <span className={cn('rounded-lg px-2 py-1 text-xs font-bold tabular-nums', foundAiSignals > 0 ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground')}>
                {foundAiSignals}/{result.platform.aiSignals.length}
              </span>
            </div>
            <div className="space-y-2">
              {result.platform.aiSignals.map((s) => <SignalRow key={s.name} signal={s} foundMeans="ai" />)}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-heading text-sm font-bold text-foreground">CMS &amp; traditional-stack fingerprints</h2>
                  <p className="text-[11px] text-muted-foreground">Evidence the site is NOT vibe-coded</p>
                </div>
              </div>
              <span className={cn('rounded-lg px-2 py-1 text-xs font-bold tabular-nums', foundCmsSignals > 0 ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground')}>
                {foundCmsSignals}/{result.platform.cmsSignals.length}
              </span>
            </div>
            <div className="space-y-2">
              {result.platform.cmsSignals.map((s) => <SignalRow key={s.name} signal={s} foundMeans="cms" />)}
            </div>
            <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              CMS and page-builder sites (WordPress, Elementor, Wix, Shopify…) generate template markup that superficially resembles AI output. When these fingerprints are found, code-pattern signals are discounted — a CMS build is not a vibe-coded build.
            </p>
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

        {/* ── Detailed audits (collapsible) ── */}
        <button
          onClick={() => setShowAudits((v) => !v)}
          className="mb-4 flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Code className="h-4 w-4" />
            </div>
            <div>
              <span className="font-heading text-sm font-bold text-foreground">Detailed code audits</span>
              <p className="text-[11px] text-muted-foreground">Supporting signals: inline code, CSS, HTML structure, JS patterns, copywriting, images, metadata{result.analyzers.securityHeaders ? ', security headers' : ''}</p>
            </div>
          </div>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', showAudits && 'rotate-180')} />
        </button>

        {showAudits && (
        <div className="space-y-6">

          {/* 1. Inline Code */}
          <AnalyzerCard id="inlineCode" title="Inline Code Quality" subtitle="Inline scripts, event handlers, AI-style comments, debug leftovers" icon={Code} data={result.analyzers.inlineCode}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Inline scripts"    value={result.analyzers.inlineCode.details.inline_scripts as number}      hint="<script> without src=" />
              <StatBox label="Inline styles"     value={result.analyzers.inlineCode.details.inline_styles as number}       hint="Common in CMS builds too" positive />
              <StatBox label="Event handlers"    value={result.analyzers.inlineCode.details.inline_events as number}       hint="onclick=, onload=, …" />
              <StatBox label="data-testid"       value={result.analyzers.inlineCode.details.data_testid as number}         hint="AI test scaffolding" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatBox label="AI comments"       value={result.analyzers.inlineCode.details.ai_comments_in_inline as number} hint='"This function…", "Here we…"' />
              <StatBox label="console.log"       value={result.analyzers.inlineCode.details.console_logs_inline as number}   hint="Debug left in prod" />
            </div>
          </AnalyzerCard>

          {/* 2. CSS Quality */}
          <AnalyzerCard id="cssQuality" title="CSS Quality" subtitle="Tailwind utility density, !important overrides, font count" icon={Palette} data={result.analyzers.cssQuality}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Heavy utility els" value={result.analyzers.cssQuality.details.heavy_utility_elements as number} hint="≥8 classes on one element" />
              <StatBox label="Long class names"  value={result.analyzers.cssQuality.details.long_class_count as number}       hint="> 30 chars" />
              <StatBox label="!important count"  value={result.analyzers.cssQuality.details.important_count as number}        hint="Override-heavy CSS" />
              <StatBox label="Font count"        value={result.analyzers.cssQuality.details.font_count as number}             hint="@font-face + imports" />
            </div>
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
          <AnalyzerCard id="htmlStructure" title="HTML Structure" subtitle="Semantic tags, div nesting, landmarks — discounted for CMS builds" icon={ListTree} data={result.analyzers.htmlStructure}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Semantic usage" value={`${result.analyzers.htmlStructure.details.semantic_percentage}%`}  hint="nav, main, article, …" positive />
              <StatBox label="Max div depth"  value={result.analyzers.htmlStructure.details.max_div_depth as number}    hint="Template builds nest deep" />
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
                  {result.analyzers.htmlStructure.details.heading_levels_skipped as boolean && (
                    <p className="mt-2 text-[10px] text-amber-600">⚠ Heading levels are skipped</p>
                  )}
                </div>
              </div>
            </div>
          </AnalyzerCard>

          {/* 4. JavaScript */}
          <AnalyzerCard id="jsPatterns" title="JavaScript Patterns" subtitle="AI-style comments, generic names, console.log, TODO scaffolding" icon={Cpu} data={result.analyzers.jsPatterns}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="AI comments"     value={result.analyzers.jsPatterns.details.ai_comment_patterns as number}  hint='"Here we…", "This function…"' />
              <StatBox label="Generic names"   value={result.analyzers.jsPatterns.details.generic_names as number}        hint="data, result, response…" />
              <StatBox label="console.log"     value={result.analyzers.jsPatterns.details.console_logs as number}         hint="Debug left in prod" />
              <StatBox label="TODO / FIXME"    value={result.analyzers.jsPatterns.details.todo_comments as number}        hint="Unfinished scaffolding" />
            </div>
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
          <AnalyzerCard id="content" title="Copywriting Signals" subtitle="AI buzzwords, filler phrases, sentence uniformity" icon={MessageSquare} data={result.analyzers.content}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Words"          value={result.analyzers.content.details.word_count as number}     hint="Visible text" positive />
              <StatBox label="Buzzwords"      value={result.analyzers.content.details.buzzword_total as number} hint="seamless, scalable, …" />
              <StatBox label="Filler phrases" value={result.analyzers.content.details.filler_total as number}   hint="Generic marketing-speak" />
              <StatBox label="Vague CTAs"     value={result.analyzers.content.details.vague_ctas as number}     hint="'Learn more', 'Explore'" />
            </div>
            {(result.analyzers.content.details.buzzword_hits as { word: string; count: number }[]).length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI buzzwords found</p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.analyzers.content.details.buzzword_hits as { word: string; count: number }[]).map((b) => (
                    <span key={b.word} className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">
                      {b.word} <span className="font-mono">×{b.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </AnalyzerCard>

          {/* 6. Metadata */}
          <AnalyzerCard id="metadata" title="Metadata & Generator Tag" subtitle="Title, description, generator tag — AI generator tags are decisive" icon={FileText} data={result.analyzers.metadata}>
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

              {(result.analyzers.metadata.details.generator as { present: boolean; value: string | null; is_ai_generator: boolean }).present && (
                <div className={cn(
                  'flex items-start gap-2 rounded-xl border p-3',
                  (result.analyzers.metadata.details.generator as { is_ai_generator: boolean }).is_ai_generator
                    ? 'border-red-200 bg-red-50'
                    : 'border-blue-200 bg-blue-50',
                )}>
                  <AlertCircle className={cn('mt-0.5 h-4 w-4 shrink-0', (result.analyzers.metadata.details.generator as { is_ai_generator: boolean }).is_ai_generator ? 'text-red-600' : 'text-blue-600')} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Generator tag detected</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {(result.analyzers.metadata.details.generator as { value: string | null }).value}
                      {(result.analyzers.metadata.details.generator as { is_ai_generator: boolean }).is_ai_generator
                        ? ' — known AI/vibe-code tool'
                        : ' — CMS/tooling tag (not an AI signal)'}
                    </p>
                  </div>
                </div>
              )}

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
                    <FileText className="h-3 w-3 text-primary" />
                    <span className="font-mono text-[10px] text-muted-foreground">JSON-LD: {(result.analyzers.metadata.details.json_ld_count as number)} block{(result.analyzers.metadata.details.json_ld_count as number) !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </AnalyzerCard>

          {/* 7. Images — informational */}
          <AnalyzerCard id="images" title="Image Audit" subtitle="Alt text coverage and filenames" icon={ImageIcon} data={result.analyzers.images} informational>
            {(result.analyzers.images.details.total as number) === 0 ? (
              <p className="text-sm text-muted-foreground">No &lt;img&gt; elements found in this source.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox label="Total images"     value={result.analyzers.images.details.total as number}            hint="<img> + <Image>" positive />
                <StatBox label="Missing alt"      value={result.analyzers.images.details.missing_alt as number}      hint="Accessibility issue" />
                <StatBox label="Generic alt"      value={result.analyzers.images.details.generic_alt as number}      hint='"image", "photo", …' />
                <StatBox label="Stock filenames"  value={result.analyzers.images.details.ai_filename_count as number} hint="placeholder, unsplash, …" />
              </div>
            )}
          </AnalyzerCard>

          {/* 8. Security — informational */}
          <AnalyzerCard id="securityHeaders" title="Security Headers" subtitle="CSP, X-Frame-Options, HSTS — site hygiene, not a vibe signal" icon={ShieldCheck} data={result.analyzers.securityHeaders} informational>
            {result.analyzers.securityHeaders && (
              <div className="space-y-2">
                {(result.analyzers.securityHeaders.details.checks as { name: string; present: boolean; value: string | null; risk: string }[]).map((c) => (
                  <div key={c.name} className={cn('flex items-start gap-3 rounded-xl border p-3', c.present ? 'border-emerald-200 bg-emerald-50' : 'border-border bg-background')}>
                    {c.present ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />}
                    <div className="min-w-0 flex-1">
                      <p className={cn('font-mono text-xs font-semibold', c.present ? 'text-emerald-800' : 'text-foreground')}>{c.name}</p>
                      {c.present && c.value ? (
                        <p className="mt-0.5 truncate font-mono text-[10px] text-emerald-700">{c.value}</p>
                      ) : (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{c.risk}</p>
                      )}
                    </div>
                    <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold', c.present ? 'bg-emerald-200 text-emerald-800' : 'bg-muted text-muted-foreground')}>
                      {c.present ? 'PASS' : 'MISSING'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AnalyzerCard>

        </div>
        )}
      </div>
    </section>
  )
}
