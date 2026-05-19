import {
  Upload,
  SlidersHorizontal,
  Download,
  FileImage,
  Layers,
  Minimize2,
  Globe,
  ShieldCheck,
  Sparkles,
  Zap,
  Gauge,
  Activity,
  Database,
  Smile,
  ShoppingBag,
  PenSquare,
  Share2,
  Palette,
  Monitor,
  CheckCircle2,
  X,
  Check,
  FileType2,
} from 'lucide-react'

// ─── Section: About ─────────────────────────────────────────────────────────

// ─── Section: Key Features ──────────────────────────────────────────────────

const features = [
  {
    icon: Layers,
    title: 'Bulk Image Resizing',
    desc: 'Resize multiple images at once without editing files individually.',
  },
  {
    icon: FileImage,
    title: 'Batch Image Conversion',
    desc: 'Convert images between JPG, PNG, WebP, GIF, and BMP formats instantly.',
  },
  {
    icon: Minimize2,
    title: 'Image Compression',
    desc: 'Reduce image file size for faster loading and better performance.',
  },
  {
    icon: Globe,
    title: 'WebP Support',
    desc: 'Convert images to WebP for modern SEO and web optimization.',
  },
  {
    icon: Sparkles,
    title: 'Maintain Image Quality',
    desc: 'Resize and compress images while keeping them clear and sharp.',
  },
  {
    icon: Zap,
    title: 'Fast Browser Processing',
    desc: 'Process images directly in your browser without installing software.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy Protection',
    desc: 'Your images stay secure because files are not uploaded to servers.',
  },
  {
    icon: FileType2,
    title: 'Multiple Format Support',
    desc: 'Supports popular image formats including JPG, PNG, WebP, GIF, and BMP.',
  },
]

// ─── Section: How to Use ────────────────────────────────────────────────────

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Images',
    desc: 'Select and upload multiple images from your device in supported formats.',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: 'Choose Resize Settings',
    desc: 'Set custom dimensions, resize percentage, or compression preferences easily.',
  },
  {
    icon: FileImage,
    step: '03',
    title: 'Select Output Format',
    desc: 'Convert your images to JPG, PNG, WebP, GIF, or BMP formats instantly.',
  },
  {
    icon: Download,
    step: '04',
    title: 'Download Optimized Images',
    desc: 'Download all resized and converted images together in seconds.',
  },
]

// ─── Section: Best Use Cases ────────────────────────────────────────────────

const useCases = [
  {
    icon: Monitor,
    title: 'Website Optimization',
    desc: 'Resize and compress website images for faster loading and better user experience.',
  },
  {
    icon: ShoppingBag,
    title: 'Ecommerce Product Images',
    desc: 'Optimize product photos for online stores without losing image quality.',
  },
  {
    icon: PenSquare,
    title: 'Blog Images',
    desc: 'Convert and resize blog images to improve SEO and page performance.',
  },
  {
    icon: Share2,
    title: 'Social Media Posts',
    desc: 'Create perfectly sized images for Instagram, Facebook, LinkedIn, and other platforms.',
  },
  {
    icon: Palette,
    title: 'Graphic Design Workflow',
    desc: 'Batch process multiple design assets quickly and efficiently.',
  },
]

// ─── Section: SEO & Performance Benefits ────────────────────────────────────

const seoBenefits = [
  {
    icon: Gauge,
    title: 'Faster Loading Speed',
    desc: 'Compressed and resized images help pages load more quickly on all devices.',
  },
  {
    icon: Activity,
    title: 'Better Core Web Vitals',
    desc: 'Optimized images improve important Google performance metrics and page experience.',
  },
  {
    icon: Database,
    title: 'Reduced Bandwidth Usage',
    desc: 'Smaller image files use less data and improve website efficiency.',
  },
  {
    icon: Smile,
    title: 'Improved User Experience',
    desc: 'Fast-loading images keep visitors engaged and reduce bounce rates.',
  },
]

// ─── Section: Comparison ────────────────────────────────────────────────────

