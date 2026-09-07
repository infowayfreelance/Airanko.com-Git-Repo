'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  Globe,
  Sparkles,
  Loader2,
  AlertCircle,
  Printer,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Search,
  FileText,
  Wrench,
  Link2,
  BarChart3,
  ListChecks,
  Trophy,
  Lightbulb,
  Building2,
  ChevronLeft,
  ChevronRight,
  Upload,
  MapPin,
  Target,
  Rocket,
  Smartphone,
  Monitor,
  AlertTriangle,
  ShieldCheck,
  Zap,
  XCircle,
  HelpCircle,
  DollarSign,
  Award,
  Users,
  PenLine,
  Plus,
  X,
  ArrowRight,
  ClipboardList,
  Map as MapIcon,
  ImageIcon,
  ExternalLink,
  Pencil,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Undo2,
  ChevronDown,
  ChevronUp,
  Gauge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import type { SeoStrategy } from '@/app/api/seo-strategy/route'
import type { SiteAnalysis } from '@/app/api/seo-strategy/analyze/route'
import { SCORE_STATUS_LABEL, type ScoreStatus } from '@/lib/seo-strategy/on-page-score-thresholds'
import { pageOverallSeverity } from '@/lib/seo-strategy/on-page-overview'
import { SERP_PIXEL_STATUS_LABEL, type SerpPixelStatus as SerpPixelStatusValue } from '@/lib/seo-strategy/serp-pixel-thresholds'
import type { Severity } from '@/lib/seo-strategy/types'

/**
 * Defensive response parser. When an API route times out or throws an
 * unhandled error, Next.js may return an HTML error page. Calling
 * `response.json()` on that body produces the cryptic
 *   `Unexpected token 'A', "An error o"... is not valid JSON`
 * error. This helper reads the body as text first so we can:
 *   - Return JSON when the body is JSON
 *   - Return a clean { error } object when it is HTML or anything else
 */
