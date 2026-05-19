import {
  PenLine,
  SlidersHorizontal,
  ShieldCheck,
  Rocket,
  Star,
  Brain,
  HelpCircle,
  CheckSquare,
  FileText,
  ListChecks,
  TrendingUp,
  Zap,
  BookOpen,
  Clock,
  Target,
  X,
  Check,
  ChevronDown,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: PenLine,
    step: '01',
    title: 'Enter Your Topic',
    desc: 'Type your main topic and the primary keyword you want to rank for. Add secondary keywords or let the AI suggest them automatically.',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: 'Set Your Preferences',
    desc: 'Choose your content type, tone, format, and target audience. Control length, reading level, and brand voice in one place.',
  },
  {
    icon: ShieldCheck,
    step: '03',
    title: 'Add E-E-A-T Signals',
    desc: 'Define your experience, expertise, and author credentials. The AI uses this to build trust signals Google\'s quality raters look for.',
  },
  {
    icon: Rocket,
    step: '04',
    title: 'Generate & Publish',
    desc: 'Get a complete, publishing-ready article with FAQ schema, AI Overview hooks, and a pre-publish SEO checklist — download or copy instantly.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Star,
    title: 'E-E-A-T Optimization',
    desc: 'Automatically embeds Experience, Expertise, Authoritativeness, and Trust signals — the exact criteria Google\'s quality raters use to evaluate content.',
  },
  {
    icon: Brain,
    title: 'AI Overviews / SGE Ready',
    desc: 'Content is structured with citation hooks and direct-answer formatting so Google\'s AI Overviews are more likely to pull and feature your content.',
  },
  {
    icon: HelpCircle,
    title: 'FAQ Schema Generator',
    desc: 'Automatically generates FAQ sections in structured schema markup — boosting your chances of winning rich results and People Also Ask boxes.',
  },
  {
    icon: CheckSquare,
    title: 'Helpful Content System Aligned',
    desc: 'Every article is scored against Google\'s Helpful Content criteria — ensuring your content is written for people first, not just search engines.',
  },
  {
    icon: FileText,
    title: 'Tone & Format Control',
    desc: 'Choose from 10+ content types and customize tone, length, and reading level. One tool for blog posts, landing pages, product reviews, and more.',
  },
  {
    icon: ListChecks,
    title: 'Pre-Publish SEO Checklist',
    desc: 'Get a complete publishing checklist with every article — covering keyword placement, meta tags, internal linking, and readability before you hit publish.',
  },
]

// ─── Why Quality Content Matters ─────────────────────────────────────────────

