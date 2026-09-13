import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ImageResizerTool from '@/components/image-resizer/image-resizer-tool'
import ImageResizerSeoSections from '@/components/image-resizer-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: 'Free Image Resizer, Converter & Compressor Online | AI Ranko',
  description:
    'Resize, crop, convert and compress images instantly. Optimize for web, SEO, and social media. Supports PNG, JPEG, WebP. 100% secure browser-based tool.',
  keywords: 'image resizer, image converter, resize image online, convert to webp, crop image free',
  alternates: { canonical: 'https://airanko.com/tools/image-resizer' },
  openGraph: {
    title: 'Free Image Resizer, Converter & Compressor Online | AI Ranko',
    description:
      'Resize, crop, convert and compress images instantly. Optimize for web, SEO, and social media. Supports PNG, JPEG, WebP. 100% secure browser-based tool.',
    url: 'https://airanko.com/tools/image-resizer',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free Image Resizer, Converter & Compressor — AI Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Resizer, Converter & Compressor Online | AI Ranko',
    description:
      'Resize, crop, convert and compress images instantly. Optimize for web, SEO, and social media. Supports PNG, JPEG, WebP. 100% secure browser-based tool.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Online Image Resizer, Converter & Compressor',
  description:
    'Resize, crop, convert and compress images online. Supports PNG, JPEG, WebP and GIF. Fast, secure and browser-based tool with no uploads required.',
  url: 'https://airanko.com/tools/image-resizer',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'All',
  image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20Schema%20image-airanko-rf16nYR2GsUsGxjoa14e9AcOoh9RAJ.webp',
  browserRequirements: 'Requires JavaScript. Works in modern browsers.',
  featureList: [
    'Resize images online',
    'Crop images with aspect ratio',
    'Convert to PNG, JPEG, WebP, GIF',
    'Compress images without losing quality',
    'Resize images for social media presets',
  ],
  creator: {
    '@type': 'Organization',
    name: 'AI Ranko',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

export default function ImageResizerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <ToolSchema name="Image Resizer & Converter" slug="image-resizer" description="Resize, crop, convert and compress images to PNG, JPEG, WebP — runs entirely in your browser." />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'Image Resizer', href: '/tools/image-resizer' }]} />

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
          <span className="text-foreground font-medium">Image Resizer</span>
        </div>
      </div>

      <main>
        <ImageResizerTool />
      </main>

      <ImageResizerSeoSections />

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
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <CookieSettingsLink className="hover:text-foreground transition-colors" />
          </nav>
        </div>
      </footer>
    </div>
  )
}