async function safeReadJson(
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionLabel: string,
): Promise<any> {
  const text = await response.text()
  if (!text) {
    return {
      error: `The server returned an empty response while trying to ${actionLabel}. Please try again.`,
    }
  }
  try {
    return JSON.parse(text)
  } catch {
    // The response wasn't JSON — almost always an HTML error page.
    const looksLikeHtml = /^\s*<(?:!doctype|html|body|head)/i.test(text)
    if (looksLikeHtml) {
      const isTimeout =
        response.status === 504 ||
        /timeout|timed out|gateway/i.test(text)
      return {
        error: isTimeout
          ? `The request timed out while trying to ${actionLabel}. The AI took too long to respond — please try again.`
          : `The server returned an unexpected error (status ${response.status}) while trying to ${actionLabel}. Please try again.`,
      }
    }
    return {
      error: `Could not ${actionLabel}: ${text.slice(0, 200)}`,
    }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FormData {
  websiteUrl: string
  businessName: string
  isLocal: boolean
  gmbUrl: string
  keywords: string
  competitors: string[]
  location: string
  industry: string
  notes: string
  /** Phase 5 — 'quick' = a handful of important pages, bounded low; 'full' = prefers the XML sitemap (bounded higher) for a more complete crawl. Never silently claimed as "full site audit" when it isn't — see analyze/route.ts's crawlStats. */
  crawlMode: 'quick' | 'full'
}

const initialForm: FormData = {
  websiteUrl: '',
  businessName: '',
  isLocal: false,
  gmbUrl: '',
  keywords: '',
  competitors: ['', '', ''],
  location: '',
  industry: '',
  notes: '',
  crawlMode: 'quick',
}

const STEPS = [
  { id: 1, title: 'Website', description: 'Your site & business' },
  { id: 2, title: 'Keywords', description: 'Target keywords list' },
  { id: 3, title: 'Competitors', description: 'Optional competitors' },
  { id: 4, title: 'Location', description: 'Optional context' },
] as const

type Phase =
  | 'idle'
  | 'analyzing'
  | 'generating'
  | 'done'
  | 'error'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SeoStrategyMakerTool() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [phase, setPhase] = useState<Phase>('idle')
  const [progressMsg, setProgressMsg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<SiteAnalysis | null>(null)
  const [strategy, setStrategy] = useState<SeoStrategy | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase === 'done' && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [phase])

  // ---------- Validation ----------
  const canContinueStep1 = form.websiteUrl.trim() && form.businessName.trim() &&
    (!form.isLocal || form.gmbUrl.trim())
  const canContinueStep2 = form.keywords.trim().length > 0

  // ---------- Submit ----------
  async function handleGenerate() {
    setError(null)
    setStrategy(null)
    setAnalysis(null)

    try {
      // Phase 1: analyze site
      setPhase('analyzing')
      setProgressMsg(
        form.crawlMode === 'full'
          ? 'Crawling your full site (via sitemap where available) and analyzing pages…'
          : 'Crawling your website and analyzing pages…',
      )

      const analyzeRes = await fetch('/api/seo-strategy/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: form.websiteUrl, crawlMode: form.crawlMode }),
      })
      const analyzeData = await safeReadJson(analyzeRes, 'analyze the website')
      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'Failed to analyze website')
      }
      const siteAnalysis: SiteAnalysis = analyzeData.analysis
      setAnalysis(siteAnalysis)

      // Phase 1.5 (Phase 6) — crawl each provided competitor URL. A failed
      // competitor crawl never blocks the report — it comes back as a
      // well-formed status: 'not_evaluated' profile (never null/undefined,
      // which the strategy endpoint's deterministic comparison can't
      // safely dereference) and contributes no fabricated findings.
      const competitorUrls = form.competitors.filter(Boolean)
      let competitorProfiles: unknown[] = []
      if (competitorUrls.length > 0) {
        setProgressMsg('Crawling competitor websites…')
        const notEvaluatedProfile = (url: string, reason: string) => ({
          inputUrl: url,
          domain: null,
          status: 'not_evaluated' as const,
          reason,
          pagesDiscovered: 0,
          pagesCrawled: 0,
          pagesFailed: 0,
          servicePages: 0,
          locationPages: 0,
          blogPages: 0,
          schemaCoverage: null,
          averageWordCount: null,
          pages: [],
        })
        competitorProfiles = await Promise.all(
          competitorUrls.map(async (url) => {
            try {
              const res = await fetch('/api/seo-strategy/competitor-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, location: form.location }),
              })
              const data = await safeReadJson(res, 'analyze a competitor')
              return data.profile ?? notEvaluatedProfile(url, 'The competitor crawl did not return a result.')
            } catch {
              return notEvaluatedProfile(url, 'The competitor crawl request failed.')
            }
          }),
        )
      }

      // Phase 2: generate strategy
      setPhase('generating')
      setProgressMsg('Building your custom SEO strategy with AI…')

      const stratRes = await fetch('/api/seo-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: form.websiteUrl,
          businessName: form.businessName,
          gmbUrl: form.gmbUrl,
          isLocal: form.isLocal,
          keywords: form.keywords,
          competitors: competitorUrls,
          location: form.location,
          industry: form.industry,
          notes: form.notes,
          analysis: siteAnalysis,
          competitorProfiles,
        }),
      })
      const stratData = await safeReadJson(stratRes, 'generate the strategy')
      if (!stratRes.ok) {
        throw new Error(stratData.error || 'Failed to generate strategy')
      }
      setStrategy(stratData.strategy)
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setPhase('error')
    }
  }

  function reset() {
    setStep(1)
    setForm(initialForm)
    setStrategy(null)
    setAnalysis(null)
    setError(null)
    setPhase('idle')
  }

  // ---------- Render ----------
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 print:p-0">
      <div
        className={`mx-auto space-y-8 ${
          phase === 'done' ? 'max-w-6xl' : 'max-w-3xl'
        } print:max-w-none`}
      >
        {phase !== 'done' && (
          <>
            {/* Hero header above wizard */}
            <div className="text-center print:hidden" data-print-hide>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                AI-Powered SEO Strategy Generator
              </div>
              <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                AI SEO Strategy Maker — Free Custom SEO Plan Generator
              </h1>
              <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Enter your website URL and let AI do the heavy lifting. Ai Ranko crawls your site, analyzes competitors, and builds a complete SEO strategy — keywords, content calendar, technical fixes, and a 6-month action plan.
              </p>
              <p className="mt-2 text-sm font-medium text-primary">
                No guesswork. No agencies. No cost.
              </p>
            </div>

            <WizardCard
              step={step}
              form={form}
              setForm={setForm}
              phase={phase}
              progressMsg={progressMsg}
              error={error}
              canContinueStep1={!!canContinueStep1}
              canContinueStep2={canContinueStep2}
              onBack={() => setStep((s) => Math.max(1, s - 1))}
              onNext={() => setStep((s) => Math.min(4, s + 1))}
              onGenerate={handleGenerate}
            />
          </>
        )}

        {phase === 'done' && strategy && analysis && (
          <div ref={reportRef}>
            <StrategyReport
              strategy={strategy}
              analysis={analysis}
              form={form}
              onReset={reset}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Wizard Card
// ---------------------------------------------------------------------------
function WizardCard({
  step,
  form,
  setForm,
  phase,
  progressMsg,
  error,
  canContinueStep1,
  canContinueStep2,
  onBack,
  onNext,
  onGenerate,
}: {
  step: number
  form: FormData
  setForm: (f: FormData | ((prev: FormData) => FormData)) => void
  phase: Phase
  progressMsg: string
  error: string | null
  canContinueStep1: boolean
  canContinueStep2: boolean
  onBack: () => void
  onNext: () => void
  onGenerate: () => void
}) {
  const isLoading = phase === 'analyzing' || phase === 'generating'

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* Stepper */}
      <div className="border-b bg-muted/30 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {STEPS.map((s, idx) => {
            const isActive = s.id === step
            const isComplete = s.id < step
            return (
              <div key={s.id} className="flex items-center gap-2 sm:gap-4 flex-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                      isComplete
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {isComplete ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {s.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.description}
                    </div>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 ${
                      isComplete ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-primary/20 animate-pulse" />
          </div>
          <h3 className="font-heading text-xl font-semibold mt-6">
            {phase === 'analyzing' ? 'Analyzing your website' : 'Crafting your strategy'}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md text-pretty">
            {progressMsg}
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
            <ProgressItem
              done={true}
              label="Connect to your website"
            />
            <ProgressItem
              done={phase === 'generating'}
              active={phase === 'analyzing'}
              label="Crawl pages, parse meta tags, schema, headings, sitemap"
            />
            <ProgressItem
              done={false}
              active={phase === 'generating'}
              label="Generate AI-powered strategy & action plan"
            />
          </div>
        </div>
      )}

      {/* Step content */}
      {!isLoading && (
        <div className="p-6 sm:p-8">
          {step === 1 && <Step1 form={form} setForm={setForm} />}
          {step === 2 && <Step2 form={form} setForm={setForm} />}
          {step === 3 && <Step3 form={form} setForm={setForm} />}
          {step === 4 && <Step4 form={form} setForm={setForm} />}

          {error && (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-destructive">Error</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            <div className="flex items-center gap-2">
              {step === 3 && (
                <Button type="button" variant="ghost" onClick={onNext}>
                  Skip
                </Button>
              )}
              {step === 4 && (
                <Button type="button" variant="ghost" onClick={onGenerate}>
                  Skip & Generate
                </Button>
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={onNext}
                  disabled={
                    (step === 1 && !canContinueStep1) ||
                    (step === 2 && !canContinueStep2)
                  }
                >
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="button" onClick={onGenerate}>
                  <Sparkles className="h-4 w-4 mr-2" /> Generate SEO Strategy
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressItem({
  done,
  active,
  label,
}: {
  done: boolean
  active?: boolean
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ) : active ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-border" />
      )}
      <span
        className={`text-sm ${active ? 'text-foreground font-medium' : ''}`}
      >
        {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------
function Step1({
  form,
  setForm,
}: {
  form: FormData
  setForm: (f: FormData | ((prev: FormData) => FormData)) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Tell us about your website
        </h2>
        <p className="text-muted-foreground mt-1">
          We&apos;ll crawl your site and analyze every page automatically — no
          manual work needed.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="websiteUrl" className="mb-2 block">
            Website URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="websiteUrl"
            type="url"
            placeholder="https://example.com"
            value={form.websiteUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, websiteUrl: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            We&apos;ll automatically discover and analyze your internal pages,
            meta tags, schema markup, sitemap, robots.txt and more.
          </p>
        </div>

        <div className="md:col-span-2">
          <Label className="mb-2 block">Crawl Depth</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, crawlMode: 'quick' }))}
              className={`rounded-lg border p-3 text-left transition-colors ${
                form.crawlMode === 'quick' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'hover:bg-muted/50'
              }`}
            >
              <div className="text-sm font-semibold">Quick Audit</div>
              <div className="text-xs text-muted-foreground mt-0.5">A handful of your most important pages — fast, good for a first look.</div>
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, crawlMode: 'full' }))}
              className={`rounded-lg border p-3 text-left transition-colors ${
                form.crawlMode === 'full' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'hover:bg-muted/50'
              }`}
            >
              <div className="text-sm font-semibold">Full Site Audit</div>
              <div className="text-xs text-muted-foreground mt-0.5">Prefers your XML sitemap to reach more pages, within safe crawl limits — slower, more thorough.</div>
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="businessName" className="mb-2 block">
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            placeholder="Acme Corp"
            value={form.businessName}
            onChange={(e) =>
              setForm((f) => ({ ...f, businessName: e.target.value }))
            }
          />
        </div>

        <div>
          <Label htmlFor="industry" className="mb-2 block">
            Industry / Niche{' '}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Input
            id="industry"
            placeholder="e.g. Dental clinic, SaaS, eCommerce"
            value={form.industry}
            onChange={(e) =>
              setForm((f) => ({ ...f, industry: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Label htmlFor="isLocal" className="text-base font-medium">
                Local business?
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                Toggle on if you serve customers from a physical location.
                We&apos;ll add a full local SEO + NAP consistency audit.
              </p>
            </div>
          </div>
          <Switch
            id="isLocal"
            checked={form.isLocal}
            onCheckedChange={(v) => setForm((f) => ({ ...f, isLocal: v }))}
          />
        </div>

        {form.isLocal && (
          <div>
            <Label htmlFor="gmbUrl" className="mb-2 block">
              Google Business Profile URL{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="gmbUrl"
              type="url"
              placeholder="https://maps.google.com/?cid=..."
              value={form.gmbUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, gmbUrl: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              We&apos;ll extract the NAP (Name, Address, Phone) from your
              website and flag any inconsistencies with your GMB profile.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Step2({
  form,
  setForm,
}: {
  form: FormData
  setForm: (f: FormData | ((prev: FormData) => FormData)) => void
}) {
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      // If CSV, try to extract first column
      if (file.name.toLowerCase().endsWith('.csv')) {
        const lines = text.split(/\r?\n/).filter(Boolean)
        const keywords = lines
          .map((l) => {
            const cell = l.split(',')[0] || ''
            return cell.replace(/^"|"$/g, '').trim()
          })
          .filter((k) => k && k.toLowerCase() !== 'keyword')
          .join('\n')
        setForm((f) => ({ ...f, keywords }))
      } else {
        setForm((f) => ({ ...f, keywords: text }))
      }
    }
    reader.readAsText(file)
  }

  const keywordCount = form.keywords
    .split(/\r?\n/)
    .map((k) => k.trim())
    .filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Your keyword list
        </h2>
        <p className="text-muted-foreground mt-1">
          Paste keywords from Semrush, Ahrefs, or Google Keyword Planner — one
          per line. We&apos;ll prioritize them and map each to a target page.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="keywords">
            Keywords <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{keywordCount} keywords</Badge>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={onFile}
              />
              <span className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Upload className="h-3.5 w-3.5" />
                Upload CSV / TXT
              </span>
            </label>
          </div>
        </div>
        <Textarea
          id="keywords"
          placeholder={`best dental clinic near me\ncosmetic dentistry pricing\nteeth whitening cost\ndental implants procedure\n...`}
          value={form.keywords}
          onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
          rows={14}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Tip: paste the &quot;Keyword&quot; column from your Semrush/Ahrefs
          export — we&apos;ll auto-detect CSV format.
        </p>
      </div>
    </div>
  )
}

function Step3({
  form,
  setForm,
}: {
  form: FormData
  setForm: (f: FormData | ((prev: FormData) => FormData)) => void
}) {
  function setCompetitor(idx: number, value: string) {
    setForm((f) => {
      const next = [...f.competitors]
      next[idx] = value
      return { ...f, competitors: next }
    })
  }
  function addCompetitor() {
    if (form.competitors.length >= 4) return
    setForm((f) => ({ ...f, competitors: [...f.competitors, ''] }))
  }
  function removeCompetitor(idx: number) {
    setForm((f) => ({
      ...f,
      competitors: f.competitors.filter((_, i) => i !== idx),
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Your top competitors{' '}
          <Badge variant="secondary" className="ml-2">
            Optional
          </Badge>
        </h2>
        <p className="text-muted-foreground mt-1">
          Add up to 4 competitor websites and we&apos;ll analyze their
          strengths, weaknesses, and content gaps you can exploit. Skip if
          you&apos;d like.
        </p>
      </div>

      <div className="space-y-3">
        {form.competitors.map((c, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
              {idx + 1}
            </div>
            <Input
              type="url"
              placeholder={`https://competitor${idx + 1}.com`}
              value={c}
              onChange={(e) => setCompetitor(idx, e.target.value)}
            />
            {form.competitors.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCompetitor(idx)}
                aria-label="Remove competitor"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {form.competitors.length < 4 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCompetitor}
          >
            <Plus className="h-4 w-4 mr-1" /> Add another competitor
          </Button>
        )}
      </div>
    </div>
  )
}

function Step4({
  form,
  setForm,
}: {
  form: FormData
  setForm: (f: FormData | ((prev: FormData) => FormData)) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Additional context{' '}
          <Badge variant="secondary" className="ml-2">
            Optional
          </Badge>
        </h2>
        <p className="text-muted-foreground mt-1">
          Anything else that will help us tailor the strategy. All fields are
          skippable.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="location" className="mb-2 block">
            Primary location / service area
          </Label>
          <Input
            id="location"
            placeholder="e.g. Karachi, Pakistan"
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes" className="mb-2 block">
            Current challenges / goals
          </Label>
          <Textarea
            id="notes"
            placeholder="e.g. Site is new, struggling to rank for branded terms. Want to dominate local pack within 6 months."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={5}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Strategy Report
// ---------------------------------------------------------------------------
function StrategyReport({
  strategy,
  analysis,
  form,
  onReset,
}: {
  strategy: SeoStrategy
  analysis: SiteAnalysis
  form: FormData
  onReset: () => void
}) {
  // ----- Edit mode state -----
  const [editMode, setEditMode] = useState(false)
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set())
  // null = still resolving (show the section while previews load/retry); false = both
  // mobile and desktop previews failed, so the whole section is hidden — never an
  // empty "Preview unavailable" card.
  const [previewAvailable, setPreviewAvailable] = useState<boolean | null>(null)
  const [customNotes, setCustomNotes] = useState<
    { id: string; title: string; body: string }[]
  >([])

  function toggleSection(id: string) {
    setHiddenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function restoreAll() {
    setHiddenSections(new Set())
    setCustomNotes([])
  }

  function addCustomNote() {
    setCustomNotes((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}`,
        title: 'Custom Note',
        body: 'Click to edit this section. Add your own notes, observations, or extra strategy details here.',
      },
    ])
  }

  function deleteCustomNote(id: string) {
    setCustomNotes((prev) => prev.filter((n) => n.id !== id))
  }

  function downloadJson() {
    const blob = new Blob(
      [JSON.stringify({ form, analysis, strategy }, null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-strategy-${form.businessName.toLowerCase().replace(/\s+/g, '-') || 'report'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sectionProps = (id: string) => ({
    sectionId: id,
    editMode,
    hidden: hiddenSections.has(id),
    onDelete: () => toggleSection(id),
  })

  return (
    <div className="space-y-8">
      {/* Action toolbar (hidden on print) */}
      <div className="print:hidden sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-3 -mx-4 px-4 border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">
              {editMode ? 'Edit mode' : 'Strategy ready'}
            </span>
            <span className="hidden sm:inline">
              {editMode
                ? '— click any text to edit, or remove sections you don\u2019t need'
                : '— scroll to explore the full report'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={editMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditMode((v) => !v)}
            >
              {editMode ? (
                <>
                  <Save className="h-4 w-4 mr-1.5" /> Done editing
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-1.5" /> Edit report
                </>
              )}
            </Button>
            {editMode && (hiddenSections.size > 0 || customNotes.length > 0) && (
              <Button variant="outline" size="sm" onClick={restoreAll}>
                <Undo2 className="h-4 w-4 mr-1.5" /> Restore all
              </Button>
            )}
            {editMode && (
              <Button variant="outline" size="sm" onClick={addCustomNote}>
                <Plus className="h-4 w-4 mr-1.5" /> Add section
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={downloadJson}>
              <FileText className="h-4 w-4 mr-1.5" /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1.5" /> Save as PDF
            </Button>
            <Button size="sm" onClick={onReset}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> New report
            </Button>
          </div>
        </div>
        {editMode && hiddenSections.size > 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <EyeOff className="h-3.5 w-3.5" />
            {hiddenSections.size} section{hiddenSections.size > 1 ? 's' : ''} hidden — won&apos;t appear in PDF
          </div>
        )}
      </div>

      {/* Editable report body — entire report becomes inline-editable when editMode is on */}
      <div
        contentEditable={editMode}
        suppressContentEditableWarning
        spellCheck={editMode}
        className={`space-y-8 outline-none ${
          editMode
            ? 'rounded-lg ring-2 ring-primary/40 ring-offset-4 ring-offset-background focus-within:ring-primary'
            : ''
        }`}
      >
        {/* Cover */}
        <ReportCover strategy={strategy} analysis={analysis} form={form} />

        {/* Executive Summary */}
        <ReportSection
          {...sectionProps('exec-summary')}
          icon={ClipboardList}
          title="Executive Summary"
          kicker="Section 01"
        >
          <p className="text-pretty text-base leading-relaxed">
            {strategy.executiveSummary}
          </p>
        </ReportSection>

        {/* Health Score */}
        <ReportSection
          {...sectionProps('health-score')}
          icon={Award}
          title="SEO Health Score"
          kicker="Section 02"
        >
          <HealthScoreCard
            score={strategy.overallHealthScore}
            breakdown={strategy.healthScoreBreakdown}
          />
        </ReportSection>

        {/* Phase 3 — On-Page SEO Overview (deterministic, never AI-generated) */}
        <ReportSection
          {...sectionProps('on-page-overview')}
          icon={Gauge}
          title="On-Page SEO Overview"
          kicker="Section 03"
          description="Sitewide on-page audit stats, health score, and category breakdown — from the structured crawl, not AI narration."
        >
          <OnPageOverviewSection overview={strategy.onPageOverview} />
        </ReportSection>

        {/* Phase 3 — Priority On-Page Fixes */}
        <ReportSection
          {...sectionProps('priority-fixes')}
          icon={Target}
          title="Priority On-Page Fixes"
          kicker="Section 04"
          description="The highest-value on-page fixes, sorted by severity and page importance."
        >
          <PriorityFixesList fixes={strategy.onPagePriorityFixes} />
        </ReportSection>

        {/* Page-by-page audit */}
        <ReportSection
          {...sectionProps('page-by-page')}
          icon={ListChecks}
          title="Page-by-Page Audit"
          kicker="Section 05"
          description="Specific recommendations for each crawled page."
        >
          <PageByPageAudit pages={strategy.pageByPageAudit} onPageAudits={strategy.onPageAudits} />
        </ReportSection>

        {/* Mobile screenshot — hidden entirely if both previews fail to load */}
        {previewAvailable !== false && (
          <ReportSection
            {...sectionProps('screenshots')}
            icon={Smartphone}
            title="Mobile-Friendliness Preview"
            kicker="Section 06"
          >
            <ScreenshotPreview
              analysis={analysis}
              onAvailabilityChange={setPreviewAvailable}
            />
          </ReportSection>
        )}

        {/* Critical issues */}
        <ReportSection
          {...sectionProps('critical-issues')}
          icon={AlertTriangle}
          title="Critical Issues"
          kicker="Section 07"
          description="Top problems hurting rankings right now — fix these first."
        >
          <CriticalIssuesGrid issues={strategy.criticalIssues} />
        </ReportSection>

        {/* Quick wins */}
        <ReportSection
          {...sectionProps('quick-wins')}
          icon={Zap}
          title="Quick Wins (First 30 Days)"
          kicker="Section 08"
          description="High-leverage actions you can ship in days, not months."
        >
          <QuickWinsGrid wins={strategy.quickWins} />
        </ReportSection>

        {/* Technical SEO */}
        <ReportSection
          {...sectionProps('technical')}
          icon={Wrench}
          title="Technical SEO Audit"
          kicker="Section 09"
        >
          <p className="text-muted-foreground mb-6">
            {strategy.technicalSeoAudit.summary}
          </p>
          <TechnicalSummary analysis={analysis} crawlSummary={strategy.technicalCrawlSummary} />
          <div className="mt-6">
            <TechnicalChecklist items={strategy.technicalSeoAudit.checklist} />
          </div>
        </ReportSection>

        {/* On-page audit */}
        <ReportSection
          {...sectionProps('on-page')}
          icon={FileText}
          title="On-Page SEO Audit"
          kicker="Section 10"
        >
          <OnPageAudit audit={strategy.onPageAudit} />
        </ReportSection>

        {/* Keyword strategy */}
        <ReportSection
          {...sectionProps('keywords')}
          icon={Search}
          title="Keyword Strategy"
          kicker="Section 11"
        >
          <p className="text-muted-foreground mb-6">
            {strategy.keywordStrategy.summary}
          </p>
          <KeywordStrategy data={strategy.keywordStrategy} />
        </ReportSection>

        {/* Pages to create */}
        <ReportSection
          {...sectionProps('pages-to-create')}
          icon={PenLine}
          title="Pages to Create"
          kicker="Section 12"
          description="Evidence-based page opportunities, ranked by commercial priority — content briefs for new pages are below."
        >
          <div className="space-y-6">
            <PageOpportunitiesList opportunities={strategy.pageOpportunities} />
            <PagesToCreate pages={strategy.pagesToCreate} />
          </div>
        </ReportSection>

        {/* Blog ideas */}
        <ReportSection
          {...sectionProps('blog-ideas')}
          icon={Lightbulb}
          title="Blog Content Ideas"
          kicker="Section 13"
        >
          <BlogIdeas ideas={strategy.blogIdeas} />
        </ReportSection>

        {/* Competitors */}
        {strategy.competitorAnalysis.length > 0 && (
          <ReportSection
            {...sectionProps('competitors')}
            icon={Trophy}
            title="Competitor Analysis"
            kicker="Section 14"
          >
            <div className="space-y-6">
            <CompetitorComparisonTable intelligence={strategy.competitorIntelligence} />
            <CompetitorAnalysis competitors={strategy.competitorAnalysis} />
            <CompetitorOpportunities opportunities={strategy.competitorIntelligence.opportunities} />
          </div>
          </ReportSection>
        )}

        {/* Local SEO */}
        <ReportSection
          {...sectionProps('local-seo')}
          icon={MapPin}
          title="Local SEO & NAP Consistency"
          kicker="Section 15"
        >
          <LocalSeoSection data={strategy.localSeo} analysis={analysis} intelligence={strategy.localSeoIntelligence} />
        </ReportSection>

        {/* Off-page strategy */}
        <ReportSection
          {...sectionProps('off-page')}
          icon={Link2}
          title="Off-Page & Backlink Strategy"
          kicker="Section 16"
        >
          <OffPageSection data={strategy.offPageStrategy} />
        </ReportSection>

        {/* 6-month roadmap */}
        <ReportSection
          {...sectionProps('roadmap')}
          icon={MapIcon}
          title="6-Month Roadmap"
          kicker="Section 17"
          description="What we'll do each month and what you'll achieve."
        >
          <SixMonthRoadmap roadmap={strategy.sixMonthRoadmap} />
        </ReportSection>

        {/* KPIs */}
        <ReportSection
          {...sectionProps('kpis')}
          icon={BarChart3}
          title="KPI Targets"
          kicker="Section 18"
        >
          <KpiTable kpis={strategy.kpiTargets} />
        </ReportSection>

        {/* Tool stack */}
        <ReportSection
          {...sectionProps('tools')}
          icon={Wrench}
          title="Recommended Tool Stack"
          kicker="Section 19"
        >
          <ToolStack stack={strategy.toolStack} />
        </ReportSection>

        {/* Risk assessment */}
        <ReportSection
          {...sectionProps('risks')}
          icon={ShieldCheck}
          title="Risk Assessment"
          kicker="Section 20"
        >
          <RiskAssessment risks={strategy.riskAssessment} />
        </ReportSection>

        {/* Custom user-added notes */}
        {customNotes.map((note, idx) => (
          <ReportSection
            key={note.id}
            sectionId={note.id}
            editMode={editMode}
            hidden={hiddenSections.has(note.id)}
            onDelete={() => deleteCustomNote(note.id)}
            icon={PenLine}
            title={note.title}
            kicker={`Custom note ${idx + 1}`}
            isCustom
          >
            <p className="text-pretty text-base leading-relaxed whitespace-pre-wrap">
              {note.body}
            </p>
          </ReportSection>
        ))}

        {/* Conclusion */}
        <ReportSection
          {...sectionProps('conclusion')}
          icon={Rocket}
          title="Conclusion & Next Steps"
          kicker="Final"
        >
          <p className="text-pretty text-base leading-relaxed">
            {strategy.conclusion}
          </p>
          <div
            className="mt-6 rounded-lg border bg-muted/30 p-5 print:hidden"
            contentEditable={false}
          >
            <p className="text-sm">
              <strong>Ready to start?</strong> Generate a new report anytime,
              or export this one as PDF to share with your team.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-1.5" /> Save as PDF
              </Button>
              <Button size="sm" onClick={onReset}>
                <RefreshCw className="h-4 w-4 mr-1.5" /> Build a new strategy
              </Button>
            </div>
          </div>
        </ReportSection>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Report sub-components
// ---------------------------------------------------------------------------
function ReportCover({
  strategy,
  analysis,
  form,
}: {
  strategy: SeoStrategy
  analysis: SiteAnalysis
  form: FormData
}) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-8 sm:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            SEO Strategy Report · {today}
          </div>
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-balance leading-tight">
          {form.businessName || analysis.domain}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          <Link2 className="h-4 w-4 inline -mt-0.5 mr-1.5" />
          {analysis.domain}
        </p>
        <p className="mt-6 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground">
          A complete, data-driven SEO strategy generated from a live audit of{' '}
          <strong className="text-foreground">
            {analysis.totalPagesCrawled} pages
          </strong>
          , your provided keyword list, and competitive intelligence — built to
          deliver measurable rankings, traffic, and conversion growth over the
          next 6 months.
        </p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <CoverStat
            label="Health Score"
            value={`${strategy.overallHealthScore}/100`}
          />
          <CoverStat
            label="Pages Audited"
            value={String(analysis.totalPagesCrawled)}
          />
          <CoverStat
            label="Quick Wins"
            value={String(strategy.quickWins.length)}
          />
          <CoverStat
            label="Critical Issues"
            value={String(strategy.criticalIssues.length)}
          />
        </div>
      </div>
    </div>
  )
}

function CoverStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card/80 backdrop-blur p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="font-heading text-2xl font-bold mt-1">{value}</div>
    </div>
  )
}

function ReportSection({
  icon: Icon,
  title,
  kicker,
  description,
  children,
  sectionId,
  editMode = false,
  hidden = false,
  onDelete,
  isCustom = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  kicker?: string
  description?: string
  children: React.ReactNode
  sectionId?: string
  editMode?: boolean
  hidden?: boolean
  onDelete?: () => void
  isCustom?: boolean
}) {
  // When hidden:
  // - In edit mode: show a placeholder so the user can restore it
  // - Otherwise (and on print): hide completely
  if (hidden && !editMode) {
    return null
  }

  if (hidden && editMode) {
    return (
      <section
        className="rounded-2xl border-2 border-dashed bg-muted/30 p-5 print:hidden flex items-center justify-between gap-4"
        contentEditable={false}
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground min-w-0">
          <EyeOff className="h-4 w-4 shrink-0" />
          <span className="truncate">
            <span className="font-medium text-foreground">{title}</span> hidden
            from report
          </span>
        </div>
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="shrink-0"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" /> Show
          </Button>
        )}
      </section>
    )
  }

  return (
    <section
      data-section-id={sectionId}
      className={`relative rounded-2xl border bg-card p-6 sm:p-8 print:break-inside-avoid ${
        editMode
          ? 'ring-1 ring-transparent hover:ring-primary/30 transition-shadow'
          : ''
      } ${isCustom ? 'border-primary/40 bg-primary/[0.02]' : ''}`}
    >
      {editMode && onDelete && (
        <div
          className="absolute top-3 right-3 print:hidden flex items-center gap-1 z-10"
          contentEditable={false}
        >
          {isCustom && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
              Custom
            </span>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-card hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
            onClick={onDelete}
            title={isCustom ? 'Delete custom section' : 'Hide section'}
            aria-label={isCustom ? 'Delete custom section' : 'Hide section'}
          >
            {isCustom ? (
              <Trash2 className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      <div className="flex items-start gap-4 mb-6">
        <div
          className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
          contentEditable={false}
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          {kicker && (
            <div
              className="text-xs uppercase tracking-wider text-muted-foreground font-medium"
              contentEditable={false}
            >
              {kicker}
            </div>
          )}
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-balance">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-1.5 text-pretty">
              {description}
            </p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </section>
  )
}

function HealthScoreCard({
  score,
  breakdown,
}: {
  score: number
  breakdown: SeoStrategy['healthScoreBreakdown']
}) {
  const tone = score >= 75 ? 'good' : score >= 50 ? 'warn' : 'bad'
  const toneColors = {
    good: 'text-emerald-600 dark:text-emerald-400',
    warn: 'text-amber-600 dark:text-amber-400',
    bad: 'text-destructive',
  }
  const ringColors = {
    good: 'stroke-emerald-500',
    warn: 'stroke-amber-500',
    bad: 'stroke-destructive',
  }
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const items: { label: string; value: number | null; key: string }[] = [
    { label: 'Technical', value: breakdown.technical, key: 'technical' },
    { label: 'On-Page', value: breakdown.onPage, key: 'onPage' },
    { label: 'Content', value: breakdown.content, key: 'content' },
    { label: 'Off-Page', value: breakdown.offPage, key: 'offPage' },
    {
      label: 'Local',
      value: breakdown.local,
      key: 'local',
    },
  ]
  // Local can be null (not applicable / not evaluated) — a fabricated 0
  // would misleadingly render as a failing score instead of "no data".
  const localNotEvaluatedLabel =
    breakdown.local === null
      ? breakdown.localStatus === 'not_applicable'
        ? 'Not Applicable'
        : 'Not Evaluated'
      : null

  return (
    <div className="grid gap-8 lg:grid-cols-[auto_1fr] items-center">
      <div className="flex justify-center">
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle
              cx="90"
              cy="90"
              r={radius}
              strokeWidth="14"
              className="stroke-muted"
              fill="none"
            />
            <circle
              cx="90"
              cy="90"
              r={radius}
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 90 90)"
              className={ringColors[tone]}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`font-heading text-4xl font-bold ${toneColors[tone]}`}>
              {score}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              out of 100
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.key}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">
                {item.value === null ? localNotEvaluatedLabel : `${item.value}/100`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${item.value ?? 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Hides individual preview frames as soon as they fail, and reports up (via onAvailabilityChange) whether ANY preview is available so the caller can hide the whole "Mobile-Friendliness Preview" section when both fail — never show an empty "Preview unavailable / Retry" card. */
function ScreenshotPreview({
  analysis,
  onAvailabilityChange,
}: {
  analysis: SiteAnalysis
  onAvailabilityChange?: (available: boolean) => void
}) {
  const [mobileOk, setMobileOk] = useState<boolean | null>(null)
  const [desktopOk, setDesktopOk] = useState<boolean | null>(null)

  useEffect(() => {
    if (mobileOk === null || desktopOk === null) return // still resolving — don't decide yet
    onAvailabilityChange?.(mobileOk || desktopOk)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOk, desktopOk])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {mobileOk !== false && (
        <ScreenshotFrame
          label="Mobile (414px)"
          icon={Smartphone}
          src={analysis.mobileScreenshotUrl}
          alt={`Mobile screenshot of ${analysis.domain}`}
          domain={analysis.domain}
          finalUrl={analysis.finalUrl}
          onResolved={setMobileOk}
        />
      )}
      {desktopOk !== false && (
        <ScreenshotFrame
          label="Desktop (1280px)"
          icon={Monitor}
          src={analysis.desktopScreenshotUrl}
          alt={`Desktop screenshot of ${analysis.domain}`}
          domain={analysis.domain}
          finalUrl={analysis.finalUrl}
          onResolved={setDesktopOk}
        />
      )}
    </div>
  )
}

function ScreenshotFrame({
  label,
  icon: Icon,
  src,
  alt,
  domain,
  finalUrl,
  onResolved,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  src: string
  alt: string
  domain: string
  finalUrl: string
  onResolved?: (ok: boolean) => void
}) {
  // Cache-bust attempts — mshots returns a placeholder (1x1 or "loading" image)
  // until the screenshot is generated, so we retry up to 4 times with a delay.
  const [attempt, setAttempt] = React.useState(0)
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'failed'>(
    'loading',
  )
  const maxAttempts = 5

  React.useEffect(() => {
    if (status === 'loading' && attempt < maxAttempts) {
      const t = setTimeout(
        () => setAttempt((a) => a + 1),
        // First retry quick, then back off
        attempt === 0 ? 2500 : 4000,
      )
      return () => clearTimeout(t)
    }
  }, [status, attempt])

  const cacheBustedSrc = `${src}${src.includes('?') ? '&' : '?'}r=${attempt}`

  React.useEffect(() => {
    if (status === 'ready') onResolved?.(true)
    if (status === 'failed') onResolved?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // The parent (ScreenshotPreview) unmounts this frame once onResolved(false)
  // fires — never render an empty "Preview unavailable / Retry" card here.
  if (status === 'failed') return null

  return (
    <div className="rounded-xl border overflow-hidden bg-muted/30">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-muted/50">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">{label}</span>
        </div>
        <a
          href={finalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 shrink-0"
        >
          {domain}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="p-6 flex items-center justify-center min-h-[280px] relative">
        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/30">
            <Spinner className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">
              Capturing preview…
            </span>
          </div>
        )}
        {
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={attempt}
            src={cacheBustedSrc}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`rounded-lg border shadow-sm max-w-full h-auto transition-opacity duration-300 ${
              status === 'ready' ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={(e) => {
              const img = e.currentTarget
              // mshots returns a tiny placeholder while rendering — keep retrying
              if (img.naturalWidth < 50 || img.naturalHeight < 50) {
                if (attempt >= maxAttempts - 1) {
                  setStatus('failed')
                } else {
                  setStatus('loading')
                }
                return
              }
              setStatus('ready')
            }}
            onError={() => {
              if (attempt >= maxAttempts - 1) {
                setStatus('failed')
              } else {
                setStatus('loading')
              }
            }}
          />
        }
      </div>
    </div>
  )
}

function CriticalIssuesGrid({
  issues,
}: {
  issues: SeoStrategy['criticalIssues']
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {issues.map((iss, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-5 print:break-inside-avoid"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-base text-balance">{iss.title}</h3>
            <ImpactBadge impact={iss.impact} />
          </div>
          <p className="text-sm text-muted-foreground mb-3 text-pretty">
            {iss.description}
          </p>
          <div className="rounded-lg bg-muted/50 p-3 mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              How to fix
            </div>
            <p className="text-sm text-pretty">{iss.howToFix}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Effort:</span>
            <Badge variant="outline" className="capitalize">
              {iss.estimatedEffort}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

function ImpactBadge({ impact }: { impact: 'critical' | 'high' | 'medium' }) {
  const cls = {
    critical: 'bg-destructive/10 text-destructive border-destructive/30',
    high: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    medium: 'bg-primary/10 text-primary border-primary/30',
  }[impact]
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${cls}`}
    >
      {impact}
    </span>
  )
}

function QuickWinsGrid({ wins }: { wins: SeoStrategy['quickWins'] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wins.map((w, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-5 print:break-inside-avoid relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-primary/5 rounded-bl-full" />
          <div className="relative">
            <Zap className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold mb-2 text-balance">{w.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 text-pretty">
              {w.description}
            </p>
            <div className="text-xs font-medium text-primary flex items-start gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{w.expectedImpact}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Phase 5 — sitewide crawl coverage + sitemap health, straight from SeoStrategy.technicalCrawlSummary / SiteAnalysis.sitemapAudit. Never recalculated here — this is presentation only. */
function CrawlCoverageBlock({ analysis, crawlSummary }: { analysis: SiteAnalysis; crawlSummary: SeoStrategy['technicalCrawlSummary'] }) {
  const isPartial = crawlSummary.excluded > 0
  return (
    <div className="rounded-xl border bg-muted/20 p-4 space-y-3 print:break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold">Crawl Coverage</span>
          <Badge variant="outline" className="text-xs">
            {analysis.crawlMode === 'full' ? 'Full Site Audit' : 'Quick Audit'}
          </Badge>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${
            isPartial
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
          }`}
        >
          {isPartial ? 'Partial crawl' : 'Full crawl'}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
        {[
          { label: 'Discovered', value: crawlSummary.discovered },
          { label: 'Crawled', value: crawlSummary.crawled },
          { label: 'Failed', value: crawlSummary.failed },
          { label: 'Redirected', value: crawlSummary.redirected },
          { label: 'Excluded', value: crawlSummary.excluded },
          { label: 'Audited', value: crawlSummary.audited },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-2">
            <div className="text-lg font-bold tabular-nums">{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{crawlSummary.coverageNote}</p>
    </div>
  )
}

const SITEMAP_ISSUE_LABEL: Record<SiteAnalysis['sitemapAudit'] extends { flaggedUrls: { issue: infer U }[] } | null ? U : never, string> = {
  unreachable: 'Unreachable',
  redirect: 'Redirects',
  client_error: 'Client Error (4xx)',
  server_error: 'Server Error (5xx)',
  noindex_in_sitemap: 'Noindex in Sitemap',
  blocked_by_robots: 'Blocked by robots.txt',
  canonical_mismatch: 'Canonical Mismatch',
}

/** Phase 5 — XML sitemap audit: exact affected URLs, not just an aggregate count. */
function SitemapAuditBlock({ sitemapAudit }: { sitemapAudit: NonNullable<SiteAnalysis['sitemapAudit']> }) {
  const { totalUrls, checkedUrls, valid200, redirects, clientErrors, serverErrors, notCrawledCount, flaggedUrls } = sitemapAudit
  return (
    <div className="rounded-xl border bg-muted/20 p-4 space-y-3 print:break-inside-avoid">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold">XML Sitemap Audit</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {totalUrls} URL{totalUrls === 1 ? '' : 's'} in the sitemap · {checkedUrls} status-checked · {notCrawledCount} not reached by this crawl.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        {[
          { label: 'Valid (200)', value: valid200 },
          { label: 'Redirects', value: redirects },
          { label: '4xx', value: clientErrors },
          { label: '5xx', value: serverErrors },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-2">
            <div className="text-lg font-bold tabular-nums">{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      {flaggedUrls.length > 0 ? (
        <ul className="text-xs space-y-1">
          {flaggedUrls.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-pretty">
                <code className="font-mono">{f.url}</code> — {SITEMAP_ISSUE_LABEL[f.issue]}
                {f.status !== null ? ` (HTTP ${f.status})` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" /> No sitemap issues found in the checked sample.
        </p>
      )}
    </div>
  )
}

function TechnicalSummary({ analysis, crawlSummary }: { analysis: SiteAnalysis; crawlSummary: SeoStrategy['technicalCrawlSummary'] }) {
  const stats = [
    {
      label: 'HTTPS',
      value: analysis.isHttps ? 'Enabled' : 'NOT enabled',
      ok: analysis.isHttps,
    },
    {
      label: 'robots.txt',
      value: analysis.robotsTxt.found ? 'Found' : 'Missing',
      ok: analysis.robotsTxt.found && !analysis.robotsTxt.disallowsAll,
    },
    {
      label: 'XML Sitemap',
      value: analysis.sitemapXml.found
        ? `${analysis.sitemapXml.urlCount} URLs`
        : 'Missing',
      ok: analysis.sitemapXml.found,
    },
    {
      label: 'HTML Sitemap',
      value: analysis.htmlSitemap.found ? 'Found' : 'Missing',
      ok: analysis.htmlSitemap.found,
    },
    {
      label: 'Avg Load Time',
      value: `${(analysis.technicalSummary.averageLoadTimeMs / 1000).toFixed(2)}s`,
      ok: analysis.technicalSummary.averageLoadTimeMs < 2500,
    },
    {
      label: 'Avg Word Count',
      value: String(analysis.technicalSummary.averageWordCount),
      ok: analysis.technicalSummary.averageWordCount >= 500,
    },
    {
      label: 'Pages w/ Schema',
      value: `${analysis.technicalSummary.hasSchema}/${analysis.totalPagesCrawled}`,
      ok:
        analysis.technicalSummary.hasSchema /
          Math.max(1, analysis.totalPagesCrawled) >=
        0.5,
    },
    {
      label: 'Pages w/ OG Tags',
      value: `${analysis.technicalSummary.hasOgTags}/${analysis.totalPagesCrawled}`,
      ok:
        analysis.technicalSummary.hasOgTags /
          Math.max(1, analysis.totalPagesCrawled) >=
        0.5,
    },
  ]

  return (
    <div className="space-y-4">
      <CrawlCoverageBlock analysis={analysis} crawlSummary={crawlSummary} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border bg-muted/30 p-3 print:break-inside-avoid"
          >
            <div className="flex items-center gap-2 mb-1">
              {s.ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
              )}
              <div className="text-xs uppercase tracking-wider text-muted-foreground truncate">
                {s.label}
              </div>
            </div>
            <div className="font-semibold text-sm">{s.value}</div>
          </div>
        ))}
      </div>
      {analysis.sitemapAudit && <SitemapAuditBlock sitemapAudit={analysis.sitemapAudit} />}
    </div>
  )
}

function TechnicalChecklist({
  items,
}: {
  items: SeoStrategy['technicalSeoAudit']['checklist']
}) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="divide-y">
        {items.map((item, i) => (
          <div key={i} className="p-4 sm:p-5 flex gap-4 print:break-inside-avoid">
            <div className="shrink-0 mt-0.5">
              <StatusIcon status={item.status} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h4 className="font-semibold text-balance">{item.item}</h4>
                <PriorityBadge priority={item.priority} />
              </div>
              <p className="text-sm text-muted-foreground mb-2 text-pretty">
                <span className="font-medium text-foreground">Finding: </span>
                {item.finding}
              </p>
              <p className="text-sm text-pretty">
                <span className="font-medium">Recommendation: </span>
                {item.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusIcon({
  status,
}: {
  status: 'pass' | 'warning' | 'fail' | 'not-applicable'
}) {
  if (status === 'pass') return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
  if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />
  if (status === 'fail') return <XCircle className="h-5 w-5 text-destructive" />
  return <HelpCircle className="h-5 w-5 text-muted-foreground" />
}

function PriorityBadge({
  priority,
}: {
  priority: 'critical' | 'high' | 'medium' | 'low'
}) {
  const cls = {
    critical: 'bg-destructive/10 text-destructive border-destructive/30',
    high: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    medium: 'bg-primary/10 text-primary border-primary/30',
    low: 'bg-muted text-muted-foreground border-border',
  }[priority]
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize whitespace-nowrap ${cls}`}
    >
      {priority}
    </span>
  )
}

function OnPageAudit({ audit }: { audit: SeoStrategy['onPageAudit'] }) {
  const items: { title: string; data: { finding: string; recommendation: string } }[] = [
    { title: 'Meta Titles', data: audit.metaTitles },
    { title: 'Meta Descriptions', data: audit.metaDescriptions },
    { title: 'Heading Structure (H1/H2/H3)', data: audit.headingStructure },
    { title: 'Open Graph Tags', data: audit.openGraph },
    { title: 'Twitter Cards', data: audit.twitterCards },
    { title: 'Internal Linking', data: audit.internalLinking },
    { title: 'Image Optimization', data: audit.imageOptimization },
  ]

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">{audit.summary}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.title}
            className="rounded-xl border bg-card p-5 print:break-inside-avoid"
          >
            <h4 className="font-semibold mb-3 text-balance">{it.title}</h4>
            <div className="text-sm space-y-2">
              <p>
                <span className="font-medium text-muted-foreground">
                  Finding:{' '}
                </span>
                <span className="text-pretty">{it.data.finding}</span>
              </p>
              <p>
                <span className="font-medium text-primary">Recommendation: </span>
                <span className="text-pretty">{it.data.recommendation}</span>
              </p>
            </div>
          </div>
        ))}
        <div className="rounded-xl border bg-card p-5 md:col-span-2 print:break-inside-avoid">
          <h4 className="font-semibold mb-3">Schema Markup</h4>
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-medium text-foreground">Finding: </span>
            <span className="text-pretty">{audit.schemaMarkup.finding}</span>
          </p>
          <p className="text-sm mb-3">
            <span className="font-medium text-primary">Recommendation: </span>
            <span className="text-pretty">{audit.schemaMarkup.recommendation}</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {audit.schemaMarkup.recommendedTypes.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Phase 3 — On-Page SEO Overview + Priority Fixes. Every number rendered
// below comes straight from SeoStrategy.onPageOverview / onPagePriorityFixes
// / onPageAudits (lib/seo-strategy/on-page-overview.ts) — this file never
// recalculates severity, counts, or scores itself, only presents them.
// ──────────────────────────────────────────────────────────────────────────
const SEVERITY_BADGE_CLS: Record<Severity, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
  high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  low: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  info: 'bg-muted text-muted-foreground border-border',
  pass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  not_evaluated: 'bg-muted text-muted-foreground border-border',
}
const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
  pass: 'Good',
  not_evaluated: 'Not Evaluated',
}

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${SEVERITY_BADGE_CLS[severity]}`}>
      {SEVERITY_LABEL[severity]}
    </span>
  )
}

const SCORE_STATUS_CLS: Record<ScoreStatus, string> = {
  excellent: 'text-emerald-600 dark:text-emerald-400',
  good: 'text-emerald-600 dark:text-emerald-400',
  needs_improvement: 'text-amber-600 dark:text-amber-400',
  poor: 'text-orange-600 dark:text-orange-400',
  critical: 'text-destructive',
}

const SCORE_STATUS_BAR_CLS: Record<ScoreStatus, string> = {
  excellent: 'bg-emerald-500',
  good: 'bg-emerald-500',
  needs_improvement: 'bg-amber-500',
  poor: 'bg-orange-500',
  critical: 'bg-destructive',
}

function ScoreStatusBadge({ status }: { status: ScoreStatus }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap bg-current/10 border-current/30 ${SCORE_STATUS_CLS[status]}`}
    >
      {SCORE_STATUS_LABEL[status]}
    </span>
  )
}

/** One sitewide "N Pages / N Issues"-style stat used in the overview's top stat grid. */
function OverviewStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-center">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}

/** Sitewide Critical/High/Medium/Low counts, always in that order — reused by the overview header and every category card. */
function SeverityBreakdownRow({ bySeverity }: { bySeverity: { critical: number; high: number; medium: number; low: number } }) {
  const entries: { severity: Severity; count: number }[] = (
    [
      { severity: 'critical', count: bySeverity.critical },
      { severity: 'high', count: bySeverity.high },
      { severity: 'medium', count: bySeverity.medium },
      { severity: 'low', count: bySeverity.low },
    ] satisfies { severity: Severity; count: number }[]
  ).filter((e) => e.count > 0)
  if (entries.length === 0) {
    return <SeverityBadge severity="pass" />
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map((e) => (
        <span
          key={e.severity}
          className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${SEVERITY_BADGE_CLS[e.severity]}`}
        >
          {e.count} {SEVERITY_LABEL[e.severity]}
        </span>
      ))}
    </div>
  )
}

const CATEGORY_CARD_META: {
  key: keyof SeoStrategy['onPageOverview']['categories']
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { key: 'metaTitle', label: 'Meta Titles', icon: FileText },
  { key: 'metaDescription', label: 'Meta Descriptions', icon: FileText },
  { key: 'headings', label: 'Headings', icon: ListChecks },
  { key: 'content', label: 'Content', icon: ClipboardList },
  { key: 'images', label: 'Images', icon: ImageIcon },
  { key: 'internalLinks', label: 'Internal Linking', icon: Link2 },
  { key: 'technical', label: 'Technical', icon: Wrench },
]

/** One compact category card — affected-page + issue counts + severity breakdown, straight from OnPageOverview.categories. */
function CategorySummaryCard({
  label,
  icon: Icon,
  slice,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  slice: SeoStrategy['onPageOverview']['categories'][keyof SeoStrategy['onPageOverview']['categories']]
}) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      {slice.affectedPages === 0 ? (
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          No issues found
        </div>
      ) : (
        <>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{slice.affectedPages}</span> page{slice.affectedPages === 1 ? '' : 's'} affected
            {' · '}
            <span className="font-semibold text-foreground">{slice.issueCount}</span> issue{slice.issueCount === 1 ? '' : 's'}
          </div>
          <SeverityBreakdownRow bySeverity={slice.bySeverity} />
        </>
      )}
    </div>
  )
}

/** Sitewide "On-Page SEO Overview" section — every number sourced from SeoStrategy.onPageOverview, never recalculated here. */
function OnPageOverviewSection({ overview }: { overview: SeoStrategy['onPageOverview'] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <OverviewStat label="URLs Discovered" value={overview.pagesDiscovered} />
        <OverviewStat label="Pages Crawled" value={overview.pagesCrawled} />
        <OverviewStat label="Pages Audited" value={overview.pagesAudited} />
        <OverviewStat label="Pages With Issues" value={overview.pagesWithIssues} />
        <OverviewStat label="Total Issues" value={overview.totalIssues} />
      </div>

      <div className="rounded-xl border bg-muted/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">On-Page Health Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold tabular-nums ${SCORE_STATUS_CLS[overview.scoreStatus]}`}>{overview.score}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
            <ScoreStatusBadge status={overview.scoreStatus} />
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${SCORE_STATUS_BAR_CLS[overview.scoreStatus]}`}
            style={{ width: `${Math.max(2, overview.score)}%` }}
          />
        </div>
        <div className="mt-3">
          <SeverityBreakdownRow bySeverity={overview.bySeverity} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORY_CARD_META.map(({ key, label, icon }) => (
          <CategorySummaryCard key={key} label={label} icon={icon} slice={overview.categories[key]} />
        ))}
      </div>

      <PixelDisplaySummarySection titleDisplay={overview.titleDisplay} descriptionDisplay={overview.descriptionDisplay} />
    </div>
  )
}

/** Phase 4 — sitewide "Title Display Issues" / "Meta Description Display Issues" counts, from OnPageOverview.titleDisplay/descriptionDisplay. Framed as SERP display optimization, not a ranking factor. Hidden entirely when nothing to report. */
function PixelDisplaySummarySection({
  titleDisplay,
  descriptionDisplay,
}: {
  titleDisplay: SeoStrategy['onPageOverview']['titleDisplay']
  descriptionDisplay: SeoStrategy['onPageOverview']['descriptionDisplay']
}) {
  const hasAny = (d: typeof titleDisplay) => d.tooLong + d.tooShort + d.borderline > 0
  if (!hasAny(titleDisplay) && !hasAny(descriptionDisplay)) return null

  const rows: { label: string; d: typeof titleDisplay }[] = [
    { label: 'Title Display Issues', d: titleDisplay },
    { label: 'Meta Description Display Issues', d: descriptionDisplay },
  ]

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Gauge className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold">SERP Display Width</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Approximate SERP display fit for current titles/descriptions — a display-optimization signal, not a ranking factor.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {rows.map(({ label, d }) =>
          hasAny(d) ? (
            <div key={label} className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="flex flex-wrap gap-1.5">
                {d.tooLong > 0 && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${SERP_PIXEL_STATUS_CLS.too_long}`}>
                    {d.tooLong} Too Long
                  </span>
                )}
                {d.tooShort > 0 && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${SERP_PIXEL_STATUS_CLS.too_short}`}>
                    {d.tooShort} Too Short
                  </span>
                )}
                {d.borderline > 0 && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${SERP_PIXEL_STATUS_CLS.borderline_short}`}
                  >
                    {d.borderline} Borderline
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div key={label} className="rounded-lg border bg-muted/20 p-3 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              {label.replace(' Issues', '')}: no display-width issues
            </div>
          ),
        )}
      </div>
    </div>
  )
}

/** "Priority On-Page Fixes" — top 5-10 highest-value items, already sorted deterministically by lib/seo-strategy/on-page-overview.ts. Never reordered here. */
function PriorityFixesList({ fixes }: { fixes: SeoStrategy['onPagePriorityFixes'] }) {
  if (fixes.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
        No high-priority on-page fixes — everything checked out well.
      </div>
    )
  }
  return (
    <ol className="space-y-2">
      {fixes.map((f, i) => (
        <li key={`${f.url}-${f.category}-${i}`} className="rounded-lg border bg-card p-3 flex items-start gap-3">
          <span className="text-xs font-semibold text-muted-foreground shrink-0 mt-0.5 w-5 text-right">{i + 1}.</span>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={f.severity} />
              <Badge variant="outline" className="text-xs">
                {f.category}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">{f.pageName}</span>
            </div>
            <p className="text-sm text-pretty">{f.fix}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Small status pill for the deterministic on-page audit fields (title/description/H1/headings) — reuses the same visual language as PriorityBadge/StatusIcon rather than introducing a new pattern. */
function OnPageStatusPill({ status }: { status: 'good' | 'needs_improvement' | 'poor' | 'not_evaluated' }) {
  const cls = {
    good: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    needs_improvement: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    poor: 'bg-destructive/10 text-destructive border-destructive/30',
    not_evaluated: 'bg-muted text-muted-foreground border-border',
  }[status]
  const label = { good: 'Good', needs_improvement: 'Needs Improvement', poor: 'Poor', not_evaluated: 'Not Evaluated' }[status]
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${cls}`}>{label}</span>
}

/** A current-value / suggested-value pair for one deterministic on-page field. Shows "No change required" instead of a suggestion when the field is already good — never rewrites what isn't broken. */
/** Phase 4 — Green/Orange/Red/Gray SERP pixel-width status badge. Text label is mandatory (never color-only). */
const SERP_PIXEL_STATUS_CLS: Record<SerpPixelStatusValue, string> = {
  good: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  borderline_short: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
  borderline_long: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
  too_short: 'bg-destructive/10 text-destructive border-destructive/30',
  too_long: 'bg-destructive/10 text-destructive border-destructive/30',
  not_available: 'bg-muted text-muted-foreground border-border',
}

function SerpPixelStatusBadge({ status }: { status: SerpPixelStatusValue }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${SERP_PIXEL_STATUS_CLS[status]}`}>
      {SERP_PIXEL_STATUS_LABEL[status]}
    </span>
  )
}

/** One title/description's character count + SERP pixel width + status — the pixel width is the primary SERP-display signal, character count is secondary. This is a presentation-only formatter: every number comes from the deterministic audit (lib/seo-strategy/serp-pixel.ts), never recalculated here. */
interface SerpPixelInfo {
  characterCount: number
  pixelWidth: number | null
  pixelStatus: SerpPixelStatusValue
  /** Descriptions only — approximate SERP line count. */
  estimatedLines?: number | null
}

function SerpPixelLine({ info }: { info: SerpPixelInfo }) {
  const parts = [`${info.characterCount} character${info.characterCount === 1 ? '' : 's'}`]
  if (info.pixelWidth !== null) {
    parts.push(
      info.estimatedLines != null ? `~${info.pixelWidth.toLocaleString()}px total` : `${info.pixelWidth.toLocaleString()}px`,
    )
    if (info.estimatedLines != null) parts.push(`~${info.estimatedLines} line${info.estimatedLines === 1 ? '' : 's'}`)
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground tabular-nums">{parts.join(' · ')}</span>
      <SerpPixelStatusBadge status={info.pixelStatus} />
    </div>
  )
}

function OnPageFieldBlock({
  label,
  status,
  currentValue,
  currentPixels,
  suggestedValue,
  suggestedPixels,
  issues,
}: {
  label: string
  status: 'good' | 'needs_improvement' | 'poor' | 'not_evaluated'
  currentValue: string | null
  /** Phase 4 — omit for fields with no pixel model (e.g. H1, which reuses this component without SERP measurement). */
  currentPixels?: SerpPixelInfo
  suggestedValue: string | null
  suggestedPixels?: SerpPixelInfo
  issues: string[]
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <OnPageStatusPill status={status} />
      </div>
      <p className="text-sm bg-muted/50 rounded-lg p-3 text-pretty">
        {currentValue || <em className="text-muted-foreground">Missing</em>}
      </p>
      {currentPixels && <SerpPixelLine info={currentPixels} />}
      {issues.length > 0 && (
        <ul className="text-xs space-y-1 text-muted-foreground">
          {issues.map((iss, j) => (
            <li key={j} className="flex items-start gap-1.5">
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-pretty">{iss}</span>
            </li>
          ))}
        </ul>
      )}
      {status === 'good' ? (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">No change required.</p>
      ) : suggestedValue ? (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Suggested</div>
          <p className="text-sm bg-primary/5 border border-primary/20 rounded-lg p-3 text-pretty">{suggestedValue}</p>
          {suggestedPixels && <SerpPixelLine info={suggestedPixels} />}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Custom always-mounted collapse (not Radix Accordion, which unmounts closed
 * content and would break `window.print()` export) — the body stays in the
 * DOM at all times; only its on-screen visibility toggles. `print:block!`
 * force-shows every card's content when printing/exporting to PDF,
 * regardless of its on-screen collapsed state, so nothing important is
 * missing from the exported report.
 */
function CollapsiblePageCard({
  pageName,
  url,
  targetKeyword,
  score,
  scoreStatus,
  severity,
  defaultExpanded,
  children,
}: {
  pageName: string
  url: string
  targetKeyword: string | null
  score: number | null
  scoreStatus: ScoreStatus | null
  severity: Severity
  defaultExpanded: boolean
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <div className="rounded-xl border bg-card overflow-hidden print:break-inside-avoid">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-5 py-3 border-b bg-muted/30 flex items-center gap-2 text-left print:pointer-events-none"
        aria-expanded={expanded}
      >
        <Globe className="h-4 w-4 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold truncate">{pageName}</span>
            <SeverityBadge severity={severity} />
            {targetKeyword && (
              <Badge variant="outline" className="text-xs">
                {targetKeyword}
              </Badge>
            )}
          </div>
          <code className="text-xs text-muted-foreground truncate block">{url}</code>
        </div>
        {score !== null && scoreStatus !== null && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-sm font-bold tabular-nums ${SCORE_STATUS_CLS[scoreStatus]}`}>{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        )}
        <span className="print:hidden shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </span>
      </button>
      <div className={expanded ? 'block' : 'hidden print:block!'}>{children}</div>
    </div>
  )
}

/** Compact Good / Needs Improvement / Poor / Critical / Not Evaluated status table per page — simple statuses only, no vague labels. Every value is read straight from the deterministic audit, never recalculated here. */
function PageStatusTable({ onPage }: { onPage: SeoStrategy['onPageAudits'][number] }) {
  const rows: { label: string; status: 'good' | 'needs_improvement' | 'poor' | 'not_evaluated' }[] = [
    { label: 'Meta Title', status: onPage.metaTitle.status },
    { label: 'Meta Description', status: onPage.metaDescription.status },
    { label: 'H1', status: onPage.h1.status },
    { label: 'Headings', status: onPage.headings.status },
    { label: 'Content', status: onPage.content.status },
    { label: 'Images', status: onPage.images.status },
    { label: 'Internal Linking', status: onPage.internalLinks.status },
    { label: 'Technical', status: onPage.technicalOnPage.status },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {rows.map((r) => (
        <div key={r.label} className="rounded-lg border bg-muted/20 p-2 flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">{r.label}</span>
          <OnPageStatusPill status={r.status} />
        </div>
      ))}
    </div>
  )
}

function PageByPageAudit({
  pages,
  onPageAudits,
}: {
  pages: SeoStrategy['pageByPageAudit']
  onPageAudits: SeoStrategy['onPageAudits']
}) {
  const onPageByUrl = new Map(onPageAudits.map((a) => [a.url, a]))
  return (
    <div className="space-y-4">
      {pages.map((p, i) => {
        const onPage = onPageByUrl.get(p.url)
        // Expanded by default for pages with Critical/High findings; collapsed
        // (but never removed from the DOM, so print/export still shows
        // everything) for Medium/Low/Good pages — per the Phase 3 spec.
        const overallSeverity = onPage ? pageOverallSeverity(onPage) : 'not_evaluated'
        const defaultExpanded = overallSeverity === 'critical' || overallSeverity === 'high'
        return (
          <CollapsiblePageCard
            key={i}
            pageName={onPage?.pageName ?? p.url}
            url={p.url}
            targetKeyword={onPage?.targetKeyword ?? null}
            score={onPage?.onPageScore ?? null}
            scoreStatus={onPage?.onPageScoreStatus ?? null}
            severity={overallSeverity}
            defaultExpanded={defaultExpanded}
          >
          <div className="p-5 space-y-4">
            {onPage && <PageStatusTable onPage={onPage} />}
            <div className="grid md:grid-cols-2 gap-4">
              {onPage ? (
                <OnPageFieldBlock
                  label="Meta Title"
                  status={onPage.metaTitle.status}
                  currentValue={onPage.metaTitle.currentValue}
                  currentPixels={{
                    characterCount: onPage.metaTitle.characterCount,
                    pixelWidth: onPage.metaTitle.pixelWidth,
                    pixelStatus: onPage.metaTitle.pixelStatus,
                  }}
                  suggestedValue={onPage.metaTitle.suggestedValue}
                  suggestedPixels={
                    onPage.metaTitle.suggestedValue
                      ? {
                          characterCount: onPage.metaTitle.suggestedCharacterCount ?? 0,
                          pixelWidth: onPage.metaTitle.suggestedPixelWidth,
                          pixelStatus: onPage.metaTitle.suggestedPixelStatus ?? 'not_available',
                        }
                      : undefined
                  }
                  issues={onPage.metaTitle.issues}
                />
              ) : (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Current Title
                  </div>
                  <p className="text-sm bg-muted/50 rounded-lg p-3 text-pretty">
                    {p.currentTitle || <em className="text-muted-foreground">Missing</em>}
                  </p>
                </div>
              )}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1.5">
                  Suggested Title
                </div>
                <p className="text-sm bg-primary/5 border border-primary/20 rounded-lg p-3 text-pretty">
                  {p.suggestedTitle}
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {onPage ? (
                <OnPageFieldBlock
                  label="Meta Description"
                  status={onPage.metaDescription.status}
                  currentValue={onPage.metaDescription.currentValue}
                  currentPixels={{
                    characterCount: onPage.metaDescription.characterCount,
                    pixelWidth: onPage.metaDescription.pixelWidth,
                    pixelStatus: onPage.metaDescription.pixelStatus,
                    estimatedLines: onPage.metaDescription.estimatedLines,
                  }}
                  suggestedValue={onPage.metaDescription.suggestedValue}
                  suggestedPixels={
                    onPage.metaDescription.suggestedValue
                      ? {
                          characterCount: onPage.metaDescription.suggestedCharacterCount ?? 0,
                          pixelWidth: onPage.metaDescription.suggestedPixelWidth,
                          pixelStatus: onPage.metaDescription.suggestedPixelStatus ?? 'not_available',
                          estimatedLines: onPage.metaDescription.suggestedEstimatedLines,
                        }
                      : undefined
                  }
                  issues={onPage.metaDescription.issues}
                />
              ) : (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Current Meta Description
                  </div>
                  <p className="text-sm bg-muted/50 rounded-lg p-3 text-pretty">
                    {p.currentMetaDescription || <em className="text-muted-foreground">Missing</em>}
                  </p>
                </div>
              )}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1.5">
                  Suggested Meta Description
                </div>
                <p className="text-sm bg-primary/5 border border-primary/20 rounded-lg p-3 text-pretty">
                  {p.suggestedMetaDescription}
                </p>
              </div>
            </div>
            {onPage && (
              <div className="grid md:grid-cols-2 gap-4">
                <OnPageFieldBlock
                  label="H1"
                  status={onPage.h1.status}
                  currentValue={onPage.h1.values[0] ?? null}
                  suggestedValue={onPage.h1.suggestedValue}
                  issues={
                    onPage.h1.count > 1
                      ? [...onPage.h1.issues, `All H1s on this page: ${onPage.h1.values.join(' | ')}`]
                      : onPage.h1.issues
                  }
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Heading Structure
                    </div>
                    <OnPageStatusPill status={onPage.headings.status} />
                  </div>
                  <p className="text-sm bg-muted/50 rounded-lg p-3 text-pretty">
                    {onPage.headings.totalH2} H2{onPage.headings.totalH2 === 1 ? '' : 's'}, {onPage.headings.totalH3} H3
                    {onPage.headings.totalH3 === 1 ? '' : 's'} on this page.
                  </p>
                  {onPage.headings.issues.length > 0 && (
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {onPage.headings.issues.map((iss, j) => (
                        <li key={j} className="flex items-start gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-pretty">{iss}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            {onPage && <Phase2BSummaryBlock onPage={onPage} />}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-destructive mb-1.5">
                  Issues
                </div>
                <ul className="text-sm space-y-1">
                  {p.issues.map((iss, j) => (
                    <li key={j} className="flex items-start gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-1" />
                      <span className="text-pretty">{iss}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1.5">
                  Recommendations
                </div>
                <ul className="text-sm space-y-1">
                  {p.recommendations.map((r, j) => (
                    <li key={j} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-1" />
                      <span className="text-pretty">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          </CollapsiblePageCard>
        )
      })}
    </div>
  )
}

/** Compact per-page Content / Images / Internal Linking / Technical summary (Phase 2B) — same visual language as the meta/heading blocks above, no new report section. */
function Phase2BMiniCard({
  label,
  status,
  lines,
  issues,
}: {
  label: string
  status: 'good' | 'needs_improvement' | 'poor' | 'not_evaluated'
  lines: string[]
  issues: string[]
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <OnPageStatusPill status={status} />
      </div>
      {lines.map((line, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          {line}
        </p>
      ))}
      {issues.length > 0 && (
        <ul className="text-xs space-y-1 pt-1">
          {issues.map((iss, j) => (
            <li key={j} className="flex items-start gap-1.5">
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-pretty">{iss}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Phase2BSummaryBlock({ onPage }: { onPage: SeoStrategy['onPageAudits'][number] }) {
  const { content, images, internalLinks, technicalOnPage } = onPage
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Phase2BMiniCard
        label="Content"
        status={content.status}
        lines={[
          `${content.wordCount} words (${content.pageType} page)`,
          ...(content.keywordRelevance ? [`Keyword relevance: ${content.keywordRelevance.score}/100`] : []),
          ...(content.searchIntent ? [`Intent: ${content.searchIntent.intent.replace('_', ' ')} (${content.searchIntent.match ? 'matches' : 'may not match'})`] : []),
        ]}
        issues={content.issues}
      />
      <Phase2BMiniCard
        label="Images"
        status={images.status}
        lines={[`${images.total} image(s) — ${images.missingAlt} missing alt, ${images.weakAlt} weak alt, ${images.oversized} oversized`]}
        issues={images.issues.flatMap((i) => i.issues.map((iss) => `${i.filename}: ${iss}`)).slice(0, 6)}
      />
      <Phase2BMiniCard
        label="Internal Linking"
        status={internalLinks.status}
        lines={[
          `${internalLinks.incoming} incoming, ${internalLinks.outgoing} outgoing (${internalLinks.contextualIncoming} contextual incoming)`,
        ]}
        issues={[
          ...internalLinks.issues,
          ...internalLinks.brokenLinks.map((b) => `Broken link: "${b.anchor || '(no anchor)'}" → ${b.target} (${b.statusCode ?? 'failed'})`),
        ]}
      />
      <Phase2BMiniCard
        label="Technical"
        status={technicalOnPage.status}
        lines={[
          `HTTP ${technicalOnPage.statusCode.code} · Canonical ${technicalOnPage.canonical.exists ? (technicalOnPage.canonical.isSelfReferencing ? 'self-referencing' : 'set') : 'missing'} · ${technicalOnPage.indexability.result.replace('_', ' ')}`,
        ]}
        issues={[
          ...technicalOnPage.canonical.issues,
          ...technicalOnPage.statusCode.issues,
          ...technicalOnPage.schema.issues,
          ...technicalOnPage.openGraph.issues,
          ...technicalOnPage.twitter.issues,
          ...technicalOnPage.urlStructure.issues,
        ]}
      />
    </div>
  )
}

function KeywordStrategy({ data }: { data: SeoStrategy['keywordStrategy'] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30 font-semibold text-sm">
          Primary Keywords
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/20">
              <tr className="text-left border-b">
                <th className="px-4 py-2.5 font-medium">Keyword</th>
                <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Intent</th>
                <th className="px-4 py-2.5 font-medium hidden md:table-cell">Difficulty</th>
                <th className="px-4 py-2.5 font-medium">Priority</th>
                <th className="px-4 py-2.5 font-medium">Target Page</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.primaryKeywords.map((k, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium">{k.keyword}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="outline" className="capitalize">
                      {k.intent}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell capitalize text-muted-foreground">
                    {k.difficulty}
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={k.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded">
                      {k.targetPage}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold mb-3">Long-Tail Keywords</h4>
          <div className="flex flex-wrap gap-1.5">
            {data.longTailKeywords.map((k, i) => (
              <Badge key={i} variant="secondary" className="capitalize">
                {k.keyword}
                <span className="ml-1.5 text-[10px] text-muted-foreground">
                  · {k.intent}
                </span>
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold mb-3">Topic Clusters</h4>
          <div className="space-y-3">
            {data.contentClusters.map((c, i) => (
              <div key={i}>
                <div className="text-sm font-medium">{c.pillarTopic}</div>
                <div className="text-xs text-muted-foreground mb-1.5">
                  Pillar keyword: {c.pillarKeyword}
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.supportingKeywords.map((sk, j) => (
                    <span
                      key={j}
                      className="text-xs bg-muted/50 rounded px-1.5 py-0.5"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const OPPORTUNITY_TYPE_LABEL: Record<SeoStrategy['pageOpportunities'][number]['pageType'], string> = {
  service: 'Service Page',
  location: 'Location Page',
  service_location: 'Service + Location Page',
  informational: 'Informational/Blog Page',
  faq: 'FAQ/Supporting Content',
  improve_existing: 'Existing Page Improvement',
}

const OPPORTUNITY_ACTION_LABEL: Record<SeoStrategy['pageOpportunities'][number]['action'], string> = {
  create: 'Create New Page',
  improve: 'Improve Existing Page',
  optimize: 'Optimize Existing Page',
}

const CANNIBALIZATION_LABEL: Record<SeoStrategy['pageOpportunities'][number]['cannibalizationRisk'], string> = {
  safe_to_create: 'Low',
  improve_existing: 'N/A (existing page)',
  potential_cannibalization: 'High',
}

/** Phase 7 — deterministic page-opportunity list (lib/seo-strategy/page-opportunity.ts), already ordered commercial-first / priority-first. Never reordered or recalculated here. */
function PageOpportunitiesList({ opportunities }: { opportunities: SeoStrategy['pageOpportunities'] }) {
  if (opportunities.length === 0) return null

  const sections: { label: string; items: SeoStrategy['pageOpportunities'] }[] = [
    { label: 'High-Priority Commercial Pages', items: opportunities.filter((o) => o.priority === 'high' && (o.pageType === 'service' || o.pageType === 'service_location')) },
    { label: 'Service + Location Opportunities', items: opportunities.filter((o) => o.pageType === 'service_location' && o.priority !== 'high') },
    { label: 'Location Opportunities', items: opportunities.filter((o) => o.pageType === 'location') },
    { label: 'Existing Pages to Improve', items: opportunities.filter((o) => o.pageType === 'improve_existing') },
    { label: 'Supporting / Blog Content', items: opportunities.filter((o) => o.pageType === 'informational' || o.pageType === 'faq') },
  ]
  // Anything not bucketed above (e.g. a medium/low priority pure "service" gap) still needs to be shown — append as a final catch-all rather than silently dropping it.
  const bucketed = new Set(sections.flatMap((s) => s.items))
  const remaining = opportunities.filter((o) => !bucketed.has(o))
  if (remaining.length > 0) sections.push({ label: 'Other Opportunities', items: remaining })

  return (
    <div className="space-y-5">
      {sections
        .filter((s) => s.items.length > 0)
        .map((s) => (
          <div key={s.label}>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{s.label}</div>
            <div className="space-y-2">
              {s.items.map((o, i) => (
                <div key={i} className="rounded-lg border bg-card p-4 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${PRIORITY_BADGE_CLS[o.priority]}`}>
                      {o.priority === 'high' ? 'High' : o.priority === 'medium' ? 'Medium' : 'Low'} Priority
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {OPPORTUNITY_TYPE_LABEL[o.pageType]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{OPPORTUNITY_ACTION_LABEL[o.action]}</span>
                  </div>
                  <p className="text-sm font-medium text-pretty">{o.suggestedTitle}</p>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>
                      Keyword: <span className="text-foreground font-medium">{o.primaryKeyword}</span>
                    </span>
                    <span>Intent: {o.searchIntent.replace('_', ' ')}</span>
                    <span>Cannibalization Risk: {CANNIBALIZATION_LABEL[o.cannibalizationRisk]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-pretty">{o.reason}</p>
                  {o.competitorEvidence && (
                    <p className="text-xs text-primary text-pretty flex items-start gap-1">
                      <Target className="h-3 w-3 shrink-0 mt-0.5" /> {o.competitorEvidence}
                    </p>
                  )}
                  {o.existingPage && (
                    <p className="text-xs text-muted-foreground">
                      Existing page: <code className="font-mono">{o.existingPage}</code>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

function PagesToCreate({ pages }: { pages: SeoStrategy['pagesToCreate'] }) {
  return (
    <div className="space-y-4">
      {pages.map((p, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-5 print:break-inside-avoid"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-balance">{p.title}</h3>
              <code className="text-xs text-muted-foreground font-mono">
                {p.suggestedUrl}
              </code>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="capitalize">
                {p.searchIntent}
              </Badge>
              <Badge variant="outline">{p.suggestedWordCount} words</Badge>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Target Keyword
              </div>
              <p className="font-medium">{p.targetKeyword}</p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Purpose
              </div>
              <p className="text-pretty">{p.purpose}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Content Brief (give to your writer)
            </div>
            <p className="text-sm bg-muted/50 rounded-lg p-3 text-pretty">
              {p.contentBrief}
            </p>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Key Headings (H2)
            </div>
            <ul className="text-sm space-y-1">
              {p.keyHeadings.map((h, j) => (
                <li key={j} className="flex items-start gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                  <span className="text-pretty">{h}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3 text-sm">
            <span className="font-medium text-primary">CTA: </span>
            <span className="text-pretty">{p.ctaSuggestion}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function BlogIdeas({ ideas }: { ideas: SeoStrategy['blogIdeas'] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ideas.map((b, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-5 print:break-inside-avoid"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-balance">{b.title}</h3>
            <Badge variant="outline" className="shrink-0">
              {b.suggestedWordCount}w
            </Badge>
          </div>
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-foreground">{b.targetKeyword}</span>
            <span>·</span>
            <span className="capitalize">{b.searchIntent}</span>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Outline
          </div>
          <ol className="text-sm space-y-1 mb-3 list-decimal list-inside marker:text-muted-foreground">
            {b.outline.map((o, j) => (
              <li key={j} className="text-pretty">
                {o}
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground text-pretty">
            {b.contentBrief}
          </p>
        </div>
      ))}
    </div>
  )
}

/** Phase 6 — side-by-side comparison table, straight from SeoStrategy.competitorIntelligence. Only shows metrics that were actually measured (a not-evaluated competitor shows "Not Evaluated", never a fabricated 0). */
function CompetitorComparisonTable({ intelligence }: { intelligence: SeoStrategy['competitorIntelligence'] }) {
  if (intelligence.comparison.length === 0) return null
  const rows: { label: string; targetValue: number | null; key: 'servicePages' | 'locationPages' | 'blogPages' | 'schemaCoverage' }[] = [
    { label: 'Service Pages', targetValue: intelligence.target.servicePages, key: 'servicePages' },
    { label: 'Location Pages', targetValue: intelligence.target.locationPages, key: 'locationPages' },
    { label: 'Blog Pages', targetValue: intelligence.target.blogPages, key: 'blogPages' },
    { label: 'Schema Coverage', targetValue: intelligence.target.schemaCoverage, key: 'schemaCoverage' },
  ]
  const fmt = (v: number | null, isPct: boolean) => (v === null ? 'Not Evaluated' : isPct ? `${v}%` : String(v))

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30 text-sm font-semibold">Side-by-Side Comparison</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="text-left font-medium px-4 py-2">Metric</th>
              <th className="text-right font-medium px-4 py-2">Your Site</th>
              {intelligence.comparison.map((c) => (
                <th key={c.domain} className="text-right font-medium px-4 py-2 whitespace-nowrap">
                  {c.domain}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b last:border-0">
                <td className="px-4 py-2 text-muted-foreground">{r.label}</td>
                <td className="px-4 py-2 text-right font-medium tabular-nums">{fmt(r.targetValue, r.key === 'schemaCoverage')}</td>
                {intelligence.comparison.map((c) => (
                  <td key={c.domain} className="px-4 py-2 text-right tabular-nums">
                    {c.status === 'not_evaluated' ? (
                      <span className="text-muted-foreground text-xs">Not Evaluated</span>
                    ) : (
                      fmt(c[r.key], r.key === 'schemaCoverage')
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const PRIORITY_BADGE_CLS: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  low: 'bg-muted text-muted-foreground border-border',
}

/** Phase 6 — top opportunities merged from service/location/content gaps, already sorted deterministically (lib/seo-strategy/competitor-intelligence.ts) — never reordered here. */
function CompetitorOpportunities({ opportunities }: { opportunities: SeoStrategy['competitorIntelligence']['opportunities'] }) {
  if (opportunities.length === 0) return null
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="text-sm font-semibold mb-3">Priority Opportunities</div>
      <ol className="space-y-2">
        {opportunities.map((o, i) => (
          <li key={i} className="rounded-lg border bg-muted/20 p-3 flex items-start gap-3">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 mt-0.5 w-5 text-right">{i + 1}.</span>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${PRIORITY_BADGE_CLS[o.priority]}`}>
                  {o.priority === 'high' ? 'High' : o.priority === 'medium' ? 'Medium' : 'Low'} Priority
                </span>
                <span className="text-xs text-muted-foreground">{o.topic}</span>
              </div>
              <p className="text-sm text-pretty">{o.opportunity}</p>
              <p className="text-xs text-muted-foreground text-pretty">{o.evidence}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function CompetitorAnalysis({
  competitors,
}: {
  competitors: SeoStrategy['competitorAnalysis']
}) {
  return (
    <div className="space-y-4">
      {competitors.map((c, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-5 print:break-inside-avoid"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{c.name}</h3>
              <code className="text-xs text-muted-foreground">{c.url}</code>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                Strengths
              </div>
              <ul className="text-sm space-y-1">
                {c.strengths.map((s, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-1 shrink-0" />
                    <span className="text-pretty">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-destructive mb-2">
                Weaknesses
              </div>
              <ul className="text-sm space-y-1">
                {c.weaknesses.map((s, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-destructive mt-1 shrink-0" />
                    <span className="text-pretty">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border bg-primary/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                Opportunities to outrank
              </div>
              <ul className="text-sm space-y-1">
                {c.opportunitiesToOutrank.map((s, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <Target className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                    <span className="text-pretty">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Content gaps
              </div>
              <ul className="text-sm space-y-1">
                {c.contentGaps.map((s, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-1 shrink-0" />
                    <span className="text-pretty">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const LOCAL_SCHEMA_STATUS_LABEL: Record<SeoStrategy['localSeoIntelligence']['schema']['sitewideStatus'], string> = {
  valid: 'Valid',
  incomplete: 'Incomplete',
  invalid: 'Invalid',
  missing_opportunity: 'Missing Opportunity',
  not_evaluated: 'Not Evaluated',
}
const LOCAL_SCHEMA_STATUS_CLS: Record<SeoStrategy['localSeoIntelligence']['schema']['sitewideStatus'], string> = {
  valid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  incomplete: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  invalid: 'bg-destructive/10 text-destructive border-destructive/30',
  missing_opportunity: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  not_evaluated: 'bg-muted text-muted-foreground border-border',
}

const LOCATION_COVERAGE_STATUS_LABEL: Record<SeoStrategy['localSeoIntelligence']['serviceLocationMatrix'][number]['status'], string> = {
  covered: 'Covered',
  partial: 'Partial',
  opportunity: 'Gap',
  not_relevant: 'N/A',
}
const LOCATION_COVERAGE_STATUS_CLS: Record<SeoStrategy['localSeoIntelligence']['serviceLocationMatrix'][number]['status'], string> = {
  covered: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  partial: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  opportunity: 'bg-destructive/10 text-destructive border-destructive/30',
  not_relevant: 'bg-muted text-muted-foreground border-border',
}

const LOCAL_KEYWORD_ACTION_LABEL: Record<SeoStrategy['localSeoIntelligence']['localKeywordCoverage'][number]['action'], string> = {
  keep_existing: 'Keep Existing Page',
  improve_existing: 'Improve Existing Page',
  create_dedicated_page: 'Create Dedicated Page',
  potential_cannibalization: 'Potential Cannibalization',
  not_enough_evidence: 'Not Enough Evidence',
}

/** Phase 8 — deterministic Local SEO intelligence (lib/seo-strategy/local-seo-intelligence.ts). Every value here is straight from that module — never recalculated in the UI. */
function LocalSeoIntelligenceBlock({ intelligence }: { intelligence: SeoStrategy['localSeoIntelligence'] }) {
  const { nap, schema, locationCoverage, serviceLocationMatrix, localKeywordCoverage, locationPageQuality, opportunities } = intelligence

  return (
    <div className="space-y-5">
      {/* NAP conflicts — exact affected URLs, never just an aggregate claim */}
      {nap.status === 'conflicting' && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-destructive mb-2">NAP Conflicts Detected</div>
          <ul className="text-sm space-y-1">
            {nap.conflicts.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <span className="text-pretty">
                  <code className="font-mono text-xs">{c.url}</code> — {c.issue}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Local schema */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h4 className="font-semibold">Local Business Schema</h4>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${LOCAL_SCHEMA_STATUS_CLS[schema.sitewideStatus]}`}>
            {LOCAL_SCHEMA_STATUS_LABEL[schema.sitewideStatus]}
          </span>
        </div>
        {schema.pages.filter((p) => p.status !== 'not_evaluated').length > 0 ? (
          <ul className="text-sm space-y-1.5">
            {schema.pages
              .filter((p) => p.status !== 'not_evaluated')
              .slice(0, 10)
              .map((p, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${LOCAL_SCHEMA_STATUS_CLS[p.status]}`}>
                    {LOCAL_SCHEMA_STATUS_LABEL[p.status]}
                  </span>
                  <span className="text-pretty truncate">
                    {p.pageName}
                    {p.missingProperties.length > 0 ? ` — missing: ${p.missingProperties.join(', ')}` : ''}
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No pages evaluated for LocalBusiness schema.</p>
        )}
      </div>

      {/* Location coverage */}
      {(locationCoverage.existingLocationPages.length > 0 || locationCoverage.competitorLocationGaps.length > 0) && (
        <div className="rounded-xl border bg-card p-5">
          <h4 className="font-semibold mb-3">Location Coverage</h4>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Existing Location Pages</div>
              {locationCoverage.existingLocationPages.length > 0 ? (
                <ul className="space-y-1">
                  {locationCoverage.existingLocationPages.map((url, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <code className="font-mono text-xs truncate">{url}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">None detected.</p>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Competitor Location Coverage (Gaps)</div>
              {locationCoverage.competitorLocationGaps.length > 0 ? (
                <ul className="space-y-1">
                  {locationCoverage.competitorLocationGaps.map((topic, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Target className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-pretty">{topic}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No competitor location gaps found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service x location matrix */}
      {serviceLocationMatrix.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 text-sm font-semibold">Service × Location Coverage</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="text-left font-medium px-4 py-2">Service</th>
                  <th className="text-left font-medium px-4 py-2">Location</th>
                  <th className="text-left font-medium px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {serviceLocationMatrix.map((cell, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2">{cell.service}</td>
                    <td className="px-4 py-2 text-muted-foreground">{cell.location}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${LOCATION_COVERAGE_STATUS_CLS[cell.status]}`}>
                        {LOCATION_COVERAGE_STATUS_LABEL[cell.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Local keyword coverage */}
      {localKeywordCoverage.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 text-sm font-semibold">Local Keyword Coverage</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="text-left font-medium px-4 py-2">Keyword</th>
                  <th className="text-left font-medium px-4 py-2">Mapped Page</th>
                  <th className="text-left font-medium px-4 py-2">Status</th>
                  <th className="text-left font-medium px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {localKeywordCoverage.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{row.keyword}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {row.mappedUrl ? <code className="font-mono text-xs">{row.mappedUrl}</code> : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${LOCATION_COVERAGE_STATUS_CLS[row.status]}`}>
                        {LOCATION_COVERAGE_STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{LOCAL_KEYWORD_ACTION_LABEL[row.action]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Location page quality */}
      {locationPageQuality.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h4 className="font-semibold mb-3">Location Page Quality</h4>
          <ul className="text-sm space-y-2">
            {locationPageQuality.map((p, i) => (
              <li key={i} className="rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <code className="font-mono text-xs truncate">{p.url}</code>
                  {p.doorwayRisk && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap bg-destructive/10 text-destructive border-destructive/30">
                      Doorway-Page Risk
                    </span>
                  )}
                </div>
                <ul className="space-y-0.5">
                  {p.issues.map((iss, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-muted-foreground">
                      <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-pretty">{iss}</span>
                    </li>
                  ))}
                </ul>
                {p.similarTo && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Similar to <code className="font-mono">{p.similarTo}</code>
                    {p.similarityScore !== null ? ` (${Math.round(p.similarityScore * 100)}% similar)` : ''}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Priority opportunities */}
      {opportunities.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h4 className="font-semibold mb-3">Priority Local SEO Opportunities</h4>
          <ol className="space-y-2">
            {opportunities.map((o, i) => (
              <li key={i} className="rounded-lg border bg-muted/20 p-3 flex items-start gap-3">
                <span className="text-xs font-semibold text-muted-foreground shrink-0 mt-0.5 w-5 text-right">{i + 1}.</span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${PRIORITY_BADGE_CLS[o.priority]}`}>
                      {o.priority === 'high' ? 'High' : o.priority === 'medium' ? 'Medium' : 'Low'} Priority
                    </span>
                    <span className="text-xs text-muted-foreground">{o.topic}</span>
                  </div>
                  <p className="text-sm font-medium text-pretty">{o.action}</p>
                  <p className="text-xs text-muted-foreground text-pretty">{o.reason}</p>
                  <p className="text-xs text-muted-foreground text-pretty">{o.evidence}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function LocalSeoSection({
  data,
  analysis,
  intelligence,
}: {
  data: SeoStrategy['localSeo']
  analysis: SiteAnalysis
  intelligence: SeoStrategy['localSeoIntelligence']
}) {
  if (!data.applicable) {
    return (
      <div className="rounded-xl border bg-muted/30 p-6 text-center">
        <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">
          This is not a local business, but here are some general guidelines you
          can apply if you ever expand into a physical location.
        </p>
        <ul className="mt-4 text-sm space-y-1 text-left max-w-lg mx-auto">
          {data.googleBusinessProfileTips.map((t, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
              <span className="text-pretty">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* NAP audit */}
      <div className="rounded-xl border bg-card p-5">
        <h4 className="font-semibold mb-3">NAP Consistency Audit</h4>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <NapItem
            label="Business Name"
            value={data.napConsistency.websiteNap.name || '—'}
          />
          <NapItem
            label="Phone(s) on site"
            value={
              analysis.contactInfo.phones.join(', ') ||
              data.napConsistency.websiteNap.phones.join(', ') ||
              '—'
            }
          />
          <NapItem
            label="Address(es) on site"
            value={
              analysis.contactInfo.addresses.join(' / ') ||
              data.napConsistency.websiteNap.addresses.join(' / ') ||
              '—'
            }
          />
        </div>
        {data.napConsistency.issues.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-destructive mb-1.5">
              NAP Issues
            </div>
            <ul className="text-sm space-y-1">
              {data.napConsistency.issues.map((iss, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-1 shrink-0" />
                  <span className="text-pretty">{iss}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1.5">
          Recommendations
        </div>
        <ul className="text-sm space-y-1">
          {data.napConsistency.recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-1 shrink-0" />
              <span className="text-pretty">{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <LocalSeoIntelligenceBlock intelligence={intelligence} />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Google Business Profile
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap bg-muted text-muted-foreground border-border">
              Not Verified — requires manual/API verification
            </span>
          </h4>
          <ul className="text-sm space-y-1.5">
            {data.googleBusinessProfileTips.map((t, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                <span className="text-pretty">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" /> Local Citations
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {data.localCitations.map((c, i) => (
              <Badge key={i} variant="secondary">
                {c}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Review Strategy
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap bg-muted text-muted-foreground border-border">
              Not Evaluated — strategy recommendation, not a measured metric
            </span>
          </h4>
          <p className="text-sm text-pretty">{data.reviewStrategy}</p>
        </div>
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" /> Local Content Ideas
          </h4>
          <ul className="text-sm space-y-1.5">
            {data.localContentIdeas.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                <span className="text-pretty">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function NapItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-sm font-medium break-words">{value}</div>
    </div>
  )
}

function OffPageSection({
  data,
}: {
  data: SeoStrategy['offPageStrategy']
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
              Investment Notice
            </h4>
            <p className="text-sm text-amber-900/80 dark:text-amber-200/80 text-pretty">
              {data.costDisclaimer}
            </p>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-pretty">{data.summary}</p>

      <div className="space-y-3">
        <h4 className="font-semibold">Backlink Tactics</h4>
        {data.backlinkTactics.map((t, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 print:break-inside-avoid"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <h5 className="font-semibold text-balance">{t.tactic}</h5>
              <div className="flex items-center gap-1.5 flex-wrap">
                <CostBadge cost={t.estimatedCost} />
                <Badge variant="outline" className="capitalize">
                  {t.difficulty}
                </Badge>
                <Badge
                  variant="outline"
                  className={`capitalize ${
                    t.expectedImpact === 'high'
                      ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                      : ''
                  }`}
                >
                  {t.expectedImpact} impact
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 text-pretty">
              {t.description}
            </p>
            <p className="text-xs text-primary font-medium">
              Target: {t.monthlyTargetLinks} link{t.monthlyTargetLinks > 1 ? 's' : ''}/month
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold mb-3">Guest Post Targets</h4>
          <ul className="text-sm space-y-1">
            {data.guestPostTargets.map((g, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                <span className="text-pretty">{g}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold mb-3">Digital PR Tactics</h4>
          <ul className="text-sm space-y-1">
            {data.digitalPrTactics.map((g, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                <span className="text-pretty">{g}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold mb-3">Social Signals</h4>
          <ul className="text-sm space-y-1">
            {data.socialSignals.map((g, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                <span className="text-pretty">{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function CostBadge({
  cost,
}: {
  cost: 'free' | 'low' | 'medium' | 'high' | 'very-high'
}) {
  const cls = {
    free: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    medium: 'bg-primary/10 text-primary border-primary/30',
    high: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    'very-high': 'bg-destructive/10 text-destructive border-destructive/30',
  }[cost]
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${cls}`}
    >
      Cost: {cost.replace('-', ' ')}
    </span>
  )
}

function SixMonthRoadmap({
  roadmap,
}: {
  roadmap: SeoStrategy['sixMonthRoadmap']
}) {
  return (
    <div className="space-y-4">
      {roadmap.map((m) => (
        <div
          key={m.month}
          className="rounded-xl border bg-card overflow-hidden print:break-inside-avoid"
        >
          <div className="flex items-center gap-4 px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <div className="text-center leading-none">
                <div className="text-[10px] font-semibold uppercase">Month</div>
                <div className="text-lg font-bold">{m.month}</div>
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-balance">{m.theme}</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                {m.focus}
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            <RoadmapColumn
              title="Key tasks"
              icon={ListChecks}
              items={m.keyTasks}
            />
            <RoadmapColumn
              title="Deliverables"
              icon={FileText}
              items={m.deliverables}
            />
            <RoadmapColumn
              title="Expected outcomes"
              icon={TrendingUp}
              items={m.expectedOutcomes}
              highlight
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function RoadmapColumn({
  title,
  icon: Icon,
  items,
  highlight,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: string[]
  highlight?: boolean
}) {
  return (
    <div className="p-5">
      <div
        className={`flex items-center gap-2 mb-3 ${highlight ? 'text-primary' : ''}`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <h4 className="font-semibold text-sm uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <ul className="text-sm space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <ArrowRight
              className={`h-3.5 w-3.5 mt-1 shrink-0 ${highlight ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <span className="text-pretty">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function KpiTable({ kpis }: { kpis: SeoStrategy['kpiTargets'] }) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left border-b">
              <th className="px-4 py-3 font-medium">Metric</th>
              <th className="px-4 py-3 font-medium">Baseline</th>
              <th className="px-4 py-3 font-medium">3 months</th>
              <th className="px-4 py-3 font-medium">6 months</th>
              <th className="px-4 py-3 font-medium">12 months</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {kpis.map((k, i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-medium">{k.metric}</td>
                <td className="px-4 py-3 text-muted-foreground">{k.baseline}</td>
                <td className="px-4 py-3">{k.month3Target}</td>
                <td className="px-4 py-3 text-primary font-medium">
                  {k.month6Target}
                </td>
                <td className="px-4 py-3 font-semibold">{k.month12Target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ToolStack({ stack }: { stack: SeoStrategy['toolStack'] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-xl border p-5">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Badge variant="secondary">Free</Badge>
        </h4>
        <ul className="text-sm space-y-1.5">
          {stack.free.map((t, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-1 shrink-0" />
              <span className="text-pretty">{t}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border p-5">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Badge>Paid</Badge>
        </h4>
        <ul className="text-sm space-y-1.5">
          {stack.paid.map((t, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
              <span className="text-pretty">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function RiskAssessment({
  risks,
}: {
  risks: SeoStrategy['riskAssessment']
}) {
  return (
    <div className="space-y-3">
      {risks.map((r, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-5 print:break-inside-avoid"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="font-semibold text-balance">{r.risk}</h4>
            <Badge
              variant="outline"
              className={`capitalize shrink-0 ${
                r.likelihood === 'high'
                  ? 'border-destructive/40 text-destructive'
                  : r.likelihood === 'medium'
                    ? 'border-amber-500/40 text-amber-700 dark:text-amber-400'
                    : ''
              }`}
            >
              {r.likelihood} likelihood
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground text-pretty">
            <span className="font-medium text-foreground">Mitigation: </span>
            {r.mitigation}
          </p>
        </div>
      ))}
    </div>
  )
}
