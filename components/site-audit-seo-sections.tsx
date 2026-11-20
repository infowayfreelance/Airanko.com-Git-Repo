import Link from 'next/link'
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
    title: 'AI Runs 25+ Checks',
    desc: 'Our engine crawls up to 15 pages of your site and runs 25+ checks across SEO, performance, accessibility, mobile and content, usually in 30–60 seconds.',
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
    desc: 'Checks titles, meta descriptions, canonicals, JSON-LD presence, sitemap.xml, robots.txt availability and HTTPS.',
  },
  {
    icon: Gauge,
    title: 'Page Fetch Performance',
    desc: 'Records server-side HTML fetch time and response size, and flags slow or heavy HTML responses.',
  },
  {
    icon: FileText,
    title: 'Content & Heading Checks',
    desc: 'Checks word count and H1 usage to flag short pages, missing main headings and multiple H1 headings.',
  },
  {
    icon: Link2,
    title: 'Internal & External Link Counts',
    desc: 'Counts internal and external links on crawled pages and flags weak internal linking across the sample.',
  },
  {
    icon: ShieldCheck,
    title: 'HTTPS & Accessibility Basics',
    desc: 'Checks HTTPS, image alt text and the HTML language attribute. These are basic checks, not a full accessibility audit.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Viewport Check',
    desc: 'Checks for a viewport meta tag. The audit reads HTML and does not render pages on a mobile device.',
  },
  {
    icon: AlertCircle,
    title: 'Prioritized Issue List',
    desc: 'Every issue is ranked by severity (Critical / Warning / Info) and impact (High / Medium / Low) — so you know exactly what to fix first.',
  },
  {
    icon: Sparkles,
    title: 'Fix Instructions & AI Summary',
    desc: 'Each issue includes predefined fix instructions. GPT-4o mini adds a summary and top recommendations when available.',
  },
]

// ─── Why Site Audits Matter ──────────────────────────────────────────────────

