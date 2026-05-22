import {
  Globe,
  Cpu,
  ClipboardCheck,
  Settings2,
  Gauge,
  FileText,
  Link2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Target,
  Search,
  Clock,
  Layers,
  Zap,
  X,
  Check,
  ChevronDown,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Globe,
    step: '01',
    title: 'Enter Your Website URL',
    desc: 'Paste any website URL into the audit field. Works on your own site or any competitor — no signup, no extension, no setup.',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI Runs 90+ Checks',
    desc: 'Our engine crawls your site, audits technical SEO, measures Core Web Vitals, scores content quality, and validates security headers in under 60 seconds.',
  },
  {
    icon: ClipboardCheck,
    step: '03',
    title: 'Get Your Action Plan',
    desc: 'Receive a complete site health score with prioritized fixes — severity, impact, and step-by-step instructions for every issue found.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Settings2,
    title: 'Technical SEO Audit',
    desc: 'Audits meta tags, canonicals, hreflang, schema markup, sitemap.xml, robots.txt, HTTPS, redirects, and indexability — 26 technical checks per page.',
  },
  {
    icon: Gauge,
    title: 'Core Web Vitals & Performance',
    desc: 'Measures LCP, CLS, and INP estimates, detects render-blocking resources, oversized images, and missing caching headers.',
  },
  {
    icon: FileText,
    title: 'Content & E-E-A-T Scoring',
    desc: 'Scores content depth, readability, keyword usage, heading hierarchy, alt text coverage, and author/E-E-A-T signals against Google\'s guidelines.',
  },
  {
    icon: Link2,
    title: 'Link Health Check',
    desc: 'Finds broken internal links, audits external links, maps your internal link graph, and flags orphan pages hurting crawlability.',
  },
  {
    icon: ShieldCheck,
    title: 'Security & Accessibility',
    desc: 'Validates HTTPS, security headers (HSTS, CSP, X-Frame-Options), mixed content, and WCAG accessibility issues like color contrast.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Indexing Ready',
    desc: 'Every check runs against the mobile rendering of your pages — the version Google uses for indexing and ranking decisions.',
  },
  {
    icon: AlertCircle,
    title: 'Prioritized Issue List',
    desc: 'Every issue is ranked by severity (Critical / Warning / Info) and impact (High / Medium / Low) — so you know exactly what to fix first.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Fix Suggestions',
    desc: 'Each issue includes a clear, actionable "How to fix" recommendation — written for marketers, not just developers.',
  },
]

// ─── Why Site Audits Matter ──────────────────────────────────────────────────

const whyPoints = [
  { icon: Search, text: 'Find ranking-killing technical issues before Google does' },
  { icon: TrendingUp, text: 'Improve Core Web Vitals — a confirmed Google ranking factor' },
  { icon: Target, text: 'Discover crawl gaps, orphan pages, and indexation problems' },
  { icon: AlertCircle, text: 'Catch broken links, redirect chains, and 404 errors instantly' },
  { icon: Layers, text: 'Score content quality against E-E-A-T and Helpful Content guidelines' },
  { icon: ShieldCheck, text: 'Validate security headers and HTTPS configuration' },
  { icon: Clock, text: 'Run unlimited audits — no monthly limits or per-page charges' },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  semrush: boolean | string
  ahrefs: boolean | string
  screamingfrog: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, semrush: 'Limited', ahrefs: 'Limited', screamingfrog: 'Limited' },
  { feature: 'No signup required', airanko: true, semrush: false, ahrefs: false, screamingfrog: true },
  { feature: 'Technical SEO audit', airanko: true, semrush: true, ahrefs: true, screamingfrog: true },
  { feature: 'Core Web Vitals scoring', airanko: true, semrush: true, ahrefs: 'Partial', screamingfrog: 'Partial' },
  { feature: 'E-E-A-T content scoring', airanko: true, semrush: false, ahrefs: false, screamingfrog: false },
  { feature: 'AI-powered fix suggestions', airanko: true, semrush: 'Partial', ahrefs: false, screamingfrog: false },
  { feature: 'Prioritized issue list', airanko: true, semrush: true, ahrefs: true, screamingfrog: 'Partial' },
  { feature: 'Security header audit', airanko: true, semrush: false, ahrefs: false, screamingfrog: true },
  { feature: 'Accessibility (WCAG) checks', airanko: true, semrush: false, ahrefs: false, screamingfrog: 'Partial' },
  { feature: 'Works in browser — no install', airanko: true, semrush: true, ahrefs: true, screamingfrog: false },
  { feature: 'No data stored', airanko: true, semrush: false, ahrefs: false, screamingfrog: true },
  { feature: 'Unlimited audits', airanko: true, semrush: 'Paid only', ahrefs: 'Paid only', screamingfrog: 'Paid only' },
]

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-3.5 w-3.5 text-primary" />
        </span>
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
      </span>
    )
  }
  return (
    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{value}</span>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'What is a site audit tool?',
    a: 'A site audit tool is software that crawls a website and analyzes it across technical SEO, performance, content quality, and security factors — surfacing issues that hurt rankings, user experience, and conversions. AI Ranko\'s tool runs 90+ checks per site and delivers a prioritized action plan.',
  },
  {
    q: 'Is the site audit tool really free?',
    a: 'Yes — completely free with no credit card, no subscription, and no signup required. Unlike Semrush or Ahrefs, there are no monthly audit limits or paywalls on any feature.',
  },
  {
    q: 'How long does a site audit take?',
    a: 'Most audits finish in under 60 seconds. The tool crawls your sitemap and internal links, runs all 90+ checks in parallel, and renders your full report instantly — no waiting.',
  },
  {
    q: 'What does the site audit actually check?',
    a: 'The audit covers four categories: (1) Technical SEO — meta tags, schema, canonicals, sitemap, robots.txt. (2) Performance — Core Web Vitals, render-blocking resources, image weight. (3) Content & E-E-A-T — depth, readability, heading structure, author signals. (4) Links, accessibility & security — broken links, security headers, WCAG checks.',
  },
  {
    q: 'How is this different from Google Search Console?',
    a: 'Google Search Console only shows issues Google\'s crawler reports after the fact. AI Ranko\'s site audit proactively tests your site in real time — including issues Search Console never reports, like content thinness, E-E-A-T gaps, or accessibility problems.',
  },
  {
    q: 'Does the tool follow Google\'s 2025 ranking guidelines?',
    a: 'Yes. Every check is aligned with Google\'s latest E-E-A-T framework, Helpful Content System, Core Web Vitals thresholds, and 2024–2025 spam policies. We update the audit engine as Google publishes new guidance.',
  },
  {
    q: 'Will my data be stored or shared?',
    a: 'No. All crawling happens server-side in real time. URLs are never logged, stored, or shared with third parties. Your audit stays completely private.',
  },
  {
    q: 'Can I audit competitor websites?',
    a: 'Yes — you can audit any publicly accessible website, including competitors. It\'s the fastest way to benchmark your site against industry leaders and find gaps you can exploit.',
  },
  {
    q: 'Do I need SEO experience to understand the report?',
    a: 'No. Every issue includes a plain-language description and a step-by-step "How to fix" recommendation. The tool is designed for marketers, founders, and content creators — not just technical SEOs.',
  },
  {
    q: 'How is AI Ranko\'s audit different from Screaming Frog?',
    a: 'Screaming Frog is a desktop application that requires installation, eats system resources, and limits free use to 500 URLs. AI Ranko runs entirely in your browser, has no install or signup, includes AI-powered fix suggestions, and adds modern checks Screaming Frog doesn\'t cover — like E-E-A-T scoring and accessibility audits.',
  },
]

