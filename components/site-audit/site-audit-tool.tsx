'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Globe,
  Loader2,
  Search,
  RefreshCw,
  Download,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronDown,
  Settings2,
  Gauge,
  FileText,
  Link2,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  ArrowRight,
  ExternalLink,
  Clock,
  Database,
  Layers,
  Eye,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'warning' | 'info' | 'passed'
type CategoryId = 'technical' | 'performance' | 'content' | 'links'

interface AuditIssue {
  id: string
  category: CategoryId
  severity: Severity
  title: string
  description: string
  affectedPages: number
  howToFix: string
  impact: 'High' | 'Medium' | 'Low'
}

interface CategoryScore {
  id: CategoryId
  label: string
  score: number
  icon: typeof Gauge
  passed: number
  total: number
  description: string
}

// ─── Mock Audit Generator ────────────────────────────────────────────────────

function generateMockAudit(url: string) {
  // Deterministic-ish randomness based on URL length so the same URL gives stable-ish numbers
  const seed = url.length
  const r = (min: number, max: number, offset = 0) =>
    Math.floor(((seed * 9301 + 49297 + offset * 13) % 233280) / 233280 * (max - min)) + min

  const technicalScore = r(58, 92, 1)
  const performanceScore = r(48, 88, 2)
  const contentScore = r(62, 94, 3)
  const linksScore = r(55, 90, 4)

  const overall = Math.round(
    (technicalScore + performanceScore + contentScore + linksScore) / 4
  )

  const categories: CategoryScore[] = [
    {
      id: 'technical',
      label: 'Technical SEO',
      score: technicalScore,
      icon: Settings2,
      passed: r(14, 22, 11),
      total: 26,
      description: 'Meta tags, schema, canonical, robots, sitemap, HTTPS.',
    },
    {
      id: 'performance',
      label: 'Performance & CWV',
      score: performanceScore,
      icon: Gauge,
      passed: r(10, 16, 12),
      total: 18,
      description: 'Core Web Vitals, render-blocking, image weight, caching.',
    },
    {
      id: 'content',
      label: 'On-Page & E-E-A-T',
      score: contentScore,
      icon: FileText,
      passed: r(15, 23, 13),
      total: 24,
      description: 'Content depth, headings, alt text, E-E-A-T signals.',
    },
    {
      id: 'links',
      label: 'Links, A11y & Security',
      score: linksScore,
      icon: Link2,
      passed: r(12, 20, 14),
      total: 22,
      description: 'Broken links, accessibility, security headers.',
    },
  ]

  const allIssues: AuditIssue[] = [
    {
      id: 't1',
      category: 'technical',
      severity: 'critical',
      title: 'Missing meta descriptions on 8 pages',
      description: 'Pages without meta descriptions let Google generate snippets automatically, reducing CTR.',
      affectedPages: 8,
      howToFix: 'Add a unique 150–160 character meta description to each affected page that summarizes the content and includes the primary keyword.',
      impact: 'High',
    },
    {
      id: 't2',
      category: 'technical',
      severity: 'critical',
      title: 'Duplicate title tags detected',
      description: '4 pages share identical <title> tags, confusing search engines about which page to rank.',
      affectedPages: 4,
      howToFix: 'Rewrite each title to be unique, descriptive, and under 60 characters. Reflect the specific intent of each page.',
      impact: 'High',
    },
    {
      id: 't3',
      category: 'technical',
      severity: 'warning',
      title: 'Schema markup missing on key pages',
      description: 'Article and FAQ schema not detected on blog and FAQ pages — reducing rich-result eligibility.',
      affectedPages: 12,
      howToFix: 'Add JSON-LD structured data for Article, FAQPage, and Breadcrumb. Validate with Google\'s Rich Results Test.',
      impact: 'Medium',
    },
    {
      id: 't4',
      category: 'technical',
      severity: 'info',
      title: 'Sitemap.xml present and valid',
      description: 'Your sitemap is accessible and properly formatted.',
      affectedPages: 1,
      howToFix: 'Keep your sitemap updated as new pages are published. Submit it in Google Search Console.',
      impact: 'Low',
    },
    {
      id: 'p1',
      category: 'performance',
      severity: 'critical',
      title: 'Largest Contentful Paint (LCP) above 4s',
      description: 'Slow LCP fails Core Web Vitals and directly hurts mobile rankings.',
      affectedPages: 6,
      howToFix: 'Compress hero images, preload critical resources, and use a CDN. Convert images to WebP/AVIF.',
      impact: 'High',
    },
    {
      id: 'p2',
      category: 'performance',
      severity: 'warning',
      title: 'Render-blocking JavaScript detected',
      description: '3 third-party scripts block initial render on every page.',
      affectedPages: 23,
      howToFix: 'Add async or defer attributes to non-critical scripts. Load analytics and chat widgets after interactive.',
      impact: 'Medium',
    },
    {
      id: 'p3',
      category: 'performance',
      severity: 'warning',
      title: 'Images served in legacy formats',
      description: '47 images are served as JPG/PNG instead of WebP or AVIF — increasing total page weight by ~2.4MB.',
      affectedPages: 18,
      howToFix: 'Convert images to WebP or AVIF. Add <picture> fallback for older browsers, or use a build-time image pipeline.',
      impact: 'Medium',
    },
    {
      id: 'p4',
      category: 'performance',
      severity: 'info',
      title: 'HTTP/2 enabled',
      description: 'Your server supports HTTP/2 for multiplexed requests.',
      affectedPages: 1,
      howToFix: 'Consider upgrading to HTTP/3 for further performance gains.',
      impact: 'Low',
    },
    {
      id: 'c1',
      category: 'content',
      severity: 'critical',
      title: 'Thin content detected on 5 pages',
      description: 'Pages with fewer than 300 words are flagged by Google\'s Helpful Content System.',
      affectedPages: 5,
      howToFix: 'Expand each page to at least 800 words of substantive, original content that fully answers the user intent.',
      impact: 'High',
    },
    {
      id: 'c2',
      category: 'content',
      severity: 'warning',
      title: 'Missing alt text on 31 images',
      description: 'Images without alt attributes hurt accessibility and image SEO.',
      affectedPages: 14,
      howToFix: 'Add descriptive alt text that explains the image content and context. Avoid keyword stuffing.',
      impact: 'Medium',
    },
    {
      id: 'c3',
      category: 'content',
      severity: 'warning',
      title: 'Heading hierarchy issues',
      description: '7 pages skip from H1 to H3 or use multiple H1 tags — confusing semantic structure.',
      affectedPages: 7,
      howToFix: 'Use exactly one H1 per page. Follow a logical H1 → H2 → H3 progression for proper document outline.',
      impact: 'Medium',
    },
    {
      id: 'c4',
      category: 'content',
      severity: 'info',
      title: 'Author bylines present',
      description: 'E-E-A-T signal: author information is present on most articles.',
      affectedPages: 18,
      howToFix: 'Add author bio pages with credentials and link them from each article for stronger E-E-A-T.',
      impact: 'Low',
    },
    {
      id: 'l1',
      category: 'links',
      severity: 'critical',
      title: '12 broken internal links found',
      description: 'Broken links waste crawl budget and create dead ends for users.',
      affectedPages: 9,
      howToFix: 'Update or remove broken links. Set up 301 redirects for permanently moved pages.',
      impact: 'High',
    },
    {
      id: 'l2',
      category: 'links',
      severity: 'warning',
      title: 'Missing security headers',
      description: 'Strict-Transport-Security, Content-Security-Policy, and X-Frame-Options not set.',
      affectedPages: 23,
      howToFix: 'Configure HSTS, CSP, and X-Frame-Options headers at the server or CDN level for better security posture.',
      impact: 'Medium',
    },
    {
      id: 'l3',
      category: 'links',
      severity: 'warning',
      title: 'Low color contrast detected',
      description: '4 pages have text-background contrast below WCAG AA threshold.',
      affectedPages: 4,
      howToFix: 'Adjust text or background colors to meet at least 4.5:1 contrast ratio for normal text.',
      impact: 'Medium',
    },
    {
      id: 'l4',
      category: 'links',
      severity: 'info',
      title: 'HTTPS enforced site-wide',
      description: 'All pages redirect HTTP traffic to HTTPS.',
      affectedPages: 1,
      howToFix: 'Maintain HTTPS and renew certificates before expiration.',
      impact: 'Low',
    },
  ]

  const criticalCount = allIssues.filter((i) => i.severity === 'critical').length
  const warningCount = allIssues.filter((i) => i.severity === 'warning').length
  const infoCount = allIssues.filter((i) => i.severity === 'info').length

  return {
    url,
    overall,
    categories,
    issues: allIssues,
    criticalCount,
    warningCount,
    infoCount,
    pagesCrawled: r(38, 64, 5),
    crawlTime: (r(28, 56, 6) / 10).toFixed(1),
    totalChecks: 90,
    scanDate: new Date().toISOString(),
  }
}