const whyPoints = [
  { icon: Search, text: 'Find missing titles, descriptions and canonicals' },
  { icon: TrendingUp, text: 'Identify slow HTML fetches and heavy responses' },
  { icon: Target, text: 'Check sitemap and robots.txt availability' },
  { icon: AlertCircle, text: 'Review internal and external link counts' },
  { icon: Layers, text: 'Review word count and main heading usage' },
  { icon: ShieldCheck, text: 'Check HTTPS and basic accessibility signals' },
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
  { feature: 'AI-powered fix suggestions', airanko: true, semrush: 'Partial', ahrefs: false, screamingfrog: false },
  { feature: 'Prioritized issue list', airanko: true, semrush: true, ahrefs: true, screamingfrog: 'Partial' },
  { feature: 'Works in browser — no install', airanko: true, semrush: true, ahrefs: true, screamingfrog: false },
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

export const siteAuditFaqs = [
  {
    "q": "What is a site audit tool?",
    "a": "A site audit tool reads website pages and checks their SEO, performance, accessibility, mobile and content signals. Ai Ranko runs 25+ checks and metrics across up to 15 pages and provides a prioritised list of issues with fix instructions."
  },
  {
    "q": "Is the site audit tool really free?",
    "a": "Yes. The audit is free to use with no signup, subscription or credit card required. Each audit crawls up to 15 pages."
  },
  {
    "q": "How long does a site audit take?",
    "a": "An audit usually takes 30\u201360 seconds, depending on the pages and server response times. Slow or unavailable websites can take longer."
  },
  {
    "q": "What does the site audit actually check?",
    "a": "It checks titles, meta descriptions, H1 usage, canonicals, JSON-LD and Open Graph presence, image alt text, language and viewport tags, word count, link counts, HTTPS, and robots.txt and sitemap availability. It also records HTML fetch time and response size. It does not measure Core Web Vitals, evaluate E-E-A-T or test security headers."
  },
  {
    "q": "How is this different from Google Search Console?",
    "a": "Search Console shows Google search clicks, impressions and indexing reports. The audit checks the pages themselves for on-page, technical and basic performance issues. They work best together."
  },
  {
    "q": "Can the audit confirm whether Google has indexed my pages?",
    "a": "No. The audit does not connect to Google Search Console or verify Google indexing. Use Search Console to investigate indexing and search performance."
  },
  {
    "q": "Will my data be stored or shared?",
    "a": "The audit endpoint does not save reports to a database. Crawling happens on the server, and a summary of the URL and findings is sent to OpenAI for the AI summary and recommendations. Infrastructure and AI provider logging or retention may apply."
  },
  {
    "q": "Can I audit competitor websites?",
    "a": "You can enter a publicly accessible competitor URL to review the same page signals. The audit does not measure their backlinks, traffic or search rankings."
  },
  {
    "q": "Do I need SEO experience to understand the report?",
    "a": "No. Each issue includes a plain-language description, severity, estimated impact and predefined How to fix instructions. Review the evidence before making changes."
  },
  {
    "q": "How is Ai Ranko's audit different from Screaming Frog?",
    "a": "Ai Ranko starts in your browser and crawls up to 15 pages on the server. It provides a limited report with predefined fixes and an AI summary. Use a full-site crawler when you need wider coverage."
  },
  {
    "q": "How many pages does the AI SEO audit crawl?",
    "a": "Up to 15 pages per audit, starting from the URL you enter. The tool discovers more URLs from a sitemap, or falls back to internal links on the starting page."
  },
  {
    "q": "Will running an audit affect my Google rankings?",
    "a": "The audit reads public pages and does not edit your website or submit changes to Google. It fetches robots.txt to find sitemap references and check availability, but does not enforce its crawl directives."
  },
  {
    "q": "Can I export the audit report?",
    "a": "Yes. Use the JSON export button to download the report as a JSON file to share with your developer or keep for comparison."
  },
  {
    "q": "Which AI writes the recommendations?",
    "a": "GPT-4o mini writes the summary and top recommendations from the audit findings when available. Individual issue fixes are predefined in the audit code. If the AI request fails, the tool uses a generated summary and the predefined fixes."
  }
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
              25+ checks across SEO, performance, accessibility, mobile and content, in one free AI audit.
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
                Missing metadata, slow HTML responses and short pages can be easy to overlook. A limited crawl helps you find practical improvements to investigate and prioritise.
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
              Compare the supported audit features below.
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
                    Ai Ranko
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
            Run a Free AI SEO Audit from Your Browser
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>Ai Ranko&apos;s <strong className="text-foreground">free SEO audit</strong> runs 25+ checks on up to 15 pages and delivers a prioritised action plan, usually in 30–60 seconds. Each issue includes severity, estimated impact and predefined fix instructions. GPT-4o mini adds a summary and top recommendations when available.</p>
            <p>There&apos;s nothing to install: you start it from your browser and our server crawls the pages. The audit endpoint does not save reports to a database. A summary of the URL and findings is sent to OpenAI for AI recommendations.</p>
            <p>Use this initial review to identify changes to investigate on your own site or a publicly accessible competitor site. Larger websites need a wider crawl and manual checks.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">What the AI SEO Audit Checks, and What It Doesn&apos;t</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">Ai Ranko crawls up to 15 pages from your starting URL, using a sitemap when available or internal links as a fallback. Its 25+ checks and metrics cover SEO, HTML fetch performance, accessibility basics, mobile viewport settings and content signals. Every reported issue includes predefined fix instructions.</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">It does not access your Google Search Console data, measure backlinks, render mobile pages, measure Core Web Vitals, test security headers or score E-E-A-T. The 15-page cap also means it cannot cover every URL on a large site. It checks robots.txt availability and sitemap references but does not enforce crawl directives.</p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">How to Read Your Audit Report</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">Each issue has a severity and estimated impact. Start with critical, high-impact findings such as missing titles or descriptions, then review warnings and minor notes. The report includes affected URLs and predefined How to fix instructions. Review the AI summary and top recommendations alongside that evidence.</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">Export the full report as JSON to share it with your developer or keep a record before and after changes. For a walkthrough, read <Link href="/blog/how-to-run-a-free-seo-site-audit" className="font-semibold text-primary hover:underline">how to run a free SEO site audit</Link>.</p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">When to Run a Website Audit</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">Run an audit before and after a redesign or migration, after publishing new pages, when traffic drops without an obvious reason, and as a monthly or quarterly review. You can also review a publicly accessible competitor site to compare the same page signals.</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">Use the <Link href="/tools/meta-checker" className="font-semibold text-primary hover:underline">Meta Checker to check meta tags and Open Graph</Link>, create an <Link href="/tools/xml-sitemap-generator" className="font-semibold text-primary hover:underline">XML sitemap</Link> or an <Link href="/tools/html-sitemap-generator" className="font-semibold text-primary hover:underline">HTML sitemap</Link>, and <Link href="/tools/link-extractor" className="font-semibold text-primary hover:underline">extract all links on a page</Link>. Follow up with the <Link href="/tools/mobile-checker" className="font-semibold text-primary hover:underline">Mobile Checker</Link> and <Link href="/tools/seo-strategy-maker" className="font-semibold text-primary hover:underline">turn the fixes into an SEO strategy</Link>.</p>
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
              Everything you need to know about Ai Ranko&apos;s free site audit tool.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {siteAuditFaqs.map((faq, i) => (
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
