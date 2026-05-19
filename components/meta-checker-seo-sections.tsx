import {
  ClipboardList,
  Zap,
  Eye,
  FileSearch,
  Share2,
  Twitter,
  Layers,
  MonitorCheck,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Search,
  Globe,
  Clock,
  AlertCircle,
  Bot,
  X,
  Check,
  ChevronDown,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Enter Your URLs',
    desc: 'Paste one URL or multiple URLs at once — separated by newlines or commas. Bulk paste mode available for faster input.',
  },
  {
    icon: Zap,
    step: '02',
    title: 'Instant Analysis',
    desc: 'Hit "Check Meta Tags" and our server fetches live data from each URL in seconds. No browser extensions, no manual digging — everything extracted automatically.',
  },
  {
    icon: Eye,
    step: '03',
    title: 'Review & Act',
    desc: 'See meta title, meta description, OG tags, and Twitter Card data — all in one clean view. Spot missing tags, weak descriptions, or broken OG images instantly.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: FileSearch,
    title: 'Meta Title & Description Checker',
    desc: 'Instantly extract and preview the meta title and meta description of any URL. See character count at a glance — know exactly what Google will show in search results.',
  },
  {
    icon: Share2,
    title: 'Open Graph Tag Analyzer',
    desc: 'Check all OG tags — og:title, og:description, og:image, og:type, and more. See exactly how your page will appear when shared on Facebook, LinkedIn, or WhatsApp.',
  },
  {
    icon: Twitter,
    title: 'Twitter Card Checker',
    desc: 'Verify twitter:card, twitter:title, twitter:description, and twitter:image tags instantly. Ensure your content looks sharp every time it\'s shared on X (Twitter).',
  },
  {
    icon: Layers,
    title: 'Bulk URL Support',
    desc: 'Check unlimited URLs in one go — paste them comma-separated or line by line. Perfect for SEO audits, site migrations, and large-scale content reviews.',
  },
  {
    icon: MonitorCheck,
    title: 'Live Tag Preview',
    desc: 'See a real-time visual preview of how your meta and OG data actually renders. No guesswork — what you see is exactly what search engines and social platforms see.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-First — No Data Stored',
    desc: 'All data is fetched server-side and never saved, logged, or shared. Your URLs and meta data stay completely private — always.',
  },
]

// ─── Why Meta & OG Tags Matter ───────────────────────────────────────────────