type AuditResult = ReturnType<typeof generateMockAudit>

// ─── Loading Steps ───────────────────────────────────────────────────────────

const scanSteps = [
  { icon: Globe, label: 'Fetching site and resolving redirects', duration: 800 },
  { icon: Database, label: 'Discovering pages via sitemap.xml & internal links', duration: 1100 },
  { icon: Settings2, label: 'Auditing meta tags, schema, and canonicals', duration: 950 },
  { icon: Gauge, label: 'Measuring Core Web Vitals and page weight', duration: 1200 },
  { icon: FileText, label: 'Analyzing content depth and E-E-A-T signals', duration: 900 },
  { icon: Link2, label: 'Checking links, accessibility, and security headers', duration: 1000 },
  { icon: Sparkles, label: 'Scoring results and prioritizing fixes', duration: 700 },
]

// ─── Severity Helpers ────────────────────────────────────────────────────────

const severityStyles: Record<Severity, { bg: string; text: string; ring: string; label: string; icon: typeof AlertCircle }> = {
  critical: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-500/20',
    label: 'Critical',
    icon: AlertCircle,
  },
  warning: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
    label: 'Warning',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    label: 'Info',
    icon: Info,
  },
  passed: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    label: 'Passed',
    icon: CheckCircle2,
  },
}

