import {
  Globe,
  Smartphone,
  RotateCcw,
  ZoomIn,
  Layers,
  ShieldCheck,
  TrendingUp,
  Search,
  Activity,
  Users,
  RefreshCw,
  AlertCircle,
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
    desc: 'Paste any public website URL into the input field and hit Check. Works with any live website — your own or a competitor\'s.',
  },
  {
    icon: Smartphone,
    step: '02',
    title: 'Choose Your Device & Settings',
    desc: 'Select from Phone, Tablet, or Desktop — then pick a specific device like iPhone 14, Galaxy S23, or Pixel 7. Switch between Portrait and Landscape mode, and adjust zoom level to 50%, 75%, or 100%.',
  },
  {
    icon: ZoomIn,
    step: '03',
    title: 'Preview Instantly',
    desc: 'Your website loads in real device dimensions — right inside your browser. No app download, no wait time. See the exact mobile experience your visitors get.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Layers,
    title: 'Multiple Device Types',
    desc: 'Test your website across Phone, Tablet, and Desktop — all in one tool. Switch between device categories instantly without reloading the page.',
  },
  {
    icon: Smartphone,
    title: 'Real Device Screen Sizes',
    desc: 'Preview in exact dimensions of iPhone SE, iPhone 14, iPhone 14 Pro Max, Galaxy S23, and Pixel 7. No guesswork — see pixel-perfect how your site actually appears.',
  },
  {
    icon: RotateCcw,
    title: 'Portrait & Landscape Mode',
    desc: 'Toggle between Portrait and Landscape orientation with one click. Catch layout breaks and overflow issues that only appear in horizontal view.',
  },
  {
    icon: ZoomIn,
    title: 'Zoom Controls',
    desc: 'Scale your preview to 50%, 75%, or 100% for a closer or wider look. Perfect for inspecting small UI elements, buttons, and text readability on mobile.',
  },
  {
    icon: Globe,
    title: 'Instant Browser-Based Preview',
    desc: 'No installation, no extension, no account required — works directly in your browser. Enter a URL and your preview loads in seconds, completely free.',
  },
  {
    icon: ShieldCheck,
    title: '100% Free & Private',
    desc: 'Your URL is fetched for preview only — no data is stored or tracked. Use it as many times as you want, for any website, without any cost.',
  },
]

// ─── Why Mobile-Friendliness Matters ─────────────────────────────────────────

