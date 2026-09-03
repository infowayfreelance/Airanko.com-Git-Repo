import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import AiImageUpscalerTool from '@/components/ai-image-upscaler/ai-image-upscaler-tool'
import AiImageUpscalerSeoSections from '@/components/ai-image-upscaler-seo-sections'

export const metadata: Metadata = {
  title: 'Free AI Image Upscaler Online — Enhance Resolution 2x/4x, No Signup',
  description:
    'Upscale any image 2x or 4x with AI. Runs 100% in your browser — no uploads, no signup, no watermark. Supports PNG, JPG, and WebP. Free forever.',
  keywords:
    'ai image upscaler, image upscaler online, enhance image resolution, upscale image 4x, upscale image 2x, free image upscaler, ai photo enhancer, increase image resolution',
  alternates: {
    canonical: 'https://airanko.com/tools/ai-image-upscaler',
  },
  openGraph: {
    title: 'Free AI Image Upscaler Online — Enhance Resolution 2x/4x, No Signup',
    description:
      'Upscale any image 2x or 4x with AI. Runs 100% in your browser — no uploads, no signup, no watermark. Supports PNG, JPG, and WebP. Free forever.',
    url: 'https://airanko.com/tools/ai-image-upscaler',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free AI Image Upscaler — AI Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Image Upscaler Online — Enhance Resolution 2x/4x, No Signup',
    description:
      'Upscale any image 2x or 4x with AI. Runs 100% in your browser — no uploads, no signup, no watermark. Supports PNG, JPG, and WebP. Free forever.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free AI Image Upscaler',
  description:
    'Upscale images 2x or 4x with on-device AI. No server uploads, no signup, no watermark. Supports PNG, JPG, and WebP. Free forever.',
  url: 'https://airanko.com/tools/ai-image-upscaler',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in modern browsers.',
  featureList: [
    'AI image upscaling in one click',
    '2x and 4x resolution enhancement',
    'On-device processing — no server upload',
    'Before/after comparison slider',
    'Keeps or lets you change the output format',
    'No watermark on output',
    'Supports PNG, JPG, and WebP',
    '100% free with no signup required',
  ],
  creator: {
    '@type': 'Organization',
    name: 'AI Ranko',
    url: 'https://airanko.com',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is my image uploaded to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All AI processing runs directly in your browser using on-device AI. Your images never leave your device, so your files stay 100% private.',
      },
    },
    {
      '@type': 'Question',
      name: 'What\'s the difference between 2x and 4x upscaling?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '2x doubles your image\'s width and height and processes faster. 4x quadruples both dimensions for maximum added detail, but takes longer to process since there\'s more pixel data to reconstruct.',
      },
    },
    {
      '@type': 'Question',
      name: 'What\'s the max resolution I can upscale to?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To keep processing fast in your browser, images larger than 1024px on their longest side are resized down before the AI model runs, then the 2x or 4x scale is applied on top of that. In practice this comfortably produces outputs well beyond typical web and social media resolutions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What image formats are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The tool supports PNG, JPG, and WebP formats for upload. Your download defaults to the same format you uploaded, or you can switch to any of the three before exporting.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this AI image upscaler really free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. AI Ranko\'s image upscaler is completely free with no signup, no watermark, and no hidden limits.',
      },
    },
  ],
}

export default function AiImageUpscalerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <ToolSchema name="AI Image Upscaler" slug="ai-image-upscaler" description="Upscale images 2x or 4x with on-device AI. Private, free, and zero upload." />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'AI Image Upscaler', href: '/tools/ai-image-upscaler' }]} />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="hover:text-foreground transition-colors">
            Tools
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">AI Image Upscaler</span>
        </div>
      </div>

      <main>
        <AiImageUpscalerTool />
      </main>

      <AiImageUpscalerSeoSections />

      {/* FAQ */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Everything you need to know about AI Ranko&apos;s AI Image Upscaler.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {faqJsonLd.mainEntity.map((faq) => (
              <details key={faq.name} className="group rounded-2xl border border-border bg-card shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-heading font-semibold text-foreground transition-colors hover:text-primary">
                  {faq.name}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.acceptedAnswer.text}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
            <img
              src="/images/ai-ranko-logo.webp"
              alt="Ai Ranko"
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Ai Ranko. Your images never leave your device.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