const whyPoints = [
  {
    icon: TrendingUp,
    title: 'Higher Click-Through Rate',
    desc: 'A well-written meta title and description convinces users to click your result over competitors.',
  },
  {
    icon: Share2,
    title: 'Better Social Sharing',
    desc: 'Correct OG tags ensure your page displays a proper image, title, and description on every platform.',
  },
  {
    icon: Twitter,
    title: 'Stronger Twitter Presence',
    desc: 'Twitter Card tags make your shared links stand out with rich previews instead of plain URLs.',
  },
  {
    icon: Clock,
    title: 'Faster SEO Audits',
    desc: 'Bulk checking saves hours during site audits, migrations, and pre-launch reviews.',
  },
  {
    icon: AlertCircle,
    title: 'Avoid Missing Tags',
    desc: 'Missing or duplicate meta tags silently hurt your rankings — catch them before Google does.',
  },
  {
    icon: Bot,
    title: 'AI & Answer Engine Visibility',
    desc: 'Properly structured meta tags help AI tools like ChatGPT, Perplexity, and Google SGE understand and surface your content.',
  },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  screamingfrog: boolean | string
  seoptimer: boolean | string
  ahrefs: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, screamingfrog: 'Limited', seoptimer: 'Limited', ahrefs: 'Limited' },
  { feature: 'No signup required', airanko: true, screamingfrog: true, seoptimer: false, ahrefs: false },
  { feature: 'Meta title checker', airanko: true, screamingfrog: true, seoptimer: true, ahrefs: true },
  { feature: 'Meta description checker', airanko: true, screamingfrog: true, seoptimer: true, ahrefs: true },
  { feature: 'Open Graph tag checker', airanko: true, screamingfrog: true, seoptimer: 'Partial', ahrefs: false },
  { feature: 'Twitter Card checker', airanko: true, screamingfrog: true, seoptimer: 'Partial', ahrefs: false },
  { feature: 'Bulk URL support', airanko: true, screamingfrog: 'Paid only', seoptimer: false, ahrefs: 'Limited' },
  { feature: 'Live tag preview', airanko: true, screamingfrog: false, seoptimer: false, ahrefs: false },
  { feature: 'Server-side fetching', airanko: true, screamingfrog: false, seoptimer: false, ahrefs: false },
  { feature: 'No data stored', airanko: true, screamingfrog: false, seoptimer: false, ahrefs: false },
  { feature: 'No software install needed', airanko: true, screamingfrog: false, seoptimer: true, ahrefs: true },
  { feature: 'Works on all devices', airanko: true, screamingfrog: false, seoptimer: true, ahrefs: true },
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
    q: 'What is a meta tag checker?',
    a: "A meta tag checker is a tool that reads a webpage's HTML and extracts key SEO tags — including meta title, meta description, Open Graph, and Twitter Card data — so you can audit and optimize them without touching any code.",
  },
  {
    q: 'What is the difference between meta tags and Open Graph tags?',
    a: 'Meta tags communicate page information to search engines like Google. Open Graph tags control how your page appears when shared on social platforms like Facebook, LinkedIn, and WhatsApp — they serve different but equally important purposes.',
  },
  {
    q: 'Can I check multiple URLs at once?',
    a: 'Yes. Ai Ranko\'s tool supports bulk URL checking — simply paste multiple URLs separated by commas or newlines and hit "Check Meta Tags" to get results for all of them instantly.',
  },
  {
    q: 'Does this tool check Twitter Card tags too?',
    a: 'Yes. Along with meta and OG tags, the tool also extracts twitter:card, twitter:title, twitter:description, and twitter:image — so you can verify rich previews before your content goes live on X (Twitter).',
  },
  {
    q: 'Is this tool free to use?',
    a: '100% free. No subscription, no credit card, and no signup required — just enter your URLs and get instant results.',
  },
  {
    q: 'Do you store or log the URLs I check?',
    a: 'No. All data is fetched server-side in real time and never stored, logged, or shared. Your URLs and meta data remain completely private.',
  },
  {
    q: 'Why are Open Graph tags important for SEO?',
    a: 'Open Graph tags directly impact social click-through rates by controlling the title, description, and image shown when your page is shared. Higher social engagement sends positive signals to search engines, indirectly boosting your SEO performance.',
  },
  {
    q: 'Can AI tools like ChatGPT or Perplexity read my meta tags?',
    a: 'Yes. AI answer engines and large language models rely on structured meta data to understand, index, and cite your content. Properly set meta and OG tags improve your chances of being surfaced in AI-generated answers.',
  },
  {
    q: 'Do I need to install anything to use this tool?',
    a: "No. Ai Ranko's Meta & OG Checker is fully browser-based and works on all devices — desktop, tablet, and mobile — with zero installation required.",
  },
  {
    q: 'Who should use a bulk meta tag checker?',
    a: 'SEO professionals, web developers, digital marketers, and content managers — anyone who needs to audit, validate, or optimize meta and Open Graph tags across single pages or entire websites.',
  },
]

export default function MetaCheckerSeoSections() {
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
              Three simple steps to check meta tags, Open Graph, and Twitter Card data for any URL.
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
              Everything you need to audit, analyze, and fix your meta and Open Graph tags — in one place.
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

      {/* ── Why Meta & OG Tags Matter ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Why Meta &amp; OG Tags Matter
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-pretty">
              Meta tags tell search engines what your page is about. Open Graph tags control how your content looks when shared on social media. Both directly impact your CTR, social engagement, and overall SEO performance.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyPoints.map((b) => {
              const Icon = b.icon
              return (
                <div
                  key={b.title}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{b.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              )
            })}
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
              See why Ai Ranko&apos;s Bulk Meta &amp; OG Checker outperforms every other tool in speed, features, and privacy.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-4 text-left font-heading font-semibold text-foreground w-[30%]">
                    Feature
                  </th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-primary w-[17.5%]">
                    AI Ranko
                  </th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[17.5%]">
                    Screaming Frog
                  </th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[17.5%]">
                    SEOptimer
                  </th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[17.5%]">
                    Ahrefs Webmaster
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
                      <ComparisonCell value={row.screamingfrog} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.seoptimer} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
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
            The Smartest Way to Check Meta Tags &amp; Open Graph Data Online
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              A <strong className="text-foreground">meta tag checker</strong> fetches and displays every critical SEO tag inside a webpage&apos;s HTML — meta title, meta description, Open Graph, and Twitter Card data — all in one view. Missing or broken tags silently hurt your search rankings, social click-through rates, and even your visibility on AI answer engines like Google SGE, Perplexity, and ChatGPT.
            </p>
            <p>
              Manually checking tags one by one is slow and unscalable — especially during site audits, content migrations, or pre-launch reviews. Ai Ranko&apos;s <strong className="text-foreground">bulk meta &amp; OG checker</strong> lets you paste multiple URLs at once, fetches live data server-side, and delivers instant results — no signup, no software, no data stored.
            </p>
            <p>
              Whether you&apos;re an SEO professional, a developer, or a content marketer, this is the fastest and most complete <strong className="text-foreground">free meta tag audit tool</strong> available online.
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
              Everything you need to know about Ai Ranko&apos;s Bulk Meta &amp; OG Checker.
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
