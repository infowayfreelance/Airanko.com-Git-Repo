import {
  Upload,
  Cpu,
  Download,
  ImageOff,
  MousePointerClick,
  FileImage,
  Palette,
  Stamp,
  FileType2,
  ShieldCheck,
  Zap,
  ShoppingBag,
  User,
  Share2,
  Presentation,
  Layers,
  Clock,
  CheckCircle2,
  X,
  Check,
} from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Image',
    desc: 'Drop a PNG, JPG, or WebP file directly into the tool — or click to browse from your device.',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI Removes the Background',
    desc: 'On-device AI instantly detects the subject and erases the background — no server, no delay.',
  },
  {
    icon: Download,
    step: '03',
    title: 'Download or Restyle',
    desc: 'Keep the background transparent or pick a custom color — then download your clean PNG in one click.',
  },
]

// ─── Key Features ────────────────────────────────────────────────────────────

const features = [
  {
    icon: ShieldCheck,
    title: 'On-Device AI Processing',
    desc: 'No server uploads — AI runs directly in your browser, keeping your images 100% private.',
  },
  {
    icon: MousePointerClick,
    title: 'One-Click Background Removal',
    desc: 'Upload your image and AI instantly isolates the subject — no manual selection or editing needed.',
  },
  {
    icon: ImageOff,
    title: 'Transparent PNG Output',
    desc: 'Download your image as a clean transparent PNG — ready for any design, presentation, or platform.',
  },
  {
    icon: Palette,
    title: 'Custom Background Color',
    desc: 'Not happy with transparent? Pick any solid background color and apply it instantly before downloading.',
  },
  {
    icon: Stamp,
    title: 'No Watermark — Ever',
    desc: 'Your output is completely clean — no branding, no logo, no hidden marks. What you see is what you get.',
  },
  {
    icon: FileType2,
    title: 'Supports PNG, JPG & WebP',
    desc: 'Works with all major image formats — no conversion needed before you start.',
  },
]

// ─── Why It Matters — Bullet Points ─────────────────────────────────────────

const benefits = [
  { icon: ShoppingBag, text: 'Boost product image quality for e-commerce stores' },
  { icon: User, text: 'Create professional headshots and profile pictures' },
  { icon: Share2, text: 'Design social media graphics without hiring an editor' },
  { icon: Presentation, text: 'Remove distracting backgrounds from presentation visuals' },
  { icon: Layers, text: 'Prepare images for logos, thumbnails, and marketing assets' },
  { icon: Clock, text: 'Save time — no Photoshop skills required' },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  removebg: boolean | string
  canva: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, removebg: 'Limited', canva: 'Limited' },
  { feature: 'No signup required', airanko: true, removebg: false, canva: false },
  { feature: 'No watermark', airanko: true, removebg: 'Paid only', canva: 'Paid only' },
  { feature: 'Transparent PNG output', airanko: true, removebg: true, canva: true },
  { feature: 'Custom background color', airanko: true, removebg: true, canva: true },
  { feature: 'Privacy — no server upload', airanko: true, removebg: false, canva: false },
  { feature: 'On-device AI processing', airanko: true, removebg: false, canva: false },
  { feature: 'Supports PNG, JPG, WebP', airanko: true, removebg: 'Partial', canva: 'Partial' },
  { feature: 'Bulk processing', airanko: 'Coming Soon', removebg: 'Paid only', canva: 'Paid only' },
  { feature: 'No file size restrictions', airanko: true, removebg: 'Paid only', canva: 'Paid only' },
  { feature: 'Works on all devices', airanko: true, removebg: true, canva: true },
  { feature: 'No software installation', airanko: true, removebg: true, canva: true },
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
  if (value === 'Coming Soon') {
    return (
      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{value}</span>
    )
  }
  return (
    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{value}</span>
  )
}

export default function BackgroundRemoverSeoSections() {
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
              Three simple steps — no account, no software, no waiting.
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
              Everything you need to remove, replace, and perfect image backgrounds — in one free tool.
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

      {/* ── Why Background Removal Matters ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                Why Background Removal Matters
              </h2>
              <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  Product images with clean, transparent, or white backgrounds consistently outperform cluttered ones — on Amazon, Shopify, or any e-commerce platform. A distraction-free background keeps the focus on your product, increasing click-through rates and buyer confidence.
                </p>
                <p>
                  For marketers and designers, background removal saves hours of manual editing in Photoshop or Illustrator. With AI Ranko, the same result takes seconds — directly in your browser, for free.
                </p>
                <p>
                  Search engines index image alt text, but page speed and image quality also influence rankings. Clean, optimized images with transparent backgrounds load faster and integrate better into any web layout — giving you an SEO edge.
                </p>
              </div>
            </div>
            <ul className="flex flex-col gap-3 lg:pt-2">
              {benefits.map((b) => {
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
              See why AI Ranko&apos;s Background Remover is the smarter, safer, and completely free choice.
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
                    Remove.bg
                  </th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-muted-foreground w-1/5">
                    Canva
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
                      <ComparisonCell value={row.removebg} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <ComparisonCell value={row.canva} />
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
            The Smartest Way to Remove Image Backgrounds — Free, Private &amp; Instant
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              AI Ranko&apos;s <strong className="text-foreground">free AI background remover</strong> processes your images entirely in your browser — no upload to any server, no account required, and no watermark on your output. Whether you need a <strong className="text-foreground">transparent PNG</strong> for a product listing or a clean cut-out for a social media graphic, you get professional results in seconds.
            </p>
            <p>
              Unlike Remove.bg or Canva — which require sign-up and limit free usage — AI Ranko gives you unlimited access with zero restrictions. Our on-device AI detects the subject with edge-level precision and removes the background cleanly, even for complex images with fine details like hair or fur.
            </p>
            <p>
              Need a specific background color instead of transparency? Use the built-in color picker to apply any solid color instantly before downloading. It&apos;s the all-in-one <strong className="text-foreground">background eraser tool</strong> built for speed, privacy, and real results.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
