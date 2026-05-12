'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  PenLine,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Printer,
  RefreshCw,
  Target,
  Users,
  Mic,
  Globe,
  FileText,
  Award,
  Eye,
  Code2,
  ListChecks,
  Lightbulb,
  ShieldCheck,
  Search,
  Quote,
  ImageIcon,
  Link2,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Hash,
  Clock,
  Layers,
  Brain,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { GeneratedContent } from '@/app/api/content-writer/route'

// ---------------------------------------------------------------------------
// Defensive JSON parser — copied pattern from the SEO strategy tool to handle
// HTML error pages from timeouts cleanly.
// ---------------------------------------------------------------------------
async function safeReadJson(
  response: Response,
  actionLabel: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const looksLikeHtml = /^\s*<(?:!doctype|html|body|head)/i.test(text)
    if (looksLikeHtml) {
      const isTimeout =
        response.status === 504 || /timeout|timed out|gateway/i.test(text)
      return {
        error: isTimeout
          ? `The request timed out while trying to ${actionLabel}. The AI took too long — try a smaller word count.`
          : `The server returned an unexpected error (status ${response.status}) while trying to ${actionLabel}.`,
      }
    }
    return { error: `Could not ${actionLabel}: ${text.slice(0, 200)}` }
  }
}

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------
interface FormData {
  topic: string
  primaryKeyword: string
  secondaryKeywords: string
  contentType: string
  audience: string
  tone: string
  wordCount: number
  pointOfView: string
  language: string
  brandName: string
  brandUrl: string
  expertCredentials: string
  firstHandExperience: string
  mustIncludePoints: string
  competitorUrls: string
  callToAction: string
}

const initialForm: FormData = {
  topic: '',
  primaryKeyword: '',
  secondaryKeywords: '',
  contentType: 'Blog Post',
  audience: '',
  tone: 'Confident, helpful, expert',
  wordCount: 1500,
  pointOfView: 'First-person plural (we)',
  language: 'English (en-US)',
  brandName: '',
  brandUrl: '',
  expertCredentials: '',
  firstHandExperience: '',
  mustIncludePoints: '',
  competitorUrls: '',
  callToAction: '',
}

const CONTENT_TYPES = [
  'Blog Post',
  'In-Depth Guide',
  'How-To Tutorial',
  'Listicle',
  'Comparison / vs Article',
  'Product Review',
  'Service Page',
  'Landing Page Copy',
  'Pillar Page',
  'News / Update',
]

const TONES = [
  'Confident, helpful, expert',
  'Friendly and conversational',
  'Authoritative and academic',
  'Witty and playful',
  'Inspirational and motivating',
  'Direct and no-nonsense',
  'Empathetic and supportive',
]

const POV_OPTIONS = [
  'First-person plural (we)',
  'First-person singular (I)',
  'Second-person (you)',
  'Third-person (objective)',
]

const STEPS = [
  { id: 1, title: 'Topic', description: 'Core subject & keywords' },
  { id: 2, title: 'Audience', description: 'Format, tone, length' },
  { id: 3, title: 'E-E-A-T', description: 'Experience & expertise' },
  { id: 4, title: 'Details', description: 'Brand & extras' },
] as const