const benefitPoints = [
  { icon: TrendingUp, text: 'Rank higher with E-E-A-T signals baked into every article' },
  { icon: Star, text: 'Get cited in AI Overviews and featured snippets' },
  { icon: Target, text: 'Match search intent precisely for every content type' },
  { icon: BookOpen, text: 'Build topical authority faster with structured, expert content' },
  { icon: Clock, text: 'Save hours — go from keyword to publish-ready article in minutes' },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  jasper: boolean | string
  copyai: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, jasper: 'Paid only', copyai: 'Paid only' },
  { feature: 'No signup required', airanko: true, jasper: false, copyai: false },
  { feature: 'E-E-A-T optimization', airanko: true, jasper: false, copyai: false },
  { feature: 'AI Overviews hooks', airanko: true, jasper: false, copyai: false },
  { feature: 'FAQ schema generator', airanko: true, jasper: false, copyai: false },
  { feature: 'Helpful Content aligned', airanko: true, jasper: 'Partial', copyai: 'Partial' },
  { feature: 'Pre-publish SEO checklist', airanko: true, jasper: false, copyai: false },
  { feature: '10+ content types', airanko: true, jasper: true, copyai: true },
  { feature: 'Tone & format control', airanko: true, jasper: true, copyai: true },
  { feature: 'Google 2025 spam policy aligned', airanko: true, jasper: false, copyai: false },
  { feature: 'No watermark', airanko: true, jasper: false, copyai: 'Paid only' },
  { feature: 'Works on all devices', airanko: true, jasper: true, copyai: true },
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
    q: "What is Ai Ranko's AI Content Writer?",
    a: "Ai Ranko's AI Content Writer is a free, browser-based tool that generates complete, SEO-optimized articles. It is built around Google's 2025 E-E-A-T framework, Helpful Content System, and AI Overviews optimization — so every article is ready to rank from day one.",
  },
  {
    q: 'Is the AI Content Writer free to use?',
    a: 'Yes, completely free. No subscription, no credit card, and no signup required. Just enter your topic, set your preferences, and generate a fully optimized article instantly.',
  },
  {
    q: 'How is this different from ChatGPT or other AI writers?',
    a: "Most AI writers just generate text. Ai Ranko's content writer generates ranking-ready content — with E-E-A-T signals, FAQ schema, AI Overview hooks, and a pre-publish SEO checklist built into every article automatically.",
  },
  {
    q: 'What types of content can I generate?',
    a: 'You can generate Blog Posts, In-Depth Guides, How-To Tutorials, Listicles, Comparison Articles, Product Reviews, Service Pages, Landing Pages, Pillar Pages, and News Updates — all from one tool.',
  },
  {
    q: 'Will this content rank on Google in 2025?',
    a: "Every article is scored against Google's Helpful Content System, E-E-A-T criteria, and 2024 spam policies. Content is structured for people first and search engines second — which is exactly what Google rewards in 2025.",
  },
  {
    q: 'What is E-E-A-T and why does it matter?',
    a: "E-E-A-T stands for Experience, Expertise, Authoritativeness, and Trustworthiness. It is the framework Google's quality raters use to evaluate content quality. Without E-E-A-T signals, even well-written content struggles to rank on competitive keywords.",
  },
  {
    q: 'Can this tool help me get featured in AI Overviews?',
    a: "Yes. Every article is structured with direct-answer formatting and citation hooks — the two key elements that increase your chances of being pulled and featured in Google's AI Overviews results.",
  },
  {
    q: 'Do I need any SEO knowledge to use this tool?',
    a: 'No. The tool handles keyword placement, E-E-A-T signals, FAQ schema, and the SEO checklist automatically. Even complete beginners can generate and publish ranking-ready content without any prior SEO experience.',
  },
  {
    q: 'How long does it take to generate an article?',
    a: 'Most articles are generated within seconds. You fill in four simple steps — Topic, Audience, E-E-A-T, and Details — and the tool delivers a complete, publish-ready article instantly.',
  },
  {
    q: 'Does the generated content have any watermark or restrictions?',
    a: 'No watermark, no usage restrictions. The content you generate is yours — copy it, edit it, publish it anywhere without any limitations.',
  },
]

export default function ContentWriterSeoSections() {
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
              Four simple steps to research, write, optimize, and publish SEO content that ranks.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              Everything you need to write, optimize, and publish content Google ranks and AI Overviews cite.
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

      {/* ── Why Quality Content Matters ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                Why Quality Content Is Your #1 Ranking Signal
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  Google&apos;s 2024 core updates made one thing clear — thin, generic, AI-spun content gets demoted. Only content that demonstrates real experience and genuine helpfulness earns top rankings.
                </p>
                <p>
                  Every article this tool generates is built around Google&apos;s Helpful Content System, E-E-A-T framework, and spam policies. It&apos;s not just AI writing — it&apos;s AI writing with ranking strategy built in.
                </p>
              </div>
            </div>
            <ul className="flex flex-col gap-3">
              {benefitPoints.map((b) => {
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
              See why Ai Ranko&apos;s content writer outperforms the rest.
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
                    Jasper.ai
                  </th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-muted-foreground w-1/5">
                    Copy.ai
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
                      <ComparisonCell value={row.jasper} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <ComparisonCell value={row.copyai} />
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
            The Smartest Way to Write, Optimize &amp; Publish SEO Content
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Whether you need a quick <strong className="text-foreground">AI content writer</strong> to draft a blog post, or want to build a full SEO article with schema markup and E-E-A-T signals, Ai Ranko handles it all in one place. No prompts to engineer, no plugins to install — just publishing-ready content directly in your browser.
            </p>
            <p>
              Google&apos;s 2025 updates changed the game. With Ai Ranko, you can generate <strong className="text-foreground">E-E-A-T optimized content</strong> in minutes — with trust signals, author expertise, and experience markers built in automatically. Better signals mean better rankings, and better rankings mean more organic traffic.
            </p>
            <p>
              Need to target AI Overviews and featured snippets? Our content engine structures every article with direct-answer formatting and citation hooks — so Google&apos;s AI is more likely to pull your content and surface it at the top of search results.
            </p>
            <p>
              Unlike generic AI article generators, everything here is built around Google&apos;s Helpful Content System and 2024 spam policies. Your content is written for real people first — and optimized for search engines second. That&apos;s the only strategy that works in 2025 and beyond.
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
              Everything you need to know about Ai Ranko&apos;s AI Content Writer.
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
