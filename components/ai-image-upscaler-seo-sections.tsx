import {
  Upload,
  Cpu,
  Download,
  ZoomIn,
  MousePointerClick,
  FileType2,
  SplitSquareHorizontal,
  Stamp,
  ShieldCheck,
  ShoppingBag,
  Printer,
  Share2,
  Aperture,
  ImagePlus,
  Clock,
  Check,
  X,
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
    title: 'AI Enhances the Resolution',
    desc: 'On-device AI reconstructs sharper detail and enlarges your image 2x or 4x — no server, no delay.',
  },
  {
    icon: Download,
    step: '03',
    title: 'Compare and Download',
    desc: 'Drag the before/after slider to inspect the result, then download your upscaled image in one click.',
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
    icon: ZoomIn,
    title: '2x and 4x Upscaling',
    desc: 'Pick 2x for a fast, balanced enhancement or 4x for maximum added detail on smaller images.',
  },
  {
    icon: SplitSquareHorizontal,
    title: 'Before/After Comparison Slider',
    desc: 'Drag the divider to see exactly how much sharper and more detailed your upscaled image is.',
  },
  {
    icon: MousePointerClick,
    title: 'One-Click Enhancement',
    desc: 'Upload your image and AI instantly reconstructs detail — no manual sliders or presets needed.',
  },
  {
    icon: FileType2,
    title: 'Keeps Your Original Format',
    desc: 'Downloads in the same format you uploaded — PNG, JPG, or WebP — or switch formats before exporting.',
  },
  {
    icon: Stamp,
    title: 'No Watermark — Ever',
    desc: 'Your output is completely clean — no branding, no logo, no hidden marks. What you see is what you get.',
  },
]

// ─── Why It Matters — Bullet Points ─────────────────────────────────────────

const benefits = [
  { icon: ShoppingBag, text: 'Sharpen low-resolution product photos for e-commerce listings' },
  { icon: Printer, text: 'Prepare small images for high-quality printing' },
  { icon: Share2, text: 'Enhance old or compressed photos before sharing on social media' },
  { icon: Aperture, text: 'Recover detail lost to heavy JPEG compression' },
  { icon: ImagePlus, text: 'Upscale thumbnails and icons for larger displays' },
  { icon: Clock, text: 'Save time — no Photoshop or paid upscaling app required' },
]

// ─── Comparison ──────────────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  letsenhance: boolean | string
  photoshop: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, letsenhance: 'Limited', photoshop: false },
  { feature: 'No signup required', airanko: true, letsenhance: false, photoshop: false },
  { feature: 'No watermark', airanko: true, letsenhance: 'Paid only', photoshop: true },
  { feature: '2x and 4x upscale options', airanko: true, letsenhance: true, photoshop: true },
  { feature: 'Before/after comparison slider', airanko: true, letsenhance: true, photoshop: false },
  { feature: 'Privacy — no server upload', airanko: true, letsenhance: false, photoshop: true },
  { feature: 'On-device AI processing', airanko: true, letsenhance: false, photoshop: false },
  { feature: 'Supports PNG, JPG, WebP', airanko: true, letsenhance: 'Partial', photoshop: true },
  { feature: 'No file size restrictions', airanko: true, letsenhance: 'Paid only', photoshop: true },
  { feature: 'No software installation', airanko: true, letsenhance: true, photoshop: false },
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

export default function AiImageUpscalerSeoSections() {
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
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Key Features
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Everything you need to sharpen and enlarge your images — in one free tool.
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

      {/* ── Why Upscaling Matters ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                Why AI Upscaling Matters
              </h2>
              <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  Traditional resizing just stretches pixels, leaving images blurry and blocky. AI super-resolution instead reconstructs plausible fine detail — sharper edges, clearer text, and more realistic texture — so enlarged images actually look better, not just bigger.
                </p>
                <p>
                  For online sellers, marketers, and photographers, this means old or low-resolution assets can be reused instead of reshot. A blurry product photo or a small archival image can be upscaled to fit modern display and print resolutions in seconds.
                </p>
                <p>
                  Because everything runs in your browser, there&apos;s no waiting on an upload, no account, and no limit on how many images you enhance — the same result other tools charge a subscription for, free.
                </p>
              </div>
            </div>
            <ul className="flex flex-col gap-3 lg:pt-2">
              {benefits.map((b) => {
                const Icon = b.icon
                return (
                  <li key={b.text} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
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
              See why AI Ranko&apos;s Image Upscaler is the smarter, safer, and completely free choice.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-5 py-4 text-left font-heading font-semibold text-foreground w-2/5">Feature</th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-primary w-1/5">AI Ranko</th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-muted-foreground w-1/5">Let&apos;s Enhance</th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-muted-foreground w-1/5">Photoshop</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-card' : 'bg-background'}`}>
                    <td className="px-5 py-3.5 font-medium text-foreground">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center"><ComparisonCell value={row.airanko} /></td>
                    <td className="px-5 py-3.5 text-center"><ComparisonCell value={row.letsenhance} /></td>
                    <td className="px-5 py-3.5 text-center"><ComparisonCell value={row.photoshop} /></td>
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
            The Smartest Way to Upscale Images — Free, Private &amp; AI-Powered
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              AI Ranko&apos;s <strong className="text-foreground">free AI image upscaler</strong> processes your images entirely in your browser — no upload to any server, no account required, and no watermark on your output. Whether you need a <strong className="text-foreground">2x upscale</strong> for a quick enhancement or a full <strong className="text-foreground">4x upscale</strong> to recover maximum detail, you get professional results in seconds.
            </p>
            <p>
              Unlike Let&apos;s Enhance or other cloud-based upscalers, which require sign-up and limit free usage, AI Ranko gives you unlimited access with zero restrictions. Our on-device super-resolution model reconstructs sharper edges, clearer text, and finer texture — not just stretched pixels.
            </p>
            <p>
              Use the built-in before/after slider to compare the enhancement instantly, then download your image in its original format or switch to PNG, JPG, or WebP. It&apos;s the all-in-one <strong className="text-foreground">image resolution enhancer</strong> built for speed, privacy, and real results.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