const comparisonRows: {
  feature: string
  airanko: boolean | string
  bulkResize: boolean | string
  imageResizer: boolean | string
}[] = [
  { feature: 'Free to use', airanko: true, bulkResize: true, imageResizer: 'Limited' },
  { feature: 'No signup required', airanko: true, bulkResize: true, imageResizer: true },
  { feature: 'Bulk image resizing', airanko: true, bulkResize: true, imageResizer: true },
  { feature: 'Bulk image conversion', airanko: true, bulkResize: false, imageResizer: 'Partial' },
  { feature: 'Image compression', airanko: true, bulkResize: false, imageResizer: true },
  { feature: 'WebP support', airanko: true, bulkResize: 'Partial', imageResizer: false },
  { feature: 'Batch processing', airanko: true, bulkResize: true, imageResizer: 'Paid only' },
  { feature: 'Social media presets', airanko: true, bulkResize: false, imageResizer: false },
  { feature: 'Maintain image quality', airanko: true, bulkResize: 'Partial', imageResizer: true },
  { feature: 'Fast browser processing', airanko: true, bulkResize: true, imageResizer: true },
  { feature: 'Privacy — no server upload', airanko: true, bulkResize: true, imageResizer: false },
  { feature: 'Multiple image formats', airanko: true, bulkResize: 'Limited', imageResizer: 'Partial' },
  { feature: 'No watermark', airanko: true, bulkResize: true, imageResizer: 'Paid only' },
  { feature: 'Works on all devices', airanko: true, bulkResize: true, imageResizer: true },
  { feature: 'Download all images together', airanko: true, bulkResize: 'Partial', imageResizer: 'Paid only' },
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

// ─── Section: Why Choose Bullets ────────────────────────────────────────────

const whyChoose = [
  'Process multiple images online without software installation, signup, or hidden limits.',
  'Resize, compress, and convert images completely free while maintaining quality.',
  'Works directly in your browser for secure processing and faster results.',
  'Convert and optimize multiple images within seconds using powerful batch support.',
  'Designed for bloggers, businesses, ecommerce stores, designers, and website owners.',
]

export default function BulkImageResizerSeoSections() {
  return (
    <div className="border-t border-border bg-background">

      {/* ── About ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
            What Is a Bulk Image Resizer &amp; Converter?
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              A bulk image resizer &amp; converter helps you resize, compress, and convert multiple images at the same time. It saves time by processing all selected images together instead of editing them one by one.
            </p>
            <p>
              AI Ranko&apos;s tool works directly in your browser and supports JPG, PNG, WebP, GIF, and BMP formats. It is perfect for websites, ecommerce stores, blogs, and social media image optimization.
            </p>
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
              Resize, convert, and optimize multiple images with powerful batch processing tools designed for faster workflows, better image quality, and improved website performance.
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

      {/* ── Why Use This Tool ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                Why Use This Tool?
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  Save time by resizing and converting multiple images in one process instead of editing files manually.
                </p>
                <p>
                  AI Ranko&apos;s bulk image tool helps improve website speed, SEO performance, and overall workflow efficiency. It is perfect for bloggers, ecommerce stores, designers, developers, and social media creators.
                </p>
                <p>
                  Optimize images for websites, product pages, ads, and social platforms in just a few clicks.
                </p>
              </div>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                'Resize and convert images in a single workflow',
                'Boost website speed and Core Web Vitals',
                'Built for bloggers, designers, and ecommerce stores',
                'Optimize images for ads and social platforms',
                'No software, no signup, no watermark',
              ].map((text) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── How to Use ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              How to Use the Tool
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Resize, convert, and download multiple images in four simple steps.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.step}
                  className="relative flex flex-col items-start gap-4 rounded-2xl border border-border bg-background p-6 shadow-sm"
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

      {/* ── Best Use Cases ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Best Use Cases
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              From ecommerce stores to social media creators — built for every image workflow.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              See why AI Ranko&apos;s bulk image resizer &amp; converter performs better for bulk image processing.
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
                    BulkResizePhotos.com
                  </th>
                  <th className="px-5 py-4 text-center font-heading font-semibold text-muted-foreground w-1/5">
                    ImageResizer.com
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
                      <ComparisonCell value={row.bulkResize} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <ComparisonCell value={row.imageResizer} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SEO & Performance Benefits ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Benefits of Image Optimization for SEO &amp; Performance
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Optimized images help websites load faster, reduce bandwidth, and improve search rankings.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {seoBenefits.map((b) => {
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

      {/* ── Why Choose AI Ranko ── */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl text-center">
            Why Choose AI Ranko Bulk Image Resizer?
          </h2>
          <p className="mt-4 text-center text-muted-foreground text-pretty">
            AI Ranko makes bulk image resizing and conversion simple, fast, and secure for everyone.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {whyChoose.map((text) => (
              <li
                key={text}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </span>
                <span className="text-sm font-medium text-foreground leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

    </div>
  )
}
