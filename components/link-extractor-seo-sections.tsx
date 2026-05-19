import {
  Globe,
  Map,
  Link2,
  ExternalLink,
  EyeOff,
  FileText,
  Download,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Layers,
  Wrench,
  Monitor,
  X,
  Check,
  ChevronDown,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Globe,
    step: '01',
    title: 'Enter Your URL',
    desc: 'Paste any website URL into the tool and hit "Crawl Site." No login, no setup, no extensions required.',
  },
  {
    icon: Filter,
    step: '02',
    title: 'Crawl & Filter',
    desc: 'We crawl up to 500 pages across depth levels, auto-detect sitemap.xml and robots.txt, and let you filter by internal, external, nofollow, or file links.',
  },
  {
    icon: Download,
    step: '03',
    title: 'Export Instantly',
    desc: 'Your full link inventory is ready in seconds. Download it as CSV, TXT, or JSON — with source pages and occurrence counts included.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Search,
    title: 'Whole-Site Crawling',
    desc: 'Crawl up to 500 pages in a single run — not just the homepage. Every linked page is discovered and scanned automatically.',
  },
  {
    icon: Map,
    title: 'Sitemap Discovery',
    desc: 'Auto-detects sitemap.xml and robots.txt to surface URLs that aren\'t linked from any visible page.',
  },
  {
    icon: Link2,
    title: 'Internal Link Filter',
    desc: 'Instantly isolate all internal links across your site. Perfect for auditing site structure and crawl depth.',
  },
  {
    icon: ExternalLink,
    title: 'External Link Filter',
    desc: 'Find every outbound link across your entire website. Identify where your link equity is flowing in seconds.',
  },
  {
    icon: EyeOff,
    title: 'Nofollow Detection',
    desc: 'Spot nofollow-tagged links instantly. Essential for accurate link equity analysis and SEO audits.',
  },
  {
    icon: FileText,
    title: 'File Link Extraction',
    desc: 'Surfaces PDF, DOC, and other file-type links buried deep within your pages — often missed by basic crawlers.',
  },
  {
    icon: Download,
    title: 'Export to CSV / JSON / TXT',
    desc: 'Download your complete link inventory with source page URLs and occurrence counts — ready for any SEO workflow.',
  },
  {
    icon: ShieldCheck,
    title: '100% Private & Secure',
    desc: 'All crawling happens server-side and no data is ever stored. Your audit stays completely confidential.',
  },
]

// ─── Why Link Audits Matter ──────────────────────────────────────────────────

