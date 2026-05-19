import {
  Globe,
  KeySquare,
  BarChart2,
  CalendarDays,
  Settings2,
  Map,
  Upload,
  SlidersHorizontal,
  FileText,
  Target,
  TrendingUp,
  Wrench,
  BookOpen,
  Layers,
  Clock,
  BadgeDollarSign,
  CheckCircle2,
  X,
  Check,
  ChevronDown,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Globe,
    step: '01',
    title: 'Enter Your Website',
    desc: 'Drop in your website URL and business name. Our AI instantly crawls your site — meta tags, internal pages, sitemap, schema markup, and robots.txt — all analyzed automatically.',
  },
  {
    icon: KeySquare,
    step: '02',
    title: 'Add Keywords & Competitors',
    desc: 'Enter your target keywords and optionally add competitor URLs. AI Ranko benchmarks your site against the competition to find ranking gaps and opportunities.',
  },
  {
    icon: FileText,
    step: '03',
    title: 'Get Your Full SEO Strategy',
    desc: 'Receive a complete, client-ready SEO plan in seconds. Includes keyword strategy, content calendar, technical checklist, and a 6-month action roadmap — ready to execute.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Globe,
    title: 'Auto Site Crawl',
    desc: 'No manual audits needed. AI crawls your entire site — meta tags, schema, sitemap, and robots.txt — and flags every issue instantly.',
  },
  {
    icon: Target,
    title: 'Keyword Strategy',
    desc: 'Get a targeted keyword list based on your niche and business. Focus on terms that drive real organic traffic — not just high-volume guesses.',
  },
  {
    icon: BarChart2,
    title: 'Competitor Analysis',
    desc: 'Add competitor URLs and let AI benchmark your site against them. Discover ranking gaps, content opportunities, and where you\'re losing traffic.',
  },
  {
    icon: CalendarDays,
    title: 'Content Calendar',
    desc: 'Stop wondering what to publish next. Get a structured, topic-ready content calendar aligned with your target keywords and search intent.',
  },
  {
    icon: Settings2,
    title: 'Technical SEO Checklist',
    desc: 'Uncover hidden technical issues holding your rankings back. Get a prioritized checklist of fixes — from page speed to structured data.',
  },
  {
    icon: Map,
    title: '6-Month SEO Roadmap',
    desc: 'No more guessing where to start. Get a clear, month-by-month action plan built around your goals, competition, and current site health.',
  },
]

// ─── Why Your Business Needs an SEO Strategy ────────────────────────────────

