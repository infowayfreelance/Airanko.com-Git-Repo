import {
  Upload,
  SlidersHorizontal,
  Download,
  Maximize2,
  Crop,
  FileImage,
  Minimize2,
  LayoutGrid,
  Lock,
  CheckCircle2,
  Gauge,
  Monitor,
  X,
  Check,
} from 'lucide-react'

// ─── Section 1: How It Works ───────────────────────────────────────────────

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Image',
    desc: 'Drop your image into the tool or click to browse. Supports PNG, JPEG, WebP, GIF, and BMP.',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: 'Choose Your Options',
    desc: 'Resize by custom dimensions or percentage, crop with preset ratios, convert formats, or compress file size.',
  },
  {
    icon: Download,
    step: '03',
    title: 'Download Instantly',
    desc: 'Your optimized image is ready in seconds. Download it with one click — no account needed.',
  },
]

// ─── Section 2: Key Features ───────────────────────────────────────────────

const features = [
  {
    icon: Maximize2,
    title: 'Image Resizing',
    desc: 'Resize images by custom size or percentage without losing quality',
  },
  {
    icon: Crop,
    title: 'Smart Cropping',
    desc: 'Crop images with preset aspect ratios like 1:1, 16:9, 4:3',
  },
  {
    icon: FileImage,
    title: 'Format Conversion',
    desc: 'Convert images to PNG, JPEG, WebP, and GIF instantly',
  },
  {
    icon: Minimize2,
    title: 'Image Compression',
    desc: 'Reduce image size while maintaining visual quality',
  },
  {
    icon: LayoutGrid,
    title: 'Social Media Presets',
    desc: 'Resize images for Instagram, Twitter, and other platforms',
  },
  {
    icon: Lock,
    title: '100% Browser-Based',
    desc: 'No uploads required. Your images stay private and secure',
  },
]

// ─── Section 3: Benefits ──────────────────────────────────────────────────

const benefits = [
  { icon: Gauge, text: 'Improve website loading speed' },
  { icon: CheckCircle2, text: 'Boost SEO with optimized images' },
  { icon: SlidersHorizontal, text: 'Save time with all-in-one tool' },
  { icon: Monitor, text: 'No software installation required' },
  { icon: LayoutGrid, text: 'Works on all devices and browsers' },
]

// ─── Section 4: Comparison ────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  imageResizer: boolean | string
  adobe: boolean | string
}[] = [
  {
    feature: 'Free to use',
    airanko: true,
    imageResizer: 'Limited',
    adobe: 'Limited',
  },
  {
    feature: 'No signup required',
    airanko: true,
    imageResizer: true,
    adobe: false,
  },
  {
    feature: 'Resize images',
    airanko: true,
    imageResizer: true,
    adobe: true,
  },
  {
    feature: 'Crop images',
    airanko: true,
    imageResizer: true,
    adobe: true,
  },
  {
    feature: 'Format conversion',
    airanko: true,
    imageResizer: 'Partial',
    adobe: true,
  },
  {
    feature: 'Image compression',
    airanko: true,
    imageResizer: true,
    adobe: false,
  },
  {
    feature: 'WebP support',
    airanko: true,
    imageResizer: false,
    adobe: 'Partial',
  },
  {
    feature: 'Social media presets',
    airanko: true,
    imageResizer: false,
    adobe: true,
  },
  {
    feature: 'Batch processing',
    airanko: 'Coming soon',
    imageResizer: 'Paid only',
    adobe: 'Paid only',
  },
  {
    feature: 'Privacy — no server upload',
    airanko: true,
    imageResizer: false,
    adobe: false,
  },
  {
    feature: 'No watermark',
    airanko: true,
    imageResizer: true,
    adobe: 'Paid only',
  },
  {
    feature: 'Works on all devices',
    airanko: true,
    imageResizer: true,
    adobe: true,
  },
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

export default function ImageResizerSeoSections() {
  return (
    <div className="border-t border-border bg-background">

      {/* ── Section 1: How It Works ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Three simple steps to resize, crop, convert or compress any image.
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

      {/* ── Section 2: Key Features ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Key Features
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Everything you need to prepare images for the web, social media, and beyond.
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

      {/* ── Section 3: Benefits ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                Why Optimized Images Matter
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed text-pretty">
                Properly sized and compressed images are one of the fastest wins for website performance and search rankings. This tool makes it effortless.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
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

      {/* ── Section 4: Comparison ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              How We Compare
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              See why AI Ranko&apos;s image resizer outperforms the rest.
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
                    ImageResizer.io
                  </th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-muted-foreground w-1/5">
                    Adobe Express
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
                      <ComparisonCell value={row.imageResizer} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <ComparisonCell value={row.adobe} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Section 5: SEO Content Block ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
            The Easiest Way to Resize, Crop &amp; Convert Images Online
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Whether you need a quick <strong className="text-foreground">image resizer online</strong> to prepare graphics for your blog, or want to <strong className="text-foreground">crop image online</strong> to fit a specific layout, AI Ranko&apos;s free tool handles it all in one place. No downloads, no subscriptions — just fast results directly in your browser.
            </p>
            <p>
              Modern websites rely on next-gen formats for performance. With AI Ranko, you can <strong className="text-foreground">convert image to WebP</strong> in seconds, cutting file sizes dramatically without any visible quality loss. Smaller files mean faster pages, and faster pages mean better search rankings.
            </p>
            <p>
              Need to <strong className="text-foreground">compress image online</strong> before uploading to your CMS or e-commerce store? Our compression engine intelligently reduces file weight while keeping your images sharp. Pair that with our built-in social presets and you can <strong className="text-foreground">resize image for social media</strong> — Instagram, Twitter, LinkedIn, and more — without guessing pixel dimensions.
            </p>
            <p>
              Unlike traditional desktop software, everything here runs client-side. Your files never touch a server, so your images stay completely private. It&apos;s the all-in-one image optimization tool built for speed, privacy, and SEO impact.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
