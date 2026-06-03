import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import BulkImageResizerTool from '@/components/bulk-image-resizer/bulk-image-resizer-tool'
import BulkImageResizerSeoSections from '@/components/bulk-image-resizer-seo-sections'

export const metadata: Metadata = {
  title: 'Free Bulk Image Resizer, Compressor & Converter Tool | AI Ranko',
  description:
    'Use AI Ranko\'s free bulk image resizer & converter to optimize multiple images at once. No signup, no watermark, and secure browser processing.',
  keywords:
    'bulk image resizer, bulk image converter, batch image resize, resize multiple images, compress images in bulk, convert images online, bulk webp converter',
  alternates: {
    canonical: 'https://airanko.com/tools/bulk-image-resizer',
  },
  openGraph: {
    title: 'Free Bulk Image Resizer, Compressor & Converter Tool | AI Ranko',
    description:
      'Resize, compress, and convert multiple images at once with AI Ranko\'s free bulk image tool. JPG, PNG, WebP, GIF, and BMP support. No signup, no watermark.',
    url: 'https://airanko.com/tools/bulk-image-resizer',
    siteName: 'AI Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free Bulk Image Resizer, Compressor & Converter — AI Ranko',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Bulk Image Resizer, Compressor & Converter Tool | AI Ranko',
    description:
      'Resize, compress, and convert multiple images at once with AI Ranko\'s free bulk image tool. JPG, PNG, WebP, GIF, BMP. No signup, no watermark.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Bulk Image Resizer, Compressor & Converter',
  description:
    'Resize, compress, and convert multiple images at once with AI Ranko\'s free online bulk image tool. Supports JPG, PNG, WebP, GIF, and BMP. Fast browser-based processing with no signup, no watermark, and no quality loss.',
  url: 'https://airanko.com/tools/bulk-image-resizer',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Works in modern browsers.',
  featureList: [
    'Bulk image resizing',
    'Batch image conversion to JPG, PNG, WebP, GIF, BMP',
    'Bulk image compression',
    'WebP support for SEO and web optimization',
    'Maintain image quality during batch processing',
    'Fast browser-based processing',
    'Privacy protection — no server upload',
    'Download all optimized images together',
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
      name: 'What is a bulk image resizer & converter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A bulk image resizer & converter helps you resize, compress, and convert multiple images at the same time. It saves time by processing all selected images together instead of editing them one by one. AI Ranko supports JPG, PNG, WebP, GIF, and BMP formats.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the bulk image resizer free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. AI Ranko\'s bulk image resizer & converter is completely free with no signup, no watermark, and no hidden limits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are my images uploaded to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All processing happens directly in your browser, so your images stay private and are never uploaded to a server.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which image formats are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can resize and convert images between JPG, PNG, WebP, GIF, and BMP formats.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I convert images to WebP in bulk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. AI Ranko supports bulk WebP conversion, which is ideal for modern SEO and faster website performance.',
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
    { '@type': 'ListItem', position: 3, name: 'Bulk Image Resizer', item: 'https://airanko.com/tools/bulk-image-resizer' },
  ],
}

export default function BulkImageResizerPage() {
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
          <span className="text-foreground font-medium">Bulk Image Resizer</span>
        </div>
      </div>

      <main>
        <BulkImageResizerTool />
      </main>

      <BulkImageResizerSeoSections />

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
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