const whyPoints = [
  { icon: Target, text: 'Rank for the right keywords — not just any keywords' },
  { icon: TrendingUp, text: 'Outperform competitors who are already targeting your audience' },
  { icon: Wrench, text: 'Fix technical issues that silently kill your search rankings' },
  { icon: BookOpen, text: 'Publish content that matches real search intent — not filler' },
  { icon: Layers, text: 'Build domain authority consistently over time with a clear roadmap' },
  { icon: BadgeDollarSign, text: 'Stop wasting budget on tactics that don\'t move the needle' },
  { icon: BarChart2, text: 'Get measurable, compounding results — month after month' },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  semrush: boolean | string
  ahrefs: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, semrush: 'Limited', ahrefs: 'Limited' },
  { feature: 'No signup required', airanko: true, semrush: false, ahrefs: false },
  { feature: 'Auto site crawl', airanko: true, semrush: true, ahrefs: true },
  { feature: 'Keyword strategy', airanko: true, semrush: true, ahrefs: true },
  { feature: 'Competitor analysis', airanko: true, semrush: true, ahrefs: true },
  { feature: 'Content calendar', airanko: true, semrush: false, ahrefs: false },
  { feature: 'Technical SEO checklist', airanko: true, semrush: true, ahrefs: 'Partial' },
  { feature: '6-month action roadmap', airanko: true, semrush: false, ahrefs: false },
  { feature: 'Local SEO audit', airanko: true, semrush: 'Paid only', ahrefs: 'Paid only' },
  { feature: 'Client-ready output', airanko: true, semrush: 'Paid only', ahrefs: false },
  { feature: 'AI-powered strategy', airanko: true, semrush: 'Partial', ahrefs: false },
  { feature: 'Works instantly — no setup', airanko: true, semrush: false, ahrefs: false },
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
    q: 'What is an AI SEO strategy maker?',
    a: 'An AI SEO strategy maker is a tool that automatically analyzes your website and generates a complete SEO plan — including keyword research, competitor analysis, content calendar, technical checklist, and a month-by-month action roadmap.',
  },
  {
    q: 'Is Ai Ranko\'s SEO strategy maker really free?',
    a: 'Yes, completely free. No credit card, no subscription, and no signup required. Just enter your website URL and get a full AI-generated SEO strategy instantly.',
  },
  {
    q: 'How does the AI crawl my website?',
    a: 'Once you enter your URL, Ai Ranko automatically crawls your site\'s internal pages, meta tags, schema markup, sitemap, and robots.txt — no manual input needed.',
  },
  {
    q: 'Can I use this tool without technical SEO knowledge?',
    a: 'Absolutely. The tool is built for marketers, business owners, and bloggers — not just SEO experts. Every recommendation is clear, prioritized, and ready to act on.',
  },
  {
    q: 'How is Ai Ranko different from Semrush or Ahrefs?',
    a: 'Semrush and Ahrefs are powerful but expensive, complex, and require months to master. Ai Ranko gives you a complete, client-ready SEO strategy in seconds — for free, with zero setup.',
  },
  {
    q: 'Does the tool support local SEO strategy?',
    a: 'Yes. Toggle on the local business option and Ai Ranko generates a full local SEO audit — including NAP consistency, geo-relevance signals, and location-based keyword strategy.',
  },
  {
    q: 'What is included in the 6-month SEO roadmap?',
    a: 'The roadmap breaks down your SEO plan month by month — covering what to fix technically, which keywords to target, what content to publish, and how to build authority over time.',
  },
  {
    q: 'How accurate is the AI-generated SEO strategy?',
    a: 'The strategy is based on real site crawl data, your target keywords, and competitor analysis. It follows Google\'s 2025 E-E-A-T guidelines — always validate with your own market research for best results.',
  },
  {
    q: 'Can I use this tool for client SEO reporting?',
    a: 'Yes. The output is structured and professional — making it easy to present to clients as a ready-to-execute SEO plan without any additional formatting.',
  },
  {
    q: 'How often should I generate a new SEO strategy?',
    a: 'It\'s recommended to refresh your SEO strategy every 3–6 months — or whenever you launch new pages, enter a new market, or notice a significant drop in organic traffic.',
  },
]

export default function SeoStrategyMakerSeoSections() {
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
              Three simple steps to build a complete, custom SEO strategy.
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
              Everything you need to plan, execute, and dominate search rankings — in one free tool.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ── Why Your Business Needs an SEO Strategy ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                Why Your Business Needs an SEO Strategy
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed text-pretty">
                Without a strategy, SEO is just guesswork. Here&apos;s what a proper plan unlocks.
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
              See why Ai Ranko&apos;s SEO Strategy Maker outperforms the rest.
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
                    Semrush
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
                      <ComparisonCell value={row.semrush} />
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
            The Smarter Way to Build an SEO Strategy — Free, Fast &amp; AI-Powered
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Whether you&apos;re a startup, blogger, or agency — ranking on Google without a clear SEO strategy is nearly impossible. Ai Ranko&apos;s <strong className="text-foreground">AI SEO strategy maker</strong> builds a complete, tailored plan around your website, niche, and real competition data.
            </p>
            <p>
              Most businesses waste months publishing random content with no direction. Our tool delivers a <strong className="text-foreground">custom SEO plan</strong> with keyword research, competitor gaps, technical fixes, and a 6-month roadmap — all in seconds, completely free.
            </p>
            <p>
              Unlike Semrush or Ahrefs, there&apos;s no learning curve, no monthly fees, and no setup required. Just enter your URL and get a <strong className="text-foreground">client-ready SEO strategy</strong> you can execute from day one.
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
              Everything you need to know about Ai Ranko&apos;s AI SEO Strategy Maker.
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
