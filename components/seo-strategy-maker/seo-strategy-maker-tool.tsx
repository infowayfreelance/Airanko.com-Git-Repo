'use client'

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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import type { SeoStrategy } from '@/app/api/seo-strategy/route'
import type { SiteAnalysis } from '@/app/api/seo-strategy/analyze/route'

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
      setProgressMsg('Crawling your website and analyzing pages…')

      const analyzeRes = await fetch('/api/seo-strategy/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: form.websiteUrl }),
      })
      const analyzeData = await analyzeRes.json()
      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'Failed to analyze website')
      }
      const siteAnalysis: SiteAnalysis = analyzeData.analysis
      setAnalysis(siteAnalysis)

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
          competitors: form.competitors.filter(Boolean),
          location: form.location,
          industry: form.industry,
          notes: form.notes,
          analysis: siteAnalysis,
        }),
      })
      const stratData = await stratRes.json()
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
                Build a complete SEO strategy in minutes
              </h1>
              <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Crawl your site, analyze competitors, and generate a client-ready
                6-month roadmap with keywords, content briefs, and technical fixes.
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

  return (
    <div className="space-y-8">
      {/* Action toolbar (hidden on print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-3 -mx-4 px-4 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Strategy ready</span>
          <span className="hidden sm:inline">— scroll to explore the full report</span>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Cover */}
      <ReportCover strategy={strategy} analysis={analysis} form={form} />

      {/* Executive Summary */}
      <ReportSection
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
        icon={Award}
        title="SEO Health Score"
        kicker="Section 02"
      >
        <HealthScoreCard
          score={strategy.overallHealthScore}
          breakdown={strategy.healthScoreBreakdown}
        />
      </ReportSection>

      {/* Mobile screenshot */}
      <ReportSection
        icon={Smartphone}
        title="Mobile-Friendliness Preview"
        kicker="Section 03"
      >
        <ScreenshotPreview analysis={analysis} />
      </ReportSection>

      {/* Critical issues */}
      <ReportSection
        icon={AlertTriangle}
        title="Critical Issues"
        kicker="Section 04"
        description="Top problems hurting rankings right now — fix these first."
      >
        <CriticalIssuesGrid issues={strategy.criticalIssues} />
      </ReportSection>

      {/* Quick wins */}
      <ReportSection
        icon={Zap}
        title="Quick Wins (First 30 Days)"
        kicker="Section 05"
        description="High-leverage actions you can ship in days, not months."
      >
        <QuickWinsGrid wins={strategy.quickWins} />
      </ReportSection>

      {/* Technical SEO */}
      <ReportSection
        icon={Wrench}
        title="Technical SEO Audit"
        kicker="Section 06"
      >
        <p className="text-muted-foreground mb-6">
          {strategy.technicalSeoAudit.summary}
        </p>
        <TechnicalSummary analysis={analysis} />
        <div className="mt-6">
          <TechnicalChecklist items={strategy.technicalSeoAudit.checklist} />
        </div>
      </ReportSection>

      {/* On-page audit */}
      <ReportSection
        icon={FileText}
        title="On-Page SEO Audit"
        kicker="Section 07"
      >
        <OnPageAudit audit={strategy.onPageAudit} />
      </ReportSection>

      {/* Page-by-page audit */}
      <ReportSection
        icon={ListChecks}
        title="Page-by-Page Audit"
        kicker="Section 08"
        description="Specific recommendations for each crawled page."
      >
        <PageByPageAudit pages={strategy.pageByPageAudit} />
      </ReportSection>

      {/* Keyword strategy */}
      <ReportSection
        icon={Search}
        title="Keyword Strategy"
        kicker="Section 09"
      >
        <p className="text-muted-foreground mb-6">
          {strategy.keywordStrategy.summary}
        </p>
        <KeywordStrategy data={strategy.keywordStrategy} />
      </ReportSection>

      {/* Pages to create */}
      <ReportSection
        icon={PenLine}
        title="Pages to Create"
        kicker="Section 10"
        description="Content briefs ready to hand to your writers."
      >
        <PagesToCreate pages={strategy.pagesToCreate} />
      </ReportSection>

      {/* Blog ideas */}
      <ReportSection
        icon={Lightbulb}
        title="Blog Content Ideas"
        kicker="Section 11"
      >
        <BlogIdeas ideas={strategy.blogIdeas} />
      </ReportSection>

      {/* Competitors */}
      {strategy.competitorAnalysis.length > 0 && (
        <ReportSection
          icon={Trophy}
          title="Competitor Analysis"
          kicker="Section 12"
        >
          <CompetitorAnalysis competitors={strategy.competitorAnalysis} />
        </ReportSection>
      )}

      {/* Local SEO */}
      <ReportSection
        icon={MapPin}
        title="Local SEO & NAP Consistency"
        kicker="Section 13"
      >
        <LocalSeoSection data={strategy.localSeo} analysis={analysis} />
      </ReportSection>

      {/* Off-page strategy */}
      <ReportSection
        icon={Link2}
        title="Off-Page & Backlink Strategy"
        kicker="Section 14"
      >
        <OffPageSection data={strategy.offPageStrategy} />
      </ReportSection>

      {/* 6-month roadmap */}
      <ReportSection
        icon={MapIcon}
        title="6-Month Roadmap"
        kicker="Section 15"
        description="What we'll do each month and what you'll achieve."
      >
        <SixMonthRoadmap roadmap={strategy.sixMonthRoadmap} />
      </ReportSection>

      {/* KPIs */}
      <ReportSection
        icon={BarChart3}
        title="KPI Targets"
        kicker="Section 16"
      >
        <KpiTable kpis={strategy.kpiTargets} />
      </ReportSection>

      {/* Tool stack */}
      <ReportSection
        icon={Wrench}
        title="Recommended Tool Stack"
        kicker="Section 17"
      >
        <ToolStack stack={strategy.toolStack} />
      </ReportSection>

      {/* Risk assessment */}
      <ReportSection
        icon={ShieldCheck}
        title="Risk Assessment"
        kicker="Section 18"
      >
        <RiskAssessment risks={strategy.riskAssessment} />
      </ReportSection>

      {/* Conclusion */}
      <ReportSection
        icon={Rocket}
        title="Conclusion & Next Steps"
        kicker="Final"
      >
        <p className="text-pretty text-base leading-relaxed">
          {strategy.conclusion}
        </p>
        <div className="mt-6 rounded-lg border bg-muted/30 p-5 print:hidden">
          <p className="text-sm">
            <strong>Ready to start?</strong> Generate a new report anytime, or
            export this one as PDF to share with your team.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1.5" /> Save as PDF
            </Button>
            <Button size="sm" onClick={onReset}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Build a new strategy
            </Button>
          </div>
        </div>
      </ReportSection>
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
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  kicker?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-card p-6 sm:p-8 print:break-inside-avoid">
      <div className="flex items-start gap-4 mb-6">
        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          {kicker && (
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
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

  const items: { label: string; value: number; key: keyof typeof breakdown }[] = [
    { label: 'Technical', value: breakdown.technical, key: 'technical' },
    { label: 'On-Page', value: breakdown.onPage, key: 'onPage' },
    { label: 'Content', value: breakdown.content, key: 'content' },
    { label: 'Off-Page', value: breakdown.offPage, key: 'offPage' },
    { label: 'Local', value: breakdown.local, key: 'local' },
  ]

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
              <span className="text-muted-foreground">{item.value}/100</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenshotPreview({ analysis }: { analysis: SiteAnalysis }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border overflow-hidden bg-muted/30">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
          <Smartphone className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Mobile (375px)</span>
        </div>
        <div className="p-6 flex justify-center">
          {/* Using <img> intentionally for external screenshot service */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={analysis.mobileScreenshotUrl}
            alt={`Mobile screenshot of ${analysis.domain}`}
            className="rounded-lg border shadow-sm max-w-full h-auto"
            crossOrigin="anonymous"
          />
        </div>
      </div>
      <div className="rounded-xl border overflow-hidden bg-muted/30">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
          <Monitor className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Desktop (1200px)</span>
        </div>
        <div className="p-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={analysis.desktopScreenshotUrl}
            alt={`Desktop screenshot of ${analysis.domain}`}
            className="rounded-lg border shadow-sm max-w-full h-auto"
            crossOrigin="anonymous"
          />
        </div>
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

function TechnicalSummary({ analysis }: { analysis: SiteAnalysis }) {
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

function PageByPageAudit({
  pages,
}: {
  pages: SeoStrategy['pageByPageAudit']
}) {
  return (
    <div className="space-y-4">
      {pages.map((p, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card overflow-hidden print:break-inside-avoid"
        >
          <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <code className="text-sm font-mono truncate">{p.url}</code>
            <Badge variant="outline" className="ml-auto shrink-0 text-xs">
              {p.primaryKeyword}
            </Badge>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Current Title
                </div>
                <p className="text-sm bg-muted/50 rounded-lg p-3 text-pretty">
                  {p.currentTitle || (
                    <em className="text-muted-foreground">Missing</em>
                  )}
                </p>
              </div>
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
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Current Meta Description
                </div>
                <p className="text-sm bg-muted/50 rounded-lg p-3 text-pretty">
                  {p.currentMetaDescription || (
                    <em className="text-muted-foreground">Missing</em>
                  )}
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1.5">
                  Suggested Meta Description
                </div>
                <p className="text-sm bg-primary/5 border border-primary/20 rounded-lg p-3 text-pretty">
                  {p.suggestedMetaDescription}
                </p>
              </div>
            </div>
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
        </div>
      ))}
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

function LocalSeoSection({
  data,
  analysis,
}: {
  data: SeoStrategy['localSeo']
  analysis: SiteAnalysis
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-5">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Google Business Profile
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
