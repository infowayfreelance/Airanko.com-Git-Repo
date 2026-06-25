import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Zap } from 'lucide-react'
import Navbar from '@/components/navbar'
import HtmlSitemapGeneratorTool from '@/components/html-sitemap-generator/html-sitemap-generator-tool'
import HtmlSitemapGeneratorSeoSections from '@/components/html-sitemap-generator-seo-sections'

export const metadata: Metadata = {
  title: 'Free HTML Sitemap Generator — Live Preview + 5 Export Formats | Ai Ranko',
  description:
    'Generate a beautiful HTML sitemap from any URL. Real crawl, 4 themes, 5 layouts, live preview, and export as HTML / Markdown / JSON / plain text. No signup.',
  keywords:
    'html sitemap generator, free sitemap generator, html sitemap creator, website sitemap maker, sitemap.xml generator, visual sitemap, sitemap template, sitemap design tool',
  alternates: { canonical: 'https://airanko.com/tools/html-sitemap-generator' },
  openGraph: {
    title: 'Free HTML Sitemap Generator — Live Preview + 5 Export Formats | Ai Ranko',
    description: 'Generate a beautiful HTML sitemap from any URL. Real crawl, 4 themes, 5 layouts, live preview, and 5 export formats.',
    url: 'https://airanko.com/tools/html-sitemap-generator',
    siteName: 'Ai Ranko',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp',
        width: 1200, height: 630, alt: 'HTML Sitemap Generator | Ai Ranko',
      },
    ],
    locale: 'en_US', type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free HTML Sitemap Generator — Live Preview + 5 Export Formats',
    description: 'Generate a beautiful HTML sitemap from any URL with live preview and 5 export formats.',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Image%20Resizer%20and%20converter%20tool%20open%20graph-airanko-fRSh9KtchB104ghNi32hTIxcT2OE87.webp'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  name: 'Free HTML Sitemap Generator',
  description: 'Generate a beautiful, customizable HTML sitemap from any URL. Real crawl, themes, layouts, live preview, and 5 export formats.',
  url: 'https://airanko.com/tools/html-sitemap-generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript.',
  featureList: [
    'Real crawl up to 100 pages',
    'Auto-detect sitemap.xml or fall back to internal-link crawl',
    'Automatic page categorization by URL path',
    'Page title + meta description extraction',
    '5 layouts: Tree, Cards, List, Columns, Compact',
    '4 themes: Modern, Minimal, Classic, Dark',
    'Custom accent color picker with hex input',
    'Toggle URLs, descriptions, dates, search box, stats',
    'Live iframe preview with theme/layout switching',
    'Export as standalone HTML, HTML snippet, Markdown, JSON, plain text',
    'One-click copy + download',
    'No sign-up, 100% free',
  ],
  creator: { '@type': 'Organization', name: 'Ai Ranko', url: 'https://airanko.com' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

const faqJsonLd = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is an HTML sitemap?', acceptedAnswer: { '@type': 'Answer', text: 'An HTML sitemap is a human-readable web page that lists all the pages on a website, organized by category. Unlike XML sitemaps (which are for search engines), HTML sitemaps help visitors find content and improve internal-linking for SEO.' } },
    { '@type': 'Question', name: 'How does the generator discover pages?', acceptedAnswer: { '@type': 'Answer', text: 'The tool first tries to read your sitemap.xml (found via robots.txt or the standard /sitemap.xml path). If no XML sitemap is available, it falls back to crawling internal links starting from the homepage, up to the depth and page count you specify.' } },
    { '@type': 'Question', name: 'How many pages can it process?', acceptedAnswer: { '@type': 'Answer', text: 'Up to 100 pages per generation. Crawl depth is configurable from 1 to 5 levels, so you can balance comprehensiveness with speed.' } },
    { '@type': 'Question', name: 'What export formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'Five formats: (1) Standalone HTML — a complete styled webpage you can upload as-is, (2) HTML snippet — markup only to paste into an existing page, (3) Markdown — for documentation and READMEs, (4) JSON — structured data for scripts/APIs, (5) Plain text — simple URL list, one per line.' } },
    { '@type': 'Question', name: 'Can I customize the design?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — pick from 4 built-in themes (Modern, Minimal, Classic, Dark), 5 layouts (Tree, Cards, List, Columns, Compact), and any accent color via the picker or hex input. Live preview updates instantly.' } },
    { '@type': 'Question', name: 'Does it work with single-page apps (SPAs)?', acceptedAnswer: { '@type': 'Answer', text: 'For SPAs, an XML sitemap is recommended since the link crawler depends on server-rendered HTML. If your SPA has a sitemap.xml file, the tool will use it. Pure client-rendered SPAs without sitemaps may yield limited results.' } },
    { '@type': 'Question', name: 'Is the tool free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — completely free, no signup, no watermark, no rate limits.' } },
    { '@type': 'Question', name: 'How do I add the generated sitemap to my website?', acceptedAnswer: { '@type': 'Answer', text: 'For the standalone HTML format, upload the downloaded file as /sitemap.html on your server and link to it from your footer. For the HTML snippet, paste the markup into an existing page (e.g. inside a /sitemap or /pages route). Both options improve internal-linking and help visitors find your content.' } },
  ],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ai Ranko', item: 'https://airanko.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools',    item: 'https://airanko.com/#tools' },
    { '@type': 'ListItem', position: 3, name: 'HTML Sitemap Generator', item: 'https://airanko.com/tools/html-sitemap-generator' },
  ],
}

export default function HtmlSitemapGeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navbar />

      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Ai Ranko
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#tools" className="transition-colors hover:text-foreground">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">HTML Sitemap Generator</span>
        </div>
      </div>

      <main>
        <HtmlSitemapGeneratorTool />
      </main>

      <HtmlSitemapGeneratorSeoSections />

      <footer className="mt-12 border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" aria-label="Ai Ranko home">
            <img src="/images/ai-ranko-logo.webp" alt="Ai Ranko" className="h-7 w-auto" />
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ai Ranko. Free AI SEO &amp; image tools — no signup required.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/blog" className="transition-colors hover:text-foreground">Blog</Link>
            <Link href="/sitemap" className="transition-colors hover:text-foreground">Sitemap</Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