type Phase = 'idle' | 'generating' | 'done' | 'error'

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ContentWriterTool() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase === 'done' && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [phase])

  const canContinueStep1 =
    form.topic.trim().length > 2 && form.primaryKeyword.trim().length > 1

  async function handleGenerate() {
    setError(null)
    setContent(null)
    setPhase('generating')

    try {
      const res = await fetch('/api/content-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await safeReadJson(res, 'generate the content')
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate content')
      }
      setContent(data.content)
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setPhase('error')
    }
  }

  function reset() {
    setStep(1)
    setForm(initialForm)
    setContent(null)
    setError(null)
    setPhase('idle')
  }

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 print:p-0">
      <div
        className={`mx-auto space-y-8 ${
          phase === 'done' ? 'max-w-6xl' : 'max-w-3xl'
        } print:max-w-none`}
      >
        {phase !== 'done' && (
          <>
            <div className="text-center print:hidden" data-print-hide>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Tuned for Google&apos;s 2025 core, spam &amp; AI Overview updates
              </div>
              <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Write content Google actually wants to rank
              </h1>
              <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Generate complete, SEO-optimized articles with E-E-A-T signals,
                AI Overview hooks, FAQ schema, and a publishing-ready
                checklist — built around Google&apos;s latest Helpful Content
                System and spam policies.
              </p>
            </div>

            <WizardCard
              step={step}
              form={form}
              setForm={setForm}
              phase={phase}
              error={error}
              canContinueStep1={canContinueStep1}
              onBack={() => setStep((s) => Math.max(1, s - 1))}
              onNext={() => setStep((s) => Math.min(4, s + 1))}
              onGenerate={handleGenerate}
            />

            <GoogleUpdatesBanner />
          </>
        )}

        {phase === 'done' && content && (
          <div ref={reportRef}>
            <ContentReport content={content} form={form} onReset={reset} />
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Google updates context banner
// ---------------------------------------------------------------------------
function GoogleUpdatesBanner() {
  const updates = [
    {
      icon: ShieldCheck,
      label: 'Helpful Content System',
      detail: 'Now part of core ranking (Mar 2024+)',
    },
    {
      icon: Award,
      label: 'E-E-A-T',
      detail: 'Experience added as the 4th signal',
    },
    {
      icon: AlertTriangle,
      label: 'Scaled Content Abuse',
      detail: 'March 2024 spam policy',
    },
    {
      icon: Brain,
      label: 'AI Overviews / SGE',
      detail: 'Optimized for citation lifts',
    },
  ]
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-base font-semibold">
            Built around Google&apos;s latest guidance
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Every piece is graded against the same criteria Google&apos;s
            quality raters and ranking systems use.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {updates.map((u) => {
          const Icon = u.icon
          return (
            <div
              key={u.label}
              className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  {u.label}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {u.detail}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Wizard card
// ---------------------------------------------------------------------------
function WizardCard({
  step,
  form,
  setForm,
  phase,
  error,
  canContinueStep1,
  onBack,
  onNext,
  onGenerate,
}: {
  step: number
  form: FormData
  setForm: (f: FormData | ((prev: FormData) => FormData)) => void
  phase: Phase
  error: string | null
  canContinueStep1: boolean
  onBack: () => void
  onNext: () => void
  onGenerate: () => void
}) {
  const isLoading = phase === 'generating'

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Stepper */}
      <div className="border-b bg-muted/30 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {STEPS.map((s, idx) => {
            const isActive = s.id === step
            const isComplete = s.id < step
            return (
              <div
                key={s.id}
                className="flex flex-1 items-center gap-2 sm:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
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
                  <div className="hidden min-w-0 sm:block">
                    <div
                      className={`truncate text-sm font-medium ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {s.title}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
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

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 text-center sm:p-16">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <div className="absolute -inset-2 animate-pulse rounded-full border-2 border-primary/20" />
          </div>
          <h3 className="mt-6 font-heading text-xl font-semibold">
            Writing your content
          </h3>
          <p className="mt-2 max-w-md text-pretty text-muted-foreground">
            Optimizing for E-E-A-T, helpful content signals, AI Overview
            citation lifts, and schema markup. This usually takes 30-90 seconds.
          </p>
        </div>
      )}

      {!isLoading && (
        <div className="p-6 sm:p-8">
          {step === 1 && <Step1 form={form} setForm={setForm} />}
          {step === 2 && <Step2 form={form} setForm={setForm} />}
          {step === 3 && <Step3 form={form} setForm={setForm} />}
          {step === 4 && <Step4 form={form} setForm={setForm} />}

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={step === 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>

            <div className="flex items-center gap-2">
              {step >= 3 && step < 4 && (
                <Button type="button" variant="ghost" onClick={onGenerate}>
                  Skip &amp; Generate
                </Button>
              )}
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={onNext}
                  disabled={step === 1 && !canContinueStep1}
                >
                  Continue <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={onGenerate}>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Content
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
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
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold">
          <Target className="h-6 w-6 text-primary" />
          What are we writing about?
        </h2>
        <p className="mt-1 text-muted-foreground">
          Start with a focused topic and the keyword you want to rank for.
        </p>
      </div>

      <div className="grid gap-5">
        <div>
          <Label htmlFor="topic" className="mb-2 block">
            Topic <span className="text-destructive">*</span>
          </Label>
          <Input
            id="topic"
            placeholder="e.g. How to choose the right ergonomic office chair"
            value={form.topic}
            onChange={(e) =>
              setForm((f) => ({ ...f, topic: e.target.value }))
            }
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Describe the angle, not just a keyword. Specificity = better content.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="primaryKeyword" className="mb-2 block">
              Primary keyword <span className="text-destructive">*</span>
            </Label>
            <Input
              id="primaryKeyword"
              placeholder="e.g. best ergonomic office chair"
              value={form.primaryKeyword}
              onChange={(e) =>
                setForm((f) => ({ ...f, primaryKeyword: e.target.value }))
              }
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              The single most important phrase you want to rank for.
            </p>
          </div>

          <div>
            <Label htmlFor="contentType" className="mb-2 block">
              Content type
            </Label>
            <select
              id="contentType"
              value={form.contentType}
              onChange={(e) =>
                setForm((f) => ({ ...f, contentType: e.target.value }))
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="secondaryKeywords" className="mb-2 block">
            Secondary keywords{' '}
            <span className="text-xs text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="secondaryKeywords"
            rows={3}
            placeholder={'lumbar support chair\nmesh chair vs leather\nbest budget ergonomic chair'}
            value={form.secondaryKeywords}
            onChange={(e) =>
              setForm((f) => ({ ...f, secondaryKeywords: e.target.value }))
            }
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            One per line or comma-separated. Leave empty and the AI will infer them.
          </p>
        </div>
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold">
          <Users className="h-6 w-6 text-primary" />
          Who is reading it?
        </h2>
        <p className="mt-1 text-muted-foreground">
          Voice, length, and audience drive how Google&apos;s helpfulness
          system grades the result.
        </p>
      </div>

      <div className="grid gap-5">
        <div>
          <Label htmlFor="audience" className="mb-2 block">
            Target audience
          </Label>
          <Input
            id="audience"
            placeholder="e.g. Remote workers and freelancers researching home-office setups"
            value={form.audience}
            onChange={(e) =>
              setForm((f) => ({ ...f, audience: e.target.value }))
            }
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="tone" className="mb-2 block">
              Voice / tone
            </Label>
            <select
              id="tone"
              value={form.tone}
              onChange={(e) =>
                setForm((f) => ({ ...f, tone: e.target.value }))
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="pointOfView" className="mb-2 block">
              Point of view
            </Label>
            <select
              id="pointOfView"
              value={form.pointOfView}
              onChange={(e) =>
                setForm((f) => ({ ...f, pointOfView: e.target.value }))
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {POV_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="wordCount" className="mb-2 block">
            Target word count: <span className="text-primary">{form.wordCount.toLocaleString()}</span>
          </Label>
          <input
            id="wordCount"
            type="range"
            min={500}
            max={3500}
            step={100}
            value={form.wordCount}
            onChange={(e) =>
              setForm((f) => ({ ...f, wordCount: Number(e.target.value) }))
            }
            className="w-full accent-[var(--color-primary)]"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>500</span>
            <span>1,500 (recommended)</span>
            <span>3,500</span>
          </div>
        </div>

        <div>
          <Label htmlFor="language" className="mb-2 block">
            Output language
          </Label>
          <Input
            id="language"
            placeholder="English (en-US)"
            value={form.language}
            onChange={(e) =>
              setForm((f) => ({ ...f, language: e.target.value }))
            }
          />
        </div>
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold">
          <Award className="h-6 w-6 text-primary" />
          E-E-A-T signals
        </h2>
        <p className="mt-1 text-muted-foreground">
          Google&apos;s December 2022 update added <em>Experience</em> as the
          fourth pillar. The more first-hand context you provide, the more
          ranking signal we can bake in.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Why this matters:</strong> The
            March 2024 spam update + Helpful Content System penalize
            content that lacks demonstrated expertise. Even a few specific
            details — when you started, what you tested, common mistakes you&apos;ve
            seen — dramatically improve ranking.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="expertCredentials" className="mb-2 block">
          Author / expert credentials
        </Label>
        <Textarea
          id="expertCredentials"
          rows={3}
          placeholder="e.g. 10 years as an ergonomics consultant, certified by the Human Factors Society, contributor to Healthline."
          value={form.expertCredentials}
          onChange={(e) =>
            setForm((f) => ({ ...f, expertCredentials: e.target.value }))
          }
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Adds verifiable expertise and authoritativeness signals.
        </p>
      </div>

      <div>
        <Label htmlFor="firstHandExperience" className="mb-2 block">
          First-hand experience &amp; original insights
        </Label>
        <Textarea
          id="firstHandExperience"
          rows={5}
          placeholder="e.g. We've tested 30+ chairs over 6 years. Hottest take: most 'lumbar support' is just foam. The Herman Miller Aeron lasted 9 years; the budget Amazon pick failed at month 4..."
          value={form.firstHandExperience}
          onChange={(e) =>
            setForm((f) => ({ ...f, firstHandExperience: e.target.value }))
          }
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          The single most powerful field for E-E-A-T. Specific anecdotes,
          tests, numbers, mistakes.
        </p>
      </div>

      <div>
        <Label htmlFor="mustIncludePoints" className="mb-2 block">
          Must-include points{' '}
          <span className="text-xs text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="mustIncludePoints"
          rows={3}
          placeholder="e.g. Cover the difference between mesh and foam, include a section on warranty, recommend at least 3 specific products."
          value={form.mustIncludePoints}
          onChange={(e) =>
            setForm((f) => ({ ...f, mustIncludePoints: e.target.value }))
          }
        />
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
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold">
          <Globe className="h-6 w-6 text-primary" />
          Brand &amp; competition
        </h2>
        <p className="mt-1 text-muted-foreground">
          Optional context that helps the AI tailor the voice and beat ranking
          rivals.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="brandName" className="mb-2 block">
            Brand / site name
          </Label>
          <Input
            id="brandName"
            placeholder="e.g. ErgoLab"
            value={form.brandName}
            onChange={(e) =>
              setForm((f) => ({ ...f, brandName: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="brandUrl" className="mb-2 block">
            Brand URL
          </Label>
          <Input
            id="brandUrl"
            type="url"
            placeholder="https://ergolab.com"
            value={form.brandUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, brandUrl: e.target.value }))
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="competitorUrls" className="mb-2 block">
          Competitor URLs to beat{' '}
          <span className="text-xs text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="competitorUrls"
          rows={3}
          placeholder={'https://wirecutter.com/reviews/best-office-chair\nhttps://nytimes.com/...'}
          value={form.competitorUrls}
          onChange={(e) =>
            setForm((f) => ({ ...f, competitorUrls: e.target.value }))
          }
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          The AI will aim to demonstrably outperform these in depth and
          information gain.
        </p>
      </div>

      <div>
        <Label htmlFor="callToAction" className="mb-2 block">
          Call-to-action
        </Label>
        <Input
          id="callToAction"
          placeholder="e.g. Sign up for our free ergonomics checklist."
          value={form.callToAction}
          onChange={(e) =>
            setForm((f) => ({ ...f, callToAction: e.target.value }))
          }
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
function ContentReport({
  content,
  form,
  onReset,
}: {
  content: GeneratedContent
  form: FormData
  onReset: () => void
}) {
  type Tab =
    | 'overview'
    | 'article'
    | 'snippet'
    | 'faq'
    | 'eeat'
    | 'helpful'
    | 'aio'
    | 'schema'
    | 'assets'
    | 'checklist'

  const [tab, setTab] = useState<Tab>('overview')

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Eye className="h-3.5 w-3.5" /> },
    { key: 'article', label: 'Full Article', icon: <FileText className="h-3.5 w-3.5" /> },
    { key: 'snippet', label: 'AI Overview', icon: <Brain className="h-3.5 w-3.5" /> },
    { key: 'faq', label: 'FAQ', icon: <Quote className="h-3.5 w-3.5" /> },
    { key: 'eeat', label: 'E-E-A-T', icon: <Award className="h-3.5 w-3.5" /> },
    { key: 'helpful', label: 'Helpful Content', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { key: 'aio', label: 'AI Optimization', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: 'schema', label: 'Schema', icon: <Code2 className="h-3.5 w-3.5" /> },
    { key: 'assets', label: 'Images & Links', icon: <ImageIcon className="h-3.5 w-3.5" /> },
    { key: 'checklist', label: 'Pre-Publish', icon: <ListChecks className="h-3.5 w-3.5" /> },
  ]

  const fullMarkdown = React.useMemo(() => buildFullMarkdown(content), [content])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <PenLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold leading-tight text-balance">
                {content.meta.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                {content.meta.metaDescription}
              </p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden" data-print-hide>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> New article
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
            </Button>
            <Button size="sm" onClick={() => downloadMarkdown(content)}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Hash className="h-4 w-4" />}
            label="Words"
            value={content.meta.estimatedWordCount.toLocaleString()}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Reading time"
            value={`${content.meta.readingTimeMinutes} min`}
          />
          <StatCard
            icon={<Award className="h-4 w-4" />}
            label="E-E-A-T score"
            value={`${content.eeat.overallScore}/100`}
            highlight={content.eeat.overallScore >= 75}
          />
          <StatCard
            icon={<Search className="h-4 w-4" />}
            label="Search intent"
            value={
              content.meta.searchIntent.charAt(0).toUpperCase() +
              content.meta.searchIntent.slice(1)
            }
          />
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted p-1 print:hidden"
        data-print-hide
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              tab === t.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="print:!block">
        {tab === 'overview' && (
          <OverviewSection content={content} form={form} fullMarkdown={fullMarkdown} />
        )}
        {tab === 'article' && <ArticleSection content={content} />}
        {tab === 'snippet' && <SnippetSection content={content} />}
        {tab === 'faq' && <FaqSection content={content} />}
        {tab === 'eeat' && <EeatSection content={content} />}
        {tab === 'helpful' && <HelpfulSection content={content} />}
        {tab === 'aio' && <AioSection content={content} />}
        {tab === 'schema' && <SchemaSection content={content} />}
        {tab === 'assets' && <AssetsSection content={content} />}
        {tab === 'checklist' && <ChecklistSection content={content} />}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-heading text-lg font-bold leading-none">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab sections
// ---------------------------------------------------------------------------
function OverviewSection({
  content,
  form,
  fullMarkdown,
}: {
  content: GeneratedContent
  form: FormData
  fullMarkdown: string
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
        <h3 className="flex items-center gap-2 font-heading text-base font-semibold">
          <Eye className="h-4 w-4 text-primary" /> Google SERP preview
        </h3>
        <div className="mt-4 rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">
            {form.brandUrl || 'https://example.com'}
            {' › '}
            <span className="text-foreground">{content.meta.slug}</span>
          </p>
          <p className="mt-0.5 cursor-pointer text-[18px] font-medium leading-snug text-blue-600 underline">
            {content.meta.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {content.meta.metaDescription}
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MetaField label="Slug" value={content.meta.slug} copyable />
          <MetaField label="Primary keyword" value={content.meta.primaryKeyword} />
          <MetaField
            label="Title length"
            value={`${content.meta.title.length} chars`}
            status={
              content.meta.title.length >= 50 && content.meta.title.length <= 60
                ? 'good'
                : 'warning'
            }
          />
          <MetaField
            label="Meta desc length"
            value={`${content.meta.metaDescription.length} chars`}
            status={
              content.meta.metaDescription.length >= 140 &&
              content.meta.metaDescription.length <= 160
                ? 'good'
                : 'warning'
            }
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="flex items-center gap-2 font-heading text-base font-semibold">
            <ListChecks className="h-4 w-4 text-primary" /> Key takeaways
          </h3>
          <ul className="mt-3 space-y-2">
            {content.keyTakeaways.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="leading-relaxed text-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h3 className="flex items-center gap-2 font-heading text-base font-semibold">
            <Hash className="h-4 w-4 text-primary" /> Keyword strategy
          </h3>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Secondary</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {content.meta.secondaryKeywords.map((k) => (
                  <Badge key={k} variant="secondary" className="text-xs">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">LSI / semantic</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {content.meta.lsiKeywords.map((k) => (
                  <Badge key={k} variant="outline" className="text-xs">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <CopyBlock label="Full article (Markdown)" text={fullMarkdown} />
      </div>
    </div>
  )
}

function MetaField({
  label,
  value,
  status,
  copyable,
}: {
  label: string
  value: string
  status?: 'good' | 'warning'
  copyable?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {copyable && (
          <button
            onClick={copy}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Copy ${label}`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
      <p
        className={`mt-1 break-words text-sm font-medium ${
          status === 'good'
            ? 'text-green-600'
            : status === 'warning'
              ? 'text-amber-600'
              : 'text-foreground'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function ArticleSection({ content }: { content: GeneratedContent }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5 sm:p-8">
        <header className="mb-6 border-b border-border pb-5">
          <h1 className="font-heading text-3xl font-bold leading-tight text-balance sm:text-4xl">
            {content.meta.title}
          </h1>
          <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
            {content.meta.metaDescription}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {content.meta.readingTimeMinutes} min read
            </span>
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {content.meta.estimatedWordCount.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {content.sections.length} sections
            </span>
          </div>
        </header>

        {/* Key takeaways block */}
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Key takeaways
          </p>
          <ul className="mt-2 space-y-1.5">
            {content.keyTakeaways.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Introduction */}
        <div className="prose-content">
          <Paragraphs text={content.introduction} />
        </div>

        {/* Sections */}
        {content.sections.map((section, idx) => (
          <section key={idx} className="mt-8">
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              {section.h2}
            </h2>
            <div className="mt-3 prose-content">
              <Paragraphs text={section.content} />
            </div>
            {section.subsections.map((sub, sIdx) => (
              <div key={sIdx} className="mt-5">
                <h3 className="font-heading text-xl font-semibold">{sub.h3}</h3>
                <div className="mt-2 prose-content">
                  <Paragraphs text={sub.content} />
                </div>
              </div>
            ))}
          </section>
        ))}

        {/* Conclusion */}
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="font-heading text-2xl font-bold">Conclusion</h2>
          <div className="mt-3 prose-content">
            <Paragraphs text={content.conclusion} />
          </div>
          <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Call to action
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed">
              {content.callToAction}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function Paragraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim())
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-foreground">
      {paragraphs.map((p, i) => (
        <p key={i}>{renderInline(p)}</p>
      ))}
    </div>
  )
}

// Render a small subset of markdown inline: **bold**, *italic*, [text](url)
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/
  const boldRe = /\*\*([^*]+)\*\*/
  const italicRe = /\*([^*]+)\*/

  while (remaining.length) {
    const linkMatch = remaining.match(linkRe)
    const boldMatch = remaining.match(boldRe)
    const italicMatch = remaining.match(italicRe)

    const matches = [
      linkMatch ? { idx: linkMatch.index!, type: 'link' as const, match: linkMatch } : null,
      boldMatch ? { idx: boldMatch.index!, type: 'bold' as const, match: boldMatch } : null,
      italicMatch ? { idx: italicMatch.index!, type: 'italic' as const, match: italicMatch } : null,
    ].filter(Boolean) as Array<{ idx: number; type: 'link' | 'bold' | 'italic'; match: RegExpMatchArray }>

    if (matches.length === 0) {
      parts.push(remaining)
      break
    }
    matches.sort((a, b) => a.idx - b.idx)
    const first = matches[0]
    if (first.idx > 0) parts.push(remaining.slice(0, first.idx))

    if (first.type === 'link') {
      parts.push(
        <a
          key={key++}
          href={first.match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:no-underline"
        >
          {first.match[1]}
        </a>,
      )
    } else if (first.type === 'bold') {
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {first.match[1]}
        </strong>,
      )
    } else {
      parts.push(
        <em key={key++} className="italic">
          {first.match[1]}
        </em>,
      )
    }
    remaining = remaining.slice(first.idx + first.match[0].length)
  }
  return <>{parts}</>
}

function SnippetSection({ content }: { content: GeneratedContent }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-semibold">
              Featured snippet / AI Overview answer
            </h3>
            <p className="text-sm text-muted-foreground">
              Written to be lifted verbatim by Google AI Overviews and the
              traditional Featured Snippet box. Format:{' '}
              <Badge variant="secondary" className="ml-1">
                {content.featuredSnippet.format}
              </Badge>
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Question
            </p>
            <p className="mt-1.5 font-heading text-lg font-semibold leading-snug text-blue-900">
              {content.featuredSnippet.question}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Answer ({content.featuredSnippet.answer.split(/\s+/).length} words)
              </p>
              <CopyInlineButton text={content.featuredSnippet.answer} />
            </div>
            <p className="mt-2 text-[15px] leading-relaxed">
              {content.featuredSnippet.answer}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h3 className="flex items-center gap-2 font-heading text-base font-semibold">
          <Quote className="h-4 w-4 text-primary" /> Quotable statements
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Concise statements engineered to be cited in AI Overviews and Perplexity-style results.
        </p>
        <ul className="mt-4 space-y-2.5">
          {content.aiOverviewOptimization.quotableStatements.map((q, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm leading-relaxed"
            >
              <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{q}</span>
              <CopyInlineButton text={q} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function FaqSection({ content }: { content: GeneratedContent }) {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
        <Quote className="h-5 w-5 text-primary" /> FAQ section
      </h3>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Modeled on Google&apos;s People-Also-Ask questions. Already wired into
        the FAQPage schema in the Schema tab.
      </p>
      <div className="mt-5 divide-y divide-border">
        {content.faq.map((item, i) => (
          <details
            key={i}
            className="group py-3"
            open={i === 0}
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
              <span className="font-heading font-semibold leading-snug">
                {item.question}
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
            </summary>
            <p className="mt-2 pr-6 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  )
}

function EeatSection({ content }: { content: GeneratedContent }) {
  const pillars = [
    {
      key: 'experience',
      title: 'Experience',
      icon: Users,
      data: content.eeat.experience,
      hint: 'First-hand use, testing, lived perspective',
    },
    {
      key: 'expertise',
      title: 'Expertise',
      icon: Brain,
      data: content.eeat.expertise,
      hint: 'Demonstrable knowledge and credentials',
    },
    {
      key: 'authoritativeness',
      title: 'Authoritativeness',
      icon: Award,
      data: content.eeat.authoritativeness,
      hint: 'Reputation in the topic / industry',
    },
    {
      key: 'trustworthiness',
      title: 'Trustworthiness',
      icon: ShieldCheck,
      data: content.eeat.trustworthiness,
      hint: 'Accuracy, transparency, safety',
    },
  ] as const

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold">
              E-E-A-T overall score
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Graded the way Google&apos;s quality raters and ranking systems
              do (post-Dec 2022 update).
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-5xl font-bold text-primary">
              {content.eeat.overallScore}
            </span>
            <span className="text-lg text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${content.eeat.overallScore}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pillars.map((p) => {
          const Icon = p.icon
          return (
            <div key={p.key} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold">
                      {p.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.hint}</p>
                  </div>
                </div>
                <span className="font-heading text-2xl font-bold">
                  {p.data.score}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${p.data.score}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.data.analysis}
              </p>
              {p.data.suggestions.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {p.data.suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs leading-relaxed"
                    >
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HelpfulSection({ content }: { content: GeneratedContent }) {
  const statusColor = (s: 'pass' | 'warning' | 'needs-work') =>
    s === 'pass'
      ? 'text-green-600 bg-green-50 border-green-200'
      : s === 'warning'
        ? 'text-amber-600 bg-amber-50 border-amber-200'
        : 'text-rose-600 bg-rose-50 border-rose-200'

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <ShieldCheck className="h-5 w-5 text-primary" /> Helpful Content System
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Google&apos;s Helpful Content System is now part of core ranking (March
          2024). Each criterion is graded against the official self-assessment
          guidance.
        </p>
      </div>

      <div className="grid gap-3">
        {content.helpfulContentChecklist.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-heading text-sm font-semibold leading-snug">
                {item.criterion}
              </p>
              <Badge
                variant="outline"
                className={`shrink-0 text-[10px] uppercase ${statusColor(item.status)}`}
              >
                {item.status.replace('-', ' ')}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.explanation}
            </p>
          </div>
        ))}
      </div>

      {/* Originality */}
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="flex items-center gap-2 font-heading text-base font-semibold">
          <TrendingUp className="h-4 w-4 text-primary" /> Originality &amp; information gain
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Direct response to Google&apos;s March 2024 scaled content abuse policy.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <OriginalityCard
            title="Unique angles"
            icon={<Lightbulb className="h-4 w-4 text-primary" />}
            items={content.originalityNotes.uniqueAngles}
          />
          <OriginalityCard
            title="Information gain"
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            items={content.originalityNotes.informationGainElements}
          />
          <OriginalityCard
            title="Risks to address"
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            items={content.originalityNotes.risks}
            warning
          />
        </div>
      </div>
    </div>
  )
}

function OriginalityCard({
  title,
  icon,
  items,
  warning,
}: {
  title: string
  icon: React.ReactNode
  items: string[]
  warning?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        warning ? 'border-amber-200 bg-amber-50/40' : 'border-border bg-background'
      }`}
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AioSection({ content }: { content: GeneratedContent }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-primary" /> AI Overviews / SGE optimization
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Specific patterns that win citation lifts in Google&apos;s AI
          Overviews, Perplexity, and ChatGPT-style answer surfaces.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <h4 className="flex items-center gap-2 font-heading text-sm font-semibold">
            <Hash className="h-4 w-4 text-primary" /> Named entities
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            People, products, orgs, and concepts grounding the piece.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {content.aiOverviewOptimization.namedEntities.map((e) => (
              <Badge key={e} variant="secondary" className="text-xs">
                {e}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h4 className="flex items-center gap-2 font-heading text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-primary" /> Structured facts
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Atomic, verifiable statements LLMs can cite cleanly.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {content.aiOverviewOptimization.structuredFacts.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h4 className="flex items-center gap-2 font-heading text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-primary" /> Optimization tips
        </h4>
        <ul className="mt-3 space-y-2.5">
          {content.aiOverviewOptimization.optimizationTips.map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm leading-relaxed"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {i + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function SchemaSection({ content }: { content: GeneratedContent }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Code2 className="h-5 w-5 text-primary" /> Structured data (JSON-LD)
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Paste each block inside{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
            &lt;script type=&quot;application/ld+json&quot;&gt;
          </code>{' '}
          tags in your page &lt;head&gt;.
        </p>
      </div>
      <CodeBlock label="Article schema" code={content.schemaMarkup.articleJsonLd} />
      <CodeBlock label="FAQPage schema" code={content.schemaMarkup.faqPageJsonLd} />
    </div>
  )
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  const formatted = React.useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(code), null, 2)
    } catch {
      return code
    }
  }, [code])

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Button size="sm" variant="ghost" onClick={copy}>
          {copied ? (
            <>
              <Check className="mr-1 h-3.5 w-3.5 text-green-600" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3.5 w-3.5" /> Copy
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto bg-background p-4 text-xs leading-relaxed font-mono">
        <code>{formatted}</code>
      </pre>
    </div>
  )
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="flex items-center gap-2 font-heading text-sm font-semibold">
        <FileText className="h-4 w-4 text-primary" /> {label}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        One-click copy of the entire article in Markdown.
      </p>
      <Button size="sm" className="mt-3 w-full" onClick={copy}>
        {copied ? (
          <>
            <Check className="mr-1.5 h-3.5 w-3.5" /> Copied to clipboard
          </>
        ) : (
          <>
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Markdown
          </>
        )}
      </Button>
    </div>
  )
}

function CopyInlineButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      className="ml-auto shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      aria-label="Copy"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  )
}

function AssetsSection({ content }: { content: GeneratedContent }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <ImageIcon className="h-5 w-5 text-primary" /> Image suggestions
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Includes SEO-friendly alt text and filenames for each placement.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {content.imageSuggestions.map((img, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-background p-4"
            >
              <Badge variant="secondary" className="text-[10px]">
                {img.placement}
              </Badge>
              <p className="mt-2 text-sm font-medium leading-snug">
                {img.description}
              </p>
              <div className="mt-3 space-y-1.5 border-t border-border pt-2.5 text-xs">
                <div className="flex items-start gap-1.5">
                  <span className="font-semibold text-muted-foreground">Alt:</span>
                  <span className="leading-relaxed">{img.altText}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-semibold text-muted-foreground">File:</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                    {img.filenameSuggestion}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="flex items-center gap-2 font-heading text-base font-semibold">
            <Link2 className="h-4 w-4 text-primary" /> Internal link suggestions
          </h3>
          <ul className="mt-3 space-y-3">
            {content.internalLinks.map((link, i) => (
              <li
                key={i}
                className="rounded-lg border border-border bg-background p-3"
              >
                <p className="text-sm font-semibold">
                  {link.anchorText}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    → {link.suggestedTargetPage}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Placement: {link.placementHint}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h3 className="flex items-center gap-2 font-heading text-base font-semibold">
            <ExternalLink className="h-4 w-4 text-primary" /> Outbound citation ideas
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Linking to authoritative sources is a positive trust signal.
          </p>
          <ul className="mt-3 space-y-3">
            {content.externalReferences.map((ref, i) => (
              <li
                key={i}
                className="rounded-lg border border-border bg-background p-3"
              >
                <p className="text-sm font-semibold">{ref.anchorText}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong className="text-foreground">{ref.sourceType}:</strong>{' '}
                  {ref.whyAuthoritative}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function ChecklistSection({ content }: { content: GeneratedContent }) {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
        <ListChecks className="h-5 w-5 text-primary" /> Pre-publish checklist
      </h3>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Do these before hitting publish. Each item directly maps to a Google
        ranking or quality signal.
      </p>
      <ul className="mt-5 space-y-2">
        {content.publishingChecklist.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-[10px] font-bold text-muted-foreground">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildFullMarkdown(c: GeneratedContent): string {
  const lines: string[] = []
  lines.push(`# ${c.meta.title}`)
  lines.push('')
  lines.push(`> ${c.meta.metaDescription}`)
  lines.push('')
  lines.push('## Key Takeaways')
  c.keyTakeaways.forEach((t) => lines.push(`- ${t}`))
  lines.push('')
  lines.push(c.introduction)
  lines.push('')

  c.sections.forEach((section) => {
    lines.push(`## ${section.h2}`)
    lines.push('')
    lines.push(section.content)
    lines.push('')
    section.subsections.forEach((sub) => {
      lines.push(`### ${sub.h3}`)
      lines.push('')
      lines.push(sub.content)
      lines.push('')
    })
  })

  lines.push('## Conclusion')
  lines.push('')
  lines.push(c.conclusion)
  lines.push('')
  lines.push(`**${c.callToAction}**`)
  lines.push('')

  lines.push('## Frequently Asked Questions')
  lines.push('')
  c.faq.forEach((f) => {
    lines.push(`### ${f.question}`)
    lines.push('')
    lines.push(f.answer)
    lines.push('')
  })

  return lines.join('\n')
}

function downloadMarkdown(c: GeneratedContent) {
  const md = buildFullMarkdown(c)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${c.meta.slug || 'article'}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
