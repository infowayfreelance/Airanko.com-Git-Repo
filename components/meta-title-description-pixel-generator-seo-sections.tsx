import {
  PenLine,
  SlidersHorizontal,
  Wand2,
  Sparkles,
  Ruler,
  Smartphone,
  RefreshCw,
  Download,
  Tag,
  TrendingUp,
  MousePointerClick,
  ScissorsLineDashed,
  Clock,
  Search,
  Check,
  X,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: PenLine,
    step: '01',
    title: 'Paste Your Topics',
    desc: 'Add one page topic, target keyword, or short brief per line — up to 20 pages in a single batch. No URL required, just what the page is about.',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: 'Choose Fields & Google Pixel Target',
    desc: 'Pick titles, descriptions, or both, set how many variants you need per page, and choose Desktop or Mobile Google Pixel width limits.',
  },
  {
    icon: Wand2,
    step: '03',
    title: 'Generate & Fine-Tune',
    desc: 'AI writes every variant sized to fit real Google Pixel limits. Edit any line inline and watch the pixel-width badge update live until it fits perfectly.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Sparkles,
    title: 'AI Meta Title & Description Generator',
    desc: 'Generate compelling, click-worthy meta titles and meta descriptions with AI — trained to write for search intent, not just keyword stuffing.',
  },
  {
    icon: Ruler,
    title: 'Real Google Pixel-Width Measurement',
    desc: 'Every variant is measured with the browser\'s real canvas text renderer against the same Google Pixel limits used by our Meta Pixel Checker — not a rough character-count guess.',
  },
  {
    icon: Smartphone,
    title: 'Desktop & Mobile Google Pixel Targeting',
    desc: 'Switch between Desktop and Mobile Google Pixel limits and instantly re-check every already-generated variant — no need to regenerate anything.',
  },
  {
    icon: RefreshCw,
    title: 'Per-Page Regenerate',
    desc: 'Not happy with one page\'s results? Regenerate just that page without starting the whole batch over.',
  },
  {
    icon: Tag,
    title: 'Bulk Meta Title Generator',
    desc: 'Generate meta titles and descriptions for up to 20 pages — and up to 5 variants of each — in a single AI run.',
  },
  {
    icon: Download,
    title: 'CSV & JSON Export',
    desc: 'Export every generated title, description, and its measured pixel width to CSV or JSON — ready to drop straight into your CMS or SEO spreadsheet.',
  },
]

// ─── Why It Matters ──────────────────────────────────────────────────────────

const whyPoints = [
  {
    icon: ScissorsLineDashed,
    title: 'Stop Google Truncation',
    desc: 'Titles and descriptions that overflow the Google Pixel limit get cut off mid-sentence with an ellipsis — killing your click-through rate before a searcher even reads it.',
  },
  {
    icon: MousePointerClick,
    title: 'Higher Click-Through Rate',
    desc: 'A meta title and description that fit perfectly and lead with a clear value proposition consistently outperform generic, truncated snippets in the SERP.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Indexing',
    desc: 'Google indexes and ranks primarily from the mobile version of your page — a title that fits desktop Google Pixel limits can still be cut off on mobile if you never check both.',
  },
  {
    icon: Clock,
    title: 'Save Hours on Manual Writing',
    desc: 'Writing and pixel-checking meta titles and descriptions by hand for dozens of pages is slow. Generate a full batch, pixel-perfect, in one pass instead.',
  },
  {
    icon: Search,
    title: 'Every Page Gets a Real Meta Description',
    desc: 'Pages without a hand-written meta description let Google auto-generate one from body text — often an awkward, unappealing snippet. A dedicated AI-generated description keeps you in control.',
  },
  {
    icon: TrendingUp,
    title: 'Built for SEO Teams at Scale',
    desc: 'Bulk-generate meta tags for new content, site migrations, or an entire backlog of thin meta descriptions — without opening 20 separate browser tabs.',
  },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  yoast: boolean | string
  rankmath: boolean | string
  surferseo: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, yoast: 'Limited', rankmath: 'Limited', surferseo: false },
  { feature: 'No signup required', airanko: true, yoast: false, rankmath: false, surferseo: false },
  { feature: 'AI meta title & description generator', airanko: true, yoast: 'Add-on', rankmath: 'Add-on', surferseo: true },
  { feature: 'Real Google Pixel-width measurement', airanko: true, yoast: 'Character count only', rankmath: 'Character count only', surferseo: false },
  { feature: 'Desktop & mobile pixel targeting', airanko: true, yoast: false, rankmath: false, surferseo: false },
  { feature: 'Bulk generation (up to 20 pages at once)', airanko: true, yoast: false, rankmath: false, surferseo: false },
  { feature: 'Live inline editing with instant pixel feedback', airanko: true, yoast: false, rankmath: false, surferseo: false },
  { feature: 'Per-page regenerate', airanko: true, yoast: false, rankmath: false, surferseo: 'Limited' },
  { feature: 'CSV / JSON export', airanko: true, yoast: false, rankmath: false, surferseo: 'Paid only' },
  { feature: 'Works without a WordPress plugin', airanko: true, yoast: false, rankmath: false, surferseo: true },
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
  return <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{value}</span>
}