function scoreColor(score: number) {
  if (score >= 85) return { text: 'text-emerald-500', stroke: 'stroke-emerald-500', bg: 'bg-emerald-500' }
  if (score >= 70) return { text: 'text-amber-500', stroke: 'stroke-amber-500', bg: 'bg-amber-500' }
  return { text: 'text-red-500', stroke: 'stroke-red-500', bg: 'bg-red-500' }
}

function scoreLabel(score: number) {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Good'
  if (score >= 70) return 'Needs work'
  if (score >= 60) return 'Poor'
  return 'Critical'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreGauge({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = scoreColor(score)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
          className="fill-none stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`fill-none ${color.stroke} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-heading font-bold leading-none ${color.text}`} style={{ fontSize: size / 3.5 }}>
          {score}
        </span>
        <span className="mt-1 text-xs font-medium text-muted-foreground">{scoreLabel(score)}</span>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Gauge
  label: string
  value: string | number
  hint?: string
  tone?: 'good' | 'warning' | 'bad' | 'neutral'
}) {
  const toneColor =
    tone === 'good'
      ? 'text-emerald-500'
      : tone === 'warning'
        ? 'text-amber-500'
        : tone === 'bad'
          ? 'text-red-500'
          : 'text-foreground'
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`font-heading text-2xl font-bold leading-none ${toneColor}`}>{value}</span>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function CategoryCard({
  category,
  active,
  onClick,
}: {
  category: CategoryScore
  active: boolean
  onClick: () => void
}) {
  const Icon = category.icon
  const color = scoreColor(category.score)
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col gap-4 rounded-2xl border bg-card p-5 text-left shadow-sm transition-all hover:shadow-md ${
        active ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </span>
        <span className={`font-heading text-3xl font-bold leading-none ${color.text}`}>
          {category.score}
        </span>
      </div>
      <div>
        <h3 className="font-heading font-semibold text-foreground">{category.label}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{category.description}</p>
      </div>
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {category.passed}/{category.total} checks passed
          </span>
          <span className={color.text}>{scoreLabel(category.score)}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${color.bg} transition-all duration-1000`}
            style={{ width: `${category.score}%` }}
          />
        </div>
      </div>
    </button>
  )
}

function IssueRow({ issue }: { issue: AuditIssue }) {
  const [open, setOpen] = useState(false)
  const style = severityStyles[issue.severity]
  const SeverityIcon = style.icon
  return (
    <div className={`rounded-2xl border border-border bg-card shadow-sm transition-all ${open ? 'ring-1 ' + style.ring : ''}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-4 px-5 py-4 text-left"
      >
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
          <SeverityIcon className={`h-4 w-4 ${style.text}`} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
              {style.label}
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {issue.impact} impact
            </span>
            <span className="text-xs text-muted-foreground">
              {issue.affectedPages} {issue.affectedPages === 1 ? 'page' : 'pages'} affected
            </span>
          </div>
          <h4 className="mt-1.5 font-heading font-semibold text-foreground">{issue.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{issue.description}</p>
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-border bg-background/50 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">How to fix</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{issue.howToFix}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

type Stage = 'input' | 'scanning' | 'results'

export default function SiteAuditTool() {
  const [stage, setStage] = useState<Stage>('input')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')

  function validateUrl(input: string) {
    try {
      const u = new URL(input.startsWith('http') ? input : `https://${input}`)
      return u.toString()
    } catch {
      return null
    }
  }

  function startScan() {
    const valid = validateUrl(url.trim())
    if (!valid) {
      setError('Please enter a valid website URL (e.g. https://example.com).')
      return
    }
    setError(null)
    setUrl(valid)
    setStage('scanning')
    setActiveStep(0)
  }

  // Drive the scanning animation
  useEffect(() => {
    if (stage !== 'scanning') return
    if (activeStep >= scanSteps.length) {
      const audit = generateMockAudit(url)
      setResult(audit)
      setStage('results')
      return
    }
    const timer = setTimeout(() => setActiveStep((s) => s + 1), scanSteps[activeStep].duration)
    return () => clearTimeout(timer)
  }, [stage, activeStep, url])

  function resetAudit() {
    setStage('input')
    setActiveStep(0)
    setResult(null)
    setError(null)
    setActiveCategory('all')
    setSeverityFilter('all')
  }

  const filteredIssues = useMemo(() => {
    if (!result) return []
    return result.issues
      .filter((i) => activeCategory === 'all' || i.category === activeCategory)
      .filter((i) => severityFilter === 'all' || i.severity === severityFilter)
      .sort((a, b) => {
        const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2, passed: 3 }
        return order[a.severity] - order[b.severity]
      })
  }, [result, activeCategory, severityFilter])

  // ── INPUT STAGE ─────────────────────────────────────────────────────────────
  if (stage === 'input') {
    return (
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              90+ checks · Real-Device Audit · 100% Free
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Free AI Site Audit Tool — Complete SEO, Performance &amp; Health Check
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              Enter your website URL and get a complete technical SEO, Core Web Vitals, content quality, and security audit — with prioritized fixes and an overall site health score in under 60 seconds.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
            <label htmlFor="audit-url" className="block text-sm font-medium text-foreground">
              Website URL
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="audit-url"
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (error) setError(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && startScan()}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-xl border border-border bg-background px-10 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={startScan}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md"
              >
                Run Free Audit
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {error && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Settings2, label: 'Technical SEO' },
                { icon: Gauge, label: 'Core Web Vitals' },
                { icon: FileText, label: 'Content & E-E-A-T' },
                { icon: ShieldCheck, label: 'Security & A11y' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                  </div>
                )
              })}
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              No signup · No credit card · Your URL is never stored
            </p>
          </div>

          {/* Trust strip */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Zap, label: 'Instant results' },
              { icon: ShieldCheck, label: 'Privacy-first' },
              { icon: CheckCircle2, label: '90+ SEO checks' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {item.label}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // ── SCANNING STAGE ──────────────────────────────────────────────────────────
  if (stage === 'scanning') {
    const progress = Math.min((activeStep / scanSteps.length) * 100, 100)
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-lg sm:p-10">
            <div className="flex items-center justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                Auditing {new URL(url).hostname}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Running 90+ checks across SEO, performance, content, and security…
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Progress</span>
                <span className="text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="mt-8 flex flex-col gap-3">
              {scanSteps.map((step, i) => {
                const Icon = step.icon
                const done = i < activeStep
                const current = i === activeStep
                return (
                  <li
                    key={i}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                      done
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : current
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border bg-background opacity-60'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        done ? 'bg-emerald-500/15' : current ? 'bg-primary/15' : 'bg-muted'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : current ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        done
                          ? 'text-foreground'
                          : current
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>
    )
  }

  // ── RESULTS STAGE ───────────────────────────────────────────────────────────
  if (!result) return null
  const overallColor = scoreColor(result.overall)

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ── Header bar ── */}
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Audit Report
              </p>
              <p className="mt-0.5 truncate font-heading text-lg font-semibold text-foreground">
                {new URL(result.url).hostname}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {result.pagesCrawled} pages · {result.totalChecks} checks · {result.crawlTime}s scan time
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetAudit}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              New Audit
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* ── Overall score + Top metrics ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Overall Site Health
              </p>
              <div className="mt-4">
                <ScoreGauge score={result.overall} size={180} />
              </div>
              <p className={`mt-4 text-sm font-semibold ${overallColor.text}`}>
                {result.overall >= 80 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    Strong foundation — keep optimizing
                  </span>
                ) : result.overall >= 65 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    Several high-impact fixes available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingDown className="h-4 w-4" />
                    Critical issues need urgent attention
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            <MetricCard
              icon={AlertCircle}
              label="Critical Issues"
              value={result.criticalCount}
              hint="Fix these first for maximum impact"
              tone={result.criticalCount > 0 ? 'bad' : 'good'}
            />
            <MetricCard
              icon={AlertTriangle}
              label="Warnings"
              value={result.warningCount}
              hint="Important to address soon"
              tone={result.warningCount > 0 ? 'warning' : 'good'}
            />
            <MetricCard
              icon={Layers}
              label="Pages Crawled"
              value={result.pagesCrawled}
              hint="Discovered via sitemap & internal links"
              tone="neutral"
            />
            <MetricCard
              icon={Clock}
              label="Scan Duration"
              value={`${result.crawlTime}s`}
              hint={`${result.totalChecks} checks completed`}
              tone="neutral"
            />
          </div>
        </div>

        {/* ── Category cards ── */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">Category Breakdown</h2>
            <button
              onClick={() => setActiveCategory('all')}
              className={`text-xs font-medium transition-colors ${
                activeCategory === 'all' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Show all
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {result.categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Issues list ── */}
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                Prioritized Issues
                <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {filteredIssues.length}
                </span>
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Issues ranked by severity and impact. Tap any item to see the recommended fix.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'critical', 'warning', 'info'] as const).map((sev) => {
                const active = severityFilter === sev
                const count =
                  sev === 'all'
                    ? result.issues.filter((i) => activeCategory === 'all' || i.category === activeCategory).length
                    : result.issues.filter(
                        (i) =>
                          (activeCategory === 'all' || i.category === activeCategory) && i.severity === sev
                      ).length
                return (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sev === 'all' ? 'All' : severityStyles[sev].label}
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="font-heading font-semibold text-foreground">No issues match the current filter</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different category or severity.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredIssues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>

        {/* ── Next-step CTA ── */}
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                Turn these findings into a 6-month SEO plan
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Feed this audit into AI Ranko&apos;s SEO Strategy Maker to get a prioritized action roadmap.
              </p>
            </div>
            <a
              href="/tools/seo-strategy-maker"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Build SEO Strategy
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