const whyPoints = [
  { icon: Wrench, text: 'Find and fix broken internal links before they hurt rankings' },
  { icon: Layers, text: 'Discover orphan pages that aren\'t linked from anywhere on your site' },
  { icon: ExternalLink, text: 'Audit external links for toxic, lost, or irrelevant connections' },
  { icon: TrendingUp, text: 'Strengthen internal linking for better crawlability and indexation' },
  { icon: EyeOff, text: 'Analyze nofollow usage to protect and distribute link equity correctly' },
  { icon: Monitor, text: 'No software installation required — works instantly in your browser' },
  { icon: CheckCircle2, text: 'Works on all devices and browsers — desktop, tablet, or mobile' },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  screamingfrog: boolean | string
  ahrefs: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, screamingfrog: 'Limited', ahrefs: 'Limited' },
  { feature: 'No signup required', airanko: true, screamingfrog: true, ahrefs: false },
  { feature: 'Crawl up to 500 pages', airanko: true, screamingfrog: '500 (free)', ahrefs: 'Paid only' },
  { feature: 'Sitemap discovery', airanko: true, screamingfrog: true, ahrefs: true },
  { feature: 'Export CSV / JSON / TXT', airanko: true, screamingfrog: 'Limited', ahrefs: 'Paid only' },
  { feature: 'Nofollow detection', airanko: true, screamingfrog: true, ahrefs: 'Paid only' },
  { feature: 'File link extraction', airanko: true, screamingfrog: true, ahrefs: 'Paid only' },
  { feature: 'No data stored', airanko: true, screamingfrog: false, ahrefs: false },
  { feature: 'Works in browser', airanko: true, screamingfrog: false, ahrefs: true },
  { feature: 'No watermark', airanko: true, screamingfrog: true, ahrefs: 'Paid only' },
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
    q: 'What is a link extractor and what does it do?',
    a: 'A link extractor crawls a website and collects every URL found across its pages. It identifies internal links, external links, nofollow links, and file links — all in one audit.',
  },
  {
    q: 'How many pages can this tool crawl?',
    a: "Ai Ranko's Link Extractor crawls up to 500 pages per run, across a depth of 3 levels. It also scans sitemap.xml and robots.txt to find URLs not linked from any visible page.",
  },
  {
    q: 'Do I need to create an account to use this tool?',
    a: 'No. The Link Extractor is 100% free with no signup, no login, and no subscription required. Just paste your URL and hit crawl.',
  },
  {
    q: 'What export formats are supported?',
    a: 'You can download your full link inventory in CSV, TXT, or JSON format. Each export includes source page URLs and occurrence counts for every link found.',
  },
  {
    q: 'Can it detect nofollow links?',
    a: 'Yes. The tool automatically identifies and flags nofollow-tagged links across all crawled pages — essential for accurate link equity analysis and SEO audits.',
  },
  {
    q: 'Is this tool safe to use? Is my data stored?',
    a: 'All crawling happens server-side and no data is ever stored on our servers. Your link audit stays completely private and confidential.',
  },
  {
    q: 'Can I use this tool to find broken links?',
    a: 'Yes. By extracting all internal and external links across your site, you can cross-reference them to identify broken or dead URLs that may be hurting your SEO.',
  },
  {
    q: 'Does it work on all websites?',
    a: 'The tool works on any publicly accessible website. Password-protected, login-gated, or JavaScript-heavy sites may have limited crawl results.',
  },
  {
    q: 'How is Ai Ranko different from Screaming Frog?',
    a: "Ai Ranko is fully browser-based — no installation needed. It's free, stores no data, and requires zero setup. Screaming Frog's free version is limited and requires a desktop download.",
  },
  {
    q: 'Does this tool work on mobile devices?',
    a: "Yes. Ai Ranko's Link Extractor works on all devices and browsers — desktop, tablet, and mobile — with no performance difference.",
  },
]

export default function LinkExtractorSeoSections() {
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
              Three simple steps to crawl, extract, and export every link from any website.
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
              Everything you need for a complete link audit — in one free tool.
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

      {/* ── Why Link Audits Matter ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                Why Link Audits Matter
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed text-pretty">
                Broken links, lost link equity, and weak internal structure silently damage your SEO. This tool surfaces every issue — before Google does.
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
              See why Ai Ranko&apos;s Link Extractor outperforms the rest.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-5 py-4 text-left font-heading font-semibold text-foreground w-2/5">
                    Feature
                  </th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-primary w-1/5">
                    AI Ranko
                  </th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-muted-foreground w-1/5">
                    Screaming Frog
                  </th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-muted-foreground w-1/5">
                    Ahrefs
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-card' : 'bg-background'}`}
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center">
                      <ComparisonCell value={row.airanko} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <ComparisonCell value={row.screamingfrog} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <ComparisonCell value={row.ahrefs} />
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
            The Fastest Way to Extract Every Link From Any Website
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Whether you need a quick <strong className="text-foreground">link extractor online</strong> to audit a client site, or want to crawl a full website for a technical SEO review, Ai Ranko handles it all in one place. No downloads, no subscriptions — just paste a URL and get results instantly.
            </p>
            <p>
              Internal linking is one of the highest-impact SEO factors most teams overlook. With Ai Ranko&apos;s <strong className="text-foreground">internal link checker</strong>, you can map your entire site structure, spot orphan pages, and fix crawl gaps — all without touching a single line of code.
            </p>
            <p>
              External links shape how Google evaluates your site&apos;s trust and authority. Our <strong className="text-foreground">external link extractor</strong> scans every page and surfaces all outbound connections, so you can identify toxic links, lost partnerships, or unintentional nofollow tags before they cost you rankings.
            </p>
            <p>
              Unlike desktop crawlers that require installation and eat your system resources, everything here runs directly in your browser. Your data is never stored on our servers — making it the fastest, most private <strong className="text-foreground">website link crawler</strong> built for SEO professionals, developers, and site owners alike.
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
              Everything you need to know about Ai Ranko&apos;s free Link Extractor tool.
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