export default function MetaTitleDescriptionPixelGeneratorSeoSections() {
  return (
    <div className="border-t border-border bg-background">

      {/* ── How It Works ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">How It Works</h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Three simple steps to generate AI meta titles and descriptions that fit real Google Pixel limits.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.step} className="relative flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="font-heading text-4xl font-bold text-primary/15 select-none leading-none">{s.step}</span>
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
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">Key Features</h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Everything you need to write, size, and export pixel-perfect meta tags — in one place.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 shadow-sm">
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

      {/* ── Why It Matters ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Why Google Pixel-Perfect Meta Tags Matter
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-pretty">
              Google truncates titles and descriptions by rendered pixel width, not character count — so two titles with the same length can display completely differently in search results.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyPoints.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
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
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">How We Compare</h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              See why Ai Ranko&apos;s AI meta title &amp; description generator beats plugin-based alternatives on Google Pixel accuracy and bulk speed.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-4 text-left font-heading font-semibold text-foreground w-[34%]">Feature</th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-primary w-[16%]">AI Ranko</th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[16%]">Yoast SEO</th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[16%]">Rank Math</th>
                  <th className="px-4 py-4 text-center font-heading font-semibold text-muted-foreground w-[16%]">Surfer SEO</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-card' : 'bg-background'}`}>
                    <td className="px-4 py-3.5 font-medium text-foreground">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center"><ComparisonCell value={row.airanko} /></td>
                    <td className="px-4 py-3.5 text-center"><ComparisonCell value={row.yoast} /></td>
                    <td className="px-4 py-3.5 text-center"><ComparisonCell value={row.rankmath} /></td>
                    <td className="px-4 py-3.5 text-center"><ComparisonCell value={row.surferseo} /></td>
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
            A Free AI Meta Title &amp; Description Generator Built Around Google Pixel Limits
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Most <strong className="text-foreground">meta title generators</strong> and <strong className="text-foreground">meta description generators</strong> only count characters — but Google doesn&apos;t truncate search snippets by character count, it truncates by rendered pixel width. A 60-character title full of narrow letters like &quot;i&quot; and &quot;l&quot; can fit comfortably, while a 55-character title full of wide capitals like &quot;W&quot; and &quot;M&quot; gets cut off with an ellipsis. That&apos;s the gap this <strong className="text-foreground">google pixel meta title generator</strong> is built to close.
            </p>
            <p>
              Instead of guessing at a safe character count, this tool combines AI copywriting with the exact same <strong className="text-foreground">Google Pixel-width measurement</strong> engine used by our Meta Pixel Checker. Every meta title and description it writes — for desktop or mobile SERPs — is checked against real pixel limits, not an approximation, and flagged instantly if it&apos;s too long, near the limit, or safely within it.
            </p>
            <p>
              Because it&apos;s a <strong className="text-foreground">bulk meta title generator</strong>, you&apos;re not limited to one page at a time. Paste up to 20 page topics, keywords, or briefs, choose how many variants you want for each, and generate an entire batch of <strong className="text-foreground">pixel-perfect meta descriptions</strong> in one pass — then fine-tune any line by hand with live pixel feedback before you ship it.
            </p>
            <p>
              Whether you&apos;re an SEO professional cleaning up a backlog of thin meta descriptions, a content team launching new pages, or a developer running a site migration, this <strong className="text-foreground">free AI meta description generator</strong> gets you Google Pixel-accurate results without a WordPress plugin, a subscription, or a signup.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
