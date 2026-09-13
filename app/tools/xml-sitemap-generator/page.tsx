import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap, FileCode2 } from 'lucide-react'
import Navbar from '@/components/navbar'
import ToolSchema from '@/components/ToolSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import XmlSitemapGeneratorTool from '@/components/xml-sitemap-generator/xml-sitemap-generator-tool'
import XmlSitemapGeneratorSeoSections from '@/components/xml-sitemap-generator-seo-sections'
import { CookieSettingsLink } from '@/components/cookie-consent/cookie-settings-link'

export const metadata: Metadata = {
  title: 'Free XML Sitemap Generator — Crawl Any Site & Export sitemap.xml | Ai Ranko',
  description:
    'Generate a valid XML sitemap from any website URL. Reads your existing sitemap.xml or crawls your site up to 500 pages. Set changefreq, priority, lastmod, image tags, exclude patterns — download instantly.',
  keywords: [
    'xml sitemap generator', 'sitemap generator free', 'sitemap.xml generator', 'online sitemap generator',
    'google sitemap generator', 'website sitemap creator', 'xml sitemap creator', 'sitemap builder',
    'sitemap generator tool', 'free sitemap generator',
  ],
  alternates: { canonical: 'https://airanko.com/tools/xml-sitemap-generator' },
  openGraph: {
    title: 'Free XML Sitemap Generator — Crawl Any Site & Export sitemap.xml | Ai Ranko',
    description: 'Generate a valid XML sitemap from any website URL. Set changefreq, priority, lastmod, image tags — download sitemap.xml instantly.',
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
    title: 'Free XML Sitemap Generator | Ai Ranko',
    description: 'Crawl any site and export a Google-ready sitemap.xml in seconds. Free, no login.',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
    ],
  },
}

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'XML Sitemap Generator',
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://airanko.com/tools/xml-sitemap-generator',
  description:
    'Generate a valid XML sitemap from any website. Reads existing sitemap.xml, crawls up to 500 pages, sets changefreq/priority/lastmod, includes image:image extensions, excludes URL patterns, and exports a downloadable sitemap.xml file.',
  featureList: [
    'Reads existing sitemap.xml automatically',
    'Sitemap index file support',
    'Crawls up to 500 pages',
    '1–4 level crawl depth control',
    'changefreq setting (always to never)',
    'Priority setting (0.1 to 1.0)',
    'lastmod date inclusion',
    'image:image extension support',
    'URL exclude pattern filtering',
    'Download as .xml file',
    'Copy to clipboard',
    'Crawled pages table with status codes',
    'Valid sitemaps.org schema',
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is an XML sitemap?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An XML sitemap is a file that lists all the URLs on your website so search engines like Google can discover and crawl them more efficiently.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the XML Sitemap Generator work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It first checks for an existing sitemap.xml at your domain root. If found, it uses those URLs directly. If not, it crawls your site by following internal links up to your chosen depth and page limit.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this XML sitemap generator free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, completely free. No account, no credit card, no watermark. Generate and download as many sitemaps as you need.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many URLs can the sitemap include?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This tool supports up to 500 URLs per sitemap. Google\'s sitemap specification allows up to 50,000 URLs per file. For larger sites, use a sitemap index with multiple child sitemaps.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where do I submit the generated sitemap?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Upload sitemap.xml to your website root, add it to robots.txt as "Sitemap: https://yourdomain.com/sitemap.xml", and submit the URL in Google Search Console under Sitemaps.',
      },
    },
  ],
}

export default function XmlSitemapGeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />      <Navbar />
      <ToolSchema name="XML Sitemap Generator" slug="xml-sitemap-generator" description="Generate a Google-ready sitemap.xml from any website. Up to 500 URLs, changefreq, priority, lastmod, and image extensions." />
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
              XML Sitemap Generator
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
