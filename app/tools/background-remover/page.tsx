import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import BackgroundRemoverTool from '@/components/background-remover/background-remover-tool'
import BackgroundRemoverSeoSections from '@/components/background-remover-seo-sections'

export const metadata: Metadata = {
  title: 'Free AI Background Remover Online. No Signup, No Watermark',
  description:
    'Remove image backgrounds instantly with AI. Runs 100% in your browser — no uploads, no signup, no watermark. Supports PNG, JPG, and WebP. Free forever.',
  keywords:
    'background remover, ai background remover, remove background online, transparent png, free background eraser, remove image background, background removal tool',
  alternates: {
    canonical: 'https://airanko.com/tools/background-remover',
  },
  openGraph: {
    title: 'Free AI Background Remover Online. No Signup, No Watermark',
    description:
      'Remove image backgrounds instantly with AI. Runs 100% in your browser — no uploads, no signup, no watermark. Supports PNG, JPG, and WebP. Free forever.',
    url: 'https://airanko.com/tools/background-remover',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free AI Background Remover — AI Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Background Remover Online. No Signup, No Watermark',
    description:
      'Remove image backgrounds instantly with AI. Runs 100% in your browser — no uploads, no signup, no watermark. Supports PNG, JPG, and WebP. Free forever.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free AI Background Remover',
  description:
    'Remove image backgrounds instantly with on-device AI. No server uploads, no signup, no watermark. Supports PNG, JPG, and WebP. Free forever.',
  url: 'https://airanko.com/tools/background-remover',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in modern browsers.',
  featureList: [
    'AI background removal in one click',
    'On-device processing — no server upload',
    'Transparent PNG output',
    'Custom background color picker',
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
      name: 'Is this background remover really free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. AI Ranko\'s background remover is completely free with no signup, no watermark, and no hidden limits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are my images uploaded to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All AI processing runs directly in your browser. Your images never leave your device, so your files stay 100% private.',
      },
    },
    {
      '@type': 'Question',
      name: 'What image formats does this tool support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The tool supports PNG, JPG, and WebP formats. No conversion is needed before uploading.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I add a custom background color instead of keeping it transparent?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. After removing the background, you can use the built-in color picker to apply any solid background color before downloading your image.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will there be a watermark on my downloaded image?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. AI Ranko never adds watermarks. Your downloaded image is completely clean with no branding or logos.',
      },
    },
  ],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'AI Ranko', item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://airanko.com/#tools' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Background Remover',
      item: 'https://airanko.com/tools/background-remover',
    },
  ],
}

export default function BackgroundRemoverPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />

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
          <span className="text-foreground font-medium">Background Remover</span>
        </div>
      </div>

      <main>
        <BackgroundRemoverTool />
      </main>

      <BackgroundRemoverSeoSections />

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12 px-4 py-8 sm:px-6 lg:px-8">
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
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
