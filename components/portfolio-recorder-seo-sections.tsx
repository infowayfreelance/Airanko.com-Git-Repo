import {
  Globe,
  SlidersHorizontal,
  Video,
  Monitor,
  Clock,
  MoveVertical,
  Gauge,
  ShieldCheck,
  Download,
  Sparkles,
  Briefcase,
  Share2,
  FileText,
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
    title: 'Paste Your Website URL',
    desc: 'Drop in any live website or web app link. It loads instantly inside a real device frame — desktop, tablet, or mobile.',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: 'Choose Device, Duration & Motion',
    desc: 'Pick your view, set the clip length anywhere from 10 to 60 seconds, choose scroll depth, and select smooth-eased or constant motion.',
  },
  {
    icon: Video,
    step: '03',
    title: 'Record & Download',
    desc: 'Hit record — the page auto-scrolls smoothly and stops on its own. Preview the result and download a clean video in one click.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Monitor,
    title: 'Desktop, Tablet & Mobile Views',
    desc: 'Record your site in true device dimensions — 1280×720 desktop, tablet, or a 390px mobile frame. Showcase responsive design in one clip.',
  },
  {
    icon: Clock,
    title: 'Custom 10–60s Duration',
    desc: 'Set any length between 10 and 60 seconds. Quick teaser or a full walkthrough — the scroll speed adapts automatically to fit.',
  },
  {
    icon: MoveVertical,
    title: 'Adjustable Scroll Depth',
    desc: 'Choose how far down the page to travel — short, medium, long, or extra long — to match landing pages or long-form layouts.',
  },
  {
    icon: Gauge,
    title: 'Buttery-Smooth Motion',
    desc: 'Pick eased (accelerate-decelerate) or constant-speed scrolling. Every frame is animated at 30fps for a polished, professional feel.',
  },
  {
    icon: Download,
    title: 'Instant Video Download',
    desc: 'Get a high-bitrate WebM file the moment recording ends. No render queue, no email, no waiting — just preview and save.',
  },
  {
    icon: ShieldCheck,
    title: '100% Private & Free',
    desc: 'Everything runs in your browser. No uploads to our servers, no signup, no watermark — your recordings stay completely yours.',
  },
]

// ─── Use Cases ───────────────────────────────────────────────────────────────