export default function SiteAuditSeoSections() {
  return (
    <div className="border-t border-border bg-background">

      {/* ── How It Works ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Three simple steps to audit your website and get a complete SEO action plan.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.step}
                  className="relative flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <span className="font-heading text-4xl font-bold text-primary/15 select-none leading-none">
                    {s.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Key Features
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              90+ checks across four critical SEO dimensions — in one free, AI-powered audit.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Why Site Audits Matter ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                Why Site Audits Matter
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed text-pretty">
                Most ranking problems hide in plain sight — slow pages, broken links, thin content, missing schema, weak E-E-A-T signals. A complete audit surfaces every silent issue before it costs you traffic, conversions, and revenue.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {whyPoints.map((b) => {
                const Icon = b.icon
                return (
                  <li
                    key={b.text}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{b.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              How We Compare
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              See why AI Ranko&apos;s site audit beats the paid tools — for free.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-4 text-left font-heading font-semibold text-foreground w-[28%]">
                    Feature
                  </th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-primary w-[18%]">
                    AI Ranko
                  </th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[18%]">
                    Semrush
                  </th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[18%]">
                    Ahrefs
                  </th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[18%]">
                    Screaming Frog
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-card' : 'bg-background'}`}
                  >
                    <td className="px-4 py-3.5 font-medium text-foreground">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.airanko} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.semrush} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.ahrefs} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.screamingfrog} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SEO Content Block ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
            The Smartest Way to Run a Full Site Audit — Free, Fast &amp; AI-Powered
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              A <strong className="text-foreground">site audit tool</strong> systematically crawls a website and evaluates it against hundreds of SEO, performance, content, and security signals — surfacing the exact issues hurting your rankings. Without a regular audit, technical debt accumulates silently: meta tags rot, schema breaks, pages slow down, and links die — and Google notices long before you do.
            </p>
            <p>
              AI Ranko&apos;s <strong className="text-foreground">free SEO audit</strong> runs 90+ checks across four critical dimensions — technical SEO, Core Web Vitals, content quality, and security — and delivers a prioritized action plan in under 60 seconds. Every issue includes severity, impact, and a clear &quot;how to fix&quot; recommendation written in plain English.
            </p>
            <p>
              Unlike Semrush or Ahrefs, there&apos;s no monthly limit, no per-audit charge, and no learning curve. Unlike Screaming Frog, there&apos;s nothing to install and no system resources eaten. It runs entirely in your browser, stores no data, and delivers a <strong className="text-foreground">complete website health check</strong> the moment you paste a URL.
            </p>
            <p>
              Whether you&apos;re auditing your own site, benchmarking a competitor, or preparing a client report, AI Ranko gives you the same depth as paid enterprise tools — without the price tag or complexity. It&apos;s the fastest, most complete <strong className="text-foreground">technical SEO audit tool</strong> available online in 2025.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Everything you need to know about AI Ranko&apos;s free site audit tool.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-background shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-heading font-semibold text-foreground hover:text-primary transition-colors">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