const whyPoints = [
  { icon: Users, text: 'Over 60% of global web traffic comes from mobile devices' },
  { icon: Search, text: "Google's mobile-first indexing ranks your mobile version — not desktop" },
  { icon: Activity, text: 'Slow or broken mobile layouts increase bounce rate and kill conversions' },
  { icon: TrendingUp, text: 'A responsive website builds trust and keeps visitors engaged longer' },
  { icon: AlertCircle, text: 'Mobile UX is a confirmed Google ranking signal since 2015 — and growing stronger' },
  { icon: RefreshCw, text: 'Testing regularly catches layout breaks before your users do' },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  googletest: boolean | string
  responsinator: boolean | string
  browserstack: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, googletest: true, responsinator: true, browserstack: 'Limited' },
  { feature: 'No signup required', airanko: true, googletest: true, responsinator: true, browserstack: false },
  { feature: 'Real device screen sizes', airanko: true, googletest: false, responsinator: 'Partial', browserstack: true },
  { feature: 'Multiple device types', airanko: true, googletest: false, responsinator: 'Partial', browserstack: true },
  { feature: 'Portrait & Landscape mode', airanko: true, googletest: false, responsinator: false, browserstack: true },
  { feature: 'Zoom controls', airanko: true, googletest: false, responsinator: false, browserstack: 'Paid only' },
  { feature: 'Instant browser-based preview', airanko: true, googletest: true, responsinator: true, browserstack: false },
  { feature: 'Specific device models', airanko: true, googletest: false, responsinator: false, browserstack: 'Paid only' },
  { feature: 'No data stored or tracked', airanko: true, googletest: false, responsinator: true, browserstack: false },
  { feature: 'Works on all devices', airanko: true, googletest: true, responsinator: true, browserstack: 'Partial' },
  { feature: 'No watermark or branding', airanko: true, googletest: true, responsinator: true, browserstack: 'Paid only' },
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
    q: 'What is a mobile friendliness checker?',
    a: 'A mobile friendliness checker is a tool that previews any website in real mobile, tablet, or desktop screen sizes. It helps you visually inspect how your site looks and behaves on different devices — before your users experience any issues.',
  },
  {
    q: 'Is this mobile friendliness checker completely free?',
    a: 'Yes — 100% free with no hidden charges, no subscription, and no sign-up required. Just enter any URL and get an instant mobile preview, unlimited times.',
  },
  {
    q: 'Which devices can I test my website on?',
    a: 'You can test on iPhone SE, iPhone 14, iPhone 14 Pro Max, Samsung Galaxy S23, and Google Pixel 7. Tablet and Desktop previews are also available — plus Portrait and Landscape orientation for each.',
  },
  {
    q: 'Does Google use mobile-friendliness as a ranking factor?',
    a: "Yes — Google has used mobile-first indexing since 2019, meaning it ranks your site based on its mobile version first. A poor mobile experience directly impacts your search rankings, traffic, and conversions.",
  },
  {
    q: 'Do I need to install anything to use this tool?',
    a: 'No installation, no browser extension, and no account is needed. The tool runs entirely in your browser — just open the page, enter a URL, and preview instantly.',
  },
  {
    q: 'Can I test competitor websites with this tool?',
    a: "Yes — you can test any publicly accessible website, including competitor sites. It's a great way to benchmark your mobile UX against industry competitors.",
  },
  {
    q: 'Is my data safe when using this tool?',
    a: 'Your URL is only used to load the preview — no data is stored, tracked, or shared. Ai Ranko is fully privacy-first. Your browsing activity stays completely private.',
  },
  {
    q: 'What is the difference between Portrait and Landscape mode?',
    a: 'Portrait mode shows the vertical screen view — how most users hold their phone. Landscape mode shows the horizontal view — useful for catching layout breaks that only appear when the screen rotates.',
  },
  {
    q: 'What does the zoom control do?',
    a: 'Zoom controls let you scale the preview to 50%, 75%, or 100% of the actual device size. Use it to inspect small text, buttons, and UI elements more closely or get a wider overall view.',
  },
  {
    q: "How is Ai Ranko's mobile checker different from Google's Mobile-Friendly Test?",
    a: "Google's tool only gives a pass/fail report — it doesn't show a live visual preview. Ai Ranko gives you a real-time visual preview across multiple specific devices, orientations, and zoom levels — all in one place.",
  },
]

export default function MobileCheckerSeoSections() {
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
              Three simple steps to test any website&apos;s mobile friendliness.
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
              Everything you need to test and analyze mobile responsiveness in one place.
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

      {/* ── Why Mobile-Friendliness Matters ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                Why Mobile-Friendliness Matters
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed text-pretty">
                Mobile is no longer optional — it&apos;s how the majority of your audience finds you. Google uses mobile-first indexing, meaning it crawls and ranks your site based on its mobile version first. A poor mobile experience directly hurts your SEO rankings, bounce rate, and conversions.
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
              See why Ai Ranko&apos;s Mobile Friendliness Checker outperforms the rest.
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
                    Google Mobile Test
                  </th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[18%]">
                    Responsinator
                  </th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[18%]">
                    BrowserStack
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
                      <ComparisonCell value={row.googletest} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.responsinator} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ComparisonCell value={row.browserstack} />
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
            The Fastest Way to Test Mobile Friendliness Online — Free
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Whether you&apos;re an SEO professional, web developer, or business owner, knowing how your site performs on mobile is non-negotiable. Our <strong className="text-foreground">free mobile friendliness checker</strong> lets you instantly preview any website in real device dimensions — no installation, no signup, no cost.
            </p>
            <p>
              From small business websites to large eCommerce stores, mobile responsiveness directly impacts how Google ranks your pages in search results. Use Ai Ranko&apos;s <strong className="text-foreground">mobile responsive test</strong> to identify layout issues, broken elements, and poor UX before they cost you rankings and customers.
            </p>
            <p>
              What is a mobile friendliness checker? It&apos;s a tool that loads any website inside simulated mobile, tablet, or desktop screen sizes so you can visually inspect its responsiveness. Unlike automated reports, Ai Ranko gives you a <strong className="text-foreground">live visual preview</strong> — so you see exactly what your visitors see, on the exact device they&apos;re using.
            </p>
            <p>
              Google&apos;s mobile-first indexing means your mobile experience <em>is</em> your SEO strategy. Test your website now with Ai Ranko&apos;s free mobile preview tool — catch issues early, fix them fast, and rank with confidence.
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
              Everything you need to know about testing mobile friendliness with Ai Ranko.
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
