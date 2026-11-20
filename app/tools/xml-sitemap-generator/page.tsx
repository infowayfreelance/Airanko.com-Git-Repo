import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap, FileCode2 } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import XmlSitemapGeneratorTool from '@/components/xml-sitemap-generator/xml-sitemap-generator-tool'
import XmlSitemapGeneratorSeoSections, { xmlSitemapFaqs } from '@/components/xml-sitemap-generator-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: "Free XML Sitemap Generator & Crawler | Ai Ranko",
  description:
    "Free XML sitemap generator. We read your existing sitemap or crawl up to 500 pages, then you download a Search Console-ready sitemap.xml. No signup needed.",
  keywords: [
    'xml sitemap generator', 'sitemap generator free', 'sitemap.xml generator', 'online sitemap generator',
    'google sitemap generator', 'website sitemap creator', 'xml sitemap creator', 'sitemap builder',
    'sitemap generator tool', 'free sitemap generator',
  ],
  alternates: { canonical: 'https://airanko.com/tools/xml-sitemap-generator' },
  openGraph: {
    title: "Free XML Sitemap Generator & Crawler | Ai Ranko",
    description: "Free XML sitemap generator. We read your existing sitemap or crawl up to 500 pages, then you download a Search Console-ready sitemap.xml. No signup needed.",
    url: 'https://airanko.com/tools/xml-sitemap-generator',
    siteName: 'Ai Ranko',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200,
        height: 630,
        alt: 'Free XML Sitemap Generator | Ai Ranko',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free XML Sitemap Generator & Crawler | Ai Ranko",
    description: "Free XML sitemap generator. We read your existing sitemap or crawl up to 500 pages, then you download a Search Console-ready sitemap.xml. No signup needed.",
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: xmlSitemapFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

export default function XmlSitemapGeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />      <Navbar />
      <ToolSchema name="Ai Ranko XML Sitemap Generator" slug="xml-sitemap-generator" category="DeveloperApplication" description="Read an existing sitemap.xml or sitemap index, or crawl HTML links at depth 1–4. Up to 500 URLs per import or crawl, with download and copy options." />
      <BreadcrumbSchema items={[{ name: 'Tools', href: '/#tools' }, { name: 'XML Sitemap Generator', href: '/tools/xml-sitemap-generator' }]} />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">XML Sitemap Generator</span>
        </div>
      </div>

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <FileCode2 className="h-3 w-3" />
              Free XML Sitemap Generator
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Free XML Sitemap Generator
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-pretty text-muted-foreground">
              Generate a Google-ready <strong>sitemap.xml</strong> from any website. Reads your existing sitemap or crawls up to 500 pages — set changefreq, priority, lastmod &amp; image tags, then download instantly.
            </p>
          </div>

          <XmlSitemapGeneratorTool />
        </div>
      </main>

      <XmlSitemapGeneratorSeoSections />

      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-7 w-auto" />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Free AI SEO &amp; image tools — no signup required.
          </p>
          <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