const useCases = [
  {
    icon: Briefcase,
    title: 'Portfolio & Case Studies',
    desc: 'Show off client projects and personal work with motion that screenshots can\'t match.',
  },
  {
    icon: Share2,
    title: 'Social Media Promos',
    desc: 'Create scroll-stopping clips for LinkedIn, X, and Instagram to launch a product or feature.',
  },
  {
    icon: FileText,
    title: 'Client Proposals & Pitches',
    desc: 'Embed a live demo video in proposals so prospects experience the product instantly.',
  },
  {
    icon: Layers,
    title: 'Product Launches & Changelogs',
    desc: 'Document new releases and UI updates with a quick, repeatable visual walkthrough.',
  },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  loom: boolean | string
  screenstudio: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, loom: 'Limited', screenstudio: 'Paid only' },
  { feature: 'No signup required', airanko: true, loom: false, screenstudio: false },
  { feature: 'No software install', airanko: true, loom: 'Extension', screenstudio: false },
  { feature: 'Auto smooth scrolling', airanko: true, loom: false, screenstudio: false },
  { feature: 'Desktop / tablet / mobile frames', airanko: true, loom: false, screenstudio: 'Partial' },
  { feature: 'Custom 10–60s duration', airanko: true, loom: true, screenstudio: true },
  { feature: 'URL-based — no manual scrolling', airanko: true, loom: false, screenstudio: false },
  { feature: 'No watermark', airanko: true, loom: 'Paid only', screenstudio: true },
  { feature: 'Instant download', airanko: true, loom: 'Cloud first', screenstudio: true },
  { feature: 'Privacy — runs in browser', airanko: true, loom: false, screenstudio: 'Local app' },
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
    q: 'What is a website portfolio video recorder?',
    a: "It's a tool that turns any website URL into a smooth, scrolling demo video. Instead of manually scrolling and screen-recording, you paste a link, choose a device view and duration, and the tool auto-scrolls the page while capturing a clean clip — perfect for portfolios, case studies, and social posts.",
  },
  {
    q: 'Is this tool free? Do I need to sign up?',
    a: 'Yes, it\'s completely free with no signup, no watermark, and no limits. Everything runs in your browser — your URL and recording never get uploaded to our servers.',
  },
  {
    q: 'How long can my video be?',
    a: 'You can record any duration between 10 and 60 seconds. Use the slider or the quick presets (10s, 15s, 30s, 45s, 60s). The scroll speed automatically adapts so the full page fits your chosen length.',
  },
  {
    q: 'Can I record in mobile and desktop views?',
    a: 'Yes. Choose Desktop (1280×720), Tablet, or Mobile (390px) and the site loads inside that exact device frame. It\'s the easiest way to showcase a responsive design.',
  },
  {
    q: 'Why does it ask to share my screen or tab?',
    a: 'Browsers only allow recording external website content through the native screen-capture permission. When prompted, choose "This Tab" and allow sharing — the tool then auto-scrolls and stops on its own, so you don\'t touch anything during the recording.',
  },
  {
    q: 'What video format do I get?',
    a: 'You get a high-bitrate WebM file (VP9 where supported), which plays in modern browsers and can be converted to MP4 with any free converter if a client needs it.',
  },
  {
    q: 'Some websites won\'t load in the preview — why?',
    a: 'A few sites send X-Frame-Options or Content-Security-Policy headers that block embedding. For those, try a staging link or your own deployment. Most marketing sites, portfolios, and web apps embed fine.',
  },
  {
    q: 'Does the recording include sound?',
    a: 'No — this tool captures a clean, silent visual scroll of your site. You can add a voiceover or music afterward in any video editor if you\'d like.',
  },
]

export default function PortfolioRecorderSeoSections() {
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
              Three simple steps to turn any website into a polished demo video.
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
              Everything you need to capture stunning website demo videos — in one free browser tool.
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

      {/* ── Use Cases ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Built for Creators, Agencies &amp; Founders
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              One quick recording, endless ways to show your work in motion.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((u) => {
              const Icon = u.icon
              return (
                <div
                  key={u.title}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{u.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{u.desc}</p>
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
              See why AI Ranko&apos;s portfolio video recorder is the fastest URL-to-video tool around.
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
                    Loom
                  </th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-muted-foreground w-1/5">
                    Screen Studio
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
                      <ComparisonCell value={row.loom} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <ComparisonCell value={row.screenstudio} />
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
            The Easiest Way to Turn a Website Into a Video — Free &amp; Online
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              A <strong className="text-foreground">website portfolio video recorder</strong> transforms a static URL into a dynamic, scrolling demo clip — no screen-recording software, no manual scrolling, and no editing skills required. Just paste a link and the tool captures a smooth, professional walkthrough of the entire page.
            </p>
            <p>
              Designers and agencies use it to <strong className="text-foreground">showcase web projects</strong> in portfolios and case studies, where motion communicates polish that screenshots simply can&apos;t. Founders and marketers use it to create <strong className="text-foreground">website demo videos</strong> for product launches, landing-page promos, and social media — in desktop, tablet, or mobile views.
            </p>
            <p>
              Unlike Loom or Screen Studio, there&apos;s nothing to install and no account to create. AI Ranko&apos;s <strong className="text-foreground">URL-to-video tool</strong> runs entirely in your browser, auto-scrolls your page at a perfectly timed pace, and hands you a downloadable file the instant recording stops — completely free, with no watermark.
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
              Everything you need to know about AI Ranko&apos;s website video recorder.
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
