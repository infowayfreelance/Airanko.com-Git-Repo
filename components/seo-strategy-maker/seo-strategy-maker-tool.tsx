'use client'

import { useRef, useState } from 'react'
import {
  Globe,
  Target,
  Users,
  MapPin,
  Sparkles,
  Loader2,
  AlertCircle,
  Download,
  Printer,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Search,
  FileText,
  Wrench,
  Calendar,
  Link2,
  BarChart3,
  ListChecks,
  Briefcase,
  ChevronRight,
  Trophy,
  Lightbulb,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { SeoStrategy } from '@/app/api/seo-strategy/route'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Goal = 'traffic' | 'leads' | 'sales' | 'brand-awareness'

interface FormData {
  websiteUrl: string
  businessName: string
  industry: string
  targetAudience: string
  primaryGoal: Goal
  location: string
  isLocal: boolean
  competitor1: string
  competitor2: string
  competitor3: string
  currentChallenges: string
}

const initialForm: FormData = {
  websiteUrl: '',
  businessName: '',
  industry: '',
  targetAudience: '',
  primaryGoal: 'traffic',
  location: '',
  isLocal: false,
  competitor1: '',
  competitor2: '',
  competitor3: '',
  currentChallenges: '',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const priorityStyles: Record<string, string> = {
  critical: 'bg-rose-100 text-rose-700 border-rose-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const intentStyles: Record<string, string> = {
  informational: 'bg-blue-100 text-blue-700 border-blue-200',
  navigational: 'bg-violet-100 text-violet-700 border-violet-200',
  transactional: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  commercial: 'bg-amber-100 text-amber-700 border-amber-200',
}

const difficultyStyles: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-rose-100 text-rose-700 border-rose-200',
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function StrategySection({
  id,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm scroll-mt-24"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main tool
// ---------------------------------------------------------------------------
export default function SeoStrategyMakerTool() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [strategy, setStrategy] = useState<SeoStrategy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const validateForm = (): string | null => {
    if (!form.websiteUrl.trim()) return 'Website URL is required'
    if (!form.businessName.trim()) return 'Business name is required'
    if (!form.industry.trim()) return 'Industry is required'
    if (!form.targetAudience.trim()) return 'Target audience is required'
    return null
  }

  const handleGenerate = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setLoading(true)
    setStrategy(null)

    try {
      const res = await fetch('/api/seo-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: form.websiteUrl.trim(),
          businessName: form.businessName.trim(),
          industry: form.industry.trim(),
          targetAudience: form.targetAudience.trim(),
          primaryGoal: form.primaryGoal,
          location: form.location.trim(),
          isLocal: form.isLocal,
          competitors: [
            form.competitor1.trim(),
            form.competitor2.trim(),
            form.competitor3.trim(),
          ].filter(Boolean),
          currentChallenges: form.currentChallenges.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate strategy')
      }

      setStrategy(data.strategy as SeoStrategy)

      // Scroll to the report
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(initialForm)
    setStrategy(null)
    setError(null)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadJson = () => {
    if (!strategy) return
    const blob = new Blob([JSON.stringify(strategy, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-strategy-${form.businessName
      .toLowerCase()
      .replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center print:hidden" data-print-hide>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered SEO Strategy Generator
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            Build a Complete SEO Strategy in Seconds
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground text-pretty">
            Get a custom, AI-generated SEO roadmap with keyword research,
            competitor analysis, content calendar, and a 6-month action plan —
            all tailored to your business.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 print:hidden" data-print-hide>
          <div className="mb-6 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Tell us about your business
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Website URL */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="websiteUrl" className="text-sm font-medium">
                Website URL <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="websiteUrl"
                  placeholder="example.com"
                  value={form.websiteUrl}
                  onChange={(e) => update('websiteUrl', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Business name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="businessName" className="text-sm font-medium">
                Business name <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="businessName"
                  placeholder="Acme Inc."
                  value={form.businessName}
                  onChange={(e) => update('businessName', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Industry */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="industry" className="text-sm font-medium">
                Industry / Niche <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="industry"
                placeholder="e.g. SaaS project management, organic skincare"
                value={form.industry}
                onChange={(e) => update('industry', e.target.value)}
              />
            </div>

            {/* Primary goal */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="primaryGoal" className="text-sm font-medium">
                Primary goal <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.primaryGoal}
                onValueChange={(v) => update('primaryGoal', v as Goal)}
              >
                <SelectTrigger id="primaryGoal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traffic">Increase organic traffic</SelectItem>
                  <SelectItem value="leads">Generate leads</SelectItem>
                  <SelectItem value="sales">Drive sales / conversions</SelectItem>
                  <SelectItem value="brand-awareness">Build brand awareness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target audience */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="targetAudience" className="text-sm font-medium">
                Target audience <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="targetAudience"
                  placeholder="e.g. Small business owners aged 30-50 looking for affordable bookkeeping software"
                  value={form.targetAudience}
                  onChange={(e) => update('targetAudience', e.target.value)}
                  className="pl-9 min-h-[80px]"
                />
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location" className="text-sm font-medium">
                Location (optional)
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g. New York, USA"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Local toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5">
              <div className="flex flex-col">
                <Label htmlFor="isLocal" className="text-sm font-medium cursor-pointer">
                  Local business
                </Label>
                <span className="text-xs text-muted-foreground">
                  Enable local SEO recommendations
                </span>
              </div>
              <Switch
                id="isLocal"
                checked={form.isLocal}
                onCheckedChange={(c) => update('isLocal', c)}
              />
            </div>
          </div>

          {/* Competitors */}
          <div className="mt-6">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              Top competitors (optional, up to 3)
            </Label>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="competitor1.com"
                value={form.competitor1}
                onChange={(e) => update('competitor1', e.target.value)}
              />
              <Input
                placeholder="competitor2.com"
                value={form.competitor2}
                onChange={(e) => update('competitor2', e.target.value)}
              />
              <Input
                placeholder="competitor3.com"
                value={form.competitor3}
                onChange={(e) => update('competitor3', e.target.value)}
              />
            </div>
          </div>

          {/* Current challenges */}
          <div className="mt-6 flex flex-col gap-1.5">
            <Label htmlFor="currentChallenges" className="text-sm font-medium">
              Current SEO challenges (optional)
            </Label>
            <Textarea
              id="currentChallenges"
              placeholder="e.g. Low organic traffic, poor rankings for product pages, no backlinks"
              value={form.currentChallenges}
              onChange={(e) => update('currentChallenges', e.target.value)}
              className="min-h-[70px]"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating your strategy...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate SEO Strategy
                </>
              )}
            </Button>
            {strategy && (
              <Button onClick={handleReset} variant="outline" size="lg" disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start over
              </Button>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-12 text-center print:hidden" data-print-hide>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                Crafting your custom SEO strategy
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Analyzing keywords, competitors, and content opportunities. This
                takes 20-40 seconds.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {strategy && (
          <div ref={reportRef} className="mt-10 flex flex-col gap-6">
            {/* Report header */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    SEO Strategy Report
                  </p>
                  <h2 className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                    {form.businessName}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {form.websiteUrl} · {form.industry}
                  </p>
                </div>
                <div className="hidden gap-2 sm:flex print:hidden" data-print-hide>
                  <Button onClick={handlePrint} variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Save as PDF
                  </Button>
                  <Button onClick={handleDownloadJson} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export JSON
                  </Button>
                </div>
              </div>

              {/* Mobile actions */}
              <div className="mt-4 flex gap-2 sm:hidden print:hidden" data-print-hide>
                <Button onClick={handlePrint} variant="outline" size="sm" className="flex-1">
                  <Printer className="mr-2 h-4 w-4" />
                  Save PDF
                </Button>
                <Button onClick={handleDownloadJson} variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  JSON
                </Button>
              </div>

              {/* Executive summary */}
              <div className="mt-6 rounded-xl border border-border bg-background p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Executive Summary
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {strategy.executiveSummary}
                </p>
              </div>
            </div>

            {/* Quick navigation */}
            <nav className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-3 print:hidden" data-print-hide>
              {[
                { id: 'audience', label: 'Audience' },
                { id: 'keywords', label: 'Keywords' },
                { id: 'competitors', label: 'Competitors' },
                { id: 'on-page', label: 'On-Page' },
                { id: 'technical', label: 'Technical' },
                { id: 'content', label: 'Content' },
                { id: 'off-page', label: 'Off-Page' },
                { id: 'local', label: 'Local' },
                { id: 'kpis', label: 'KPIs' },
                { id: 'action', label: 'Action Plan' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* 1. Target Audience */}
            <StrategySection
              id="audience"
              icon={Users}
              title="Target Audience"
              subtitle="Who you're optimizing for"
            >
              <p className="text-sm leading-relaxed text-foreground">
                {strategy.targetAudience.description}
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Demographics
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {strategy.targetAudience.demographics.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pain Points
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {strategy.targetAudience.painPoints.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StrategySection>

            {/* 2. Keyword Strategy */}
            <StrategySection
              id="keywords"
              icon={Search}
              title="Keyword Strategy"
              subtitle="Primary keywords, long-tail variations, and topic clusters"
            >
              {/* Primary keywords */}
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Primary Keywords
                </p>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                          Keyword
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                          Intent
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                          Difficulty
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                          Priority
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {strategy.keywordStrategy.primaryKeywords.map((kw, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {kw.keyword}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={intentStyles[kw.intent]}>
                              {kw.intent}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={difficultyStyles[kw.difficulty]}>
                              {kw.difficulty}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={priorityStyles[kw.priority]}>
                              {kw.priority}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Long-tail */}
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Long-Tail Keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {strategy.keywordStrategy.longTailKeywords.map((kw, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5"
                    >
                      <span className="text-sm text-foreground">{kw.keyword}</span>
                      <Badge variant="outline" className={`${intentStyles[kw.intent]} text-[10px]`}>
                        {kw.intent}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content clusters */}
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Topic Clusters
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {strategy.keywordStrategy.contentClusters.map((cluster, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <p className="font-heading text-sm font-semibold text-foreground">
                        {cluster.topic}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {cluster.keywords.map((k, ki) => (
                          <span
                            key={ki}
                            className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </StrategySection>

            {/* 3. Competitor Analysis */}
            <StrategySection
              id="competitors"
              icon={Trophy}
              title="Competitor Analysis"
              subtitle="Strengths, weaknesses, and opportunities to outrank"
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {strategy.competitorAnalysis.map((comp, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-background p-5"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <p className="font-heading font-semibold text-foreground">
                        {comp.name}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                          Strengths
                        </p>
                        <ul className="mt-2 flex flex-col gap-1.5">
                          {comp.strengths.map((s, si) => (
                            <li key={si} className="text-xs leading-relaxed text-foreground">
                              · {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                          Weaknesses
                        </p>
                        <ul className="mt-2 flex flex-col gap-1.5">
                          {comp.weaknesses.map((w, wi) => (
                            <li key={wi} className="text-xs leading-relaxed text-foreground">
                              · {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          Opportunities
                        </p>
                        <ul className="mt-2 flex flex-col gap-1.5">
                          {comp.opportunities.map((o, oi) => (
                            <li key={oi} className="text-xs leading-relaxed text-foreground">
                              · {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </StrategySection>

            {/* 4. On-Page SEO */}
            <StrategySection
              id="on-page"
              icon={FileText}
              title="On-Page SEO"
              subtitle="Title tags, meta descriptions, headings, and internal linking"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Title Tag Strategy
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {strategy.onPageSeo.titleTagStrategy}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Meta Description Strategy
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {strategy.onPageSeo.metaDescriptionStrategy}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Heading Structure
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {strategy.onPageSeo.headingStructure}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Internal Linking
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {strategy.onPageSeo.internalLinking}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Key Recommendations
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {strategy.onPageSeo.recommendations.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </StrategySection>

            {/* 5. Technical SEO */}
            <StrategySection
              id="technical"
              icon={Wrench}
              title="Technical SEO Checklist"
              subtitle="Critical technical items prioritized by impact"
            >
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-1/3">
                        Item
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                        Description
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-32">
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {strategy.technicalSeo.checklist.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium text-foreground align-top">
                          {item.item}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground align-top">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Badge variant="outline" className={priorityStyles[item.priority]}>
                            {item.priority}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </StrategySection>

            {/* 6. Content Strategy */}
            <StrategySection
              id="content"
              icon={Calendar}
              title="Content Strategy & 12-Week Calendar"
              subtitle="Content pillars and publishing roadmap"
            >
              {/* Pillars */}
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Content Pillars
                </p>
                <div className="flex flex-wrap gap-2">
                  {strategy.contentStrategy.pillars.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary"
                    >
                      {p}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Publishing frequency: </span>
                  {strategy.contentStrategy.publishingFrequency}
                </p>
              </div>

              {/* Calendar */}
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  12-Week Editorial Calendar
                </p>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-16">
                          Week
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-32">
                          Type
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                          Topic
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                          Target Keyword
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {strategy.contentStrategy.contentCalendar
                        .slice()
                        .sort((a, b) => a.week - b.week)
                        .map((c, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 font-bold text-primary">
                              W{c.week}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-xs">
                                {c.contentType}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-foreground">{c.topic}</td>
                            <td className="px-4 py-3 text-muted-foreground italic">
                              {c.targetKeyword}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </StrategySection>

            {/* 7. Off-Page SEO */}
            <StrategySection
              id="off-page"
              icon={Link2}
              title="Off-Page SEO & Link Building"
              subtitle="Backlinks, guest posts, and authority building"
            >
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Backlink Strategy
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {strategy.offPageSeo.backlinkStrategy}
                </p>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Guest Post Opportunities
                  </p>
                  <ul className="flex flex-col gap-2">
                    {strategy.offPageSeo.guestPostOpportunities.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Social Signals
                  </p>
                  <ul className="flex flex-col gap-2">
                    {strategy.offPageSeo.socialSignals.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Directory Listings
                  </p>
                  <ul className="flex flex-col gap-2">
                    {strategy.offPageSeo.directories.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StrategySection>

            {/* 8. Local SEO */}
            <StrategySection
              id="local"
              icon={MapPin}
              title="Local SEO"
              subtitle={
                strategy.localSeo.applicable
                  ? 'Recommendations for your local business'
                  : 'Generic local SEO guidance (your business is not location-dependent)'
              }
            >
              {!strategy.localSeo.applicable && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Local SEO has limited impact for your business model. The
                    items below are still useful for general local visibility.
                  </span>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommendations
                  </p>
                  <ul className="flex flex-col gap-2">
                    {strategy.localSeo.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Google Business Profile Tips
                  </p>
                  <ul className="flex flex-col gap-2">
                    {strategy.localSeo.googleBusinessProfileTips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StrategySection>

            {/* 9. KPIs */}
            <StrategySection
              id="kpis"
              icon={BarChart3}
              title="KPIs & Goal Tracking"
              subtitle="Measurable targets to track your progress"
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {strategy.kpis.map((kpi, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex items-center justify-between">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="text-[10px]">
                        {kpi.timeline}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {kpi.metric}
                    </p>
                    <p className="mt-1 font-heading text-lg font-bold text-foreground leading-tight">
                      {kpi.target}
                    </p>
                  </div>
                ))}
              </div>
            </StrategySection>

            {/* 10. Action Plan */}
            <StrategySection
              id="action"
              icon={ListChecks}
              title="6-Month Action Plan"
              subtitle="Phased roadmap to execute your strategy"
            >
              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  {
                    label: 'Month 1: Foundation',
                    items: strategy.actionPlan.month1,
                    color: 'bg-emerald-500',
                  },
                  {
                    label: 'Month 3: Build & Publish',
                    items: strategy.actionPlan.month3,
                    color: 'bg-blue-500',
                  },
                  {
                    label: 'Month 6: Scale & Optimize',
                    items: strategy.actionPlan.month6,
                    color: 'bg-violet-500',
                  },
                ].map((phase, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-background p-5"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${phase.color}`} />
                      <p className="font-heading font-semibold text-foreground">
                        {phase.label}
                      </p>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {phase.items.map((item, ii) => (
                        <li
                          key={ii}
                          className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </StrategySection>

            {/* Disclaimer */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground print:hidden" data-print-hide>
              <p>
                <strong className="text-foreground">Note:</strong> This strategy
                is AI-generated based on the information you provided. Always
                validate keyword data with tools like Google Search Console,
                Ahrefs, or SEMrush before executing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
